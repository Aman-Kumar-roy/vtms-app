import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeShadowType {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ThemeColorsType {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgElevated: string;
  borderSubtle: string;
  borderDefault: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  shadowSm: ThemeShadowType;
  shadowMd: ThemeShadowType;
  shadowLg: ThemeShadowType;
}

export const darkColors: ThemeColorsType = {
  bgPrimary: '#080d1a',
  bgSecondary: '#0f172a',
  bgCard: '#111e38',
  bgElevated: '#1a2744',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderDefault: 'rgba(56, 189, 248, 0.22)',
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  accent: '#0284c7',
  accentHover: '#38bdf8',
  accentLight: 'rgba(56, 189, 248, 0.15)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#f43f5e',
  dangerLight: 'rgba(244, 63, 94, 0.15)',
  info: '#38bdf8',
  infoLight: 'rgba(56, 189, 248, 0.15)',
  shadowSm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowLg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const lightColors: ThemeColorsType = {
  bgPrimary: '#f1f5f9',
  bgSecondary: '#ffffff',
  bgCard: '#ffffff',
  bgElevated: '#e2e8f0',
  borderSubtle: 'rgba(15, 23, 42, 0.08)',
  borderDefault: 'rgba(15, 23, 42, 0.14)',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  accent: '#0284c7',
  accentHover: '#0369a1',
  accentLight: 'rgba(2, 132, 199, 0.08)',
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.08)',
  warning: '#d97706',
  warningLight: 'rgba(217, 119, 6, 0.08)',
  danger: '#e11d48',
  dangerLight: 'rgba(225, 29, 72, 0.08)',
  info: '#0284c7',
  infoLight: 'rgba(2, 132, 199, 0.08)',
  shadowSm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  shadowMd: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  shadowLg: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColorsType;
  isThemeReady: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  colors: darkColors,
  isThemeReady: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

const THEME_STORAGE_KEY = '@vtms_theme';
const LEGACY_STORAGE_KEY = '@vasudha_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isThemeReady, setIsThemeReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const stored =
          (await AsyncStorage.getItem(THEME_STORAGE_KEY)) ||
          (await AsyncStorage.getItem(LEGACY_STORAGE_KEY));
        if (stored === 'light' || stored === 'dark') {
          setThemeState(stored);
        } else {
          // Default to dark mode
          setThemeState('dark');
        }
      } catch {
        setThemeState('dark');
      } finally {
        setIsThemeReady(true);
      }
    })();
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
    AsyncStorage.setItem(LEGACY_STORAGE_KEY, mode).catch(() => {});
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, isThemeReady, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

