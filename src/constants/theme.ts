import { darkColors, lightColors } from '../context/ThemeContext';

export { darkColors, lightColors };

export const Colors = {
  ...darkColors,
  // Design Tokens & Aliases
  bgTertiary: darkColors.bgCard,
  accentViolet: '#8B5CF6',
  // Legacy Theme Aliases
  bgDark: darkColors.bgPrimary,
  cardDark: darkColors.bgCard,
  cardGlowBorder: darkColors.borderSubtle,
  primary: darkColors.accent,
  primaryBright: darkColors.accentHover,
  primaryGlow: 'rgba(2, 132, 199, 0.25)',
  secondaryGlow: 'rgba(56, 189, 248, 0.25)',
  textLight: darkColors.textPrimary,
  borderDark: darkColors.borderSubtle,
  dark900: darkColors.bgPrimary,
  dark800: darkColors.bgSecondary,
  dark700: darkColors.bgCard,
  dangerGlow: 'rgba(244, 63, 94, 0.25)',
  white: '#ffffff',
  gray400: '#A1A1AA',
  gray300: '#CBD5E1',
  gray200: '#E2E8F0',
  gray100: '#F1F5F9',
};

export const TankSizes = [
  { key: 'tank500' as const, label: '500L Storage Tank', capacity: '500L', size: 500 },
  { key: 'tank1000' as const, label: '1,000L Storage Tank', capacity: '1,000L', size: 1000 },
];
