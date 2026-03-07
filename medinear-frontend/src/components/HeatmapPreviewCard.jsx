import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../api';
import './HeatmapPreviewCard.css';

export default function HeatmapPreviewCard({ compact = true }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadHeatmapSummary();
  }, []);

  const loadHeatmapSummary = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAreaHeatmap();
      if (response?.data?.success) {
        setSummary(response.data.summary);
        setError('');
      } else {
        setError('Unable to load heatmap insights');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load heatmap insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`heatmap-preview-card ${compact ? 'compact' : ''}`}>
      <div className="heatmap-preview-header">
        <div>
          <h3>📍 Area Heatmap</h3>
          <p>Startup-level demand intelligence</p>
        </div>
        <button className="preview-link-btn" onClick={() => navigate('/analytics/heatmap')}>
          Open Full View →
        </button>
      </div>

      {loading ? (
        <div className="heatmap-preview-loading">Loading zones...</div>
      ) : error ? (
        <div className="heatmap-preview-error">⚠️ {error}</div>
      ) : (
        <>
          <div className="heatmap-preview-metrics">
            <div className="preview-metric high-demand">
              <span className="metric-icon">🔥</span>
              <div>
                <strong>{summary?.highDemandZones ?? 0}</strong>
                <small>High Demand</small>
              </div>
            </div>
            <div className="preview-metric well-stocked">
              <span className="metric-icon">🟢</span>
              <div>
                <strong>{summary?.wellStockedZones ?? 0}</strong>
                <small>Well Stocked</small>
              </div>
            </div>
            <div className="preview-metric shortage">
              <span className="metric-icon">⚠️</span>
              <div>
                <strong>{summary?.shortageZones ?? 0}</strong>
                <small>Shortage</small>
              </div>
            </div>
          </div>

          <div className="heatmap-preview-footnote">
            <span>{summary?.totalZones ?? 0} total zones</span>
            <span>•</span>
            <span>{summary?.totalPharmacies ?? 0} pharmacies tracked</span>
          </div>
        </>
      )}
    </div>
  );
}
