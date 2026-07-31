// src/shared/ui/Screen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@theme/ThemeContext';

type Props = React.PropsWithChildren<{
  edges?: readonly Edge[];
  padded?: boolean;
}>;

/**
 * Bordes para las pantallas del stack. A diferencia de las de pestañas, no
 * tienen barra inferior que ocupe el área de la barra de navegación del
 * sistema, así que deben reservar ese inset ellas mismas.
 */
export const STACK_SCREEN_EDGES: readonly Edge[] = [
  'top',
  'left',
  'right',
  'bottom',
];

export function Screen({
  children,
  edges = ['top', 'left', 'right'],
  padded = true,
}: Props) {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={padded ? styles.padded : styles.flex}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  padded: {
    flex: 1,
    padding: 16,
  },
});
