import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';

interface TankSummaryCardProps {
  distribution: {
    tank500: number;
    tank1000: number;
  };
  title?: string;
}

export const TankSummaryCard: React.FC<TankSummaryCardProps> = ({ distribution, title }) => {
  const { colors, theme } = useTheme();
  const t500 = distribution.tank500 || 0;
  const t1000 = distribution.tank1000 || 0;
  const totalUnits = t500 + t1000;
  const maxUnits = Math.max(1, totalUnits);

  const p500 = totalUnits > 0 ? Number(((t500 / maxUnits) * 100).toFixed(1)) : 0;
  const p1000 = totalUnits > 0 ? Number(((t1000 / maxUnits) * 100).toFixed(1)) : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconCircle, { backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.10)' }]}>
            <Ionicons name="cube" size={15} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {title || 'Tank Delivery Records'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Strict sizes: 500L • 1000L
            </Text>
          </View>
        </View>
        <View style={[styles.totalBadge, { backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.08)', borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.2)' }]}>
          <Text style={[styles.totalBadgeText, { color: theme === 'dark' ? '#38bdf8' : colors.accent }]}>{totalUnits} Tanks</Text>
        </View>
      </View>

      {/* 2 Metric Columns */}
      <View style={styles.metricsGrid}>
        {/* 500 L */}
        <View style={[styles.metricCol, { backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.06)', borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.2)' }]}>
          <Text style={[styles.colHeader500, { color: theme === 'dark' ? '#38bdf8' : colors.accent }]}>500 L</Text>
          <Text style={[styles.colNumber, { color: colors.textPrimary }]}>{t500}</Text>
          <Text style={[styles.colUnits, { color: colors.textMuted }]}>units</Text>
        </View>

        {/* 1,000 L */}
        <View style={[styles.metricCol, { backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.06)', borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(5, 150, 105, 0.2)' }]}>
          <Text style={[styles.colHeader1000, { color: theme === 'dark' ? '#10b981' : colors.success }]}>1,000 L</Text>
          <Text style={[styles.colNumber, { color: colors.textPrimary }]}>{t1000}</Text>
          <Text style={[styles.colUnits, { color: colors.textMuted }]}>units</Text>
        </View>
      </View>

      {/* Segmented Proportional Bar Graph */}
      <View style={[styles.graphContainer, { backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : colors.bgPrimary }]}>
        <View style={styles.graphHeaderRow}>
          <Text style={[styles.graphTitle, { color: colors.textMuted }]}>Unit Distribution Share</Text>
          <Text style={[styles.graphLegend, { color: colors.textMuted }]}>
            <Text style={{ color: theme === 'dark' ? '#38bdf8' : colors.accent }}>● 500L </Text>
            <Text style={{ color: theme === 'dark' ? '#10b981' : colors.success }}>● 1000L</Text>
          </Text>
        </View>
        <View style={[styles.multiBarTrack, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]}>
          {totalUnits === 0 ? (
            <View style={[styles.multiBarEmpty, { backgroundColor: 'transparent' }]} />
          ) : (
            <>
              {p500 > 0 && <View style={[styles.multiBarSeg, { width: `${p500}%`, backgroundColor: theme === 'dark' ? '#38bdf8' : colors.accent }]} />}
              {p1000 > 0 && <View style={[styles.multiBarSeg, { width: `${p1000}%`, backgroundColor: theme === 'dark' ? '#10b981' : colors.success }]} />}
            </>
          )}
        </View>
      </View>

      {/* Individual Progress Rows with Percentages */}
      <View style={styles.breakdownRows}>
        <View style={styles.tankRow}>
          <View style={styles.rowLabel}>
            <Text style={[styles.tankName, { color: colors.textPrimary }]}>500 Liters</Text>
            <Text style={[styles.tankMetric, { color: colors.textMuted }]}>{t500} units ({p500}%)</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]}>
            <View style={[styles.progressBar, { width: `${p500}%`, backgroundColor: theme === 'dark' ? '#38bdf8' : colors.accent }]} />
          </View>
        </View>

        <View style={styles.tankRow}>
          <View style={styles.rowLabel}>
            <Text style={[styles.tankName, { color: colors.textPrimary }]}>1,000 Liters</Text>
            <Text style={[styles.tankMetric, { color: colors.textMuted }]}>{t1000} units ({p1000}%)</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]}>
            <View style={[styles.progressBar, { width: `${p1000}%`, backgroundColor: theme === 'dark' ? '#10b981' : colors.success }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  totalBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricCol: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  col500: {
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  col1000: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  colHeader500: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  colHeader1000: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  colNumber: {
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  colUnits: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  graphContainer: {
    marginBottom: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 10,
    borderRadius: 12,
  },
  graphHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  graphTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  graphLegend: {
    fontSize: 10,
    fontWeight: '600',
  },
  multiBarTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  multiBarSeg: {
    height: '100%',
  },
  multiBarEmpty: {
    flex: 1,
  },
  breakdownRows: {
    gap: 8,
  },
  tankRow: {},
  rowLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tankName: {
    fontSize: 12,
    fontWeight: '600',
  },
  tankMetric: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
