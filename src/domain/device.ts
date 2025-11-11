/**
 * Device Loan Domain Model Entity
 * Pure Domain Layer - Clean Architecture
 * Functional Programming Style
 */

// Domain Entity
export type DeviceLoan = {
  readonly id: string;
  readonly deviceId: string;
  readonly borrowerId: string;
  readonly loanAmount: number;
  readonly startDate: Date;
  readonly dueDate: Date;
  readonly status: LoanStatus;
  readonly createdAt: Date;
};

// Value Objects for domain operations
export type DeviceLoanContent = {
  readonly deviceId: string;
  readonly borrowerId: string;
  readonly loanAmount: number;
  readonly startDate: Date;
  readonly dueDate: Date;
};

// Domain error for invalid loan content
export class InvalidDeviceLoanError extends Error {
  constructor(public readonly errors: readonly string[]) {
    super(`Invalid device loan content: ${errors.join(', ')}`);
    this.name = 'InvalidDeviceLoanError';
  }
}

// Domain Validation Rules
const MIN_LOAN_AMOUNT = 1;
const MAX_LOAN_AMOUNT = 10000;
const STATUS_VALUES = ['active', 'returned', 'overdue'] as const;
export type LoanStatus = (typeof STATUS_VALUES)[number];

// Validation functions (pure business rules)
const isValidDeviceId = (deviceId: string): boolean =>
  deviceId.trim().length > 0;

const isValidBorrowerId = (borrowerId: string): boolean =>
  borrowerId.trim().length > 0;

const isValidLoanAmount = (amount: number): boolean =>
  amount >= MIN_LOAN_AMOUNT && amount <= MAX_LOAN_AMOUNT;

const isValidDates = (startDate: Date, dueDate: Date): boolean =>
  startDate instanceof Date &&
  dueDate instanceof Date &&
  !isNaN(startDate.getTime()) &&
  !isNaN(dueDate.getTime()) &&
  dueDate > startDate;

const isValidStatus = (status: string): status is LoanStatus =>
  STATUS_VALUES.some((value) => value === status);

// Validation result type (discriminated union)
export type DeviceLoanValidationResult =
  | { success: true }
  | { success: false; errors: readonly string[] };

// Validation function
const validateDeviceLoanContent = (
  content: DeviceLoanContent
): DeviceLoanValidationResult => {
  const errors: string[] = [];

  if (!isValidDeviceId(content.deviceId)) {
    errors.push('Device ID must not be empty');
  }

  if (!isValidBorrowerId(content.borrowerId)) {
    errors.push('Borrower ID must not be empty');
  }

  if (!isValidLoanAmount(content.loanAmount)) {
    errors.push(
      `Loan amount must be between ${MIN_LOAN_AMOUNT} and ${MAX_LOAN_AMOUNT}`
    );
  }

  if (!isValidDates(content.startDate, content.dueDate)) {
    errors.push('Due date must be after start date and both must be valid dates');
  }

  return errors.length === 0 ? { success: true } : { success: false, errors };
};

// Type guard for narrowing
const isFailedValidation = (
  result: DeviceLoanValidationResult
): result is { success: false; errors: readonly string[] } =>
  result.success === false;

// Factory function to create a new DeviceLoan
export type CreateDeviceLoanParams = {
  id: string;
  deviceId: string;
  borrowerId: string;
  loanAmount: number;
  startDate: Date;
  dueDate: Date;
  status: LoanStatus;
  createdAt: Date;
};

const createDeviceLoan = ({
  id,
  deviceId,
  borrowerId,
  loanAmount,
  startDate,
  dueDate,
  status,
  createdAt,
}: CreateDeviceLoanParams): DeviceLoan => {
  const errors: string[] = [];

  // Validate ID
  if (!id || id.trim().length === 0) {
    errors.push('ID is required and cannot be empty');
  }

  // Validate createdAt
  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    errors.push('Created date must be a valid Date');
  }

  // Validate status
  if (!isValidStatus(status)) {
    errors.push(
      `Status must be one of: ${Array.from(STATUS_VALUES).join(', ')}`
    );
  }

  // Validate content using the validation function
  const contentValidation = validateDeviceLoanContent({
    deviceId,
    borrowerId,
    loanAmount,
    startDate,
    dueDate,
  });

  if (isFailedValidation(contentValidation)) {
    errors.push(...contentValidation.errors);
  }

  if (errors.length > 0) {
    throw new InvalidDeviceLoanError(errors);
  }

  return {
    id,
    deviceId,
    borrowerId,
    loanAmount,
    startDate,
    dueDate,
    status,
    createdAt,
  };
};

// Domain Query Functions (pure business logic)
const getActiveLoans = (loans: readonly DeviceLoan[]): readonly DeviceLoan[] =>
  loans.filter((loan) => loan.status === 'active');

const getOverdueLoans = (
  loans: readonly DeviceLoan[],
  currentDate: Date = new Date()
): readonly DeviceLoan[] =>
  loans.filter(
    (loan) => loan.status === 'active' && currentDate > loan.dueDate
  );

const sortByDueDate = (
  loans: readonly DeviceLoan[],
  order: 'asc' | 'desc' = 'asc'
): readonly DeviceLoan[] =>
  [...loans].sort((a, b) => {
    const comparison = a.dueDate.getTime() - b.dueDate.getTime();
    return order === 'asc' ? comparison : -comparison;
  });

const sortByStartDate = (
  loans: readonly DeviceLoan[],
  order: 'asc' | 'desc' = 'asc'
): readonly DeviceLoan[] =>
  [...loans].sort((a, b) => {
    const comparison = a.startDate.getTime() - b.startDate.getTime();
    return order === 'asc' ? comparison : -comparison;
  });

const calculateLoanDurationDays = (loan: DeviceLoan): number =>
  Math.ceil(
    (loan.dueDate.getTime() - loan.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

// Exported DeviceLoan namespace with all domain operations
export const DeviceLoan = {
  create: createDeviceLoan,
  validate: validateDeviceLoanContent,
  isValidDeviceId,
  isValidBorrowerId,
  isValidLoanAmount,
  isValidDates,
  isValidStatus,
  getActiveLoans,
  getOverdueLoans,
  sortByDueDate,
  sortByStartDate,
  calculateLoanDurationDays,
} as const;
