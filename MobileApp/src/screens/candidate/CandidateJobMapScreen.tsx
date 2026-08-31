import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Search,
  X,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Award,
  ChevronRight,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { InteractiveJobMapView } from '../../components/map/InteractiveJobMapView';
import { JobFilterSideDrawer, FilterOptions } from '../../components/common/JobFilterSideDrawer';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { FONTS, COLORS } from '../../constants/theme';

const DEFAULT_MAP_FILTERS: FilterOptions = {
  industry: 'All Industries',
  education: 'All Education Levels',
  jobType: 'All Types',
  workMode: 'All Modes',
  minExperience: 'All Experience',
  salaryMin: 0,
  midcZone: 'All MIDC Zones',
  distance: 'Any Distance',
  busFacility: false,
  canteen: false,
  accommodation: false,
  overtime: false,
};

export const CandidateJobMapScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const [jobs, setJobs] = useState<Job[]>(route.params?.jobs || []);
  const [loading, setLoading] = useState<boolean>(!route.params?.jobs);
  const activeJobId = route.params?.activeJobId || null;

  // Reused Search & Filter States
  const SEARCH_PLACEHOLDERS = ['Search Jobs', 'Search Trades', 'Search Skills', 'Search Locations'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>(DEFAULT_MAP_FILTERS);
  const searchInputRef = useRef<TextInput>(null);

  // Cycle Placeholders
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await candidateApi.getAllJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (e) {
      console.log('Error fetching jobs for map view screen:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!route.params?.jobs || route.params?.jobs.length === 0) {
      fetchJobs();
    }
  }, [fetchJobs, route.params?.jobs]);

  // Live Autocomplete Suggestions
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

  // Filtered jobs for Map view pins
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // 1. Keyword search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (j.title || '').toLowerCase();
        const company = (j.company || '').toLowerCase();
        const location = (j.location || '').toLowerCase();
        const industry = (j.industry || '').toLowerCase();
        const trade = (j.trade || '').toLowerCase();
        const skills = Array.isArray(j.skills) ? j.skills.join(' ').toLowerCase() : '';

        const match =
          title.includes(q) ||
          company.includes(q) ||
          location.includes(q) ||
          industry.includes(q) ||
          trade.includes(q) ||
          skills.includes(q);

        if (!match) return false;
      }

      // 2. Active filters (Smart Industry Match)
      if (activeFilters.industry && activeFilters.industry !== 'All Industries' && activeFilters.industry !== 'All') {
        const rawInd = activeFilters.industry.toLowerCase().trim();
        const jobInd = (j.industry || '').toLowerCase();
        const jobTitle = (j.title || '').toLowerCase();
        const jobTrade = (j.trade || '').toLowerCase();
        const jobDesc = (j.description || '').toLowerCase();

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
      if (activeFilters.midcZone !== 'All MIDC Zones') {
        if (!(j.location || '').toLowerCase().includes(activeFilters.midcZone.toLowerCase())) return false;
      }
      if (activeFilters.jobType !== 'All Types') {
        if ((j.job_type || (j as any).jobType || '').toLowerCase() !== activeFilters.jobType.toLowerCase()) return false;
      }
      if (activeFilters.workMode !== 'All Modes') {
        if ((j.work_mode || (j as any).workMode || '').toLowerCase() !== activeFilters.workMode.toLowerCase()) return false;
      }
      if (activeFilters.busFacility && !(j as any).bus_facility && !j.bus_facility) return false;
      if (activeFilters.canteen && !(j as any).canteen_facility && !j.canteen) return false;
      if (activeFilters.accommodation && !j.accommodation) return false;

      return true;
    });
  }, [jobs, searchQuery, activeFilters]);

  const activeFilterCount = [
    activeFilters.industry !== 'All Industries',
    activeFilters.midcZone !== 'All MIDC Zones',
    activeFilters.distance && activeFilters.distance !== 'Any Distance',
    activeFilters.jobType !== 'All Types',
    activeFilters.workMode !== 'All Modes',
    activeFilters.minExperience !== 'All Experience',
    activeFilters.busFacility,
    activeFilters.canteen,
    activeFilters.accommodation,
    activeFilters.overtime,
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
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

      {/* Map Body Section */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1B4FE0" />
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <InteractiveJobMapView
            jobs={filteredJobs}
            activeJobId={activeJobId}
            onSelectJob={(job) => {
              navigation.navigate('CandidateJobDetail', { jobId: job.id, job });
            }}
            navigation={navigation}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
  },
});
