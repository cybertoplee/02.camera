import { executeSQL } from './egdesk-helpers.ts';

async function check() {
  const students = await executeSQL('SELECT * FROM students');
  const logs = await executeSQL('SELECT * FROM attendance_logs ORDER BY id DESC LIMIT 5');
  console.log('STUDENTS:', students.rows);
  console.log('LOGS:', logs.rows);
}
check();
