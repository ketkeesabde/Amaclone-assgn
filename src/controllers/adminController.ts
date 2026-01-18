/**
 * Admin API Controllers
 * Handles discount code generation and statistics
 */

import { Request, Response } from 'express';
import * as store from '../data/store';

/**
 * Generate discount code (only if nth order condition is satisfied)
 * POST /api/admin/generate-discount-code
 */
export const generateDiscountCode = (_req: Request, res: Response): void => {
  try {
    const code = store.generateDiscountCode();
    res.json({
      success: true,
      message: 'Discount code generated successfully',
      code,
      note: `This code is generated every ${store.NTH_ORDER} orders`
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get statistics
 * GET /api/admin/statistics
 */
export const getStatistics = (_req: Request, res: Response): void => {
  try {
    const stats = store.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
