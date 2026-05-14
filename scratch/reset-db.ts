import { deleteTable, listTables } from './egdesk-helpers';
import { setupDatabase } from './src/lib/setup-db';

async function resetAndSetup() {
  console.log('Fetching tables...');
  const res = await listTables();
  const tablesToReset = ['students', 'classes', 'attendance_logs', 'payment_records', 'student_classes'];
  
  for (const tableName of tablesToReset) {
    if (res.tables.find((t: any) => t.tableName === tableName)) {
      console.log(`Deleting metadata for ${tableName}...`);
      try {
        await deleteTable(tableName);
      } catch (e: any) {
        console.error(`Error deleting ${tableName}:`, e.message);
      }
    }
  }
  
  console.log('Running setupDatabase...');
  await setupDatabase();
  console.log('Reset and Setup complete!');
}

resetAndSetup().catch(console.error);
