import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SellersScreen } from './src/screens/SellersScreen';
import { AddSellerScreen } from './src/screens/AddSellerScreen';
import { DeliveryFormScreen } from './src/screens/DeliveryFormScreen';
import { PaymentFormScreen } from './src/screens/PaymentFormScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { ReceiptsScreen } from './src/screens/ReceiptsScreen';
import { SellerDetailScreen } from './src/screens/SellerDetailScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#080d1a',
    card: '#111e38',
    text: '#ffffff',
    border: 'rgba(56, 189, 248, 0.22)',
    primary: '#0284c7',
  },
};

const AppNavigator = () => {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
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
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Sellers" component={SellersScreen} />
            <Stack.Screen name="SellerDetail" component={SellerDetailScreen} />
            <Stack.Screen name="AddSeller" component={AddSellerScreen} />
            <Stack.Screen name="DeliveryForm" component={DeliveryFormScreen} />
            <Stack.Screen name="PaymentForm" component={PaymentFormScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Receipts" component={ReceiptsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
