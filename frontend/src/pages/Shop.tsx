import { useState, useEffect } from 'react';
import { products } from '../data/products';
import { clientApi } from '../services/api';
import { Product, Cart } from '../types';
import '../App.css';

const Shop = () => {
  const [userId] = useState('user1'); // In a real app, this would come from auth
  const [cart, setCart] = useState<Cart | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await clientApi.getCart(userId);
      setCart(cartData);
    } catch (error) {
      // Silently fail - cart will be empty
      console.error('Failed to load cart:', error);
    }
  };

  const getItemQuantity = (productId: string): number => {
    if (!cart) return 0;
    const item = cart.items.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = async (product: Product) => {
    setLoading(product.id);
    setMessage(null);

    try {
      const updatedCart = await clientApi.addToCart(userId, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
      setCart(updatedCart);
      setMessage({ type: 'success', text: `${product.name} added to cart!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to add item to cart' });
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateQuantity = async (product: Product, quantityChange: number) => {
    const currentQuantity = getItemQuantity(product.id);
    
    // If item is not in cart and trying to decrease, do nothing
    if (currentQuantity === 0 && quantityChange < 0) {
      return;
    }

    setLoading(product.id);
    setMessage(null);

    try {
      const updatedCart = await clientApi.updateCartQuantity(userId, product.id, quantityChange);
      setCart(updatedCart);
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to update cart' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Product Catalog</h2>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      <div className="products-grid">
        {products.map((product) => {
          const quantity = getItemQuantity(product.id);
          const isInCart = quantity > 0;

          return (
            <div key={product.id} className="product-card">
              <div className="product-name">{product.name}</div>
              <div className="product-description">{product.description}</div>
              <div className="product-price">${product.price.toFixed(2)}</div>
              
              {isInCart ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleUpdateQuantity(product, -1)}
                    disabled={loading === product.id}
                    style={{ minWidth: '36px', padding: '6px 12px' }}
                    title="Decrease quantity"
                  >
                    −
                  </button>
                  <div style={{ minWidth: '40px', textAlign: 'center', fontWeight: 600, fontSize: '1rem' }}>
                    {quantity} in cart
                  </div>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleUpdateQuantity(product, 1)}
                    disabled={loading === product.id}
                    style={{ minWidth: '36px', padding: '6px 12px' }}
                    title="Increase quantity"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(product)}
                  disabled={loading === product.id}
                >
                  {loading === product.id ? 'Adding...' : 'Add to Cart'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;
