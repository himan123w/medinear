import React, { useState, useEffect } from 'react';
import { reservationAPI } from '../api';
import ReservationSuccessModal from './ReservationSuccessModal';
import { getReservationEndTime } from '../utils/countdownTimer';
import { getOrCreateDeviceId } from '../utils/deviceId';
import './ReserveButton.css';

const ReserveButton = ({ 
  medicine, 
  pharmacy, 
  onReservationCreated,
  className = '',
  disabled = false 
}) => {
  const [isReserving, setIsReserving] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const stock = Number(medicine?.stock || 0);
  const maxQuantity = Math.max(1, stock);
  const isGuestUser = !localStorage.getItem('token');
  const sanitizedPhone = phone.trim();
  const isPhoneValid = /^[6-9]\d{9}$/.test(sanitizedPhone);
  const isConfirmDisabled =
    isReserving ||
    stock <= 0 ||
    quantity < 1 ||
    quantity > stock ||
    (isGuestUser && (!sanitizedPhone || !isPhoneValid));

  // Lock background scroll while any reserve modal is open.
  useEffect(() => {
    if (!showQuantityModal && !showSuccessModal) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showQuantityModal, showSuccessModal]);

  // Close quantity modal on Escape for quick keyboard/mobile testing support.
  useEffect(() => {
    if (!showQuantityModal) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isReserving) {
        handleCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showQuantityModal, isReserving]);

  useEffect(() => {
    if (!showQuantityModal) {
      return;
    }

    setQuantity((current) => Math.min(maxQuantity, Math.max(1, current)));
  }, [showQuantityModal, maxQuantity]);

  const handleReserveClick = () => {
    if (!medicine?._id || !pharmacy?._id) {
      setError('Medicine or pharmacy information missing');
      return;
    }

    if (stock === 0) {
      setError('Out of stock');
      return;
    }

    setQuantity(1);
    setShowQuantityModal(true);
    setError('');
  };

  const handleConfirmReservation = async () => {
    if (!medicine?._id || !pharmacy?._id) {
      setError('Medicine or pharmacy information missing');
      return;
    }

    if (stock <= 0) {
      setError('Out of stock');
      return;
    }

    if (quantity < 1 || quantity > stock) {
      setError(`Please select quantity between 1 and ${stock}`);
      return;
    }

    try {
      setIsReserving(true);
      setError('');

      // Validate phone number for guest users
      const token = localStorage.getItem('token');
      if (!token && !sanitizedPhone) {
        setError('Please enter your phone number');
        setIsReserving(false);
        return;
      }

      if (!token && sanitizedPhone && !isPhoneValid) {
        setError('Please enter a valid 10-digit phone number');
        setIsReserving(false);
        return;
      }

      const reservationData = {
        medicineId: medicine._id,
        pharmacyId: pharmacy._id,
        quantity: quantity,
        deviceId: getOrCreateDeviceId(),
        phone: sanitizedPhone || undefined
      };

      const response = await reservationAPI.createReservation(reservationData);
      
      // Success! Store reservation data for success modal
      const reservation = response.data.data.reservation;
      const expiryTime = getReservationEndTime(new Date(reservation.createdAt));
      
      setSuccessData({
        medicine,
        pharmacy,
        expiryTime,
        reservationCode: reservation._id || reservation.code || 'N/A'
      });
      
      // Close quantity modal and show success modal
      setShowQuantityModal(false);
      setShowSuccessModal(true);
      setQuantity(1);
      setPhone('');
      setError('');
      
      if (onReservationCreated) {
        onReservationCreated(reservation);
      }
      
    } catch (err) {
      console.error('Reservation error:', err);
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setIsReserving(false);
    }
  };

  const handleCancel = () => {
    setShowQuantityModal(false);
    setQuantity(1);
    setPhone('');
    setError('');
  };

  const handleCloseSucess = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    setError('');
  };

  return (
    <>
      <button
        className={`reserve-button ${className}`}
        onClick={handleReserveClick}
        type="button"
        aria-label="Reserve medicine for 30 minutes"
        aria-busy={isReserving}
        disabled={disabled || medicine?.stock === 0}
      >
        <span className="reserve-button-icon" aria-hidden="true">🛒</span>
        <span className="reserve-button-label">Reserve for 30 Minutes</span>
      </button>

      {!showQuantityModal && error && (
        <div className="reserve-error-inline" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {/* Quantity Modal with Medicine Name Outside */}
      {showQuantityModal && (
        <div className="reserve-modal-overlay" onClick={handleCancel}>
          <div
            className="reserve-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Reserve medicine for 30 minutes"
          >
            {/* Medicine Name Badge */}
            <div className="medicine-badge-outside">
              <span className="medicine-icon-badge">💊</span>
              <span className="medicine-name-badge">{medicine?.name}</span>
            </div>

              <div className="reserve-modal-header">
                <h3>🛒 Reserve Medicine</h3>
                <button
                  className="close-button"
                  onClick={handleCancel}
                  type="button"
                  aria-label="Close reserve modal"
                >
                  ×
                </button>
              </div>

            <div className="reserve-modal-body">
              {/* Medicine & Pharmacy Info */}
              <div className="medicine-info-card">
                <div className="medicine-header">
                  <div className="medicine-icon">💊</div>
                  <div className="medicine-details">
                    <div className="pharmacy-location">
                      <span className="location-icon">📍</span>
                      <span>{pharmacy?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="medicine-stats">
                  <div className="stat-item">
                    <span className="stat-label">Price per unit</span>
                    <span className="stat-value price-value">₹{medicine?.price}</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-label">Available Stock</span>
                    <span className="stat-value stock-value">{medicine?.stock} units</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-section">
                <label className="section-label">
                  <span className="label-icon">📦</span>
                  Select Quantity
                </label>
                <div className="quantity-controls">
                  <button 
                    className="qty-btn qty-decrease"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <div className="qty-display">
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.min(medicine?.stock || 1, Math.max(1, val)));
                      }}
                      min="1"
                      max={medicine?.stock || 1}
                      className="qty-input"
                    />
                  </div>
                  <button 
                    className="qty-btn qty-increase"
                    onClick={() => setQuantity(Math.min(medicine?.stock, quantity + 1))}
                    disabled={quantity >= medicine?.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Phone Input for Guest Users */}
              {isGuestUser && (
                <div className="phone-section">
                  <label className="section-label">
                    <span className="label-icon">📱</span>
                    Phone Number <span className="required-badge">Required</span>
                  </label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter mobile number"
                      maxLength="10"
                      className="phone-input"
                      inputMode="numeric"
                      autoComplete="tel-national"
                    />
                  </div>
                  <p className="phone-hint">📲 Reservation code will be sent via SMS</p>
                </div>
              )}

              {/* Total Amount */}
              <div className="total-section">
                <div className="total-row">
                  <span className="total-label">Total Amount</span>
                  <span className="total-value">₹{(Number(medicine?.price || 0) * quantity).toFixed(2)}</span>
                </div>
              </div>

              {/* Reservation Info */}
              <div className="info-section">
                <div className="info-item">
                  <span className="info-icon">⏰</span>
                  <span className="info-text">Valid for <strong>30 minutes</strong></span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔒</span>
                  <span className="info-text">Stock will be <strong>held for you</strong></span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔔</span>
                  <span className="info-text">Pharmacy will be <strong>notified instantly</strong></span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-alert">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{error}</span>
                </div>
              )}
            </div>

            <div className="reserve-modal-footer">
              <button 
                className="cancel-button" 
                onClick={handleCancel}
                type="button"
                disabled={isReserving}
              >
                Cancel
              </button>
              <button 
                className="confirm-button" 
                onClick={handleConfirmReservation}
                type="button"
                disabled={isConfirmDisabled}
              >
                {isReserving ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <ReservationSuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSucess}
          medicine={successData.medicine}
          pharmacy={successData.pharmacy}
          expiryTime={successData.expiryTime}
          reservationCode={successData.reservationCode}
        />
      )}
    </>
  );
};

export default ReserveButton;
