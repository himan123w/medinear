import React, { useState, useEffect, useRef } from 'react';
import { medicineAPI } from '../api';
import { getOrCreateDeviceId } from '../utils/deviceId';
import './AlertsBell.css';

const AlertsBell = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const deviceId = getOrCreateDeviceId();
      const response = await medicineAPI.getPriceDropAlerts(deviceId, false, 30);
      const allAlerts = response.data?.alerts || [];
      setAlerts(allAlerts);
      setUnreadCount(allAlerts.filter(a => !a.isRead).length);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAlertClick = async (alert) => {
    if (!alert.isRead) {
      try {
        const deviceId = getOrCreateDeviceId();
        await medicineAPI.markPriceDropAlertRead(alert._id, deviceId);
        setAlerts(alerts.map(a => 
          a._id === alert._id ? { ...a, isRead: true } : a
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (error) {
        console.error('Error marking alert as read:', error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const deviceId = getOrCreateDeviceId();
      await medicineAPI.markAllPriceDropAlertsRead(deviceId);
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffMs = now - alertDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return alertDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toFixed(2)}`;
  };

  return (
    <div className="alerts-bell-container" ref={containerRef}>
      {/* Bell Icon Button */}
      <button 
        className="alerts-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        title={unreadCount > 0 ? `${unreadCount} unread alerts` : 'No new alerts'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="alerts-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Alerts Drawer */}
      {isOpen && (
        <div className="alerts-drawer">
          {/* Header */}
          <div className="alerts-drawer-header">
            <h3>Price Drop Alerts</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="alerts-drawer-content">
            {loading ? (
              <div className="alerts-loading">
                <div className="spinner"></div>
                <p>Loading alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="alerts-empty">
                <div className="empty-icon">🔔</div>
                <p>No price drop alerts yet</p>
                <small>We'll notify you when prices drop for medicines you've searched</small>
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`alert-item ${!alert.isRead ? 'unread' : ''}`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="alert-icon">💰</div>
                    <div className="alert-content">
                      <div className="alert-title">{alert.medicineName}</div>
                      <div className="alert-pharmacy">
                        <span className="pharmacy-name">@ {alert.pharmacyName}</span>
                        {alert.dropPercent && (
                          <span className="drop-percent">
                            {alert.dropPercent > 0 ? '↓' : '↑'} {Math.abs(alert.dropPercent).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="alert-prices">
                        <span className="old-price">{formatPrice(alert.previousPrice)}</span>
                        <span className="arrow">→</span>
                        <span className="new-price">{formatPrice(alert.newPrice)}</span>
                      </div>
                    </div>
                    <div className="alert-time">
                      <span>{formatTime(alert.alertedAt)}</span>
                      {!alert.isRead && <div className="unread-dot"></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="alerts-drawer-footer">
              <small>Showing latest {alerts.length} alerts</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsBell;
