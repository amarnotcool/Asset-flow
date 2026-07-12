import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Fetch user without password
    const result = await query(
      'SELECT id, name, email, department_id, role, status FROM users WHERE id = $1 AND status = $2', 
      [decoded.id, 'Active']
    );

    if (result.rows.length === 0) {
      throw new ApiError(401, 'Not authorized, user not found or inactive');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token failed');
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      throw new ApiError(401, 'User role is undefined. Not authorized.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `User role (${req.user.role}) is not authorized to access this route.`);
    }

    next();
  };
};
