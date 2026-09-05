import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

export type DatePeriod = 'today' | '7d' | '30d' | 'this_month' | 'all';

interface FilterBarProps {
  activePeriod: DatePeriod;
  onSelectPeriod: (period: DatePeriod) => void;
}

const PERIODS: { key: DatePeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'this_month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ activePeriod, onSelectPeriod }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {PERIODS.map((p) => {
        const active = p.key === activePeriod;
        return (
          <TouchableOpacity
            key={p.key}
            style={[styles.pill, active ? styles.pillActive : null]}
            onPress={() => onSelectPeriod(p.key)}
          >
            <Text style={[styles.pillText, active ? styles.pillTextActive : null]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pill: {
    backgroundColor: Colors.cardDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});
