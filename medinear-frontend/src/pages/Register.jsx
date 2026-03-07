import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    phone: '',
    password: '',
    confpassword: '',
    area: '',
    licenseNumber: '',
    latitude: null,
    longitude: null,
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState(''); // 'pending', 'success', 'error'
  const [locationLoading, setLocationLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getLocation = () => {
    setLocationLoading(true);
    setLocationStatus('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationStatus('error');
      setLocationLoading(false);
      return;
    }

    setLocationStatus('pending');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let areaName = '';
        let addressText = '';

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          addressText = data.address?.city || data.address?.town || data.address?.road || data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          // Prefer more granular locality names for `area`
          areaName = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.village || data.address?.town || data.address?.city || data.address?.county || data.address?.state || '';

          setFormData((prev) => ({
            ...prev,
            address: addressText,
            area: areaName || prev.area,
          }));
        } catch (err) {
          console.log('Reverse geocoding failed, using coordinates only');
        }

        setLocationStatus('success');
        setLocationLoading(false);

        // If we obtained an area name, populate and focus the area input so user can continue
        if (areaName) {
          setTimeout(() => {
            const el = document.getElementById('area');
            if (el) {
              el.value = areaName;
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.focus();
            }
          }, 100);
        }
      },
      (error) => {
        let errorMsg = 'Unable to get location';
        if (error.code === 1) {
          errorMsg = 'Location permission denied. Please allow location access in browser settings.';
        } else if (error.code === 2) {
          errorMsg = 'Location unavailable. Please check your location settings.';
        } else if (error.code === 3) {
          errorMsg = 'Location request timeout. Please try again.';
        }
        setError(errorMsg);
        setLocationStatus('error');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confpassword) {
      setError('❌ Passwords do not match. Please try again.');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('📍 Location permission required! Please click "Get Location" to share your pharmacy location.');
      return;
    }

    setLoading(true);

    try {
      const { confpassword, ...registerData } = formData;
      await authAPI.register(registerData);
      alert('✅ Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card pharmacy-register-card">
        <div className="auth-header">
          <div className="auth-icon pharmacy-icon">🏥</div>
          <h1 className="auth-title">🏥 MediNear</h1>
          <p className="auth-subtitle">Your Medicine Availability Platform</p>
          <p className="auth-subtitle" style={{marginTop: '8px', fontSize: '14px'}}>Pharmacy Registration</p>
        </div>

        {error && (
          <div className="error-message error-animated">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pharmacy-register-form">
          <div className="form-section">
            <h3 className="section-title">📊 Pharmacy Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <span className="label-icon">🏷️</span>
                  <span className="label-text">Pharmacy Name</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    placeholder="e.g., City Care Pharmacy"
                    required
                    className={focused === 'name' ? 'input-focused' : ''}
                  />
                  <span className="input-focus-border"></span>
                </div>
                <small className="field-hint">Official name of your pharmacy</small>
              </div>

              <div className="form-group">
                <label htmlFor="owner" className="form-label">
                  <span className="label-icon">👤</span>
                  <span className="label-text">Owner Name</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="owner"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    onFocus={() => setFocused('owner')}
                    onBlur={() => setFocused(null)}
                    placeholder="Your full name"
                    required
                    className={focused === 'owner' ? 'input-focused' : ''}
                  />
                  <span className="input-focus-border"></span>
                </div>
                <small className="field-hint">Pharmacy owner/manager name</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">📞 Contact Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <span className="label-icon">📱</span>
                  <span className="label-text">Phone Number</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setFocused('phone')}
                    onBlur={() => setFocused(null)}
                    placeholder="10-digit phone number"
                    required
                    className={focused === 'phone' ? 'input-focused' : ''}
                  />
                  <span className="input-focus-border"></span>
                </div>
                <small className="field-hint">Mobile number for communication</small>
              </div>

              <div className="form-group">
                <label htmlFor="area" className="form-label">
                  <span className="label-icon">📍</span>
                  <span className="label-text">Area/Location</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    onFocus={() => setFocused('area')}
                    onBlur={() => setFocused(null)}
                    placeholder="Your locality/area"
                    required
                    className={focused === 'area' ? 'input-focused' : ''}
                  />
                  <span className="input-focus-border"></span>
                </div>
                <small className="field-hint">City/Area where pharmacy is located</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">⚖️ Legal Information</h3>

            <div className="form-group full-width">
              <label htmlFor="licenseNumber" className="form-label">
                <span className="label-icon">📜</span>
                <span className="label-text">License Number</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  onFocus={() => setFocused('licenseNumber')}
                  onBlur={() => setFocused(null)}
                  placeholder="Pharmacy registration/license number"
                  required
                  className={focused === 'licenseNumber' ? 'input-focused' : ''}
                />
                <span className="input-focus-border"></span>
              </div>
              <small className="field-hint">Government registration number</small>
            </div>

            <div className="location-section">
              <div className="location-header">
                <div>
                  <label className="section-title">📍 Pharmacy Location</label>
                  <p className="location-hint">Required for customers to find you</p>
                </div>
                <button 
                  type="button"
                  className={`btn-location ${locationStatus}`}
                  onClick={getLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? '⏳ Getting...' : '📍 Get Location'}
                </button>
              </div>

              {locationStatus === 'success' && (
                <div className="location-display">
                  <div className="location-pin">✅ Location captured successfully</div>
                  <div className="location-coordinates">
                    <p><strong>Latitude:</strong> {formData.latitude?.toFixed(6)}</p>
                    <p><strong>Longitude:</strong> {formData.longitude?.toFixed(6)}</p>
                    {formData.address && <p><strong>Address:</strong> {formData.address}</p>}
                  </div>
                  <div className="map-preview">
                    <a 
                      href={`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      🗺️ View on Google Maps
                    </a>
                  </div>
                </div>
              )}

              {locationStatus === 'pending' && (
                <div className="location-pending">
                  ⏳ Requesting location permission... Please allow location access when prompted.
                </div>
              )}

              {locationStatus === 'error' && (
                <div className="location-error">
                  ❌ Location access denied. Please enable location in browser settings and try again.
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">🔐 Security</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <span className="label-icon">🔒</span>
                  <span className="label-text">Password</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="Minimum 6 characters"
                    required
                    className={focused === 'password' ? 'input-focused' : ''}
                  />
                  <span className="input-focus-border"></span>
                </div>
                <small className="field-hint">Strong password recommended</small>
              </div>

              <div className="form-group">
                <label htmlFor="confpassword" className="form-label">
                  <span className="label-icon">✓</span>
                  <span className="label-text">Confirm Password</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confpassword"
                    name="confpassword"
                    value={formData.confpassword}
                    onChange={handleChange}
                    onFocus={() => setFocused('confpassword')}
                    onBlur={() => setFocused(null)}
                    placeholder="Re-enter password"
                    required
                    className={focused === 'confpassword' ? 'input-focused' : ''}
                  />
                  <span className="input-focus-border"></span>
                </div>
                <small className="field-hint">Must match password above</small>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary btn-full btn-login ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            <span className="btn-icon">📝</span>
            <span className="btn-text">
              {loading ? 'Registration in progress...' : 'Complete Registration'}
            </span>
            {loading && <span className="btn-spinner"></span>}
          </button>
        </form>

        <div className="login-divider">
          <span>Already have an account?</span>
        </div>

        <Link to="/login" className="btn btn-secondary btn-full">
          <span className="btn-icon">🔓</span>
          <span className="btn-text">Login to Dashboard</span>
        </Link>

        <div className="login-footer">
          <Link to="/" className="footer-link">
            <span className="link-icon">🏠</span>
            Back to Home
          </Link>
          <a href="#support" className="footer-link">
            <span className="link-icon">❓</span>
            Support
          </a>
        </div>

        <div className="pharmacy-benefits">
          <p className="benefits-title">Registration Benefits:</p>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">👥</span>
              <span className="benefit-text">Connect with customers</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📊</span>
              <span className="benefit-text">Get analytics & insights</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span className="benefit-text">Increase revenue</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎯</span>
              <span className="benefit-text">Manage inventory online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
