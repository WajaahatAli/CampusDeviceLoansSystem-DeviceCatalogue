/**
 * appservices.ts
 * Central accessor for application-level singletons.
 * Provides a lazy-initialized instance of CosmosDeviceAddRepository.
 */

import { CosmosDeviceAddRepository } from '../infra/cosmos-device-add-repo';

let deviceRepoInstance: CosmosDeviceAddRepository | null = null;

export function getProductRepo(): CosmosDeviceAddRepository {
  if (!deviceRepoInstance) {
    const key = process.env.COSMOS_KEY;
    if (!key) {
      throw new Error('COSMOS_KEY environment variable is not set.');
    }

    const options = {
      endpoint: 'https://capmus-dev-cr07-cosmos.documents.azure.com:443/',
      key,
      databaseId: 'catalogue-db',
      containerId: 'products',
    };

    deviceRepoInstance = new CosmosDeviceAddRepository(options);
    console.log('✅ CosmosDeviceAddRepository initialized.');
  }

  return deviceRepoInstance;
}
