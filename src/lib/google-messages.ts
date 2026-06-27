import { chromium, Browser, Page, BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs';

const STORAGE_PATH = path.join(process.cwd(), 'storage', 'google-messages-auth.json');
const USER_DATA_DIR = path.join(process.cwd(), 'storage', 'playwright-profile');

/**
 * Google 메시지 웹 자동화 클래스
 */
export class GoogleMessagesAutomation {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private currentHeadless: boolean | undefined = undefined;

  /**
   * 브라우저 초기화 및 세션 로드
   */
  async init(headless: boolean = true) {
    // 기존 컨텍스트가 있지만 모드가 다른 경우 (예: headless -> headful) 닫고 다시 시작
    if (this.context && this.currentHeadless !== headless) {
      await this.close();
    }

    if (this.context) {
      try {
        // 컨텍스트가 연결되어 있고 페이지가 살아있는지 확인
        if (this.page && !this.page.isClosed()) {
          return;
        }
        console.log('[GoogleMessages] 기존 브라우저 세션이 끊겼거나 페이지가 닫혔습니다. 재시작 중...');
        await this.close();
      } catch (e) {
        await this.close();
      }
    }

    // 신규 브라우저 실행 전에 기존 락 파일이 있으면 제거
    this.clearLockFiles();

    // 신규 브라우저 실행 전에 기존 락 프로세스가 있는지 확인하고 정리
    this.killExistingProcesses();

    // 저장소 디렉토리 생성
    const storageDir = path.dirname(STORAGE_PATH);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const launchOptions = { 
      headless: headless !== undefined ? headless : this.currentHeadless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage', // 공유 메모리 부족 방지 (중요)
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-extensions',
        '--disable-notifications',
        '--mute-audio',
        '--disable-features=site-per-process', // OOM 방지
        '--disable-accelerated-2d-canvas',
        '--disable-accelerated-jpeg-decoding'
      ] 
    };

    try {
      // 시스템에 설치된 실제 Chrome을 우선 사용 시도 (안정성 및 드라이버 호환성 매우 높음)
      this.context = await chromium.launchPersistentContext(USER_DATA_DIR, { 
        ...launchOptions, 
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      });
      console.log('[GoogleMessages] System Chrome 런칭 성공 (Persistent Context).');
    } catch (chromeErr: any) {
      console.log('[GoogleMessages] System Chrome 런칭 실패, 기본 Chromium으로 폴백합니다.', chromeErr.message);
      this.context = await chromium.launchPersistentContext(USER_DATA_DIR, {
        ...launchOptions,
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      });
    }

    this.currentHeadless = headless;

    // 첫 번째 빈 페이지 활용 또는 새 페이지 생성
    const pages = this.context.pages();
    this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
    this.page.setDefaultTimeout(60000);

    // 메모리 절약을 위한 리소스 차단 (OOM 크래시 방지) - Headless 모드에서만 적용
    if (headless) {
      await this.page.route('**/*', (route) => {
        const type = route.request().resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          route.abort();
        } else {
          route.continue();
        }
      });
    }

    // 페이지 충돌 리스너 추가
    this.page.on('crash', () => {
      console.error('[GoogleMessages] 페이지가 충돌했습니다 (Page crashed)');
      this.close();
    });

    // 기본 주소로 접속 (이미 로그인된 경우 대화 목록으로 바로 이동됨)
    await this.page!.goto('https://messages.google.com/web', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // UI 모드일 경우 사용자가 바로 볼 수 있도록 탭을 최상단으로 끌어올림
    if (!headless) {
      try { await this.page!.bringToFront(); } catch (e) {}
    }

    // 웰컴 페이지가 뜨는 경우 '로그인' 버튼 클릭
    try {
      const loginButton = await this.page!.waitForSelector('a:has-text("로그인"), button:has-text("로그인")', { timeout: 5000 });
      if (loginButton) {
        console.log('[GoogleMessages] 웰컴 페이지 감지, 로그인 버튼 클릭 중...');
        await loginButton.click();
      }
    } catch (e) {
      // 웰컴 페이지가 아니면 무시하고 진행
    }

    // 웰컴 페이지나 로그인 유도 페이지인 경우만 처리
    try {
      if (this.page!.url().includes('welcome')) {
        // Google 계정 페어링(이메일 연동)을 최우선으로 시도합니다.
        const googlePairButton = await this.page!.$('button:has-text("Google 계정"), a:has-text("Google 계정"), [aria-label*="Google 계정"], button:has-text("Google account"), a:has-text("Google account")');
        if (googlePairButton) {
          console.log('[GoogleMessages] Google 계정 페어링 버튼 클릭 중...');
          await googlePairButton.click();
        } else {
          const pairButton = await this.page!.$('button:has-text("기기 페어링"), a:has-text("기기 페어링"), [aria-label*="기기 페어링"]');
          if (pairButton) {
            await pairButton.click();
          } else {
            const loginButton = await this.page!.$('a:has-text("로그인"), button:has-text("로그인")');
            if (loginButton) await loginButton.click();
          }
        }
        await this.page!.waitForLoadState('domcontentloaded');
      }

      // "여기에서 사용" 또는 "기기 페어링 해제" 관련 팝업 확인
      const useHereButton = await this.page!.$('button:has-text("여기에서 사용"), button:has-text("Use here")');
      if (useHereButton) {
        console.log('[GoogleMessages] "여기에서 사용" 버튼 클릭 중...');
        await useHereButton.click();
      }

      // "이 컴퓨터 기억하기" 또는 "Remember this computer" 토글/체크박스 자동 활성화
      try {
        const rememberToggle = await this.page!.$('mat-slide-toggle:has-text("기억"), mat-slide-toggle:has-text("Remember"), [aria-label*="기억"], [aria-label*="Remember"], button[role="switch"]:has-text("기억"), button[role="switch"]:has-text("Remember")');
        if (rememberToggle) {
          const isChecked = await rememberToggle.getAttribute('aria-checked');
          if (isChecked === 'false') {
            console.log('[GoogleMessages] "이 컴퓨터 기억하기" 토글 활성화 중...');
            await rememberToggle.click();
          }
        }
      } catch (e) {
        // 무시
      }
    } catch (err) {
      // 무시
    }

    // 페어링 필요한지 확인 (QR 코드가 있는지 검사)
    try {
      const isQrCodeVisible = await this.page!.waitForSelector('mw-qr-code, [data-e2e="qr-code"], button:has-text("기기 페어링"), a:has-text("기기 페어링")', { timeout: 3000 }).catch(() => null);
      if (isQrCodeVisible && headless) {
        console.log('[GoogleMessages] QR 코드/페어링 화면이 감지되었습니다. 연동 해제 상태입니다.');
        // 자동 페어링을 위해 브라우저를 띄우지 않고 그대로 둡니다.
        // sendSMS에서 이 상태를 감지하고 에러를 발생시킵니다.
      }
    } catch (e) {
      // 무시
    }
  }

  /**
   * QR 코드 스캔을 위한 헤드풀 브라우저 실행
   */
  async setupConnection() {
    try {
      console.log('[GoogleMessages] 연동 프로세스 시작...');
      await this.init(false); // UI가 보이도록 실행
      
      if (!this.page) throw new Error('브라우저 페이지를 초기화하지 못했습니다.');
      
      console.log('[GoogleMessages] 연동 상태 대기 중 (120초)...');
      
      // 로그인이 완료될 때까지 대기 (채팅 시작 버튼 또는 대화 목록이 보이면 성공)
      // 이미 페어링된 경우 즉시 성공 처리됨
      try {
        await this.page.waitForSelector('input[placeholder*="시작"], input[placeholder*="Start"], button:has-text("시작"), button:has-text("Start chat"), [aria-label*="시작"], [aria-label*="Start chat"], .conversation-list, [role="grid"]', { timeout: 120000 });
      } catch (waitErr) {
        throw new Error('연동 확인 시간이 초과되었습니다. 브라우저 창에서 QR 스캔을 완료했는지 확인해 주세요.');
      }
      
      console.log('[GoogleMessages] 연동 성공 확인! 세션 저장을 위해 잠시 대기...');
      // 프로필(IndexedDB 등)이 디스크에 완벽하게 쓰여지도록 약간 대기 후 안전 종료
      await this.page.waitForTimeout(3000);
      await this.close();
      
      console.log('[GoogleMessages] 연동 성공 및 세션(프로필) 영구 저장 완료!');
      return { success: true };
    } catch (err: any) {
      console.error('[GoogleMessages] setupConnection 오류:', err);
      // 브라우저가 열리지 않는 경우 등을 대비해 에러 메시지 세분화
      const errorMessage = err.message || '알 수 없는 오류가 발생했습니다.';
      try { await this.close(); } catch(e){} // 에러 시에도 안전 종료
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 메시지 발송
   */
  async sendSMS(phoneNumber: string, message: string) {
    // 치명적 오류 확인 헬퍼
    const isFatal = (err: any) => err?.message?.includes('closed') || err?.message?.includes('crash') || err?.message?.includes('navigation');

    try {
      if (!this.page || this.page.isClosed()) await this.init(true);
      
      console.log(`[GoogleMessages] 메시지 발송 시작: ${phoneNumber}`);

      // 0. 연동 상태 혹은 로그인 완료 상태 확인 (최대 15초 대기)
      try {
        const loggedInSelector = 'input[placeholder*="시작"], input[placeholder*="Start"], button:has-text("시작"), button:has-text("Start chat"), [aria-label*="시작"], [aria-label*="Start chat"], .conversation-list, [role="grid"]';
        const qrSelector = 'mw-qr-code, [data-e2e="qr-code"], button:has-text("기기 페어링"), a:has-text("기기 페어링")';
        
        const detected = await Promise.race([
          this.page!.waitForSelector(loggedInSelector, { state: 'visible', timeout: 15000 }).then(() => 'logged_in'),
          this.page!.waitForSelector(qrSelector, { state: 'visible', timeout: 15000 }).then(() => 'qr_code')
        ]).catch(() => 'timeout');

        console.log(`[GoogleMessages] 연동 상태 감지 결과: ${detected}`);

        if (detected === 'qr_code' || detected === 'timeout') {
          throw new Error('기기 연동이 해제되었습니다. [기기 연동하기] 버튼을 눌러 다시 연결해 주세요.');
        }
      } catch (e: any) {
        if (e.message.includes('기기 연동')) throw e;
      }

      // 1. '채팅 시작' / '대화 시작' 버튼 탐색
      try {
        const startChatButton = this.page!.locator('button:has-text("시작"), a:has-text("시작"), [aria-label*="시작"], button:has-text("Start chat"), a:has-text("Start chat"), [aria-label*="Start chat"]').first();
        await startChatButton.waitFor({ state: 'visible', timeout: 5000 });
        await startChatButton.click({ timeout: 2000 });
      } catch (e: any) {
        if (isFatal(e)) throw e;
        // 실패 시 폴백: 'c' 키는 새 메시지 단축키이거나 탭 키로 이동
        await this.page!.keyboard.press('c');
      }
      
      // 2. 전화번호 입력창 입력
      await this.page!.waitForTimeout(500);
      const searchInput = await this.page!.locator('input[placeholder*="이름"], input[placeholder*="번호"], input[aria-label*="전화번호"], input[placeholder*="name"], input[placeholder*="number"]').first();
      
      try {
        await searchInput.waitFor({ state: 'visible', timeout: 5000 });
        await searchInput.focus({ timeout: 2000 });
      } catch (e: any) {
        // 검색창을 찾을 수 없다면 연동이 풀렸을 가능성이 큼
        const url = this.page!.url();
        if (url.includes('welcome') || url.includes('about')) {
           throw new Error('기기 연동이 해제되었습니다. [기기 연동하기] 버튼을 눌러 다시 연결해 주세요.');
        }
        throw e;
      }

      await this.page!.keyboard.type(phoneNumber, { delay: 50 });
      await this.page!.waitForTimeout(500);
      
      // 검색 결과 확정 (번호 입력 후 아래 화살표 -> 엔터 -> 엔터)
      await this.page!.keyboard.press('ArrowDown');
      await this.page!.waitForTimeout(200);
      await this.page!.keyboard.press('Enter');
      await this.page!.waitForTimeout(500);
      await this.page!.keyboard.press('Enter');
      
      // 3. 메시지 입력창 대기 및 입력
      const msgInput = await this.page!.waitForSelector([
        'div[role="textbox"][contenteditable="true"]',
        '[data-e2e="message-input-textbox"]',
        'div[contenteditable="true"]',
        'textarea',
        '.textarea'
      ].join(', '), { timeout: 8000 });
      
      await msgInput.focus();
      await msgInput.click();
      
      // 전체 선택 후 지우기
      await this.page!.keyboard.down('Control');
      await this.page!.keyboard.press('a');
      await this.page!.keyboard.up('Control');
      await this.page!.keyboard.press('Backspace');
      await this.page!.waitForTimeout(200);
      
      // 실제 유저처럼 타이핑하여 React/Angular 상태가 확실히 반영되도록 함
      await this.page!.keyboard.type(message, { delay: 10 });
      
      // 4. 전송 (보내기 버튼 클릭 또는 Enter)
      await this.page!.waitForTimeout(500);
      let sent = false;
      try {
        const sendButton = this.page!.locator([
          'button[aria-label*="보내기"]',
          'button[aria-label*="전송"]',
          'button[aria-label*="Send"]',
          '[data-e2e="send-message-button"]',
          'button.send-button',
          'button:has(mat-icon:has-text("send"))',
          'button:has(mat-icon)'
        ].join(', ')).first();

        if (await sendButton.isVisible({ timeout: 2000 })) {
          await sendButton.click({ timeout: 2000 });
          sent = true;
          console.log('[GoogleMessages] 전송 버튼 클릭 완료');
        }
      } catch (clickErr) {
        console.log('[GoogleMessages] 전송 버튼을 찾지 못했거나 클릭 실패, Enter 키로 전송합니다.');
      }

      if (!sent) {
        await this.page!.keyboard.press('Enter');
      }
      
      // 5. 전송 완료 확인을 위한 최소 대기 (1.5초 -> 3.0초)
      await this.page!.waitForTimeout(3000);
      
      console.log(`[GoogleMessages] 발송 명령 완료: ${phoneNumber}`);
      return { success: true };
    } catch (err: any) {
      console.error('[GoogleMessages] 발송 오류:', err.message || err);
      
      if (isFatal(err)) {
        console.log('[GoogleMessages] 치명적 오류로 세션 초기화');
        await this.close();
      }
      return { success: false, error: err.message || err };
    }
  }

  private clearLockFiles() {
    try {
      const lockFiles = [
        path.join(USER_DATA_DIR, 'SingletonLock'),
        path.join(USER_DATA_DIR, 'lockfile'),
        path.join(USER_DATA_DIR, 'LOCK')
      ];
      for (const file of lockFiles) {
        if (fs.existsSync(file)) {
          console.log(`[GoogleMessages] 락 파일 감지 및 제거 중: ${file}`);
          fs.unlinkSync(file);
        }
      }
    } catch (err: any) {
      console.warn('[GoogleMessages] 락 파일 제거 실패:', err.message);
    }
  }

  private killExistingProcesses() {
    if (process.platform !== 'win32') return;
    try {
      const { execSync } = require('child_process');
      const output = execSync('wmic process where "name=\'chrome.exe\' or name=\'chromium.exe\'" get processid,commandline', { encoding: 'utf8' });
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('playwright-profile')) {
          const match = line.trim().match(/(\d+)\s*$/);
          if (match) {
            const pid = match[1];
            console.log(`[GoogleMessages] 기존 실행 중인 locked 프로세스 종료: PID ${pid}`);
            try {
              execSync(`taskkill /F /PID ${pid}`);
            } catch (err) {}
          }
        }
      }
    } catch (e) {
      // Ignore errors if wmic fails or no matching process found
    }
  }

  async close() {
    if (this.context) {
      await this.context.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.currentHeadless = undefined;
    }
  }
}

// Next.js 개발 환경에서 Hot Reload 시 인스턴스가 여러 개 생성되어
// 기존 브라우저 프로세스가 폴더 잠금을 유지하는 현상(EBUSY)을 방지하기 위한 글로벌 싱글톤 처리
const globalForGM = globalThis as unknown as { gmAutomation: GoogleMessagesAutomation };
export const gmAutomation = globalForGM.gmAutomation || new GoogleMessagesAutomation();

if (process.env.NODE_ENV !== 'production') {
  globalForGM.gmAutomation = gmAutomation;
}
