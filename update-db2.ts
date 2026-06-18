import { queryTable, updateRows } from './egdesk-helpers.ts';

async function updateDbSettings() {
  try {
    const check = await queryTable('tkd_system_settings');
    const rows = check.rows || [];
    
    const inRow = rows.find((r: any) => r.key === 'sms_template_in');
    const outRow = rows.find((r: any) => r.key === 'sms_template_out');

    if (inRow) {
      await updateRows('tkd_system_settings', { value: '[EGDesk 플랫폼] {name} 회원이 {time}에 출근하였습니다.' }, { ids: [inRow.id] });
    }
    if (outRow) {
      await updateRows('tkd_system_settings', { value: '[EGDesk 플랫폼] {name} 회원이 {time}에 퇴근하였습니다.' }, { ids: [outRow.id] });
    }
    
    // Also explicitly set sms_enabled to true for them if they want it ON
    const smsOnRow = rows.find((r: any) => r.key === 'sms_enabled');
    if (smsOnRow) {
      await updateRows('tkd_system_settings', { value: 'true' }, { ids: [smsOnRow.id] });
    }

    console.log('Successfully updated DB values for templates and sms_enabled.');
  } catch (e: any) {
    console.log('Failed to update DB:', e.message);
  }
}

updateDbSettings();
