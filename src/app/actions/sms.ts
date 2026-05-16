'use server';

import { sendAttendanceSMS } from '../../lib/sms';
import fs from 'fs';
import path from 'path';

/**
 * 학부모 알림 문자 발송 서버 액션
 * 클라이언트 컴포넌트에서 안전하게 호출할 수 있습니다.
 */
export async function sendAttendanceSMSAction(studentId: number, type: 'IN' | 'OUT') {
  try {
    fs.writeFileSync('c:\\dev\\egdesk-tkd\\storage\\ACTION_CALLED.txt', `Action invoked for student ${studentId} at ${new Date().toISOString()}`);
    return await sendAttendanceSMS(studentId, type);
  } catch (err) {
    console.error('[Server Action] SMS 발송 오류:', err);
    return { success: false, error: '서버 액션 실행 중 오류 발생' };
  }
}
