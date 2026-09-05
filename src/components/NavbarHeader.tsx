import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { ProfileModal } from './ProfileModal';

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
  const { colors } = useTheme();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ')[0][0].toUpperCase()
    : 'A';

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

  const topClearance = Platform.OS === 'android'
    ? Math.max(insets.top, RNStatusBar.currentHeight || 0) + 8
    : Platform.OS === 'ios'
    ? Math.max(insets.top, 16) + 4
    : 8;

  return (
    <View style={[styles.navbar, { marginTop: topClearance, backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
      <ProfileModal
        visible={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Left Section: Back Button (on child screens) or Vector Logo + Screen Title */}
      <View style={styles.leftSection}>
        {canGoBack ? (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go Back"
          >
            <Ionicons name="arrow-back" size={19} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          /* Professional Vector Brand Emblem for Root Screens (No Menu Icon) */
          <View style={styles.navLogoBadge}>
            <Ionicons name="cube" size={14} color="#38bdf8" />
          </View>
        )}

        <View style={styles.titleGroup}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {currentScreenTitle}
          </Text>
        </View>
      </View>

      {/* Right Section: Profile Avatar Trigger (Opens Profile Modal) */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => setProfileModalOpen(true)}
          activeOpacity={0.8}
          accessibilityLabel="Open User Profile"
        >
          <Text style={styles.avatarInitial}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  },
  navLogoBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flex: 1,
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
