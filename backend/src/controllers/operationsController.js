import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// --- ASSET ALLOCATIONS ---

export const getAllocations = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT a.*, ast.name as asset_name, ast.asset_tag, u.name as user_name, d.name as department_name
    FROM asset_allocations a
    JOIN assets ast ON a.asset_id = ast.id
    JOIN users u ON a.user_id = u.id
    LEFT JOIN departments d ON a.department_id = d.id
    ORDER BY a.allocated_date DESC
  `);
  res.json(new ApiResponse(200, result.rows, 'Allocations retrieved'));
});

export const allocateAsset = asyncHandler(async (req, res) => {
  const { asset_id, user_id, department_id, expected_return_date } = req.body;

  // 1. Check if asset is available
  const assetCheck = await query('SELECT status FROM assets WHERE id = $1', [asset_id]);
  if (assetCheck.rows.length === 0) throw new ApiError(404, 'Asset not found');
  if (assetCheck.rows[0].status !== 'Available') {
    throw new ApiError(400, `Asset is currently ${assetCheck.rows[0].status} and cannot be allocated.`);
  }

  // 2. Perform allocation (using transaction)
  await query('BEGIN');
  try {
    const allocResult = await query(
      'INSERT INTO asset_allocations (asset_id, user_id, department_id, expected_return_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [asset_id, user_id, department_id, expected_return_date]
    );
    await query(
      "UPDATE assets SET status = 'Allocated', holder_id = $1 WHERE id = $2",
      [user_id, asset_id]
    );
    await query('COMMIT');
    res.status(201).json(new ApiResponse(201, allocResult.rows[0], 'Asset allocated successfully'));
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
});

// --- RESOURCE BOOKINGS ---

export const getBookings = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT b.*, ast.name as asset_name, u.name as user_name
    FROM resource_bookings b
    JOIN assets ast ON b.asset_id = ast.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.start_time ASC
  `);
  res.json(new ApiResponse(200, result.rows, 'Bookings retrieved'));
});

export const createBooking = asyncHandler(async (req, res) => {
  const { asset_id, start_time, end_time } = req.body;
  const user_id = req.user.id; // From authMiddleware

  // Check for time slot overlaps
  const overlapCheck = await query(`
    SELECT id FROM resource_bookings 
    WHERE asset_id = $1 
    AND status != 'Cancelled'
    AND (
      (start_time <= $2 AND end_time >= $2) OR
      (start_time <= $3 AND end_time >= $3) OR
      (start_time >= $2 AND end_time <= $3)
    )
  `, [asset_id, start_time, end_time]);

  if (overlapCheck.rows.length > 0) {
    throw new ApiError(409, 'Time slot overlaps with an existing booking');
  }

  const result = await query(
    'INSERT INTO resource_bookings (asset_id, user_id, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
    [asset_id, user_id, start_time, end_time]
  );

  res.status(201).json(new ApiResponse(201, result.rows[0], 'Resource booked successfully'));
});

// --- MAINTENANCE ---

export const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT m.*, ast.name as asset_name, ast.asset_tag, u.name as requester_name
    FROM maintenance_requests m
    JOIN assets ast ON m.asset_id = ast.id
    JOIN users u ON m.requester_id = u.id
    ORDER BY m.request_date DESC
  `);
  res.json(new ApiResponse(200, result.rows, 'Maintenance requests retrieved'));
});

export const createMaintenanceRequest = asyncHandler(async (req, res) => {
  const { asset_id, issue_description, priority } = req.body;
  const requester_id = req.user.id;

  await query('BEGIN');
  try {
    const result = await query(
      'INSERT INTO maintenance_requests (asset_id, requester_id, issue_description, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [asset_id, requester_id, issue_description, priority || 'Medium']
    );
    await query("UPDATE assets SET status = 'Under Maintenance' WHERE id = $1", [asset_id]);
    await query('COMMIT');
    res.status(201).json(new ApiResponse(201, result.rows[0], 'Maintenance request created'));
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
});
