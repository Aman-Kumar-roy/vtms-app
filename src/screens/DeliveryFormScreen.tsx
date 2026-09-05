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
import { createDeliveryApi } from '../api/transaction';
import { Seller, Transaction } from '../types';
import { TankSelector } from '../components/TankSelector';
import { NavbarHeader } from '../components/NavbarHeader';
import { ReceiptModal } from '../components/ReceiptModal';
import { useTheme } from '../context/ThemeContext';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';

export const DeliveryFormScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();

  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  // Strictly tank sizes: 500, 1000, 2000
  const [tank500, setTank500] = useState<number>(0);
  const [tank1000, setTank1000] = useState<number>(0);
  const [tank2000, setTank2000] = useState<number>(0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingSeller, setFetchingSeller] = useState<boolean>(true);

  // Success flow state
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
        .catch((e) => console.warn('Failed to load seller in DeliveryForm:', e))
        .finally(() => setFetchingSeller(false));
    } else {
      setFetchingSeller(false);
    }
  }, [route?.params]);

  const handleTankChange = (key: 'tank500' | 'tank1000' | 'tank2000', val: number) => {
    if (key === 'tank500') setTank500(val);
    if (key === 'tank1000') setTank1000(val);
    if (key === 'tank2000') setTank2000(val);
    if (errors.tanks) setErrors((prev) => ({ ...prev, tanks: '' }));
  };

  const totalUnits = (tank500 || 0) + (tank1000 || 0) + (tank2000 || 0);

  const handleSubmit = async () => {
    const errs: { [key: string]: string } = {};

    if (!selectedSeller?._id && !selectedSeller?.id) {
      errs.seller = 'Vendor account is required for delivery transactions';
    }

    const numAmount = parseFloat(amount);
    if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid billed amount greater than ₹0.00';
    }

    if (!date.trim()) {
      errs.date = 'Delivery date is required';
    }

    if (totalUnits === 0) {
      errs.tanks = 'Please specify quantity for at least one tank item (500L, 1000L, 2000L)';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const tx = await createDeliveryApi({
        sellerId: (selectedSeller?._id || selectedSeller?.id)!,
        amount: numAmount,
        date,
        note: note.trim() || undefined,
        tank500,
        tank1000,
        tank2000,
      });

      setCreatedTransaction(tx);
      setShowReceiptModal(true);
    } catch (e: any) {
      setErrors({ form: e.message || 'Failed to record delivery' });
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
      navigation.navigate('Orders');
    }
  };

  if (fetchingSeller) {
    return (
      <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <NavbarHeader
          currentScreenTitle="Record Delivery"
          onOpenDrawer={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Orders')}
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
          currentScreenTitle="Record Delivery"
          onOpenDrawer={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Sellers')}
          navigation={navigation}
        />
        <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="business-outline" size={36} color="#0284c7" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Vendor Account Required</Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            Transactions must be recorded inside a specific vendor's account ledger. Please select a vendor from the directory to start recording deliveries.
          </Text>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: colors.accentHover }]}
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
        currentScreenTitle="Record Delivery"
        onOpenDrawer={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('Orders');
        }}
        navigation={navigation}
      />

      <ScrollView style={styles.scrollForm} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Delivery Voucher</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Log dispatched water storage tanks and generate official server receipt.
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

          {/* 2. Product Units / Quantity (Strict Tank Sizes) */}
          <TankSelector
            tank500={tank500}
            tank1000={tank1000}
            tank2000={tank2000}
            onChange={handleTankChange}
          />
          {errors.tanks ? <Text style={[styles.errorText, { marginBottom: 12 }]}>{errors.tanks}</Text> : null}

          {/* 3. Billed Amount Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              TOTAL BILLED AMOUNT (₹) <Text style={styles.reqStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
                errors.amount ? styles.inputError : null,
              ]}
              placeholder="e.g. 25000.00"
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

          {/* 4. Date */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              DELIVERY DATE (YYYY-MM-DD) <Text style={styles.reqStar}>*</Text>
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

          {/* 5. Dispatch / Delivery Note */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              DISPATCH REFERENCE / INVOICE NOTE <Text style={styles.optText}>(Optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
              ]}
              placeholder="Vehicle no., Challan reference, batch details..."
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* 6. Live Summary Before Submission */}
          <View style={[styles.summaryCard, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Live Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Target Vendor</Text>
              <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
                {selectedSeller.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Tank Units Dispatched</Text>
              <Text style={[styles.summaryVal, { color: '#0284c7' }]}>
                {totalUnits} Units
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Capacity Mix</Text>
              <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
                500L: {tank500} • 1000L: {tank1000} • 2000L: {tank2000}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={[styles.summaryTotalLabel, { color: colors.textPrimary }]}>Total Billed Amount</Text>
              <Text style={[styles.summaryTotalVal, { color: '#0284c7' }]}>
                ₹{Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.accentHover }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Record Delivery Order →</Text>
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
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  receiptTagBox: {
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  receiptTagLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
    letterSpacing: 0.5,
  },
  receiptTagNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0284c7',
    marginTop: 2,
    letterSpacing: 1,
  },
  successActions: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  actionBtnPrimary: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnDone: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  actionBtnDoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
