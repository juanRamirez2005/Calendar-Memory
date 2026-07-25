// src/shared/ui/Button.tsx
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@theme/ThemeContext';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'md' | 'sm';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  style,
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.dangerSoft
        : colors.surfaceAlt;
  const fg =
    variant === 'primary'
      ? colors.primaryText
      : variant === 'danger'
        ? colors.danger
        : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        variant === 'primary' && !disabled ? theme.shadow.sm : null,
        {
          backgroundColor: bg,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
        },
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[size === 'sm' ? styles.labelSm : styles.label, { color: fg }]}>
          {icon ? `${icon}  ` : ''}
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  md: { minHeight: 52, paddingHorizontal: 22 },
  sm: { minHeight: 40, paddingHorizontal: 16 },
  pressed: { transform: [{ scale: 0.98 }] },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  labelSm: { fontSize: 14, fontWeight: '700' },
});
