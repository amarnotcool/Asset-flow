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

  const assetCheck = await query('SELECT status FROM assets WHERE id = $1', [asset_id]);
  if (assetCheck.rows.length === 0) throw new ApiError(404, 'Asset not found');
  if (assetCheck.rows[0].status !== 'Available') {
    throw new ApiError(400, `Asset is currently ${assetCheck.rows[0].status} and cannot be allocated.`);
  }

  await query('BEGIN');
  try {
    const allocResult = await query(
      'INSERT INTO asset_allocations (asset_id, user_id, department_id, expected_return_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [asset_id, user_id, department_id || null, expected_return_date || null]
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

// --- TRANSFER REQUESTS ---

export const getTransfers = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT t.*, a.name as asset_name, a.asset_tag,
           fu.name as from_user_name, tu.name as to_user_name
    FROM transfer_requests t
    JOIN assets a ON t.asset_id = a.id
    JOIN users fu ON t.from_user_id = fu.id
    JOIN users tu ON t.to_user_id = tu.id
    ORDER BY t.request_date DESC
  `);
  res.json(new ApiResponse(200, result.rows, 'Transfer requests retrieved'));
});

// Employees initiate a transfer request — status starts as "Pending"
export const createTransfer = asyncHandler(async (req, res) => {
  const { asset_id, from_user_id, to_user_id, reason } = req.body;

  if (!asset_id || !from_user_id || !to_user_id) {
    throw new ApiError(400, 'Asset, from user, and to user are required');
  }

  // Check that asset is currently allocated
  const assetCheck = await query('SELECT status, holder_id FROM assets WHERE id = $1', [asset_id]);
  if (assetCheck.rows.length === 0) throw new ApiError(404, 'Asset not found');
  if (assetCheck.rows[0].status !== 'Allocated') {
    throw new ApiError(400, 'Only currently allocated assets can be transferred');
  }

  const result = await query(
    `INSERT INTO transfer_requests (asset_id, from_user_id, to_user_id, reason, status)
     VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
    [asset_id, from_user_id, to_user_id, reason || null]
  );

  res.status(201).json(new ApiResponse(201, result.rows[0], 'Transfer request submitted for approval'));
});

// Admin/Asset Manager/Department Head approves a transfer
export const approveTransfer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transfer = await query('SELECT * FROM transfer_requests WHERE id = $1', [id]);
  if (transfer.rows.length === 0) throw new ApiError(404, 'Transfer request not found');
  if (transfer.rows[0].status !== 'Pending') {
    throw new ApiError(400, `Transfer is already ${transfer.rows[0].status}`);
  }

  const { asset_id, to_user_id } = transfer.rows[0];

  await query('BEGIN');
  try {
    // Update transfer status
    await query("UPDATE transfer_requests SET status = 'Approved' WHERE id = $1", [id]);

    // Close old allocation
    await query(
      `UPDATE asset_allocations SET status = 'Returned', returned_date = NOW() WHERE asset_id = $1 AND status = 'Active'`,
      [asset_id]
    );

    // Create new allocation
    await query(
      'INSERT INTO asset_allocations (asset_id, user_id) VALUES ($1, $2)',
      [asset_id, to_user_id]
    );

    // Update asset holder
    await query('UPDATE assets SET holder_id = $1 WHERE id = $2', [to_user_id, asset_id]);

    await query('COMMIT');
    res.json(new ApiResponse(200, { id, status: 'Approved' }, 'Transfer approved'));
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
});

// Admin/Asset Manager/Department Head rejects a transfer
export const rejectTransfer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transfer = await query('SELECT * FROM transfer_requests WHERE id = $1', [id]);
  if (transfer.rows.length === 0) throw new ApiError(404, 'Transfer request not found');
  if (transfer.rows[0].status !== 'Pending') {
    throw new ApiError(400, `Transfer is already ${transfer.rows[0].status}`);
  }

  await query("UPDATE transfer_requests SET status = 'Rejected' WHERE id = $1", [id]);
  res.json(new ApiResponse(200, { id, status: 'Rejected' }, 'Transfer rejected'));
});

// --- RESOURCE BOOKINGS ---

export const getBookings = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT b.*, ast.name as asset_name, ast.asset_tag, u.name as user_name
    FROM resource_bookings b
    JOIN assets ast ON b.asset_id = ast.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.start_time DESC
  `);
  res.json(new ApiResponse(200, result.rows, 'Bookings retrieved'));
});

export const createBooking = asyncHandler(async (req, res) => {
  const { asset_id, start_time, end_time } = req.body;
  const user_id = req.user.id;

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

  // Maintenance request starts as Pending — does NOT flip asset status yet
  // Asset status flips to 'Under Maintenance' only when an Admin/Asset Manager APPROVES the request
  const result = await query(
    'INSERT INTO maintenance_requests (asset_id, requester_id, issue_description, priority) VALUES ($1, $2, $3, $4) RETURNING *',
    [asset_id, requester_id, issue_description, priority || 'Medium']
  );

  res.status(201).json(new ApiResponse(201, result.rows[0], 'Maintenance request created'));
});

export const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const ticket = await query('SELECT * FROM maintenance_requests WHERE id = $1', [id]);
  if (ticket.rows.length === 0) throw new ApiError(404, 'Maintenance request not found');

  await query('BEGIN');
  try {
    await query('UPDATE maintenance_requests SET status = $1 WHERE id = $2', [status, id]);

    // Update linked asset status based on workflow stage
    const assetId = ticket.rows[0].asset_id;
    if (status === 'Resolved') {
      await query("UPDATE assets SET status = 'Available' WHERE id = $1", [assetId]);
    } else if (['Approved', 'In Progress', 'Technician Assigned'].includes(status)) {
      // Asset flips to Under Maintenance only AFTER approval
      await query("UPDATE assets SET status = 'Under Maintenance' WHERE id = $1", [assetId]);
    }

    await query('COMMIT');
    res.json(new ApiResponse(200, { id, status }, 'Maintenance status updated'));
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
});
