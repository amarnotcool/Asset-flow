import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// --- DEPARTMENTS ---

// @route   GET /api/org/departments
// @access  Private
export const getDepartments = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT d.*, u.name as head_name, pd.name as parent_name 
    FROM departments d
    LEFT JOIN users u ON d.department_head_id = u.id
    LEFT JOIN departments pd ON d.parent_id = pd.id
    ORDER BY d.id ASC
  `);
  res.json(new ApiResponse(200, result.rows, 'Departments retrieved successfully'));
});

// @route   POST /api/org/departments
// @access  Private/Admin
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, parent_id, department_head_id } = req.body;
  if (!name) throw new ApiError(400, 'Department name is required');

  const result = await query(
    'INSERT INTO departments (name, parent_id, department_head_id) VALUES ($1, $2, $3) RETURNING *',
    [name, parent_id || null, department_head_id || null]
  );
  res.status(201).json(new ApiResponse(201, result.rows[0], 'Department created'));
});

// --- CATEGORIES ---

// @route   GET /api/org/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM asset_categories ORDER BY id ASC');
  res.json(new ApiResponse(200, result.rows, 'Categories retrieved'));
});

// @route   POST /api/org/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw new ApiError(400, 'Category name is required');

  const result = await query(
    'INSERT INTO asset_categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null]
  );
  res.status(201).json(new ApiResponse(201, result.rows[0], 'Category created'));
});

// --- EMPLOYEES ---

// @route   GET /api/org/employees
// @access  Private
export const getEmployees = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT u.id, u.name, u.email, u.role, u.status, d.name as department_name, u.department_id 
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    ORDER BY u.id ASC
  `);
  res.json(new ApiResponse(200, result.rows, 'Employees retrieved'));
});

// @route   PUT /api/org/employees/:id/role
// @access  Private/Admin
export const updateEmployeeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) throw new ApiError(400, 'Role is required');

  const result = await query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, status',
    [role, req.params.id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Employee not found');
  }

  res.json(new ApiResponse(200, result.rows[0], 'Employee role updated'));
});
