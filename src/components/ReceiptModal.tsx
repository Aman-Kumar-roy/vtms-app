import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Seller, ServerReceipt } from '../types';
import { getTransactionReceiptApi, downloadReceiptPdfApi } from '../api/transaction';
import { useTheme } from '../context/ThemeContext';
import { ToastNotification } from './ToastNotification';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  serverReceipt?: ServerReceipt | null;
  seller?: Seller | null;
}

interface NormalizedTankItem {
  size: 500 | 1000;
  quantity: number;
  layers: number | null;
  foam?: string;
}

const formatCurrency = (val: number = 0) =>
  '₹ ' + Math.abs(Number(val || 0)).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  onClose,
  transaction,
  serverReceipt: propReceipt,
  seller,
}) => {
  const { colors } = useTheme();

  // All hooks defined at the top level
  const [receipt, setReceipt] = useState<ServerReceipt | null>(propReceipt || transaction?.receipt || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setFetchError(null);
      return;
    }

    // Set initial placeholder receipt if provided
    if (propReceipt) {
      setReceipt(propReceipt);
    } else if (transaction?.receipt) {
      setReceipt(transaction.receipt);
    } else {
      setReceipt(null);
    }

    const txId = transaction?._id || transaction?.id;
    if (txId) {
      if (!propReceipt && !transaction?.receipt) {
        setLoading(true);
      }
      setFetchError(null);
      // Always communicate with backend to fetch authoritative server receipt
      getTransactionReceiptApi(String(txId))
        .then((data) => {
          setReceipt(data);
        })
        .catch((err) => {
          console.warn('Failed to fetch server receipt:', err);
          if (!propReceipt && !transaction?.receipt) {
            setFetchError(err.message || 'Could not load official receipt from server');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, propReceipt, transaction]);

  // Derived values
  const isDelivery = String(receipt?.transaction.type || transaction?.type || '').toUpperCase() === 'DELIVERY';

  const txIdDisplay = (transaction?._id || transaction?.id || receipt?.transaction?.id || '').toUpperCase();
  const receiptNo = receipt?.receiptNo || (txIdDisplay ? `RCP-${txIdDisplay.slice(-8)}` : `RCP-${new Date().getFullYear()}-0001`);

  const txDate = receipt?.issueDate || transaction?.date || new Date().toISOString();
  const txAmount = receipt?.transaction.amount ?? transaction?.amount ?? 0;

  const companyName = receipt?.company?.name || '';
  const companyGst = receipt?.company?.gst || '';
  const companyPhone = receipt?.company?.phone || '';
  const companyAddress = receipt?.company?.address || '';

  const isFallbackName = (n?: string | null) =>
    !n || n === 'Valued Vendor Partner' || n === 'Valued Vendor' || n === 'Vendor Account' || n === 'Vendor';

  const vendorName =
    (!isFallbackName(receipt?.seller?.name) ? receipt?.seller?.name : null) ||
    (!isFallbackName(seller?.name) ? seller?.name : null) ||
    (!isFallbackName(transaction?.sellerName) ? transaction?.sellerName : null) ||
    (!isFallbackName(transaction?.seller?.name) ? transaction?.seller?.name : null) ||
    (typeof transaction?.sellerId === 'object' && !isFallbackName((transaction.sellerId as any)?.name) ? (transaction.sellerId as any)?.name : null) ||
    receipt?.seller?.name ||
    seller?.name ||
    transaction?.sellerName ||
    'Valued Vendor';

  const vendorGst = receipt?.seller?.gstNumber || seller?.gstNumber || transaction?.sellerGstNumber || transaction?.seller?.gstNumber || '';
  const vendorPhone = receipt?.seller?.phone || seller?.phone || transaction?.sellerPhone || transaction?.seller?.phone || '';
  const vendorEmail = receipt?.seller?.email || seller?.email || transaction?.sellerEmail || transaction?.seller?.email || '';
  const vendorAddress = receipt?.seller?.address || seller?.address || transaction?.sellerAddress || transaction?.seller?.address || '';

  // Parse structured tank items for delivery
  const rawTankItems = (transaction?.tankItems && transaction.tankItems.length > 0)
    ? transaction.tankItems
    : (receipt?.transaction?.tankItems && receipt.transaction.tankItems.length > 0)
    ? receipt.transaction.tankItems
    : null;

  const normalizedItems: NormalizedTankItem[] = [];
  if (isDelivery) {
    if (rawTankItems && rawTankItems.length > 0) {
      rawTankItems.forEach((it: any) => {
        const qty = Number(it.quantity) || 0;
        if (qty > 0) {
          normalizedItems.push({
            size: Number(it.size) === 1000 ? 1000 : 500,
            quantity: qty,
            layers: it.layers ? Number(it.layers) : null,
            foam: it.size === 1000 ? (it.foam || 'none') : undefined,
          });
        }
      });
    } else {
      const t500 = Number(transaction?.tank500 ?? receipt?.transaction?.tank500 ?? 0);
      const t1000 = Number(transaction?.tank1000 ?? receipt?.transaction?.tank1000 ?? 0);
      const t500Layers = transaction?.tank500_layers ?? receipt?.transaction?.tank500_layers;
      const t1000Layers = transaction?.tank1000_layers ?? receipt?.transaction?.tank1000_layers;
      const t1000Foam = transaction?.tank1000_foam ?? receipt?.transaction?.tank1000_foam;

      if (t500 > 0) {
        normalizedItems.push({
          size: 500,
          quantity: t500,
          layers: t500Layers ? Number(t500Layers) : null,
        });
      }
      if (t1000 > 0) {
        normalizedItems.push({
          size: 1000,
          quantity: t1000,
          layers: t1000Layers ? Number(t1000Layers) : null,
          foam: t1000Foam || 'none',
        });
      }
    }
  }

  const totalUnits = normalizedItems.reduce((acc, it) => acc + it.quantity, 0);

  // Authoritative Ledger Dues (Strictly read-only)
  const effectivePreviousDues = transaction?.previousDues !== undefined && transaction?.previousDues !== null
    ? Number(transaction.previousDues)
    : (receipt?.settlement?.previousDues ?? receipt?.transaction?.previousDues ?? 0);

  const effectiveCurrentDues = transaction?.currentDues !== undefined && transaction?.currentDues !== null
    ? Number(transaction.currentDues)
    : (receipt?.settlement?.closingBalance ?? (isDelivery ? effectivePreviousDues + txAmount : effectivePreviousDues - txAmount));

  const paymentModeVal = (receipt?.transaction?.paymentMode || transaction?.paymentMode || 'UPI').toUpperCase();
  const noteVal = (receipt?.transaction?.note || transaction?.note || '').trim();

  // Unified single action: Print or download the authoritative server vector PDF
  const handleDownloadPdf = async () => {
    const txId = transaction?._id || transaction?.id || receipt?.transaction?.id;
    if (!txId) {
      Alert.alert('Download Receipt', 'Transaction identifier not found.');
      return;
    }

    setDownloadingPdf(true);
    try {
      const uri = await downloadReceiptPdfApi(String(txId));
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Receipt ${receiptNo}`,
        });
      } else {
        await Print.printAsync({ uri });
      }
    } catch (err: any) {
      console.warn('PDF download/share error:', err);
      Alert.alert('Download Receipt', err?.message || 'Unable to generate official receipt PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          {/* Top Control Bar (Clean title + single close button, zero duplicate print buttons) */}
          <View style={[styles.topActions, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.topTitleRow}>
              <Ionicons name="shield-checkmark" size={16} color="#38bdf8" style={{ marginRight: 6 }} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Official Receipt Preview
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {loading || (!receipt && !fetchError) ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#0284c7" />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                Loading official receipt...
              </Text>
            </View>
          ) : !receipt && fetchError ? (
            <View style={[styles.scrollArea, { padding: 24, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 16 }}>
                {fetchError}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.accent,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
                onPress={() => {
                  const txId = transaction?._id || transaction?.id;
                  if (txId) {
                    setLoading(true);
                    setFetchError(null);
                    getTransactionReceiptApi(String(txId))
                      .then((data) => setReceipt(data))
                      .catch((err) => setFetchError(err.message || 'Could not load official receipt'))
                      .finally(() => setLoading(false));
                  }
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 16 }}>
              {fetchError && (
                <View style={styles.errorNotice}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={styles.errorNoticeText}>{fetchError}</Text>
                </View>
              )}

              {/* ── The printable receipt card (Exact Web & PDF Parity) ── */}
              <View style={styles.receiptCard}>
                {/* Header Band */}
                <View style={styles.headerBand}>
                  <View style={styles.companyRow}>
                    <View style={styles.logoBox}>
                      <Image
                        source={require('../../assets/logo.jpg')}
                        style={styles.logoImg}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      {companyName ? <Text style={styles.brandName}>{companyName}</Text> : null}
                      {companyAddress ? <Text style={styles.brandAddress}>{companyAddress}</Text> : null}
                      {(companyPhone || companyGst) ? (
                        <View style={styles.brandMetaRow}>
                          {companyPhone ? <Text style={styles.brandMetaText}>Phone: {companyPhone}</Text> : null}
                          {companyPhone && companyGst ? <Text style={styles.brandMetaDot}>•</Text> : null}
                          {companyGst ? <Text style={styles.brandMetaText}>GSTIN: {companyGst}</Text> : null}
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.voucherRight}>
                    <View style={[styles.voucherBadge, { backgroundColor: isDelivery ? '#4f46e5' : '#059669' }]}>
                      <Text style={styles.voucherBadgeText}>
                        {isDelivery ? 'DELIVERY RECEIPT' : 'PAYMENT RECEIPT'}
                      </Text>
                    </View>
                    <Text style={styles.voucherNoText}>{receiptNo}</Text>
                    <Text style={styles.voucherDateText}>
                      {isDelivery ? 'Order Date: ' : 'Date: '}{formatDate(txDate)}
                    </Text>
                  </View>
                </View>

                {/* Body Content */}
                <View style={styles.bodyContent}>
                  {/* Seller / Vendor Details Box */}
                  <View style={styles.vendorBox}>
                    <View style={styles.vendorHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="business-outline" size={13} color="#64748b" style={{ marginRight: 4 }} />
                        <Text style={styles.vendorTitleLabel}>SELLER / VENDOR DETAILS</Text>
                      </View>
                      {vendorGst ? (
                        <View style={styles.gstBadge}>
                          <Text style={styles.gstBadgeText}>GSTIN: {vendorGst}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.vendorNameText}>{vendorName}</Text>
                    <View style={styles.vendorGrid}>
                      {vendorPhone ? (
                        <Text style={styles.vendorDetailText}>Phone: <Text style={{ fontWeight: '700' }}>{vendorPhone}</Text></Text>
                      ) : null}
                      {vendorEmail ? (
                        <Text style={styles.vendorDetailText}>{vendorEmail}</Text>
                      ) : null}
                    </View>
                    {vendorAddress ? (
                      <Text style={[styles.vendorDetailText, { marginTop: 3 }]}>{vendorAddress}</Text>
                    ) : null}
                  </View>

                  {/* Key-Value Summary Block */}
                  <View style={styles.tableBlock}>
                    <View style={styles.tableRow}>
                      <Text style={styles.rowLabel}>Transaction ID</Text>
                      <Text style={styles.rowValMono}>{txIdDisplay || 'N/A'}</Text>
                    </View>

                    <View style={styles.tableRow}>
                      <Text style={styles.rowLabel}>Transaction Type</Text>
                      <View style={[styles.typeBadge, {
                        backgroundColor: isDelivery ? '#eef2ff' : '#ecfdf5',
                        borderColor: isDelivery ? '#c7d2fe' : '#a7f3d0',
                      }]}>
                        <Text style={[styles.typeBadgeText, { color: isDelivery ? '#3730a3' : '#065f46' }]}>
                          {isDelivery ? 'Delivery Order (Goods)' : 'Payment Settlement'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tableRow}>
                      <Text style={styles.rowLabel}>{isDelivery ? 'Order Date' : 'Payment Date'}</Text>
                      <Text style={styles.rowVal}>{formatDate(txDate)}</Text>
                    </View>

                    {!isDelivery && (
                      <View style={styles.tableRow}>
                        <Text style={styles.rowLabel}>Payment Mode</Text>
                        <View style={styles.paymentModeBadge}>
                          <Text style={styles.paymentModeText}>{paymentModeVal}</Text>
                        </View>
                      </View>
                    )}

                    {!isDelivery && transaction?.parentDelivery?.date && (
                      <View style={styles.tableRow}>
                        <Text style={styles.rowLabel}>Linked Order Date</Text>
                        <Text style={styles.rowVal}>{formatDate(transaction.parentDelivery.date)}</Text>
                      </View>
                    )}

                    {noteVal ? (
                      <View style={[styles.tableRow, { alignItems: 'flex-start' }]}>
                        <Text style={styles.rowLabel}>Reference / Note</Text>
                        <Text style={[styles.rowVal, { flex: 1, marginLeft: 12, textAlign: 'right' }]}>{noteVal}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* ── Structured Itemized Delivery Table (for 18+ tanks & multiple variants) ── */}
                  {isDelivery && normalizedItems.length > 0 && (
                    <View style={styles.tankTableCard}>
                      <View style={styles.tankTableHeader}>
                        <Ionicons name="water" size={13} color="#2563eb" style={{ marginRight: 5 }} />
                        <Text style={styles.tankTableTitle}>ITEMIZED TANKS DELIVERED</Text>
                      </View>

                      {/* Headings */}
                      <View style={styles.tankTableRowHeader}>
                        <Text style={[styles.tankTableHeadCell, { width: 22 }]}>#</Text>
                        <Text style={[styles.tankTableHeadCell, { flex: 1.3 }]}>Capacity</Text>
                        <Text style={[styles.tankTableHeadCell, { flex: 1.5 }]}>Specification</Text>
                        <Text style={[styles.tankTableHeadCell, { width: 55, textAlign: 'right' }]}>Qty</Text>
                      </View>

                      {/* Item Rows */}
                      {normalizedItems.map((item, idx) => {
                        const foamStr = item.size === 1000 && item.foam && item.foam !== 'none'
                          ? ` • ${item.foam.charAt(0).toUpperCase() + item.foam.slice(1)} Foam`
                          : '';
                        return (
                          <View key={idx} style={[styles.tankTableRow, idx % 2 === 1 && { backgroundColor: '#f8fafc' }]}>
                            <Text style={[styles.tankTableCell, { width: 22, color: '#94a3b8' }]}>{idx + 1}</Text>
                            <Text style={[styles.tankTableCell, { flex: 1.3, fontWeight: '800', color: '#0f172a' }]}>
                              {item.size}L Tank
                            </Text>
                            <Text style={[styles.tankTableCell, { flex: 1.5, color: '#475569' }]}>
                              {item.layers ? `${item.layers} Layers` : 'Standard'}{foamStr}
                            </Text>
                            <Text style={[styles.tankTableCell, { width: 55, textAlign: 'right', fontWeight: '800', color: '#1d4ed8' }]}>
                              {item.quantity} Units
                            </Text>
                          </View>
                        );
                      })}

                      {/* Summary Footnote */}
                      <View style={styles.tankTableFooter}>
                        <Text style={styles.tankTableFooterLabel}>Total Delivered Quantity:</Text>
                        <Text style={styles.tankTableFooterVal}>{totalUnits} Tanks</Text>
                      </View>
                    </View>
                  )}

                  {/* Highlight Amount Box */}
                  <View style={[styles.amountCard, {
                    backgroundColor: isDelivery ? '#eef2ff' : '#ecfdf5',
                    borderColor: isDelivery ? '#c7d2fe' : '#a7f3d0',
                  }]}>
                    <Text style={styles.amountLabel}>
                      {isDelivery ? 'TOTAL DELIVERY AMOUNT' : 'AMOUNT CLEARED / SETTLED'}
                    </Text>
                    <Text style={[styles.amountValue, { color: isDelivery ? '#312e81' : '#065f46' }]}>
                      {formatCurrency(txAmount)}
                    </Text>
                  </View>

                  {/* Financial Balance Summary (Authoritative Ledger Dues) */}
                  <View style={styles.duesCard}>
                    <View style={styles.duesCol}>
                      <Text style={styles.duesColLabel}>
                        {effectivePreviousDues < 0 ? 'PREVIOUS ADVANCE' : 'PREVIOUS DUES'}
                      </Text>
                      <Text style={[styles.duesColVal, effectivePreviousDues < 0 && { color: '#047857' }]}>
                        {effectivePreviousDues < 0 ? `+ ${formatCurrency(effectivePreviousDues)}` : formatCurrency(effectivePreviousDues)}
                      </Text>
                    </View>
                    <View style={styles.duesCol}>
                      <Text style={styles.duesColLabel}>{isDelivery ? 'DELIVERY BILL' : 'PAYMENT PAID'}</Text>
                      <Text style={[styles.duesColVal, { color: isDelivery ? '#4338ca' : '#047857' }]}>
                        {isDelivery ? '+' : '-'}{formatCurrency(txAmount)}
                      </Text>
                    </View>
                    <View style={styles.duesCol}>
                      <Text style={styles.duesColLabel}>
                        {effectiveCurrentDues < 0 ? 'CLOSING ADVANCE' : 'CLOSING BALANCE'}
                      </Text>
                      <Text style={[styles.duesColVal, { fontWeight: '900', color: effectiveCurrentDues < 0 ? '#047857' : '#0f172a' }]}>
                        {effectiveCurrentDues < 0 ? `+ ${formatCurrency(effectiveCurrentDues)}` : formatCurrency(effectiveCurrentDues)}
                      </Text>
                    </View>
                  </View>

                  {/* Signatures */}
                  <View style={styles.signatureRow}>
                    <View style={styles.sigCol}>
                      <View style={styles.sigDashedLine} />
                      <Text style={styles.sigText}>Recipient / Vendor Sign</Text>
                    </View>
                    <View style={styles.sigCol}>
                      <View style={styles.sigDashedLine} />
                      <Text style={styles.sigText}>For {companyName}</Text>
                    </View>
                  </View>

                  {/* Footer Note */}
                  <View style={styles.footerBlock}>
                    <Text style={styles.footerNoteText}>
                      ✓ Official Computer Generated Document • {companyName}
                    </Text>
                    <Text style={styles.footerSubText}>{formatDateTime(new Date().toISOString())}</Text>
                    <Text style={styles.footerThanks}>Thank you for your business!</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Action Footer Bar: Single Primary Action + Done */}
          <View style={[styles.actionFooter, { borderTopColor: colors.borderSubtle, backgroundColor: colors.bgSecondary }]}>
            <TouchableOpacity
              style={styles.actionDownloadBtn}
              onPress={handleDownloadPdf}
              disabled={downloadingPdf}
              activeOpacity={0.8}
            >
              {downloadingPdf ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="print-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>Print / Download PDF</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionDoneBtn, { backgroundColor: colors.accentHover }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* In-Modal Floating Toast */}
        <ToastNotification
          visible={!!toastMsg}
          message={toastMsg || ''}
          onDismiss={() => setToastMsg(null)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '94%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 12,
  },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorNoticeText: {
    color: '#ef4444',
    fontSize: 12,
    flex: 1,
  },
  scrollArea: {
    padding: 12,
  },
  receiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerBand: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginRight: 10,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  brandAddress: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 14,
  },
  brandMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    flexWrap: 'wrap',
  },
  brandMetaText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  brandMetaDot: {
    color: '#64748b',
    fontSize: 10,
    marginHorizontal: 4,
  },
  voucherRight: {
    alignItems: 'flex-end',
  },
  voucherBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voucherBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  voucherNoText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
  },
  voucherDateText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  bodyContent: {
    padding: 16,
  },
  vendorBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  vendorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorTitleLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  gstBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gstBadgeText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#1e293b',
  },
  vendorNameText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  vendorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  vendorDetailText: {
    fontSize: 11,
    color: '#475569',
  },
  tableBlock: {
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  rowVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  rowValMono: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#1e293b',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  paymentModeBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentModeText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: '800',
  },
  tankTableCard: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tankTableHeader: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  tankTableTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#334155',
    letterSpacing: 0.5,
  },
  tankTableRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tankTableHeadCell: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
  },
  tankTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tankTableCell: {
    fontSize: 10.5,
  },
  tankTableFooter: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  tankTableFooterLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    marginRight: 6,
  },
  tankTableFooterVal: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1e3a8a',
  },
  amountCard: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  duesCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  duesCol: {
    alignItems: 'center',
    flex: 1,
  },
  duesColLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  duesColVal: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#334155',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 16,
  },
  sigCol: {
    flex: 1,
    alignItems: 'center',
  },
  sigDashedLine: {
    width: '100%',
    height: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  sigText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  footerBlock: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  footerNoteText: {
    fontSize: 10,
    color: '#64748b',
  },
  footerSubText: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  footerThanks: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 3,
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionDoneBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
