/**
 * API Service for communicating with backend
 */

import axios from 'axios';
import { Cart, CartItem, Order, Statistics, ApiResponse } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Client API calls
 */
export const clientApi = {
  /**
   * Get cart by userId
   */
  getCart: async (userId: string): Promise<Cart> => {
    const response = await api.get<Cart>(`/client/cart?userId=${userId}`);
    return response.data;
  },

  /**
   * Add item to cart
   */
  addToCart: async (userId: string, item: CartItem): Promise<Cart> => {
    const response = await api.post<ApiResponse<Cart>>('/client/cart/add', {
      userId,
      item,
    });
    return response.data.cart || response.data.data!;
  },

  /**
   * Update cart item quantity
   */
  updateCartQuantity: async (userId: string, itemId: string, quantityChange: number): Promise<Cart> => {
    const response = await api.post<ApiResponse<Cart>>('/client/cart/update-quantity', {
      userId,
      itemId,
      quantityChange,
    });
    return response.data.cart || response.data.data!;
  },

  /**
   * Apply discount code to cart
   */
  applyDiscount: async (userId: string, discountCode: string): Promise<Cart> => {
    const response = await api.post<ApiResponse<Cart>>('/client/cart/apply-discount', {
      userId,
      discountCode,
    });
    return response.data.cart || response.data.data!;
  },

  /**
   * Checkout and create order
   */
  checkout: async (userId: string): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>('/client/checkout', {
      userId,
    });
    return response.data.order || response.data.data!;
  },
};

/**
 * Admin API calls
 */
export const adminApi = {
  /**
   * Generate discount code
   */
  generateDiscountCode: async (): Promise<string> => {
    const response = await api.post<ApiResponse<string>>('/admin/generate-discount-code');
    return response.data.code || '';
  },

  /**
   * Get statistics
   */
  getStatistics: async (): Promise<Statistics> => {
    const response = await api.get<ApiResponse<Statistics>>('/admin/statistics');
    return response.data.data!;
  },
};

export default api;
