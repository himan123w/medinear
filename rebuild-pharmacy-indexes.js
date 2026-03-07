require('dotenv').config();
const mongoose = require('mongoose');
const Pharmacy = require('./models/Pharmacy');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear')
  .then(async () => {
    console.log('\n🔧 Rebuilding Pharmacy Indexes...\n');
    
    // Ensure indexes exist (will create if missing)
    console.log('📋 Ensuring indexes exist...');
    try {
      await Pharmacy.syncIndexes();
      console.log('✅ Indexes synchronized');
    } catch (err) {
      console.log('⚠️  Using createIndexes instead...');
      await Pharmacy.createIndexes();
      console.log('✅ Indexes created');
    }
    
    // List all indexes
    const indexes = await Pharmacy.collection.indexes();
    console.log('\n📊 Current Indexes:');
    indexes.forEach(index => {
      console.log(`  - ${Object.keys(index.key).join(', ')}: ${JSON.stringify(index.key)}`);
    });
    
    // Test queries
    console.log('\n🧪 Testing Queries:\n');
    
    // Test 1: Get all pharmacies
    const allPharmacies = await Pharmacy.find();
    console.log(`✅ Total pharmacies: ${allPharmacies.length}`);
    
    // Test 2: Get pharmacies with valid coordinates
    const withCoords = await Pharmacy.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    });
    console.log(`✅ Pharmacies with coordinates: ${withCoords.length}`);
    
    // Test 3: Test geospatial query (center of Lucknow)
    const lucknowCenter = { lat: 26.8467, lng: 80.9462 };
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
    console.log(`✅ Nearby pharmacies (within 50km): ${nearbyPharmacies.length}`);
    
    // Test 4: Get by area
    const areas = await Pharmacy.aggregate([
      { $match: { city: 'Lucknow' } },
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\n📍 Pharmacies by area:');
    areas.forEach(a => console.log(`   ${a._id}: ${a.count}`));
    
    console.log('\n✅ All tests passed!\n');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
