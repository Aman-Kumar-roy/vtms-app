import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TankSizes } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface TankSelectorProps {
  tank500: number;
  tank1000: number;
  tank2000: number;
  onChange: (key: 'tank500' | 'tank1000' | 'tank2000', value: number) => void;
}

export const TankSelector: React.FC<TankSelectorProps> = ({
  tank500,
  tank1000,
  tank2000,
  onChange,
}) => {
  const { colors } = useTheme();
  const values = { tank500, tank1000, tank2000 };
  const totalUnits = (tank500 || 0) + (tank1000 || 0) + (tank2000 || 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          PRODUCT UNITS / QUANTITY
        </Text>
        <Text style={[styles.totalUnitsBadge, { color: totalUnits > 0 ? '#0284c7' : colors.textMuted }]}>
          {totalUnits} {totalUnits === 1 ? 'Unit' : 'Units'} Selected
        </Text>
      </View>
      
      {TankSizes.map((t) => {
        const count = values[t.key as keyof typeof values] || 0;
        return (
          <View key={t.key} style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tankTitle, { color: colors.textPrimary }]}>{t.label}</Text>
              <Text style={[styles.tankSub, { color: colors.textMuted }]}>
                {t.capacity} Polymer Water Tank
              </Text>
            </View>

            <View style={[styles.stepper, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: count > 0 ? colors.bgSecondary : 'transparent' }]}
                onPress={() => onChange(t.key, Math.max(0, count - 1))}
                disabled={count === 0}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepText, { color: count > 0 ? colors.textPrimary : colors.textMuted }]}>−</Text>
              </TouchableOpacity>
              
              <View style={styles.countBox}>
                <Text style={[styles.countText, { color: count > 0 ? colors.accentHover : colors.textMuted }]}>
                  {count}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.accentHover }]}
                onPress={() => onChange(t.key, count + 1)}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepText, { color: '#ffffff' }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalUnitsBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tankTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  tankSub: {
    fontSize: 11,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '700',
  },
  countBox: {
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
