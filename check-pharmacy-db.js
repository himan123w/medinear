require('dotenv').config();
const mongoose = require('mongoose');
const Pharmacy = require('./models/Pharmacy');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear')
  .then(async () => {
    console.log('\n🔍 Checking Pharmacy Database...\n');
    
    // List all indexes
    const indexes = await Pharmacy.collection.indexes();
    console.log('📊 Current Indexes:');
    indexes.forEach(index => {
      const keys = Object.keys(index.key).join(', ');
      const type = index['2dsphereIndexVersion'] ? ' (2dsphere)' : '';
      console.log(`  ✓ ${keys}${type}`);
    });
    
    // Test queries
    console.log('\n🧪 Testing Queries:\n');
    
    // Test 1: Get all pharmacies
    const allPharmacies = await Pharmacy.find();
    console.log(`Total pharmacies: ${allPharmacies.length}`);
    
    // Test 2: Get pharmacies with valid coordinates
    const withCoords = await Pharmacy.find({
      'location.coordinates.0': { $ne: 0 },
      'location.coordinates.1': { $ne: 0 }
    });
    console.log(`Pharmacies with valid coordinates: ${withCoords.length}`);
    
    // Test 3: Test geospatial query (center of Lucknow)
    const lucknowCenter = { lat: 26.8467, lng: 80.9462 };
    try {
      const nearbyPharmacies = await Pharmacy.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lucknowCenter.lng, lucknowCenter.lat]
            },
            $maxDistance: 50000 // 50km
          }
        }
      }).limit(10);
      console.log(`Nearby pharmacies (within 50km of center): ${nearbyPharmacies.length}`);
      
      if (nearbyPharmacies.length > 0) {
        console.log(`\n✅ Geospatial queries working!`);
        console.log(`Sample: ${nearbyPharmacies[0].name} - ${nearbyPharmacies[0].area}`);
      }
    } catch (err) {
      console.log(`❌ Geospatial query failed: ${err.message}`);
    }
    
    // Test 4: Get by area
    const areas = await Pharmacy.aggregate([
      { $match: { city: 'Lucknow' } },
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\n📍 Pharmacies by area:');
    areas.forEach(a => console.log(`   ${a._id}: ${a.count}`));
    
    // Test 5: Check which pharmacies are visible (not hidden/deleted)
    const visiblePharmacies = await Pharmacy.countDocuments({ 
      $or: [
        { deleted: { $exists: false } },
        { deleted: false }
      ]
    });
    console.log(`\n👁️  Visible pharmacies: ${visiblePharmacies}`);
    
    // Test 6: Sample a few pharmacies to see their data
    const samples = await Pharmacy.find().limit(3);
    console.log('\n📋 Sample Pharmacies:');
    samples.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   Address: ${p.address}`);
      console.log(`   Coordinates: [${p.location.coordinates[0]}, ${p.location.coordinates[1]}]`);
      console.log(`   Area: ${p.area}`);
      console.log(`   Open 24x7: ${p.open24x7 ? 'Yes' : 'No'}`);
    });
    
    console.log('\n✅ Database check complete!\n');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
