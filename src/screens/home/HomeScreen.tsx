import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiRequest } from '../../api/client';
import { servicesEndpoints } from '../../api/endpoints';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/types';

type ServiceCategory = { id: number; title: string };

type Service = {
  id: number;
  title: string;
  sc_code: string;
  abbr: string;
  service_category_type: ServiceCategory;
  main_category: ServiceCategory;
  top_level_category: ServiceCategory;
};

type SearchServicesData = {
  services: Service[];
  total_count: number;
};

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const requestSeq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q.length) {
      setResults([]);
      setLoading(false);
      return;
    }

    const currentRequest = ++requestSeq.current;
    setLoading(true);

    const handle = setTimeout(() => {
      (async () => {
        const response = await apiRequest<SearchServicesData>({
          method: 'GET',
          path: servicesEndpoints.searchServices(q, 10),
        });

        if (currentRequest !== requestSeq.current) return;

        if (!response.success) {
          setResults([]);
          setLoading(false);
          return;
        }

        setResults(response.data.services ?? []);
        setLoading(false);
      })().catch(() => {
        if (currentRequest !== requestSeq.current) return;
        setResults([]);
        setLoading(false);
      });
    }, 250);

    return () => clearTimeout(handle);
  }, [query]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.listContent, results.length === 0 ? styles.listContentEmpty : null]}
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
              <View style={styles.searchIcon}>
                <View style={styles.searchIconCircle} />
                <View style={styles.searchIconHandle} />
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search"
                placeholderTextColor={colors.mutedText}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {loading ? <Text style={styles.loadingText}>Searching…</Text> : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyCard}>
                <Image
                  source={require('../../components/assets/images/homeicon.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                  accessibilityRole="image"
                  accessibilityLabel="Home"
                />
                <Text style={styles.emptyText}>Please Find Asphalt Driveway Experts</Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('ContractorList', {
                scCode: item.sc_code,
                serviceTitle: item.title,
                serviceTypeId: item.service_category_type?.id ?? 1,
                mainCategoryId: item.main_category?.id ?? 1,
                categoryId: item.top_level_category?.id ?? 0,
              })
            }
            accessibilityRole="button"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.title.trim().slice(0, 1).toUpperCase()}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.title}</Text>

              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Top: </Text>
                <Text style={styles.metaValue}>{item.top_level_category?.title}</Text>
              </Text>

              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Main: </Text>
                <Text style={styles.metaValue}>{item.main_category?.title}</Text>
              </Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
      />
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
  listContentEmpty: {
    flexGrow: 1,
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
  profileIconOuter: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileIconHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.brand,
  },
  profileIconBody: {
    marginTop: 3,
    width: 16,
    height: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.brand,
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
  searchIcon: {
    width: 20,
    height: 20,
  },
  searchIconCircle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.mutedText,
  },
  searchIconHandle: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 8,
    height: 2,
    backgroundColor: colors.mutedText,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
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
  emptyWrap: {
    flex: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyCard: {
    flex: 1,
    minHeight: 420,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.mutedText,
    fontSize: 20,
    fontFamily: typography.fonts.black,
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontFamily: typography.fonts.black,
  },
  metaRow: {
    color: colors.mutedText,
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
  },
  metaLabel: {
    color: colors.mutedText,
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
  },
  metaValue: {
    color: colors.brand,
    fontSize: 16,
    fontFamily: typography.fonts.black,
  },
});
