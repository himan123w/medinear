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
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleReserveClick = () => {
    if (!medicine || !pharmacy) {
      setError('Medicine or pharmacy information missing');
      return;
    }
    if (medicine.stock === 0) {
      setError('Out of stock');
      return;
    }
    setShowQuantityModal(true);
    setError('');
  };

  const handleConfirmReservation = async () => {
    try {
      setIsReserving(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token && !phone) {
        setError('Please enter your phone number');
        setIsReserving(false);
        return;
      }

      if (!token && phone && !/^[6-9]\d{9}$/.test(phone)) {
        setError('Please enter a valid 10-digit phone number');
        setIsReserving(false);
        return;
      }

      const reservationData = {
        medicineId: medicine._id,
        pharmacyId: pharmacy._id,
        quantity: quantity,
        deviceId: getOrCreateDeviceId(),
        phone: phone || undefined
      };

      const response = await reservationAPI.createReservation(reservationData);
      const reservation = response.data.data.reservation;
      const expiryTime = getReservationEndTime(new Date(reservation.createdAt));
      
      setSuccessData({
        medicine,
        pharmacy,
        expiryTime,
        reservationCode: reservation._id || reservation.code || 'N/A'
      });
      
      setShowQuantityModal(false);
      setShowSuccessModal(true);
      
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
  };

  const totalPrice = (medicine?.price * quantity).toFixed(2);

  return (
    <>
      <button
        className={`reserve-button ${className}`}
        onClick={handleReserveClick}
        disabled={disabled || medicine?.stock === 0}
      >
        🛒 Reserve
      </button>

      {/* Simple & Interactive Reservation Modal */}
      {showQuantityModal && (
        <div className="reserve-modal-overlay" onClick={handleCancel}>
          <div className="reserve-modal-simple" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="simple-header">
              <h2>📦 Complete Reservation</h2>
              <button className="close-btn" onClick={handleCancel}>✕</button>
            </div>

            {/* Main Content */}
            <div className="simple-content">
              {/* Medicine & Pharmacy Card */}
              <div className="medicine-card-simple">
                <div className="card-top">
                  <h3>{medicine?.name}</h3>
                  <p className="card-pharmacy">📍 {pharmacy?.name}</p>
                </div>
                <div className="card-bottom">
                  <div className="price-tag">₹{medicine?.price}/unit</div>
                  <div className="stock-tag">Stock: {medicine?.stock}</div>
                </div>
              </div>

              {/* Interactive Quantity Selector */}
              <div className="quantity-interactive">
                <label>Quantity</label>
                <div className="qty-selector">
                  <button 
                    className="qty-control"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <div className="qty-value">
                    <span className="big-number">{quantity}</span>
                  </div>
                  <button 
                    className="qty-control"
                    onClick={() => setQuantity(Math.min(medicine?.stock, quantity + 1))}
                    disabled={quantity >= medicine?.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Phone Input (Guest Users) */}
              {!localStorage.getItem('token') && (
                <div className="phone-input-simple">
                  <label>📱 Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    maxLength="10"
                    className="input-field"
                  />
                </div>
              )}

              {/* Total Amount - Big & Visible */}
              <div className="total-amount-section">
                <span className="total-label">Total Amount</span>
                <span className="total-amount-big">₹{totalPrice}</span>
              </div>

              {/* Quick Benefits */}
              <div className="benefits-row">
                <div className="benefit">
                  <span>⏱</span>
                  <p>30 min hold</p>
                </div>
                <div className="benefit">
                  <span>📱</span>
                  <p>SMS code</p>
                </div>
                <div className="benefit">
                  <span>✅</span>
                  <p>Instant</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-box">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="simple-footer">
              <button 
                className="btn-cancel" 
                onClick={handleCancel}
                disabled={isReserving}
              >
                Cancel
              </button>
              <button 
                className="btn-reserve" 
                onClick={handleConfirmReservation}
                disabled={isReserving || (!localStorage.getItem('token') && !phone)}
              >
                {isReserving ? (
                  <>
                    <span className="spinner"></span>
                    Reserving...
                  </>
                ) : (
                  `Reserve Now ₹${totalPrice}`
                )}
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
