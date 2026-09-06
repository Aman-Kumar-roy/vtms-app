import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSellerByIdApi } from '../api/seller';
import { Seller, Transaction } from '../types';
import { NavbarHeader } from '../components/NavbarHeader';
import { ReceiptModal } from '../components/ReceiptModal';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';
import { useFocusEffect } from '@react-navigation/native';
import { ToastNotification } from '../components/ToastNotification';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { SellerDetailSkeleton } from '../components/Shimmer';

import { useSellerDetailQuery } from '../query/useQueries';
import { invalidateTransactions } from '../query/queryClient';

export const SellerDetailScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const sellerId = route?.params?.sellerId;
  const routeSeller = route?.params?.seller;

  const {
    seller: querySeller,
    stats: queryStats,
    transactions: queryTransactions,
    isLoading,
    isFetching,
    refetch,
  } = useSellerDetailQuery(sellerId);

  const seller = querySeller || routeSeller || null;
  const stats = queryStats || null;
  const transactions = queryTransactions || [];

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'DELIVERY' | 'PAYMENT'>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [txType, setTxType] = useState<'DELIVERY' | 'PAYMENT'>('DELIVERY');
  const [preselectedDeliveryId, setPreselectedDeliveryId] = useState<string | undefined>(undefined);
  const [expandedDeliveries, setExpandedDeliveries] = useState<Record<string, boolean>>({});
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedDeliveries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (route?.params?.successMsg) {
      navigation.setParams({ successMsg: undefined });
    }
  }, [route?.params?.successMsg]);

  // Revalidate vendor stats and transactions whenever screen gains focus (skipping initial mount)
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

  const openReceipt = (tx: Transaction) => {
    setSelectedTx({
      ...tx,
      seller: {
        _id: seller?._id || '',
        name: seller?.name || 'Vendor',
        phone: seller?.phone || undefined,
      },
    });
    setReceiptVisible(true);
  };

  const sellerTitle = seller?.name || route?.params?.sellerName || 'Vendor Details';

  if (isLoading && !seller) {
    return (
      <AnimatedScreenWrapper direction="right" style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <NavbarHeader
          currentScreenTitle={sellerTitle}
          onOpenDrawer={() => navigation.goBack()}
          navigation={navigation}
        />
        <SellerDetailSkeleton />
      </AnimatedScreenWrapper>
    );
  }

  if (!seller) {
    return (
      <AnimatedScreenWrapper direction="right" style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <NavbarHeader
          currentScreenTitle="Vendor Not Found"
          onOpenDrawer={() => navigation.goBack()}
          navigation={navigation}
        />
        <View style={[styles.center, { flex: 1 }]}>
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Vendor not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </AnimatedScreenWrapper>
    );
  }

  const filteredTxs = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <AnimatedScreenWrapper direction="right" style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <ReceiptModal
        visible={receiptVisible}
        onClose={() => setReceiptVisible(false)}
        transaction={selectedTx}
      />

      <NavbarHeader
        currentScreenTitle={seller.name}
        onOpenDrawer={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={isPullRefreshing} onRefresh={onRefresh} tintColor={colors.accentHover} />}
      >
        {/* Vendor Header Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(seller.name || 'V')[0].toUpperCase()}</Text>
            </View>
            <View style={styles.profileTitles}>
              <Text style={[styles.vendorName, { color: colors.textPrimary }]}>{seller.name}</Text>
              {seller.gstNumber ? (
                <View style={styles.gstPill}>
                  <Text style={styles.gstText}>GST: {seller.gstNumber}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Contact Details */}
          <View style={styles.contactGroup}>
            {seller.phone && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`tel:${seller.phone}`)}
              >
                <Ionicons name="call-outline" size={14} color={colors.accentHover} />
                <Text style={[styles.contactText, { color: colors.textPrimary }]}>{seller.phone}</Text>
              </TouchableOpacity>
            )}
            {seller.email && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`mailto:${seller.email}`)}
              >
                <Ionicons name="mail-outline" size={14} color={colors.accentHover} />
                <Text style={[styles.contactText, { color: colors.textPrimary }]}>{seller.email}</Text>
              </TouchableOpacity>
            )}
            {seller.address && (
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.contactText, { color: colors.textMuted }]}>{seller.address}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => {
                setPreselectedDeliveryId(undefined);
                setTxType('DELIVERY');
                setTxModalVisible(true);
              }}
            >
              <Ionicons name="cube" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.actionBtnText}>+ Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSuccess}
              onPress={() => {
                setPreselectedDeliveryId(undefined);
                setTxType('PAYMENT');
                setTxModalVisible(true);
              }}
            >
              <Ionicons name="cash" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.actionBtnText}>+ Payment</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Summary Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL BILLED</Text>
            <Text style={[styles.statVal, { color: colors.textPrimary }]}>{fmtCurrency(stats?.totalDeliveries || 0)}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL PAID</Text>
            <Text style={[styles.statVal, { color: '#10b981' }]}>{fmtCurrency(stats?.totalPaid || 0)}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>BALANCE DUES</Text>
            <Text style={[styles.statVal, { color: (stats?.totalDues || 0) > 0 ? '#ef4444' : '#10b981' }]}>
              {fmtCurrency(stats?.totalDues || 0)}
            </Text>
          </View>
        </View>

        {/* Tank Deliveries Breakdown */}
        <View style={[styles.tankCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.tankTitle, { color: colors.textPrimary }]}>Delivered Tank Units</Text>
          <View style={styles.tankPills}>
            <View style={[styles.tankPill, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Text style={{ color: '#3b82f6', fontWeight: '800' }}>500L: {stats?.tank500 || 0}</Text>
            </View>
            <View style={[styles.tankPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={{ color: '#10b981', fontWeight: '800' }}>1000L: {stats?.tank1000 || 0}</Text>
            </View>
            <View style={[styles.tankPill, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Text style={{ color: '#8b5cf6', fontWeight: '800' }}>2000L: {stats?.tank2000 || 0}</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Transaction History</Text>
          <View style={styles.filterTabs}>
            {(['ALL', 'DELIVERY', 'PAYMENT'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.filterTab,
                  filterType === t ? styles.filterTabActive : null,
                ]}
                onPress={() => setFilterType(t)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filterType === t ? styles.filterTabTextActive : { color: colors.textMuted },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredTxs.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.textMuted }}>No transactions recorded for this filter.</Text>
          </View>
        ) : (
          filteredTxs.map((tx) => {
            const txId = tx._id || tx.id || '';
            const isDelivery = tx.type === 'DELIVERY';
            const paidAmount = tx.paidAmount !== undefined
              ? tx.paidAmount
              : (tx.linkedPayments ? tx.linkedPayments.reduce((s: number, p: any) => s + p.amount, 0) : 0);
            const remainingDue = tx.remainingDue !== undefined
              ? tx.remainingDue
              : Math.max(0, tx.amount - paidAmount);
            const isExpanded = expandedDeliveries[txId] !== undefined ? expandedDeliveries[txId] : true;
            const paidPercent = tx.amount > 0 ? Math.min(100, Math.round((paidAmount / tx.amount) * 100)) : 0;

            return (
              <View
                key={txId}
                style={[styles.txCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}
              >
                {/* Top Row: Date, Type & Status Badges */}
                <View style={styles.txCardHeader}>
                  <View style={styles.txHeaderLeft}>
                    <Ionicons name="calendar-outline" size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                    <Text style={[styles.txDate, { color: colors.textMuted }]}>
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {isDelivery ? (
                      <>
                        {remainingDue <= 0 ? (
                          <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                            <Ionicons name="checkmark-circle" size={11} color="#10b981" style={{ marginRight: 3 }} />
                            <Text style={[styles.statusBadgeText, { color: '#10b981' }]}>Fully Paid</Text>
                          </View>
                        ) : paidAmount > 0 ? (
                          <View style={[styles.statusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                            <Ionicons name="time-outline" size={11} color="#f59e0b" style={{ marginRight: 3 }} />
                            <Text style={[styles.statusBadgeText, { color: '#f59e0b' }]}>Partial ({paidPercent}%)</Text>
                          </View>
                        ) : (
                          <View style={[styles.statusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                            <Text style={[styles.statusBadgeText, { color: '#f59e0b' }]}>Unpaid Order</Text>
                          </View>
                        )}
                        <View style={[styles.typeBadge, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                          <Text style={[styles.typeBadgeText, { color: '#0284c7' }]}>DELIVERY</Text>
                        </View>
                      </>
                    ) : (
                      <View style={[styles.typeBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                        <Text style={[styles.typeBadgeText, { color: '#10b981' }]}>PAYMENT</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Content Section */}
                {isDelivery ? (
                  <View style={styles.deliveryContent}>
                    {/* Minimalist Settlement Financial Row with 3px Progress Bar */}
                    <View style={styles.minimalFinanceBox}>
                      <View style={styles.minimalFinanceRow}>
                        <Text style={[styles.minimalFinanceText, { color: colors.textMuted }]}>
                          Bill: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{fmtCurrency(tx.amount)}</Text>
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

                    {/* Tanks Delivered Breakdown */}
                    <View style={styles.tankRow}>
                      <View style={[styles.tankUnitPill, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                        <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: '700' }}>500L: {tx.tank500 || 0}</Text>
                      </View>
                      <View style={[styles.tankUnitPill, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Text style={{ fontSize: 11, color: '#10b981', fontWeight: '700' }}>1000L: {tx.tank1000 || 0}</Text>
                      </View>
                      <View style={[styles.tankUnitPill, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                        <Text style={{ fontSize: 11, color: '#8b5cf6', fontWeight: '700' }}>2000L: {tx.tank2000 || 0}</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.paymentContent}>
                    <View style={styles.paymentMainRow}>
                      <View>
                        <Text style={[styles.paymentAmount, { color: '#10b981' }]}>
                          -{fmtCurrency(tx.amount)}
                        </Text>
                        <Text style={[styles.paymentSub, { color: colors.textMuted }]}>
                          Mode: {tx.paymentMode || 'Direct Cash'}
                        </Text>
                      </View>
                    </View>

                    {/* Minimalist Associated Delivery Pill */}
                    {(tx.parentDelivery || tx.parentId) ? (
                      <View style={[styles.minimalLinkedPill, { backgroundColor: 'rgba(2, 132, 199, 0.1)' }]}>
                        <Ionicons name="link-outline" size={12} color="#0284c7" style={{ marginRight: 4 }} />
                        <Text style={[styles.minimalLinkedText, { color: '#0284c7' }]}>
                          Settlement for Delivery #{(tx.parentDelivery?.id || tx.parentId || '').slice(-6).toUpperCase()}
                          {tx.parentDelivery?.amount ? ` (${fmtCurrency(tx.parentDelivery.amount)} bill)` : ''}
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.unlinkedText, { color: colors.textMuted }]}>General Account Payment (Unlinked Credit)</Text>
                    )}
                  </View>
                )}

                {/* Note */}
                {tx.note ? (
                  <View style={[styles.txNoteBox, { backgroundColor: colors.bgSecondary }]}>
                    <Ionicons name="document-text-outline" size={12} color={colors.textMuted} style={{ marginRight: 5 }} />
                    <Text style={[styles.txNoteText, { color: colors.textMuted }]} numberOfLines={2}>
                      {tx.note}
                    </Text>
                  </View>
                ) : null}

                {/* Minimalist Associated Payments Section for Delivery */}
                {isDelivery && tx.linkedPayments && tx.linkedPayments.length > 0 ? (
                  <View style={[styles.minimalLinkedSection, { borderTopColor: colors.borderSubtle }]}>
                    <TouchableOpacity
                      style={styles.minimalToggleBtn}
                      onPress={() => toggleExpand(txId)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                        size={12}
                        color="#0284c7"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.minimalToggleText, { color: '#0284c7' }]}>
                        {tx.linkedPayments.length} Associated Settlement{tx.linkedPayments.length > 1 ? 's' : ''} ({paidPercent}% paid)
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.minimalPaymentsList}>
                        {tx.linkedPayments.map((p, idx) => (
                          <View
                            key={p.id || p._id || String(idx)}
                            style={styles.minimalPaymentRow}
                          >
                            <View style={styles.minimalDot} />
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text style={[styles.minimalPaymentMeta, { color: colors.textMuted }]}>
                                {p.paymentMode || 'Direct'} • {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={styles.minimalPaymentAmount}>
                                  -{fmtCurrency(p.amount)}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => openReceipt(p as any)}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                  <Ionicons name="receipt-outline" size={13} color={colors.textMuted} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : null}

                {/* Actions Footer */}
                <View style={[styles.txCardFooter, { borderTopColor: colors.borderSubtle }]}>
                  {isDelivery && remainingDue > 0 ? (
                    <TouchableOpacity
                      style={styles.addPaymentToOrderBtn}
                      onPress={() => {
                        setPreselectedDeliveryId(txId);
                        setTxType('PAYMENT');
                        setTxModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle" size={14} color="#10b981" style={{ marginRight: 4 }} />
                      <Text style={styles.addPaymentToOrderText}>+ Add Payment to Order</Text>
                    </TouchableOpacity>
                  ) : <View />}

                  <TouchableOpacity
                    style={[styles.receiptActionBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}
                    onPress={() => openReceipt(tx)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="receipt-outline" size={13} color={colors.accentHover} style={{ marginRight: 4 }} />
                    <Text style={[styles.receiptActionText, { color: colors.accentHover }]}>Receipt Voucher →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Receipt Modal */}
      {selectedTx && (
        <ReceiptModal
          visible={receiptVisible}
          onClose={() => setReceiptVisible(false)}
          transaction={selectedTx as any}
        />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={txModalVisible}
        onClose={() => {
          setTxModalVisible(false);
          setPreselectedDeliveryId(undefined);
        }}
        seller={seller}
        initialType={txType}
        initialDeliveryId={preselectedDeliveryId}
        deliveries={transactions}
        onSuccess={async (_tx) => {
          await invalidateTransactions(sellerId);
          refetch();
        }}
      />

      {/* In-Context Toast Notification */}
      <ToastNotification
        visible={!!toastMsg}
        message={toastMsg || ''}
        onDismiss={() => setToastMsg(null)}
      />
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
  scroll: {
    flex: 1,
  },
  backBtn: {
    marginTop: 12,
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  profileCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '800',
  },
  profileTitles: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '800',
  },
  gstPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  gstText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
  },
  contactGroup: {
    gap: 6,
    marginBottom: 14,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionBtnSuccess: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionBtnOutline: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 3,
  },
  statVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  tankCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  tankTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  tankPills: {
    flexDirection: 'row',
    gap: 8,
  },
  tankPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
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
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 2,
  },
  filterTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#0284c7',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  txCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  txCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  txHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deliveryContent: {
    gap: 8,
  },
  minimalFinanceBox: {
    marginTop: 2,
    marginBottom: 2,
  },
  minimalFinanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
  tankRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tankUnitPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paymentContent: {
    gap: 8,
  },
  paymentMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  paymentSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  associatedDeliveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  associatedDeliveryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  unlinkedText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  txNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  txNoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
  minimalLinkedSection: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  minimalToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  minimalToggleText: {
    fontSize: 11,
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
    paddingVertical: 3,
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
  },
  txCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  addPaymentToOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addPaymentToOrderText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
  },
  receiptActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  receiptActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
