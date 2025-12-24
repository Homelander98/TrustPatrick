import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useIsTablet } from '../../utils/layout';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useAppDispatch } from '../../store/hooks';
import { registerHomeowner } from '../../store/slices/authSlice';
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneOptional,
  validateRequired,
  validateZip,
} from '../../utils/validators';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const isTablet = useIsTablet();
  const contentMaxWidth = useMemo(() => (isTablet ? 720 : undefined), [isTablet]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);

  const errors = useMemo(() => {
    return {
      firstName: validateName('First name', firstName),
      lastName: validateName('Last name', lastName),
      email: validateEmail(email),
      phone: validatePhoneOptional(phone),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
      state: validateRequired('State', stateRegion),
      zip: validateZip(zipCode),
    };
  }, [
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    stateRegion,
    zipCode,
  ]);

  const isValid =
    !errors.firstName &&
    !errors.lastName &&
    !errors.email &&
    !errors.phone &&
    !errors.password &&
    !errors.confirmPassword &&
    !errors.state &&
    !errors.zip;

  const canSubmit = isValid && !submitting;

  const onSubmit = async () => {
    setDidAttemptSubmit(true);

    if (!isValid) {
      return;
    }

    setSubmitting(true);
    try {
      const data = await dispatch(
        registerHomeowner({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          password_confirmation: confirmPassword,
          address_line_1: addressLine1.trim() || undefined,
          city: city.trim() || undefined,
          state: stateRegion.trim() || undefined,
          zip: zipCode.trim() || undefined,
        })
      ).unwrap();

      console.log('Registration user:', data.user);
      Alert.alert('Registration', 'Registration successful');
      navigation.navigate('Login');
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Registration failed';
      Alert.alert('Registration', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft color={colors.brand} size={20} />
            </Pressable>
          </View>

          <View style={styles.logoWrap}>
            <Image
              source={require('../../components/assets/images/mainlogo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="TrustPatrick"
            />
          </View>

          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <TextField
                label="Full name *"
                placeholder="Jane"
                value={firstName}
                onChangeText={setFirstName}
                error={didAttemptSubmit ? errors.firstName : undefined}
              />
            </View>
            <View style={styles.col}>
              <TextField
                label="Last name *"
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
                error={didAttemptSubmit ? errors.lastName : undefined}
              />
            </View>
          </View>

          <View style={styles.block}>
            <TextField
              label="Email *"
              placeholder="jane.doe@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              error={email.trim().length > 0 || didAttemptSubmit ? errors.email : undefined}
            />
          </View>

          <View style={styles.block}>
            <TextField
              label="Phone number"
              placeholder="(555) 000-0000"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              value={phone}
              onChangeText={setPhone}
              error={phone.trim().length > 0 ? errors.phone : undefined}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Security</Text>
          <View style={styles.block}>
            <TextField
              label="Password *"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
              rightActionLabel={showPassword ? 'Hide' : 'Show'}
              onRightActionPress={() => setShowPassword((v) => !v)}
              error={password.length > 0 || didAttemptSubmit ? errors.password : undefined}
            />
          </View>

          <View style={styles.block}>
            <TextField
              label="Confirm Password *"
              placeholder="••••••••"
              secureTextEntry={!showConfirmPassword}
              textContentType="newPassword"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              rightActionLabel={showConfirmPassword ? 'Hide' : 'Show'}
              onRightActionPress={() => setShowConfirmPassword((v) => !v)}
              error={confirmPassword.length > 0 || didAttemptSubmit ? errors.confirmPassword : undefined}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Address</Text>
          <View style={styles.block}>
            <TextField
              label="Address line 1"
              placeholder="123 Main St"
              textContentType="streetAddressLine1"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />
          </View>

          <View style={styles.block}>
            <TextField label="City" placeholder="New York" value={city} onChangeText={setCity} />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <TextField
                label="State *"
                placeholder="Select"
                value={stateRegion}
                onChangeText={setStateRegion}
                error={didAttemptSubmit ? errors.state : undefined}
              />
            </View>
            <View style={styles.col}>
              <TextField
                label="Zip Code *"
                placeholder="10001"
                keyboardType="number-pad"
                textContentType="postalCode"
                value={zipCode}
                onChangeText={setZipCode}
                error={zipCode.trim().length > 0 || didAttemptSubmit ? errors.zip : undefined}
              />
            </View>
          </View>

          <View style={styles.ctaWrap}>
            <Button
              title="Register  →"
              loading={submitting}
              disabled={!canSubmit}
              onPress={onSubmit}
            />
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already a member? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.bottomLink}>Log In</Text>
            </Pressable>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
  },
  backArrow: {
    color: colors.brand,
    fontSize: 20,
    marginTop: -1,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressTrack: {
    width: 190,
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.brand,
  },
  progressText: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '800',
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
    fontWeight: '900',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.mutedText,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  col: {
    flex: 1,
  },
  block: {
    marginTop: spacing.lg,
  },
  ctaWrap: {
    marginTop: spacing.xxl,
  },
  bottomRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  bottomText: {
    color: colors.mutedText,
    fontSize: 18,
    fontWeight: '600',
  },
  bottomLink: {
    color: colors.link,
    fontSize: 18,
    fontWeight: '900',
  },
});
