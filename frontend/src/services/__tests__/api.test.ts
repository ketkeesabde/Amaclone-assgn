/**
 * Tests for API service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { CartItem, Cart, Order, Statistics } from '../../types';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('Client API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    it('should fetch cart successfully', async () => {
      const mockCart: Cart = {
        items: [],
        discountCode: null,
        appliedDiscount: 0,
      };

      mockedAxios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ data: mockCart }),
      }));

      // Re-import to get fresh axios instance
      const { clientApi: api } = await import('../api');
      const cart = await api.getCart('user1');

      expect(cart).toEqual(mockCart);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', async () => {
      const mockItem: CartItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      };

      const mockCart: Cart = {
        items: [mockItem],
        discountCode: null,
        appliedDiscount: 0,
      };

      mockedAxios.create = vi.fn(() => ({
        post: vi.fn().mockResolvedValue({
          data: { success: true, cart: mockCart },
        }),
      }));

      const { clientApi: api } = await import('../api');
      const cart = await api.addToCart('user1', mockItem);

      expect(cart.items).toContainEqual(mockItem);
    });
  });

  describe('updateCartQuantity', () => {
    it('should update cart quantity successfully', async () => {
      const mockCart: Cart = {
        items: [{ id: '1', name: 'Product', price: 100, quantity: 2 }],
        discountCode: null,
        appliedDiscount: 0,
      };

      mockedAxios.create = vi.fn(() => ({
        post: vi.fn().mockResolvedValue({
          data: { success: true, cart: mockCart },
        }),
      }));

      const { clientApi: api } = await import('../api');
      const cart = await api.updateCartQuantity('user1', '1', 1);

      expect(cart.items[0].quantity).toBe(2);
    });
  });

  describe('applyDiscount', () => {
    it('should apply discount code successfully', async () => {
      const mockCart: Cart = {
        items: [{ id: '1', name: 'Product', price: 100, quantity: 1 }],
        discountCode: 'DISCOUNT123',
        appliedDiscount: 10,
      };

      mockedAxios.create = vi.fn(() => ({
        post: vi.fn().mockResolvedValue({
          data: { success: true, cart: mockCart },
        }),
      }));

      const { clientApi: api } = await import('../api');
      const cart = await api.applyDiscount('user1', 'DISCOUNT123');

      expect(cart.discountCode).toBe('DISCOUNT123');
      expect(cart.appliedDiscount).toBe(10);
    });
  });

  describe('checkout', () => {
    it('should create order successfully', async () => {
      const mockOrder: Order = {
        id: 1,
        userId: 'user1',
        items: [{ id: '1', name: 'Product', price: 100, quantity: 1 }],
        subtotal: 100,
        discountCode: null,
        discount: 0,
        total: 100,
        createdAt: new Date().toISOString(),
      };

      mockedAxios.create = vi.fn(() => ({
        post: vi.fn().mockResolvedValue({
          data: { success: true, order: mockOrder },
        }),
      }));

      const { clientApi: api } = await import('../api');
      const order = await api.checkout('user1');

      expect(order.id).toBe(1);
      expect(order.total).toBe(100);
    });
  });
});

describe('Admin API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDiscountCode', () => {
    it('should generate discount code successfully', async () => {
      const mockCode = 'DISCOUNT1234567890';

      mockedAxios.create = vi.fn(() => ({
        post: vi.fn().mockResolvedValue({
          data: { success: true, code: mockCode },
        }),
      }));

      const { adminApi: api } = await import('../api');
      const code = await api.generateDiscountCode();

      expect(code).toBe(mockCode);
    });
  });

  describe('getStatistics', () => {
    it('should fetch statistics successfully', async () => {
      const mockStats: Statistics = {
        itemsPurchased: 10,
        totalPurchaseAmount: 1000,
        discountCodes: [],
        totalDiscountAmount: 0,
        totalOrders: 5,
      };

      mockedAxios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue({
          data: { success: true, data: mockStats },
        }),
      }));

      const { adminApi: api } = await import('../api');
      const stats = await api.getStatistics();

      expect(stats.totalOrders).toBe(5);
      expect(stats.itemsPurchased).toBe(10);
    });
  });
});
