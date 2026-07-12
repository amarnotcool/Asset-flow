// In-memory OTP store with expiry
// Format: { email: { otp: string, expiresAt: number, verified: boolean } }
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a 6-digit OTP and store it
 */
export const generateOtp = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    verified: false,
  });
  return otp;
};

/**
 * Verify an OTP for a given email
 * Returns true if valid, throws descriptive error otherwise
 */
export const verifyOtp = (email, otp) => {
  const entry = otpStore.get(email.toLowerCase());

  if (!entry) {
    return { valid: false, message: 'No OTP was requested for this email. Please request a new one.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (entry.otp !== otp) {
    return { valid: false, message: 'Invalid OTP. Please check and try again.' };
  }

  // Mark as verified
  entry.verified = true;
  otpStore.set(email.toLowerCase(), entry);
  return { valid: true, message: 'OTP verified successfully.' };
};

/**
 * Check if OTP has been verified for this email (used before password reset)
 */
export const isOtpVerified = (email) => {
  const entry = otpStore.get(email.toLowerCase());
  return entry?.verified === true && Date.now() <= entry.expiresAt;
};

/**
 * Clear OTP after successful password reset
 */
export const clearOtp = (email) => {
  otpStore.delete(email.toLowerCase());
};
