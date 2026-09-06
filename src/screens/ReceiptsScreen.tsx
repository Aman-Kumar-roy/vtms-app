import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavbarHeader } from '../components/NavbarHeader';
import { DrawerSidebar } from '../components/DrawerSidebar';
import { ReceiptModal } from '../components/ReceiptModal';
import { BottomTabBar } from '../components/BottomTabBar';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';
import { Transaction } from '../types';
import { getTransactionsApi } from '../api/transaction';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { ReceiptCardSkeleton } from '../components/Shimmer';
import { queryClient, QUERY_KEYS } from '../query/queryClient';

type TypeFilter = 'ALL' | 'DELIVERY' | 'PAYMENT';

export const ReceiptsScreen = ({ navigation, isEmbedded }: any) => {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Read initial cache if available
  const initialCached = queryClient.getQueryData<any>(QUERY_KEYS.receipts({ page: 1, limit: 15 }));
  const [transactions, setTransactions] = useState<Transaction[]>(initialCached?.transactions || []);
  const [totalCount, setTotalCount] = useState<number>(initialCached?.pagination?.total || 0);
  const [loading, setLoading] = useState<boolean>(!initialCached);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const lastFetchTimeRef = useRef<number>(initialCached ? Date.now() : 0);
  const transactionsRef = useRef<Transaction[]>(transactions);
  transactionsRef.current = transactions;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchReceipts = useCallback(
    async (
      targetPage = 1,
      isRefresh = false,
      activeFilter: TypeFilter = typeFilter,
      activeSearch: string = debouncedSearch
    ) => {
      setError(null);
      const queryKey = QUERY_KEYS.receipts({
        page: targetPage,
        limit: 15,
        search: activeSearch.trim() || undefined,
        type: activeFilter === 'ALL' ? undefined : activeFilter,
      });

      if (targetPage > 1) {
        setLoadingMore(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else if (transactionsRef.current.length === 0) {
        setLoading(true);
      }

      try {
        const res = await getTransactionsApi({
          page: targetPage,
          limit: 15,
          search: activeSearch.trim() || undefined,
          type: activeFilter === 'ALL' ? undefined : activeFilter,
        });

        const incoming = res.transactions || [];
        if (res.pagination?.total !== undefined) {
          setTotalCount(res.pagination.total);
        }

        if (targetPage === 1) {
          queryClient.setQueryData(queryKey, res);
          lastFetchTimeRef.current = Date.now();
        }

        setTransactions((prev) => {
          if (targetPage === 1) {
            return incoming;
          }
          const existingIds = new Set(prev.map((t) => t._id || t.id));
          const uniqueIncoming = incoming.filter((t: any) => !existingIds.has(t._id || t.id));
          return [...prev, ...uniqueIncoming];
        });

        setPage(targetPage);
        const nextAvailable = res.pagination?.hasNextPage ?? incoming.length === 15;
        setHasMore(nextAvailable);
      } catch (e: any) {
        console.warn('Failed to load receipts:', e);
        if (targetPage === 1) {
          setError(e.message || 'Could not connect to server to fetch receipts');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, typeFilter]
  );

  const handleTypeFilter = (newType: TypeFilter) => {
    if (newType === typeFilter) return;
    setTypeFilter(newType);
    const queryKey = QUERY_KEYS.receipts({
      page: 1,
      limit: 15,
      search: debouncedSearch.trim() || undefined,
      type: newType === 'ALL' ? undefined : newType,
    });
    const cached = queryClient.getQueryData<any>(queryKey);
    if (cached?.transactions) {
      setTransactions(cached.transactions);
      if (cached.pagination?.total !== undefined) {
        setTotalCount(cached.pagination.total);
      }
      setLoading(false);
    } else {
      setTransactions([]);
      setLoading(true);
    }
    fetchReceipts(1, false, newType, debouncedSearch);
  };

  // Trigger search changes from page 1
  useEffect(() => {
    fetchReceipts(1, false, typeFilter, debouncedSearch);
  }, [debouncedSearch]);

  useFocusEffect(
    useCallback(() => {
      const isStale = Date.now() - lastFetchTimeRef.current > 1000 * 60 * 2;
      if (transactionsRef.current.length === 0 || isStale) {
        fetchReceipts(1, false, typeFilter, debouncedSearch);
      }
    }, [fetchReceipts, typeFilter, debouncedSearch])
  );

  const onRefresh = () => {
    fetchReceipts(1, true, typeFilter, debouncedSearch);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchReceipts(page + 1);
    }
  };

  const openReceipt = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalVisible(true);
  };

  const fmtCurrency = (val: number) => {
    return (
      '₹ ' +
      Number(val || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

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
          currentScreenTitle="Receipts & Vouchers"
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
          activeScreen="Receipts"
        />
      )}

      {/* Page Header Aligned with Web */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <View style={styles.titleBadge}>
              <Ionicons name="receipt-outline" size={18} color="#38bdf8" />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Receipts Center</Text>
          </View>

          {/* Total Receipts Pill */}
          <View style={styles.totalPill}>
            <Ionicons name="receipt-outline" size={13} color="#10b981" style={{ marginRight: 5 }} />
            <Text style={styles.totalPillText}>{totalCount} Total Receipts</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Paginated official receipts for all deliveries and payment settlements
        </Text>
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search by vendor, note, ID..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs: All Receipts | Deliveries | Payments */}
      <View style={[styles.tabsContainer, { backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: colors.borderSubtle }]}>
        <TouchableOpacity
          style={[styles.tabItem, typeFilter === 'ALL' && styles.tabItemActiveAll]}
          onPress={() => handleTypeFilter('ALL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, typeFilter === 'ALL' ? styles.tabTextActive : { color: colors.textMuted }]}>
            All Receipts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, typeFilter === 'DELIVERY' && styles.tabItemActiveDelivery]}
          onPress={() => handleTypeFilter('DELIVERY')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-up-circle-outline"
            size={14}
            color={typeFilter === 'DELIVERY' ? '#ffffff' : colors.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, typeFilter === 'DELIVERY' ? styles.tabTextActive : { color: colors.textMuted }]}>
            Deliveries
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, typeFilter === 'PAYMENT' && styles.tabItemActivePayment]}
          onPress={() => handleTypeFilter('PAYMENT')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-down-circle-outline"
            size={14}
            color={typeFilter === 'PAYMENT' ? '#ffffff' : colors.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, typeFilter === 'PAYMENT' ? styles.tabTextActive : { color: colors.textMuted }]}>
            Payments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.textPrimary }]}>Failed to Load Receipts</Text>
          <Text style={[styles.errorSub, { color: colors.textMuted }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchReceipts(1)} activeOpacity={0.8}>
            <Ionicons name="refresh" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.retryBtnText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : loading && transactions.length === 0 ? (
        <View style={{ paddingHorizontal: 2, gap: 4 }}>
          <ReceiptCardSkeleton />
          <ReceiptCardSkeleton />
          <ReceiptCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id || item.id || String(Math.random())}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentHover} />}
          contentContainerStyle={{ paddingBottom: 40 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={colors.accentHover} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No official receipts found matching your criteria.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isDelivery = item.type === 'DELIVERY';
            const isFallbackName = (n?: string | null) =>
              !n || n === 'Valued Vendor Partner' || n === 'Valued Vendor' || n === 'Vendor Account' || n === 'Vendor';

            const vendorName =
              (!isFallbackName(item.sellerName) ? item.sellerName : null) ||
              (!isFallbackName(item.seller?.name) ? item.seller?.name : null) ||
              (typeof item.sellerId === 'object' && !isFallbackName((item.sellerId as any)?.name)
                ? (item.sellerId as any)?.name
                : null) ||
              item.sellerName ||
              item.seller?.name ||
              'Valued Vendor';

            const vendorPhone =
              item.sellerPhone ||
              (item.seller && item.seller.phone) ||
              (typeof item.sellerId === 'object' ? (item.sellerId as any)?.phone : null);

            // Format date as e.g. "5 Sept 2026"
            const d = new Date(item.date);
            const formattedDate = isNaN(d.getTime())
              ? item.date
              : `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;

            // Itemized tank units for delivery (strict 500L, 1000L, 2000L)
            const tankLines: string[] = [];
            if (isDelivery) {
              if (item.tank500) tankLines.push(`${item.tank500} × 500L`);
              if (item.tank1000) tankLines.push(`${item.tank1000} × 1000L`);
              if (item.tank2000) tankLines.push(`${item.tank2000} × 2000L`);
            }

            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}
                onPress={() => openReceipt(item)}
                activeOpacity={0.75}
              >
                {/* Header: Date & Delivery / Payment Badge */}
                <View style={styles.cardTopRow}>
                  <Text style={[styles.cardDate, { color: colors.textMuted }]}>{formattedDate}</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: isDelivery
                          ? 'rgba(79, 70, 229, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                        borderColor: isDelivery
                          ? 'rgba(79, 70, 229, 0.3)'
                          : 'rgba(16, 185, 129, 0.3)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: isDelivery ? '#818cf8' : '#10b981' },
                      ]}
                    >
                      {isDelivery ? 'Delivery' : 'Payment'}
                    </Text>
                  </View>
                </View>

                {/* Vendor Name & Phone */}
                <View style={styles.vendorInfoBlock}>
                  <Text style={[styles.vendorName, { color: colors.textPrimary }]}>
                    {vendorName}
                  </Text>
                  {vendorPhone ? (
                    <Text style={[styles.vendorPhone, { color: colors.textMuted }]}>
                      {vendorPhone}
                    </Text>
                  ) : null}
                </View>

                {/* Tanks Breakdown & Amount Row */}
                <View style={styles.cardDetailsRow}>
                  <View style={styles.tanksCol}>
                    {isDelivery ? (
                      tankLines.length > 0 ? (
                        tankLines.map((line, idx) => (
                          <Text key={idx} style={[styles.tankLineText, { color: colors.textSecondary }]}>
                            {line}
                          </Text>
                        ))
                      ) : (
                        <Text style={[styles.tankLineText, { color: colors.textSecondary }]}>
                          Tank Delivery
                        </Text>
                      )
                    ) : (
                      <Text style={[styles.tankLineText, { color: colors.textSecondary }]}>
                        {item.paymentMode ? `Settlement: ${item.paymentMode}` : 'Direct Payment'}
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.amountText,
                      { color: isDelivery ? '#38bdf8' : '#10b981' },
                    ]}
                  >
                    {fmtCurrency(item.amount)}
                  </Text>
                </View>

                {/* Action Row: Receipt Button */}
                <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
                  <TouchableOpacity
                    style={styles.printBtn}
                    onPress={() => openReceipt(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="receipt-outline" size={14} color="#0284c7" style={{ marginRight: 6 }} />
                    <Text style={styles.printBtnText}>Receipt</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {selectedTx && (
        <ReceiptModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          transaction={selectedTx}
          seller={selectedTx.seller as any}
        />
      )}

      {/* Native App Bottom Tab Bar */}
      {!isEmbedded && <BottomTabBar activeScreen="Receipts" navigation={navigation} />}
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
  headerContainer: {
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  totalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  totalPillText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabItemActiveAll: {
    backgroundColor: '#0284c7',
  },
  tabItemActiveDelivery: {
    backgroundColor: '#4f46e5',
  },
  tabItemActivePayment: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  errorBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  errorSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  vendorInfoBlock: {
    marginBottom: 10,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  vendorPhone: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  tanksCol: {
    flex: 1,
    gap: 3,
  },
  tankLineText: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 17,
    fontWeight: '900',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  printBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
  },
});
