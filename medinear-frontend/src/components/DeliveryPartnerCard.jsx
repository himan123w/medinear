import React from 'react';
import './DeliveryPartnerCard.css';

export default function DeliveryPartnerCard({
  partner,
  distance,
  onSelectPartner,
  isSelected = false
}) {
  // Calculate star display based on rating
  const renderStars = (rating) => {
    if (!rating) return '★☆☆☆☆';
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  };

  // Get vehicle emoji
  const getVehicleEmoji = (vehicleType) => {
    const emojis = {
      bike: '🏍️',
      scooter: '🛵',
      car: '🚗',
      cycle: '🚴',
      motorcycle: '🏍️',
      auto: '🛺'
    };
    return emojis[vehicleType?.toLowerCase()] || '🚗';
  };

  // Get availability status
  const getStatusBadge = () => {
    const status = partner.status || 'offline';
    const statusConfig = {
      active: { text: 'Active', color: '#4caf50' },
      inactive: { text: 'Inactive', color: '#999' },
      'on-delivery': { text: 'On Delivery', color: '#ff9800' },
      offline: { text: 'Offline', color: '#ccc' },
      break: { text: 'On Break', color: '#f44336' }
    };

    const config = statusConfig[status] || statusConfig.offline;
    return <span className="status-badge" style={{ backgroundColor: config.color }}>{config.text}</span>;
  };

  return (
    <div className={`partner-card ${isSelected ? 'selected' : ''} ${partner.isAvailable ? 'available' : 'unavailable'}`}>
      {/* Card Header */}
      <div className="card-header">
        <div className="partner-avatar">
          <span className="avatar-emoji">{getVehicleEmoji(partner.vehicleType)}</span>
        </div>
        <div className="header-info">
          <h3 className="partner-name">{partner.name}</h3>
          <p className="vehicle-type">{partner.vehicleType}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Rating */}
        {partner.averageRating && (
          <div className="info-row">
            <span className="label">⭐ Rating</span>
            <span className="value">
              {renderStars(partner.averageRating)}
              <span className="rating-number">({partner.averageRating.toFixed(1)})</span>
            </span>
          </div>
        )}

        {/* Deliveries Count */}
        {partner.totalDeliveries && (
          <div className="info-row">
            <span className="label">📦 Deliveries</span>
            <span className="value">{partner.totalDeliveries}</span>
          </div>
        )}

        {/* Distance */}
        {distance && (
          <div className="info-row">
            <span className="label">📍 Distance</span>
            <span className="value">{distance.toFixed(1)} km away</span>
          </div>
        )}

        {/* Completion Rate */}
        {partner.completedDeliveries && partner.totalDeliveries && (
          <div className="info-row">
            <span className="label">✅ Success Rate</span>
            <span className="value">
              {((partner.completedDeliveries / partner.totalDeliveries) * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Contact */}
        <div className="info-row">
          <span className="label">📞 Contact</span>
          <span className="value phone">{partner.phone}</span>
        </div>

        {/* Service Areas */}
        {partner.serviceAreas && partner.serviceAreas.length > 0 && (
          <div className="service-areas">
            <span className="label">Service Areas:</span>
            <div className="areas-list">
              {partner.serviceAreas.map((area, idx) => (
                <span key={idx} className="area-badge">{area}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        {partner.isAvailable ? (
          <button
            className={`select-btn ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectPartner(partner)}
          >
            {isSelected ? '✓ Selected' : 'Select Partner'}
          </button>
        ) : (
          <p className="unavailable-text">Currently Unavailable</p>
        )}
      </div>

      {/* Availability Indicator */}
      {partner.isAvailable && (
        <div className="availability-indicator">
          <span className="pulse"></span>
          Available Now
        </div>
      )}
    </div>
  );
}
