import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance with centralized cache policies.
 * 
 * Rules:
 * - Server remains single source of truth.
 * - Cache serves as an immediate-display layer (stale-while-revalidate).
 * - Queries are deduplicated automatically.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes default stale duration
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection duration
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

/**
 * Centralized Query Keys factory for predictable caching & invalidation.
 */
export const QUERY_KEYS = {
  sellers: (params?: any) => ['sellers', params ?? {}] as const,
  sellersRoot: ['sellers'] as const,
  sellerDetail: (id: string, params?: any) => ['seller', id, params ?? {}] as const,
  sellerDetailRoot: (id: string) => ['seller', id] as const,
  transactions: (params?: any) => ['transactions', params ?? {}] as const,
  transactionsRoot: ['transactions'] as const,
  summaryReport: ['summaryReport'] as const,
  reportsSummary: ['summaryReport'] as const,
  tankReport: (params?: any) => ['tankReport', params ?? {}] as const,
  tankReports: (params?: any) => ['tankReport', params ?? {}] as const,
  tankReportRoot: ['tankReport'] as const,
  receipts: (params?: any) => ['receipts', params ?? {}] as const,
  receiptsRoot: ['receipts'] as const,
};

/**
 * Targeted Cache Invalidation Helpers.
 * Call these after mutations to ensure UI stays perfectly synchronized with server state.
 */

export const invalidateSellers = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellersRoot, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.summaryReport, refetchType: 'all' }),
  ]);
};

export const invalidateSellerDetail = async (sellerId: string) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellerDetailRoot(sellerId), refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellersRoot, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.summaryReport, refetchType: 'all' }),
  ]);
};

export const invalidateTransactions = async (sellerId?: string) => {
  const promises: Promise<any>[] = [
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactionsRoot, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receiptsRoot, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.summaryReport, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tankReportRoot, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellersRoot, refetchType: 'all' }),
  ];
  if (sellerId) {
    promises.push(queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellerDetailRoot(sellerId), refetchType: 'all' }));
  }
  await Promise.all(promises);
};

export const invalidateDashboard = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.summaryReport, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellersRoot, refetchType: 'all' }),
  ]);
};

export const invalidateReports = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.summaryReport, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tankReportRoot, refetchType: 'all' }),
  ]);
};

export const invalidateReceipts = async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receiptsRoot, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactionsRoot, refetchType: 'all' }),
  ]);
};

export const clearAllQueryCache = () => {
  queryClient.clear();
};
