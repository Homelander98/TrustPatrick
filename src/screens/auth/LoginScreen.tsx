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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { loginHomeowner } from '../../store/slices/authSlice';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useIsTablet } from '../../utils/layout';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const isTablet = useIsTablet();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const contentMaxWidth = useMemo(() => (isTablet ? 520 : undefined), [isTablet]);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await dispatch(
        loginHomeowner({ email: email.trim(), password })
      ).unwrap();

      console.log('Login user:', data.user);

      if (data?.user?.email_verified === false) {
        Alert.alert('Please verify your email', undefined, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('VerifyEmail', { email: data.user.email }),
          },
        ]);
        return;
      }

      navigation
        .getParent()
        ?.navigate('Home' as never);
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Login failed';
      Alert.alert('Login', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.container, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../components/assets/images/mainlogo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityRole="image"
                accessibilityLabel="TrustPatrick"
              />
            </View>

            <Text style={styles.title}>Log In</Text>

            <View style={styles.form}>
              <TextField
                label="Email"
                placeholder="jane.doe@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="username"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />

              <TextField
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                rightActionLabel="Forgot Password?"
                onRightActionPress={() => navigation.navigate('ForgotPassword')}
              />

              <View style={styles.submitWrap}>
                <Button title="Log In" loading={submitting} disabled={!canSubmit} onPress={onSubmit} />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don’t have an account ? </Text>
                <Pressable onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Registration Now</Text>
                </Pressable>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 180,
    height: 70,
  },
  title: {
    textAlign: 'center',
    color: colors.brand,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  submitWrap: {
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: '500',
  },
  footerLink: {
    color: colors.link,
    fontSize: 16,
    fontWeight: '800',
  },
});
