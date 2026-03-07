import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIDemandInsights.css';

const AIDemandInsights = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('seasonal'); // seasonal, geographic, insights
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/ai/demand/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (err) {
      console.error('Error fetching AI dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const refreshPredictions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/ai/demand/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchDashboard();
      alert('✅ Predictions refreshed successfully!');
    } catch (err) {
      console.error('Error refreshing predictions:', err);
      alert('❌ Failed to refresh predictions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>🤖 AI is analyzing demand patterns...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="ai-dashboard-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error || 'No data available'}</p>
          <button onClick={fetchDashboard} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-dashboard-container">
      {/* Header */}
      <header className="ai-header">
        <div className="ai-header-content">
          <h1>🤖 AI Demand Insights</h1>
          <p>Powered by Machine Learning & Predictive Analytics</p>
        </div>
        <button onClick={refreshPredictions} className="btn btn-refresh">
          🔄 Refresh Predictions
        </button>
      </header>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card">
          <div className="card-icon">🌡️</div>
          <div className="card-content">
            <h3>Current Season</h3>
            <p className="card-value">{dashboard.overview.season.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>AI Accuracy</h3>
            <p className="card-value">{dashboard.overview.accuracy}%</p>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="card-icon">💊</div>
          <div className="card-content">
            <h3>Medicines Tracked</h3>
            <p className="card-value">{dashboard.seasonalDemand.totalPredicted}</p>
          </div>
        </div>
        
        <div className="overview-card critical">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Critical Areas</h3>
            <p className="card-value">{dashboard.geographicInsights.criticalAreas}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ai-tabs">
        <button 
          className={`tab-btn ${activeTab === 'seasonal' ? 'active' : ''}`}
          onClick={() => setActiveTab('seasonal')}
        >
          🌨️ Seasonal Demand
        </button>
        <button 
          className={`tab-btn ${activeTab === 'geographic' ? 'active' : ''}`}
          onClick={() => setActiveTab('geographic')}
        >
          📍 Geographic Insights
        </button>
        <button 
          className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          💡 AI Insights
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'seasonal' && (
          <div className="seasonal-content">
            <div className="section-header">
              <h2>🌨️ High Demand Medicines - Winter Season</h2>
              <p>Predicted medicines that will experience demand surge</p>
            </div>
            
            <div className="medicines-grid">
              {dashboard.seasonalDemand.topMedicines.map((medicine, index) => (
                <div key={index} className="medicine-prediction-card">
                  <div className="rank-badge">#{index + 1}</div>
                  <h3>{medicine.medicineName}</h3>
                  <p className="category">📦 {medicine.category}</p>
                  
                  <div className="prediction-stats">
                    <div className="stat">
                      <span className="stat-label">Current Demand</span>
                      <span className="stat-value">{medicine.currentDemand}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Predicted Demand</span>
                      <span className="stat-value highlight">{medicine.predictedDemand}</span>
                    </div>
                  </div>
                  
                  <div className="increase-badge">
                    <span className="increase-icon">📈</span>
                    <span className="increase-text">+{medicine.demandIncrease}% Increase</span>
                  </div>
                  
                  <div className="confidence-bar">
                    <div className="confidence-label">
                      <span>Confidence</span>
                      <span>{medicine.confidenceScore}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${medicine.confidenceScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="reason">{medicine.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'geographic' && (
          <div className="geographic-content">
            <div className="section-header">
              <h2>📍 Area-Based Stock Requirements</h2>
              <p>Which areas need more stock - AI geographic analysis</p>
            </div>
            
            <div className="areas-list">
              {dashboard.geographicInsights.areas.map((area, index) => (
                <div key={index} className={`area-card risk-${area.riskLevel}`}>
                  <div className="area-header">
                    <h3>📍 {area.area}</h3>
                    <span className={`risk-badge ${area.riskLevel}`}>
                      {area.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="area-stats">
                    <div className="area-stat">
                      <span className="stat-icon">🏥</span>
                      <div>
                        <p className="stat-label">Pharmacies</p>
                        <p className="stat-value">{area.pharmacyCount}</p>
                      </div>
                    </div>
                    
                    <div className="area-stat">
                      <span className="stat-icon">👥</span>
                      <div>
                        <p className="stat-label">Population</p>
                        <p className="stat-value">{area.demographics.population.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="area-stat">
                      <span className="stat-icon">📦</span>
                      <div>
                        <p className="stat-label">Current Supply</p>
                        <p className="stat-value">{area.currentSupply}</p>
                      </div>
                    </div>
                    
                    <div className="area-stat">
                      <span className="stat-icon">🎯</span>
                      <div>
                        <p className="stat-label">Predicted Demand</p>
                        <p className="stat-value">{area.predictedDemand}</p>
                      </div>
                    </div>
                  </div>
                  
                  {area.shortfall > 0 && (
                    <div className="shortfall-alert">
                      <span className="alert-icon">⚠️</span>
                      <span>Shortfall: {area.shortfall} units</span>
                      <span className="recommended">Recommended: {area.recommendedStock} units</span>
                    </div>
                  )}
                  
                  <div className="top-medicines">
                    <h4>Top Medicines Needed:</h4>
                    <ul>
                      {area.topMedicines.map((med, idx) => (
                        <li key={idx}>
                          💊 {med.medicineName}: <strong>{med.predictedUnits}</strong> units
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-content">
            <div className="section-header">
              <h2>💡 AI-Generated Insights & Recommendations</h2>
              <p>Actionable insights powered by machine learning</p>
            </div>
            
            {/* Alerts */}
            {dashboard.alerts && dashboard.alerts.length > 0 && (
              <div className="alerts-section">
                <h3>🚨 Active Alerts</h3>
                {dashboard.alerts.map((alert, index) => (
                  <div key={index} className={`alert-card ${alert.severity}`}>
                    <div className="alert-header">
                      <span className="alert-severity-icon">
                        {alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : 'ℹ️'}
                      </span>
                      <span className="alert-message">{alert.message}</span>
                    </div>
                    <div className="alert-details">
                      <p><strong>Area:</strong> {alert.area}</p>
                      <p><strong>Medicine:</strong> {alert.medicineName}</p>
                      <p><strong>Action Required:</strong> {alert.actionRequired}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Insights */}
            <div className="insights-grid">
              {dashboard.insights.map((insight, index) => (
                <div key={index} className={`insight-card priority-${insight.priority}`}>
                  <div className="insight-header">
                    <span className="insight-type-icon">
                      {insight.type === 'seasonal_trend' ? '🌨️' : 
                       insight.type === 'area_shortage' ? '📍' :
                       insight.type === 'emerging_demand' ? '📈' : '💰'}
                    </span>
                    <h3>{insight.title}</h3>
                    <span className={`priority-badge ${insight.priority}`}>
                      {insight.priority}
                    </span>
                  </div>
                  
                  <p className="insight-description">{insight.description}</p>
                  
                  <div className="action-items">
                    <h4>📋 Action Items:</h4>
                    <ul>
                      {insight.actionItems.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Model Info */}
      <div className="ai-model-info">
        <h4>🤖 AI Model Information</h4>
        <div className="model-details">
          <p><strong>Algorithm:</strong> {dashboard.aiModel.algorithm}</p>
          <p><strong>Version:</strong> {dashboard.aiModel.version}</p>
          <p><strong>Training Data:</strong> {dashboard.aiModel.trainingDataPoints.toLocaleString()} data points</p>
          <p><strong>Last Trained:</strong> {new Date(dashboard.aiModel.lastTrained).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AIDemandInsights;
