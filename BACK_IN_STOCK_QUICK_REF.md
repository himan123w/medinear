# Back-In-Stock Notifications - Quick Reference

## For Users

### How to Subscribe
1. Find a medicine that's **Out of Stock**
2. Click **🔔 Notify Me** button
3. Enter your email (auto-filled if logged in)
4. Optionally set **Max Price** limit
5. Click **Subscribe**
6. ✅ Done! You'll receive email when available

### What to Expect
- 📧 **Email notification** when medicine is back in stock
- ⏰ **Auto-expires** after 90 days if not notified
- 🚫 **No spam** - only notified once per subscription
- ✓ **Easy cancel** - unsubscribe anytime

### Manage Subscriptions
1. Go to **Account → My Subscriptions**
2. See all active subscriptions
3. Click **Unsubscribe** to cancel any time

---

## For Developers

### Quick Start API Testing

**1. Subscribe (Anonymous)**
```bash
curl -X POST http://localhost:5001/api/stock-notifications/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "medicineId": "642f1234567890abcdef1234",
    "medicineName": "Aspirin",
    "dosage": "500mg",
    "pharmacyId": "642f5678567890abcdef5678",
    "email": "user@example.com",
    "maxPriceLimit": 150,
    "notificationMethod": "email"
  }'
```

**2. Get My Subscriptions**
```bash
curl http://localhost:5001/api/stock-notifications/my?email=user@example.com
```

**3. Check Status**
```bash
curl "http://localhost:5001/api/stock-notifications/status?medicineId=642f1234567890abcdef1234&pharmacyId=642f5678567890abcdef5678&email=user@example.com"
```

**4. Cancel Subscription**
```bash
curl -X DELETE http://localhost:5001/api/stock-notifications/SUBSCRIPTION_ID/unsubscribe
```

**5. Get Stats (Auth Required)**
```bash
curl http://localhost:5001/api/stock-notifications/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Component Integration Example

```jsx
// In your medicine card component
import BackInStockButton from '../components/BackInStockButton';

export function MedicineCard({ medicine, pharmacy }) {
  // Show button only when out of stock
  if (!medicine.stock || medicine.stock === 0) {
    return (
      <div className="medicine-card">
        <h3>{medicine.name}</h3>
        <span className="badge-out-of-stock">Out of Stock</span>
        <BackInStockButton
          medicineId={medicine._id}
          medicineName={medicine.name}
          dosage={medicine.dosage}
          pharmacyId={pharmacy._id}
          pharmacyName={pharmacy.name}
          onSubscriptionSuccess={(notification) => {
            // Show success toast
            showToast(`Subscribed to ${medicine.name} notifications!`);
          }}
        />
      </div>
    );
  }

  return <div className="medicine-card">{/* ... */}</div>;
}
```

### Database Schema Quick View

```javascript
// BackInStockNotification fields:
{
  user: ObjectId,              // Authenticated user
  email: String,               // User/subscriber email
  medicine: ObjectId,          // Medicine reference
  medicineName: String,        // e.g., "Aspirin"
  dosage: String,              // e.g., "500mg"
  pharmacy: ObjectId,          // Pharmacy reference
  pharmacyName: String,        // e.g., "PharmacyCare"
  status: 'active|notified|cancelled|expired',
  notificationMethod: 'email|sms|push|in_app',
  maxPriceLimit: Number,       // Optional price threshold
  createdAt: Date,
  expiresAt: Date,             // Auto-expires 90 days later
  notificationSentAt: Date,
  checkCount: Integer          // How many times checked
}
```

### Cron Schedule

```
Every 4 hours: Check & notify (0 */4 * * *)
Daily at 2 AM: Clean expired (0 2 * * *)
```

### Environment Setup

```env
# .env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NODE_ENV=development
PORT=5001
```

### Monitoring Commands

```javascript
// In Node.js console/script:
const { runImmediateCheck, runImmediateCleanup } = require('./jobs/backInStockNotificationJob');

// Test notifications immediately
await runImmediateCheck();
// → Returns: { checked: N, notified: M, errors: 0 }

// Test cleanup immediately
await runImmediateCleanup();
// → Returns: { modifiedCount: N }
```

### Key Files

| File | Purpose |
|------|---------|
| `models/BackInStockNotification.js` | Database schema & queries |
| `controllers/backInStockController.js` | API endpoints |
| `services/backInStockNotificationService.js` | Business logic & email |
| `jobs/backInStockNotificationJob.js` | Cron jobs scheduler |
| `routes/backInStockRoutes.js` | Route configuration |
| `components/BackInStockButton.jsx` | React button component |
| `styles/BackInStockButton.css` | Component styling |

### Status Legends

- 🟢 `active` - Subscription waiting for stock
- 🟠 `notified` - User was notified, won't repeat
- 🔴 `cancelled` - User manually cancelled
- ⚫ `expired` - Auto-expired after 90 days

---

## Troubleshooting

### Email not sending?
- ✓ Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- ✓ Verify Gmail "Less secure app" enabled
- ✓ Check medicine stock is updated in database
- ✓ See server logs for error details

### Subscription not created?
- ✓ Verify `medicineId` and `pharmacyId` exist
- ✓ Check email format is valid
- ✓ Look for duplicate subscription error

### No notifications received?
- ✓ Check cron job is running (see server logs)
- ✓ Verify subscription `status: 'active'`
- ✓ Check medicine `stock > 0` in pharmacy
- ✓ Monitor `checkCount` and `lastCheckedAt` fields

### Too many emails?
- ✓ Subscription should only notify once (status → 'notified')
- ✓ Check for duplicate subscriptions
- ✓ Review `notificationSentAt` timestamp

---

## Quick Stats

```javascript
// Get overall service statistics
const stats = await BackInStockNotification.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
      notified: { $sum: { $cond: [{ $eq: ['$status', 'notified'] }, 1, 0] } }
    }
  }
]);

console.log(stats[0]);
// → { total: 152, active: 89, notified: 45 }
```

---

## Success Indicators

✅ Users can subscribe to notifications  
✅ Cron job runs every 4 hours  
✅ Emails sent when stock returns  
✅ Subscriptions expire after 90 days  
✅ No duplicate notifications sent  
✅ Database has proper indexes  
✅ Error handling works end-to-end  
✅ Anonymous & authenticated users both work  

---

## Next Steps

1. Integrate `BackInStockButton` into medicine cards
2. Update Home/Search pages to show button when `stock === 0`
3. Create user dashboard page to view subscriptions
4. Add notification bell badge for pending notifications
5. Test with real email account
6. Monitor analytics on notification effectiveness

---

For full docs, see: `BACK_IN_STOCK_NOTIFICATION_GUIDE.md`
