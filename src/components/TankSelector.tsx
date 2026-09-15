import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export interface TankLineItem {
  id: string;
  size: 500 | 1000;
  quantity: number;
  layers: number; // 3 - 6
  foam: 'none' | 'single' | 'double';
}

export interface TankSelectorProps {
  items?: TankLineItem[];
  onChangeItems?: (items: TankLineItem[]) => void;
  // Legacy fallback props
  tank500?: number;
  tank1000?: number;
  onChange?: (key: 'tank500' | 'tank1000', value: number) => void;
}

export const TankSelector: React.FC<TankSelectorProps> = ({
  items,
  onChangeItems,
  tank500 = 0,
  tank1000 = 0,
  onChange,
}) => {
  const { colors, theme } = useTheme();

  // If using modern line items mode
  if (items && onChangeItems) {
    const totalUnits = items.reduce((acc, it) => acc + (it.quantity || 0), 0);

    const handleAddVariant = () => {
      const newItem: TankLineItem = {
        id: Math.random().toString(36).substring(2, 9),
        size: 500,
        quantity: 1,
        layers: 3,
        foam: 'none',
      };
      onChangeItems([...items, newItem]);
    };

    const handleRemoveVariant = (id: string) => {
      if (items.length <= 1) return;
      onChangeItems(items.filter((it) => it.id !== id));
    };

    const handleUpdateItem = (id: string, updates: Partial<TankLineItem>) => {
      onChangeItems(
        items.map((it) => {
          if (it.id !== id) return it;
          const updated = { ...it, ...updates };
          // If capacity is 500L, foam must strictly be 'none'
          if (updated.size === 500) {
            updated.foam = 'none';
          }
          return updated;
        })
      );
    };

    return (
      <View style={[styles.container, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="cube-outline" size={14} color="#38bdf8" style={{ marginRight: 5 }} />
              <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>
                TANK VARIANTS & LINE ITEMS
              </Text>
            </View>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
              Strict sizes: 500L & 1,000L (Layers 3–6, Foam on 1,000L)
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addVariantBtn,
              {
                backgroundColor: colors.accentLight,
                borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.25)',
              },
            ]}
            onPress={handleAddVariant}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={14} color={theme === 'dark' ? '#38bdf8' : colors.accent} style={{ marginRight: 3 }} />
            <Text style={[styles.addVariantBtnText, { color: theme === 'dark' ? '#38bdf8' : colors.accent }]}>Add Variant</Text>
          </TouchableOpacity>
        </View>

        {/* Variants List */}
        {items.map((item, idx) => {
          const is1000 = item.size === 1000;
          const foamLabel = is1000 && item.foam !== 'none' ? ` • ${item.foam} foam` : '';

          return (
            <View
              key={item.id}
              style={[
                styles.variantCard,
                {
                  backgroundColor: theme === 'dark' ? colors.bgCard : colors.bgPrimary,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              {/* Card Title & Delete */}
              <View style={[styles.cardHeader, { borderBottomColor: colors.borderSubtle }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[styles.variantBadge, { backgroundColor: theme === 'dark' ? '#1e293b' : colors.bgElevated }]}>
                    <Text style={[styles.variantBadgeText, { color: theme === 'dark' ? '#38bdf8' : colors.accent }]}>#{idx + 1}</Text>
                  </View>
                  <Text style={[styles.variantSummaryText, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.size}L ({item.layers}L{foamLabel}) • {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                  </Text>
                </View>

                {items.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveVariant(item.id)}
                    style={styles.trashBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={15} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              {/* 1. Capacity Segmented Control */}
              <View style={styles.fieldSection}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CAPACITY</Text>
                <View style={styles.segmentedRow}>
                  <TouchableOpacity
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: item.size === 500
                          ? colors.accent
                          : (theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff'),
                        borderColor: item.size === 500 ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                    onPress={() => handleUpdateItem(item.id, { size: 500, foam: 'none' })}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="water-outline"
                      size={13}
                      color={item.size === 500 ? '#ffffff' : (theme === 'dark' ? colors.textMuted : colors.textSecondary)}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.segmentBtnText,
                        {
                          color: item.size === 500 ? '#ffffff' : colors.textPrimary,
                          fontWeight: item.size === 500 ? '800' : '700',
                        },
                      ]}
                    >
                      500 Liters
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: item.size === 1000
                          ? colors.accent
                          : (theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff'),
                        borderColor: item.size === 1000 ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                    onPress={() => handleUpdateItem(item.id, { size: 1000 })}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={13}
                      color={item.size === 1000 ? '#ffffff' : (theme === 'dark' ? colors.textMuted : colors.textSecondary)}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.segmentBtnText,
                        {
                          color: item.size === 1000 ? '#ffffff' : colors.textPrimary,
                          fontWeight: item.size === 1000 ? '800' : '700',
                        },
                      ]}
                    >
                      1,000 Liters
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. Layers Selection (3 to 6) */}
              <View style={styles.fieldSection}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                  TANK LAYERS: <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>{item.layers} Layers</Text>
                </Text>
                <View style={styles.pillsRow}>
                  {[3, 4, 5, 6].map((l) => (
                    <TouchableOpacity
                      key={l}
                      style={[
                        styles.pillBtn,
                        {
                          backgroundColor: item.layers === l
                            ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.12)')
                            : (theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff'),
                          borderColor: item.layers === l
                            ? (theme === 'dark' ? '#38bdf8' : colors.accent)
                            : colors.borderSubtle,
                        },
                      ]}
                      onPress={() => handleUpdateItem(item.id, { layers: l })}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.pillBtnText,
                          {
                            color: item.layers === l
                              ? (theme === 'dark' ? '#38bdf8' : colors.accent)
                              : colors.textPrimary,
                            fontWeight: item.layers === l ? '800' : '700',
                          },
                        ]}
                      >
                        {l}L
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 3. Foam Selection (1000L Only) */}
              {is1000 ? (
                <View style={styles.fieldSection}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                    FOAM TYPE: <Text style={{ color: '#10b981', fontWeight: '800' }}>{item.foam.toUpperCase()}</Text>
                  </Text>
                  <View style={styles.pillsRow}>
                    {(['none', 'single', 'double'] as const).map((f) => (
                      <TouchableOpacity
                        key={f}
                        style={[
                          styles.foamPillBtn,
                          {
                            backgroundColor: item.foam === f
                              ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.12)')
                              : (theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff'),
                            borderColor: item.foam === f
                              ? (theme === 'dark' ? '#10b981' : colors.success)
                              : colors.borderSubtle,
                          },
                        ]}
                        onPress={() => handleUpdateItem(item.id, { foam: f })}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.foamPillBtnText,
                            {
                              color: item.foam === f
                                ? (theme === 'dark' ? '#10b981' : colors.success)
                                : colors.textPrimary,
                              fontWeight: item.foam === f ? '800' : '700',
                            },
                          ]}
                        >
                          {f === 'none' ? 'None' : f === 'single' ? 'Single' : 'Double'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* 4. Quantity Stepper & Input */}
              <View style={styles.fieldSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted, marginBottom: 0 }]}>
                    QUANTITY TO DELIVER
                  </Text>
                  <View style={[styles.stepper, { backgroundColor: theme === 'dark' ? colors.bgSecondary : '#ffffff', borderColor: colors.borderSubtle }]}>
                    <TouchableOpacity
                      style={[styles.stepBtn, { opacity: item.quantity <= 1 ? 0.4 : 1, backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : colors.bgPrimary }]}
                      onPress={() => handleUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                      disabled={item.quantity <= 1}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.stepText, { color: colors.textPrimary }]}>−</Text>
                    </TouchableOpacity>

                    <View style={[styles.countBox, { backgroundColor: theme === 'dark' ? colors.bgSecondary : '#ffffff' }]}>
                      <TextInput
                        style={[styles.countInput, { color: colors.textPrimary }]}
                        keyboardType="number-pad"
                        value={String(item.quantity !== undefined && item.quantity !== null ? item.quantity : '')}
                        onChangeText={(val) => {
                          const clean = val.replace(/[^0-9]/g, '');
                          const num = clean ? parseInt(clean, 10) : 0;
                          handleUpdateItem(item.id, { quantity: num });
                        }}
                        selectTextOnFocus
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.stepBtn, { backgroundColor: colors.accentHover }]}
                      onPress={() => handleUpdateItem(item.id, { quantity: (item.quantity || 0) + 1 })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.stepText, { color: '#ffffff' }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Total Summary Footer */}
        <View style={[styles.totalFooter, { backgroundColor: theme === 'dark' ? colors.bgCard : colors.bgPrimary, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.totalFooterLabel, { color: colors.textMuted }]}>Total Delivery Units:</Text>
          <Text style={[styles.totalFooterCount, { color: theme === 'dark' ? '#38bdf8' : colors.accent }]}>
            {totalUnits} {totalUnits === 1 ? 'Tank' : 'Tanks'} ({items.length} {items.length === 1 ? 'Variant' : 'Variants'})
          </Text>
        </View>
      </View>
    );
  }

  // Legacy fallback stepper mode
  const values = { tank500, tank1000 };
  const totalUnits = (tank500 || 0) + (tank1000 || 0);

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

      {[
        { key: 'tank500', label: '500 Liters', capacity: '500L' },
        { key: 'tank1000', label: '1,000 Liters', capacity: '1000L' },
      ].map((t) => {
        const count = values[t.key as keyof typeof values] || 0;
        return (
          <View key={t.key} style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tankTitle, { color: colors.textPrimary }]}>{t.label}</Text>
              <Text style={[styles.tankSub, { color: colors.textMuted }]}>
                {t.capacity} Polymer Water Tank
              </Text>
            </View>

            <View style={[styles.stepper, { backgroundColor: theme === 'dark' ? colors.bgCard : '#ffffff', borderColor: colors.borderSubtle }]}>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : colors.bgPrimary }]}
                onPress={() => onChange && onChange(t.key as any, Math.max(0, count - 1))}
                disabled={count === 0}
                activeOpacity={0.7}
              >
                <Text style={[styles.stepText, { color: count > 0 ? colors.textPrimary : colors.textMuted }]}>−</Text>
              </TouchableOpacity>

              <View style={[styles.countBox, { backgroundColor: theme === 'dark' ? colors.bgCard : '#ffffff' }]}>
                <TextInput
                  style={[styles.countInput, { color: count > 0 ? colors.textPrimary : colors.textMuted }]}
                  keyboardType="number-pad"
                  value={String(count || 0)}
                  onChangeText={(val) => {
                    const clean = val.replace(/[^0-9]/g, '');
                    const num = clean ? parseInt(clean, 10) : 0;
                    onChange && onChange(t.key as any, num);
                  }}
                  selectTextOnFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.accentHover }]}
                onPress={() => onChange && onChange(t.key as any, count + 1)}
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
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 10,
    marginTop: 2,
  },
  addVariantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  addVariantBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  variantCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  variantBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  variantBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  variantSummaryText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  trashBtn: {
    padding: 4,
  },
  fieldSection: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  segmentBtnActive: {
    backgroundColor: '#0284c7',
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  segmentBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pillBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38bdf8',
  },
  pillBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pillBtnTextActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  foamPillBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  foamPillBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  foamPillBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  foamPillBtnTextActive: {
    color: '#10b981',
    fontWeight: '800',
  },
  totalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  totalFooterLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  totalFooterCount: {
    fontSize: 11,
    fontWeight: '900',
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
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 15,
    fontWeight: '700',
  },
  countBox: {
    minWidth: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countInput: {
    minWidth: 44,
    height: 30,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 4,
    fontVariant: ['tabular-nums'],
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
