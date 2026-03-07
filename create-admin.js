const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const adminData = {
      name: 'Himanshu',
      email: 'rajpoothimanshusingh369@gmail.com',
      phone: '7307652511',
      password: 'Himanshu_123@',
      role: 'admin'
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    console.log('✅ Password hashed');

    // Check if user already exists
    const existingUser = await User.findOne({ email: adminData.email });
    
    if (existingUser) {
      // Update existing user to admin
      existingUser.name = adminData.name;
      existingUser.phone = adminData.phone;
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('✅ Admin user updated successfully!');
      console.log(`   Name: ${adminData.name}`);
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Phone: ${adminData.phone}`);
      console.log(`   Role: admin`);
    } else {
      // Create new user
      const newUser = new User({
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        password: hashedPassword,
        role: 'admin'
      });

      await newUser.save();
      console.log('✅ Admin user created successfully!');
      console.log(`   Name: ${adminData.name}`);
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Phone: ${adminData.phone}`);
      console.log(`   Role: admin`);
    }

    // Verify the user was created/updated
    const verifyUser = await User.findOne({ email: adminData.email });
    console.log('\n✅ Verification:');
    console.log(`   User ID: ${verifyUser._id}`);
    console.log(`   Email: ${verifyUser.email}`);
    console.log(`   Role: ${verifyUser.role}`);
    console.log(`   Password hashed: ${verifyUser.password ? '✅' : '❌'}`);

    console.log('\n🎉 Admin credentials are ready to use!');
    console.log('   Login at: http://localhost:5173/login');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
