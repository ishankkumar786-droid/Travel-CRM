/**
 * Fix admin password — the original seed double-hashed the password.
 * This script deletes the old admin and re-creates with plain password,
 * letting the Mongoose pre-save hook handle hashing exactly once.
 *
 * Usage:  pnpm tsx src/database/seed/seed-admin.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';

import { env } from '@/config/env';

const ADMIN_EMAIL = 'admin@travelcrm.com';
const ADMIN_PASSWORD = 'Admin@123';

async function seed() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  console.log('✅ Connected to', mongoose.connection.host);

  const { User } = await import('@/models/user.model');

  // Remove old admin if exists (might have double-hashed password)
  const deleted = await User.deleteOne({ email: ADMIN_EMAIL }).exec();
  if (deleted.deletedCount > 0) {
    console.log('🗑️  Removed old admin user');
  }

  // Create with PLAIN password — the pre-save hook will hash it once
  const admin = await User.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'super_admin',
    status: 'active',
    emailVerified: true,
    tokenVersion: 0,
    failedLoginAttempts: 0,
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'Asia/Kolkata',
      notifications: { email: true, browser: true },
    },
  });

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Super Admin seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Role:     super_admin`);
  console.log(`   ID:       ${admin._id.toString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
