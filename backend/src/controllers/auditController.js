import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @route   GET /api/audits
// @access  Private
export const getAudits = asyncHandler(async (req, res) => {
  const cycles = await query(`
    SELECT * FROM audit_cycles ORDER BY start_date DESC
  `);

  // For each cycle, get its items
  const auditsWithItems = await Promise.all(
    cycles.rows.map(async (cycle) => {
      const items = await query(`
        SELECT aa.*, a.asset_tag, a.name as asset_name, a.location as asset_location, u.name as auditor_name
        FROM asset_audits aa
        JOIN assets a ON aa.asset_id = a.id
        LEFT JOIN users u ON aa.auditor_id = u.id
        WHERE aa.cycle_id = $1
        ORDER BY aa.id ASC
      `, [cycle.id]);
      return {
        ...cycle,
        closed: cycle.status === 'Closed',
        items: items.rows,
      };
    })
  );

  res.json(new ApiResponse(200, auditsWithItems, 'Audits retrieved'));
});

// @route   POST /api/audits
// @access  Private/Admin
export const createAudit = asyncHandler(async (req, res) => {
  const { scope, start_date, end_date, asset_ids, auditor_id } = req.body;

  if (!start_date || !end_date) throw new ApiError(400, 'Start and end dates are required');

  await query('BEGIN');
  try {
    const cycleResult = await query(
      'INSERT INTO audit_cycles (scope, start_date, end_date) VALUES ($1, $2, $3) RETURNING *',
      [scope || 'General Audit', start_date, end_date]
    );
    const cycle = cycleResult.rows[0];

    // If asset_ids provided, create audit items for those assets
    // Otherwise, audit all assets
    let targetAssets;
    if (asset_ids && asset_ids.length > 0) {
      targetAssets = await query('SELECT id FROM assets WHERE id = ANY($1)', [asset_ids]);
    } else {
      targetAssets = await query('SELECT id FROM assets');
    }

    for (const asset of targetAssets.rows) {
      await query(
        'INSERT INTO asset_audits (cycle_id, asset_id, auditor_id) VALUES ($1, $2, $3)',
        [cycle.id, asset.id, auditor_id || null]
      );
    }

    await query('COMMIT');
    res.status(201).json(new ApiResponse(201, cycle, 'Audit cycle created'));
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
});

// @route   PUT /api/audits/:id/close
// @access  Private/Admin
export const closeAudit = asyncHandler(async (req, res) => {
  const result = await query(
    `UPDATE audit_cycles SET status = 'Closed' WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Audit cycle not found');
  res.json(new ApiResponse(200, result.rows[0], 'Audit cycle closed'));
});

// @route   PUT /api/audits/:cycleId/items/:itemId
// @access  Private
export const updateAuditItem = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const result = await query(
    `UPDATE asset_audits SET status = $1, notes = COALESCE($2, notes), audit_date = NOW() WHERE id = $3 AND cycle_id = $4 RETURNING *`,
    [status, notes || null, req.params.itemId, req.params.cycleId]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Audit item not found');
  res.json(new ApiResponse(200, result.rows[0], 'Audit item updated'));
});
