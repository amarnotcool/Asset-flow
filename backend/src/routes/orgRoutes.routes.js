import express from 'express';
import { 
  getDepartments, createDepartment, 
  getCategories, createCategory,
  getEmployees, updateEmployeeRole 
} from '../controllers/orgController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all org routes
router.use(protect);

router.route('/departments')
  .get(getDepartments)
  .post(authorizeRoles('Admin'), createDepartment);

router.route('/categories')
  .get(getCategories)
  .post(authorizeRoles('Admin', 'Asset Manager'), createCategory);

router.route('/employees')
  .get(getEmployees);

router.route('/employees/:id/role')
  .put(authorizeRoles('Admin'), updateEmployeeRole);

export default router;
