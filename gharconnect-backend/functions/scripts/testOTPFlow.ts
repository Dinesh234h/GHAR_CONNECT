// functions/scripts/testOTPFlow.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = 'http://127.0.0.1:5001/demo-no-project/asia-south1/api';

async function testOTPFlow() {
  console.log('\n========================================');
  console.log('  GharConnect — OTP Flow Testing');
  console.log('========================================\n');

  // Test 1: Invalid Phone (Less than 10 digits)
  console.log('Test 1: Invalid Phone Validation...');
  try {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '123' })
    });
    const data = await res.json() as any;
    console.log('Result:', res.status, data.error?.message || data.message);
    if (res.status === 400) console.log('✅ Correctly rejected invalid phone\n');
  } catch (e) { console.error('❌ Test 1 failed:', e); }

  // Test 2: Valid format, missing credentials (Expected Error)
  console.log('Test 2: Valid format, placeholder credentials...');
  try {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' })
    });
    const data = await res.json() as any;
    console.log('Result:', res.status, data.message);
    if (data.message?.includes('credentials missing')) {
      console.log('✅ Correctly caught missing credentials\n');
    }
  } catch (e) { console.error('❌ Test 2 failed:', e); }

  // Test 3: Invalid OTP length
  console.log('Test 3: Invalid OTP length validation...');
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', code: '123' })
    });
    const data = await res.json() as any;
    console.log('Result:', res.status, data.error?.message || data.message);
    if (res.status === 400) console.log('✅ Correctly rejected short OTP\n');
  } catch (e) { console.error('❌ Test 3 failed:', e); }
}

console.log('Starting Emulators for testing...');
// Note: This script assumes emulators are already running or will be run in parallel.
testOTPFlow();
