
import { queryTable } from './egdesk-helpers';

async function debug() {
  try {
    console.log('--- Students ---');
    const s = await queryTable('students');
    console.log(JSON.stringify(s, null, 2));

    console.log('--- Logs ---');
    const l = await queryTable('attendance_logs');
    console.log(JSON.stringify(l, null, 2));
  } catch (e) {
    console.error(e);
  }
}

debug();
