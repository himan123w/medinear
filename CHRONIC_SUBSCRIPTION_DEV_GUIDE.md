# Chronic Disease Subscription - Developer Quick Reference

## File Structure

```
medinear/
├── models/
│   └── Subscription.js                    # Updated subscription model with chronic disease support
├── controllers/
│   └── subscriptionController.js          # Enhanced controller with new endpoints
├── routes/
│   └── subscriptionRoutes.js              # Updated routes
├── utils/
│   └── chronicDiseaseUtils.js             # NEW: Chronic disease management utilities
├── medinear-frontend/
│   └── src/
│       ├── api.js                         # Updated with new API methods
│       └── pages/
│           ├── Subscription.jsx           # Enhanced form (3-step)
│           ├── Subscription.css           # Complete styling
│           ├── SubscriptionList.jsx       # Enhanced list view
│           └── SubscriptionList.css       # Complete styling
└── CHRONIC_SUBSCRIPTION_GUIDE.md          # NEW: Complete documentation
```

## Quick API Reference

### Backend Routes

```javascript
// Create subscription
POST /api/subscription/create

// Get user subscriptions
GET /api/subscription/user/:userId

// Get subscription details
GET /api/subscription/:id

// Update subscription
PUT /api/subscription/:id

// Pause subscription
PUT /api/subscription/:id/pause

// Resume subscription
PUT /api/subscription/:id/resume

// Cancel subscription
PUT /api/subscription/:id/cancel

// Get disease recommendations
GET /api/subscription/disease/recommendations?disease=diabetes&severity=moderate

// Get disease types
GET /api/subscription/disease/types

// Process due subscriptions (admin)
GET /api/subscription/admin/process-due
```

## Chronic Disease Utilities Usage

### Import
```javascript
const chronicDiseaseUtils = require('../utils/chronicDiseaseUtils');
```

### Get Medicine Recommendations
```javascript
const medicines = chronicDiseaseUtils.getMedicineRecommendations('diabetes', 'moderate');
// Returns array of medicine objects with dosage, frequency, notes
```

### Calculate Monthly Price
```javascript
const price = chronicDiseaseUtils.getPrice('bp', 'severe');
// Returns ₹1,099

// All pricing:
// diabetes: { mild: 499, moderate: 799, severe: 1299 }
// bp: { mild: 399, moderate: 699, severe: 1099 }
// heart: { mild: 599, moderate: 999, severe: 1499 }
```

### Get Dietary Guidelines
```javascript
const guidelines = chronicDiseaseUtils.getDietaryGuidelines('diabetes');
// Returns { do: [...], avoid: [...] }
```

### Get Exercise Recommendations
```javascript
const exercise = chronicDiseaseUtils.getExerciseRecommendations('heart');
// Returns { type, duration, details: [...] }
```

### Get Monitoring Frequency
```javascript
const monitoring = chronicDiseaseUtils.getMonitoringFrequency('bp');
// Returns monitoring schedules for checkups and tests
```

### Calculate Next Delivery Date
```javascript
const nextDate = chronicDiseaseUtils.calculateNextDeliveryDate('quarterly');
// Returns Date object 3 months from now
```

### Get Disease Information
```javascript
const info = chronicDiseaseUtils.getDiseaseInfo('heart');
// Returns disease name, description, types, complications, prevention
```

## Frontend API Methods

### Import
```javascript
import { subscriptionAPI } from '../api';
```

### Create Subscription
```javascript
const response = await subscriptionAPI.createSubscription({
  userId: 'user123',
  phone: '9876543210',
  email: 'user@email.com',
  diseaseType: 'diabetes',
  severity: 'moderate',
  items: [{
    name: 'Metformin',
    dosage: '1000mg',
    frequency: 'twice-daily',
    notes: 'After meals'
  }],
  address: 'Street Address',
  city: 'City',
  state: 'State',
  zipCode: '12345',
  frequency: 'monthly',
  reminderFrequency: 'before-delivery',
  patientDetails: {
    disease: 'diabetes',
    severity: 'moderate',
    diagnosisDate: '2023-01-15',
    doctorName: 'Dr. Smith',
    hospitalName: 'City Hospital'
  }
});
```

### Get User Subscriptions
```javascript
const response = await subscriptionAPI.getUserSubscriptions(userId);
// Returns array of subscription objects
```

### Pause/Resume/Cancel
```javascript
// Pause
await subscriptionAPI.pauseSubscription(subscriptionId);

// Resume
await subscriptionAPI.resumeSubscription(subscriptionId);

// Cancel
await subscriptionAPI.cancelSubscription(subscriptionId);
```

### Get Disease Recommendations
```javascript
const response = await subscriptionAPI.getDiseaseRecommendations('diabetes', 'moderate');
// Returns:
// {
//   disease: 'diabetes',
//   severity: 'moderate',
//   medicines: [...],
//   diet: { do: [...], avoid: [...] },
//   exercise: { type, duration, details },
//   monitoring: { ... },
//   diseaseInfo: { ... },
//   monthlyPrice: 799
// }
```

## Key Changes Made

### 1. Model Enhancements
- Added `ChronicPatientDetailsSchema` for detailed medical information
- Added `frequency` options (monthly, quarterly, half-yearly)
- Added `monthlyPrice`, `totalSpent` tracking
- Added `reminderFrequency` configuration
- Added `city`, `state`, `zipCode` for better address management
- Added `email` field for email notifications

### 2. Controller Enhancements
- `createSubscription`: Auto-calculates price, generates recommendations
- `pauseSubscription`: New endpoint for pausing
- `resumeSubscription`: New endpoint for resuming
- `getSubscriptionById`: Get with recommendations
- `getDiseaseRecommendations`: Full disease guidance
- `getDiseaseTypes`: Get all supported diseases
- Enhanced `processDueSubscriptions`: Tracks spending, handles multiple frequencies

### 3. Frontend Enhancements
- **3-Step Form**: Better UX with progress tracking
- **Disease Selection**: Visual cards for each disease
- **Severity Options**: Radio buttons with pricing
- **Medical Details**: Comprehensive patient information
- **Guidelines Display**: Real-time health recommendations
- **Payment Summary**: Clear pricing breakdown

### 4. Styling Improvements
- Modern gradient design
- Responsive grid layouts
- Card-based UI with proper spacing
- Smooth animations and transitions
- Mobile-friendly breakpoints

## Integration Steps

### Backend Integration
1. Replace `Subscription.js` model with updated version
2. Replace `subscriptionController.js` with enhanced controller
3. Add `utils/chronicDiseaseUtils.js` (create utils directory if needed)
4. Update `routes/subscriptionRoutes.js`
5. Test all endpoints with Postman or similar tool

### Frontend Integration
1. Update `api.js` with new API methods
2. Replace `Subscription.jsx` and `SubscriptionList.jsx` components
3. Replace CSS files with new styling
4. Ensure you have proper routing configured
5. Test the 3-step form flow

### Environment Setup
```
# Backend
MONGO_URI=mongodb://localhost:27017/medinear
API_PORT=5001

# Frontend
VITE_API_URL=http://localhost:5001/api
```

## Testing Checklist

- [ ] Create subscription with diabetes/moderate
- [ ] Create subscription with bp/severe
- [ ] Create subscription with heart/mild
- [ ] Verify medicine recommendations appear
- [ ] Verify pricing calculation
- [ ] View subscription list
- [ ] Pause and resume subscription
- [ ] Cancel subscription
- [ ] Check SMS notifications (requires SMS service)
- [ ] Test auto-delivery processing
- [ ] Verify all form validations
- [ ] Test responsive design on mobile

## Common Customizations

### Change Prices
```javascript
// In chronicDiseaseUtils.js
const PRICING = {
  diabetes: {
    mild: 599,        // Change from 499
    moderate: 899,    // Change from 799
    severe: 1399      // Change from 1299
  },
  // ... other diseases
};
```

### Add New Medicines
```javascript
// In chronicDiseaseUtils.js
const MEDICINE_RECOMMENDATIONS = {
  diabetes: {
    moderate: [
      { name: 'New Medicine', dosage: '500mg', frequency: 'once-daily', notes: 'After meals' },
      // ... existing medicines
    ]
  }
};
```

### Update Guidelines
```javascript
// In chronicDiseaseUtils.js
const DIETARY_GUIDELINES = {
  diabetes: {
    do: [
      'New guideline here',
      // ... existing guidelines
    ]
  }
};
```

### Change Delivery Frequencies
```javascript
// In Subscription.jsx
const frequency: String, enum: ['monthly', 'bi-monthly', 'quarterly', 'half-yearly']
```

## Performance Considerations

1. **Database Indexing**: Create indexes on:
   - `user` field
   - `status` field
   - `nextDeliveryDate` field
   - `diseaseType` field

2. **Caching**: Cache disease recommendations to reduce computation

3. **Batch Processing**: Process due subscriptions in batches

4. **Pagination**: Implement pagination for subscription lists

## Security Considerations

1. **Authentication**: Ensure auth middleware is applied to routes
2. **Authorization**: Verify users can only access their own subscriptions
3. **Validation**: Always validate disease type and severity values
4. **Rate Limiting**: Implement rate limiting on subscription creation
5. **Data Encryption**: Encrypt medical information before storage

## Monitoring & Maintenance

1. **Track Auto-Deliveries**: Monitor success rate of automated orders
2. **Error Logging**: Log all subscription processing errors
3. **SMS Failures**: Track failed SMS notifications
4. **User Analytics**: Monitor subscription completion rates
5. **Revenue Tracking**: Monitor total subscription revenue

## Support Resources

- **Documentation**: See `CHRONIC_SUBSCRIPTION_GUIDE.md`
- **Database Models**: Check `models/Subscription.js`
- **API Examples**: Check routes and controllers
- **Frontend Components**: Check React component implementations

---

**Last Updated**: February 2026
**Status**: Ready for Production
