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
import { getTankSummaryReportApi } from '../api/reports';
import { SellerTankSummaryRow, TankReportResponse } from '../types';
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
import { queryClient, QUERY_KEYS } from '../query/queryClient';

export const ReportsScreen = ({ navigation, isEmbedded = false, isActive = true }: any) => {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter state
  const [activePresetId, setActivePresetId] = useState<string>('this_month');

  const activePreset = useMemo(() => {
    return PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];
  }, [activePresetId]);

  const activeParams = useMemo(() => {
    const range = activePreset.getRange();
    const params: { startDate?: string; endDate?: string } = {};
    if (range.startDate && range.endDate) {
      params.startDate = range.startDate;
      params.endDate = range.endDate;
    }
    return params;
  }, [activePreset]);

  // Read initial cache if present
  const initialCached = queryClient.getQueryData<TankReportResponse>(
    QUERY_KEYS.tankReports(activeParams)
  );

  const [tankReport, setTankReport] = useState<TankReportResponse | null>(() => initialCached || null);
  const [loading, setLoading] = useState<boolean>(() => !initialCached);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [search, setSearch] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('totalOrders');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const loadTankReport = useCallback(async (preset: DatePreset, isPullRefresh = false) => {
    const range = preset.getRange();
    const params: { startDate?: string; endDate?: string } = {};
    if (range.startDate && range.endDate) {
      params.startDate = range.startDate;
      params.endDate = range.endDate;
    }
    const queryKey = QUERY_KEYS.tankReports(params);
    const cached = queryClient.getQueryData<TankReportResponse>(queryKey);

    if (isPullRefresh) {
      setRefreshing(true);
    } else if (cached) {
      setTankReport(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const formatted = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          const data = await getTankSummaryReportApi(params);
          return {
            ...data,
            period: range.label,
          };
        },
        staleTime: 60 * 1000,
      });
      setTankReport(formatted);
    } catch (e) {
      console.warn('Failed to load tank report:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch whenever active preset changes
  useEffect(() => {
    loadTankReport(activePreset);
  }, [activePreset, loadTankReport]);

  // Revalidate on screen focus (skip initial mount to avoid duplicate fetch)
  const isFirstMountRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstMountRef.current) {
        isFirstMountRef.current = false;
        return;
      }
      loadTankReport(activePreset);
    }, [activePreset, loadTankReport])
  );

  // Revalidate only when tab transitions from inactive to active
  const prevActiveRef = useRef(isActive);
  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      loadTankReport(activePreset);
    }
    prevActiveRef.current = isActive;
  }, [isActive, activePreset, loadTankReport]);

  const onRefresh = () => {
    loadTankReport(activePreset, true);
  };

  const handleSelectPreset = (preset: DatePreset) => {
    setActivePresetId(preset.id);
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

  return (
    <AnimatedScreenWrapper
      style={[
        styles.container,
        { backgroundColor: colors.bgPrimary },
        isEmbedded && { paddingHorizontal: 0, paddingTop: 0 },
      ]}
    >
      {!isEmbedded && (
        <NavbarHeader
          currentScreenTitle="Reports & Analytics"
          isRootScreen={true}
          onOpenDrawer={() => setDrawerOpen(true)}
          navigation={navigation}
        />
      )}
      {!isEmbedded && (
        <DrawerSidebar
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          navigation={navigation}
          activeScreen="Reports"
        />
      )}

      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentHover} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {loading && !tankReport ? (
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

        {loading && sortedAndFilteredRows.length === 0 ? (
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
                      Tap to view vendor profile & transactions
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
          </>
        )}
      </ScrollView>

      {/* Native App Bottom Tab Bar */}
      {!isEmbedded && <BottomTabBar activeScreen="Reports" navigation={navigation} />}
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
});
