# Changelog - Vasudha Polymer VTMS Mobile App

All notable changes to the **Vasudha Polymer VTMS Mobile App** (`vtms-app`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
