import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ShimmerBlockProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const ShimmerBlock: React.FC<ShimmerBlockProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.7],
  });

  const { theme } = useTheme();
  const blockBg = theme === 'dark' ? '#1e293b' : '#e2e8f0';

  return (
    <Animated.View
      style={[
        styles.block,
        {
          backgroundColor: blockBg,
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SellerCardSkeleton: React.FC = () => {
  const { colors, theme } = useTheme();

  return (
    <View style={[styles.sellerCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
      {/* Top Header: Logo, Identity & Chevron */}
      <View style={styles.rowAlign}>
        <ShimmerBlock width={48} height={48} borderRadius={14} style={{ marginRight: 14 }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ShimmerBlock width={140} height={18} borderRadius={6} />
          <ShimmerBlock width={100} height={12} borderRadius={4} style={{ marginTop: 5 }} />
        </View>
        <ShimmerBlock width={32} height={32} borderRadius={10} style={{ marginLeft: 8 }} />
      </View>

      {/* Financial Overview Strip */}
      <View
        style={[
          styles.sellerFinanceStrip,
          {
            backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.65)' : colors.bgPrimary,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <ShimmerBlock width={50} height={9} borderRadius={3} />
          <ShimmerBlock width={80} height={14} borderRadius={4} style={{ marginTop: 4 }} />
        </View>

        <View style={[styles.stripDivider, { backgroundColor: colors.borderSubtle }]} />

        <View style={{ flex: 1 }}>
          <ShimmerBlock width={65} height={9} borderRadius={3} />
          <ShimmerBlock width={80} height={14} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
};

export const TransactionCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.txCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
      {/* Top Row: Type & Status Badge + Amount */}
      <View style={styles.rowBetween}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ShimmerBlock width={75} height={20} borderRadius={6} />
          <ShimmerBlock width={60} height={18} borderRadius={6} />
        </View>
        <ShimmerBlock width={85} height={18} borderRadius={6} />
      </View>

      {/* Mid Row: Vendor Name + Date */}
      <View style={[styles.rowBetween, { marginTop: 8, marginBottom: 6 }]}>
        <ShimmerBlock width={140} height={15} borderRadius={5} />
        <ShimmerBlock width={75} height={13} borderRadius={4} />
      </View>

      {/* Minimalist Finance Box & Progress Track */}
      <View style={styles.rowBetween}>
        <ShimmerBlock width={65} height={11} borderRadius={3} />
        <ShimmerBlock width={65} height={11} borderRadius={3} />
        <ShimmerBlock width={65} height={11} borderRadius={3} />
      </View>
      <ShimmerBlock width="100%" height={3} borderRadius={1.5} style={{ marginTop: 5, marginBottom: 6 }} />

      {/* Tank Line Items Row */}
      <View style={{ flexDirection: 'row', gap: 6, marginVertical: 3 }}>
        <ShimmerBlock width={110} height={22} borderRadius={6} />
        <ShimmerBlock width={120} height={22} borderRadius={6} />
      </View>

      {/* Continuity Row */}
      <ShimmerBlock width={170} height={13} borderRadius={4} style={{ marginTop: 4 }} />
    </View>
  );
};

export const ReceiptCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.receiptCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
      {/* Header: Date & Type Badge */}
      <View style={[styles.rowBetween, { marginBottom: 8 }]}>
        <ShimmerBlock width={80} height={14} borderRadius={4} />
        <ShimmerBlock width={75} height={22} borderRadius={6} />
      </View>

      {/* Vendor Name & Phone */}
      <View style={{ marginBottom: 10 }}>
        <ShimmerBlock width={160} height={18} borderRadius={6} />
        <ShimmerBlock width={100} height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>

      {/* Breakdown & Amount Row */}
      <View style={[styles.rowBetween, { alignItems: 'flex-end', marginBottom: 10 }]}>
        <ShimmerBlock width={130} height={16} borderRadius={4} />
        <ShimmerBlock width={90} height={20} borderRadius={6} />
      </View>

      {/* Action Row: Receipt Button */}
      <View style={[styles.rowEnd, { borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: 10 }]}>
        <ShimmerBlock width={85} height={28} borderRadius={8} />
      </View>
    </View>
  );
};

export const ReportVendorCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.reportVendorCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
      <View style={styles.rowAlign}>
        <ShimmerBlock width={28} height={24} borderRadius={6} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ShimmerBlock width={140} height={16} borderRadius={5} />
          <ShimmerBlock width={160} height={11} borderRadius={4} style={{ marginTop: 3 }} />
        </View>
        <ShimmerBlock width={55} height={28} borderRadius={8} />
      </View>

      <View style={[styles.rowAlign, { borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: 8, marginTop: 8, gap: 8 }]}>
        <ShimmerBlock width={75} height={24} borderRadius={6} />
        <ShimmerBlock width={85} height={24} borderRadius={6} />
      </View>
    </View>
  );
};

export const DashboardSkeleton: React.FC = () => {
  const { colors, theme } = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      {/* 1. Admin Hub Overview Card (1:1 with adminHubCard) */}
      <View style={[styles.adminHubCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
        <View style={styles.rowBetween}>
          <View style={styles.rowAlign}>
            <ShimmerBlock width={36} height={36} borderRadius={10} style={{ marginRight: 10 }} />
            <View>
              <ShimmerBlock width={130} height={16} borderRadius={5} />
              <ShimmerBlock width={160} height={11} borderRadius={4} style={{ marginTop: 3 }} />
            </View>
          </View>
          <ShimmerBlock width={80} height={24} borderRadius={12} />
        </View>

        <View
          style={[
            styles.hubSummaryContainer,
            {
              backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.25)' : colors.bgPrimary,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <ShimmerBlock width={70} height={9} borderRadius={3} />
          <ShimmerBlock width={160} height={24} borderRadius={6} style={{ marginTop: 6 }} />

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <ShimmerBlock width={60} height={9} borderRadius={3} />
              <ShimmerBlock width={90} height={16} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
            <View style={[styles.stripDivider, { backgroundColor: colors.borderSubtle }]} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <ShimmerBlock width={60} height={9} borderRadius={3} />
              <ShimmerBlock width={90} height={16} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>
        </View>
      </View>

      {/* 2. Tank Deliveries Summary Card (1:1 with TankSummaryCard.tsx) */}
      <View style={[styles.tankSummaryCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
        {/* Header */}
        <View style={[styles.rowBetween, { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.07)', paddingBottom: 10, marginBottom: 14 }]}>
          <View style={styles.rowAlign}>
            <ShimmerBlock width={32} height={32} borderRadius={10} style={{ marginRight: 10 }} />
            <View>
              <ShimmerBlock width={150} height={15} borderRadius={4} />
              <ShimmerBlock width={110} height={10} borderRadius={3} style={{ marginTop: 3 }} />
            </View>
          </View>
          <ShimmerBlock width={75} height={24} borderRadius={12} />
        </View>

        {/* 2 Metric Columns (500L & 1000L) */}
        <View style={[styles.rowBetween, { gap: 8, marginBottom: 14 }]}>
          <View style={[styles.metricColBox, { backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.06)', borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.2)' }]}>
            <ShimmerBlock width={45} height={12} borderRadius={3} />
            <ShimmerBlock width={55} height={24} borderRadius={5} style={{ marginVertical: 4 }} />
            <ShimmerBlock width={30} height={9} borderRadius={2} />
          </View>
          <View style={[styles.metricColBox, { backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.06)', borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(5, 150, 105, 0.2)' }]}>
            <ShimmerBlock width={55} height={12} borderRadius={3} />
            <ShimmerBlock width={55} height={24} borderRadius={5} style={{ marginVertical: 4 }} />
            <ShimmerBlock width={30} height={9} borderRadius={2} />
          </View>
        </View>

        {/* Graph Container (Unit Distribution Share) */}
        <View style={[styles.graphContainerBox, { backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : colors.bgPrimary }]}>
          <View style={styles.rowBetween}>
            <ShimmerBlock width={125} height={10} borderRadius={3} />
            <ShimmerBlock width={85} height={10} borderRadius={3} />
          </View>
          <ShimmerBlock width="100%" height={10} borderRadius={6} style={{ marginTop: 8 }} />
        </View>

        {/* Individual Progress Rows */}
        <View style={{ gap: 8 }}>
          <View>
            <View style={styles.rowBetween}>
              <ShimmerBlock width={70} height={12} borderRadius={3} />
              <ShimmerBlock width={80} height={11} borderRadius={3} />
            </View>
            <ShimmerBlock width="100%" height={6} borderRadius={3} style={{ marginTop: 4 }} />
          </View>
          <View>
            <View style={styles.rowBetween}>
              <ShimmerBlock width={75} height={12} borderRadius={3} />
              <ShimmerBlock width={80} height={11} borderRadius={3} />
            </View>
            <ShimmerBlock width="100%" height={6} borderRadius={3} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>

      {/* 3. Collection Efficiency Card (1:1 with efficiencyCard) */}
      <View style={[styles.efficiencyCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
        <View style={styles.rowBetween}>
          <View style={styles.rowAlign}>
            <ShimmerBlock width={32} height={32} borderRadius={16} style={{ marginRight: 10 }} />
            <View>
              <ShimmerBlock width={135} height={15} borderRadius={4} />
              <ShimmerBlock width={140} height={10} borderRadius={3} style={{ marginTop: 3 }} />
            </View>
          </View>
          <ShimmerBlock width={54} height={26} borderRadius={14} />
        </View>

        <ShimmerBlock width="100%" height={8} borderRadius={4} style={{ marginVertical: 10 }} />

        <View style={styles.rowBetween}>
          <ShimmerBlock width={110} height={12} borderRadius={3} />
          <ShimmerBlock width={110} height={12} borderRadius={3} />
        </View>
      </View>

      {/* 4. Leading Vendors Card (1:1 with leadingVendorsCard) */}
      <View style={{ marginTop: 2 }}>
        <View style={[styles.rowBetween, { marginBottom: 12 }]}>
          <View>
            <ShimmerBlock width={120} height={16} borderRadius={4} />
            <ShimmerBlock width={160} height={11} borderRadius={3} style={{ marginTop: 3 }} />
          </View>
          <ShimmerBlock width={60} height={14} borderRadius={4} />
        </View>

        <View style={[styles.leadingVendorsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.leadingVendorRow,
                i < 4 && { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
              ]}
            >
              <ShimmerBlock width={24} height={24} borderRadius={6} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <ShimmerBlock width={130} height={14} borderRadius={4} />
                <ShimmerBlock width={90} height={10} borderRadius={3} style={{ marginTop: 3 }} />
              </View>
              <ShimmerBlock width={75} height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export const ReportsSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      {/* Date preset pills */}
      <View style={styles.filterPillsSkeleton}>
        <ShimmerBlock width={90} height={30} borderRadius={15} />
        <ShimmerBlock width={90} height={30} borderRadius={15} />
        <ShimmerBlock width={95} height={30} borderRadius={15} />
        <ShimmerBlock width={85} height={30} borderRadius={15} />
      </View>

      {/* Active Period Banner */}
      <View style={[styles.periodBanner, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
        <View style={styles.rowAlign}>
          <ShimmerBlock width={36} height={36} borderRadius={10} style={{ marginRight: 10 }} />
          <View>
            <ShimmerBlock width={130} height={11} borderRadius={3} />
            <ShimmerBlock width={150} height={16} borderRadius={5} style={{ marginTop: 3 }} />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        {/* 3 Tank Count Columns */}
        <View style={styles.rowBetween}>
          <ShimmerBlock width="31%" height={56} borderRadius={10} />
          <ShimmerBlock width="31%" height={56} borderRadius={10} />
          <ShimmerBlock width="31%" height={56} borderRadius={10} />
        </View>
      </View>

      {/* Search Input Box */}
      <ShimmerBlock width="100%" height={40} borderRadius={12} style={{ marginBottom: 12 }} />

      {/* Sort Chips */}
      <View style={[styles.rowAlign, { marginBottom: 12, gap: 8 }]}>
        <ShimmerBlock width={60} height={12} borderRadius={3} />
        <ShimmerBlock width={85} height={28} borderRadius={8} />
        <ShimmerBlock width={85} height={28} borderRadius={8} />
        <ShimmerBlock width={75} height={28} borderRadius={8} />
      </View>

      {/* Vendor Breakdown Cards */}
      <ShimmerBlock width={130} height={16} borderRadius={4} style={{ marginBottom: 10 }} />
      <ReportVendorCardSkeleton />
      <ReportVendorCardSkeleton />
    </View>
  );
};

export const SellerDetailSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
        <View style={[styles.rowAlign, { marginBottom: 14 }]}>
          <ShimmerBlock width={48} height={48} borderRadius={24} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <ShimmerBlock width={160} height={20} borderRadius={6} />
            <ShimmerBlock width={110} height={18} borderRadius={6} style={{ marginTop: 4 }} />
          </View>
        </View>

        {/* Contact info items */}
        <View style={{ gap: 6, marginBottom: 14 }}>
          <ShimmerBlock width={130} height={14} borderRadius={4} />
          <ShimmerBlock width={160} height={14} borderRadius={4} />
        </View>

        {/* Action Buttons Row */}
        <View style={[styles.rowBetween, { borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: 10, gap: 8 }]}>
          <ShimmerBlock width="48%" height={38} borderRadius={8} />
          <ShimmerBlock width="48%" height={38} borderRadius={8} />
        </View>
      </View>

      {/* 3 Metric Cards */}
      <View style={[styles.rowBetween, { gap: 8, marginBottom: 14 }]}>
        <View style={[styles.statBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={55} height={9} borderRadius={3} />
          <ShimmerBlock width={75} height={16} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={55} height={9} borderRadius={3} />
          <ShimmerBlock width={75} height={16} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={55} height={9} borderRadius={3} />
          <ShimmerBlock width={75} height={16} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Delivered Tank Units Card */}
      <View style={[styles.detailTankCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle, marginBottom: 16 }]}>
        <ShimmerBlock width={140} height={15} borderRadius={4} style={{ marginBottom: 10 }} />
        <View style={[styles.rowBetween, { gap: 8 }]}>
          <ShimmerBlock width="48%" height={36} borderRadius={8} />
          <ShimmerBlock width="48%" height={36} borderRadius={8} />
        </View>
      </View>

      {/* Transactions Section */}
      <View style={{ gap: 10 }}>
        <ShimmerBlock width={150} height={18} borderRadius={6} style={{ marginBottom: 2 }} />
        <TransactionCardSkeleton />
        <TransactionCardSkeleton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#334155',
  },
  skeletonContainer: {
    paddingHorizontal: 0,
    paddingTop: 4,
    gap: 12,
  },
  sellerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sellerFinanceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  txCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  receiptCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reportVendorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  adminHubCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  hubSummaryContainer: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  tankSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  metricColBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  graphContainerBox: {
    marginBottom: 14,
    padding: 10,
    borderRadius: 12,
  },
  efficiencyCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  leadingVendorsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  leadingVendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  periodBanner: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  profileCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  detailTankCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  stripDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  filterPillsSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
});
