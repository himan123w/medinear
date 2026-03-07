import React, { useState, useEffect } from 'react';
import { medicineAPI, reservationAPI } from '../api';
import ReserveButton from '../components/ReserveButton';
import ReservationTimer from '../components/ReservationTimer';
import './MedicineSearchWithReserve.css';

/**
 * Example Component: Medicine Search with Reservation Feature
 * This demonstrates how to integrate the Reserve button into your existing medicine search
 */
const MedicineSearchWithReserve = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeReservations, setActiveReservations] = useState([]);

  // Fetch active reservations on mount
  useEffect(() => {
    fetchActiveReservations();
  }, []);

  const fetchActiveReservations = async () => {
    try {
      const response = await reservationAPI.getMyReservations('active');
      setActiveReservations(response.data.data.reservations);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const response = await medicineAPI.search(searchTerm);
      setMedicines(response.data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReservationCreated = (reservation) => {
    // Refresh active reservations
    fetchActiveReservations();
    
    // Show success message
    alert(`🎉 Medicine reserved successfully!\nCode: ${reservation.reservationCode}\nPlease collect within 30 minutes.`);
    
    // Optionally scroll to reservations section
    document.getElementById('active-reservations')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="medicine-search-reserve">
      {/* Active Reservations Section */}
      {activeReservations.length > 0 && (
        <div id="active-reservations" className="active-reservations-section">
          <h2>⏰ Active Reservations ({activeReservations.length})</h2>
          <div className="reservations-grid">
            {activeReservations.map(reservation => (
              <ReservationTimer 
                key={reservation._id}
                reservation={reservation}
                onExpired={fetchActiveReservations}
                onCancelled={fetchActiveReservations}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="search-section">
        <h1>🔍 Search & Reserve Medicines</h1>
        <form onSubmit={handleSearch}>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search for medicines (e.g., Paracetamol, Crocin...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {medicines.length > 0 && (
        <div className="results-section fade-in">
          <h2>Search Results ({medicines.length})</h2>
          <div className="medicines-grid fade-in-stagger">
            {medicines.map(medicine => (
              <MedicineCard 
                key={medicine._id}
                medicine={medicine}
                onReservationCreated={handleReservationCreated}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && medicines.length === 0 && searchTerm && (
        <div className="empty-state">
          <p>No medicines found for "{searchTerm}"</p>
          <p>Try searching with a different term</p>
        </div>
      )}
    </div>
  );
};

/**
 * Medicine Card Component with Reserve Button
 */
const MedicineCard = ({ medicine, onReservationCreated }) => {
  const [expanded, setExpanded] = useState(false);

  const stockStatus = medicine.stock === 0 ? 'out-of-stock' : 
                      medicine.stock < medicine.stockAlert ? 'low-stock' : 
                      'in-stock';

  return (
    <div className={`medicine-card card ${stockStatus}`}>
      {/* Stock Badge */}
      <div className={`stock-badge ${stockStatus}`}>
        {stockStatus === 'out-of-stock' ? '❌ Out of Stock' :
         stockStatus === 'low-stock' ? '⚠️ Low Stock' :
         '✅ In Stock'}
      </div>

      {/* Medicine Info */}
      <div className="medicine-header">
        <h3>{medicine.name}</h3>
        <p className="category">{medicine.category || 'General'}</p>
      </div>

      <div className="medicine-details">
        <div className="detail-row">
          <span className="label">Price:</span>
          <span className="value price">₹{medicine.price}</span>
        </div>
        <div className="detail-row">
          <span className="label">Available:</span>
          <span className="value stock">{medicine.stock} units</span>
        </div>
        <div className="detail-row">
          <span className="label">Pharmacy:</span>
          <span className="value">{medicine.pharmacy?.name || 'N/A'}</span>
        </div>
        {medicine.pharmacy?.address && (
          <div className="detail-row">
            <span className="label">Location:</span>
            <span className="value">{medicine.pharmacy.address}</span>
          </div>
        )}
      </div>

      {/* Rating & Reviews */}
      {medicine.rating > 0 && (
        <div className="rating-section">
          <span className="stars">⭐ {medicine.rating.toFixed(1)}</span>
          <span className="reviews">({medicine.reviews} reviews)</span>
        </div>
      )}

      {/* Actions */}
      <div className="card-actions">
        {medicine.stock > 0 && medicine.pharmacy && (
          <ReserveButton 
            medicine={medicine}
            pharmacy={medicine.pharmacy}
            onReservationCreated={onReservationCreated}
          />
        )}
        <button 
          className="view-details-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="expanded-details">
          <h4>Medicine Information</h4>
          {medicine.description && <p>{medicine.description}</p>}
          {medicine.manufacturer && (
            <p><strong>Manufacturer:</strong> {medicine.manufacturer}</p>
          )}
          {medicine.expiryDate && (
            <p><strong>Expiry:</strong> {new Date(medicine.expiryDate).toLocaleDateString()}</p>
          )}
          {medicine.batchNumber && (
            <p><strong>Batch:</strong> {medicine.batchNumber}</p>
          )}
        </div>
      )}

      {/* Reserve Info Tooltip */}
      {medicine.stock > 0 && (
        <div className="reserve-info-tooltip">
          💡 Reserve this medicine for 30 minutes to guarantee availability
        </div>
      )}
    </div>
  );
};

export default MedicineSearchWithReserve;
