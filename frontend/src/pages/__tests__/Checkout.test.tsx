/**
 * Tests for Checkout page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '../Checkout';

// Mock the API
vi.mock('../../services/api', () => ({
  clientApi: {
    getCart: vi.fn(),
    checkout: vi.fn(),
  },
}));

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
  let clientApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    const apiModule = await import('../../services/api');
    clientApi = apiModule.clientApi;
  });

  it('should display loading state initially', () => {
    clientApi.getCart.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<Checkout />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display empty state when cart is empty', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [],
      discountCode: null,
      appliedDiscount: 0,
    });

    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  it('should display order summary when cart has items', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [
        { id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 },
      ],
      discountCode: null,
      appliedDiscount: 0,
    });

    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    });
  });

  it('should display order totals correctly', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [
        { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
      ],
      discountCode: null,
      appliedDiscount: 0,
    });

    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  it('should display discount when applied', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [
        { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
      ],
      discountCode: 'DISCOUNT123',
      appliedDiscount: 10,
    });

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

    clientApi.getCart.mockResolvedValue({
      items: [
        { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
      ],
      discountCode: null,
      appliedDiscount: 0,
    });

    clientApi.checkout.mockResolvedValue(mockOrder);

    const user = userEvent.setup();
    renderWithRouter(<Checkout />);
    
    await waitFor(() => {
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    await waitFor(() => {
      expect(clientApi.checkout).toHaveBeenCalledWith('user1');
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

    clientApi.getCart.mockResolvedValue({
      items: [
        { id: '1', name: 'Laptop Pro', price: 100, quantity: 1 },
      ],
      discountCode: null,
      appliedDiscount: 0,
    });

    clientApi.checkout.mockResolvedValue(mockOrder);

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
});
