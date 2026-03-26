/**
 * 🚑 Emergency Medicine Finder Component
 * One-click access to nearby open pharmacies with medicines in stock
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyAPI, medicineAPI } from '../api';
import './EmergencyMedicineFinder.css';

export default function EmergencyMedicineFinder({ compact = false }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [notification, setNotification] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchMedicine, setSearchMedicine] = useState('');

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      (err) => {
        let message = 'Unable to get location. Please try again.';
        if (err?.code === err.PERMISSION_DENIED) {
          message = 'Location permission denied. Please allow location access.';
        } else if (err?.code === err.POSITION_UNAVAILABLE) {
          message = 'Location unavailable. Move to an open area and retry.';
        } else if (err?.code === err.TIMEOUT) {
          message = 'Location request timed out. Please retry.';
        }
        console.warn('Location error:', err?.message || 'Unknown geolocation error');
        showNotification(message, 'error');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  };

  const showNotification = (msg, type = 'info') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const findEmergencyPharmacies = async () => {
    if (!location.latitude || !location.longitude) {
      showNotification('📍 Getting your location...', 'info');
      getUserLocation();
      return;
    }

    setLoading(true);
    try {
      // Get open pharmacies within 5km
      const response = await pharmacyAPI.getEmergencyPharmacies(
        location.latitude,
        location.longitude,
        5,
        searchMedicine
      );

      const pharmacies = response.data.results || [];

      if (pharmacies.length === 0) {
        showNotification('❌ No open pharmacies found within 5km. Expanding search...', 'warning');
        // Try with 10km radius
        const response10 = await pharmacyAPI.getEmergencyPharmacies(
          location.latitude,
          location.longitude,
          10,
          searchMedicine
        );
        setResults(response10.data.results || []);
      } else {
        setResults(pharmacies);
        showNotification(`✅ Found ${pharmacies.length} open pharmacy(ies)!`, 'success');
      }

      setShowResults(true);
    } catch (error) {
      console.error('Emergency search error:', error);
      showNotification('Error finding pharmacies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCallPharmacy = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNavigateToPharmacy = (pharmacyId) => {
    navigate(`/pharmacy/${pharmacyId}`);
  };

  if (compact) {
    // Compact mode for Home page
    return (
      <div className="emergency-finder-compact">
        {notification && (
          <div className={`notification ${notification.includes('Error') || notification.includes('❌') ? 'error' : notification.includes('✅') ? 'success' : 'warning'}`}>
            {notification}
          </div>
        )}

        <div className="emergency-compact-title">Emergency Medicine</div>

        <div className="emergency-compact-controls">
          <input
            type="text"
            placeholder="Enter medicine name"
            value={searchMedicine}
            onChange={(e) => setSearchMedicine(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                findEmergencyPharmacies();
              }
            }}
            className="emergency-compact-input"
            aria-label="Emergency medicine name"
          />

          <button
            onClick={findEmergencyPharmacies}
            disabled={loading}
            className="btn-emergency-compact"
            title="Find open pharmacies nearby right now"
          >
            🚑 {loading ? 'Finding...' : 'Find'}
          </button>
        </div>
      </div>
    );
  }

  // Full page mode
  return (
    <div className="emergency-finder-container">
      {notification && (
        <div className={`notification ${notification.includes('Error') || notification.includes('❌') ? 'error' : notification.includes('✅') ? 'success' : 'warning'}`}>
          {notification}
        </div>
      )}

      <div className="emergency-header">
        <div className="emergency-icon-large">🚑</div>
        <h1>Emergency Medicine Finder</h1>
        <p>Find open pharmacies with medicines in stock near you</p>
      </div>

      <div className="search-section">
        <div className="location-status">
          {location.latitude ? (
            <div className="location-active">
              <span className="location-dot"></span>
              <span>Location detected ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})</span>
            </div>
          ) : (
            <div className="location-inactive">
              <span className="location-dot inactive"></span>
              <span>Detecting location...</span>
            </div>
          )}
        </div>

        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search specific medicine (optional)"
            value={searchMedicine}
            onChange={(e) => setSearchMedicine(e.target.value)}
            className="search-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') findEmergencyPharmacies();
            }}
          />
        </div>

        <div className="search-criteria">
          <div className="criteria-item">
            <span className="criteria-icon">⏰</span>
            <span>Open now</span>
          </div>
          <div className="criteria-item">
            <span className="criteria-icon">📍</span>
            <span>Within 5km</span>
          </div>
          <div className="criteria-item">
            <span className="criteria-icon">✓</span>
            <span>Stock available</span>
          </div>
        </div>

        <button
          onClick={findEmergencyPharmacies}
          disabled={loading || !location.latitude}
          className={`btn-emergency-primary ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Finding nearby pharmacies...
            </>
          ) : (
            <>🚑 Find Emergency Pharmacies Nearby</>
          )}
        </button>
      </div>

      {showResults && (
        <div className="results-section">
          {results.length > 0 ? (
            <>
              <div className="results-header">
                <h2>✅ Found {results.length} Pharmacy(ies) Open Now</h2>
                <p>All within 5km of your location</p>
              </div>

              <div className="pharmacy-results">
                {results.map((result, index) => (
                  <div key={result.pharmacy._id} className="emergency-pharmacy-card">
                    <div className="card-rank">#{index + 1}</div>

                    <div className="card-header">
                      <div className="pharmacy-name-section">
                        <h3>{result.pharmacy.name}</h3>
                        <span className="open-badge">🟢 OPEN NOW</span>
                      </div>
                      <div className="distance-info">
                        <span className="distance">{result.distanceKm?.toFixed(1) || '?'} km</span>
                        <span className="time">~{Math.ceil((result.distanceKm || 3) * 2)} min</span>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="info-group">
                        <div className="info-item">
                          <span className="label">📍 Address:</span>
                          <span className="value">{result.pharmacy.address || result.pharmacy.area}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">📞 Phone:</span>
                          <a href={`tel:${result.pharmacy.phone}`} className="value phone-link">
                            {result.pharmacy.phone}
                          </a>
                        </div>
                      </div>

                      {result.availableMedicines && result.availableMedicines.length > 0 && (
                        <div className="medicines-list">
                          <div className="medicines-header">
                            💊 Available Medicines ({result.availableMedicines.length})
                          </div>
                          <ul className="medicines">
                            {result.availableMedicines.slice(0, 5).map((medicine, idx) => (
                              <li key={idx} className="medicine-item">
                                <span className="med-name">{medicine.name}</span>
                                <span className="med-price">₹{medicine.price}</span>
                                <span className="med-stock">Qty: {medicine.stock}</span>
                              </li>
                            ))}
                            {result.availableMedicines.length > 5 && (
                              <li className="more-medicines">
                                +{result.availableMedicines.length - 5} more medicines
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="card-actions">
                      <button
                        onClick={() => handleCallPharmacy(result.pharmacy.phone)}
                        className="btn-action btn-call"
                      >
                        📞 Call Now
                      </button>
                      <button
                        onClick={() => handleNavigateToPharmacy(result.pharmacy._id)}
                        className="btn-action btn-navigate"
                      >
                        📍 Navigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <span className="empty-icon">😓</span>
              <h3>No open pharmacies found</h3>
              <p>Try increasing the search radius or try again later</p>
              <button
                onClick={() => setShowResults(false)}
                className="btn-secondary"
              >
                ← Back to Search
              </button>
            </div>
          )}
        </div>
      )}

      <div className="emergency-tips">
        <h4>💡 Emergency Medicine Tips</h4>
        <ul>
          <li>✓ Call the pharmacy first to confirm medicine availability</li>
          <li>✓ Ask about home delivery if available</li>
          <li>✓ Keep pharmacist contact numbers saved</li>
          <li>✓ For serious emergencies, contact emergency services (ambulance 102)</li>
        </ul>
      </div>
    </div>
  );
}
