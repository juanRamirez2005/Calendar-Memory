// src/shared/ui/Card.tsx
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@theme/ThemeContext';

type Props = React.PropsWithChildren<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Barra de color a la izquierda (p. ej. color de la materia). */
  accent?: string;
}>;

export function Card({ children, onPress, style, accent }: Props) {
  const { theme } = useTheme();
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    theme.shadow.sm,
    {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
    },
    accent && { borderLeftWidth: 4, borderLeftColor: accent },
    style,
  ];

  const content = <View style={styles.inner}>{children}</View>;

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        ]}>
        {content}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    overflow: 'hidden',
  },
  inner: {
    padding: 18,
  },
});
