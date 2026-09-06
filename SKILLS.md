# VTMS Mobile App — Required Technical Skills (`app/SKILLS.md`)

## 🔴 CRITICAL MANDATORY AGENT RULE
- **KEEP ALL AI FILES UPDATED:** You MUST keep all AI files and skill documentation strictly updated inside the `app/` folder (`app/SKILLS.md`, `app/README.md`, `app/API_DOCUMENTATION.md`, `app/.agents/AGENTS.md`) whenever any project structure, UI layout, or business rules are modified.

## 💧 IMPORTANT RULE: Tank Capacities & Unit Display Constraint
- Only the following tank sizes are allowed: `500`, `1000`, `2000` (`tank500`, `tank1000`, `tank2000`).
- Do NOT add `tank300`, `tank750`, `tank1500`, or any other tank size.
- Tank reporting and breakdown MUST display **Tank Unit Numbers / Quantities** (e.g. `5 Tanks`, `12 Units`), NOT volume in Liters (`5,000 L`).

---

## Required Technical Stack & Skills

1. **React Native (Expo SDK 50) + TypeScript**:
   - Functional components, custom hooks, React Context (`AuthContext`, `ThemeContext`).
   - Dynamic Light & Dark Mode theme switching via `ThemeContext` and theme tokens (`src/constants/theme.ts`).

2. **Transaction-Creation Workflow & In-Context Modals**:
   - In [`AddTransactionModal.tsx`](file:///d:/vasudha-polymer/app/src/components/AddTransactionModal.tsx), [`DeliveryFormScreen.tsx`](file:///d:/vasudha-polymer/app/src/screens/DeliveryFormScreen.tsx), and [`PaymentFormScreen.tsx`](file:///d:/vasudha-polymer/app/src/screens/PaymentFormScreen.tsx), NEVER redirect or pop navigation on API success.
   - Stay in active context, show floating toast (`"Transaction created successfully."`), and display in-place Success Modal with:
     - Checkmark status badge
     - Official Server Receipt Voucher Number (`RCP-XXXXXXXX`)
     - Three actions: `View Official Receipt`, `+ Record Another`, `Done`.
   - Pre-submission order summary card showing live vendor name, item breakdown (strictly `500L`, `1000L`, `2000L`), and total billed amount in ₹.

3. **Server-Generated Official Receipts & Canonical PDF Engine**:
   - Unified receipt engine: Web and mobile share the **identical server-generated vector PDF** from `GET /api/v1/transactions/:id/receipt/pdf`.
   - Downloaded via [`downloadReceiptPdfApi`](file:///d:/vasudha-polymer/app/src/api/transaction.ts) using `File.downloadFileAsync` from `expo-file-system`.
   - Native AirPrint / Android Print triggered via `Print.printAsync({ uri })` and sharing/saving via `Sharing.shareAsync(uri)`.
   - Zero client-side HTML/PDF generation or duplication on the mobile app. All vector bounds, logo (44x44pt), and icons (12-14pt) are strictly controlled by the backend generator.

4. **Web-Aligned Vendor Logic (`AddSellerModal.tsx` & `AddSellerScreen.tsx`)**:
   - Includes "Require Additional Fields" switch toggle matching web [`AddSellerModal.tsx`](file:///d:/vasudha-polymer/client/src/modules/seller/components/AddSellerModal.tsx).
   - When toggle is ON (Default): Name, Email (valid email format), and 15-character GSTIN are strictly mandatory before submit. Phone and Address are optional.
   - When toggle is OFF: only Name is mandatory; Email, GST, Phone, and Address are optional.
   - Sends `requireAdditional` in API payload to `/api/v1/sellers` and shows floating toast (`"Seller created successfully."`).

5. **Clean Production Authentication & Official App Logo**:
   - [`LoginScreen.tsx`](file:///d:/vasudha-polymer/app/src/screens/LoginScreen.tsx) provides a clean SaaS authentication experience with the official company logo ([`VasudhaLogo.tsx`](file:///d:/vasudha-polymer/app/src/components/VasudhaLogo.tsx) backed by `assets/logo.jpg`), and zero demo boxes or auto-fill buttons.

6. **Notch & Safe Area Handling**:
   - Top headers use `useSafeAreaInsets()` from `react-native-safe-area-context` in [`NavbarHeader.tsx`](file:///d:/vasudha-polymer/app/src/components/NavbarHeader.tsx).
   - Root screens (`Dashboard`, `Sellers`, `Reports`, `Receipts`, `Orders`) never show `< Back`.

7. **Network Connectivity & Dynamic Host IP**:
   - [`client.ts`](file:///d:/vasudha-polymer/app/src/api/client.ts) dynamically resolves baseURL on each request, auto-detecting the host IP from Metro scriptURL for physical devices and emulators.

8. **TanStack React Query Cache Layer & Shimmer Skeleton Loading**:
   - Master `@tanstack/react-query` integration (`QueryClientProvider` in [`App.tsx`](file:///d:/vasudha-polymer/app/App.tsx)).
   - Maintain centralized query configuration and key factory in [`queryClient.ts`](file:///d:/vasudha-polymer/app/src/query/queryClient.ts) (`QUERY_KEYS` for sellers, transactions, receipts, reports).
   - Use specialized hooks in [`useQueries.ts`](file:///d:/vasudha-polymer/app/src/query/useQueries.ts) (`useDashboardQuery`, `useSellersQuery`, `useSellerDetailQuery`, `useTransactionsQuery`, `useReceiptsQuery`, `useTankReportQuery`) utilizing Stale-While-Revalidate (SWR) caching with automatic query deduplication.
   - Enforce mutation-driven targeted cache invalidations (`invalidateSellers`, `invalidateSellerDetail`, `invalidateTransactions`, `invalidateDashboard`, `invalidateReports`, `invalidateReceipts`) immediately upon transaction or vendor changes to ensure backend data integrity.
   - Display dark-themed Shimmer Skeletons ([`Shimmer.tsx`](file:///d:/vasudha-polymer/app/src/components/Shimmer.tsx)) strictly on cold cache loads (`isLoading && !data`). For warm cache hits, show cached data instantly without flicker while background revalidation occurs.
   - Call `clearAllQueryCache()` upon session logout in [`AuthContext.tsx`](file:///d:/vasudha-polymer/app/src/context/AuthContext.tsx) to isolate user data.
   - Configure `app.json` with `"userInterfaceStyle": "dark"` and `"backgroundColor": "#080d1a"` to ensure seamless transitions without white edge flashes.

9. **Interactive Calendar Date Picker & Form Parity**:
   - Transaction inputs must use [`DatePickerField.tsx`](file:///d:/vasudha-polymer/app/src/components/ui/DatePickerField.tsx) featuring full calendar navigation, `overFullScreen` presentation modal, backdrop dismissal, and today / yesterday quick-select buttons.

10. **Top Laser Beam Fetching Progress Bar**:
    - Revalidation across mobile screens routes through `queryClient.fetchQuery` / `useQuery` to drive [`NavigationProgressBar.tsx`](file:///d:/vasudha-polymer/app/src/components/NavigationProgressBar.tsx) during background syncs while keeping pull-to-refresh spinners exclusively bound to user pull gestures.

11. **Server Receipt Synchronization & Hot Environment Resolution**:
    - Mobile receipt preview in [`ReceiptModal.tsx`](file:///d:/vasudha-polymer/app/src/components/ReceiptModal.tsx) fetches live server-rendered metadata from `/api/v1/transactions/:id/receipt` ensuring 100% branding, GSTIN, and voucher consistency with the canonical downloaded vector PDF.
