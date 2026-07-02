// Run from: apps/api folder
// Command: node seed-admin.js
require('dotenv').config({ path: '.env' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

console.log('Connecting to:', MONGODB_URI.replace(/:([^:@]+)@/, ':***@'));

mongoose
  .connect(MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'travel_marketplace' })
  .then(async () => {
    console.log('Connected to MongoDB');

    const existing = await mongoose.connection.db.collection('users').findOne({ email: 'admin@travel.com' });
    if (existing) {
      console.log('Admin already exists: admin@travel.com');
      process.exit(0);
    }

    const hash = await bcrypt.hash('Admin@123!', 12);

    await mongoose.connection.db.collection('users').insertOne({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@travel.com',
      password: hash,
      role: 'super_admin',
      status: 'active',
      emailVerified: true,
      tokenVersion: 0,
      failedLoginAttempts: 0,
      refreshTokens: [],
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, browser: true },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log('   Email:    admin@travel.com');
    console.log('   Password: Admin@123!');
    console.log('   Role:     super_admin');
    console.log('');
    console.log('Go to http://localhost:3000/login to sign in.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to connect:', err.message);
    process.exit(1);
  });
