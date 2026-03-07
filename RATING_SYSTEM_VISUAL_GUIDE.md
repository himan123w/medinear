# 🎯 Pharmacy Rating System - Visual Guide & Architecture

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MediNear Frontend                        │
│                   (React + Axios)                           │
├─────────────────────────────────────────────────────────────┤
│  PharmacyRatingForm    │    RatingSummary                  │
│  ├─ Star Rating UI      │    ├─ Overall Rating Card       │
│  ├─ Comment Field       │    ├─ Category Bars             │
│  ├─ Submit/Delete       │    ├─ Distribution Charts       │
│  └─ Validation          │    └─ Recent Reviews            │
└────────────┬─────────┬──────────────┬──────────────────────┘
             │ HTTP   │              │ HTTP
             │ JSON   │              │ JSON
             ▼        ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                 MediNear Backend API                        │
│              (Node.js + Express)                            │
├─────────────────────────────────────────────────────────────┤
│  Rating Routes                Rating Controller            │
│  ├─ POST /submit         │   ├─ submitRating()           │
│  ├─ GET /pharmacy/:id    │   ├─ getPharmacyRatings()     │
│  ├─ GET /summary         │   ├─ getDist()                │
│  ├─ GET /top-rated       │   └─ deleteRating()           │
│  └─ DELETE /:id          │                                │
└────────────┬──────────────────────┬───────────────────────┘
             │  Mongoose ODM        │
             │  Query & Aggregate   │
             ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│           MongoDB Database                                  │
├─────────────────────────────────────────────────────────────┤
│  pharmacyratings Collection                                 │
│  ├─ pharmacy (ObjectId)                                    │
│  ├─ availabilityAccuracy (1-5)                            │
│  ├─ price (1-5)                                           │
│  ├─ behaviour (1-5)                                       │
│  ├─ overallRating (calculated)                            │
│  ├─ comment (text)                                        │
│  └─ timestamps                                            │
│                                                             │
│  Indexes:                                                  │
│  ├─ pharmacy (for quick lookup)                           │
│  └─ pharmacy + user (unique)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Rating Flow

```
User navigates to pharmacy
        │
        ▼
┌──────────────────────────┐
│  PharmacyRatingForm      │
│  Appears with empty form │
└────────┬─────────────────┘
         │ User clicks stars for:
         │ • Availability
         │ • Price
         │ • Behaviour
         │
         ▼
┌──────────────────────────┐
│  Optional: Add comment   │
│  (max 500 characters)    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Click "Submit Rating"   │
└────────┬─────────────────┘
         │ POST /api/rating/submit
         │ {
         │   pharmacyId: "...",
         │   availabilityAccuracy: 4,
         │   price: 5,
         │   behaviour: 3,
         │   comment: "..."
         │ }
         ▼
┌──────────────────────────┐
│ Backend Validation:      │
│ • Check ratings 1-5     │
│ • Verify pharmacy ID    │
│ • Check duplicate       │
└────────┬─────────────────┘
         │ If passes validation
         │
         ▼
┌──────────────────────────┐
│ Database Operations:      │
│ • Calculate overall      │
│ • Save rating            │
│ • Update indexes         │
└────────┬─────────────────┘
         │ Return rating data
         │
         ▼
┌──────────────────────────┐
│ Frontend Updates:         │
│ • Show success message   │
│ • Update user's badge    │
│ • Refresh summary        │
└────────┬─────────────────┘
         │
         ▼
  Rating Submitted! ✅
```

---

## 📈 Rating Summary Flow

```
User views pharmacy details
        │
        ▼
┌──────────────────────────┐
│ RatingSummary renders    │
│ Loads data from backend  │
└────────┬─────────────────┘
         │ GET /api/rating/pharmacy/:id
         │ GET /api/rating/pharmacy/:id/summary
         │ GET /api/rating/pharmacy/:id/distribution
         │
         ▼
┌──────────────────────────┐
│ Backend Aggregation:     │
│ • Calculate averages     │
│ • Count ratings          │
│ • Analyze distribution   │
└────────┬─────────────────┘
         │ Return aggregated data
         │
         ▼
┌──────────────────────────┐
│ Frontend Display:         │
│ • Overall rating card    │
│ • Progress bars          │
│ • Distribution charts    │
│ • Recent reviews         │
└────────┬─────────────────┘
         │
         ▼
    Summary Displayed! 📊
```

---

## 🏆 Top Pharmacies Flow

```
User visits home/dashboard
        │
        ▼
┌──────────────────────────┐
│ TopRatedPharmacies       │
│ Component loads          │
└────────┬─────────────────┘
         │ GET /api/rating/top-rated?limit=10
         │
         ▼
┌──────────────────────────────────────┐
│ Backend Aggregation:                 │
│ db.aggregate([                       │
│   {$group: {avgRating, totalRating}} │
│   {$sort: {avgRating: -1}}          │
│   {$limit: 10}                       │
│   {$lookup: {pharmacy details}}     │
│ ])                                   │
└────────┬─────────────────────────────┘
         │ Return top 10 pharmacies
         │
         ▼
┌──────────────────────────┐
│ Frontend Display:         │
│ • #1 badge              │
│ • Rank with star        │
│ • Rating breakdown      │
│ • View button           │
└────────┬─────────────────┘
         │
         ▼
   Top 10 Listed! 🏆
```

---

## 📱 Component Props Flow

```
┌─────────────────────────────────────────────────────────────┐
│            PharmacyRatingForm Component                     │
├─────────────────────────────────────────────────────────────┤
│  Props:                                                      │
│  ├─ pharmacyId (REQUIRED)                                  │
│  │   └─ string: MongoDB ObjectId                           │
│  ├─ pharmacyName (optional)                                │
│  │   └─ string: Displayed in form header                   │
│  ├─ userPhone (optional)                                   │
│  │   └─ string: Used to identify user                      │
│  └─ onRatingSubmitted (optional callback)                 │
│      └─ function(ratingData): Called after submit          │
│                                                              │
│  State Management:                                          │
│  ├─ availability (0-5)                                    │
│  ├─ price (0-5)                                           │
│  ├─ behaviour (0-5)                                       │
│  ├─ comment (string)                                      │
│  ├─ loading (boolean)                                     │
│  ├─ error (string)                                        │
│  ├─ success (string)                                      │
│  └─ showForm (boolean)                                    │
│                                                              │
│  API Calls:                                                 │
│  ├─ ratingAPI.getUserRating() - Check existing            │
│  └─ ratingAPI.submitRating() - Create/update              │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│             RatingSummary Component                         │
├─────────────────────────────────────────────────────────────┤
│  Props:                                                      │
│  ├─ pharmacyId (REQUIRED)                                  │
│  │   └─ string: MongoDB ObjectId                           │
│  └─ onLoadComplete (optional callback)                    │
│      └─ function(summaryData): Called after load           │
│                                                              │
│  State Management:                                          │
│  ├─ summary (object with averages)                        │
│  ├─ distribution (object with counts)                     │
│  ├─ loading (boolean)                                     │
│  ├─ error (string)                                        │
│  ├─ allRatings (array)                                    │
│  └─ showAllRatings (boolean for expand)                   │
│                                                              │
│  API Calls:                                                 │
│  ├─ ratingAPI.getPharmacyRatingSummary()                 │
│  ├─ ratingAPI.getRatingsDistribution()                   │
│  └─ ratingAPI.getPharmacyRatings()                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Component Breakdown

### PharmacyRatingForm Layout
```
┌─────────────────────────────────────────┐
│  ⭐ Rate This Pharmacy (Toggle Button)  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Rating Form (Hidden unless toggled)    │
├─────────────────────────────────────────┤
│  Rate Apollo Pharmacy                   │
│  Your feedback helps other customers   │
│                                          │
│  Availability Accuracy                  │
│  ★ ★ ★ ★ ☆  4/5                        │
│  (Select to change)                    │
│                                          │
│  Price                                  │
│  ★ ★ ★ ★ ★  5/5                        │
│                                          │
│  Staff Behaviour                        │
│  ★ ★ ★ ☆ ☆  3/5                        │
│                                          │
│  Additional Comments (Optional)         │
│  ┌─────────────────────────────────┐   │
│  │ Type your feedback...           │   │
│  │ Good prices but stock was      │   │
│  │ misreported                     │   │
│  │ 48/500                          │   │
│  └─────────────────────────────────┘   │
│                                          │
│  [✓ Submit Rating]   [Cancel]          │
│                                          │
│  Last updated: 2/27/2026               │
└─────────────────────────────────────────┘

Your Rating Badge (Shows if already rated):
┌─────────────────────────────────────┐
│         Your Rating                 │
│           4.0  ⭐                    │
└─────────────────────────────────────┘
```

### RatingSummary Layout
```
┌──────────────────────────────────────┐
│      Overall Pharmacy Rating         │
│                                      │
│         4.2                          │
│         /5    ★ ★ ★ ★ ☆             │
│                                      │
│    Based on 45 reviews              │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│     Category Ratings Breakdown       │
├──────────────────────────────────────┤
│ Availability Accuracy      4.2       │
│ ████████░░░░ 84%                   │
│ How accurate is info                 │
│                                      │
│ Price                      4.5       │
│ █████████░░░ 90%                   │
│ How fair are prices                  │
│                                      │
│ Staff Behaviour            3.8       │
│ ███████░░░░░ 76%                   │
│ Quality of service                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      Rating Distribution             │
├──────────────────────────────────────┤
│ Availability  Price  Behaviour      │
│   ███░         ███░     ██░         │
│   5*:12        5*:15    5*:10        │
│   ███░         ███░     ██░         │
│   4*:20        4*:18    4*:22        │
│   ░░░░         ░░░░     ░░░░        │
│   3*:8         3*:9     3*:10        │
│   ░░░░         ░░░░     ░░░░        │
│   2*:3         2*:2     2*:2         │
│   ░░░░         ░░░░     ░░░░        │
│   1*:2         1*:1     1*:1         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       Recent Ratings                 │
├──────────────────────────────────────┤
│ Show Less ▲                          │
│                                      │
│ John Doe          2/27/2026   4.5 ⭐ │
│ ├─ Availability: 5/5                │
│ ├─ Price: 4/5                       │
│ └─ Behaviour: 4/5                   │
│ "Great service, fast delivery"      │
│                                      │
│ Sarah Khan         2/26/2026   4.0 ⭐ │
│ ├─ Availability: 4/5                │
│ ├─ Price: 5/5                       │
│ └─ Behaviour: 3/5                   │
│ "Good prices but limited stock"     │
│                                      │
│ More reviews...                      │
└──────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
        User Input
            │
            ▼
    ┌──────────────┐
    │  Form State  │
    │  (1-5 stars) │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │   Validation     │
    │   • Range 1-5    │
    └──────┬───────────┘
           │ Valid
           ▼
    ┌──────────────────┐
    │  HTTP Request    │
    │  POST /submit    │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  Backend Logic   │
    │  • Validate      │
    │  • Check dupe    │
    │  • Calculate avg │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  MongoDB Save    │
    │  • Insert/update │
    │  • Index update  │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  Response Data   │
    │  • Rating obj    │
    │  • Success msg   │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  Frontend Update │
    │  • Show success  │
    │  • Update badge  │
    │  • Refresh total │
    └──────────────────┘
```

---

## 📊 Database Schema Visualization

```
PharmacyRating Document Structure:

{
  "_id": ObjectId("..."),           ← MongoDB Auto ID
  
  "pharmacy": ObjectId("..."),      ← Foreign Key
  "user": ObjectId("..."),          ← Optional FK
  "userPhone": "9876543210",        ← Required String
  "userName": "John Doe",           ← Optional String
  
  "availabilityAccuracy": 4,        ← 1-5 Required
  "price": 5,                       ← 1-5 Required
  "behaviour": 3,                   ← 1-5 Required
  
  "overallRating": 4.0,             ← Auto-Calculated
  "comment": "Great pharmacy...",   ← Optional String
  "reviewDate": ISODate("2026-02-27"),
  
  "createdAt": ISODate("2026-02-27"),
  "updatedAt": ISODate("2026-02-27")
}

Indexes:
├─ { pharmacy: 1, user: 1 } - Unique (Prevents duplicates)
├─ { pharmacy: 1 }          - For fast filtering
└─ { user: 1 }              - For user's ratings
```

---

## 🎯 API Request/Response Examples

### Example 1: Submit Rating
```
REQUEST:
POST /api/rating/submit
Content-Type: application/json

{
  "pharmacyId": "64a5f3b2c1d2e3f4g5h6i7j8",
  "availabilityAccuracy": 4,
  "price": 5,
  "behaviour": 3,
  "comment": "Great service!",
  "userPhone": "9876543210"
}

RESPONSE (201 Created):
{
  "message": "Rating submitted successfully",
  "rating": {
    "_id": "64b5f3b2c1d2e3f4g5h6i7j9",
    "pharmacy": "64a5f3b2c1d2e3f4g5h6i7j8",
    "availabilityAccuracy": 4,
    "price": 5,
    "behaviour": 3,
    "overallRating": 4,
    "comment": "Great service!",
    "createdAt": "2026-02-27T10:30:00Z"
  }
}
```

### Example 2: Get Summary
```
REQUEST:
GET /api/rating/pharmacy/64a5f3b2c1d2e3f4g5h6i7j8/summary

RESPONSE (200 OK):
{
  "avgAvailabilityAccuracy": 4.2,
  "avgPrice": 4.5,
  "avgBehaviour": 3.8,
  "avgOverallRating": 4.17,
  "totalRatings": 12,
  "lastRatedDate": "2026-02-27T10:30:00Z"
}
```

### Example 3: Get Top Pharmacies
```
REQUEST:
GET /api/rating/top-rated?limit=5

RESPONSE (200 OK):
[
  {
    "_id": "64a5f3b2c1d2e3f4g5h6i7j8",
    "avgRating": 4.5,
    "avgAvailability": 4.6,
    "avgPrice": 4.4,
    "avgBehaviour": 4.5,
    "totalRatings": 25,
    "pharmacyDetails": [
      {
        "_id": "64a5f3b2c1d2e3f4g5h6i7j8",
        "name": "Apollo Pharmacy",
        "address": "123 Main St",
        "phone": "555-0123"
      }
    ]
  }
]
```

---

## 🎊 Complete System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                 PHARMACY RATING SYSTEM                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Features:              Components:           Endpoints:        │
│   ✓ Star Rating          • Form UI            7 REST APIs        │
│   ✓ Comments             • Summary Stats      Full CRUD ops      │
│   ✓ Statistics           • Top Pharmacies     Aggregation        │
│   ✓ Distribution         • Distribution       Distribution       │
│   ✓ User Management      • Charts             Stats              │
│   ✓ No Duplicates        • Recent Reviews     Top Ranking        │
│   ✓ Responsive           • Loading States                        │
│   ✓ Secure               • Error Handling                        │
│                                                                   │
│   Database:              Security:            Performance:       │
│   • PharmacyRating       • User Ownership     • Indexed          │
│   • 3 indexes            • Rate Limiting      • Paginated        │
│   • Aggregation          • Validation         • Cached           │
│   • Timestamps           • Data Privacy       • Optimized        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

Perfect! This visual guide should help you understand the complete architecture and flow! 🎨
