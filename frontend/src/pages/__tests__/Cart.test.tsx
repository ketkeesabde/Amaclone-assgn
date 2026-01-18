/**
 * Tests for Cart page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../Cart';

// Mock the API
vi.mock('../../services/api', () => ({
  clientApi: {
    getCart: vi.fn(),
    updateCartQuantity: vi.fn(),
    applyDiscount: vi.fn(),
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

describe('Cart', () => {
  let clientApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    const apiModule = await import('../../services/api');
    clientApi = apiModule.clientApi;
  });

  it('should display empty state when cart is empty', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [],
      discountCode: null,
      appliedDiscount: 0,
    });

    renderWithRouter(<Cart />);
    
    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  it('should display cart items when cart has items', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [
        { id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 },
        { id: '2', name: 'Wireless Mouse', price: 29.99, quantity: 2 },
      ],
      discountCode: null,
      appliedDiscount: 0,
    });

    renderWithRouter(<Cart />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });
  });

  it('should display correct subtotal and total', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [
        { id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 },
        { id: '2', name: 'Wireless Mouse', price: 29.99, quantity: 2 },
      ],
      discountCode: null,
      appliedDiscount: 0,
    });

    renderWithRouter(<Cart />);
    
    await waitFor(() => {
      // Subtotal: 1299.99 + (29.99 * 2) = 1359.97
      expect(screen.getByText(/1359.97/)).toBeInTheDocument();
    });
  });

  it('should display discount section', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 100, quantity: 1 }],
      discountCode: null,
      appliedDiscount: 0,
    });

    renderWithRouter(<Cart />);
    
    await waitFor(() => {
      expect(screen.getByText('Discount Code')).toBeInTheDocument();
    });
  });

  it('should show applied discount code when one is active', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 100, quantity: 1 }],
      discountCode: 'DISCOUNT123',
      appliedDiscount: 10,
    });

    renderWithRouter(<Cart />);
    
    await waitFor(() => {
      expect(screen.getByText(/DISCOUNT123/)).toBeInTheDocument();
      expect(screen.getByText(/-10.00/)).toBeInTheDocument();
    });
  });

  it('should update quantity when +/- buttons are clicked', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 }],
      discountCode: null,
      appliedDiscount: 0,
    });

    clientApi.updateCartQuantity.mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 2 }],
      discountCode: null,
      appliedDiscount: 0,
    });

    const user = userEvent.setup();
    renderWithRouter(<Cart />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    });

    const plusButton = screen.getByRole('button', { name: '+' });
    await user.click(plusButton);

    await waitFor(() => {
      expect(clientApi.updateCartQuantity).toHaveBeenCalled();
    });
  });

  it('should apply discount code when entered', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 100, quantity: 1 }],
      discountCode: null,
      appliedDiscount: 0,
    });

    clientApi.applyDiscount.mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 100, quantity: 1 }],
      discountCode: 'DISCOUNT123',
      appliedDiscount: 10,
    });

    const user = userEvent.setup();
    renderWithRouter(<Cart />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter discount code')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter discount code');
    const applyButton = screen.getByText('Apply');

    await user.type(input, 'DISCOUNT123');
    await user.click(applyButton);

    await waitFor(() => {
      expect(clientApi.applyDiscount).toHaveBeenCalledWith('user1', 'DISCOUNT123');
    });
  });

  it('should navigate to checkout when checkout button is clicked', async () => {
    clientApi.getCart.mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 100, quantity: 1 }],
      discountCode: null,
      appliedDiscount: 0,
    });

    const user = userEvent.setup();
    renderWithRouter(<Cart />);
    
    await waitFor(() => {
      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });

    const checkoutButton = screen.getByText('Proceed to Checkout');
    await user.click(checkoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });
});
