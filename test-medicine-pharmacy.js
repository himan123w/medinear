const mongoose = require('mongoose');
require('dotenv').config();

const Medicine = require('./models/Medicine');
const Pharmacy = require('./models/Pharmacy');

async function testMedicinePharmacy() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get total counts
    const medicineCount = await Medicine.countDocuments();
    const pharmacyCount = await Pharmacy.countDocuments();
    console.log(`\n📊 Database Stats:`);
    console.log(`   Medicines: ${medicineCount}`);
    console.log(`   Pharmacies: ${pharmacyCount}`);

    // Sample a few medicines with pharmacy data
    console.log('\n🔍 Sampling medicines with pharmacy populate:');
    const medicines = await Medicine.find({ available: true })
      .populate('pharmacy', '_id name phone area')
      .limit(5);

    medicines.forEach((med, idx) => {
      console.log(`\n${idx + 1}. ${med.name}`);
      console.log(`   Medicine ID: ${med._id}`);
      console.log(`   Pharmacy Ref: ${med.pharmacy}`);
      if (med.pharmacy) {
        console.log(`   Pharmacy._id: ${med.pharmacy._id}`);
        console.log(`   Pharmacy.name: ${med.pharmacy.name}`);
        console.log(`   Pharmacy.phone: ${med.pharmacy.phone}`);
        console.log(`   Pharmacy.area: ${med.pharmacy.area}`);
      } else {
        console.log(`   ⚠️  NO PHARMACY DATA!`);
      }
    });

    // Check how many medicines have null/missing pharmacy refs
    const medicinesWithoutPharmacy = await Medicine.countDocuments({ 
      pharmacy: { $exists: false } 
    });
    const medicinesWithNullPharmacy = await Medicine.countDocuments({ 
      pharmacy: null 
    });
    
    console.log(`\n⚠️  Problem medicines:`);
    console.log(`   Medicines without pharmacy field: ${medicinesWithoutPharmacy}`);
    console.log(`   Medicines with null pharmacy: ${medicinesWithNullPharmacy}`);

    // Get list of pharmacy IDs that exist
    const pharmacyIds = await Pharmacy.find({}).distinct('_id');
    console.log(`\n📋 Pharmacy IDs in database: ${pharmacyIds.length}`);
    console.log(`   Sample IDs: ${pharmacyIds.slice(0, 3).join(', ')}`);

    // Check if medicines are pointing to valid pharmacy IDs
    const medicinesWithPharmacy = await Medicine.find({ 
      pharmacy: { $exists: true, $ne: null } 
    }).select('name pharmacy').limit(5);
    
    console.log(`\n🔗 Medicine-Pharmacy links:`);
    for (const med of medicinesWithPharmacy) {
      const pharmacyExists = await Pharmacy.findById(med.pharmacy);
      console.log(`   ${med.name} -> Pharmacy ${med.pharmacy}: ${pharmacyExists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMedicinePharmacy();
