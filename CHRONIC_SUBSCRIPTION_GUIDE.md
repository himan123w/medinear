# Chronic Patient Subscription System - Complete Guide

## Overview
The Medinear subscription system now has comprehensive support for chronic disease management with automatic monthly medicine delivery for Diabetes, Blood Pressure (BP), and Heart disease patients.

## Features

### 1. **Disease Types Supported**
- **Diabetes**: Type 1, Type 2, with varying severity levels
- **Blood Pressure (BP)**: Hypertension management with medication guidance
- **Heart Disease**: Cardiovascular disease management with complete care guidelines

### 2. **Severity Levels & Pricing**
Each disease has three severity levels with corresponding pricing:

#### Diabetes
- **Mild**: ₹499/month
- **Moderate**: ₹799/month
- **Severe**: ₹1,299/month

#### Blood Pressure (BP)
- **Mild**: ₹399/month
- **Moderate**: ₹699/month
- **Severe**: ₹1,099/month

#### Heart Disease
- **Mild**: ₹599/month
- **Moderate**: ₹999/month
- **Severe**: ₹1,499/month

### 3. **Automatic Medicine Recommendations**
The system automatically recommends medicines based on disease type and severity:

#### Diabetes Medications
- **Mild**: Metformin 500mg, Glibenclamide 5mg, Pioglitazone 15mg
- **Moderate**: Higher doses with insulin support
- **Severe**: Multiple insulin formulations with high-dose metformin

#### BP Medications
- **Mild**: Amlodipine 5mg, Lisinopril 10mg, Hydrochlorothiazide 12.5mg
- **Moderate**: Increased doses with combination therapy
- **Severe**: Multiple antihypertensive agents at high doses

#### Heart Disease Medications
- **Mild**: Aspirin 75mg, Atorvastatin 20mg, Ramipril 2.5mg
- **Moderate**: Higher doses with additional beta-blockers
- **Severe**: Comprehensive cardiac medication regimen

### 4. **Patient Information Collection**
The subscription process collects:
- **Medical Details**: Doctor name, hospital/clinic, diagnosis date
- **Health Metrics**: Blood pressure readings, blood sugar levels, lab test results
- **Medical History**: Previous diseases, allergies, last checkup date
- **Delivery Details**: Address, city, state, zip code
- **Contact Information**: Phone and email for notifications

### 5. **Delivery Frequency Options**
- **Monthly**: Default subscription with automatic renewal every month
- **Quarterly**: Delivery every 3 months for convenience
- **Half-Yearly**: Bulk delivery every 6 months with best savings

### 6. **Reminder System**
Patients can choose reminder frequency:
- **Before Delivery**: Reminder sent before each delivery
- **Daily**: Daily reminders for medication intake
- **Weekly**: Weekly reminders for health checkups

### 7. **Health Guidelines Included**
Each subscription provides personalized guidelines:

#### Do's & Don'ts
- Dietary recommendations (specific to disease)
- Exercises (type and duration)
- Monitoring frequency
- Precautions and lifestyle changes

#### Exercise Recommendations
- Specific exercise types suitable for each condition
- Recommended duration (e.g., 150 minutes per week)
- Detailed exercise routines
- Precautions to follow

#### Monitoring Schedule
- Blood sugar/BP check frequency
- Doctor visit schedule
- Lab test intervals
- Specialized tests (ECG, stress test for heart patients)

## API Endpoints

### Create Subscription
```
POST /api/subscription/create
```
**Request Body**:
```json
{
  "userId": "string",
  "phone": "string",
  "email": "string",
  "diseaseType": "diabetes|bp|heart",
  "severity": "mild|moderate|severe",
  "items": [
    {
      "name": "Medicine Name",
      "dosage": "500mg",
      "frequency": "once-daily|twice-daily|thrice-daily|as-needed",
      "notes": "After meals"
    }
  ],
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "frequency": "monthly|quarterly|half-yearly",
  "reminderFrequency": "daily|weekly|before-delivery",
  "patientDetails": {
    "disease": "diabetes|bp|heart",
    "severity": "mild|moderate|severe",
    "diagnosisDate": "date",
    "doctorName": "string",
    "hospitalName": "string"
  }
}
```

### Get User Subscriptions
```
GET /api/subscription/user/:userId
```

### Get Subscription by ID
```
GET /api/subscription/:id
```

### Pause Subscription
```
PUT /api/subscription/:id/pause
```

### Resume Subscription
```
PUT /api/subscription/:id/resume
```

### Cancel Subscription
```
PUT /api/subscription/:id/cancel
```

### Get Disease Recommendations
```
GET /api/subscription/disease/recommendations?disease=diabetes&severity=moderate
```

### Get All Disease Types
```
GET /api/subscription/disease/types
```

### Process Due Subscriptions (Admin)
```
GET /api/subscription/admin/process-due
```

## Frontend Pages

### 1. Subscription Creation Page (`/subscription`)
**3-Step Form**:
1. **Disease & Severity Selection**
   - Visual disease cards for Diabetes, BP, Heart
   - Severity selector (Mild, Moderate, Severe)
   - Real-time medicine recommendations preview

2. **Medical Details**
   - Doctor and hospital information
   - Medical history
   - Contact details
   - Health guidelines display

3. **Delivery & Payment**
   - Address information (city, state, zip)
   - Delivery frequency selection
   - Reminder frequency choice
   - Subscription summary with pricing
   - Payment method (Cash on Delivery)

### 2. Subscription List Page (`/subscription-list`)
**Features**:
- Grid view of all active/paused/cancelled subscriptions
- Subscription cards showing:
  - Disease type with icon and color coding
  - Patient phone and doctor name
  - Severity level badge
  - Monthly cost
  - Delivery frequency
  - Next delivery date with days remaining
  - Medicines list (expandable)
  - Total amount spent
- Quick actions:
  - View Details/Hide Details
  - Pause/Resume
  - Cancel
- Expandable details section with:
  - Delivery address
  - Subscription information
  - Link to full recommendations

## Backend Models

### Subscription Model
```javascript
{
  user: ObjectId,           // Reference to User
  phone: String,            // Contact phone
  email: String,            // Email address
  diseaseType: String,      // 'diabetes', 'bp', 'heart'
  patientDetails: {
    disease: String,
    severity: String,
    diagnosisDate: Date,
    doctorName: String,
    doctorPhone: String,
    hospitalName: String,
    medicalHistory: [String],
    allergies: [String],
    lastCheckupDate: Date,
    bloodPressureReading: { systolic, diastolic, recordDate },
    fastingBloodSugar: Number,
    postprandialBloodSugar: Number,
    lastLabTestDate: Date,
    labTestResults: String
  },
  items: [                  // Medicine items
    {
      medicineId: ObjectId,
      name: String,
      quantity: Number,
      dose: String,
      frequency: String,
      notes: String
    }
  ],
  address: String,
  city: String,
  state: String,
  zipCode: String,
  paymentMethod: String,    // 'cod', 'card', 'upi'
  monthlyPrice: Number,
  totalSpent: Number,
  status: String,           // 'active', 'paused', 'cancelled'
  autoRenew: Boolean,
  reminderFrequency: String,
  frequency: String,        // 'monthly', 'quarterly', 'half-yearly'
  nextDeliveryDate: Date,
  enrolledDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Utilities File (`utils/chronicDiseaseUtils.js`)

The utilities file provides:
- Medicine recommendations for each disease and severity
- Pricing information
- Dietary guidelines (do's and don'ts)
- Exercise recommendations
- Monitoring frequency guidelines
- Disease information and education

### Key Functions:
```javascript
getMedicineRecommendations(disease, severity)
getPrice(disease, severity)
getDietaryGuidelines(disease)
getExerciseRecommendations(disease)
getMonitoringFrequency(disease)
calculateNextDeliveryDate(frequency)
getDiseaseInfo(disease)
```

## User Journey

### 1. New Patient Registration
1. Visit `/subscription` page
2. Select disease type (Diabetes, BP, or Heart)
3. Choose severity level (Mild, Moderate, Severe)
4. View auto-recommended medicines
5. Enter medical and personal details
6. Provide delivery address
7. Select delivery and reminder frequency
8. Review subscription summary and pricing
9. Confirm subscription (Cash on Delivery)
10. Receive SMS confirmation with first delivery date

### 2. Active Subscription Management
1. View all subscriptions on `/subscription-list`
2. Check next delivery date
3. View medicines in subscription
4. Pause subscription temporarily if needed
5. Resume paused subscription anytime
6. Cancel subscription if needed
7. View detailed recommendations by clicking "View Details"

### 3. Automatic Delivery Process
1. System checks for due subscriptions daily
2. Creates automatic orders on delivery date
3. Sends SMS notification with order details
4. Updates next delivery date (monthly/quarterly/half-yearly)
5. Tracks total spending
6. Ensures auto-renewal (unless paused/cancelled)

## Notification System

### SMS Notifications
1. **Subscription Created**
   - Confirmation message
   - First delivery date
   - Monthly cost

2. **Before/During Delivery**
   - Order confirmation
   - Estimated delivery date
   - Delivery address

3. **Status Changes**
   - Pause confirmation
   - Resume confirmation
   - Cancellation confirmation

## Testing the System

### Initial Setup
1. Ensure MongoDB is running
2. Backend API running on `http://localhost:5001`
3. Frontend running on development server

### Test Scenarios
1. **Create Diabetes Subscription**
   - Disease: Diabetes
   - Severity: Moderate
   - Verify medicine recommendations show
   - Check pricing is ₹799/month
   - Complete subscription

2. **Create BP Subscription**
   - Disease: BP
   - Severity: Severe
   - Verify appropriate medications
   - Check pricing is ₹1,099/month

3. **Create Heart Disease Subscription**
   - Disease: Heart
   - Severity: Mild
   - Verify heart medications
   - Check pricing is ₹599/month

4. **Pause and Resume**
   - Create subscription
   - Pause it
   - Check status changes
   - Resume it
   - Verify status updates

5. **Auto-Delivery Process**
   - Create subscription
   - Modify next delivery date to past
   - Run process-due endpoint
   - Verify delivery order created
   - Check SMS sent

## Future Enhancements

1. **Lab Test Integration**: Track blood reports and test results
2. **Doctor Consultation**: Integrate telemedicine for online consultations
3. **Diet Plan**: Customized meal plans based on disease
4. **Fitness Tracking**: Integration with fitness apps for exercise tracking
5. **Insurance Integration**: Auto-claim processing for insured patients
6. **Refill Reminders**: Smart reminders based on medicine consumption
7. **Analytics Dashboard**: Patient health metrics and progress tracking
8. **Community Support**: Connect patients with same conditions

## Troubleshooting

### Issue: Medicine recommendations not showing
- **Solution**: Ensure chronic disease utils file is properly imported
- Check that disease type is valid (diabetes, bp, heart)

### Issue: SMS not sending
- **Solution**: Verify notification service configuration
- Check SMS service credentials
- Review notification service error logs

### Issue: Auto-delivery not triggering
- **Solution**: Ensure cron job or scheduled task is configured
- Check that subscription status is 'active'
- Verify nextDeliveryDate is in past

### Issue: Pricing not calculated correctly
- **Solution**: Confirm disease type and severity are valid
- Check chronicDiseaseUtils.js PRICING object
- Verify prices haven't been overridden elsewhere

## Support & Contact

For assistance with the subscription system, contact:
- **Email**: support@medinear.com
- **Phone**: +91-XXXXXXXXXX
- **Chat**: In-app chat support

---

**Version**: 1.0.0
**Last Updated**: February 2026
**Status**: Production Ready
