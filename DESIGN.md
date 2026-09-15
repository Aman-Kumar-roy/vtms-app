# VTMS Mobile App — Design System Contract (`app/DESIGN.md`)

## Stack
- **Framework**: React Native (Expo SDK 50) + React 19 / React Native 0.86
- **Language**: TypeScript 6
- **Styling**: StyleSheet with Semantic Design Tokens (`src/context/ThemeContext.tsx`, `src/constants/theme.ts`)
- **Navigation**: React Navigation Native Stack (`@react-navigation/native`, `@react-navigation/native-stack`)
- **Data & Caching**: TanStack React Query v5 (`@tanstack/react-query`) with Stale-While-Revalidate (SWR) caching
- **Icons**: `@expo/vector-icons` (Ionicons)
- **PDF & Printing**: Native AirPrint / Android Print via `expo-print` & `expo-sharing` backed by server-generated vector PDF

---

## Design Tokens

### Surfaces (3+ Layered Hierarchy)
| Token | Dark Mode | Light Mode | Role |
| :--- | :--- | :--- | :--- |
| `bgPrimary` | `#080d1a` | `#f1f5f9` | Base screen canvas |
| `bgSecondary` | `#0f172a` | `#ffffff` | Elevated navbars, headers, bottom tabs |
| `bgCard` | `#111e38` | `#ffffff` | Primary cards, modals, sheets |
| `bgElevated` | `#1a2744` | `#e2e8f0` | Floating chips, badges, popover surfaces |

### Foreground & Typography
| Token | Dark Mode | Light Mode | Role / Contrast |
| :--- | :--- | :--- | :--- |
| `textPrimary` | `#ffffff` | `#0f172a` | High contrast headings & titles (>16:1 WCAG AAA) |
| `textSecondary` | `#cbd5e1` | `#334155` | Field labels, secondary captions (>9:1 WCAG AAA) |
| `textMuted` | `#94a3b8` | `#64748b` | Timestamps, placeholder text (>4.5:1 WCAG AA) |

### Brand & Accent
| Token | Dark Mode | Light Mode | Role |
| :--- | :--- | :--- | :--- |
| `accent` | `#0284c7` | `#0284c7` | Primary brand action (Sky 600) |
| `accentHover` | `#38bdf8` | `#0369a1` | Hover / Active pressed brand tint |
| `accentLight` | `rgba(56, 189, 248, 0.15)` | `rgba(2, 132, 199, 0.08)` | Accent pill / badge background |

### Borders
| Token | Dark Mode | Light Mode | Role |
| :--- | :--- | :--- | :--- |
| `borderSubtle` | `rgba(255, 255, 255, 0.08)` | `rgba(15, 23, 42, 0.08)` | Soft container boundaries |
| `borderDefault` | `rgba(56, 189, 248, 0.22)` | `rgba(15, 23, 42, 0.14)` | Active focus / prominent container |

### Status Colors
| Status | Dark Value | Light Value | Light Background Tint |
| :--- | :--- | :--- | :--- |
| `success` | `#10b981` | `#059669` | `successLight`: `rgba(16, 185, 129, 0.15)` / `rgba(5, 150, 105, 0.08)` |
| `warning` | `#f59e0b` | `#d97706` | `warningLight`: `rgba(245, 158, 11, 0.15)` / `rgba(217, 119, 6, 0.08)` |
| `danger` | `#f43f5e` | `#e11d48` | `dangerLight`: `rgba(244, 63, 94, 0.15)` / `rgba(225, 29, 72, 0.08)` |
| `info` | `#38bdf8` | `#0284c7` | `infoLight`: `rgba(56, 189, 248, 0.15)` / `rgba(2, 132, 199, 0.08)` |

### Layered Shadows
- `shadowSm`: Subtle depth for list cards (`elevation: 1-2`, `shadowRadius: 3`)
- `shadowMd`: Standard depth for primary summary cards & sheets (`elevation: 3-4`, `shadowRadius: 8`)
- `shadowLg`: Floating modals, drawers, and popovers (`elevation: 6-8`, `shadowRadius: 16`)

---

## Visual Fidelity Rules

1. **Typography**:
   - Headings: `letterSpacing: -0.4` (`tracking-tight`) with clear semantic scale.
   - Financial figures & unit quantities: Strictly utilize `fontVariant: ['tabular-nums']` to eliminate horizontal layout jitter on background TanStack revalidations.
2. **Borders**:
   - Alpha-blended borders (`rgba(255, 255, 255, 0.08)` dark, `rgba(15, 23, 42, 0.08)` light). Never harsh flat grey.
3. **Interactive Micro-Interactions**:
   - Touch targets >= 44x44 pt.
   - Pressable feedback via `activeOpacity={0.75}`.
   - Theme toggle micro-animation: 360-degree rotation and cross-fading opacity between Sun and Moon (300ms timing curve).
4. **Empty & Loading States**:
   - Shimmer Skeletons ([`Shimmer.tsx`](file:///d:/vasudha-polymer/app/src/components/Shimmer.tsx)) match the precise card geometries of real data.
   - Empty states feature icon, clear title, concise description, and prominent action button.

---

## Components Inventory

- [`AdminHubCard`](file:///d:/vasudha-polymer/app/src/screens/DashboardScreen.tsx): Dashboard financial summary card with brand logo, live active sellers counter, and tabular figures.
- [`NavbarHeader`](file:///d:/vasudha-polymer/app/src/components/NavbarHeader.tsx): Top header with notch safe-area handling, brand emblem, screen title, theme toggle, and profile trigger.
- [`BottomTabBar`](file:///d:/vasudha-polymer/app/src/components/BottomTabBar.tsx): Fixed mobile bottom tab bar with dynamic theme glow border.
- [`DrawerSidebar`](file:///d:/vasudha-polymer/app/src/components/DrawerSidebar.tsx): Modal side drawer with user profile preview, navigation routes, in-drawer theme switcher, and logout.
- [`SellerCard`](file:///d:/vasudha-polymer/app/src/components/SellerCard.tsx): Vendor card with dues badge, delivery counts, tabular finance numbers, and quick actions.
- [`TankSummaryCard`](file:///d:/vasudha-polymer/app/src/components/TankSummaryCard.tsx): Dispatch breakdown card strictly limited to 500L and 1000L polymer tank units.
- [`ReceiptModal`](file:///d:/vasudha-polymer/app/src/components/ReceiptModal.tsx): Official server vector PDF download, native print preview, and WhatsApp sharing.
- [`ProfileModal`](file:///d:/vasudha-polymer/app/src/components/ProfileModal.tsx): Account modal with live theme mode pill switcher.
- [`Shimmer`](file:///d:/vasudha-polymer/app/src/components/Shimmer.tsx): Dark & light mode skeleton blocks for flicker-free initial load.

---

## Decisions Log

- **2026-09-14**:
  - Reverted web dashboard command center; restored native mobile `AdminHubCard` and single `TankSummaryCard`.
  - Implemented dual theme system in `ThemeContext.tsx` with `AsyncStorage` persistence (`@vtms_theme`, `@vasudha_theme`) and OS system theme fallback.
  - Aligned exact validation message across client, app, and API: `Tank Variant #${i + 1}: Please enter a valid quantity greater than 0.`
  - Added layered shadow tokens (`shadowSm`, `shadowMd`, `shadowLg`), elevated surface tokens (`bgElevated`), and status background tints (`accentLight`, `successLight`, etc.).

---

## Non-Goals
- No client-side PDF generation (sole authoritative generator is server `pdfReceiptService.ts`).
- No arbitrary or 2000L tank capacities (strictly 500L and 1000L).
