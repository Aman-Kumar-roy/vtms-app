export const Colors = {
  // 2025 Design Tokens (New-approach.md)
  bgPrimary: '#0A0A0F',
  bgSecondary: '#131316',
  bgTertiary: '#1A1A21',
  borderSubtle: '#26262E',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#63636B',
  accent: '#6366F1',
  accentHover: '#818CF8',
  accentViolet: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Legacy Theme Aliases (Backwards Compatibility)
  bgDark: '#0A0A0F',
  cardDark: '#131316',
  cardGlowBorder: '#26262E',
  primary: '#6366F1',
  primaryBright: '#818CF8',
  primaryGlow: 'rgba(99, 102, 241, 0.25)',
  secondaryGlow: 'rgba(139, 92, 246, 0.25)',
  textLight: '#FAFAFA',
  borderDark: '#26262E',
  dark900: '#0A0A0F',
  dark800: '#131316',
  dark700: '#1A1A21',
  dangerGlow: 'rgba(239, 68, 68, 0.25)',
  white: '#ffffff',
  gray400: '#A1A1AA',
  gray300: '#CBD5E1',
  gray200: '#E2E8F0',
  gray100: '#F1F5F9',
};

export const TankSizes = [
  { key: 'tank500' as const, label: '500L Storage Tank', capacity: '500L', size: 500 },
  { key: 'tank1000' as const, label: '1,000L Storage Tank', capacity: '1,000L', size: 1000 },
  { key: 'tank2000' as const, label: '2,000L Storage Tank', capacity: '2,000L', size: 2000 },
];
