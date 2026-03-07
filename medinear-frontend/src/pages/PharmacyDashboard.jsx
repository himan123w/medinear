import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import axios from 'axios';
import './PharmacyDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function PharmacyDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast?.() || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [pharmacyStats, setPharmacyStats] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // Check if user is pharmacy owner
  useEffect(() => {
    if (user && user.role !== 'pharmacy') {
      alert('Access Denied: Pharmacy privileges required');
      window.location.href = '/';
    }
  }, [user]);

  // Fetch pharmacy overview stats
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchPharmacyStats();
    }
  }, [activeTab]);

  // Fetch medicines for this pharmacy
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchMedicines();
    }
  }, [activeTab]);

  // Fetch reservations for this pharmacy
  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab, filterStatus]);

  // Fetch ratings and reviews
  useEffect(() => {
    if (activeTab === 'ratings') {
      fetchRatings();
    }
  }, [activeTab]);

  const fetchPharmacyStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/pharmacy/${user?.pharmacyId || user?._id}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPharmacyStats(response.data.data);
    } catch (error) {
      showToast?.('Failed to fetch pharmacy stats', 'error');
      // Set default stats if API doesn't have endpoint yet
      setPharmacyStats({
        totalMedicines: 0,
        activeReservations: 0,
        completedReservations: 0,
        averageRating: 0,
        totalReviews: 0,
        monthlyRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/medicine?pharmacyId=${user?.pharmacyId || user?._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMedicines(response.data.data || []);
    } catch (error) {
      showToast?.('Failed to fetch medicines', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/reservations?pharmacyId=${user?.pharmacyId || user?._id}&status=${filterStatus === 'all' ? '' : filterStatus}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations(response.data.data || []);
    } catch (error) {
      showToast?.('Failed to fetch reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/rating?pharmacyId=${user?.pharmacyId || user?._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRatings(response.data.data || []);
    } catch (error) {
      showToast?.('Failed to fetch ratings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharmacy-dashboard">
      <div className="pharmacy-header">
        <h1>🏥 Pharmacy Dashboard</h1>
        <p>{user?.name || 'Pharmacy'}</p>
      </div>

      <div className="pharmacy-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          💊 Inventory
        </button>
        <button
          className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          📋 Reservations
        </button>
        <button
          className={`tab-btn ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          ⭐ Ratings & Reviews
        </button>
      </div>

      <div className="pharmacy-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <h2>Business Overview</h2>
            {loading ? (
              <div className="loading">Loading statistics...</div>
            ) : pharmacyStats ? (
              <div className="stats-grid-pharmacy">
                <div className="stat-card-pharmacy">
                  <div className="stat-icon">💊</div>
                  <div className="stat-details">
                    <div className="stat-label">Medicines in Stock</div>
                    <div className="stat-value">{pharmacyStats.totalMedicines}</div>
                  </div>
                </div>
                <div className="stat-card-pharmacy highlight">
                  <div className="stat-icon">📋</div>
                  <div className="stat-details">
                    <div className="stat-label">Active Orders</div>
                    <div className="stat-value">{pharmacyStats.activeReservations}</div>
                  </div>
                </div>
                <div className="stat-card-pharmacy">
                  <div className="stat-icon">✅</div>
                  <div className="stat-details">
                    <div className="stat-label">Completed Orders</div>
                    <div className="stat-value">{pharmacyStats.completedReservations}</div>
                  </div>
                </div>
                <div className="stat-card-pharmacy">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-details">
                    <div className="stat-label">Average Rating</div>
                    <div className="stat-value">{pharmacyStats.averageRating?.toFixed(1) || 'N/A'}</div>
                  </div>
                </div>
                <div className="stat-card-pharmacy">
                  <div className="stat-icon">💬</div>
                  <div className="stat-details">
                    <div className="stat-label">Total Reviews</div>
                    <div className="stat-value">{pharmacyStats.totalReviews}</div>
                  </div>
                </div>
                <div className="stat-card-pharmacy">
                  <div className="stat-icon">💰</div>
                  <div className="stat-details">
                    <div className="stat-label">Monthly Revenue</div>
                    <div className="stat-value">₹{pharmacyStats.monthlyRevenue?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="error">Failed to load statistics</div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="tab-content">
            <h2>Inventory Management</h2>
            {loading ? (
              <div className="loading">Loading inventory...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Generic Name</th>
                      <th>Strength</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.length > 0 ? (
                      medicines.map((m) => (
                        <tr key={m._id}>
                          <td>{m.name}</td>
                          <td>{m.genericName}</td>
                          <td>{m.strength}</td>
                          <td><span className={m.stock > 10 ? 'stock-high' : m.stock > 0 ? 'stock-low' : 'stock-empty'}>{m.stock || 0}</span></td>
                          <td>₹{m.price}</td>
                          <td>
                            <span className={m.stock > 0 ? 'status-badge-available' : 'status-badge-out'}>
                              {m.stock > 0 ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="empty">No medicines in inventory</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="tab-content">
            <h2>Order Management</h2>
            <div className="filter-bar">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Medicine</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.length > 0 ? (
                      reservations.map((r) => (
                        <tr key={r._id}>
                          <td>{r.user?.name}</td>
                          <td>{r.medicine?.name}</td>
                          <td>{r.quantity}</td>
                          <td>₹{(r.quantity * r.medicine?.price)?.toLocaleString()}</td>
                          <td>
                            <span className={`status-badge status-${r.status}`}>
                              {r.status}
                            </span>
                          </td>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="empty">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="tab-content">
            <h2>Customer Reviews & Ratings</h2>
            {loading ? (
              <div className="loading">Loading reviews...</div>
            ) : ratings.length > 0 ? (
              <div className="reviews-container">
                {ratings.map((rating) => (
                  <div key={rating._id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <h4>{rating.user?.name}</h4>
                        <span className="review-date">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="review-rating">
                        {'⭐'.repeat(rating.rating)}
                        <span className="rating-number">{rating.rating}/5</span>
                      </div>
                    </div>
                    <p className="review-text">{rating.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">No reviews yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PharmacyDashboard;
