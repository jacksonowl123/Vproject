/**
 * API Type Definitions
 */

// Member Details Interface
export interface MemberDetails {
  usr: string;
  name?: string;
  email?: string;
  mobile?: string;
  status?: string;
  balances?: {
    cash?: number;
    chips?: number;
  };
  [key: string]: any;
}

// Profile Update Payload Interface
export interface ProfileUpdatePayload {
  email?: string;
  name?: string;
  mobile?: string;
  [key: string]: any;
}

// API Response Interface
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
  error?: string;
  code?: number;
}

// Transaction Interface
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'game' | string;
  amount: number;
  status: 'completed' | 'pending' | 'rejected' | string;
  date: string;
  details?: {
    [key: string]: any;
  };
}

// Bank Account Interface
export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
} 