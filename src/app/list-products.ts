/**
 * Application Layer - Use Case
 * listProducts.ts
 *
 * A pure, thin use-case function that lists all products.
 * It uses dependency injection via a single `deps` parameter.
 */

import type { CosmosDeviceAddRepository } from '../infra/cosmos-device-add-repo';
import type { Device } from '../infra/cosmos-device-add-repo';

export type ListProductsDeps = {
  productRepo: Pick<CosmosDeviceAddRepository, 'findAll'>;
};

/**
 * Lists all products from the repository.
 * Pure and side-effect-free — depends only on provided deps.
 */
export async function listProducts({ productRepo }: ListProductsDeps): Promise<readonly Device[]> {
  return await productRepo.findAll();
}
