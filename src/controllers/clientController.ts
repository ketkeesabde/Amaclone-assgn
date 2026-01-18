/**
 * Client API Controllers
 * Handles cart and checkout operations
 */

import { Request, Response } from 'express';
import * as store from '../data/store';
import { AddToCartRequest, ApplyDiscountRequest, CheckoutRequest } from '../types';

/**
 * Add item to cart
 * POST /api/client/cart/add
 */
export const addToCart = (req: Request, res: Response): void => {
  try {
    const { userId, item } = req.body as AddToCartRequest;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    
    if (!item || !item.id || !item.name || item.price === undefined) {
      res.status(400).json({ error: 'Item must have id, name, and price' });
      return;
    }
    
    const cart = store.addToCart(userId, item);
    res.json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get cart
 * GET /api/client/cart
 */
export const getCart = (req: Request, res: Response): void => {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    
    const cart = store.getCart(userId);
    res.json(cart);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

/**
 * Apply discount code to cart
 * POST /api/client/cart/apply-discount
 */
export const applyDiscount = (req: Request, res: Response): void => {
  try {
    const { userId, discountCode } = req.body as ApplyDiscountRequest;
    
    if (!userId || !discountCode) {
      res.status(400).json({ error: 'userId and discountCode are required' });
      return;
    }
    
    const cart = store.applyDiscountCode(userId, discountCode);
    res.json({
      success: true,
      message: 'Discount code applied successfully',
      cart
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

/**
 * Update cart item quantity
 * POST /api/client/cart/update-quantity
 */
export const updateCartQuantity = (req: Request, res: Response): void => {
  try {
    const { userId, itemId, quantityChange } = req.body;
    
    if (!userId || !itemId || quantityChange === undefined) {
      res.status(400).json({ error: 'userId, itemId, and quantityChange are required' });
      return;
    }
    
    const cart = store.updateCartItemQuantity(userId, itemId, quantityChange);
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

/**
 * Checkout and create order
 * POST /api/client/checkout
 */
export const checkout = (req: Request, res: Response): void => {
  try {
    const { userId } = req.body as CheckoutRequest;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    
    const order = store.createOrder(userId);
    res.json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
