/**
 * Cosmos DB Implementation of DeviceLoanRepository
 * Infrastructure Layer - Azure Cosmos DB (NoSQL)
 *
 * This class provides a concrete implementation of the domain repository
 * using the Azure Cosmos DB SDK, adhering to Clean Architecture principles.
 */

import { CosmosClient, Container } from '@azure/cosmos';
import type { DeviceLoanRepository } from '../domain/device-repo';
import type { DeviceLoan } from '../domain/device';

/**
 * DTO (Data Transfer Object)
 * Defines how the DeviceLoan is stored in the Cosmos DB container.
 * Dates are serialized as ISO strings.
 */
type DeviceLoanDTO = {
  id: string;
  deviceId: string;
  borrowerId: string;
  loanAmount: number;
  startDate: string;
  dueDate: string;
  status: string;
  createdAt: string;
};

/**
 * Options for configuring the CosmosDeviceLoanRepository
 */
export interface CosmosDeviceLoanRepositoryOptions {
  endpoint: string;
  databaseId: string;
  containerId: string;
  key?: string; // optional for access-key authentication
}

/**
 * Concrete implementation of the DeviceLoanRepository using Azure Cosmos DB.
 */
export class CosmosDeviceLoanRepository implements DeviceLoanRepository {
  private readonly container: Container;

  constructor(options: CosmosDeviceLoanRepositoryOptions) {
    const { endpoint, databaseId, containerId, key } = options;

    const client = new CosmosClient(
      key ? { endpoint, key } : { endpoint }
    );

    this.container = client.database(databaseId).container(containerId);
  }

  /**
   * Convert domain model → DTO for persistence
   */
  private toDTO(loan: DeviceLoan): DeviceLoanDTO {
    return {
      id: loan.id,
      deviceId: loan.deviceId,
      borrowerId: loan.borrowerId,
      loanAmount: loan.loanAmount,
      startDate: loan.startDate.toISOString(),
      dueDate: loan.dueDate.toISOString(),
      status: loan.status,
      createdAt: loan.createdAt.toISOString(),
    };
  }

  /**
   * Convert DTO → domain model for use in business logic
   */
  private fromDTO(dto: DeviceLoanDTO): DeviceLoan {
    return {
      id: dto.id,
      deviceId: dto.deviceId,
      borrowerId: dto.borrowerId,
      loanAmount: dto.loanAmount,
      startDate: new Date(dto.startDate),
      dueDate: new Date(dto.dueDate),
      status: dto.status as DeviceLoan['status'],
      createdAt: new Date(dto.createdAt),
    };
  }

  /**
   * Find a device loan by ID
   */
  async findById(id: string): Promise<DeviceLoan | undefined> {
    try {
      const { resource } = await this.container.item(id, id).read<DeviceLoanDTO>();
      return resource ? this.fromDTO(resource) : undefined;
    } catch (err: any) {
      if (err.code === 404) return undefined;
      throw err;
    }
  }

  /**
   * Retrieve all device loans
   */
  async findAll(): Promise<readonly DeviceLoan[]> {
    const query = 'SELECT * FROM c';
    const { resources } = await this.container.items
      .query<DeviceLoanDTO>(query)
      .fetchAll();
    return resources.map((r) => this.fromDTO(r));
  }

  /**
   * Save or update a device loan
   */
  async save(loan: DeviceLoan): Promise<DeviceLoan> {
    const dto = this.toDTO(loan);
    const { resource } = await this.container.items.upsert<DeviceLoanDTO>(dto);
    if (!resource) throw new Error('Failed to save DeviceLoan');
    return this.fromDTO(resource);
  }

  /**
   * Delete a device loan by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.container.item(id, id).delete();
      return true;
    } catch (err: any) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  /**
   * Check if a loan exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const found = await this.findById(id);
    return !!found;
  }

  /**
   * Find all active loans
   */
  async findActive(): Promise<readonly DeviceLoan[]> {
    const query = 'SELECT * FROM c WHERE c.status = "active"';
    const { resources } = await this.container.items
      .query<DeviceLoanDTO>(query)
      .fetchAll();
    return resources.map((r) => this.fromDTO(r));
  }

  /**
   * Find all overdue loans based on current date
   */
  async findOverdue(currentDate: Date = new Date()): Promise<readonly DeviceLoan[]> {
    const isoDate = currentDate.toISOString();
    const query = 'SELECT * FROM c WHERE c.status = "active" AND c.dueDate < @currentDate';
    const { resources } = await this.container.items
      .query<DeviceLoanDTO>({
        query,
        parameters: [{ name: '@currentDate', value: isoDate }],
      })
      .fetchAll();
    return resources.map((r) => this.fromDTO(r));
  }

  /**
   * Find all loans by borrower ID
   */
  async findByBorrowerId(borrowerId: string): Promise<readonly DeviceLoan[]> {
    const query = 'SELECT * FROM c WHERE c.borrowerId = @borrowerId';
    const { resources } = await this.container.items
      .query<DeviceLoanDTO>({
        query,
        parameters: [{ name: '@borrowerId', value: borrowerId }],
      })
      .fetchAll();
    return resources.map((r) => this.fromDTO(r));
  }

  /**
   * Find all loans by device ID
   */
  async findByDeviceId(deviceId: string): Promise<readonly DeviceLoan[]> {
    const query = 'SELECT * FROM c WHERE c.deviceId = @deviceId';
    const { resources } = await this.container.items
      .query<DeviceLoanDTO>({
        query,
        parameters: [{ name: '@deviceId', value: deviceId }],
      })
      .fetchAll();
    return resources.map((r) => this.fromDTO(r));
  }
}
