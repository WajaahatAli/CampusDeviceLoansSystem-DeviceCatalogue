/**
 * CosmosDeviceAddRepository
 * Infrastructure layer for managing device records in Cosmos DB.
 */

import { CosmosClient } from '@azure/cosmos';

export interface Device {
  id: string;
  name: string;
  category: string;
  condition: string;
  available: boolean;
  createdAt: Date;
}

type CosmosOptions = {
  endpoint: string;
  key: string;
  databaseId: string;
  containerId: string;
};

export class CosmosDeviceAddRepository {
  private client: CosmosClient;
  private container: any;

  constructor(private readonly options: CosmosOptions) {
    this.client = new CosmosClient({
      endpoint: options.endpoint,
      key: options.key,
    });
    this.container = this.client
      .database(options.databaseId)
      .container(options.containerId);
  }

  private toDTO(device: Device) {
    return {
      ...device,
      createdAt: device.createdAt.toISOString(),
    };
  }

private fromDTO(resource: any): Device {
  const { id, name, category, condition, available, createdAt } = resource;
  return {
    id,
    name,
    category,
    condition,
    available,
    createdAt: new Date(createdAt),
  };
}


  async save(device: Device): Promise<Device> {
    const dto = this.toDTO(device);
    const { resource } = await this.container.items.upsert(dto);
    return this.fromDTO(resource);
  }

  async findAll(): Promise<Device[]> {
    const { resources } = await this.container.items.query('SELECT * FROM c').fetchAll();
    return resources.map((r) => this.fromDTO(r));
  }

  async findById(id: string): Promise<Device | undefined> {
    try {
      const { resource } = await this.container.item(id, id).read();
      return resource ? this.fromDTO(resource) : undefined;
    } catch {
      return undefined;
    }
  }
}
