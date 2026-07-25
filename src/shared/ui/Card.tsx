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
}>;

export function Card({ children, onPress, style }: Props) {
  const { theme } = useTheme();
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.85 : 1 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
});
