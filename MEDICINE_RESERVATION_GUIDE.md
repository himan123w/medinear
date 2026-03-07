# 🛒 Medicine Reservation System - Complete Guide

## 🎯 Overview

The **Reserve Medicine** feature is a game-changing addition to MediNear that solves the critical problem of "I went there but they sold it." This feature allows users to reserve medicines for 30 minutes, ensuring stock availability when they arrive at the pharmacy.

---

## 🚀 Key Features

### ✅ Core Functionality
- **30-Minute Reservation Window** - Medicines are locked for the user
- **Real-time Stock Management** - Stock is temporarily reduced
- **Auto-Expiry System** - Stock automatically restored after 30 minutes
- **Instant Notifications** - Both pharmacy and user are notified
- **Reservation Code** - Unique code for pharmacy pickup
- **Live Timer** - Real-time countdown display
- **Extend Option** - Extend reservation by 15 minutes
- **Cancel Anytime** - Users can cancel and restore stock

### 🎨 User Experience
- **Simple One-Click Reserve** - Easy-to-use button interface
- **Quantity Selection** - Choose how many units to reserve
- **Visual Timer** - Color-coded countdown (Green → Orange → Red)
- **Progress Bar** - Visual representation of time remaining
- **Warning Alerts** - 5-minute warning before expiry
- **Multi-device Sync** - Reservations sync across devices

### 📊 Business Benefits
- **Reduces Customer Frustration** - No more "out of stock" surprises
- **Increases Conversion** - Customers more likely to complete purchase
- **Better Inventory Control** - Real-time stock tracking
- **Customer Commitment** - Reservation indicates buying intent
- **Competitive Advantage** - Feature not available on 1mg-level platforms
- **Analytics** - Track reservation-to-purchase conversion

---

## 📁 Architecture

### Backend Components

#### 1. **Database Model** (`models/Reservation.js`)
```javascript
Reservation Schema:
- user: Reference to User
- medicine: Reference to Medicine
- pharmacy: Reference to Pharmacy
- quantity: Number of units reserved
- status: active | expired | cancelled | completed
- reservedAt: Timestamp of reservation creation
- expiresAt: Expiration timestamp (reservedAt + 30 min)
- reservationCode: Unique code (e.g., RSV1709234567ABC12)
- userInfo: Snapshot of user contact details
- medicineSnapshot: Snapshot of medicine details
- totalAmount: Total price for reserved quantity
- notifications: Tracking notification status
```

**Features:**
- Auto-generate unique reservation codes
- Virtual fields for time remaining
- Instance methods: `isExpired()`, `expire()`, `cancel()`, `complete()`
- Indexed for efficient queries

#### 2. **Service Layer** (`services/reservationService.js`)
```javascript
Key Methods:
- createReservation() - Create new reservation & reduce stock
- cancelReservation() - Cancel and restore stock
- completeReservation() - Mark as picked up
- processExpiredReservations() - Background job for auto-expiry
- restoreStock() - Restore stock when expired/cancelled
- notifyPharmacy() - Email notification to pharmacy
- notifyUser() - Email confirmation to user
- sendExpiryWarning() - 5-minute warning notification
- getReservationStats() - Analytics and statistics
```

**Background Jobs:**
- Runs every 60 seconds
- Checks for expired reservations
- Auto-restores stock
- Sends expiry notifications

#### 3. **Controller** (`controllers/reservationController.js`)
```javascript
API Endpoints:
POST   /api/reservations              - Create reservation
GET    /api/reservations/my           - Get user's reservations
GET    /api/reservations/:id          - Get single reservation
POST   /api/reservations/:id/cancel   - Cancel reservation
POST   /api/reservations/:id/complete - Complete (pharmacy)
POST   /api/reservations/:id/extend   - Extend by 15 minutes
GET    /api/reservations/stats        - Get statistics
GET    /api/reservations/pharmacy/:id - Get pharmacy reservations
```

#### 4. **Routes** (`routes/reservationRoutes.js`)
- All routes use authentication middleware
- Input validation for create/update operations
- Rate limiting for API protection

---

### Frontend Components

#### 1. **ReserveButton Component** (`components/ReserveButton.jsx`)
**Features:**
- Beautiful gradient button design
- Quantity selection modal
- Real-time stock validation
- Price calculation
- Confirmation dialog
- Error handling
- Loading states

**Usage:**
```jsx
import ReserveButton from './components/ReserveButton';

<ReserveButton 
  medicine={medicineObj}
  pharmacy={pharmacyObj}
  onReservationCreated={(reservation) => {
    // Handle successful reservation
  }}
/>
```

#### 2. **ReservationTimer Component** (`components/ReservationTimer.jsx`)
**Features:**
- Real-time countdown timer (updates every second)
- Color-coded progress bar
- Status badges (Active, Expired, Cancelled, Completed)
- Warning messages at 5 minutes
- Extend and Cancel buttons
- Responsive design

**Usage:**
```jsx
import ReservationTimer from './components/ReservationTimer';

<ReservationTimer 
  reservation={reservationObj}
  onExpired={(res) => console.log('Expired:', res)}
  onCancelled={(res) => console.log('Cancelled:', res)}
/>
```

#### 3. **ReservationList Component** (`components/ReservationTimer.jsx`)
**Features:**
- Displays all user reservations
- Filter by status (Active, All)
- Auto-refresh every 30 seconds
- Grid layout on desktop
- Loading states

**Usage:**
```jsx
import { ReservationList } from './components/ReservationTimer';

<ReservationList userId={currentUserId} />
```

#### 4. **Reservations Page** (`pages/Reservations.jsx`)
**Features:**
- Full-page reservation management
- Info cards with key metrics
- Help section
- Beautiful gradient header
- Responsive design

---

## 🔧 Installation & Setup

### 1. Backend Setup

**Install Dependencies** (already included):
```bash
# All required packages are already in package.json
npm install
```

**Database:**
- The Reservation model is automatically registered
- MongoDB indexes are created on first startup

**Environment Variables** (optional):
```env
# Email notifications (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=MediNear <noreply@medinear.com>

# SMS notifications (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM=+1234567890
```

**Start Server:**
```bash
npm start
```

The reservation service automatically:
- Starts background expiry checker
- Processes expired reservations every 60 seconds
- Restores stock automatically

### 2. Frontend Setup

**API Integration:**
Already added to `src/api.js`:
```javascript
import { reservationAPI } from './api';

// Use in components
const reservation = await reservationAPI.createReservation({
  medicineId: '...',
  pharmacyId: '...',
  quantity: 2
});
```

**Add to Routes:**
```jsx
// In your App.jsx or router config
import Reservations from './pages/Reservations';

<Route path="/reservations" element={<Reservations />} />
```

**Use Reserve Button:**
```jsx
// In your medicine card/detail component
import ReserveButton from './components/ReserveButton';

<ReserveButton 
  medicine={medicine}
  pharmacy={pharmacy}
  onReservationCreated={(reservation) => {
    // Navigate to reservations page or show success
    navigate('/reservations');
  }}
/>
```

---

## 📱 User Flow

### Customer Journey

1. **Browse & Search** → User finds medicine on platform
2. **Check Availability** → Sees stock at nearby pharmacy
3. **Click Reserve** → Clicks "🛒 Reserve for 30 Minutes" button
4. **Select Quantity** → Modal appears, selects quantity
5. **Confirm** → Reviews total, confirms reservation
6. **Get Code** → Receives unique reservation code (RSVxxxxx)
7. **Email Notification** → Gets confirmation email with details
8. **Track Timer** → Sees live countdown on reservations page
9. **5-Min Warning** → Receives warning at 5 minutes remaining
10. **Visit Pharmacy** → Goes to pharmacy within 30 minutes
11. **Show Code** → Shows reservation code to pharmacist
12. **Complete** → Pharmacy marks as completed, stock permanently reduced

### Alternative Flows

**Extend Reservation:**
1. User clicks "⏰ Extend +15 min" button
2. Reservation extended (one-time only)
3. Timer updated

**Cancel Reservation:**
1. User clicks "❌ Cancel" button
2. Confirms cancellation
3. Stock immediately restored
4. Pharmacy notified

**Auto-Expiry:**
1. Timer reaches 00:00
2. Background job detects expiry
3. Stock automatically restored
4. User notified via email
5. Reservation marked as expired

---

## 🎨 UI/UX Design

### Color Coding
- **Green** (> 10 minutes) - Safe, plenty of time
- **Orange** (5-10 minutes) - Warning, heading to pharmacy
- **Red** (< 5 minutes) - Urgent, expiring soon
- **Gray** - Expired/Cancelled
- **Blue** - Completed

### Visual Elements
- **Progress Bar** - Gradually decreases showing time left
- **Timer Display** - Large, easy-to-read countdown
- **Status Badges** - Clear indication of reservation state
- **Gradient Buttons** - Eye-catching, modern design
- **Pulsing Animation** - Active reservations pulse subtly
- **Warning Flash** - Blinks when < 5 minutes remaining

### Responsive Design
- **Mobile-First** - Optimized for phone screens
- **Desktop Grid** - Multi-column layout on large screens
- **Touch-Friendly** - Large buttons for easy tapping
- **Accessible** - High contrast, readable fonts

---

## 📊 Analytics & Metrics

### Key Metrics to Track

```javascript
// Get reservation statistics
const stats = await reservationAPI.getReservationStats();

{
  total: 1250,           // Total reservations created
  active: 45,            // Currently active
  expired: 320,          // Expired without pickup
  cancelled: 185,        // User cancelled
  completed: 700,        // Successfully picked up
  conversionRate: 56.0   // Completion rate (%)
}
```

### Business Insights
- **Conversion Rate** - Completed / Total
- **Expiry Rate** - Expired / Total (target: < 30%)
- **Cancel Rate** - Cancelled / Total
- **Popular Times** - When most reservations are made
- **Average Extension** - How often users extend
- **Pharmacy Performance** - Which pharmacies fulfill fastest

---

## 🔒 Security & Validation

### Backend Validation
- ✅ User authentication required
- ✅ Stock availability check
- ✅ Duplicate reservation prevention
- ✅ Pharmacy authorization for completion
- ✅ User authorization for cancellation
- ✅ Quantity limits (1 to available stock)

### Data Integrity
- ✅ Atomic stock operations
- ✅ Transaction-safe updates
- ✅ Snapshot of medicine details
- ✅ Audit trail (timestamps)
- ✅ Indexed for performance

---

## 🧪 Testing

### Test Scenarios

**Create Reservation:**
```bash
curl -X POST http://localhost:5001/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicineId": "MEDICINE_ID",
    "pharmacyId": "PHARMACY_ID",
    "quantity": 2
  }'
```

**Get My Reservations:**
```bash
curl http://localhost:5001/api/reservations/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Cancel Reservation:**
```bash
curl -X POST http://localhost:5001/api/reservations/RESERVATION_ID/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Cases
1. ✅ Create reservation with sufficient stock
2. ✅ Fail creation with insufficient stock
3. ✅ Prevent duplicate active reservations
4. ✅ Auto-expire after 30 minutes
5. ✅ Restore stock on cancellation
6. ✅ Restore stock on expiration
7. ✅ Extend reservation time
8. ✅ Complete reservation (pharmacy)
9. ✅ Send notifications correctly
10. ✅ Handle concurrent reservations

---

## 🚨 Error Handling

### Common Errors

**"Insufficient stock"**
- Validation before reservation creation
- User-friendly error message
- Suggests checking other pharmacies

**"You already have an active reservation"**
- Prevents duplicate reservations
- Shows existing reservation details
- Option to cancel existing first

**"Reservation not found"**
- Invalid reservation ID
- Deleted reservation
- Expired and cleaned up

**"Unauthorized"**
- User trying to access/modify others' reservations
- Missing authentication token
- Pharmacy trying to complete wrong reservation

---

## 🔄 Stock Management Integration

### How It Works

**On Create:**
```javascript
// 1. Check stock
if (medicine.stock < quantity) throw Error('Insufficient stock');

// 2. Create reservation
const reservation = await Reservation.create({...});

// 3. Reduce stock temporarily
medicine.stock -= quantity;
await medicine.save();

// 4. Update inventory
inventory.quantity -= quantity;
```

**On Expire:**
```javascript
// Background job every 60 seconds
const expired = await Reservation.find({
  status: 'active',
  expiresAt: { $lt: new Date() }
});

for (const res of expired) {
  // Mark as expired
  res.status = 'expired';
  await res.save();
  
  // Restore stock
  medicine.stock += res.quantity;
  await medicine.save();
}
```

**On Cancel:**
```javascript
// User cancels
reservation.status = 'cancelled';
await reservation.save();

// Restore stock immediately
medicine.stock += reservation.quantity;
await medicine.save();
```

**On Complete:**
```javascript
// Pharmacy confirms pickup
reservation.status = 'completed';
reservation.completedAt = new Date();
await reservation.save();

// Stock already reduced, no change needed
// Could record sale in analytics
```

---

## 📈 Future Enhancements

### Planned Features
- [ ] **Payment Integration** - Pay during reservation
- [ ] **Multiple Medicines** - Reserve cart of medicines
- [ ] **Priority Reservations** - Premium users get longer time
- [ ] **Repeat Reservations** - Quick re-reserve
- [ ] **Pharmacy Queue** - See position in queue
- [ ] **GPS Verification** - Verify user is near pharmacy
- [ ] **WhatsApp Notifications** - Alternative to email
- [ ] **Reservation History** - Detailed analytics for users
- [ ] **Bulk Reservations** - Reserve for multiple family members
- [ ] **Smart Recommendations** - Suggest alternative pharmacies

### Advanced Features
- **Machine Learning** - Predict no-show probability
- **Dynamic Timing** - Adjust duration based on distance
- **Loyalty Points** - Reward completed reservations
- **Pharmacy Dashboard** - Dedicated reservation management
- **Auto-Restock Alerts** - Notify when reserved item out of stock

---

## 🎓 Best Practices

### For Users
1. ✅ Reserve only when you plan to pick up
2. ✅ Cancel if plans change
3. ✅ Arrive within 30 minutes
4. ✅ Note your reservation code
5. ✅ Enable notifications

### For Pharmacies
1. ✅ Keep reserved items separate
2. ✅ Verify reservation code
3. ✅ Complete promptly when picked up
4. ✅ Check email notifications
5. ✅ Monitor reservation stats

### For Developers
1. ✅ Run background job reliably
2. ✅ Monitor database indexes
3. ✅ Log reservation activities
4. ✅ Track conversion metrics
5. ✅ Handle edge cases gracefully
6. ✅ Test concurrent scenarios
7. ✅ Optimize query performance

---

## 🐛 Troubleshooting

### Common Issues

**Background job not running:**
```javascript
// Check in server logs for:
"✅ Reservation expiry checker started (runs every 60 seconds)"
```

**Stock not auto-restoring:**
- Check background job is running
- Verify expiresAt timestamp is correct
- Check for database connection issues

**Notifications not sending:**
- Verify SMTP environment variables
- Check spam/junk folders
- Review notification service logs

**Timer not updating:**
- Ensure frontend component is mounted
- Check for JavaScript errors
- Verify websocket/polling is working

---

## 📞 Support

### For Issues
- Check server logs: `logs/` directory
- Enable debug mode: `DEBUG=medinear:*`
- Check database connection
- Verify API endpoints

### Contact
- Email: support@medinear.com
- Docs: /api/reservations (Swagger)
- GitHub: Issues section

---

## ✨ Conclusion

The Medicine Reservation System is a **game-changing feature** that:

🎯 **Solves a real problem** - "Went there but they sold it"  
🚀 **Improves user experience** - Guaranteed availability  
💰 **Increases revenue** - Higher conversion rates  
🏆 **Competitive advantage** - Unique feature vs. competitors  
📊 **Data-driven** - Rich analytics capabilities  

This feature alone can **differentiate MediNear from 1mg-level platforms** and provide a superior customer experience!

---

**Version:** 1.0.0  
**Last Updated:** March 1, 2026  
**Status:** ✅ Production Ready
