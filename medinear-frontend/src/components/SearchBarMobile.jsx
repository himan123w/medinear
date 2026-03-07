import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBarMobile.css';

export default function SearchBarMobile({
  placeholder = '🔍 Search medicines...',
  onSearch,
  onLocationClick,
  showOnlyOnMobile = true
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    'Levothyroxine',
    'Sertraline',
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const filtered = commonMedicines.filter(med =>
        med.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setShowSuggestions(false);
      onSearch?.(query);
    }
  };

  const handleSuggestionClick = (medicine) => {
    setSearchQuery(medicine);
    setShowSuggestions(false);
    handleSearch(medicine);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow suggestion click to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`search-bar-mobile ${showOnlyOnMobile ? 'mobile-only' : ''}`}>
      <div className="search-bar-mobile-container">
        {/* Location Button */}
        <button
          className="search-bar-mobile-location"
          onClick={onLocationClick}
          title="Change location"
        >
          <span className="location-icon">📍</span>
        </button>

        {/* Main Search Input */}
        <div className="search-bar-mobile-input-wrapper">
          <span className="search-bar-mobile-icon">🔍</span>
          <input
            type="text"
            className="search-bar-mobile-input"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              className="search-bar-mobile-clear"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          className="search-bar-mobile-btn"
          onClick={() => handleSearch()}
          title="Search"
        >
          Search
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-bar-mobile-suggestions">
          {suggestions.map((medicine, index) => (
            <div
              key={index}
              className="search-bar-mobile-suggestion-item"
              onClick={() => handleSuggestionClick(medicine)}
            >
              <span className="suggestion-icon">💊</span>
              <span className="suggestion-text">{medicine}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
