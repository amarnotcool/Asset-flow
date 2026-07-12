import express from 'express';
import { login, register, forgotPassword, verifyOtpHandler, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/forgot-password  (Step 1: send OTP)
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/verify-otp       (Step 2: verify OTP)
router.post('/verify-otp', verifyOtpHandler);

// @route   POST /api/auth/reset-password   (Step 3: set new password)
router.post('/reset-password', resetPassword);

export default router;
