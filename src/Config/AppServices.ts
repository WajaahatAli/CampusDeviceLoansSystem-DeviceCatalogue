/**
 * AppServices.ts
 * ----------------
 * Central accessor for application-level singletons.
 * 
 * Reads all Cosmos DB connection details from environment variables,
 * ensuring no hard-coded configuration and full separation of dev/test/prod.
 */

import 'dotenv/config';
import { CosmosDeviceAddRepository } from '../infra/cosmos-device-add-repo';

let deviceRepoInstance: CosmosDeviceAddRepository | null = null;

/**
 * Returns a singleton instance of the CosmosDeviceAddRepository.
 * Throws an error if any required environment variable is missing.
 */
export function getProductRepo(): CosmosDeviceAddRepository {
  if (!deviceRepoInstance) {
    // Read from environment variables
    const key = process.env.COSMOS_KEY;
    const endpoint = process.env.COSMOS_ENDPOINT;
    const databaseId = process.env.COSMOS_DATABASE;
    const containerId = process.env.COSMOS_CONTAINER;

    // Validate configuration
    if (!key || !endpoint || !databaseId || !containerId) {
      throw new Error(
        `Missing Cosmos configuration. Please ensure all of the following environment variables are set:
        COSMOS_KEY
        COSMOS_ENDPOINT
        COSMOS_DATABASE
        COSMOS_CONTAINER`
      );
    }

    // Construct options object for repository
    const options = {
      endpoint,
      key,
      databaseId,
      containerId,
    };

    // Create the singleton repository
    deviceRepoInstance = new CosmosDeviceAddRepository(options);

    console.log(
  `CosmosDeviceAddRepository initialized:
  - Endpoint: ${endpoint}
  - Database: ${databaseId}
  - Container: ${containerId}`
);

  }
//
  return deviceRepoInstance;
}
