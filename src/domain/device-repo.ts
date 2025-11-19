/**
 * Device Loan Repository Interface
 * Pure Domain Layer - Clean Architecture
 *
 * Defines the contract for device loan persistence without implementation details.
 * Infrastructure layer will provide concrete implementations.
 */

import type { DeviceLoan } from './device';

/**
 * Repository interface for DeviceLoan aggregate
 * All methods return Promises for async operations
 */
export interface DeviceLoanRepository {
  /**
   * Find a device loan by its unique identifier
   * @param id - The loan ID
   * @returns The device loan if found, undefined otherwise
   */
  findById(id: string): Promise<DeviceLoan | undefined>;

  /**
   * Find all device loans
   * @returns Array of all device loans
   */
  findAll(): Promise<readonly DeviceLoan[]>;

  /**
   * Save a new device loan or update an existing one
   * @param loan - The device loan to save
   * @returns The saved device loan
   */
  save(loan: DeviceLoan): Promise<DeviceLoan>;

  /**
   * Delete a device loan by its identifier
   * @param id - The loan ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a device loan exists
   * @param id - The loan ID
   * @returns true if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find all active loans
   * @returns Array of active device loans
   */
  findActive(): Promise<readonly DeviceLoan[]>;

  /**
   * Find all overdue loans
   * @returns Array of overdue device loans
   */
  findOverdue(currentDate?: Date): Promise<readonly DeviceLoan[]>;

  /**
   * Find all loans by borrower ID
   * @param borrowerId - The borrower’s ID
   * @returns Array of loans belonging to the borrower
   */
  findByBorrowerId(borrowerId: string): Promise<readonly DeviceLoan[]>;

  /**
   * Find all loans for a specific device
   * @param deviceId - The device ID
   * @returns Array of loans for the given device
   */
  findByDeviceId(deviceId: string): Promise<readonly DeviceLoan[]>;
}
