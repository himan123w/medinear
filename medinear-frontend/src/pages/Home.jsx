import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineAPI, pharmacyAPI, reminderAPI } from '../api';
import { useAuth } from '../AuthContext';
import HeroSection from '../components/HeroSection';
import NearbyResultsPreview from '../components/NearbyResultsPreview';
import MedicineCard from '../components/MedicineCard';
import ReserveButton from '../components/ReserveButton';
import MedicineAlternatives from '../components/MedicineAlternatives';
import PharmacyOpenStatus from '../components/PharmacyOpenStatus';
import HeatmapPreviewCard from '../components/HeatmapPreviewCard';
import EmergencyMedicineFinder from '../components/EmergencyMedicineFinder';
import TrendingMedicines from '../components/TrendingMedicines';
import PharmacyMapView from '../components/PharmacyMapView';
import PersonalizationBanner from '../components/PersonalizationBanner';
import SmartNotificationDisplay from '../components/SmartNotificationDisplay';
import { getOrCreateDeviceId } from '../utils/deviceId';
import { getPharmacyDistanceInfo } from '../utils/distanceCalculator';
import { getReservationEndTime, getTimeUntilExpiry, formatTimeRemaining } from '../utils/countdownTimer';
import { 
  getSmartNotification, 
  addRecentSearch, 
  showPushNotification,
  shouldCheckForUpdates 
} from '../utils/smartNotifications';
import './Home.css';

let hasBootstrappedHomeInDev = false;

export default function Home() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [bestMedicines, setBestMedicines] = useState([]);
  const [recommendedMedicines, setRecommendedMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterPrice, setFilterPrice] = useState('unlimited');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [notification, setNotification] = useState('');
  const [smartNotification, setSmartNotification] = useState(null); // Smart notification display
  const [hasPushPermission, setHasPushPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [sortBy, setSortBy] = useState('pharmacy');
  const [sortByNear, setSortByNear] = useState('nearest');
  const [uniqueAreas, setUniqueAreas] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [pharmacyStatusFilter, setPharmacyStatusFilter] = useState('all'); // all, open, closed, closing-soon, 24x7
  const featureSectionRef = useRef(null);
  const networkWarningShownRef = useRef(false);
  
  // Reserved medicines tracking (medicineId -> expiryTime)
  const [reservedMedicines, setReservedMedicines] = useState({});
  
  // Near Me states
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [userCity, setUserCity] = useState('your city');
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyMedicines, setNearbyMedicines] = useState([]);
  const [nearbySearchQuery, setNearbySearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState('5');
  const [locationError, setLocationError] = useState('');

  const categories = ['Antibiotics', 'Pain Relief', 'Cold & Flu', 'Vitamins', 'Digestive', 'Skin Care'];

  useEffect(() => {
    const shouldSkipBootstrap = import.meta.env.DEV && hasBootstrappedHomeInDev;
    if (!shouldSkipBootstrap) {
      hasBootstrappedHomeInDev = true;
      loadBestMedicines();
      loadRecommendations();

      const initialDeviceId = getOrCreateDeviceId();
      checkPriceDropAlerts(initialDeviceId);
    }

    // Do not auto-prompt notification permission on mount; browsers require user gesture.
    if (typeof Notification !== 'undefined') {
      setHasPushPermission(Notification.permission);
    }

    const deviceId = getOrCreateDeviceId();
    const priceDropInterval = setInterval(() => checkPriceDropAlerts(deviceId), 2 * 60 * 1000);

    if (token) {
      checkReminders();
      // optionally poll once a day
      const interval = setInterval(checkReminders, 24 * 60 * 60 * 1000);
      return () => {
        clearInterval(interval);
        clearInterval(priceDropInterval);
      };
    }

    return () => clearInterval(priceDropInterval);
  }, [token]);

  // 🔔 Smart Notifications - Check for stock updates and inventory changes
  useEffect(() => {
    // Only check if user has location
    if (!userLocation.latitude || !userLocation.longitude) return;

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(() => checkSmartNotifications(), 5000);

    // Then check every 15 minutes
    const smartNotificationInterval = setInterval(() => {
      if (shouldCheckForUpdates()) {
        checkSmartNotifications();
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(smartNotificationInterval);
    };
  }, [userLocation]);

  // Update reserved medicines countdown timer
  useEffect(() => {
    // Only run interval if there are active reservations
    if (Object.keys(reservedMedicines).length === 0) return;

    const interval = setInterval(() => {
      setReservedMedicines(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        // Remove expired reservations
        Object.keys(updated).forEach(medicineId => {
          if (getTimeUntilExpiry(updated[medicineId]) <= 0) {
            delete updated[medicineId];
            hasChanges = true;
          }
        });
        
        // Only return new object if something changed
        return hasChanges ? updated : prev;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [reservedMedicines]);

  const loadPharmacies = async () => {
    try {
      let response;
      if (pharmacyStatusFilter === 'all') {
        response = await pharmacyAPI.getPharmacies();
      } else {
        // Use status filter with user location if available
        response = await pharmacyAPI.getPharmaciesWithStatus(
          pharmacyStatusFilter,
          userLocation.latitude,
          userLocation.longitude,
          20 // 20km radius for pharmacy filter
        );
      }
      setPharmacies(response.data);
      const areas = [...new Set(response.data.map(p => p.area))];
      setUniqueAreas(areas);
    } catch (error) {
      showNotification('Error loading pharmacies: ' + error.message, 'error');
    }
  };

  // Reload pharmacies when status filter changes
  useEffect(() => {
    loadPharmacies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyStatusFilter]);

  const getErrorMessage = (error, fallback = 'Request failed') => {
    if (error?.message) return error.message;
    if (error?.originalError?.message) return error.originalError.message;
    return fallback;
  };

  const notifyNetworkIssueOnce = () => {
    if (networkWarningShownRef.current) return;
    networkWarningShownRef.current = true;
    showNotification('Backend server is not reachable. Retrying in background.', 'warning');
  };

  const loadBestMedicines = async () => {
    try {
      const response = await medicineAPI.getBestMedicines(8);
      setBestMedicines(response.data);
    } catch (error) {
      setBestMedicines([]);
      if (error?.isNetworkError) {
        notifyNetworkIssueOnce();
        return;
      }
      console.warn('Error loading best medicines:', getErrorMessage(error, 'Unknown error'));
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await medicineAPI.getRecommendations(8);
      setRecommendedMedicines(response.data);
    } catch (error) {
      setRecommendedMedicines([]);
      if (error?.isNetworkError) {
        notifyNetworkIssueOnce();
        return;
      }
      console.warn('Error loading recommendations:', getErrorMessage(error, 'Unknown error'));
    }
  };

  // 📍 Get User GPS Location with improved error handling
  const getUserLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setLocationLoading(false);
          showNotification(`📍 Location detected: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, 'success');
        },
        (error) => {
          setLocationLoading(false);
          
          let errorMessage = '';
          let userFriendlyMessage = '';
          
          // Handle specific error codes
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permission denied. Please enable location permission in browser settings.';
              userFriendlyMessage = '🔒 Location permission denied.\n\n• iOS: Settings → Privacy → Location Services\n• Android: App permissions → Location\n• Browser: Check address bar for location permission prompt';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'GPS signal not available. Please try again in a few moments.';
              userFriendlyMessage = '📡 GPS signal unavailable.\n\n• Make sure you\'re outdoors or near a window\n• Move away from dense buildings\n• Try again in a few moments';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              userFriendlyMessage = '⏱ Location request timed out.\n\n• Check your internet connection\n• Ensure GPS is turned ON\n• Try clicking the button again';
              break;
            default:
              errorMessage = 'Unable to determine your location: ' + error.message;
              userFriendlyMessage = '❌ Unable to get location.\n\n• Ensure location services are ON\n• Check app permissions\n• Try using a different browser\n• Or manually enter your city/area';
          }
          
          setLocationError(userFriendlyMessage);
          showNotification(errorMessage, 'error');
          console.error('Geolocation error:', error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000,  // Increased from 10s to 15s
          maximumAge: 0 
        }
      );
    } else {
      const msg = 'Your browser does not support location services. Please use a modern browser like Chrome, Firefox, or Safari.';
      setLocationError(msg);
      setLocationLoading(false);
      showNotification('Geolocation not supported', 'error');
    }
  };

  // 🏠 Use Default City Location (Fallback)
  const useDefaultLocation = (latitude, longitude, cityName) => {
    setUserLocation({ latitude, longitude });
    setLocationError('');
    showNotification(`📍 Using ${cityName} location`, 'success');
  };

  // 🔍 Search Nearby Medicines
  const handleNearbySearch = async (e) => {
    e?.preventDefault();
    
    if (!userLocation.latitude || !userLocation.longitude) {
      showNotification('Please enable GPS location first', 'warning');
      return;
    }

    // Save to recent searches for smart notifications
    if (nearbySearchQuery && nearbySearchQuery.trim()) {
      addRecentSearch(nearbySearchQuery.trim());
    }

    setLoading(true);
    try {
      const response = await medicineAPI.getNearbyMedicines(
        nearbySearchQuery || '',
        userLocation.latitude,
        userLocation.longitude,
        searchRadius,
        sortByNear
      );

      setNearbyMedicines(response.data.medicines || []);
      showNotification(`Found ${response.data.count} medicine(s) near you`, 'success');
    } catch (error) {
      showNotification('Error searching nearby medicines: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // 📬 Check backend for any reminders due and display push/toast
  const checkReminders = async () => {
    try {
      const response = await reminderAPI.checkTrigger();
      const { count, reminders, message } = response.data;
      if (count > 0) {
        showNotification(message, 'info');
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          reminders.forEach((r) => {
            new Notification('Reminder', { body: r.message });
          });
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  const checkPriceDropAlerts = async (deviceId) => {
    try {
      const response = await medicineAPI.getPriceDropAlerts(deviceId, true, 5);
      const alerts = response.data?.alerts || [];

      if (alerts.length > 0) {
        const top = alerts[0];
        showNotification(`💰 Price Drop: ${top.medicineName} now ₹${top.newPrice} (${top.dropPercent}% off)`, 'success');

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          alerts.forEach((alert) => {
            new Notification('Price Drop Alert', {
              body: `${alert.medicineName} dropped from ₹${alert.previousPrice} to ₹${alert.newPrice}`
            });
          });
        }

        await medicineAPI.markAllPriceDropAlertsRead(deviceId);
      }
    } catch (error) {
      if (error?.isNetworkError) {
        notifyNetworkIssueOnce();
        return;
      }
      console.warn('Error checking price drop alerts:', getErrorMessage(error, 'Unknown error'));
    }
  };

  // 🔔 Check for smart notifications (stock updates, inventory changes)
  const checkSmartNotifications = async () => {
    try {
      const smartNotif = await getSmartNotification(userLocation);
      
      if (smartNotif) {
        // Show enhanced smart notification display
        setSmartNotification(smartNotif);
        
        // Also show browser push notification if permitted
        showPushNotification(smartNotif.title, smartNotif.body, smartNotif.icon);
      }
    } catch (error) {
      console.error('Error checking smart notifications:', error);
    }
  };

  // 🎯 Demo function to test smart notifications
  const showDemoNotification = (type) => {
    const demos = {
      stock: {
        title: '🎉 Paracetamol back in stock near you!',
        body: 'Available at Apollo Pharmacy - 1.2km away',
        icon: '💊'
      },
      inventory: {
        title: '📦 5 pharmacies near you updated inventory',
        body: 'Check out the latest stock availability',
        icon: '📦'
      },
      priceAlert: {
        title: '💰 Price drop on Dolo 650mg!',
        body: 'Now ₹35 (was ₹45) at MedPlus - 800m away',
        icon: '💰'
      }
    };

    setSmartNotification(demos[type] || demos.stock);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      showNotification('Please enter a medicine name', 'warning');
      return;
    }

    // Save to recent searches for smart notifications
    addRecentSearch(searchQuery.trim());

    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const response = await medicineAPI.search(searchQuery, { deviceId });
      let filtered = response.data;

      if (filterArea) {
        filtered = filtered.filter(m => m.pharmacy.area === filterArea);
      }

      if (filterPrice !== 'unlimited') {
        const maxPrice = parseInt(filterPrice);
        filtered = filtered.filter(m => m.price <= maxPrice);
      }

      if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'pharmacy') {
        filtered.sort((a, b) => a.pharmacy.name.localeCompare(b.pharmacy.name));
      }

      setMedicines(filtered);
      activateTab('search');
      showNotification(`Found ${filtered.length} result(s)`, 'success');
    } catch (error) {
      showNotification('Error searching medicines: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setLoading(true);
    try {
      const response = await medicineAPI.getMedicinesByCategory(category, 20);
      setMedicines(response.data);
      setFilterCategory(category);
      activateTab('search');
      showNotification(`Showing medicines in "${category}" category`, 'success');
    } catch (error) {
      showNotification('Error loading category: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCallPharmacy = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleAddToCart = (medicine) => {
    showNotification(`Added ${medicine.name} to cart! (Feature coming soon)`, 'success');
  };

  const handleRating = async (medicineId, rating) => {
    if (!token) {
      showNotification('Please login to rate medicines', 'warning');
      navigate('/login');
      return;
    }

    try {
      await medicineAPI.addRating(medicineId, rating);
      setUserRatings(prev => ({ ...prev, [medicineId]: rating }));
      showNotification('Thank you for rating!', 'success');
      loadBestMedicines();
    } catch (error) {
      showNotification('Error adding rating: ' + error.message, 'error');
    }
  };

  const handleViewIncrement = async (medicineId) => {
    try {
      await medicineAPI.incrementViews(medicineId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const scrollToFeatureSection = () => {
    window.requestAnimationFrame(() => {
      featureSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const activateTab = (tabKey, shouldScroll = true) => {
    setActiveTab(tabKey);
    if (shouldScroll) {
      scrollToFeatureSection();
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <h1>Pharmacy Dashboard</h1>
          <p>Find medicines nearby and manage pharmacy services</p>
        </div>
        <div className="nav-buttons">
          {token && <span className="user-welcome">Hi, {user?.name || 'User'}</span>}
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            📊 Dashboard
          </button>
        </div>
      </header>

      {/* Top controls requested by user: tabs and search at top */}
      <div className="top-feature-controls">
        <div className="tabs top-tabs">
          <button
            className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => activateTab('home')}
          >
            🏠 Home
          </button>
          <button
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => activateTab('categories')}
          >
            📋 Categories
          </button>
          <button
            className={`tab-btn ${activeTab === 'near-me' ? 'active' : ''}`}
            onClick={() => activateTab('near-me')}
          >
            📍 Near Me
          </button>
          <button
            className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => activateTab('map')}
          >
            🗺️ Live Map
          </button>
          <button
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => activateTab('search')}
          >
            🔍 Search
          </button>
          <button
            className={`tab-btn ${activeTab === 'pharmacies' ? 'active' : ''}`}
            onClick={() => activateTab('pharmacies')}
          >
            💊 Pharmacies
          </button>

          <div className="emergency-in-tabs" aria-label="Emergency medicine quick access">
            <EmergencyMedicineFinder compact={true} />
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-form top-search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search for medicines (e.g., Aspirin, Paracetamol, Ibuprofen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Searching...' : '🔍 Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Premium Hero Section */}
      <HeroSection
        onSearch={(query) => {
          setSearchQuery(query);
          setLoading(true);
          handleSearch({ preventDefault: () => {} });
        }}
        onLocationDetected={(location) => {
          setUserLocation(location);
          setLocationLoading(false);
          showNotification(`📍 Location detected!`, 'success');
        }}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Nearby Results Preview - Shows immediately after search */}
      {medicines.length > 0 && (
        <NearbyResultsPreview
          medicines={medicines}
          userLocation={userLocation}
          medicineName={searchQuery}
          onViewAll={() => activateTab('search')}
          onCall={handleCallPharmacy}
          onReserve={(medicine) => {
            // Navigate to reserve functionality or open modal
            // Show notification to user
            showNotification(`📋 Click below to reserve ${medicine.name} at ${medicine.pharmacy?.name || 'pharmacy'}`, 'info');
            // Scroll to the medicine card in search results for full reserve functionality
            setTimeout(() => {
              activateTab('search');
            }, 1500);
          }}
        />
      )}

      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : notification.includes('Added') || notification.includes('rating') ? 'success' : 'info'}`}>
          {notification}
        </div>
      )}

      {/* Smart Notifications - Stock Updates & Inventory Changes */}
      <SmartNotificationDisplay 
        notification={smartNotification}
        onClose={() => setSmartNotification(null)}
        duration={6000}
      />

      {/* Action Buttons Section */}
      {token && (
        <>
          <div className="action-buttons-section">
            <div className="action-buttons">
            <button 
              onClick={() => navigate('/upload-prescription')} 
              className="btn btn-secondary"
            >
              📸 Prescription
            </button>
            <button 
              onClick={() => navigate('/emergency')} 
              className="btn btn-danger"
              title="Find 24x7 pharmacies nearby"
            >
              🚨 Find 24x7
            </button>
            <button 
              onClick={() => navigate('/compare-price')} 
              className="btn btn-secondary"
              title="Compare medicine prices across pharmacies"
            >
              💰 Compare
            </button>
            <button 
              onClick={() => navigate('/medicine-reminders')} 
              className="btn btn-secondary"
              title="Set medicine refill reminders"
            >
              ⏰ Reminder
            </button>
            <button 
              onClick={() => navigate('/delivery')} 
              className="btn btn-success"
              title="FastTrack delivery service"
            >
              🚚 Delivery
            </button>
            <button 
              onClick={() => navigate('/reservations')} 
              className="btn btn-warning"
              title="View your medicine reservations"
            >
              🛒 Reservations
            </button>
            <button 
              onClick={() => navigate('/prescriptions')} 
              className="btn btn-secondary"
            >
              📋 My RX
            </button>
            <button 
              onClick={() => navigate('/pharmacy/prescriptions')} 
              className="btn btn-secondary"
            >
              💬 Respond
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-primary"
            >
              📊 Dashboard
            </button>
            {/* Smart Notification Demo Button */}
            <button 
              onClick={() => showDemoNotification('stock')} 
              className="btn"
              title="Demo: See Smart Stock Notifications in Action!"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              🔔 Test Smart
            </button>
          </div>
        </div>
        </>
      )}

      <div ref={featureSectionRef} className="feature-content-anchor">
      {activeTab === 'home' && (
        <div className="home-section fade-in-up">
          {/* Best Medicines Section */}
          {bestMedicines.length > 0 && (
            <div className="featured-section">
              <h2>⭐ Best Rated Medicines</h2>
              <p className="section-subtitle">Highest rated medicines from our customers</p>
              <div className="medicines-grid fade-in-stagger">
                {bestMedicines.map((medicine) => {
                  const pharmacyDistanceInfo = userLocation.latitude && userLocation.longitude
                    ? getPharmacyDistanceInfo(medicine.pharmacy, userLocation.latitude, userLocation.longitude)
                    : null;
                  return (
                    <MedicineCard
                      key={medicine._id}
                      medicine={medicine}
                      userLocation={userLocation}
                      showDistance={false}
                      onCall={handleCallPharmacy}
                      onReservation={(reservation) => {
                        const expiryTime = getReservationEndTime(new Date(reservation.createdAt));
                        setReservedMedicines(prev => ({ ...prev, [medicine._id]: expiryTime }));
                        showNotification('🎉 Medicine reserved! Check "My Reservations" tab', 'success');
                      }}
                      onRating={handleRating}
                      isReserved={!!reservedMedicines[medicine._id]}
                      timeRemaining={reservedMedicines[medicine._id] ? formatTimeRemaining(getTimeUntilExpiry(reservedMedicines[medicine._id])) : null}
                      userRating={userRatings[medicine._id]}
                      onViewIncrement={handleViewIncrement}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {recommendedMedicines.length > 0 && (
            <div className="featured-section">
              <h2>🔥 Trending Recommendations</h2>
              <p className="section-subtitle">Popular medicines trending in your area</p>
              <div className="medicines-grid fade-in-stagger">
                {recommendedMedicines.map((medicine) => {
                  const pharmacyDistanceInfo = userLocation.latitude && userLocation.longitude
                    ? getPharmacyDistanceInfo(medicine.pharmacy, userLocation.latitude, userLocation.longitude)
                    : null;
                  return (
                    <MedicineCard
                      key={medicine._id}
                      medicine={medicine}
                      userLocation={userLocation}
                      showDistance={false}
                      onCall={handleCallPharmacy}
                      onReservation={(reservation) => {
                        const expiryTime = getReservationEndTime(new Date(reservation.createdAt));
                        setReservedMedicines(prev => ({ ...prev, [medicine._id]: expiryTime }));
                        showNotification('🎉 Medicine reserved! Check "My Reservations" tab', 'success');
                      }}
                      onRating={handleRating}
                      isReserved={!!reservedMedicines[medicine._id]}
                      timeRemaining={reservedMedicines[medicine._id] ? formatTimeRemaining(getTimeUntilExpiry(reservedMedicines[medicine._id])) : null}
                      userRating={userRatings[medicine._id]}
                      onViewIncrement={handleViewIncrement}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Market Intelligence - Trending Medicines */}
          <TrendingMedicines />

          <div className="featured-section">
            <HeatmapPreviewCard compact={true} />
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="categories-section fade-in-up">
          <div className="categories-header">
            <h2>📋 Browse by Category</h2>
            <p className="categories-subtitle">Select a category to find medicines</p>
          </div>
          
          <div className="categories-showcase fade-in-stagger">
            {categories.map(category => (
              <button
                key={category}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-icon">📚</div>
                <div className="category-name">{category}</div>
                <div className="category-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'near-me' && (
        <div className="near-me-section fade-in-up">
          <div className="location-header">
            <h2>📍 Find Medicines Near Me</h2>
            <button 
              onClick={getUserLocation}
              className={`btn ${userLocation.latitude ? 'btn-success' : 'btn-primary'}`}
              disabled={locationLoading}
            >
              {locationLoading ? '🔄 Getting Location...' : userLocation.latitude ? '✅ Location Found' : '📍 Use My GPS Location'}
            </button>
          </div>

          {userLocation.latitude && (
            <div className="location-info">
              <p className="location-display">
                📍 Your Location: <strong>{userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</strong>
              </p>
            </div>
          )}

          {locationError && (
            <div className="location-error-section">
              <div className="error-message">
                ⚠️ {locationError}
              </div>
              
              {/* Fallback: Popular Cities Option */}
              <div className="fallback-locations">
                <p className="fallback-label">💡 Don't worry! Select your city to search for nearby medicines:</p>
                <div className="cities-grid">
                  <button 
                    type="button"
                    className="city-btn"
                    onClick={() => useDefaultLocation(28.7041, 77.1025, 'New Delhi')}
                    title="Search in New Delhi area"
                  >
                    🏙️ New Delhi
                  </button>
                  <button 
                    type="button"
                    className="city-btn"
                    onClick={() => useDefaultLocation(19.0760, 72.8777, 'Mumbai')}
                    title="Search in Mumbai area"
                  >
                    🏙️ Mumbai
                  </button>
                  <button 
                    type="button"
                    className="city-btn"
                    onClick={() => useDefaultLocation(13.0827, 80.2707, 'Chennai')}
                    title="Search in Chennai area"
                  >
                    🏙️ Chennai
                  </button>
                  <button 
                    type="button"
                    className="city-btn"
                    onClick={() => useDefaultLocation(23.1815, 79.9864, 'Indore')}
                    title="Search in Indore area"
                  >
                    🏙️ Indore
                  </button>
                  <button 
                    type="button"
                    className="city-btn"
                    onClick={() => useDefaultLocation(22.5726, 88.3639, 'Kolkata')}
                    title="Search in Kolkata area"
                  >
                    🏙️ Kolkata
                  </button>
                  <button 
                    type="button"
                    className="city-btn"
                    onClick={() => useDefaultLocation(31.6340, 74.8711, 'Lahore')}
                    title="Search in Lahore area"
                  >
                    🏙️ Lahore
                  </button>
                  <button 
                    type="button"
                    className="city-btn"
                    onClick={() => useDefaultLocation(17.3850, 78.4867, 'Hyderabad')}
                    title="Search in Hyderabad area"
                  >
                    🏙️ Hyderabad
                  </button>
                  <button 
                    type="button"
                    className="city-btn"
                    onClick={() => useDefaultLocation(25.2048, 75.8362, 'Jaipur')}
                    title="Search in Jaipur area"
                  >
                    🏙️ Jaipur
                  </button>
                </div>
                
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={getUserLocation}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  🔄 Retry GPS Location
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleNearbySearch} className="near-me-form">
            <div className="near-me-inputs">
              <div className="input-group">
                <label>Medicine Name (optional)</label>
                <input
                  type="text"
                  placeholder="Search for specific medicine..."
                  value={nearbySearchQuery}
                  onChange={(e) => setNearbySearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="input-group">
                <label>Search Radius (km) <span className="radius-value">{searchRadius} km</span></label>
                <input 
                  type="range"
                  min="1"
                  max="50"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(e.target.value)}
                  className="radius-slider"
                />
                <div className="radius-quick-select">
                  {[1, 2, 5, 10, 20, 50].map(radius => (
                    <button
                      key={radius}
                      type="button"
                      className={`radius-btn ${searchRadius == radius ? 'active' : ''}`}
                      onClick={() => setSearchRadius(String(radius))}
                      title={`${radius} km radius`}
                    >
                      {radius}km
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Sort By</label>
                <select 
                  value={sortByNear}
                  onChange={(e) => setSortByNear(e.target.value)}
                  className="filter-select"
                >
                  <option value="nearest">📍 Nearest First</option>
                  <option value="cheapest">💰 Cheapest First</option>
                  <option value="fastest">🚚 Fastest Delivery</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading || !userLocation.latitude}
            >
              {loading ? '🔄 Searching...' : '🔍 Search Nearby'}
            </button>
          </form>

          {nearbyMedicines.length > 0 && (
            <div className="near-me-results">
              <h3>Found {nearbyMedicines.length} Medicine(s) Near You</h3>
              <div className="medicines-grid">
                {nearbyMedicines.map((medicine) => {
                  const pharmacyDistanceInfo = userLocation.latitude && userLocation.longitude
                    ? getPharmacyDistanceInfo(medicine.pharmacy, userLocation.latitude, userLocation.longitude)
                    : null;
                  return (
                    <MedicineCard
                      key={medicine._id}
                      medicine={medicine}
                      userLocation={userLocation}
                      showDistance={true}
                      onCall={handleCallPharmacy}
                      onReservation={(reservation) => {
                        const expiryTime = getReservationEndTime(new Date(reservation.createdAt));
                        setReservedMedicines(prev => ({ ...prev, [medicine._id]: expiryTime }));
                        showNotification('🎉 Medicine reserved! Check "My Reservations" tab', 'success');
                      }}
                      onRating={handleRating}
                      isReserved={!!reservedMedicines[medicine._id]}
                      timeRemaining={reservedMedicines[medicine._id] ? formatTimeRemaining(getTimeUntilExpiry(reservedMedicines[medicine._id])) : null}
                      pharmacyDistanceInfo={pharmacyDistanceInfo}
                      userRating={userRatings[medicine._id]}
                      onViewIncrement={handleViewIncrement}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {!userLocation.latitude && !locationError && (
            <div className="no-results">
              <p>🔍 Click "Use My GPS Location" to find medicines near you</p>
            </div>
          )}

          {userLocation.latitude && nearbyMedicines.length === 0 && !loading && (
            <div className="no-results">
              <p>❌ No medicines found in the selected radius</p>
              <p>Try increasing the search radius or searching for a specific medicine</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <PharmacyMapView medicineName={searchQuery} />
      )}

      {activeTab === 'search' && (
        <div className="search-section">
          {filterCategory && (
            <div className="category-header">
              <h2>📂 {filterCategory}</h2>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setFilterCategory('');
                  setMedicines([]);
                }}
              >
                Clear Category
              </button>
            </div>
          )}

          {medicines.length > 0 && (
            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="area-filter">Area:</label>
                <select 
                  id="area-filter"
                  value={filterArea} 
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Areas</option>
                  {uniqueAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="price-filter">Max Price:</label>
                <select 
                  id="price-filter"
                  value={filterPrice} 
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="filter-select"
                >
                  <option value="unlimited">No Limit</option>
                  <option value="100">₹100</option>
                  <option value="500">₹500</option>
                  <option value="1000">₹1000</option>
                  <option value="5000">₹5000</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="sort-filter">Sort By:</label>
                <select 
                  id="sort-filter"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="pharmacy">Pharmacy Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          )}

          <div className="medicines-grid">
            {medicines.length > 0 ? (
              medicines.map((medicine) => {
                const pharmacyDistanceInfo = userLocation.latitude && userLocation.longitude
                  ? getPharmacyDistanceInfo(medicine.pharmacy, userLocation.latitude, userLocation.longitude)
                  : null;
                return (
                  <MedicineCard
                    key={medicine._id}
                    medicine={medicine}
                    userLocation={userLocation}
                    showDistance={false}
                    onCall={handleCallPharmacy}
                    onReservation={(reservation) => {
                      const expiryTime = getReservationEndTime(new Date(reservation.createdAt));
                      setReservedMedicines(prev => ({ ...prev, [medicine._id]: expiryTime }));
                      showNotification('🎉 Medicine reserved! Check "My Reservations" tab', 'success');
                    }}
                    onRating={handleRating}
                    isReserved={!!reservedMedicines[medicine._id]}
                    timeRemaining={reservedMedicines[medicine._id] ? formatTimeRemaining(getTimeUntilExpiry(reservedMedicines[medicine._id])) : null}
                    userRating={userRatings[medicine._id]}
                    onViewIncrement={handleViewIncrement}
                  />
                );
              })
            ) : searchQuery && !loading ? (
              <div className="no-results">
                <p>❌ No medicines found matching "{searchQuery}"</p>
                <p>Try a different search term</p>
              </div>
            ) : (
              <div className="no-results">
                <p>🔍 Select a category or enter a medicine name above to search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pharmacies' && (
        <div className="pharmacies-section">
          {/* Pharmacy Status Filter Buttons */}
          <div className="pharmacy-filter-buttons">
            <button 
              className={`filter-btn ${pharmacyStatusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPharmacyStatusFilter('all')}
            >
              🏪 All Pharmacies
            </button>
            <button 
              className={`filter-btn open ${pharmacyStatusFilter === 'open' ? 'active' : ''}`}
              onClick={() => setPharmacyStatusFilter('open')}
            >
              🟢 Open Now
            </button>
            <button 
              className={`filter-btn closing-soon ${pharmacyStatusFilter === 'closing-soon' ? 'active' : ''}`}
              onClick={() => setPharmacyStatusFilter('closing-soon')}
            >
              🟡 Closing Soon
            </button>
            <button 
              className={`filter-btn closed ${pharmacyStatusFilter === 'closed' ? 'active' : ''}`}
              onClick={() => setPharmacyStatusFilter('closed')}
            >
              🔴 Closed
            </button>
            <button 
              className={`filter-btn open-24x7 ${pharmacyStatusFilter === '24x7' ? 'active' : ''}`}
              onClick={() => setPharmacyStatusFilter('24x7')}
            >
              ⏰ 24×7
            </button>
          </div>

          <div className="pharmacies-grid">
            {pharmacies.length > 0 ? (
              pharmacies.map((pharmacy) => {
                const distanceInfo = getPharmacyDistanceInfo(
                  pharmacy,
                  userLocation.latitude,
                  userLocation.longitude
                );

                return (
                  <div key={pharmacy._id} className="pharmacy-card">
                    <div className="pharmacy-header">
                      <h3>💊 {pharmacy.name}</h3>
                      <PharmacyOpenStatus pharmacy={pharmacy} view="badge" />
                    </div>

                    {/* Distance Display - Below Pharmacy Name */}
                    <div className="pharmacy-distance-info">
                      <p className="distance-text">{distanceInfo.distanceDisplay}</p>
                      <p className="drive-time-text">{distanceInfo.driveTimeDisplay}</p>
                    </div>
                    
                    <div className="pharmacy-details">
                      <p><strong>Owner:</strong> {pharmacy.owner}</p>
                      <p><strong>Area:</strong> 📍 {pharmacy.area}</p>
                      <p><strong>License:</strong> {pharmacy.licenseNumber}</p>
                    </div>

                    <div className="pharmacy-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleCallPharmacy(pharmacy.phone)}
                      >
                        📞 {pharmacy.phone}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                <p>📌 No pharmacies available</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      <footer className="home-footer">
        <p>© 2026 MediNear - Medicine Availability Platform</p>
      </footer>
    </div>
  );
}
