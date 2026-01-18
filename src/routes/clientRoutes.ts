/**
 * Client API Routes
 */

import express, { Router } from 'express';
import * as clientController from '../controllers/clientController';

const router: Router = express.Router();

// Cart routes
router.get('/cart', clientController.getCart);
router.post('/cart/add', clientController.addToCart);
router.post('/cart/update-quantity', clientController.updateCartQuantity);
router.post('/cart/apply-discount', clientController.applyDiscount);

// Checkout route
router.post('/checkout', clientController.checkout);

export default router;
