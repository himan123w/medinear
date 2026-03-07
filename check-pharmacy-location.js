require('dotenv').config();
const mongoose = require('mongoose');
const Pharmacy = require('./models/Pharmacy');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear')
  .then(async () => {
    console.log('\n🔍 Checking Pharmacy Location Data...\n');
    
    // Check pharmacies without location
    const withoutCoords = await Pharmacy.find({
      $or: [
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
        { latitude: null },
        { longitude: null },
        { latitude: 0 },
        { longitude: 0 }
      ]
    }).limit(5);
    
    console.log(`📍 Pharmacies without proper coordinates: ${withoutCoords.length}`);
    if (withoutCoords.length > 0) {
      console.log('\nSample pharmacies missing coordinates:');
      withoutCoords.forEach(p => {
        console.log(`  - ${p.name}: lat=${p.latitude}, lng=${p.longitude}`);
      });
    }
    
    // Check total counts
    const total = await Pharmacy.countDocuments();
    const withCoords = await Pharmacy.countDocuments({
      latitude: { $exists: true, $ne: null, $ne: 0 },
      longitude: { $exists: true, $ne: null, $ne: 0 }
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total pharmacies: ${total}`);
    console.log(`With coordinates: ${withCoords}`);
    console.log(`Without coordinates: ${total - withCoords}`);
    
    // Sample pharmacy with data
    const sample = await Pharmacy.findOne({ city: 'Lucknow' });
    if (sample) {
      console.log('\n📋 Sample Pharmacy:');
      console.log(`Name: ${sample.name}`);
      console.log(`Address: ${sample.address}`);
      console.log(`Latitude: ${sample.latitude}`);
      console.log(`Longitude: ${sample.longitude}`);
      console.log(`Location: ${JSON.stringify(sample.location)}`);
      console.log(`Area: ${sample.area}`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
