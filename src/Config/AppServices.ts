/**
 * Application Services - Singleton Accessor
 * Provides a lazy-initialized CosmosProductRepository instance.
 *
 * This ensures only one Cosmos DB client + repository is created and reused.
 * All configuration is hard-wired except for the key, which must come from process.env.COSMOS_KEY.
 */

import { CosmosDeviceLoanRepository } from '../infra/cosmos-device-repo'; 
import type { DeviceLoanRepository } from '../domain/device-repo';

// Singleton cache
let productRepoInstance: DeviceLoanRepository | null = null;

/**
 * Returns a singleton instance of CosmosProductRepository.
 * Lazily initializes it on first call.
 */
export function getProductRepo(): DeviceLoanRepository {
  if (!productRepoInstance) {
    const key = process.env.COSMOS_KEY;
    if (!key) {
      throw new Error('COSMOS_KEY environment variable is not set.');
    }

    const options = {
      endpoint: 'https://capmus-dev-cr07-cosmos.documents.azure.com:443/',
      key, // only dynamic value
      databaseId: 'catalogue-db',
      containerId: 'products',
    };

    // Initialize repository
    productRepoInstance = new CosmosDeviceLoanRepository(options);
    console.log('✅ CosmosProductRepository initialized.');
  }

  return productRepoInstance;
}
