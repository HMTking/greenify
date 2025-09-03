// Admin user creation and testing script
// Run this to create an admin user for testing admin routes

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('👨‍💼 Admin user already exists:', existingAdmin.email);
      console.log('🔑 Use these credentials to login as admin:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Password: [Use the password you set when registering]');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@greenify.com',
      password: 'Admin123!',
      role: 'admin'
    });

    await adminUser.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log('🔑 Admin Login Credentials:');
    console.log('   Email: admin@greenify.com');
    console.log('   Password: Admin123!');
    console.log('');
    console.log('📝 You can now login with these credentials to access:');
    console.log('   - /admin/dashboard');
    console.log('   - /admin/plants');
    console.log('   - /admin/orders');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('📧 User with this email already exists');
      // Try to update existing user to admin
      try {
        const user = await User.findOneAndUpdate(
          { email: 'admin@greenify.com' },
          { role: 'admin' },
          { new: true }
        );
        console.log('✅ Updated existing user to admin role');
        console.log('🔑 Use email: admin@greenify.com with your existing password');
      } catch (updateError) {
        console.error('❌ Failed to update user role:', updateError.message);
      }
    }
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

async function testUserRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n📊 Current Users in Database:');
    console.log('================================');
    
    const users = await User.find({}, 'name email role createdAt').lean();
    
    if (users.length === 0) {
      console.log('📭 No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    const adminCount = users.filter(user => user.role === 'admin').length;
    const customerCount = users.filter(user => user.role === 'customer').length;
    
    console.log('\n📈 Summary:');
    console.log(`👨‍💼 Admin users: ${adminCount}`);
    console.log(`👥 Customer users: ${customerCount}`);
    console.log(`📊 Total users: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'create') {
  createAdminUser();
} else if (command === 'list') {
  testUserRoles();
} else {
  console.log('🔧 Admin User Management Script');
  console.log('===============================');
  console.log('Usage:');
  console.log('  node admin-setup.js create  - Create admin user');
  console.log('  node admin-setup.js list    - List all users');
  console.log('');
  console.log('Example:');
  console.log('  node admin-setup.js create');
}
