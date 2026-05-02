// functions/auth/otpRouter.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../utils/validate.utils';
import { handleError, AppError } from '../../utils/error.utils';
import { sendOTP, verifyOTP } from '../../services/otp.service';

export const otpRouter = Router();

// Validation Schemas
const SendOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits')
});

const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  code: z.string().length(6, 'OTP must be exactly 6 digits')
});

/**
 * POST /api/auth/send-otp
 * Body: { "phone": "9876543210" }
 */
otpRouter.post('/send-otp', validateBody(SendOtpSchema), async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    
    console.info(`[Auth] OTP request for ${phone}`);
    const status = await sendOTP(phone);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: { status }
    });
  } catch (err: any) {
    if (err.message.includes('unverified')) {
       res.status(403).json({
         success: false,
         message: "Twilio Trial limitation: Phone number is not verified in Twilio Console.",
         data: {}
       });
       return;
    }
    handleError(err, res);
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { "phone": "9876543210", "code": "123456" }
 */
otpRouter.post('/verify-otp', validateBody(VerifyOtpSchema), async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;

    console.info(`[Auth] Verifying OTP for ${phone}`);
    const isApproved = await verifyOTP(phone, code);

    if (!isApproved) {
      throw new AppError('INVALID_OTP', 'The verification code is incorrect or has expired.', 400);
    }

    res.status(200).json({
      success: true,
      message: "Phone verified successfully",
      data: { verified: true }
    });
  } catch (err: any) {
    handleError(err, res);
  }
});
