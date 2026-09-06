# Vasudha Polymer VTMS Mobile App (Vendor & Transaction Management System)

> **Location:** [`d:\vasudha-polymer\app`](file:///d:/vasudha-polymer/app)  
> High-performance cross-platform mobile application powered by **React Native (Expo SDK 50)** + **TypeScript**, designed for iOS, Android, and web browser preview with built-in official server receipt voucher generation and clean Linear/Stripe-grade UI design.

---

## 🎨 Design System & Dynamic Theme

- **Palette & Dynamic Theme:** Deep space dark void (`#050811`) vs. clean slate light mode (`#f8fafc`). Toggle between Light Mode and Dark Mode instantly via the header control button (`ThemeContext`).
- **Header Shell & Safe Area:** Uses `useSafeAreaInsets()` from `react-native-safe-area-context` to guarantee zero notch or status-bar overlap on iOS and Android devices.
- **Iconography:** Clean vector icons (`@expo/vector-icons` - `Ionicons`/`Feather`).
- **Clean Authentication:** Production-ready login screen with no demo boxes or auto-fill buttons.

---

## 🖨️ Server-Generated Receipts & Canonical PDF Architecture
 
The mobile application consumes the **identical server-generated vector PDF** as the web dashboard:
- The backend (`server/src/services/pdfReceiptService.ts`) generates official vector PDFs with strict `44x44pt` logo bounding, vector icons (`12-14pt`), strict `500L`, `1000L`, and `2000L` tank breakdowns, and digital verification seals.
- Endpoint: `GET /api/v1/transactions/:id/receipt/pdf` (streams vector `application/pdf`).
- Downloaded locally using [`downloadReceiptPdfApi`](file:///d:/vasudha-polymer/app/src/api/transaction.ts) (`File.downloadFileAsync` via `expo-file-system`).
- Displayed and triggered in [`ReceiptModal.tsx`](file:///d:/vasudha-polymer/app/src/components/ReceiptModal.tsx) via `expo-print` (`Print.printAsync({ uri })`) and `expo-sharing` (`Sharing.shareAsync(uri)`).
- Zero client-side template duplication: Web Receipt = Mobile Receipt = Same Server PDF.

---

## 🔒 Business Domain Rules

- **Tank Capacities & Unit Counts:** Strictly limited to **`500L` (`tank500`)**, **`1,000L` (`tank1000`)**, and **`2,000L` (`tank2000`)** ONLY.
- **Selling Units:** The business model represents selling tank units to sellers/vendors. Never use "Volume" or "Report" in transaction screens.
- **Transaction-Creation Flow:** In-context bottom sheets (`AddTransactionModal.tsx`) for `DELIVERY` and `PAYMENT`. Never redirect or pop navigation on API success. Display a floating toast (`"Transaction created successfully."`) and an in-context success confirmation with `View Official Receipt`, `+ Record Another`, and `Done`.
- **Seller Toggle Parity:** Matches web [`AddSellerModal.tsx`](file:///d:/vasudha-polymer/client/src/modules/seller/components/AddSellerModal.tsx) and mobile [`AddSellerModal.tsx`](file:///d:/vasudha-polymer/app/src/components/AddSellerModal.tsx) with the "Require additional fields" switch toggle:
  - **ON (Default)**: Vendor Name, Email Address (valid format), and 15-character GSTIN are strictly mandatory. Phone and Address are optional.
  - **OFF**: Only Vendor Name is mandatory. Email, GSTIN, Phone, and Address are optional.
  - Shows floating toast (`"Seller created successfully."`) and refreshes vendor list in-place.

---

## 📱 Screen & Component Architecture

1. **`LoginScreen`**: Clean production authentication with email & password validation.
2. **`DashboardScreen`**: Command Center Hero Banner, top vendor highlight, active vendor metrics, and unit distribution charts.
3. **`SellersScreen`**: Vendor directory with instant search, filter modes (All, Dues, Settled), ledger metrics, and one-tap "+ Add Vendor" and "+ Delivery" in-context modals.
4. **`AddSellerModal` / `AddSellerScreen`**: Vendor onboarding with "Require additional fields" switch toggle matching the web app.
5. **`AddTransactionModal`**: Unified in-context modal for `DELIVERY` (500L, 1000L, 2000L unit steppers) and `PAYMENT` (cash, UPI, cheque, bank transfer) with interactive calendar date picking (`DatePickerField`), live calculations, and official server receipt voucher generation.
6. **`DeliveryFormScreen` & `PaymentFormScreen`**: Dedicated fallback screens supporting the same interactive calendar date picker, live order summary, validation, and in-context success flow.
7. **`TransactionsScreen`**: Full transaction ledger with search, type filters, "+ Delivery" & "+ Payment" modals, and one-tap receipt voucher preview.
8. **`ReceiptsScreen`**: Dedicated voucher ledger for reviewing formal transaction slips.
9. **`ReportsScreen`**: Business metrics, collection efficiency, vendor leaderboard, and tank distribution.
10. **`OrdersScreen`**: Dispatched delivery order queue with one-tap receipt inspection.

---

## ⚡ TanStack Query Cache Architecture & Shimmer Loading
 
- **Centralized Query Client**: Configured in [`src/query/queryClient.ts`](file:///d:/vasudha-polymer/app/src/query/queryClient.ts) using `@tanstack/react-query` with standard 2-minute stale duration, 15-minute garbage collection, and automatic query deduplication.
- **Stale-While-Revalidate (SWR)**: Screens display cached records instantly on tab switches and screen transitions for zero layout shift, quietly refreshing data in the background.
- **Top Laser Beam Progress Bar**: Integrated [`NavigationProgressBar.tsx`](file:///d:/vasudha-polymer/app/src/components/NavigationProgressBar.tsx) animated glowing line at the top of the viewport driven by `useIsFetching() > 0`.
- **Query Hooks (`src/query/useQueries.ts`)**: Modular query hooks (`useDashboardQuery`, `useSellersQuery`, `useSellerDetailQuery`, `useTransactionsQuery`, `useReceiptsQuery`, `useTankReportQuery`) powering screens with built-in loading and fetching states.
- **Targeted Mutation Invalidation**: When deliveries, payments, or vendors are added or updated, helper functions (`invalidateTransactions`, `invalidateSellers`, `invalidateDashboard`, `invalidateReports`, `invalidateReceipts`) immediately synchronize server and client state.
- **Dark-Themed Shimmer Skeletons**: [`Shimmer.tsx`](file:///d:/vasudha-polymer/app/src/components/Shimmer.tsx) displays smooth skeleton placeholders (`SellerCardSkeleton`, `TransactionCardSkeleton`, `ReceiptCardSkeleton`, `DashboardSkeleton`, `ReportsSkeleton`, `SellerDetailSkeleton`) strictly on cold cache loads (`isLoading && !data`). Warm cache hits render without delay.
- **Session Cache Eviction**: Auth logout executes `clearAllQueryCache()` in [`AuthContext.tsx`](file:///d:/vasudha-polymer/app/src/context/AuthContext.tsx) to prevent data leakage between sessions.
- **Native Dark Theme Protection**: Configured `app.json` with `"userInterfaceStyle": "dark"` and `"backgroundColor": "#080d1a"` to ensure zero white canvas flashes during right-to-left slide transitions on mobile and web simulators.

---

## 🚀 Quick Start Guide

```bash
# 1. Navigate into the mobile app directory
cd app

# 2. Install dependencies
npm install

# 3. Start Expo development server (Scan QR code with Expo Go on physical device)
npx expo start

# 4. Launch on Android emulator
npx expo start --android

# 5. Launch on iOS simulator
npx expo start --ios

# 6. Type-check mobile codebase
npx tsc --noEmit
```

---

## 📦 Dedicated Git Repository Setup

This `app` directory is completely isolated and self-contained. To maintain it in its own independent repository:

```bash
# Cut or clone the app folder, navigate into it:
cd app

# Initialize new Git repository
git init
git add .
git commit -m "feat: initial commit for Vasudha Polymer VTMS mobile app"

# Link to your new remote Git repository:
git remote add origin <YOUR_NEW_MOBILE_REPO_URL>
git branch -M main
git push -u origin main
```
