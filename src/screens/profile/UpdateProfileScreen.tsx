import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Check, ChevronDown, Mail, Phone } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useIsTablet } from '../../utils/layout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootStackParamList } from '../../navigation/types';
import { updateProfileHomeowner } from '../../store/slices/authSlice';
import { validateName, validateRequired, validateZip } from '../../utils/validators';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function UpdateProfileScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const isTablet = useIsTablet();
  const contentMaxWidth = useMemo(() => (isTablet ? 720 : undefined), [isTablet]);

  const user = useAppSelector((s) => s.auth.user);
  const status = useAppSelector((s) => s.auth.updateProfileStatus);

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [addressLine1, setAddressLine1] = useState(user?.address_line_1 ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [stateRegion, setStateRegion] = useState(user?.state ?? '');
  const [zipCode, setZipCode] = useState(user?.zip ?? '');
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);

  const errors = useMemo(() => {
    return {
      firstName: validateName('First name', firstName),
      lastName: validateName('Last name', lastName),
      state: validateRequired('State', stateRegion),
      zip: zipCode.trim().length ? validateZip(zipCode) : undefined,
    };
  }, [firstName, lastName, stateRegion, zipCode]);

  const isValid = !errors.firstName && !errors.lastName && !errors.state && !errors.zip;
  const isSubmitting = status === 'loading';

  const onSubmit = async () => {
    setDidAttemptSubmit(true);

    if (!user?.user_id) {
      Alert.alert('Update Profile', 'Missing user information.');
      return;
    }

    if (!isValid || isSubmitting) return;

    try {
      await dispatch(
        updateProfileHomeowner({
          user_id: user.user_id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          address_line_1: addressLine1.trim() || undefined,
          city: city.trim() || undefined,
          state: stateRegion.trim(),
          zip: zipCode.trim() || undefined,
        })
      ).unwrap();

      Alert.alert('Update Profile', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Failed to update profile';
      Alert.alert('Update Profile', message);
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

            <Text style={styles.title}>Update Profile</Text>
            <View style={{ width: 42 }} />
          </View>

          <Text style={styles.sectionHeading}>Personal Information</Text>

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
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.readonlyRow}>
              <View style={styles.leftIconWrap}>
                <Mail color={colors.mutedText} size={20} />
              </View>
              <TextInput
                value={user?.email ?? ''}
                editable={false}
                placeholder="jane.doe@example.com"
                placeholderTextColor={colors.mutedText}
                style={styles.readonlyInput}
              />
              <View style={styles.rightCheckWrap}>
                <Check color={colors.surface} size={16} />
              </View>
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.inputLabel}>Phone number</Text>
            <View style={styles.readonlyRow}>
              <View style={styles.leftIconWrap}>
                <Phone color={colors.mutedText} size={20} />
              </View>
              <TextInput
                value={user?.phone ?? ''}
                editable={false}
                placeholder="(555) 000-0000"
                placeholderTextColor={colors.mutedText}
                style={styles.readonlyInput}
              />
              <View style={styles.rightCheckWrap}>
                <Check color={colors.surface} size={16} />
              </View>
            </View>
          </View>

          <Text style={[styles.sectionHeading, { marginTop: spacing.xl }]}>Address</Text>

          <View style={styles.block}>
            <TextField
              label="Address line 1"
              placeholder="123 Main St"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />
          </View>

          <View style={styles.block}>
            <TextField label="City" placeholder="New York" value={city} onChangeText={setCity} />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <View style={styles.stateLabelRow}>
                <Text style={styles.stateLabel}>State *</Text>
              </View>
              <View style={styles.stateInputWrap}>
                <TextInput
                  value={stateRegion}
                  onChangeText={setStateRegion}
                  placeholder="Select"
                  placeholderTextColor={colors.mutedText}
                  style={styles.stateInput}
                />
                <ChevronDown color={colors.mutedText} size={20} />
              </View>
              {didAttemptSubmit && errors.state ? (
                <Text style={styles.errorText}>{errors.state}</Text>
              ) : null}
            </View>

            <View style={styles.col}>
              <TextField
                label="Zip Code"
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
              title="Update Now"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              onPress={onSubmit}
            />
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
    marginBottom: spacing.xl,
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
  title: {
    flex: 1,
    marginLeft: spacing.lg,
    color: colors.brand,
    fontSize: 22,
    fontFamily: typography.fonts.bold,
  },
  sectionHeading: {
    color: colors.mutedText,
    fontSize: 20,
    fontFamily: typography.fonts.bold,
    marginBottom: spacing.lg,
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
  inputLabel: {
    color: colors.mutedText,
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    marginBottom: spacing.sm,
  },
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    height: 58,
  },
  leftIconWrap: {
    marginRight: spacing.md,
  },
  readonlyInput: {
    flex: 1,
    color: colors.brand,
    fontSize: 18,
    fontFamily: typography.fonts.semiBold,
    paddingVertical: 0,
  },
  rightCheckWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stateLabel: {
    color: colors.text,
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
  },
  stateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    height: 58,
  },
  stateInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontFamily: typography.fonts.regular,
    paddingVertical: 0,
    paddingRight: spacing.md,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: 12,
    fontFamily: typography.fonts.regular,
  },
  ctaWrap: {
    marginTop: spacing.xxl,
  },
});
