/**
 * Unit tests for clientController.ts
 */

import { Request, Response } from 'express';
import * as clientController from '../clientController';
import * as store from '../../data/store';

// Mock the store module
jest.mock('../../data/store');

const mockStore = store as jest.Mocked<typeof store>;

describe('Client Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonResponse: jest.Mock;
  let statusResponse: jest.Mock;

  beforeEach(() => {
    jsonResponse = jest.fn();
    statusResponse = jest.fn().mockReturnValue({ json: jsonResponse });
    
    mockResponse = {
      json: jsonResponse,
      status: statusResponse,
    };

    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', () => {
      const mockCart = {
        items: [{ id: '1', name: 'Test Product', price: 100, quantity: 1 }],
        discountCode: null,
        appliedDiscount: 0,
      };

      mockRequest = {
        body: {
          userId: 'user1',
          item: { id: '1', name: 'Test Product', price: 100, quantity: 1 },
        },
      };

      mockStore.addToCart.mockReturnValue(mockCart);

      clientController.addToCart(mockRequest as Request, mockResponse as Response);

      expect(mockStore.addToCart).toHaveBeenCalledWith('user1', {
        id: '1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      });
      expect(jsonResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Item added to cart',
        cart: mockCart,
      });
    });

    it('should return 400 error if userId is missing', () => {
      mockRequest = {
        body: {
          item: { id: '1', name: 'Test Product', price: 100, quantity: 1 },
        },
      };

      clientController.addToCart(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'userId is required' });
      expect(mockStore.addToCart).not.toHaveBeenCalled();
    });

    it('should return 400 error if item is missing', () => {
      mockRequest = {
        body: {
          userId: 'user1',
        },
      };

      clientController.addToCart(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({
        error: 'Item must have id, name, and price',
      });
    });

    it('should return 500 error on store error', () => {
      mockRequest = {
        body: {
          userId: 'user1',
          item: { id: '1', name: 'Test Product', price: 100, quantity: 1 },
        },
      };

      mockStore.addToCart.mockImplementation(() => {
        throw new Error('Store error');
      });

      clientController.addToCart(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(500);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'Store error' });
    });
  });

  describe('getCart', () => {
    it('should return cart successfully', () => {
      const mockCart = {
        items: [],
        discountCode: null,
        appliedDiscount: 0,
      };

      mockRequest = {
        query: { userId: 'user1' },
      };

      mockStore.getCart.mockReturnValue(mockCart);

      clientController.getCart(mockRequest as Request, mockResponse as Response);

      expect(mockStore.getCart).toHaveBeenCalledWith('user1');
      expect(jsonResponse).toHaveBeenCalledWith(mockCart);
    });

    it('should return 400 error if userId is missing', () => {
      mockRequest = {
        query: {},
      };

      clientController.getCart(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'userId is required' });
    });

    it('should return 500 error on store error', () => {
      mockRequest = {
        query: { userId: 'user1' },
      };

      mockStore.getCart.mockImplementation(() => {
        throw new Error('Store error');
      });

      clientController.getCart(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(500);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'Store error' });
    });
  });

  describe('applyDiscount', () => {
    it('should apply discount code successfully', () => {
      const mockCart = {
        items: [{ id: '1', name: 'Test Product', price: 100, quantity: 1 }],
        discountCode: 'DISCOUNT123',
        appliedDiscount: 10,
      };

      mockRequest = {
        body: {
          userId: 'user1',
          discountCode: 'DISCOUNT123',
        },
      };

      mockStore.applyDiscountCode.mockReturnValue(mockCart);

      clientController.applyDiscount(mockRequest as Request, mockResponse as Response);

      expect(mockStore.applyDiscountCode).toHaveBeenCalledWith('user1', 'DISCOUNT123');
      expect(jsonResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Discount code applied successfully',
        cart: mockCart,
      });
    });

    it('should return 400 error if userId is missing', () => {
      mockRequest = {
        body: {
          discountCode: 'DISCOUNT123',
        },
      };

      clientController.applyDiscount(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({
        error: 'userId and discountCode are required',
      });
    });

    it('should return 400 error if discount code is invalid', () => {
      mockRequest = {
        body: {
          userId: 'user1',
          discountCode: 'INVALID',
        },
      };

      mockStore.applyDiscountCode.mockImplementation(() => {
        throw new Error('Invalid discount code');
      });

      clientController.applyDiscount(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'Invalid discount code' });
    });
  });

  describe('updateCartQuantity', () => {
    it('should update cart quantity successfully', () => {
      const mockCart = {
        items: [{ id: '1', name: 'Test Product', price: 100, quantity: 2 }],
        discountCode: null,
        appliedDiscount: 0,
      };

      mockRequest = {
        body: {
          userId: 'user1',
          itemId: '1',
          quantityChange: 1,
        },
      };

      mockStore.updateCartItemQuantity.mockReturnValue(mockCart);

      clientController.updateCartQuantity(mockRequest as Request, mockResponse as Response);

      expect(mockStore.updateCartItemQuantity).toHaveBeenCalledWith('user1', '1', 1);
      expect(jsonResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Cart updated successfully',
        cart: mockCart,
      });
    });

    it('should return 400 error if required fields are missing', () => {
      mockRequest = {
        body: {
          userId: 'user1',
        },
      };

      clientController.updateCartQuantity(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({
        error: 'userId, itemId, and quantityChange are required',
      });
    });

    it('should return 400 error if item not found', () => {
      mockRequest = {
        body: {
          userId: 'user1',
          itemId: 'nonexistent',
          quantityChange: 1,
        },
      };

      mockStore.updateCartItemQuantity.mockImplementation(() => {
        throw new Error('Item not found in cart');
      });

      clientController.updateCartQuantity(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'Item not found in cart' });
    });
  });

  describe('checkout', () => {
    it('should create order successfully', () => {
      const mockOrder = {
        id: 1,
        userId: 'user1',
        items: [{ id: '1', name: 'Test Product', price: 100, quantity: 1 }],
        subtotal: 100,
        discountCode: null,
        discount: 0,
        total: 100,
        createdAt: new Date(),
      };

      mockRequest = {
        body: {
          userId: 'user1',
        },
      };

      mockStore.createOrder.mockReturnValue(mockOrder);

      clientController.checkout(mockRequest as Request, mockResponse as Response);

      expect(mockStore.createOrder).toHaveBeenCalledWith('user1');
      expect(jsonResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Order placed successfully',
        order: mockOrder,
      });
    });

    it('should return 400 error if userId is missing', () => {
      mockRequest = {
        body: {},
      };

      clientController.checkout(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'userId is required' });
    });

    it('should return 400 error if cart is empty', () => {
      mockRequest = {
        body: {
          userId: 'user1',
        },
      };

      mockStore.createOrder.mockImplementation(() => {
        throw new Error('Cart is empty');
      });

      clientController.checkout(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'Cart is empty' });
    });
  });
});
