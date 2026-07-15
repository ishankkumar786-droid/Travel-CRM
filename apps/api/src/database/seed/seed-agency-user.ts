import 'dotenv/config';
import mongoose from 'mongoose';

import { env } from '@/config/env';

async function seedAgencyUser() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });

  const { User } = await import('@/models/user.model');
  const { Agency } = await import('@/models/agency.model');

  // Find the first agency we seeded
  const agency = await Agency.findOne({ email: 'contact@wanderlust.com' }).exec();

  if (!agency) {
    console.error('❌ Could not find Wanderlust Travels agency. Run seed-agencies first.');
    process.exit(1);
  }

  const AGENCY_EMAIL = 'agency@travelcrm.com';
  const AGENCY_PASSWORD = 'Agency@123';

  // Remove old if exists
  await User.deleteOne({ email: AGENCY_EMAIL }).exec();

  await User.create({
    firstName: 'Alice',
    lastName: 'Johnson',
    email: AGENCY_EMAIL,
    password: AGENCY_PASSWORD,
    role: 'agency_owner',
    status: 'active',
    emailVerified: true,
    tokenVersion: 0,
    failedLoginAttempts: 0,
    agencyId: agency._id,
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'Asia/Kolkata',
      notifications: { email: true, browser: true },
    },
  });

  console.log('✅ Agency User seeded successfully!');
  console.log(`   Email:    ${AGENCY_EMAIL}`);
  console.log(`   Password: ${AGENCY_PASSWORD}`);
  console.log(`   Agency ID: ${agency._id.toString()}`);

  await mongoose.disconnect();
  process.exit(0);
}

seedAgencyUser().catch(console.error);
