import { queryTable, executeSql } from './egdesk-helpers.ts';

async function updateDbSettings() {
  try {
    const check = await queryTable('tkd_system_settings');
    const hasIn = check.rows.find((r: any) => r.key === 'sms_template_in');
    
    if (hasIn) {
      await executeSql(`
        UPDATE user_data_tkd_system_settings 
        SET value = '[EGDesk 플랫폼] {name} 회원이 {time}에 출근하였습니다.'
        WHERE key = 'sms_template_in'
      `);
      await executeSql(`
        UPDATE user_data_tkd_system_settings 
        SET value = '[EGDesk 플랫폼] {name} 회원이 {time}에 퇴근하였습니다.'
        WHERE key = 'sms_template_out'
      `);
      console.log('Updated existing settings in DB.');
    } else {
      console.log('No existing settings found. Next.js will auto-initialize them.');
    }
  } catch (e: any) {
    console.log('Skipped DB update:', e.message);
  }
}

updateDbSettings();
