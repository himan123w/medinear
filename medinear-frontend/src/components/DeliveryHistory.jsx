import React, { useState, useEffect } from 'react';
import { deliveryAPI } from '../api';
import './DeliveryHistory.css';

export default function DeliveryHistory({
  userPhone,
  userRole = 'customer', // 'customer' or 'partner'
  onSelectDelivery,
  limit = 10
}) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = limit;

  // Fetch deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        let response;

        if (userRole === 'customer') {
          response = await deliveryAPI.getCustomerDeliveries(userPhone, { limit: 100 });
        } else {
          response = await deliveryAPI.getPartnerDeliveries(userPhone, { limit: 100 });
        }

        setDeliveries(response.data.deliveries || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch deliveries');
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    if (userPhone) {
      fetchDeliveries();
    }
  }, [userPhone, userRole]);

  // Filter deliveries
  const getFilteredDeliveries = () => {
    if (filter === 'all') return deliveries;
    return deliveries.filter(d => d.status === filter);
  };

  // Pagination
  const filteredDeliveries = getFilteredDeliveries();
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const displayedDeliveries = filteredDeliveries.slice(startIdx, startIdx + itemsPerPage);

  // Get status color and icon
  const getStatusStyle = (status) => {
    const statusStyles = {
      confirmed: { icon: '📋', color: '#2196f3', bg: '#e3f2fd' },
      assigned: { icon: '👤', color: '#ff9800', bg: '#fff3e0' },
      'picked-up': { icon: '📦', color: '#ff9800', bg: '#fff3e0' },
      'in-transit': { icon: '🚗', color: '#ff9800', bg: '#fff3e0' },
      arrived: { icon: '📍', color: '#2196f3', bg: '#e3f2fd' },
      delivered: { icon: '✅', color: '#4caf50', bg: '#e8f5e9' },
      failed: { icon: '❌', color: '#f44336', bg: '#ffebee' },
      cancelled: { icon: '🚫', color: '#999', bg: '#f5f5f5' },
      returned: { icon: '↩️', color: '#666', bg: '#f5f5f5' }
    };

    return statusStyles[status] || statusStyles.confirmed;
  };

  // Calculate delivery stats
  const getStats = () => {
    const stats = {
      total: deliveries.length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      pending: deliveries.filter(d => ['confirmed', 'assigned', 'picked-up', 'in-transit'].includes(d.status)).length,
      failed: deliveries.filter(d => ['failed', 'cancelled'].includes(d.status)).length
    };
    return stats;
  };

  const stats = getStats();

  if (loading) {
    return <div className="delivery-history loading">Loading delivery history...</div>;
  }

  return (
    <div className="delivery-history">
      {/* Header */}
      <div className="history-header">
        <h2>📦 Delivery History</h2>
        <p className="header-subtitle">
          {userRole === 'customer' ? 'Your medicine deliveries' : 'Your delivery orders'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>📊 Total</h4>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card success">
          <h4>✅ Delivered</h4>
          <p className="stat-number">{stats.delivered}</p>
        </div>
        <div className="stat-card pending">
          <h4>⏳ Pending</h4>
          <p className="stat-number">{stats.pending}</p>
        </div>
        <div className="stat-card error">
          <h4>❌ Issues</h4>
          <p className="stat-number">{stats.failed}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setFilter('all');
            setCurrentPage(1);
          }}
        >
          All ({deliveries.length})
        </button>
        <button
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => {
            setFilter('delivered');
            setCurrentPage(1);
          }}
        >
          Delivered
        </button>
        <button
          className={`filter-btn ${filter === 'in-transit' ? 'active' : ''}`}
          onClick={() => {
            setFilter('in-transit');
            setCurrentPage(1);
          }}
        >
          In Transit
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => {
            setFilter('cancelled');
            setCurrentPage(1);
          }}
        >
          Cancelled
        </button>
      </div>

      {/* Deliveries List */}
      {displayedDeliveries.length === 0 ? (
        <div className="no-deliveries">
          <p>📭 No deliveries found</p>
        </div>
      ) : (
        <div className="deliveries-list">
          {displayedDeliveries.map((delivery) => {
            const statusStyle = getStatusStyle(delivery.status);
            return (
              <div
                key={delivery._id}
                className="delivery-item"
                onClick={() => onSelectDelivery && onSelectDelivery(delivery._id)}
              >
                {/* Status Badge */}
                <div
                  className="status-badge"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                >
                  <span className="badge-icon">{statusStyle.icon}</span>
                  <span className="badge-text">{delivery.status}</span>
                </div>

                {/* Delivery Details */}
                <div className="delivery-details">
                  <div className="main-info">
                    <h3>Order #{delivery.orderId?.slice(-6) || delivery._id?.slice(-6)}</h3>
                    <p className="address">{delivery.deliveryAddress}</p>
                  </div>

                  {/* Partner Info */}
                  {delivery.deliveryPartner && (
                    <div className="partner-info-mini">
                      <p>🚗 {delivery.deliveryPartner.name}</p>
                    </div>
                  )}
                </div>

                {/* Meta Information */}
                <div className="delivery-meta">
                  <div className="meta-item">
                    <span className="label">Amount:</span>
                    <span className="value">
                      ₹{delivery.totalAmount + (delivery.deliveryCharge || 0)}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Time:</span>
                    <span className="value">
                      {new Date(delivery.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {['confirmed', 'assigned', 'picked-up', 'in-transit', 'arrived'].includes(delivery.status) && (
                  <button className="track-btn" onClick={() => onSelectDelivery && onSelectDelivery(delivery._id)}>
                    📍 Track
                  </button>
                )}

                {delivery.status === 'delivered' && !delivery.ratings && (
                  <button className="rate-btn" onClick={() => onSelectDelivery && onSelectDelivery(delivery._id)}>
                    ⭐ Rate Delivery
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
          <button
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
