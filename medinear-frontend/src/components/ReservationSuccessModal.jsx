import React, { useState, useEffect } from 'react';
import { formatTimeRemaining, formatExpiredTime, getTimeUntilExpiry } from '../utils/countdownTimer';
import './ReservationSuccessModal.css';

const ReservationSuccessModal = ({ 
  isOpen, 
  onClose, 
  medicine, 
  pharmacy, 
  expiryTime,
  reservationCode 
}) => {
  const [timeRemaining, setTimeRemaining] = useState('30:00');
  const [isExpired, setIsExpired] = useState(false);

  const phoneNumber = pharmacy?.phone || '';
  const hasPhone = Boolean(phoneNumber);
  const lat = pharmacy?.geolocation?.coordinates?.[1] ?? pharmacy?.latitude;
  const lon = pharmacy?.geolocation?.coordinates?.[0] ?? pharmacy?.longitude;
  const hasDirections = Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));

  useEffect(() => {
    if (!isOpen || !expiryTime) return;

    const initialSeconds = getTimeUntilExpiry(expiryTime);
    setIsExpired(initialSeconds <= 0);
    setTimeRemaining(initialSeconds <= 0 ? '0:00' : formatTimeRemaining(initialSeconds));

    const interval = setInterval(() => {
      const seconds = getTimeUntilExpiry(expiryTime);
      
      if (seconds <= 0) {
        setTimeRemaining('0:00');
        setIsExpired(true);
        clearInterval(interval);
      } else {
        setTimeRemaining(formatTimeRemaining(seconds));
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isOpen, expiryTime]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const endTimeFormatted = formatExpiredTime(expiryTime);
  const progressPercentage = Math.max(0, Math.min(100, (getTimeUntilExpiry(expiryTime) / (30 * 60)) * 100));

  return (
    <div className="reservation-success-overlay" onClick={onClose}>
      <div className="reservation-success-modal" onClick={(e) => e.stopPropagation()}>
        {/* Success Icon & Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h2>Medicine Reserved!</h2>
          <p className="success-subtitle">Your medicine is now held for you</p>
        </div>

        {/* Countdown Timer Section */}
        <div className={`countdown-section ${isExpired ? 'expired' : ''}`}>
          <div className="countdown-display">
            <span className="timer-icon">⏳</span>
            <div className="timer-content">
              <p className="timer-label">Reserved Until</p>
              <p className="timer-main">{endTimeFormatted}</p>
              <p className="timer-countdown">{timeRemaining} remaining</p>
            </div>
          </div>

          {!isExpired && (
            <div className="countdown-visual">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${progressPercentage}%`
                  }}
                ></div>
              </div>
              <p className="progress-text">Visit the pharmacy within {timeRemaining}</p>
            </div>
          )}

          {isExpired && (
            <div className="expired-notice">
              ⚠️ Your reservation has expired
            </div>
          )}
        </div>

        {/* Reservation Details */}
        <div className="reservation-details">
          <div className="detail-item">
            <span className="detail-icon">💊</span>
            <div className="detail-content">
              <p className="detail-label">Medicine</p>
              <p className="detail-value">{medicine?.name}</p>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">🏥</span>
            <div className="detail-content">
              <p className="detail-label">Pharmacy</p>
              <p className="detail-value">{pharmacy?.name}</p>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <div className="detail-content">
              <p className="detail-label">Location</p>
              <p className="detail-value">{pharmacy?.area || 'N/A'}</p>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">📱</span>
            <div className="detail-content">
              <p className="detail-label">Reservation Code</p>
              <p className="detail-value code">{reservationCode || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Important Info */}
        <div className="important-info">
          <h4>⚡ Important</h4>
          <ul>
            <li>✓ Visit the pharmacy within {timeRemaining}</li>
            <li>✓ Reference your reservation code at checkout</li>
            <li>✓ Stock will be held exclusively for you</li>
            <li>✓ After 30 minutes, the stock will be released</li>
          </ul>
        </div>

        {/* Pharmacy Contact */}
        <div className="pharmacy-contact">
          {hasPhone ? (
            <a href={`tel:${phoneNumber}`} className="contact-btn call-btn" aria-label={`Call ${pharmacy?.name || 'pharmacy'}`}>
              📞 Call Pharmacy
            </a>
          ) : (
            <button className="contact-btn call-btn disabled" type="button" disabled>
              📞 Phone Unavailable
            </button>
          )}
          <button
            className="contact-btn directions-btn"
            type="button"
            aria-label={`Get directions to ${pharmacy?.name || 'pharmacy'}`}
            onClick={() => {
              if (!hasDirections) {
                return;
              }
              window.open(`https://maps.google.com/?q=${lat},${lon}`, '_blank');
            }}
            disabled={!hasDirections}
          >
            📍 Get Directions
          </button>
        </div>

        {/* Close Button */}
        <button className="close-modal-btn" onClick={onClose} type="button" aria-label="Close reservation success modal">
          ✕ Close
        </button>
      </div>
    </div>
  );
};

export default ReservationSuccessModal;
