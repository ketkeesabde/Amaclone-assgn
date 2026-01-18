/**
 * Tests for Shop page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Shop from '../Shop';
import * as api from '../../services/api';

// Mock the API
vi.mock('../../services/api');
const mockedApi = api as any;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Shop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful cart fetch
    mockedApi.clientApi = {
      getCart: vi.fn().mockResolvedValue({
        items: [],
        discountCode: null,
        appliedDiscount: 0,
      }),
      addToCart: vi.fn().mockResolvedValue({
        items: [{ id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 }],
        discountCode: null,
        appliedDiscount: 0,
      }),
      updateCartQuantity: vi.fn().mockResolvedValue({
        items: [{ id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 2 }],
        discountCode: null,
        appliedDiscount: 0,
      }),
    };
  });

  it('should render product catalog', async () => {
    renderWithRouter(<Shop />);
    
    await waitFor(() => {
      expect(screen.getByText('Product Catalog')).toBeInTheDocument();
    });


    expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
  });

  it('should display product prices', async () => {
    renderWithRouter(<Shop />);
    
    await waitFor(() => {
      expect(screen.getByText('$1299.99')).toBeInTheDocument();
    });
  });

  it('should show "Add to Cart" button when item is not in cart', async () => {
    renderWithRouter(<Shop />);
    
    await waitFor(() => {
      const addButtons = screen.getAllByText('Add to Cart');
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it('should show quantity controls when item is in cart', async () => {
    // Mock cart with item already present
    mockedApi.clientApi.getCart = vi.fn().mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 }],
      discountCode: null,
      appliedDiscount: 0,
    });

    renderWithRouter(<Shop />);
    
    await waitFor(() => {
      expect(screen.getByText('1 in cart')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '−' })).toBeInTheDocument();
  });

  it('should call addToCart when "Add to Cart" is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Shop />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    });

    const addButton = screen.getAllByText('Add to Cart')[0];
    await user.click(addButton);

    await waitFor(() => {
      expect(mockedApi.clientApi.addToCart).toHaveBeenCalled();
    });
  });

  it('should update quantity when +/- buttons are clicked', async () => {
    // Mock cart with item already present
    mockedApi.clientApi.getCart = vi.fn().mockResolvedValue({
      items: [{ id: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1 }],
      discountCode: null,
      appliedDiscount: 0,
    });

    const user = userEvent.setup();
    renderWithRouter(<Shop />);
    
    await waitFor(() => {
      expect(screen.getByText('1 in cart')).toBeInTheDocument();
    });

    const plusButton = screen.getByRole('button', { name: '+' });
    await user.click(plusButton);

    await waitFor(() => {
      expect(mockedApi.clientApi.updateCartQuantity).toHaveBeenCalled();
    });
  });

  it('should display success message after adding item', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Shop />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    });

    const addButton = screen.getAllByText('Add to Cart')[0];
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
    });
  });
});
