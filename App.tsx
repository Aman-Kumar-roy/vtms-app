import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/query/queryClient';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainScreen } from './src/screens/MainScreen';
import { AddSellerScreen } from './src/screens/AddSellerScreen';
import { DeliveryFormScreen } from './src/screens/DeliveryFormScreen';
import { PaymentFormScreen } from './src/screens/PaymentFormScreen';
import { SellerDetailScreen } from './src/screens/SellerDetailScreen';

// Prevent the native launch splash screen from auto-hiding before initial auth & app state is ready
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore reload race conditions */
});

const Stack = createNativeStackNavigator();

// Aliases for root tab screens ensuring seamless backward compatibility
const DashboardTabScreen = (props: any) => (
  <MainScreen {...props} route={{ ...props.route, params: { ...props.route?.params, tab: 'Dashboard' } }} />
);
const SellersTabScreen = (props: any) => (
  <MainScreen {...props} route={{ ...props.route, params: { ...props.route?.params, tab: 'Sellers' } }} />
);
const TransactionsTabScreen = (props: any) => (
  <MainScreen {...props} route={{ ...props.route, params: { ...props.route?.params, tab: 'Transactions' } }} />
);
const ReportsTabScreen = (props: any) => (
  <MainScreen {...props} route={{ ...props.route, params: { ...props.route?.params, tab: 'Reports' } }} />
);
const ReceiptsTabScreen = (props: any) => (
  <MainScreen {...props} route={{ ...props.route, params: { ...props.route?.params, tab: 'Receipts' } }} />
);
const OrdersTabScreen = (props: any) => (
  <MainScreen {...props} route={{ ...props.route, params: { ...props.route?.params, tab: 'Orders' } }} />
);

const AppNavigator = () => {
  const { user, isAuthReady } = useAuth();
  const { colors, theme, isThemeReady } = useTheme();

  const dynamicNavTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bgPrimary,
      card: colors.bgCard,
      text: colors.textPrimary,
      border: colors.borderSubtle,
      primary: colors.accent,
    },
  };

  // Hide the native splash screen as soon as authentication AND saved theme are fully loaded
  useEffect(() => {
    if (isAuthReady && isThemeReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAuthReady, isThemeReady]);

  // While auth session or saved theme preference is restoring, hold the splash screen smoothly
  if (!isAuthReady || !isThemeReady) {
    return null;
  }

  return (
    <NavigationContainer theme={dynamicNavTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
          freezeOnBlur: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Dashboard" component={DashboardTabScreen} />
            <Stack.Screen name="Sellers" component={SellersTabScreen} />
            <Stack.Screen name="Transactions" component={TransactionsTabScreen} />
            <Stack.Screen name="Reports" component={ReportsTabScreen} />
            <Stack.Screen name="Receipts" component={ReceiptsTabScreen} />
            <Stack.Screen name="Orders" component={OrdersTabScreen} />

            {/* Sub-screens pushed onto the stack with Back button */}
            <Stack.Screen
              name="SellerDetail"
              component={SellerDetailScreen}
              options={{
                animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="AddSeller"
              component={AddSellerScreen}
              options={{
                animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="DeliveryForm"
              component={DeliveryFormScreen}
              options={{
                animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="PaymentForm"
              component={PaymentFormScreen}
              options={{
                animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
