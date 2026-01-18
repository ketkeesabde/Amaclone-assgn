/**
 * Tests for API service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartItem, Cart, Order, Statistics } from '../../types';

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('Client API', () => {
  let mockAxiosInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked axios instance
    const axiosModule = await import('axios');
    mockAxiosInstance = (axiosModule.default as any).create();
  });

  describe('getCart', () => {
    it('should fetch cart successfully', async () => {
      const mockCart: Cart = {
        items: [],
        discountCode: null,
        appliedDiscount: 0,
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockCart });

      const { clientApi } = await import('../api');
      const cart = await clientApi.getCart('user1');

      expect(cart).toEqual(mockCart);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/client/cart?userId=user1');
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

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, cart: mockCart },
      });

      const { clientApi } = await import('../api');
      const cart = await clientApi.addToCart('user1', mockItem);

      expect(cart.items).toContainEqual(mockItem);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/client/cart/add', {
        userId: 'user1',
        item: mockItem,
      });
    });
  });

  describe('updateCartQuantity', () => {
    it('should update cart quantity successfully', async () => {
      const mockCart: Cart = {
        items: [{ id: '1', name: 'Product', price: 100, quantity: 2 }],
        discountCode: null,
        appliedDiscount: 0,
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, cart: mockCart },
      });

      const { clientApi } = await import('../api');
      const cart = await clientApi.updateCartQuantity('user1', '1', 1);

      expect(cart.items[0].quantity).toBe(2);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/client/cart/update-quantity', {
        userId: 'user1',
        itemId: '1',
        quantityChange: 1,
      });
    });
  });

  describe('applyDiscount', () => {
    it('should apply discount code successfully', async () => {
      const mockCart: Cart = {
        items: [{ id: '1', name: 'Product', price: 100, quantity: 1 }],
        discountCode: 'DISCOUNT123',
        appliedDiscount: 10,
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, cart: mockCart },
      });

      const { clientApi } = await import('../api');
      const cart = await clientApi.applyDiscount('user1', 'DISCOUNT123');

      expect(cart.discountCode).toBe('DISCOUNT123');
      expect(cart.appliedDiscount).toBe(10);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/client/cart/apply-discount', {
        userId: 'user1',
        discountCode: 'DISCOUNT123',
      });
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

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, order: mockOrder },
      });

      const { clientApi } = await import('../api');
      const order = await clientApi.checkout('user1');

      expect(order.id).toBe(1);
      expect(order.total).toBe(100);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/client/checkout', {
        userId: 'user1',
      });
    });
  });
});

describe('Admin API', () => {
  let mockAxiosInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const axiosModule = await import('axios');
    mockAxiosInstance = (axiosModule.default as any).create();
  });

  describe('generateDiscountCode', () => {
    it('should generate discount code successfully', async () => {
      const mockCode = 'DISCOUNT1234567890';

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, code: mockCode },
      });

      const { adminApi } = await import('../api');
      const code = await adminApi.generateDiscountCode();

      expect(code).toBe(mockCode);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/admin/generate-discount-code');
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

      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true, data: mockStats },
      });

      const { adminApi } = await import('../api');
      const stats = await adminApi.getStatistics();

      expect(stats.totalOrders).toBe(5);
      expect(stats.itemsPurchased).toBe(10);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/statistics');
    });
  });
});
