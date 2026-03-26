import { useState } from 'react';
import { getPharmacyDistanceInfo } from '../utils/distanceCalculator';
import './NearbyResultsPreview.css';

/**
 * Nearby Results Preview Component
 * Shows quick results immediately after search with distance, price, and stock status
 * 
 * 📍 Life Pharmacy – 1.2 km
 * ₹35 | In stock
 */
export default function NearbyResultsPreview({
  medicines = [],
  userLocation = { latitude: null, longitude: null },
  medicineName = '',
  onViewAll = () => {},
  onCall = () => {},
  onReserve = () => {},
}) {
  const [expandedPharmacy, setExpandedPharmacy] = useState(null);

  if (!medicines || medicines.length === 0) {
    return null;
  }

  // Group medicines by pharmacy and get the cheapest price for the medicine at each pharmacy
  const pharmacyGroups = {};
  
  medicines.forEach(medicine => {
    if (!medicine.pharmacy) return; // Skip medicines without pharmacy data
    
    const pharmacyKey = medicine.pharmacy?._id || medicine.pharmacy?.name || 'unknown';
    
    if (!pharmacyGroups[pharmacyKey]) {
      pharmacyGroups[pharmacyKey] = {
        pharmacy: medicine.pharmacy,
        medicines: [],
        minPrice: medicine.price,
        maxPrice: medicine.price,
        lowestPriceMedicine: medicine,
        stockStatus: medicine.availability?.level || 'unknown'
      };
    }
    
    pharmacyGroups[pharmacyKey].medicines.push(medicine);
    pharmacyGroups[pharmacyKey].minPrice = Math.min(pharmacyGroups[pharmacyKey].minPrice, medicine.price);
    pharmacyGroups[pharmacyKey].maxPrice = Math.max(pharmacyGroups[pharmacyKey].maxPrice, medicine.price);
    
    // Update stock status - prefer 'in-stock', then 'low-stock'
    const status = medicine.availability?.level || 'unknown';
    if (status === 'in-stock') {
      pharmacyGroups[pharmacyKey].stockStatus = 'in-stock';
    } else if (status === 'low-stock' && pharmacyGroups[pharmacyKey].stockStatus !== 'in-stock') {
      pharmacyGroups[pharmacyKey].stockStatus = 'low-stock';
    }
  });

  // Convert to array and sort by distance (if user location available)
  let pharmacyResults = Object.values(pharmacyGroups);
  
  if (userLocation.latitude && userLocation.longitude) {
    pharmacyResults.sort((a, b) => {
      const distA = getPharmacyDistanceInfo(a.pharmacy, userLocation.latitude, userLocation.longitude);
      const distB = getPharmacyDistanceInfo(b.pharmacy, userLocation.latitude, userLocation.longitude);
      return distA.distanceInKm - distB.distanceInKm;
    });
  }

  // Show top 5 pharmacies
  const topPharmacies = pharmacyResults.slice(0, 5);

  // Helper function to get stock badge
  const getStockBadge = (status) => {
    switch (status) {
      case 'in-stock':
        return { icon: '🟢', text: 'In stock', color: 'success' };
      case 'low-stock':
        return { icon: '🟡', text: 'Limited stock', color: 'warning' };
      case 'out-of-stock':
        return { icon: '🔴', text: 'Out of stock', color: 'error' };
      default:
        return { icon: '⚪', text: 'Unknown', color: 'neutral' };
    }
  };

  return (
    <div className="nearby-results-preview">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <h2 className="results-title">
            <span className="search-emoji">🔍</span>
            {medicineName && <span className="medicine-name">{medicineName}</span>}
            <span className="available-nearby">available nearby</span>
          </h2>
          <button 
            className="view-all-btn"
            onClick={onViewAll}
            type="button"
            title="View all results"
          >
            View All →
          </button>
        </div>

        {/* Results Grid */}
        <div className="results-grid">
          {topPharmacies.map((group, index) => {
            const distanceInfo = userLocation.latitude && userLocation.longitude
              ? getPharmacyDistanceInfo(group.pharmacy, userLocation.latitude, userLocation.longitude)
              : null;
            const isExpanded = expandedPharmacy === index;
            const stockBadge = getStockBadge(group.stockStatus);

            return (
              <div 
                key={`${group.pharmacy._id || group.pharmacy.name}-${index}`}
                className={`result-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpandedPharmacy(isExpanded ? null : index)}
              >
                {/* Main Row - Distance, Pharmacy Name, Price, Stock */}
                <div className="result-main">
                  {/* Location + Pharmacy */}
                  <div className="pharmacy-info">
                    {distanceInfo && (
                      <span className="distance-badge">
                        <span className="distance-icon">📍</span>
                        <span className="distance-value">{distanceInfo.distanceDisplay}</span>
                      </span>
                    )}
                    <h3 className="pharmacy-name">{group.pharmacy.name}</h3>
                  </div>

                  {/* Price + Stock */}
                  <div className="price-stock">
                    <span className="price">
                      <span className="currency">₹</span>{group.minPrice.toFixed(0)}
                    </span>
                    <span className={`stock-badge stock-${stockBadge.color}`}>
                      <span className="stock-icon">{stockBadge.icon}</span>
                      <span className="stock-text">{stockBadge.text}</span>
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="result-details">
                    {/* Pharmacy Location */}
                    <div className="detail-row">
                      <span className="detail-label">📍 Location</span>
                      <span className="detail-value">{group.pharmacy.area}</span>
                    </div>

                    {/* Price Range */}
                    {group.minPrice !== group.maxPrice && (
                      <div className="detail-row">
                        <span className="detail-label">💰 Price Range</span>
                        <span className="detail-value">
                          ₹{group.minPrice.toFixed(0)} - ₹{group.maxPrice.toFixed(0)}
                        </span>
                      </div>
                    )}

                    {/* Available Count */}
                    <div className="detail-row">
                      <span className="detail-label">📦 Available</span>
                      <span className="detail-value">{group.medicines.length} variant(s)</span>
                    </div>

                    {/* Pharmacy Rating */}
                    {group.pharmacy.rating && (
                      <div className="detail-row">
                        <span className="detail-label">⭐ Pharmacy Rating</span>
                        <span className="detail-value">
                          {group.pharmacy.rating.toFixed(1)}/5 ({group.pharmacy.reviewCount || 0} reviews)
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="detail-buttons">
                      <button 
                        className="action-btn call-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCall(group.pharmacy.phone);
                        }}
                        type="button"
                        aria-label={`Call ${group.pharmacy.name}`}
                        title={`Call ${group.pharmacy.name} now`}
                      >
                        <span className="btn-icon">📞</span>
                        <span className="btn-label">Call Pharmacy</span>
                      </button>
                      <button 
                        className="action-btn reserve-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReserve(group.lowestPriceMedicine);
                        }}
                        type="button"
                        aria-label={`Reserve ${group.lowestPriceMedicine?.name || 'medicine'} for 30 minutes`}
                        title="Reserve this medicine for 30 minutes"
                      >
                        <span className="btn-icon">🛒</span>
                        <span className="btn-label">Reserve Medicine</span>
                      </button>
                      <button 
                        className="action-btn directions-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (group.pharmacy.latitude && group.pharmacy.longitude) {
                            const url = `https://maps.google.com/?q=${group.pharmacy.latitude},${group.pharmacy.longitude}`;
                            window.open(url, '_blank');
                          }
                        }}
                        type="button"
                        aria-label={`Get directions to ${group.pharmacy.name}`}
                        title="Get directions to pharmacy"
                      >
                        <span className="btn-icon">🗺️</span>
                        <span className="btn-label">Get Directions</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        {topPharmacies.length < pharmacyResults.length && (
          <div className="results-footer">
            <p>
              Showing <strong>{topPharmacies.length}</strong> of <strong>{pharmacyResults.length}</strong> pharmacies
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
