import express from 'express';
import { 
  getDepartments, createDepartment, 
  getCategories, createCategory,
  getEmployees, updateEmployeeRole 
} from '../controllers/orgController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all org routes
router.use(protect);

router.route('/departments')
  .get(getDepartments)
  .post(admin, createDepartment);

router.route('/categories')
  .get(getCategories)
  .post(admin, createCategory);

router.route('/employees')
  .get(getEmployees);

router.route('/employees/:id/role')
  .put(admin, updateEmployeeRole);

export default router;
