import { chromium, Browser, Page, BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs';

const STORAGE_PATH = path.join(process.cwd(), 'storage', 'google-messages-auth.json');

/**
 * Google 메시지 웹 자동화 클래스
 */
export class GoogleMessagesAutomation {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private currentHeadless: boolean | null = null;

  /**
   * 브라우저 초기화 및 세션 로드
   */
  async init(headless: boolean = true) {
    // 기존 브라우저가 있지만 모드가 다른 경우 (예: headless -> headful) 닫고 다시 시작
    if (this.browser && this.currentHeadless !== headless) {
      await this.close();
    }

    if (this.browser) {
      try {
        // 브라우저가 연결되어 있고 페이지가 살아있는지 확인
        if (this.browser.isConnected() && this.page && !this.page.isClosed()) {
          return;
        }
        console.log('[GoogleMessages] 기존 브라우저 세션이 끊겼거나 페이지가 닫혔습니다. 재시작 중...');
        await this.close();
      } catch (e) {
        await this.close();
      }
    }

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
      this.browser = await chromium.launch({ ...launchOptions, channel: 'chrome' });
      console.log('[GoogleMessages] System Chrome 런칭 성공.');
    } catch (chromeErr: any) {
      console.log('[GoogleMessages] System Chrome 런칭 실패, 기본 Chromium으로 폴백합니다.', chromeErr.message);
      this.browser = await chromium.launch(launchOptions);
    }

    this.currentHeadless = headless;

    // 기존 세션이 있으면 로드
    const storageState = fs.existsSync(STORAGE_PATH) ? STORAGE_PATH : undefined;
    
    this.context = await this.browser.newContext({
      storageState,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(60000);

    // 메모리 절약을 위한 리소스 차단 (OOM 크래시 방지)
    await this.page.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (['image', 'media', 'font'].includes(type)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // 페이지 충돌 리스너 추가
    this.page.on('crash', () => {
      console.error('[GoogleMessages] 페이지가 충돌했습니다 (Page crashed)');
      this.close();
    });

    // 기본 주소로 접속 (이미 로그인된 경우 대화 목록으로 바로 이동됨)
    await this.page!.goto('https://messages.google.com/web', { waitUntil: 'domcontentloaded', timeout: 60000 });

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
        const pairButton = await this.page!.$('button:has-text("기기 페어링"), a:has-text("기기 페어링"), [aria-label*="기기 페어링"]');
        if (pairButton) {
          await pairButton.click();
        } else {
          const loginButton = await this.page!.$('a:has-text("로그인"), button:has-text("로그인")');
          if (loginButton) await loginButton.click();
        }
        await this.page!.waitForLoadState('domcontentloaded');
      }

      // "여기에서 사용" 또는 "기기 페어링 해제" 관련 팝업 확인
      const useHereButton = await this.page!.$('button:has-text("여기에서 사용"), button:has-text("Use here")');
      if (useHereButton) {
        console.log('[GoogleMessages] "여기에서 사용" 버튼 클릭 중...');
        await useHereButton.click();
      }
    } catch (err) {
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
        await this.page.waitForSelector('input[placeholder*="시작"], button:has-text("시작"), [aria-label*="시작"], .conversation-list, [role="grid"]', { timeout: 120000 });
      } catch (waitErr) {
        throw new Error('연동 확인 시간이 초과되었습니다. 브라우저 창에서 QR 스캔을 완료했는지 확인해 주세요.');
      }
      
      // 세션 저장
      await this.context!.storageState({ path: STORAGE_PATH });
      console.log('[GoogleMessages] 연동 성공 및 세션 저장 완료!');
      return { success: true };
    } catch (err: any) {
      console.error('[GoogleMessages] setupConnection 오류:', err);
      // 브라우저가 열리지 않는 경우 등을 대비해 에러 메시지 세분화
      const errorMessage = err.message || '알 수 없는 오류가 발생했습니다.';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 메시지 발송
   */
  async sendSMS(phoneNumber: string, message: string) {
    try {
      if (!this.page) await this.init(true);
      
      console.log(`[GoogleMessages] 메시지 발송 프로세스 시작: ${phoneNumber}`);

      // 치명적 오류 확인 헬퍼
      const isFatal = (err: any) => err?.message?.includes('closed') || err?.message?.includes('crash') || err?.message?.includes('navigation');

      // 1. '채팅 시작' / '대화 시작' 버튼 대기 및 클릭
      try {
        // 구글 메시지 업데이트로 인해 버튼 텍스트가 '채팅 시작'으로 변경됨을 반영
        const startChatButton = await this.page!.locator('text="채팅 시작", text="대화 시작", text="Start chat"').first();
        await startChatButton.waitFor({ state: 'visible', timeout: 15000 });
        await this.page!.waitForTimeout(500);
        await startChatButton.click({ timeout: 5000 }); // force: true 제거하여 정상 작동하는 버튼만 클릭
      } catch (e: any) {
        if (isFatal(e)) throw e;
        
        console.log('[GoogleMessages] 기본 버튼 클릭 실패, 강제 텍스트 매칭 탐색 시도...');
        try {
          if (!this.page || this.page.isClosed()) throw new Error('Target closed');
          const btn = await this.page.locator('button:has-text("시작"), a:has-text("시작")').first();
          if (await btn.isVisible()) {
             await btn.click();
          } else {
             throw new Error('버튼을 찾을 수 없음');
          }
        } catch (innerErr: any) {
          if (isFatal(innerErr)) throw innerErr;
          console.log('[GoogleMessages] 텍스트 기반 클릭도 실패, 엔터키 진행 시도');
          if (this.page && !this.page.isClosed()) {
            await this.page.keyboard.press('Enter');
          }
        }
      }
      
      // 2. 전화번호 입력창 대기 및 입력
      let searchInput;
      try {
        searchInput = await this.page!.waitForSelector(
          'input[placeholder*="이름"], input[placeholder*="번호"], input[aria-label*="전화번호"], .contact-picker-input input',
          { timeout: 10000 }
        );
      } catch (e) {
        // 만약 특정 선택자로 못 찾았다면 화면 상의 첫 번째 활성화된 input을 시도합니다.
        searchInput = await this.page!.locator('input:not([type="hidden"])').first();
      }

      await searchInput.focus();
      await this.page!.keyboard.type(phoneNumber, { delay: 100 });
      await this.page!.waitForTimeout(1000);
      await this.page!.keyboard.press('Enter');
      await this.page!.waitForTimeout(500);
      
      // 2-1. 번호 입력 후 검색 결과에서 '보내기' 또는 첫 번째 항목 클릭 시도
      try {
        // 연락처 칩(Chip)을 선택하거나 검색 결과를 클릭합니다.
        const sendToButton = await this.page!.waitForSelector(
          'div[role="button"]:has-text("보내기"), .contact-list-item, [aria-label*="보내기"], [data-e2e-id="search-result-item"]',
          { timeout: 5000 }
        );
        await sendToButton.click();
      } catch (e: any) {
        if (isFatal(e)) throw e;
        console.log('[GoogleMessages] 결과 클릭 생략 (엔터로 2차 진입 시도)');
        await this.page!.keyboard.press('Enter'); // 수신자 확정 후 대화방 진입을 위한 두 번째 Enter
      }
      
      // 3. 메시지 입력창 대기
      // 포괄적인 aria-label 대신, 실제로 글자를 입력할 수 있는 요소만 정확히 타겟팅합니다.
      const msgInput = await this.page!.waitForSelector(
        'textarea, div[role="textbox"][contenteditable="true"]',
        { timeout: 15000 }
      );
      
      console.log(`[GoogleMessages] 메시지 입력 중...`);
      await msgInput.focus();
      
      // fill()이 실패할 수 있는 엣지 케이스를 방지하기 위해 키보드 직접 타이핑 폴백 적용
      try {
        await msgInput.fill(message);
      } catch (e) {
        console.log('[GoogleMessages] fill() 메서드 실패, 키보드로 직접 텍스트 타이핑 시도...');
        await this.page!.keyboard.type(message, { delay: 50 });
      }

      // 4. 전송 버튼 클릭 또는 Enter
      await this.page!.waitForTimeout(1000);
      await this.page!.keyboard.press('Enter');
      
      // 5. 전송 완료 대기 및 세션 확인용 잠시 대기
      await this.page!.waitForTimeout(3000);
      
      console.log(`[GoogleMessages] 발송 명령 완료: ${phoneNumber}`);
      return { success: true };
    } catch (err: any) {
      console.error('[GoogleMessages] 발송 오류 상세:', err);
      // 오류 발생 시 스크린샷 저장
      try {
        const screenshotPath = path.join(process.cwd(), 'storage', `sms-error-${Date.now()}.png`);
        await this.page?.screenshot({ path: screenshotPath });
        console.log(`[GoogleMessages] 에러 스크린샷 저장됨: ${screenshotPath}`);
      } catch (e) {}
      
      if (err.message?.includes('Target closed') || 
          err.message?.includes('navigation') || 
          err.message?.includes('Target crashed') ||
          err.message?.includes('crash') ||
          err.message?.includes('closed')) {
        console.log('[GoogleMessages] 치명적 오류 감지, 브라우저 세션 초기화 시도...');
        await this.close();
      }
      return { success: false, error: err.message || err };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.currentHeadless = null;
    }
  }
}

// 싱글톤 인스턴스
export const gmAutomation = new GoogleMessagesAutomation();
