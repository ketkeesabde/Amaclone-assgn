/**
 * Admin API Routes
 */

import express, { Router } from 'express';
import * as adminController from '../controllers/adminController';

const router: Router = express.Router();

// Admin routes
router.post('/generate-discount-code', adminController.generateDiscountCode);
router.get('/statistics', adminController.getStatistics);

export default router;
