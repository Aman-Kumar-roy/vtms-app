import apiClient from './client';
import { ApiResponse, Seller, Transaction, PaginationInfo } from '../types';

export interface GetSellersResponse {
  sellers: Seller[];
  pagination?: PaginationInfo;
  overallTotals?: {
    totalDeliveries: number;
    totalPaid: number;
    totalDues: number;
    tank500: number;
    tank1000: number;
    tank2000: number;
  };
}

export interface SellerDetailData {
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
  pagination: PaginationInfo;
}

export const getSellersApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<GetSellersResponse> => {
  const response = await apiClient.get<any>('/sellers', { params });
  if (response.data && response.data.success !== false) {
    const payload = response.data.data !== undefined ? response.data.data : response.data;
    const rawList = Array.isArray(payload)
      ? payload
      : (payload?.sellers && Array.isArray(payload.sellers) ? payload.sellers : []);
    
    // Normalize _id and id
    const sellers: Seller[] = rawList.map((s: any) => ({
      ...s,
      id: s._id || s.id,
    }));

    const summary = payload?.summary || payload?.overallTotals || {
      totalSellers: sellers.length,
      totalDeliveries: sellers.reduce((acc: number, s: any) => acc + (s.totalDeliveries || 0), 0),
      totalPaid: sellers.reduce((acc: number, s: any) => acc + (s.totalPaid || 0), 0),
      totalDues: sellers.reduce((acc: number, s: any) => acc + (s.totalDues || 0), 0),
      tank500: sellers.reduce((acc: number, s: any) => acc + (s.tank500 || 0), 0),
      tank1000: sellers.reduce((acc: number, s: any) => acc + (s.tank1000 || 0), 0),
      tank2000: sellers.reduce((acc: number, s: any) => acc + (s.tank2000 || 0), 0),
      totalTank500: sellers.reduce((acc: number, s: any) => acc + (s.tank500 || 0), 0),
      totalTank1000: sellers.reduce((acc: number, s: any) => acc + (s.tank1000 || 0), 0),
      totalTank2000: sellers.reduce((acc: number, s: any) => acc + (s.tank2000 || 0), 0),
      totalTanks: sellers.reduce((acc: number, s: any) => acc + (s.tank500 || 0) + (s.tank1000 || 0) + (s.tank2000 || 0), 0),
    };

    return {
      sellers,
      pagination: payload?.pagination,
      overallTotals: {
        totalDeliveries: summary.totalDeliveries || 0,
        totalPaid: summary.totalPaid || 0,
        totalDues: summary.totalDues || 0,
        tank500: summary.totalTank500 !== undefined ? summary.totalTank500 : (summary.tank500 || 0),
        tank1000: summary.totalTank1000 !== undefined ? summary.totalTank1000 : (summary.tank1000 || 0),
        tank2000: summary.totalTank2000 !== undefined ? summary.totalTank2000 : (summary.tank2000 || 0),
      },
    };
  }
  throw new Error(response.data?.message || response.data?.error || 'Failed to fetch vendors');
};

export const getSellerByIdApi = async (
  id: string,
  params?: { page?: number; limit?: number }
): Promise<SellerDetailData> => {
  const response = await apiClient.get<any>(`/sellers/${id}`, { params });
  if (response.data && response.data.success !== false) {
    const raw = response.data.data || response.data;
    const sellerObj = raw.seller || raw;
    const transactions = (sellerObj.transactions || raw.transactions || []).map((t: any) => ({
      ...t,
      id: t._id || t.id,
    }));

    const totalDeliveries = sellerObj.totalDeliveries || 0;
    const totalPaid = sellerObj.totalPaid || 0;
    const totalDues = sellerObj.totalDues !== undefined ? sellerObj.totalDues : (totalDeliveries - totalPaid);
    const tank500 = sellerObj.tank500 || 0;
    const tank1000 = sellerObj.tank1000 || 0;
    const tank2000 = sellerObj.tank2000 || 0;

    return {
      seller: {
        ...sellerObj,
        id: sellerObj._id || sellerObj.id,
      },
      stats: {
        totalDeliveries,
        totalPaid,
        totalDues,
        tank500,
        tank1000,
        tank2000,
      },
      transactions,
      pagination: sellerObj.pagination || raw.pagination || {
        total: transactions.length,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
  throw new Error(response.data?.message || response.data?.error || 'Failed to fetch vendor details');
};

export const createSellerApi = async (data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  requireAdditional?: boolean;
}): Promise<Seller> => {
  try {
    const response = await apiClient.post<any>('/sellers', data);
    if (response.data && response.data.success !== false) {
      const raw = response.data.seller || response.data.data?.seller || response.data.data || response.data;
      const created: Seller = {
        ...raw,
        id: raw._id || raw.id,
      };
      return created;
    }
    throw new Error(response.data?.message || response.data?.error || 'Failed to create vendor');
  } catch (err: any) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create vendor';
    throw new Error(msg);
  }
};

export const updateSellerApi = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
  }
): Promise<Seller> => {
  const response = await apiClient.put<ApiResponse<Seller>>(`/sellers/${id}`, data);
  if (response.data.success && response.data.data) {
    const updated = response.data.data;
    updated.id = updated._id || updated.id;
    return updated;
  }
  throw new Error(response.data.message || 'Failed to update vendor');
};

export const deleteSellerApi = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<any>>(`/sellers/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete vendor');
  }
};
