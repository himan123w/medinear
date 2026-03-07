import React, { useState, useEffect } from 'react';
import DeliveryBooking from '../components/DeliveryBooking';
import DeliveryTracking from '../components/DeliveryTracking';
import DeliveryPartnerCard from '../components/DeliveryPartnerCard';
import DeliveryPartnerRegistration from '../components/DeliveryPartnerRegistration';
import DeliveryHistory from '../components/DeliveryHistory';
import './Delivery.css';
import { deliveryAPI } from '../api';

export default function Delivery() {
  const [userRole, setUserRole] = useState('customer'); // 'customer' or 'partner'
  const [activeTab, setActiveTab] = useState('book'); // 'book', 'track', 'history'
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [showPartnerRegistration, setShowPartnerRegistration] = useState(false);
  const [nearbyPartners, setNearbyPartners] = useState([]);
  const [userPhone, setUserPhone] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    orderId: 'ORD-' + Date.now(),
    pharmacyId: 'pharmacy-001',
    pharmacyLocation: { latitude: 28.6139, longitude: 77.2090 }, // Delhi
    pickupAddress: '123 Main Pharmacy, New Delhi',
    totalAmount: 500,
    orderItems: []
  });

  // Get user phone from localStorage
  useEffect(() => {
    const phone = localStorage.getItem('userPhone') || '9999999999';
    setUserPhone(phone);
  }, []);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default');
          // Default location (Delhi)
          setCurrentLocation({
            latitude: 28.6139,
            longitude: 77.2090
          });
        }
      );
    }
  }, []);

  // Update delivery data with user location
  useEffect(() => {
    if (currentLocation) {
      setDeliveryData(prev => ({
        ...prev,
        customerLocation: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        },
        deliveryAddress: `Your Location (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})`
      }));
    }
  }, [currentLocation]);

  // Fetch nearby partners
  const fetchNearbyPartners = async () => {
    if (!currentLocation) return;

    setLoading(true);
    try {
      const response = await deliveryAPI.getAvailablePartners({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        radius: 5 // 5 km radius
      });

      setNearbyPartners(response.data.partners || []);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delivery booked
  const handleDeliveryBooked = (delivery) => {
    setDeliveryData(prev => ({
      ...prev,
      orderId: delivery.orderId || delivery._id
    }));
    setSelectedDeliveryId(delivery._id);
    setActiveTab('track');
  };

  // Handle select delivery for tracking
  const handleSelectDelivery = (deliveryId) => {
    setSelectedDeliveryId(deliveryId);
    setActiveTab('track');
  };

  return (
    <div className="delivery-page">
      {/* Header */}
      <div className="delivery-header">
        <h1>🚚 MediNear Delivery Service</h1>
        <p>Fast & reliable medicine delivery at your doorstep</p>
      </div>

      {/* Role Selector */}
      <div className="role-selector">
        <button
          className={`role-btn ${userRole === 'customer' ? 'active' : ''}`}
          onClick={() => {
            setUserRole('customer');
            setActiveTab('book');
          }}
        >
          👤 Customer
        </button>
        <button
          className={`role-btn ${userRole === 'partner' ? 'active' : ''}`}
          onClick={() => setUserRole('partner')}
        >
          🛵 Delivery Partner
        </button>
      </div>

      {/* Main Content */}
      <div className="delivery-content">
        {userRole === 'customer' ? (
          <>
            {/* Customer View */}
            <div className="customer-view">
              {/* Tab Navigation */}
              <div className="tab-navigation">
                <button
                  className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
                  onClick={() => setActiveTab('book')}
                >
                  📦 Book Delivery
                </button>
                {selectedDeliveryId && (
                  <button
                    className={`tab-btn ${activeTab === 'track' ? 'active' : ''}`}
                    onClick={() => setActiveTab('track')}
                  >
                    📍 Track Order
                  </button>
                )}
                <button
                  className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  📋 Delivery History
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'book' && (
                <div className="tab-content">
                  {/* Quick Info */}
                  <div className="quick-info">
                    <div className="info-item">
                      <span>📍 Your Location:</span>
                      <p>
                        {currentLocation
                          ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                          : 'Getting location...'}
                      </p>
                    </div>
                    <button className="refresh-btn" onClick={fetchNearbyPartners} disabled={loading}>
                      {loading ? '⏳ Loading...' : '🔄 Find Nearby Partners'}
                    </button>
                  </div>

                  {/* Nearby Partners */}
                  {nearbyPartners.length > 0 && (
                    <div className="partners-section">
                      <h3>🛵 Available Delivery Partners</h3>
                      <div className="partners-grid">
                        {nearbyPartners.map((partner, idx) => (
                          <DeliveryPartnerCard
                            key={partner._id || idx}
                            partner={partner}
                            distance={partner.distance || 0}
                            onSelectPartner={(selected) => {
                              // Partner selected
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Booking Form */}
                  <DeliveryBooking
                    {...deliveryData}
                    onDeliveryBooked={handleDeliveryBooked}
                  />
                </div>
              )}

              {activeTab === 'track' && selectedDeliveryId && (
                <div className="tab-content">
                  <DeliveryTracking
                    deliveryId={selectedDeliveryId}
                    onClose={() => setActiveTab('book')}
                  />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="tab-content">
                  <DeliveryHistory
                    userPhone={userPhone}
                    userRole="customer"
                    onSelectDelivery={handleSelectDelivery}
                    limit={10}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Partner View */}
            <div className="partner-view">
              {!showPartnerRegistration ? (
                <div className="partner-welcome">
                  <div className="welcome-card">
                    <h2>🚚 Become a MediNear Delivery Partner</h2>
                    <p>Earn ₹10-20 per delivery + incentives</p>

                    <div className="benefits">
                      <div className="benefit-item">
                        <span className="icon">💰</span>
                        <h4>Flexible Earnings</h4>
                        <p>Earn ₹10-20 per delivery + weekly bonuses</p>
                      </div>
                      <div className="benefit-item">
                        <span className="icon">⏰</span>
                        <h4>Flexible Hours</h4>
                        <p>Work whenever you want, full or part-time</p>
                      </div>
                      <div className="benefit-item">
                        <span className="icon">📱</span>
                        <h4>Easy App</h4>
                        <p>Simple booking system and real-time tracking</p>
                      </div>
                      <div className="benefit-item">
                        <span className="icon">🎯</span>
                        <h4>Support</h4>
                        <p>24/7 customer support for delivery partners</p>
                      </div>
                    </div>

                    <div className="registration-cta">
                      <button
                        className="register-btn"
                        onClick={() => setShowPartnerRegistration(true)}
                      >
                        Join as Delivery Partner
                      </button>
                      <p className="cta-hint">Takes only 5 minutes to register</p>
                    </div>
                  </div>
                </div>
              ) : (
                <DeliveryPartnerRegistration
                  onRegistrationSuccess={() => {
                    setShowPartnerRegistration(false);
                  }}
                  onClose={() => setShowPartnerRegistration(false)}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="delivery-footer">
        <div className="footer-section">
          <h4>📞 Need Help?</h4>
          <p>Contact: support@medinear.com | Phone: 1800-MEDINEAR</p>
        </div>
        <div className="footer-section">
          <h4>✅ Features</h4>
          <ul>
            <li>Real-time GPS tracking</li>
            <li>Safe & verified delivery partners</li>
            <li>Live notifications</li>
            <li>Contactless delivery option</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>🔒 Safety & Privacy</h4>
          <p>All transactions are secure and encrypted. Your personal data is protected.</p>
        </div>
      </div>
    </div>
  );
}
