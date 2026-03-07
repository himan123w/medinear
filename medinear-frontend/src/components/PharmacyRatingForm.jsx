import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../api';
import './PharmacyRatingForm.css';

export default function PharmacyRatingForm({ pharmacyId, pharmacyName, onRatingSubmitted, userPhone }) {
  const [availability, setAvailability] = useState(0);
  const [price, setPrice] = useState(0);
  const [behaviour, setBehaviour] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Load user's existing rating if any
    if (userPhone) {
      loadUserRating();
    }
  }, [pharmacyId, userPhone]);

  const loadUserRating = async () => {
    try {
      const response = await ratingAPI.getUserRating(pharmacyId, userPhone);
      setUserRating(response.data);
      setAvailability(response.data.availabilityAccuracy);
      setPrice(response.data.price);
      setBehaviour(response.data.behaviour);
      setComment(response.data.comment || '');
    } catch (err) {
      // No existing rating, which is fine
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate all ratings are selected
    if (availability === 0 || price === 0 || behaviour === 0) {
      setError('Please rate all three categories');
      setLoading(false);
      return;
    }

    try {
      const ratingData = {
        pharmacyId,
        availabilityAccuracy: parseInt(availability),
        price: parseInt(price),
        behaviour: parseInt(behaviour),
        comment: comment.trim(),
        userPhone: userPhone || 'Anonymous'
      };

      const response = await ratingAPI.submitRating(ratingData);

      setSuccess(userRating ? 'Rating updated successfully!' : 'Thank you for your rating!');
      setUserRating(response.data.rating);
      
      // Call callback if provided
      if (onRatingSubmitted) {
        onRatingSubmitted(response.data.rating);
      }

      // Reset form
      setTimeout(() => {
        setComment('');
        setShowForm(false);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, label, description }) => {
    return (
      <div className="star-rating-wrapper">
        <label className="rating-label">
          {label}
          <span className="rating-description">{description}</span>
        </label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${value >= star ? 'filled' : ''}`}
              onClick={() => onChange(star)}
              title={`${star} star${star !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
          <span className="rating-value">{value > 0 ? `${value}/5` : 'Not rated'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="pharmacy-rating-form">
      <button
        className="toggle-form-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {userRating ? '✏️ Update Your Rating' : '⭐ Rate This Pharmacy'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="rating-form">
          <h3>Rate {pharmacyName || 'this pharmacy'}</h3>
          <p className="form-subtitle">Your feedback helps other customers make better decisions</p>

          <StarRating
            value={availability}
            onChange={setAvailability}
            label="Availability Accuracy"
            description="How accurate was the medicine availability information?"
          />

          <StarRating
            value={price}
            onChange={setPrice}
            label="Price"
            description="How fair were the prices?"
          />

          <StarRating
            value={behaviour}
            onChange={setBehaviour}
            label="Staff Behaviour"
            description="How good was the staff's behaviour and service?"
          />

          <div className="form-group">
            <label htmlFor="comment">Additional Comments (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience... (max 500 characters)"
              maxLength="500"
              rows="4"
              className="comment-textarea"
            />
            <span className="char-count">{comment.length}/500</span>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>

          {userRating && (
            <p className="last-rated-info">
              Last updated: {new Date(userRating.updatedAt).toLocaleDateString()}
            </p>
          )}
        </form>
      )}

      {userRating && !showForm && (
        <div className="user-rating-badge">
          <p className="badge-title">Your Rating</p>
          <div className="badge-rating">
            <span className="overall">{userRating.overallRating?.toFixed(1) || '0'}</span>
            <span className="star">⭐</span>
          </div>
        </div>
      )}
    </div>
  );
}
