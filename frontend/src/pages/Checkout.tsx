import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../services/api';
import { Cart, Order } from '../types';
import '../App.css';

const Checkout = () => {
  const [userId] = useState('user1');
  const [cart, setCart] = useState<Cart | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await clientApi.getCart(userId);
      setCart(cartData);
      if (cartData.items.length === 0) {
        navigate('/');
      }
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to load cart' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      setMessage({ type: 'error', text: 'Cart is empty' });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const orderData = await clientApi.checkout(userId);
      setOrder(orderData);
      setMessage({ type: 'success', text: 'Order placed successfully!' });
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to place order' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (order) {
    return (
      <div className="container">
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#27ae60' }}>Order Confirmed! 🎉</h2>
          
          {message && (
            <div className={`message message-${message.type}`}>{message.text}</div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <p><strong>Order ID:</strong> #{order.id}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <div className="card-title">Order Items</div>
          {order.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
              </div>
              <div className="cart-item-quantity">Qty: {item.quantity}</div>
              <div className="cart-item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="cart-totals">
            <div className="cart-total-row">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="cart-total-row" style={{ color: '#27ae60' }}>
                <span>Discount ({order.discountCode}):</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-total-row grand-total">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <p style={{ marginTop: '20px', color: '#7f8c8d' }}>
            Redirecting to shop...
          </p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.appliedDiscount || 0;
  const total = subtotal - discount;

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Checkout</h2>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-title">Order Summary</div>
        {cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">${item.price.toFixed(2)} each</div>
            </div>
            <div className="cart-item-quantity">Qty: {item.quantity}</div>
            <div className="cart-item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}

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

        <button
          className="btn btn-success"
          onClick={handlePlaceOrder}
          disabled={processing}
          style={{ width: '100%', marginTop: '20px' }}
        >
          {processing ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
