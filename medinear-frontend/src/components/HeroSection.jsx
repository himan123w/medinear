import { useState, useEffect } from 'react';
import '../styles/HeroSection.css';

/**
 * Premium Hero Section Component - Search First
 * Displays main value proposition with intelligent autocomplete search
 */
export default function HeroSection({ 
  onSearch, 
  onLocationDetected,
  loading = false,
  searchQuery = '',
  onSearchChange = () => {}
}) {
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Medicine database with variations (doses, forms) - Expanded for better autocomplete
  const medicinesDatabase = [
    { name: 'Paracetamol', variations: ['Paracetamol 500mg', 'Paracetamol 650mg', 'Paracetamol Syrup', 'Paracetamol Tablet', 'Paracetamol IV'] },
    { name: 'Aspirin', variations: ['Aspirin 75mg', 'Aspirin 325mg', 'Aspirin 500mg', 'Aspirin Enteric Coated'] },
    { name: 'Ibuprofen', variations: ['Ibuprofen 200mg', 'Ibuprofen 400mg', 'Ibuprofen 600mg', 'Ibuprofen Gel', 'Ibuprofen Suspension'] },
    { name: 'Cetirizine', variations: ['Cetirizine 5mg', 'Cetirizine 10mg', 'Cetirizine Syrup', 'Cetirizine 24hr'] },
    { name: 'Omeprazole', variations: ['Omeprazole 20mg', 'Omeprazole 40mg', 'Omeprazole Capsule', 'Omeprazole DR'] },
    { name: 'Amoxicillin', variations: ['Amoxicillin 250mg', 'Amoxicillin 500mg', 'Amoxicillin 875mg', 'Amoxicillin Syrup'] },
    { name: 'Azithromycin', variations: ['Azithromycin 250mg', 'Azithromycin 500mg', 'Azithromycin Suspension', 'Z-Pack'] },
    { name: 'Cough Syrup', variations: ['Cough Syrup', 'Honey Cough Syrup', 'Cough Expectorant', 'Dry Cough Relief'] },
    { name: 'Vitamin D', variations: ['Vitamin D3 400IU', 'Vitamin D3 1000IU', 'Vitamin D3 2000IU', 'Vitamin D3 5000IU'] },
    { name: 'Vitamin C', variations: ['Vitamin C 500mg', 'Vitamin C 1000mg', 'Vitamin C Chewable', 'Vitamin C Effervescent'] },
    { name: 'Calcium', variations: ['Calcium 500mg', 'Calcium 1000mg', 'Calcium + Vitamin D', 'Calcium Citrate'] },
    { name: 'Iron', variations: ['Iron 150mg', 'Iron + Folic Acid', 'Iron Syrup', 'Ferrous Sulfate'] },
    { name: 'Metformin', variations: ['Metformin 500mg', 'Metformin 850mg', 'Metformin 1000mg', 'Metformin XR'] },
    { name: 'Atorvastatin', variations: ['Atorvastatin 10mg', 'Atorvastatin 20mg', 'Atorvastatin 40mg', 'Atorvastatin 80mg'] },
    { name: 'Amlodipine', variations: ['Amlodipine 2.5mg', 'Amlodipine 5mg', 'Amlodipine 10mg'] },
    { name: 'Losartan', variations: ['Losartan 25mg', 'Losartan 50mg', 'Losartan 100mg'] },
    { name: 'Levothyroxine', variations: ['Levothyroxine 25mcg', 'Levothyroxine 50mcg', 'Levothyroxine 75mcg', 'Levothyroxine 100mcg'] },
    { name: 'Pantoprazole', variations: ['Pantoprazole 20mg', 'Pantoprazole 40mg', 'Pantoprazole DR'] },
    { name: 'Montelukast', variations: ['Montelukast 4mg', 'Montelukast 5mg', 'Montelukast 10mg'] },
    { name: 'Salbutamol', variations: ['Salbutamol Inhaler', 'Salbutamol 2mg', 'Salbutamol 4mg', 'Salbutamol Nebulizer'] },
    { name: 'Loratadine', variations: ['Loratadine 10mg', 'Loratadine Syrup', 'Loratadine 24hr'] },
    { name: 'Dolo', variations: ['Dolo 650mg', 'Dolo 500mg', 'Dolo Suspension'] },
    { name: 'Crocin', variations: ['Crocin 500mg', 'Crocin 650mg', 'Crocin Advance', 'Crocin Pain Relief'] },
    { name: 'Disprin', variations: ['Disprin Regular', 'Disprin Extra', 'Disprin Tablet'] },
    { name: 'Vicks', variations: ['Vicks VapoRub', 'Vicks Cough Syrup', 'Vicks Action 500'] }
  ];

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    onSearchChange(value);

    // Smart autocomplete with medicine variations
    if (value.length > 0) {
      const lowerValue = value.toLowerCase();
      const filtered = [];

      // Search through medicine database
      medicinesDatabase.forEach(medicine => {
        // Check if medicine name matches
        if (medicine.name.toLowerCase().includes(lowerValue)) {
          // Add all variations of this medicine
          medicine.variations.forEach(variation => {
            filtered.push({
              name: variation,
              baseMedicine: medicine.name,
              type: 'exact'
            });
          });
        } else {
          // Check if any variation matches
          const matchingVariations = medicine.variations.filter(v =>
            v.toLowerCase().includes(lowerValue)
          );
          matchingVariations.forEach(variation => {
            filtered.push({
              name: variation,
              baseMedicine: medicine.name,
              type: 'partial'
            });
          });
        }
      });

      // Sort: exact matches first, then partial
      const exactMatches = filtered.filter(s => s.type === 'exact');
      const partialMatches = filtered.filter(s => s.type === 'partial');
      const sorted = [...exactMatches, ...partialMatches].slice(0, 8); // Show max 8 suggestions

      setSuggestions(sorted);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleLocationClick = async () => {
    setLocationLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationDetected({ latitude, longitude });
        setLocationLoading(false);
        setLocationError('');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Unable to get location. Please enable location services.');
        setLocationLoading(false);
      }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const medicineToSearch = suggestion.name || suggestion;
    setSearchInput(medicineToSearch);
    onSearchChange(medicineToSearch);
    setShowSuggestions(false);
    onSearch(medicineToSearch);
  };

  return (
    <div className="hero-section">
      {/* Animated Background */}
      <div className="hero-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        {/* Main Headline - Emphasize Search */}
        <div className="hero-headline">
          <h1 className="hero-title">
            Find Medicines
            <span className="highlight"> Instantly</span>
          </h1>
          <p className="hero-subtitle-search">Search by name, dose, or form</p>
        </div>

        {/* Search Section - Main Action */}
        <div className="hero-search-section-main">
          <form onSubmit={handleSearchSubmit} className="hero-search-form-main">
            {/* BIG Search Input */}
            <div className="search-input-wrapper-big">
              <svg className="search-icon-big" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="🔍 Search medicine name, dose, or form..."
                value={searchInput}
                onChange={handleSearchInput}
                onFocus={() => searchInput && setShowSuggestions(true)}
                className="hero-search-input-big"
                disabled={loading}
                autoComplete="off"
              />

              {/* Suggestions Dropdown with variations */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                      title={suggestion.baseMedicine}
                    >
                      <svg className="suggestion-icon" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      <div className="suggestion-content">
                        <div className="suggestion-name">{suggestion.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons - Below Search */}
            <div className="hero-actions-main">
              <button
                type="submit"
                className="btn btn-search-main"
                disabled={loading || !searchInput.trim()}
              >
                {loading ? (
                  <>
                    <span className="loader"></span> Searching...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔍</span> Search
                  </>
                )}
              </button>

              <button
                type="button"
                className={`btn btn-location-secondary ${locationLoading ? 'loading' : ''}`}
                onClick={handleLocationClick}
                disabled={locationLoading}
                title="Use my current location"
              >
                {locationLoading ? (
                  <>
                    <span className="loader"></span> Getting Location...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📍</span> Use My Location
                  </>
                )}
              </button>
            </div>

            {/* Advanced Search Link */}
            <div className="advanced-options">
              <a href="#advanced" className="advanced-link">
                Advanced Search →
              </a>
            </div>

            {/* Error Message */}
            {locationError && (
              <div className="location-error">
                ⚠️ {locationError}
              </div>
            )}
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="hero-trust-section">
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            <span className="trust-text">Real-time Stock Updates</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            <span className="trust-text">Best Price Guarantee</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            <span className="trust-text">Express Delivery</span>
          </div>
        </div>
      </div>

      {/* Floating Cards - Desktop Only */}
      <div className="hero-floating-cards">
        <div className="float-card card-1">
          <div className="card-icon">💊</div>
          <div className="card-text">
            <strong>500+</strong>
            <span>Medicines</span>
          </div>
        </div>
        <div className="float-card card-2">
          <div className="card-icon">🏪</div>
          <div className="card-text">
            <strong>1000+</strong>
            <span>Pharmacies</span>
          </div>
        </div>
        <div className="float-card card-3">
          <div className="card-icon">⚡</div>
          <div className="card-text">
            <strong>Instant</strong>
            <span>Reservations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
