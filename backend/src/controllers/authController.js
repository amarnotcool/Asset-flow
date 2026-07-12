import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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

  // Check if user exists
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const user = result.rows[0];

  if (user.status !== 'Active') {
    throw new ApiError(403, 'Account is inactive. Contact administrator.');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user.id);

  // Return user without hash
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

  // Check if user exists
  const userExists = await query('SELECT email FROM users WHERE email = $1', [email]);
  if (userExists.rows.length > 0) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user
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
