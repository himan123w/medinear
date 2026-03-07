# Chronic Subscription System - Visual Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Patient)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            ┌─────────────────────────────────────┐
            │    FRONTEND (React/Vite)            │
            ├─────────────────────────────────────┤
            │  📄 Subscription.jsx                 │
            │  - 3-Step Form                      │
            │  - Disease Selection                │
            │  - Medical Details                  │
            │  - Delivery Config                  │
            │                                      │
            │  📋 SubscriptionList.jsx             │
            │  - View Subscriptions               │
            │  - Manage Subscriptions             │
            │  - View Recommendations             │
            └─────────────────────────────────────┘
                     ↓                  ↓
              API Call        Display & Updates
                     ↓                  ↓
            ┌─────────────────────────────────────┐
            │    API Client (api.js)               │
            │  - subscriptionAPI methods           │
            └─────────────────────────────────────┘
                              ↓
                    HTTP/REST API Calls
                              ↓
            ┌─────────────────────────────────────┐
            │    BACKEND (Node.js/Express)        │
            ├─────────────────────────────────────┤
            │  🔀 Routes (subscriptionRoutes.js)   │
            │  - POST /create                     │
            │  - GET /user/:userId                │
            │  - GET /:id                         │
            │  - PUT /:id/pause                   │
            │  - PUT /:id/resume                  │
            │  - PUT /:id/cancel                  │
            │  - GET /disease/recommendations     │
            │  - GET /disease/types               │
            │  - GET /admin/process-due           │
            │                                      │
            │  🎮 Controller                      │
            │  (subscriptionController.js)        │
            │  - Business Logic                   │
            │  - Data Processing                  │
            │  - Recommendations                  │
            │  - Notifications                    │
            │                                      │
            │  📚 Utilities                       │
            │  (chronicDiseaseUtils.js)           │
            │  - Medicines Data                   │
            │  - Pricing                          │
            │  - Guidelines                       │
            │  - Health Info                      │
            └─────────────────────────────────────┘
                     ↓              ↓
                 Database      Notifications
                     ↓              ↓
            ┌─────────────────────────────────────┐
            │    MongoDB (Data Storage)            │
            ├─────────────────────────────────────┤
            │  📊 Collections:                     │
            │  - Subscriptions                    │
            │  - Users                            │
            │  - Deliveries                       │
            │  - Pharmacies                       │
            └─────────────────────────────────────┘
                              ↑
                   SMS Service + Email Service
                   (notificationService.js)
```

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PATIENT JOURNEY MAP                           │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: ENROLLMENT
┌────────────────────────────────────────────────────────────────┐
│ 1. VISIT SUBSCRIPTION PAGE                                      │
│    Navigate to /subscription                                   │
│                   ↓                                             │
│ 2. SELECT DISEASE (Step 1)                                     │
│    Choose: Diabetes / BP / Heart                              │
│    ┌─────────────┬────────┬──────────┐                        │
│    │  Diabetes   │   BP   │  Heart   │                        │
│    └─────────────┴────────┴──────────┘                        │
│                   ↓                                             │
│ 3. SELECT SEVERITY (Step 1)                                    │
│    ┌──────────────────────────────────┐                       │
│    │ ○ Mild      ₹399-599/month       │                       │
│    │ ⦿ Moderate  ₹699-799/month       │                       │
│    │ ○ Severe    ₹1099-1299/month     │                       │
│    └──────────────────────────────────┘                       │
│                   ↓                                             │
│ 4. VIEW RECOMMENDATIONS (Step 1)                               │
│    System shows:                                              │
│    ✓ Medicines list                                           │
│    ✓ Dosages & frequencies                                    │
│    ✓ Price calculation                                        │
│                   ↓                                             │
│ 5. ENTER MEDICAL INFO (Step 2)                                 │
│    - Doctor name & hospital                                   │
│    - Diagnosis date                                           │
│    - Phone & email                                            │
│                   ↓                                             │
│ 6. VIEW HEALTH GUIDELINES (Step 2)                             │
│    Display:                                                   │
│    ✓ Diet recommendations (Do's & Don'ts)                     │
│    ✓ Exercise guidelines                                      │
│    ✓ Monitoring frequency                                     │
│                   ↓                                             │
│ 7. DELIVERY ADDRESS (Step 3)                                   │
│    - Street address                                           │
│    - City, State, Zip                                         │
│                   ↓                                             │
│ 8. SELECT DELIVERY FREQUENCY (Step 3)                          │
│    ┌────────────────────────────────┐                        │
│    │ ⦿ Monthly                      │                        │
│    │ ○ Quarterly (3 months)         │                        │
│    │ ○ Half-Yearly (6 months)       │                        │
│    └────────────────────────────────┘                        │
│                   ↓                                             │
│ 9. SELECT REMINDER (Step 3)                                    │
│    ⦿ Before Delivery / ○ Daily / ○ Weekly                     │
│                   ↓                                             │
│ 10. REVIEW SUMMARY (Step 3)                                    │
│    ✓ Disease & Severity                                       │
│    ✓ Monthly Cost                                             │
│    ✓ Frequency                                                │
│    ✓ Payment: Cash on Delivery                                │
│                   ↓                                             │
│ 11. SUBSCRIBE CONFIRMATION                                     │
│    ✓ Subscription created                                     │
│    ✓ SMS sent with details                                    │
│    ✓ Redirected to subscription list                          │
└────────────────────────────────────────────────────────────────┘

PHASE 2: ACTIVE SUBSCRIPTION
┌────────────────────────────────────────────────────────────────┐
│ VIEW SUBSCRIPTION LIST (/subscription-list)                    │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ SUBSCRIPTION CARD                                          │ │
│ │ ┌──────────────────────────────────────────────────────┐  │ │
│ │ │ 🩺 Diabetes                           ✓ Active      │  │ │
│ │ ├──────────────────────────────────────────────────────┤  │ │
│ │ │ Phone: 9876543210                                   │  │ │
│ │ │ Doctor: Dr. Smith                                   │  │ │
│ │ │ Severity: Moderate                                  │  │ │
│ │ │ Cost: ₹799/month                                    │  │ │
│ │ │ Next Delivery: Mar 15 (in 5 days)                   │  │ │
│ │ │ Medicines: Metformin... +2 more                     │  │ │
│ │ │ Total Spent: ₹2,397                                 │  │ │
│ │ ├──────────────────────────────────────────────────────┤  │ │
│ │ │ [▼ View Details] [⏸ Pause] [✕ Cancel]              │  │ │
│ │ │                                                      │  │ │
│ │ │ EXPANDED DETAILS:                                  │  │ │
│ │ │ Address: 123 Street Rd...                           │  │ │
│ │ │ Auto-Renew: ✓ Enabled                              │  │ │
│ │ │ Enrolled: Jan 15, 2026                             │  │ │
│ │ │ → View Full Details & Recommendations              │  │ │
│ │ └──────────────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ ACTIONS AVAILABLE:                                            │
│ ✓ Pause: Temporarily stop deliveries                         │
│ ✓ Resume: When paused, restart deliveries                    │
│ ✓ Cancel: Permanently stop subscription                      │
│ ✓ View Full Details: See recommendations & guidelines         │
└────────────────────────────────────────────────────────────────┘

PHASE 3: AUTO-DELIVERY PROCESSING
┌────────────────────────────────────────────────────────────────┐
│ BACKGROUND PROCESS (Daily/Scheduled)                          │
│                                                                │
│ 1. Check for due subscriptions                               │
│    WHERE: status='active' AND nextDeliveryDate <= NOW()      │
│                   ↓                                            │
│ 2. For each due subscription:                                │
│    - Create delivery order from medicines                    │
│    - Set status to 'confirmed'                               │
│    - Calculate delivery charge                               │
│                   ↓                                            │
│ 3. Update subscription:                                       │
│    - Add amount to totalSpent                                │
│    - Calculate next delivery date                            │
│                   ↓                                            │
│ 4. Send notifications:                                        │
│    📱 SMS to patient with:                                    │
│    "Your monthly Diabetes medicines order [ID] confirmed.    │
│     Estimated delivery: Mar 20, 2026"                        │
│                   ↓                                            │
│ 5. Create delivery record in Delivery collection              │
│    - Link to Subscription                                    │
│    - Link to Pharmacy                                        │
│    - Track status                                            │
└────────────────────────────────────────────────────────────────┘
```

## Data Model Relationships

```
┌────────────────────────────────────────────────────────────────┐
│                    DATA RELATIONSHIPS                           │
└────────────────────────────────────────────────────────────────┘

USER
│
├─→ Subscription (1:Many)
│   │
│   ├─ Medicines (Array embedded)
│   │  ├─ name: String
│   │  ├─ dosage: String
│   │  ├─ frequency: "once-daily"|"twice-daily"|"thrice-daily"|"as-needed"
│   │  └─ notes: String
│   │
│   ├─ PatientDetails (Embedded Object)
│   │  ├─ disease: "diabetes"|"bp"|"heart"
│   │  ├─ severity: "mild"|"moderate"|"severe"
│   │  ├─ doctorName: String
│   │  ├─ hospitalName: String
│   │  ├─ bloodPressureReading: { systolic, diastolic, recordDate }
│   │  ├─ fastingBloodSugar: Number
│   │  ├─ allergies: [String]
│   │  └─ medicalHistory: [String]
│   │
│   ├─ status: "active"|"paused"|"cancelled"
│   ├─ nextDeliveryDate: Date
│   ├─ monthlyPrice: Number
│   ├─ totalSpent: Number
│   ├─ frequency: "monthly"|"quarterly"|"half-yearly"
│   ├─ reminderFrequency: "daily"|"weekly"|"before-delivery"
│   ├─ address: String
│   ├─ city: String
│   ├─ state: String
│   ├─ zipCode: String
│   │
│   └─→ Delivery (1:Many) [Created automatically]
│       ├─ orderId: String
│       ├─ status: "confirmed"|"in-transit"|"delivered"
│       ├─ items: [Medicines from subscription]
│       ├─ totalAmount: Number
│       ├─ pharmacy: Reference to Pharmacy
│       ├─ estimatedDeliveryTime: Number
│       └─ statusHistory: [Status updates]

┌────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION STATES                          │
└────────────────────────────────────────────────────────────────┘

              ┌─────────────────┐
              │   NEW (form)    │
              └────────┬────────┘
                       │ Submit
                       ↓
              ┌─────────────────┐
         ┌───→│    ACTIVE       │◄───┐
         │    └────────┬────────┘    │
         │             │ Pause       │ Resume
         │             ↓             │
         │    ┌─────────────────┐    │
         ├────│    PAUSED       │────┘
         │    └────────┬────────┘
         │             │ Cancel
         │             ↓
         │    ┌─────────────────┐
         └───→│  CANCELLED      │
              └─────────────────┘
              (Non-reversible)
```

## Database Collections

```
┌────────────────────────────────────────────────────────────────┐
│                  MONGODB COLLECTIONS                           │
└────────────────────────────────────────────────────────────────┘

SUBSCRIPTIONS Collection
├─ _id: ObjectId
├─ user: ObjectId → Users
├─ phone: String (indexed)
├─ email: String
├─ diseaseType: String (indexed) - "diabetes", "bp", "heart"
├─ patientDetails: {
│  ├─ disease: String
│  ├─ severity: String - "mild", "moderate", "severe"
│  ├─ diagnosisDate: Date
│  ├─ doctorName: String
│  ├─ doctorPhone: String
│  ├─ hospitalName: String
│  ├─ medicalHistory: [String]
│  ├─ allergies: [String]
│  ├─ lastCheckupDate: Date
│  ├─ bloodPressureReading: {
│  │  ├─ systolic: Number
│  │  ├─ diastolic: Number
│  │  └─ recordDate: Date
│  ├─ fastingBloodSugar: Number
│  ├─ postprandialBloodSugar: Number
│  ├─ lastLabTestDate: Date
│  └─ labTestResults: String
├─ items: [{
│  ├─ medicineId: ObjectId
│  ├─ name: String
│  ├─ quantity: Number
│  ├─ dose: String
│  ├─ frequency: String
│  └─ notes: String
│  }]
├─ address: String
├─ city: String
├─ state: String
├─ zipCode: String
├─ paymentMethod: String - "cod", "card", "upi"
├─ monthlyPrice: Number
├─ totalSpent: Number
├─ status: String (indexed) - "active", "paused", "cancelled"
├─ autoRenew: Boolean
├─ reminderFrequency: String - "daily", "weekly", "before-delivery"
├─ frequency: String - "monthly", "quarterly", "half-yearly"
├─ nextDeliveryDate: Date (indexed)
├─ enrolledDate: Date
├─ createdAt: Date
└─ updatedAt: Date

DELIVERIES Collection
├─ _id: ObjectId
├─ orderId: String
├─ orderType: String
├─ pharmacy: ObjectId → Pharmacies
├─ customer: ObjectId → Users
├─ customerPhone: String
├─ customerName: String
├─ pickupLocation: { address, latitude, longitude, location, pickupTime }
├─ deliveryLocation: { address, latitude, longitude, location, instructions }
├─ items: [{ name, quantity, price }]
├─ orderAmount: Number
├─ deliveryCharge: Number
├─ totalAmount: Number
├─ deliveryType: String - "scheduled", "emergency"
├─ estimatedDeliveryTime: Number (minutes)
├─ status: String - "confirmed", "in-transit", "delivered"
├─ statusHistory: [{ status, timestamp, notes }]
├─ createdAt: Date
└─ updatedAt: Date
```

## API Response Flow

```
Request: POST /api/subscription/create
┌─────────────────────────────────────────────────────────────┐
│ REQUEST BODY                                                │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "userId": "user123",                                     │
│   "diseaseType": "diabetes",                               │
│   "severity": "moderate",                                  │
│   "phone": "9876543210",                                   │
│   "address": "123 Street Rd",                              │
│   "frequency": "monthly",                                  │
│   ...                                                       │
│ }                                                           │
└──────────┬──────────────────────────────────────────────────┘
           │
    Processing Steps:
    1. Validate inputs
    2. Get recommendations from chronicDiseaseUtils
    3. Calculate price: 799 (moderate diabetes)
    4. Create subscription document
    5. Save to MongoDB
    6. Send SMS: "Subscription created. First delivery: Mar 15"
           │
           ↓
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE (Success 200)                                      │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "success": true,                                          │
│   "subscription": {                                         │
│     "_id": "sub_123",                                       │
│     "userId": "user123",                                    │
│     "diseaseType": "diabetes",                              │
│     "status": "active",                                     │
│     "monthlyPrice": 799,                                    │
│     "nextDeliveryDate": "2026-03-15T00:00:00Z",           │
│     "items": [                                              │
│       {                                                     │
│         "name": "Metformin",                                │
│         "dosage": "1000mg",                                │
│         "frequency": "twice-daily",                        │
│         "notes": "After meals"                             │
│       },                                                    │
│       ...                                                   │
│     ],                                                      │
│     "patientDetails": { ... },                              │
│     ...                                                     │
│   },                                                        │
│   "recommendations": {                                      │
│     "medicines": [...],                                    │
│     "diet": {                                              │
│       "do": ["Eat whole grains...", ...],                 │
│       "avoid": ["Sugary drinks...", ...]                  │
│     },                                                     │
│     "exercise": {                                          │
│       "type": "Aerobic + Strength",                        │
│       "duration": "150 minutes/week",                      │
│       "details": [...]                                     │
│     },                                                     │
│     "monitoring": {                                        │
│       "bloodSugarCheck": "Daily",                          │
│       "doctorVisit": "Every 3 months",                     │
│       "labTest": "Every 6 months (HbA1c)"                 │
│     }                                                      │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Notification System

```
┌────────────────────────────────────────────────────────────────┐
│              NOTIFICATION FLOW DIAGRAM                          │
└────────────────────────────────────────────────────────────────┘

SUBSCRIPTION EVENT          NOTIFICATION SERVICE       OUTPUT
─────────────────           ──────────────────         ──────

1. Subscription         
   Created          →  sendSMS() function       →  📱 SMS to patient
                       with message template       "Subscription created.
                                                    First delivery: [date]
                                                    Cost: ₹[amount]/month"

2. Delivery 
   Confirmed        →  sendSMS() function       →  📱 SMS to patient
                       with order details         "Order [ID] confirmed.
                                                    Est. delivery: [date]"

3. Subscription
   Paused           →  sendSMS() function       →  📱 SMS to patient
                       with pause message        "Subscription paused.
                                                    Resume anytime."

4. Subscription
   Resumed          →  sendSMS() function       →  📱 SMS to patient
                       with resume message       "Subscription active.
                                                    Next delivery: [date]"

5. Subscription
   Cancelled        →  sendSMS() function       →  📱 SMS to patient
                       with cancellation msg    "Subscription cancelled."

┌────────────────────────────────────────────────────────────────┐
│              MESSAGE TEMPLATES                                  │
└────────────────────────────────────────────────────────────────┘

SUBSCRIPTION CREATED:
"Welcome to Medinear Chronic Care! Your [DISEASE] subscription 
 confirmed. Monthly cost: ₹[PRICE]. First delivery: [DATE]"

DELIVERY CONFIRMED:
"Your monthly [DISEASE] medicines order [ORDER_ID] confirmed.
 Estimated delivery: [DATE]. Track status in app."

PAUSED:
"Your Medinear [DISEASE] subscription has been paused. 
 You can resume anytime from the app."

RESUMED:
"Your Medinear [DISEASE] subscription is now active.
 Next delivery: [DATE]"

CANCELLED:
"Your Medinear subscription for [DISEASE] has been cancelled."
```

---

**Version**: 1.0.0
**Created**: February 2026
**Status**: Complete & Documented
