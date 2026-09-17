import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { ProfileModal } from './ProfileModal';
import { NavigationProgressBar } from './NavigationProgressBar';

interface NavbarHeaderProps {
  currentScreenTitle?: string;
  isRootScreen?: boolean;
  onOpenDrawer?: () => void;
  navigation: any;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  currentScreenTitle = 'Dashboard',
  isRootScreen: isRootScreenProp,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors, theme } = useTheme();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Crash-proof initials calculation immune to null, whitespace, or malformed strings
  const initials = (() => {
    try {
      if (user?.name && typeof user.name === 'string') {
        const trimmed = user.name.trim();
        if (trimmed.length > 0) {
          return trimmed.charAt(0).toUpperCase();
        }
      }
    } catch {
      // Graceful fallback
    }
    return 'A';
  })();

  const isRootScreen =
    isRootScreenProp !== undefined
      ? isRootScreenProp
      : [
          'Dashboard',
          'Vendors Directory',
          'Sellers',
          'Transactions Feed',
          'Transactions',
          'Tank Orders & Deliveries',
          'Orders',
          'Order Processing Module',
          'Order Processing',
          'Receipts Center',
          'Receipts',
          'Receipts & Vouchers',
          'Analytics Reports',
          'Reports',
          'Reports & Analytics',
        ].some((t) => currentScreenTitle.toLowerCase().includes(t.toLowerCase()));

  const canGoBack = !isRootScreen && navigation && navigation.canGoBack();

  const handleBack = () => {
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate('Dashboard');
    }
  };

  // Safe numerical top clearance avoiding NaN (Math.max(undefined, 0) returns NaN)
  const safeTopInset = typeof insets?.top === 'number' && !isNaN(insets.top) ? insets.top : 0;
  const androidBarHeight =
    Platform.OS === 'android' && typeof RNStatusBar.currentHeight === 'number' && !isNaN(RNStatusBar.currentHeight)
      ? RNStatusBar.currentHeight
      : 28;

  const topClearance =
    Platform.OS === 'android'
      ? Math.max(safeTopInset, androidBarHeight) + 6
      : Platform.OS === 'ios'
      ? Math.max(safeTopInset, 16) + 4
      : 8;

  const activeBg = colors?.bgSecondary || (theme === 'dark' ? '#0f172a' : '#ffffff');
  const activeBorder = colors?.borderSubtle || (theme === 'dark' ? 'rgba(56, 189, 248, 0.22)' : '#e2e8f0');
  const activeText = colors?.textPrimary || (theme === 'dark' ? '#ffffff' : '#0f172a');

  return (
    <View style={[styles.navbar, { marginTop: topClearance, backgroundColor: activeBg, borderColor: activeBorder }]}>
      <ProfileModal
        visible={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Left Section: Back Button (on child screens) or Vector Logo Badge (on root screens) */}
      <View style={styles.leftSection}>
        {canGoBack ? (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors?.bgCard || activeBg, borderColor: activeBorder }]}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go Back"
          >
            <Ionicons name="arrow-back" size={19} color={activeText} />
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.navLogoBadge,
              {
                backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.10)',
                borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.25)',
              },
            ]}
          >
            <Ionicons name="cube" size={15} color={colors.accent} />
          </View>
        )}

        <View style={styles.titleGroup}>
          <Text style={[styles.screenTitle, { color: activeText }]} numberOfLines={1}>
            {currentScreenTitle}
          </Text>
        </View>
      </View>

      {/* Right Section: Profile Avatar */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={[styles.avatarBtn, { backgroundColor: colors.accent }]}
          onPress={() => setProfileModalOpen(true)}
          activeOpacity={0.8}
          accessibilityLabel="Open User Profile"
        >
          <Text style={styles.avatarInitial}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* Opposite Direction (Right-to-Left) Laser Progress Line Below Nav Title */}
      <NavigationProgressBar direction="right-to-left" position="bottom" />
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 10,
  },
  navLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  titleGroup: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 8,
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
