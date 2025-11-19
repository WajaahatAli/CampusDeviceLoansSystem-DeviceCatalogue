// src/seed/seed.ts
/**
 * Database seeding script
 * Inserts test data into Cosmos DB using getProductRepo().
 */

import { getProductRepo } from '../Config/AppServices';
import { testProducts } from './test-data';

async function runSeed() {
  console.log('🌱 Starting database seed...');

  try {
    const repo = getProductRepo();

    for (const product of testProducts) {
      console.log(`→ Writing product: ${product.name}`);
      await repo.save(product as any); // Assuming repo.save() upserts the document
    }

    console.log(' Seed completed successfully.');
  } catch (err) {
    console.error(' Seed failed:', err);
    process.exit(1);
  }
}

runSeed();
