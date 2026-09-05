import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface BottomTabBarProps {
  activeScreen: string;
  navigation: any;
}

interface TabItem {
  name: string;
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  {
    name: 'Dashboard',
    label: 'Dashboard',
    iconActive: 'grid',
    iconInactive: 'grid-outline',
  },
  {
    name: 'Sellers',
    label: 'Vendors',
    iconActive: 'people',
    iconInactive: 'people-outline',
  },
  {
    name: 'Transactions',
    label: 'Ledger',
    iconActive: 'swap-horizontal',
    iconInactive: 'swap-horizontal-outline',
  },
  {
    name: 'Reports',
    label: 'Reports',
    iconActive: 'bar-chart',
    iconInactive: 'bar-chart-outline',
  },
  {
    name: 'Receipts',
    label: 'Receipts',
    iconActive: 'receipt',
    iconInactive: 'receipt-outline',
  },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeScreen, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleTabPress = (tabName: string) => {
    if (activeScreen === tabName) return;
    navigation.navigate(tabName);
  };

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.borderSubtle,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = activeScreen === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.iconInactive}
                size={21}
                color={isActive ? '#38bdf8' : colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? '#38bdf8' : colors.textMuted },
                isActive && styles.tabLabelActive,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
    marginHorizontal: -16,
    marginBottom: -8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 38,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
