import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Check, Mail, MapPin, Pencil, Phone } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootStackParamList } from '../../navigation/types';
import { useIsTablet } from '../../utils/layout';
import { authActions } from '../../store/slices/authSlice';
import { AppAlertModal } from '../../components/ui/AppAlertModal';
import { useAppAlert } from '../../components/ui/useAppAlert';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isTablet = useIsTablet();
  const contentMaxWidth = useMemo(() => (isTablet ? 720 : undefined), [isTablet]);

  const { alertProps, show: showAlert } = useAppAlert();

  const initials = useMemo(() => {
    const a = user?.first_name?.trim()?.[0] ?? '';
    const b = user?.last_name?.trim()?.[0] ?? '';
    const raw = `${a}${b}`.trim();
    return raw.length ? raw.toUpperCase() : 'U';
  }, [user?.first_name, user?.last_name]);

  const fullName = useMemo(() => {
    const first = user?.first_name?.trim() ?? '';
    const last = user?.last_name?.trim() ?? '';
    const name = `${first} ${last}`.trim();
    return name.length ? name : 'User';
  }, [user?.first_name, user?.last_name]);

  const userIdLabel = user?.user_id ? `User ID: #${user.user_id}` : 'User ID: —';

  const addressLineTop = useMemo(() => {
    const line1 = user?.address_line_1?.trim() ?? '';
    const state = user?.state?.trim() ?? '';
    const zip = user?.zip?.trim() ?? '';

    const right = [state, zip].filter(Boolean).join(' ');
    const left = line1;

    const combined = [left, right].filter(Boolean).join(', ');
    return combined.length ? combined : '—';
  }, [user?.address_line_1, user?.state, user?.zip]);

  const addressLineBottom = useMemo(() => {
    const city = user?.city?.trim() ?? '';
    return city.length ? city : '—';
  }, [user?.city]);

  const memberSince = useMemo(() => formatDateLong(user?.created_at), [user?.created_at]);
  const lastLogin = useMemo(() => formatDateShort(user?.last_login_at), [user?.last_login_at]);

  const onLogout = () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      variant: 'info',
      primaryText: 'Logout',
      secondaryText: 'Cancel',
      onPrimaryPress: () => {
        dispatch(authActions.signOut());
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={[styles.headerContent, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => navigation.goBack()}
              style={styles.headerIconButton}
            >
              <ArrowLeft color={colors.surface} size={20} />
            </Pressable>

            <Text style={styles.headerTitle}>Profile</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit"
              style={styles.headerIconButton}
              onPress={() => navigation.navigate('UpdateProfile')}
            >
              <Pencil color={colors.surface} size={20} />
            </Pressable>
          </View>

          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>

            {user?.email_verified ? (
              <View style={styles.verifiedBadge}>
                <View style={styles.verifiedBadgeInner}>
                  <Check color={colors.surface} size={12} />
                </View>
              </View>
            ) : null}
          </View>

          <Text style={styles.name}>{fullName}</Text>

          <View style={styles.userIdPill}>
            <View style={styles.userIdIconWrap}>
              <View style={styles.userIdIconHead} />
              <View style={styles.userIdIconBody} />
            </View>
            <Text style={styles.userIdText}>{userIdLabel}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.sheet, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <Mail color={colors.brand} size={20} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Email address</Text>
              <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
            </View>

            {user?.email_verified ? (
              <Text style={styles.verifiedText}>Verified</Text>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Verify email"
                onPress={() =>
                  navigation.navigate('Auth', {
                    screen: 'VerifyEmail',
                    params: { email: user?.email ?? undefined },
                  })
                }
                hitSlop={10}
              >
                <Text style={styles.verifyLink}>Verify</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <Phone color={colors.brand} size={20} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Phone number</Text>
              <Text style={styles.infoValue}>{user?.phone ?? '—'}</Text>
            </View>

            {user?.phone_verified ? (
              <Text style={styles.verifiedText}>Verified</Text>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Verify phone"
                onPress={() =>
                  navigation.navigate('Auth', {
                    screen: 'VerifyPhone',
                    params: { phone: user?.phone ?? undefined },
                  })
                }
                hitSlop={10}
              >
                <Text style={styles.verifyLink}>Verify</Text>
              </Pressable>
            )}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Address</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <MapPin color={colors.brand} size={20} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoValue}>{addressLineTop}</Text>
              <Text style={styles.infoSubValue}>{addressLineBottom}</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Account Details</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>{memberSince}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Login</Text>
              <Text style={styles.detailValue}>{lastLogin}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable accessibilityRole="button" style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>

            <Pressable accessibilityRole="button" style={styles.primaryButton}>
              <Text style={styles.primaryText}>Change Password</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <AppAlertModal {...alertProps} />
    </SafeAreaView>
  );
}

function formatDateLong(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return value.split('T')[0] ?? '—';
  }
}

function formatDateShort(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return value.split('T')[0] ?? '—';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.brand,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  headerContent: {
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.surface,
    fontSize: 20,
    fontFamily: typography.fonts.semiBold,
  },
  avatarWrap: {
    marginTop: spacing.xl,
    alignSelf: 'center',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.brand,
    fontSize: 32,
    fontFamily: typography.fonts.black,
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.surface,
    fontSize: 26,
    fontFamily: typography.fonts.black,
  },
  userIdPill: {
    marginTop: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
  },
  userIdIconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  userIdIconHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  userIdIconBody: {
    marginTop: 3,
    width: 14,
    height: 8,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.surface,
  },
  userIdText: {
    color: colors.surface,
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  sheet: {
    marginTop: -28,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.xxl,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    color: colors.brand,
    fontSize: 18,
    fontFamily: typography.fonts.bold,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: {
    flex: 1,
  },
  infoLabel: {
    color: colors.mutedText,
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.brand,
    fontSize: 16,
    fontFamily: typography.fonts.bold,
  },
  infoSubValue: {
    color: colors.mutedText,
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    marginTop: 2,
  },
  verifiedText: {
    color: colors.mutedText,
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
  },
  verifyLink: {
    color: colors.link,
    fontSize: 14,
    fontFamily: typography.fonts.black,
  },
  detailCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: colors.mutedText,
    fontSize: 15,
    fontFamily: typography.fonts.regular,
  },
  detailValue: {
    color: colors.brand,
    fontSize: 16,
    fontFamily: typography.fonts.bold,
  },
  actionsRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    gap: spacing.lg,
  },
  logoutButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontFamily: typography.fonts.bold,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  primaryText: {
    color: colors.surface,
    fontSize: 16,
    fontFamily: typography.fonts.bold,
  },
});
