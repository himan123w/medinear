/**
 * 🏥 MediNear - Add More Sample Data
 * Populates the database with additional realistic data
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');
const User = require('./models/User');
const Prescription = require('./models/Prescription');
const Reservation = require('./models/Reservation');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected for adding data');
  addMoreData();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Additional Pharmacies
const additionalPharmacies = [
  {
    name: 'MedPlus Pharmacy Pune',
    address: '789 FC Road, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411004',
    phone: '9876543215',
    email: 'pune@medplus.com',
    license: 'MH98765432',
    licenseExpiry: new Date('2027-05-15'),
    operatingHours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '21:00', closed: false }
    },
    breakTime: { enabled: false },
    open24x7: false,
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204]
    },
    owner: 'Suresh Patil',
    employees: 6,
    serviceArea: 5,
    verified: true
  },
  {
    name: 'HealthCare Pharmacy Chennai',
    address: '456 Anna Salai, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zipCode: '600002',
    phone: '9876543216',
    email: 'chennai@healthcare.com',
    license: 'TN12349876',
    licenseExpiry: new Date('2027-08-20'),
    operatingHours: {
      monday: { open: '07:00', close: '23:00', closed: false },
      tuesday: { open: '07:00', close: '23:00', closed: false },
      wednesday: { open: '07:00', close: '23:00', closed: false },
      thursday: { open: '07:00', close: '23:00', closed: false },
      friday: { open: '07:00', close: '23:00', closed: false },
      saturday: { open: '07:00', close: '23:00', closed: false },
      sunday: { open: '07:00', close: '23:00', closed: false }
    },
    breakTime: { enabled: true, start: '13:00', end: '14:00' },
    open24x7: false,
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827]
    },
    owner: 'Lakshmi Narayanan',
    employees: 9,
    serviceArea: 7,
    verified: true
  },
  {
    name: 'QuickMed Pharmacy Jaipur',
    address: '123 MI Road, Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    zipCode: '302001',
    phone: '9876543217',
    email: 'jaipur@quickmed.com',
    license: 'RJ56789012',
    licenseExpiry: new Date('2026-12-10'),
    operatingHours: {
      monday: { open: '00:00', close: '23:59', closed: false },
      tuesday: { open: '00:00', close: '23:59', closed: false },
      wednesday: { open: '00:00', close: '23:59', closed: false },
      thursday: { open: '00:00', close: '23:59', closed: false },
      friday: { open: '00:00', close: '23:59', closed: false },
      saturday: { open: '00:00', close: '23:59', closed: false },
      sunday: { open: '00:00', close: '23:59', closed: false }
    },
    breakTime: { enabled: false },
    open24x7: true,
    location: {
      type: 'Point',
      coordinates: [75.7873, 26.9124]
    },
    owner: 'Rahul Sharma',
    employees: 8,
    serviceArea: 10,
    verified: true
  },
  {
    name: 'WellCare Pharmacy Ahmedabad',
    address: '567 CG Road, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zipCode: '380009',
    phone: '9876543218',
    email: 'ahmedabad@wellcare.com',
    license: 'GJ34567890',
    licenseExpiry: new Date('2027-04-25'),
    operatingHours: {
      monday: { open: '08:30', close: '21:30', closed: false },
      tuesday: { open: '08:30', close: '21:30', closed: false },
      wednesday: { open: '08:30', close: '21:30', closed: false },
      thursday: { open: '08:30', close: '21:30', closed: false },
      friday: { open: '08:30', close: '21:30', closed: false },
      saturday: { open: '08:30', close: '21:30', closed: false },
      sunday: { open: '09:00', close: '20:00', closed: false }
    },
    breakTime: { enabled: false },
    open24x7: false,
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225]
    },
    owner: 'Meera Patel',
    employees: 5,
    serviceArea: 6,
    verified: true
  },
  {
    name: 'PharmaPlus Lucknow',
    address: '890 Hazratganj, Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    zipCode: '226001',
    phone: '9876543219',
    email: 'lucknow@pharmaplus.com',
    license: 'UP78901234',
    licenseExpiry: new Date('2027-01-30'),
    operatingHours: {
      monday: { open: '09:00', close: '21:00', closed: false },
      tuesday: { open: '09:00', close: '21:00', closed: false },
      wednesday: { open: '09:00', close: '21:00', closed: false },
      thursday: { open: '09:00', close: '21:00', closed: false },
      friday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '09:00', close: '21:00', closed: false },
      sunday: { open: '10:00', close: '19:00', closed: false }
    },
    breakTime: { enabled: true, start: '14:00', end: '15:00' },
    open24x7: false,
    location: {
      type: 'Point',
      coordinates: [80.9462, 26.8467]
    },
    owner: 'Ajay Singh',
    employees: 4,
    serviceArea: 5,
    verified: true
  }
];

// Additional Medicines (using valid categories)
const additionalMedicines = [
  // More Antibiotics
  {
    name: 'Ciprofloxacin',
    strength: '500mg',
    category: 'Antibiotics',
    manufacturer: 'Ranbaxy',
    packaging: 'Strip of 10 tablets',
    price: 75,
    stock: 300,
    expiryDate: new Date('2027-11-30'),
    saltName: 'Ciprofloxacin hydrochloride',
    usage: 'Bacterial infections, UTI',
    sideEffects: 'Nausea, diarrhea',
    prescription: true,
    discount: 10
  },
  {
    name: 'Doxycycline',
    strength: '100mg',
    category: 'Antibiotics',
    manufacturer: 'Cipla Ltd',
    packaging: 'Strip of 10 capsules',
    price: 85,
    stock: 200,
    expiryDate: new Date('2027-09-15'),
    saltName: 'Doxycycline hyclate',
    usage: 'Bacterial infections, acne',
    sideEffects: 'Stomach upset, photosensitivity',
    prescription: true,
    discount: 8
  },
  {
    name: 'Levofloxacin',
    strength: '500mg',
    category: 'Antibiotics',
    manufacturer: 'Sun Pharmaceutical',
    packaging: 'Strip of 5 tablets',
    price: 120,
    stock: 180,
    expiryDate: new Date('2027-12-20'),
    saltName: 'Levofloxacin',
    usage: 'Respiratory infections',
    sideEffects: 'Dizziness, headache',
    prescription: true,
    discount: 12
  },
  // More Pain Relief
  {
    name: 'Naproxen',
    strength: '250mg',
    category: 'Pain Relief',
    manufacturer: 'Alkem Laboratories',
    packaging: 'Strip of 10 tablets',
    price: 55,
    stock: 250,
    expiryDate: new Date('2027-08-25'),
    saltName: 'Naproxen sodium',
    usage: 'Pain, inflammation, arthritis',
    sideEffects: 'Stomach upset, heartburn',
    prescription: true,
    discount: 5
  },
  {
    name: 'Tramadol',
    strength: '50mg',
    category: 'Pain Relief',
    manufacturer: 'Lupin',
    packaging: 'Strip of 15 tablets',
    price: 95,
    stock: 150,
    expiryDate: new Date('2027-10-10'),
    saltName: 'Tramadol hydrochloride',
    usage: 'Moderate to severe pain',
    sideEffects: 'Drowsiness, constipation',
    prescription: true,
    discount: 0
  },
  {
    name: 'Acetaminophen Extended Release',
    strength: '650mg',
    category: 'Pain Relief',
    manufacturer: 'Johnson & Johnson',
    packaging: 'Strip of 20 tablets',
    price: 68,
    stock: 320,
    expiryDate: new Date('2027-11-15'),
    saltName: 'Acetaminophen',
    usage: 'Pain relief, fever',
    sideEffects: 'Rare allergic reactions',
    prescription: false,
    discount: 10
  },
  // More Cold & Flu
  {
    name: 'Decongestant Nasal Spray',
    strength: '0.05%',
    category: 'Cold & Flu',
    manufacturer: 'GlaxoSmithKline',
    packaging: '15ml spray bottle',
    price: 145,
    stock: 180,
    expiryDate: new Date('2027-07-15'),
    saltName: 'Oxymetazoline',
    usage: 'Nasal congestion',
    sideEffects: 'Nasal dryness, rebound congestion',
    prescription: false,
    discount: 15
  },
  {
    name: 'Throat Lozenges',
    strength: '5mg',
    category: 'Cold & Flu',
    manufacturer: 'Strepsils',
    packaging: 'Pack of 24 lozenges',
    price: 85,
    stock: 220,
    expiryDate: new Date('2027-06-30'),
    saltName: 'Amylmetacresol + Dichlorobenzyl alcohol',
    usage: 'Sore throat relief',
    sideEffects: 'Mild mouth irritation',
    prescription: false,
    discount: 10
  },
  {
    name: 'Expectorant Syrup',
    strength: '100ml',
    category: 'Cold & Flu',
    manufacturer: 'Dr. Reddy\'s',
    packaging: '100ml bottle',
    price: 125,
    stock: 160,
    expiryDate: new Date('2027-09-20'),
    saltName: 'Guaifenesin',
    usage: 'Chest congestion, mucus relief',
    sideEffects: 'Nausea, drowsiness',
    prescription: false,
    discount: 8
  },
  // More Vitamins
  {
    name: 'Vitamin C',
    strength: '1000mg',
    category: 'Vitamins',
    manufacturer: 'HealthKart',
    packaging: 'Bottle of 60 tablets',
    price: 180,
    stock: 200,
    expiryDate: new Date('2028-01-15'),
    saltName: 'Ascorbic acid',
    usage: 'Immunity boost, antioxidant',
    sideEffects: 'Stomach upset in high doses',
    prescription: false,
    discount: 20
  },
  {
    name: 'Iron + Folic Acid',
    strength: '100mg + 0.5mg',
    category: 'Vitamins',
    manufacturer: 'Abbott',
    packaging: 'Bottle of 30 tablets',
    price: 150,
    stock: 180,
    expiryDate: new Date('2028-02-10'),
    saltName: 'Ferrous sulfate + Folic acid',
    usage: 'Anemia prevention',
    sideEffects: 'Constipation, dark stools',
    prescription: false,
    discount: 15
  },
  {
    name: 'Calcium Magnesium Zinc',
    strength: 'Multi-mineral',
    category: 'Vitamins',
    manufacturer: 'Nutrilite',
    packaging: 'Bottle of 90 tablets',
    price: 350,
    stock: 120,
    expiryDate: new Date('2028-03-10'),
    saltName: 'Calcium + Magnesium + Zinc',
    usage: 'Bone and muscle health',
    sideEffects: 'Mild stomach upset',
    prescription: false,
    discount: 25
  },
  // More Digestive
  {
    name: 'Ranitidine',
    strength: '150mg',
    category: 'Digestive',
    manufacturer: 'Torrent Pharmaceuticals',
    packaging: 'Strip of 15 tablets',
    price: 78,
    stock: 280,
    expiryDate: new Date('2027-11-05'),
    saltName: 'Ranitidine hydrochloride',
    usage: 'Acid reflux, heartburn',
    sideEffects: 'Headache, constipation',
    prescription: false,
    discount: 8
  },
  {
    name: 'Digestive Enzyme',
    strength: 'Multi-enzyme',
    category: 'Digestive',
    manufacturer: 'Himalaya',
    packaging: 'Bottle of 60 capsules',
    price: 220,
    stock: 150,
    expiryDate: new Date('2028-01-20'),
    saltName: 'Pancreatin + Pepsin',
    usage: 'Digestion support',
    sideEffects: 'Rare allergic reactions',
    prescription: false,
    discount: 12
  },
  {
    name: 'Anti-Gas Tablets',
    strength: '125mg',
    category: 'Digestive',
    manufacturer: 'Abbott',
    packaging: 'Strip of 10 tablets',
    price: 45,
    stock: 300,
    expiryDate: new Date('2027-10-25'),
    saltName: 'Simethicone',
    usage: 'Gas relief, bloating',
    sideEffects: 'None reported',
    prescription: false,
    discount: 5
  },
  // More Skin Care
  {
    name: 'Antifungal Cream',
    strength: '1%',
    category: 'Skin Care',
    manufacturer: 'Cipla',
    packaging: '15g tube',
    price: 95,
    stock: 180,
    expiryDate: new Date('2027-08-30'),
    saltName: 'Clotrimazole',
    usage: 'Fungal infections',
    sideEffects: 'Mild skin irritation',
    prescription: false,
    discount: 0
  },
  {
    name: 'Hydrocortisone Cream',
    strength: '1%',
    category: 'Skin Care',
    manufacturer: 'GlaxoSmithKline',
    packaging: '10g tube',
    price: 125,
    stock: 140,
    expiryDate: new Date('2027-05-30'),
    saltName: 'Hydrocortisone',
    usage: 'Skin inflammation, rashes',
    sideEffects: 'Skin thinning if overused',
    prescription: false,
    discount: 0
  },
  {
    name: 'Antiseptic Ointment',
    strength: '10g',
    category: 'Skin Care',
    manufacturer: 'Johnson & Johnson',
    packaging: '10g tube',
    price: 55,
    stock: 250,
    expiryDate: new Date('2028-02-15'),
    saltName: 'Neomycin + Polymyxin B',
    usage: 'Minor cuts, wounds',
    sideEffects: 'Rare allergic reactions',
    prescription: false,
    discount: 0
  },
  // Other Category medicines
  {
    name: 'Atorvastatin (Cardiovascular)',
    strength: '10mg',
    category: 'Other',
    manufacturer: 'Pfizer',
    packaging: 'Strip of 10 tablets',
    price: 85,
    stock: 300,
    expiryDate: new Date('2027-11-30'),
    saltName: 'Atorvastatin calcium',
    usage: 'High cholesterol',
    sideEffects: 'Muscle pain',
    prescription: true,
    discount: 10
  },
  {
    name: 'Metformin (Diabetes)',
    strength: '500mg',
    category: 'Other',
    manufacturer: 'Sun Pharmaceutical',
    packaging: 'Strip of 20 tablets',
    price: 65,
    stock: 400,
    expiryDate: new Date('2027-12-20'),
    saltName: 'Metformin hydrochloride',
    usage: 'Type 2 diabetes',
    sideEffects: 'Nausea, diarrhea',
    prescription: true,
    discount: 12
  },
  {
    name: 'Eye Drops - Refresh Tears',
    strength: '0.5%',
    category: 'Other',
    manufacturer: 'Allergan',
    packaging: '10ml bottle',
    price: 155,
    stock: 140,
    expiryDate: new Date('2027-05-30'),
    saltName: 'Carboxymethylcellulose',
    usage: 'Dry eyes',
    sideEffects: 'Temporary blurred vision',
    prescription: false,
    discount: 0
  },
  {
    name: 'First Aid Antiseptic',
    strength: '10%',
    category: 'Other',
    manufacturer: 'Win-Medicare',
    packaging: '100ml bottle',
    price: 68,
    stock: 200,
    expiryDate: new Date('2028-02-15'),
    saltName: 'Povidone-iodine',
    usage: 'Wound antiseptic',
    sideEffects: 'Skin irritation',
    prescription: false,
    discount: 0
  }
];

// Additional Users
const additionalUsers = [
  {
    name: 'Riya Verma',
    email: 'riya.verma@example.com',
    password: 'user123',
    role: 'user',
    phone: '9123456780'
  },
  {
    name: 'Arjun Kapoor',
    email: 'arjun.kapoor@example.com',
    password: 'user123',
    role: 'user',
    phone: '9123456781'
  },
  {
    name: 'Sneha Mehta',
    email: 'sneha.mehta@example.com',
    password: 'user123',
    role: 'user',
    phone: '9123456782'
  },
  {
    name: 'Vikram Rao',
    email: 'vikram.rao@example.com',
    password: 'user123',
    role: 'user',
    phone: '9123456783'
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    password: 'user123',
    role: 'user',
    phone: '9123456784'
  }
];

async function addMoreData() {
  try {
    console.log('\n🔄 Adding more sample data...\n');

    // Add Pharmacies
    console.log('📍 Adding more pharmacies...');
    const newPharmacies = await Pharmacy.insertMany(additionalPharmacies);
    console.log(`✅ Added ${newPharmacies.length} new pharmacies`);
    newPharmacies.forEach(p => {
      console.log(`   • ${p.name} (${p.city}${p.open24x7 ? ' - 24x7' : ''})`);
    });

    // Get all pharmacy IDs
    const allPharmacies = await Pharmacy.find();
    const pharmacyIds = allPharmacies.map(p => p._id);

    // Add Medicines with pharmacy associations
    console.log('\n💊 Adding more medicines...');
    const medicinesWithPharmacy = additionalMedicines.map((med, index) => ({
      ...med,
      pharmacy: pharmacyIds[index % pharmacyIds.length]
    }));
    
    const newMedicines = await Medicine.insertMany(medicinesWithPharmacy);
    console.log(`✅ Added ${newMedicines.length} new medicines`);

    // Add Users
    console.log('\n👥 Adding more users...');
    let addedUsers = 0;
    for (const userData of additionalUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        addedUsers++;
        console.log(`   • ${userData.name} (${userData.email})`);
      }
    }
    console.log(`✅ Added ${addedUsers} new users`);

    // Add Sample Reservations
    console.log('\n📋 Adding sample reservations...');
    const users = await User.find({ role: 'user' }).limit(3);
    const medicines = await Medicine.find().limit(5);
    
    const Reservation = require('./models/Reservation');
    const reservations = [];
    
    for (let i = 0; i < 3; i++) {
      if (users[i] && medicines[i]) {
        const medicine = medicines[i];
        const pharmacy = await Pharmacy.findById(medicine.pharmacy);
        
        reservations.push({
          user: users[i]._id,
          pharmacy: pharmacy._id,
          medicine: medicine._id,
          quantity: Math.floor(Math.random() * 3) + 1,
          totalPrice: medicine.price * (Math.floor(Math.random() * 3) + 1),
          status: ['pending', 'confirmed', 'completed'][Math.floor(Math.random() * 3)],
          reservedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
          customerName: users[i].name,
          customerPhone: users[i].phone
        });
      }
    }
    
    if (reservations.length > 0) {
      await Reservation.insertMany(reservations);
      console.log(`✅ Added ${reservations.length} sample reservations`);
    }

    // Summary
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReservations = await Reservation.countDocuments();

    console.log('\n' + '='.repeat(60));
    console.log('✅ MORE DATA ADDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\n📊 Current Database Statistics:`);
    console.log(`   🏪 Total Pharmacies: ${totalPharmacies}`);
    console.log(`   💊 Total Medicines: ${totalMedicines}`);
    console.log(`   👥 Total Users: ${totalUsers}`);
    console.log(`   📋 Total Reservations: ${totalReservations}`);
    
    console.log('\n🌟 Categories Available:');
    const categories = await Medicine.distinct('category');
    categories.forEach(cat => console.log(`   • ${cat}`));
    
    console.log('\n🏙️  Cities Covered:');
    const cities = await Pharmacy.distinct('city');
    cities.forEach(city => console.log(`   • ${city}`));
    
    console.log('\n🎉 Your website now has plenty of data to explore!');
    console.log('🌐 Visit http://localhost:5173 to see the changes\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error adding data:', error.message);
    console.error(error);
    process.exit(1);
  }
}
