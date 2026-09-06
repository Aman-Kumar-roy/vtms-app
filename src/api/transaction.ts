import apiClient, { resolveBaseUrl, getAuthToken } from './client';
import { File, Paths } from 'expo-file-system';
import { ApiResponse, Transaction, PaginationInfo, ServerReceipt } from '../types';

export interface GetTransactionsResponse {
  transactions: Transaction[];
  pagination?: PaginationInfo;
}

export const getTransactionsApi = async (params?: {
  page?: number;
  limit?: number;
  type?: 'DELIVERY' | 'PAYMENT';
  sellerId?: string;
  search?: string;
}): Promise<GetTransactionsResponse> => {
  const response = await apiClient.get<any>('/transactions', { params });
  if (response.data && response.data.success !== false) {
    const rawData = response.data.data !== undefined ? response.data.data : response.data;
    const rawList: any[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.transactions)
      ? rawData.transactions
      : Array.isArray(response.data.transactions)
      ? response.data.transactions
      : [];

    const transactions: Transaction[] = rawList.map((t) => {
      const sObj = (t.sellerId && typeof t.sellerId === 'object' ? t.sellerId : null) || t.seller || null;
      const txId = t._id || t.id;
      return {
        ...t,
        _id: txId,
        id: txId,
        sellerName: t.sellerName || sObj?.name || undefined,
        sellerPhone: t.sellerPhone || sObj?.phone || undefined,
        sellerEmail: t.sellerEmail || sObj?.email || undefined,
        sellerAddress: t.sellerAddress || sObj?.address || undefined,
        sellerGstNumber: t.sellerGstNumber || sObj?.gstNumber || undefined,
        seller: sObj || undefined,
      };
    });
    return {
      transactions,
      pagination: rawData?.pagination || response.data.pagination,
    };
  }
  throw new Error(response.data?.message || 'Failed to fetch transactions');
};

export const getTransactionReceiptApi = async (transactionId: string): Promise<ServerReceipt> => {
  const response = await apiClient.get<ApiResponse<ServerReceipt>>(`/transactions/${transactionId}/receipt`);
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data?.message || 'Failed to load official receipt');
};

export const downloadReceiptPdfApi = async (transactionId: string): Promise<string> => {
  const baseUrl = resolveBaseUrl().replace(/\/+$/, '');
  const token = getAuthToken();
  const pdfUrl = `${baseUrl}/transactions/${transactionId}/receipt/pdf?token=${encodeURIComponent(token || '')}`;
  const receiptNo = `RCP-${transactionId.slice(-8).toUpperCase()}`;

  const destination = new File(Paths.cache, `Receipt-${receiptNo}.pdf`);
  const downloadedFile = await File.downloadFileAsync(pdfUrl, destination);
  return downloadedFile.uri;
};

export const createTransactionApi = async (data: {
  sellerId: string;
  parentId?: string | null;
  type: 'DELIVERY' | 'PAYMENT';
  amount: number;
  date?: string;
  note?: string;
  tank500?: number;
  tank1000?: number;
  tank2000?: number;
  paymentMode?: string;
}): Promise<Transaction> => {
  try {
    const response = await apiClient.post<any>('/transactions', data);
    if (response.data && response.data.success !== false) {
      const tx = response.data.transaction || response.data.data?.transaction || response.data.data;
      tx.id = tx._id || tx.id;
      tx.receipt = response.data.receipt || response.data.data?.receipt || tx.receipt;
      return tx;
    }
    throw new Error(response.data?.message || response.data?.error || 'Failed to create transaction');
  } catch (err: any) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create transaction';
    throw new Error(msg);
  }
};

export const createDeliveryApi = async (data: {
  sellerId: string;
  amount: number;
  date?: string;
  note?: string;
  tank500?: number;
  tank1000?: number;
  tank2000?: number;
}): Promise<Transaction> => {
  return createTransactionApi({
    ...data,
    type: 'DELIVERY',
  });
};

export const createPaymentApi = async (data: {
  sellerId: string;
  amount: number;
  date?: string;
  note?: string;
  paymentMode: string;
  parentId?: string | null;
}): Promise<Transaction> => {
  return createTransactionApi({
    ...data,
    type: 'PAYMENT',
    tank500: 0,
    tank1000: 0,
    tank2000: 0,
  });
};

export const updateTransactionApi = async (
  id: string,
  data: {
    amount?: number;
    date?: string;
    note?: string;
    tank500?: number;
    tank1000?: number;
    tank2000?: number;
    paymentMode?: string;
  }
): Promise<Transaction> => {
  const response = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
  if (response.data.success && response.data.data) {
    const tx = response.data.data;
    tx.id = tx._id || tx.id;
    return tx;
  }
  throw new Error(response.data.message || 'Failed to update transaction');
};

export const deleteTransactionApi = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<any>>(`/transactions/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete transaction');
  }
};
