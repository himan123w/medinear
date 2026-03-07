import React from 'react';
import './LoadingShimmer.css';

export const MedicineCardSkeleton = () => (
  <div className="medicine-card medicine-skeleton">
    <div className="skeleton-header">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-badge"></div>
    </div>
    <div className="skeleton skeleton-bar"></div>
    <div className="skeleton skeleton-bar" style={{ width: '80%' }}></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-price"></div>
    <div className="skeleton skeleton-button"></div>
  </div>
);

export const MedicineGridSkeleton = ({ count = 6 }) => (
  <div className="medicines-grid">
    {Array.from({ length: count }).map((_, i) => (
      <MedicineCardSkeleton key={i} />
    ))}
  </div>
);

export default MedicineCardSkeleton;
