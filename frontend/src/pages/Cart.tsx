import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../services/api';
import { Cart } from '../types';
import '../App.css';

const CartPage = () => {
  const [userId] = useState('user1');
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await clientApi.getCart(userId);
      setCart(cartData);
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to load cart' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter a discount code' });
      return;
    }

    setApplyingDiscount(true);
    setMessage(null);

    try {
      const updatedCart = await clientApi.applyDiscount(userId, discountCode);
      setCart(updatedCart);
      setMessage({ type: 'success', text: 'Discount code applied successfully!' });
      setDiscountCode('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to apply discount code' });
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantityChange: number) => {
    try {
      const updatedCart = await clientApi.updateCartQuantity(userId, itemId, quantityChange);
      setCart(updatedCart);
      // Recalculate discount if one is applied
      if (updatedCart.discountCode && updatedCart.items.length > 0) {
        // Discount is already recalculated in the backend
      }
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to update cart' });
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add some items from the shop to get started!</p>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.appliedDiscount || 0;
  const total = subtotal - discount;

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Shopping Cart</h2>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-title">Items</div>
        {cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">${item.price.toFixed(2)} each</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => handleUpdateQuantity(item.id, -1)}
                style={{ minWidth: '36px', padding: '6px 12px' }}
                title="Decrease quantity"
              >
                −
              </button>
              <div className="cart-item-quantity" style={{ minWidth: '40px', textAlign: 'center' }}>
                {item.quantity}
              </div>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => handleUpdateQuantity(item.id, 1)}
                style={{ minWidth: '36px', padding: '6px 12px' }}
                title="Increase quantity"
              >
                +
              </button>
            </div>
            <div className="cart-item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}

        <div className="discount-section">
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Discount Code</div>
          {cart.discountCode ? (
            <div className="discount-applied">
              ✓ Discount code applied: {cart.discountCode}
            </div>
          ) : (
            <>
              <div className="discount-input-group">
                <input
                  type="text"
                  className="discount-input"
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                />
                <button
                  className="btn btn-secondary btn-small"
                  onClick={handleApplyDiscount}
                  disabled={applyingDiscount}
                >
                  {applyingDiscount ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="cart-totals">
          <div className="cart-total-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="cart-total-row" style={{ color: '#27ae60' }}>
              <span>Discount ({cart.discountCode}):</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="cart-total-row grand-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button className="btn btn-success" onClick={handleCheckout} style={{ width: '100%', marginTop: '20px' }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
