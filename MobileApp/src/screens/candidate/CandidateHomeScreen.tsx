import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  ArrowRight,
  X,
  Award,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { apiFetch } from '../../api/client';
import { Job, Advertisement } from '../../types';
import { Header } from '../../components/common/Header';
import { COLORS, RADIUS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { JobFilterSideDrawer, FilterOptions } from '../../components/common/JobFilterSideDrawer';
import { ApplicantAdvantageSection } from '../../components/candidate/ApplicantAdvantageSection';
import {
  DEFAULT_ROLE_TABS_DATA,
  RoleTabItem,
} from './components/CandidateHomeConstants';
import { CandidateHomeSearchCard } from './components/CandidateHomeSearchCard';
import { CandidateHomeGridsSection } from './components/CandidateHomeGridsSection';
import { CandidateHomePromoSlider } from './components/CandidateHomePromoSlider';
import { CandidateHomePopularRolesSection } from './components/CandidateHomePopularRolesSection';
import {
  getRealJobCountForKeyword,
  getCleanSearchTerm,
  matchJobAgainstKeyword,
} from './utils/jobMatchUtils';

import { savedJobsStore } from '../../utils/savedJobsStore';

interface Props {
  navigation: any;
}

export const CandidateHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(savedJobsStore.getSavedIds());
  const [promoBanners, setPromoBanners] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setSavedJobIds(savedJobsStore.getSavedIds());
    const unsubscribe = savedJobsStore.subscribe(() => {
      setSavedJobIds(savedJobsStore.getSavedIds());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Top Search Bar & Live Autocomplete Suggestions State
  const SEARCH_PLACEHOLDERS = ['Search Jobs', 'Search Trades', 'Search Skills', 'Search Locations'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const matchedSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return { jobs: [], trades: [], locations: [] };
    }

    const matchedJobs = jobs
      .filter((j) => {
        const titleMatch = (j.title || '').toLowerCase().includes(trimmed);
        const companyMatch = (j.company || '').toLowerCase().includes(trimmed);
        const industryMatch = (j.industry || '').toLowerCase().includes(trimmed);
        const tradeMatch = (j.trade || '').toLowerCase().includes(trimmed);
        const skillsMatch = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(trimmed));
        return titleMatch || companyMatch || industryMatch || tradeMatch || skillsMatch;
      })
      .slice(0, 4);

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
    const matchedTrades = popularTrades
      .filter((t) => t.toLowerCase().includes(trimmed))
      .slice(0, 3);

    const defaultMIDCs = [
      'Waluj MIDC, Chhatrapati Sambhajinagar',
      'Chakan MIDC, Pune',
      'Bhosari MIDC, Pune',
      'Shendra MIDC',
      'Chikalthana MIDC',
      'Taloja MIDC, Navi Mumbai',
      'Thane Belapur MIDC',
      'Ranjangaon MIDC',
    ];
    const jobLocations = jobs.map((j) => j.location).filter(Boolean);
    const allLocations = Array.from(new Set([...defaultMIDCs, ...jobLocations]));
    const matchedLocations = allLocations
      .filter((l) => l.toLowerCase().includes(trimmed))
      .slice(0, 3);

    return {
      jobs: matchedJobs,
      trades: matchedTrades,
      locations: matchedLocations,
    };
  }, [searchQuery, jobs]);

  const DEFAULT_HOME_FILTERS: FilterOptions = useMemo(
    () => ({
      industry: 'All Industries',
      jobType: 'All Types',
      workMode: 'All Modes',
      minExperience: 'All Experience',
      salaryMin: 0,
      midcZone: 'All MIDC Zones',
      busFacility: false,
      canteen: false,
      accommodation: false,
      overtime: false,
    }),
    []
  );

  const [homeFilterDrawerOpen, setHomeFilterDrawerOpen] = useState(false);
  const [homeFilters, setHomeFilters] = useState<FilterOptions>(DEFAULT_HOME_FILTERS);

  // Hero Search Card State
  const [selectedIndustry, setSelectedIndustry] = useState('Select Industry');
  const [selectedEducation, setSelectedEducation] = useState('Select Education');
  const [locationQuery, setLocationQuery] = useState('');

  // Role Tab State
  const [roleTabsList, setRoleTabsList] = useState<RoleTabItem[]>(DEFAULT_ROLE_TABS_DATA);
  const [activeRoleTab, setActiveRoleTab] = useState('All Opportunities');
  const [totalCompaniesCount, setTotalCompaniesCount] = useState<number>(0);
  const homeRefreshOffsetRef = useRef(0);

  const loadHomeData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const [jobsRes, savedRes, settingsRes, adsRes, compRes] = await Promise.all([
        candidateApi.getAllJobs(),
        candidateApi.getSavedJobs().catch(() => ({ success: false, data: [] })),
        candidateApi.getSettings().catch(() => ({ success: false, data: null })),
        apiFetch('/api/v1/home/advertisements').catch(() => ({ success: false, data: [] })),
        apiFetch('/api/v1/companies').catch(() => ({ success: false, data: [] })),
      ]);

      if (compRes) {
        const compList = Array.isArray(compRes) ? compRes : (compRes.data || []);
        if (Array.isArray(compList) && compList.length > 0) {
          setTotalCompaniesCount(compList.length);
        }
      }

      if (jobsRes.success && jobsRes.data) {
        const rawJobs = jobsRes.data || [];
        if (rawJobs.length > 0) {
          homeRefreshOffsetRef.current = (homeRefreshOffsetRef.current + 3) % rawJobs.length;
        }
        const offset = homeRefreshOffsetRef.current;
        const rotatedJobs = rawJobs.length > 0 ? [...rawJobs.slice(offset), ...rawJobs.slice(0, offset)] : rawJobs;
        setJobs(rotatedJobs);
      }
      if (savedRes.success && savedRes.data) {
        savedJobsStore.setSavedJobs(savedRes.data);
        setSavedJobIds(savedJobsStore.getSavedIds());
      }

      if (adsRes && adsRes.success && Array.isArray(adsRes.data)) {
        const now = Date.now();
        const activeDbBanners = adsRes.data.filter((ad: Advertisement) => {
          if (ad.is_active === false) return false;
          const status = (ad.status || ad.approval_status || '').toUpperCase();
          if (status !== 'APPROVED' && status !== 'PUBLISHED') return false;
          if (ad.end_date) {
            const endTime = new Date(ad.end_date).getTime();
            if (!isNaN(endTime) && endTime <= now) return false;
          }
          return true;
        });
        setPromoBanners(activeDbBanners);
      } else {
        setPromoBanners([]);
      }

      const settingsData: any = settingsRes;
      if (settingsData && settingsData.success && settingsData.data && settingsData.data.role_tabs_config) {
        try {
          const parsed = JSON.parse(settingsData.data.role_tabs_config);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeTabs: RoleTabItem[] = parsed
              .filter((tab: any) => tab.enabled !== false)
              .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
              .map((tab: any, index: number) => {
                const labelStr = tab.label || tab.id;
                const isAll = tab.id.toLowerCase() === 'all' || labelStr.toLowerCase().includes('all opportunities');
                return {
                  id: isAll ? 'All Opportunities' : tab.id,
                  label: `${index + 1}. ${labelStr}`,
                  keyword: isAll ? '' : tab.id.toLowerCase(),
                  enabled: true,
                  priority: tab.priority || index + 1,
                };
              });

            if (activeTabs.length > 0) {
              setRoleTabsList(activeTabs);
            }
          }
        } catch (e) {
          console.log('Error parsing backend role_tabs_config:', e);
        }
      }
    } catch (e: any) {
      // Graceful error catch for unauthenticated home screen data load
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData(false);
    }, [loadHomeData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    loadHomeData(true);
  };

  const handleToggleSave = useCallback((jobId: string) => {
    const foundJob = jobs.find((j) => String(j.id) === String(jobId));
    savedJobsStore.toggleSave(foundJob || jobId).then((isSaved) => {
      if (isSaved) {
        showToast('Job saved to bookmarks!', 'success');
      } else {
        showToast('Job removed from bookmarks', 'info');
      }
    });
  }, [jobs, showToast]);

  const handleSearchSubmit = () => {
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params: {
        keyword: searchQuery.trim() || undefined,
        location: locationQuery.trim() || undefined,
        industry: selectedIndustry !== 'Select Industry' ? selectedIndustry : undefined,
        education: selectedEducation !== 'Select Education' ? selectedEducation : undefined,
      },
    });
  };

  const handleQuickTradeSearch = (tradeName: string, filterType: 'trade' | 'education' = 'trade') => {
    const cleanSearchTerm = getCleanSearchTerm(tradeName);
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params: {
        keyword: cleanSearchTerm,
        rawFilterTitle: tradeName,
        filterType,
        education: filterType === 'education' ? cleanSearchTerm : undefined,
      },
    });
  };

  const handleOpenFilter = () => {
    navigation.navigate('JobFilter', {
      currentFilters: homeFilters,
      totalMatchingJobsCount: jobs?.length || 0,
      onApplyFilters: (applied: FilterOptions) => {
        setHomeFilters(applied);
        navigation.navigate('CandidateJobsTab', {
          screen: 'CandidateJobSearch',
          params: { homeFilters: applied },
        });
      },
      onResetFilters: () => setHomeFilters(DEFAULT_HOME_FILTERS),
    });
  };

  const getRealJobCount = useCallback((keyword: string) => {
    return getRealJobCountForKeyword(jobs, keyword);
  }, [jobs]);

  const getRoleJobCount = useCallback((tabId: string, keyword: string) => {
    const isAll = tabId === 'All Opportunities' || tabId.toLowerCase() === 'all' || (keyword && keyword.toLowerCase() === 'all');
    if (isAll) return jobs.length;
    return getRealJobCountForKeyword(jobs, keyword || tabId);
  }, [jobs]);

  const roleFilteredJobs = useMemo(() => {
    const isAll = activeRoleTab === 'All Opportunities' || activeRoleTab.toLowerCase() === 'all';
    if (isAll) return jobs;

    const tabObj = roleTabsList.find((t) => t.id === activeRoleTab);
    const rawKw = tabObj?.keyword || tabObj?.label || activeRoleTab;
    return jobs.filter((j) => matchJobAgainstKeyword(j, rawKw));
  }, [jobs, activeRoleTab, roleTabsList]);

  const handleBannerPress = (banner?: Advertisement) => {
    if (!banner) return;
    if (banner.id) {
      apiFetch(`/api/v1/home/advertisements/${banner.id}/click`, { method: 'POST' }).catch(() => {});
    }
    if (banner.linked_job_id) {
      navigation.navigate('CandidateJobDetail', { jobId: banner.linked_job_id });
    } else if (banner.redirect_url) {
      handleQuickTradeSearch(banner.redirect_url);
    } else {
      handleQuickTradeSearch('');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        searchPlaceholder={SEARCH_PLACEHOLDERS[placeholderIndex] || 'Search Jobs'}
        searchValue={searchQuery}
        onSearchChange={(txt) => {
          setSearchQuery(txt);
          setShowSuggestions(txt.trim().length > 0);
        }}
        showBack={false}
      />

      {/* Search Autocomplete Suggestions Dropdown Overlay */}
      {showSuggestions && searchQuery.trim().length > 0 ? (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: 320 }}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            <TouchableOpacity
              style={styles.suggestionRowHeader}
              onPress={() => {
                setShowSuggestions(false);
                navigation.navigate('CandidateJobsTab', {
                  screen: 'CandidateJobSearch',
                  params: { keyword: searchQuery.trim() },
                });
              }}
            >
              <Search size={15} color={COLORS.primary} />
              <Text style={styles.suggestionHeaderText} numberOfLines={1}>
                Search all jobs for "<Text style={{ fontWeight: '800', color: COLORS.primary }}>{searchQuery.trim()}</Text>"
              </Text>
              <ArrowRight size={14} color={COLORS.primary} />
            </TouchableOpacity>

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
                    <Briefcase size={16} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionItemTitle} numberOfLines={1}>{j.title}</Text>
                      <Text style={styles.suggestionItemSub} numberOfLines={1}>{j.company} • {j.location}</Text>
                    </View>
                    <ChevronRight size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {matchedSuggestions.trades.length > 0 ? (
              <View style={styles.suggestionGroup}>
                <Text style={styles.suggestionGroupLabel}>POPULAR TRADES & SKILLS</Text>
                {matchedSuggestions.trades.map((trade) => (
                  <TouchableOpacity
                    key={trade}
                    style={styles.suggestionItemRow}
                    onPress={() => {
                      setShowSuggestions(false);
                      navigation.navigate('CandidateJobsTab', {
                        screen: 'CandidateJobSearch',
                        params: { keyword: trade },
                      });
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

            {matchedSuggestions.locations.length > 0 ? (
              <View style={styles.suggestionGroup}>
                <Text style={styles.suggestionGroupLabel}>INDUSTRIAL ZONES & LOCATIONS</Text>
                {matchedSuggestions.locations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={styles.suggestionItemRow}
                    onPress={() => {
                      setShowSuggestions(false);
                      navigation.navigate('CandidateJobsTab', {
                        screen: 'CandidateJobSearch',
                        params: { location: loc },
                      });
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

            <TouchableOpacity
              style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12, marginTop: 4 }}
              onPress={() => setShowSuggestions(false)}
            >
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#64748B' }}>Close Suggestions</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Promotional Banner Slider */}
        <CandidateHomePromoSlider promoBanners={promoBanners} onBannerPress={handleBannerPress} />

        {/* Discover Title Section */}
        <View style={{ marginTop: 12, marginBottom: 8 }}>
          <CandidateHomeSearchCard />
        </View>

        {/* Popular Role Picks Section */}
        <View style={{ marginBottom: 12 }}>
          <CandidateHomePopularRolesSection
            roleTabsList={roleTabsList}
            activeRoleTab={activeRoleTab}
            setActiveRoleTab={setActiveRoleTab}
            getRoleJobCount={getRoleJobCount}
            loading={loading}
            roleFilteredJobs={roleFilteredJobs}
            savedJobIds={savedJobIds}
            handleToggleSave={handleToggleSave}
            navigation={navigation}
          />
        </View>

        {/* Live Stats 2x2 Grid */}
        <View style={styles.statsGrid2x2}>
          <View style={styles.statsRow}>
            <View style={styles.statSquareCard}>
              <Text style={[styles.statValueText, { color: COLORS.primary }]}>
                {jobs.length > 0 ? `${jobs.length}` : '0'}
              </Text>
              <Text style={styles.statLabelText}>Active Listings</Text>
            </View>

            <View style={styles.statSquareCard}>
              <Text style={[styles.statValueText, { color: '#059669' }]}>
                {totalCompaniesCount > 0 ? `${totalCompaniesCount}` : (jobs.length > 0 ? `${jobs.length}` : '0')}
              </Text>
              <Text style={styles.statLabelText}>Factories Hiring</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statSquareCard}>
              <Text style={[styles.statValueText, { color: '#7C3AED' }]}>
                {jobs.length > 0 ? `${jobs.length}` : '0'}
              </Text>
              <Text style={styles.statLabelText}>Verified Workers</Text>
            </View>

            <View style={styles.statSquareCard}>
              <Text style={[styles.statValueText, { color: '#EA580C' }]}>
                {jobs.length > 0 ? `${jobs.length}` : '0'}
              </Text>
              <Text style={styles.statLabelText}>Placements</Text>
            </View>
          </View>
        </View>

        {/* Category & Industry Grids Section */}
        <View style={{ marginTop: 12, marginBottom: 12 }}>
          <CandidateHomeGridsSection
            getRealJobCount={getRealJobCount}
            onQuickTradeSearch={handleQuickTradeSearch}
          />
        </View>

        {/* Applicant Advantage Section (Placed at End of Home Page) */}
        <ApplicantAdvantageSection />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 130,
    gap: 10,
  },
  topSearchPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  topSearchPillRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  searchIconBadge3D: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
    textAlignVertical: 'center',
    paddingVertical: 0,
    margin: 0,
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
  inlineFilterBtnIconOnly: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 10,
    zIndex: 99999,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  suggestionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: RADIUS.card,
    marginBottom: 6,
  },
  suggestionHeaderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  suggestionGroup: {
    marginBottom: 8,
  },
  suggestionGroupLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 4,
    paddingLeft: 4,
  },
  suggestionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: RADIUS.xs,
    backgroundColor: '#F8FAFC',
    marginBottom: 4,
  },
  suggestionItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionItemSub: {
    fontSize: 11,
    color: '#64748B',
  },
  sectionSeparatorDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  statsGrid2x2: {
    gap: 8,
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statSquareCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statValueText: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
});
