// src/theme/index.ts

export type ThemeMode = 'light' | 'dark';

export type ThemePalette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  warning: string;
};

export type Theme = {
  mode: ThemeMode;
  colors: ThemePalette;
  spacing: (n: number) => number;
  radius: { sm: number; md: number; lg: number };
};

const spacing = (n: number): number => n * 4;
const radius = { sm: 6, md: 10, lg: 16 };

const light: ThemePalette = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F3',
  border: '#DCE0E6',
  text: '#1A1C1E',
  textMuted: '#6B7280',
  primary: '#2D6CDF',
  primaryText: '#FFFFFF',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
};

const dark: ThemePalette = {
  background: '#0F1115',
  surface: '#181B20',
  surfaceAlt: '#22262D',
  border: '#2E333B',
  text: '#E7E9EC',
  textMuted: '#9AA1AC',
  primary: '#5A8DF0',
  primaryText: '#0F1115',
  danger: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
};

export function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? dark : light,
    spacing,
    radius,
  };
}

/** Paleta de colores sugeridos para asignar a las materias. */
export const SUBJECT_COLORS = [
  '#2D6CDF',
  '#16A34A',
  '#D97706',
  '#DC2626',
  '#7C3AED',
  '#0891B2',
  '#DB2777',
  '#65A30D',
] as const;
