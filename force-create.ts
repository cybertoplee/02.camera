import { TABLES } from './egdesk.schema.ts';
import { createTable } from './egdesk-helpers.ts';

async function main() {
  for (const [key, schema] of Object.entries(TABLES)) {
    console.log(`Ensuring table ${key} exists...`);
    const cols = schema.columns.map(c => ({ name: c, type: 'TEXT' as const }));
    try {
      await createTable(schema.displayName, cols, { tableName: key });
      console.log(`Created/Ensured table: ${key}`);
    } catch (e: any) {
      console.log(`Skipped ${key} (might already exist):`, e.message);
    }
  }
}
main().catch(console.error);
