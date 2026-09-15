/**
 * VTMS Mobile App Types
 * Strictly enforces project constraints:
 * - Tank sizes allowed: 500, 1000 ONLY (tank500, tank1000)
 * - Server computed dynamic totals (totalDeliveries, totalPaid, totalDues)
 */

export interface User {
  _id: string;
  id?: string; // Fallback getter
  name: string;
  email: string;
  role: 'admin' | 'manager';
  createdAt?: string;
  updatedAt?: string;
}

export interface Seller {
  _id: string;
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  totalDeliveries?: number;
  totalPaid?: number;
  totalDues?: number;
  advanceCredit?: number;
  isOverpaid?: boolean;
  tank500?: number;
  tank1000?: number;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'DELIVERY' | 'PAYMENT';

export type PaymentMode = 'UPI' | 'Cash' | 'Cheque' | 'Bank Transfer' | 'RTGS/NEFT';

export interface Transaction {
  _id: string;
  id?: string;
  sellerId: string | Seller;
  sellerName?: string;
  sellerPhone?: string | null;
  sellerEmail?: string | null;
  sellerAddress?: string | null;
  sellerGstNumber?: string | null;
  parentId?: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string | null;
  // Strictly tank sizes: 500, 1000
  tank500: number;
  tank1000: number;
  tank500_layers?: number | null;
  tank1000_layers?: number | null;
  tank1000_foam?: string | null;
  tankItems?: Array<{
    size: 500 | 1000;
    quantity: number;
    layers: number;
    foam?: 'none' | 'single' | 'double';
  }>;
  paymentMode?: string | null;
  createdAt: string;
  paidAmount?: number;
  remainingDue?: number;
  advanceCredit?: number;
  previousDues?: number;
  currentDues?: number;
  isPreviousAdvance?: boolean;
  isCurrentAdvance?: boolean;
  previousDuesFormatted?: string;
  currentDuesFormatted?: string;
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
  seller?: {
    _id?: string;
    id?: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    gstNumber?: string | null;
  };
  receipt?: ServerReceipt;
}

export interface ServerReceipt {
  receiptNo: string;
  issueDate: string;
  orderDate?: string;
  status: string;
  company: {
    name: string;
    gst: string;
    phone: string;
    address: string;
  };
  seller: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    gstNumber?: string | null;
  };
  transaction: {
    id: string;
    sellerId: string;
    parentId?: string | null;
    type: 'DELIVERY' | 'PAYMENT';
    amount: number;
    formattedAmount: string;
    date: string;
    note?: string | null;
    paymentMode?: string | null;
    tank500: number;
    tank1000: number;
    tank500_layers?: number | null;
    tank1000_layers?: number | null;
    tank1000_foam?: string | null;
    tankItems?: Array<{
      size: 500 | 1000;
      quantity: number;
      layers: number;
      foam?: 'none' | 'single' | 'double';
    }>;
    previousDues?: number;
    currentDues?: number;
    totalTanks: number;
    createdAt?: string;
  };
  items: Array<{
    description: string;
    capacity: string;
    quantity: number;
    layers?: number | null;
    foam?: string | null;
    unitName: string;
  }>;
  settlement?: {
    previousDues: number;
    transactionAmount: number;
    closingBalance: number;
  };
  totalUnits: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
}

export interface SummaryReportData {
  totalBilledSales: number;
  totalClearedPayments: number;
  totalPendingReceivables: number;
  totalActiveVendors: number;
  tankDistribution: {
    tank500: number;
    tank1000: number;
  };
  topVendors: Array<{
    sellerId?: string;
    name: string;
    totalDeliveries: number;
    totalPaid: number;
  }>;
}

export interface TankSummaryData {
  tank500: number;
  tank1000: number;
  totalTanks: number;
}

export interface SellerTankSummaryRow {
  sellerId: string;
  sellerName: string;
  total500: number;
  total1000: number;
  totalOrders: number;
}

export interface TankReportResponse {
  period?: string;
  startDate?: string | null;
  endDate?: string | null;
  month?: string;
  summary: SellerTankSummaryRow[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
  overallTotals?: {
    totalDeliveries: number;
    totalPaid: number;
    totalDues: number;
    tank500: number;
    tank1000: number;
  };
}
