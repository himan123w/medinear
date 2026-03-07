# Back-In-Stock Notification System - Implementation Guide

## Overview

The Back-In-Stock Notification system allows users to receive alerts when previously unavailable medicines become available again at their preferred pharmacies. This feature improves user engagement and retention by keeping users connected to the platform.

### Key Features

✅ **Dual Subscription Modes**
- Authenticated users (auto-filled email)
- Anonymous email subscribers

✅ **Smart Notifications**
- Price-aware notifications (optional max price limit)
- Multi-channel support (Email, SMS, Push - SMS/Push in v2)
- Automatic 90-day expiration

✅ **Subscription Management**
- View all active subscriptions
- Cancel anytime
- Receive only when stock actually returns
- No spam guarantee

✅ **Scheduled Monitoring**
- Every 4 hours: Check for stock improvements
- Daily cleanup: Remove expired subscriptions
- Efficient database queries with indexes

---

## Architecture

### Database Model
**File**: `/medinear/models/BackInStockNotification.js`

```javascript
Schema Fields:
  - user: ObjectId (authenticated user)
  - email: String (for anonymous or authenticated users)
  - medicine: ObjectId (medicine reference)
  - medicineName: String (denormalized for queries)
  - dosage: String (e.g., "500mg", "2% syrup")
  - pharmacy: ObjectId (pharmacy reference)
  - pharmacyName: String (denormalized for queries)
  - pharmacyPhone: String
  
Stock Tracking:
  - stockStatusAtSubscription: String (out_of_stock|low_stock|available)
  - currentStock: Integer
  - requiredStock: Integer (minimum to trigger notification)
  - maxPriceLimit: Number (optional price threshold)
  - priceAtSubscription: Number
  
Notification Status:
  - status: enum [active|notified|cancelled|expired]
  - notificationMethod: enum [email|sms|push|in_app]
  - notificationSentAt: Date
  - notificationSentVia: Array of methods used
  
Management:
  - createdAt: Date (with auto-expire at 90 days)
  - expiresAt: Date (auto-expires after 90 days)
  - checkCount: Integer (how many times checked)
  - lastCheckedAt: Date
```

### Backend API Endpoints

**Base URL**: `/api/stock-notifications`

#### 1. Subscribe to Notification
```
POST /api/stock-notifications/subscribe
```

**Request Body**:
```json
{
  "medicineId": "642f1234567890abcdef1234",
  "medicineName": "Aspirin",
  "dosage": "500mg",
  "pharmacyId": "642f5678567890abcdef5678",
  "email": "user@example.com",
  "maxPriceLimit": 150.00,
  "notificationMethod": "email",
  "searchQuery": "aspirin",
  "deviceId": "device-uuid-optional"
}
```

**Response**:
```json
{
  "success": true,
  "message": "🔔 Subscribed to Aspirin notifications at PharmacyCare",
  "notification": {
    "_id": "ObjectId",
    "medicineName": "Aspirin",
    "pharmacyName": "PharmacyCare",
    "method": "email",
    "expiresAt": "2025-09-15T10:30:00Z"
  }
}
```

#### 2. Get User's Subscriptions
```
GET /api/stock-notifications/my
Query Params: email (optional for non-authenticated users)
```

**Response**:
```json
{
  "success": true,
  "subscriptions": [
    {
      "_id": "ObjectId",
      "medicineName": "Aspirin",
      "pharmacy": { "_id": "...", "name": "PharmacyCare", "phone": "..." },
      "medicine": { "_id": "...", "name": "Aspirin", "price": 100 },
      "status": "active",
      "createdAt": "2025-09-15T10:30:00Z",
      "expiresAt": "2025-12-14T10:30:00Z"
    }
  ],
  "count": 1
}
```

#### 3. Check Subscription Status
```
GET /api/stock-notifications/status
Query Params: medicineId, pharmacyId, email (optional)
```

**Response**:
```json
{
  "success": true,
  "isSubscribed": true,
  "subscription": {
    "_id": "ObjectId",
    "status": "active",
    "createdAt": "2025-09-15T10:30:00Z",
    "expiresAt": "2025-12-14T10:30:00Z",
    "notificationMethod": "email"
  }
}
```

#### 4. Cancel Subscription
```
DELETE /api/stock-notifications/:subscriptionId/unsubscribe
```

**Response**:
```json
{
  "success": true,
  "message": "✓ Unsubscribed from Aspirin notifications"
}
```

#### 5. Get Statistics (Authenticated Users)
```
GET /api/stock-notifications/stats
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "total": 5,
    "active": 3,
    "notified": 1,
    "cancelled": 1
  }
}
```

---

## Frontend Integration

### BackInStockButton Component
**File**: `/medinear-frontend/src/components/BackInStockButton.jsx`

#### Usage Example

```jsx
import BackInStockButton from '../components/BackInStockButton';

function MedicineCard({ medicine, pharmacy }) {
  const handleSubscriptionSuccess = (notification) => {
    console.log('User subscribed:', notification);
    // Update UI, show success toast, etc.
  };

  if (medicine.stock === 0 || medicine.stock === undefined) {
    return (
      <div className="medicine-card">
        <h3>{medicine.name}</h3>
        <p className="stock-status">Out of Stock</p>
        <BackInStockButton
          medicineId={medicine._id}
          medicineName={medicine.name}
          dosage={medicine.dosage}
          pharmacyId={pharmacy._id}
          pharmacyName={pharmacy.name}
          onSubscriptionSuccess={handleSubscriptionSuccess}
        />
      </div>
    );
  }

  return (
    <div className="medicine-card">
      <h3>{medicine.name}</h3>
      <p>Available: {medicine.stock} units</p>
    </div>
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `medicineId` | String | Yes | MongoDB medicine ID |
| `medicineName` | String | Yes | Display name of medicine |
| `dosage` | String | No | e.g., "500mg", "2% syrup" |
| `pharmacyId` | String | Yes | MongoDB pharmacy ID |
| `pharmacyName` | String | Yes | Display name of pharmacy |
| `onSubscriptionSuccess` | Function | No | Callback when subscription succeeds |

#### Styling

CSS variables available in `BackInStockButton.css`:

```css
/* Purple gradient theme (can be customized) */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--primary-color: #667eea;
--success-color: #2e7d32;
--error-color: #c62828;
--warning-color: #e65100;
```

---

## Backend Services

### Notification Service
**File**: `/medinear/services/backInStockNotificationService.js`

#### Key Functions

**1. checkAndNotifyOutOfStock()**
```javascript
// Called every 4 hours by cron job
const stats = await backInStockService.checkAndNotifyOutOfStock();
// Returns: { checked, notified, errors }
```

Process:
1. Fetch all active pending notifications
2. For each notification:
   - Check if subscription expired → cancel & skip
   - Get current medicine stock
   - Check price threshold
   - If stock available & price OK → send notification & mark as notified
   - Update lastCheckedAt timestamp

**2. sendBackInStockNotification(notification, medicine, pharmacy, stock)**
```javascript
// Sends formatted email notification
await backInStockService.sendBackInStockNotification(
  notification,
  medicine,
  pharmacy,
  stock
);
```

Email Template Includes:
- Medicine name & dosage
- Pharmacy name & phone
- Available stock count
- Price information
- Subscription expiration notice

**3. cleanupExpiredSubscriptions()**
```javascript
// Called daily at 2 AM
const result = await backInStockService.cleanupExpiredSubscriptions();
// Returns: { modifiedCount }
```

**4. getServiceStats()**
```javascript
const stats = await backInStockService.getServiceStats();
// Returns stats like total, active, notified, cancelled subscriptions
```

### Cron Jobs
**File**: `/medinear/jobs/backInStockNotificationJob.js`

Configured in `server.js`:

```javascript
// Every 4 hours - Check for stock improvements
cron.schedule('0 */4 * * *', async () => {
  const stats = await backInStockService.checkAndNotifyOutOfStock();
  // Logs results and runs notifications
});

// Daily at 2 AM - Clean up expired subscriptions
cron.schedule('0 2 * * *', async () => {
  await backInStockService.cleanupExpiredSubscriptions();
});
```

---

## Email Notification Template

Sent when stock becomes available:

```
Subject: ✅ {medicineName} is back in stock at {pharmacyName}!

To: {userEmail}

---

[Gradient Header with "✅ Medicine Available!"]

Great news! Aspirin (500mg) is now back in stock at:

┌─────────────────────────────────────────┐
│📍 PharmacyCare                          │
│📞 +91-XXXXXXXXXX                        │
│📦 Available Stock: 50 units             │
│💰 Price: ₹100                           │
└─────────────────────────────────────────┘

[Green Info Box]
✓ This medicine matches your notification preferences
  (Max Price: ₹150)

---

This notification was sent because you requested an alert when 
this medicine became available. You will not receive further 
notifications unless you subscribe again.

© MediNear - Your Medicine, Our Priority
```

---

## Configuration

### Environment Variables

Add to `.env`:

```env
# Email Configuration for back-in-stock notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: Custom email service provider
EMAIL_SERVICE=gmail  # or your SMTP service
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
```

### Cron Schedule Customization

To change notification check frequency, modify in `jobs/backInStockNotificationJob.js`:

```javascript
// Current: Every 4 hours
// Change to:
// '0 * * * *' → Every hour
// '0 */6 * * *' → Every 6 hours
// '0 0 * * *' → Once daily at midnight
```

---

## Monitoring & Debugging

### Manual Notification Check

```javascript
// In Node.js REPL or API endpoint
const backInStockJob = require('./jobs/backInStockNotificationJob');

// Run check immediately
await backInStockJob.runImmediateCheck();

// Run cleanup immediately
await backInStockJob.runImmediateCleanup();
```

### Database Queries

```javascript
// Find all active subscriptions for a user
const subscriptions = await BackInStockNotification.getByUser(userId);

// Find subscriptions for specific medicine & pharmacy
const subs = await BackInStockNotification.getByPharmacyAndMedicine(
  pharmacyId,
  medicineId
);

// Get all active pending notifications
const pending = await BackInStockNotification.getActivePendingNotifications();

// Service statistics
const stats = await backInStockService.getServiceStats();
```

### Logging

All operations logged with timestamps:
- Subscription creation
- Notification check runs
- Emails sent
- Errors encountered
- Cleanup operations

---

## Common Issues & Solutions

### Issue: Users not receiving emails

**Symptoms**: Notifications subscribed but emails not arriving

**Solutions**:
1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
2. Enable "Less secure app access" for Gmail
3. Check email spam folder
4. Verify medicine stock is actually updated in database
5. Check `BackInStockNotification` record has status 'active'

### Issue: Subscriptions not expiring

**Symptoms**: Subscriptions stay active beyond 90 days

**Solutions**:
1. Verify `expiresAt` field is set (should be 90 days from creation)
2. Run manual cleanup: `backInStockJob.runImmediateCleanup()`
3. Check database doesn't have permission issues

### Issue: High check latency

**Symptoms**: Notifications delayed, database queries slow

**Solutions**:
1. Verify indexes created on BackInStockNotification:
   - medicineName
   - pharmacy
   - user
   - email
   - status+expiresAt
   - createdAt
2. Monitor database connection pool
3. Consider increasing cron check frequency if traffic grows

### Issue: Duplicate notifications

**Symptoms**: Users receive same notification multiple times

**Solutions**:
1. Check `notificationSentAt` is being updated
2. Verify `status: 'notified'` marking works
3. Check email service logs for bounce-backs

---

## Testing Checklist

- [ ] User can subscribe as anonymous (email only)
- [ ] User can subscribe as authenticated (auto-filled email)
- [ ] Subscription appears in "My Subscriptions"
- [ ] Can set optional max price limit
- [ ] Can cancel subscription
- [ ] Cron job runs every 4 hours
- [ ] Email sent when stock becomes available
- [ ] Subscription marked as 'notified' after email
- [ ] No duplicate emails sent
- [ ] Subscription expires after 90 days
- [ ] Service stats correctly aggregate data
- [ ] Error handling for invalid inputs
- [ ] Price limit filtering works correctly
- [ ] Multiple subscriptions for same user work
- [ ] Anonymous and authenticated subscriptions coexist

---

## Future Enhancements

1. **SMS Notifications** - Integrate Twilio or AWS SNS
2. **Push Notifications** - Firebase Cloud Messaging integration
3. **In-App Notifications** - Real-time WebSocket alerts
4. **AI Prediction** - Predict when stock will return
5. **Batch Notifications** - Combine multiple medicines in one email
6. **Preference Center** - User can manage frequency and channels
7. **Analytics** - Track notification effectiveness and ROI
8. **Retry Logic** - Auto-retry failed notifications
9. **Rate Limiting** - Prevent notification spam per user
10. **Localization** - Multi-language email templates

---

## Support

For issues or questions:
- Check logs in `/logs` directory
- Review database schema in `BackInStockNotification.js`
- Verify environment variables in `.env`
- Check API endpoints in `backInStockController.js`
- Review cron job configuration in `server.js`
