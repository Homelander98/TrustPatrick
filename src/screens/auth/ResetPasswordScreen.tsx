import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import type { AuthStackParamList } from '../../navigation/types';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useIsTablet } from '../../utils/layout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetPasswordHomeowner } from '../../store/slices/authSlice';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ResetPasswordRouteProp>();
  const dispatch = useAppDispatch();

  const isTablet = useIsTablet();
  const contentMaxWidth = useMemo(() => (isTablet ? 520 : undefined), [isTablet]);

  const resetStatus = useAppSelector((s) => s.auth.resetPasswordStatus);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const canSubmit = newPassword.length > 0 && confirmPassword.length > 0;
  const isSubmitting = resetStatus === 'loading';

  const onSubmit = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Change Password', 'Passwords do not match.');
      return;
    }

    try {
      await dispatch(
        resetPasswordHomeowner({
          reset_token: route.params.reset_token,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        })
      ).unwrap();

      Alert.alert('Change Password', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Failed to change password';
      Alert.alert('Change Password', message);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.container, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft color={colors.brand} size={20} />
            </Pressable>

            <View style={styles.logoWrap}>
              <Image
                source={require('../../components/assets/images/mainlogo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityRole="image"
                accessibilityLabel="TrustPatrick"
              />
            </View>

            <Text style={styles.title}>Change Password</Text>

            <View style={styles.form}>
              <TextField
                label="New password"
                placeholder="New password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                textContentType="newPassword"
              />

              <TextField
                label="Confirm new password"
                placeholder="Confirm password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                textContentType="newPassword"
              />

              <View style={styles.ctaWrap}>
                <Button
                  title="Change Password"
                  loading={isSubmitting}
                  disabled={!canSubmit || isSubmitting}
                  onPress={onSubmit}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  container: {
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 170,
    height: 44,
  },
  title: {
    textAlign: 'center',
    color: colors.brand,
    fontSize: 34,
    fontFamily: typography.fonts.black,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
    flex: 1,
  },
  ctaWrap: {
    marginTop: spacing.xxl,
  },
});
