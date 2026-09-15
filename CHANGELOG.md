# Changelog - Vasudha Polymer VTMS Mobile App

All notable changes to the **Vasudha Polymer VTMS Mobile App** (`vtms-app`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.3.0] - 2026-09-16

### Added & Enhanced
- **Authoritative Balance & Advance Dues Tracking**:
  - Full support for advance balance tracking with positive green styling (`+ ₹ XX,XXX.00 (Advance)`).
  - 3-column Financial Balance card across transaction modals, receipt preview, and server-generated PDF vouchers.
- **Server Receipt Metadata & Local Branding Isolation**:
  - Mobile receipt preview (`ReceiptModal.tsx`) strictly consumes server-rendered company metadata with 100% vector PDF consistency.
  - Isolated mobile configuration to `app/.env` (`EXPO_PUBLIC_COMPANY_NAME="Vasudha Polymer"`).
- **Interactive Calendar & Form Improvements**:
  - `DatePickerField` with full calendar navigation and `overFullScreen` presentation modal.
  - Multiline note input with live character counter (0/500).
- **Automated Type Safety & Optimization**:
  - Clean TypeScript checks (`npx tsc --noEmit`) and TanStack Query SWR background cache revalidation.

---

## [v1.2.0] - 2026-09-10

### Added & Optimized
- **Server Database Performance & True DB-Level Pagination**:
  - Replaced in-memory transaction history slicing with true database-level `.skip()` and `.limit()` on `/sellers/:id` and `/transactions`.
  - Enforced safe default limits (50) and hard maximum caps (100) on all collection queries.
  - Replaced in-memory loops with single-stage MongoDB `$group` aggregation pipelines for vendor lifetime metrics (`totalDeliveries`, `totalPaid`, `tank500`, `tank1000`).
  - Added compound indexes on `TransactionSchema` (`sellerId + date + createdAt`, `type + date + createdAt`, `date + createdAt`, `parentId + type`) and search indexes on `SellerSchema` (`createdAt`, `name`, `phone`, `email`, `gstNumber`).
  - Added `escapeRegex` sanitization and 100-character input limits to protect regex searches against ReDoS attacks.
- **Flexible Tank Line Items & Back Due Tracking**:
  - Deliveries support dynamic line items (`tankItems: [{ size: 500 | 1000, quantity, layers: 3-6, foam?: 'none' | 'single' | 'double' }]`).
  - Every transaction tracks `previousDues` and `currentDues` with live calculations.
  - Complete removal of `tank2000` (2000L); strictly enforced `500L` and `1000L` tank capacities only.
- **Skill & Agent Documentation Parity**:
  - Synchronized `app/.agents/AGENTS.md`, `app/SKILLS.md`, `app/types.ts`, `app/api-docs/API_DOCUMENTATION.md`, and `app/api-docs/api-collection.json` with all backend REST architecture updates.

---

## [v1.0.1] - 2026-09-06

### Fixed
- **Native Launch / Splash Screen Architecture (`expo-splash-screen`)**:
  - Integrated Expo's official native launch screen controller (`expo-splash-screen`).
  - Added module-level `SplashScreen.preventAutoHideAsync()` to ensure the native launch screen remains visible during bundle compilation, local storage retrieval, and initial session verification.
  - Added `isAuthReady` lifecycle gate to `AuthContext`: dynamically holds the native splash screen until authentication state is resolved and then immediately calls `SplashScreen.hideAsync()` without artificial delay.
  - Completely eliminated initial white screen flashes and premature screen rendering.
- **Brand Asset & Dark Theme Optimization**:
  - Re-encoded `splash.png`, `splash-icon.png`, and `adaptive-icon.png` as 32-bit ARGB PNGs with clean alpha transparency around the emblem.
  - Configured `expo-splash-screen` plugin in `app.json` with centered `imageWidth: 200` and dark background `#080d1a`, ensuring the logo emblem floats centered without distortion, cropping, or white bounding boxes.
- **Dependency & Build Parity**:
  - Installed missing `expo-font` peer dependency for `@expo/vector-icons` and aligned `typescript` (~6.0.3) and `expo-file-system` (~57.0.6) with Expo SDK 57.
  - Verified 18/18 checks passed in `expo-doctor` with 0 issues.

---

## [v1.0.0] - 2026-09-06

### Features
- **Cross-Platform Mobile App (Expo SDK 50 & TypeScript)**:
  - Clean production authentication (no demo credentials or auto-fill placeholders).
  - Modern bottom tab bar with dynamic sliding navigation (`Dashboard`, `Sellers`, `Reports`, `Receipts`, `Orders`).
  - Top navigation progress indicator with directional animations.
- **Canonical Server-Generated PDF Receipts**:
  - Integrated server vector PDF architecture via `expo-file-system`, `expo-print`, and `expo-sharing`.
  - Removed client HTML templates; mobile and web render the identical canonical vector PDF receipt.
- **TanStack React Query Cache & SWR Architecture**:
  - Centralized `QueryClient` with 2-minute stale duration and automatic background revalidation.
  - Dark-themed Shimmer skeleton loaders (`Shimmer.tsx`) matching screen structure.
  - Targeted cache invalidation across all screens on delivery and settlement mutations.
- **Business Logic & Strict Capacities**:
  - Strictly limited polymer water tank unit capacities to `500L`, `1,000L`, and `2,000L` (`tank500`, `tank1000`, `tank2000`).
  - Itemized live calculations and paisa-precision currency formatting.
  - In-context modal workflows (`AddTransactionModal.tsx`) with instant confirmation cards and zero unexpected screen navigation.
- **Responsive Screen Width & Tab Filtering**:
  - Fixed embedded container padding to eliminate double-padding margins across sub-screens.
  - Instant SWR filtering and tab sorting between Deliveries and Payments on `ReceiptsScreen` and `TransactionsScreen`.
  - Automatic dynamic IP resolution for Metro host across local Wi-Fi and physical devices.
