import { COLORS } from '../../constants/theme';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Briefcase,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { Job } from '../../types';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';
import { JobFilterSideDrawer, FilterOptions } from '../../components/common/JobFilterSideDrawer';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import { CandidateJobCardItem } from './components/CandidateJobCardItem';
import { CandidateJobSearchFilterHeader } from './components/CandidateJobSearchFilterHeader';
import { savedJobsStore } from '../../utils/savedJobsStore';
import { matchJobAgainstKeyword, getCleanSearchTerm } from './utils/jobMatchUtils';

const FALLBACK_JOBS: Job[] = [];

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateJobSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(savedJobsStore.getSavedIds());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setSavedJobIds(savedJobsStore.getSavedIds());
    const unsubscribe = savedJobsStore.subscribe(() => {
      setSavedJobIds(savedJobsStore.getSavedIds());
    });
    return () => {
      unsubscribe();
    };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState('All Jobs');
  const [activeSelectedJobId, setActiveSelectedJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    industry: 'All Industries',
    jobType: 'All Types',
    workMode: 'All Modes',
    minExperience: 'All Experience',
    salaryMin: 0,
    midcZone: 'All MIDC Zones',
    busFacility: false,
    canteen: false,
    accommodation: false,
    overtime: false,
  });

  const SEARCH_PLACEHOLDERS = ['Search jobs...', 'Search trades...', 'Search locations...'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (!route?.params) return;
    const { keyword, location, industry, education, homeFilters, rawFilterTitle } = route.params;

    if (homeFilters) {
      setActiveFilters(homeFilters);
    }
    if (keyword) {
      setSearchQuery(getCleanSearchTerm(keyword));
    } else if (rawFilterTitle) {
      setSearchQuery(getCleanSearchTerm(rawFilterTitle));
    }
    if (location) {
      setActiveFilters((prev) => ({ ...prev, midcZone: location }));
    }
    if (industry) {
      setActiveFilters((prev) => ({ ...prev, industry }));
    }
    if (education && !keyword) {
      const cleanEdu = getCleanSearchTerm(education);
      setSearchQuery(cleanEdu);
    }
  }, [route?.params]);

  const matchedSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    const matchedJobs = jobs.filter((j) => {
      if (!trimmed) return false;
      const titleMatch = (j.title || '').toLowerCase().includes(trimmed);
      const companyMatch = (j.company || '').toLowerCase().includes(trimmed);
      const industryMatch = (j.industry || '').toLowerCase().includes(trimmed);
      const tradeMatch = (j.trade || '').toLowerCase().includes(trimmed);
      const skillsMatch = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(trimmed));
      return titleMatch || companyMatch || industryMatch || tradeMatch || skillsMatch;
    }).slice(0, 4);

    const popularTrades = [
      'VMC Operator',
      'CNC Machinist',
      'Fitter',
      'Electrician',
      'Quality Inspector',
      'Welder',
      'Tool & Die Maker',
      'Assembly Operator',
      'Turner',
      'Maintenance Technician',
    ];
    const matchedTrades = popularTrades.filter((t) => !trimmed || t.toLowerCase().includes(trimmed)).slice(0, trimmed ? 3 : 5);

    const defaultMIDCs = [
      'Waluj MIDC, Chhatrapati Sambhajinagar',
      'Chakan MIDC, Pune',
      'Bhosari MIDC, Pune',
      'Taloja MIDC, Navi Mumbai',
      'Thane Belapur MIDC',
      'Ranjangaon MIDC',
      'Pimpri Industrial Zone',
    ];
    const jobLocations = jobs.map((j) => j.location).filter(Boolean);
    const allLocations = Array.from(new Set([...defaultMIDCs, ...jobLocations]));
    const matchedLocations = allLocations.filter((l) => trimmed && l.toLowerCase().includes(trimmed)).slice(0, 3);

    return {
      jobs: matchedJobs,
      trades: matchedTrades,
      locations: matchedLocations,
    };
  }, [searchQuery, jobs]);

  const refreshOffsetRef = useRef(0);

  const ensureJobLogos = (rawJobs: Job[]): Job[] => {
    return (rawJobs || []).map((j) => {
      const rawLogo = j.companyLogo || (j as any).company_logo || (j as any).logoUrl || (j as any).logo_url || (j as any).logo;
      const finalLogo = getCompanyLogoUrl(j.company || 'Industrial Partner', rawLogo);
      return {
        ...j,
        companyLogo: finalLogo,
        company_logo: finalLogo,
      };
    });
  };

  const loadJobsData = useCallback(async (isRefresh: boolean = false) => {
    try {
      const [jobsRes, savedRes] = await Promise.all([
        candidateApi.getAllJobs(),
        candidateApi.getSavedJobs().catch(() => ({ success: false, data: [] })),
      ]);

      if (jobsRes.success && jobsRes.data) {
        const rawJobs = ensureJobLogos(jobsRes.data || []);
        if (isRefresh && rawJobs.length > 0) {
          refreshOffsetRef.current = (refreshOffsetRef.current + 3) % rawJobs.length;
        }
        const offset = refreshOffsetRef.current;
        const rotated = rawJobs.length > 0 ? [...rawJobs.slice(offset), ...rawJobs.slice(0, offset)] : rawJobs;
        setJobs(rotated);
      } else {
        const rawJobs = ensureJobLogos(FALLBACK_JOBS);
        if (isRefresh && rawJobs.length > 0) {
          refreshOffsetRef.current = (refreshOffsetRef.current + 3) % rawJobs.length;
        }
        const offset = refreshOffsetRef.current;
        const rotated = rawJobs.length > 0 ? [...rawJobs.slice(offset), ...rawJobs.slice(0, offset)] : rawJobs;
        setJobs(rotated);
      }

      if (savedRes.success && savedRes.data) {
        savedJobsStore.setSavedJobs(savedRes.data);
        setSavedJobIds(savedJobsStore.getSavedIds());
      }
    } catch (err) {
      setJobs(ensureJobLogos(FALLBACK_JOBS));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJobsData(false);
    }, [loadJobsData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadJobsData(true);
  }, [loadJobsData]);

  const handleToggleSave = useCallback((jobId: string) => {
    const foundJob = jobs.find((j) => String(j.id) === String(jobId));
    savedJobsStore.toggleSave(foundJob || jobId).then((isSaved) => {
      if (isSaved) {
        showToast('Job saved to bookmarks!', 'success');
      } else {
        showToast('Job removed from bookmarks', 'info');
      }
    });
  }, [jobs, showToast]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Text Search Query Match (Intelligent domain matching)
      if (debouncedSearchQuery.trim()) {
        const matchesQuery = matchJobAgainstKeyword(job, debouncedSearchQuery);
        if (!matchesQuery) return false;
      }

      // 2. Category Match
      const catMatch =
        selectedCategory === 'All Jobs' ||
        (job.trade && job.trade.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (job.industry && job.industry.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (job.title && job.title.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (selectedCategory === 'HR Jobs' && (job.title.includes('HR') || job.industry.includes('HR'))) ||
        (selectedCategory === 'Marketing Jobs' && (job.title.includes('Marketing') || job.industry.includes('Marketing'))) ||
        (selectedCategory === 'ITI & Trade Jobs' && (job.title.includes('Welder') || job.title.includes('Wireman') || job.title.includes('CNC') || job.title.includes('Fitter'))) ||
        (selectedCategory === 'Healthcare' && (job.title.includes('Nurse') || job.industry.includes('Healthcare')));

      if (!catMatch) return false;

      // 3. Industry Filter Match (Smart Token & Stemming Match)
      if (activeFilters.industry && activeFilters.industry !== 'All Industries') {
        const rawInd = activeFilters.industry.toLowerCase().trim();
        const jobInd = (job.industry || '').toLowerCase();
        const jobTitle = (job.title || '').toLowerCase();
        const jobTrade = (job.trade || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();

        const directMatch = jobInd.includes(rawInd) || rawInd.includes(jobInd);
        const indTokens = rawInd
          .split(/[\s&,/()]+/)
          .map((t) => t.replace(/(s|ing|als|ics)$/, ''))
          .filter((t) => t.length >= 2);

        const matchesInd =
          directMatch ||
          indTokens.length === 0 ||
          indTokens.some(
            (t) => jobInd.includes(t) || jobTitle.includes(t) || jobTrade.includes(t) || jobDesc.includes(t)
          );

        if (!matchesInd) return false;
      }

      // 4. Education Filter Match
      if (activeFilters.education && activeFilters.education !== 'All Education Levels') {
        const matchesEdu = matchJobAgainstKeyword(job, activeFilters.education);
        if (!matchesEdu) return false;
      }

      // 5. MIDC Zone Filter Match (Token Matching)
      if (activeFilters.midcZone && activeFilters.midcZone !== 'All MIDC Zones') {
        const rawZone = activeFilters.midcZone.toLowerCase();
        const zoneTokens = rawZone.replace(/\s*\([^)]*\)/g, '').split(/[\s,/-]+/).filter((t) => t.length > 2 && t !== 'midc' && t !== 'zone');
        const jobLoc = (job.location || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();

        const matchesZone = zoneTokens.length === 0 || zoneTokens.some(
          (t) => jobLoc.includes(t) || jobDesc.includes(t)
        );

        if (!matchesZone) return false;
      }

      // 6. Job Type Filter Match
      if (activeFilters.jobType && activeFilters.jobType !== 'All Types') {
        const typeKey = activeFilters.jobType.toLowerCase();
        const jType = (job.job_type || (job as any).jobType || '').toLowerCase();
        if (!jType.includes(typeKey)) return false;
      }

      // 7. Work Mode Filter Match
      if (activeFilters.workMode && activeFilters.workMode !== 'All Modes') {
        const modeKey = activeFilters.workMode.toLowerCase();
        const jMode = (job.work_mode || (job as any).workMode || '').toLowerCase();
        if (!jMode.includes(modeKey)) return false;
      }

      // 8. Amenities Filters
      if (activeFilters.busFacility && !(job.bus_facility || (job as any).busFacility || (job.perks || []).includes('Bus Transport'))) return false;
      if (activeFilters.canteen && !(job.canteen || (job as any).canteen || (job.perks || []).includes('Free Canteen'))) return false;

      return true;
    });
  }, [jobs, searchQuery, selectedCategory, activeFilters]);

  const getMatchingCountForDraft = useCallback(
    (draftFilters: FilterOptions) => {
      const q = searchQuery.toLowerCase().trim();
      return jobs.filter((job) => {
        if (q) {
          const matchesQuery = matchJobAgainstKeyword(job, q);
          if (!matchesQuery) return false;
        }

        const catMatch =
          selectedCategory === 'All Jobs' ||
          (job.trade && job.trade.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (job.industry && job.industry.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (job.title && job.title.toLowerCase().includes(selectedCategory.toLowerCase()));

        if (!catMatch) return false;

        if (draftFilters.industry && draftFilters.industry !== 'All Industries') {
          const rawInd = draftFilters.industry.toLowerCase().trim();
          const jobInd = (job.industry || '').toLowerCase();
          const jobTitle = (job.title || '').toLowerCase();
          const jobTrade = (job.trade || '').toLowerCase();
          const jobDesc = (job.description || '').toLowerCase();

          const directMatch = jobInd.includes(rawInd) || rawInd.includes(jobInd);
          const indTokens = rawInd
            .split(/[\s&,/()]+/)
            .map((t: string) => t.replace(/(s|ing|als|ics)$/, ''))
            .filter((t: string) => t.length >= 2);

          const matchesInd =
            directMatch ||
            indTokens.length === 0 ||
            indTokens.some((t: string) => jobInd.includes(t) || jobTitle.includes(t) || jobTrade.includes(t) || jobDesc.includes(t));

          if (!matchesInd) return false;
        }

        if (draftFilters.education && draftFilters.education !== 'All Education Levels') {
          const matchesEdu = matchJobAgainstKeyword(job, draftFilters.education);
          if (!matchesEdu) return false;
        }

        if (draftFilters.midcZone && draftFilters.midcZone !== 'All MIDC Zones') {
          const rawZone = draftFilters.midcZone.toLowerCase();
          const zoneTokens = rawZone.replace(/\s*\([^)]*\)/g, '').split(/[\s,/-]+/).filter((t: string) => t.length > 2 && t !== 'midc' && t !== 'zone');
          const jobLoc = (job.location || '').toLowerCase();
          const matchesZone = zoneTokens.length === 0 || zoneTokens.some((t: string) => jobLoc.includes(t));
          if (!matchesZone) return false;
        }

        return true;
      }).length;
    },
    [jobs, searchQuery, selectedCategory]
  );

  const activeFilterCount = useMemo(() => {
    return [
      activeFilters.industry !== 'All Industries',
      activeFilters.education !== 'All Education Levels',
      activeFilters.midcZone !== 'All MIDC Zones',
      activeFilters.jobType !== 'All Types',
      activeFilters.workMode !== 'All Modes',
      activeFilters.minExperience !== 'All Experience',
      activeFilters.busFacility,
      activeFilters.canteen,
      activeFilters.accommodation,
      activeFilters.overtime,
    ].filter(Boolean).length;
  }, [activeFilters]);

  const handleOpenFilterDrawer = useCallback(() => {
    navigation.navigate('JobFilter', {
      currentFilters: activeFilters,
      totalMatchingJobsCount: filteredJobs.length,
      onApplyFilters: (applied: any) => {
        setActiveFilters(applied);
      },
      onResetFilters: () => {
        setActiveFilters({
          industry: 'All Industries',
          jobType: 'All Types',
          workMode: 'All Modes',
          minExperience: 'All Experience',
          salaryMin: 0,
          midcZone: 'All MIDC Zones',
          busFacility: false,
          canteen: false,
          accommodation: false,
          overtime: false,
        });
      },
    });
  }, [navigation, activeFilters, filteredJobs.length]);

  return (
    <View style={styles.container}>
      <Header
        searchPlaceholder={searchQuery ? searchQuery : 'Search Jobs, Skills, Companies...'}
        onSearchPress={() => {
          navigation.navigate('CandidateGlobalSearch', { initialQuery: searchQuery });
        }}
        showBack={false}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleOpenFilterDrawer}
            style={styles.headerFilterBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal
              size={18}
              color={activeFilterCount > 0 ? COLORS.primary : '#475569'}
              strokeWidth={2.2}
            />
            {activeFilterCount > 0 && (
              <View style={styles.headerFilterBadge}>
                <Text style={styles.headerFilterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <CandidateJobSearchFilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholders={SEARCH_PLACEHOLDERS}
        placeholderIndex={placeholderIndex}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        isInputFocused={isInputFocused}
        setIsInputFocused={setIsInputFocused}
        matchedSuggestions={matchedSuggestions}
        onOpenFilterDrawer={handleOpenFilterDrawer}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        navigation={navigation}
      />

      <FlatList
        data={loading ? [] : filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item: job }) => (
          <CandidateJobCardItem
            key={job.id}
            job={job}
            viewMode={viewMode}
            isSaved={savedJobIds.includes(job.id)}
            onToggleSave={() => handleToggleSave(job.id)}
            onPress={() =>
              navigation.navigate('CandidateJobsTab', {
                screen: 'CandidateJobDetail',
                params: { jobId: job.id, job },
              })
            }
          />
        )}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <View style={styles.resultsInfoRow}>
            <Text style={styles.resultsCountText}>
              Showing <Text style={{ fontWeight: '800', color: COLORS.primary }}>{filteredJobs.length}</Text> active vacancies
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 12 }}>
              <SkeletonLoader width="100%" height={160} style={{ borderRadius: 8 }} />
              <SkeletonLoader width="100%" height={160} style={{ borderRadius: 8 }} />
            </View>
          ) : (
            <View style={styles.emptyStateBox}>
              <Briefcase size={32} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No matching job vacancies</Text>
              <Text style={styles.emptySub}>Try clearing filters or search term to see more listings.</Text>
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Jobs');
                  setActiveFilters({
                    industry: 'All Industries',
                    jobType: 'All Types',
                    workMode: 'All Modes',
                    minExperience: 'All Experience',
                    salaryMin: 0,
                    midcZone: 'All MIDC Zones',
                    busFacility: false,
                    canteen: false,
                    accommodation: false,
                    overtime: false,
                  });
                }}
              >
                <Text style={styles.resetFilterBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 32 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  resultsInfoRow: {
    marginBottom: 10,
  },
  resultsCountText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  resetFilterBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 14,
  },
  resetFilterBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridContainer: {
    gap: 12,
  },
  listContainer: {
    gap: 8,
  },
  headerFilterBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerFilterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerFilterBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
});
