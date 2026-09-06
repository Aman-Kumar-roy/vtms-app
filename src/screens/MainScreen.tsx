import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { NavbarHeader } from '../components/NavbarHeader';
import { DrawerSidebar } from '../components/DrawerSidebar';
import { BottomTabBar } from '../components/BottomTabBar';
import { NavigationProgressBar } from '../components/NavigationProgressBar';
import { DashboardScreen } from './DashboardScreen';
import { SellersScreen } from './SellersScreen';
import { TransactionsScreen } from './TransactionsScreen';
import { ReportsScreen } from './ReportsScreen';
import { ReceiptsScreen } from './ReceiptsScreen';
import { OrdersScreen } from './OrdersScreen';
import { useTheme } from '../context/ThemeContext';

export type MainTabType = 'Dashboard' | 'Sellers' | 'Reports' | 'Receipts' | 'Orders';

const TAB_ORDER: MainTabType[] = ['Dashboard', 'Sellers', 'Reports', 'Receipts', 'Orders'];

const TAB_TITLES: Record<MainTabType, string> = {
  Dashboard: 'Dashboard',
  Sellers: 'Vendors Directory',
  Reports: 'Analytics Reports',
  Receipts: 'Receipts Center',
  Orders: 'Orders',
};

interface MainScreenProps {
  route: any;
  navigation: any;
}

export const MainScreen: React.FC<MainScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTabType>(route?.params?.initialTab || 'Dashboard');
  const [tabParams, setTabParams] = useState<any>(route?.params?.initialParams || {});
  const [isNavigating, setIsNavigating] = useState(false);
  const [navDirection, setNavDirection] = useState<'left-to-right' | 'right-to-left'>('left-to-right');

  const prevTabRef = useRef<MainTabType>(activeTab);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Listen for route param updates (e.g. navigation.navigate('Main', { tab: 'Sellers', params: {...} }))
  useEffect(() => {
    if (route?.params?.tab && route.params.tab !== activeTab) {
      setActiveTab(route.params.tab);
    }
    if (route?.params?.params) {
      setTabParams(route.params.params);
    }
  }, [route?.params?.tab, route?.params?.params]);

  // Handle directional sliding transition between tabs
  useEffect(() => {
    const prevTab = prevTabRef.current;
    if (prevTab !== activeTab) {
      const prevIdx = TAB_ORDER.indexOf(prevTab);
      const currIdx = TAB_ORDER.indexOf(activeTab);
      const isMovingRight = currIdx > prevIdx;
      const direction = isMovingRight ? 'left-to-right' : 'right-to-left';

      setNavDirection(direction);
      setIsNavigating(true);

      // Slide offset: 38px in the direction of navigation
      const startX = isMovingRight ? 38 : -38;
      slideAnim.setValue(startX);
      opacityAnim.setValue(0.25);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsNavigating(false);
      });

      prevTabRef.current = activeTab;
    }
  }, [activeTab, slideAnim, opacityAnim]);

  // Adapter navigation passed to tabs and bottom bar
  const customNavigation = useMemo(() => {
    return {
      ...navigation,
      navigate: (screenOrTab: string, params?: any) => {
        if (['Dashboard', 'Sellers', 'Reports', 'Receipts', 'Orders'].includes(screenOrTab)) {
          setActiveTab(screenOrTab as MainTabType);
          setTabParams(params || {});
        } else {
          navigation.navigate(screenOrTab, params);
        }
      },
    };
  }, [navigation]);

  const activeTitle = TAB_TITLES[activeTab] || 'Dashboard';

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Persistent Top Navbar Header with Navigation Progress Bar */}
      <View style={styles.headerWrapper}>
        <NavbarHeader
          currentScreenTitle={activeTitle}
          isRootScreen={true}
          onOpenDrawer={() => setDrawerOpen(true)}
          navigation={customNavigation}
        />
        <NavigationProgressBar isNavigating={isNavigating} direction={navDirection} />
      </View>

      {/* Persistent Drawer Sidebar */}
      <DrawerSidebar
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={customNavigation}
        activeScreen={activeTab}
      />

      {/* Screen Content Container — Keeps mounted tab state persistent with hardware-accelerated slide transitions */}
      <View style={styles.contentArea}>
        <Animated.View
          style={[
            styles.tabContent,
            activeTab === 'Dashboard' ? styles.visible : styles.hidden,
            activeTab === 'Dashboard' && {
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <DashboardScreen navigation={customNavigation} isEmbedded={true} isActive={activeTab === 'Dashboard'} route={{ params: tabParams }} />
        </Animated.View>

        <Animated.View
          style={[
            styles.tabContent,
            activeTab === 'Sellers' ? styles.visible : styles.hidden,
            activeTab === 'Sellers' && {
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <SellersScreen navigation={customNavigation} isEmbedded={true} isActive={activeTab === 'Sellers'} route={{ params: tabParams }} />
        </Animated.View>

        <Animated.View
          style={[
            styles.tabContent,
            activeTab === 'Reports' ? styles.visible : styles.hidden,
            activeTab === 'Reports' && {
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <ReportsScreen navigation={customNavigation} isEmbedded={true} isActive={activeTab === 'Reports'} route={{ params: tabParams }} />
        </Animated.View>

        <Animated.View
          style={[
            styles.tabContent,
            activeTab === 'Receipts' ? styles.visible : styles.hidden,
            activeTab === 'Receipts' && {
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <ReceiptsScreen navigation={customNavigation} isEmbedded={true} isActive={activeTab === 'Receipts'} route={{ params: tabParams }} />
        </Animated.View>

        <Animated.View
          style={[
            styles.tabContent,
            activeTab === 'Orders' ? styles.visible : styles.hidden,
            activeTab === 'Orders' && {
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <OrdersScreen navigation={customNavigation} isEmbedded={true} isActive={activeTab === 'Orders'} route={{ params: tabParams }} />
        </Animated.View>
      </View>

      {/* Persistent Bottom Tab Bar */}
      <BottomTabBar activeScreen={activeTab} navigation={customNavigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  headerWrapper: {
    zIndex: 10,
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },
  tabContent: {
    ...StyleSheet.absoluteFill,
  },
  visible: {
    opacity: 1,
    zIndex: 1,
    pointerEvents: 'auto',
  },
  hidden: {
    opacity: 0,
    zIndex: -1,
    pointerEvents: 'none',
  },
});
