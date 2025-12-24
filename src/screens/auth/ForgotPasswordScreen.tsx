import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { forgotPasswordHomeowner, verifyResetOtpHomeowner } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useIsTablet } from '../../utils/layout';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const isTablet = useIsTablet();
  const contentMaxWidth = useMemo(() => (isTablet ? 520 : undefined), [isTablet]);

  const forgotPasswordStatus = useAppSelector((s) => s.auth.forgotPasswordStatus);
  const verifyStatus = useAppSelector((s) => s.auth.verifyResetOtpStatus);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const canSubmit = email.trim().length > 0;
  const isSending = forgotPasswordStatus === 'loading';
  const otpSent = forgotPasswordStatus === 'succeeded';
  const isVerifying = verifyStatus === 'loading';

  const onSubmit = async () => {
    try {
      await dispatch(forgotPasswordHomeowner({ email: email.trim() })).unwrap();
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Failed to send OTP';
      Alert.alert('Forgot Password', message);
    }
  };

  const onVerify = async () => {
    try {
      const data = await dispatch(
        verifyResetOtpHomeowner({ email: email.trim(), otp: otp.trim() })
      ).unwrap();

      navigation.navigate('ResetPassword', { reset_token: data.reset_token });
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Failed to verify OTP';
      Alert.alert('Forgot Password', message);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
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

          <Text style={styles.title}>Forgot Password</Text>

          <View style={styles.form}>
            <TextField
              label="Email"
              placeholder="jane.doe@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />

            {otpSent ? (
              <TextField
                label="OTP"
                placeholder="Enter OTP"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
              />
            ) : null}

            {otpSent ? (
              <Button
                title="Verify OTP"
                loading={isVerifying}
                disabled={!canSubmit || otp.trim().length === 0 || isVerifying}
                onPress={onVerify}
              />
            ) : (
              <Button
                title="Send Code"
                loading={isSending}
                disabled={!canSubmit || isSending}
                onPress={onSubmit}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: 'flex-start',
  },
  container: {
    width: '100%',
    alignSelf: 'center',
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
  backArrow: {
    color: colors.brand,
    fontSize: 20,
    fontWeight: '900',
    marginTop: -1,
  },
  logoWrap: {
    alignItems: 'center',
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
    fontWeight: '900',
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
  },
});
