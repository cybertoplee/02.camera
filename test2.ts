import { queryTable } from './egdesk-helpers.ts';

async function test() {
  try {
    const res = await queryTable('classes');
    console.log(res);
  } catch (e: any) {
    console.error(e.message);
  }
}
test();
