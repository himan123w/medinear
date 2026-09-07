import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssetUrl, prescriptionAPI } from '../api';
import { useAuth } from '../AuthContext';
import './Prescription.css';

export default function PrescriptionDetail() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      loadPrescription();
    }
  }, [prescriptionId, token]);

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const response = await prescriptionAPI.getPrescriptionDetail(prescriptionId);
      setPrescription(response.data);
    } catch (error) {
      showNotification('Error loading prescription: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSelectPharmacy = async (pharmacyId) => {
    try {
      setIsSelecting(true);
      await prescriptionAPI.selectPharmacy(prescriptionId, pharmacyId);
      showNotification('✅ Pharmacy selected! They will contact you soon.', 'success');
      loadPrescription();
      setSelectedPharmacyId(null);
    } catch (error) {
      showNotification('Error selecting pharmacy: ' + error.message, 'error');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionAPI.deletePrescription(prescriptionId);
        showNotification('✅ Prescription deleted', 'success');
        navigate('/prescriptions');
      } catch (error) {
        showNotification('Error deleting prescription: ' + error.message, 'error');
      }
    }
  };

  if (!token) {
    return null;
  }

  if (loading) {
    return <div className="loading">Loading prescription...</div>;
  }

  if (!prescription) {
    return <div className="error">Prescription not found</div>;
  }

  const isExpired = new Date(prescription.expiryDate) < new Date();
  const statusColors = {
    pending: '#ffa94d',
    responded: '#667eea',
    completed: '#51cf66',
    expired: '#ff6b6b'
  };

  return (
    <div className="prescription-container">
      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : notification.includes('✅') ? 'success' : 'info'}`}>
          {notification}
        </div>
      )}

      <div className="prescription-detail">
        {/* Header */}
        <header className="detail-header">
          <div className="header-content">
            <h1>📋 Prescription Details</h1>
            <div className="header-meta">
              <div className="status-badge" style={{ backgroundColor: statusColors[prescription.status] }}>
                {prescription.status.toUpperCase()}
              </div>
              <span className="meta-text">
                📍 Views: {prescription.views}
              </span>
              <span className="meta-text">
                💬 Responses: {prescription.responseCount}
              </span>
            </div>
          </div>
          {prescription.user._id === user?.id && (
            <button
              onClick={handleDeletePrescription}
              className="btn btn-danger btn-sm"
              title="Delete prescription"
            >
              🗑️ Delete
            </button>
          )}
        </header>

        {/* Image Preview */}
        <section className="image-section">
          <h3>📸 Prescription Image</h3>
          <div className="image-container">
            <img
              src={getAssetUrl(`prescriptions/${prescription.prescriptionImage}`)}
              alt="Prescription"
              className="prescription-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Available';
              }}
            />
            <div className="image-info">
              <p>📅 Uploaded: {new Date(prescription.uploadedAt).toLocaleDateString()}</p>
              <p>⏰ Expires: {new Date(prescription.expiryDate).toLocaleDateString()}</p>
              {isExpired && <p className="warning">⚠️ This prescription has expired</p>}
            </div>
          </div>
        </section>

        {/* Description */}
        {prescription.description && (
          <section className="description-section">
            <h3>💬 Additional Notes</h3>
            <p className="description-text">{prescription.description}</p>
          </section>
        )}

        {/* Medicines */}
        {prescription.medicines && prescription.medicines.length > 0 && (
          <section className="medicines-section">
            <h3>💊 Medicines Listed</h3>
            <div className="medicines-grid">
              {prescription.medicines.map((med, idx) => (
                <div key={idx} className="medicine-card">
                  <h4>{med.name}</h4>
                  {med.quantity && <p>📦 {med.quantity}</p>}
                  {med.dosage && <p>💊 {med.dosage}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pharmacy Responses */}
        <section className="responses-section">
          <header className="section-header">
            <h3>🏥 Pharmacy Responses ({prescription.responses.length})</h3>
            {prescription.status === 'pending' && (
              <span className="waiting-badge">⏳ Waiting for responses...</span>
            )}
          </header>

          {prescription.responses.length > 0 ? (
            <div className="responses-grid">
              {prescription.responses.map((response, idx) => (
                <div
                  key={idx}
                  className={`response-card ${selectedPharmacyId === response.pharmacy._id ? 'selected' : ''}`}
                >
                  <div className="pharmacy-info">
                    <h4>💊 {response.pharmacyName}</h4>
                    <p className="pharmacy-meta">
                      📞 {response.pharmacyPhone}
                    </p>
                    <p className="pharmacy-meta">
                      📍 {response.pharmacyArea}
                    </p>
                    <p className="responded-time">
                      ⏰ Responded: {new Date(response.respondedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {response.medicines && response.medicines.length > 0 && (
                    <div className="response-medicines">
                      <h5>Available Medicines:</h5>
                      <ul>
                        {response.medicines.map((med, idx) => (
                          <li key={idx}>
                            <span className="medicine-name">{med.name}</span>
                            {med.available ? (
                              <span className="badge badge-available">✅ In Stock</span>
                            ) : (
                              <span className="badge badge-unavailable">❌ Not Available</span>
                            )}
                            {med.price && (
                              <span className="price">₹{med.price}</span>
                            )}
                            {med.deliveryTime && (
                              <span className="delivery">🚚 {med.deliveryTime} min</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.message && (
                    <div className="response-message">
                      <p>{response.message}</p>
                    </div>
                  )}

                  {prescription.user._id === user?.id && prescription.status !== 'completed' && (
                    <button
                      onClick={() => handleSelectPharmacy(response.pharmacy._id)}
                      disabled={isSelecting}
                      className={`btn ${selectedPharmacyId === response.pharmacy._id ? 'btn-success' : 'btn-primary'} btn-sm btn-block`}
                    >
                      {selectedPharmacyId === response.pharmacy._id ? '✅ Selected' : '🛍️ Select This Pharmacy'}
                    </button>
                  )}

                  {prescription.selectedPharmacy === response.pharmacy._id && (
                    <div className="selected-indicator">
                      ✅ You selected this pharmacy
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-responses">
              <p>⏳ Waiting for pharmacy responses...</p>
              <p className="info-text">Nearby pharmacies will respond with their availability</p>
            </div>
          )}
        </section>

        {/* Conversion Status */}
        <section className="conversion-section">
          <h3>📊 Status</h3>
          <div className="status-info">
            <div className="status-item">
              <span className="status-icon">📍</span>
              <span>Views: {prescription.views}</span>
            </div>
            <div className="status-item">
              <span className="status-icon">💬</span>
              <span>Responses: {prescription.responseCount}</span>
            </div>
            <div className="status-item">
              <span className="status-icon">🔄</span>
              <span>Status: <strong>{prescription.conversionStatus.toUpperCase()}</strong></span>
            </div>
            <div className="status-item">
              <span className="status-icon">⏰</span>
              <span>Expires: {new Date(prescription.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
