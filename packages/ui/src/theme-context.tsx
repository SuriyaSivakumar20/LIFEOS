import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, spacing, radii, typography, shadows, type ColorTokens } from './tokens';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeContextValue {
  mode: 'dark' | 'light';
  themeModeSetting: ThemeMode;
  setThemeModeSetting: (mode: ThemeMode) => void;
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

export function ThemeProvider({
  children,
  initialMode = 'dark',
  onThemeChange,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeModeSetting, setThemeModeSetting] = useState<ThemeMode>(initialMode);

  useEffect(() => {
    if (initialMode && initialMode !== themeModeSetting) {
      setThemeModeSetting(initialMode);
    }
  }, [initialMode]);

  const resolvedMode: 'dark' | 'light' = useMemo(() => {
    if (themeModeSetting === 'system') {
      return systemColorScheme === 'light' ? 'light' : 'dark';
    }
    return themeModeSetting;
  }, [themeModeSetting, systemColorScheme]);

  const handleSetMode = (mode: ThemeMode) => {
    setThemeModeSetting(mode);
    onThemeChange?.(mode);
  };

  const value: ThemeContextValue = useMemo(() => {
    return {
      mode: resolvedMode,
      themeModeSetting,
      setThemeModeSetting: handleSetMode,
      colors: resolvedMode === 'light' ? lightColors : darkColors,
      spacing,
      radii,
      typography,
      shadows,
    };
  }, [resolvedMode, themeModeSetting]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Graceful fallback if rendered outside provider
    return {
      mode: 'dark',
      themeModeSetting: 'dark',
      setThemeModeSetting: () => {},
      colors: darkColors,
      spacing,
      radii,
      typography,
      shadows,
    };
  }
  return ctx;
}
