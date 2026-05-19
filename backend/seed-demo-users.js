const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const User = require('./models/User');

async function seedDemoUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const demoUsers = [
    { name: 'Demo User', email: 'customer@gmail.com', password: 'PlantLover@456', role: 'customer' },
    { name: 'Demo Admin', email: 'admin@gmail.com', password: 'AdminPlant@123', role: 'admin' },
  ];

  for (const user of demoUsers) {
    const exists = await User.findOne({ email: user.email });
    if (exists) {
      console.log(`Already exists: ${user.email} (${exists.role})`);
    } else {
      await User.create(user);
      console.log(`Created: ${user.email} (${user.role})`);
    }
  }

  await mongoose.disconnect();
  console.log('Done');
}

seedDemoUsers().catch(err => {
  console.error(err.message);
  process.exit(1);
});
