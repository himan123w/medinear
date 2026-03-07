# 🚚 MediNear Delivery System - Complete Guide

## Overview

The delivery system is a complete solution for on-demand medicine delivery with real-time tracking, partner management, and customer scheduling capabilities.

### Key Features

✅ **Real-time GPS Tracking** - Live location updates of delivery partners  
✅ **Delivery Partner Network** - Register and manage local delivery personnel  
✅ **Distance-based Pricing** - Automatic delivery charge calculation  
✅ **Order Status Timeline** - Track complete delivery journey  
✅ **Partner Rating System** - Customer feedback for quality control  
✅ **Express & Scheduled Delivery** - Different delivery options with pricing  
✅ **Geospatial Capabilities** - Find nearby partners instantly  
✅ **OTP Verification** - Secure delivery confirmation  
✅ **Payment Integration** - UPI, Bank Transfer, Wallet support  

---

## Architecture

### Backend Components

#### Database Models

**DeliveryPartner.js**
```javascript
// Stores delivery partner information
{
  name: String,
  phone: String (unique),
  vehicleType: 'bike' | 'scooter' | 'car' | 'cycle',
  location: GeoJSON Point,
  serviceAreas: [String],
  status: 'active' | 'inactive' | 'on-delivery' | 'offline' | 'break',
  isAvailable: Boolean,
  ratings: { averageRating, totalRatings, reviews: [] },
  financial: { bankAccount, upiId, walletBalance },
  verification: { aadharNumber, licenseNumber, isVerified }
}
```

**Delivery.js**
```javascript
// Tracks delivery orders and status
{
  orderId: String,
  orderType: 'prescription' | 'medicine-order' | 'emergency',
  pharmacyId: ObjectId,
  customer: { name, phone, address },
  deliveryPartner: ObjectId,
  pickupLocation: GeoJSON Point,
  deliveryLocation: GeoJSON Point,
  items: [{ medicine, quantity, price }],
  status: 'confirmed' | 'assigned' | 'picked-up' | 'in-transit' | 'arrived' | 'delivered',
  statusHistory: [{ status, timestamp, location }],
  currentLocation: GeoJSON Point (real-time),
  estimatedDeliveryTime: DateTime,
  ratings: { partnerRating, orderRating },
  deliveryCharge: Number,
  totalAmount: Number
}
```

#### API Endpoints

**Partner Management**
```
POST   /api/delivery/partner/register       - Register new partner
GET    /api/delivery/partner/:phone         - Get partner details
PUT    /api/delivery/partner/location       - Update real-time location
PUT    /api/delivery/partner/availability   - Toggle availability
GET    /api/delivery/partners/available     - Find nearby available partners
POST   /api/delivery/partner/rate           - Rate partner after delivery
```

**Delivery Management**
```
POST   /api/delivery/book                   - Create new delivery order
PUT    /api/delivery/:id/status             - Update delivery status
GET    /api/delivery/:id/track              - Real-time tracking
POST   /api/delivery/:id/assign             - Assign partner to delivery
GET    /api/delivery/customer/:phone        - Customer's delivery history
GET    /api/delivery/partner/:phone         - Partner's active deliveries
GET    /api/delivery/stats                  - Delivery statistics
```

---

## Frontend Components

### 1. **DeliveryBooking.jsx**
Book delivery with customizable options

**Features:**
- Select delivery type (Express/Standard/Scheduled)
- Add special instructions
- Contactless delivery option
- Real-time charge calculation
- Order summary with total amount

**Usage:**
```jsx
import DeliveryBooking from '../components/DeliveryBooking';

<DeliveryBooking
  pharmacyId="pharmacy-001"
  pharmacyLocation={{ latitude: 28.6139, longitude: 77.2090 }}
  pickupAddress="123 Main Pharmacy, Delhi"
  customerLocation={{ latitude: 28.5244, longitude: 77.1855 }}
  deliveryAddress="Your Location"
  totalAmount={500}
  orderItems={[{ name: 'Aspirin', qty: 2, price: 100 }]}
  onDeliveryBooked={(delivery) => console.log(delivery)}
/>
```

### 2. **DeliveryTracking.jsx**
Real-time delivery tracking with map

**Features:**
- Live GPS map showing partner location
- Route visualization (pickup → current → delivery)
- Distance to delivery in real-time
- ETA calculation
- Partner contact information
- Delivery address with instructions
- Complete status timeline
- Call/Support buttons

**Usage:**
```jsx
import DeliveryTracking from '../components/DeliveryTracking';

<DeliveryTracking
  deliveryId="delivery-id-123"
  onClose={() => setSelectedDelivery(null)}
/>
```

### 3. **DeliveryPartnerCard.jsx**
Display available delivery partners

**Features:**
- Partner rating and statistics
- Vehicle type with emoji
- Distance calculation
- Success rate display
- Availability status indicator
- Service areas badge
- Quick selection button

**Usage:**
```jsx
import DeliveryPartnerCard from '../components/DeliveryPartnerCard';

<DeliveryPartnerCard
  partner={partnerData}
  distance={2.5}
  onSelectPartner={(partner) => console.log(partner)}
  isSelected={false}
/>
```

### 4. **DeliveryPartnerRegistration.jsx**
Multi-step partner onboarding

**Features:**
- Step 1: Basic Information (Name, Phone, Vehicle)
- Step 2: Document Verification (Aadhar, License)
- Step 3: Payment Setup (UPI, Bank Details)
- Form validation at each step
- Auto calculation of service areas
- Terms & conditions checkbox

**Usage:**
```jsx
import DeliveryPartnerRegistration from '../components/DeliveryPartnerRegistration';

<DeliveryPartnerRegistration
  onRegistrationSuccess={(partner) => console.log(partner)}
  onClose={() => setRegistration(false)}
/>
```

### 5. **DeliveryHistory.jsx**
View past deliveries with filtering

**Features:**
- Delivery statistics (Total, Delivered, Pending, Issues)
- Filter by status (All, Delivered, In-Transit, Cancelled)
- Pagination support
- Partner information display
- Delivery amount and date/time
- Track and Rate buttons
- Responsive design

**Usage:**
```jsx
import DeliveryHistory from '../components/DeliveryHistory';

<DeliveryHistory
  userPhone="9876543210"
  userRole="customer"
  onSelectDelivery={(deliveryId) => trackDelivery(deliveryId)}
  limit={10}
/>
```

### 6. **Delivery.jsx** (Main Page)
Complete delivery dashboard

**Customer View:**
- Role selector (Customer/Partner)
- Tab navigation (Book/Track/History)
- Location display with refresh
- Nearby partners list
- Booking form
- Tracking interface
- Delivery history

**Partner View:**
- Registration welcome card
- Benefits display
- Registration form
- Partner dashboard (future)

**Usage:**
```jsx
import Delivery from './pages/Delivery';

// Add to App.jsx routes
<Route path="/delivery" element={<ProtectedRoute><Delivery /></ProtectedRoute>} />
```

---

## Delivery Types & Pricing

### Standard Delivery
- **Time:** 45-60 minutes
- **Cost:** Order Amount × 8% (minimum ₹50)
- **Best for:** Regular medicine orders
- **Features:** Normal priority, standard tracking

### Express Delivery
- **Time:** 30 minutes
- **Cost:** Order Amount × 15% (minimum ₹100)
- **Best for:** Urgent medicines, fever, emergencies
- **Features:** High priority, real-time GPS, direct partner contact

### Scheduled Delivery
- **Time:** Next day or select date
- **Cost:** Order Amount × 5% (minimum ₹25)
- **Best for:** Regular medicine refills, bulk orders
- **Features:** Lowest cost, flexible timing, planned routes

---

## Distance Calculation

**Haversine Formula Implementation:**

```javascript
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c; // Return distance in km
}
```

---

## Status Flow

```
Delivery Status Timeline:

confirmed → assigned → picked-up → in-transit → arrived → delivered
    ↓
  cancelled/failed (at any stage, customer can cancel)
```

**Status Descriptions:**
- **confirmed** - Order confirmed, waiting for partner assignment
- **assigned** - Partner assigned, on the way to pharmacy
- **picked-up** - Order collected from pharmacy
- **in-transit** - On the way to customer location
- **arrived** - Partner reached delivery location
- **delivered** - Package handed over to customer
- **failed** - Delivery incomplete (customer unavailable, refused)
- **cancelled** - Customer cancelled the order

---

## Geospatial Queries

### Find Nearby Partners

**API Call:**
```javascript
GET /api/delivery/partners/available?lat=28.6139&lng=77.2090&radius=5000
```

**Database Query (MongoDB):**
```javascript
DeliveryPartner.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      $maxDistance: 5000 // meters
    }
  },
  isAvailable: true,
  status: 'active'
}).limit(10)
```

---

## Real-Time Location Updates

### Partner Location Sync

```javascript
// Partner app updates every 30 seconds
setInterval(async () => {
  const position = await navigator.geolocation.getCurrentPosition();
  
  await deliveryAPI.updatePartnerLocation({
    phone: partnerPhone,
    lat: position.coords.latitude,
    lng: position.coords.longitude
  });
}, 30000);

// Syncs to all active deliveries
// Customers see real-time movement on map
```

---

## Rating System

### Partner Rating

**Rating Structure:**
```javascript
{
  rating: 1-5 (stars),
  feedback: String,
  isAnonymous: Boolean,
  categories: {
    professionalism: 1-5,
    timeliness: 1-5,
    cleanliness: 1-5
  }
}
```

**Average Calculation:**
```javascript
averageRating = totalStars / numberOfRatings
// Updates after every delivery
```

---

## Payment Integration

### Supported Methods
- 💳 **UPI** - Real-time payment
- 🏦 **Bank Transfer** - Weekly settlement
- 💰 **Wallet** - In-app balance
- 💵 **Cash on Delivery** - Pay to partner

### Partner Earnings

**Calculation:**
```javascript
Earnings = Delivery Charge × (1 - Platform Fee 20%) + Incentives
Example: ₹100 charge = ₹80 to partner + ₹20 to platform
```

**Weekly Settlement:**
Every Friday, settled amount transferred to partner's UPI/Bank Account

---

## Integration with Other Features

### 1. **Pharmacy Rating System**
Delivery partners are rated alongside pharmacy ratings for complete quality tracking.

### 2. **Prescription Orders**
Prescriptions automatically route through delivery system after pharmacy confirmation.

### 3. **Emergency Orders**
Emergency medicine orders get highest priority (Express only).

### 4. **Medicine Reminders**
Reminders can trigger delivery scheduling for automatic refills.

---

## Error Handling

### Common Errors & Recovery

| Error | Cause | Solution |
|-------|-------|----------|
| Partner Not Found | No available partners in radius | Increase radius, expand service area |
| Location Permission Denied | Browser permission issue | Request location permission again |
| Delivery Failed | Partner couldn't reach location | Reschedule with new partner |
| Payment Failed | Payment gateway issue | Retry or choose different method |
| GPS Timeout | Location update delay | Refresh page, check GPS connection |

---

## Performance Optimization

### Geospatial Index
```javascript
// In DeliveryPartner model
location: {
  type: { type: String, default: 'Point' },
  coordinates: [Number]
}

// Create 2dsphere index for geospatial queries
db.deliverypartners.createIndex({ "location": "2dsphere" })
```

### Pagination
```javascript
// Limit API responses
GET /api/delivery/customer/:phone?page=1&limit=10
```

### Caching
- Partner profiles cached for 5 minutes
- Nearby partners list refreshed every 30 seconds
- Delivery status updates in real-time

---

## Testing the System

### API Testing via curl

**Register Partner:**
```bash
curl -X POST http://localhost:5001/api/delivery/partner/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "vehicleType": "bike",
    "lat": 28.6139,
    "lng": 77.2090,
    "aadharNumber": "123456789012",
    "licenseNumber": "DL2024001"
  }'
```

**Book Delivery:**
```bash
curl -X POST http://localhost:5001/api/delivery/book \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-123456",
    "customerPhone": "9999999999",
    "pickupLat": 28.6139,
    "pickupLng": 77.2090,
    "deliveryLat": 28.5244,
    "deliveryLng": 77.1855,
    "totalAmount": 500,
    "deliveryType": "express"
  }'
```

**Track Delivery:**
```bash
curl http://localhost:5001/api/delivery/delivery-id-123/track \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Future Enhancements

🔄 **Planned Features:**
- [ ] WebSocket real-time updates (live tracking)
- [ ] AI-based partner matching algorithm
- [ ] Peak-hour surge pricing
- [ ] Bulk order discounts
- [ ] Partner performance analytics dashboard
- [ ] Delivery cancellation insurance
- [ ] Integration with third-party logistics
- [ ] Multi-language support
- [ ] Voice notifications
- [ ] AR-based delivery proof

---

## Support & Documentation

📧 **Email:** support@medinear.com  
📞 **Phone:** 1800-MEDINEAR (1800-633-4632)  
🌐 **Website:** https://medinear.com  
📚 **API Docs:** https://api.medinear.com/docs  

---

## File Structure

```
delivery-system/
├── Backend
│   ├── models/
│   │   ├── DeliveryPartner.js (120 lines)
│   │   └── Delivery.js (180 lines)
│   ├── controllers/
│   │   └── deliveryController.js (450+ lines, 13 functions)
│   ├── routes/
│   │   └── deliveryRoutes.js (50 lines, 13 endpoints)
│   └── server.js (updated with delivery routes)
│
└── Frontend
    ├── pages/
    │   └── Delivery.jsx (200 lines)
    ├── components/
    │   ├── DeliveryBooking.jsx (150 lines)
    │   ├── DeliveryBooking.css
    │   ├── DeliveryTracking.jsx (300 lines)
    │   ├── DeliveryTracking.css
    │   ├── DeliveryPartnerCard.jsx (100 lines)
    │   ├── DeliveryPartnerCard.css
    │   ├── DeliveryPartnerRegistration.jsx (180 lines)
    │   ├── DeliveryPartnerRegistration.css
    │   ├── DeliveryHistory.jsx (200 lines)
    │   └── DeliveryHistory.css
    ├── api.js (updated with deliveryAPI)
    └── App.jsx (added delivery route)
```

---

## Quick Start

1. **Access Delivery Page:**
   - Navigate to `/delivery` in authenticated app
   - OR click "Delivery" in navigation menu

2. **Book as Customer:**
   - Select "Customer" role
   - Click "Book Delivery"
   - Fill pharmacy and delivery details
   - Choose delivery type and pay

3. **Become Partner:**
   - Select "Delivery Partner" role
   - Click "Join as Delivery Partner"
   - Complete 3-step registration
   - Start accepting deliveries

4. **Track Order:**
   - Go to "Delivery History"
   - Click "Track" on active delivery
   - View real-time map and partner info

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
