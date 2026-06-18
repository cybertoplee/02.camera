import { gmAutomation } from './src/lib/google-messages.ts';

async function testSMS() {
  console.log('Testing connection...');
  await gmAutomation.init(true);
  console.log('init done');
  await gmAutomation.sendSMS('010-9697-3927', 'Test SMS from backend script');
  console.log('sent');
  await gmAutomation.close();
}

testSMS().catch(console.error);
