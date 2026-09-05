import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Seller } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SellerCardProps {
  seller: Seller;
  onPress: () => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, onPress }) => {
  const { colors } = useTheme();

  const dues = Number(seller.totalDues || 0);
  const deliveries = Number(seller.totalDeliveries || 0);
  const paid = Number(seller.totalPaid || 0);
  const hasDues = dues > 0;

  const fmtCurrency = (val: number) =>
    '₹' +
    Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Generate 1-2 letter monogram from seller name
  const nameParts = (seller.name || 'Vendor').trim().split(/\s+/);
  const initials =
    nameParts.length > 1
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : (seller.name || 'V').slice(0, 2).toUpperCase();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.borderSubtle,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Header: Logo, Identity & Chevron */}
      <View style={styles.headerRow}>
        {/* Stylized Seller Logo Container */}
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoBadge,
              {
                backgroundColor: hasDues
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(2, 132, 199, 0.15)',
                borderColor: hasDues
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(2, 132, 199, 0.3)',
              },
            ]}
          >
            <Text
              style={[
                styles.logoInitials,
                { color: hasDues ? '#ef4444' : '#0284c7' },
              ]}
            >
              {initials}
            </Text>
          </View>
          {/* Status Dot */}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: hasDues ? '#ef4444' : '#10b981' },
            ]}
          />
        </View>

        {/* Business Identity */}
        <View style={styles.identityCol}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.vendorName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {seller.name}
            </Text>
          </View>

          {/* Subtitle Details: Phone & GST Tag */}
          <View style={styles.contactMetaRow}>
            {seller.phone ? (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.contactText, { color: colors.textMuted }]} numberOfLines={1}>
                  {seller.phone}
                </Text>
              </View>
            ) : seller.email ? (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.contactText, { color: colors.textMuted }]} numberOfLines={1}>
                  {seller.email}
                </Text>
              </View>
            ) : (
              <Text style={[styles.contactText, { color: colors.textMuted }]}>
                Registered Vendor
              </Text>
            )}

            {seller.gstNumber ? (
              <View style={styles.gstBadge}>
                <Text style={styles.gstBadgeText}>GSTIN</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Navigation Indicator Chevron */}
        <View
          style={[
            styles.chevronBox,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          ]}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>

      {/* Financial Overview Strip */}
      <View
        style={[
          styles.financeStrip,
          {
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {/* Due / Balance Pill */}
        <View style={styles.financeCol}>
          <Text style={[styles.financeLabel, { color: colors.textMuted }]}>
            {hasDues ? 'NET DUES' : 'STATUS'}
          </Text>
          <Text
            style={[
              styles.dueValue,
              { color: hasDues ? '#ef4444' : '#10b981' },
            ]}
          >
            {hasDues ? fmtCurrency(dues) : 'Settled ✓'}
          </Text>
        </View>

        <View style={[styles.stripDivider, { backgroundColor: colors.borderSubtle }]} />

        {/* Total Billed */}
        <View style={styles.financeCol}>
          <Text style={[styles.financeLabel, { color: colors.textMuted }]}>TOTAL BILLED</Text>
          <Text style={[styles.financeValue, { color: colors.textPrimary }]}>
            {fmtCurrency(deliveries)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginRight: 14,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitials: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  identityCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  contactMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    fontWeight: '500',
  },
  gstBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  gstBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: 0.5,
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  financeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  financeCol: {
    flex: 1,
  },
  financeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dueValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  financeValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  stripDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
  },
});
