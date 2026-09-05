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

  return (
    <Animated.View
      style={[
        styles.block,
        {
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
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
      <View style={styles.rowBetween}>
        <View style={styles.avatarRow}>
          <ShimmerBlock width={40} height={40} borderRadius={20} />
          <View style={{ gap: 6, marginLeft: 12 }}>
            <ShimmerBlock width={140} height={16} borderRadius={6} />
            <ShimmerBlock width={90} height={12} borderRadius={4} />
          </View>
        </View>
        <ShimmerBlock width={70} height={24} borderRadius={12} />
      </View>

      <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />

      <View style={styles.statsRow}>
        <View style={{ gap: 4 }}>
          <ShimmerBlock width={60} height={10} borderRadius={4} />
          <ShimmerBlock width={80} height={16} borderRadius={4} />
        </View>
        <View style={{ gap: 4 }}>
          <ShimmerBlock width={60} height={10} borderRadius={4} />
          <ShimmerBlock width={80} height={16} borderRadius={4} />
        </View>
        <View style={{ gap: 4 }}>
          <ShimmerBlock width={60} height={10} borderRadius={4} />
          <ShimmerBlock width={80} height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

export const TransactionCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
      <View style={styles.rowBetween}>
        <ShimmerBlock width={90} height={20} borderRadius={6} />
        <ShimmerBlock width={70} height={14} borderRadius={4} />
      </View>

      <View style={{ marginTop: 12, gap: 6 }}>
        <ShimmerBlock width={160} height={16} borderRadius={6} />
        <ShimmerBlock width={100} height={12} borderRadius={4} />
      </View>

      <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />

      <View style={styles.rowBetween}>
        <ShimmerBlock width={120} height={14} borderRadius={4} />
        <ShimmerBlock width={90} height={18} borderRadius={6} />
      </View>
    </View>
  );
};

export const ReceiptCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
      <View style={styles.rowBetween}>
        <ShimmerBlock width={80} height={14} borderRadius={4} />
        <ShimmerBlock width={110} height={22} borderRadius={6} />
      </View>

      <View style={{ marginTop: 12, gap: 6 }}>
        <ShimmerBlock width={170} height={18} borderRadius={6} />
        <ShimmerBlock width={110} height={12} borderRadius={4} />
      </View>

      <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />

      <View style={styles.rowBetween}>
        <ShimmerBlock width={90} height={14} borderRadius={4} />
        <ShimmerBlock width={100} height={20} borderRadius={6} />
      </View>
    </View>
  );
};

export const DashboardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      {/* Hero Card Skeleton */}
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle, height: 130 }]}>
        <ShimmerBlock width={160} height={20} borderRadius={6} />
        <View style={{ marginTop: 14, gap: 8 }}>
          <ShimmerBlock width={220} height={14} borderRadius={4} />
          <ShimmerBlock width={180} height={14} borderRadius={4} />
        </View>
      </View>

      {/* Grid Cards Skeleton */}
      <View style={styles.gridRow}>
        <View style={[styles.gridCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={32} height={32} borderRadius={8} />
          <View style={{ marginTop: 12, gap: 6 }}>
            <ShimmerBlock width={70} height={12} borderRadius={4} />
            <ShimmerBlock width={90} height={18} borderRadius={6} />
          </View>
        </View>
        <View style={[styles.gridCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={32} height={32} borderRadius={8} />
          <View style={{ marginTop: 12, gap: 6 }}>
            <ShimmerBlock width={70} height={12} borderRadius={4} />
            <ShimmerBlock width={90} height={18} borderRadius={6} />
          </View>
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={[styles.gridCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={32} height={32} borderRadius={8} />
          <View style={{ marginTop: 12, gap: 6 }}>
            <ShimmerBlock width={70} height={12} borderRadius={4} />
            <ShimmerBlock width={90} height={18} borderRadius={6} />
          </View>
        </View>
        <View style={[styles.gridCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={32} height={32} borderRadius={8} />
          <View style={{ marginTop: 12, gap: 6 }}>
            <ShimmerBlock width={70} height={12} borderRadius={4} />
            <ShimmerBlock width={90} height={18} borderRadius={6} />
          </View>
        </View>
      </View>

      {/* List Section Skeleton */}
      <View style={{ marginTop: 8, gap: 10 }}>
        <ShimmerBlock width={140} height={18} borderRadius={6} />
        <SellerCardSkeleton />
        <SellerCardSkeleton />
      </View>
    </View>
  );
};

export const ReportsSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      {/* Date preset pills skeleton */}
      <View style={styles.filterPillsSkeleton}>
        <ShimmerBlock width={80} height={30} borderRadius={15} />
        <ShimmerBlock width={80} height={30} borderRadius={15} />
        <ShimmerBlock width={90} height={30} borderRadius={15} />
        <ShimmerBlock width={80} height={30} borderRadius={15} />
      </View>

      {/* Financial Summary Card Skeleton */}
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle, height: 140 }]}>
        <ShimmerBlock width={150} height={18} borderRadius={6} />
        <View style={[styles.statsRow, { marginTop: 20 }]}>
          <View style={{ gap: 6 }}>
            <ShimmerBlock width={70} height={12} borderRadius={4} />
            <ShimmerBlock width={100} height={20} borderRadius={6} />
          </View>
          <View style={{ gap: 6 }}>
            <ShimmerBlock width={70} height={12} borderRadius={4} />
            <ShimmerBlock width={100} height={20} borderRadius={6} />
          </View>
          <View style={{ gap: 6 }}>
            <ShimmerBlock width={70} height={12} borderRadius={4} />
            <ShimmerBlock width={100} height={20} borderRadius={6} />
          </View>
        </View>
      </View>

      {/* Tank Breakdown Cards Skeleton */}
      <View style={{ marginTop: 6, gap: 12 }}>
        <ShimmerBlock width={160} height={18} borderRadius={6} />
        <TransactionCardSkeleton />
        <TransactionCardSkeleton />
      </View>
    </View>
  );
};

export const SellerDetailSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      {/* Profile Card */}
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
        <View style={styles.avatarRow}>
          <ShimmerBlock width={52} height={52} borderRadius={26} />
          <View style={{ gap: 8, marginLeft: 14, flex: 1 }}>
            <ShimmerBlock width={180} height={20} borderRadius={6} />
            <ShimmerBlock width={110} height={14} borderRadius={4} />
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />
        <View style={{ gap: 8 }}>
          <ShimmerBlock width={200} height={12} borderRadius={4} />
          <ShimmerBlock width={150} height={12} borderRadius={4} />
        </View>
      </View>

      {/* 3 Metric Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.gridCard, { flex: 1, backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={50} height={12} borderRadius={4} />
          <ShimmerBlock width={80} height={18} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
        <View style={[styles.gridCard, { flex: 1, backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={50} height={12} borderRadius={4} />
          <ShimmerBlock width={80} height={18} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
        <View style={[styles.gridCard, { flex: 1, backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <ShimmerBlock width={50} height={12} borderRadius={4} />
          <ShimmerBlock width={80} height={18} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      </View>

      {/* Transactions Section */}
      <View style={{ marginTop: 12, gap: 10 }}>
        <ShimmerBlock width={150} height={18} borderRadius={6} />
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
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterPillsSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
});
