# 🛒 Medicine Reservation - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Backend is Ready ✅
The reservation system is already integrated! Just restart your server:
```bash
cd /Users/rajpoothimanshusingh369/Desktop/medinear
npm start
```

The background job automatically starts and processes expired reservations every 60 seconds.

### Step 2: Test the API
```bash
# Get auth token first
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"YOUR_PHONE","password":"YOUR_PASSWORD"}'

# Create a reservation
curl -X POST http://localhost:5001/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicineId": "MEDICINE_ID",
    "pharmacyId": "PHARMACY_ID",
    "quantity": 2
  }'

# View your reservations
curl http://localhost:5001/api/reservations/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Add to Frontend

**Option A: Add to Medicine Card**
```jsx
import ReserveButton from './components/ReserveButton';

// In your MedicineCard component
<ReserveButton 
  medicine={medicine}
  pharmacy={pharmacy}
  onReservationCreated={(reservation) => {
    alert('Reserved! Code: ' + reservation.reservationCode);
  }}
/>
```

**Option B: Add Reservations Page to Router**
```jsx
import Reservations from './pages/Reservations';

// In App.jsx or router
<Route path="/reservations" element={<Reservations />} />
```

**Option C: Add to Navigation**
```jsx
<Link to="/reservations">
  🛒 My Reservations
</Link>
```

---

## 📋 Quick Reference

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reservations` | Create reservation |
| GET | `/api/reservations/my` | Get my reservations |
| GET | `/api/reservations/:id` | Get single reservation |
| POST | `/api/reservations/:id/cancel` | Cancel reservation |
| POST | `/api/reservations/:id/complete` | Complete (pharmacy) |
| POST | `/api/reservations/:id/extend` | Extend +15 minutes |
| GET | `/api/reservations/stats` | Get statistics |

### Reservation States
- **active** - Currently reserved, timer running
- **expired** - Timer ran out, stock restored
- **cancelled** - User cancelled, stock restored
- **completed** - Picked up by customer

### Key Timings
- **Reservation Duration:** 30 minutes
- **Extension Time:** +15 minutes (one-time)
- **Expiry Warning:** 5 minutes before expiry
- **Background Job:** Runs every 60 seconds

---

## 💡 Integration Examples

### Example 1: Medicine Detail Page
```jsx
import React, { useState } from 'react';
import ReserveButton from './components/ReserveButton';
import { useNavigate } from 'react-router-dom';

const MedicineDetail = ({ medicine, pharmacy }) => {
  const navigate = useNavigate();

  return (
    <div className="medicine-detail">
      <h1>{medicine.name}</h1>
      <p>Price: ₹{medicine.price}</p>
      <p>Stock: {medicine.stock} units</p>
      
      {medicine.stock > 0 && (
        <ReserveButton 
          medicine={medicine}
          pharmacy={pharmacy}
          onReservationCreated={(reservation) => {
            // Navigate to reservations page
            navigate('/reservations');
          }}
        />
      )}
    </div>
  );
};
```

### Example 2: Search Results Card
```jsx
import ReserveButton from './components/ReserveButton';

const SearchResultCard = ({ medicine, pharmacy }) => {
  return (
    <div className="search-card">
      <h3>{medicine.name}</h3>
      <p>₹{medicine.price}</p>
      <p>{pharmacy.name}</p>
      
      <div className="card-actions">
        <button>View Details</button>
        <ReserveButton 
          medicine={medicine}
          pharmacy={pharmacy}
          className="compact"
        />
      </div>
    </div>
  );
};
```

### Example 3: Display Active Reservations
```jsx
import { ReservationList } from './components/ReservationTimer';

const UserDashboard = () => {
  return (
    <div className="dashboard">
      <h2>Active Reservations</h2>
      <ReservationList />
    </div>
  );
};
```

### Example 4: Single Reservation Display
```jsx
import ReservationTimer from './components/ReservationTimer';

const ReservationCard = ({ reservation }) => {
  return (
    <ReservationTimer 
      reservation={reservation}
      onExpired={(res) => {
        alert('Your reservation has expired');
      }}
      onCancelled={(res) => {
        alert('Reservation cancelled');
      }}
    />
  );
};
```

---

## 🎨 Customization

### Custom Button Styling
```jsx
<ReserveButton 
  medicine={medicine}
  pharmacy={pharmacy}
  className="my-custom-button"
/>
```

```css
.my-custom-button {
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
  font-size: 14px;
  padding: 8px 16px;
}
```

### Custom Success Handler
```jsx
<ReserveButton 
  medicine={medicine}
  pharmacy={pharmacy}
  onReservationCreated={(reservation) => {
    // Custom logic
    toast.success(`Reserved! Code: ${reservation.reservationCode}`);
    trackAnalytics('reservation_created', reservation);
    updateUserStats();
  }}
/>
```

---

## 🔔 Notification Setup (Optional)

### Email Notifications
Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=MediNear <noreply@medinear.com>
```

### SMS Notifications (Twilio)
Add to `.env`:
```env
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_FROM=+1234567890
```

**Note:** If not configured, notifications are logged to console only.

---

## 🧪 Testing Checklist

- [ ] Create reservation with available stock ✅
- [ ] Try creating with insufficient stock (should fail) ✅
- [ ] Try creating duplicate active reservation (should fail) ✅
- [ ] View list of reservations ✅
- [ ] Watch timer countdown ✅
- [ ] See color change (green → orange → red) ✅
- [ ] Receive 5-minute warning ✅
- [ ] Cancel reservation ✅
- [ ] Extend reservation ✅
- [ ] Wait for auto-expiry (or test with shorter duration) ✅
- [ ] Verify stock restored on expiry ✅
- [ ] Test pharmacy completion ✅

---

## 📊 Monitor Performance

### Check Background Job
Look for this in server logs:
```
✅ Reservation expiry checker started (runs every 60 seconds)
Cron: Running daily subscription processor at...
Expired and restored reservation: RSV1709234567ABC12
```

### Database Queries
```javascript
// In MongoDB
db.reservations.find({ status: 'active' })
db.reservations.countDocuments({ status: 'completed' })
db.reservations.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])
```

### Get Statistics
```javascript
const stats = await reservationAPI.getReservationStats();
console.log(`Conversion Rate: ${stats.conversionRate}%`);
```

---

## 🚨 Common Issues

### "Background job not running"
**Solution:** Restart server, check logs for startup message

### "Stock not restoring"
**Solution:** Check database connection, verify background job is running

### "Notifications not sending"
**Solution:** Check SMTP config, review console logs (emails are logged if SMTP not configured)

### "Timer not updating in UI"
**Solution:** Ensure component is properly mounted, check browser console for errors

---

## 🎯 Key Benefits Recap

✅ **Solves "Sold Out" Problem** - No more wasted trips  
✅ **30-Minute Lock** - Medicine held for you  
✅ **Auto-Restore** - Stock returns if not picked up  
✅ **Real-Time Sync** - Live updates across devices  
✅ **Pharmacy Alerts** - Instant notification to pharmacy  
✅ **User Friendly** - Simple one-click reserve  
✅ **Game Changer** - Feature not on 1mg or competitors  

---

## 📚 Full Documentation

For complete details, see [MEDICINE_RESERVATION_GUIDE.md](./MEDICINE_RESERVATION_GUIDE.md)

---

**Need Help?**  
Check the full guide or review the implementation in:
- Backend: `models/Reservation.js`, `services/reservationService.js`
- Frontend: `components/ReserveButton.jsx`, `components/ReservationTimer.jsx`

**Happy Coding! 🚀**
