import { queryTable } from './egdesk-helpers.ts';

async function testQuery() {
  try {
    const res = await queryTable('custom_fields');
    console.log('Query result:', res);
  } catch (e: any) {
    console.error('Query error:', e.message);
  }
}

testQuery();
