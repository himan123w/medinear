/**
 * Add test users for different roles
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medinear', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  addTestUsers();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@medinear.com',
    password: 'admin123',
    role: 'admin',
    phone: '9999999999'
  },
  {
    name: 'Test Pharmacy',
    email: 'pharmacy@test.com',
    password: 'pharmacy123',
    role: 'pharmacy',
    phone: '8888888888'
  },
  {
    name: 'Regular User',
    email: 'user@test.com',
    password: 'user123',
    role: 'user',
    phone: '7777777777'
  }
];

async function addTestUsers() {
  try {
    console.log('\n🔄 Adding test users...\n');
    
    for (const userData of testUsers) {
      // Check if user exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.email} (${userData.role})`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`✅ Created: ${userData.email} (${userData.role}) - Password: ${userData.password}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST USERS ADDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📋 Login Credentials:');
    console.log('\n👤 Admin:');
    console.log('   Email: admin@medinear.com');
    console.log('   Password: admin123');
    console.log('\n🏪 Pharmacy:');
    console.log('   Email: pharmacy@test.com');
    console.log('   Password: pharmacy123');
    console.log('\n👥 User:');
    console.log('   Email: user@test.com');
    console.log('   Password: user123');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error adding users:', error.message);
    process.exit(1);
  }
}
