import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl, prescriptionAPI } from '../api';
import { useAuth } from '../AuthContext';
import './Prescription.css';

export default function PrescriptionResponse() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseData, setResponseData] = useState({
    medicines: [],
    message: ''
  });
  const [currentMedicine, setCurrentMedicine] = useState({
    name: '',
    available: true,
    price: 0,
    quantity: 0,
    deliveryTime: 30
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prescRes, statsRes] = await Promise.all([
        prescriptionAPI.getAvailablePrescriptions(),
        prescriptionAPI.getPrescriptionStats()
      ]);
      setPrescriptions(prescRes.data.prescriptions);
      setStats(statsRes.data);
    } catch (error) {
      showNotification('Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const addMedicine = () => {
    if (!currentMedicine.name) {
      showNotification('Please enter medicine name', 'warning');
      return;
    }
    setResponseData({
      ...responseData,
      medicines: [...responseData.medicines, currentMedicine]
    });
    setCurrentMedicine({
      name: '',
      available: true,
      price: 0,
      quantity: 0,
      deliveryTime: 30
    });
    showNotification('✅ Medicine added', 'success');
  };

  const removeMedicine = (index) => {
    setResponseData({
      ...responseData,
      medicines: responseData.medicines.filter((_, i) => i !== index)
    });
  };

  const handleRespond = async (prescriptionId) => {
    try {
      await prescriptionAPI.respondToPrescription(prescriptionId, responseData);
      showNotification('✅ Response submitted successfully!', 'success');
      setRespondingTo(null);
      setResponseData({ medicines: [], message: '' });
      loadData();
    } catch (error) {
      showNotification('Error submitting response: ' + error.message, 'error');
    }
  };

  if (!token) {
    return null;
  }

  if (loading) {
    return <div className="loading">Loading prescriptions...</div>;
  }

  return (
    <div className="prescription-container">
      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : notification.includes('✅') ? 'success' : 'info'}`}>
          {notification}
        </div>
      )}

      {/* Stats Section */}
      {stats && (
        <section className="stats-section">
          <h2>📊 Your Performance</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalResponses}</span>
              <span className="stat-label">Total Responses</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.conversions}</span>
              <span className="stat-label">Conversions</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.conversionRate}</span>
              <span className="stat-label">Conversion Rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.pendingPrescriptions}</span>
              <span className="stat-label">Pending Prescriptions</span>
            </div>
          </div>
        </section>
      )}

      {/* Available Prescriptions */}
      <section className="prescriptions-section">
        <h2>📋 Available Prescriptions</h2>

        {prescriptions.length > 0 ? (
          <div className="prescriptions-list">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="prescription-item">
                <div className="prescription-header">
                  <h3>👤 {prescription.user.name}</h3>
                  <span className="response-count">
                    💬 {prescription.responseCount} responses
                  </span>
                </div>

                <div className="prescription-preview">
                  <div className="preview-image">
                    <img
                      src={getAssetUrl(`prescriptions/${prescription.prescriptionImage}`)}
                      alt="Prescription"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x200?text=Rx';
                      }}
                    />
                  </div>

                  <div className="preview-info">
                    <p>
                      <strong>📱 Contact:</strong> {prescription.user.phone}
                    </p>
                    {prescription.description && (
                      <p>
                        <strong>📝 Notes:</strong> {prescription.description.substring(0, 100)}...
                      </p>
                    )}
                    {prescription.medicines && prescription.medicines.length > 0 && (
                      <p>
                        <strong>💊 Medicines:</strong> {prescription.medicines.map(m => m.name).join(', ')}
                      </p>
                    )}
                    <p className="uploaded-time">
                      ⏰ {new Date(prescription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {respondingTo === prescription._id ? (
                  <div className="response-form">
                    <h4>✍️ Your Response</h4>

                    <div className="form-group">
                      <label>Medicines You Have</label>
                      <div className="medicine-input-container">
                        <div className="medicine-input-group">
                          <input
                            type="text"
                            placeholder="Medicine name"
                            value={currentMedicine.name}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, name: e.target.value })}
                            className="form-input"
                          />
                          <select
                            value={currentMedicine.available}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, available: e.target.value === 'true' })}
                            className="form-select"
                          >
                            <option value="true">✅ In Stock</option>
                            <option value="false">❌ Out of Stock</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Price (₹)"
                            value={currentMedicine.price}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, price: parseFloat(e.target.value) })}
                            className="form-input"
                            min="0"
                            step="0.01"
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            value={currentMedicine.quantity}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, quantity: parseInt(e.target.value) })}
                            className="form-input"
                            min="0"
                          />
                          <input
                            type="number"
                            placeholder="Delivery (min)"
                            value={currentMedicine.deliveryTime}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, deliveryTime: parseInt(e.target.value) })}
                            className="form-input"
                            min="0"
                          />
                          <button
                            type="button"
                            onClick={addMedicine}
                            className="btn btn-secondary btn-sm"
                          >
                            ➕
                          </button>
                        </div>
                      </div>

                      {responseData.medicines.length > 0 && (
                        <div className="medicines-list">
                          {responseData.medicines.map((med, idx) => (
                            <div key={idx} className="medicine-chip">
                              <div>
                                <strong>{med.name}</strong>
                                {med.available ? (
                                  <span className="badge badge-available"> ✅</span>
                                ) : (
                                  <span className="badge badge-unavailable"> ❌</span>
                                )}
                                {med.price > 0 && <span> • ₹{med.price}</span>}
                                {med.quantity > 0 && <span> • Qty: {med.quantity}</span>}
                                {med.deliveryTime > 0 && <span> • {med.deliveryTime}min</span>}
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

                    <div className="form-group">
                      <label>Message (Optional)</label>
                      <textarea
                        value={responseData.message}
                        onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                        placeholder="E.g., We have generic alternatives, special discount available..."
                        rows={3}
                        className="form-textarea"
                        maxLength={200}
                      />
                      <small>{responseData.message.length}/200</small>
                    </div>

                    <div className="form-actions">
                      <button
                        onClick={() => handleRespond(prescription._id)}
                        className="btn btn-primary btn-sm"
                      >
                        ✅ Submit Response
                      </button>
                      <button
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseData({ medicines: [], message: '' });
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRespondingTo(prescription._id)}
                    className="btn btn-primary btn-block"
                  >
                    💬 Respond to This Prescription
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>✨ No new prescriptions nearby</p>
            <p className="info-text">Check back soon for new prescription requests</p>
          </div>
        )}
      </section>
    </div>
  );
}
