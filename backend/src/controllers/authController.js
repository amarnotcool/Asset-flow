import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { generateOtp, verifyOtp, isOtpVerified, clearOtp } from '../utils/otpStore.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const user = result.rows[0];

  if (user.status !== 'Active') {
    throw new ApiError(403, 'Account is inactive. Contact administrator.');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user.id);
  const { password_hash, ...userWithoutPassword } = user;

  res.status(200).json(
    new ApiResponse(200, { user: userWithoutPassword, token }, 'Login successful')
  );
});

// @route   POST /api/auth/register
// @desc    Register a new employee
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  const userExists = await query('SELECT email FROM users WHERE email = $1', [email]);
  if (userExists.rows.length > 0) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const result = await query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, department_id, status',
    [name, email, hashedPassword]
  );

  const newUser = result.rows[0];
  const token = generateToken(newUser.id);

  res.status(201).json(
    new ApiResponse(201, { user: newUser, token }, 'User registered successfully')
  );
});

// @route   POST /api/auth/forgot-password
// @desc    Send OTP to user's email for password reset
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Please provide your email address');
  }

  // Check if user exists
  const result = await query('SELECT id, name, email FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new ApiError(404, 'No account found with this email address');
  }

  const user = result.rows[0];

  // Generate and send OTP
  const otp = generateOtp(email);

  try {
    await sendOtpEmail(email, otp, user.name);
  } catch (err) {
    console.error('Email send error:', err.message);
    throw new ApiError(500, 'Failed to send OTP email. Please try again later.');
  }

  res.status(200).json(
    new ApiResponse(200, { email }, 'OTP has been sent to your email address')
  );
});

// @route   POST /api/auth/verify-otp
// @desc    Verify the OTP sent to user's email
// @access  Public
export const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Please provide email and OTP');
  }

  const result = verifyOtp(email, otp);

  if (!result.valid) {
    throw new ApiError(400, result.message);
  }

  res.status(200).json(
    new ApiResponse(200, { email, verified: true }, result.message)
  );
});

// @route   POST /api/auth/reset-password
// @desc    Reset password after OTP verification
// @access  Public (requires verified OTP)
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    throw new ApiError(400, 'Please provide email and new password');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  // Ensure OTP was verified before allowing password reset
  if (!isOtpVerified(email)) {
    throw new ApiError(403, 'OTP verification required before resetting password');
  }

  // Check if user exists
  const result = await query('SELECT id, email FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new ApiError(404, 'No account found with this email address');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);

  // Clear the OTP so it can't be reused
  clearOtp(email);

  res.status(200).json(
    new ApiResponse(200, null, 'Password has been reset successfully')
  );
});
