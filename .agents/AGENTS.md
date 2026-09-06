# VTMS Mobile App — AI Agent Instructions (`app/.agents/AGENTS.md`)

> These rules apply to ALL AI agents working inside `d:\vasudha-polymer\app`.

---

## 🔴 Critical Mobile App Rules

### MANDATORY AGENT RULE: Keep ALL AI Files & Skills Updated
- **ALWAYS KEEP AI FILES UPDATED:** AI agents MUST update all documentation inside the `app/` folder (`app/SKILLS.md`, `app/README.md`, `app/API_DOCUMENTATION.md`, `app/.agents/AGENTS.md`) whenever making code, architectural, or UI changes.

### IMPORTANT RULE: Tank Capacities & Unit Display Constraints
- Only the following tank sizes are allowed: `tank500` (500L), `tank1000` (1,000L), `tank2000` (2,000L) ONLY.
- Do NOT add `tank300`, `tank750`, `tank1500`, or any other tank size.
- Tank reporting and breakdown MUST display **Tank Unit Numbers / Quantities** (e.g. `5 Tanks`, `12 Units`), NOT volume in Liters (`5,000 L`).
- Do NOT add fields unless explicitly instructed.

---

### 1. Transaction-Creation Flow & In-Context Modals
- **In-Context Creation Modal**: Use [`AddTransactionModal.tsx`](file:///d:/vasudha-polymer/app/src/components/AddTransactionModal.tsx) across mobile screens (`SellersScreen`, `SellerDetailScreen`, `TransactionsScreen`) supporting `DELIVERY` (with tank unit steppers `500L`, `1000L`, `2000L`) and `PAYMENT` modes.
- **Do NOT Navigate Away on API Success**: Never trigger `navigation.goBack()` or redirect the user to an unrelated screen after creating a delivery or payment.
- **In-Context Experience**: Stay on the screen, display a floating toast (`"Transaction created successfully."`), and present an in-place confirmation card with:
  - Success badge (`✓`)
  - Server-generated receipt voucher number (`receiptNo: RCP-XXXXXXXX`)
  - Action buttons:
    1. `View Official Receipt` — Opens `ReceiptModal` displaying the server-generated voucher
    2. `+ Record Another` — Clears form inputs while keeping modal ready for the next entry
    3. `Done` — Gracefully closes modal and refreshes data in-place
- **Pre-Submission Summary**: Display live vendor name, itemized unit quantities, and total amount before submission.

### 2. Business Logic & Terminology (Selling Units)
- **Core Operation**: We are selling polymer water storage tank units to sellers/vendors.
- **Terminology**: Never use "Volume" or "Report" in transaction screens.
- **Product Items**: Water Storage Tanks (Polymer) with strict sizes:
  - `500L Storage Tank`
  - `1,000L Storage Tank`
  - `2,000L Storage Tank`

### 3. Server-Generated Official Receipts & Canonical PDF Architecture
- **Single Source of Truth**: The mobile application MUST consume the **identical server-generated vector PDF** produced by the Express backend (`GET /api/v1/transactions/:id/receipt/pdf`).
- **No Client-Side Template Duplication**: Do NOT recreate, lay out, or render HTML receipts on the mobile device. The mobile app has zero independent receipt templates.
- **Downloading & Sharing Engine**:
  - [`downloadReceiptPdfApi`](file:///d:/vasudha-polymer/app/src/api/transaction.ts) downloads the canonical PDF directly to the local cache directory using `expo-file-system` (`File.downloadFileAsync`).
  - [`ReceiptModal.tsx`](file:///d:/vasudha-polymer/app/src/components/ReceiptModal.tsx) provides two primary actions:
    - **Print / PDF**: Calls `Print.printAsync({ uri })` from `expo-print` for high-fidelity native printing via iOS AirPrint / Android Print.
    - **Download PDF**: Calls `Sharing.shareAsync(uri)` from `expo-sharing` to share/save the exact PDF file across WhatsApp, Gmail, Drive, or Files.
- **Visual Parity**: Logo dimensions (`44x44pt`), icons (`12-14pt`), fonts, and table layouts are identical between Web and Mobile because both consume the same backend PDF stream.

### 4. Seller Toggle Logic & In-Context Modal (Web Parity)
- Both [`AddSellerModal.tsx`](file:///d:/vasudha-polymer/app/src/components/AddSellerModal.tsx) and [`AddSellerScreen.tsx`](file:///d:/vasudha-polymer/app/src/screens/AddSellerScreen.tsx) implement the exact "Require additional fields" switch toggle matching web:
  - **When ON (Default)**: Validates that **Vendor Name**, **Email Address** (valid email format), and **GSTIN** (15 alphanumeric characters) are strictly mandatory before submit. Phone and address are optional.
  - **When OFF**: Only **Vendor Name** is mandatory. Email (valid format if provided), GSTIN, Phone, and Address are optional.
  - Passes `requireAdditional` in API payload to `/api/v1/sellers`.
  - Shows floating toast (`"Seller created successfully."`) and immediately refreshes vendor list in-place.

### 5. Clean Production Authentication & Official App Logo
- [`LoginScreen.tsx`](file:///d:/vasudha-polymer/app/src/screens/LoginScreen.tsx) must be a clean production authentication screen featuring the official app logo image ([`VasudhaLogo.tsx`](file:///d:/vasudha-polymer/app/src/components/VasudhaLogo.tsx) backed by `assets/logo.jpg`).
- Remove all demo boxes, auto-fill buttons, and placeholder test credentials.

### 6. Notch & Layout Polish
- Wrap [`NavbarHeader.tsx`](file:///d:/vasudha-polymer/app/src/components/NavbarHeader.tsx) with `useSafeAreaInsets()` from `react-native-safe-area-context` to prevent notch/status-bar overlap.
- Root screens (`Dashboard`, `Sellers`, `Reports`, `Receipts`, `Orders`) must NEVER display `< Back`.
- Sub-screens safely fall back to `Dashboard` if `navigation.canGoBack()` is false.

### 7. Network & API Connectivity
- [`client.ts`](file:///d:/vasudha-polymer/app/src/api/client.ts) dynamically resolves baseURL on each request:
  - Web: `http://localhost:5000/api/v1` (or `/api/v1` for production)
  - Native: Auto-detects host machine IP from Metro scriptURL (or fallback LAN IP) to ensure physical devices and emulators connect seamlessly.

### 8. Live Real-Time Data & TanStack Query Cache Architecture
- **Single Source of Truth**: Express REST API backend remains the authoritative single source of truth. Dynamic ledger calculations (`totalDeliveries`, `totalPaid`, `totalDues`) are never hardcoded or client-computed.
- **TanStack React Query Cache Layer (`@tanstack/react-query`)**:
  - Global `QueryClient` configured in [`src/query/queryClient.ts`](file:///d:/vasudha-polymer/app/src/query/queryClient.ts) with `staleTime: 2min` (5min for vendor directories), `gcTime: 15min`, and `refetchOnReconnect: true`.
  - **Stale-While-Revalidate (SWR)**: Cached queries display immediately on screen transitions for a zero-flicker experience, while background revalidation fetches fresh data quietly.
  - **Automatic Deduplication**: Concurrent calls to identical endpoints across screens or tabs are automatically deduplicated.
- **Centralized Query Keys**:
  - Use `QUERY_KEYS` factory in [`src/query/queryClient.ts`](file:///d:/vasudha-polymer/app/src/query/queryClient.ts) (`sellers`, `sellerDetail`, `transactions`, `summaryReport`, `tankReport`, `receipts`) to guarantee consistent cache addressing.
- **Standardized Query Hooks**:
  - All screens leverage dedicated hooks in [`src/query/useQueries.ts`](file:///d:/vasudha-polymer/app/src/query/useQueries.ts):
    - `useDashboardQuery()`
    - `useSellersQuery(params)`
    - `useSellerDetailQuery(id, params)`
    - `useTransactionsQuery(params)`
    - `useReceiptsQuery(params)`
    - `useTankReportQuery(params)`
- **Targeted Cache Invalidation on Mutations**:
  - Whenever any mutation occurs (e.g. creating vendor, recording delivery, recording payment, updating records), immediately invoke targeted invalidation helpers from [`src/query/queryClient.ts`](file:///d:/vasudha-polymer/app/src/query/queryClient.ts):
    - `invalidateSellers()`
    - `invalidateSellerDetail(sellerId)`
    - `invalidateTransactions(sellerId?)`
    - `invalidateDashboard()`
    - `invalidateReports()`
    - `invalidateReceipts()`
  - Never allow mutations to leave stale cache records in memory.
- **Shimmer / Skeleton Loading Protocol**:
  - Render dark-themed Shimmer Skeletons ([`Shimmer.tsx`](file:///d:/vasudha-polymer/app/src/components/Shimmer.tsx)) **ONLY on cold cache loads** (`isLoading && !data`):
    - `DashboardSkeleton` for `DashboardScreen`
    - `SellerCardSkeleton` for `SellersScreen`
    - `SellerDetailSkeleton` for `SellerDetailScreen`
    - `TransactionCardSkeleton` for `TransactionsScreen`
    - `ReceiptCardSkeleton` for `ReceiptsScreen`
    - `ReportsSkeleton` for `ReportsScreen`
  - On warm cache hits (`data` already present), render UI immediately without layout shift or skeleton flashing, using `isFetching` for pull-to-refresh spinners.
- **Session Cache Eviction**:
  - Always invoke `clearAllQueryCache()` upon user logout in [`AuthContext.tsx`](file:///d:/vasudha-polymer/app/src/context/AuthContext.tsx) to completely scrub cached tenant data.
- **Native Dark Background**: `app.json` enforces `"userInterfaceStyle": "dark"` and `"backgroundColor": "#080d1a"` across Android and iOS to prevent white canvas flashing during slide transitions.

### 10. Transaction Date Picker & Form Calendar Parity
- **Dedicated Calendar Field**: All delivery and payment transaction inputs (`AddTransactionModal.tsx`, `DeliveryFormScreen.tsx`, `PaymentFormScreen.tsx`) MUST utilize [`DatePickerField.tsx`](file:///d:/vasudha-polymer/app/src/components/ui/DatePickerField.tsx) instead of raw text inputs.
- **Modal Nesting Safety**: Configured with `presentationStyle="overFullScreen"`, transparent backdrop, year/month navigation, today / yesterday presets, and custom `inputBackground` to cleanly stack within both modal sheets and standalone screens without layering conflicts.

### 11. Top Progress Bar Animation & Decoupled Pull-to-Refresh
- **Unified Top Fetching Indicator**: Screen data fetching and background revalidations trigger TanStack React Query (`queryClient.fetchQuery` / `useQuery`) so `useIsFetching() > 0` smoothly displays the top laser beam animation ([`NavigationProgressBar.tsx`](file:///d:/vasudha-polymer/app/src/components/NavigationProgressBar.tsx)).
- **No Disruptive Inline Spinners**: Inline activity indicator spinners must NOT be displayed inside card headers or report period banners (e.g. next to "All Time History").
- **Decoupled Pull-to-Refresh**: Native `RefreshControl` spinners are strictly tied to manual user drag gestures via dedicated `isPullRefreshing` state, never to background SWR cache revalidations.

### 12. Dynamic Environment & Clean Base URL Resolution
- **Dynamic Live Base URL**: [`client.ts`](file:///d:/vasudha-polymer/app/src/api/client.ts) resolves API endpoints using Metro scriptURL host IP (for local dev) or `EXPO_PUBLIC_API_URL` without hardcoded production overrides or string sniffing.
- **Canonical Server Receipt Metadata**: [`ReceiptModal.tsx`](file:///d:/vasudha-polymer/app/src/components/ReceiptModal.tsx) fetches official metadata from `/api/v1/transactions/:id/receipt` ensuring company branding, GST, address, and phone numbers live-reflect server configuration with 100% parity to the generated PDF.

### 13. Commands & Verification
- Mobile TypeScript Check: `npx tsc --noEmit`
- Start Metro Bundler: `npx expo start`
- Start Web Mode: `npx expo start --web`
- Run API Test Suite: `npm run test:api`
