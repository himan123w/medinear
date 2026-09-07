import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl, prescriptionAPI } from '../api';
import { useAuth } from '../AuthContext';
import './Prescription.css';

export default function PrescriptionList() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      loadPrescriptions();
    }
  }, [token, filter, page]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? null : filter;
      const response = await prescriptionAPI.getMyPrescriptions(page, ITEMS_PER_PAGE, status);
      setPrescriptions(response.data.prescriptions);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
    } catch (error) {
      showNotification('Error loading prescriptions: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDelete = async (prescriptionId) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionAPI.deletePrescription(prescriptionId);
        showNotification('✅ Prescription deleted', 'success');
        loadPrescriptions();
      } catch (error) {
        showNotification('Error deleting prescription: ' + error.message, 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: '⏳ Pending',
      responded: '💬 Responded',
      completed: '✅ Completed',
      expired: '❌ Expired'
    };
    return badges[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-pending',
      responded: 'badge-responded',
      completed: 'badge-completed',
      expired: 'badge-expired'
    };
    return colors[status] || '';
  };

  const getDaysRemaining = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Expired';
    if (days === 1) return 'Expires today';
    return `${days} days remaining`;
  };

  if (!token) {
    return null;
  }

  if (loading) {
    return <div className="loading">Loading your prescriptions...</div>;
  }

  return (
    <div className="prescription-container">
      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : notification.includes('✅') ? 'success' : 'info'}`}>
          {notification}
        </div>
      )}

      <section className="prescriptions-section">
        <div className="section-header">
          <h2>📋 My Prescriptions</h2>
          <button
            onClick={() => navigate('/upload-prescription')}
            className="btn btn-primary"
          >
            ➕ Upload New Prescription
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          {['all', 'pending', 'responded', 'completed', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
            >
              {status === 'all' ? '📩 All' : status === 'pending' ? '⏳ Pending' : status === 'responded' ? '💬 Responded' : status === 'completed' ? '✅ Completed' : '❌ Expired'}
            </button>
          ))}
        </div>

        {prescriptions.length > 0 ? (
          <>
            <div className="prescriptions-list">
              {prescriptions.map((prescription) => (
                <div key={prescription._id} className="prescription-card">
                  <div className="card-header">
                    <div className="header-left">
                      <h3>Prescription #{prescription._id.slice(-6).toUpperCase()}</h3>
                      <span className={`badge ${getStatusColor(prescription.status)}`}>
                        {getStatusBadge(prescription.status)}
                      </span>
                    </div>
                    <div className="header-right">
                      <span className="uploaded-date">
                        📅 {new Date(prescription.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="card-content">
                    {prescription.prescriptionImage && (
                      <div className="card-image">
                        <img
                          src={getAssetUrl(`prescriptions/${prescription.prescriptionImage}`)}
                          alt="Prescription"
                          onClick={() => navigate(`/prescription/${prescription._id}`)}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/120x180?text=Rx';
                          }}
                        />
                      </div>
                    )}

                    <div className="card-info">
                      {prescription.description && (
                        <p className="description">
                          <strong>📝 Notes:</strong> {prescription.description.substring(0, 100)}
                          {prescription.description.length > 100 ? '...' : ''}
                        </p>
                      )}

                      {prescription.medicines && prescription.medicines.length > 0 && (
                        <p>
                          <strong>💊 Medicines:</strong> {prescription.medicines.length} items
                        </p>
                      )}

                      <div className="stats">
                        <span>👁️ {prescription.viewCount || 0} views</span>
                        <span>💬 {prescription.responseCount || 0} responses</span>
                        <span className="expiry">⏰ {getDaysRemaining(prescription.expiryDate)}</span>
                      </div>

                      {prescription.conversionStatus === 'converted' && prescription.selectedPharmacy && (
                        <div className="converted-info">
                          <span className="conversion-badge">✅ Selected Pharmacy</span>
                          <p className="pharmacy-name">{prescription.selectedPharmacy.name || 'Your selected pharmacy'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => navigate(`/prescription/${prescription._id}`)}
                      className="btn btn-primary btn-sm"
                    >
                      👁️ View Details
                    </button>
                    {prescription.status === 'pending' || prescription.status === 'responded' ? (
                      <button
                        onClick={() => handleDelete(prescription._id)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑️ Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-data">
            <p>🎯 No prescriptions yet!</p>
            <p className="info-text">Upload your first prescription to get responses from nearby pharmacies</p>
            <button
              onClick={() => navigate('/upload-prescription')}
              className="btn btn-primary"
            >
              📸 Upload Prescription
            </button>
          </div>
        )}
      </section>

      {/* Sidebar - Quick Stats */}
      <aside className="prescription-sidebar">
        <h3>📊 Your Stats</h3>
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-number">{prescriptions.filter(p => p.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{prescriptions.filter(p => p.status === 'responded').length}</span>
            <span className="stat-label">Responses</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{prescriptions.filter(p => p.conversionStatus === 'converted').length}</span>
            <span className="stat-label">Conversions</span>
          </div>
        </div>

        <h3 style={{ marginTop: '24px' }}>💡 Tips</h3>
        <ul className="tips-list">
          <li>👥 More details = faster pharmacy responses</li>
          <li>📸 Clear images get 3x more responses</li>
          <li>💬 Add optional medicines for better matches</li>
          <li>⏰ Prescriptions expire after 30 days</li>
        </ul>
      </aside>
    </div>
  );
}
