// services/otp.service.ts
import twilio from 'twilio';

/**
 * OTP Service using Twilio Verify API
 * Decouples SMS delivery and verification logic from the routes.
 */
function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!sid || sid.includes('YOUR_SID') || !token || token.includes('YOUR_AUTH') || !serviceSid || serviceSid.includes('YOUR_VERIFY')) {
    throw new Error('Twilio Verify credentials missing or incomplete in .env');
  }

  return {
    client: twilio(sid, token),
    serviceSid
  };
}

/**
 * sendOTP — Initiates an OTP verification request via SMS.
 */
export async function sendOTP(phone: string): Promise<string> {
  const { client, serviceSid } = getClient();
  
  // Format to E.164 if not already (assuming India +91 if 10 digits)
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  try {
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: formattedPhone, channel: 'sms' });
    
    return verification.status;
  } catch (error: any) {
    console.error('[OTP Service] sendOTP Error:', error.message);
    throw new Error(error.message || 'Failed to send OTP');
  }
}

/**
 * verifyOTP — Checks the code provided by the user against Twilio Verify.
 */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const { client, serviceSid } = getClient();
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  try {
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: formattedPhone, code });
    
    return verificationCheck.status === 'approved';
  } catch (error: any) {
    console.error('[OTP Service] verifyOTP Error:', error.message);
    // Common errors: Expired code, too many attempts
    throw new Error(error.message || 'Verification failed');
  }
}
