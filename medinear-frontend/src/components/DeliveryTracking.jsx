import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { deliveryAPI } from '../api';
import './DeliveryTracking.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const customerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const partnerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pharmacyIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map bounds updater component
function MapBoundsUpdater({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(loc => loc && loc[0] && loc[1]);
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [locations, map]);

  return null;
}

export default function DeliveryTracking({ deliveryId, onClose }) {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const trackingIntervalRef = useRef(null);

  // Fetch delivery details
  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const response = await deliveryAPI.trackDelivery(deliveryId);
        setDelivery(response.data.delivery);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch delivery details');
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();

    // Set up auto-refresh every 10 seconds
    trackingIntervalRef.current = setInterval(fetchDelivery, 10000);

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [deliveryId]);

  // Calculate estimated time remaining
  const getETAText = () => {
    if (!delivery) return '';

    const status = delivery.status;
    const statusEmojis = {
      confirmed: '📋',
      assigned: '👤',
      'picked-up': '📦',
      'in-transit': '🚗',
      arrived: '📍',
      delivered: '✅',
      failed: '❌',
      cancelled: '🚫',
      returned: '↩️'
    };

    const statusTexts = {
      confirmed: 'Order Confirmed',
      assigned: 'Partner Assigned',
      'picked-up': 'Order Picked Up',
      'in-transit': 'In Transit',
      arrived: 'Arrived at Location',
      delivered: 'Delivered Successfully',
      failed: 'Delivery Failed',
      cancelled: 'Order Cancelled',
      returned: 'Order Returned'
    };

    return `${statusEmojis[status] || '📦'} ${statusTexts[status] || status}`;
  };

  // Get delivery route coordinates
  const getRouteCoordinates = () => {
    if (!delivery) return [];

    const coords = [];

    // Add pickup location
    if (delivery.pickupLat && delivery.pickupLng) {
      coords.push([delivery.pickupLat, delivery.pickupLng]);
    }

    // Add current location if in transit
    if (delivery.currentLocation && delivery.currentLocation.coordinates) {
      const [lng, lat] = delivery.currentLocation.coordinates;
      coords.push([lat, lng]);
    }

    // Add delivery location
    if (delivery.deliveryLat && delivery.deliveryLng) {
      coords.push([delivery.deliveryLat, delivery.deliveryLng]);
    }

    return coords;
  };

  // Get marker locations
  const getMarkerLocations = () => {
    if (!delivery) return [];

    const locations = [];

    // Pharmacy/Pickup
    if (delivery.pickupLat && delivery.pickupLng) {
      locations.push({
        position: [delivery.pickupLat, delivery.pickupLng],
        title: 'Pharmacy',
        icon: pharmacyIcon,
        type: 'pickup'
      });
    }

    // Current partner location
    if (delivery.currentLocation && delivery.currentLocation.coordinates) {
      const [lng, lat] = delivery.currentLocation.coordinates;
      locations.push({
        position: [lat, lng],
        title: `Delivery Partner (${delivery.deliveryPartner?.name || 'Unknown'})`,
        icon: partnerIcon,
        type: 'partner'
      });
    }

    // Customer/Delivery
    if (delivery.deliveryLat && delivery.deliveryLng) {
      locations.push({
        position: [delivery.deliveryLat, delivery.deliveryLng],
        title: 'Delivery Location',
        icon: customerIcon,
        type: 'delivery'
      });
    }

    return locations;
  };

  // Calculate distance to delivery
  const calculateDistance = () => {
    if (!delivery || !delivery.currentLocation || !delivery.currentLocation.coordinates) {
      return 'N/A';
    }

    const [lng, lat] = delivery.currentLocation.coordinates;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(delivery.deliveryLat - lat);
    const dLng = toRad(delivery.deliveryLng - lng);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat)) * Math.cos(toRad(delivery.deliveryLat)) *
              Math.sin(dLng / 2) ** 2;

    const distance = 2 * 6371 * Math.asin(Math.sqrt(a)); // 6371 = Earth radius in km
    return distance.toFixed(1);
  };

  // Status timeline
  const getStatusTimeline = () => {
    if (!delivery || !delivery.statusHistory) return [];

    return delivery.statusHistory.slice().reverse();
  };

  if (loading) {
    return (
      <div className="delivery-tracking loading">
        <div className="loader">Loading delivery details...</div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="delivery-tracking error">
        <div className="error-box">
          <p>❌ {error || 'Delivery not found'}</p>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const markerLocations = getMarkerLocations();
  const routeCoordinates = getRouteCoordinates();
  const distance = calculateDistance();
  const eta = delivery.estimatedDeliveryTime ? 
    new Date(delivery.estimatedDeliveryTime).toLocaleTimeString() : 
    'Calculating...';

  return (
    <div className="delivery-tracking">
      {/* Header */}
      <div className="tracking-header">
        <div className="header-content">
          <h2>📍 {getETAText()}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-info">
          <div className="info-item">
            <label>Order ID:</label>
            <span className="value">{delivery.orderId?.slice(-6) || delivery._id?.slice(-6)}</span>
          </div>
          <div className="info-item">
            <label>Distance:</label>
            <span className="value">{distance} km</span>
          </div>
          <div className="info-item">
            <label>ETA:</label>
            <span className="value">{eta}</span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-container">
        {markerLocations.length >= 2 ? (
          <MapContainer center={markerLocations[0]?.position} zoom={14} className="delivery-map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Route line */}
            {routeCoordinates.length >= 2 && (
              <Polyline
                positions={routeCoordinates}
                color="#667eea"
                weight={4}
                opacity={0.7}
                dashArray="5, 10"
              />
            )}

            {/* Markers */}
            {markerLocations.map((location, idx) => (
              <Marker key={idx} position={location.position} icon={location.icon}>
                <Popup>{location.title}</Popup>
              </Marker>
            ))}

            <MapBoundsUpdater locations={markerLocations.map(l => l.position)} />
          </MapContainer>
        ) : (
          <div className="map-placeholder">
            <p>📍 Map loading...</p>
          </div>
        )}
      </div>

      {/* Delivery Partner Info */}
      {delivery.deliveryPartner && (
        <div className="partner-info">
          <h3>🚗 Delivery Partner</h3>
          <div className="partner-details">
            <div className="detail-item">
              <label>Name:</label>
              <span>{delivery.deliveryPartner.name}</span>
            </div>
            <div className="detail-item">
              <label>Phone:</label>
              <span>{delivery.deliveryPartner.phone}</span>
            </div>
            <div className="detail-item">
              <label>Vehicle:</label>
              <span>{delivery.deliveryPartner.vehicleType}</span>
            </div>
            {delivery.deliveryPartner.averageRating && (
              <div className="detail-item">
                <label>Rating:</label>
                <span className="rating">
                  {'⭐'.repeat(Math.round(delivery.deliveryPartner.averageRating))}
                  {' '}({delivery.deliveryPartner.averageRating.toFixed(1)})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div className="delivery-address-section">
        <h3>📦 Delivery Address</h3>
        <p className="address">{delivery.deliveryAddress}</p>
        {delivery.specialInstructions && (
          <div className="special-instructions">
            <strong>Special Instructions:</strong>
            <p>{delivery.specialInstructions}</p>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="status-timeline">
        <h3>📋 Status Timeline</h3>
        <div className="timeline">
          {getStatusTimeline().map((event, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>{event.status}</h4>
                <p className="timestamp">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
                {event.location && <p className="location">{event.location}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-secondary" onClick={onClose}>
          Close Tracking
        </button>
        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
          <button className="btn-primary">
            📞 Call Partner
          </button>
        )}
      </div>
    </div>
  );
}
