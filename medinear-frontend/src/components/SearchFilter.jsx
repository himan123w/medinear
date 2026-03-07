import { useState, useCallback } from 'react';
import './SearchFilter.css';

export default function SearchFilter({
  onSearch,
  onFilter,
  placeholder = 'Search...',
  filters = [],
  loading = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...activeFilters,
      [filterName]: value === 'all' ? null : value
    };
    setActiveFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    onSearch?.('');
    onFilter?.({});
  };

  return (
    <div className="search-filter-container">
      {/* Search Input */}
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={loading}
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => handleSearch('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="filters-section">
          <div className="filters-wrapper">
            {filters.map((filter) => (
              <div key={filter.name} className="filter-group">
                <select
                  className="filter-select"
                  value={activeFilters[filter.name] || 'all'}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  disabled={loading}
                >
                  <option value="all">{filter.label}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Active Filters Display */}
          {Object.keys(activeFilters).some((key) => activeFilters[key] !== null) && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              🔄 Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for managing search and filter state
 */
export function useSearchFilter(items, searchFields = ['name']) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  const filteredItems = items?.filter((item) => {
    // Search filter
    const matchesSearch = !searchQuery || searchFields.some((field) =>
      String(item[field]).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Active filters
    const matchesFilters = Object.keys(filters).every((filterName) => {
      const filterValue = filters[filterName];
      if (!filterValue) return true;
      return item[filterName] === filterValue || String(item[filterName]).toLowerCase() === String(filterValue).toLowerCase();
    });

    return matchesSearch && matchesFilters;
  }) || [];

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredItems,
    hasActiveFilters: Object.keys(filters).some((key) => filters[key] !== null),
  };
}
