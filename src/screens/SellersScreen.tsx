import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSellersApi } from '../api/seller';
import { Seller } from '../types';
import { NavbarHeader } from '../components/NavbarHeader';
import { DrawerSidebar } from '../components/DrawerSidebar';
import { AddSellerModal } from '../components/AddSellerModal';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { SellerCard } from '../components/SellerCard';
import { ToastNotification } from '../components/ToastNotification';
import { BottomTabBar } from '../components/BottomTabBar';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';
import { useFocusEffect } from '@react-navigation/native';
import { SellerCardSkeleton } from '../components/Shimmer';
import { queryClient, QUERY_KEYS, invalidateSellers, invalidateTransactions } from '../query/queryClient';

interface SellersScreenProps {
  route?: any;
  navigation: any;
  isEmbedded?: boolean;
}

export const SellersScreen: React.FC<SellersScreenProps> = ({ route, navigation, isEmbedded = false }) => {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Initialize with cached sellers if available in QueryClient
  const cachedInitial = queryClient.getQueryData<any>(QUERY_KEYS.sellers({ page: 1, limit: 50 }));
  const [sellers, setSellers] = useState<Seller[]>(() => cachedInitial?.sellers || []);
  const [search, setSearch] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DUES' | 'SETTLED'>('ALL');
  const [loading, setLoading] = useState<boolean>(() => !cachedInitial?.sellers?.length);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [overallTotals, setOverallTotals] = useState<any>(() => cachedInitial?.overallTotals || null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [addSellerVisible, setAddSellerVisible] = useState(false);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [txModalType, setTxModalType] = useState<'DELIVERY' | 'PAYMENT'>('DELIVERY');
  const [txSeller, setTxSeller] = useState<Seller | null>(null);
  const sellersRef = useRef<Seller[]>(sellers);
  sellersRef.current = sellers;
  const lastFetchTimeRef = useRef<number>(cachedInitial ? Date.now() : 0);

  useEffect(() => {
    if (route?.params?.successMsg) {
      setToastMsg(route.params.successMsg);
      navigation.setParams({ successMsg: undefined });
    }
  }, [route?.params?.successMsg]);

  const fetchSellers = useCallback(async (targetPage = 1, isRefresh = false) => {
    if (targetPage > 1) {
      setLoadingMore(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else if (sellersRef.current.length === 0) {
      setLoading(true);
    }

    try {
      const data = await getSellersApi({ page: targetPage, limit: 50 });
      const incoming = data.sellers || [];

      // Store page 1 in QueryClient cache
      if (targetPage === 1) {
        queryClient.setQueryData(QUERY_KEYS.sellers({ page: 1, limit: 50 }), data);
        lastFetchTimeRef.current = Date.now();
      }
      
      setSellers((prev) => {
        if (targetPage === 1) {
          return incoming;
        }
        const existingIds = new Set(prev.map((s) => s._id || s.id));
        const uniqueIncoming = incoming.filter((s) => !existingIds.has(s._id || s.id));
        return [...prev, ...uniqueIncoming];
      });

      if (data.overallTotals) {
        setOverallTotals(data.overallTotals);
      }

      setPage(targetPage);
      const nextAvailable = data.pagination?.hasNextPage ?? (incoming.length === 50);
      setHasMore(nextAvailable);
    } catch (e) {
      console.warn('Error fetching sellers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  // Stale-while-revalidate check on focus: only re-fetch if cache is stale (> 5 mins) or list is empty
  useFocusEffect(
    useCallback(() => {
      const isStale = Date.now() - lastFetchTimeRef.current > 1000 * 60 * 5;
      if (sellersRef.current.length === 0 || isStale) {
        fetchSellers(1, false);
      }
    }, [fetchSellers])
  );

  const onRefresh = () => {
    fetchSellers(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchSellers(page + 1);
    }
  };

  const fmtCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const filtered = sellers.filter((s) => {
    const q = (search || '').toLowerCase().trim();
    const name = (s.name || '').toLowerCase();
    const phone = (s.phone || '');
    const email = (s.email || '').toLowerCase();
    const gst = (s.gstNumber || '').toLowerCase();
    const matchesSearch =
      !q ||
      name.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      gst.includes(q);

    if (!matchesSearch) return false;

    if (filterMode === 'DUES') return (s.totalDues || 0) > 0;
    if (filterMode === 'SETTLED') return (s.totalDues || 0) <= 0;
    return true;
  });

  return (
    <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }, isEmbedded && { paddingHorizontal: 0, paddingTop: 0 }]}>
      {!isEmbedded && (
        <>
          <NavbarHeader
            currentScreenTitle="Vendors Directory"
            isRootScreen={true}
            onOpenDrawer={() => setDrawerOpen(true)}
            navigation={navigation}
          />
          <DrawerSidebar
            visible={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            navigation={navigation}
            activeScreen="Sellers"
          />
        </>
      )}

      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Vendors Directory</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddSellerVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={14} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Add Vendor</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search by vendor, phone, GST..."
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

      {/* Filter Tabs */}
      <View style={styles.filterPillsRow}>
        {(['ALL', 'DUES', 'SETTLED'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.filterPill,
              { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle },
              filterMode === mode ? styles.filterPillActive : null,
            ]}
            onPress={() => setFilterMode(mode)}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: filterMode === mode ? '#fff' : colors.textMuted },
              ]}
            >
              {mode === 'ALL' ? 'All Vendors' : mode === 'DUES' ? 'Pending Dues' : 'Settled'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && sellers.length === 0 ? (
        <View style={{ paddingHorizontal: 2, gap: 4 }}>
          <SellerCardSkeleton />
          <SellerCardSkeleton />
          <SellerCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filtered}
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
              <Ionicons name="people-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {search ? 'No vendors matching your search.' : 'No vendors registered yet.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <SellerCard
              seller={item}
              onPress={() =>
                navigation.navigate('SellerDetail', {
                  sellerId: item._id || item.id,
                  sellerName: item.name,
                  seller: item,
                })
              }
            />
          )}
        />
      )}

      {/* Add Seller Modal */}
      <AddSellerModal
        visible={addSellerVisible}
        onClose={() => setAddSellerVisible(false)}
        onSuccess={async (_created) => {
          setToastMsg('Seller created successfully.');
          await invalidateSellers();
          fetchSellers(1, true);
        }}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={txModalVisible}
        onClose={() => {
          setTxModalVisible(false);
          setTxSeller(null);
        }}
        seller={txSeller}
        sellers={sellers}
        initialType={txModalType}
        onSuccess={async (_tx) => {
          await invalidateTransactions(txSeller?._id);
          fetchSellers(1, true);
        }}
      />

      {/* In-Context Toast Notification */}
      <ToastNotification
        visible={!!toastMsg}
        message={toastMsg || ''}
        onDismiss={() => setToastMsg(null)}
      />

      {/* Native App Bottom Tab Bar (Only when standalone) */}
      {!isEmbedded && <BottomTabBar activeScreen="Sellers" navigation={navigation} />}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
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
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '800',
  },
  nameGroup: {
    flex: 1,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  vendorContact: {
    fontSize: 11,
    marginTop: 2,
  },
  gstBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gstBadgeText: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '700',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  statCol: {
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statNum: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 4,
  },
  tankChips: {
    flexDirection: 'row',
    gap: 8,
  },
  tankChip: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  quickActionText: {
    color: '#0284c7',
    fontSize: 11,
    fontWeight: '700',
  },
});
