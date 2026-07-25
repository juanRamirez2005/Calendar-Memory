// src/theme/index.ts
import type { ViewStyle } from 'react-native';

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
  primarySoft: string; // fondo teñido para chips / cabeceras
  accent: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
};

export type Theme = {
  mode: ThemeMode;
  colors: ThemePalette;
  spacing: (n: number) => number;
  radius: { sm: number; md: number; lg: number; xl: number; pill: number };
  shadow: { sm: ViewStyle; md: ViewStyle };
};

const spacing = (n: number): number => n * 4;
const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 };

const light: ThemePalette = {
  background: '#F4F5FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EDEEF7',
  border: '#E3E5F0',
  text: '#1B1D2A',
  textMuted: '#71748A',
  primary: '#6366F1',
  primaryText: '#FFFFFF',
  primarySoft: '#EAEBFE',
  accent: '#EC4899',
  accentSoft: '#FCE7F3',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
};

const dark: ThemePalette = {
  background: '#0E0F1A',
  surface: '#191B29',
  surfaceAlt: '#232637',
  border: '#2E3145',
  text: '#ECEDF5',
  textMuted: '#9CA0B8',
  primary: '#818CF8',
  primaryText: '#12131F',
  primarySoft: '#282B4A',
  accent: '#F472B6',
  accentSoft: '#3B2338',
  danger: '#F87171',
  dangerSoft: '#3B2130',
  success: '#34D399',
  successSoft: '#12352C',
  warning: '#FBBF24',
  warningSoft: '#3A2E12',
};

const shadow = (mode: ThemeMode): Theme['shadow'] => {
  const color = mode === 'dark' ? '#000000' : '#3D3F63';
  return {
    sm: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: mode === 'dark' ? 0.4 : 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: mode === 'dark' ? 0.5 : 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  };
};

export function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? dark : light,
    spacing,
    radius,
    shadow: shadow(mode),
  };
}

/** Paleta de colores vibrantes para asignar a las materias. */
export const SUBJECT_COLORS = [
  '#6366F1', // indigo
  '#EC4899', // rosa
  '#F59E0B', // ámbar
  '#10B981', // esmeralda
  '#8B5CF6', // violeta
  '#06B6D4', // cian
  '#EF4444', // rojo
  '#84CC16', // lima
  '#F97316', // naranja
  '#14B8A6', // teal
] as const;
