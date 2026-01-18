/**
 * Unit tests for adminController.ts
 */

import { Request, Response } from 'express';
import * as adminController from '../adminController';
import * as store from '../../data/store';

// Mock the store module
jest.mock('../../data/store');

const mockStore = store as jest.Mocked<typeof store>;

describe('Admin Controller', () => {
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

  describe('generateDiscountCode', () => {
    it('should generate discount code successfully', () => {
      const mockCode = 'DISCOUNT1234567890';

      mockRequest = {
        body: {},
      };

      mockStore.generateDiscountCode.mockReturnValue(mockCode);
      // NTH_ORDER is a const, we can't modify it, but we can use its value
      const nthOrder = mockStore.NTH_ORDER;

      adminController.generateDiscountCode(mockRequest as Request, mockResponse as Response);

      expect(mockStore.generateDiscountCode).toHaveBeenCalled();
      expect(jsonResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Discount code generated successfully',
        code: mockCode,
        note: `This code is generated every ${nthOrder} orders`,
      });
    });

    it('should return 400 error when nth order condition is not met', () => {
      mockRequest = {
        body: {},
      };

      const errorMessage = 'Discount code can only be generated every 5 orders. Current order count: 3';
      mockStore.generateDiscountCode.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      adminController.generateDiscountCode(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(400);
      expect(jsonResponse).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getStatistics', () => {
    it('should return statistics successfully', () => {
      const mockStatistics = {
        itemsPurchased: 15,
        totalPurchaseAmount: 1500,
        discountCodes: [
          {
            code: 'DISCOUNT123',
            isUsed: true,
            createdAt: new Date(),
          },
          {
            code: 'DISCOUNT456',
            isUsed: false,
            createdAt: new Date(),
          },
        ],
        totalDiscountAmount: 150,
        totalOrders: 10,
      };

      mockRequest = {};

      mockStore.getStatistics.mockReturnValue(mockStatistics);

      adminController.getStatistics(mockRequest as Request, mockResponse as Response);

      expect(mockStore.getStatistics).toHaveBeenCalled();
      expect(jsonResponse).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics,
      });
    });

    it('should return 500 error on store error', () => {
      mockRequest = {};

      mockStore.getStatistics.mockImplementation(() => {
        throw new Error('Store error');
      });

      adminController.getStatistics(mockRequest as Request, mockResponse as Response);

      expect(statusResponse).toHaveBeenCalledWith(500);
      expect(jsonResponse).toHaveBeenCalledWith({ error: 'Store error' });
    });

    it('should return statistics with empty data', () => {
      const mockStatistics = {
        itemsPurchased: 0,
        totalPurchaseAmount: 0,
        discountCodes: [],
        totalDiscountAmount: 0,
        totalOrders: 0,
      };

      mockRequest = {};

      mockStore.getStatistics.mockReturnValue(mockStatistics);

      adminController.getStatistics(mockRequest as Request, mockResponse as Response);

      expect(jsonResponse).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics,
      });
    });
  });
});
