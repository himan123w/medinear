import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../api';
import './RatingSummary.css';

export default function RatingSummary({ pharmacyId, onLoadComplete }) {
  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allRatings, setAllRatings] = useState([]);
  const [showAllRatings, setShowAllRatings] = useState(false);

  useEffect(() => {
    loadRatingData();
  }, [pharmacyId]);

  const loadRatingData = async () => {
    try {
      setLoading(true);
      const [summaryRes, distributionRes, ratingsRes] = await Promise.all([
        ratingAPI.getPharmacyRatingSummary(pharmacyId),
        ratingAPI.getRatingsDistribution(pharmacyId),
        ratingAPI.getPharmacyRatings(pharmacyId, '-createdAt', 25, 0)
      ]);

      setSummary(summaryRes.data);
      setDistribution(distributionRes.data);
      setAllRatings(ratingsRes.data.ratings || []);

      if (onLoadComplete) {
        onLoadComplete(summaryRes.data);
      }
    } catch (err) {
      setError('Failed to load ratings');
      console.error('Rating load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBar = (value, max = 5) => {
    return (value / max) * 100;
  };

  const StarDisplay = ({ rating }) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${rating >= star ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading-skeleton">Loading ratings...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!summary || summary.totalRatings === 0) {
    return (
      <div className="no-ratings">
        <p>📊 No ratings yet. Be the first to rate this pharmacy!</p>
      </div>
    );
  }

  return (
    <div className="rating-summary">
      {/* Overall Rating Card */}
      <div className="overall-rating-card">
        <div className="rating-score">
          <span className="score">{summary.avgOverallRating?.toFixed(1) || '0'}</span>
          <span className="max-score">/5</span>
          <StarDisplay rating={summary.avgOverallRating || 0} />
        </div>
        <div className="rating-meta">
          <p className="total-reviews">
            Based on {summary.totalRatings} review{summary.totalRatings !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="category-ratings">
        <div className="rating-category">
          <div className="category-header">
            <h4>Availability Accuracy</h4>
            <span className="category-score">{summary.avgAvailabilityAccuracy?.toFixed(1) || '0'}</span>
          </div>
          <div className="rating-bar">
            <div
              className="bar-fill availability"
              style={{ width: `${getRatingBar(summary.avgAvailabilityAccuracy)}%` }}
            />
          </div>
          <p className="bar-label">How accurate is the medicine availability information</p>
        </div>

        <div className="rating-category">
          <div className="category-header">
            <h4>Price</h4>
            <span className="category-score">{summary.avgPrice?.toFixed(1) || '0'}</span>
          </div>
          <div className="rating-bar">
            <div
              className="bar-fill price"
              style={{ width: `${getRatingBar(summary.avgPrice)}%` }}
            />
          </div>
          <p className="bar-label">How fair are the prices</p>
        </div>

        <div className="rating-category">
          <div className="category-header">
            <h4>Staff Behaviour</h4>
            <span className="category-score">{summary.avgBehaviour?.toFixed(1) || '0'}</span>
          </div>
          <div className="rating-bar">
            <div
              className="bar-fill behaviour"
              style={{ width: `${getRatingBar(summary.avgBehaviour)}%` }}
            />
          </div>
          <p className="bar-label">How good is the staff's behaviour and service</p>
        </div>
      </div>

      {/* Distribution Chart */}
      {distribution && (
        <div className="distribution-section">
          <h4>Rating Distribution</h4>
          <div className="distribution-grid">
            <div className="distribution-item">
              <span className="distribution-label">Availability</span>
              <div className="distribution-bars">
                {distribution.availability?.map((item) => (
                  <div key={item._id} className="dist-bar-wrapper">
                    <div className="dist-bar availability">
                      <span className="bar-count">{item.count}</span>
                    </div>
                    <span className="dist-label">{item._id}★</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="distribution-item">
              <span className="distribution-label">Price</span>
              <div className="distribution-bars">
                {distribution.price?.map((item) => (
                  <div key={item._id} className="dist-bar-wrapper">
                    <div className="dist-bar price">
                      <span className="bar-count">{item.count}</span>
                    </div>
                    <span className="dist-label">{item._id}★</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="distribution-item">
              <span className="distribution-label">Behaviour</span>
              <div className="distribution-bars">
                {distribution.behaviour?.map((item) => (
                  <div key={item._id} className="dist-bar-wrapper">
                    <div className="dist-bar behaviour">
                      <span className="bar-count">{item.count}</span>
                    </div>
                    <span className="dist-label">{item._id}★</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Ratings */}
      {allRatings.length > 0 && (
        <div className="recent-ratings-section">
          <div className="section-header">
            <h4>Recent Ratings</h4>
            {allRatings.length > 3 && (
              <button
                className="view-all-btn"
                onClick={() => setShowAllRatings(!showAllRatings)}
              >
                {showAllRatings ? 'Show Less' : `View All (${allRatings.length})`}
              </button>
            )}
          </div>

          <div className={`ratings-list ${showAllRatings ? 'expanded' : 'collapsed'}`}>
            {allRatings.slice(0, showAllRatings ? undefined : 3).map((rating) => (
              <div key={rating._id} className="rating-item">
                <div className="rating-item-header">
                  <div className="user-info">
                    <span className="user-name">{rating.userName || 'Anonymous'}</span>
                    <span className="rating-date">
                      {new Date(rating.reviewDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="item-overall-score">
                    {rating.overallRating?.toFixed(1) || '0'} ⭐
                  </div>
                </div>

                <div className="rating-item-scores">
                  <div className="score-badge">
                    <span className="badge-label">Availability</span>
                    <span className="badge-value">{rating.availabilityAccuracy}/5</span>
                  </div>
                  <div className="score-badge">
                    <span className="badge-label">Price</span>
                    <span className="badge-value">{rating.price}/5</span>
                  </div>
                  <div className="score-badge">
                    <span className="badge-label">Behaviour</span>
                    <span className="badge-value">{rating.behaviour}/5</span>
                  </div>
                </div>

                {rating.comment && (
                  <p className="rating-comment">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
