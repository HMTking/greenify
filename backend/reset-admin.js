// Reset admin password script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function resetAdminPassword() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    // Update password to a known value
    adminUser.password = 'admin123';
    await adminUser.save();
    
    console.log('🎉 Admin password reset successfully!');
    console.log('🔑 New Admin Credentials:');
    console.log('   Email:', adminUser.email);
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

resetAdminPassword();
