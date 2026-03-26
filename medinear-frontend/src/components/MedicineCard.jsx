import { useEffect, useMemo, useRef, useState } from 'react';
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
  const hasTrackedViewRef = useRef(false);
  const availabilityInfo = medicine.availability;
  const pharmacy = medicine?.pharmacy || null;
  const pharmacyName = pharmacy?.name || 'Pharmacy Not Available';
  const pharmacyArea = pharmacy?.area || '';
  const canCallPharmacy = Boolean(pharmacy?.phone);
  const canReserve = Boolean(pharmacy?._id);
  const priceValue = Number(medicine?.price || 0);

  useEffect(() => {
    if (hasTrackedViewRef.current) return;
    if (!medicine?._id || typeof onViewIncrement !== 'function') return;

    hasTrackedViewRef.current = true;
    onViewIncrement(medicine._id);
  }, [medicine?._id, onViewIncrement]);

  const fomoSignals = useMemo(() => {
    const stock = Number(medicine?.stock ?? 0);
    const stockAlert = Number(medicine?.stockAlert ?? 10);
    const lowStockThreshold = Math.max(2, Math.min(stockAlert || 10, 5));
    const isLowStock = stock > 0 && stock <= lowStockThreshold;

    const lowStockMessage = isLowStock
      ? `Only ${stock} left at this pharmacy`
      : medicine?.fomo?.lowStockMessage || null;

    const baseViews = Number(medicine?.views ?? 0);
    const seedSource = String(medicine?._id || medicine?.name || 'medinear');
    const seed = seedSource.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 3;
    const estimatedViewersNow = Math.max(
      1,
      Math.min(12, Math.round(baseViews * 0.08) + (isLowStock ? 3 : 0) + 2 + seed)
    );

    const viewersNow = Number(medicine?.fomo?.viewersNow) || estimatedViewersNow;
    const viewersMessage = stock > 0
      ? `${viewersNow} people are viewing this medicine`
      : null;

    return { lowStockMessage, viewersMessage };
  }, [medicine]);

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

      {(fomoSignals.lowStockMessage || fomoSignals.viewersMessage) && (
        <div className="fomo-signals" role="status" aria-live="polite">
          {fomoSignals.lowStockMessage && (
            <div className="fomo-pill fomo-low-stock">
              <span>⚠</span>
              <span>{fomoSignals.lowStockMessage}</span>
            </div>
          )}
          {fomoSignals.viewersMessage && (
            <div className="fomo-pill fomo-viewing">
              <span>⏳</span>
              <span>{fomoSignals.viewersMessage}</span>
            </div>
          )}
        </div>
      )}

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
          type="button"
          aria-label={`Call ${pharmacyName}`}
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
            type="button"
            aria-label={`Get directions to ${pharmacyName}`}
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
