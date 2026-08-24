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
  const SEARCH_PLACEHOLDERS = ['Search jobs...', 'Search trades...', 'Search locations...'];
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
      <Header
        title="Job Locations Map"
        subtitle="Industrial Clusters & Factories"
        showBack={true}
        onBack={() => navigation.goBack()}
        hideRightActions={true}
      />

      {/* Search Input & Inline Filter Button Row */}
      <View style={styles.searchBarWrapper}>
        <View style={[styles.inputSearchBox, isInputFocused && styles.inputSearchBoxActive]}>
          <Search size={18} color={isInputFocused ? COLORS.employerPrimary : '#64748B'} />
          <TextInput
            ref={searchInputRef}
            style={styles.inputSearchText}
            placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={(txt) => {
              setSearchQuery(txt);
              setShowSuggestions(txt.trim().length > 0);
            }}
            onPressIn={() => setIsInputFocused(true)}
            onFocus={() => {
              setIsInputFocused(true);
              setShowSuggestions(searchQuery.trim().length > 0);
            }}
            onBlur={() => {
              setIsInputFocused(false);
            }}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              style={styles.searchClearBtn}
            >
              <X size={15} color="#64748B" />
            </TouchableOpacity>
          ) : null}

          {/* Vertical Soft Divider inside Search Bar */}
          <View style={styles.inlineFilterDivider} />

          {/* Integrated Inline Filter Action Button */}
          <TouchableOpacity
            style={[styles.inlineFilterBtn, activeFilterCount > 0 && styles.inlineFilterBtnActive]}
            onPress={() => setFilterDrawerOpen(true)}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <SlidersHorizontal size={17} color={activeFilterCount > 0 ? COLORS.employerPrimary : '#475569'} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadgePillInline}>
                <Text style={styles.filterBadgePillText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Live Autocomplete Suggestions Overlay */}
        {showSuggestions && searchQuery.trim().length > 0 ? (
          <View style={styles.suggestionsContainer}>
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{ maxHeight: 270 }}>
              <TouchableOpacity
                style={styles.suggestionRowHeader}
                onPress={() => setShowSuggestions(false)}
              >
                <Search size={15} color="#1B4FE0" />
                <Text style={styles.suggestionHeaderText} numberOfLines={1}>
                  Filter map matching "<Text style={{ fontWeight: '800', color: COLORS.employerPrimary }}>{searchQuery.trim()}</Text>"
                </Text>
              </TouchableOpacity>

              {/* Matched Live Jobs */}
              {matchedSuggestions.jobs.length > 0 ? (
                <View style={styles.suggestionGroup}>
                  <Text style={styles.suggestionGroupLabel}>MATCHING LIVE JOBS</Text>
                  {matchedSuggestions.jobs.map((j) => (
                    <TouchableOpacity
                      key={j.id}
                      style={styles.suggestionItemRow}
                      onPress={() => {
                        setShowSuggestions(false);
                        navigation.navigate('CandidateJobDetail', { jobId: j.id, job: j });
                      }}
                    >
                      <Briefcase size={16} color="#1B4FE0" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionItemTitle} numberOfLines={1}>{j.title}</Text>
                        <Text style={styles.suggestionItemSub} numberOfLines={1}>{j.company} • {j.location}</Text>
                      </View>
                      <ChevronRight size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {/* Matched Trades */}
              {matchedSuggestions.trades.length > 0 ? (
                <View style={styles.suggestionGroup}>
                  <Text style={styles.suggestionGroupLabel}>POPULAR TRADES & SKILLS</Text>
                  {matchedSuggestions.trades.map((trade) => (
                    <TouchableOpacity
                      key={trade}
                      style={styles.suggestionItemRow}
                      onPress={() => {
                        setSearchQuery(trade);
                        setShowSuggestions(false);
                      }}
                    >
                      <Award size={16} color="#059669" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionItemTitle}>{trade}</Text>
                        <Text style={styles.suggestionItemSub}>ITI / Industrial Trade</Text>
                      </View>
                      <ChevronRight size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {/* Matched Locations */}
              {matchedSuggestions.locations.length > 0 ? (
                <View style={styles.suggestionGroup}>
                  <Text style={styles.suggestionGroupLabel}>INDUSTRIAL ZONES & LOCATIONS</Text>
                  {matchedSuggestions.locations.map((loc) => (
                    <TouchableOpacity
                      key={loc}
                      style={styles.suggestionItemRow}
                      onPress={() => {
                        setShowSuggestions(false);
                        setActiveFilters((prev) => ({ ...prev, midcZone: loc }));
                      }}
                    >
                      <MapPin size={16} color="#D97706" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionItemTitle}>{loc}</Text>
                        <Text style={styles.suggestionItemSub}>Industrial Cluster</Text>
                      </View>
                      <ChevronRight size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </ScrollView>
          </View>
        ) : null}
      </View>

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

      {/* Reused Job Filter Side Drawer Component */}
      <JobFilterSideDrawer
        visible={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        currentFilters={activeFilters}
        totalMatchingJobsCount={filteredJobs.length}
        onApplyFilters={(newFilters) => setActiveFilters(newFilters)}
        onResetFilters={() => setActiveFilters(DEFAULT_MAP_FILTERS)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchBarWrapper: {
    zIndex: 999,
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  inputSearchBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 6,
    height: 48,
    gap: 10,
    elevation: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  inputSearchBoxActive: {
    borderColor: COLORS.employerPrimary,
    borderWidth: 1.5,
  },
  inputSearchText: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    color: '#0F172A',
    fontFamily: FONTS.regular,
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  searchClearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineFilterDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
  inlineFilterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inlineFilterBtnActive: {
    backgroundColor: 'transparent',
  },
  filterBadgePillInline: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.employerPrimary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 10,
    zIndex: 999,
  },
  suggestionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 4,
    marginBottom: 6,
  },
  suggestionHeaderText: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    fontFamily: FONTS.regular,
  },
  suggestionGroup: {
    marginBottom: 8,
  },
  suggestionGroupLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 4,
    paddingLeft: 4,
  },
  suggestionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
    marginBottom: 4,
  },
  suggestionItemTitle: {
    fontSize: 12.5,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionItemSub: {
    fontSize: 10.5,
    color: '#64748B',
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  mapContainer: {
    flex: 1,
  },
});
