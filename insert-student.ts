import { insertRows } from './egdesk-helpers';

async function init() {
  try {
    await insertRows('students', [
      { name: '테스트학생', parent_phone: '01012345678' }
    ]);
    console.log('Test student inserted successfully');
  } catch (err) {
    console.error('Error:', err);
  }
}

init();
