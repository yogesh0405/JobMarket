import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { InteractiveJobMapView } from '../../components/map/InteractiveJobMapView';
import { JobFilterSideDrawer, FilterOptions } from '../../components/common/JobFilterSideDrawer';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { COLORS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  navigation: any;
  route: any;
}

const DEFAULT_MAP_FILTERS: FilterOptions = {
  industry: 'All Industries',
  education: 'All Education Levels',
  midcZone: 'All MIDC Zones',
  jobType: 'All Types',
  workMode: 'All Modes',
  minExperience: 'All Experience',
  salaryMin: 0,
  busFacility: false,
  canteen: false,
  accommodation: false,
  overtime: false,
};

export const CandidateJobMapViewScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const initialJobs: Job[] = route.params?.jobs || [];
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(initialJobs.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>(DEFAULT_MAP_FILTERS);

  // Animated Search Bar Placeholders (Exact match to CandidateJobSearchScreen)
  const SEARCH_PLACEHOLDERS = ['Search Jobs', 'Search Trades', 'Search Skills', 'Search Locations'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [SEARCH_PLACEHOLDERS.length]);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await candidateApi.getAllJobs();
      if (res.success && Array.isArray(res.data)) {
        setJobs(res.data);
      }
    } catch (e) {
      console.log('Error loading map view jobs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const activeFilterCount = useMemo(() => {
    return [
      activeFilters.industry !== 'All Industries',
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

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // 1. Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (j.title || '').toLowerCase();
        const company = (j.company || '').toLowerCase();
        const location = (j.location || '').toLowerCase();
        const industry = (j.industry || (j as any).category || '').toLowerCase();
        const matchesText = title.includes(q) || company.includes(q) || location.includes(q) || industry.includes(q);
        if (!matchesText) return false;
      }

      // 2. Industry Filter (Smart Matching)
      if (activeFilters.industry && activeFilters.industry !== 'All Industries' && activeFilters.industry !== 'All') {
        const rawInd = activeFilters.industry.toLowerCase().trim();
        const jobInd = (j.industry || (j as any).category || '').toLowerCase();
        const jobTitle = (j.title || '').toLowerCase();
        const jobTrade = (j.trade || '').toLowerCase();

        const directMatch = jobInd.includes(rawInd) || rawInd.includes(jobInd);
        const indTokens = rawInd
          .split(/[\s&,/()]+/)
          .map((t) => t.replace(/(s|ing|als|ics)$/, ''))
          .filter((t) => t.length >= 2);

        const matchesInd =
          directMatch ||
          indTokens.length === 0 ||
          indTokens.some((t) => jobInd.includes(t) || jobTitle.includes(t) || jobTrade.includes(t));

        if (!matchesInd) return false;
      }

      // 3. MIDC Zone Filter
      if (activeFilters.midcZone !== 'All MIDC Zones') {
        const zone = (j as any).midcZone || j.midc_zone || j.location || '';
        if (!zone.toLowerCase().includes(activeFilters.midcZone.toLowerCase())) return false;
      }

      // 4. Job Type Filter
      if (activeFilters.jobType !== 'All Types') {
        const jt = j.job_type || j.jobType || '';
        if (jt !== activeFilters.jobType) return false;
      }

      // 5. Work Mode Filter
      if (activeFilters.workMode !== 'All Modes') {
        const wm = j.work_mode || j.workMode || '';
        if (wm !== activeFilters.workMode) return false;
      }

      // 6. Amenities Filters
      if (activeFilters.busFacility && !((j as any).requiresBus || (j as any).requires_bus || (j.perks || []).includes('Bus Transport'))) return false;
      if (activeFilters.canteen && !(j.perks || []).includes('Free Canteen')) return false;

      return true;
    });
  }, [jobs, searchQuery, activeFilters]);

  // Real-time count for draft filters (used inside filter drawer before Apply is tapped)
  const getMatchingCountForDraft = useCallback(
    (draftFilters: FilterOptions): number => {
      return jobs.filter((j) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const title = (j.title || '').toLowerCase();
          const company = (j.company || '').toLowerCase();
          const location = (j.location || '').toLowerCase();
          const industry = (j.industry || (j as any).category || '').toLowerCase();
          if (!title.includes(q) && !company.includes(q) && !location.includes(q) && !industry.includes(q)) return false;
        }
        if (draftFilters.industry && draftFilters.industry !== 'All Industries' && draftFilters.industry !== 'All') {
          const rawInd = draftFilters.industry.toLowerCase().trim();
          const jobInd = (j.industry || (j as any).category || '').toLowerCase();
          const jobTitle = (j.title || '').toLowerCase();
          const jobTrade = (j.trade || '').toLowerCase();

          const directMatch = jobInd.includes(rawInd) || rawInd.includes(jobInd);
          const indTokens = rawInd
            .split(/[\s&,/()]+/)
            .map((t) => t.replace(/(s|ing|als|ics)$/, ''))
            .filter((t) => t.length >= 2);

          const matchesInd =
            directMatch ||
            indTokens.length === 0 ||
            indTokens.some((t) => jobInd.includes(t) || jobTitle.includes(t) || jobTrade.includes(t));

          if (!matchesInd) return false;
        }
        if (draftFilters.midcZone !== 'All MIDC Zones') {
          const zone = (j as any).midcZone || j.midc_zone || j.location || '';
          if (!zone.toLowerCase().includes(draftFilters.midcZone.toLowerCase())) return false;
        }
        if (draftFilters.jobType !== 'All Types') {
          const jt = j.job_type || j.jobType || '';
          if (jt !== draftFilters.jobType) return false;
        }
        if (draftFilters.workMode !== 'All Modes') {
          const wm = j.work_mode || j.workMode || '';
          if (wm !== draftFilters.workMode) return false;
        }
        if (draftFilters.busFacility && !((j as any).requiresBus || (j as any).requires_bus || (j.perks || []).includes('Bus Transport'))) return false;
        if (draftFilters.canteen && !(j.perks || []).includes('Free Canteen')) return false;
        return true;
      }).length;
    },
    [jobs, searchQuery]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Full-Width Capsule Search Bar Header with Embedded Filter Action */}
      <Header
        searchPlaceholder={SEARCH_PLACEHOLDERS[placeholderIndex] || 'Search Jobs'}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showBack={true}
        onBack={() => navigation.goBack()}
        hideRightActions={true}
        onFilterPress={() => {
          navigation.navigate('JobFilter', {
            currentFilters: activeFilters,
            totalMatchingJobsCount: filteredJobs.length,
            onApplyFilters: (newFilters: FilterOptions) => setActiveFilters(newFilters),
            onResetFilters: () => setActiveFilters(DEFAULT_MAP_FILTERS),
          });
        }}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Map View Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading MIDC Map Vacancies...</Text>
        </View>
      ) : (
        <View style={styles.mapWrapper}>
          <InteractiveJobMapView
            jobs={filteredJobs}
            navigation={navigation}
            activeJobId={route.params?.activeJobId || null}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  mapWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F7F7F7',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
