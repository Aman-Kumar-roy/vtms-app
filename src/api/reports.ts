import apiClient from './client';
import { ApiResponse, SummaryReportData, TankSummaryData, TankReportResponse } from '../types';

export const getSummaryReportApi = async (): Promise<SummaryReportData> => {
  const response = await apiClient.get<any>('/reports/summary');
  if (response.data && response.data.success !== false) {
    const raw = response.data.data || response.data;
    const metrics = raw.metrics || raw;
    const tankBreakdown = raw.tankBreakdown || raw.tankDistribution || {};
    const topVendors = raw.topSellers || raw.topVendors || [];

    return {
      totalBilledSales: metrics.totalBilledSales || 0,
      totalClearedPayments: metrics.totalClearedPayments || 0,
      totalPendingReceivables: metrics.totalOutstandingDues !== undefined
        ? metrics.totalOutstandingDues
        : (metrics.totalPendingReceivables || 0),
      totalActiveVendors: metrics.totalSellers !== undefined
        ? metrics.totalSellers
        : (metrics.totalActiveVendors || 0),
      tankDistribution: {
        tank500: tankBreakdown.tank500 || 0,
        tank1000: tankBreakdown.tank1000 || 0,
        tank2000: tankBreakdown.tank2000 || 0,
      },
      topVendors: topVendors.map((v: any) => ({
        sellerId: v.sellerId || v._id || '',
        name: v.name || 'Vendor',
        totalDeliveries: v.totalDeliveries || 0,
        totalPaid: v.totalPaid || 0,
      })),
    };
  }
  throw new Error(response.data?.message || response.data?.error || 'Failed to fetch summary report');
};

export const getTankSummaryReportApi = async (params?: {
  startDate?: string;
  endDate?: string;
  month?: string;
}): Promise<TankReportResponse> => {
  const response = await apiClient.get<any>('/reports/tank-summary', { params });
  if (response.data && response.data.success !== false) {
    const raw = response.data.data || response.data;
    return {
      period: raw.period || 'All Time',
      startDate: raw.startDate,
      endDate: raw.endDate,
      month: raw.month,
      summary: raw.summary || [],
    };
  }
  throw new Error(response.data?.message || response.data?.error || 'Failed to fetch tank summary report');
};

export const getTankSummaryApi = async (params?: {
  startDate?: string;
  endDate?: string;
  month?: string;
}): Promise<TankSummaryData> => {
  const report = await getTankSummaryReportApi(params);
  const summary = report.summary || [];
  const t500 = summary.reduce((acc, row) => acc + (row.total500 || 0), 0);
  const t1000 = summary.reduce((acc, row) => acc + (row.total1000 || 0), 0);
  const t2000 = summary.reduce((acc, row) => acc + (row.total2000 || 0), 0);
  return {
    tank500: t500,
    tank1000: t1000,
    tank2000: t2000,
    totalTanks: t500 + t1000 + t2000,
  };
};
