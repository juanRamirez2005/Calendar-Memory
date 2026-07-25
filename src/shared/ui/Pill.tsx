// src/shared/ui/Pill.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  color: string;
  filled?: boolean;
};

/** Etiqueta compacta para estado / prioridad / color de materia. */
export function Pill({ label, color, filled }: Props) {
  return (
    <View
      style={[
        styles.pill,
        filled
          ? { backgroundColor: color }
          : { borderColor: color, borderWidth: 1 },
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
