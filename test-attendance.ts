import { insertRows, queryTable } from './egdesk-helpers';

async function init() {
  try {
    console.log('Querying students table...');
    let students = await queryTable('students');
    console.log('Students count:', students.rows?.length);
    let testStudent = students.rows?.find((s: any) => s.name === '테스트학생');
    
    if (!testStudent) {
      console.log('Test student not found. Creating one...');
      const result = await insertRows('students', [
        { name: '테스트학생', parent_name: '테스트부모', parent_phone: '01012345678', class_id: 1, status: 'ACTIVE' }
      ]);
      console.log('Insert result:', result);
      
      students = await queryTable('students');
      testStudent = students.rows?.find((s: any) => s.name === '테스트학생');
    }

    if (!testStudent) {
      throw new Error('Failed to create test student');
    }

    console.log('Found test student:', testStudent);

    // 2. Insert attendance log (type 'IN')
    const localISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    console.log(`Inserting IN attendance log for student ${testStudent.id} at ${localISO}...`);
    
    const attResult = await insertRows('attendance_logs', [{
      student_id: testStudent.id,
      timestamp: localISO,
      type: 'IN',
      status: 'NORMAL',
      sms_status: 'NONE'
    }]);
    
    console.log('Attendance insert result:', attResult);
    console.log('Attendance simulated successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

init();
