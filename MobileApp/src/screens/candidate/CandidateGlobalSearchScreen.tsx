import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
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
  Building2,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
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
  'Shendra MIDC Industrial Area',
  'Taloja MIDC, Navi Mumbai',
  'Ranjangaon MIDC',
];

const POPULAR_EMPLOYERS = [
  { name: 'Bajaj Auto Limited', industry: 'Automotive & 2-Wheeler', location: 'Waluj MIDC' },
  { name: 'Tata Motors Manufacturing', industry: 'Automotive OEM', location: 'Pimpri-Chinchwad' },
  { name: 'Endurance Technologies', industry: 'Auto Components & Die Casting', location: 'Waluj MIDC' },
  { name: 'Varroc Engineering Ltd', industry: 'Polymer & Electricals', location: 'Chakan MIDC' },
  { name: 'Siemens India Industrial', industry: 'Electrical & Automation', location: 'Kalwa MIDC' },
  { name: 'Bharat Forge Limited', industry: 'Forging & Heavy Machinery', location: 'Mundhwa Pune' },
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
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadRecentSearches();
    fetchAllData();
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

  const fetchAllData = async () => {
    try {
      const [jobsRes, compsRes] = await Promise.all([
        apiFetch('/api/v1/jobs').catch(() => []),
        apiFetch('/api/v1/companies').catch(() => []),
      ]);
      const jobList = Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || [];
      const compList = Array.isArray(compsRes) ? compsRes : compsRes?.data || compsRes?.companies || [];
      if (Array.isArray(jobList)) setAllJobs(jobList);
      if (Array.isArray(compList)) setAllCompanies(compList);
    } catch (e) {
      console.warn('Failed to fetch data for search autocomplete:', e);
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

  const handleCompanyClick = (company: any) => {
    const compName = company.name || company.company_name || company.company || 'Company';
    saveSearchToHistory(compName);
    Keyboard.dismiss();
    navigation.navigate('CompanyProfile', {
      companyId: company.id || company.user_id,
      company: company,
    });
  };

  // Autocomplete matching live query across Jobs, Companies, Trades, Locations
  const autocompleteSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { jobs: [], companies: [], trades: [], locations: [] };
    }

    // 1. Matching Live Jobs
    const matchedJobs = allJobs
      .filter((j) => {
        const titleMatch = (j.title || '').toLowerCase().includes(q);
        const compMatch = (j.company || '').toLowerCase().includes(q);
        const indMatch = (j.industry || '').toLowerCase().includes(q);
        const tradeMatch = (j.trade || '').toLowerCase().includes(q);
        const skillsMatch = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(q));
        return titleMatch || compMatch || indMatch || tradeMatch || skillsMatch;
      })
      .slice(0, 4);

    // 2. Standalone Matching Companies & Factories
    const matchedCompanies = allCompanies
      .filter((c) => {
        const nameMatch = (c.name || c.company_name || c.company || '').toLowerCase().includes(q);
        const indMatch = (c.industry || '').toLowerCase().includes(q);
        const locMatch = (c.city || c.location || c.midc_zone || '').toLowerCase().includes(q);
        const aboutMatch = (c.about || c.description || '').toLowerCase().includes(q);
        return nameMatch || indMatch || locMatch || aboutMatch;
      })
      .slice(0, 4);

    // 3. Matching Trades
    const matchedTrades = TRENDING_ROLES.filter((t) => t.toLowerCase().includes(q)).slice(0, 3);

    // 4. Matching Locations
    const matchedLocations = TRENDING_LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 3);

    return {
      jobs: matchedJobs,
      companies: matchedCompanies,
      trades: matchedTrades,
      locations: matchedLocations,
    };
  }, [searchQuery, allJobs, allCompanies]);

  const hasLiveQuery = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Clean LinkedIn Search Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Search size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search jobs, companies, skills, locations..."
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
            activeOpacity={0.7}
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
        {/* VIEW A: LIVE AUTOCOMPLETE PREDICTIVE RESULTS (WHEN TYPING) */}
        {hasLiveQuery ? (
          <View style={styles.listContainer}>
            {/* Primary Search Row */}
            <TouchableOpacity
              style={styles.searchRow}
              onPress={() => handleExecuteSearch(searchQuery)}
              activeOpacity={0.65}
            >
              <Search size={17} color={COLORS.primary} style={styles.rowIcon} />
              <View style={styles.rowContent}>
                <Text style={styles.primaryQueryText} numberOfLines={1}>
                  Search for "<Text style={{ fontWeight: '700', color: COLORS.primary }}>{searchQuery.trim()}</Text>"
                </Text>
              </View>
              <ArrowUpRight size={15} color="#94A3B8" />
            </TouchableOpacity>

            {/* Standalone Matching Companies & Factories */}
            {autocompleteSuggestions.companies.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>COMPANIES & FACTORIES</Text>
                </View>
                {autocompleteSuggestions.companies.map((comp) => {
                  const compName = comp.name || comp.company_name || comp.company || 'Industrial Company';
                  const compLoc = comp.midc_zone || comp.location || comp.city || 'Industrial MIDC';
                  const compInd = comp.industry || 'Manufacturing';
                  return (
                    <TouchableOpacity
                      key={comp.id || compName}
                      style={styles.searchRow}
                      onPress={() => handleCompanyClick(comp)}
                      activeOpacity={0.65}
                    >
                      <Building2 size={17} color="#0F172A" style={styles.rowIcon} />
                      <View style={styles.rowContent}>
                        <Text style={styles.rowTitleText} numberOfLines={1}>
                          {compName}
                        </Text>
                        <Text style={styles.rowSubText} numberOfLines={1}>
                          {compInd} • {compLoc}
                        </Text>
                      </View>
                      <ChevronRight size={15} color="#CBD5E1" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {/* Matching Live Jobs */}
            {autocompleteSuggestions.jobs.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>MATCHING JOBS</Text>
                </View>
                {autocompleteSuggestions.jobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    style={styles.searchRow}
                    onPress={() => handleJobClick(job)}
                    activeOpacity={0.65}
                  >
                    <Briefcase size={17} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <Text style={styles.rowSubText} numberOfLines={1}>
                        {job.company} • {job.location}
                      </Text>
                    </View>
                    <ChevronRight size={15} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Matching Trades */}
            {autocompleteSuggestions.trades.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>POPULAR ROLES & TRADES</Text>
                </View>
                {autocompleteSuggestions.trades.map((trade) => (
                  <TouchableOpacity
                    key={trade}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(trade)}
                    activeOpacity={0.65}
                  >
                    <TrendingUp size={16} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{trade}</Text>
                      <Text style={styles.rowSubText}>Job Role / Trade</Text>
                    </View>
                    <ArrowUpRight size={15} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Matching Locations */}
            {autocompleteSuggestions.locations.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>LOCATIONS & MIDC ZONES</Text>
                </View>
                {autocompleteSuggestions.locations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={styles.searchRow}
                    onPress={() => handleLocationSearch(loc)}
                    activeOpacity={0.65}
                  >
                    <MapPin size={17} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{loc}</Text>
                      <Text style={styles.rowSubText}>Industrial Location</Text>
                    </View>
                    <ArrowUpRight size={15} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          /* VIEW B: RECENT SEARCHES, TOP EMPLOYERS & TRENDING (WHEN INPUT IS EMPTY) */
          <View style={styles.listContainer}>
            {/* 1. RECENT SEARCHES */}
            {recentSearches.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>RECENT SEARCHES</Text>
                  <TouchableOpacity onPress={clearAllRecentSearches} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.clearAllText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                {recentSearches.map((term, index) => (
                  <View key={`${term}-${index}`} style={styles.searchRow}>
                    <TouchableOpacity
                      style={styles.recentClickArea}
                      onPress={() => handleExecuteSearch(term)}
                      activeOpacity={0.65}
                    >
                      <Clock size={16} color="#64748B" style={styles.rowIcon} />
                      <Text style={styles.rowTitleText} numberOfLines={1}>
                        {term}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeSingleRecentSearch(term)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={15} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}

            {/* 2. TOP INDUSTRIAL EMPLOYERS (Standalone Companies) */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>TOP INDUSTRIAL EMPLOYERS</Text>
              </View>

              {POPULAR_EMPLOYERS.map((comp) => (
                <TouchableOpacity
                  key={comp.name}
                  style={styles.searchRow}
                  onPress={() => handleExecuteSearch(comp.name)}
                  activeOpacity={0.65}
                >
                  <Building2 size={16} color="#64748B" style={styles.rowIcon} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitleText}>{comp.name}</Text>
                    <Text style={styles.rowSubText}>{comp.industry} • {comp.location}</Text>
                  </View>
                  <ChevronRight size={15} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. TRENDING INDUSTRIAL ROLES */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>TRY SEARCHING FOR</Text>
              </View>

              {TRENDING_ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.searchRow}
                  onPress={() => handleExecuteSearch(role)}
                  activeOpacity={0.65}
                >
                  <TrendingUp size={16} color="#64748B" style={styles.rowIcon} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitleText}>{role}</Text>
                  </View>
                  <ArrowUpRight size={15} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>

            {/* 4. POPULAR INDUSTRIAL HUBS */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>POPULAR INDUSTRIAL HUBS</Text>
              </View>

              {TRENDING_LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={styles.searchRow}
                  onPress={() => handleLocationSearch(loc)}
                  activeOpacity={0.65}
                >
                  <MapPin size={16} color="#64748B" style={styles.rowIcon} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitleText}>{loc}</Text>
                  </View>
                  <ArrowUpRight size={15} color="#94A3B8" />
                </TouchableOpacity>
              ))}
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  searchActionBtnText: {
    color: COLORS.primary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
  },
  sectionWrap: {
    marginTop: 12,
    borderBottomWidth: 6,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowIcon: {
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  recentClickArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitleText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#0F172A',
  },
  rowSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  primaryQueryText: {
    fontSize: 13.5,
    color: '#0F172A',
  },
  deleteBtn: {
    padding: 4,
  },
});
