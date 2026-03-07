/**
 * Test Admin API endpoint
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');
  
  // Find admin user
  const adminUser = await User.findOne({ role: 'admin', email: 'admin@medinear.com' });
  
  if (!adminUser) {
    console.log('❌ Admin user not found');
    process.exit(1);
  }
  
  console.log('✅ Found admin user:', adminUser.email);
  
  // Create a JWT token
  const token = jwt.sign(
    { _id: adminUser._id, email: adminUser.email, role: 'admin' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  console.log('✅ Generated JWT token');
  console.log('\n📌 Use this token to test:');
  console.log(`Authorization: Bearer ${token}\n`);
  
  // Now test the admin/dashboard/stats endpoint by importing the controller directly
  console.log('🧪 Testing getDashboardStats directly...\n');
  
  const adminController = require('./controllers/adminController');
  
  // Create mock req/res
  const mockReq = { query: {} };
  const mockRes = {
    json: (data) => {
      console.log('✅ Response received:');
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    },
    status: (code) => ({
      json: (data) => {
        console.log(`❌ Error (${code}):`, JSON.stringify(data, null, 2));
        process.exit(1);
      }
    })
  };
  
  // Call the controller
  await adminController.getDashboardStats(mockReq, mockRes);
  
})
.catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
