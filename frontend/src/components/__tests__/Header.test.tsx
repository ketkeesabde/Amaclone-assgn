/**
 * Tests for Header component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header', () => {
  it('should render the header with title', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('🛍️ Amaclone')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should have correct links', () => {
    renderWithRouter(<Header />);
    const shopLink = screen.getByRole('link', { name: 'Shop' });
    const cartLink = screen.getByRole('link', { name: 'Cart' });
    const adminLink = screen.getByRole('link', { name: 'Admin' });

    expect(shopLink).toHaveAttribute('href', '/');
    expect(cartLink).toHaveAttribute('href', '/cart');
    expect(adminLink).toHaveAttribute('href', '/admin');
  });
});
