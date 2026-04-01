import { randomInt } from "crypto";


export const SIGNUP_OTP_TTL_SEC = 30 * 60;


export const PASSWORD_RESET_OTP_TTL_SEC = 30 * 60;

const DEFAULT_LENGTH = 6;
const DIGITS = "0123456789";


export function generateOtp(length: number = DEFAULT_LENGTH): string {
  if (length < 4 || length > 10) {
    throw new Error("OTP length must be between 4 and 10");
  }
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += DIGITS[randomInt(0, 10)]!;
  }
  return code;
}


export function normalizeEmail(email: string): string {
  return email.normalize("NFKC").trim().toLowerCase();
}

export function otpCacheKey(email: string): string {
  return `otp:${normalizeEmail(email)}`;
}

export function passwordResetOtpKey(email: string): string {
  return `pwdreset:${normalizeEmail(email)}`;
}
