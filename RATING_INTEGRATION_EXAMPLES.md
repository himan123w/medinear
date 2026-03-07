# Pharmacy Rating System - Integration Examples

## 📌 Quick Integration Guide

Here are ready-to-use examples for integrating the rating system into different pages.

---

## 1️⃣ Add Ratings to Pharmacy List

**File:** `src/pages/Dashboard.jsx` or `src/pages/Home.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { pharmacyAPI, ratingAPI } from '../api';
import RatingSummary from '../components/RatingSummary';
import PharmacyRatingForm from '../components/PharmacyRatingForm';
import { useAuth } from '../AuthContext';

export default function PharmacyList() {
  const { user } = useAuth();
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacyRatings, setPharmacyRatings] = useState({});

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      const res = await pharmacyAPI.getPharmacies();
      setPharmacies(res.data);
      
      // Load ratings for all pharmacies
      res.data.forEach(pharmacy => {
        loadPharmacyRatings(pharmacy._id);
      });
    } catch (err) {
      console.error('Failed to load pharmacies:', err);
    }
  };

  const loadPharmacyRatings = async (pharmacyId) => {
    try {
      const res = await ratingAPI.getPharmacyRatingSummary(pharmacyId);
      setPharmacyRatings(prev => ({
        ...prev,
        [pharmacyId]: res.data
      }));
    } catch (err) {
      console.error('Failed to load ratings:', err);
    }
  };

  return (
    <div className="pharmacy-list">
      <h2>🏥 Pharmacies Near You</h2>
      
      <div className="pharmacy-grid">
        {pharmacies.map(pharmacy => {
          const rating = pharmacyRatings[pharmacy._id];
          
          return (
            <div key={pharmacy._id} className="pharmacy-card">
              <h3>{pharmacy.name}</h3>
              <p>📍 {pharmacy.address || pharmacy.area}</p>
              <p>📞 {pharmacy.phone}</p>
              
              {/* Rating Badge */}
              {rating && (
                <div className="rating-badge">
                  <span className="rating-score">
                    {rating.avgOverallRating?.toFixed(1) || 'N/A'} ⭐
                  </span>
                  <span className="rating-count">
                    ({rating.totalRatings} reviews)
                  </span>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="action-buttons">
                <button onClick={() => setSelectedPharmacy(pharmacy._id)}>
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal/Expanded View */}
      {selectedPharmacy && (
        <div className="pharmacy-detail-modal">
          <div className="modal-content">
            <button 
              className="close-btn"
              onClick={() => setSelectedPharmacy(null)}
            >
              ✕
            </button>
            
            <RatingSummary pharmacyId={selectedPharmacy} />
            
            <PharmacyRatingForm
              pharmacyId={selectedPharmacy}
              pharmacyName={
                pharmacies.find(p => p._id === selectedPharmacy)?.name
              }
              userPhone={user?.phone}
              onRatingSubmitted={() => {
                loadPharmacyRatings(selectedPharmacy);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 2️⃣ Top-Rated Pharmacies Widget

**File:** Can be added to `src/pages/Home.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../api';

export default function TopRatedPharmacies() {
  const [topPharmacies, setTopPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopPharmacies();
  }, []);

  const loadTopPharmacies = async () => {
    try {
      setLoading(true);
      const res = await ratingAPI.getTopRatedPharmacies(10);
      setTopPharmacies(res.data);
    } catch (err) {
      console.error('Failed to load top pharmacies:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (topPharmacies.length === 0) return null;

  return (
    <section className="top-rated-pharmacies">
      <h2>🏆 Top-Rated Pharmacies</h2>
      <div className="pharmacy-carousel">
        {topPharmacies.map((item, index) => (
          <div key={item._id} className="top-pharmacy-card">
            <div className="rank-badge">#{index + 1}</div>
            
            <h3>{item.pharmacyDetails[0]?.name}</h3>
            
            <div className="rating-stats">
              <div className="overall-stat">
                <span className="label">Overall</span>
                <span className="value">
                  {item.avgRating?.toFixed(1)} ⭐
                </span>
              </div>
              
              <div className="mini-stats">
                <div>
                  <small>Availability</small>
                  <span>{item.avgAvailability?.toFixed(1)}</span>
                </div>
                <div>
                  <small>Price</small>
                  <span>{item.avgPrice?.toFixed(1)}</span>
                </div>
                <div>
                  <small>Service</small>
                  <span>{item.avgBehaviour?.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <p className="review-count">
              {item.totalRatings} reviews
            </p>
            
            <a href={`/pharmacy/${item._id}`} className="view-btn">
              View Details →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## 3️⃣ Rating Section in Pharmacy Detail Page

**File:** `src/pages/PharmacyDetail.jsx` (Update existing)

```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pharmacyAPI } from '../api';
import { useAuth } from '../AuthContext';
import RatingSummary from '../components/RatingSummary';
import PharmacyRatingForm from '../components/PharmacyRatingForm';
import './PharmacyDetail.css';

export default function PharmacyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPharmacy();
  }, [id]);

  const loadPharmacy = async () => {
    try {
      const res = await pharmacyAPI.getPharmacies();
      const selected = res.data.find(p => p._id === id);
      setPharmacy(selected);
    } catch (err) {
      console.error('Failed to load pharmacy:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!pharmacy) return <div>Pharmacy not found</div>;

  return (
    <div className="pharmacy-detail">
      {/* Pharmacy Info Section */}
      <header className="pharmacy-header">
        <h1>{pharmacy.name}</h1>
        <div className="info">
          <p>📍 {pharmacy.address}</p>
          <p>📞 {pharmacy.phone}</p>
          {pharmacy.open24x7 && <badge>24/7 Open</badge>}
          <p>🚚 {pharmacy.deliveryTime} min delivery</p>
        </div>
      </header>

      {/* Ratings & Reviews Section */}
      <section className="ratings-section">
        <h2>Customer Reviews & Ratings</h2>
        
        {/* Rating Summary */}
        <RatingSummary 
          pharmacyId={id}
          onLoadComplete={(summary) => {
            console.log('Ratings loaded:', summary);
          }}
        />

        {/* Divider */}
        <hr className="section-divider" />

        {/* Rating Form */}
        <PharmacyRatingForm
          pharmacyId={id}
          pharmacyName={pharmacy.name}
          userPhone={user?.phone}
          onRatingSubmitted={() => {
            console.log('Rating submitted, refreshing...');
            // You can trigger refresh here if needed
          }}
        />
      </section>

      {/* Other sections like medicines, etc. */}
    </div>
  );
}
```

---

## 4️⃣ Standalone Rating Page

**File:** Route in `src/App.jsx`

```jsx
// Add this import
import PharmacyRatingsPage from './pages/PharmacyRatingsPage';

// Add this route
<Route
  path="/pharmacy/:id/ratings"
  element={
    <ProtectedRoute>
      <PharmacyRatingsPage />
    </ProtectedRoute>
  }
/>
```

---

## 5️⃣ User's Ratings Dashboard

**File:** `src/pages/MyRatings.jsx` (New file)

```jsx
import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function MyRatings() {
  const { user } = useAuth();
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyRatings();
  }, []);

  const loadMyRatings = async () => {
    try {
      // Note: You need to implement this endpoint in the backend
      // GET /api/rating/user/:userPhone would return all ratings by this user
      // For now, you'll need to fetch from pharmacy ratings and filter
      
      // Placeholder - you can call individual pharmacy ratings
      // or implement a dedicated "get user's all ratings" endpoint
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load ratings:', err);
    }
  };

  return (
    <div className="my-ratings-page">
      <h2>My Ratings & Reviews</h2>
      
      {myRatings.length === 0 ? (
        <p>You haven't rated any pharmacies yet.</p>
      ) : (
        <div className="ratings-list">
          {myRatings.map(rating => (
            <div key={rating._id} className="rating-item">
              <h3>Pharmacy Name</h3>
              <div className="rating-details">
                <span>Overall: {rating.overallRating}/5 ⭐</span>
                <span>Availability: {rating.availabilityAccuracy}/5</span>
                <span>Price: {rating.price}/5</span>
                <span>Service: {rating.behaviour}/5</span>
              </div>
              {rating.comment && <p>{rating.comment}</p>}
              <small>{new Date(rating.reviewDate).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📦 CSS Additions Needed

Add to your main CSS or create `src/styles/pharmacy-list.css`:

```css
/* Pharmacy Card */
.pharmacy-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.pharmacy-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Rating Badge */
.rating-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea20, #764ba220);
  padding: 0.75rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.rating-score {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.rating-count {
  font-size: 12px;
  color: #999;
}

/* Top Pharmacy Card */
.top-pharmacy-card {
  position: relative;
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 250px;
}

.rank-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.mini-stats > div {
  text-align: center;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 6px;
}

.mini-stats small {
  display: block;
  font-size: 11px;
  color: #999;
}

.mini-stats span {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}
```

---

## 🎯 Key Integration Points

1. **Always pass `pharmacyId`** - Required for all rating components
2. **Pass `userPhone`** - Helps identify user without authentication
3. **Use callbacks** - `onRatingSubmitted`, `onLoadComplete` to refresh data
4. **Handle loading states** - Show skeleton/loading while fetching
5. **Add error boundaries** - Wrap components in try-catch

---

## ✨ That's It!

Pick any of the examples above and integrate into your pages. All the heavy lifting is done! 🎉
