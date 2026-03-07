import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineAPI, pharmacyAPI } from '../api';
import { useAuth } from '../AuthContext';
import './Home.css';

export default function Home() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterPrice, setFilterPrice] = useState('unlimited');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [notification, setNotification] = useState('');
  const [sortBy, setSortBy] = useState('pharmacy');
  const [uniqueAreas, setUniqueAreas] = useState([]);

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      const response = await pharmacyAPI.getPharmacies();
      setPharmacies(response.data);
      // Extract unique areas for filter
      const areas = [...new Set(response.data.map(p => p.area))];
      setUniqueAreas(areas);
    } catch (error) {
      showNotification('Error loading pharmacies: ' + error.message, 'error');
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      showNotification('Please enter a medicine name', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await medicineAPI.search(searchQuery);
      let filtered = response.data;

      // Apply area filter
      if (filterArea) {
        filtered = filtered.filter(m => m.pharmacy.area === filterArea);
      }

      // Apply price filter
      if (filterPrice !== 'unlimited') {
        const maxPrice = parseInt(filterPrice);
        filtered = filtered.filter(m => m.price <= maxPrice);
      }

      // Apply sorting
      if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'pharmacy') {
        filtered.sort((a, b) => a.pharmacy.name.localeCompare(b.pharmacy.name));
      }

      setMedicines(filtered);
      showNotification(`Found ${filtered.length} result(s)`, 'success');
    } catch (error) {
      showNotification('Error searching medicines: ' + error.message, 'error');
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

  return (
    <div className="home-container">
      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : notification.includes('Added') ? 'success' : 'info'}`}>
          {notification}
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <h1>🏥 MediNear</h1>
          <p className="tagline">Your Medicine Availability Platform</p>
        </div>
        <nav className="nav-buttons">
          {token ? (
            <>
              <span className="user-welcome">Welcome!</span>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn btn-primary"
              >
                📊 Dashboard
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="btn btn-secondary"
              >
                🔐 Login
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className="btn btn-primary"
              >
                ✏️ Register Pharmacy
              </button>
            </>
          )}
        </nav>
      </header>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search Medicines
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pharmacies' ? 'active' : ''}`}
          onClick={() => setActiveTab('pharmacies')}
        >
          💊 Browse Pharmacies
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
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
              medicines.map((medicine) => (
                <div key={medicine._id} className="medicine-card">
                  <div className="medicine-header">
                    <h3>{medicine.name}</h3>
                    <span className="badge">In Stock ✓</span>
                  </div>
                  
                  <div className="medicine-price">
                    <p className="price">₹{medicine.price.toFixed(2)}</p>
                  </div>

                  <div className="pharmacy-info">
                    <h4>💊 {medicine.pharmacy?.name || 'Pharmacy Not Available'}</h4>
                    {medicine.pharmacy?.area && (
                      <p><strong>Area:</strong> {medicine.pharmacy.area}</p>
                    )}
                    {medicine.pharmacy?.licenseNumber && (
                      <p><strong>License:</strong> {medicine.pharmacy.licenseNumber}</p>
                    )}
                  </div>

                  <div className="medicine-actions">
                    {medicine.pharmacy?.phone && (
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleCallPharmacy(medicine.pharmacy.phone)}
                      >
                        📞 Call: {medicine.pharmacy.phone}
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAddToCart(medicine)}
                    >
                      🛒 Order
                    </button>
                  </div>
                </div>
              ))
            ) : searchQuery && !loading ? (
              <div className="no-results">
                <p>❌ No medicines found matching "{searchQuery}"</p>
                <p>Try a different search term</p>
              </div>
            ) : (
              <div className="no-results">
                <p>🔍 Enter a medicine name above to search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pharmacies' && (
        <div className="pharmacies-section">
          <div className="pharmacies-grid">
            {pharmacies.length > 0 ? (
              pharmacies.map((pharmacy) => (
                <div key={pharmacy._id} className="pharmacy-card">
                  <div className="pharmacy-header">
                    <h3>💊 {pharmacy.name}</h3>
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
              ))
            ) : (
              <div className="no-results">
                <p>📌 No pharmacies available</p>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="home-footer">
        <p>© 2026 MediNear - Medicine Availability Platform</p>
      </footer>
    </div>
  );
}
