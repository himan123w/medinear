import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../AuthContext';
import api from '../api';
import './PharmacyMapView.css';

// Custom marker icons for stock levels
const createMarkerIcon = (stockLevel) => {
  let color = '#4CAF50'; // Green - Available
  if (stockLevel === 'low') {
    color = '#FFC107'; // Orange - Low stock
  } else if (stockLevel === 'out') {
    color = '#f44336'; // Red - Out of stock
  }

  return L.divIcon({
    html: `<div class="marker-icon" style="background-color: ${color}; border-color: ${color};">
      <span class="marker-text">💊</span>
    </div>`,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// User location marker
const userLocationIcon = L.divIcon({
  html: `<div class="user-marker">
    <span class="user-marker-text">📍</span>
  </div>`,
  className: 'user-location-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function PharmacyMapView({ compact = false, medicineName = '' }) {
  const { token, user } = useAuth();
  const [pharmacies, setPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user location on mount
  useEffect(() => {
    if (token && user?.location) {
      setUserLocation(user.location);
      fetchNearbyPharmacies(user.location);
    } else if (token) {
      requestUserLocation();
    }
  }, [token, medicineName]);

  const requestUserLocation = () => {
    const fallbackLocation = { latitude: 40.7128, longitude: -74.0060 };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          fetchNearbyPharmacies(location);
        },
        () => {
          // Fallback to a known location so map data still loads.
          setUserLocation(fallbackLocation);
          fetchNearbyPharmacies(fallbackLocation);
        }
      );
    } else {
      setUserLocation(fallbackLocation);
      fetchNearbyPharmacies(fallbackLocation);
    }
  };

  const fetchNearbyPharmacies = async (location) => {
    try {
      setLoading(true);
      const response = await api.get('/pharmacy/nearby', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 10,
          ...(medicineName && { medicineName }),
        },
      });

      if (response.data.success) {
        setPharmacies(response.data.pharmacies || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching nearby pharmacies:', err);
      setError('Failed to load nearby pharmacies');
    } finally {
      setLoading(false);
    }
  };

  // Map center component to handle bounds
  const MapCenter = () => {
    const map = useMap();
    
    useEffect(() => {
      if (userLocation) {
        map.flyTo([userLocation.latitude, userLocation.longitude], 14, {
          duration: 1.5,
        });
      }
    }, [userLocation, map]);

    return null;
  };

  if (!token || !userLocation) {
    return (
      <div className={`pharmacy-map-loading ${compact ? 'compact' : ''}`}>
        <p>📍 Requesting location...</p>
      </div>
    );
  }

  const mapHeight = compact ? '300px' : '500px';

  return (
    <div className={`pharmacy-map-view ${compact ? 'compact' : 'full'}`}>
      {/* Header */}
      {!compact && (
        <div className="map-header">
          <h2>🗺️ Pharmacy Map View</h2>
          <p>
            {medicineName
              ? `Find pharmacies with ${medicineName} near you`
              : 'Discover nearby pharmacies and their stock status'}
          </p>
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-marker available">
                <span className="marker-circle">📍</span>
              </div>
              <span className="legend-text">
                <strong>Green</strong> - In Stock
              </span>
            </div>
            <div className="legend-item">
              <div className="legend-marker low">
                <span className="marker-circle">📍</span>
              </div>
              <span className="legend-text">
                <strong>Yellow</strong> - Low Stock
              </span>
            </div>
            <div className="legend-item">
              <div className="legend-marker out">
                <span className="marker-circle">📍</span>
              </div>
              <span className="legend-text">
                <strong>Red</strong> - Out of Stock
              </span>
            </div>
            <div className="legend-item">
              <div className="legend-marker user">
                <span className="marker-circle">📍</span>
              </div>
              <span className="legend-text">
                <strong>Blue</strong> - Your Location
              </span>
            </div>
          </div>
          <div className="map-stats">
            <div className="stat-box">
              <span className="stat-icon">📍</span>
              <div className="stat-info">
                <span className="stat-name">Pharmacies Found</span>
                <span className="stat-number">{pharmacies.length}</span>
              </div>
            </div>
            {pharmacies.length > 0 && (
              <>
                <div className="stat-box">
                  <span className="stat-icon">✓</span>
                  <div className="stat-info">
                    <span className="stat-name">In Stock</span>
                    <span className="stat-number">
                      {pharmacies.filter(p => p.stockStatus === 'available' || p.stockStatus === 'in-stock').length}
                    </span>
                  </div>
                </div>
                <div className="stat-box">
                  <span className="stat-icon">⚠</span>
                  <div className="stat-info">
                    <span className="stat-name">Low Stock</span>
                    <span className="stat-number">
                      {pharmacies.filter(p => p.stockStatus === 'low').length}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="map-container" style={{ height: mapHeight }}>
        {loading ? (
          <div className="map-loading">
            <p>⏳ Loading map...</p>
          </div>
        ) : error ? (
          <div className="map-error">
            <p>⚠️ {error}</p>
          </div>
        ) : (
          <MapContainer
            center={[userLocation.latitude, userLocation.longitude]}
            zoom={14}
            scrollWheelZoom={true}
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
            >
              <Popup className="user-popup">
                <div className="popup-content">
                  <h4>📍 Your Location</h4>
                  <p>
                    {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Pharmacy Markers */}
            {pharmacies.map((pharmacy, index) => {
              const distance = pharmacy.distanceKm || 0;
              const stockLevel = pharmacy.stockStatus || 'available';
              const markerIcon = createMarkerIcon(stockLevel);

              return (
                <Marker
                  key={pharmacy._id || index}
                  position={[
                    pharmacy.location?.coordinates[1] || pharmacy.latitude,
                    pharmacy.location?.coordinates[0] || pharmacy.longitude,
                  ]}
                  icon={markerIcon}
                >
                  <Popup className="pharmacy-popup">
                    <div className="popup-content">
                      <h4>{pharmacy.name}</h4>
                      <div className="popup-info">
                        <p>
                          <span className="info-label">📍 Distance:</span>
                          <span className="info-value">{distance.toFixed(1)} km</span>
                        </p>
                        <p>
                          <span className="info-label">📍 Address:</span>
                          <span className="info-value">{pharmacy.area}</span>
                        </p>
                        <p>
                          <span className="info-label">📞 Phone:</span>
                          <span className="info-value">{pharmacy.phone}</span>
                        </p>
                        <p>
                          <span className="info-label">⏰ Status:</span>
                          <span className={`status-badge status-${pharmacy.openStatus || 'open'}`}>
                            {pharmacy.openStatus === '24x7'
                              ? '🟢 24x7 Open'
                              : pharmacy.openStatus === 'open'
                              ? '🟢 Open'
                              : '🔴 Closed'}
                          </span>
                        </p>
                        {pharmacy.stockLevel && (
                          <p>
                            <span className="info-label">📦 Stock:</span>
                            <span className={`stock-badge stock-${stockLevel}`}>
                              {stockLevel === 'available'
                                ? '✓ Available'
                                : stockLevel === 'low'
                                ? '⚠ Low'
                                : '✗ Out'}
                            </span>
                          </p>
                        )}
                        {pharmacy.ratingScore && (
                          <p>
                            <span className="info-label">⭐ Rating:</span>
                            <span className="info-value">{pharmacy.ratingScore.toFixed(1)}/5</span>
                          </p>
                        )}
                      </div>
                      <div className="popup-actions">
                        <button className="action-btn call-btn" onClick={() => window.location.href = `tel:${pharmacy.phone}`}>
                          📞 Call
                        </button>
                        <button
                          className="action-btn navigate-btn"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`,
                              '_blank'
                            )
                          }
                        >
                          🗺️ Navigate
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            <MapCenter />
          </MapContainer>
        )}
      </div>

      {/* Pharmacy List (non-compact) */}
      {!compact && pharmacies.length > 0 && (
        <div className="map-pharmacy-list">
          <h3>📍 Nearby Pharmacies ({pharmacies.length})</h3>
          <div className="pharmacy-items">
            {pharmacies.slice(0, 10).map((pharmacy, index) => (
              <div key={pharmacy._id || index} className="pharmacy-item">
                <div className="pharmacy-item-header">
                  <div className="pharmacy-name-distance">
                    <h4>{pharmacy.name}</h4>
                    <span className="distance-badge">
                      📍 {pharmacy.distanceKm?.toFixed(1) || 0} km
                    </span>
                  </div>
                  <span className={`status-badge status-${pharmacy.openStatus || 'open'}`}>
                    {pharmacy.openStatus === '24x7' ? '24x7' : pharmacy.openStatus === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="pharmacy-area">{pharmacy.area}</p>
                <div className="pharmacy-item-footer">
                  <div className="stock-info">
                    {pharmacy.stockLevel && (
                      <span className={`stock-label stock-${pharmacy.stockStatus || 'available'}`}>
                        {pharmacy.stockStatus === 'available'
                          ? '✓ Available'
                          : pharmacy.stockStatus === 'low'
                          ? '⚠ Low Stock'
                          : '✗ Out of Stock'}
                      </span>
                    )}
                  </div>
                  <div className="pharmacy-actions">
                    <button className="mini-btn" onClick={() => window.location.href = `tel:${pharmacy.phone}`}>
                      📞
                    </button>
                    <button
                      className="mini-btn"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`,
                          '_blank'
                        )
                      }
                    >
                      🗺️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && pharmacies.length === 0 && (
        <div className="no-pharmacies">
          <p>📍 No pharmacies found in your area</p>
          <p>Try searching for a specific medicine or expanding the search radius</p>
        </div>
      )}
    </div>
  );
}
