import express from 'express';
import { getAudits, createAudit, closeAudit, updateAuditItem } from '../controllers/auditController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAudits)
  .post(authorizeRoles('Admin'), createAudit);

router.route('/:id/close')
  .put(authorizeRoles('Admin'), closeAudit);

router.route('/:cycleId/items/:itemId')
  .put(updateAuditItem);

export default router;
