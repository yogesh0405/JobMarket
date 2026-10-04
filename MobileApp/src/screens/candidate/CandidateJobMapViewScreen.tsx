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
  DeviceEventEmitter,
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
import { evaluateJobMatchesFilter } from './utils/jobFilterEngine';

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
      if (route?.params?.appliedFilters) {
        setActiveFilters(route.params.appliedFilters);
      }
    }, [fetchJobs, route?.params?.appliedFilters])
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('APPLY_JOB_FILTERS', (filters: FilterOptions) => {
      if (filters) {
        setActiveFilters(filters);
      }
    });
    return () => sub.remove();
  }, []);

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
    return jobs.filter((j) => evaluateJobMatchesFilter(j, activeFilters, searchQuery));
  }, [jobs, searchQuery, activeFilters]);

  // Real-time count for draft filters (used inside filter drawer before Apply is tapped)
  const getMatchingCountForDraft = useCallback(
    (draftFilters: FilterOptions): number => {
      return jobs.filter((j) => evaluateJobMatchesFilter(j, draftFilters, searchQuery)).length;
    },
    [jobs, searchQuery]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Full-Width Capsule Search Bar Header with Embedded Filter Action */}
      <Header
        searchPlaceholder={searchQuery ? searchQuery : SEARCH_PLACEHOLDERS[placeholderIndex] || 'Search Jobs, Roles, MIDC Clusters...'}
        onSearchPress={() => {
          navigation.navigate('CandidateGlobalSearch', { initialQuery: searchQuery });
        }}
        showBack={true}
        onBack={() => navigation.goBack()}
        hideRightActions={true}
        onFilterPress={() => {
          navigation.navigate('JobFilter', {
            currentFilters: activeFilters,
            totalMatchingJobsCount: filteredJobs.length,
            returnScreen: 'CandidateJobMapView',
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
