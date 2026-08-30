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
}

type FilterTabKey = 'INDUSTRY' | 'EDUCATION' | 'EXPERIENCE' | 'LOCATION' | 'TRADE';

export const CandidatesScreen: React.FC<CandidatesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [candidates, setCandidates] = useState<ExtendedCandidate[]>([]);
  const searchInputRef = React.useRef<any>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

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

  // Open modal and initialize draft state
  const handleOpenFilterModal = (defaultTab: FilterTabKey = 'INDUSTRY') => {
    setDraftIndustry(activeIndustryFilter);
    setDraftEducation(activeEducationFilter);
    setDraftExp(activeExpFilter);
    setDraftLocation(activeLocationFilter);
    setDraftTrade(activeTradeFilter);
    setActiveFilterTab(defaultTab);
    setFilterModalVisible(true);
  };

  // Apply draft filters from modal
  const handleApplyDraftFilters = () => {
    setActiveIndustryFilter(draftIndustry);
    setActiveEducationFilter(draftEducation);
    setActiveExpFilter(draftExp);
    setActiveLocationFilter(draftLocation);
    setActiveTradeFilter(draftTrade);
    setFilterModalVisible(false);
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
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const tradeMatch = (item.trade_specialization || '').toLowerCase().includes(query);
        const locationMatch = (item.location || '').toLowerCase().includes(query);
        const indMatch = (item.industry || '').toLowerCase().includes(query);
        const eduMatch = safeString(item.education).toLowerCase().includes(query);
        const skillMatch = Array.isArray(item.skills) && item.skills.some((s) => s.toLowerCase().includes(query));
        if (!nameMatch && !titleMatch && !tradeMatch && !locationMatch && !skillMatch && !indMatch && !eduMatch) {
          return false;
        }
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
    searchQuery,
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
      <Header title="JobMarket" subtitle="Browse Candidates" showBack={false} />

      {/* Search Bar + Filter Section */}
      <View style={styles.searchBarWrapper}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => searchInputRef.current?.focus()}
          style={[
            styles.searchBarContainer,
            (isSearchFocused || !!searchQuery) && styles.searchBarContainerActive,
          ]}
        >
          <Search size={14} color={isSearchFocused ? COLORS.primary : '#91A0BA'} style={{ marginRight: 8 }} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={CANDIDATE_SEARCH_SUGGESTIONS[suggestionIndex]}
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            numberOfLines={1}
            multiline={false}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4, marginRight: 2 }}>
              <X size={14} color="#91A0BA" />
            </TouchableOpacity>
          ) : null}

          <View style={styles.inlineFilterDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenFilterModal('INDUSTRY')}
            style={styles.inlineFilterBtnIconOnly}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal size={15} color={hasActiveFilters ? COLORS.primary : '#657796'} />
            {hasActiveFilters ? (
              <View style={styles.inlineFilterBadgeNumber}>
                <Text style={styles.inlineFilterBadgeNumberText}>{activeFiltersCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Quick Filter Horizontal Chips Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPillsScrollContent}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleOpenFilterModal('INDUSTRY')}
            style={[styles.allFiltersTriggerBtn, hasActiveFilters && styles.allFiltersTriggerBtnActive]}
          >
            <SlidersHorizontal size={12} color={hasActiveFilters ? '#FFFFFF' : COLORS.primary} />
            <Text style={[styles.allFiltersTriggerBtnText, hasActiveFilters && styles.allFiltersTriggerBtnTextActive]}>
              Filters {hasActiveFilters ? `(${activeFiltersCount})` : ''}
            </Text>
          </TouchableOpacity>

          {quickPillOptions.map((pill, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={pill.onPress}
              style={[styles.quickFilterChip, pill.active && styles.quickFilterChipActive]}
            >
              <Text style={[styles.quickFilterChipText, pill.active && styles.quickFilterChipTextActive]}>
                {pill.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
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

      {/* Comprehensive Candidate Filter Sheet Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.sheetOverlayBottom}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
          <View
            style={[
              styles.cleanIosSheetCard,
              { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom + 16, 24) : Math.max(insets.bottom + 12, 20) },
            ]}
          >
            {/* Grab Handle */}
            <View style={styles.sheetGrabHandle} />

            {/* Header */}
            <View style={styles.sheetHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.sheetTitleText}>FILTER CANDIDATES</Text>
                {draftMatchingCount > 0 ? (
                  <View style={styles.sheetMatchesPill}>
                    <Text style={styles.sheetMatchesPillText}>{draftMatchingCount} available</Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Category Navigation Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabsScroll}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveFilterTab('INDUSTRY')}
                style={[styles.categoryTabItem, activeFilterTab === 'INDUSTRY' && styles.categoryTabItemActive]}
              >
                <Building2 size={12} color={activeFilterTab === 'INDUSTRY' ? COLORS.primary : '#64748B'} />
                <Text style={[styles.categoryTabItemText, activeFilterTab === 'INDUSTRY' && styles.categoryTabItemTextActive]}>
                  Industry {draftIndustry ? '•' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveFilterTab('EDUCATION')}
                style={[styles.categoryTabItem, activeFilterTab === 'EDUCATION' && styles.categoryTabItemActive]}
              >
                <GraduationCap size={12} color={activeFilterTab === 'EDUCATION' ? COLORS.primary : '#64748B'} />
                <Text style={[styles.categoryTabItemText, activeFilterTab === 'EDUCATION' && styles.categoryTabItemTextActive]}>
                  Education {draftEducation ? '•' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveFilterTab('EXPERIENCE')}
                style={[styles.categoryTabItem, activeFilterTab === 'EXPERIENCE' && styles.categoryTabItemActive]}
              >
                <Briefcase size={12} color={activeFilterTab === 'EXPERIENCE' ? COLORS.primary : '#64748B'} />
                <Text style={[styles.categoryTabItemText, activeFilterTab === 'EXPERIENCE' && styles.categoryTabItemTextActive]}>
                  Experience {draftExp ? '•' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveFilterTab('LOCATION')}
                style={[styles.categoryTabItem, activeFilterTab === 'LOCATION' && styles.categoryTabItemActive]}
              >
                <MapPin size={12} color={activeFilterTab === 'LOCATION' ? COLORS.primary : '#64748B'} />
                <Text style={[styles.categoryTabItemText, activeFilterTab === 'LOCATION' && styles.categoryTabItemTextActive]}>
                  Location {draftLocation ? '•' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveFilterTab('TRADE')}
                style={[styles.categoryTabItem, activeFilterTab === 'TRADE' && styles.categoryTabItemActive]}
              >
                <Wrench size={12} color={activeFilterTab === 'TRADE' ? COLORS.primary : '#64748B'} />
                <Text style={[styles.categoryTabItemText, activeFilterTab === 'TRADE' && styles.categoryTabItemTextActive]}>
                  Trade {draftTrade ? '•' : ''}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.sectionSeparatorStandard} />

            {/* Filter Options Content Area */}
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {/* 1. INDUSTRY SECTORS */}
              {activeFilterTab === 'INDUSTRY' && (
                <View style={styles.filterSectionBlock}>
                  <Text style={styles.filterSectionTitle}>INDUSTRY SECTOR</Text>
                  <Text style={styles.filterSectionSub}>
                    Select an industry to find verified workers from that manufacturing or technical domain
                  </Text>
                  <View style={styles.filterOptionsGrid}>
                    {INDUSTRY_FILTER_OPTIONS.map((ind) => {
                      const isSelected = ind === 'All Industries' ? !draftIndustry : draftIndustry === ind;
                      return (
                        <TouchableOpacity
                          key={ind}
                          activeOpacity={0.8}
                          onPress={() => setDraftIndustry(ind === 'All Industries' ? null : isSelected ? null : ind)}
                          style={[styles.filterChip, isSelected && styles.filterChipActive]}
                        >
                          {isSelected && ind !== 'All Industries' ? (
                            <Check size={12} color={COLORS.primary} strokeWidth={2.5} />
                          ) : null}
                          <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                            {ind}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* 2. EDUCATION LEVEL */}
              {activeFilterTab === 'EDUCATION' && (
                <View style={styles.filterSectionBlock}>
                  <Text style={styles.filterSectionTitle}>EDUCATION QUALIFICATION</Text>
                  <Text style={styles.filterSectionSub}>
                    Filter by candidate educational background, trade certifications, or degrees
                  </Text>
                  <View style={styles.filterOptionsGrid}>
                    {EDUCATION_FILTER_OPTIONS.map((edu) => {
                      const isSelected = edu === 'All Education Levels' ? !draftEducation : draftEducation === edu;
                      return (
                        <TouchableOpacity
                          key={edu}
                          activeOpacity={0.8}
                          onPress={() => setDraftEducation(edu === 'All Education Levels' ? null : isSelected ? null : edu)}
                          style={[styles.filterChip, isSelected && styles.filterChipActive]}
                        >
                          {isSelected && edu !== 'All Education Levels' ? (
                            <Check size={12} color={COLORS.primary} strokeWidth={2.5} />
                          ) : null}
                          <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                            {edu}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* 3. EXPERIENCE / FRESHERS */}
              {activeFilterTab === 'EXPERIENCE' && (
                <View style={styles.filterSectionBlock}>
                  <Text style={styles.filterSectionTitle}>WORK EXPERIENCE & FRESHERS</Text>
                  <Text style={styles.filterSectionSub}>
                    Select minimum years of experience or filter for fresh industrial talent
                  </Text>
                  <View style={styles.filterOptionsGrid}>
                    {EXPERIENCE_FILTER_OPTIONS.map((exp) => {
                      const isSelected = exp === 'All Experience' ? !draftExp : draftExp === exp;
                      return (
                        <TouchableOpacity
                          key={exp}
                          activeOpacity={0.8}
                          onPress={() => setDraftExp(exp === 'All Experience' ? null : isSelected ? null : exp)}
                          style={[styles.filterChip, isSelected && styles.filterChipActive]}
                        >
                          {isSelected && exp !== 'All Experience' ? (
                            <Check size={12} color={COLORS.primary} strokeWidth={2.5} />
                          ) : null}
                          <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                            {exp}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* 4. LOCATION / MIDC ZONES */}
              {activeFilterTab === 'LOCATION' && (
                <View style={styles.filterSectionBlock}>
                  <Text style={styles.filterSectionTitle}>LOCATION & INDUSTRIAL ZONES</Text>
                  <Text style={styles.filterSectionSub}>
                    Find local candidates living near industrial belts and factory zones
                  </Text>
                  <View style={styles.filterOptionsGrid}>
                    {LOCATION_FILTER_OPTIONS.map((loc) => {
                      const isSelected = loc === 'All Locations' ? !draftLocation : draftLocation === loc;
                      return (
                        <TouchableOpacity
                          key={loc}
                          activeOpacity={0.8}
                          onPress={() => setDraftLocation(loc === 'All Locations' ? null : isSelected ? null : loc)}
                          style={[styles.filterChip, isSelected && styles.filterChipActive]}
                        >
                          {isSelected && loc !== 'All Locations' ? (
                            <Check size={12} color={COLORS.primary} strokeWidth={2.5} />
                          ) : null}
                          <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                            {loc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* 5. TRADE SPECIALIZATION */}
              {activeFilterTab === 'TRADE' && (
                <View style={styles.filterSectionBlock}>
                  <Text style={styles.filterSectionTitle}>TRADE & ROLE SPECIALIZATION</Text>
                  <Text style={styles.filterSectionSub}>
                    Target specific machine operation, fabrication, or technician skills
                  </Text>
                  <View style={styles.filterOptionsGrid}>
                    {TRADE_FILTER_OPTIONS.map((tr) => {
                      const isSelected = tr === 'All Trades' ? !draftTrade : draftTrade === tr;
                      return (
                        <TouchableOpacity
                          key={tr}
                          activeOpacity={0.8}
                          onPress={() => setDraftTrade(tr === 'All Trades' ? null : isSelected ? null : tr)}
                          style={[styles.filterChip, isSelected && styles.filterChipActive]}
                        >
                          {isSelected && tr !== 'All Trades' ? (
                            <Check size={12} color={COLORS.primary} strokeWidth={2.5} />
                          ) : null}
                          <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                            {tr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={styles.sheetActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleResetDraftFilters}
                style={styles.sheetResetBtn}
              >
                <RotateCcw size={13} color="#657796" />
                <Text style={styles.sheetResetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleApplyDraftFilters}
                style={styles.sheetApplyBtn}
              >
                <Text style={styles.sheetApplyText}>
                  Show {draftMatchingCount} Candidate{draftMatchingCount === 1 ? '' : 's'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchBarContainerActive: {
    borderColor: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#102A5C',
  },
  inlineFilterDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  inlineFilterBtnIconOnly: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inlineFilterBadgeNumber: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
  sheetOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  cleanIosSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    paddingHorizontal: 16,
    paddingTop: 10,
    width: '100%',
    maxHeight: '82%',
  },
  sheetGrabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  sheetTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#102A5C',
    letterSpacing: -0.2,
  },
  sheetMatchesPill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sheetMatchesPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  categoryTabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  categoryTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryTabItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  categoryTabItemText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTabItemTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  sectionSeparatorStandard: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  filterSectionBlock: {
    paddingVertical: 6,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  filterSectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 15,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    paddingHorizontal: 10,
    paddingVertical: 6.5,
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#475569',
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sheetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sheetResetBtn: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
  },
  sheetResetText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#657796',
  },
  sheetApplyBtn: {
    flex: 2,
    height: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.card,
  },
  sheetApplyText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

