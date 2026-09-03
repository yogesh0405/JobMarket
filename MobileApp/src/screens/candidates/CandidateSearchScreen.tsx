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
  Keyboard,
  ActivityIndicator,
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
  Wrench,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { apiFetch } from '../../api/client';
import {
  ExtendedCandidate,
  SEED_CANDIDATES,
  safeString,
} from './components/CandidatesUtils';

const CANDIDATE_RECENT_SEARCHES_STORAGE_KEY = '@jobmarket_candidate_recent_searches_v2';

interface Props {
  navigation: any;
  route?: any;
}

interface SuggestionItem {
  name: string;
  count: number;
}

export const CandidateSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialQuery = route?.params?.initialQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
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
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setDebouncedQuery(searchQuery);
        setIsSearching(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setDebouncedQuery('');
      setIsSearching(false);
    }
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
      const updated = [
        trimmed,
        ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 10);
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
      let rawList: any[] = [];
      const res1 = await apiFetch('/api/v1/jobs/workers/all').catch(() => null);
      if (res1 && res1.success && Array.isArray(res1.data) && res1.data.length > 0) {
        rawList = res1.data;
      } else {
        const res2 = await apiFetch('/api/candidates').catch(() => null);
        if (res2 && res2.success && Array.isArray(res2.data) && res2.data.length > 0) {
          rawList = res2.data;
        }
      }

      if (rawList.length > 0) {
        const formatted: ExtendedCandidate[] = rawList.map((item: any, idx: number) => {
          const rawExperience = item.experience_details || item.experience;
          const rawEducation = item.education_details || item.education;
          const expYears = typeof item.experience === 'number' ? `${item.experience} Years` : safeString(item.experience, '2 Years');
          const fallbackPhoto = SEED_CANDIDATES[idx % SEED_CANDIDATES.length]?.avatarUrl;
          const photo =
            item.profilePictureUrl ||
            item.profile_picture_url ||
            item.avatarUrl ||
            item.avatar_url ||
            item.avatar ||
            item.photo ||
            item.image ||
            fallbackPhoto;

          return {
            ...item,
            id: item.id || `candidate-${idx}`,
            name: safeString(item.name, 'Industrial Candidate'),
            email: safeString(item.email, ''),
            phone: safeString(item.phone, ''),
            avatarUrl: photo,
            profile_picture_url: photo,
            headline: safeString(item.headline || item.title, 'Skilled Factory Technician'),
            title: safeString(item.title || item.headline, 'Machine Operator'),
            trade_specialization: safeString(item.tradeSpecialization || item.trade_specialization, 'CNC / VMC Machinist'),
            industry: safeString(item.industry || item.sector, 'Industrial & Heavy Manufacturing'),
            location: safeString(item.location, 'Waluj MIDC, Chhatrapati Sambhajinagar'),
            skills: Array.isArray(item.skills) && item.skills.length > 0 ? item.skills : ['CNC Operating', 'Machine Maintenance', 'Shop Safety'],
            experience: rawExperience ?? expYears,
            experience_years: typeof item.experience === 'number' ? item.experience : (typeof item.experience_years === 'number' ? item.experience_years : undefined),
            education: rawEducation ?? safeString(item.education, 'ITI Certified'),
            aadhaar_verified: item.aadhaarVerified ?? item.aadhaar_verified ?? true,
            verified: true,
            user: item.user || item,
          };
        });
        setAllCandidates(formatted);
      }
    } catch (_) {
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleExecuteSearch = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    saveSearchToHistory(trimmed);
    setIsSearching(true);
    setSearchQuery(trimmed);
    setDebouncedQuery(trimmed);
    Keyboard.dismiss();
    setTimeout(() => {
      setIsSearching(false);
    }, 150);
  };

  const handleCandidateClick = (candidate: ExtendedCandidate) => {
    saveSearchToHistory(candidate.name || searchQuery);
    navigation.navigate('EmployerCandidateDetail', { candidate });
  };

  // 1. Compute dynamic aggregated suggestions directly from live available candidates
  const dynamicSuggestions = useMemo(() => {
    const roleCounts: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    const industryCounts: Record<string, number> = {};

    allCandidates.forEach((cand) => {
      // Role / Trade
      const role = cand.headline || cand.title || cand.trade_specialization;
      if (role) {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      }

      // Skills
      if (Array.isArray(cand.skills)) {
        cand.skills.forEach((sk) => {
          if (sk) skillCounts[sk] = (skillCounts[sk] || 0) + 1;
        });
      }

      // Location
      if (cand.location) {
        locationCounts[cand.location] = (locationCounts[cand.location] || 0) + 1;
      }

      // Industry
      if (cand.industry) {
        industryCounts[cand.industry] = (industryCounts[cand.industry] || 0) + 1;
      }
    });

    return {
      topRoles: Object.entries(roleCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      topSkills: Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      topLocations: Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      topIndustries: Object.entries(industryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    };
  }, [allCandidates]);

  // 2. Computed live autocomplete filtered lists
  const autocompleteSuggestions = useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();
    if (!trimmed) {
      return { candidates: [], trades: [], skills: [], locations: [], industries: [] };
    }

    const tokens = trimmed.split(/[\s,+/&|]+/).filter((t: string) => t.length > 0);

    const matchedCandidates = allCandidates.filter((cand) => {
      const name = (cand.name || '').toLowerCase();
      const location = (cand.location || (cand as any).city || (cand as any).state || (cand as any).midc_zone || '').toLowerCase();
      const headline = (cand.headline || '').toLowerCase();
      const title = (cand.title || '').toLowerCase();
      const trade = (cand.trade_specialization || '').toLowerCase();
      const industry = (cand.industry || '').toLowerCase();
      const bio = (cand.bio || '').toLowerCase();
      const skillsStr = Array.isArray(cand.skills) ? cand.skills.join(' ').toLowerCase() : '';
      const eduStr = safeString(cand.education).toLowerCase();
      const expStr = safeString(cand.experience).toLowerCase();

      const combinedText = `${name} ${location} ${headline} ${title} ${trade} ${industry} ${bio} ${skillsStr} ${eduStr} ${expStr}`;

      return tokens.every((token: string) => combinedText.includes(token));
    });

    // Matching only Roles that exist in live candidates and match the query
    const matchedTrades: SuggestionItem[] = dynamicSuggestions.topRoles.filter((item) => {
      const lower = item.name.toLowerCase();
      return lower.includes(trimmed) || tokens.some((t: string) => lower.includes(t));
    });

    // Matching only Skills that exist in live candidates and match the query
    const matchedSkills: SuggestionItem[] = dynamicSuggestions.topSkills.filter((item) => {
      const lower = item.name.toLowerCase();
      return lower.includes(trimmed) || tokens.some((t: string) => lower.includes(t));
    });

    // Matching only Locations that exist in live candidates and match the query
    const matchedLocations: SuggestionItem[] = dynamicSuggestions.topLocations.filter((item) => {
      const lower = item.name.toLowerCase();
      return lower.includes(trimmed) || tokens.some((t: string) => lower.includes(t));
    });

    // Matching only Industries that exist in live candidates and match the query
    const matchedIndustries: SuggestionItem[] = dynamicSuggestions.topIndustries.filter((item) => {
      const lower = item.name.toLowerCase();
      return lower.includes(trimmed) || tokens.some((t: string) => lower.includes(t));
    });

    return {
      candidates: matchedCandidates.slice(0, 15),
      trades: matchedTrades.slice(0, 5),
      skills: matchedSkills.slice(0, 5),
      locations: matchedLocations.slice(0, 5),
      industries: matchedIndustries.slice(0, 5),
    };
  }, [allCandidates, debouncedQuery, dynamicSuggestions]);

  const hasAnySuggestions =
    autocompleteSuggestions.candidates.length > 0 ||
    autocompleteSuggestions.trades.length > 0 ||
    autocompleteSuggestions.skills.length > 0 ||
    autocompleteSuggestions.locations.length > 0 ||
    autocompleteSuggestions.industries.length > 0;

  const isQueryActive = debouncedQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP SEARCH HEADER BAR */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Search size={17} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search candidate name, role, trade..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleExecuteSearch(searchQuery)}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setDebouncedQuery('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color="#94A3B8" />
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
        {isSearching || (isQueryActive && isLoadingCandidates) ? (
          <View style={styles.searchingLoadingContainer}>
            <View style={styles.searchingLoadingBadge}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.searchingLoadingText}>
                {searchQuery.trim()
                  ? `Searching candidate profiles for "${searchQuery.trim()}"...`
                  : 'Loading candidate profiles...'}
              </Text>
            </View>
            <View style={{ gap: 10, paddingHorizontal: 16, marginTop: 12 }}>
              <View style={styles.skeletonItemBox} />
              <View style={styles.skeletonItemBox} />
              <View style={styles.skeletonItemBox} />
            </View>
          </View>
        ) : isQueryActive ? (
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
                <Text style={styles.noResultsTitle}>No matching candidates found</Text>
                <Text style={styles.noResultsSub}>
                  No candidate profiles match "{searchQuery.trim()}". Try searching with popular roles or skills below.
                </Text>

                {/* Popular Available Roles Vertical Rows */}
                {dynamicSuggestions.topRoles.length > 0 ? (
                  <View style={styles.searchTipsBox}>
                    <Text style={styles.searchTipsHeader}>AVAILABLE CANDIDATE ROLES</Text>
                    {dynamicSuggestions.topRoles.slice(0, 4).map((roleItem) => (
                      <TouchableOpacity
                        key={roleItem.name}
                        style={styles.innerTipRow}
                        onPress={() => handleExecuteSearch(roleItem.name)}
                        activeOpacity={0.65}
                      >
                        <TrendingUp size={14} color={COLORS.primary} style={styles.rowIcon} />
                        <Text style={styles.innerTipText}>{roleItem.name}</Text>
                        <Text style={styles.innerTipCountText}>({roleItem.count} available)</Text>
                        <ArrowUpRight size={13} color="#94A3B8" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* 1. Matching Candidate Profiles */}
            {autocompleteSuggestions.candidates.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>MATCHING CANDIDATES ({autocompleteSuggestions.candidates.length})</Text>
                </View>
                {autocompleteSuggestions.candidates.map((cand, idx) => {
                  return (
                    <TouchableOpacity
                      key={`cand-${cand.id || cand.name}-${idx}`}
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

            {/* 2. Matching Roles & Trades */}
            {autocompleteSuggestions.trades.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>MATCHING ROLES & TRADES</Text>
                </View>
                {autocompleteSuggestions.trades.map((item, idx) => (
                  <TouchableOpacity
                    key={`cand-trade-${item.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(item.name)}
                    activeOpacity={0.65}
                  >
                    <TrendingUp size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{item.name}</Text>
                      <Text style={styles.rowSubText}>{item.count} {item.count === 1 ? 'candidate' : 'candidates'} available</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* 3. Matching In-Demand Skills */}
            {autocompleteSuggestions.skills.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>MATCHING SKILLS</Text>
                </View>
                {autocompleteSuggestions.skills.map((item, idx) => (
                  <TouchableOpacity
                    key={`cand-skill-${item.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(item.name)}
                    activeOpacity={0.65}
                  >
                    <Wrench size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{item.name}</Text>
                      <Text style={styles.rowSubText}>{item.count} candidates skilled in {item.name}</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* 4. Matching Locations */}
            {autocompleteSuggestions.locations.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>MATCHING LOCATIONS & MIDC ZONES</Text>
                </View>
                {autocompleteSuggestions.locations.map((item, idx) => (
                  <TouchableOpacity
                    key={`cand-loc-${item.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(item.name.split(',')[0])}
                    activeOpacity={0.65}
                  >
                    <MapPin size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{item.name}</Text>
                      <Text style={styles.rowSubText}>{item.count} candidates located here</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* 5. Matching Industries */}
            {autocompleteSuggestions.industries.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>MATCHING INDUSTRIES & SECTORS</Text>
                </View>
                {autocompleteSuggestions.industries.map((item, idx) => (
                  <TouchableOpacity
                    key={`cand-ind-${item.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(item.name)}
                    activeOpacity={0.65}
                  >
                    <Building2 size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{item.name}</Text>
                      <Text style={styles.rowSubText}>{item.count} candidates in this sector</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          /* VIEW B: RECENT SEARCHES & REAL DYNAMIC CANDIDATE DATA (DEFAULT STATE) */
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

            {/* 2. REAL CANDIDATE ROLES (Available in Database) */}
            {dynamicSuggestions.topRoles.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>POPULAR CANDIDATE ROLES</Text>
                </View>
                {dynamicSuggestions.topRoles.slice(0, 6).map((item, idx) => (
                  <TouchableOpacity
                    key={`top-role-${item.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(item.name)}
                    activeOpacity={0.65}
                  >
                    <TrendingUp size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{item.name}</Text>
                      <Text style={styles.rowSubText}>{item.count} verified {item.count === 1 ? 'candidate' : 'candidates'} available</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* 3. IN-DEMAND TECHNICAL SKILLS (Available in Database) */}
            {dynamicSuggestions.topSkills.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>IN-DEMAND TECHNICAL SKILLS</Text>
                </View>
                {dynamicSuggestions.topSkills.slice(0, 6).map((item, idx) => (
                  <TouchableOpacity
                    key={`top-skill-${item.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(item.name)}
                    activeOpacity={0.65}
                  >
                    <Wrench size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{item.name}</Text>
                      <Text style={styles.rowSubText}>{item.count} {item.count === 1 ? 'candidate' : 'candidates'} with this skill</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* 4. POPULAR INDUSTRIAL ZONES & LOCATIONS (Available in Database) */}
            {dynamicSuggestions.topLocations.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>CANDIDATE LOCATIONS & MIDC ZONES</Text>
                </View>
                {dynamicSuggestions.topLocations.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity
                    key={`top-loc-${item.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(item.name.split(',')[0])}
                    activeOpacity={0.65}
                  >
                    <MapPin size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{item.name}</Text>
                      <Text style={styles.rowSubText}>{item.count} active {item.count === 1 ? 'candidate' : 'candidates'}</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* 5. POPULAR INDUSTRIAL SECTORS (Available in Database) */}
            {dynamicSuggestions.topIndustries.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>INDUSTRIES & SECTORS</Text>
                </View>
                {dynamicSuggestions.topIndustries.slice(0, 5).map((item, idx) => (
                  <TouchableOpacity
                    key={`top-ind-${item.name}-${idx}`}
                    style={styles.searchRow}
                    onPress={() => handleExecuteSearch(item.name)}
                    activeOpacity={0.65}
                  >
                    <Building2 size={15} color="#64748B" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitleText}>{item.name}</Text>
                      <Text style={styles.rowSubText}>{item.count} candidates in this industry</Text>
                    </View>
                    <ArrowUpRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
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
  innerTipCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 6,
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
    marginHorizontal: 16,
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
    height: 72,
    backgroundColor: '#F1F5F9',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
