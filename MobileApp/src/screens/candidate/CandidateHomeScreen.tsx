import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Modal,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Building2,
  ChevronRight,
  ChevronLeft,
  IndianRupee,
  Users,
  Award,
  Clock,
  TrendingUp,
  CheckCircle2,
  Zap,
  ArrowRight,
  Layers,
  HeartPulse,
  Utensils,
  BookOpen,
  ChevronDown,
  X,
  Bookmark,
  Star,
  Wrench,
  Tv,
  Power,
  Cog,
  Package,
  Shield,
  Folder,
  BarChart2,
  FileText,
  Smartphone,
  Check,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { apiFetch } from '../../api/client';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import { Job, Advertisement } from '../../types';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { JobFilterSideDrawer, FilterOptions } from '../../components/common/JobFilterSideDrawer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 1. Promotional Banners Data (Identical to Web App DEFAULT_PROMOTIONAL_BANNERS)
const PROMO_BANNERS = [
  {
    id: 'banner-1',
    badge: '⚡ MEGA WALK-IN DRIVE',
    title: '500+ Vacancies in Chakan & Waluj MIDC',
    description: 'Spot job offers for ITI Fitters, Welders, CNC Operators & Machine Helpers. Free bus & canteen.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
    tag: 'Chakan MIDC',
    btnText: 'Register Spot Interview',
    color: COLORS.primary,
  },
  {
    id: 'banner-2',
    badge: '⭐ TATA MOTORS RECRUITMENT',
    title: 'Apprentice & Technician Campaign',
    description: 'Immediate openings for 1st & 2nd shift. High stipend + monthly attendance bonus.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=70',
    tag: 'Tata Motors',
    btnText: 'Apply Now',
    color: '#065F46',
  },
  {
    id: 'banner-3',
    badge: '🔥 URGENT HIRING',
    title: 'Senior CNC & VMC Operators Needed',
    description: 'High salary package up to ₹35,000/month + Overtime + Free Hostel accommodation.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=70',
    tag: 'CNC Operator',
    btnText: 'View Vacancy Details',
    color: '#991B1B',
  },
  {
    id: 'banner-4',
    badge: '🏛️ GOVT APPRENTICESHIP',
    title: 'Govt Skill Certification Drive 2026',
    description: 'Government authorized NSDC apprenticeship scheme with official trade certification.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=70',
    tag: 'Apprentice',
    btnText: 'Apply Online',
    color: COLORS.primary,
  },
];

// Industry Select Options
const INDUSTRIES = [
  'Select Industry',
  'Manufacturing & Assembly',
  'CNC Machining & Tooling',
  'Welding & Metal Fabrication',
  'Electricals & Electronics',
  'Quality & Inspection',
  'Logistics & Warehouse',
  'Pharma & Healthcare',
  'Automotive & Engineering',
];

// Education Select Options
const EDUCATIONS = [
  'Select Education',
  '10th Pass',
  '12th Pass',
  'ITI Certificate',
  'Diploma',
  'Graduate (BE / B.Tech / BA / B.Com)',
];

export interface RoleTabItem {
  id: string;
  label: string;
  keyword: string;
  enabled: boolean;
  priority: number;
}

// Default Role Filter Tabs for Popular Role Picks (Dynamically updated from Admin DB)
const DEFAULT_ROLE_TABS_DATA: RoleTabItem[] = [
  { id: 'All Opportunities', label: '1. All Opportunities', keyword: '', enabled: true, priority: 1 },
  { id: 'Welder', label: '2. Welder', keyword: 'welder', enabled: true, priority: 2 },
  { id: 'CNC Operator', label: '3. CNC Operator', keyword: 'cnc', enabled: true, priority: 3 },
  { id: 'Fitter', label: '4. Fitter', keyword: 'fitter', enabled: true, priority: 4 },
  { id: 'Electrician', label: '5. Electrician', keyword: 'electrician', enabled: true, priority: 5 },
  { id: 'Machinist', label: '6. Machinist', keyword: 'machinist', enabled: true, priority: 6 },
  { id: 'Quality Inspector', label: '7. Quality Inspector', keyword: 'quality', enabled: true, priority: 7 },
];

// 3-Column ITI Trade Cards Grid Data
const ITI_TRADES_GRID = [
  { name: 'Fitter', icon: Wrench },
  { name: 'Welder', icon: Zap },
  { name: 'CNC Operator', icon: Tv },
  { name: 'Electrician', icon: Power },
  { name: 'Machinist', icon: Cog },
  { name: 'Helper / Loader', icon: Package },
  { name: 'Quality Inspector', icon: Search },
  { name: 'Apprentice', icon: GraduationCap },
  { name: 'Driver / Forklift', icon: Briefcase },
  { name: 'Security Guard', icon: Shield },
  { name: 'Store Keeper', icon: Folder },
  { name: 'Technician', icon: Wrench },
];

// 3-Column Education Qualification Cards Grid Data
const EDUCATION_GRID = [
  { name: '12th Pass Jobs', icon: GraduationCap },
  { name: 'B.Com Jobs', icon: BarChart2 },
  { name: 'BA Jobs', icon: FileText },
  { name: 'B.E. / B.Tech Jobs', icon: Cog },
  { name: 'Diploma Jobs', icon: CheckCircle2 },
  { name: 'BCA Jobs', icon: Tv },
  { name: 'BBA Jobs', icon: BarChart2 },
  { name: 'B.Sc Jobs', icon: Tv },
  { name: '10th Pass Jobs', icon: GraduationCap },
];

// Hospital & Healthcare Jobs Grid Data
const HOSPITAL_GRID = [
  { name: 'Staff Nurse', icon: HeartPulse },
  { name: 'Ward Boy / Assistant', icon: HeartPulse },
  { name: 'Lab Assistant', icon: HeartPulse },
];

// Hotel, Restaurant & Catering Jobs Grid Data
const HOTEL_GRID = [
  { name: 'Commi 1 Chef / Cook', icon: Utensils },
  { name: 'Hotel Waiter', icon: Utensils },
  { name: 'Housekeeping Associate', icon: Utensils },
];

// School, College & Education Jobs Grid Data
const SCHOOL_GRID = [
  { name: 'Primary Teacher', icon: BookOpen },
  { name: 'High School Teacher', icon: BookOpen },
  { name: 'Librarian Assistant', icon: HeartPulse },
];

interface Props {
  navigation: any;
}

export const CandidateHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [promoBanners, setPromoBanners] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const bannerFlatListRef = useRef<FlatList>(null);

  // Auto-play promotional banner slider with smooth scroll animation
  useEffect(() => {
    if (promoBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActivePromoIndex((prev) => {
        const next = (prev + 1) % promoBanners.length;
        bannerFlatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [promoBanners.length]);

  // Top Search Bar & Live Autocomplete Suggestions State
  const SEARCH_PLACEHOLDERS = ['Search jobs...', 'Search trades...', 'Search locations...'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const [topSearch, setTopSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const topSearchInputRef = React.useRef<TextInput>(null);

  const matchedSuggestions = useMemo(() => {
    const trimmed = topSearch.trim().toLowerCase();

    // 1. Matched Jobs from live PostgreSQL database jobs
    const matchedJobs = jobs.filter((j) => {
      if (!trimmed) return false;
      const titleMatch = (j.title || '').toLowerCase().includes(trimmed);
      const companyMatch = (j.company || '').toLowerCase().includes(trimmed);
      const industryMatch = (j.industry || '').toLowerCase().includes(trimmed);
      const tradeMatch = (j.trade || '').toLowerCase().includes(trimmed);
      const skillsMatch = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(trimmed));
      return titleMatch || companyMatch || industryMatch || tradeMatch || skillsMatch;
    }).slice(0, 4);

    // 2. Matched Trades
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

    // 3. Matched Locations
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
  }, [topSearch, jobs]);

  // Hero Search Card State
  const [selectedIndustry, setSelectedIndustry] = useState('Select Industry');
  const [selectedEducation, setSelectedEducation] = useState('Select Education');
  const [locationQuery, setLocationQuery] = useState('');

  // Modals State
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);

  // Role Tab State (Dynamically updated from Admin DB)
  const [roleTabsList, setRoleTabsList] = useState<RoleTabItem[]>(DEFAULT_ROLE_TABS_DATA);
  const [activeRoleTab, setActiveRoleTab] = useState('All Opportunities');
  const homeRefreshOffsetRef = React.useRef(0);

  const loadHomeData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const [jobsRes, savedRes, settingsRes, adsRes] = await Promise.all([
        candidateApi.getAllJobs(),
        candidateApi.getSavedJobs().catch(() => ({ success: false, data: [] })),
        candidateApi.getSettings().catch(() => ({ success: false, data: null })),
        apiFetch('/api/v1/home/advertisements').catch(() => ({ success: false, data: [] })),
      ]);

      if (jobsRes.success && jobsRes.data) {
        const rawJobs = jobsRes.data || [];
        if (showSkeleton && rawJobs.length > 0) {
          homeRefreshOffsetRef.current = (homeRefreshOffsetRef.current + 3) % rawJobs.length;
        }
        const offset = homeRefreshOffsetRef.current;
        const rotatedJobs = rawJobs.length > 0 ? [...rawJobs.slice(offset), ...rawJobs.slice(0, offset)] : rawJobs;
        setJobs(rotatedJobs);
      }
      if (savedRes.success && savedRes.data) {
        const savedIds = (savedRes.data || []).map((j: any) => j.id);
        setSavedJobIds(savedIds);
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

      // Sync Admin Role Tabs Config dynamically from backend DB settings
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
    } catch (e) {
      console.log('Error loading home data:', e);
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
    setSavedJobIds((prev) => {
      const isSaved = prev.includes(jobId);
      if (isSaved) {
        showToast('Job removed !', 'info');
        return prev.filter((id) => id !== jobId);
      } else {
        showToast('Job saved !', 'success');
        return [...prev, jobId];
      }
    });

    candidateApi.toggleSaveJob(jobId).catch(() => {});
  }, [showToast]);

  const handleSearchSubmit = () => {
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params: {
        keyword: topSearch.trim() || undefined,
        location: locationQuery.trim() || undefined,
        industry: selectedIndustry !== 'Select Industry' ? selectedIndustry : undefined,
        education: selectedEducation !== 'Select Education' ? selectedEducation : undefined,
      },
    });
  };

  const handleOpenFilter = () => {
    setHomeFilterDrawerOpen(true);
  };

  const handleApplyHomeFilters = (appliedFilters: FilterOptions) => {
    setHomeFilters(appliedFilters);
    setHomeFilterDrawerOpen(false);
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params: {
        keyword: topSearch.trim() || undefined,
        location: appliedFilters.midcZone !== 'All MIDC Zones' ? appliedFilters.midcZone : (locationQuery.trim() || undefined),
        industry: appliedFilters.industry !== 'All Industries' ? appliedFilters.industry : (selectedIndustry !== 'Select Industry' ? selectedIndustry : undefined),
        appliedFilters,
      },
    });
  };

  const handleQuickTradeSearch = (
    val: string,
    filterType?: 'keyword' | 'location' | 'industry' | 'education'
  ) => {
    const params: any = {};
    if (filterType === 'location') params.location = val;
    else if (filterType === 'industry') params.industry = val;
    else if (filterType === 'education') params.education = val;
    else params.keyword = val;

    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobSearch',
      params,
    });
  };

  // Dynamic Real Database Job Count Helper
  const getRealJobCount = useCallback((filterName: string) => {
    if (!jobs || jobs.length === 0) return 0;

    const norm = (filterName || '').toLowerCase().trim();
    if (!norm || norm === 'all' || norm === 'all opportunities') return jobs.length;

    const cleanKw = norm
      .replace(/jobs?/gi, '')
      .replace(/openings?/gi, '')
      .replace(/pass/gi, '')
      .replace(/\//gi, ' ')
      .trim();

    const count = jobs.filter((j) => {
      const title = (j.title || '').toLowerCase();
      const trade = (j.trade || '').toLowerCase();
      const industry = (j.industry || '').toLowerCase();
      const desc = (j.description || '').toLowerCase();

      return (
        title.includes(norm) ||
        trade.includes(norm) ||
        industry.includes(norm) ||
        (cleanKw.length > 1 && (title.includes(cleanKw) || trade.includes(cleanKw) || industry.includes(cleanKw) || desc.includes(cleanKw)))
      );
    }).length;

    return count;
  }, [jobs]);

  // Role job count helper
  const getRoleJobCount = useCallback((tabId: string, keyword: string) => {
    if (tabId === 'All Opportunities') return jobs.length;
    return getRealJobCount(keyword || tabId);
  }, [jobs, getRealJobCount]);

  // Filtered jobs for Popular Role Picks section
  const roleFilteredJobs = jobs.filter((j) => {
    if (activeRoleTab === 'All Opportunities') return true;
    const tabObj = roleTabsList.find((t) => t.id === activeRoleTab);
    const kw = tabObj ? tabObj.keyword : activeRoleTab.toLowerCase();
    const titleMatch = j.title && j.title.toLowerCase().includes(kw);
    const tradeMatch = j.trade && j.trade.toLowerCase().includes(kw);
    const indMatch = j.industry && j.industry.toLowerCase().includes(kw);
    return titleMatch || tradeMatch || indMatch;
  });

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
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* 1. Top Search Bar Pill with Live Autocomplete Suggestions Overlay */}
        <View style={{ zIndex: 999, position: 'relative', marginTop: 2, marginBottom: 6 }}>
          <View style={[styles.topSearchPillRow, isInputFocused && styles.topSearchPillRowActive]}>
            <TouchableOpacity
              onPress={handleSearchSubmit}
              style={styles.searchIconBadge3D}
              activeOpacity={0.8}
            >
              <Search size={18} color={isInputFocused ? COLORS.primary : '#64748B'} strokeWidth={2.2} />
            </TouchableOpacity>

            <TextInput
              ref={topSearchInputRef}
              style={styles.topSearchInput}
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              placeholderTextColor="#94A3B8"
              value={topSearch}
              onChangeText={(txt) => {
                setTopSearch(txt);
                setShowSuggestions(txt.trim().length > 0);
              }}
              onPressIn={() => setIsInputFocused(true)}
              onFocus={() => {
                setIsInputFocused(true);
                setShowSuggestions(topSearch.trim().length > 0);
              }}
              onBlur={() => {
                setIsInputFocused(false);
              }}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />

            {topSearch.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setTopSearch('');
                  setShowSuggestions(false);
                }}
                style={styles.searchClearBtn}
              >
                <X size={14} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            ) : null}

            {/* Vertical Soft Divider inside Search Bar */}
            <View style={styles.inlineFilterDivider} />

            {/* Integrated Filter Action Icon Button */}
            <TouchableOpacity
              style={styles.inlineFilterBtnIconOnly}
              onPress={handleOpenFilter}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <SlidersHorizontal size={18} color={COLORS.primary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Autocomplete Dropdown Overlay (Only visible when text is entered) */}
          {showSuggestions && topSearch.trim().length > 0 ? (
            <View style={styles.suggestionsContainer}>
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{ maxHeight: 270 }}>
                {/* 1. View All Matches Header */}
                {topSearch.trim().length > 0 ? (
                  <TouchableOpacity
                    style={styles.suggestionRowHeader}
                    onPress={() => {
                      setShowSuggestions(false);
                      handleSearchSubmit();
                    }}
                  >
                    <Search size={15} color={COLORS.primary} />
                    <Text style={styles.suggestionHeaderText} numberOfLines={1}>
                      Search all jobs matching "<Text style={{ fontWeight: '800', color: COLORS.primary }}>{topSearch.trim()}</Text>"
                    </Text>
                    <ArrowRight size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                ) : null}

                {/* 2. Matched Live Jobs */}
                {matchedSuggestions.jobs.length > 0 ? (
                  <View style={styles.suggestionGroup}>
                    <Text style={styles.suggestionGroupLabel}>MATCHING LIVE JOBS</Text>
                    {matchedSuggestions.jobs.map((j) => (
                      <TouchableOpacity
                        key={j.id}
                        style={styles.suggestionItemRow}
                        onPress={() => {
                          setShowSuggestions(false);
                          navigation.navigate('CandidateJobsTab', {
                            screen: 'CandidateJobDetail',
                            params: { jobId: j.id, job: j },
                          });
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

                {/* 3. Matched Trades */}
                {matchedSuggestions.trades.length > 0 ? (
                  <View style={styles.suggestionGroup}>
                    <Text style={styles.suggestionGroupLabel}>POPULAR TRADES & SKILLS</Text>
                    {matchedSuggestions.trades.map((trade) => (
                      <TouchableOpacity
                        key={trade}
                        style={styles.suggestionItemRow}
                        onPress={() => {
                          setTopSearch(trade);
                          setShowSuggestions(false);
                          handleQuickTradeSearch(trade);
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

                {/* 4. Matched MIDC Locations */}
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

                {/* Close Button Footer */}
                <TouchableOpacity
                  style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12, marginTop: 4 }}
                  onPress={() => setShowSuggestions(false)}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>Close Suggestions ✕</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ) : null}
        </View>

        {/* 2. Promotional Banner Slider Carousel (Smooth Horizontal Animated Slide) */}
        {promoBanners.length > 0 ? (
          <View style={styles.promoSliderContainer}>
            <FlatList
              ref={bannerFlatListRef}
              data={promoBanners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.id || `banner-${index}`}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH - 32,
                offset: (SCREEN_WIDTH - 32) * index,
                index,
              })}
              onMomentumScrollEnd={(e) => {
                const contentOffset = e.nativeEvent.contentOffset.x;
                const viewSize = e.nativeEvent.layoutMeasurement.width;
                if (viewSize > 0) {
                  const pageNum = Math.round(contentOffset / viewSize);
                  setActivePromoIndex(pageNum);
                }
              }}
              renderItem={({ item }) => (
                <View style={[styles.promoSliderCard, { width: SCREEN_WIDTH - 32, borderRadius: 12, overflow: 'hidden' }]}>
                  <Image
                    source={{
                      uri:
                        item.banner_image ||
                        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
                    }}
                    style={styles.promoImage}
                  />

                  <View style={styles.promoOverlay}>
                    <View style={styles.promoBadgeOrange}>
                      <Text style={styles.promoBadgeOrangeText}>
                        {(item.advertisement_type || 'PROMOTIONAL').replace('_', ' ')}
                      </Text>
                    </View>
                    <Text style={styles.promoTitle}>{item.title}</Text>
                    {item.description ? (
                      <Text style={styles.promoDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}

                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.promoActionBtnBlue}
                      onPress={() => handleBannerPress(item)}
                    >
                      <Text style={styles.promoActionBtnText}>
                        {item.button_text || 'Apply Now'}
                      </Text>
                      <ArrowRight size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            {/* Dots pagination */}
            {promoBanners.length > 1 ? (
              <View style={styles.dotsRow}>
                {promoBanners.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setActivePromoIndex(idx);
                      bannerFlatListRef.current?.scrollToIndex({ index: idx, animated: true });
                    }}
                    style={[styles.dot, activePromoIndex === idx && styles.dotActive]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* 3. Hero Header Title & Badge Section */}
        <View style={styles.heroTextSection}>
          <View style={styles.heroPillBadge}>
            <Star size={12} color={COLORS.primary} />
            <Text style={styles.heroPillBadgeText}>Industrial & Factory Jobs</Text>
          </View>
          <Text style={styles.heroMainTitle}>Discover Factory & Technical Jobs near you</Text>
          <Text style={styles.heroMainSubtitle}>
            Direct hiring for ITI, CNC operators, Welders, Fitters & Helpers in MIDC industrial clusters.
          </Text>
        </View>

        {/* 2. Hero White Search Container Card */}
        <View style={styles.heroSearchCard}>
          {/* Select Industry Dropdown */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.heroInputRow}
            onPress={() => setIndustryModalOpen(true)}
          >
            <Briefcase size={18} color={COLORS.primary} />
            <Text style={[styles.heroInputText, selectedIndustry !== 'Select Industry' && styles.heroInputTextActive]}>
              {selectedIndustry}
            </Text>
            <ChevronDown size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Select Education Dropdown */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.heroInputRow}
            onPress={() => setEducationModalOpen(true)}
          >
            <GraduationCap size={18} color={COLORS.primary} />
            <Text style={[styles.heroInputText, selectedEducation !== 'Select Education' && styles.heroInputTextActive]}>
              {selectedEducation}
            </Text>
            <ChevronDown size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* India (MIDC Zone or City) Input */}
          <View style={styles.heroInputRow}>
            <MapPin size={18} color={COLORS.primary} />
            <TextInput
              style={styles.heroTextInput}
              placeholder="India (MIDC Zone or City)"
              placeholderTextColor="#94A3B8"
              value={locationQuery}
              onChangeText={setLocationQuery}
            />
          </View>

          {/* Blue Primary Search Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.searchJobsBtn}
            onPress={handleSearchSubmit}
          >
            <Search size={18} color="#FFFFFF" />
            <Text style={styles.searchJobsBtnText}>Search Jobs</Text>
          </TouchableOpacity>
        </View>

        {/* Soft Divider Separator */}
        <View style={styles.sectionSeparatorDivider} />

        {/* 3. Popular Role Picks Section (Standalone Clean Section) */}
        <View style={styles.standaloneSection}>
          {/* Header Row */}
          <View style={styles.popularHeaderRow}>
            <View style={styles.popularIconSquare}>
              <Briefcase size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={styles.popularTitleText}>Popular Role Picks</Text>
                <View style={styles.verifiedBadgePill}>
                  <Text style={styles.verifiedBadgeText}>VERIFIED JOBS</Text>
                </View>
              </View>
              <Text style={styles.popularSubtext}>
                Explore top verified job opportunities categorized by available roles in the database
              </Text>
            </View>
          </View>

          {/* Horizontal Role Filter Tabs (Exact Slanted Side Curve Parallelogram Shape) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleTabsRowContainer}>
            {roleTabsList.map((tab) => {
              const isActive = activeRoleTab === tab.id;
              const count = getRoleJobCount(tab.id, tab.keyword);
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.85}
                  style={[styles.skewedTabPill, isActive ? styles.skewedTabPillActive : styles.skewedTabPillInactive]}
                  onPress={() => setActiveRoleTab(tab.id)}
                >
                  <View style={styles.unskewContentRow}>
                    <Text style={[styles.tabDot, isActive && styles.tabDotActive]}>•</Text>
                    <Text style={[styles.tabTitleText, isActive && styles.tabTitleTextActive]}>
                      {tab.label}
                    </Text>
                    <View style={[styles.countPillBadge, isActive ? styles.countPillBadgeActive : styles.countPillBadgeInactive]}>
                      <Text style={[styles.countPillText, isActive ? styles.countPillTextActive : styles.countPillTextInactive]}>
                        {count}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Popular Role Job Cards Carousel */}
          {loading ? (
            <SkeletonLoader width="100%" height={160} style={{ borderRadius: 10, marginTop: 12 }} />
          ) : roleFilteredJobs.length === 0 ? (
            <View style={styles.emptyRoleBox}>
              <Text style={styles.emptyRoleText}>No vacancies under "{activeRoleTab}" currently.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularCardsCarousel}>
              {roleFilteredJobs.slice(0, 8).map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                const logoUrl = getCompanyLogoUrl(
                  job.company,
                  job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo,
                  (job as any).companyColor
                );
                const minExp = job.min_experience ?? (job as any).minExperience ?? 0;
                const maxExp = job.max_experience ?? (job as any).maxExperience ?? 2;
                const expStr = minExp === maxExp ? `${minExp} Yrs` : `${minExp}-${maxExp} Yrs`;

                let salaryStr = '3-5 Lacs';
                const sMin = job.salary_min ?? (job as any).salaryMin;
                const sMax = job.salary_max ?? (job as any).salaryMax;
                if (sMin && sMax) {
                  if (sMin >= 100000) {
                    salaryStr = `${(sMin / 100000).toFixed(0)}-${(sMax / 100000).toFixed(0)} Lacs`;
                  } else {
                    salaryStr = `${Math.round(sMin / 1000)}k-${Math.round(sMax / 1000)}k`;
                  }
                }

                return (
                  <TouchableOpacity
                    key={job.id}
                    activeOpacity={0.9}
                    style={styles.webPopularJobCard}
                    onPress={() =>
                      navigation.navigate('CandidateJobsTab', {
                        screen: 'CandidateJobDetail',
                        params: { jobId: job.id },
                      })
                    }
                  >
                    {/* Top Title & Bookmark Row */}
                    <View style={styles.webCardTitleRow}>
                      <Text style={styles.webCardTitle} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.webBookmarkBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleToggleSave(job.id);
                        }}
                      >
                        <Bookmark
                          size={18}
                          color={isSaved ? COLORS.primary : '#94A3B8'}
                          fill={isSaved ? COLORS.primary : 'transparent'}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Location Row */}
                    <View style={styles.webLocRow}>
                      <MapPin size={13} color="#94A3B8" />
                      <Text style={styles.webLocText} numberOfLines={1}>
                        {job.location || 'Chhatrapati Sambhajinagar'}
                      </Text>
                    </View>

                    {/* Experience & Salary Specs */}
                    <View style={styles.webSpecsRow}>
                      <Briefcase size={13} color="#94A3B8" />
                      <Text style={styles.webSpecsText}>
                        {expStr}   |   ₹ {salaryStr}
                      </Text>
                    </View>

                    {/* Work Mode & Job Type Badges */}
                    <View style={styles.webBadgesRow}>
                      <View style={styles.webBadgeGray}>
                        <Text style={styles.webBadgeGrayText}>
                          {job.work_mode || (job as any).workMode || 'Onsite'}
                        </Text>
                      </View>

                      <View style={styles.webBadgeGray}>
                        <Text style={styles.webBadgeGrayText}>
                          {job.job_type || (job as any).jobType || 'Full-Time'}
                        </Text>
                      </View>
                    </View>

                    {/* Shift Details Purple Pill */}
                    <View style={styles.webShiftPill}>
                      <Clock size={12} color="#7C3AED" />
                      <Text style={styles.webShiftText} numberOfLines={1}>
                        {job.shift_details || (job as any).shiftDetails || 'Day Shift (8:00 AM - 5:00 PM (9 hrs))'}
                      </Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.webCardDivider} />

                    {/* Company Footer Row */}
                    <View style={styles.webCompanyFooter}>
                      <CompanyLogoAvatar
                        logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo}
                        companyName={job.company}
                        size={38}
                        borderRadius={6}
                      />

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.webCompanyTitle} numberOfLines={1}>
                          {job.company || 'Industrial Company'}
                        </Text>
                        <Text style={styles.webPostedByText} numberOfLines={1}>
                          Posted by {job.company || 'Recruiter'}
                        </Text>
                      </View>

                      <Text style={styles.webDurationText}>1d ago</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Explore More Card at the End of Horizontal List */}
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.exploreMoreEndCard}
                onPress={() =>
                  navigation.navigate('CandidateJobsTab', {
                    screen: 'CandidateJobSearch',
                    params: { trade: activeRoleTab !== 'All Opportunities' ? activeRoleTab : undefined },
                  })
                }
              >
                <View style={styles.exploreMoreCircleIcon}>
                  <ArrowRight size={22} color={COLORS.primary} strokeWidth={2.5} />
                </View>

                <Text style={styles.exploreMoreTitleText}>Explore More</Text>
                <Text style={styles.exploreMoreSubText}>
                  View all {roleFilteredJobs.length}+ vacancies
                </Text>

                <View style={styles.exploreMoreButtonPill}>
                  <Text style={styles.exploreMoreButtonPillText}>Browse All →</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Soft Divider Separator */}
        <View style={styles.sectionSeparatorDivider} />

        {/* 4. Live Stats 2x2 Grid (2 Rows x 2 Columns) */}
        <View style={styles.statsGrid2x2}>
          {/* Row 1 */}
          <View style={styles.statsRow}>
            <View style={styles.statSquareCard}>
              <Text style={[styles.statValueText, { color: COLORS.primary }]}>
                {jobs.length > 0 ? `${jobs.length}+` : '15+'}
              </Text>
              <Text style={styles.statLabelText}>Active Listings</Text>
            </View>

            <View style={styles.statSquareCard}>
              <Text style={[styles.statValueText, { color: '#059669' }]}>
                {jobs.length > 0 ? `${Array.from(new Set(jobs.map((j) => j.company).filter(Boolean))).length || jobs.length}+` : '12+'}
              </Text>
              <Text style={styles.statLabelText}>Factories Hiring</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.statsRow}>
            <View style={styles.statSquareCard}>
              <Text style={[styles.statValueText, { color: '#7C3AED' }]}>
                {jobs.length > 0 ? `${jobs.length * 12 + 150}+` : '200+'}
              </Text>
              <Text style={styles.statLabelText}>Verified Workers</Text>
            </View>

            <View style={styles.statSquareCard}>
              <Text style={[styles.statValueText, { color: '#EA580C' }]}>
                {jobs.length > 0 ? `${jobs.length * 45 + 500}+` : '850+'}
              </Text>
              <Text style={styles.statLabelText}>Placements</Text>
            </View>
          </View>
        </View>

        {/* 5. Browse by ITI Trade / Specialty Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.popularTradesBadge}>
            <Text style={styles.popularTradesBadgeText}>POPULAR TRADES</Text>
          </View>

          <Text style={styles.sectionTitleBig}>Browse by ITI Trade / Specialty</Text>
          <Text style={styles.sectionSubTextCentered}>
            Direct vacancies in production, quality, maintenance & logistics
          </Text>

          {/* 3-Column Grid of Trade Cards */}
          <View style={styles.threeColumnGrid}>
            {ITI_TRADES_GRID.map((trade, idx) => {
              const IconComp = trade.icon;
              const realCount = getRealJobCount(trade.name);
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.tradeSquareCard}
                  onPress={() => handleQuickTradeSearch(trade.name)}
                >
                  <View style={styles.tradeIconSquare}>
                    <IconComp size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.tradeCardTitle} numberOfLines={1}>{trade.name}</Text>
                  <Text style={styles.tradeCardCount}>{realCount} {realCount === 1 ? 'open position' : 'open positions'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. Browse Jobs by Qualification Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.educationBadge}>
            <Text style={styles.educationBadgeText}>EDUCATION</Text>
          </View>

          <Text style={styles.sectionTitleBig}>Browse Jobs by Qualification</Text>
          <Text style={styles.sectionSubTextCentered}>
            Find jobs matching your school education or college degree
          </Text>

          {/* 3-Column Grid of Qualification Cards */}
          <View style={styles.threeColumnGrid}>
            {EDUCATION_GRID.map((qual, idx) => {
              const IconComp = qual.icon;
              const realCount = getRealJobCount(qual.name);
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.qualSquareCard}
                  onPress={() => handleQuickTradeSearch(qual.name, 'education')}
                >
                  <View style={styles.qualIconSquare}>
                    <IconComp size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.qualCardTitle} numberOfLines={1}>{qual.name}</Text>
                  <Text style={styles.qualCardCount}>{realCount} {realCount === 1 ? 'Job Opening' : 'Job Openings'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 7. Hospital & Healthcare Jobs Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.hospitalBadge}>
            <Text style={styles.hospitalBadgeText}>HOSPITAL</Text>
          </View>

          <Text style={styles.sectionTitleBig}>Hospital & Healthcare Jobs</Text>
          <Text style={styles.sectionSubTextCentered}>
            Browse medical, nursing, administration and support staff jobs
          </Text>

          <View style={styles.threeColumnGrid}>
            {HOSPITAL_GRID.map((item, idx) => {
              const IconComp = item.icon;
              const realCount = getRealJobCount(item.name);
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.qualSquareCard}
                  onPress={() => handleQuickTradeSearch(item.name)}
                >
                  <View style={styles.qualIconSquare}>
                    <IconComp size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.qualCardCount}>{realCount} {realCount === 1 ? 'Job Opening' : 'Job Openings'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 8. Hotel, Restaurant & Catering Jobs Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.hotelBadge}>
            <Text style={styles.hotelBadgeText}>HOTEL</Text>
          </View>

          <Text style={styles.sectionTitleBig}>Hotel, Restaurant & Catering Jobs</Text>
          <Text style={styles.sectionSubTextCentered}>
            Find jobs in top hotels, cafes, pantries, and food companies
          </Text>

          <View style={styles.threeColumnGrid}>
            {HOTEL_GRID.map((item, idx) => {
              const IconComp = item.icon;
              const realCount = getRealJobCount(item.name);
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.qualSquareCard}
                  onPress={() => handleQuickTradeSearch(item.name)}
                >
                  <View style={styles.qualIconSquare}>
                    <IconComp size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.qualCardCount}>{realCount} {realCount === 1 ? 'Job Opening' : 'Job Openings'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 9. School, College & Education Jobs Section */}
        <View style={styles.standaloneSection}>
          <View style={styles.schoolBadge}>
            <Text style={styles.schoolBadgeText}>SCHOOL & COLLEGE</Text>
          </View>

          <Text style={styles.sectionTitleBig}>School, College & Education Jobs</Text>
          <Text style={styles.sectionSubTextCentered}>
            Browse teaching, clerical, administrative and security roles in academic institutes
          </Text>

          <View style={styles.threeColumnGrid}>
            {SCHOOL_GRID.map((item, idx) => {
              const IconComp = item.icon;
              const realCount = getRealJobCount(item.name);
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.qualSquareCard}
                  onPress={() => handleQuickTradeSearch(item.name)}
                >
                  <View style={styles.qualIconSquare}>
                    <IconComp size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.qualCardCount}>{realCount} {realCount === 1 ? 'Job Opening' : 'Job Openings'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Select Industry Modal Sheet */}
      <Modal
        visible={industryModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIndustryModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIndustryModalOpen(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: 24 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Industry</Text>
              <TouchableOpacity
                onPress={() => setIndustryModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {INDUSTRIES.map((ind) => (
                <TouchableOpacity
                  key={ind}
                  activeOpacity={0.7}
                  style={[styles.pickerItem, selectedIndustry === ind && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedIndustry(ind);
                    setIndustryModalOpen(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, selectedIndustry === ind && styles.pickerItemTextActive]}>{ind}</Text>
                  {selectedIndustry === ind ? <Check size={16} color={COLORS.primary} /> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Select Education Modal Sheet */}
      <Modal
        visible={educationModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEducationModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEducationModalOpen(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: 24 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Education</Text>
              <TouchableOpacity
                onPress={() => setEducationModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {EDUCATIONS.map((ed) => (
                <TouchableOpacity
                  key={ed}
                  activeOpacity={0.7}
                  style={[styles.pickerItem, selectedEducation === ed && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedEducation(ed);
                    setEducationModalOpen(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, selectedEducation === ed && styles.pickerItemTextActive]}>{ed}</Text>
                  {selectedEducation === ed ? <Check size={16} color={COLORS.primary} /> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Job Filter Side Drawer Modal on Candidate Home Screen */}
      <JobFilterSideDrawer
        visible={homeFilterDrawerOpen}
        onClose={() => setHomeFilterDrawerOpen(false)}
        currentFilters={homeFilters}
        onApplyFilters={handleApplyHomeFilters}
        onResetFilters={() => setHomeFilters(DEFAULT_HOME_FILTERS)}
        totalMatchingJobsCount={jobs?.length || 0}
      />
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
    paddingTop: 14,
    paddingBottom: 130,
    gap: 6,
  },
  topSearchPillRow: {
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
  topSearchPillRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  searchIconBadge3D: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '600',
    textAlignVertical: 'center',
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
  inlineFilterDivider: {
    width: 1,
    height: 22,
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
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 4,
    zIndex: 999,
  },
  suggestionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
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
    borderRadius: 6,
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
    fontWeight: '500',
  },
  heroSearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  heroInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 4,
    height: 44,
    gap: 10,
  },
  heroInputText: {
    flex: 1,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroInputTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  heroTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  searchJobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: 13,
    marginTop: 4,
  },
  searchJobsBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  popularTradesSection: {
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  popularTradesLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tradePillsRow: {
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tradePillBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    color: '#334155',
  },
  tradePillBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  sectionSeparatorDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },
  popularSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    gap: 14,
  },
  popularHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  popularIconSquare: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  verifiedBadgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  verifiedBadgeText: {
    color: COLORS.primary,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  popularSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 16,
  },
  roleTabsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  skewedTabPill: {
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skewedTabPillActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  skewedTabPillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  unskewContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabDot: {
    fontSize: 14,
    fontWeight: '900',
    color: '#94A3B8',
  },
  tabDotActive: {
    color: COLORS.primary,
  },
  tabTitleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  tabTitleTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  countPillBadge: {
    borderRadius: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 2,
  },
  countPillBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  countPillBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '900',
  },
  countPillTextActive: {
    color: COLORS.primary,
  },
  countPillTextInactive: {
    color: '#64748B',
  },
  popularCardsCarousel: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  exploreMoreEndCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 0,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exploreMoreCircleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  exploreMoreTitleText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  exploreMoreSubText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
  },
  exploreMoreButtonPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    marginTop: 6,
  },
  exploreMoreButtonPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  webPopularJobCard: {
    width: 290,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  webCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  webCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
  },
  webBookmarkBtn: {
    padding: 2,
  },
  webLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  webLocText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  webSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  webSpecsText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  webBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  webBadgeGray: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  webBadgeGrayText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  webShiftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  webShiftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  webCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  webCompanyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  webLogoSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  webLogoImg: {
    width: '100%',
    height: '100%',
  },
  webCompanyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  webRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  webPostedByText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  webDurationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  webExploreAllBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  webExploreAllBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  btnSectionAction: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 13,
    paddingVertical: 5.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSectionActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  verifiedJobsBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedJobsBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
  },
  sectionSubText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  homeJobCardFull: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  companyLogoSquare: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  cardCompanyName: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  bookmarkIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleRowMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  metaItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  metaTextCompact: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  metaDotDivider: {
    fontSize: 10,
    color: '#94A3B8',
    marginHorizontal: 1,
  },
  salaryTextHighlight: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  singleRowBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 5,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    flexShrink: 1,
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  sectionSubTextCentered: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  roleTabsRow: {
    gap: 8,
    marginVertical: 4,
  },
  roleTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  roleTabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleTabDot: {
    fontSize: 14,
    color: '#64748B',
  },
  roleTabDotActive: {
    color: '#FFFFFF',
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  emptyRoleBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyRoleText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  horizontalCardsRow: {
    gap: 12,
  },
  webRoleJobCard: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 14,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardJobTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLocationText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  cardExperienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardExperienceText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  workPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  workPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  shiftPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  shiftPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7C3AED',
  },
  cardFooterDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  companyFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyCircleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
  },
  postedByText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  exploreAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  exploreAllBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statsGrid2x2: {
    marginVertical: 10,
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statSquareCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statValueText: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  popularTradesBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  popularTradesBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
  },
  educationBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  educationBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
  },
  standaloneSection: {
    marginVertical: 14,
    gap: 12,
  },
  sectionTitleBig: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 2,
  },
  threeColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    justifyContent: 'flex-start',
  },
  tradeSquareCard: {
    width: Math.floor((SCREEN_WIDTH - 32 - 16) / 3),
    height: 114,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tradeIconSquare: {
    width: 34,
    height: 34,
    borderRadius: 0,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  tradeCardCount: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
  },
  qualSquareCard: {
    width: Math.floor((SCREEN_WIDTH - 32 - 16) / 3),
    height: 114,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  qualIconSquare: {
    width: 34,
    height: 34,
    borderRadius: 0,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  qualCardCount: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
    padding: 20,
    gap: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  pickerItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  pickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  promoSliderContainer: {
    position: 'relative',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  promoSliderCard: {
    height: 185,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  promoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.38,
    borderRadius: 12,
    overflow: 'hidden',
  },
  promoOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 14,
    justifyContent: 'space-between',
  },
  promoBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  promoDesc: {
    fontSize: 11.5,
    color: '#E2E8F0',
    lineHeight: 15,
  },
  promoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 0,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  promoActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
  hospitalBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'center',
  },
  hospitalBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
  },
  hotelBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'center',
  },
  hotelBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
  },
  schoolBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'center',
  },
  schoolBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
  },
  promoBadgeOrange: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  promoBadgeOrangeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoActionBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  heroTextSection: {
    alignItems: 'center',
    marginVertical: 4,
    gap: 6,
    paddingHorizontal: 8,
  },
  heroPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  heroPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  heroMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 26,
  },
  heroMainSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
});
