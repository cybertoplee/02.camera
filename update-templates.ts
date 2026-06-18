import { sql } from '@vercel/postgres'; // actually this project uses SQLite? Wait, let's check.
import db from './src/lib/db.ts'; // Wait, let's use the local helper.
import { updateSetting } from './src/lib/db.ts'; 

async function updateTpl() {
  await updateSetting('sms_template_in', '[EGDesk 플랫폼] {name} 회원이 {time}에 출근하였습니다.');
  await updateSetting('sms_template_out', '[EGDesk 플랫폼] {name} 회원이 {time}에 퇴근하였습니다.');
  console.log('updated templates');
}

updateTpl();
