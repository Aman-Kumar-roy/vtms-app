import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSummaryReportApi } from '../api/reports';
import { getSellersApi } from '../api/seller';
import { SummaryReportData, Seller } from '../types';
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
import { useFocusEffect } from '@react-navigation/native';
import { DashboardSkeleton } from '../components/Shimmer';

export const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [report, setReport] = useState<SummaryReportData | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // In-context modals & notifications
  const [addSellerVisible, setAddSellerVisible] = useState(false);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [txModalType, setTxModalType] = useState<'DELIVERY' | 'PAYMENT'>('DELIVERY');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const dataLoadedRef = useRef(false);
  dataLoadedRef.current = !!(report || sellers.length > 0);

  const fetchData = useCallback(async (isRefresh = false) => {
    setError(null);
    if (isRefresh) {
      setRefreshing(true);
    } else if (!dataLoadedRef.current) {
      setLoading(true);
    }
    try {
      const [summaryData, sellerRes] = await Promise.all([
        getSummaryReportApi(),
        getSellersApi({ limit: 5 }),
      ]);
      setReport(summaryData);
      setSellers(sellerRes.sellers || []);
    } catch (e: any) {
      console.warn('Dashboard fetch error:', e.message);
      setError(e.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    fetchData(true);
  };

  const fmtCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const leadingVendors = (report?.topVendors || []).slice(0, 5);

  return (
    <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
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

      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentHover} />}
      >
        {loading && !report && sellers.length === 0 ? (
          <DashboardSkeleton />
        ) : (
          <>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => fetchData(false)} style={styles.retryBtn}>
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
              <View>
                <Text style={[styles.hubBrandName, { color: colors.textPrimary }]}>
                  Vasudha Polymer Admin Hub
                </Text>
                <Text style={[styles.hubSubTitle, { color: colors.textMuted }]}>
                  Financial & Dispatch Overview
                </Text>
              </View>
            </View>

            <View style={styles.liveStatusPill}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveStatusText}>LIVE SYNCED</Text>
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
        onSuccess={(_created) => {
          setToastMsg('Seller created successfully.');
          fetchData();
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
        onSuccess={(_tx) => {
          fetchData();
        }}
      />

      {/* In-Context Toast Notification */}
      <ToastNotification
        visible={!!toastMsg}
        message={toastMsg || ''}
        onDismiss={() => setToastMsg(null)}
      />

      {/* Native App Bottom Tab Bar */}
      <BottomTabBar activeScreen="Dashboard" navigation={navigation} />
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
  },
  hubBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hubLogoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  hubLogoImg: {
    width: 36,
    height: 36,
  },
  hubBrandName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hubSubTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveStatusText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
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
});
