import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSummaryReportApi, getTankSummaryReportApi } from '../api/reports';
import { SummaryReportData, SellerTankSummaryRow, TankReportResponse } from '../types';
import { NavbarHeader } from '../components/NavbarHeader';
import { DrawerSidebar } from '../components/DrawerSidebar';
import { BottomTabBar } from '../components/BottomTabBar';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';
import { useFocusEffect } from '@react-navigation/native';

const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface DatePreset {
  id: string;
  label: string;
  getRange: () => { startDate?: string; endDate?: string; label: string };
}

const PRESETS: DatePreset[] = [
  {
    id: 'this_month',
    label: 'This Month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: toYMD(start),
        endDate: toYMD(end),
        label: now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      };
    },
  },
  {
    id: 'last_month',
    label: 'Last Month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: toYMD(start),
        endDate: toYMD(end),
        label: start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      };
    },
  },
  {
    id: 'last_30_days',
    label: 'Last 30 Days',
    getRange: () => {
      const now = new Date();
      const start = new Date();
      start.setDate(now.getDate() - 29);
      return {
        startDate: toYMD(start),
        endDate: toYMD(now),
        label: 'Last 30 Days',
      };
    },
  },
  {
    id: 'this_year',
    label: 'This Year',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return {
        startDate: toYMD(start),
        endDate: toYMD(end),
        label: `Year ${now.getFullYear()}`,
      };
    },
  },
  {
    id: 'all_time',
    label: 'All Time',
    getRange: () => ({
      label: 'All Time History',
    }),
  },
];

type SortKey = 'totalOrders' | 'sellerName' | 'total500' | 'total1000' | 'total2000';

import { ReportsSkeleton } from '../components/Shimmer';

export const ReportsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Financial summary
  const [summary, setSummary] = useState<SummaryReportData | null>(null);

  // Filter state
  const [activePresetId, setActivePresetId] = useState<string>('this_month');
  const [tankReport, setTankReport] = useState<TankReportResponse | null>(null);
  const [search, setSearch] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('totalOrders');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const activePreset = useMemo(() => {
    return PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];
  }, [activePresetId]);

  const loadTankReport = useCallback(async (preset: DatePreset) => {
    setReportLoading(true);
    try {
      const range = preset.getRange();
      const params: any = {};
      if (range.startDate && range.endDate) {
        params.startDate = range.startDate;
        params.endDate = range.endDate;
      }
      const data = await getTankSummaryReportApi(params);
      const formatted = {
        ...data,
        period: range.label,
      };
      setTankReport(formatted);
    } catch (e) {
      console.warn('Failed to load tank report:', e);
    } finally {
      setReportLoading(false);
    }
  }, []);

  const summaryRef = useRef<SummaryReportData | null>(null);
  summaryRef.current = summary;

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (!summaryRef.current) {
      setLoading(true);
    }
    try {
      const sumRes = await getSummaryReportApi();
      setSummary(sumRes);
      await loadTankReport(activePreset);
    } catch (e) {
      console.warn('Failed to load reports:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activePreset, loadTankReport]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    loadData(true);
  };

  const handleSelectPreset = (preset: DatePreset) => {
    setActivePresetId(preset.id);
    loadTankReport(preset);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'sellerName');
    }
  };

  const rows = tankReport?.summary || [];

  const sortedAndFilteredRows = useMemo(() => {
    let list = [...rows];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((r) => r.sellerName.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [rows, search, sortKey, sortAsc]);

  const periodTotals = useMemo(() => {
    return {
      t500: rows.reduce((s, r) => s + (r.total500 || 0), 0),
      t1000: rows.reduce((s, r) => s + (r.total1000 || 0), 0),
      t2000: rows.reduce((s, r) => s + (r.total2000 || 0), 0),
      total: rows.reduce((s, r) => s + (r.totalOrders || 0), 0),
    };
  }, [rows]);

  const fmtCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const collectionEfficiency =
    summary && summary.totalBilledSales > 0
      ? ((summary.totalClearedPayments / summary.totalBilledSales) * 100).toFixed(1)
      : '100.0';

  return (
    <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <NavbarHeader
        currentScreenTitle="Reports & Analytics"
        isRootScreen={true}
        onOpenDrawer={() => setDrawerOpen(true)}
        navigation={navigation}
      />
      <DrawerSidebar
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
        activeScreen="Reports"
      />

      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentHover} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {loading && !summary ? (
          <ReportsSkeleton />
        ) : (
          <>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Tank Order Reports</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
              Monthly tank delivery analytics per vendor — filterable & sortable
            </Text>
          </View>
        </View>

        {/* ── Date Range Presets Filter (Exact Web Parity) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsScroll}
          style={styles.presetsContainer}
        >
          {PRESETS.map((preset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => handleSelectPreset(preset)}
                activeOpacity={0.8}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: isSelected ? colors.accentHover : colors.bgCard,
                    borderColor: isSelected ? colors.accentHover : colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons
                  name={isSelected ? 'calendar' : 'calendar-outline'}
                  size={12}
                  color={isSelected ? '#ffffff' : colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.presetChipText,
                    { color: isSelected ? '#ffffff' : colors.textSecondary, fontWeight: isSelected ? '700' : '600' },
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Period Summary Banner ── */}
        <View style={[styles.periodBanner, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <View style={styles.periodTop}>
            <View style={styles.periodIcon}>
              <Ionicons name="stats-chart" size={20} color="#0284c7" />
            </View>
            <View style={styles.periodTitles}>
              <Text style={[styles.periodLabel, { color: colors.textMuted }]}>ACTIVE REPORT PERIOD</Text>
              <Text style={[styles.periodValue, { color: colors.textPrimary }]}>
                {tankReport?.period || activePreset.getRange().label}
              </Text>
            </View>
            {reportLoading && <ActivityIndicator size="small" color={colors.accentHover} />}
          </View>

          <View style={styles.periodDivider} />

          {/* Itemized 3 Strict Tank Capacities (500L, 1000L, 2000L) */}
          <View style={styles.tankCountsGrid}>
            <View style={[styles.tankCol, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
              <Text style={[styles.tankColLabel, { color: colors.textMuted }]}>500 L</Text>
              <Text style={[styles.tankColCount, { color: '#38bdf8' }]}>{periodTotals.t500}</Text>
            </View>

            <View style={[styles.tankCol, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
              <Text style={[styles.tankColLabel, { color: colors.textMuted }]}>1,000 L</Text>
              <Text style={[styles.tankColCount, { color: '#818cf8' }]}>{periodTotals.t1000}</Text>
            </View>

            <View style={[styles.tankCol, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
              <Text style={[styles.tankColLabel, { color: colors.textMuted }]}>2,000 L</Text>
              <Text style={[styles.tankColCount, { color: '#a855f7' }]}>{periodTotals.t2000}</Text>
            </View>

            <View style={[styles.tankCol, { backgroundColor: 'rgba(2, 132, 199, 0.12)', borderColor: 'rgba(2, 132, 199, 0.3)' }]}>
              <Text style={[styles.tankColLabel, { color: colors.accentHover }]}>TOTAL UNITS</Text>
              <Text style={[styles.tankColCount, { color: colors.accentHover }]}>{periodTotals.total}</Text>
            </View>
          </View>
        </View>

        {/* ── Search & Filter Controls ── */}
        <View style={styles.controlsRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search vendor in reports..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Sort Controls Bar ── */}
        <View style={styles.sortBar}>
          <Text style={[styles.sortBarTitle, { color: colors.textMuted }]}>SORT BY:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortChips}>
            <TouchableOpacity
              onPress={() => handleSort('totalOrders')}
              style={[
                styles.sortChip,
                sortKey === 'totalOrders' && { backgroundColor: 'rgba(2, 132, 199, 0.2)', borderColor: colors.accentHover },
                { borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.sortChipText, { color: sortKey === 'totalOrders' ? colors.accentHover : colors.textSecondary }]}>
                Total Orders {sortKey === 'totalOrders' ? (sortAsc ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('sellerName')}
              style={[
                styles.sortChip,
                sortKey === 'sellerName' && { backgroundColor: 'rgba(2, 132, 199, 0.2)', borderColor: colors.accentHover },
                { borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.sortChipText, { color: sortKey === 'sellerName' ? colors.accentHover : colors.textSecondary }]}>
                Vendor Name {sortKey === 'sellerName' ? (sortAsc ? 'A-Z' : 'Z-A') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('total500')}
              style={[
                styles.sortChip,
                sortKey === 'total500' && { backgroundColor: 'rgba(2, 132, 199, 0.2)', borderColor: colors.accentHover },
                { borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.sortChipText, { color: sortKey === 'total500' ? colors.accentHover : colors.textSecondary }]}>
                500L {sortKey === 'total500' ? (sortAsc ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('total1000')}
              style={[
                styles.sortChip,
                sortKey === 'total1000' && { backgroundColor: 'rgba(2, 132, 199, 0.2)', borderColor: colors.accentHover },
                { borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.sortChipText, { color: sortKey === 'total1000' ? colors.accentHover : colors.textSecondary }]}>
                1,000L {sortKey === 'total1000' ? (sortAsc ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('total2000')}
              style={[
                styles.sortChip,
                sortKey === 'total2000' && { backgroundColor: 'rgba(2, 132, 199, 0.2)', borderColor: colors.accentHover },
                { borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.sortChipText, { color: sortKey === 'total2000' ? colors.accentHover : colors.textSecondary }]}>
                2,000L {sortKey === 'total2000' ? (sortAsc ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── Vendor Tank Breakdown Cards (Exact Web Table Experience for Mobile) ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vendor Breakdown</Text>
          <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
            {sortedAndFilteredRows.length} active vendors
          </Text>
        </View>

        {reportLoading && sortedAndFilteredRows.length === 0 ? (
          <View style={[styles.card, styles.centerCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <ActivityIndicator size="small" color={colors.accentHover} />
            <Text style={[styles.emptySubtitle, { color: colors.textMuted, marginTop: 8 }]}>
              Compiling period analytics...
            </Text>
          </View>
        ) : sortedAndFilteredRows.length === 0 ? (
          <View style={[styles.card, styles.centerCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Ionicons name="cube-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, marginTop: 8 }]}>
              No tank deliveries found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {search ? `No vendors match "${search}"` : `No delivery orders logged for ${tankReport?.period || activePreset.getRange().label}`}
            </Text>
          </View>
        ) : (
          sortedAndFilteredRows.map((row, idx) => {
            return (
              <TouchableOpacity
                key={row.sellerId || idx}
                onPress={() => {
                  if (row.sellerId) {
                    navigation.navigate('SellerDetail', { sellerId: row.sellerId });
                  }
                }}
                activeOpacity={0.7}
                style={[styles.vendorCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}
              >
                <View style={styles.vendorCardTop}>
                  <View style={[
                    styles.rankBadge,
                    idx === 0 ? styles.rank1 : idx === 1 ? styles.rank2 : idx === 2 ? styles.rank3 : styles.rankOther,
                  ]}>
                    <Text style={styles.rankText}>#{idx + 1}</Text>
                  </View>

                  <View style={styles.vendorNameCol}>
                    <Text style={[styles.vendorName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {row.sellerName}
                    </Text>
                    <Text style={[styles.vendorSub, { color: colors.textMuted }]}>
                      Tap to view vendor ledger & details
                    </Text>
                  </View>

                  <View style={styles.vendorTotalBadge}>
                    <Text style={styles.vendorTotalLabel}>TOTAL</Text>
                    <Text style={styles.vendorTotalValue}>{row.totalOrders}</Text>
                  </View>
                </View>

                {/* Breakdown Chips */}
                <View style={[styles.vendorBreakdownRow, { borderTopColor: colors.borderSubtle }]}>
                  <View style={[styles.unitChip, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                    <Text style={[styles.unitChipLabel, { color: '#38bdf8' }]}>500L:</Text>
                    <Text style={[styles.unitChipVal, { color: '#38bdf8' }]}>{row.total500}</Text>
                  </View>

                  <View style={[styles.unitChip, { backgroundColor: 'rgba(129, 140, 248, 0.1)' }]}>
                    <Text style={[styles.unitChipLabel, { color: '#818cf8' }]}>1,000L:</Text>
                    <Text style={[styles.unitChipVal, { color: '#818cf8' }]}>{row.total1000}</Text>
                  </View>

                  <View style={[styles.unitChip, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                    <Text style={[styles.unitChipLabel, { color: '#a855f7' }]}>2,000L:</Text>
                    <Text style={[styles.unitChipVal, { color: '#a855f7' }]}>{row.total2000}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* ── Financial Health & Overall Platform KPIs ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Financial Overview</Text>
          <Text style={[styles.sectionCount, { color: colors.textMuted }]}>Platform lifetime</Text>
        </View>

        {/* Collection Efficiency Banner */}
        <View style={[styles.efficiencyCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <View style={styles.effLeft}>
            <Text style={[styles.effLabel, { color: colors.textMuted }]}>COLLECTION EFFICIENCY</Text>
            <Text style={[styles.effValue, { color: '#10b981' }]}>{collectionEfficiency}%</Text>
            <Text style={[styles.effSub, { color: colors.textMuted }]}>
              {fmtCurrency(summary?.totalClearedPayments || 0)} collected of {fmtCurrency(summary?.totalBilledSales || 0)}
            </Text>
          </View>
          <View style={styles.effBadge}>
            <Ionicons name="trending-up" size={26} color="#10b981" />
          </View>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>TOTAL BILLED</Text>
            <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
              {fmtCurrency(summary?.totalBilledSales || 0)}
            </Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>TOTAL CLEARED</Text>
            <Text style={[styles.kpiValue, { color: '#10b981' }]}>
              {fmtCurrency(summary?.totalClearedPayments || 0)}
            </Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>OUTSTANDING DUES</Text>
            <Text style={[styles.kpiValue, { color: (summary?.totalPendingReceivables || 0) > 0 ? '#ef4444' : '#10b981' }]}>
              {fmtCurrency(summary?.totalPendingReceivables || 0)}
            </Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>ACTIVE PARTNERS</Text>
            <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
              {summary?.totalActiveVendors || 0}
            </Text>
          </View>
        </View>
          </>
        )}
      </ScrollView>

      {/* Native App Bottom Tab Bar */}
      <BottomTabBar activeScreen="Reports" navigation={navigation} />
    </AnimatedScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  titleRow: {
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  presetsContainer: {
    marginBottom: 12,
  },
  presetsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
  },
  periodBanner: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  periodTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodTitles: {
    flex: 1,
  },
  periodLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  periodValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  periodDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  tankCountsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  tankCol: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  tankColLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  tankColCount: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  controlsRow: {
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sortBarTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sortChips: {
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 16,
  },
  vendorCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  vendorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank1: { backgroundColor: '#f59e0b' },
  rank2: { backgroundColor: '#64748b' },
  rank3: { backgroundColor: '#b45309' },
  rankOther: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  rankText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  vendorNameCol: {
    flex: 1,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  vendorSub: {
    fontSize: 10,
    marginTop: 1,
  },
  vendorTotalBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  vendorTotalLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#38bdf8',
  },
  vendorTotalValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
  },
  vendorBreakdownRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  unitChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  unitChipLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  unitChipVal: {
    fontSize: 11,
    fontWeight: '800',
  },
  efficiencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  effLeft: {
    flex: 1,
  },
  effLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  effValue: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 3,
  },
  effSub: {
    fontSize: 11,
  },
  effBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  kpiBox: {
    width: '48.5%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});
