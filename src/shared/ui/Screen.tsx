// src/shared/ui/Screen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@theme/ThemeContext';

type Props = React.PropsWithChildren<{
  edges?: readonly Edge[];
  padded?: boolean;
}>;

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
