import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @route   GET /api/assets
// @access  Private
export const getAssets = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT a.*, 
           ac.name as category_name,
           u.name as holder_name
    FROM assets a
    LEFT JOIN asset_categories ac ON a.category_id = ac.id
    LEFT JOIN users u ON a.holder_id = u.id
    ORDER BY a.id DESC
  `);
  res.json(new ApiResponse(200, result.rows, 'Assets retrieved'));
});

// @route   POST /api/assets
// @access  Private/Admin,AssetManager
export const registerAsset = asyncHandler(async (req, res) => {
  const { name, category_id, serial_number, acquisition_date, acquisition_cost, condition, location } = req.body;

  if (!name) throw new ApiError(400, 'Asset name is required');

  // Auto-generate asset tag
  const countResult = await query('SELECT COUNT(*) FROM assets');
  const count = parseInt(countResult.rows[0].count) + 1;
  const asset_tag = `AF-${String(count).padStart(4, '0')}`;

  const result = await query(
    `INSERT INTO assets (asset_tag, name, category_id, serial_number, acquisition_date, acquisition_cost, condition, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [asset_tag, name, category_id || null, serial_number || null, acquisition_date || null, acquisition_cost || null, condition || 'New', location || null]
  );

  // Fetch with joins for response
  const full = await query(`
    SELECT a.*, ac.name as category_name, u.name as holder_name
    FROM assets a
    LEFT JOIN asset_categories ac ON a.category_id = ac.id
    LEFT JOIN users u ON a.holder_id = u.id
    WHERE a.id = $1
  `, [result.rows[0].id]);

  res.status(201).json(new ApiResponse(201, full.rows[0], 'Asset registered'));
});

// @route   PUT /api/assets/:id
// @access  Private/Admin,AssetManager
export const updateAsset = asyncHandler(async (req, res) => {
  const { name, category_id, serial_number, condition, location, status } = req.body;

  const result = await query(
    `UPDATE assets 
     SET name = COALESCE($1, name),
         category_id = COALESCE($2, category_id),
         serial_number = COALESCE($3, serial_number),
         condition = COALESCE($4, condition),
         location = COALESCE($5, location),
         status = COALESCE($6, status)
     WHERE id = $7 RETURNING *`,
    [name, category_id, serial_number, condition, location, status, req.params.id]
  );

  if (result.rows.length === 0) throw new ApiError(404, 'Asset not found');

  res.json(new ApiResponse(200, result.rows[0], 'Asset updated'));
});

// @route   PUT /api/assets/:id/return
// @access  Private
export const returnAsset = asyncHandler(async (req, res) => {
  await query('BEGIN');
  try {
    // Update asset
    const assetResult = await query(
      `UPDATE assets SET status = 'Available', holder_id = NULL WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (assetResult.rows.length === 0) {
      await query('ROLLBACK');
      throw new ApiError(404, 'Asset not found');
    }

    // Close active allocation
    await query(
      `UPDATE asset_allocations SET status = 'Returned', returned_date = NOW() WHERE asset_id = $1 AND status = 'Active'`,
      [req.params.id]
    );

    await query('COMMIT');
    res.json(new ApiResponse(200, assetResult.rows[0], 'Asset returned successfully'));
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
});
