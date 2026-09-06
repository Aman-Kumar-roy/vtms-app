import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Seller } from '../types';
import { NavbarHeader } from '../components/NavbarHeader';
import { DrawerSidebar } from '../components/DrawerSidebar';
import { TankSummaryCard } from '../components/TankSummaryCard';
import { AddSellerModal } from '../components/AddSellerModal';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { SellerCard } from '../components/SellerCard';
import { ToastNotification } from '../components/ToastNotification';
import { BottomTabBar } from '../components/BottomTabBar';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';
import { DashboardSkeleton } from '../components/Shimmer';
import { useDashboardQuery } from '../query/useQueries';
import { invalidateDashboard, invalidateTransactions } from '../query/queryClient';
import { useFocusEffect } from '@react-navigation/native';

interface DashboardScreenProps {
  navigation: any;
  route?: any;
  isEmbedded?: boolean;
  isActive?: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation, isEmbedded = false, isActive = true }) => {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // In-context modals & notifications
  const [addSellerVisible, setAddSellerVisible] = useState(false);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [txModalType, setTxModalType] = useState<'DELIVERY' | 'PAYMENT'>('DELIVERY');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  // React Query Caching Layer with Stale-While-Revalidate
  const { report, sellers, isLoading, isFetching, isError, error, refetch } = useDashboardQuery();

  // Revalidate only when tab transitions from inactive to active
  const prevActiveRef = useRef(isActive);
  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      refetch();
    }
    prevActiveRef.current = isActive;
  }, [isActive, refetch]);

  // Revalidate on screen focus (skip initial mount to prevent duplicate fetch)
  const isFirstMountRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstMountRef.current) {
        isFirstMountRef.current = false;
        return;
      }
      refetch();
    }, [refetch])
  );

  const onRefresh = async () => {
    setIsPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsPullRefreshing(false);
    }
  };

  const fmtCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const collectionEfficiency =
    report && (report.totalBilledSales || 0) > 0
      ? ((report.totalClearedPayments / report.totalBilledSales) * 100).toFixed(1)
      : '100.0';

  const leadingVendors = (report?.topVendors || []).slice(0, 5);

  return (
    <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }, isEmbedded && { paddingHorizontal: 0, paddingTop: 0 }]}>
      {!isEmbedded && (
        <>
          <NavbarHeader
            currentScreenTitle="Dashboard"
            isRootScreen={true}
            onOpenDrawer={() => setDrawerOpen(true)}
            navigation={navigation}
          />
          <DrawerSidebar
            visible={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            navigation={navigation}
            activeScreen="Dashboard"
          />
        </>
      )}

      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isPullRefreshing} onRefresh={onRefresh} tintColor={colors.accentHover} />}
      >
        {isLoading && !report && sellers.length === 0 ? (
          <DashboardSkeleton />
        ) : (
          <>
            {isError && !report && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.errorText}>{(error as any)?.message || 'Unable to connect to server'}</Text>
                <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

        {/* Executive Admin Hub Card — Financial Summary */}
        <View style={[styles.adminHubCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <View style={styles.hubHeaderRow}>
            <View style={styles.hubBrandGroup}>
              <View style={styles.hubLogoContainer}>
                <Image
                  source={require('../../assets/logo.jpg')}
                  style={styles.hubLogoImg}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.hubBrandTextWrap}>
                <Text style={[styles.hubBrandName, { color: colors.textPrimary }]} numberOfLines={1}>
                  Vasudha Polymer
                </Text>
                <Text style={[styles.hubSubTitle, { color: colors.textMuted }]} numberOfLines={1}>
                  Admin Hub Overview
                </Text>
              </View>
            </View>

            <View style={styles.activeSellersBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeSellersText}>
                {report?.totalActiveVendors ?? sellers.length} Active Sellers
              </Text>
            </View>
          </View>

          {/* Minimal, High-Hierarchy Financial Summary */}
          <View style={[styles.summaryContainer, { backgroundColor: 'rgba(0, 0, 0, 0.25)' }]}>
            {/* Hero Billed Sales */}
            <View style={styles.heroSummaryBlock}>
              <Text style={[styles.heroSummaryLabel, { color: colors.textMuted }]}>TOTAL BILLED</Text>
              <Text style={[styles.heroSummaryValue, { color: colors.accentHover }]}>
                {fmtCurrency(report?.totalBilledSales || 0)}
              </Text>
            </View>

            <View style={[styles.summaryDividerHorizontal, { backgroundColor: colors.borderSubtle }]} />

            {/* Supporting Financial Values */}
            <View style={styles.supportingSummaryRow}>
              {/* Total Paid */}
              <View style={styles.supportingSummaryCol}>
                <Text style={[styles.supportingSummaryLabel, { color: colors.textMuted }]}>TOTAL PAID</Text>
                <Text style={[styles.supportingSummaryValue, { color: '#10b981' }]}>
                  {fmtCurrency(report?.totalClearedPayments || 0)}
                </Text>
              </View>

              <View style={[styles.summaryDividerVertical, { backgroundColor: colors.borderSubtle }]} />

              {/* Total Due */}
              <View style={styles.supportingSummaryCol}>
                <Text style={[styles.supportingSummaryLabel, { color: colors.textMuted }]}>TOTAL DUE</Text>
                <Text
                  style={[
                    styles.supportingSummaryValue,
                    {
                      color:
                        (report?.totalPendingReceivables || 0) > 0
                          ? '#ef4444'
                          : '#10b981',
                    },
                  ]}
                >
                  {fmtCurrency(report?.totalPendingReceivables || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Real-Time Collection Efficiency Card */}
        <View style={[styles.efficiencyCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <View style={styles.effHeaderRow}>
            <View style={styles.effTitleGroup}>
              <View style={styles.effIconWrap}>
                <Ionicons name="trending-up" size={16} color="#10b981" />
              </View>
              <View>
                <Text style={[styles.effCardTitle, { color: colors.textPrimary }]}>Collection Efficiency</Text>
                <Text style={[styles.effCardSub, { color: colors.textMuted }]}>Real-time payment recovery</Text>
              </View>
            </View>
            <View style={[styles.effPercentBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
              <Text style={styles.effPercentText}>{collectionEfficiency}%</Text>
            </View>
          </View>

          {/* Visual Progress Bar / Graph */}
          <View style={styles.effProgressTrack}>
            <View
              style={[
                styles.effProgressBar,
                {
                  width: `${Math.min(100, Math.max(0, Number(collectionEfficiency)))}%`,
                  backgroundColor: Number(collectionEfficiency) >= 75 ? '#10b981' : Number(collectionEfficiency) >= 40 ? '#f59e0b' : '#ef4444',
                },
              ]}
            />
          </View>

          {/* Recovery Summary Metrics Footer */}
          <View style={styles.effFooterRow}>
            <Text style={[styles.effFooterText, { color: colors.textMuted }]}>
              Cleared: <Text style={{ color: '#10b981', fontWeight: '700' }}>{fmtCurrency(report?.totalClearedPayments || 0)}</Text>
            </Text>
            <Text style={[styles.effFooterText, { color: colors.textMuted }]}>
              Billed: <Text style={{ color: colors.accentHover, fontWeight: '700' }}>{fmtCurrency(report?.totalBilledSales || 0)}</Text>
            </Text>
          </View>
        </View>

        {/* Leading Vendors Section — Top 5 Only (Current Month) */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Leading Vendors</Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>Top 5 Current Month Deliveries</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Reports' }] })}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionLink, { color: colors.accentHover }]}>View All →</Text>
          </TouchableOpacity>
        </View>

        {leadingVendors.length > 0 ? (
          <View style={[styles.leadingVendorsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            {leadingVendors.map((vendor: any, idx: number) => {
              const targetSellerId =
                vendor.sellerId ||
                sellers.find(
                  (s) => s.name && vendor.name && s.name.trim().toLowerCase() === vendor.name.trim().toLowerCase()
                )?._id;

              return (
                <TouchableOpacity
                  key={vendor.sellerId || idx}
                  style={[
                    styles.leadingVendorRow,
                    idx < leadingVendors.length - 1 && { borderBottomColor: colors.borderSubtle, borderBottomWidth: 1 },
                  ]}
                  onPress={() => {
                    if (targetSellerId) {
                      navigation.navigate('SellerDetail', {
                        sellerId: targetSellerId,
                        sellerName: vendor.name,
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.leadingVendorRank}>
                    <Text style={styles.rankBadgeText}>#{idx + 1}</Text>
                  </View>
                  <View style={styles.leadingVendorInfo}>
                    <Text style={[styles.leadingVendorName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {vendor.name}
                    </Text>
                  </View>
                  <Text style={[styles.leadingVendorAmount, { color: colors.accentHover }]}>
                    {fmtCurrency(vendor.totalDeliveries)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No delivery orders recorded this month.</Text>
          </View>
        )}

        {/* Tank Distribution (Strict 500L, 1000L, 2000L) */}
        {report?.tankDistribution && (
          <View style={{ marginTop: 16 }}>
            <TankSummaryCard distribution={report.tankDistribution} />
          </View>
        )}

        {/* Recent Vendors Preview */}
        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Vendors</Text>
          <TouchableOpacity
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Sellers' }] })}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionLink, { color: colors.accentHover }]}>View All →</Text>
          </TouchableOpacity>
        </View>

        {sellers.map((s) => (
          <SellerCard
            key={s._id || s.id}
            seller={s}
            onPress={() =>
              navigation.navigate('SellerDetail', {
                sellerId: s._id || s.id,
                sellerName: s.name,
              })
            }
          />
        ))}

        <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* Add Seller Modal */}
      <AddSellerModal
        visible={addSellerVisible}
        onClose={() => setAddSellerVisible(false)}
        onSuccess={async (_created) => {
          setToastMsg('Seller created successfully.');
          await invalidateDashboard();
          refetch();
        }}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={txModalVisible}
        onClose={() => {
          setTxModalVisible(false);
          setSelectedSeller(null);
        }}
        seller={selectedSeller}
        sellers={sellers}
        initialType={txModalType}
        onSuccess={async (_tx) => {
          await invalidateTransactions(selectedSeller?._id);
          refetch();
        }}
      />

      {/* In-Context Toast Notification */}
      <ToastNotification
        visible={!!toastMsg}
        message={toastMsg || ''}
        onDismiss={() => setToastMsg(null)}
      />

      {/* Native App Bottom Tab Bar (Only when standalone) */}
      {!isEmbedded && <BottomTabBar activeScreen="Dashboard" navigation={navigation} />}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  adminHubCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  hubBrandGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minWidth: 0,
  },
  hubLogoContainer: {
    width: 34,
    height: 34,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    flexShrink: 0,
  },
  hubLogoImg: {
    width: 34,
    height: 34,
  },
  hubBrandTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  hubBrandName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  hubSubTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeSellersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    flexShrink: 0,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
  },
  activeSellersText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  summaryContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  },
  heroSummaryBlock: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  heroSummaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroSummaryValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  summaryDividerHorizontal: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  supportingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportingSummaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  supportingSummaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  supportingSummaryValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  summaryDividerVertical: {
    width: 1,
    height: 36,
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  leadingVendorsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  leadingVendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  leadingVendorRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
  },
  leadingVendorInfo: {
    flex: 1,
  },
  leadingVendorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  leadingVendorAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyBox: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  vendorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInitial: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '800',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  vendorContact: {
    fontSize: 11,
    marginTop: 2,
  },
  vendorDues: {
    alignItems: 'flex-end',
  },
  vendorDuesVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  vendorDuesLabel: {
    fontSize: 10,
  },
  efficiencyCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  effHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  effTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  effIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  effCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  effCardSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  effPercentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  effPercentText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '900',
  },
  effProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  effProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  effFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  effFooterText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
