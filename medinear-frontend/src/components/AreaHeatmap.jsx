import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api';
import './AreaHeatmap.css';

export default function AreaHeatmap() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, high-demand, shortage, well-stocked
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    loadHeatmap();
    // Refresh every 5 minutes
    const interval = setInterval(loadHeatmap, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadHeatmap = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAreaHeatmap();
      const data = response.data;
      
      if (data.success) {
        setHeatmapData(data);
        setError('');
      } else {
        setError('Failed to load heatmap data');
      }
    } catch (err) {
      console.error('Error loading heatmap:', err);
      setError('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredZones = () => {
    if (!heatmapData || !heatmapData.zones) return [];
    
    if (filter === 'all') return heatmapData.zones;
    return heatmapData.zones.filter(zone => zone.zoneType === filter);
  };

  const getSeverityClass = (severity) => {
    return `severity-${severity}`;
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(selectedZone?.area === zone.area ? null : zone);
  };

  if (loading && !heatmapData) {
    return (
      <div className="heatmap-container">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading area heatmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="heatmap-container">
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={loadHeatmap} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  const filteredZones = getFilteredZones();

  return (
    <div className="heatmap-container">
      {/* Header */}
      <div className="heatmap-header">
        <div>
          <h2>📊 Area Heatmap Analytics</h2>
          <p className="heatmap-subtitle">
            Real-time demand and stock visualization across zones
          </p>
        </div>
        <button onClick={loadHeatmap} className="refresh-btn" disabled={loading}>
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Summary Stats */}
      {heatmapData && (
        <div className="heatmap-summary">
          <div className="summary-card">
            <div className="summary-icon">🗺️</div>
            <div className="summary-content">
              <div className="summary-label">Total Zones</div>
              <div className="summary-value">{heatmapData.summary.totalZones}</div>
            </div>
          </div>
          
          <div className="summary-card high-demand">
            <div className="summary-icon">🔥</div>
            <div className="summary-content">
              <div className="summary-label">High Demand</div>
              <div className="summary-value">{heatmapData.summary.highDemandZones}</div>
            </div>
          </div>
          
          <div className="summary-card well-stocked">
            <div className="summary-icon">🟢</div>
            <div className="summary-content">
              <div className="summary-label">Well Stocked</div>
              <div className="summary-value">{heatmapData.summary.wellStockedZones}</div>
            </div>
          </div>
          
          <div className="summary-card shortage">
            <div className="summary-icon">⚠️</div>
            <div className="summary-content">
              <div className="summary-label">Shortage Areas</div>
              <div className="summary-value">{heatmapData.summary.shortageZones}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="heatmap-filter">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          🏪 All Zones
        </button>
        <button 
          className={`filter-btn high-demand ${filter === 'high-demand' ? 'active' : ''}`}
          onClick={() => setFilter('high-demand')}
        >
          🔥 High Demand
        </button>
        <button 
          className={`filter-btn shortage ${filter === 'shortage' ? 'active' : ''}`}
          onClick={() => setFilter('shortage')}
        >
          ⚠️ Shortage
        </button>
        <button 
          className={`filter-btn well-stocked ${filter === 'well-stocked' ? 'active' : ''}`}
          onClick={() => setFilter('well-stocked')}
        >
          🟢 Well Stocked
        </button>
      </div>

      {/* Zone Grid */}
      <div className="zones-grid">
        {filteredZones.length > 0 ? (
          filteredZones.map((zone, index) => (
            <div 
              key={index} 
              className={`zone-card ${getSeverityClass(zone.severity)} ${selectedZone === zone ? 'selected' : ''}`}
              onClick={() => handleZoneClick(zone)}
              style={{ 
                borderLeftColor: zone.color,
                backgroundColor: zone.bgColor
              }}
            >
              <div className="zone-header">
                <div className="zone-title">
                  <span className="zone-icon">{zone.icon}</span>
                  <div>
                    <h3>{zone.area}</h3>
                    <p className="zone-city">{zone.city}</p>
                  </div>
                </div>
                <div className={`zone-badge ${zone.zoneType}`}>
                  {zone.zoneType.replace('-', ' ').toUpperCase()}
                </div>
              </div>

              <div className="zone-metrics">
                <div className="metric">
                  <span className="metric-label">Pharmacies</span>
                  <span className="metric-value">{zone.metrics.pharmacyCount}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Demand</span>
                  <span className="metric-value">{zone.metrics.totalDemand}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Stock</span>
                  <span className="metric-value">{zone.metrics.totalStock}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Reservations</span>
                  <span className="metric-value">{zone.metrics.totalReservations}</span>
                </div>
              </div>

              {selectedZone === zone && (
                <div className="zone-details">
                  <div className="recommendation-box" style={{ backgroundColor: zone.bgColor }}>
                    <strong>💡 Recommendation:</strong>
                    <p>{zone.recommendation}</p>
                  </div>

                  <div className="detailed-metrics">
                    <div className="detail-row">
                      <span>Demand per Pharmacy:</span>
                      <strong>{zone.metrics.demandPerPharmacy}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Stock per Pharmacy:</span>
                      <strong>{zone.metrics.stockPerPharmacy}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Demand/Stock Ratio:</span>
                      <strong>{zone.metrics.demandToStockRatio}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Low Stock Items:</span>
                      <strong>{zone.metrics.lowStockCount}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Unique Medicines:</span>
                      <strong>{zone.metrics.uniqueMedicines}</strong>
                    </div>
                  </div>

                  {zone.pharmacies && zone.pharmacies.length > 0 && (
                    <div className="zone-pharmacies">
                      <strong>Pharmacies in this zone:</strong>
                      <ul>
                        {zone.pharmacies.map((pharmacy, idx) => (
                          <li key={idx}>
                            💊 {pharmacy.name}
                            {pharmacy.address && <span className="pharmacy-addr"> - {pharmacy.address}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-zones">
            <p>No zones found for selected filter</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {heatmapData && (
        <div className="heatmap-footer">
          <p>
            📅 Data from last {heatmapData.period} | 
            🕒 Updated: {new Date(heatmapData.timestamp).toLocaleString()} |
            📊 Based on {heatmapData.dataPoints.pharmacies} pharmacies, 
            {heatmapData.dataPoints.reservations} reservations, 
            {heatmapData.dataPoints.medicines} medicines
          </p>
        </div>
      )}
    </div>
  );
}
