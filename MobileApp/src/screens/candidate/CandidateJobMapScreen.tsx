import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  DeviceEventEmitter,
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
import { evaluateJobMatchesFilter } from './utils/jobFilterEngine';

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

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.appliedFilters) {
        setActiveFilters(route.params.appliedFilters);
      }
    }, [route?.params?.appliedFilters])
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('APPLY_JOB_FILTERS', (filters: FilterOptions) => {
      if (filters) {
        setActiveFilters(filters);
      }
    });
    return () => sub.remove();
  }, []);

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
    return jobs.filter((j) => evaluateJobMatchesFilter(j, activeFilters, searchQuery));
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
            returnScreen: 'CandidateJobMap',
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
