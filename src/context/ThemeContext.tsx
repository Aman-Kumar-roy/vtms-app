import React, { createContext, useContext } from 'react';

export interface ThemeColorsType {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  success: string;
  warning: string;
  danger: string;
}

export const darkColors: ThemeColorsType = {
  bgPrimary: '#080d1a',
  bgSecondary: '#0f172a',
  bgCard: '#111e38',
  borderSubtle: 'rgba(56, 189, 248, 0.22)',
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  accent: '#0284c7',
  accentHover: '#38bdf8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
};

interface ThemeContextType {
  colors: ThemeColorsType;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: darkColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors: darkColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
