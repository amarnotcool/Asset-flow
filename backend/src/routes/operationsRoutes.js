import express from 'express';
import { 
  getAllocations, allocateAsset, 
  getBookings, createBooking,
  getMaintenanceRequests, createMaintenanceRequest
} from '../controllers/operationsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/allocations')
  .get(getAllocations)
  .post(admin, allocateAsset);

router.route('/bookings')
  .get(getBookings)
  .post(createBooking); // Any logged in user can book

router.route('/maintenance')
  .get(getMaintenanceRequests)
  .post(createMaintenanceRequest);

export default router;
