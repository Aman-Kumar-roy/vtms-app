import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSellersApi } from '../api/seller';
import { createPaymentApi, getTransactionsApi } from '../api/transaction';
import { Seller, Transaction } from '../types';
import { NavbarHeader } from '../components/NavbarHeader';
import { ReceiptModal } from '../components/ReceiptModal';
import { useTheme } from '../context/ThemeContext';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';

const PAYMENT_MODES = ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'RTGS/NEFT'];

export const PaymentFormScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();

  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [parentId, setParentId] = useState<string>(route?.params?.initialDeliveryId || route?.params?.parentId || '');
  const [deliveries, setDeliveries] = useState<Transaction[]>(route?.params?.deliveries || []);
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingSeller, setFetchingSeller] = useState<boolean>(true);

  // In-context receipt confirmation state
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  useEffect(() => {
    const passedSeller = route?.params?.seller;
    const sellerId = route?.params?.sellerId || route?.params?.preSelectedSellerId;

    if (passedSeller) {
      setSelectedSeller(passedSeller);
      setFetchingSeller(false);
      return;
    }

    if (sellerId) {
      getSellersApi()
        .then((res) => {
          const list = res.sellers || [];
          const found = list.find((s) => (s._id || s.id) === sellerId);
          if (found) setSelectedSeller(found);
        })
        .catch((e) => console.warn('Failed to load seller in PaymentForm:', e))
        .finally(() => setFetchingSeller(false));
    } else {
      setFetchingSeller(false);
    }
  }, [route?.params]);

  // Load deliveries for associated order matching
  useEffect(() => {
    if (!selectedSeller) return;
    const sId = selectedSeller._id || selectedSeller.id;
    if (!sId) return;

    if (route?.params?.deliveries && route.params.deliveries.length > 0) {
      setDeliveries(route.params.deliveries);
    } else {
      getTransactionsApi({ sellerId: sId, type: 'DELIVERY' })
        .then((res) => {
          setDeliveries(res.transactions || []);
        })
        .catch((err) => console.warn('Failed to load seller deliveries:', err));
    }
  }, [selectedSeller, route?.params?.deliveries]);

  // Auto-fill amount from selected delivery if specified
  useEffect(() => {
    const initId = route?.params?.initialDeliveryId || route?.params?.parentId;
    if (initId) {
      setParentId(initId);
      const target = deliveries.find((d) => (d._id || d.id) === initId);
      if (target) {
        const due = target.remainingDue !== undefined ? target.remainingDue : target.amount;
        if (due > 0 && !amount) setAmount(String(due));
      }
    }
  }, [deliveries, route?.params]);

  const handleSubmit = async () => {
    const errs: { [key: string]: string } = {};

    if (!selectedSeller?._id && !selectedSeller?.id) {
      errs.seller = 'Vendor account is required for payment transactions';
    }

    const numAmount = parseFloat(amount);
    if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid payment amount greater than ₹0.00';
    }

    if (!date.trim()) {
      errs.date = 'Payment date is required';
    }

    if (!paymentMode) {
      errs.paymentMode = 'Payment mode is required';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const tx = await createPaymentApi({
        sellerId: (selectedSeller?._id || selectedSeller?.id)!,
        amount: numAmount,
        paymentMode,
        date,
        note: note.trim() || undefined,
        parentId: parentId ? parentId : undefined,
      });

      setCreatedTransaction(tx);
      setShowReceiptModal(true);
    } catch (e: any) {
      setErrors({ form: e.message || 'Failed to record payment' });
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setShowReceiptModal(false);
    if (selectedSeller) {
      navigation.navigate('SellerDetail', {
        sellerId: selectedSeller._id || selectedSeller.id,
      });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Transactions');
    }
  };

  const fmtCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const currentDues = selectedSeller?.totalDues || 0;
  const payVal = Number(amount) || 0;
  const remainingDues = Math.max(0, currentDues - payVal);

  if (fetchingSeller) {
    return (
      <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <NavbarHeader
          currentScreenTitle="Record Payment"
          onOpenDrawer={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Transactions')}
          navigation={navigation}
        />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accentHover} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading vendor details...</Text>
        </View>
      </AnimatedScreenWrapper>
    );
  }

  // Transactions must be created inside seller context
  if (!selectedSeller) {
    return (
      <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <NavbarHeader
          currentScreenTitle="Record Payment"
          onOpenDrawer={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Sellers')}
          navigation={navigation}
        />
        <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cash-outline" size={36} color="#10b981" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Vendor Account Required</Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            Payment settlements must be recorded against a specific vendor's account ledger. Please select a vendor from the directory to proceed.
          </Text>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: '#10b981' }]}
            onPress={() => navigation.navigate('Sellers')}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.primaryActionBtnText}>Select Vendor from Directory →</Text>
          </TouchableOpacity>
        </View>
      </AnimatedScreenWrapper>
    );
  }

  return (
    <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <NavbarHeader
        currentScreenTitle="Record Payment"
        onOpenDrawer={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('Transactions');
        }}
        navigation={navigation}
      />

      <ScrollView style={styles.scrollForm} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Payment Voucher</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Record received financial settlements from vendor accounts.
          </Text>

          {errors.form && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
              <Text style={styles.errorBoxText}>{errors.form}</Text>
            </View>
          )}

          {/* 1. Fixed Target Vendor (Locked) */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              TARGET VENDOR / SELLER <Text style={styles.reqStar}>* (LOCKED)</Text>
            </Text>
            <View style={[styles.fixedVendorCard, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
              <View style={styles.fixedVendorHeader}>
                <View style={styles.fixedLockBadge}>
                  <Ionicons name="lock-closed" size={11} color="#0284c7" style={{ marginRight: 4 }} />
                  <Text style={styles.fixedLockBadgeText}>FIXED VENDOR CONTEXT</Text>
                </View>
                {selectedSeller.gstNumber ? (
                  <View style={styles.fixedGstBadge}>
                    <Text style={styles.fixedGstBadgeText}>GST: {selectedSeller.gstNumber}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.fixedVendorName, { color: colors.textPrimary }]}>{selectedSeller.name}</Text>
              <View style={styles.fixedVendorMeta}>
                {selectedSeller.phone ? (
                  <Text style={[styles.fixedVendorMetaText, { color: colors.textMuted }]}>📞 {selectedSeller.phone}</Text>
                ) : null}
                {selectedSeller.email ? (
                  <Text style={[styles.fixedVendorMetaText, { color: colors.textMuted }]}>✉️ {selectedSeller.email}</Text>
                ) : null}
              </View>
              {selectedSeller.address ? (
                <Text style={[styles.fixedVendorAddress, { color: colors.textMuted }]}>📍 {selectedSeller.address}</Text>
              ) : null}
            </View>
          </View>

          {/* Outstanding Dues Banner */}
          <View style={[styles.duesInfoBox, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
            <View>
              <Text style={[styles.duesInfoLabel, { color: colors.textMuted }]}>Current Balance Due</Text>
              <Text style={[styles.duesInfoVal, { color: currentDues > 0 ? '#ef4444' : '#10b981' }]}>
                {fmtCurrency(currentDues)}
              </Text>
            </View>
            {payVal > 0 && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.duesInfoLabel, { color: colors.textMuted }]}>Est. Balance Remaining</Text>
                <Text style={[styles.duesInfoVal, { color: '#10b981' }]}>
                  {fmtCurrency(remainingDues)}
                </Text>
              </View>
            )}
          </View>

          {/* Associated Delivery Order (Optional linking) */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                ASSOCIATED DELIVERY ORDER <Text style={styles.optText}>(Optional)</Text>
              </Text>
              {parentId ? (
                <TouchableOpacity onPress={() => setParentId('')}>
                  <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: '700' }}>Clear Link</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {deliveries.length === 0 ? (
              <View style={[styles.unlinkedNotice, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
                <Text style={[styles.unlinkedNoticeText, { color: colors.textMuted }]}>
                  No pending delivery orders found. This payment will be recorded as a general account credit.
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.linkedChip,
                      !parentId ? styles.linkedChipActive : { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
                    ]}
                    onPress={() => setParentId('')}
                  >
                    <Text style={[styles.linkedChipText, { color: !parentId ? '#ffffff' : colors.textMuted }]}>
                      -- General Payment (Unlinked) --
                    </Text>
                  </TouchableOpacity>
                  {deliveries.map((d) => {
                    const dId = d._id || d.id;
                    const isSel = parentId === dId;
                    const dueAmt = d.remainingDue !== undefined ? d.remainingDue : d.amount;
                    const orderNum = (dId || '').slice(-6).toUpperCase();
                    return (
                      <TouchableOpacity
                        key={dId}
                        style={[
                          styles.linkedChip,
                          isSel ? styles.linkedChipActive : { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle },
                        ]}
                        onPress={() => {
                          setParentId(dId || '');
                          if (dueAmt > 0) setAmount(String(dueAmt));
                        }}
                      >
                        <Ionicons
                          name={isSel ? 'link' : 'link-outline'}
                          size={13}
                          color={isSel ? '#ffffff' : '#38bdf8'}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.linkedChipText, { color: isSel ? '#ffffff' : colors.textPrimary }]}>
                          Delivery #{orderNum} • Due {fmtCurrency(dueAmt)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {parentId ? (
              <View style={[styles.associatedPill, { backgroundColor: 'rgba(2, 132, 199, 0.12)', borderColor: 'rgba(2, 132, 199, 0.25)' }]}>
                <Ionicons name="link" size={13} color="#0284c7" style={{ marginRight: 5 }} />
                <Text style={[styles.associatedPillText, { color: '#0284c7' }]}>
                  Marked: Settlement for Delivery #{parentId.slice(-6).toUpperCase()}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 2. Amount Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              RECEIVED SETTLEMENT AMOUNT (₹) <Text style={styles.reqStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
                errors.amount ? styles.inputError : null,
              ]}
              placeholder="e.g. 10000.00"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={(val) => {
                setAmount(val);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              keyboardType="decimal-pad"
            />
            {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
          </View>

          {/* Quick Pay Full Dues Button */}
          {currentDues > 0 && (
            <TouchableOpacity
              style={[styles.fullSettleBtn, { borderColor: '#10b981' }]}
              onPress={() => {
                setAmount(String(currentDues));
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="flash-outline" size={14} color="#10b981" style={{ marginRight: 6 }} />
              <Text style={styles.fullSettleText}>Pay Full Outstanding Dues ({fmtCurrency(currentDues)})</Text>
            </TouchableOpacity>
          )}

          {/* 3. Payment Mode Chips */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              SETTLEMENT METHOD / MODE <Text style={styles.reqStar}>*</Text>
            </Text>
            <View style={styles.modeChipsGrid}>
              {PAYMENT_MODES.map((mode) => {
                const isSelected = paymentMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modeChip,
                      { borderColor: colors.borderSubtle, backgroundColor: colors.bgSecondary },
                      isSelected ? { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)' } : null,
                    ]}
                    onPress={() => setPaymentMode(mode)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={15}
                      color={isSelected ? '#10b981' : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.modeChipText,
                        { color: colors.textPrimary },
                        isSelected ? { color: '#10b981', fontWeight: '800' } : null,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Date */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              PAYMENT DATE (YYYY-MM-DD) <Text style={styles.reqStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
                errors.date ? styles.inputError : null,
              ]}
              value={date}
              onChangeText={(val) => {
                setDate(val);
                if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
              }}
              placeholder="2026-09-04"
              placeholderTextColor={colors.textMuted}
            />
            {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
          </View>

          {/* 5. Note */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              TRANSACTION REFERENCE / NOTE <Text style={styles.optText}>(Optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
              ]}
              placeholder="Bank ref, UTR no., cheque number, receipt remarks..."
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* 6. Live Summary Before Submission */}
          <View style={[styles.summaryCard, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Live Settlement Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Vendor</Text>
              <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
                {selectedSeller.name}
              </Text>
            </View>
            {parentId ? (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Associated Order</Text>
                <Text style={[styles.summaryVal, { color: '#0284c7', fontWeight: '700' }]}>
                  Delivery #{parentId.slice(-6).toUpperCase()}
                </Text>
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Payment Method</Text>
              <Text style={[styles.summaryVal, { color: '#10b981' }]}>
                {paymentMode}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={[styles.summaryTotalLabel, { color: colors.textPrimary }]}>Amount to Settle</Text>
              <Text style={[styles.summaryTotalVal, { color: '#10b981' }]}>
                {fmtCurrency(payVal)}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: '#10b981' }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Record Payment Settlement →</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Official Server Receipt Modal (Direct Confirmation) */}
      <ReceiptModal
        visible={showReceiptModal}
        onClose={handleDone}
        transaction={createdTransaction}
        serverReceipt={createdTransaction?.receipt}
        seller={selectedSeller}
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
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  scrollForm: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginTop: 6,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorBoxText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reqStar: {
    color: '#ef4444',
  },
  optText: {
    color: '#64748b',
    fontWeight: '400',
    fontSize: 10,
  },
  fixedVendorCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  fixedVendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fixedLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fixedLockBadgeText: {
    color: '#0284c7',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fixedGstBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fixedGstBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
  },
  fixedVendorName: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  fixedVendorMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  fixedVendorMetaText: {
    fontSize: 11,
  },
  fixedVendorAddress: {
    fontSize: 11,
    marginTop: 3,
  },
  duesInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  duesInfoLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  duesInfoVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  fullSettleBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    marginBottom: 14,
  },
  fullSettleText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  modeChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.2)',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  summaryTotalVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  unlinkedNotice: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 4,
  },
  unlinkedNoticeText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  linkedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  linkedChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  linkedChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  associatedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  associatedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
