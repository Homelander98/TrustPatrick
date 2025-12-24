import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  rightAdornment?: React.ReactNode;
};

export function Button({ title, loading, rightAdornment, disabled, ...rest }: Props) {
  const isDisabled = disabled || loading;

  const accessibilityLabel = useMemo(() => {
    if (typeof rest.accessibilityLabel === 'string') return rest.accessibilityLabel;
    return title;
  }, [rest.accessibilityLabel, title]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.root,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.title}>{title}</Text>}
        {rightAdornment ? <View style={styles.rightAdornment}>{rightAdornment}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    backgroundColor: colors.brandDark,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.surface,
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    letterSpacing: 0.2,
  },
  rightAdornment: {
    marginLeft: spacing.sm,
  },
});
