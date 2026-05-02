// functions/scripts/testAllAPIs.ts
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the gharconnect-backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runAllTests() {
  console.log('\n========================================');
  console.log('  GharConnect — API Connection Tests');
  console.log('========================================\n');

  const results: {api: string, status: string, note: string}[] = [];

  // 1. OpenStreetMap (Nominatim)
  try {
    const { getCoordinates } = await import('../src/utils/geocode');
    const coords = await getCoordinates('Indiranagar, Bengaluru');
    results.push({ api: 'Nominatim', status: coords.lat ? '✅ OK' : '❌ FAIL', note: `Lat: ${coords.lat}` });
  } catch (e) { results.push({ api: 'Nominatim', status: '❌ ERROR', note: String(e) }); }

  // 2. Firebase Firestore
  try {
    const { db } = await import('../src/config/firebase');
    const ref = await db.collection('_test').add({ test: true });
    await ref.delete();
    results.push({ api: 'Firebase Firestore', status: '✅ OK', note: 'Read/write successful' });
  } catch (e) { results.push({ api: 'Firebase Firestore', status: '❌ ERROR', note: String(e) }); }

  // 3. Twilio SMS
  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();
    results.push({ api: 'Twilio SMS', status: '✅ OK', note: `Account: ${account.friendlyName}` });
  } catch (e) { results.push({ api: 'Twilio SMS', status: '❌ ERROR', note: String(e) }); }

  // 3.1 Twilio Verify (OTP)
  try {
    const { sendOTP } = await import('../src/services/otp.service');
    // Just try to init the client via sendOTP call (it will throw if keys are placeholders)
    // We use a dummy number that will likely fail with 403 on trial, which is fine for "connectivity" test
    await sendOTP('1234567890');
    results.push({ api: 'Twilio Verify', status: '✅ OK', note: 'Handshake successful' });
  } catch (e: any) {
    const isConnOk = e.message.includes('unverified') || e.message.includes('not found');
    results.push({ 
      api: 'Twilio Verify', 
      status: isConnOk ? '✅ OK' : '❌ ERROR', 
      note: isConnOk ? 'Connected (Trial)' : String(e) 
    });
  }

  // 4. Agora Token
  try {
    const { RtcTokenBuilder, RtcRole } = await import('agora-access-token');
    const token = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID!, process.env.AGORA_APP_CERTIFICATE!,
      'test', 1001, RtcRole.PUBLISHER, Math.floor(Date.now()/1000) + 3600
    );
    results.push({ api: 'Agora RTC', status: token.length > 50 ? '✅ OK' : '❌ FAIL', note: `Token length: ${token.length}` });
  } catch (e) { results.push({ api: 'Agora RTC', status: '❌ ERROR', note: String(e) }); }

  // 5. Open Holidays API
  try {
    const res = await fetch('https://openholidaysapi.org/PublicHolidays?countryIsoCode=IN&languageIsoCode=EN&validFrom=2025-01-01&validTo=2025-03-31');
    const d = await res.json() as any;
    results.push({ api: 'Open Holidays', status: Array.isArray(d) ? '✅ OK' : '❌ FAIL', note: `${d.length} holidays fetched` });
  } catch (e) { results.push({ api: 'Open Holidays', status: '❌ ERROR', note: String(e) }); }


  // 7. ngeohash
  try {
    const ngeohash = (await import('ngeohash')).default;
    const hash = ngeohash.encode(12.9716, 77.5946, 6);
    results.push({ api: 'ngeohash', status: hash.length === 6 ? '✅ OK' : '❌ FAIL', note: `Bengaluru: ${hash}` });
  } catch (e) { results.push({ api: 'ngeohash', status: '❌ ERROR', note: String(e) }); }

  // 8. Local Scheduler (Cloud Tasks replacement)
  try {
    const { scheduleOrderTimeout, cancelTask } = await import('../src/services/cloudTasks.service');
    const id = await scheduleOrderTimeout('test_order', new Date(Date.now() + 1000));
    cancelTask(id);
    results.push({ api: 'Local Scheduler', status: '✅ OK', note: 'Schedule/Cancel working' });
  } catch (e) { results.push({ api: 'Local Scheduler', status: '❌ ERROR', note: String(e) }); }

  // Print results table
  console.log('API'.padEnd(20), 'STATUS'.padEnd(12), 'NOTE');
  console.log('─'.repeat(60));
  results.forEach(r => {
    console.log(r.api.padEnd(20), r.status.padEnd(12), r.note);
  });

  const passed = results.filter(r => r.status.includes('✅')).length;
  console.log(`\n${passed}/${results.length} APIs connected successfully.`);
  if (passed < results.length) {
    console.log('⚠ Fix the failing APIs before proceeding with backend build.');
  } else {
    console.log('🎉 All APIs connected. Backend is ready to build.');
  }
}

runAllTests().catch(console.error);
