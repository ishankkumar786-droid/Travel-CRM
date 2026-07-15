import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Agency } from '../src/models/agency.model';
import { MarketplaceProfile, generatePublicSlug } from '../src/models/marketplace-profile.model';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const agencies = await Agency.find({});
  for (const agency of agencies) {
    let profile = await MarketplaceProfile.findOne({ agencyId: agency._id });
    if (!profile) {
      // Just use the name for the slug if possible, or fallback to name-code
      let slug = agency.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      // Check if slug exists
      const exists = await MarketplaceProfile.findOne({ publicSlug: slug });
      if (exists) {
        slug = generatePublicSlug(agency.name, agency.agencyCode);
      }

      profile = new MarketplaceProfile({
        agencyId: agency._id,
        publicSlug: slug,
        isPublic: true,
        marketplaceScore: 100, // Make it featured
        verificationScore: 100,
        description: `${agency.name} is a leading travel agency providing curated experiences.`,
        specializations: ['Beach', 'Adventure', 'Cultural'],
      });
      await profile.save();
      console.log(`Created public profile for ${agency.name} with slug: ${slug}`);
    } else {
      profile.isPublic = true;
      profile.marketplaceScore = 100;
      await profile.save();
      console.log(`Updated public profile for ${agency.name} with slug: ${profile.publicSlug}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(console.error);
