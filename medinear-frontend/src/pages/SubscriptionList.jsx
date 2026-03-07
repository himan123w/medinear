import { useEffect, useState } from 'react';
import { subscriptionAPI } from '../api';
import './SubscriptionList.css';

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const userId = localStorage.getItem('userId');

  const load = async () => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.getUserSubscriptions(userId);
      if (res.data && res.data.success) {
        setSubscriptions(res.data.subscriptions);
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to load subscriptions');
      setMessageType('error');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSubscriptions = subscriptions
    .filter((sub) => (statusFilter === 'all' ? true : sub.status === statusFilter))
    .filter((sub) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return [
        sub.phone,
        sub.diseaseType,
        sub.patientDetails?.doctorName,
        sub.address,
        sub.city,
        sub.state
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

  const activeCount = subscriptions.filter((sub) => sub.status === 'active').length;
  const pausedCount = subscriptions.filter((sub) => sub.status === 'paused').length;
  const monthlyRevenueProjection = subscriptions
    .filter((sub) => sub.status !== 'cancelled')
    .reduce((sum, sub) => sum + (Number(sub.monthlyPrice) || 0), 0);

  const handlePause = async (id) => {
    try {
      setActionLoading(`pause-${id}`);
      await subscriptionAPI.pauseSubscription(id);
      setMessage('✓ Subscription paused successfully');
      setMessageType('success');
      load();
    } catch (err) {
      setMessage('Failed to pause subscription');
      setMessageType('error');
    } finally {
      setActionLoading('');
    }
  };

  const handleResume = async (id) => {
    try {
      setActionLoading(`resume-${id}`);
      await subscriptionAPI.resumeSubscription(id);
      setMessage('✓ Subscription resumed successfully');
      setMessageType('success');
      load();
    } catch (err) {
      setMessage('Failed to resume subscription');
      setMessageType('error');
    } finally {
      setActionLoading('');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this subscription? You can always subscribe again later.')) {
      try {
        setActionLoading(`cancel-${id}`);
        await subscriptionAPI.cancelSubscription(id);
        setMessage('✓ Subscription cancelled');
        setMessageType('success');
        load();
      } catch (err) {
        setMessage('Failed to cancel subscription');
        setMessageType('error');
      } finally {
        setActionLoading('');
      }
    }
  };

  const diseaseInfo = {
    diabetes: { name: 'Diabetes', icon: '🩺', color: '#FF6B6B' },
    bp: { name: 'Blood Pressure', icon: '💓', color: '#4ECDC4' },
    heart: { name: 'Heart Disease', icon: '❤️', color: '#FF69B4' }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      active: { label: 'Active', class: 'status-active' },
      paused: { label: 'Paused', class: 'status-paused' },
      cancelled: { label: 'Cancelled', class: 'status-cancelled' }
    };
    return statuses[status] || statuses.active;
  };

  return (
    <div className="subscription-list-page">
      <div className="subscription-list-container">
        <div className="list-header">
          <div>
            <h1>Your Medicine Subscriptions</h1>
            <p className="list-header-subtitle">Track, pause, resume, and manage your recurring medicine plans.</p>
          </div>
        </div>

        <div className="subscription-kpi-grid">
          <div className="subscription-kpi-card">
            <span className="kpi-title">Total Subscriptions</span>
            <strong className="kpi-value">{subscriptions.length}</strong>
          </div>
          <div className="subscription-kpi-card">
            <span className="kpi-title">Active</span>
            <strong className="kpi-value">{activeCount}</strong>
          </div>
          <div className="subscription-kpi-card">
            <span className="kpi-title">Paused</span>
            <strong className="kpi-value">{pausedCount}</strong>
          </div>
          <div className="subscription-kpi-card">
            <span className="kpi-title">Monthly Projection</span>
            <strong className="kpi-value">₹{monthlyRevenueProjection}</strong>
          </div>
        </div>

        <div className="list-controls">
          <div className="controls-left">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by phone, doctor, disease, or city"
              className="search-input"
            />
          </div>

          <div className="controls-right">
            <div className="filter-buttons">
              {['all', 'active', 'paused', 'cancelled'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <a href="/subscription" className="btn btn-primary add-subscription-btn">+ Add New Subscription</a>
          </div>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
            <button className="close-btn" onClick={() => setMessage('')}>×</button>
          </div>
        )}

        {loading && <p className="loading">Loading subscriptions...</p>}
        
        {!loading && filteredSubscriptions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Active Subscriptions</h2>
            <p>
              {subscriptions.length === 0
                ? 'Start your chronic medicine subscription today for convenient monthly deliveries.'
                : 'No subscriptions match your current filters. Try changing search or status filter.'}
            </p>
            <a href="/subscription" className="btn btn-primary">+ Add New Subscription</a>
          </div>
        )}

        {!loading && filteredSubscriptions.length > 0 && (
          <div className="subs-grid">
            {filteredSubscriptions.map(sub => {
              const disease = diseaseInfo[sub.diseaseType] || diseaseInfo.diabetes;
              const statusBadge = getStatusBadge(sub.status);
              const nextDelivery = sub.nextDeliveryDate ? new Date(sub.nextDeliveryDate) : null;
              const daysUntilDelivery = nextDelivery ? Math.ceil((nextDelivery - new Date()) / (1000 * 60 * 60 * 24)) : null;

              return (
                <div key={sub._id} className="sub-card">
                  <div className="card-header" style={{ borderColor: disease.color }}>
                    <div className="disease-badge" style={{ backgroundColor: disease.color }}>
                      {disease.icon} {disease.name}
                    </div>
                    <span className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Phone</span>
                      <span className="value">{sub.phone}</span>
                    </div>

                    {sub.patientDetails?.doctorName && (
                      <div className="info-row">
                        <span className="label">Doctor</span>
                        <span className="value">{sub.patientDetails.doctorName}</span>
                      </div>
                    )}

                    {sub.patientDetails?.severity && (
                      <div className="info-row">
                        <span className="label">Severity</span>
                        <span className={`severity-badge ${sub.patientDetails.severity}`}>
                          {sub.patientDetails.severity.charAt(0).toUpperCase() + sub.patientDetails.severity.slice(1)}
                        </span>
                      </div>
                    )}

                    <div className="info-row">
                      <span className="label">Monthly Cost</span>
                      <span className="value price">₹{sub.monthlyPrice || 'N/A'}</span>
                    </div>

                    <div className="info-row">
                      <span className="label">Frequency</span>
                      <span className="value">{(sub.frequency || 'monthly').charAt(0).toUpperCase() + (sub.frequency || 'monthly').slice(1)}</span>
                    </div>

                    {nextDelivery && (
                      <div className="info-row delivery-info">
                        <span className="label">Next Delivery</span>
                        <span className="value">
                          {nextDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {daysUntilDelivery !== null && (
                            <span className="days-until">
                              {daysUntilDelivery === 0 ? ' (Today)' : daysUntilDelivery === 1 ? ' (Tomorrow)' : ` (in ${daysUntilDelivery} days)`}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {sub.items && sub.items.length > 0 && (
                      <div className="medicines-list">
                        <h4>Medicines</h4>
                        <ul>
                          {sub.items.slice(0, 3).map((item, idx) => (
                            <li key={idx}>
                              <span>{item.name}</span>
                              {item.dosage && <span className="dosage">{item.dosage}</span>}
                            </li>
                          ))}
                          {sub.items.length > 3 && <li className="more">+{sub.items.length - 3} more</li>}
                        </ul>
                      </div>
                    )}

                    {sub.totalSpent > 0 && (
                      <div className="info-row">
                        <span className="label">Total Spent</span>
                        <span className="value">₹{sub.totalSpent}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button className="btn btn-sm btn-info" onClick={() => setSelectedSub(selectedSub === sub._id ? null : sub._id)}>
                      {selectedSub === sub._id ? '▼ Hide Details' : '► View Details'}
                    </button>
                    
                    {sub.status === 'active' ? (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handlePause(sub._id)}
                        disabled={actionLoading === `pause-${sub._id}`}
                      >
                        {actionLoading === `pause-${sub._id}` ? 'Pausing...' : '⏸ Pause'}
                      </button>
                    ) : sub.status === 'paused' ? (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleResume(sub._id)}
                        disabled={actionLoading === `resume-${sub._id}`}
                      >
                        {actionLoading === `resume-${sub._id}` ? 'Resuming...' : '▶ Resume'}
                      </button>
                    ) : null}
                    
                    {sub.status !== 'cancelled' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(sub._id)}
                        disabled={actionLoading === `cancel-${sub._id}`}
                      >
                        {actionLoading === `cancel-${sub._id}` ? 'Cancelling...' : '✕ Cancel'}
                      </button>
                    )}
                  </div>

                  {selectedSub === sub._id && (
                    <div className="card-details">
                      <div className="details-section">
                        <h5>Delivery Address</h5>
                        <p>{sub.address}</p>
                        {sub.city && <p>{sub.city}, {sub.state} {sub.zipCode}</p>}
                      </div>
                      
                      <div className="details-section">
                        <h5>Subscription Info</h5>
                        <p>
                          <strong>Enrolled:</strong> {new Date(sub.enrolledDate).toLocaleDateString()}<br />
                          <strong>Auto-Renew:</strong> {sub.autoRenew ? '✓ Enabled' : '✗ Disabled'}<br />
                          <strong>Reminder:</strong> {sub.reminderFrequency || 'Before Delivery'}
                        </p>
                      </div>

                      <div className="details-section">
                        <a href={`/subscription/${sub._id}`} className="link">
                          View Full Details & Recommendations →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <a href="/subscription" className="floating-add-subscription" aria-label="Add new subscription">
          + New
        </a>
      </div>
    </div>
  );
}

