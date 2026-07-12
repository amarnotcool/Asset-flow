import express from 'express';
import { 
  getAllocations, allocateAsset, 
  getTransfers, createTransfer,
  getBookings, createBooking,
  getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceStatus
} from '../controllers/operationsController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/allocations')
  .get(getAllocations)
  .post(authorizeRoles('Admin', 'Asset Manager'), allocateAsset);

router.route('/transfers')
  .get(getTransfers)
  .post(authorizeRoles('Admin', 'Asset Manager'), createTransfer);

router.route('/bookings')
  .get(getBookings)
  .post(createBooking);

router.route('/maintenance')
  .get(getMaintenanceRequests)
  .post(createMaintenanceRequest);

router.route('/maintenance/:id/status')
  .put(authorizeRoles('Admin', 'Asset Manager'), updateMaintenanceStatus);

export default router;
