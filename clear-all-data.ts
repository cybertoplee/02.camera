import { queryTable, deleteRows } from './egdesk-helpers.ts';
import fs from 'fs';
import path from 'path';

async function clearTable(tableName: string) {
  try {
    console.log(`Fetching ${tableName}...`);
    const res = await queryTable(tableName, { limit: 10000 });
    const ids = res.rows?.map((r: any) => r.id) || [];
    
    if (ids.length > 0) {
      console.log(`Found ${ids.length} records in ${tableName}. Deleting...`);
      await deleteRows(tableName, { ids });
      console.log(`${tableName} deletion successful.`);
    } else {
      console.log(`No records found in ${tableName}.`);
    }
  } catch (e: any) {
    console.error(`Error clearing ${tableName}:`, e.message);
  }
}

async function main() {
  await clearTable('cctv_events');
  await clearTable('cctv_records');

  // Delete files
  const dir = __dirname;
  const files = fs.readdirSync(dir);
  let deletedCount = 0;
  for (const file of files) {
    if (file.endsWith('_snapshot.jpg') || file.endsWith('_video.webm')) {
      fs.unlinkSync(path.join(dir, file));
      deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} media files.`);
}

main();
