import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
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
  const SEARCH_PLACEHOLDERS = ['Search jobs...', 'Search trades...', 'Search locations...'];
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

  useEffect(() => {
    if (initialJobs.length === 0) {
      fetchJobs();
    }
  }, [fetchJobs, initialJobs.length]);

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

      // 2. Industry Filter
      if (activeFilters.industry !== 'All Industries') {
        const ind = j.industry || (j as any).category || '';
        if (ind !== activeFilters.industry) return false;
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
        if (draftFilters.industry !== 'All Industries') {
          const ind = j.industry || (j as any).category || '';
          if (ind !== draftFilters.industry) return false;
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

      {/* Top Search Bar Header (100% Exact Match to Grid & List View Search Bar) */}
      <View style={[styles.searchHeaderBar, { paddingTop: Math.max(insets.top + 4, 10) }]}>
        <View style={[styles.inputSearchBox, isInputFocused && styles.inputSearchBoxActive]}>
          <Search size={18} color={isInputFocused ? COLORS.primary : '#64748B'} />
          <TextInput
            style={styles.inputSearchText}
            placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.searchClearBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={15} color="#64748B" />
            </TouchableOpacity>
          ) : (
            <View style={styles.countTag}>
              <Text style={styles.countTagText}>{filteredJobs.length} Jobs</Text>
            </View>
          )}

          {/* Integrated Vertical Divider */}
          <View style={styles.inlineFilterDivider} />

          {/* Integrated Filter Action Button */}
          <TouchableOpacity
            style={[styles.inlineFilterBtn, activeFilterCount > 0 && styles.inlineFilterBtnActive]}
            onPress={() => setFilterDrawerOpen(true)}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal size={18} color={activeFilterCount > 0 ? COLORS.primary : '#475569'} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadgePillInline}>
                <Text style={styles.filterBadgePillText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Map View Area (Starts Directly Below Search Header) */}
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
          />
        </View>
      )}

      {/* Filter Side Drawer Modal */}
      <JobFilterSideDrawer
        visible={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        currentFilters={activeFilters}
        onApplyFilters={(newFilters: FilterOptions) => setActiveFilters(newFilters)}
        onResetFilters={() => setActiveFilters(DEFAULT_MAP_FILTERS)}
        totalMatchingJobsCount={filteredJobs.length}
        onGetMatchingCount={getMatchingCountForDraft}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  searchHeaderBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  inputSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  inputSearchBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  inputSearchText: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    paddingVertical: 0,
    margin: 0,
  },
  searchClearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countTag: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  inlineFilterDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
  inlineFilterBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  inlineFilterBtnActive: {},
  filterBadgePillInline: {
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
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
