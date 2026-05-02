// services/auth.service.ts

import { apiClient } from "@/lib/api";

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
    token?: string;      // Firebase custom token returned after verify
    uid?: string;
    roles?: string[];
  };
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  return apiClient<SendOtpResponse>("/auth/send-otp", {
    method: "POST",
    data: { phone },
    noAuth: true,
  });
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<VerifyOtpResponse> {
  return apiClient<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    data: { phone, code },
    noAuth: true,
  });
}
