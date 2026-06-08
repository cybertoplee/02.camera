import { setupDatabase } from './src/lib/setup-db.ts';
import { insertRows } from './egdesk-helpers.ts';

async function main() {
  try {
    console.log('Initializing database using src/lib/setup-db.ts...');
    await setupDatabase();
    console.log('Database tables recreated successfully.');

    // Insert some dummy data so the user can see it works
    console.log('Inserting dummy students...');
    await insertRows('students', [
      { name: '김태권', parent_name: '김부모', parent_phone: '010-1111-2222', birth_date: '2015-05-05', rank: '1품', class_id: 1, status: 'ACTIVE' },
      { name: '이마샬', parent_name: '이부모', parent_phone: '010-3333-4444', birth_date: '2014-03-12', rank: '빨간띠', class_id: 2, status: 'ACTIVE' },
      { name: '박아츠', parent_name: '박부모', parent_phone: '010-5555-6666', birth_date: '2016-08-20', rank: '파란띠', class_id: 1, status: 'ON_HOLD' }
    ]);
    console.log('Dummy students inserted successfully.');
  } catch (e: any) {
    console.error('Failed to initialize db:', e.message);
  }
}

main();
