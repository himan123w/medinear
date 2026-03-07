import React from 'react';
import './SkeletonLoader.css';

/**
 * SkeletonLoader - Fast-feeling placeholder while content loads
 * Used by Amazon, Zomato, Practo for perceived performance
 * Feels faster than spinners because user sees content shape
 */

export function MedicineCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-badge"></div>
      </div>
      <div className="skeleton-name"></div>
      <div className="skeleton-strength"></div>
      <div className="skeleton-price-row">
        <div className="skeleton-price"></div>
        <div className="skeleton-distance"></div>
      </div>
      <div className="skeleton-button"></div>
    </div>
  );
}

export function PharmacyCardSkeleton() {
  return (
    <div className="skeleton-pharmacy-card">
      <div className="skeleton-header-large"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-button-large"></div>
    </div>
  );
}

export function SearchResultsSkeleton({ count = 4 }) {
  return (
    <div className="skeleton-results">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-search-result">
          <div className="skeleton-icon"></div>
          <div className="skeleton-result-text"></div>
        </div>
      ))}
    </div>
  );
}

export function MedicineGridSkeleton({ columns = 2, count = 6 }) {
  return (
    <div className="skeleton-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <MedicineCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PharmacyListSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <PharmacyCardSkeleton key={i} />
      ))}
    </div>
  );
}
