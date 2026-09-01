import { COLORS } from '../../constants/theme';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Briefcase,
  SlidersHorizontal,
  SearchX,
  TrendingUp,
  RotateCcw,
  Building2,
  GraduationCap,
  MapPin,
  Clock,
  X,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { Job } from '../../types';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';
import { JobFilterSideDrawer, FilterOptions } from '../../components/common/JobFilterSideDrawer';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import { CandidateJobCardItem } from './components/CandidateJobCardItem';
import { CandidateJobSearchFilterHeader } from './components/CandidateJobSearchFilterHeader';
import { savedJobsStore } from '../../utils/savedJobsStore';
import { matchJobAgainstKeyword, getCleanSearchTerm } from './utils/jobMatchUtils';

const FALLBACK_JOBS: Job[] = [
  {
    id: 'job-1',
    employer_id: 'emp-1',
    title: 'Senior CNC & VMC Machine Operator',
    company: 'Varroc Engineering Ltd',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    industry: 'Automotive & Auto Components',
    trade: 'CNC Operator',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 2,
    max_experience: 5,
    salary_min: 240000,
    salary_max: 360000,
    openings: 8,
    description: 'Experienced CNC/VMC operator for precision automotive parts machining.',
    responsibilities: ['Operate CNC machines', 'Quality inspection', 'Offset settings'],
    requirements: ['2+ years experience', 'ITI / Diploma Mechanical'],
    skills: ['CNC', 'VMC', 'Fanuc', 'Vernier Calliper'],
    status: 'APPROVED',
    posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    bus_facility: true,
    canteen: true,
    accommodation: false,
    overtime: true,
  },
  {
    id: 'job-2',
    employer_id: 'emp-2',
    title: 'Quality Control Inspector (QC / QA)',
    company: 'Bajaj Auto Limited',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    industry: 'Automotive & Auto Components',
    trade: 'Quality Inspector',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 1,
    max_experience: 4,
    salary_min: 280000,
    salary_max: 420000,
    openings: 5,
    description: 'Quality inspection on 2-wheeler production and assembly line.',
    responsibilities: ['Line inspection', 'Sampling inspection', 'CMM checks'],
    requirements: ['DME / ITI Quality', 'Knowledge of GD&T'],
    skills: ['Quality Control', 'Micrometer', 'Height Gauge', 'CMM'],
    status: 'APPROVED',
    posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    bus_facility: true,
    canteen: true,
    accommodation: true,
    overtime: true,
  },
  {
    id: 'job-3',
    employer_id: 'emp-3',
    title: 'ITI Fitter & Mechanical Assembly Technician',
    company: 'Endurance Technologies',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    industry: 'Industrial Manufacturing & Assembly',
    trade: 'Fitter',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 1,
    max_experience: 3,
    salary_min: 200000,
    salary_max: 300000,
    openings: 12,
    description: 'Assembly and maintenance fitting of die casting components.',
    responsibilities: ['Mechanical assembly', 'Pneumatics fitting', 'Tool maintenance'],
    requirements: ['ITI Fitter', '1+ year experience'],
    skills: ['Fitter', 'Bench Work', 'Assembly', 'Blueprint Reading'],
    status: 'APPROVED',
    posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    bus_facility: true,
    canteen: true,
    accommodation: false,
    overtime: true,
  },
  {
    id: 'job-4',
    employer_id: 'emp-4',
    title: 'MIG / TIG Welder & Fabricator',
    company: 'Tata Motors Manufacturing',
    location: 'Pimpri-Chinchwad, Pune',
    industry: 'Automotive OEM',
    trade: 'Welder',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 1,
    max_experience: 4,
    salary_min: 220000,
    salary_max: 340000,
    openings: 15,
    description: 'Chassis and structural welding for commercial vehicle assembly.',
    responsibilities: ['MIG welding', 'Spot welding', 'Joint inspection'],
    requirements: ['ITI Welder certificate', 'Spot / MIG experience'],
    skills: ['MIG Welding', 'TIG Welding', 'Fabrication', 'Safety'],
    status: 'APPROVED',
    posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    bus_facility: true,
    canteen: true,
    accommodation: true,
    overtime: true,
  },
  {
    id: 'job-5',
    employer_id: 'emp-5',
    title: 'Industrial Electrician & Maintenance Technician',
    company: 'Siemens India Industrial',
    location: 'Chakan MIDC, Pune',
    industry: 'Electronics & Electricals',
    trade: 'Electrician',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 2,
    max_experience: 6,
    salary_min: 300000,
    salary_max: 480000,
    openings: 6,
    description: 'Panel wiring, PLC diagnostics, and electrical breakdown maintenance.',
    responsibilities: ['HT/LT maintenance', 'Panel wiring', 'Motor testing'],
    requirements: ['ITI Electrician / Wireman / Diploma EE', 'PWD Wireman licence'],
    skills: ['Electrician', 'PLC', 'Panel Wiring', 'Switchgear'],
    status: 'APPROVED',
    posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    bus_facility: true,
    canteen: true,
    accommodation: false,
    overtime: true,
  },
  {
    id: 'job-6',
    employer_id: 'emp-6',
    title: 'CNC Turner & Precision Machinist',
    company: 'Bharat Forge Limited',
    location: 'Mundhwa Pune',
    industry: 'Industrial Manufacturing & Assembly',
    trade: 'Machinist',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 2,
    max_experience: 5,
    salary_min: 260000,
    salary_max: 380000,
    openings: 10,
    description: 'Heavy forging and precision machining of crankshafts and axles.',
    responsibilities: ['Turning operations', 'Tool setting', 'Surface finishing'],
    requirements: ['ITI Turner / Machinist', '2+ years heavy engineering'],
    skills: ['Machinist', 'Lathe', 'CNC Turning', 'Tooling'],
    status: 'APPROVED',
    posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    bus_facility: true,
    canteen: true,
    accommodation: false,
    overtime: true,
  },
];

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateJobSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>(FALLBACK_JOBS);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(savedJobsStore.getSavedIds());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setSavedJobIds(savedJobsStore.getSavedIds());
    const unsubscribe = savedJobsStore.subscribe(() => {
      setSavedJobIds(savedJobsStore.getSavedIds());
    });
    return () => {
      unsubscribe();
    };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState('All Jobs');
  const [activeSelectedJobId, setActiveSelectedJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    industry: 'All Industries',
    education: 'All Education Levels',
    jobType: 'All Types',
    workMode: 'All Modes',
    minExperience: 'All Experience',
    salaryMin: 0,
    midcZone: 'All MIDC Zones',
    busFacility: false,
    canteen: false,
    accommodation: false,
    overtime: false,
  });

  const SEARCH_PLACEHOLDERS = ['Search jobs...', 'Search trades...', 'Search locations...'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (!route?.params) return;
    const { keyword, location, industry, education, homeFilters, rawFilterTitle, category } = route.params;

    if (route.params.appliedFilters) {
      setActiveFilters(route.params.appliedFilters);
      return;
    }

    if (homeFilters) {
      setActiveFilters(homeFilters);
    } else {
      setActiveFilters({
        industry: industry || 'All Industries',
        jobType: 'All Types',
        workMode: 'All Modes',
        minExperience: 'All Experience',
        salaryMin: 0,
        midcZone: location || 'All MIDC Zones',
        busFacility: false,
        canteen: false,
        accommodation: false,
        overtime: false,
        education: education || 'All Education Levels',
      });
    }

    setSelectedCategory(category || 'All Jobs');

    if (keyword) {
      setSearchQuery(getCleanSearchTerm(keyword));
    } else if (rawFilterTitle) {
      setSearchQuery(getCleanSearchTerm(rawFilterTitle));
    } else if (education) {
      setSearchQuery(getCleanSearchTerm(education));
    }
  }, [route?.params]);

  const matchedSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    // 1. Matching Live Jobs
    const matchedJobs = jobs.filter((j) => {
      if (!trimmed) return false;
      const titleMatch = (j.title || '').toLowerCase().includes(trimmed);
      const companyMatch = (j.company || (j as any).company_name || '').toLowerCase().includes(trimmed);
      const industryMatch = (j.industry || '').toLowerCase().includes(trimmed);
      const tradeMatch = (j.trade || '').toLowerCase().includes(trimmed);
      const skillsMatch = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(trimmed));
      return titleMatch || companyMatch || industryMatch || tradeMatch || skillsMatch;
    }).slice(0, 4);

    // 2. Matching Companies with Logos
    const companyMap = new Map<string, { name: string; logoUrl?: string; industry?: string; count: number }>();
    jobs.forEach((j) => {
      const cName = j.company || (j as any).company_name || (j as any).companyName;
      if (cName && (!trimmed || cName.toLowerCase().includes(trimmed))) {
        const logo =
          j.companyLogo ||
          (j as any).company_logo ||
          (j as any).logoUrl ||
          (j as any).logo_url ||
          (j as any).logo ||
          (j as any).employer_logo ||
          (j as any).avatar_url ||
          (j as any).avatar;
        const key = cName.toLowerCase().trim();
        if (!companyMap.has(key)) {
          companyMap.set(key, {
            name: cName,
            logoUrl: logo,
            industry: j.industry || 'Manufacturing',
            count: 1,
          });
        } else {
          companyMap.get(key)!.count += 1;
        }
      }
    });
    const matchedCompanies = Array.from(companyMap.values()).slice(0, 4);

    // 3. Matching Trades
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

    // 4. Matching Locations
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
      companies: matchedCompanies,
      trades: matchedTrades,
      locations: matchedLocations,
    };
  }, [searchQuery, jobs]);

  const refreshOffsetRef = useRef(0);

  const ensureJobLogos = (rawJobs: Job[]): Job[] => {
    return (rawJobs || []).map((j) => {
      const rawLogo = j.companyLogo || (j as any).company_logo || (j as any).logoUrl || (j as any).logo_url || (j as any).logo;
      const finalLogo = getCompanyLogoUrl(j.company || 'Industrial Partner', rawLogo);
      return {
        ...j,
        companyLogo: finalLogo,
        company_logo: finalLogo,
      };
    });
  };

  const loadJobsData = useCallback(async (isRefresh: boolean = false) => {
    try {
      const [jobsRes, savedRes] = await Promise.all([
        candidateApi.getAllJobs(),
        candidateApi.getSavedJobs().catch(() => ({ success: false, data: [] })),
      ]);

      if (jobsRes.success && jobsRes.data) {
        const rawJobs = ensureJobLogos(jobsRes.data || []);
        if (isRefresh && rawJobs.length > 0) {
          refreshOffsetRef.current = (refreshOffsetRef.current + 3) % rawJobs.length;
        }
        const offset = refreshOffsetRef.current;
        const rotated = rawJobs.length > 0 ? [...rawJobs.slice(offset), ...rawJobs.slice(0, offset)] : rawJobs;
        setJobs(rotated);
      } else {
        const rawJobs = ensureJobLogos(FALLBACK_JOBS);
        if (isRefresh && rawJobs.length > 0) {
          refreshOffsetRef.current = (refreshOffsetRef.current + 3) % rawJobs.length;
        }
        const offset = refreshOffsetRef.current;
        const rotated = rawJobs.length > 0 ? [...rawJobs.slice(offset), ...rawJobs.slice(0, offset)] : rawJobs;
        setJobs(rotated);
      }

      if (savedRes.success && savedRes.data) {
        savedJobsStore.setSavedJobs(savedRes.data);
        setSavedJobIds(savedJobsStore.getSavedIds());
      }
    } catch (err) {
      setJobs(ensureJobLogos(FALLBACK_JOBS));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJobsData(false);
      if (route?.params?.appliedFilters) {
        setActiveFilters(route.params.appliedFilters);
      }
    }, [loadJobsData, route?.params?.appliedFilters])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadJobsData(true);
  }, [loadJobsData]);

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

  const filteredJobs = useMemo(() => {
    const cleanQ = searchQuery.toLowerCase().trim();
    return jobs.filter((job) => {
      // 1. Text Search Query Match
      if (cleanQ) {
        const matchesQuery = matchJobAgainstKeyword(job, cleanQ);
        if (!matchesQuery) return false;
      }

      // 2. Category Match
      const catMatch =
        selectedCategory === 'All Jobs' ||
        (job.trade && job.trade.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (job.industry && job.industry.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (job.title && job.title.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (selectedCategory === 'HR Jobs' && (job.title.includes('HR') || job.industry.includes('HR'))) ||
        (selectedCategory === 'Marketing Jobs' && (job.title.includes('Marketing') || job.industry.includes('Marketing'))) ||
        (selectedCategory === 'ITI & Trade Jobs' && (job.title.includes('Welder') || job.title.includes('Wireman') || job.title.includes('CNC') || job.title.includes('Fitter'))) ||
        (selectedCategory === 'Healthcare' && (job.title.includes('Nurse') || job.industry.includes('Healthcare')));

      if (!catMatch) return false;

      // 3. Industry Filter Match
      if (activeFilters.industry && activeFilters.industry !== 'All Industries') {
        const rawInd = activeFilters.industry.toLowerCase().trim();
        const jobInd = (job.industry || '').toLowerCase();
        const jobTitle = (job.title || '').toLowerCase();
        const jobTrade = (job.trade || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();

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

      // 4. Education Filter Match
      if (activeFilters.education && activeFilters.education !== 'All Education Levels') {
        const matchesEdu = matchJobAgainstKeyword(job, activeFilters.education);
        if (!matchesEdu) return false;
      }

      // 5. MIDC Zone Filter Match
      if (activeFilters.midcZone && activeFilters.midcZone !== 'All MIDC Zones') {
        const rawZone = activeFilters.midcZone.toLowerCase();
        const zoneTokens = rawZone.replace(/\s*\([^)]*\)/g, '').split(/[\s,/-]+/).filter((t) => t.length > 2 && t !== 'midc' && t !== 'zone');
        const jobLoc = (job.location || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();

        const matchesZone = zoneTokens.length === 0 || zoneTokens.some(
          (t) => jobLoc.includes(t) || jobDesc.includes(t)
        );

        if (!matchesZone) return false;
      }

      // 6. Job Type Filter Match
      if (activeFilters.jobType && activeFilters.jobType !== 'All Types') {
        const typeKey = activeFilters.jobType.toLowerCase();
        const jType = (job.job_type || (job as any).jobType || '').toLowerCase();
        if (!jType.includes(typeKey)) return false;
      }

      // 7. Work Mode Filter Match
      if (activeFilters.workMode && activeFilters.workMode !== 'All Modes') {
        const modeKey = activeFilters.workMode.toLowerCase();
        const jMode = (job.work_mode || (job as any).workMode || '').toLowerCase();
        if (!jMode.includes(modeKey)) return false;
      }

      // 8. Amenities Filters
      if (activeFilters.busFacility && !(job.bus_facility || (job as any).busFacility || (job.perks || []).includes('Bus Transport'))) return false;
      if (activeFilters.canteen && !(job.canteen || (job as any).canteen || (job.perks || []).includes('Free Canteen'))) return false;
      if (activeFilters.accommodation && !(job.accommodation || (job as any).accommodation || (job.perks || []).includes('Accommodation'))) return false;
      if (activeFilters.overtime && !(job.overtime || (job as any).overtime || (job.perks || []).includes('Overtime Pay'))) return false;

      return true;
    });
  }, [jobs, searchQuery, selectedCategory, activeFilters]);

  const activeFilterCount = useMemo(() => {
    return [
      Boolean(activeFilters.industry && activeFilters.industry !== 'All Industries'),
      Boolean(activeFilters.education && activeFilters.education !== 'All Education Levels'),
      Boolean(activeFilters.midcZone && activeFilters.midcZone !== 'All MIDC Zones'),
      Boolean(activeFilters.jobType && activeFilters.jobType !== 'All Types'),
      Boolean(activeFilters.workMode && activeFilters.workMode !== 'All Modes'),
      Boolean(activeFilters.minExperience && activeFilters.minExperience !== 'All Experience'),
      Boolean(activeFilters.busFacility),
      Boolean(activeFilters.canteen),
      Boolean(activeFilters.accommodation),
      Boolean(activeFilters.overtime),
    ].filter(Boolean).length;
  }, [activeFilters]);

  const resetAllFilters = useCallback(() => {
    setActiveFilters({
      industry: 'All Industries',
      education: 'All Education Levels',
      jobType: 'All Types',
      workMode: 'All Modes',
      minExperience: 'All Experience',
      salaryMin: 0,
      midcZone: 'All MIDC Zones',
      busFacility: false,
      canteen: false,
      accommodation: false,
      overtime: false,
    });
    setSelectedCategory('All Jobs');
    setSearchQuery('');
  }, []);

  const handleOpenFilterDrawer = useCallback(() => {
    navigation.navigate('JobFilter', {
      currentFilters: activeFilters,
      jobs: jobs,
      totalMatchingJobsCount: filteredJobs.length,
      onApplyFilters: (newFilters: FilterOptions) => {
        setActiveFilters(newFilters);
      },
      returnScreen: 'CandidateJobSearch',
    });
  }, [navigation, activeFilters, jobs, filteredJobs.length]);

  return (
    <View style={styles.container}>
      <Header
        searchValue={searchQuery}
        searchPlaceholder="Search Jobs, Skills, Companies..."
        onSearchPress={() => {
          navigation.navigate('CandidateGlobalSearch', { initialQuery: searchQuery });
        }}
        onClearSearch={() => {
          setSearchQuery('');
          setSelectedCategory('All Jobs');
          setActiveFilters({
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
            education: 'All Education Levels',
          });
        }}
        showBack={false}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleOpenFilterDrawer}
            style={styles.headerFilterBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal
              size={18}
              color={activeFilterCount > 0 ? COLORS.primary : '#475569'}
              strokeWidth={2.2}
            />
            {activeFilterCount > 0 && (
              <View style={styles.headerFilterBadge}>
                <Text style={styles.headerFilterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <CandidateJobSearchFilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholders={SEARCH_PLACEHOLDERS}
        placeholderIndex={placeholderIndex}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        isInputFocused={isInputFocused}
        setIsInputFocused={setIsInputFocused}
        matchedSuggestions={matchedSuggestions}
        onOpenFilterDrawer={handleOpenFilterDrawer}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        navigation={navigation}
      />

      {/* Active Applied Filters Scrollable Strip */}
      {activeFilterCount > 0 ? (
        <View style={styles.activeTagsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
            {activeFilters.industry && activeFilters.industry !== 'All Industries' && (
              <View style={styles.activeFilterTag}>
                <Building2 size={11} color={COLORS.primary} />
                <Text style={styles.activeFilterTagText} numberOfLines={1}>
                  {activeFilters.industry}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, industry: 'All Industries' }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.education && activeFilters.education !== 'All Education Levels' && (
              <View style={styles.activeFilterTag}>
                <GraduationCap size={11} color={COLORS.primary} />
                <Text style={styles.activeFilterTagText} numberOfLines={1}>
                  {activeFilters.education}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, education: 'All Education Levels' }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.minExperience && activeFilters.minExperience !== 'All Experience' && (
              <View style={styles.activeFilterTag}>
                <Briefcase size={11} color={COLORS.primary} />
                <Text style={styles.activeFilterTagText} numberOfLines={1}>
                  {activeFilters.minExperience}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, minExperience: 'All Experience' }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.midcZone && activeFilters.midcZone !== 'All MIDC Zones' && (
              <View style={styles.activeFilterTag}>
                <MapPin size={11} color={COLORS.primary} />
                <Text style={styles.activeFilterTagText} numberOfLines={1}>
                  {activeFilters.midcZone}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, midcZone: 'All MIDC Zones' }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.jobType && activeFilters.jobType !== 'All Types' && (
              <View style={styles.activeFilterTag}>
                <Clock size={11} color={COLORS.primary} />
                <Text style={styles.activeFilterTagText} numberOfLines={1}>
                  {activeFilters.jobType}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, jobType: 'All Types' }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.workMode && activeFilters.workMode !== 'All Modes' && (
              <View style={styles.activeFilterTag}>
                <SlidersHorizontal size={11} color={COLORS.primary} />
                <Text style={styles.activeFilterTagText} numberOfLines={1}>
                  {activeFilters.workMode}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, workMode: 'All Modes' }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.busFacility && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterTagText}>Bus Transport</Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, busFacility: false }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.canteen && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterTagText}>Canteen</Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, canteen: false }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.accommodation && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterTagText}>Hostel</Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, accommodation: false }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {activeFilters.overtime && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterTagText}>Overtime (OT)</Text>
                <TouchableOpacity onPress={() => setActiveFilters((prev) => ({ ...prev, overtime: false }))}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={resetAllFilters} style={styles.resetAllPill}>
              <RotateCcw size={10} color="#DC2626" />
              <Text style={styles.resetAllPillText}>Reset All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : null}

      <FlatList
        data={loading && jobs.length === 0 ? [] : filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item: job, index }) => (
          <CandidateJobCardItem
            key={job.id}
            job={job}
            viewMode={viewMode}
            isFirst={index === 0}
            isLast={index === filteredJobs.length - 1}
            isSaved={savedJobIds.includes(job.id)}
            onToggleSave={() => handleToggleSave(job.id)}
            onPress={() =>
              navigation.navigate('CandidateJobsTab', {
                screen: 'CandidateJobDetail',
                params: { jobId: job.id, job },
              })
            }
          />
        )}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <View style={styles.resultsInfoRow}>
            <Text style={styles.resultsCountText}>
              Showing <Text style={{ fontWeight: '800', color: COLORS.primary }}>({filteredJobs.length})</Text> active vacancies
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 12 }}>
              <SkeletonLoader width="100%" height={160} style={{ borderRadius: 8 }} />
              <SkeletonLoader width="100%" height={160} style={{ borderRadius: 8 }} />
            </View>
          ) : (
            <View style={styles.emptyStateBox}>
              <View style={styles.emptyIconCircle}>
                <SearchX size={26} color="#64748B" strokeWidth={2} />
              </View>
              <Text style={styles.emptyTitle}>No Matching Job Vacancies Found</Text>
              <Text style={styles.emptySub}>
                {searchQuery.trim()
                  ? `No active industrial vacancies matched "${searchQuery.trim()}".`
                  : 'No vacancies match your currently selected industry or zone filters.'}
              </Text>

              <View style={styles.emptyTipsCard}>
                <Text style={styles.emptyTipsTitle}>SUGGESTED ACTIONS</Text>
                <Text style={styles.emptyTipRow}>• Broaden or clear specific filters like salary, experience, or shifts</Text>
                <Text style={styles.emptyTipRow}>• Check for alternate keywords (e.g., "Operator", "Technician", "Machinist")</Text>
                <Text style={styles.emptyTipRow}>• Explore nearby MIDC industrial areas</Text>
              </View>

              <TouchableOpacity
                style={styles.resetFilterBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Jobs');
                  setActiveFilters({
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
                  });
                }}
              >
                <RotateCcw size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.resetFilterBtnText}>Reset Search & Filters</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 32 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  resultsInfoRow: {
    marginBottom: 10,
  },
  resultsCountText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyTipsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 18,
  },
  emptyTipsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  emptyTipRow: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 4,
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  resetFilterBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridContainer: {
    gap: 12,
  },
  listContainer: {
    gap: 8,
  },
  headerFilterBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerFilterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerFilterBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  activeTagsRow: {
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  activeFilterTagText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.primary,
    maxWidth: 160,
  },
  resetAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resetAllPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});
