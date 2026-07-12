import express from 'express';
import { 
  getAllocations, allocateAsset, 
  getBookings, createBooking,
  getMaintenanceRequests, createMaintenanceRequest
} from '../controllers/operationsController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/allocations')
  .get(getAllocations)
  .post(authorizeRoles('Admin', 'Asset Manager'), allocateAsset);

router.route('/bookings')
  .get(getBookings)
  .post(createBooking); // Any logged in user can book

router.route('/maintenance')
  .get(getMaintenanceRequests)
  .post(createMaintenanceRequest);

export default router;
