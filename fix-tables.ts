import { listTables, deleteTable, createTable } from './egdesk-helpers.ts';
import { TABLES } from './egdesk.schema.ts';

async function fixTables() {
  console.log('Fetching all tables...');
  const res = await listTables();
  console.log('Existing tables:', res.tables.map((t: any) => t.tableName));

  for (const tableName of Object.keys(TABLES)) {
    console.log(`Deleting ${tableName}...`);
    try {
      await deleteTable(tableName);
    } catch (e: any) {
      console.log(`Error deleting ${tableName}:`, e.message);
    }
  }

  console.log('Recreating tables...');
  for (const [key, schema] of Object.entries(TABLES)) {
    console.log(`Creating table ${key}...`);
    const cols = schema.columns.map(c => ({ name: c, type: 'TEXT' as const }));
    try {
      await createTable(schema.displayName, cols, { tableName: key });
      console.log(`Created table: ${key}`);
    } catch (e: any) {
      console.log(`Failed to create ${key}:`, e.message);
    }
  }
}

fixTables().catch(console.error);
