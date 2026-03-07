import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import './TrendingMedicines.css';

export default function TrendingMedicines() {
  const [trending, setTrending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user?.location) {
      fetchTrendingMedicines();
    } else {
      setLoading(false);
    }
  }, [token, user?.location]);

  const fetchTrendingMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/demands/trending', {
        params: {
          latitude: user?.location?.latitude,
          longitude: user?.location?.longitude,
          limit: 8
        }
      });

      if (response.data.success) {
        setTrending(response.data.trending);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching trending medicines:', err);
      setError('Unable to load trending medicines');
    } finally {
      setLoading(false);
    }
  };

  if (!token || loading) {
    return null;
  }

  if (error || !trending) {
    return null;
  }

  const allTrending = [...(trending.highDemand || []), ...(trending.lowStock || [])];

  if (allTrending.length === 0) {
    return null;
  }

  const displayTrending = activeTab === 'all' 
    ? allTrending 
    : activeTab === 'demand' 
      ? trending.highDemand || [] 
      : trending.lowStock || [];

  return (
    <div className="trending-medicines-section">
      <div className="trending-medicines-container">
        {/* Header */}
        <div className="trending-medicines-header">
          <div>
            <h2>📊 Market Intelligence</h2>
            <p>Smart medicine insights based on demand & stock</p>
          </div>
          <button 
            className="refresh-trending-btn"
            onClick={fetchTrendingMedicines}
            disabled={loading}
            title="Refresh trending medicines"
          >
            🔄
          </button>
        </div>

        {/* Tabs */}
        <div className="trending-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Trends ({allTrending.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'demand' ? 'active' : ''}`}
            onClick={() => setActiveTab('demand')}
          >
            🔥 High Demand ({trending.highDemand?.length || 0})
          </button>
          <button
            className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            ⚠ Low Stock ({trending.lowStock?.length || 0})
          </button>
        </div>

        {/* Trending Cards */}
        <div className="trending-cards-grid">
          {displayTrending.length > 0 ? (
            displayTrending.map((item, index) => (
              <div 
                key={index} 
                className={`trending-card ${item.type} ${item.urgency ? 'urgent-' + item.urgency : ''}`}
              >
                {/* Icon & Type */}
                <div className="trending-card-header">
                  <span className="trending-icon">{item.icon}</span>
                  <span className="trending-label">{item.label}</span>
                </div>

                {/* Medicine Name */}
                <h3 className="trending-medicine-name">{item.medicineName}</h3>

                {/* Details based on type */}
                {item.type === 'high_demand' ? (
                  <div className="trending-details">
                    <div className="detail-row">
                      <span className="detail-label">Demand Score</span>
                      <div className="demand-bar">
                        <div 
                          className="demand-fill"
                          style={{ width: `${(item.demandScore || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">👥 Searches</span>
                      <span className="detail-value">{item.searchCount || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">✓ Bookings</span>
                      <span className="detail-value">{item.reservationCount || 0}</span>
                    </div>
                    {item.reason && (
                      <p className="trending-reason">{item.reason}</p>
                    )}
                  </div>
                ) : (
                  <div className="trending-details">
                    <div className="detail-row">
                      <span className="detail-label">Stock Level</span>
                      <span className={`stock-badge stock-${item.urgency}`}>
                        {item.stockLevel || 0} units
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Area</span>
                      <span className="detail-value">{item.affectedArea}</span>
                    </div>
                    <p className="trending-recommendation">
                      💡 {item.recommendation}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button className="trending-action-btn">
                  {item.type === 'high_demand' ? 'View Details' : 'Check Availability'}
                </button>
              </div>
            ))
          ) : (
            <div className="no-trending">
              <p>No trending medicines at the moment</p>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="trending-stats">
          <div className="stat-item">
            <span className="stat-icon">📈</span>
            <div>
              <p className="stat-number">{trending.highDemand?.length || 0}</p>
              <p className="stat-label">Hot Medicines</p>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⚙</span>
            <div>
              <p className="stat-number">{trending.lowStock?.length || 0}</p>
              <p className="stat-label">Stock Alerts</p>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱</span>
            <div>
              <p className="stat-label">Updated</p>
              <p className="stat-time">
                {new Date(trending.lastUpdated || Date.now()).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
