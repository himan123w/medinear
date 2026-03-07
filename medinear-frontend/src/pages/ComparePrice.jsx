import { useState, useEffect } from 'react';
import { medicineAPI } from '../api';
import { getOrCreateDeviceId } from '../utils/deviceId';
import './Prescription.css';
// Leaflet map imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

export default function ComparePrice() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [medicineName, setMedicineName] = useState('');
  const [radius, setRadius] = useState(5);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [alternatives, setAlternatives] = useState(null);
  const [notification, setNotification] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [showMap, setShowMap] = useState(false);
  const [manualLocation, setManualLocation] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser');
      setManualLocation(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      (err) => {
        console.error('Location error:', err);
        showNotification('Unable to retrieve your location. Please allow location access.');
        setManualLocation(true);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSearch = async () => {
    if (!medicineName.trim()) {
      showNotification('Please enter a medicine name');
      return;
    }
    if (!location.latitude || !location.longitude) {
      showNotification('Location required. Please enable location access or enter manually.');
      return;
    }

    try {
      setLoading(true);
      const res = await medicineAPI.comparePrices(
        medicineName,
        location.latitude,
        location.longitude,
        radius,
        limit,
        getOrCreateDeviceId()
      );
      
      let sorted = [...(res.data.results || [])];
      
      if (sortBy === 'price') {
        sorted.sort((a, b) => a.medicine.price - b.medicine.price);
      } else if (sortBy === 'distance') {
        sorted.sort((a, b) => a.distance - b.distance);
      } else if (sortBy === 'combo') {
        // Price + distance score (normalized)
        sorted.sort((a, b) => {
          const scoreA = (a.medicine.price / 100) + (a.distance / 5);
          const scoreB = (b.medicine.price / 100) + (b.distance / 5);
          return scoreA - scoreB;
        });
      }
      
      setResults(sorted);
      
      // Handle alternatives if present
      if (res.data.alternatives) {
        let altSorted = [...(res.data.alternatives.results || [])];
        altSorted.sort((a, b) => a.medicine.price - b.medicine.price);
        setAlternatives({
          ...res.data.alternatives,
          results: altSorted
        });
        showNotification(`"${medicineName}" not available. Showing alternatives: ${res.data.alternatives.suggestedMedicines.join(', ')}`);
      } else {
        setAlternatives(null);
      }
      
      if (sorted.length === 0 && !res.data.alternatives) {
        showNotification('No medicines found nearby. Try increasing the radius.');
      }
    } catch (error) {
      console.error('Price comparison error:', error);
      showNotification('Error comparing prices: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    let sorted = [...results];
    
    if (newSort === 'price') {
      sorted.sort((a, b) => a.medicine.price - b.medicine.price);
    } else if (newSort === 'distance') {
      sorted.sort((a, b) => a.distance - b.distance);
    } else if (newSort === 'combo') {
      sorted.sort((a, b) => {
        const scoreA = (a.medicine.price / 100) + (a.distance / 5);
        const scoreB = (b.medicine.price / 100) + (b.distance / 5);
        return scoreA - scoreB;
      });
    }
    
    setResults(sorted);
  };

  const handleCallPharmacy = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  // renderResults abstracts nested ternaries for clarity
  const renderResults = () => {
    if (results.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>💡 Enter a medicine name and search to compare prices across nearby pharmacies.</p>
          <p style={{ fontSize: '13px', color: '#bbb' }}>Find the best deal with location-based price comparison.</p>
        </div>
      );
    }

    if (showMap) {
      return (
        <div style={{ height: '500px', marginBottom: '20px' }}>
          <MapContainer
            center={[location.latitude || 0, location.longitude || 0]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {results.map((result, idx) => (
              <Marker
                key={idx}
                position={[result.pharmacy.latitude, result.pharmacy.longitude]}
              >
                <Popup>
                  <div style={{ minWidth: '150px' }}>
                    <strong>{result.pharmacy.name}</strong><br/>
                    {result.medicine.name} ₹{result.medicine.price.toFixed(2)}<br/>
                    {result.distance.toFixed(1)} km<br/>
                    <button
                      onClick={() => handleCallPharmacy(result.pharmacy.phone)}
                      style={{
                        marginTop: '6px',
                        padding: '4px 8px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      📞 Call
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      );
    }

    // default to list
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Pharmacy Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Address</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Price</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Distance</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Stock</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Availability</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid #eee',
                  background: idx % 2 === 0 ? '#fafafa' : 'white'
                }}
              >
                <td style={{ padding: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                  {result.pharmacy.name}
                </td>
                <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                  {result.pharmacy.address || 'N/A'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#2196F3' }}>
                  ₹{result.medicine.price.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                  {result.distance.toFixed(1)} km
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: result.medicine.stock > 0 ? '#4CAF50' : '#f44336' }}>
                  {result.medicine.stock > 0 ? `${result.medicine.stock} units` : 'Out of Stock'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {result.medicine.availability && (
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '6px 0'
                    }}>
                      <div style={{ marginBottom: '4px' }}>
                        {result.medicine.availability.icon} {result.medicine.availability.confidence.score}%
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {result.medicine.availability.status}
                      </div>
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleCallPharmacy(result.pharmacy.phone)}
                    style={{
                      padding: '6px 12px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    📞 Call
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="prescription-container">
      <div className="prescriptions-section">
        <h2>💊 Medicine Price Comparison</h2>

        {notification && (
          <div style={{
            background: '#f0f0f0',
            color: '#333',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #ddd'
          }}>
            {notification}
          </div>
        )}

        {/* Search Form */}
        <div style={{
          background: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Medicine Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Aspirin, Paracetamol, Amoxicillin"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {manualLocation && (
            <>
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Latitude *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 40.7128"
                    value={location.latitude || ''}
                    onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) })}
                    step="0.0001"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Longitude *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., -74.0060"
                    value={location.longitude || ''}
                    onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) })}
                    step="0.0001"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {!manualLocation && location.latitude && (
            <div style={{ marginBottom: '16px', fontSize: '13px', color: '#666', background: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
              📍 Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          )}

          <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                Radius (km)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Math.max(1, parseFloat(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                Max Results
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {manualLocation && (
            <button
              onClick={getUserLocation}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '12px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              🔄 Detect Location Again
            </button>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '15px'
            }}
          >
            {loading ? '🔍 Comparing Prices...' : '🔍 Compare Prices'}
          </button>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Found {results.length} pharmacy/pharmacies</strong> with <strong>{medicineName}</strong> available
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleSortChange('price')}
                style={{
                  padding: '8px 12px',
                  background: sortBy === 'price' ? '#4CAF50' : '#ddd',
                  color: sortBy === 'price' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                💰 By Price
              </button>
              <button
                onClick={() => handleSortChange('distance')}
                style={{
                  padding: '8px 12px',
                  background: sortBy === 'distance' ? '#4CAF50' : '#ddd',
                  color: sortBy === 'distance' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                📍 By Distance
              </button>
              <button
                onClick={() => handleSortChange('combo')}
                style={{
                  padding: '8px 12px',
                  background: sortBy === 'combo' ? '#4CAF50' : '#ddd',
                  color: sortBy === 'combo' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                ⚡ Best Deal
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                style={{
                  padding: '8px 12px',
                  background: showMap ? '#2196F3' : '#ddd',
                  color: showMap ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                🗺️ {showMap ? 'List View' : 'Map View'}
              </button>
            </div>
          </div>
        )}

        {/* Results Table or Map */}
        {renderResults()}
        {/* Alternatives Section */}
        {alternatives && alternatives.results && alternatives.results.length > 0 && (
          <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1a1a1a' }}>
              💊 Suggested Alternatives
            </h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              These medicines have similar uses and are available nearby:
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Medicine Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Pharmacy Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Address</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Distance</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Stock</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Availability</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alternatives.results.map((result, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #eee',
                        background: idx % 2 === 0 ? '#fafafa' : 'white'
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: '600', color: '#e67e22' }}>
                        {result.medicine.name}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                        {result.pharmacy.name}
                      </td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                        {result.pharmacy.address || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#2196F3' }}>
                        ₹{result.medicine.price.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                        {result.distance.toFixed(1)} km
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: result.medicine.stock > 0 ? '#4CAF50' : '#f44336' }}>
                        {result.medicine.stock > 0 ? `${result.medicine.stock} units` : 'Out of Stock'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {result.medicine.availability && (
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '6px 0'
                          }}>
                            <div style={{ marginBottom: '4px' }}>
                              {result.medicine.availability.icon} {result.medicine.availability.confidence.score}%
                            </div>
                            <div style={{ fontSize: '11px', color: '#666' }}>
                              {result.medicine.availability.status}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleCallPharmacy(result.pharmacy.phone)}
                          style={{
                            padding: '6px 12px',
                            background: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          📞 Call
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
