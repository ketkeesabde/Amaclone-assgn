import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Statistics } from '../types';
import '../App.css';

const Admin = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await adminApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to load statistics' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDiscountCode = async () => {
    setGeneratingCode(true);
    setMessage(null);

    try {
      const code = await adminApi.generateDiscountCode();
      setMessage({ 
        type: 'success', 
        text: `Discount code generated: ${code}` 
      });
      // Reload statistics to show the new code
      await loadStatistics();
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Failed to generate discount code' });
    } finally {
      setGeneratingCode(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!statistics) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>No statistics available</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Admin Dashboard</h2>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-title">Actions</div>
        <button
          className="btn btn-primary"
          onClick={handleGenerateDiscountCode}
          disabled={generatingCode}
        >
          {generatingCode ? 'Generating...' : 'Generate Discount Code'}
        </button>
        <p style={{ marginTop: '12px', color: '#7f8c8d', fontSize: '0.875rem' }}>
          Note: Discount codes can only be generated every 5 orders (nth order condition).
        </p>
      </div>

      <div className="card">
        <div className="card-title">Store Statistics</div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <div className="value">{statistics.totalOrders}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <h3>Items Purchased</h3>
            <div className="value">{statistics.itemsPurchased}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <h3>Total Revenue</h3>
            <div className="value">${statistics.totalPurchaseAmount.toFixed(2)}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <h3>Total Discounts</h3>
            <div className="value">${statistics.totalDiscountAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Discount Codes ({statistics.discountCodes.length})</div>
        {statistics.discountCodes.length === 0 ? (
          <div className="empty-state">
            <p>No discount codes generated yet.</p>
          </div>
        ) : (
          <div className="discount-codes-list">
            {statistics.discountCodes.map((dc) => (
              <div key={dc.code} className="discount-code-item">
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{dc.code}</div>
                  <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                    Created: {new Date(dc.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className={`discount-code-badge ${dc.isUsed ? 'used' : 'available'}`}>
                  {dc.isUsed ? 'Used' : 'Available'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
