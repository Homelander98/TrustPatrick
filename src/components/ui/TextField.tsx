import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = {
  label: string;
  error?: string;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
} & TextInputProps;

export function TextField({
  label,
  error,
  rightActionLabel,
  onRightActionPress,
  style,
  ...rest
}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightActionLabel ? (
          <Pressable accessibilityRole="button" onPress={onRightActionPress}>
            <Text style={styles.rightAction}>{rightActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <TextInput
        placeholderTextColor={colors.mutedText}
        style={[styles.input, style]}
        {...rest}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
  },
  rightAction: {
    color: colors.link,
    fontSize: 14,
    fontFamily: typography.fonts.bold,
    textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    color: colors.text,
    fontSize: 16,
    fontFamily: typography.fonts.regular,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: typography.fonts.regular,
  },
});
