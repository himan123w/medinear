# 🏥 MediNear - Database Seeding Guide

## Quick Start

Your MediNear database seeding script is ready! This will populate your MongoDB with realistic pharmacy and medicine data.

---

## What Gets Added

### 📍 5 Sample Pharmacies
```
1. MediCare Pharmacy Delhi - Delhi
2. Apollo Pharmacy Mumbai - Mumbai
3. HealthPlus Pharmacy Bangalore - Bangalore
4. Life Pharmacy Hyderabad - Hyderabad
5. Care Pharmacy Kolkata - Kolkata
```

### 💊 27 Sample Medicines (6 Categories)

**Antibiotics** (3 medicines):
- Amoxicillin 500mg ₹45
- Azithromycin 250mg ₹60
- Cephalexin 250mg ₹55

**Pain Relief** (3 medicines):
- Paracetamol 500mg ₹25
- Ibuprofen 400mg ₹35
- Diclofenac 50mg ₹40

**Cold & Flu** (3 medicines):
- Aspirin 325mg ₹30
- Cough Syrup 100ml ₹75
- Antihistamine 10mg ₹45

**Vitamins** (3 medicines):
- Vitamin B12 1000mcg ₹120
- Multivitamin ₹180
- Vitamin D3 60000 IU ₹150

**Digestive** (3 medicines):
- Omeprazole 20mg ₹85
- Antacid 500mg ₹40
- Probiotics Multi-strain ₹125

**Skin Care** (3 medicines):
- Moisturizing Cream 100ml ₹200
- Anti-Acne Face Wash 200ml ₹150
- Sunscreen SPF 50 50ml ₹250

---

## How to Use

### Prerequisites
Make sure your MongoDB is running:

**Option 1: Local MongoDB**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo service mongod start

# Windows
net start MongoDB
```

**Option 2: MongoDB Atlas Cloud**
- Ensure `MONGO_URI` is set in your `.env` file
- Example: `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medinear`

### Run the Seeding Script

```bash
# Method 1: Using npm script
npm run seed

# Method 2: Direct node command
node seed-database.js
```

### Expected Output

```
✅ MongoDB connected for seeding

🔄 Starting database seeding...

Clearing existing data...
✅ Existing data cleared

Adding pharmacies...
✅ Added 5 pharmacies

   • MediCare Pharmacy Delhi (Delhi)
   • Apollo Pharmacy Mumbai (Mumbai)
   • HealthPlus Pharmacy Bangalore (Bangalore)
   • Life Pharmacy Hyderabad (Hyderabad)
   • Care Pharmacy Kolkata (Kolkata)

Adding medicines...
✅ Added 27 medicines

📊 Medicines by Category:

   Antibiotics (3):
     • Amoxicillin
     • Azithromycin
     • Cephalexin

   Pain Relief (3):
     • Paracetamol
     • Ibuprofen
     • Diclofenac

   Cold & Flu (3):
     • Aspirin
     • Cough Syrup
     • Antihistamine Tablet

   Vitamins (3):
     • Vitamin B12
     • Multivitamin
     • Vitamin D3

   Digestive (3):
     • Omeprazole
     • Antacid Tablet
     • Probiotics

   Skin Care (3):
     • Moisturizing Cream
     • Anti-Acne Face Wash
     • Sunscreen SPF 50

============================================================
✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!
============================================================

📈 Summary:
   Pharmacies: 5
   Medicines: 27
   Categories: 6

🚀 Your database is ready with sample data!
```

---

## Accessing the Data via API

Once your server is running, you can access the seeded data:

### Get All Medicines
```bash
curl http://localhost:5001/api/medicine
```

### Get Medicines by Category
```bash
curl "http://localhost:5001/api/medicine?category=Antibiotics"
```

### Get All Pharmacies
```bash
curl http://localhost:5001/api/pharmacy
```

### Get Pharmacy Details
```bash
curl http://localhost:5001/api/pharmacy/{pharmacyId}
```

---

## Database Fields Included

### Pharmacy Fields
```
- name
- address, city, state, zipCode
- phone, email
- license, licenseExpiry
- operatingHours (open, close time)
- location (geolocation coordinates)
- owner name
- employees count
- serviceArea (radius in km)
- verified status
```

### Medicine Fields
```
- name
- strength (dosage)
- category
- manufacturer
- packaging (quantity & type)
- price
- stock quantity
- expiryDate
- saltName (active ingredient)
- usage (purpose)
- sideEffects
- prescription required (yes/no)
- discount percentage
```

---

## Running the Full Setup

```bash
# 1. Install dependencies
npm install

# 2. Ensure MongoDB is running
# (local or Atlas)

# 3. Seed the database
npm run seed

# 4. Start the backend server
npm start

# 5. In another terminal, build frontend
npm run build

# 6. Verify everything works
curl http://localhost:5001/api/health
```

---

## Tips & Tricks

### Seed Many Times
The script automatically clears old data before seeding, so you can run it multiple times without duplicates.

```bash
npm run seed    # ✅ Safe to run multiple times
```

### Add Custom Data
Edit `seed-database.js` to add your own pharmacies and medicines:

```javascript
const samplePharmacies = [
  {
    name: 'Your Pharmacy Name',
    address: 'Your Address',
    // ... other fields
  },
  // Add more...
];
```

Then run:
```bash
npm run seed
```

### Check Seeded Data in MongoDB

**Using MongoDB CLI:**
```bash
mongo
use medinear
db.pharmacies.find().pretty()
db.medicines.find().pretty()
```

**Using MongoDB Compass (GUI):**
1. Open MongoDB Compass
2. Connect to your MongoDB instance
3. Browse `medinear` database
4. View `pharmacies` and `medicines` collections

---

## Troubleshooting

### "Cannot find module" Error
```bash
# Solution: Install dependencies
npm install
```

### "MongoDB connection error"
```bash
# Check if MongoDB is running
# macOS: brew services list
# Linux: sudo service mongod status

# Or update MONGO_URI in .env file
MONGO_URI=mongodb://localhost:27017/medinear
```

### "Port 27017 in use"
```bash
# MongoDB already running on different port
# Either stop it or update MONGO_URI to correct port
```

### Need to Clear Data Without Seeding
```bash
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.collection('pharmacies').deleteMany({});
  await mongoose.connection.collection('medicines').deleteMany({});
  console.log('✅ Data cleared');
  process.exit(0);
});
"
```

---

## What's Next

1. **Frontend Testing**: Use the seeded data to test your React UI
2. **API Testing**: Test all endpoints with real data
3. **Search Features**: Try searching for medicines by category
4. **Location-based**: Test geolocation-based pharmacy search
5. **Custom Data**: Add your own pharmacies and medicines

---

## Notes

- All prices are in Indian Rupees (₹)
- Pharmacies use real city coordinates
- Medicines include realistic information (manufacturer, usage, side effects)
- Some medicines require prescription, others don't
- Stock quantities are realistic
- Expiry dates are 1-2 years in the future

---

**Happy seeding! 🎉**

Your MediNear platform now has realistic data to test with!
