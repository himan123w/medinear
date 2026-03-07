import React, { useState, useEffect } from 'react';
import { deliveryAPI } from '../api';
import './DeliveryBooking.css';

export default function DeliveryBooking({
  pharmacyId,
  pharmacyLocation,
  pickupAddress,
  customerLocation,
  deliveryAddress,
  totalAmount,
  onDeliveryBooked,
  orderItems = [],
  orderId = ''
}) {
  const [deliveryType, setDeliveryType] = useState('standard');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [contactlessDelivery, setContactlessDelivery] = useState(false);
  const [estimatedCharge, setEstimatedCharge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Calculate delivery charge based on type
  useEffect(() => {
    const charges = {
      standard: Math.ceil(totalAmount * 0.08), // 8% of order
      express: Math.ceil(totalAmount * 0.15), // 15% of order
      scheduled: Math.ceil(totalAmount * 0.05) // 5% of order
    };
    setEstimatedCharge(charges[deliveryType] || charges.standard);
  }, [deliveryType, totalAmount]);

  const handleBookDelivery = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const deliveryData = {
        orderId,
        orderType: 'medicine-order',
        pharmacyId,
        customerPhone: localStorage.getItem('userPhone') || 'guest',
        customerName: localStorage.getItem('userName') || 'Guest User',
        pickupAddress,
        pickupLat: pharmacyLocation?.latitude || 0,
        pickupLng: pharmacyLocation?.longitude || 0,
        deliveryAddress,
        deliveryLat: customerLocation?.latitude || 0,
        deliveryLng: customerLocation?.longitude || 0,
        items: orderItems,
        totalAmount,
        deliveryType,
        specialInstructions,
        contactlessDelivery
      };

      const response = await deliveryAPI.bookDelivery(deliveryData);

      setSuccess('✅ Delivery booked successfully! Tracking your order...');
      
      if (onDeliveryBooked) {
        onDeliveryBooked(response.data.delivery);
      }

      setTimeout(() => {
        setShowForm(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-booking">
      <button
        className="book-delivery-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '✕ Cancel' : '🚚 Book Delivery'}
      </button>

      {showForm && (
        <form onSubmit={handleBookDelivery} className="delivery-form">
          <h3>📦 Delivery Details</h3>

          {/* Delivery Type Selection */}
          <div className="delivery-type-selector">
            <label>Delivery Type:</label>
            <div className="type-options">
              <label className="radio-option">
                <input
                  type="radio"
                  value="express"
                  checked={deliveryType === 'express'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                <span className="option-label">
                  <strong>⚡ Express (30 min)</strong>
                  <span className="charge">₹{estimatedCharge}</span>
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  value="standard"
                  checked={deliveryType === 'standard'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                <span className="option-label">
                  <strong>🚚 Standard (45 min)</strong>
                  <span className="charge">₹{estimatedCharge}</span>
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  value="scheduled"
                  checked={deliveryType === 'scheduled'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                <span className="option-label">
                  <strong>📅 Scheduled</strong>
                  <span className="charge">₹{estimatedCharge}</span>
                </span>
              </label>
            </div>
          </div>

          {/* Location Info */}
          <div className="location-info">
            <div className="location-item">
              <label>📍 Pickup From:</label>
              <p className="address">{pickupAddress}</p>
            </div>

            <div className="location-item">
              <label>🏠 Delivery To:</label>
              <p className="address">{deliveryAddress}</p>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="form-group">
            <label htmlFor="instructions">Special Instructions (Optional)</label>
            <textarea
              id="instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g., Ring the bell twice, deliver after 5 PM..."
              maxLength="200"
              rows="3"
              className="instructions-input"
            />
            <span className="char-count">{specialInstructions.length}/200</span>
          </div>

          {/* Contactless Delivery */}
          <div className="form-group checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={contactlessDelivery}
                onChange={(e) => setContactlessDelivery(e.target.checked)}
              />
              <span>🎯 Contactless Delivery</span>
            </label>
            <p className="hint">Leave package at doorstep</p>
          </div>

          {/* Price Summary */}
          <div className="price-summary">
            <div className="summary-row">
              <span>Order Amount:</span>
              <strong>₹{totalAmount}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery Charge:</span>
              <strong>₹{estimatedCharge}</strong>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <strong>₹{totalAmount + estimatedCharge}</strong>
            </div>
          </div>

          {/* Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="confirm-btn"
            >
              {loading ? '⏳ Booking...' : '✅ Confirm & Book Delivery'}
            </button>
          </div>

          {/* Info Box */}
          <div className="info-box">
            <p>✓ Real-time tracking available</p>
            <p>✓ Live delivery updates via SMS</p>
            <p>✓ Safe & secure payment</p>
          </div>
        </form>
      )}
    </div>
  );
}
