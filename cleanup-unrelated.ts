import { listTables, deleteTable } from './egdesk-helpers';

const relatedTables = [
  'classes',
  'students',
  'attendance_logs',
  'payment_records',
  'student_classes',
  'custom_fields',
  'tkd_system_settings',
  'tkd_usage_logs',
  'cctv_records',
  'cctv_events',
  'user_data_files',
  'sync_configurations',
  'sync_activity_log',
  'user_feedbacks'
];

async function cleanup() {
  console.log('Fetching all tables from EGDesk mydb...');
  const res = await listTables();
  if (!res || !res.tables) {
    console.error('Failed to list tables.');
    return;
  }

  const allTables = res.tables.map(t => t.tableName);
  console.log(`Found ${allTables.length} tables in total.`);

  for (const tableName of allTables) {
    if (!relatedTables.includes(tableName)) {
      console.log(`Deleting unrelated table: ${tableName}`);
      try {
        await deleteTable(tableName);
      } catch (e: any) {
        console.error(`Failed to delete ${tableName}:`, e.message);
      }
    } else {
      console.log(`Keeping related table: ${tableName}`);
    }
  }

  console.log('Cleanup completed.');
}

cleanup().catch(console.error);
