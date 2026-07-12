import express from 'express';
import { getAssets, registerAsset, updateAsset, returnAsset } from '../controllers/assetController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAssets)
  .post(authorizeRoles('Admin', 'Asset Manager'), registerAsset);

router.route('/:id')
  .put(authorizeRoles('Admin', 'Asset Manager'), updateAsset);

router.route('/:id/return')
  .put(authorizeRoles('Admin', 'Asset Manager'), returnAsset);

export default router;
