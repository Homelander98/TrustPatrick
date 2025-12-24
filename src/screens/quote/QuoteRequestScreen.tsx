import React, { useMemo, useRef, useState } from 'react';
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
import type { RouteProp } from '@react-navigation/native';
import {
  Calendar,
  Check,
  ChevronDown,
  Mail,
  Phone,
  Search,
  Square,
  User,
} from 'lucide-react-native';
import Recaptcha, { type RecaptchaRef } from 'react-native-recaptcha-that-works';
import { apiRequest } from '../../api/client';
import { servicesEndpoints } from '../../api/endpoints';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useIsTablet } from '../../utils/layout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { AppAlertModal } from '../../components/ui/AppAlertModal';
import { useAppAlert } from '../../components/ui/useAppAlert';
import { TrustedFormCertCapture, type TrustedFormCertRef } from '../../components/ui/TrustedFormCertCapture';
import { useAppSelector } from '../../store/hooks';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type QuoteRequestRouteProp = RouteProp<RootStackParamList, 'QuoteRequest'>;

const RECAPTCHA_SITE_KEY = '6Le8LpQjAAAAAKjlwg_24zKFxJpl2WbJFiwELLLC';
const SIGNUP_URL = 'https://dev.allaboutdriveways.com/lead-result';
const RECAPTCHA_BASE_URL = 'https://dev.allaboutdriveways.com';
const TRUSTEDFORM_BASE_URL = 'https://dev.allaboutdriveways.com';

const TIMEFRAME_OPTIONS = [
  'Price Shopping - Price Comparing',
  'Within 1 Week',
  'Within 2 Weeks',
  'Within 1 Month',
  'Within 2-3 Months',
  'Not Sure',
];

export function QuoteRequestScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<QuoteRequestRouteProp>();
  const isTablet = useIsTablet();
  const contentMaxWidth = useMemo(() => (isTablet ? 720 : undefined), [isTablet]);

  const { alertProps, show: showAlert } = useAppAlert();

  const recaptchaRef = useRef<RecaptchaRef>(null);
  const trustedFormRef = useRef<TrustedFormCertRef>(null);

  const user = useAppSelector((s) => s.auth.user);
  const {
    memberSlugs,
    serviceTypeId,
    mainCategoryId,
    categoryId,
    serviceTitle,
    leadEndpoint,
  } = route.params;

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address_line_1 ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [state, setState] = useState(user?.state ?? '');
  const [zip, setZip] = useState(user?.zip ?? '');

  const [timeframe, setTimeframe] = useState('');
  const [showTimeframePicker, setShowTimeframePicker] = useState(false);
  const [projectInfo, setProjectInfo] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [trustedFormCertUrl, setTrustedFormCertUrl] = useState('');
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    state.trim().length > 0 &&
    zip.trim().length > 0 &&
    timeframe.length > 0 &&
    projectInfo.trim().length > 0 &&
    agreedToTerms;

  const handleSubmit = () => {
    if (!canSubmit) {
      showAlert({
        title: 'Quote Request',
        message: 'Please fill in all required fields.',
        variant: 'error',
      });
      return;
    }

    if (!trustedFormCertUrl) {
      setPendingSubmit(true);
      showAlert({
        title: 'Quote Request',
        message: 'Generating TrustedForm certificate…',
        variant: 'info',
      });

      // Ask the hidden WebView to fire a submit event so TrustedForm can populate cert_url.
      trustedFormRef.current?.certify();
      return;
    }

    // Trigger reCAPTCHA
    recaptchaRef.current?.open();
  };

  const onRecaptchaVerify = async (token: string) => {
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        service_type_id: serviceTypeId,
        main_category_id: mainCategoryId,
        category_id: categoryId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        timeframe,
        project_info: projectInfo.trim(),
        terms_and_condition: '',
        cptcha_token: token,
        signup_url: SIGNUP_URL,
        cert_url: trustedFormCertUrl,
      };

      const endpoint = leadEndpoint === 'generalleadv1'
        ? servicesEndpoints.generalLeadV1()
        : servicesEndpoints.memberLeadBySlug();

      if (endpoint === servicesEndpoints.memberLeadBySlug()) {
        body.member_slugs = (memberSlugs ?? []).join(',');
      }

      console.log('[QuoteRequest] POST body:', body);
      const response = await apiRequest<{ message?: string }>({
        method: 'POST',
        path: endpoint,
        body,
      });

      console.log('[QuoteRequest] response:', response);

      if (response.success) {
        showAlert({
          title: 'Quote Request',
          message: 'Your quote request has been submitted successfully!',
          variant: 'success',
          primaryText: 'OK',
          onPrimaryPress: () => navigation.navigate('Home'),
        });
      } else {
        showAlert({
          title: 'Quote Request',
          message: response.message ?? 'Failed to submit quote request.',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('[QuoteRequest] error:', error);
      showAlert({
        title: 'Quote Request',
        message: 'An error occurred. Please try again.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onRecaptchaError = (error: unknown) => {
    console.error('[QuoteRequest] reCAPTCHA error:', error);
    try {
      console.error('[QuoteRequest] reCAPTCHA error (stringified):', JSON.stringify(error));
    } catch {
      // ignore
    }
    showAlert({
      title: 'Quote Request',
      message: 'reCAPTCHA verification failed. Please try again.',
      variant: 'error',
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
          <View style={styles.topBar}>
            <Image
              source={require('../../components/assets/images/mainlogo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="TrustPatrick Referral Network"
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <User color={colors.brand} size={20} />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <Search color={colors.mutedText} size={20} />
            <Text style={styles.searchPlaceholder}>Search {serviceTitle}</Text>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact  Information</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <TextField
                  label="Full name"
                  placeholder="Jane"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.col}>
                <TextField
                  label="Last name"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.iconInputRow}>
                <Mail color={colors.mutedText} size={20} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Jane.doe@example.com"
                  placeholderTextColor={colors.mutedText}
                  style={styles.iconInput}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <View style={styles.iconInputRow}>
                <Phone color={colors.mutedText} size={20} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="(555) 000-0000"
                  placeholderTextColor={colors.mutedText}
                  style={styles.iconInput}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.inputLabel}>Street address</Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="123 Main St"
                  placeholderTextColor={colors.mutedText}
                  style={styles.plainInput}
                />
              </View>
            </View>

            <View style={styles.row3}>
              <View style={styles.col3city}>
                <TextField label="City" placeholder="City" value={city} onChangeText={setCity} />
              </View>
              <View style={styles.col3state}>
                <Text style={styles.inputLabel}>State</Text>
                <View style={styles.stateInputWrap}>
                  <TextInput
                    value={state}
                    onChangeText={setState}
                    placeholder="CA"
                    placeholderTextColor={colors.mutedText}
                    style={styles.stateInput}
                  />
                  <ChevronDown color={colors.mutedText} size={20} />
                </View>
              </View>
              <View style={styles.col3zip}>
                <TextField
                  label="Zip Code"
                  placeholder="10001"
                  value={zip}
                  onChangeText={setZip}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Project Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Details</Text>

            <View style={styles.block}>
              <Text style={styles.inputLabel}>Timeframe</Text>
              <Pressable
                style={styles.selectRow}
                onPress={() => setShowTimeframePicker(!showTimeframePicker)}
              >
                <Calendar color={colors.mutedText} size={20} />
                <Text
                  style={[styles.selectText, !timeframe && styles.selectPlaceholder]}
                  numberOfLines={1}
                >
                  {timeframe || 'When do you need this done?'}
                </Text>
                <ChevronDown color={colors.mutedText} size={20} />
              </Pressable>

              {showTimeframePicker && (
                <View style={styles.pickerDropdown}>
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      style={styles.pickerOption}
                      onPress={() => {
                        setTimeframe(option);
                        setShowTimeframePicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          timeframe === option && styles.pickerOptionSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.block}>
              <Text style={styles.inputLabel}>Project Description</Text>
              <TextInput
                value={projectInfo}
                onChangeText={setProjectInfo}
                placeholder="Describe the damage or project requirements (e.g. potholes, resurfacing)...."
                placeholderTextColor={colors.mutedText}
                style={styles.textArea}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Pressable
              style={styles.termsRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreedToTerms }}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Check color={colors.surface} size={14} />}
              </View>
              <Text style={styles.termsText}>
                I agree to <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </Pressable>
          </View>

          <View style={styles.ctaWrap}>
            <Button
              title="Submit"
              loading={submitting}
              disabled={!canSubmit || submitting}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </ScrollView>

      <Recaptcha
        ref={recaptchaRef}
        siteKey={RECAPTCHA_SITE_KEY}
        baseUrl={RECAPTCHA_BASE_URL}
        onLoad={() => console.log('[QuoteRequest] reCAPTCHA loaded')}
        onVerify={onRecaptchaVerify}
        onError={onRecaptchaError}
        size="invisible"
        enterprise={false}
        webViewProps={{
          javaScriptEnabled: true,
          domStorageEnabled: true,
          originWhitelist: ['*'],
        }}
      />

      <TrustedFormCertCapture
        ref={trustedFormRef}
        baseUrl={TRUSTEDFORM_BASE_URL}
        onCertUrl={(url) => {
          console.log('[QuoteRequest] TrustedForm cert_url:', url);
          setTrustedFormCertUrl(url);

          if (pendingSubmit) {
            setPendingSubmit(false);
            recaptchaRef.current?.open();
          }
        }}
        onError={(e) => {
          console.error('[QuoteRequest] TrustedForm error:', e);

          if (pendingSubmit) {
            setPendingSubmit(false);
            showAlert({
              title: 'Quote Request',
              message: 'TrustedForm certificate could not be generated. Please try again.',
              variant: 'error',
            });
          }
        }}
      />

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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLogo: {
    width: 180,
    height: 44,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    height: 54,
    marginBottom: spacing.lg,
  },
  searchPlaceholder: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 18,
    fontFamily: typography.fonts.semiBold,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.brand,
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
  row3: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  col3city: {
    flex: 2,
  },
  col3state: {
    flex: 1.2,
  },
  col3zip: {
    flex: 1.5,
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
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    height: 54,
  },
  iconInput: {
    flex: 1,
    color: colors.brand,
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
    paddingVertical: 0,
  },
  inputRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    height: 54,
    justifyContent: 'center',
  },
  plainInput: {
    color: colors.brand,
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
    paddingVertical: 0,
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
    height: 54,
  },
  stateInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontFamily: typography.fonts.regular,
    paddingVertical: 0,
    paddingRight: spacing.md,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    height: 54,
  },
  selectText: {
    flex: 1,
    color: colors.brand,
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
  },
  selectPlaceholder: {
    color: colors.mutedText,
  },
  pickerDropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: typography.fonts.regular,
  },
  pickerOptionSelected: {
    color: colors.brand,
    fontFamily: typography.fonts.bold,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
    fontFamily: typography.fonts.regular,
    minHeight: 120,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  termsText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontFamily: typography.fonts.regular,
    lineHeight: 22,
  },
  termsLink: {
    color: colors.brand,
    fontFamily: typography.fonts.bold,
  },
  ctaWrap: {
    marginTop: spacing.lg,
  },
});
