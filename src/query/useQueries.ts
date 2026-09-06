import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from './queryClient';
import { getSummaryReportApi, getTankSummaryReportApi } from '../api/reports';
import { getSellersApi, getSellerByIdApi, GetSellersResponse, SellerDetailData } from '../api/seller';
import { getTransactionsApi, GetTransactionsResponse } from '../api/transaction';
import { SummaryReportData, TankReportResponse } from '../types';

/**
 * Dashboard Data Query
 * Stale time: 2 minutes
 */
export const useDashboardQuery = (enabled: boolean = true) => {
  const summaryQuery = useQuery({
    queryKey: QUERY_KEYS.summaryReport,
    queryFn: getSummaryReportApi,
    staleTime: 1000 * 60 * 2,
    enabled,
  });

  const sellersQuery = useQuery({
    queryKey: QUERY_KEYS.sellers({ limit: 5 }),
    queryFn: () => getSellersApi({ limit: 5 }),
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  const isLoading = (summaryQuery.isLoading || sellersQuery.isLoading) && !summaryQuery.data && !sellersQuery.data;
  const isFetching = summaryQuery.isFetching || sellersQuery.isFetching;
  const isError = summaryQuery.isError || sellersQuery.isError;
  const error = summaryQuery.error || sellersQuery.error;

  const refetch = async () => {
    await Promise.all([summaryQuery.refetch(), sellersQuery.refetch()]);
  };

  return {
    report: summaryQuery.data || null,
    sellers: sellersQuery.data?.sellers || [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

/**
 * Sellers Directory Query
 * Stale time: 5 minutes
 */
export const useSellersQuery = (
  params: { page?: number; limit?: number; search?: string },
  enabled: boolean = true
) => {
  const query = useQuery<GetSellersResponse>({
    queryKey: QUERY_KEYS.sellers(params),
    queryFn: () => getSellersApi(params),
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  return {
    data: query.data,
    sellers: query.data?.sellers || [],
    overallTotals: query.data?.overallTotals,
    pagination: query.data?.pagination,
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Seller Detail Query
 * Stale time: 3 minutes
 */
export const useSellerDetailQuery = (
  id: string,
  params?: { page?: number; limit?: number },
  enabled: boolean = true
) => {
  const query = useQuery<SellerDetailData>({
    queryKey: QUERY_KEYS.sellerDetail(id, params),
    queryFn: () => getSellerByIdApi(id, params),
    staleTime: 1000 * 60 * 3,
    enabled: enabled && !!id,
  });

  return {
    data: query.data,
    seller: query.data?.seller || null,
    stats: query.data?.stats,
    transactions: query.data?.transactions || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Transactions Query
 * Stale time: 2 minutes
 */
export const useTransactionsQuery = (
  params: {
    page?: number;
    limit?: number;
    type?: 'DELIVERY' | 'PAYMENT';
    sellerId?: string;
    search?: string;
  },
  enabled: boolean = true
) => {
  const query = useQuery<GetTransactionsResponse>({
    queryKey: QUERY_KEYS.transactions(params),
    queryFn: () => getTransactionsApi(params),
    staleTime: 1000 * 60 * 2,
    enabled,
  });

  return {
    data: query.data,
    transactions: query.data?.transactions || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Receipts Query
 * Stale time: 2 minutes
 */
export const useReceiptsQuery = (
  params: {
    page?: number;
    limit?: number;
    type?: 'DELIVERY' | 'PAYMENT';
    search?: string;
  },
  enabled: boolean = true
) => {
  const query = useQuery<GetTransactionsResponse>({
    queryKey: QUERY_KEYS.receipts(params),
    queryFn: () => getTransactionsApi(params),
    staleTime: 1000 * 60 * 2,
    enabled,
  });

  return {
    data: query.data,
    transactions: query.data?.transactions || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Tank Reports Query
 * Stale time: 2 minutes
 */
export const useTankReportQuery = (
  params: { startDate?: string; endDate?: string; month?: string },
  enabled: boolean = true
) => {
  const query = useQuery<TankReportResponse>({
    queryKey: QUERY_KEYS.tankReport(params),
    queryFn: () => getTankSummaryReportApi(params),
    staleTime: 1000 * 60 * 2,
    enabled,
  });

  return {
    data: query.data,
    report: query.data || null,
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
