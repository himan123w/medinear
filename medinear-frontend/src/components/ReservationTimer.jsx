import React, { useState, useEffect } from 'react';
import { reservationAPI } from '../api';
import './ReservationTimer.css';

const ReservationTimer = ({ reservation: initialReservation, onExpired, onCancelled }) => {
  const [reservation, setReservation] = useState(initialReservation);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (!reservation || reservation.status !== 'active') return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(reservation.expiresAt);
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0 && onExpired) {
        onExpired(reservation);
      }

      return remaining;
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const timer = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation, onExpired]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalDuration = 30 * 60; // 30 minutes in seconds
    return (timeRemaining / totalDuration) * 100;
  };

  const getStatusColor = () => {
    if (timeRemaining > 10 * 60) return '#4CAF50'; // Green: > 10 min
    if (timeRemaining > 5 * 60) return '#FF9800'; // Orange: > 5 min
    return '#F44336'; // Red: < 5 min
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setIsCancelling(true);
      await reservationAPI.cancelReservation(reservation._id);
      
      if (onCancelled) {
        onCancelled(reservation);
      }

      alert('✅ Reservation cancelled successfully');
    } catch (error) {
      console.error('Cancel error:', error);
      alert(error.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleExtend = async () => {
    try {
      setIsExtending(true);
      const response = await reservationAPI.extendReservation(reservation._id, 15);
      
      setReservation(response.data.data.reservation);
      alert('✅ Reservation extended by 15 minutes');
    } catch (error) {
      console.error('Extend error:', error);
      alert(error.response?.data?.message || 'Failed to extend reservation');
    } finally {
      setIsExtending(false);
    }
  };

  if (!reservation) return null;

  if (reservation.status === 'expired') {
    return (
      <div className="reservation-timer expired">
        <div className="status-badge expired-badge">⏰ Expired</div>
        <div className="reservation-details">
          <p className="medicine-name">{reservation.medicineSnapshot?.name}</p>
          <p className="reservation-code">Code: {reservation.reservationCode}</p>
        </div>
      </div>
    );
  }

  if (reservation.status === 'cancelled') {
    return (
      <div className="reservation-timer cancelled">
        <div className="status-badge cancelled-badge">❌ Cancelled</div>
        <div className="reservation-details">
          <p className="medicine-name">{reservation.medicineSnapshot?.name}</p>
          <p className="reservation-code">Code: {reservation.reservationCode}</p>
        </div>
      </div>
    );
  }

  if (reservation.status === 'completed') {
    return (
      <div className="reservation-timer completed">
        <div className="status-badge completed-badge">✅ Completed</div>
        <div className="reservation-details">
          <p className="medicine-name">{reservation.medicineSnapshot?.name}</p>
          <p className="reservation-code">Code: {reservation.reservationCode}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-timer active">
      <div className="timer-header">
        <div className="status-badge active-badge">🔔 Active Reservation</div>
        <div className="timer-display" style={{ color: getStatusColor() }}>
          ⏱️ {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${getProgressPercentage()}%`,
            backgroundColor: getStatusColor()
          }}
        />
      </div>

      <div className="reservation-details">
        <div className="detail-row">
          <span className="label">Medicine:</span>
          <span className="value">{reservation.medicineSnapshot?.name}</span>
        </div>
        <div className="detail-row">
          <span className="label">Quantity:</span>
          <span className="value">{reservation.quantity}</span>
        </div>
        <div className="detail-row">
          <span className="label">Amount:</span>
          <span className="value">₹{reservation.totalAmount}</span>
        </div>
        <div className="detail-row">
          <span className="label">Pharmacy:</span>
          <span className="value">{reservation.pharmacy?.name}</span>
        </div>
        <div className="detail-row">
          <span className="label">Code:</span>
          <span className="value code-value">{reservation.reservationCode}</span>
        </div>
      </div>

      {timeRemaining < 5 * 60 && timeRemaining > 0 && (
        <div className="warning-message">
          ⚠️ Only {Math.floor(timeRemaining / 60)} minutes remaining! Please collect soon.
        </div>
      )}

      <div className="action-buttons">
        <button 
          className="extend-button"
          onClick={handleExtend}
          disabled={isExtending || timeRemaining === 0}
        >
          {isExtending ? 'Extending...' : '⏰ Extend +15 min'}
        </button>
        <button 
          className="cancel-button"
          onClick={handleCancel}
          disabled={isCancelling || timeRemaining === 0}
        >
          {isCancelling ? 'Cancelling...' : '❌ Cancel'}
        </button>
      </div>
    </div>
  );
};

// Component to display list of reservations
export const ReservationList = ({ userId }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchReservations();
    // Refresh every 30 seconds
    const interval = setInterval(fetchReservations, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getMyReservations(filter);
      setReservations(response.data.data.reservations);
    } catch (error) {
      console.error('Fetch reservations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpired = (reservation) => {
    fetchReservations();
  };

  const handleCancelled = (reservation) => {
    fetchReservations();
  };

  if (loading) {
    return <div className="loading">Loading reservations...</div>;
  }

  return (
    <div className="reservation-list">
      <div className="list-header">
        <h2>My Reservations</h2>
        <div className="filter-buttons">
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={filter === '' ? 'active' : ''}
            onClick={() => setFilter('')}
          >
            All
          </button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>No reservations found</p>
        </div>
      ) : (
        <div className="reservations-grid">
          {reservations.map(reservation => (
            <ReservationTimer 
              key={reservation._id}
              reservation={reservation}
              onExpired={handleExpired}
              onCancelled={handleCancelled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationTimer;
