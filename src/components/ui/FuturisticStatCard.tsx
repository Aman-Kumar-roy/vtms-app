import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FuturisticCard } from './FuturisticCard';

interface FuturisticStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconSymbol?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'indigo' | 'emerald' | 'amber' | 'red';
}

export const FuturisticStatCard: React.FC<FuturisticStatCardProps> = ({
  title,
  value,
  subtitle,
  iconSymbol = '📊',
  iconName,
  trend,
  variant = 'indigo',
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'emerald':
        return styles.badgeEmerald;
      case 'amber':
        return styles.badgeAmber;
      case 'red':
        return styles.badgeRed;
      default:
        return styles.badgeIndigo;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'emerald':
        return '#10b981';
      case 'amber':
        return '#f59e0b';
      case 'red':
        return '#ef4444';
      default:
        return '#818cf8';
    }
  };

  const renderIcon = () => {
    if (iconName) {
      return <Ionicons name={iconName} size={20} color={getIconColor()} />;
    }
    // Fallback vector icon mapping for common symbols
    if (iconSymbol === '👥') return <Ionicons name="people-outline" size={20} color={getIconColor()} />;
    if (iconSymbol === '🚚') return <Ionicons name="car-outline" size={20} color={getIconColor()} />;
    if (iconSymbol === '₹' || iconSymbol === '💰') return <Ionicons name="cash-outline" size={20} color={getIconColor()} />;
    if (iconSymbol === '⚠️') return <Ionicons name="alert-circle-outline" size={20} color={getIconColor()} />;
    if (iconSymbol === '✅') return <Ionicons name="checkmark-circle-outline" size={20} color={getIconColor()} />;
    return <Ionicons name="analytics-outline" size={20} color={getIconColor()} />;
  };

  return (
    <FuturisticCard glowing={variant === 'indigo'}>
      <View style={styles.header}>
        <View style={styles.textGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={[styles.iconBox, getBadgeStyle()]}>
          {renderIcon()}
        </View>
      </View>

      {trend && (
        <View style={styles.trendRow}>
          <View style={[styles.trendChip, trend.isPositive ? styles.trendPos : styles.trendNeg]}>
            <Text style={[styles.trendText, trend.isPositive ? styles.trendPosText : styles.trendNegText]}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </Text>
          </View>
          <Text style={styles.trendSub}>vs last month</Text>
        </View>
      )}
    </FuturisticCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textGroup: {
    flex: 1,
  },
  title: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#71717a',
    fontSize: 11,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconText: {
    fontSize: 18,
  },
  badgeIndigo: { backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: '#6366f1' },
  badgeEmerald: { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981' },
  badgeAmber: { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b' },
  badgeRed: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a35',
  },
  trendChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendPos: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10b981' },
  trendNeg: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#ef4444' },
  trendText: { fontSize: 11, fontWeight: '800' },
  trendPosText: { color: '#10b981' },
  trendNegText: { color: '#ef4444' },
  trendSub: { color: '#71717a', fontSize: 11 },
});
