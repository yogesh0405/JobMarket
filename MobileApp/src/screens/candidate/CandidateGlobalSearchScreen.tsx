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
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Search,
  SearchX,
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
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';

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

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateGlobalSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialQuery = route?.params?.initialQuery || '';
  const initialCategory = route?.params?.initialCategory || 'all';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<'all' | 'jobs' | 'companies'>(initialCategory);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
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
      setIsLoadingData(true);
      // Load cached companies if available for instant display
      try {
        const cached = await AsyncStorage.getItem('@jobmarket_companies_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllCompanies(parsed);
          }
        }
      } catch (_) {}

      const [jobsRes, compsRes] = await Promise.all([
        apiFetch('/api/v1/jobs').catch(() => []),
        apiFetch('/api/v1/companies').catch(() => []),
      ]);
      const jobList = Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || [];
      const compList = Array.isArray(compsRes) ? compsRes : compsRes?.data || compsRes?.companies || [];
      if (Array.isArray(jobList)) setAllJobs(jobList);
      if (Array.isArray(compList) && compList.length > 0) {
        setAllCompanies(compList);
        AsyncStorage.setItem('@jobmarket_companies_cache', JSON.stringify(compList)).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to fetch data for search autocomplete:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExecuteSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveSearchToHistory(trimmed);
    Keyboard.dismiss();
    setSearchQuery(trimmed);

    // If searching specifically in companies or term matches a company name exactly
    const exactCompany = allCompanies.find(
      (c) => (c.name || c.company_name || c.company || '').toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (activeCategory === 'companies' || exactCompany) {
      if (exactCompany) {
        handleCompanyClick(exactCompany);
        return;
      }
      // Navigate to Companies section with search filter
      try {
        navigation.navigate('CandidateMain', {
          screen: 'CandidateSavedTab',
          params: { searchQuery: trimmed },
        });
      } catch (_) {
        navigation.navigate('CandidateSavedTab', { searchQuery: trimmed });
      }
      return;
    }

    // Otherwise, for jobs, roles, trades, or general queries: navigate to Find Jobs section
    DeviceEventEmitter.emit('GLOBAL_SEARCH_EXECUTE', { keyword: trimmed });

    try {
      navigation.navigate('CandidateMain', {
        screen: 'CandidateJobsTab',
        params: {
          screen: 'CandidateJobSearch',
          params: { keyword: trimmed },
        },
      });
    } catch (_) {
      try {
        navigation.navigate('CandidateJobsTab', {
          screen: 'CandidateJobSearch',
          params: { keyword: trimmed },
        });
      } catch (err) {
        navigation.navigate('CandidateJobSearch', { keyword: trimmed });
      }
    }
  };

  const handleLocationSearch = (location: string) => {
    saveSearchToHistory(location);
    Keyboard.dismiss();

    DeviceEventEmitter.emit('GLOBAL_SEARCH_EXECUTE', { location });

    try {
      navigation.navigate('CandidateMain', {
        screen: 'CandidateJobsTab',
        params: {
          screen: 'CandidateJobSearch',
          params: { location },
        },
      });
    } catch (_) {
      try {
        navigation.navigate('CandidateJobsTab', {
          screen: 'CandidateJobSearch',
          params: { location },
        });
      } catch (err) {
        navigation.navigate('CandidateJobSearch', { location });
      }
    }
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
    const matched = allCompanies.find(
      (c) =>
        (c.id && c.id === company.id) ||
        (c.name && c.name.toLowerCase().trim() === compName.toLowerCase().trim())
    );
    const fullCompanyObj = matched ? { ...matched, ...company } : company;
    navigation.navigate('CompanyProfile', {
      companyId: fullCompanyObj.id || fullCompanyObj.user_id || compName,
      name: compName,
      company: fullCompanyObj,
    });
  };

  // Top Industrial Employers: strictly from real companies registered on our platform (Deduplicated)
  const platformCompanies = useMemo(() => {
    const seen = new Set<string>();
    const result: any[] = [];

    const addCompany = (c: any) => {
      if (!c) return;
      const cId = (c.id || c.user_id || '').toString().trim();
      const cName = (c.name || c.company_name || c.company || '').toString().trim();
      if (!cName && !cId) return;
      const idKey = cId ? cId.toLowerCase() : '';
      const nameKey = cName ? cName.toLowerCase() : '';
      if ((idKey && seen.has(idKey)) || (nameKey && seen.has(nameKey))) return;
      if (idKey) seen.add(idKey);
      if (nameKey) seen.add(nameKey);

      result.push({
        ...c,
        id: cId || cName,
        name: cName || 'Industrial Company',
        industry: c.industry || 'Industrial Manufacturing',
        location: c.midc_zone || c.location || c.city || 'Chhatrapati Sambhajinagar',
        logo: c.logo || c.logo_url || c.logoUrl || c.profilePictureUrl || c.profile_picture_url || null,
      });
    };

    if (Array.isArray(allCompanies) && allCompanies.length > 0) {
      allCompanies.forEach(addCompany);
    }

    if (result.length < 8 && Array.isArray(allJobs)) {
      allJobs.forEach((j) => {
        const cName = (j.company || (j as any).company_name || '').toString().trim();
        if (cName) {
          addCompany({
            id: j.employer_id || (j as any).company_id || cName,
            name: cName,
            industry: j.industry || 'Industrial Manufacturing',
            location: j.location || 'Chhatrapati Sambhajinagar',
            logo: (j as any).companyLogo || (j as any).company_logo || (j as any).logoUrl || null,
          });
        }
      });
    }

    return result.slice(0, 8);
  }, [allCompanies, allJobs]);

  // Autocomplete matching live query across Jobs, Companies, Trades, Locations (Deduplicated)
  const autocompleteSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { jobs: [], companies: [], trades: [], locations: [] };
    }

    // 1. Matching Live Jobs (Deduplicated by ID)
    const seenJobIds = new Set<string>();
    const matchedJobs: Job[] = [];
    if (activeCategory !== 'companies') {
      for (const j of allJobs) {
        if (!j || !j.id || seenJobIds.has(j.id)) continue;
        const titleMatch = (j.title || '').toLowerCase().includes(q);
        const compMatch = (j.company || '').toLowerCase().includes(q);
        const indMatch = (j.industry || '').toLowerCase().includes(q);
        const tradeMatch = (j.trade || '').toLowerCase().includes(q);
        const skillsMatch = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(q));
        if (titleMatch || compMatch || indMatch || tradeMatch || skillsMatch) {
          seenJobIds.add(j.id);
          matchedJobs.push(j);
          if (matchedJobs.length >= 8) break;
        }
      }
    }

    // 2. Standalone Matching Companies & Factories (Deduplicated by ID/Name)
    const seenCompKeys = new Set<string>();
    const matchedCompanies: any[] = [];
    if (activeCategory !== 'jobs') {
      for (const c of allCompanies) {
        if (!c) continue;
        const cKey = ((c.id || '') + (c.name || c.company_name || '')).toLowerCase().trim();
        if (!cKey || seenCompKeys.has(cKey)) continue;
        const nameMatch = (c.name || c.company_name || c.company || '').toLowerCase().includes(q);
        const indMatch = (c.industry || '').toLowerCase().includes(q);
        const locMatch = (c.city || c.location || c.midc_zone || '').toLowerCase().includes(q);
        const aboutMatch = (c.about || c.description || '').toLowerCase().includes(q);
        if (nameMatch || indMatch || locMatch || aboutMatch) {
          seenCompKeys.add(cKey);
          matchedCompanies.push(c);
          if (matchedCompanies.length >= 8) break;
        }
      }
    }

    // 3. Matching Trades
    const matchedTrades = activeCategory === 'companies'
      ? []
      : TRENDING_ROLES.filter((t) => t.toLowerCase().includes(q)).slice(0, 4);

    // 4. Matching Locations
    const matchedLocations = TRENDING_LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 4);

    return {
      jobs: matchedJobs,
      companies: matchedCompanies,
      trades: matchedTrades,
      locations: matchedLocations,
    };
  }, [searchQuery, allJobs, allCompanies, activeCategory]);

  const hasLiveQuery = searchQuery.trim().length > 0;
  const hasAnySuggestions =
    autocompleteSuggestions.companies.length > 0 ||
    autocompleteSuggestions.jobs.length > 0 ||
    autocompleteSuggestions.trades.length > 0 ||
    autocompleteSuggestions.locations.length > 0;

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
          <ArrowLeft size={24} color="#0F172A" strokeWidth={1.85} />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Search size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={
              activeCategory === 'companies'
                ? 'Search companies, factories, MIDC zones...'
                : activeCategory === 'jobs'
                ? 'Search jobs, trades, roles, skills...'
                : 'Search jobs, companies, skills, locations...'
            }
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

      {/* Scope Category Filter Tabs: All, Jobs, Companies */}
      <View style={styles.categoryTabsRow}>
        {(['all', 'jobs', 'companies'] as const).map((cat) => {
          const isActive = activeCategory === cat;
          const label = cat === 'all' ? 'All' : cat === 'jobs' ? 'Jobs' : 'Companies';
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryTabPill, isActive && styles.categoryTabPillActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.categoryTabLabel, isActive && styles.categoryTabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
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

            {isLoadingData ? (
              <View style={styles.searchingLoadingContainer}>
                <View style={styles.searchingLoadingBadge}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.searchingLoadingText}>
                    Searching matches{searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ''}...
                  </Text>
                </View>
                <View style={{ gap: 10, marginTop: 12 }}>
                  <View style={styles.skeletonItemBox} />
                  <View style={styles.skeletonItemBox} />
                  <View style={styles.skeletonItemBox} />
                </View>
              </View>
            ) : !hasAnySuggestions ? (
              <View style={styles.noResultsContainer}>
                <View style={styles.noResultsIconBox}>
                  <SearchX size={26} color="#64748B" strokeWidth={2} />
                </View>
                <Text style={styles.noResultsTitle}>No Results Found</Text>
                <Text style={styles.noResultsSub}>
                  No direct matches found for "{searchQuery.trim()}".
                </Text>

                <View style={styles.searchTipsBox}>
                  <Text style={styles.searchTipsHeader}>SUGGESTIONS & TIPS</Text>
                  <Text style={styles.searchTipItem}>• Check for spelling errors or alternative abbreviations</Text>
                  <Text style={styles.searchTipItem}>• Search by general trade (e.g., CNC, VMC, Fitter, Welder)</Text>
                  <Text style={styles.searchTipItem}>• Search by MIDC industrial area (e.g., Waluj, Chakan, Bhosari)</Text>
                </View>

                {/* Popular Trades Quick Search */}
                <View style={styles.popularFallbackSection}>
                  <Text style={styles.popularFallbackTitle}>POPULAR INDUSTRIAL ROLES</Text>
                  <View style={styles.popularChipsWrap}>
                    {TRENDING_ROLES.slice(0, 5).map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={styles.popularChipBtn}
                        onPress={() => handleExecuteSearch(role)}
                        activeOpacity={0.7}
                      >
                        <TrendingUp size={12} color={COLORS.primary} style={{ marginRight: 5 }} />
                        <Text style={styles.popularChipText}>{role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : null}

            {/* Standalone Matching Companies & Factories */}
            {autocompleteSuggestions.companies.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>COMPANIES & FACTORIES</Text>
                </View>
                {autocompleteSuggestions.companies.map((comp, idx) => {
                  const compName = comp.name || comp.company_name || comp.company || 'Industrial Company';
                  const compLoc = comp.midc_zone || comp.location || comp.city || 'Industrial MIDC';
                  const compInd = comp.industry || 'Manufacturing';
                  const compLogo = comp.logo || comp.logo_url || comp.logoUrl || comp.profilePictureUrl || comp.profile_picture_url;
                  return (
                    <TouchableOpacity
                      key={`match-comp-${comp.id || compName}-${idx}`}
                      style={styles.searchRow}
                      onPress={() => handleCompanyClick(comp)}
                      activeOpacity={0.65}
                    >
                      <CompanyLogoAvatar
                        logoUrl={compLogo}
                        companyName={compName}
                        size={36}
                        borderRadius={8}
                        style={{ marginRight: 12 }}
                      />
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
                {autocompleteSuggestions.jobs.map((job, idx) => {
                  const jobLogo = job.companyLogo || job.company_logo || (job as any)?.logo || (job as any)?.logoUrl || (job as any)?.profile_picture_url;
                  return (
                    <TouchableOpacity
                      key={`match-job-${job.id}-${idx}`}
                      style={styles.searchRow}
                      onPress={() => handleJobClick(job)}
                      activeOpacity={0.65}
                    >
                      <CompanyLogoAvatar
                        logoUrl={jobLogo}
                        companyName={job.company}
                        size={36}
                        borderRadius={8}
                        style={{ marginRight: 12 }}
                      />
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
                  );
                })}

                <TouchableOpacity
                  style={styles.viewAllMatchingBtn}
                  onPress={() => handleExecuteSearch(searchQuery)}
                  activeOpacity={0.7}
                >
                  <Briefcase size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.viewAllMatchingText} numberOfLines={1}>
                    Search all jobs matching "{searchQuery.trim()}" in Find Jobs
                  </Text>
                  <ArrowUpRight size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Matching Trades */}
            {autocompleteSuggestions.trades.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>POPULAR ROLES & TRADES</Text>
                </View>
                {autocompleteSuggestions.trades.map((trade, idx) => (
                  <TouchableOpacity
                    key={`match-trade-${trade}-${idx}`}
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
                {autocompleteSuggestions.locations.map((loc, idx) => (
                  <TouchableOpacity
                    key={`match-loc-${loc}-${idx}`}
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
                  <View key={`recent-${term}-${index}`} style={styles.searchRow}>
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

            {/* 2. TOP INDUSTRIAL EMPLOYERS (Real Platform Registered Companies) */}
            {platformCompanies.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>TOP INDUSTRIAL EMPLOYERS</Text>
                </View>

                {platformCompanies.map((comp, idx) => (
                  <TouchableOpacity
                    key={`platform-comp-${comp.id || comp.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleCompanyClick(comp)}
                    activeOpacity={0.65}
                  >
                    <CompanyLogoAvatar
                      logoUrl={comp.logo}
                      companyName={comp.name}
                      size={36}
                      borderRadius={8}
                      style={{ marginRight: 12 }}
                    />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{comp.name}</Text>
                      <Text style={styles.rowSubText}>{comp.industry} • {comp.location}</Text>
                    </View>
                    <ChevronRight size={15} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* 3. TRENDING INDUSTRIAL ROLES */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>TRY SEARCHING FOR</Text>
              </View>

              {TRENDING_ROLES.map((role, idx) => (
                <TouchableOpacity
                  key={`trending-${role}-${idx}`}
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

              {TRENDING_LOCATIONS.map((loc, idx) => (
                <TouchableOpacity
                  key={`hub-${loc}-${idx}`}
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  backButton: {
    padding: 6,
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
  noResultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  noResultsIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noResultsTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  noResultsSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  searchTipsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
  },
  searchTipsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  searchTipItem: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 4,
  },
  popularFallbackSection: {
    width: '100%',
  },
  popularFallbackTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  popularChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  popularChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  searchingLoadingContainer: {
    paddingVertical: 12,
  },
  searchingLoadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 6,
  },
  searchingLoadingText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  skeletonItemBox: {
    height: 68,
    backgroundColor: '#F1F5F9',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 0,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTabLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTabLabelActive: {
    color: '#FFFFFF',
  },
  viewAllMatchingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 8,
  },
  viewAllMatchingText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
