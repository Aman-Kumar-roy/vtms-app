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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Seller, ServerReceipt } from '../types';
import { getTransactionReceiptApi } from '../api/transaction';
import { useTheme } from '../context/ThemeContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  serverReceipt?: ServerReceipt | null;
  seller?: Seller | null;
}

// Company credentials (matching .env & web configuration)
const COMPANY_NAME = "VASUDHA POLYMER";
const COMPANY_GST = "07AAAAA0000A1Z5";
const COMPANY_PHONE = "+91 98765 43210";
const COMPANY_ADDRESS = "Plot 42, Industrial Zone, New Delhi - 110020";

const formatCurrency = (val: number = 0) =>
  '₹ ' + Number(val || 0).toLocaleString('en-IN', {
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

  // All hooks defined at the top level — NEVER after an early return!
  const [receipt, setReceipt] = useState<ServerReceipt | null>(propReceipt || transaction?.receipt || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) return;

    if (propReceipt) {
      setReceipt(propReceipt);
      setFetchError(null);
      return;
    }

    if (transaction?.receipt) {
      setReceipt(transaction.receipt);
      setFetchError(null);
      return;
    }

    const txId = transaction?._id || transaction?.id;
    if (txId) {
      setLoading(true);
      setFetchError(null);
      getTransactionReceiptApi(txId)
        .then((data) => {
          setReceipt(data);
        })
        .catch((err) => {
          console.warn('Failed to fetch server receipt:', err);
          setFetchError(err.message || 'Could not load official receipt from server');
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

  const tank500Qty = transaction?.tank500 ?? 0;
  const tank1000Qty = transaction?.tank1000 ?? 0;
  const tank2000Qty = transaction?.tank2000 ?? 0;

  const hasTanks = isDelivery && (tank500Qty > 0 || tank1000Qty > 0 || tank2000Qty > 0);
  const tankParts = [
    tank500Qty > 0 ? `500L: ${tank500Qty}` : null,
    tank1000Qty > 0 ? `1000L: ${tank1000Qty}` : null,
    tank2000Qty > 0 ? `2000L: ${tank2000Qty}` : null,
  ].filter(Boolean).join(' • ');

  const paymentModeVal = (receipt?.transaction?.paymentMode || transaction?.paymentMode || 'UPI').toUpperCase();
  const noteVal = receipt?.transaction?.note || transaction?.note || '';

  const buildHtmlReceipt = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Receipt-${receiptNo}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            padding: 24px;
          }
          .receipt-shell {
            max-width: 580px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
          }
          .header-band {
            background: #0f172a;
            color: #ffffff;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-col {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          .logo-box {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
            font-weight: 900;
            color: #0f172a;
            font-size: 16px;
          }
          .company-name {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #38bdf8;
            font-weight: 900;
          }
          .company-address {
            font-size: 12px;
            font-weight: 700;
            color: #cbd5e1;
            margin-top: 2px;
            line-height: 1.3;
          }
          .company-meta {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 4px;
          }
          .voucher-col {
            text-align: right;
          }
          .voucher-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${isDelivery ? '#4f46e5' : '#059669'};
            color: #ffffff;
          }
          .voucher-no {
            font-family: monospace;
            font-size: 13px;
            font-weight: 800;
            color: #cbd5e1;
            margin-top: 6px;
          }
          .body-content {
            padding: 20px 24px;
          }
          .vendor-box {
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px;
            border: 1px solid #e2e8f0;
            margin-bottom: 16px;
          }
          .vendor-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }
          .vendor-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            font-weight: 800;
          }
          .gst-pill {
            font-family: monospace;
            font-size: 10px;
            font-weight: 800;
            background: #e2e8f0;
            color: #1e293b;
            padding: 2px 8px;
            border-radius: 4px;
          }
          .vendor-name {
            font-size: 15px;
            font-weight: 900;
            color: #0f172a;
          }
          .vendor-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
            margin-top: 6px;
            font-size: 11px;
            color: #475569;
          }
          .vendor-addr {
            grid-column: span 2;
            margin-top: 2px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 12px;
          }
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          .detail-val {
            color: #0f172a;
            font-weight: 700;
          }
          .type-pill {
            font-size: 10px;
            font-weight: 800;
            padding: 3px 10px;
            border-radius: 9999px;
            background: ${isDelivery ? '#eef2ff' : '#ecfdf5'};
            color: ${isDelivery ? '#3730a3' : '#065f46'};
            border: 1px solid ${isDelivery ? '#c7d2fe' : '#a7f3d0'};
          }
          .mode-pill {
            font-size: 10px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 4px;
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
            text-transform: uppercase;
          }
          .amount-card {
            margin-top: 16px;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            background: ${isDelivery ? '#eef2ff' : '#ecfdf5'};
            border: 1px solid ${isDelivery ? '#c7d2fe' : '#a7f3d0'};
          }
          .amount-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 800;
            color: #64748b;
            margin-bottom: 4px;
          }
          .amount-val {
            font-size: 28px;
            font-weight: 900;
            color: ${isDelivery ? '#312e81' : '#065f46'};
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
          }
          .sig-box {
            text-align: center;
          }
          .sig-line {
            height: 32px;
            border-bottom: 1px dashed #cbd5e1;
          }
          .sig-caption {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            margin-top: 4px;
          }
          .footer-note {
            text-align: center;
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px dashed #e2e8f0;
            font-size: 10px;
            color: #64748b;
          }
          .footer-thanks {
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-shell">
          <div class="header-band">
            <div class="company-col">
              <div class="logo-box">VP</div>
              <div>
                <p class="company-name">${COMPANY_NAME}</p>
                <p class="company-address">${COMPANY_ADDRESS}</p>
                <p class="company-meta">Phone: ${COMPANY_PHONE} &bull; GSTIN: <b>${COMPANY_GST}</b></p>
              </div>
            </div>
            <div class="voucher-col">
              <span class="voucher-badge">${isDelivery ? 'DELIVERY RECEIPT' : 'PAYMENT RECEIPT'}</span>
              <p class="voucher-no">${receiptNo}</p>
            </div>
          </div>

          <div class="body-content">
            <div class="vendor-box">
              <div class="vendor-top-row">
                <span class="vendor-label">Seller / Vendor Details</span>
                ${vendorGst ? `<span class="gst-pill">GSTIN: ${vendorGst}</span>` : ''}
              </div>
              <p class="vendor-name">${vendorName}</p>
              <div class="vendor-grid">
                ${vendorPhone ? `<div>Phone: <b>${vendorPhone}</b></div>` : ''}
                ${vendorEmail ? `<div>${vendorEmail}</div>` : ''}
                ${vendorAddress ? `<div class="vendor-addr">${vendorAddress}</div>` : ''}
              </div>
            </div>

            <div class="detail-row">
              <span class="detail-label">Transaction ID</span>
              <span class="detail-val" style="font-family: monospace;">${txIdDisplay || 'N/A'}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Transaction Type</span>
              <span class="type-pill">${isDelivery ? 'Delivery Order (Goods)' : 'Payment Settlement'}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Date of Record</span>
              <span class="detail-val">${formatDate(txDate)}</span>
            </div>

            ${hasTanks ? `
            <div class="detail-row">
              <span class="detail-label">Tanks Delivered</span>
              <span class="detail-val" style="color: #1e40af;">${tankParts}</span>
            </div>
            ` : ''}

            ${!isDelivery ? `
            <div class="detail-row">
              <span class="detail-label">Payment Mode</span>
              <span class="mode-pill">${paymentModeVal}</span>
            </div>
            ` : ''}

            ${noteVal ? `
            <div class="detail-row">
              <span class="detail-label">Reference / Note</span>
              <span class="detail-val">${noteVal}</span>
            </div>
            ` : ''}

            <div class="amount-card">
              <p class="amount-label">${isDelivery ? 'Total Delivery Amount' : 'Amount Cleared / Settled'}</p>
              <p class="amount-val">${formatCurrency(txAmount)}</p>
            </div>

            <div class="signatures">
              <div class="sig-box">
                <div class="sig-line"></div>
                <p class="sig-caption">Recipient / Vendor Sign</p>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <p class="sig-caption">For ${COMPANY_NAME}</p>
              </div>
            </div>

            <div class="footer-note">
              <p>&check; Official Computer Generated Document &bull; ${COMPANY_NAME}</p>
              <p style="margin-top: 2px;">${formatDateTime(new Date().toISOString())}</p>
              <p class="footer-thanks">Thank you for your business!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const html = buildHtmlReceipt();
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: `Download Receipt ${receiptNo}`,
          });
        } else {
          await Print.printAsync({ uri });
        }
      }
    } catch (err: any) {
      console.warn('PDF export error:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          {/* Top Control Bar (matching web preview banner) */}
          <View style={[styles.topActions, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.topTitleRow}>
              <Ionicons name="shield-checkmark" size={16} color="#38bdf8" style={{ marginRight: 6 }} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Official Receipt Preview
              </Text>
            </View>
            <View style={styles.topButtonsRow}>
              <TouchableOpacity
                style={styles.printHeaderBtn}
                onPress={handleDownloadPdf}
                disabled={downloadingPdf}
                activeOpacity={0.8}
              >
                {downloadingPdf ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="print-outline" size={14} color="#ffffff" style={{ marginRight: 5 }} />
                    <Text style={styles.printHeaderBtnText}>Print / PDF</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#0284c7" />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                Loading official receipt...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 16 }}>
              {fetchError && (
                <View style={styles.errorNotice}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={styles.errorNoticeText}>{fetchError}</Text>
                </View>
              )}

              {/* ── The printable receipt card (Exact Web Parity) ── */}
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
                      <Text style={styles.brandName}>{COMPANY_NAME}</Text>
                      <Text style={styles.brandAddress}>{COMPANY_ADDRESS}</Text>
                      <View style={styles.brandMetaRow}>
                        <Text style={styles.brandMetaText}>Phone: {COMPANY_PHONE}</Text>
                        <Text style={styles.brandMetaDot}>•</Text>
                        <Text style={styles.brandMetaText}>GSTIN: {COMPANY_GST}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.voucherRight}>
                    <View style={[styles.voucherBadge, { backgroundColor: isDelivery ? '#4f46e5' : '#059669' }]}>
                      <Text style={styles.voucherBadgeText}>
                        {isDelivery ? 'DELIVERY RECEIPT' : 'PAYMENT RECEIPT'}
                      </Text>
                    </View>
                    <Text style={styles.voucherNoText}>{receiptNo}</Text>
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

                  {/* Details Key-Value Table */}
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
                      <Text style={styles.rowLabel}>Date of Record</Text>
                      <Text style={styles.rowVal}>{formatDate(txDate)}</Text>
                    </View>

                    {hasTanks ? (
                      <View style={styles.tableRow}>
                        <Text style={styles.rowLabel}>Tanks Delivered</Text>
                        <Text style={[styles.rowVal, { color: '#1e40af' }]}>{tankParts}</Text>
                      </View>
                    ) : null}

                    {!isDelivery ? (
                      <View style={styles.tableRow}>
                        <Text style={styles.rowLabel}>Payment Mode</Text>
                        <View style={styles.paymentModeBadge}>
                          <Text style={styles.paymentModeText}>{paymentModeVal}</Text>
                        </View>
                      </View>
                    ) : null}

                    {noteVal ? (
                      <View style={styles.tableRow}>
                        <Text style={styles.rowLabel}>Reference / Note</Text>
                        <Text style={styles.rowVal} numberOfLines={2}>{noteVal}</Text>
                      </View>
                    ) : null}
                  </View>

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

                  {/* Signatures */}
                  <View style={styles.signatureRow}>
                    <View style={styles.sigCol}>
                      <View style={styles.sigDashedLine} />
                      <Text style={styles.sigText}>Recipient / Vendor Sign</Text>
                    </View>
                    <View style={styles.sigCol}>
                      <View style={styles.sigDashedLine} />
                      <Text style={styles.sigText}>For {COMPANY_NAME}</Text>
                    </View>
                  </View>

                  {/* Footer Note */}
                  <View style={styles.footerBlock}>
                    <Text style={styles.footerNoteText}>
                      ✓ Official Computer Generated Document • {COMPANY_NAME}
                    </Text>
                    <Text style={styles.footerSubText}>{formatDateTime(new Date().toISOString())}</Text>
                    <Text style={styles.footerThanks}>Thank you for your business!</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Action Footer Bar */}
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
                  <Ionicons name="download-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>Download PDF</Text>
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
  topButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  printHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  printHeaderBtnText: {
    color: '#ffffff',
    fontSize: 12,
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
  amountCard: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 14,
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
