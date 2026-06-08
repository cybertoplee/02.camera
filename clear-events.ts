import { queryTable, deleteRows } from './egdesk-helpers.ts';

async function main() {
  try {
    console.log('Fetching CCTV events...');
    const res = await queryTable('cctv_events', { limit: 10000 });
    const ids = res.rows?.map((r: any) => r.id) || [];
    
    if (ids.length > 0) {
      console.log(`Found ${ids.length} events. Deleting...`);
      await deleteRows('cctv_events', { ids });
      console.log('Deletion successful.');
    } else {
      console.log('No events found to delete.');
    }
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

main();
