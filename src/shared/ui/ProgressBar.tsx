// src/shared/ui/ProgressBar.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@theme/ThemeContext';

type Props = {
  /** Avance 0-100. Se recorta al rango para tolerar datos inesperados. */
  value: number;
  color?: string;
  label: string;
};

export function ProgressBar({ value, color, label }: Props) {
  const { theme } = useTheme();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, { backgroundColor: theme.colors.surfaceAlt }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, backgroundColor: color ?? theme.colors.primary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});
