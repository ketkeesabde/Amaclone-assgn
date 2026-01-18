/**
 * Tests for Checkout page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '../Checkout';
import * as api from '../../services/api';

// Mock the API
vi.mock('../../services/api');
const mockedApi = api as any;

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should display loading state initially', () => {
    mockedApi.clientApi = {
      getCart: vi.fn(() => new Promise(() => {})), // Never resolves
    };

    renderWithRouter(<Checkout />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display empty state when cart is empty', async () => {
    mockedApi.clientApi = {
      getCart: vi.fn().mockResolvedValue({
        items: [],
        discountCode: null,
        appliedDiscount: 0,
      }),
    };

    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  it('should display order summary when cart has items', async () => {
    mockedApi.clientApi = {
      getCart: vi.fn().mockResolvedValue({
        items: [
          { id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 },
        ],
        discountCode: null,
        appliedDiscount: 0,
      }),
    };

    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    });
  });

  it('should display order totals correctly', async () => {
    mockedApi.clientApi = {
      getCart: vi.fn().mockResolvedValue({
        items: [
          { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
        ],
        discountCode: null,
        appliedDiscount: 0,
      }),
    };

    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  it('should display discount when applied', async () => {
    mockedApi.clientApi = {
      getCart: vi.fn().mockResolvedValue({
        items: [
          { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
        ],
        discountCode: 'DISCOUNT123',
        appliedDiscount: 10,
      }),
    };

    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText(/DISCOUNT123/)).toBeInTheDocument();
      expect(screen.getByText(/-10.00/)).toBeInTheDocument();
      expect(screen.getByText('$90.00')).toBeInTheDocument(); // Total after discount
    });
  });

  it('should create order when place order button is clicked', async () => {
    const mockOrder = {
      id: 1,
      userId: 'user1',
      items: [{ id: '1', name: 'Laptop Pro', price: 100, quantity: 1 }],
      subtotal: 100,
      discountCode: null,
      discount: 0,
      total: 100,
      createdAt: new Date().toISOString(),
    };

    mockedApi.clientApi = {
      getCart: vi.fn().mockResolvedValue({
        items: [
          { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
        ],
        discountCode: null,
        appliedDiscount: 0,
      }),
      checkout: vi.fn().mockResolvedValue(mockOrder),
    };

    const user = userEvent.setup();
    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    await waitFor(() => {
      expect(mockedApi.clientApi.checkout).toHaveBeenCalledWith('user1');
    });
  });

  it('should display order confirmation after successful checkout', async () => {
    const mockOrder = {
      id: 1,
      userId: 'user1',
      items: [{ id: '1', name: 'Laptop Pro', price: 100, quantity: 1 }],
      subtotal: 100,
      discountCode: null,
      discount: 0,
      total: 100,
      createdAt: new Date().toISOString(),
    };

    mockedApi.clientApi = {
      getCart: vi.fn().mockResolvedValue({
        items: [
          { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
        ],
        discountCode: null,
        appliedDiscount: 0,
      }),
      checkout: vi.fn().mockResolvedValue(mockOrder),
    };

    const user = userEvent.setup();
    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    await waitFor(() => {
      expect(screen.getByText('Order Confirmed! 🎉')).toBeInTheDocument();
      expect(screen.getByText(/#1/)).toBeInTheDocument();
    });
  });

  it('should navigate to home after successful checkout', async () => {
    const mockOrder = {
      id: 1,
      userId: 'user1',
      items: [{ id: '1', name: 'Laptop Pro', price: 100, quantity: 1 }],
      subtotal: 100,
      discountCode: null,
      discount: 0,
      total: 100,
      createdAt: new Date().toISOString(),
    };

    mockedApi.clientApi = {
      getCart: vi.fn().mockResolvedValue({
        items: [
          { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
        ],
        discountCode: null,
        appliedDiscount: 0,
      }),
      checkout: vi.fn().mockResolvedValue(mockOrder),
    };

    const user = userEvent.setup();
    vi.useFakeTimers();
    
    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    await waitFor(() => {
      expect(screen.getByText('Order Confirmed! 🎉')).toBeInTheDocument();
    });

    // Fast forward 3 seconds
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    vi.useRealTimers();
  });
});
