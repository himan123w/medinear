/**
 * 🏥 MediNear - Database Seeding Script
 * Adds sample pharmacies and medicines to MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected for seeding');
  seedDatabase();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Sample Pharmacies Data
const samplePharmacies = [
  {
    name: 'MediCare Pharmacy Delhi',
    address: '123 MG Road, New Delhi',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110001',
    phone: '9876543210',
    email: 'delhi@medicaregroup.com',
    license: 'DL12345678',
    licenseExpiry: new Date('2026-12-31'),
    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false }
    },
    breakTime: {
      enabled: false
    },
    open24x7: false,
    temporarilyClosed: false,
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Delhi coordinates
    },
    owner: 'Rajesh Kumar',
    employees: 5,
    serviceArea: 5, // 5 km radius
    verified: true
  },
  {
    name: 'Apollo Pharmacy Mumbai',
    address: '456 Marine Drive, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400020',
    phone: '9876543211',
    email: 'mumbai@apollopharm.com',
    license: 'MH87654321',
    licenseExpiry: new Date('2027-06-30'),
    operatingHours: {
      monday: { open: '08:00', close: '23:00', closed: false },
      tuesday: { open: '08:00', close: '23:00', closed: false },
      wednesday: { open: '08:00', close: '23:00', closed: false },
      thursday: { open: '08:00', close: '23:00', closed: false },
      friday: { open: '08:00', close: '23:00', closed: false },
      saturday: { open: '08:00', close: '23:00', closed: false },
      sunday: { open: '08:00', close: '23:00', closed: false }
    },
    breakTime: {
      enabled: true,
      start: '14:00',
      end: '15:00'
    },
    open24x7: false,
    temporarilyClosed: false,
    location: {
      type: 'Point',
      coordinates: [72.8235, 19.0760] // Mumbai coordinates
    },
    owner: 'Priya Singh',
    employees: 8,
    serviceArea: 8,
    verified: true
  },
  {
    name: 'HealthPlus Pharmacy Bangalore',
    address: '789 Koramangala, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560034',
    phone: '9876543212',
    email: 'bangalore@healthplus.com',
    license: 'KA45678901',
    licenseExpiry: new Date('2026-09-15'),
    operatingHours: {
      monday: { open: '07:00', close: '21:00', closed: false },
      tuesday: { open: '07:00', close: '21:00', closed: false },
      wednesday: { open: '07:00', close: '21:00', closed: false },
      thursday: { open: '07:00', close: '21:00', closed: false },
      friday: { open: '07:00', close: '21:00', closed: false },
      saturday: { open: '07:00', close: '21:00', closed: false },
      sunday: { open: '07:00', close: '21:00', closed: false }
    },
    breakTime: {
      enabled: false
    },
    open24x7: false,
    temporarilyClosed: false,
    location: {
      type: 'Point',
      coordinates: [77.6245, 12.9352] // Bangalore coordinates
    },
    owner: 'Amit Desai',
    employees: 6,
    serviceArea: 6,
    verified: true
  },
  {
    name: 'Life Pharmacy Hyderabad',
    address: '321 Banjara Hills, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '500034',
    phone: '9876543213',
    email: 'hyderabad@lifepharm.com',
    license: 'TG23456789',
    licenseExpiry: new Date('2027-03-20'),
    operatingHours: {
      monday: { open: '00:00', close: '23:59', closed: false },
      tuesday: { open: '00:00', close: '23:59', closed: false },
      wednesday: { open: '00:00', close: '23:59', closed: false },
      thursday: { open: '00:00', close: '23:59', closed: false },
      friday: { open: '00:00', close: '23:59', closed: false },
      saturday: { open: '00:00', close: '23:59', closed: false },
      sunday: { open: '00:00', close: '23:59', closed: false }
    },
    breakTime: {
      enabled: false
    },
    open24x7: true,
    temporarilyClosed: false,
    location: {
      type: 'Point',
      coordinates: [78.4744, 17.3850] // Hyderabad coordinates
    },
    owner: 'Vikram Reddy',
    employees: 7,
    serviceArea: 7,
    verified: true
  },
  {
    name: 'Care Pharmacy Kolkata',
    address: '654 Park Street, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700016',
    phone: '9876543214',
    email: 'kolkata@carepharm.com',
    license: 'WB34567890',
    licenseExpiry: new Date('2026-11-10'),
    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    breakTime: {
      enabled: false
    },
    open24x7: false,
    temporarilyClosed: false,
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5431] // Kolkata coordinates
    },
    owner: 'Subhash Roy',
    employees: 4,
    serviceArea: 4,
    verified: true
  }
];

// Sample Medicines Data
const sampleMedicines = [
  // ANTIBIOTICS
  {
    name: 'Amoxicillin',
    strength: '500mg',
    category: 'Antibiotics',
    manufacturer: 'Glaxo SmithKline',
    packaging: 'Strip of 10 capsules',
    price: 45,
    stock: 500,
    expiryDate: new Date('2027-12-31'),
    saltName: 'Amoxicillin trihydrate',
    usage: 'Bacterial infections',
    sideEffects: 'Allergic reactions, nausea',
    prescription: true,
    discount: 5
  },
  {
    name: 'Azithromycin',
    strength: '250mg',
    category: 'Antibiotics',
    manufacturer: 'Cipla Ltd',
    packaging: 'Strip of 6 tablets',
    price: 60,
    stock: 300,
    expiryDate: new Date('2027-08-15'),
    saltName: 'Azithromycin dihydrate',
    usage: 'Respiratory infections',
    sideEffects: 'Diarrhea, abdominal pain',
    prescription: true,
    discount: 10
  },
  {
    name: 'Cephalexin',
    strength: '250mg',
    category: 'Antibiotics',
    manufacturer: 'Sun Pharmaceutical',
    packaging: 'Strip of 10 capsules',
    price: 55,
    stock: 250,
    expiryDate: new Date('2027-10-20'),
    saltName: 'Cephalexin monohydrate',
    usage: 'Skin and soft tissue infections',
    sideEffects: 'Rash, upset stomach',
    prescription: true,
    discount: 8
  },

  // PAIN RELIEF
  {
    name: 'Paracetamol',
    strength: '500mg',
    category: 'Pain Relief',
    manufacturer: 'Parke Davis',
    packaging: 'Strip of 15 tablets',
    price: 25,
    stock: 1000,
    expiryDate: new Date('2028-01-30'),
    saltName: 'Paracetamol',
    usage: 'Fever and mild pain',
    sideEffects: 'Liver damage (overdose)',
    prescription: false,
    discount: 0
  },
  {
    name: 'Ibuprofen',
    strength: '400mg',
    category: 'Pain Relief',
    manufacturer: 'Wyeth',
    packaging: 'Strip of 10 tablets',
    price: 35,
    stock: 600,
    expiryDate: new Date('2027-09-15'),
    saltName: 'Ibuprofen',
    usage: 'Pain relief and anti-inflammatory',
    sideEffects: 'Stomach upset, heartburn',
    prescription: false,
    discount: 5
  },
  {
    name: 'Diclofenac',
    strength: '50mg',
    category: 'Pain Relief',
    manufacturer: 'Novartis India',
    packaging: 'Strip of 10 tablets',
    price: 40,
    stock: 450,
    expiryDate: new Date('2027-11-20'),
    saltName: 'Diclofenac potassium',
    usage: 'Acute pain relief',
    sideEffects: 'Gastric irritation, dizziness',
    prescription: true,
    discount: 7
  },

  // COLD & FLU
  {
    name: 'Aspirin',
    strength: '325mg',
    category: 'Cold & Flu',
    manufacturer: 'Bayer',
    packaging: 'Strip of 15 tablets',
    price: 30,
    stock: 800,
    expiryDate: new Date('2028-02-28'),
    saltName: 'Acetylsalicylic acid',
    usage: 'Fever, cold, and pain',
    sideEffects: 'Stomach irritation, allergy',
    prescription: false,
    discount: 0
  },
  {
    name: 'Cough Syrup',
    strength: '100ml',
    category: 'Cold & Flu',
    manufacturer: 'Himalaya Wellness',
    packaging: 'Bottle of 100ml',
    price: 75,
    stock: 350,
    expiryDate: new Date('2027-07-10'),
    saltName: 'Dextromethorphan, Guaifenesin',
    usage: 'Cough and cold relief',
    sideEffects: 'Drowsiness, dizziness',
    prescription: false,
    discount: 12
  },
  {
    name: 'Antihistamine Tablet',
    strength: '10mg',
    category: 'Cold & Flu',
    manufacturer: 'Alembic Pharmaceuticals',
    packaging: 'Strip of 10 tablets',
    price: 45,
    stock: 400,
    expiryDate: new Date('2027-12-15'),
    saltName: 'Cetirizine hydrochloride',
    usage: 'Allergy and cold relief',
    sideEffects: 'Drowsiness, dry mouth',
    prescription: false,
    discount: 10
  },

  // VITAMINS
  {
    name: 'Vitamin B12',
    strength: '1000mcg',
    category: 'Vitamins',
    manufacturer: 'Ayurvet',
    packaging: 'Strip of 10 tablets',
    price: 120,
    stock: 250,
    expiryDate: new Date('2028-06-30'),
    saltName: 'Cyanocobalamin',
    usage: 'B12 deficiency treatment',
    sideEffects: 'Rare, mild rash',
    prescription: false,
    discount: 15
  },
  {
    name: 'Multivitamin',
    strength: 'Multi-mineral complex',
    category: 'Vitamins',
    manufacturer: 'Naturals by Essence',
    packaging: 'Bottle of 30 tablets',
    price: 180,
    stock: 500,
    expiryDate: new Date('2028-03-15'),
    saltName: 'Vitamin A, B, C, D, E + minerals',
    usage: 'Daily nutrition supplement',
    sideEffects: 'Nausea if taken on empty stomach',
    prescription: false,
    discount: 20
  },
  {
    name: 'Vitamin D3',
    strength: '60000 IU',
    category: 'Vitamins',
    manufacturer: 'Inlife Pharma',
    packaging: 'Strip of 4 capsules',
    price: 150,
    stock: 600,
    expiryDate: new Date('2027-10-31'),
    saltName: 'Cholecalciferol',
    usage: 'Calcium absorption and bone health',
    sideEffects: 'Kidney damage (overdose)',
    prescription: false,
    discount: 10
  },

  // DIGESTIVE
  {
    name: 'Omeprazole',
    strength: '20mg',
    category: 'Digestive',
    manufacturer: 'Ranbaxy Laboratories',
    packaging: 'Strip of 10 capsules',
    price: 85,
    stock: 400,
    expiryDate: new Date('2027-09-20'),
    saltName: 'Omeprazole',
    usage: 'Acid reflux and GERD',
    sideEffects: 'Headache, diarrhea',
    prescription: true,
    discount: 12
  },
  {
    name: 'Antacid Tablet',
    strength: '500mg',
    category: 'Digestive',
    manufacturer: 'Pfizer',
    packaging: 'Strip of 15 tablets',
    price: 40,
    stock: 700,
    expiryDate: new Date('2028-01-15'),
    saltName: 'Magnesium trisilicate, Aluminum hydroxide',
    usage: 'Heartburn and indigestion',
    sideEffects: 'Constipation or diarrhea',
    prescription: false,
    discount: 5
  },
  {
    name: 'Probiotics',
    strength: 'Multi-strain blend',
    category: 'Digestive',
    manufacturer: 'Bifilac',
    packaging: 'Strip of 10 capsules',
    price: 125,
    stock: 300,
    expiryDate: new Date('2027-08-30'),
    saltName: 'Lactobacillus + Bifidobacterium',
    usage: 'Gut health and digestion',
    sideEffects: 'Minimal, occasional bloating',
    prescription: false,
    discount: 18
  },

  // SKIN CARE
  {
    name: 'Moisturizing Cream',
    strength: '100ml',
    category: 'Skin Care',
    manufacturer: 'Cetaphil',
    packaging: 'Tube of 100ml',
    price: 200,
    stock: 200,
    expiryDate: new Date('2028-05-20'),
    saltName: 'Glycerin, Petrolatum',
    usage: 'Dry skin treatment',
    sideEffects: 'Rare, mild irritation',
    prescription: false,
    discount: 15
  },
  {
    name: 'Anti-Acne Face Wash',
    strength: '200ml',
    category: 'Skin Care',
    manufacturer: 'Clean & Clear',
    packaging: 'Bottle of 200ml',
    price: 150,
    stock: 350,
    expiryDate: new Date('2027-11-25'),
    saltName: 'Salicylic acid',
    usage: 'Acne and pimple treatment',
    sideEffects: 'Dryness, peeling',
    prescription: false,
    discount: 10
  },
  {
    name: 'Sunscreen SPF 50',
    strength: '50ml',
    category: 'Skin Care',
    manufacturer: 'Neutrogena',
    packaging: 'Tube of 50ml',
    price: 250,
    stock: 280,
    expiryDate: new Date('2028-04-10'),
    saltName: 'Zinc oxide, Titanium dioxide',
    usage: 'UV protection',
    sideEffects: 'White cast on skin',
    prescription: false,
    discount: 12
  }
];

// Seeding function
async function seedDatabase() {
  try {
    console.log('\n🔄 Starting database seeding...\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Add pharmacies
    console.log('Adding pharmacies...');
    const pharmacies = await Pharmacy.insertMany(samplePharmacies);
    console.log(`✅ Added ${pharmacies.length} pharmacies\n`);

    pharmacies.forEach(p => {
      console.log(`   • ${p.name} (${p.city})`);
    });

    // Add medicines with pharmacy associations
    console.log('\nAdding medicines...');
    const pharmacyIds = pharmacies.map(p => p._id);
    
    // Associate each medicine with a random pharmacy
    const medicinesWithPharmacy = sampleMedicines.map((med, index) => ({
      ...med,
      pharmacy: pharmacyIds[index % pharmacyIds.length]
    }));
    
    const medicines = await Medicine.insertMany(medicinesWithPharmacy);
    console.log(`✅ Added ${medicines.length} medicines\n`);

    // Group medicines by category
    const categories = {};
    medicines.forEach(m => {
      if (!categories[m.category]) {
        categories[m.category] = [];
      }
      categories[m.category].push(m.name);
    });

    // Display summary
    console.log('📊 Medicines by Category:');
    Object.entries(categories).forEach(([category, names]) => {
      console.log(`\n   ${category} (${names.length}):`);
      names.forEach(name => {
        console.log(`     • ${name}`);
      });
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\n📈 Summary:`);
    console.log(`   Pharmacies: ${pharmacies.length}`);
    console.log(`   Medicines: ${medicines.length}`);
    console.log(`   Categories: ${Object.keys(categories).length}`);
    console.log('\n🚀 Your database is ready with sample data!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  }
}
