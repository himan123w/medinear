import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../api';
import ReserveButton from './ReserveButton';
import './MedicineAlternatives.css';

const MedicineAlternatives = ({ medicine, userLocation = null }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [originalMedicine, setOriginalMedicine] = useState(null);

  useEffect(() => {
    if (showAlternatives && medicine?._id) {
      fetchAlternatives();
    }
  }, [showAlternatives, medicine?._id]);

  const fetchAlternatives = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await medicineAPI.getMedicineAlternatives(
        medicine._id,
        userLocation?.latitude,
        userLocation?.longitude,
        10 // radius in km
      );

      if (response.data.success) {
        setOriginalMedicine(response.data.data.original);
        setAlternatives(response.data.data.alternatives);
      } else {
        setError('No alternatives found');
      }
    } catch (err) {
      console.error('Error fetching alternatives:', err);
      setError('Failed to load alternatives');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlternatives = () => {
    setShowAlternatives(!showAlternatives);
  };

  const renderCompositionBadge = (alt) => {
    if (!alt.comparison) return null;

    const { matchType } = alt.comparison;
    const badges = {
      exact: { text: 'Same Composition', color: '#51cf66', icon: '✓' },
      generic: { text: 'Generic Match', color: '#4dabf7', icon: '≈' },
      similar: { text: 'Similar', color: '#ffd43b', icon: '~' }
    };

    const badge = badges[matchType] || badges.similar;

    return (
      <span className="composition-badge" style={{ background: badge.color }}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const renderPriceDifference = (alt) => {
    if (!alt.comparison) return null;

    const { isCheaper, savings, savingsPercent, priceDifference } = alt.comparison;

    if (isCheaper) {
      return (
        <div className="price-savings">
          <span className="savings-badge">
            💰 Save ₹{savings.toFixed(2)} ({savingsPercent.toFixed(0)}% cheaper)
          </span>
        </div>
      );
    } else if (priceDifference > 0) {
      return (
        <div className="price-difference">
          <span className="expensive-badge">
            +₹{priceDifference.toFixed(2)} more expensive
          </span>
        </div>
      );
    }
    
    return null;
  };

  if (!medicine) return null;

  return (
    <div className="medicine-alternatives-container">
      <button 
        className="alternatives-toggle-btn"
        onClick={toggleAlternatives}
      >
        🔄 {showAlternatives ? 'Hide' : 'Show'} Alternatives
        {alternatives.length > 0 && !showAlternatives && (
          <span className="alternatives-count">{alternatives.length}</span>
        )}
      </button>

      {showAlternatives && (
        <div className="alternatives-panel">
          <div className="alternatives-header">
            <h3>🔄 Medicine Alternatives</h3>
            <p className="alternatives-subtitle">
              {originalMedicine?.composition 
                ? `Same composition: ${originalMedicine.composition}`
                : 'Similar medicines available'}
            </p>
          </div>

          {loading && (
            <div className="alternatives-loading">
              <div className="spinner"></div>
              <p>Finding alternatives...</p>
            </div>
          )}

          {error && !loading && (
            <div className="alternatives-error">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && alternatives.length === 0 && (
            <div className="no-alternatives">
              <p>😕 No alternatives found nearby</p>
              <p className="hint">Try increasing the search radius or check other areas</p>
            </div>
          )}

          {!loading && alternatives.length > 0 && (
            <div className="alternatives-grid">
              {alternatives.map((alt, index) => (
                <div key={alt._id || index} className="alternative-card">
                  <div className="alternative-header">
                    <h4>{alt.name}</h4>
                    {renderCompositionBadge(alt)}
                  </div>

                  <div className="alternative-details">
                    {alt.composition && (
                      <p className="composition">
                        <strong>Composition:</strong> {alt.composition}
                      </p>
                    )}

                    {alt.manufacturer && (
                      <p className="manufacturer">
                        <strong>Manufacturer:</strong> {alt.manufacturer}
                      </p>
                    )}

                    {alt.dosageForm && (
                      <p className="dosage-form">
                        <strong>Form:</strong> {alt.dosageForm}
                        {alt.strength && ` - ${alt.strength}`}
                      </p>
                    )}

                    {alt.isGeneric && (
                      <span className="generic-badge">Generic Medicine</span>
                    )}
                  </div>

                  <div className="alternative-price-section">
                    <div className="price-info">
                      <span className="current-price">₹{alt.price.toFixed(2)}</span>
                      {renderPriceDifference(alt)}
                    </div>
                    
                    <div className="stock-info">
                      <span className="stock-badge">
                        📦 {alt.stock} in stock
                      </span>
                    </div>
                  </div>

                  <div className="alternative-pharmacy">
                    <p className="pharmacy-name">💊 {alt.pharmacy.name}</p>
                    <p className="pharmacy-area">📍 {alt.pharmacy.area}</p>
                    {alt.distance && (
                      <p className="distance">🚗 {alt.distance} km away</p>
                    )}
                  </div>

                  {alt.availability && (
                    <div className="availability-indicator">
                      <span className={`availability-status availability-${alt.availability.level}`}>
                        {alt.availability.icon} {alt.availability.status}
                      </span>
                    </div>
                  )}

                  <div className="alternative-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => window.location.href = `tel:${alt.pharmacy.phone}`}
                    >
                      📞 Call
                    </button>
                    <ReserveButton 
                      medicine={alt}
                      pharmacy={alt.pharmacy}
                      className="btn-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="alternatives-footer">
            <p className="disclaimer">
              💡 <strong>Smart Tip:</strong> Generic medicines have the same active ingredients 
              as branded ones but are usually much cheaper!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineAlternatives;
