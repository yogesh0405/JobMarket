import { COLORS } from '../../constants/theme';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Briefcase,
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

const FALLBACK_JOBS: Job[] = [];

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateJobSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Jobs');
  const [activeSelectedJobId, setActiveSelectedJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(15);
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
    const { keyword, location, industry, education, homeFilters } = route.params;

    if (homeFilters) {
      setActiveFilters(homeFilters);
    }
    if (keyword) {
      setSearchQuery(keyword);
    }
    if (location) {
      setActiveFilters((prev) => ({ ...prev, midcZone: location }));
    }
    if (industry) {
      setActiveFilters((prev) => ({ ...prev, industry }));
    }
    if (education && !keyword) {
      const cleanEdu = education.replace(/\s*\([^)]*\)/g, '').trim();
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
        const savedIds = (savedRes.data || []).map((j: any) => j.id);
        setSavedJobIds(savedIds);
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
    setVisibleCount(15);
    loadJobsData(true);
  }, [loadJobsData]);

  const handleToggleSave = useCallback((jobId: string) => {
    setSavedJobIds((prev) => {
      const isSaved = prev.includes(jobId);
      if (isSaved) {
        showToast('Job removed !', 'info');
        return prev.filter((id) => id !== jobId);
      } else {
        showToast('Job saved !', 'success');
        return [...prev, jobId];
      }
    });

    candidateApi.toggleSaveJob(jobId).catch(() => {});
  }, [showToast]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Text Search Query Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (job.title || '').toLowerCase();
        const company = (job.company || '').toLowerCase();
        const location = (job.location || '').toLowerCase();
        const trade = (job.trade || '').toLowerCase();
        const industry = (job.industry || '').toLowerCase();
        const desc = (job.description || '').toLowerCase();
        const skills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';

        const matchesQuery =
          title.includes(q) ||
          company.includes(q) ||
          location.includes(q) ||
          trade.includes(q) ||
          industry.includes(q) ||
          desc.includes(q) ||
          skills.includes(q);

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

      // 3. Industry Filter Match (Token Matching)
      if (activeFilters.industry && activeFilters.industry !== 'All Industries') {
        const rawInd = activeFilters.industry.toLowerCase();
        const indTokens = rawInd.split(/[\s&,/()]+/).filter((t) => t.length > 3);
        const jobInd = (job.industry || '').toLowerCase();
        const jobTitle = (job.title || '').toLowerCase();
        const jobTrade = (job.trade || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();

        const matchesInd = indTokens.length === 0 || indTokens.some(
          (t) => jobInd.includes(t) || jobTitle.includes(t) || jobTrade.includes(t) || jobDesc.includes(t)
        );

        if (!matchesInd) return false;
      }

      // 4. MIDC Zone Filter Match (Token Matching)
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

      // 5. Job Type Filter Match
      if (activeFilters.jobType && activeFilters.jobType !== 'All Types') {
        const typeKey = activeFilters.jobType.toLowerCase();
        const jType = (job.job_type || (job as any).jobType || '').toLowerCase();
        if (!jType.includes(typeKey)) return false;
      }

      // 6. Work Mode Filter Match
      if (activeFilters.workMode && activeFilters.workMode !== 'All Modes') {
        const modeKey = activeFilters.workMode.toLowerCase();
        const jMode = (job.work_mode || (job as any).workMode || '').toLowerCase();
        if (!jMode.includes(modeKey)) return false;
      }

      // 7. Amenities Filters
      if (activeFilters.busFacility && !(job.bus_facility || (job as any).busFacility || (job.perks || []).includes('Bus Transport'))) return false;
      if (activeFilters.canteen && !(job.canteen || (job as any).canteen || (job.perks || []).includes('Free Canteen'))) return false;

      return true;
    });
  }, [jobs, searchQuery, selectedCategory, activeFilters]);

  const getMatchingCountForDraft = useCallback(
    (draftFilters: FilterOptions) => {
      return jobs.filter((job) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const title = (job.title || '').toLowerCase();
          const company = (job.company || '').toLowerCase();
          const location = (job.location || '').toLowerCase();
          const trade = (job.trade || '').toLowerCase();
          const industry = (job.industry || '').toLowerCase();
          const desc = (job.description || '').toLowerCase();
          const matchesQuery = title.includes(q) || company.includes(q) || location.includes(q) || trade.includes(q) || industry.includes(q) || desc.includes(q);
          if (!matchesQuery) return false;
        }

        const catMatch =
          selectedCategory === 'All Jobs' ||
          (job.trade && job.trade.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (job.industry && job.industry.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (job.title && job.title.toLowerCase().includes(selectedCategory.toLowerCase()));

        if (!catMatch) return false;

        if (draftFilters.industry && draftFilters.industry !== 'All Industries') {
          const rawInd = draftFilters.industry.toLowerCase();
          const indTokens = rawInd.split(/[\s&,/()]+/).filter((t) => t.length > 3);
          const jobInd = (job.industry || '').toLowerCase();
          const jobTitle = (job.title || '').toLowerCase();
          const matchesInd = indTokens.length === 0 || indTokens.some((t) => jobInd.includes(t) || jobTitle.includes(t));
          if (!matchesInd) return false;
        }

        if (draftFilters.midcZone && draftFilters.midcZone !== 'All MIDC Zones') {
          const rawZone = draftFilters.midcZone.toLowerCase();
          const zoneTokens = rawZone.replace(/\s*\([^)]*\)/g, '').split(/[\s,/-]+/).filter((t) => t.length > 2 && t !== 'midc' && t !== 'zone');
          const jobLoc = (job.location || '').toLowerCase();
          const matchesZone = zoneTokens.length === 0 || zoneTokens.some((t) => jobLoc.includes(t));
          if (!matchesZone) return false;
        }

        return true;
      }).length;
    },
    [jobs, searchQuery, selectedCategory]
  );

  const displayedJobs = filteredJobs.slice(0, visibleCount);

  const handleLoadMore = () => {
    if (displayedJobs.length < filteredJobs.length && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + 15);
        setLoadingMore(false);
      }, 400);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Browse Industrial Vacancies" subtitle="Find factory, trade & engineering jobs" showBack={false} />

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
        onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.resultsInfoRow}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={{ fontWeight: '800', color: COLORS.primary }}>{filteredJobs.length}</Text> active vacancies
          </Text>
        </View>

        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonLoader width="100%" height={160} style={{ borderRadius: 8 }} />
            <SkeletonLoader width="100%" height={160} style={{ borderRadius: 8 }} />
          </View>
        ) : filteredJobs.length === 0 ? (
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
        ) : (
          <View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
            {displayedJobs.map((job) => (
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
            ))}
          </View>
        )}

        {displayedJobs.length < filteredJobs.length && !loading ? (
          <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.8} onPress={handleLoadMore}>
            {loadingMore ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Text style={styles.loadMoreText}>Load More Jobs ({filteredJobs.length - displayedJobs.length} remaining)</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <JobFilterSideDrawer
        visible={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        currentFilters={activeFilters}
        onApplyFilters={(applied) => {
          setActiveFilters(applied);
          setFilterDrawerOpen(false);
        }}
        onResetFilters={() =>
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
          })
        }
        totalMatchingJobsCount={filteredJobs.length}
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
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  resetFilterBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 14,
  },
  resetFilterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridContainer: {
    gap: 12,
  },
  listContainer: {
    gap: 8,
  },
  loadMoreBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
