import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavbarHeader } from '../components/NavbarHeader';
import { DrawerSidebar } from '../components/DrawerSidebar';
import { BottomTabBar } from '../components/BottomTabBar';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';
import { useTheme } from '../context/ThemeContext';

export const OrdersScreen = ({ navigation, isEmbedded = false, isActive = true }: any) => {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AnimatedScreenWrapper
      style={[
        styles.container,
        { backgroundColor: colors.bgPrimary },
        isEmbedded && { paddingHorizontal: 0, paddingTop: 0 },
      ]}
    >
      {!isEmbedded && (
        <NavbarHeader
          currentScreenTitle="Orders"
          isRootScreen={true}
          onOpenDrawer={() => setDrawerOpen(true)}
          navigation={navigation}
        />
      )}
      {!isEmbedded && (
        <DrawerSidebar
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          navigation={navigation}
          activeScreen="Orders"
        />
      )}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Modular Placeholder Card Aligned with Web - UI View Only */}
        <View style={[styles.placeholderCard, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          {/* Brand Shopping Cart Icon Badge */}
          <View style={styles.iconBadge}>
            <Ionicons name="cart-outline" size={32} color="#38bdf8" />
          </View>

          {/* API v2 Modular Placeholder Pill */}
          <View style={styles.pillBadge}>
            <Ionicons name="sparkles" size={12} color="#38bdf8" style={{ marginRight: 5 }} />
            <Text style={styles.pillText}>API V2 MODULAR PLACEHOLDER</Text>
          </View>

          {/* Heading & Description (UI View Only) */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>Order Processing Module</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            This feature route is registered in the navigation system. Future order fulfillment workflows can be seamlessly attached here.
          </Text>
        </View>
      </ScrollView>

      {/* Native App Bottom Tab Bar */}
      {!isEmbedded && <BottomTabBar activeScreen="Orders" navigation={navigation} />}
    </AnimatedScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  placeholderCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  pillText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
