import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { prescriptionAPI } from '../api';
import { useAuth } from '../AuthContext';
import './Prescription.css';

export default function PrescriptionUpload() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    prescriptionImage: null,
    description: '',
    medicines: []
  });
  const [medicines, setMedicines] = useState([]);
  const [currentMedicine, setCurrentMedicine] = useState({
    name: '',
    quantity: '',
    dosage: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const showNotification = (msg, type = 'info') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const getUserLocation = async () => {
    setLocationLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            showNotification('✅ Location detected', 'success');
          },
          (error) => {
            showNotification(`❌ Error: ${error.message}`, 'error');
          }
        );
      } else {
        showNotification('❌ Geolocation not supported', 'error');
      }
    } catch (error) {
      showNotification('Error getting location: ' + error.message, 'error');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size exceeds 5 MB limit', 'error');
        return;
      }
      setFormData({ ...formData, prescriptionImage: file });
      showNotification(`📷 Image selected: ${file.name}`, 'success');
    }
  };

  const addMedicine = () => {
    if (!currentMedicine.name) {
      showNotification('Please enter medicine name', 'warning');
      return;
    }
    setMedicines([...medicines, currentMedicine]);
    setCurrentMedicine({ name: '', quantity: '', dosage: '' });
    showNotification('✅ Medicine added', 'success');
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.prescriptionImage) {
      showNotification('Please upload a prescription image', 'warning');
      return;
    }

    if (!userLocation.latitude || !userLocation.longitude) {
      showNotification('Please enable GPS location', 'warning');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('prescriptionImage', formData.prescriptionImage);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('medicines', JSON.stringify(medicines));
      formDataToSend.append('latitude', userLocation.latitude);
      formDataToSend.append('longitude', userLocation.longitude);

      const response = await prescriptionAPI.uploadPrescription(formDataToSend);

      showNotification(
        `✅ Prescription uploaded! Found ${response.data.nearbyPharmaciesCount} nearby pharmacies responding...`,
        'success'
      );

      // Redirect to prescription detail
      setTimeout(() => {
        navigate(`/prescriptions/${response.data.prescriptionId}`);
      }, 2000);
    } catch (error) {
      showNotification('Error uploading prescription: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="prescription-container">
      {notification && (
        <div className={`notification ${notification.includes('Error') || notification.includes('❌') ? 'error' : notification.includes('✅') ? 'success' : 'info'}`}>
          {notification}
        </div>
      )}

      <section className="prescription-upload-section">
        <header className="upload-header">
          <h1>📋 Upload Your Prescription</h1>
          <p>Get instant responses from nearby pharmacies</p>
        </header>

        <form onSubmit={handleSubmit} className="prescription-form">
          {/* Location Section */}
          <div className="form-section">
            <h3>📍 Your Location</h3>
            {userLocation.latitude ? (
              <div className="location-display">
                <p className="location-info">
                  ✅ <strong>Latitude:</strong> {userLocation.latitude.toFixed(4)},
                  <strong> Longitude:</strong> {userLocation.longitude.toFixed(4)}
                </p>
                <button
                  type="button"
                  onClick={getUserLocation}
                  className="btn btn-secondary btn-sm"
                >
                  🔄 Update Location
                </button>
              </div>
            ) : (
              <div className="location-prompt">
                <p>Enable location to find nearby pharmacies</p>
                <button
                  type="button"
                  onClick={getUserLocation}
                  className="btn btn-primary"
                  disabled={locationLoading}
                >
                  {locationLoading ? '🔄 Getting Location...' : '📍 Enable GPS'}
                </button>
              </div>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="form-section">
            <h3>📷 Prescription Image</h3>
            <div className="image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                id="prescription-image"
              />
              <label htmlFor="prescription-image" className="image-upload-label">
                {formData.prescriptionImage ? (
                  <div className="upload-preview">
                    <p>✅ {formData.prescriptionImage.name}</p>
                    <small>{(formData.prescriptionImage.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <p>📤 Tap to upload prescription image</p>
                    <small>PNG, JPG, WebP • Max 5 MB</small>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Description Section */}
          <div className="form-section">
            <h3>💬 Additional Notes (Optional)</h3>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Any additional information about your prescription..."
              maxLength={500}
              rows={4}
              className="form-textarea"
            />
            <small>{formData.description.length}/500 characters</small>
          </div>

          {/* Medicines List Section */}
          <div className="form-section">
            <h3>💊 Medicines (Optional)</h3>
            <div className="medicine-input-container">
              <div className="medicine-input-group">
                <input
                  type="text"
                  placeholder="Medicine name"
                  value={currentMedicine.name}
                  onChange={(e) => setCurrentMedicine({ ...currentMedicine, name: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Quantity (e.g., 1 bottle)"
                  value={currentMedicine.quantity}
                  onChange={(e) => setCurrentMedicine({ ...currentMedicine, quantity: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 500mg)"
                  value={currentMedicine.dosage}
                  onChange={(e) => setCurrentMedicine({ ...currentMedicine, dosage: e.target.value })}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={addMedicine}
                  className="btn btn-secondary btn-sm"
                >
                  ➕ Add
                </button>
              </div>
            </div>

            {medicines.length > 0 && (
              <div className="medicines-list">
                {medicines.map((med, idx) => (
                  <div key={idx} className="medicine-chip">
                    <div>
                      <strong>{med.name}</strong>
                      {med.quantity && <span> • {med.quantity}</span>}
                      {med.dosage && <span> • {med.dosage}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="btn-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !formData.prescriptionImage || !userLocation.latitude}
            >
              {loading ? '🔄 Uploading...' : '📤 Upload Prescription'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary btn-lg"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Benefits Section */}
        <section className="benefits-section">
          <h3>Why upload your prescription?</h3>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">🤝</span>
              <h4>Build Trust</h4>
              <p>Direct pharmacy responses increase confidence in availability</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">⚡</span>
              <h4>Serious Users</h4>
              <p>Attract pharmacies by showing genuine medical needs</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">💰</span>
              <h4>Better Deals</h4>
              <p>Get competitive offers directly from nearby pharmacies</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🚚</span>
              <h4>Quick Delivery</h4>
              <p>Get medicines directly from nearby pharmacy locations</p>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
