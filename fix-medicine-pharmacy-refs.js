const mongoose = require('mongoose');
require('dotenv').config();

const Medicine = require('./models/Medicine');
const Pharmacy = require('./models/Pharmacy');

async function fixMedicinePharmacyReferences() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all valid pharmacies
    const pharmacies = await Pharmacy.find({});
    if (pharmacies.length === 0) {
      console.error('❌ No pharmacies found in database!');
      process.exit(1);
    }

    console.log(`📋 Found ${pharmacies.length} pharmacies`);

    // Get all medicines
    const medicines = await Medicine.find({});
    console.log(`💊 Found ${medicines.length} medicines to update`);

    let updated = 0;
    let skipped = 0;

    for (const medicine of medicines) {
      // Check if current pharmacy reference is valid
      if (medicine.pharmacy) {
        const pharmacyExists = await Pharmacy.findById(medicine.pharmacy);
        if (pharmacyExists) {
          console.log(`  ✓ ${medicine.name} already has valid pharmacy: ${pharmacyExists.name}`);
          skipped++;
          continue;
        }
      }

      // Assign a random valid pharmacy
      const randomPharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];
      medicine.pharmacy = randomPharmacy._id;
      await medicine.save();
      
      console.log(`  ✅ Updated ${medicine.name} -> ${randomPharmacy.name} (${randomPharmacy.area})`);
      updated++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated} medicines`);
    console.log(`   Skipped: ${skipped} medicines (already valid)`);
    console.log(`   Total: ${medicines.length} medicines`);

    // Verify the fix
    console.log('\n🔍 Verification - Sampling 3 medicines:');
    const sampledMedicines = await Medicine.find({})
      .populate('pharmacy', '_id name phone area')
      .limit(3);

    sampledMedicines.forEach((med, idx) => {
      console.log(`\n${idx + 1}. ${med.name}`);
      if (med.pharmacy) {
        console.log(`   ✅ Pharmacy: ${med.pharmacy.name}`);
        console.log(`   📞 Phone: ${med.pharmacy.phone || 'N/A'}`);
        console.log(`   📍 Area: ${med.pharmacy.area || 'N/A'}`);
        console.log(`   🆔 ID: ${med.pharmacy._id}`);
      } else {
        console.log(`   ❌ Still no pharmacy data!`);
      }
    });

    console.log('\n✅ Medicine-Pharmacy references fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMedicinePharmacyReferences();
