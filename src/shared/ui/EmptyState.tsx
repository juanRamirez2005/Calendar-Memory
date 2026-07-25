// src/shared/ui/EmptyState.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@theme/ThemeContext';

type Props = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
