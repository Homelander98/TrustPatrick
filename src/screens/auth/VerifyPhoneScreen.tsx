import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Phone } from 'lucide-react-native';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components/ui/Button';
import { AppAlertModal } from '../../components/ui/AppAlertModal';
import { useAppAlert } from '../../components/ui/useAppAlert';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { sendPhoneOtpHomeowner, verifyPhoneOtpHomeowner } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useIsTablet } from '../../utils/layout';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type Route = { key: string; name: 'VerifyPhone'; params?: AuthStackParamList['VerifyPhone'] };

export function VerifyPhoneScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();
  const isTablet = useIsTablet();
  const contentMaxWidth = useMemo(() => (isTablet ? 520 : undefined), [isTablet]);

  const { alertProps, show: showAlert } = useAppAlert();

  const sendStatus = useAppSelector((s) => s.auth.sendPhoneOtpStatus);
  const verifyStatus = useAppSelector((s) => s.auth.verifyPhoneOtpStatus);

  const [phone, setPhone] = useState(route.params?.phone ?? '');
  const [otp, setOtp] = useState('');
  const [didSendCode, setDidSendCode] = useState(false);

  const canSend = phone.trim().length > 0;
  const isSending = sendStatus === 'loading';
  const isVerifying = verifyStatus === 'loading';
  const showOtp = didSendCode || sendStatus === 'succeeded';
  const canVerify = showOtp && otp.trim().length > 0;

  const onSendCode = async () => {
    try {
      await dispatch(sendPhoneOtpHomeowner({ phone: phone.trim() })).unwrap();
      setDidSendCode(true);
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Failed to send code';
      showAlert({
        title: 'Verify Phone',
        message,
        primaryText: 'OK',
      });
    }
  };

  const onVerify = async () => {
    try {
      await dispatch(verifyPhoneOtpHomeowner({ phone: phone.trim(), otp: otp.trim() })).unwrap();
      showAlert({
        title: 'Verify Phone',
        message: 'Phone verified successfully',
        primaryText: 'OK',
        onPrimaryPress: () => navigation.getParent()?.navigate('Home' as never),
      });
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Failed to verify code';
      showAlert({
        title: 'Verify Phone',
        message,
        primaryText: 'OK',
      });
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

          <Text style={styles.title}>Verify Phone</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputRow}>
              <Phone color={colors.mutedText} size={20} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.mutedText}
                style={styles.input}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
              />
            </View>

            {showOtp ? (
              <>
                <Text style={[styles.label, { marginTop: spacing.lg }]}>OTP</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter code"
                    placeholderTextColor={colors.mutedText}
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>
              </>
            ) : null}

            <View style={styles.ctaWrap}>
              {showOtp ? (
                <Button
                  title="Verify"
                  loading={isVerifying}
                  disabled={!canVerify || isVerifying}
                  onPress={onVerify}
                />
              ) : (
                <Button
                  title="Send Code"
                  loading={isSending}
                  disabled={!canSend || isSending}
                  onPress={onSendCode}
                />
              )}
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Already a member? </Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.bottomLink}>Log In</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <AppAlertModal {...alertProps} />
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
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
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
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    height: 58,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontFamily: typography.fonts.regular,
    paddingVertical: 0,
  },
  ctaWrap: {
    marginTop: spacing.xxl,
  },
  bottomRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  bottomText: {
    color: colors.mutedText,
    fontSize: 18,
    fontFamily: typography.fonts.regular,
  },
  bottomLink: {
    color: colors.link,
    fontSize: 18,
    fontFamily: typography.fonts.black,
  },
});
