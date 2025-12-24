import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type AppAlertVariant = 'info' | 'success' | 'error';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  variant?: AppAlertVariant;

  primaryText?: string;
  onPrimaryPress: () => void;

  secondaryText?: string;
  onSecondaryPress?: () => void;

  onRequestClose?: () => void;
  dismissOnBackdropPress?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
};

export function AppAlertModal({
  visible,
  title,
  message,
  variant = 'info',
  primaryText = 'OK',
  onPrimaryPress,
  secondaryText,
  onSecondaryPress,
  onRequestClose,
  dismissOnBackdropPress = false,
  containerStyle,
}: Props) {
  const titleColor = useMemo(() => {
    if (variant === 'error') return colors.danger;
    if (variant === 'success') return colors.brand;
    return colors.text;
  }, [variant]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Close alert"
          onPress={dismissOnBackdropPress ? onRequestClose : undefined}
        />

        <View style={[styles.card, containerStyle]} accessibilityRole="alert">
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttonsRow}>
            {secondaryText && onSecondaryPress ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={secondaryText}
                onPress={onSecondaryPress}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryPressed,
                ]}
              >
                <Text style={styles.secondaryText}>{secondaryText}</Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={primaryText}
              onPress={onPrimaryPress}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
            >
              <Text style={styles.primaryText}>{primaryText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.text,
    opacity: 0.35,
  },
  card: {
    width: '88%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fonts.bold,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    color: colors.mutedText,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
  buttonsRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryPressed: {
    opacity: 0.8,
  },
  secondaryText: {
    color: colors.text,
    fontFamily: typography.fonts.bold,
    fontSize: 14,
  },
  primaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.brand,
  },
  primaryPressed: {
    backgroundColor: colors.brandDark,
  },
  primaryText: {
    color: colors.surface,
    fontFamily: typography.fonts.bold,
    fontSize: 14,
  },
});
