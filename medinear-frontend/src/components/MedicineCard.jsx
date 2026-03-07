import { useState } from 'react';
import ReserveButton from './ReserveButton';
import './MedicineCard.css';

export default function MedicineCard({
  medicine,
  userLocation = { latitude: null, longitude: null },
  showDistance = false,
  onCall,
  onReservation,
  onRating,
  isReserved = false,
  timeRemaining = null,
  pharmacyDistanceInfo = null,
  userRating = null,
  onViewIncrement = null,
}) {
  const [showRating, setShowRating] = useState(false);
  const availabilityInfo = medicine.availability;
  const pharmacy = medicine?.pharmacy || null;
  const pharmacyName = pharmacy?.name || 'Pharmacy Not Available';
  const pharmacyArea = pharmacy?.area || '';
  const canCallPharmacy = Boolean(pharmacy?.phone);
  const canReserve = Boolean(pharmacy?._id);
  const priceValue = Number(medicine?.price || 0);

  // Get confidence badge display
  const getConfidenceBadge = () => {
    if (!availabilityInfo) {
      return { icon: '🟢', text: 'In Stock', time: 'Recently updated', color: 'success' };
    }
    
    const levelMap = {
      'in-stock': { icon: '🟢', color: 'success' },
      'low-stock': { icon: '🟡', color: 'warning' },
      'out-of-stock': { icon: '🔴', color: 'error' },
    };

    const level = levelMap[availabilityInfo.level] || { icon: '🟡', color: 'warning' };
    const timeAgo = availabilityInfo.details?.lastUpdated ? 'Updated just now' : 'Recently updated';

    return {
      icon: level.icon,
      text: availabilityInfo.status,
      time: timeAgo,
      color: level.color,
    };
  };

  const badge = getConfidenceBadge();

  return (
    <div className="medicine-card-redesigned">
      {/* Reserved Countdown Badge */}
      {isReserved && timeRemaining && (
        <div className="card-reserved-badge">
          <span>⏳ Reserved – {timeRemaining} remaining</span>
        </div>
      )}

      {/* Card Header - Medicine Name & Confidence */}
      <div className="card-header">
        <div className="medicine-name-section">
          <h3 className="medicine-name">{medicine.name}</h3>
          {medicine.strength && <span className="medicine-strength">{medicine.strength}</span>}
        </div>
      </div>

      {/* Confidence Badge & Status */}
      <div className={`confidence-badge confidence-${badge.color}`}>
        <span className="badge-icon">{badge.icon}</span>
        <span className="badge-text">{badge.text}</span>
        <span className="badge-time">| {badge.time}</span>
      </div>

      {/* Price + Distance Row */}
      <div className="price-distance-row">
        <div className="price-section">
          <span className="price-label">Price</span>
          <span className="price-value">₹{priceValue.toFixed(2)}</span>
        </div>

        {showDistance && pharmacyDistanceInfo && (
          <div className="distance-section">
            <span className="distance-label">Distance</span>
            <span className="distance-value">{pharmacyDistanceInfo.distanceDisplay}</span>
          </div>
        )}
      </div>

      {/* Delivery Time (if available) */}
      {medicine.deliveryTime && (
        <div className="delivery-section">
          <span className="delivery-icon">🚚</span>
          <span className="delivery-text">~{medicine.deliveryTime} min delivery</span>
        </div>
      )}

      {/* Pharmacy Section */}
      <div className="pharmacy-section">
        <h4 className="pharmacy-name">
          <span className="pharmacy-icon">💊</span>
          {pharmacyName}
        </h4>
        {showDistance && pharmacyDistanceInfo && pharmacyArea && (
          <p className="pharmacy-location">
            <span className="location-icon">📍</span>
            {pharmacyArea}
          </p>
        )}
      </div>

      {/* Rating Section */}
      <div className="rating-section">
        {medicine.rating > 0 ? (
          <div className="rating-display">
            <span className="stars">
              {'⭐'.repeat(Math.round(medicine.rating))}
            </span>
            <span className="rating-text">
              {medicine.rating.toFixed(1)}/5 ({medicine.reviews} reviews)
            </span>
          </div>
        ) : (
          <div className="no-rating">No reviews yet</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <ReserveButton
          medicine={medicine}
          pharmacy={pharmacy}
          onReservationCreated={onReservation}
          className="btn-card-action reserve-btn"
          disabled={!canReserve}
        />

        <button
          className="btn btn-card-action call-btn"
          onClick={() => canCallPharmacy && onCall?.(pharmacy.phone)}
          title={`Call ${pharmacyName} now`}
          disabled={!canCallPharmacy}
        >
          <span className="btn-icon">📞</span>
          <span className="btn-text">Call Pharmacy</span>
        </button>

        {showDistance && (
          <button
            className="btn btn-card-action directions-btn"
            onClick={() => {
              const lat = userLocation?.latitude;
              const lng = userLocation?.longitude;
              if (lat && lng) {
                const url = `https://maps.google.com/?q=${lat},${lng}`;
                window.open(url, '_blank');
              }
            }}
            title="Get directions to pharmacy"
          >
            <span className="btn-icon">🗺️</span>
            <span className="btn-text">Get Directions</span>
          </button>
        )}
      </div>

      {/* Rating Input (Optional) */}
      {showRating && (
        <div className="rating-input-section">
          <p className="rating-prompt">Rate this medicine:</p>
          <div className="star-buttons">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`star-btn ${userRating === star ? 'selected' : ''}`}
                onClick={() => onRating(medicine._id, star)}
                title={`Rate ${star} stars`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
