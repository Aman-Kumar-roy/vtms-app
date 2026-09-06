import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createTransactionApi, getTransactionsApi } from '../api/transaction';
import { invalidateTransactions } from '../query/queryClient';
import { Seller, Transaction } from '../types';
import { TankSelector } from './TankSelector';
import { ReceiptModal } from './ReceiptModal';
import { DatePickerField } from './ui/DatePickerField';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';

const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] as const;

const EMPTY_SELLERS: Seller[] = [];
const EMPTY_DELIVERIES: Transaction[] = [];

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  seller?: Seller | null;
  sellers?: Seller[];
  initialType?: 'DELIVERY' | 'PAYMENT';
  deliveries?: Transaction[];
  initialDeliveryId?: string;
  onSuccess: (tx: Transaction) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  seller,
  sellers = EMPTY_SELLERS,
  initialType = 'DELIVERY',
  deliveries = EMPTY_DELIVERIES,
  initialDeliveryId,
  onSuccess,
}) => {
  const { colors } = useTheme();

  const [type, setType] = useState<'DELIVERY' | 'PAYMENT'>(initialType);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [parentId, setParentId] = useState<string>('');

  // Strict tank sizes: 500L, 1000L, 2000L ONLY
  const [tank500, setTank500] = useState<number>(0);
  const [tank1000, setTank1000] = useState<number>(0);
  const [tank2000, setTank2000] = useState<number>(0);

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // In-context success confirmation
  const [createdTx, setCreatedTx] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [localDeliveries, setLocalDeliveries] = useState<Transaction[]>([]);

  useEffect(() => {
    if (visible) {
      const startingType = initialType || (initialDeliveryId ? 'PAYMENT' : 'DELIVERY');
      setType(startingType);
      const targetSellerId = (seller?._id || seller?.id || (sellers.length > 0 ? (sellers[0]._id || sellers[0].id) : '')) || '';
      setSelectedSellerId(targetSellerId);
      
      if (initialDeliveryId) {
        setParentId(initialDeliveryId);
      } else {
        setParentId('');
        setAmount('');
      }

      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMode('UPI');
      setTank500(0);
      setTank1000(0);
      setTank2000(0);
      setFieldErrors({});
      setServerError(null);
      setLoading(false);
      setCreatedTx(null);
      setShowReceipt(false);
    }
  }, [visible]);

  // Dynamically load deliveries for payment linking if not pre-provided
  useEffect(() => {
    if (!visible || !selectedSellerId) return;
    if (deliveries && deliveries.length > 0) return;

    getTransactionsApi({ sellerId: selectedSellerId, type: 'DELIVERY' })
      .then((res) => {
        setLocalDeliveries(res.transactions || []);
      })
      .catch((err) => console.warn('Failed to load seller deliveries for linking:', err));
  }, [visible, selectedSellerId, deliveries]);

  const activeDeliveries = (deliveries && deliveries.length > 0) ? deliveries : localDeliveries;

  // Auto-fill amount when initial delivery or deliveries change
  useEffect(() => {
    if (parentId && activeDeliveries.length > 0) {
      const targetOrder = activeDeliveries.find((d) => (d._id || d.id) === parentId);
      if (targetOrder) {
        const due = targetOrder.remainingDue !== undefined ? targetOrder.remainingDue : targetOrder.amount;
        if (due > 0 && !amount) setAmount(String(due));
      }
    }
  }, [parentId, activeDeliveries]);

  const handleSelectType = (newType: 'DELIVERY' | 'PAYMENT') => {
    setType(newType);
    setFieldErrors({});
    setServerError(null);
    if (newType === 'DELIVERY') {
      setParentId('');
    } else {
      setTank500(0);
      setTank1000(0);
      setTank2000(0);
    }
  };

  const totalUnits = (tank500 || 0) + (tank1000 || 0) + (tank2000 || 0);

  const activeSeller = seller || sellers.find((s) => (s._id || s.id) === selectedSellerId);

  const handleClose = () => {
    if (loading) return;
    setFieldErrors({});
    setServerError(null);
    setCreatedTx(null);
    onClose();
  };

  const handleRecordAnother = () => {
    setCreatedTx(null);
    setAmount('');
    setNote('');
    setParentId('');
    setTank500(0);
    setTank1000(0);
    setTank2000(0);
    setFieldErrors({});
    setServerError(null);
  };

  const handleSubmit = async () => {
    if (loading) return;
    setServerError(null);

    const errs: { [key: string]: string } = {};

    if (!selectedSellerId) {
      errs.seller = 'Please select a vendor';
    }

    const numAmount = parseFloat(amount);
    if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than ₹0.00';
    }

    if (!date.trim()) {
      errs.date = 'Transaction date is required';
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const tx = await createTransactionApi({
        sellerId: selectedSellerId,
        parentId: type === 'PAYMENT' && parentId ? parentId : undefined,
        type,
        amount: numAmount,
        date,
        note: note.trim() || undefined,
        tank500: type === 'DELIVERY' ? tank500 : 0,
        tank1000: type === 'DELIVERY' ? tank1000 : 0,
        tank2000: type === 'DELIVERY' ? tank2000 : 0,
        paymentMode: type === 'PAYMENT' ? paymentMode : undefined,
      });

      await invalidateTransactions(selectedSellerId);
      setCreatedTx(tx);
      setShowReceipt(true);
      onSuccess(tx);
    } catch (e: any) {
      setServerError(e.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const fmtCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setCreatedTx(null);
    invalidateTransactions(selectedSellerId);
    onClose();
  };

  const deliveryOrders = activeDeliveries.filter((d) => String(d.type).toUpperCase() === 'DELIVERY');

  return (
    <>
      <Modal
        visible={visible && !showReceipt}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.keyboardContainer}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.titleGroup}>
                <View style={[styles.iconCircle, { backgroundColor: type === 'DELIVERY' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons
                    name={type === 'DELIVERY' ? 'cube' : 'cash'}
                    size={18}
                    color={type === 'DELIVERY' ? '#0284c7' : '#10b981'}
                  />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {type === 'DELIVERY' ? 'Record Delivery' : 'Record Payment'}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                    {activeSeller ? activeSeller.name : 'Record Transaction'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Transaction Creation Form */}
            <ScrollView style={styles.formScroll} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
              {serverError ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={styles.errorBannerText}>{serverError}</Text>
                </View>
              ) : null}

                {/* Type Switcher */}
                <View style={[styles.typeSwitcher, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      type === 'DELIVERY' ? styles.typeOptionActiveDelivery : null,
                    ]}
                    onPress={() => handleSelectType('DELIVERY')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={14}
                      color={type === 'DELIVERY' ? '#ffffff' : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.typeText, { color: type === 'DELIVERY' ? '#ffffff' : colors.textMuted }]}>
                      Delivery
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      type === 'PAYMENT' ? styles.typeOptionActivePayment : null,
                    ]}
                    onPress={() => handleSelectType('PAYMENT')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="cash-outline"
                      size={14}
                      color={type === 'PAYMENT' ? '#ffffff' : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.typeText, { color: type === 'PAYMENT' ? '#ffffff' : colors.textMuted }]}>
                      Payment
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Vendor Picker (if not fixed) */}
                {!seller && sellers.length > 0 ? (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>
                      SELECT VENDOR <Text style={{ color: '#ef4444' }}>*</Text>
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {sellers.map((s) => {
                          const sId = s._id || s.id;
                          const isSel = sId === selectedSellerId;
                          return (
                            <TouchableOpacity
                              key={sId}
                              style={[
                                styles.sellerChip,
                                { backgroundColor: isSel ? '#0284c7' : colors.bgCard, borderColor: colors.borderSubtle },
                              ]}
                              onPress={() => setSelectedSellerId(sId || '')}
                            >
                              <Text style={[styles.sellerChipText, { color: isSel ? '#ffffff' : colors.textPrimary }]}>
                                {s.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                ) : null}

                {/* Tank Units Stepper (DELIVERY ONLY) */}
                {type === 'DELIVERY' && (
                  <View style={{ marginBottom: 8 }}>
                    <TankSelector
                      tank500={tank500}
                      tank1000={tank1000}
                      tank2000={tank2000}
                      onChange={(key, val) => {
                        if (key === 'tank500') setTank500(val);
                        if (key === 'tank1000') setTank1000(val);
                        if (key === 'tank2000') setTank2000(val);
                        if (fieldErrors.tanks) setFieldErrors((p) => ({ ...p, tanks: '' }));
                      }}
                    />
                    {fieldErrors.tanks ? <Text style={styles.fieldError}>{fieldErrors.tanks}</Text> : null}
                  </View>
                )}

                {/* Payment Mode Selector (PAYMENT ONLY) */}
                {type === 'PAYMENT' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>PAYMENT MODE</Text>
                    <View style={styles.modeRow}>
                      {PAYMENT_MODES.map((mode) => (
                        <TouchableOpacity
                          key={mode}
                          style={[
                            styles.modeChip,
                            paymentMode === mode ? styles.modeChipActive : { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle },
                          ]}
                          onPress={() => setPaymentMode(mode)}
                        >
                          <Text style={[styles.modeChipText, { color: paymentMode === mode ? '#ffffff' : colors.textMuted }]}>
                            {mode.replace('_', ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Associated Delivery Order (PAYMENT ONLY) */}
                {type === 'PAYMENT' && (
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.label, { color: colors.textMuted }]}>
                        ASSOCIATED DELIVERY ORDER <Text style={styles.optionalText}>(Optional)</Text>
                      </Text>
                      {parentId ? (
                        <TouchableOpacity onPress={() => setParentId('')}>
                          <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: '700' }}>Clear Link</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {deliveryOrders.length === 0 ? (
                      <View style={[styles.unlinkedNotice, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
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
                              !parentId ? styles.linkedChipActive : { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle },
                            ]}
                            onPress={() => setParentId('')}
                          >
                            <Text style={[styles.linkedChipText, { color: !parentId ? '#ffffff' : colors.textMuted }]}>
                              -- General Payment (Unlinked) --
                            </Text>
                          </TouchableOpacity>
                          {deliveryOrders.map((d) => {
                            const dId = d._id || d.id;
                            const isSel = parentId === dId;
                            const dueAmt = d.remainingDue !== undefined ? d.remainingDue : d.amount;
                            const orderNum = (dId || '').slice(-6).toUpperCase();
                            return (
                              <TouchableOpacity
                                key={dId}
                                style={[
                                  styles.linkedChip,
                                  isSel ? styles.linkedChipActive : { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle },
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
                )}

                {/* Total Billed / Settlement Amount */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    {type === 'DELIVERY' ? 'TOTAL BILLED AMOUNT (₹)' : 'SETTLEMENT AMOUNT (₹)'} <Text style={{ color: '#ef4444' }}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: fieldErrors.amount ? '#ef4444' : colors.borderSubtle },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(val) => {
                      setAmount(val);
                      if (fieldErrors.amount) setFieldErrors((prev) => ({ ...prev, amount: '' }));
                    }}
                  />
                  {fieldErrors.amount ? <Text style={styles.errorText}>{fieldErrors.amount}</Text> : null}
                </View>

                {/* Date Picker (Calendar Modal) */}
                <DatePickerField
                  label="TRANSACTION DATE"
                  value={date}
                  onChange={(val) => {
                    setDate(val);
                    if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  error={fieldErrors.date}
                  required
                />

                {/* Note / Memo */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>
                    MEMO / NOTE <Text style={styles.optionalText}>(Optional)</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderSubtle },
                    ]}
                    placeholder={type === 'DELIVERY' ? 'Dispatch details, truck #...' : 'UPI ref, cheque #...'}
                    placeholderTextColor={colors.textMuted}
                    value={note}
                    onChangeText={setNote}
                  />
                </View>

                {/* Live Order Summary Banner Before Submit */}
                <View style={[styles.liveSummaryBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
                  <View style={styles.liveSummaryHeader}>
                    <Text style={[styles.liveSummaryTitle, { color: colors.textMuted }]}>PRE-SUBMISSION SUMMARY</Text>
                    <Text style={[styles.liveSummaryVendor, { color: colors.textPrimary }]}>
                      {activeSeller ? activeSeller.name : 'Unknown Vendor'}
                    </Text>
                  </View>
                  {type === 'DELIVERY' ? (
                    <View style={styles.liveSummaryRow}>
                      <Text style={[styles.liveSummaryLabel, { color: colors.textMuted }]}>Total Units:</Text>
                      <Text style={[styles.liveSummaryVal, { color: '#0284c7' }]}>
                        {totalUnits} Tanks (500L: {tank500} | 1000L: {tank1000} | 2000L: {tank2000})
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.liveSummaryRow}>
                      <Text style={[styles.liveSummaryLabel, { color: colors.textMuted }]}>Payment Settlement:</Text>
                      <Text style={[styles.liveSummaryVal, { color: '#10b981' }]}>
                        {paymentMode} {parentId ? `(Linked to Delivery #${parentId.slice(-6).toUpperCase()})` : '(General Credit)'}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.liveSummaryRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}>
                    <Text style={[styles.liveSummaryLabel, { color: colors.textPrimary, fontWeight: '800' }]}>Total Amount:</Text>
                    <Text style={[styles.liveSummaryAmount, { color: type === 'DELIVERY' ? '#0284c7' : '#10b981' }]}>
                      {fmtCurrency(parseFloat(amount) || 0)}
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: type === 'DELIVERY' ? '#0284c7' : '#10b981' },
                    loading ? { opacity: 0.6 } : null,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons
                        name={type === 'DELIVERY' ? 'cube' : 'cash'}
                        size={16}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.submitBtnText}>
                        {type === 'DELIVERY' ? 'Save Delivery' : 'Save Payment'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Official Server Receipt Modal */}
      {showReceipt && createdTx && (
        <ReceiptModal
          visible={showReceipt}
          onClose={handleReceiptClose}
          transaction={{
            ...createdTx,
            seller: activeSeller
              ? {
                  _id: activeSeller._id || activeSeller.id || '',
                  name: activeSeller.name,
                  phone: activeSeller.phone || undefined,
                }
              : undefined,
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  typeSwitcher: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  typeOptionActiveDelivery: {
    backgroundColor: '#0284c7',
  },
  typeOptionActivePayment: {
    backgroundColor: '#10b981',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  optionalText: {
    fontWeight: '400',
    fontSize: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 58,
    textAlignVertical: 'top',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  modeChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sellerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sellerChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  linkedChip: {
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
    fontSize: 11,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  // In-context success styles
  successIconBadge: {
    marginTop: 10,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  voucherCard: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  voucherCode: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  voucherAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  viewReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewReceiptBtnText: {
    color: '#0284c7',
    fontSize: 13,
    fontWeight: '800',
  },
  recordAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
  },
  recordAnotherBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  associatedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  associatedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  unlinkedNotice: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  unlinkedNoticeText: {
    fontSize: 11,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveSummaryBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  liveSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveSummaryTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveSummaryVendor: {
    fontSize: 12,
    fontWeight: '700',
  },
  liveSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  liveSummaryLabel: {
    fontSize: 11,
  },
  liveSummaryVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  liveSummaryAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },
});

