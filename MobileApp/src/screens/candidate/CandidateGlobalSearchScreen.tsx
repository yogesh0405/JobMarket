import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Search,
  X,
  Clock,
  TrendingUp,
  Briefcase,
  MapPin,
  Award,
  ChevronRight,
  ArrowUpRight,
  Flame,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { apiFetch } from '../../api/client';
import { Job } from '../../types';

const RECENT_SEARCHES_STORAGE_KEY = '@jobmarket_recent_searches_v2';

const TRENDING_ROLES = [
  'CNC Machine Operator',
  'VMC 3-Axis Machinist',
  'ITI Electrician',
  'Fitter Technician',
  'Quality Inspector (QA/QC)',
  'Industrial Welder (MIG/TIG)',
  'Production Supervisor',
  'Tool & Die Maker',
];

const TRENDING_LOCATIONS = [
  'Waluj MIDC, Chhatrapati Sambhajinagar',
  'Chakan MIDC, Pune',
  'Bhosari MIDC, Pune',
  'Shendra MIDC Industrial Park',
  'Taloja MIDC, Navi Mumbai',
  'Ranjangaon MIDC',
];

const TRENDING_SECTORS = [
  'Automotive & Heavy Engineering',
  'Pharma & Chemical Plants',
  'Electronics & PCB Assembly',
  'Metals & Fabrication',
];

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateGlobalSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialQuery = route?.params?.initialQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadRecentSearches();
    fetchAllJobs();
    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timeout);
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 10));
        }
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  };

  const saveSearchToHistory = async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save search history:', e);
    }
  };

  const removeSingleRecentSearch = async (keyword: string) => {
    try {
      const updated = recentSearches.filter((item) => item !== keyword);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to remove recent search:', e);
    }
  };

  const clearAllRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear search history:', e);
    }
  };

  const fetchAllJobs = async () => {
    try {
      const res = await apiFetch('/api/v1/jobs');
      const list = Array.isArray(res) ? res : res?.data || [];
      if (Array.isArray(list)) {
        setAllJobs(list);
      }
    } catch (e) {
      console.warn('Failed to fetch jobs for search autocomplete:', e);
    }
  };

  const handleExecuteSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveSearchToHistory(trimmed);
    Keyboard.dismiss();
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params: { keyword: trimmed },
    });
  };

  const handleLocationSearch = (location: string) => {
    saveSearchToHistory(location);
    Keyboard.dismiss();
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params: { location: location },
    });
  };

  const handleJobClick = (job: Job) => {
    saveSearchToHistory(job.title);
    Keyboard.dismiss();
    navigation.navigate('CandidateJobDetail', { jobId: job.id, job });
  };

  // Autocomplete suggestions matching live query
  const autocompleteSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { jobs: [], trades: [], locations: [] };
    }

    const matchedJobs = allJobs
      .filter((j) => {
        const titleMatch = (j.title || '').toLowerCase().includes(q);
        const compMatch = (j.company || '').toLowerCase().includes(q);
        const indMatch = (j.industry || '').toLowerCase().includes(q);
        const tradeMatch = (j.trade || '').toLowerCase().includes(q);
        const skillsMatch = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(q));
        return titleMatch || compMatch || indMatch || tradeMatch || skillsMatch;
      })
      .slice(0, 5);

    const matchedTrades = TRENDING_ROLES.filter((t) => t.toLowerCase().includes(q)).slice(0, 4);
    const matchedLocations = TRENDING_LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 4);

    return {
      jobs: matchedJobs,
      trades: matchedTrades,
      locations: matchedLocations,
    };
  }, [searchQuery, allJobs]);

  const hasLiveQuery = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Search Navigation Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Search size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search jobs, skills, companies, MIDCs..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleExecuteSearch(searchQuery)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={15} color="#64748B" />
            </TouchableOpacity>
          ) : null}
        </View>

        {searchQuery.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.searchActionBtn}
            onPress={() => handleExecuteSearch(searchQuery)}
          >
            <Text style={styles.searchActionBtnText}>Search</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* VIEW A: LIVE AUTOCOMPLETE RESULTS WHEN TYPING */}
        {hasLiveQuery ? (
          <View style={styles.liveResultsContainer}>
            {/* Primary Query Action */}
            <TouchableOpacity
              style={styles.primaryQueryRow}
              onPress={() => handleExecuteSearch(searchQuery)}
              activeOpacity={0.7}
            >
              <Search size={18} color={COLORS.primary} />
              <Text style={styles.primaryQueryText} numberOfLines={1}>
                Search for "<Text style={{ fontWeight: '800', color: COLORS.primary }}>{searchQuery.trim()}</Text>"
              </Text>
              <ArrowUpRight size={16} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Matching Live Jobs */}
            {autocompleteSuggestions.jobs.length > 0 ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeaderTitle}>MATCHING JOBS</Text>
                {autocompleteSuggestions.jobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    style={styles.autocompleteItemRow}
                    onPress={() => handleJobClick(job)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconCircleJob}>
                      <Briefcase size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.jobTitleText} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <Text style={styles.jobSubText} numberOfLines={1}>
                        {job.company} • {job.location}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Matching Trades / Roles */}
            {autocompleteSuggestions.trades.length > 0 ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeaderTitle}>POPULAR TRADES & SKILLS</Text>
                {autocompleteSuggestions.trades.map((trade) => (
                  <TouchableOpacity
                    key={trade}
                    style={styles.autocompleteItemRow}
                    onPress={() => handleExecuteSearch(trade)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconCircleTrade}>
                      <Award size={16} color="#059669" />
                    </View>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.genericTitleText}>{trade}</Text>
                      <Text style={styles.genericSubText}>Industrial Trade</Text>
                    </View>
                    <ArrowUpRight size={15} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Matching Locations */}
            {autocompleteSuggestions.locations.length > 0 ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeaderTitle}>INDUSTRIAL HUBS & LOCATIONS</Text>
                {autocompleteSuggestions.locations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={styles.autocompleteItemRow}
                    onPress={() => handleLocationSearch(loc)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconCircleLoc}>
                      <MapPin size={16} color="#D97706" />
                    </View>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.genericTitleText}>{loc}</Text>
                      <Text style={styles.genericSubText}>MIDC Industrial Zone</Text>
                    </View>
                    <ArrowUpRight size={15} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          /* VIEW B: RECENT SEARCHES & TRENDING HUBS (WHEN INPUT IS EMPTY) */
          <View style={styles.defaultContentContainer}>
            {/* 1. RECENT SEARCHES */}
            {recentSearches.length > 0 ? (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>RECENT SEARCHES</Text>
                  <TouchableOpacity onPress={clearAllRecentSearches} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentListContainer}>
                  {recentSearches.map((term, index) => (
                    <View key={`${term}-${index}`} style={styles.recentItemRow}>
                      <TouchableOpacity
                        style={styles.recentItemClickArea}
                        onPress={() => handleExecuteSearch(term)}
                        activeOpacity={0.7}
                      >
                        <Clock size={16} color="#64748B" />
                        <Text style={styles.recentItemText} numberOfLines={1}>
                          {term}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.recentItemDeleteBtn}
                        onPress={() => removeSingleRecentSearch(term)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={15} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* 2. TRENDING INDUSTRIAL ROLES */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Flame size={16} color="#DC2626" />
                  <Text style={styles.sectionHeaderTitle}>TRENDING SEARCHES</Text>
                </View>
              </View>

              <View style={styles.chipsWrap}>
                {TRENDING_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={styles.trendingChip}
                    onPress={() => handleExecuteSearch(role)}
                    activeOpacity={0.75}
                  >
                    <TrendingUp size={13} color={COLORS.primary} />
                    <Text style={styles.trendingChipText}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 3. POPULAR INDUSTRIAL HUBS (MIDC) */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} color="#D97706" />
                  <Text style={styles.sectionHeaderTitle}>EXPLORE BY INDUSTRIAL CLUSTER</Text>
                </View>
              </View>

              <View style={styles.chipsWrap}>
                {TRENDING_LOCATIONS.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={styles.locationChip}
                    onPress={() => handleLocationSearch(loc)}
                    activeOpacity={0.75}
                  >
                    <MapPin size={13} color="#D97706" />
                    <Text style={styles.locationChipText}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 4. KEY MANUFACTURING SECTORS */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>BROWSE BY SECTOR</Text>
              </View>

              <View style={styles.chipsWrap}>
                {TRENDING_SECTORS.map((sector) => (
                  <TouchableOpacity
                    key={sector}
                    style={styles.sectorChip}
                    onPress={() => handleExecuteSearch(sector)}
                    activeOpacity={0.75}
                  >
                    <Briefcase size={13} color="#475569" />
                    <Text style={styles.sectorChipText}>{sector}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  backButton: {
    padding: 4,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  searchActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  liveResultsContainer: {
    gap: 16,
  },
  primaryQueryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  primaryQueryText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  recentListContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 12,
    height: 46,
  },
  recentItemClickArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: '100%',
  },
  recentItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  recentItemDeleteBtn: {
    padding: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 6,
  },
  trendingChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#166534',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
  },
  locationChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#92400E',
  },
  sectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
  },
  sectorChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  defaultContentContainer: {
    gap: 4,
  },
  autocompleteItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  iconCircleJob: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleTrade: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleLoc: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  jobTitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  jobSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  genericTitleText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  genericSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
});
