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

### 3. Server-Generated Official Receipts
- The mobile app MUST use the **same server-generated receipt** format as the web application.
- Both `POST /api/v1/transactions` and `GET /api/v1/transactions/:id/receipt` supply the official `ServerReceipt` payload.
- Rendered by [`ReceiptModal.tsx`](file:///d:/vasudha-polymer/app/src/components/ReceiptModal.tsx) with company details from server, vendor details, itemized table, and digital verification seal.
- Do NOT create separate mobile-only receipt generation logic.

### 4. Seller Toggle Logic & In-Context Modal (Web Parity)
- Both [`AddSellerModal.tsx`](file:///d:/vasudha-polymer/app/src/components/AddSellerModal.tsx) and [`AddSellerScreen.tsx`](file:///d:/vasudha-polymer/app/src/screens/AddSellerScreen.tsx) implement the exact "Require additional fields" switch toggle matching web:
  - **When ON (Default)**: Validates that **Vendor Name**, **Email Address** (valid email format), and **GSTIN** (15 alphanumeric characters) are strictly mandatory before submit. Phone and address are optional.
  - **When OFF**: Only **Vendor Name** is mandatory. Email (valid format if provided), GSTIN, Phone, and Address are optional.
  - Passes `requireAdditional` in API payload to `/api/v1/sellers`.
  - Shows floating toast (`"Seller created successfully."`) and immediately refreshes vendor list in-place.

### 5. Clean Production Authentication (No Demo UI)
- [`LoginScreen.tsx`](file:///d:/vasudha-polymer/app/src/screens/LoginScreen.tsx) must be a clean production authentication screen.
- Remove all demo boxes, auto-fill buttons, and placeholder test credentials.

### 6. Notch & Layout Polish
- Wrap [`NavbarHeader.tsx`](file:///d:/vasudha-polymer/app/src/components/NavbarHeader.tsx) with `useSafeAreaInsets()` from `react-native-safe-area-context` to prevent notch/status-bar overlap.
- Root screens (`Dashboard`, `Sellers`, `Transactions`, `Orders`, `Receipts`, `Reports`) must NEVER display `< Back`.
- Sub-screens safely fall back to `Dashboard` if `navigation.canGoBack()` is false.

### 7. Network & API Connectivity
- [`client.ts`](file:///d:/vasudha-polymer/app/src/api/client.ts) dynamically resolves baseURL on each request:
  - Web: `http://localhost:5000/api/v1` (or `/api/v1` for production)
  - Native: Auto-detects host machine IP from Metro scriptURL (or fallback LAN IP) to ensure physical devices and emulators connect seamlessly.

### 8. Live Real-Time Data & Shimmer Skeleton Loading
- **Real-Time Data**: All screens query live server APIs on focus (`useFocusEffect`) and pull-to-refresh.
- **NO Stale In-Memory Caching**: Do NOT use artificial in-memory caching that masks live updates or prevents realtime calculation display.
- **Shimmer / Skeleton Loading**: During data fetches, never show blank white screens or standalone spinners. Render dark-themed Shimmer Skeletons ([`Shimmer.tsx`](file:///d:/vasudha-polymer/app/src/components/Shimmer.tsx)):
  - `SellerCardSkeleton` for `SellersScreen`
  - `TransactionCardSkeleton` for `TransactionsScreen`
  - `ReceiptCardSkeleton` for `ReceiptsScreen`
  - `DashboardSkeleton` for `DashboardScreen`
  - `ReportsSkeleton` for `ReportsScreen`
  - `SellerDetailSkeleton` for `SellerDetailScreen`
- **Native Dark Background**: `app.json` enforces `"userInterfaceStyle": "dark"` and `"backgroundColor": "#080d1a"` across Android and iOS to prevent white canvas flashing during slide transitions.

### 9. Commands & Verification
- Mobile TypeScript Check: `npx tsc --noEmit`
- Start Metro Bundler: `npx expo start`
- Start Web Mode: `npx expo start --web`
- Run API Test Suite: `npm run test:api`
