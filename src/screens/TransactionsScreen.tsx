import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTransactionsApi } from '../api/transaction';
import { Transaction, Seller } from '../types';
import { NavbarHeader } from '../components/NavbarHeader';
import { DrawerSidebar } from '../components/DrawerSidebar';
import { ReceiptModal } from '../components/ReceiptModal';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { ToastNotification } from '../components/ToastNotification';
import { BottomTabBar } from '../components/BottomTabBar';
import { getSellersApi } from '../api/seller';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';
import { useFocusEffect } from '@react-navigation/native';

import { TransactionCardSkeleton } from '../components/Shimmer';
import { queryClient, QUERY_KEYS, invalidateTransactions } from '../query/queryClient';

interface TransactionsScreenProps {
  route?: any;
  navigation: any;
  isEmbedded?: boolean;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ route, navigation, isEmbedded = false }) => {
  const sellerId = route?.params?.sellerId;
  const { colors } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'DELIVERY' | 'PAYMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cacheKey = QUERY_KEYS.transactions({
    sellerId,
    type: filterType === 'ALL' ? undefined : filterType,
    search: searchQuery.trim() || undefined,
    page: 1,
    limit: 20,
  });
  const cachedInitial = queryClient.getQueryData<any>(cacheKey);

  const [transactions, setTransactions] = useState<Transaction[]>(() => cachedInitial?.transactions || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedInitial?.transactions?.length);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [createTxVisible, setCreateTxVisible] = useState(false);
  const [createTxType, setCreateTxType] = useState<'DELIVERY' | 'PAYMENT'>('DELIVERY');
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [expandedDeliveries, setExpandedDeliveries] = useState<Record<string, boolean>>({});
  const toggleExpand = (id: string) => setExpandedDeliveries((prev) => ({ ...prev, [id]: !prev[id] }));
  const transactionsRef = useRef<Transaction[]>(transactions);
  transactionsRef.current = transactions;
  const lastFetchTimeRef = useRef<number>(cachedInitial ? Date.now() : 0);

  const loadData = useCallback(
    async (
      targetPage = 1,
      isRefresh = false,
      activeFilter: 'ALL' | 'DELIVERY' | 'PAYMENT' = filterType,
      activeSearch: string = searchQuery
    ) => {
      if (targetPage > 1) {
        setLoadingMore(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else if (transactionsRef.current.length === 0) {
        setLoading(true);
      }

      try {
        const promises: [Promise<any>, Promise<any>?] = [
          getTransactionsApi({
            sellerId,
            type: activeFilter === 'ALL' ? undefined : activeFilter,
            search: activeSearch.trim() || undefined,
            page: targetPage,
            limit: 20,
          }),
        ];

        if (targetPage === 1 && allSellers.length === 0) {
          promises.push(getSellersApi().catch(() => ({ sellers: [] })));
        }

        const [res, sellerRes] = await Promise.all(promises);
        const incoming = res.transactions || [];

        if (targetPage === 1) {
          const currentKey = QUERY_KEYS.transactions({
            sellerId,
            type: activeFilter === 'ALL' ? undefined : activeFilter,
            search: activeSearch.trim() || undefined,
            page: 1,
            limit: 20,
          });
          queryClient.setQueryData(currentKey, res);
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

        if (sellerRes?.sellers) {
          setAllSellers(sellerRes.sellers);
        }

        setPage(targetPage);
        const nextAvailable = res.pagination?.hasNextPage ?? incoming.length === 20;
        setHasMore(nextAvailable);
      } catch (e) {
        console.warn('Error loading transactions:', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [sellerId, filterType, searchQuery, allSellers.length]
  );

  const handleFilterChange = (t: 'ALL' | 'DELIVERY' | 'PAYMENT') => {
    if (t === filterType) return;
    setFilterType(t);
    const currentKey = QUERY_KEYS.transactions({
      sellerId,
      type: t === 'ALL' ? undefined : t,
      search: searchQuery.trim() || undefined,
      page: 1,
      limit: 20,
    });
    const cached = queryClient.getQueryData<any>(currentKey);
    if (cached?.transactions) {
      setTransactions(cached.transactions);
      setLoading(false);
    } else {
      setTransactions([]);
      setLoading(true);
    }
    loadData(1, false, t, searchQuery);
  };

  // Handle search changes
  useEffect(() => {
    loadData(1, false, filterType, searchQuery);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      const isStale = Date.now() - lastFetchTimeRef.current > 1000 * 60 * 2;
      if (transactionsRef.current.length === 0 || isStale) {
        loadData(1, false, filterType, searchQuery);
      }
    }, [loadData, filterType, searchQuery])
  );

  const onRefresh = () => {
    loadData(1, true, filterType, searchQuery);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      loadData(page + 1);
    }
  };

  const fmtCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const openReceipt = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalVisible(true);
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
          currentScreenTitle="Transactions Feed"
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
          activeScreen="Transactions"
        />
      )}

      {/* Title & Quick Actions */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Transactions Feed</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{transactions.length} Records</Text>
          </View>
        </View>

        <View style={styles.quickBtns}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#0284c7' }]}
            onPress={() => {
              setCreateTxType('DELIVERY');
              setCreateTxVisible(true);
            }}
          >
            <Text style={styles.quickBtnText}>+ Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#10b981' }]}
            onPress={() => {
              setCreateTxType('PAYMENT');
              setCreateTxVisible(true);
            }}
          >
            <Text style={styles.quickBtnText}>+ Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search by note, amount, payment mode..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        {(['ALL', 'DELIVERY', 'PAYMENT'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.filterTab,
              { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle },
              filterType === t ? styles.filterTabActive : null,
            ]}
            onPress={() => handleFilterChange(t)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filterType === t ? '#fff' : colors.textMuted },
              ]}
            >
              {t === 'ALL' ? 'All Operations' : t === 'DELIVERY' ? 'Deliveries (Tanks)' : 'Payments Received'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && transactions.length === 0 ? (
        <View style={{ paddingHorizontal: 2, gap: 4 }}>
          <TransactionCardSkeleton />
          <TransactionCardSkeleton />
          <TransactionCardSkeleton />
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
              <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No transactions found for this query.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const txnId = (item.id || item._id || '') as string;
            const isDelivery = item.type === 'DELIVERY';
            const vendorName =
              (item.seller && item.seller.name) ||
              (item.sellerId && typeof item.sellerId === 'object' ? (item.sellerId as any).name : 'Vendor');
            const paidAmount = item.paidAmount !== undefined
              ? item.paidAmount
              : (item.linkedPayments ? item.linkedPayments.reduce((s: number, p: any) => s + p.amount, 0) : 0);
            const remainingDue = item.remainingDue !== undefined
              ? item.remainingDue
              : Math.max(0, item.amount - paidAmount);
            const paidPercent = item.amount > 0 ? Math.min(100, Math.round((paidAmount / item.amount) * 100)) : 0;

            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}
                onPress={() => openReceipt(item)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: isDelivery ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)' },
                      ]}
                    >
                      <Ionicons
                        name={isDelivery ? 'cube' : 'cash'}
                        size={14}
                        color={isDelivery ? '#3b82f6' : '#10b981'}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.typeText, { color: isDelivery ? '#3b82f6' : '#10b981' }]}>
                        {isDelivery ? 'DELIVERY' : 'PAYMENT'}
                      </Text>
                    </View>

                    {isDelivery ? (
                      remainingDue <= 0 ? (
                        <View style={[styles.orderStatusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                          <Ionicons name="checkmark-circle" size={11} color="#10b981" style={{ marginRight: 3 }} />
                          <Text style={[styles.orderStatusText, { color: '#10b981' }]}>Fully Paid</Text>
                        </View>
                      ) : paidAmount > 0 ? (
                        <View style={[styles.orderStatusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                          <Ionicons name="time-outline" size={11} color="#f59e0b" style={{ marginRight: 3 }} />
                          <Text style={[styles.orderStatusText, { color: '#f59e0b' }]}>Partial ({paidPercent}%)</Text>
                        </View>
                      ) : (
                        <View style={[styles.orderStatusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                          <Text style={[styles.orderStatusText, { color: '#f59e0b' }]}>Unpaid</Text>
                        </View>
                      )
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.amountText,
                      { color: isDelivery ? colors.textPrimary : '#10b981' },
                    ]}
                  >
                    {isDelivery ? fmtCurrency(item.amount) : `-${fmtCurrency(item.amount)}`}
                  </Text>
                </View>

                {/* Vendor & Date */}
                <View style={styles.cardMid}>
                  <Text style={[styles.vendorLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                    {vendorName}
                  </Text>
                  <Text style={[styles.dateText, { color: colors.textMuted }]}>
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>

                {/* Specifics */}
                {isDelivery ? (
                  <View style={{ gap: 4 }}>
                    <View style={styles.tankChips}>
                      <Text style={[styles.tankChip, { color: '#3b82f6' }]}>500L: {item.tank500 || 0}</Text>
                      <Text style={[styles.tankChip, { color: '#10b981' }]}>1000L: {item.tank1000 || 0}</Text>
                      <Text style={[styles.tankChip, { color: '#8b5cf6' }]}>2000L: {item.tank2000 || 0}</Text>
                    </View>

                    {/* Minimalist Settlement Financial Row with 3px Progress Bar */}
                    <View style={styles.minimalFinanceBox}>
                      <View style={styles.minimalFinanceRow}>
                        <Text style={[styles.minimalFinanceText, { color: colors.textMuted }]}>
                          Bill: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{fmtCurrency(item.amount)}</Text>
                        </Text>
                        <Text style={[styles.minimalFinanceText, { color: colors.textMuted }]}>
                          Paid: <Text style={{ color: '#10b981', fontWeight: '700' }}>{fmtCurrency(paidAmount)}</Text>
                        </Text>
                        <Text style={[styles.minimalFinanceText, { color: colors.textMuted }]}>
                          Due: <Text style={{ color: remainingDue > 0 ? '#ef4444' : '#10b981', fontWeight: '700' }}>{fmtCurrency(remainingDue)}</Text>
                        </Text>
                      </View>
                      <View style={[styles.progressBarTrack, { backgroundColor: colors.bgSecondary }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${paidPercent}%`,
                              backgroundColor: remainingDue <= 0 ? '#10b981' : '#f59e0b',
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Minimalist Associated Payments Section */}
                    {item.linkedPayments && item.linkedPayments.length > 0 ? (
                      <View style={styles.minimalLinkedContainer}>
                        <TouchableOpacity
                          style={styles.minimalToggleBtn}
                          onPress={() => toggleExpand(txnId)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={expandedDeliveries[txnId] ? 'chevron-down' : 'chevron-forward'}
                            size={12}
                            color="#0284c7"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.minimalToggleText}>
                            {item.linkedPayments.length} Associated Payment{item.linkedPayments.length > 1 ? 's' : ''} ({paidPercent}% paid)
                          </Text>
                        </TouchableOpacity>

                        {expandedDeliveries[txnId] && (
                          <View style={styles.minimalPaymentsList}>
                            {item.linkedPayments.map((p: any, idx: number) => (
                              <View
                                key={p.id || p._id || String(idx)}
                                style={styles.minimalPaymentRow}
                              >
                                <View style={styles.minimalDot} />
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Text style={[styles.minimalPaymentMeta, { color: colors.textMuted }]}>
                                    {p.paymentMode || 'Direct'} • {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                  </Text>
                                  <Text style={styles.minimalPaymentAmount}>
                                    -{fmtCurrency(p.amount)}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.paymentModeTag, { color: '#10b981' }]}>
                      Method: {item.paymentMode || 'Direct'}
                    </Text>

                    {/* Minimalist Associated Delivery Pill */}
                    {(item.parentDelivery || item.parentId) ? (
                      <View style={[styles.minimalLinkedPill, { backgroundColor: 'rgba(2, 132, 199, 0.1)' }]}>
                        <Ionicons name="link-outline" size={12} color="#0284c7" style={{ marginRight: 4 }} />
                        <Text style={styles.minimalLinkedText} numberOfLines={1}>
                          Settlement for Delivery #{(item.parentDelivery?.id || item.parentId || '').slice(-6).toUpperCase()}
                          {item.parentDelivery?.amount ? ` (${fmtCurrency(item.parentDelivery.amount)} bill)` : ''}
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginTop: 4 }}>
                        General Account Settlement (Unlinked Credit)
                      </Text>
                    )}
                  </View>
                )}

                {item.note ? (
                  <Text style={[styles.noteText, { color: colors.textMuted }]} numberOfLines={1}>
                    "{item.note}"
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={[styles.viewReceiptLink, { color: colors.accentHover }]}>
                    Inspect Receipt Voucher →
                  </Text>
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
          transaction={selectedTx as any}
        />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={createTxVisible}
        onClose={() => setCreateTxVisible(false)}
        sellers={allSellers}
        initialType={createTxType}
        onSuccess={async (_tx) => {
          await invalidateTransactions();
          loadData(1, true);
        }}
      />

      {/* In-Context Toast Notification */}
      <ToastNotification
        visible={!!toastMsg}
        message={toastMsg || ''}
        onDismiss={() => setToastMsg(null)}
      />

      {/* Native App Bottom Tab Bar */}
      {!isEmbedded && <BottomTabBar activeScreen="Transactions" navigation={navigation} />}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  quickBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  quickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  quickBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterTabActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardMid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  vendorLabel: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  dateText: {
    fontSize: 11,
  },
  tankChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  tankChip: {
    fontSize: 11,
    fontWeight: '700',
  },
  paymentInfo: {
    marginBottom: 6,
  },
  paymentModeTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  viewReceiptLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  orderStatusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  minimalFinanceBox: {
    marginTop: 2,
    marginBottom: 4,
  },
  minimalFinanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  minimalFinanceText: {
    fontSize: 11,
  },
  progressBarTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  minimalLinkedContainer: {
    marginTop: 4,
  },
  minimalToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  minimalToggleText: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '700',
  },
  minimalPaymentsList: {
    marginTop: 4,
    paddingLeft: 4,
    gap: 4,
  },
  minimalPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  minimalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  minimalPaymentMeta: {
    fontSize: 11,
  },
  minimalPaymentAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  minimalLinkedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  minimalLinkedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
});
