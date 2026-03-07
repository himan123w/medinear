# Pharmacy Rating System - Complete Guide

## Overview
The Pharmacy Rating System allows users to rate pharmacies on three key criteria:
- **Availability Accuracy** - How accurate was the medicine availability information?
- **Price** - How fair were the prices?
- **Behaviour** - How good was the staff's behaviour and service?

Each category is rated from 1-5 stars, and an overall rating is automatically calculated as the average.

---

## 📊 Features

### Backend Features
✅ Submit/update ratings  
✅ View summarized ratings for each pharmacy  
✅ View individual ratings with comments  
✅ Get rating distribution statistics  
✅ View top-rated pharmacies  
✅ User can only modify their own ratings  
✅ Prevent duplicate ratings (one rating per user per pharmacy)  

### Frontend Features
✅ Beautiful star rating UI  
✅ Add optional comments (up to 500 characters)  
✅ See previous ratings  
✅ View rating summary and statistics  
✅ See rating distribution charts  
✅ Browse recent user reviews  
✅ Fully responsive design  

---

## 🗂️ Project Structure

### Backend Models
**File:** `models/PharmacyRating.js`
```javascript
Fields:
- pharmacy: ObjectId (reference to Pharmacy)
- user: ObjectId (reference to User)
- userPhone: String (for non-authenticated users)
- availabilityAccuracy: 1-5
- price: 1-5
- behaviour: 1-5
- overallRating: Calculated average
- comment: Optional text feedback
- reviewDate: When the review was created
```

### Backend Controllers
**File:** `controllers/ratingController.js`

#### Endpoints:

1. **Submit/Update Rating**
   ```
   POST /api/rating/submit
   Body: {
     pharmacyId: "...",
     availabilityAccuracy: 4,
     price: 5,
     behaviour: 3,
     comment: "Good prices but stock was misreported",
     userPhone: "9876543210" (optional if authenticated)
   }
   ```

2. **Get Pharmacy Ratings**
   ```
   GET /api/rating/pharmacy/:pharmacyId?sort=-createdAt&limit=50&skip=0
   Response: {
     ratings: [...],
     statistics: {
       avgAvailabilityAccuracy: 4.2,
       avgPrice: 4.5,
       avgBehaviour: 3.8,
       avgOverallRating: 4.17,
       totalRatings: 12
     }
   }
   ```

3. **Get User's Rating**
   ```
   GET /api/rating/pharmacy/:pharmacyId/user-rating?userPhone=9876543210
   Response: { rating details }
   ```

4. **Get Pharmacy Rating Summary**
   ```
   GET /api/rating/pharmacy/:pharmacyId/summary
   Response: {
     avgAvailabilityAccuracy: 4.2,
     avgPrice: 4.5,
     avgBehaviour: 3.8,
     avgOverallRating: 4.17,
     totalRatings: 12
   }
   ```

5. **Get Rating Distribution**
   ```
   GET /api/rating/pharmacy/:pharmacyId/distribution
   Response: {
     availability: [{_id: 1, count: 2}, {_id: 5, count: 8}, ...],
     price: [...],
     behaviour: [...]
   }
   ```

6. **Get Top-Rated Pharmacies**
   ```
   GET /api/rating/top-rated?limit=10
   Response: [
     {
       avgRating: 4.5,
       avgAvailability: 4.6,
       avgPrice: 4.4,
       avgBehaviour: 4.5,
       totalRatings: 25,
       pharmacyDetails: {...}
     }
   ]
   ```

7. **Delete Rating**
   ```
   DELETE /api/rating/:ratingId
   Body: { userPhone: "9876543210" }
   ```

### Backend Routes
**File:** `routes/ratingRoutes.js`
- POST `/rating/submit` - Submit or update rating
- GET `/rating/pharmacy/:pharmacyId` - Get all ratings for pharmacy
- GET `/rating/pharmacy/:pharmacyId/user-rating` - Get user's rating
- GET `/rating/pharmacy/:pharmacyId/summary` - Get rating summary
- GET `/rating/pharmacy/:pharmacyId/distribution` - Get distribution stats
- GET `/rating/top-rated` - Get top-rated pharmacies
- DELETE `/rating/:ratingId` - Delete a rating

---

## 🎨 Frontend Components

### 1. PharmacyRatingForm Component
**File:** `src/components/PharmacyRatingForm.jsx`

**Props:**
```javascript
{
  pharmacyId: string (required),
  pharmacyName: string,
  onRatingSubmitted: function(ratingData),
  userPhone: string
}
```

**Usage:**
```jsx
import PharmacyRatingForm from '../components/PharmacyRatingForm';

<PharmacyRatingForm
  pharmacyId={pharmacyId}
  pharmacyName="Apollo Pharmacy"
  userPhone={userPhone}
  onRatingSubmitted={(rating) => {
    console.log('Rating submitted:', rating);
  }}
/>
```

**Features:**
- Toggle form visibility
- Star rating UI for 3 categories
- Optional comment textarea
- Shows existing rating if user already rated
- Update/delete functionality
- Beautiful error and success messages

### 2. RatingSummary Component
**File:** `src/components/RatingSummary.jsx`

**Props:**
```javascript
{
  pharmacyId: string (required),
  onLoadComplete: function(summaryData)
}
```

**Usage:**
```jsx
import RatingSummary from '../components/RatingSummary';

<RatingSummary
  pharmacyId={pharmacyId}
  onLoadComplete={(summary) => {
    console.log('Ratings loaded:', summary);
  }}
/>
```

**Features:**
- Overall rating card
- Category-wise rating bars
- Rating distribution charts
- Recent user reviews (expandable)
- Loading states
- Animations and transitions

---

## 📝 Frontend API Integration

**File:** `src/api.js`

```javascript
// Rating API exports
export const ratingAPI = {
  submitRating: (data) => api.post('/rating/submit', data),
  getPharmacyRatings: (pharmacyId, sort, limit, skip) => 
    api.get(`/rating/pharmacy/${pharmacyId}`, { params: { sort, limit, skip } }),
  getUserRating: (pharmacyId, userPhone) =>
    api.get(`/rating/pharmacy/${pharmacyId}/user-rating`, { params: { userPhone } }),
  getPharmacyRatingSummary: (pharmacyId) =>
    api.get(`/rating/pharmacy/${pharmacyId}/summary`),
  getRatingsDistribution: (pharmacyId) =>
    api.get(`/rating/pharmacy/${pharmacyId}/distribution`),
  getTopRatedPharmacies: (limit) =>
    api.get('/rating/top-rated', { params: { limit } }),
  deleteRating: (ratingId, userPhone) =>
    api.delete(`/rating/${ratingId}`, { data: { userPhone } })
};
```

---

## 🚀 Implementation Guide

### Step 1: Integrate into Pharmacy Detail/View Page

```jsx
import PharmacyRatingForm from '../components/PharmacyRatingForm';
import RatingSummary from '../components/RatingSummary';
import { useAuth } from '../AuthContext';

export default function PharmacyDetailPage({ pharmacyId }) {
  const { user } = useAuth();

  return (
    <div>
      {/* Pharmacy info here */}
      
      {/* Ratings Section */}
      <RatingSummary pharmacyId={pharmacyId} />
      <PharmacyRatingForm
        pharmacyId={pharmacyId}
        pharmacyName="Pharmacy Name"
        userPhone={user?.phone}
        onRatingSubmitted={() => {
          // Refresh ratings or handle callback
        }}
      />
    </div>
  );
}
```

### Step 2: Add to Dashboard or Home Page

Display top-rated pharmacies:
```jsx
import { ratingAPI } from '../api';

export default function TopPharmacies() {
  const [topPharmacies, setTopPharmacies] = useState([]);

  useEffect(() => {
    ratingAPI.getTopRatedPharmacies(10)
      .then(res => setTopPharmacies(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>🏆 Top-Rated Pharmacies</h2>
      {topPharmacies.map(pharmacy => (
        <div key={pharmacy._id}>
          <h3>{pharmacy.pharmacyDetails[0].name}</h3>
          <p>Rating: {pharmacy.avgRating?.toFixed(1)}/5 ⭐</p>
          <p>Based on {pharmacy.totalRatings} reviews</p>
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Update Pharmacy Routes (Optional)

If you want to add a dedicated ratings page, update your App.jsx:
```jsx
import PharmacyRatingsPage from './pages/PharmacyRatingsPage';

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

## 🎯 Testing the System

### Backend Testing with cURL

1. **Submit a rating:**
```bash
curl -X POST http://localhost:5001/api/rating/submit \
  -H "Content-Type: application/json" \
  -d '{
    "pharmacyId": "your_pharmacy_id",
    "availabilityAccuracy": 4,
    "price": 5,
    "behaviour": 3,
    "comment": "Good prices but stock was misreported",
    "userPhone": "9876543210"
  }'
```

2. **Get pharmacy ratings:**
```bash
curl http://localhost:5001/api/rating/pharmacy/your_pharmacy_id
```

3. **Get top-rated pharmacies:**
```bash
curl http://localhost:5001/api/rating/top-rated?limit=5
```

### Frontend Testing

1. Navigate to a pharmacy detail page
2. Click "⭐ Rate This Pharmacy" button
3. Select ratings for all three categories
4. Add a comment (optional)
5. Click "Submit Rating"
6. Your rating will appear immediately
7. View the rating summary and all reviews

---

## 📱 Responsive Design

All components are fully responsive:
- Desktop: Full layout with multiple columns
- Tablet: Adjusted grid layouts
- Mobile: Single column, optimized touch targets
- CSS breakpoints: 480px, 600px, 768px

---

## 🔒 Security Features

✅ User can only modify/delete their own ratings  
✅ One rating per user per pharmacy (prevents spam)  
✅ Optional authentication integration  
✅ Input validation (ratings must be 1-5)  
✅ Comment length limits  

---

## 📊 Data Analytics

The system provides valuable analytics:
- Average ratings by category
- Distribution of ratings (how many 1-star, 2-star, etc.)
- Top-performing pharmacies
- Recent feedback trends
- User satisfaction metrics

---

## 🎨 Customization

### Change Colors
Update the gradient colors in CSS files:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Category colors */
.bar-fill.availability { background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); }
.bar-fill.price { background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%); }
.bar-fill.behaviour { background: linear-gradient(90deg, #fa709a 0%, #fee140 100%); }
```

### Change Star Icon
Replace `★` with any emoji or icon in the components.

### Adjust Rating Scale
Currently uses 1-5 scale. To change, update:
- Model validation (min: 1, max: 5)
- Form component (star count)
- All validation checks

---

## 🐛 Troubleshooting

**Issue:** Ratings not saving
- Check backend server is running on port 5001
- Verify MongoDB connection
- Check browser console for errors

**Issue:** User rating not loading
- Ensure `userPhone` is being passed correctly
- Check if rating exists (may be first time)
- Verify pharmacy ID is correct

**Issue:** Styling issues
- Ensure CSS files are imported in components
- Check for CSS conflicts with existing styles
- Verify Tailwind/PostCSS configuration

---

## 📞 Support

For issues or questions:
1. Check browser console (F12) for JavaScript errors
2. Check server logs in terminal
3. Verify all files are created correctly
4. Ensure backend server is running

---

## 🎉 You're All Set!

The Pharmacy Rating System is now fully integrated. Users can:
- ⭐ Submit ratings
- 📝 Add comments
- 📊 View statistics
- ✏️ Update their ratings
- 🏆 See top-rated pharmacies

Happy rating! 🎊
