// src/shared/ui/EmptyState.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@theme/ThemeContext';

type Props = {
  title: string;
  message?: string;
  emoji?: string;
};

export function EmptyState({ title, message, emoji = '✨' }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.primarySoft },
        ]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
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
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emoji: { fontSize: 40 },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 14.5,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 300,
  },
});
