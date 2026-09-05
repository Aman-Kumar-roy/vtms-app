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

3. **Server-Generated Official Receipts**:
   - Unified receipt engine: Web and mobile share the identical server receipt format via `ServerReceipt`.
   - Populated from `POST /api/v1/transactions` and `GET /api/v1/transactions/:id/receipt`.
   - Rendered using [`ReceiptModal.tsx`](file:///d:/vasudha-polymer/app/src/components/ReceiptModal.tsx) with company header, vendor details, itemized product breakdown, and digital verification seal.

4. **Web-Aligned Vendor Logic (`AddSellerModal.tsx` & `AddSellerScreen.tsx`)**:
   - Includes "Require Additional Fields" switch toggle matching web [`AddSellerModal.tsx`](file:///d:/vasudha-polymer/client/src/modules/seller/components/AddSellerModal.tsx).
   - When toggle is ON (Default): Name, Email (valid email format), and 15-character GSTIN are strictly mandatory before submit. Phone and Address are optional.
   - When toggle is OFF: only Name is mandatory; Email, GST, Phone, and Address are optional.
   - Sends `requireAdditional` in API payload to `/api/v1/sellers` and shows floating toast (`"Seller created successfully."`).

5. **Clean Production Authentication**:
   - [`LoginScreen.tsx`](file:///d:/vasudha-polymer/app/src/screens/LoginScreen.tsx) provides a clean SaaS authentication experience with zero demo boxes or auto-fill buttons.

6. **Notch & Safe Area Handling**:
   - Top headers use `useSafeAreaInsets()` from `react-native-safe-area-context` in [`NavbarHeader.tsx`](file:///d:/vasudha-polymer/app/src/components/NavbarHeader.tsx).
   - Root screens (`Dashboard`, `Sellers`, `Transactions`, `Orders`, `Receipts`, `Reports`) never show `< Back`.

7. **Network Connectivity & Dynamic Host IP**:
   - [`client.ts`](file:///d:/vasudha-polymer/app/src/api/client.ts) dynamically resolves baseURL on each request, auto-detecting the host IP from Metro scriptURL for physical devices and emulators.

8. **Live Real-Time Data & Shimmer Skeleton Loading**:
   - Never use in-memory caching that causes stale figures or delays realtime data presentation.
   - Always load data directly from the Express REST API backend on focus (`useFocusEffect`) and pull-to-refresh.
   - While data is loading, use dark-themed Shimmer Skeletons ([`Shimmer.tsx`](file:///d:/vasudha-polymer/app/src/components/Shimmer.tsx)) matching the exact content layout (`SellerCardSkeleton`, `TransactionCardSkeleton`, `ReceiptCardSkeleton`, `DashboardSkeleton`, `ReportsSkeleton`, `SellerDetailSkeleton`) instead of blank white screens or lone spinners.
   - Configure `app.json` with `"userInterfaceStyle": "dark"` and `"backgroundColor": "#080d1a"` to ensure seamless slide transitions on native Android and iOS devices without white edge flashes.
