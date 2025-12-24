import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, User, Star, Search } from 'lucide-react-native';
import { apiRequest } from '../../api/client';
import { servicesEndpoints } from '../../api/endpoints';
import { BASE_URL } from '../../api/baseUrl';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useIsTablet } from '../../utils/layout';
import { Button } from '../../components/ui/Button';
import { AppAlertModal } from '../../components/ui/AppAlertModal';
import { useAppAlert } from '../../components/ui/useAppAlert';
import { useAppSelector } from '../../store/hooks';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ContractorListRouteProp = RouteProp<RootStackParamList, 'ContractorList'>;

type CompanyRating = {
  average_ratings: number | null;
  total_reviews: number;
};

type Company = {
  id: number;
  slug: string;
  name: string;
  logo: string | null;
  telephone: string | null;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  rating: CompanyRating;
  review: string | null;
  background_check_date: string | null;
  recent_screening_date: string | null;
  initials: string;
  priority: number;
  service_categories?: Array<{
    type_id: number;
    main_category_id: number;
    key: number;
    value: string;
  }>;
};

type FeaturedExpertsData = {
  totalcount: number;
  company_details: Company[];
};

const MAX_DISPLAY = 6;
const MAX_SELECT = 3;

export function ContractorListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ContractorListRouteProp>();
  const isFocused = useIsFocused();
  const isTablet = useIsTablet();
  const contentMaxWidth = useMemo(() => (isTablet ? 720 : undefined), [isTablet]);

  const { alertProps, show: showAlert } = useAppAlert();

  const user = useAppSelector((s) => s.auth.user);

  const { scCode, serviceTitle, serviceTypeId, mainCategoryId, categoryId } = route.params;
  const userZip = user?.zip ?? '';

  const [contractors, setContractors] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [didPromptNoContractors, setDidPromptNoContractors] = useState(false);

  useEffect(() => {
    if (!scCode || !userZip) {
      console.log('[featured_experts] missing params', {
        scCode,
        userZip,
        userState: user?.state,
      });
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);

      const path = servicesEndpoints.featuredExperts([scCode], [userZip]);
      console.log('[featured_experts] GET', `${BASE_URL}${path}`);
      console.log('[featured_experts] params', { scCode, userZip });

      const response = await apiRequest<FeaturedExpertsData>({
        method: 'GET',
        path,
      });

      console.log('[featured_experts] response.success', response.success);
      if (!response.success) {
        console.log('[featured_experts] error', { message: response.message, data: response.data });
      } else {
        console.log('[featured_experts] totalcount', response.data?.totalcount);
        console.log('[featured_experts] company_details.length', response.data?.company_details?.length);
      }

      if (response.success && response.data?.company_details) {
        setContractors(response.data.company_details.slice(0, MAX_DISPLAY));
      } else {
        setContractors([]);
      }
      setLoading(false);
    })().catch(() => {
      console.log('[featured_experts] request failed (exception)');
      setContractors([]);
      setLoading(false);
    });
  }, [scCode, userZip]);

  useEffect(() => {
    if (!isFocused) return;
    if (loading) return;
    if (didPromptNoContractors) return;
    if (contractors.length > 0) return;

    console.log('[featured_experts] no contractors -> prompt general lead');
    setDidPromptNoContractors(true);

    const timer = setTimeout(() => {
      showAlert({
        title: 'No contractors found',
        message: 'No contractor found in your area would you like to search on other service?',
        variant: 'info',
        primaryText: 'Yes',
        secondaryText: 'No',
        onPrimaryPress: () => {
          navigation.navigate('QuoteRequest', {
            memberSlugs: [],
            serviceTypeId,
            mainCategoryId,
            categoryId,
            serviceTitle,
            leadEndpoint: 'generalleadv1',
          });
        },
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [categoryId, contractors, didPromptNoContractors, isFocused, loading, mainCategoryId, navigation, serviceTitle, serviceTypeId, showAlert]);

  const filteredContractors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contractors;
    return contractors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [contractors, searchQuery]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= MAX_SELECT) {
        showAlert({
          title: 'Selection Limit',
          message: `You can select up to ${MAX_SELECT} contractors.`,
          variant: 'error',
        });
        return prev;
      }
      return [...prev, id];
    });
  }, [showAlert]);

  const onGetQuote = () => {
    if (!loading && contractors.length === 0) {
      showAlert({
        title: 'No contractors found',
        message: 'No contractor found in your area would you like to search on other service?',
        variant: 'info',
        primaryText: 'Yes',
        secondaryText: 'No',
        onPrimaryPress: () => {
          navigation.navigate('QuoteRequest', {
            memberSlugs: [],
            serviceTypeId,
            mainCategoryId,
            categoryId,
            serviceTitle,
            leadEndpoint: 'generalleadv1',
          });
        },
      });
      return;
    }

    if (selectedIds.length === 0) {
      showAlert({
        title: 'Get A Quote',
        message: 'Please select at least one contractor.',
        variant: 'error',
      });
      return;
    }
    const selected = contractors.filter((c) => selectedIds.includes(c.id));
    const slugs = selected.map((c) => c.slug);

    // Get service category info from first selected contractor
    const firstContractor = selected[0];
    const firstServiceCat = firstContractor.service_categories?.[0];

    navigation.navigate('QuoteRequest', {
      memberSlugs: slugs,
      serviceTypeId: firstServiceCat?.type_id ?? 1,
      mainCategoryId: firstServiceCat?.main_category_id ?? 1,
      categoryId: firstServiceCat?.key ?? 0,
      serviceTitle,
      leadEndpoint: 'memberleadbyslug',
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: Company }) => {
      const isSelected = selectedIds.includes(item.id);
      const googleRating = item.rating?.average_ratings ?? null;
      const tpRating = item.rating?.total_reviews ? 5.0 : null; // placeholder

      return (
        <Pressable
          style={[styles.card, isSelected && styles.cardSelected]}
          onPress={() => toggleSelection(item.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
        >
          <View style={styles.cardHeader}>
            {item.logo ? (
              <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={styles.initialsWrap}>
                <Text style={styles.initialsText}>{item.initials}</Text>
              </View>
            )}

            <View style={styles.cardHeaderBody}>
              <Text style={styles.companyName}>{item.name}</Text>
              <Text style={styles.address}>
                {item.address} {item.city}, {item.state} {item.zipcode}
              </Text>
            </View>
          </View>

          <View style={styles.ratingsRow}>
            {googleRating !== null ? (
              <View style={styles.ratingBadge}>
                <Image
                  source={{ uri: 'https://www.google.com/favicon.ico' }}
                  style={styles.ratingIcon}
                />
                <Star color="#FBBF24" size={14} fill="#FBBF24" />
                <Text style={styles.ratingText}>{googleRating.toFixed(1)}</Text>
              </View>
            ) : null}

            <View style={styles.ratingBadgeTp}>
              <View style={styles.tpIcon}>
                <Text style={styles.tpIconText}>T</Text>
              </View>
              <Star color="#FBBF24" size={14} fill="#FBBF24" />
              <Text style={styles.ratingText}>
                {tpRating !== null ? `${tpRating.toFixed(1)} Customer review` : 'No reviews'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {item.review ? (
            <Text style={styles.reviewText} numberOfLines={3}>
              {item.review}
            </Text>
          ) : null}

          <View style={styles.datesRow}>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Most Recent Screening:</Text>
              <Text style={styles.dateValue}>{item.recent_screening_date ?? '—'}</Text>
            </View>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Most Recent Background Check:</Text>
              <Text style={styles.dateValue}>{item.background_check_date ?? '—'}</Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [selectedIds, toggleSelection]
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={filteredContractors}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : null,
        ]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerBlock}>
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
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`Search ${serviceTitle}`}
                placeholderTextColor={colors.mutedText}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {loading ? <Text style={styles.loadingText}>Loading contractors…</Text> : null}

            {!loading && filteredContractors.length === 0 ? (
              <Text style={styles.emptyText}>No contractors found for your area.</Text>
            ) : null}
          </View>
        }
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <View style={styles.ctaWrap}>
        <Button
          title="Get A Quote"
          disabled={loading || (contractors.length > 0 && selectedIds.length === 0)}
          onPress={onGetQuote}
        />
      </View>
      <AppAlertModal {...alertProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerBlock: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontFamily: typography.fonts.semiBold,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 14,
    fontFamily: typography.fonts.regular,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 16,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
  },
  cardSelected: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
  },
  initialsWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: colors.mutedText,
    fontSize: 18,
    fontFamily: typography.fonts.black,
  },
  cardHeaderBody: {
    flex: 1,
    gap: spacing.xs,
  },
  companyName: {
    color: colors.text,
    fontSize: 18,
    fontFamily: typography.fonts.bold,
  },
  address: {
    color: colors.mutedText,
    fontSize: 14,
    fontFamily: typography.fonts.regular,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  ratingBadgeTp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  ratingIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  tpIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tpIconText: {
    color: colors.surface,
    fontSize: 12,
    fontFamily: typography.fonts.bold,
  },
  ratingText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: typography.fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  reviewText: {
    color: colors.text,
    fontSize: 15,
    fontFamily: typography.fonts.regular,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    marginBottom: 4,
  },
  dateValue: {
    color: colors.brand,
    fontSize: 16,
    fontFamily: typography.fonts.bold,
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },
});
