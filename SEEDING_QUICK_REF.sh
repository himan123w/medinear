#!/bin/bash

# Database Seeding Quick Reference Card

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════╗
║  🏥 MEDIНEAR - DATABASE SEEDING QUICK REFERENCE             ║
║  Version: 1.0 | Ready to Use                                 ║
╚═══════════════════════════════════════════════════════════════╝

📦 WHAT'S INCLUDED

Pharmacies (5):
  ✓ MediCare Pharmacy Delhi
  ✓ Apollo Pharmacy Mumbai
  ✓ HealthPlus Pharmacy Bangalore
  ✓ Life Pharmacy Hyderabad
  ✓ Care Pharmacy Kolkata

Medicines (27):
  ✓ Antibiotics (3)      - Amoxicillin, Azithromycin, Cephalexin
  ✓ Pain Relief (3)      - Paracetamol, Ibuprofen, Diclofenac
  ✓ Cold & Flu (3)       - Aspirin, Cough Syrup, Antihistamine
  ✓ Vitamins (3)         - B12, Multivitamin, D3
  ✓ Digestive (3)        - Omeprazole, Antacid, Probiotics
  ✓ Skin Care (3)        - Moisturizer, Face Wash, Sunscreen

───────────────────────────────────────────────────────────────

⚡ QUICK START

1. Make sure MongoDB is running
   macOS:   brew services start mongodb-community
   Linux:   sudo service mongod start

2. Run the seed script
   npm run seed

3. Verify data in API
   curl http://localhost:5001/api/medicine
   curl http://localhost:5001/api/pharmacy

───────────────────────────────────────────────────────────────

📋 COMMANDS

Seed Database:
  npm run seed          # Add sample data
  node seed-database.js # Alternative method

View Syntax:
  node -c seed-database.js

Full Setup:
  npm install           # Install dependencies
  npm run seed          # Seed database
  npm start             # Start server

───────────────────────────────────────────────────────────────

🔗 API ENDPOINTS TO TEST

Get All Medicines:
  curl http://localhost:5001/api/medicine

Get Medicines by Category:
  curl "http://localhost:5001/api/medicine?category=Antibiotics"

Get All Pharmacies:
  curl http://localhost:5001/api/pharmacy

List Categories:
  curl http://localhost:5001/api/medicine?limit=1000

───────────────────────────────────────────────────────────────

📊 DATA SUMMARY

Medicines by Category:
  Antibiotics   → 3 medicines (prescription required)
  Pain Relief   → 3 medicines (mix of OTC & prescription)
  Cold & Flu    → 3 medicines (mostly OTC)
  Vitamins      → 3 medicines (all OTC)
  Digestive     → 3 medicines (mix of OTC & prescription)
  Skin Care     → 3 medicines (all OTC)

Price Range:
  Lowest:  ₹25 (Paracetamol)
  Highest: ₹250 (Sunscreen)
  Average: ₹100

───────────────────────────────────────────────────────────────

✨ FILE CREATED

seed-database.js          ← Seeding script (syntax validated)
DATABASE_SEEDING_GUIDE.md ← Complete guide with examples

Update to package.json:
  "seed": "node seed-database.js"

───────────────────────────────────────────────────────────────

🚀 READY TO GO!

Your database seeding is 100% set up and ready to use.

Steps:
1. npm run seed
2. Check the output confirms all 5 pharmacies and 27 medicines
3. Test APIs to verify data was added
4. Build frontend and test with real data

Questions? Read: DATABASE_SEEDING_GUIDE.md

EOF
