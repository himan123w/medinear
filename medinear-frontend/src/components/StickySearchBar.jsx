import { useState, useEffect } from 'react';
import './StickySearchBar.css';

export default function StickySearchBar({
  searchQuery,
  onSearchChange,
  onSearch,
  userLocation = null,
  loading = false,
  onLocationClick = null,
}) {
  const [isSticky, setIsSticky] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Common medicines for quick suggestions
  const commonMedicines = [
    'Aspirin',
    'Paracetamol',
    'Ibuprofen',
    'Cough Syrup',
    'Vitamin D',
    'Amoxicillin',
    'Omeprazole',
    'Metformin',
    'Atorvastatin',
    'Lisinopril',
  ];

  const filteredSuggestions = searchQuery.trim()
    ? commonMedicines.filter(med =>
        med.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commonMedicines.slice(0, 5);

  // Handle scroll to show/hide sticky bar
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling 200px down
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    onSearchChange(e.target.value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (medicine) => {
    onSearchChange(medicine);
    setShowDropdown(false);
    // Trigger search after a small delay
    setTimeout(() => {
      onSearch(medicine);
    }, 100);
  };

  // Get user location or default
  const getLocationDisplay = () => {
    if (userLocation?.latitude && userLocation?.longitude) {
      // In real app, you'd reverse geocode to get city name
      // For now, show coordinates or default city
      return '📍 Your Location';
    }
    return '📍 Prayagraj';
  };

  if (!isSticky) {
    return null; // Don't render until user scrolls down
  }

  return (
    <div className="sticky-search-wrapper">
      <div className="sticky-search-container">
        {/* Left Section - Location */}
        <div className="sticky-location-section">
          <button
            className="sticky-location-btn"
            onClick={onLocationClick}
            title="Change location"
          >
            {getLocationDisplay()}
          </button>
        </div>

        {/* Right Section - Search Bar */}
        <div className="sticky-search-section">
          <form className="sticky-search-form" onSubmit={handleSearchSubmit}>
            {/* Search Input */}
            <div className="sticky-search-input-wrapper">
              <span className="sticky-search-icon">🔍</span>
              <input
                type="text"
                className="sticky-search-input"
                placeholder="Search medicine..."
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={() => {
                  // Small delay to allow suggestion clicks
                  setTimeout(() => setShowDropdown(false), 200);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="sticky-clear-btn"
                  onClick={() => {
                    onSearchChange('');
                    setShowDropdown(false);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && filteredSuggestions.length > 0 && (
              <div className="sticky-suggestions-dropdown">
                {filteredSuggestions.map((medicine, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="sticky-suggestion-item"
                    onClick={() => handleSuggestionClick(medicine)}
                  >
                    💊 {medicine}
                  </button>
                ))}
              </div>
            )}

            {/* Search Button */}
            <button
              type="submit"
              className="sticky-search-btn"
              disabled={!searchQuery.trim() || loading}
            >
              {loading ? (
                <span className="sticky-spinner">⏳</span>
              ) : (
                <span>Search</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
