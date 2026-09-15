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
  const { colors, theme } = useTheme();

  const handleTabPress = (tabName: string) => {
    if (activeScreen === tabName) return;
    navigation.navigate(tabName);
  };

  const isTabActive = (tabName: string) => {
    if (activeScreen === tabName) return true;
    if (tabName === 'Dashboard' && activeScreen === 'Transactions') return true;
    return false;
  };

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 18 : 10);
  const activeColor = theme === 'dark' ? '#38bdf8' : colors.accent;

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
      {/* Sleek ambient glow highlight along top edge */}
      <View
        style={[
          styles.topEdgeGlow,
          {
            backgroundColor:
              theme === 'dark'
                ? 'rgba(56, 189, 248, 0.25)'
                : 'rgba(2, 132, 199, 0.12)',
          },
        ]}
      />

      {TABS.map((tab) => {
        const isActive = isTabActive(tab.name);
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.name)}
            activeOpacity={0.7}
          >
            {/* Pure icon container - NO background box, ONLY the icon itself glows */}
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActiveGlow]}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.iconInactive}
                size={isActive ? 23 : 21}
                color={isActive ? activeColor : colors.textMuted}
                style={isActive && theme === 'dark' ? styles.activeIconGlow : undefined}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? activeColor : colors.textMuted },
                isActive && styles.tabLabelActive,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
            {/* Glowing micro-dot indicator for active tab */}
            {isActive ? (
              <View style={[styles.activeDot, { backgroundColor: activeColor }]} />
            ) : (
              <View style={styles.inactiveDotPlaceholder} />
            )}
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
    borderTopWidth: 0.5,
    paddingTop: 8,
    marginHorizontal: -16,
    marginBottom: -8,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  topEdgeGlow: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActiveGlow: {
    // Ambient light diffusion directly around the glowing icon
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: 'transparent',
  },
  activeIconGlow: {
    // Native glyph text shadow that illuminates only the icon outline
    textShadowColor: 'rgba(56, 189, 248, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.25,
  },
  tabLabelActive: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38bdf8',
    marginTop: 3,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 4,
  },
  inactiveDotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 3,
    backgroundColor: 'transparent',
  },
});

