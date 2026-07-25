// src/shared/ui/ScreenHeader.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@theme/ThemeContext';
import { Button } from './Button';

type Props = {
  title: string;
  subtitle?: string;
  emoji?: string;
  action?: { label: string; onPress: () => void; icon?: string };
};

export function ScreenHeader({ title, subtitle, emoji, action }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {emoji ? `${emoji}  ` : ''}
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Button
          title={action.label}
          icon={action.icon}
          size="sm"
          onPress={action.onPress}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  left: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13.5, marginTop: 3, fontWeight: '500' },
});
