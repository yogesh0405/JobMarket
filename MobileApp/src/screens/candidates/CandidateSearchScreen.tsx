import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
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
  User as UserIcon,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building2,
  ArrowUpRight,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { apiFetch } from '../../api/client';
import {
  ExtendedCandidate,
  SEED_CANDIDATES,
  safeString,
} from './components/CandidatesUtils';

const CANDIDATE_RECENT_SEARCHES_STORAGE_KEY = '@jobmarket_candidate_recent_searches_v2';

const TRENDING_ROLES = [
  'CNC Machine Operator',
  'VMC 3-Axis Machinist',
  'ITI Fitter',
  'Industrial Electrician',
  'Quality Inspector (QA/QC)',
  'MIG / TIG Welder',
  'Tool & Die Maker',
  'Plastic Injection Moulding Setter',
];

const TRENDING_LOCATIONS = [
  'Waluj MIDC, Chhatrapati Sambhajinagar',
  'Shendra MIDC Industrial Area',
  'Chitegaon MIDC',
  'Chakan MIDC, Pune',
  'Bhosari MIDC, Pune',
  'Chikalthana Industrial Area',
];

const POPULAR_INDUSTRIES = [
  'Automotive & Auto Components',
  'Industrial & Heavy Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Plastics, Polymers & Rubber',
  'Textiles & Garments',
];

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialQuery = route?.params?.initialQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [allCandidates, setAllCandidates] = useState<ExtendedCandidate[]>(SEED_CANDIDATES);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadRecentSearches();
    fetchAllCandidates();
    const timeout = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(CANDIDATE_RECENT_SEARCHES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 10));
        }
      }
    } catch (e) {
      console.warn('Failed to load candidate recent searches:', e);
    }
  };

  const saveSearchToHistory = async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem(CANDIDATE_RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save candidate search history:', e);
    }
  };

  const removeSingleRecentSearch = async (keyword: string) => {
    try {
      const updated = recentSearches.filter((item) => item !== keyword);
      setRecentSearches(updated);
      await AsyncStorage.setItem(CANDIDATE_RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to remove recent search:', e);
    }
  };

  const clearAllRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(CANDIDATE_RECENT_SEARCHES_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  };

  const fetchAllCandidates = async () => {
    try {
      const res = await apiFetch('/api/v1/jobs/workers/all');
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list) && list.length > 0) {
        setAllCandidates(list);
      }
    } catch (_) {
      // Retain SEED_CANDIDATES
    }
  };

  const handleExecuteSearch = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    saveSearchToHistory(trimmed);
    navigation.navigate('EmployerMain', {
      screen: 'CandidatesTab',
      params: { appliedSearchQuery: trimmed },
    });
  };

  const handleCandidateClick = (candidate: ExtendedCandidate) => {
    saveSearchToHistory(candidate.name || searchQuery);
    navigation.navigate('EmployerCandidateDetail', { candidate });
  };

  // Autocomplete Multi-Category Results Engine
  const autocompleteSuggestions = useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();
    if (!trimmed) {
      return { candidates: [], trades: [], locations: [], industries: [] };
    }

    const tokens = trimmed.split(/[\s,+/&|]+/).filter((t: string) => t.length > 0);

    // Matching live candidates
    const matchedCandidates = allCandidates.filter((cand) => {
      const name = (cand.name || '').toLowerCase();
      const location = (cand.location || (cand as any).city || (cand as any).state || '').toLowerCase();
      const midcZone = ((cand as any).midc_zone || (cand as any).midcZone || '').toLowerCase();
      const headline = (cand.headline || '').toLowerCase();
      const title = (cand.title || '').toLowerCase();
      const trade = (cand.trade_specialization || (cand as any).tradeSpecialization || '').toLowerCase();
      const industry = (cand.industry || '').toLowerCase();
      const bio = (cand.bio || '').toLowerCase();
      const skillsStr = Array.isArray(cand.skills) ? cand.skills.join(' ').toLowerCase() : '';
      const eduStr = safeString(cand.education).toLowerCase();
      const expStr = safeString(cand.experience).toLowerCase();
      const shiftStr = ((cand as any).preferred_shift || (cand as any).preferredShift || '').toLowerCase();

      const combinedText = `${name} ${location} ${midcZone} ${headline} ${title} ${trade} ${industry} ${bio} ${skillsStr} ${eduStr} ${expStr} ${shiftStr}`;

      return tokens.every((token: string) => {
        if (token === 'fresher' || token === 'freshers') {
          return expStr.includes('fresher') || expStr.includes('0 yr') || cand.experience_years === 0;
        }
        if (token === 'iti') {
          return eduStr.includes('iti') || trade.includes('iti') || headline.includes('iti');
        }
        if (token === 'diploma') {
          return eduStr.includes('diploma') || headline.includes('diploma');
        }
        return combinedText.includes(token);
      });
    });

    // Matching Roles & Trades
    const matchedTrades = TRENDING_ROLES.filter((role) =>
      role.toLowerCase().includes(trimmed) || tokens.some((t: string) => role.toLowerCase().includes(t))
    );

    // Matching Locations
    const matchedLocations = TRENDING_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(trimmed) || tokens.some((t: string) => loc.toLowerCase().includes(t))
    );

    // Matching Industries
    const matchedIndustries = POPULAR_INDUSTRIES.filter((ind) =>
      ind.toLowerCase().includes(trimmed) || tokens.some((t: string) => ind.toLowerCase().includes(t))
    );

    return {
      candidates: matchedCandidates.slice(0, 15),
      trades: matchedTrades.slice(0, 5),
      locations: matchedLocations.slice(0, 5),
      industries: matchedIndustries.slice(0, 5),
    };
  }, [allCandidates, debouncedQuery]);

  const hasAnySuggestions =
    autocompleteSuggestions.candidates.length > 0 ||
    autocompleteSuggestions.trades.length > 0 ||
    autocompleteSuggestions.locations.length > 0 ||
    autocompleteSuggestions.industries.length > 0;

  const isQueryActive = debouncedQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP HEADER: Clean Navigation Search Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#0F172A" strokeWidth={1.85} />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Search size={15} color="#64748B" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search candidate name, skills, trade, zone..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={() => handleExecuteSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <X size={14} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {searchQuery.trim().length > 0 && (
          <TouchableOpacity
            style={styles.searchActionBtn}
            onPress={() => handleExecuteSearch(searchQuery)}
            activeOpacity={0.7}
          >
            <Text style={styles.searchActionBtnText}>Search</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* BODY LIST CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isQueryActive ? (
          /* VIEW A: AUTOCOMPLETE LIVE RESULTS */
          <View style={styles.listContainer}>
            {/* Direct Query Search Row */}
            <TouchableOpacity
              style={styles.searchRow}
              onPress={() => handleExecuteSearch(searchQuery)}
              activeOpacity={0.65}
            >
              <Search size={15} color={COLORS.primary} style={styles.rowIcon} />
              <View style={styles.rowContent}>
                <Text style={styles.primaryQueryText} numberOfLines={1}>
                  Search candidates for "<Text style={{ fontWeight: '700', color: COLORS.primary }}>{searchQuery.trim()}</Text>"
                </Text>
              </View>
              <ArrowUpRight size={15} color={COLORS.primary} />
            </TouchableOpacity>

            {/* No Results Box */}
            {!hasAnySuggestions ? (
              <View style={styles.noResultsContainer}>
                <View style={styles.noResultsIconBox}>
                  <SearchX size={24} color="#64748B" />
                </View>
                <Text style={styles.noResultsTitle}>No candidates found</Text>
                <Text style={styles.noResultsSub}>
                  No candidate profiles match "{searchQuery.trim()}". Try searching with broader terms.
                </Text>

                {/* Popular Roles Vertical Rows */}
                <View style={styles.searchTipsBox}>
                  <Text style={styles.searchTipsHeader}>SUGGESTED ROLES</Text>
                  {TRENDING_ROLES.slice(0, 4).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={styles.innerTipRow}
                      onPress={() => handleExecuteSearch(role)}
                      activeOpacity={0.65}
                    >
                      <TrendingUp size={14} color="#64748B" style={styles.rowIcon} />
                      <Text style={styles.innerTipText}>{role}</Text>
                      <ArrowUpRight size={13} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Matching Candidate Profiles */}
            {autocompleteSuggestions.candidates.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>MATCHING CANDIDATES</Text>
                </View>
                {autocompleteSuggestions.candidates.map((cand) => {
                  return (
                    <TouchableOpacity
                      key={cand.id || cand.name}
                      style={styles.searchRow}
                      onPress={() => handleCandidateClick(cand)}
                      activeOpacity={0.65}
                    >
                      {cand.profile_picture_url || cand.avatarUrl ? (
                        <Image
                          source={{ uri: cand.profile_picture_url || cand.avatarUrl }}
                          style={styles.candidateAvatar}
                        />
                      ) : (
                        <View style={styles.candidateAvatarPlaceholder}>
                          <UserIcon size={16} color={COLORS.primary} />
                        </View>
                      )}
                      <View style={styles.rowContent}>
                        <View style={styles.nameRow}>
                          <Text style={styles.rowTitleText} numberOfLines={1}>
                            {cand.name}
                          </Text>
                          {(cand.verified || cand.aadhaar_verified) && (
                            <ShieldCheck size={12} color="#059669" style={{ marginLeft: 4 }} />
                          )}
                        </View>
                        <Text style={styles.rowSubText} numberOfLines={1}>
                          {cand.headline || cand.title || cand.trade_specialization || 'Industrial Workforce'} • {cand.location || 'MIDC'}
                        </Text>
                      </View>
                      <ChevronRight size={14} color="#CBD5E1" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {/* Matching Trades & Roles (Separate Vertical Rows) */}
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
                    <TrendingUp size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{trade}</Text>
                      <Text style={styles.rowSubText}>Candidate Trade / Role</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Matching Locations (Separate Vertical Rows) */}
            {autocompleteSuggestions.locations.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>LOCATIONS & MIDC ZONES</Text>
                </View>
                {autocompleteSuggestions.locations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(loc.split(',')[0])}
                    activeOpacity={0.65}
                  >
                    <MapPin size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{loc}</Text>
                      <Text style={styles.rowSubText}>Industrial Location</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Matching Industries (Separate Vertical Rows) */}
            {autocompleteSuggestions.industries.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>INDUSTRIES & SECTORS</Text>
                </View>
                {autocompleteSuggestions.industries.map((ind) => (
                  <TouchableOpacity
                    key={ind}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(ind)}
                    activeOpacity={0.65}
                  >
                    <Building2 size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{ind}</Text>
                      <Text style={styles.rowSubText}>Industrial Sector</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          /* VIEW B: RECENT SEARCHES & TRENDING (DEFAULT EMPTY STATE) */
          <View style={styles.listContainer}>
            {/* 1. RECENT CANDIDATE SEARCHES */}
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
                      <Clock size={15} color="#64748B" style={styles.rowIcon} />
                      <Text style={styles.rowTitleText} numberOfLines={1}>
                        {term}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeSingleRecentSearch(term)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}

            {/* 2. TRENDING CANDIDATE ROLES (Separate Vertical Rows) */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>TRENDING CANDIDATE ROLES</Text>
              </View>
              {TRENDING_ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.searchRow}
                  onPress={() => handleExecuteSearch(role)}
                  activeOpacity={0.65}
                >
                  <TrendingUp size={15} color="#64748B" style={styles.rowIcon} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitleText}>{role}</Text>
                    <Text style={styles.rowSubText}>Verified Candidates Available</Text>
                  </View>
                  <ArrowUpRight size={14} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. POPULAR INDUSTRIAL ZONES (Separate Vertical Rows) */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>POPULAR INDUSTRIAL ZONES</Text>
              </View>
              {TRENDING_LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={styles.searchRow}
                  onPress={() => handleExecuteSearch(loc.split(',')[0])}
                  activeOpacity={0.65}
                >
                  <MapPin size={15} color="#64748B" style={styles.rowIcon} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitleText}>{loc}</Text>
                    <Text style={styles.rowSubText}>Candidate Concentration</Text>
                  </View>
                  <ArrowUpRight size={14} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>

            {/* 4. POPULAR INDUSTRIAL SECTORS (Separate Vertical Rows) */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>POPULAR INDUSTRIAL SECTORS</Text>
              </View>
              {POPULAR_INDUSTRIES.map((ind) => (
                <TouchableOpacity
                  key={ind}
                  style={styles.searchRow}
                  onPress={() => handleExecuteSearch(ind)}
                  activeOpacity={0.65}
                >
                  <Building2 size={15} color="#64748B" style={styles.rowIcon} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitleText}>{ind}</Text>
                    <Text style={styles.rowSubText}>Manufacturing & Production</Text>
                  </View>
                  <ArrowUpRight size={14} color="#94A3B8" />
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
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
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
    paddingHorizontal: 11,
    height: 36,
    borderWidth: 1.1,
    borderColor: '#CBD5E1',
  },
  searchIcon: {
    marginRight: 7,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
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
    fontSize: 12.5,
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
    marginTop: 8,
    borderBottomWidth: 5,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  sectionHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  clearAllText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowIcon: {
    marginRight: 13,
  },
  rowContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 12,
    backgroundColor: '#EFF6FF',
  },
  candidateAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentClickArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitleText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#0F172A',
  },
  rowSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  primaryQueryText: {
    fontSize: 12.5,
    color: '#0F172A',
  },
  deleteBtn: {
    padding: 4,
  },
  noResultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  noResultsIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noResultsTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  noResultsSub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 17,
  },
  searchTipsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
  },
  searchTipsHeader: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  innerTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  innerTipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
});
