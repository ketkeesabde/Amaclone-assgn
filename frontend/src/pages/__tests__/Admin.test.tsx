/**
 * Tests for Admin page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Admin from '../Admin';

// Mock the API
vi.mock('../../services/api', () => ({
  adminApi: {
    getStatistics: vi.fn(),
    generateDiscountCode: vi.fn(),
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Admin', () => {
  let adminApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const apiModule = await import('../../services/api');
    adminApi = apiModule.adminApi;
  });

  it('should display loading state initially', () => {
    adminApi.getStatistics.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<Admin />);
    expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
  });

  it('should display statistics when loaded', async () => {
    const mockStats = {
      itemsPurchased: 15,
      totalPurchaseAmount: 1500,
      discountCodes: [
        { code: 'DISCOUNT1', isUsed: true, createdAt: new Date().toISOString() },
        { code: 'DISCOUNT2', isUsed: false, createdAt: new Date().toISOString() },
      ],
      totalDiscountAmount: 150,
      totalOrders: 10,
    };

    adminApi.getStatistics.mockResolvedValue(mockStats);

    renderWithRouter(<Admin />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('10')).toBeInTheDocument(); // Total Orders
    expect(screen.getByText('15')).toBeInTheDocument(); // Items Purchased
  });

  it('should display discount codes list', async () => {
    const mockStats = {
      itemsPurchased: 10,
      totalPurchaseAmount: 1000,
      discountCodes: [
        { code: 'DISCOUNT123', isUsed: true, createdAt: new Date().toISOString() },
        { code: 'DISCOUNT456', isUsed: false, createdAt: new Date().toISOString() },
      ],
      totalDiscountAmount: 100,
      totalOrders: 5,
    };

    adminApi.getStatistics.mockResolvedValue(mockStats);

    renderWithRouter(<Admin />);
    
    await waitFor(() => {
      expect(screen.getByText('DISCOUNT123')).toBeInTheDocument();
      expect(screen.getByText('DISCOUNT456')).toBeInTheDocument();
    });

    expect(screen.getByText('Used')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should generate discount code when button is clicked', async () => {
    const mockStats = {
      itemsPurchased: 10,
      totalPurchaseAmount: 1000,
      discountCodes: [],
      totalDiscountAmount: 0,
      totalOrders: 5,
    };

    adminApi.getStatistics.mockResolvedValue(mockStats);
    adminApi.generateDiscountCode.mockResolvedValue('DISCOUNT789');

    const user = userEvent.setup();
    renderWithRouter(<Admin />);
    
    await waitFor(() => {
      expect(screen.getByText('Generate Discount Code')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Discount Code');
    await user.click(generateButton);

    await waitFor(() => {
      expect(adminApi.generateDiscountCode).toHaveBeenCalled();
    });
  });

  it('should display success message after generating discount code', async () => {
    const mockStats = {
      itemsPurchased: 10,
      totalPurchaseAmount: 1000,
      discountCodes: [],
      totalDiscountAmount: 0,
      totalOrders: 5,
    };

    adminApi.getStatistics.mockResolvedValue(mockStats);
    adminApi.generateDiscountCode.mockResolvedValue('DISCOUNT789');

    const user = userEvent.setup();
    renderWithRouter(<Admin />);
    
    await waitFor(() => {
      expect(screen.getByText('Generate Discount Code')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Discount Code');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Discount code generated: DISCOUNT789/)).toBeInTheDocument();
    });
  });

  it('should display error message when generation fails', async () => {
    const mockStats = {
      itemsPurchased: 10,
      totalPurchaseAmount: 1000,
      discountCodes: [],
      totalDiscountAmount: 0,
      totalOrders: 3, // Not a multiple of 5
    };

    adminApi.getStatistics.mockResolvedValue(mockStats);
    adminApi.generateDiscountCode.mockRejectedValue(new Error('Condition not met'));

    const user = userEvent.setup();
    renderWithRouter(<Admin />);
    
    await waitFor(() => {
      expect(screen.getByText('Generate Discount Code')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Discount Code');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Condition not met/)).toBeInTheDocument();
    });
  });

  it('should display empty state when no statistics available', async () => {
    adminApi.getStatistics.mockResolvedValue(null);

    renderWithRouter(<Admin />);
    
    await waitFor(() => {
      expect(screen.getByText('No statistics available')).toBeInTheDocument();
    });
  });
});
