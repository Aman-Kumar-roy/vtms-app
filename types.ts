/**
 * VTMS - Mobile App TypeScript API Interfaces
 * Strictly enforces project constraints:
 * - Tank sizes allowed: 500, 1000, 2000 ONLY
 * - Dynamic totals computed on server (totalDeliveries, totalPaid, totalDues)
 */

// 1. User & Auth
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager';
}

// 2. Sellers
export interface Seller {
  _id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  // Dynamic computed fields added by controller
  totalDeliveries?: number;
  totalPaid?: number;
  totalDues?: number;
  tank500?: number;
  tank1000?: number;
  tank2000?: number;
}

export interface CreateSellerRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
}

export interface UpdateSellerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
}

export interface SellerListResponse {
  success: boolean;
  data: Seller[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  overallTotals?: {
    totalDeliveries: number;
    totalPaid: number;
    totalDues: number;
    tank500: number;
    tank1000: number;
    tank2000: number;
  };
}

export interface SellerDetailResponse {
  success: boolean;
  data: {
    seller: Seller;
    stats: {
      totalDeliveries: number;
      totalPaid: number;
      totalDues: number;
      tank500: number;
      tank1000: number;
      tank2000: number;
    };
    transactions: Transaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// 3. Transactions
export type TransactionType = 'DELIVERY' | 'PAYMENT';

export interface Transaction {
  _id: string;
  sellerId: string | Seller;
  parentId?: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string | null;
  tank500: number;
  tank1000: number;
  tank2000: number;
  paymentMode?: string | null; // UPI, Cash, Cheque, Bank Transfer, RTGS/NEFT
  paidAmount?: number;
  remainingDue?: number;
  linkedPayments?: Array<{
    id?: string;
    _id?: string;
    sellerId?: string;
    parentId?: string;
    type?: TransactionType;
    amount: number;
    date: string;
    note?: string | null;
    paymentMode?: string | null;
    createdAt?: string;
  }>;
  parentDelivery?: {
    id?: string;
    _id?: string;
    date: string;
    amount: number;
    note?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  sellerId: string;
  type: TransactionType;
  amount: number;
  date?: string;
  note?: string;
  // Strictly tank sizes: 500, 1000, 2000
  tank500?: number;
  tank1000?: number;
  tank2000?: number;
  paymentMode?: string;
  parentId?: string | null;
}

export interface UpdateTransactionRequest {
  amount?: number;
  date?: string;
  note?: string;
  tank500?: number;
  tank1000?: number;
  tank2000?: number;
  paymentMode?: string;
}

export interface TransactionListResponse {
  success: boolean;
  data: Transaction[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 4. Reports
export interface SummaryReportResponse {
  success: boolean;
  data: {
    totalBilledSales: number;
    totalClearedPayments: number;
    totalPendingReceivables: number;
    totalActiveVendors: number;
    tankDistribution: {
      tank500: number;
      tank1000: number;
      tank2000: number;
    };
    topVendors: Array<{
      name: string;
      totalDeliveries: number;
      totalPaid: number;
    }>;
  };
}

export interface TankSummaryReportResponse {
  success: boolean;
  data: {
    tank500: number;
    tank1000: number;
    tank2000: number;
    totalTanks: number;
  };
}

export { ServerReceipt } from './src/types';

