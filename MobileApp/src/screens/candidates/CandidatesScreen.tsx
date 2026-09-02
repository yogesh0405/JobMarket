import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Search,
  X,
  SlidersHorizontal,
  Check,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Wrench,
  RotateCcw,
} from 'lucide-react-native';
import { apiFetch } from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import {
  ExtendedCandidate,
  CANDIDATE_SEARCH_SUGGESTIONS,
  SEED_CANDIDATES,
  safeString,
  INDUSTRY_FILTER_OPTIONS,
  EDUCATION_FILTER_OPTIONS,
  EXPERIENCE_FILTER_OPTIONS,
  LOCATION_FILTER_OPTIONS,
  TRADE_FILTER_OPTIONS,
  matchesIndustry,
  matchesEducation,
  matchesExperience,
  matchesLocation,
  matchesTrade,
} from './components/CandidatesUtils';
import { CandidateCardItem } from './components/CandidateCardItem';

interface CandidatesScreenProps {
  navigation?: any;
  route?: any;
}

type FilterTabKey = 'INDUSTRY' | 'EDUCATION' | 'EXPERIENCE' | 'LOCATION' | 'TRADE';

export const CandidatesScreen: React.FC<CandidatesScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [candidates, setCandidates] = useState<ExtendedCandidate[]>([]);
  const searchInputRef = React.useRef<any>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    if (route?.params?.appliedSearchQuery !== undefined) {
      setSearchQuery(route.params.appliedSearchQuery);
    }
  }, [route?.params?.appliedSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active filters applied to the candidate list
  const [activeIndustryFilter, setActiveIndustryFilter] = useState<string | null>(null);
  const [activeEducationFilter, setActiveEducationFilter] = useState<string | null>(null);
  const [activeExpFilter, setActiveExpFilter] = useState<string | null>(null);
  const [activeLocationFilter, setActiveLocationFilter] = useState<string | null>(null);
  const [activeTradeFilter, setActiveTradeFilter] = useState<string | null>(null);

  // Modal draft filters
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTabKey>('INDUSTRY');
  const [draftIndustry, setDraftIndustry] = useState<string | null>(null);
  const [draftEducation, setDraftEducation] = useState<string | null>(null);
  const [draftExp, setDraftExp] = useState<string | null>(null);
  const [draftLocation, setDraftLocation] = useState<string | null>(null);
  const [draftTrade, setDraftTrade] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#FFFFFF', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(false);
      }
    }, [])
  );

  const fetchCandidates = async () => {
    setError(null);
    try {
      let rawList: any[] = [];
      const res1 = await apiFetch('/api/v1/jobs/workers/all').catch(() => null);
      if (res1 && res1.success && Array.isArray(res1.data) && res1.data.length > 0) {
        rawList = res1.data;
      } else {
        const res2 = await apiFetch('/api/candidates').catch(() => null);
        if (res2 && res2.success && Array.isArray(res2.data) && res2.data.length > 0) {
          rawList = res2.data;
        }
      }

      if (rawList.length > 0) {
        const formatted: ExtendedCandidate[] = rawList.map((item: any, idx: number) => {
          const rawExperience = item.experience_details || item.experience;
          const rawEducation = item.education_details || item.education;
          const expYears = typeof item.experience === 'number' ? `${item.experience} Years` : safeString(item.experience, '2 Years');
          const fallbackPhoto = SEED_CANDIDATES[idx % SEED_CANDIDATES.length]?.avatarUrl;
          const photo =
            item.profilePictureUrl ||
            item.profile_picture_url ||
            item.avatarUrl ||
            item.avatar_url ||
            item.avatar ||
            item.photo ||
            item.image ||
            fallbackPhoto;
          const resumeRaw =
            item.resume_url ||
            item.resumeUrl ||
            item.resume ||
            item.user?.resume_url ||
            item.user?.resumeUrl ||
            item.user?.resume;
          const resolvedResume =
            typeof resumeRaw === 'string'
              ? resumeRaw
              : resumeRaw && typeof resumeRaw === 'object'
              ? resumeRaw.url || resumeRaw.fileUrl || resumeRaw.uri || ''
              : '';

          return {
            ...item,
            id: item.id || `candidate-${idx}`,
            name: safeString(item.name, 'Industrial Candidate'),
            email: safeString(item.email, ''),
            phone: safeString(item.phone, ''),
            role: 'candidate',
            avatarUrl: photo,
            profile_picture_url: photo,
            headline: safeString(item.headline || item.title, 'Skilled Factory Technician'),
            title: safeString(item.title || item.headline, 'Machine Operator'),
            trade_specialization: safeString(item.tradeSpecialization || item.trade_specialization, 'CNC / VMC Machinist'),
            industry: safeString(item.industry || item.sector, 'Industrial & Heavy Manufacturing'),
            location: safeString(item.location, 'Waluj MIDC, Chhatrapati Sambhajinagar'),
            skills: Array.isArray(item.skills) && item.skills.length > 0 ? item.skills : ['CNC Operating', 'Machine Maintenance', 'Shop Safety'],
            experience: rawExperience ?? expYears,
            experience_years: typeof item.experience === 'number' ? item.experience : (typeof item.experience_years === 'number' ? item.experience_years : undefined),
            education: rawEducation ?? safeString(item.education, 'ITI Certified'),
            aadhaar_verified: item.aadhaarVerified ?? item.aadhaar_verified ?? true,
            verified: true,
            preferred_shift: safeString(item.preferredShift || item.preferred_shift, 'Day Shift'),
            notice_period: safeString(item.noticePeriod || item.notice_period, 'Immediate'),
            bio: typeof item.bio === 'string' ? item.bio : (typeof item.about === 'string' ? item.about : ''),
            resume_url: resolvedResume,
            resumeUrl: resolvedResume,
            resume: typeof resumeRaw === 'object' ? resumeRaw : resolvedResume,
            user: item.user || item,
          };
        });
        setCandidates(formatted);
      } else {
        setCandidates(SEED_CANDIDATES);
      }
    } catch (err: any) {
      setCandidates(SEED_CANDIDATES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  // Open filter screen directly as a new page
  const handleOpenFilterModal = (defaultTab: FilterTabKey = 'INDUSTRY') => {
    navigation.navigate('CandidateFilter', {
      initialFilters: {
        industry: activeIndustryFilter,
        education: activeEducationFilter,
        exp: activeExpFilter,
        location: activeLocationFilter,
        trade: activeTradeFilter,
      },
      defaultTab,
      totalCount: candidates.length,
      onApply: (applied: any) => {
        setActiveIndustryFilter(applied.industry);
        setActiveEducationFilter(applied.education);
        setActiveExpFilter(applied.exp);
        setActiveLocationFilter(applied.location);
        setActiveTradeFilter(applied.trade);
      },
    });
  };

  // Reset draft filters inside modal
  const handleResetDraftFilters = () => {
    setDraftIndustry(null);
    setDraftEducation(null);
    setDraftExp(null);
    setDraftLocation(null);
    setDraftTrade(null);
  };

  // Reset all active filters
  const handleResetAllFilters = () => {
    setSearchQuery('');
    setActiveIndustryFilter(null);
    setActiveEducationFilter(null);
    setActiveExpFilter(null);
    setActiveLocationFilter(null);
    setActiveTradeFilter(null);
    handleResetDraftFilters();
  };

  // Calculate live matching count inside modal for draft state
  const draftMatchingCount = useMemo(() => {
    return candidates.filter((item) => {
      if (!matchesIndustry(item, draftIndustry)) return false;
      if (!matchesEducation(item, draftEducation)) return false;
      if (!matchesExperience(item, draftExp)) return false;
      if (!matchesLocation(item, draftLocation)) return false;
      if (!matchesTrade(item, draftTrade)) return false;
      return true;
    }).length;
  }, [candidates, draftIndustry, draftEducation, draftExp, draftLocation, draftTrade]);

  // Main filtered list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      const query = debouncedSearchQuery.trim().toLowerCase();
      if (query) {
        const tokens = query.split(/[\s,+/&|]+/).filter((t) => t.length > 0);
        const name = (item.name || '').toLowerCase();
        const title = (item.title || item.headline || '').toLowerCase();
        const trade = (item.trade_specialization || '').toLowerCase();
        const location = (item.location || (item as any).city || (item as any).state || (item as any).midc_zone || '').toLowerCase();
        const ind = (item.industry || '').toLowerCase();
        const edu = safeString(item.education).toLowerCase();
        const skills = Array.isArray(item.skills) ? item.skills.join(' ').toLowerCase() : '';
        const bio = (item.bio || '').toLowerCase();
        const combined = `${name} ${title} ${trade} ${location} ${ind} ${edu} ${skills} ${bio}`;

        const matches = tokens.every((token) => combined.includes(token));
        if (!matches) return false;
      }

      if (!matchesIndustry(item, activeIndustryFilter)) return false;
      if (!matchesEducation(item, activeEducationFilter)) return false;
      if (!matchesExperience(item, activeExpFilter)) return false;
      if (!matchesLocation(item, activeLocationFilter)) return false;
      if (!matchesTrade(item, activeTradeFilter)) return false;

      return true;
    });
  }, [
    candidates,
    debouncedSearchQuery,
    activeIndustryFilter,
    activeEducationFilter,
    activeExpFilter,
    activeLocationFilter,
    activeTradeFilter,
  ]);

  const activeFiltersCount =
    (activeIndustryFilter ? 1 : 0) +
    (activeEducationFilter ? 1 : 0) +
    (activeExpFilter ? 1 : 0) +
    (activeLocationFilter ? 1 : 0) +
    (activeTradeFilter ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleSelectCandidate = (candidate: ExtendedCandidate) => {
    if (navigation?.navigate) {
      navigation.navigate('EmployerCandidateDetail', { candidate });
    }
  };

  // Quick preset bar data
  const quickPillOptions = [
    { label: 'All Candidates', active: !hasActiveFilters, onPress: handleResetAllFilters },
    {
      label: 'Freshers (0 Yrs)',
      active: activeExpFilter === 'Fresher (0 Yrs)',
      onPress: () => setActiveExpFilter(activeExpFilter === 'Fresher (0 Yrs)' ? null : 'Fresher (0 Yrs)'),
    },
    {
      label: '1-3 Yrs Exp',
      active: activeExpFilter === '1+ Years',
      onPress: () => setActiveExpFilter(activeExpFilter === '1+ Years' ? null : '1+ Years'),
    },
    {
      label: 'Automotive',
      active: activeIndustryFilter === 'Automotive & Auto Components',
      onPress: () => setActiveIndustryFilter(activeIndustryFilter === 'Automotive & Auto Components' ? null : 'Automotive & Auto Components'),
    },
    {
      label: 'Manufacturing',
      active: activeIndustryFilter === 'Industrial & Heavy Manufacturing',
      onPress: () => setActiveIndustryFilter(activeIndustryFilter === 'Industrial & Heavy Manufacturing' ? null : 'Industrial & Heavy Manufacturing'),
    },
    {
      label: 'Electronics',
      active: activeIndustryFilter === 'Electronics & Electricals',
      onPress: () => setActiveIndustryFilter(activeIndustryFilter === 'Electronics & Electricals' ? null : 'Electronics & Electricals'),
    },
    {
      label: 'ITI Certified',
      active: activeEducationFilter === 'ITI / Trade Certified',
      onPress: () => setActiveEducationFilter(activeEducationFilter === 'ITI / Trade Certified' ? null : 'ITI / Trade Certified'),
    },
    {
      label: 'Diploma',
      active: activeEducationFilter === 'Diploma / Polytechnic',
      onPress: () => setActiveEducationFilter(activeEducationFilter === 'Diploma / Polytechnic' ? null : 'Diploma / Polytechnic'),
    },
    {
      label: 'Waluj MIDC',
      active: activeLocationFilter === 'Waluj MIDC',
      onPress: () => setActiveLocationFilter(activeLocationFilter === 'Waluj MIDC' ? null : 'Waluj MIDC'),
    },
    {
      label: 'Shendra MIDC',
      active: activeLocationFilter === 'Shendra MIDC',
      onPress: () => setActiveLocationFilter(activeLocationFilter === 'Shendra MIDC' ? null : 'Shendra MIDC'),
    },
  ];

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <Header
        searchPlaceholder={CANDIDATE_SEARCH_SUGGESTIONS[suggestionIndex] || 'Search candidate name, skills, trade, zone...'}
        searchValue={searchQuery}
        onSearchPress={() => {
          navigation.navigate('CandidateSearch', { initialQuery: searchQuery });
        }}
        onClearSearch={() => {
          setSearchQuery('');
          setDebouncedSearchQuery('');
          handleResetAllFilters();
        }}
        showBack={false}
      />

      {/* Filter Action Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.filterRowContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenFilterModal('INDUSTRY')}
            style={[styles.filterActionButton, hasActiveFilters && styles.filterActionButtonActive]}
          >
            <SlidersHorizontal size={14} color={hasActiveFilters ? '#FFFFFF' : '#475569'} style={{ marginRight: 6 }} />
            <Text style={[styles.filterActionButtonText, hasActiveFilters && styles.filterActionButtonTextActive]}>
              Filters {hasActiveFilters ? `(${activeFiltersCount})` : ''}
            </Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingLeft: 4 }}>
            {quickPillOptions.map((chip, idx) => (
              <TouchableOpacity
                key={`chip-${idx}`}
                onPress={chip.onPress}
                activeOpacity={0.75}
                style={[styles.quickChip, chip.active && styles.quickChipActive]}
              >
                <Text style={[styles.quickChipText, chip.active && styles.quickChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Applied Filters Summary & Individual Clear Tags */}
        {hasActiveFilters ? (
          <View style={styles.activeTagsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {activeIndustryFilter ? (
                <View style={styles.activeFilterTag}>
                  <Building2 size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {activeIndustryFilter}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveIndustryFilter(null)}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {activeEducationFilter ? (
                <View style={styles.activeFilterTag}>
                  <GraduationCap size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {activeEducationFilter}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveEducationFilter(null)}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {activeExpFilter ? (
                <View style={styles.activeFilterTag}>
                  <Briefcase size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {activeExpFilter}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveExpFilter(null)}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {activeLocationFilter ? (
                <View style={styles.activeFilterTag}>
                  <MapPin size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {activeLocationFilter}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveLocationFilter(null)}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {activeTradeFilter ? (
                <View style={styles.activeFilterTag}>
                  <Wrench size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {activeTradeFilter}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveTradeFilter(null)}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              <TouchableOpacity onPress={handleResetAllFilters} style={styles.resetAllPill}>
                <RotateCcw size={10} color="#DC2626" />
                <Text style={styles.resetAllPillText}>Reset</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : null}

        {/* Results Count Line */}
        <View style={styles.searchResultsInfoRow}>
          <Text style={styles.searchResultsCountText}>
            Showing {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? '' : 's'}
          </Text>
          {searchQuery || hasActiveFilters ? (
            <TouchableOpacity onPress={handleResetAllFilters}>
              <Text style={styles.clearSearchText}>Clear All</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {error ? (
        <ErrorBanner message={error} onRetry={fetchCandidates} style={{ marginHorizontal: SPACING.lg }} />
      ) : null}

      {loading ? (
        <View style={{ padding: SPACING.lg }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : (
        <FlatList
          key="candidate-grid-2-col"
          numColumns={2}
          data={filteredCandidates}
          renderItem={({ item }) => (
            <CandidateCardItem item={item} onSelectCandidate={handleSelectCandidate} />
          )}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.gridColumnWrapper}
          contentContainerStyle={styles.gridListContentContainer}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={15}
          removeClippedSubviews={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateTitle}>No Matching Candidates</Text>
              <Text style={styles.emptyStateSub}>
                Try adjusting your industry, education, experience, or location filters to see more candidates.
              </Text>
              <TouchableOpacity style={styles.emptyResetBtn} onPress={handleResetAllFilters}>
                <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={<View style={{ height: 32 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  filterRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filterActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  filterActionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterActionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  filterActionButtonTextActive: {
    color: '#FFFFFF',
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  quickChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    paddingHorizontal: 12,
    height: 38,
  },
  inlineFilterBadgeNumberText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickPillsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 2,
  },
  allFiltersTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  allFiltersTriggerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  allFiltersTriggerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  allFiltersTriggerBtnTextActive: {
    color: '#FFFFFF',
  },
  quickFilterChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quickFilterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  quickFilterChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  quickFilterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  activeTagsRow: {
    marginTop: 6,
    marginBottom: 2,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.card,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    maxWidth: 200,
  },
  activeFilterTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.primary,
    flexShrink: 1,
  },
  resetAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.card,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  resetAllPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  searchResultsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  searchResultsCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#657796',
  },
  clearSearchText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  gridColumnWrapper: {
    gap: 10,
    marginBottom: 10,
  },
  gridListContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 130,
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  emptyResetBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyResetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullScreenFilterContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
    backgroundColor: '#FFFFFF',
  },
  drawerTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102A5C',
  },
  drawerMatchesPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.xs,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  drawerMatchesPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  drawerCategoryNavWrapper: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  drawerCategoryTabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  drawerCategoryTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  drawerCategoryTabItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  drawerCategoryTabItemText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#334155',
  },
  drawerCategoryTabItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  drawerOptionsScroll: {
    flex: 1,
  },
  drawerOptionsContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  drawerOptionsBlock: {
    gap: 4,
  },
  drawerOptionsSubHeader: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#657796',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  drawerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: RADIUS.card,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drawerOptionRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  drawerOptionText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#334155',
    flex: 1,
  },
  drawerOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  drawerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  drawerResetBtn: {
    height: 34,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
  },
  drawerResetText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#657796',
  },
  drawerApplyBtn: {
    flex: 1,
    height: 34,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.card,
  },
  drawerApplyText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

