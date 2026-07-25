// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { buildTheme, type Theme, type ThemeMode } from './index';

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = PropsWithChildren<{
  initialMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
}>;

export function ThemeProvider({
  children,
  initialMode = 'light',
  onModeChange,
}: Props) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const value = useMemo<ThemeContextValue>(() => {
    const setMode = (next: ThemeMode) => {
      setModeState(next);
      onModeChange?.(next);
    };
    return {
      theme: buildTheme(mode),
      mode,
      setMode,
      toggleMode: () => setMode(mode === 'light' ? 'dark' : 'light'),
    };
  }, [mode, onModeChange]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return ctx;
}
