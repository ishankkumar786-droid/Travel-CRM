import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '@/config/env';

async function seedAgencies() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  console.log('✅ Connected to', mongoose.connection.host);

  const { Agency, generateAgencyCode, generateAgencySlug } = await import('@/models/agency.model');

  const dummyAgencies = [
    {
      name: 'Wanderlust Travels',
      ownerName: 'Alice Johnson',
      email: 'contact@wanderlust.com',
      phone: '+1-555-0101',
      address: {
        city: 'New York',
        state: 'NY',
        country: 'USA',
        street: '123 Explorer Way',
      },
      status: 'active',
      verificationStatus: 'verified',
      marketplaceStatus: 'listed',
      services: ['Flights', 'Hotels', 'Tours'],
      destinations: ['Europe', 'Asia'],
      tags: ['luxury', 'backpacking'],
      employeeCount: '11-25',
      yearEstablished: 2015,
    },
    {
      name: 'Serene Escapes',
      ownerName: 'Bob Smith',
      email: 'info@sereneescapes.net',
      phone: '+1-555-0202',
      address: {
        city: 'Denver',
        state: 'CO',
        country: 'USA',
      },
      status: 'active',
      verificationStatus: 'pending',
      marketplaceStatus: 'unlisted',
      services: ['Ski Packages', 'Cabins'],
      destinations: ['North America'],
      tags: ['winter', 'mountains'],
      employeeCount: '1-5',
      yearEstablished: 2020,
    },
    {
      name: 'Global Nomads Agency',
      ownerName: 'Charlie Davis',
      email: 'hello@globalnomads.org',
      phone: '+1-555-0303',
      address: {
        city: 'London',
        state: 'England',
        country: 'UK',
        street: '45 Adventure Rd',
      },
      status: 'pending',
      verificationStatus: 'unverified',
      marketplaceStatus: 'unlisted',
      services: ['Backpacking', 'Hostels'],
      destinations: ['Global'],
      tags: ['budget', 'youth'],
      employeeCount: '26-50',
      yearEstablished: 2010,
    },
  ];

  console.log('🌱 Seeding agencies...');

  for (const data of dummyAgencies) {
    const existing = await Agency.findOne({ email: data.email }).exec();
    if (existing) {
      console.log(`⚠️  Agency already exists: ${data.name} (${data.email})`);
      continue;
    }

    const agencyCode = await generateAgencyCode();
    const slug = generateAgencySlug(data.name, agencyCode);

    const agency = new Agency({
      ...data,
      agencyCode,
      slug,
    });

    agency.profileCompletion = agency.computeProfileCompletion();
    await agency.save();

    console.log(`✅ Created agency: ${agency.name} (Code: ${agencyCode})`);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Agency seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seedAgencies().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
