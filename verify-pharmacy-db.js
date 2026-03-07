require('dotenv').config();
const mongoose = require('mongoose');
const Pharmacy = require('./models/Pharmacy');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear')
  .then(async () => {
    const total = await Pharmacy.countDocuments();
    const lucknow = await Pharmacy.countDocuments({ city: 'Lucknow' });
    const open24x7 = await Pharmacy.countDocuments({ open24x7: true });
    
    console.log('\n📊 Database Summary:');
    console.log('='.repeat(50));
    console.log('Total Pharmacies:', total);
    console.log('Lucknow Pharmacies:', lucknow);
    console.log('24-Hour Pharmacies:', open24x7);
    console.log('='.repeat(50) + '\n');
    
    const areas = await Pharmacy.aggregate([
      { $match: { city: 'Lucknow' } },
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📍 Distribution by Area:');
    areas.forEach(a => console.log('   ' + a._id + ':', a.count));
    console.log('');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
