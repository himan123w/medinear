# Distance-Based Filtering with MongoDB 2dsphere 🗺️

## Overview
Comprehensive geospatial distance filtering system using MongoDB 2dsphere indexes for efficient location-based queries. Shows only pharmacies and medicines within dynamically configurable search radii (1-50 km).

---

## 🎯 Key Features

### 1. **MongoDB 2dsphere Geospatial Indexing**
- ✅ GeoJSON Point format for location data
- ✅ 2dsphere index on Pharmacy location field
- ✅ Efficient $near operator for distance queries
- ✅ Automatic distance calculation in meters

### 2. **Dynamic Radius Control**
- **Range Slider**: 1-50 km with continuous adjustment
- **Quick Select Buttons**: Preset options (1, 2, 5, 10, 20, 50 km)
- **Real-time Display**: Shows current radius value as you adjust
- **Instant Updates**: Search refreshes automatically

### 3. **Two Search Modes**
1. **Pharmacies Within Radius**: Find all nearby pharmacies
2. **Medicines Within Radius**: Find specific medicines from nearby pharmacies

### 4. **Smart Sorting**
- 📍 **Nearest First**: Sort by distance
- 💰 **Cheapest First**: Sort by price
- 🚚 **Fastest Delivery**: Sort by delivery time

---

## 🛠️ Technical Implementation

### Backend Architecture

#### Models
**Pharmacy.js** - Location Storage
```javascript
location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],  // [longitude, latitude]
    default: [0, 0]
  }
}
// Index created: pharmacySchema.index({ location: '2dsphere' })
```

#### Controller Methods

**1. getPharmaciesWithinRadius()** - Public
```javascript
POST /medicine/geo/pharmacies-within-radius?latitude=28.6139&longitude=77.2090&radius=5
Returns: Array of pharmacies within radius with distances
```

**2. getMedicinesWithinRadius()** - Public  
```javascript
POST /medicine/geo/medicines-within-radius?latitude=28.6139&longitude=77.2090&radius=5&medicineName=Aspirin&sortBy=nearest
Returns: Array of medicines from nearby pharmacies with distances
```

#### Geospatial Query Implementation
```javascript
// MongoDB 2dsphere $near operator
Pharmacy.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [lng, lat]  // GeoJSON format
      },
      $maxDistance: radiusMeters  // Convert km to meters
    }
  }
})
```

**Benefits:**
- ✅ Database-level filtering (faster than application filtering)
- ✅ Automatic distance calculation
- ✅ Scales efficiently with large datasets
- ✅ Supports complex geographic queries

### Frontend Architecture

#### State Management
```javascript
// Near Me states
const [searchRadius, setSearchRadius] = useState('5');        // Current radius in km
const [userLocation, setUserLocation] = useState({            // GPS coordinates
  latitude: null,
  longitude: null
});
const [nearbyMedicines, setNearbyMedicines] = useState([]);  // Search results
```

#### UI Components

**1. Radius Slider**
```jsx
<input 
  type="range"
  min="1"
  max="50"
  value={searchRadius}
  onChange={(e) => setSearchRadius(e.target.value)}
  className="radius-slider"
/>
<span className="radius-value">{searchRadius} km</span>
```

**2. Quick Select Buttons**
```jsx
{[1, 2, 5, 10, 20, 50].map(radius => (
  <button
    type="button"
    className={`radius-btn ${searchRadius == radius ? 'active' : ''}`}
    onClick={() => setSearchRadius(String(radius))}
  >
    {radius}km
  </button>
))}
```

#### API Integration
```javascript
// User searches with custom radius
const handleNearbySearch = async (e) => {
  const response = await medicineAPI.getMedicinesWithinRadius(
    userLocation.latitude,
    userLocation.longitude,
    searchRadius,              // Dynamic radius from slider
    nearbySearchQuery,
    sortByNear
  );
  setNearbyMedicines(response.data.medicines);
};
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  User Adjusts Radius Slider (1-50 km)              │
│  ➜ Real-time display updated                        │
│  ➜ Or clicks Quick Select button                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  User Location (GPS) + Search Query                 │
│  - Latitude/Longitude from device                   │
│  - Optional medicine name                           │
│  - Sorting preference (nearest/cheapest/fastest)    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  API: getMedicinesWithinRadius()                    │
│  /medicine/geo/medicines-within-radius              │
│  Params: lat, lng, radius, name, sortBy             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  MongoDB 2dsphere Query                             │
│  1. Find pharmacies within radius using $near       │
│  2. Convert km to meters (radiusKm * 1000)         │
│  3. Get pharmacy IDs                                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Query Medicines from Nearby Pharmacies             │
│  - Filter: { available: true, pharmacy: in IDs }   │
│  - Populate pharmacy location data                  │
│  - Optional name filter (regex case-insensitive)   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Calculate Actual Distances (Haversine)             │
│  - For each medicine's pharmacy location            │
│  - User location to pharmacy location               │
│  - Result in kilometers (2 decimal places)          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Sort Results                                       │
│  ➜ Nearest: sort by distance ascending              │
│  ➜ Cheapest: sort by price ascending                │
│  ➜ Fastest: sort by delivery time ascending         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Return Results                                     │
│  {                                                  │
│    count: number,                                   │
│    searchRadius: number,                            │
│    medicines: [{                                    │
│      ...medicineData,                               │
│      distance: km,                                  │
│      deliveryTime: minutes                          │
│    }]                                               │
│  }                                                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Frontend Display                                   │
│  - Medicine cards with distance badges              │
│  - Delivery time information                        │
│  - Pricing and ratings                              │
│  - Stock status indicators                          │
└─────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### 1. Get Pharmacies Within Radius
```
GET /api/medicine/geo/pharmacies-within-radius
Query Parameters:
  - latitude (required): User latitude
  - longitude (required): User longitude  
  - radius (optional): Search radius in km (default: 5)

Response:
{
  count: 3,
  searchRadius: 5,
  pharmacies: [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "Apollo Pharmacy",
      distance: 2.45,
      phone: "9876543210",
      area: "Delhi",
      latitude: 28.6139,
      longitude: 77.2090,
      deliveryTime: 30,
      address: "123 Main St"
    }
  ]
}
```

### 2. Get Medicines Within Radius
```
GET /api/medicine/geo/medicines-within-radius
Query Parameters:
  - latitude (required): User latitude
  - longitude (required): User longitude
  - radius (optional): Search radius in km (default: 5)
  - medicineName (optional): Filter by medicine name
  - sortBy (optional): Sort option (nearest/cheapest/fastest, default: nearest)

Response:
{
  count: 5,
  searchRadius: 10,
  medicines: [
    {
      _id: "507f1f77bcf86cd799439012",
      name: "Aspirin",
      price: 25,
      stock: 50,
      distance: 1.23,
      deliveryTime: 30,
      pharmacy: {...},
      rating: 4.5,
      views: 156
    }
  ]
}
```

---

## 🎨 UI Components

### Radius Slider
- **Range**: 1-50 km
- **Thumb**: White circle with blue border
- **Color**: Purple gradient background
- **Hover Effect**: Thumb enlarges on hover
- **Real-time Value**: Displayed above slider

### Quick Select Buttons
- **Options**: 1, 2, 5, 10, 20, 50 km
- **Active State**: White background with blue text
- **Hover State**: Lifted up (transform: translateY(-2px))
- **Layout**: Flex wrap for responsiveness

### Search Results
- **Distance Badge**: Shows "📍 2.45 km"
- **Delivery Badge**: Shows "🚚 30 mins"
- **Status Badges**: Stock availability indicators
- **Rating Display**: Star ratings with view count

---

## 🔧 Configuration

### Default Radius
```javascript
const [searchRadius, setSearchRadius] = useState('5'); // 5 km default
```

### Radius Range
- **Minimum**: 1 km (neighborhood level)
- **Maximum**: 50 km (city-wide level)
- **Step**: 1 km (continuous slider)

### Preset Radii
- 1 km: Ultra-local (< 1 km walk)
- 2 km: Local neighborhood
- 5 km: District level (default)
- 10 km: City sector
- 20 km: Multi-sector city
- 50 km: Metropolitan area

---

## 🚀 Usage Examples

### Frontend JavaScript
```javascript
// Simple usage with default radius
const handleNearbySearch = async () => {
  const response = await medicineAPI.getMedicinesWithinRadius(
    28.6139,    // latitude
    77.2090,    // longitude
    5           // 5 km radius
  );
  console.log(`Found ${response.data.count} medicines`);
};

// Advanced usage with all parameters
const response = await medicineAPI.getMedicinesWithinRadius(
  userLocation.latitude,
  userLocation.longitude,
  15,                    // 15 km radius
  'Aspirin',            // search for specific medicine
  'cheapest'            // sort by price
);
```

### cURL Examples
```bash
# Get pharmacies within 5 km
curl "http://localhost:5001/api/medicine/geo/pharmacies-within-radius?latitude=28.6139&longitude=77.2090&radius=5"

# Get medicines within 10 km, sorted by nearest
curl "http://localhost:5001/api/medicine/geo/medicines-within-radius?latitude=28.6139&longitude=77.2090&radius=10&sortBy=nearest"

# Get specific medicine within 20 km, cheapest first
curl "http://localhost:5001/api/medicine/geo/medicines-within-radius?latitude=28.6139&longitude=77.2090&radius=20&medicineName=Aspirin&sortBy=cheapest"
```

---

## 📈 Performance Considerations

### Database Performance
- **2dsphere Index**: Optimizes queries to O(log n)
- **Compound Queries**: Uses pharmacy IDs for efficient medicine filtering
- **Distance Calculation**: Optional Haversine formula only for results

### Frontend Performance
- **Real-time Updates**: Slider changes trigger instant updates
- **Lazy Loading**: Distance calculation happens only for results
- **Caching**: Results can be cached by radius to avoid redundant queries

### Optimization Tips
1. Use MongoDB 2dsphere indexes on location field
2. Ensure coordinates are in [longitude, latitude] order
3. Cache results by radius to avoid repeated queries
4. Limit max radius to prevent overly broad searches
5. Paginate large result sets

---

## 🐛 Troubleshooting

### Issue: "Location required" error
**Solution**: Ensure GPS is enabled and location permissions are granted

### Issue: 2dsphere index not working
**Solution**: Ensure Pharmacy coordinates are in [longitude, latitude] format:
```javascript
// ✅ Correct
coordinates: [77.2090, 28.6139]  // [lng, lat]

// ❌ Wrong
coordinates: [28.6139, 77.2090]  // [lat, lng]
```

### Issue: Large result sets
**Solution**: Reduce search radius or add pagination:
```javascript
// Reduce radius
const response = await medicineAPI.getMedicinesWithinRadius(lat, lng, 2);

// Or implement pagination
router.get("/geo/medicines-within-radius", (req, res) => {
  const { limit = 20, skip = 0 } = req.query;
  medicines.slice(skip, skip + limit);
});
```

### Issue: Slow geospatial queries
**Solution**: Rebuild the 2dsphere index:
```javascript
// In MongoDB
db.pharmacies.dropIndex("location_2dsphere");
db.pharmacies.createIndex({ location: "2dsphere" });
```

---

## 🔐 Security Considerations

✅ **Public Endpoints**: Geospatial queries are intentionally public
✅ **No Authentication Required**: Location data doesn't require login
✅ **Input Validation**: Radius limited to 1-50 km
✅ **Rate Limiting**: Consider adding rate limits for API queries
✅ **Data Privacy**: Location searches don't identify individual users

---

## 📊 Database Schema Updates

### Existing Data Migration
```javascript
// Update existing pharmacies with location data
Pharmacy.updateMany(
  { latitude: { $exists: true }, longitude: { $exists: true } },
  [
    {
      $set: {
        location: {
          type: "Point",
          coordinates: ["$longitude", "$latitude"]
        }
      }
    }
  ]
);
```

### Validation
```javascript
// Ensure all pharmacies have both old and new location formats
const result = Pharmacy.find({
  $or: [
    { location: { $exists: false } },
    { location.coordinates: { $exists: false } }
  ]
});
console.log(`Pharmacies needing location update: ${result.length}`);
```

---

## 🎯 Testing Checklist

- [ ] **Slider Functionality**
  - [ ] Slider adjusts from 1 to 50 km
  - [ ] Value displays in real-time
  - [ ] Quick buttons update slider position

- [ ] **Search Operations**
  - [ ] Find pharmacies within 5 km
  - [ ] Find medicines within 10 km
  - [ ] Search specific medicine name
  - [ ] Sort by distance/price/delivery

- [ ] **GPS Integration**
  - [ ] Get device location on demand
  - [ ] Handle permission denial gracefully
  - [ ] Fallback to manual coordinate input

- [ ] **Results Display**
  - [ ] Medicine cards show distance
  - [ ] Delivery time displayed
  - [ ] Stock status visible
  - [ ] Ratings shown

- [ ] **Edge Cases**
  - [ ] No results in radius
  - [ ] GPS unavailable
  - [ ] Invalid coordinates
  - [ ] Empty search query

- [ ] **Performance**
  - [ ] 5 km radius returns in < 200ms
  - [ ] 50 km radius returns in < 500ms
  - [ ] Smooth slider interaction
  - [ ] Quick button clicks instant

---

## 📚 Related Documentation

- [GEOLOCATION_GUIDE.md](GEOLOCATION_GUIDE.md) - Overall geolocation system
- [README.md](README.md) - Project overview
- [QUICK_START.md](QUICK_START.md) - Getting started guide

---

**Implementation Status**: ✅ Complete
**MongoDB Version**: 4.2+ (2dsphere support)
**Node.js Version**: 14+
**React Version**: 18+
