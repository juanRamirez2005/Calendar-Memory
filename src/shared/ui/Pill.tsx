// src/shared/ui/Pill.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  color: string;
  /** Fondo teñido opcional (para el estilo suave). */
  softColor?: string;
  filled?: boolean;
};

/** Etiqueta compacta para estado / prioridad / color de materia. */
export function Pill({ label, color, softColor, filled }: Props) {
  return (
    <View
      style={[
        styles.pill,
        filled
          ? { backgroundColor: color }
          : { backgroundColor: softColor ?? 'transparent', borderColor: color, borderWidth: softColor ? 0 : 1.5 },
      ]}>
      <Text style={[styles.text, { color: filled ? '#FFFFFF' : color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
