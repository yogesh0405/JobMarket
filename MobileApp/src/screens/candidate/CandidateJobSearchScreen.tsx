import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  Building2,
  Clock,
  Users,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map,
  ChevronRight,
  Bell,
  Menu,
  MoreVertical,
  Star,
  GraduationCap,
  Award,
  X,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import { Header } from '../../components/common/Header';
import { Job } from '../../types';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';
import { CandidateSideDrawer } from '../../components/common/CandidateSideDrawer';
import { InteractiveJobMapView } from '../../components/map/InteractiveJobMapView';
import { JobFilterSideDrawer, FilterOptions } from '../../components/common/JobFilterSideDrawer';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';

const CATEGORIES = [
  'All Jobs',
  'HR Jobs',
  'Marketing Jobs',
  'ITI & Trade Jobs',
  'Engineering',
  'Hospitality',
  'Healthcare',
  'Education',
];

const FALLBACK_JOBS: Job[] = [
  {
    id: 'fallback-job-1',
    employer_id: 'emp-1',
    company: 'Skyline Manufacturing',
    title: 'TIG Welder (GTAW)',
    industry: 'Welding & Metal Fabrication',
    location: 'pune',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 0,
    max_experience: 2,
    salary_min: 200000,
    salary_max: 250000,
    openings: 5,
    description: 'Looking for skilled TIG Welder for stainless steel pipe fabrication in Pune MIDC.',
    responsibilities: ['Execute TIG welding as per drawing', 'Inspect weld joints for quality'],
    requirements: ['ITI Welder certificate', '0-2 years experience'],
    skills: ['TIG Welding', 'GTAW', 'Blueprint Reading'],
    status: 'APPROVED',
    posted_at: '7h ago',
    shift_details: 'Day Shift (8:00 AM - 5:00 PM (9 hrs))',
  },
  {
    id: 'fallback-job-2',
    employer_id: 'emp-2',
    company: 'Siemens Industrial Automation',
    title: 'Control Panel Wireman',
    industry: 'Electricals & Electronics',
    location: 'Chakan MIDC, Pune',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 0,
    max_experience: 3,
    salary_min: 180000,
    salary_max: 300000,
    openings: 8,
    description: 'Control panel wiring and testing for PLC automation systems.',
    responsibilities: ['Wire control panels as per schematic', 'Test circuit continuity'],
    requirements: ['ITI Electrician or Wireman', '0-3 years experience'],
    skills: ['Control Wiring', 'Panel Assembly', 'Circuit Testing'],
    status: 'APPROVED',
    posted_at: '12h ago',
    shift_details: 'Day Shift (8:30 AM - 5:30 PM)',
  },
  {
    id: 'fallback-job-3',
    employer_id: 'emp-3',
    company: 'Tata Motors Component Unit',
    title: 'CNC & VMC Machine Operator',
    industry: 'CNC Machining & Tooling',
    location: 'Bhosari MIDC, Pune',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 1,
    max_experience: 4,
    salary_min: 220000,
    salary_max: 320000,
    openings: 12,
    description: 'Precision component machining on Fanuc / Siemens controlled CNC VMC machines.',
    responsibilities: ['Load components and set zero offset', 'Measure dimensions using micrometer'],
    requirements: ['ITI Machinist / Turner / CNC operator', '1+ year experience'],
    skills: ['CNC Operating', 'VMC Operating', 'Vernier & Micrometer'],
    status: 'APPROVED',
    posted_at: '1d ago',
    shift_details: 'Rotational Shift (8 hrs)',
  },
  {
    id: 'fallback-job-4',
    employer_id: 'emp-4',
    company: 'Bajaj Auto Plant',
    title: 'Senior HR Executive',
    industry: 'HR Jobs',
    location: 'Waluj MIDC, Chhatrapati SambhajiNagar',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 2,
    max_experience: 5,
    salary_min: 350000,
    salary_max: 500000,
    openings: 2,
    description: 'Factory manpower recruitment, payroll processing, and attendance management.',
    responsibilities: ['Manage daily worker attendance', 'Conduct hiring interviews for technicians'],
    requirements: ['MBA HR or BBA', '2-5 years experience in factory HR'],
    skills: ['Recruitment', 'Payroll', 'Labour Laws'],
    status: 'APPROVED',
    posted_at: '2d ago',
    shift_details: 'General Shift (9:00 AM - 6:00 PM)',
  },
  {
    id: 'fallback-job-5',
    employer_id: 'emp-5',
    company: 'Godrej Consumer Products',
    title: 'Marketing Executive',
    industry: 'Marketing Jobs',
    location: 'Pune Regional Office',
    job_type: 'Full-time',
    work_mode: 'Hybrid',
    min_experience: 1,
    max_experience: 3,
    salary_min: 300000,
    salary_max: 450000,
    openings: 4,
    description: 'Field marketing, dealer network expansion, and promotional campaigns.',
    responsibilities: ['Visit dealer networks', 'Execute promotional events'],
    requirements: ['Degree in Marketing / Commerce', 'Good communication skills'],
    skills: ['B2B Sales', 'Dealer Management', 'Promotional Campaigns'],
    status: 'APPROVED',
    posted_at: '3d ago',
    shift_details: 'Flexible Hours',
  },
  {
    id: 'fallback-job-6',
    employer_id: 'emp-6',
    company: 'Sahyadri Specialty Hospital',
    title: 'Staff Nurse & Medical Assistant',
    industry: 'Healthcare',
    location: 'Deccan Gymkhana, Pune',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 0,
    max_experience: 3,
    salary_min: 240000,
    salary_max: 360000,
    openings: 6,
    description: 'Patient care, vitals monitoring, and assisting ICU doctors in ward operations.',
    responsibilities: ['Administer medication', 'Maintain patient charts'],
    requirements: ['B.Sc Nursing or GNM Certificate'],
    skills: ['Patient Care', 'ICU Care', 'Vitals Monitoring'],
    status: 'APPROVED',
    posted_at: '4d ago',
    shift_details: 'Rotational Shift (8 hrs)',
  },
];

interface Props {
  navigation: any;
}

const getInitialsColors = (title: string): [string, string] => {
  const palette: Array<[string, string]> = [
    ['#0284C7', '#0369A1'],
    ['#9A3412', '#7C2D12'],
    ['#854D0E', '#713F12'],
    ['#B91C1C', '#991B1B'],
    ['#A16207', '#854D0E'],
    ['#BE185D', '#9D174D'],
    ['#C2410C', '#9A3412'],
    ['#9D174D', '#831843'],
    ['#1D4ED8', '#1E3A8A'],
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

const getJobInitials = (title: string) => {
  if (!title) return 'JM';
  const clean = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

const formatTimeAgo = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) return 'Recently';

  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    const str = String(dateInput).trim();
    if (/^\d+[mhdws]\s+ago$/i.test(str) || str.toLowerCase() === 'just now') {
      return str;
    }
    date = new Date(str);
  }

  if (isNaN(date.getTime())) {
    return 'Recently';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateJobSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { showToast } = useToast();

  const SEARCH_PLACEHOLDERS = ['Search jobs...', 'Search trades...', 'Search locations...'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(route?.params?.keyword || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const searchInputRef = React.useRef<TextInput>(null);

  const matchedSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    // 1. Matched Jobs from live database jobs
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
  }, [searchQuery, jobs]);
  const [selectedCategory, setSelectedCategory] = useState('All Jobs');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [activeSelectedJobId, setActiveSelectedJobId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const refreshOffsetRef = React.useRef(0);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    industry: route?.params?.industry || 'All Industries',
    jobType: 'All Types',
    workMode: 'All Modes',
    minExperience: 'All Experience',
    salaryMin: 0,
    midcZone: route?.params?.location || 'All MIDC Zones',
    busFacility: false,
    canteen: false,
    accommodation: false,
    overtime: false,
  });

  const defaultFilters: FilterOptions = {
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
  };

  // Safely consume route search parameters ONCE without infinite render loop
  React.useEffect(() => {
    if (route?.params) {
      const p = route.params;
      if (p.keyword !== undefined && p.keyword !== searchQuery) {
        setSearchQuery(p.keyword);
      }
      if (p.industry) {
        setActiveFilters((prev) => ({ ...prev, industry: p.industry }));
      }
      if (p.location) {
        setActiveFilters((prev) => ({ ...prev, midcZone: p.location }));
      }
      if (p.education && p.education !== searchQuery) {
        setSearchQuery(p.education);
      }
    }
  }, [route?.params]);

  // Real-time duration ticker (updates every 30s)
  const [, setTick] = useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const loadJobsData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const [allRes, savedRes] = await Promise.all([
        candidateApi.getAllJobs(searchQuery),
        candidateApi.getSavedJobs().catch(() => ({ success: false, data: [] })),
      ]);

      const rawData: any = allRes;
      let realJobs: Job[] = [];

      if (Array.isArray(rawData)) {
        realJobs = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        realJobs = rawData.data;
      } else if (rawData && rawData.success && Array.isArray(rawData.jobs)) {
        realJobs = rawData.jobs;
      }

      if (realJobs.length > 0) {
        setJobs(realJobs);
      } else {
        setJobs(FALLBACK_JOBS);
      }

      const rawSaved: any = savedRes;
      let savedList: any[] = [];
      if (Array.isArray(rawSaved)) savedList = rawSaved;
      else if (rawSaved && rawSaved.data && Array.isArray(rawSaved.data)) savedList = rawSaved.data;

      const savedIds = savedList.map((j: any) => j.id || j.jobId || j.job_id).filter(Boolean);
      setSavedJobIds(savedIds);
    } catch (e) {
      console.log('Error fetching candidate jobs from backend, using fallback:', e);
      setJobs(FALLBACK_JOBS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const timer = setTimeout(() => {
        loadJobsData(false);
      }, 0);
      return () => clearTimeout(timer);
    }, [loadJobsData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    setSearchQuery('');
    setSelectedCategory('All Jobs');
    setActiveFilters(defaultFilters);
    setVisibleCount(15);
    if (navigation && typeof navigation.setParams === 'function') {
      navigation.setParams({
        keyword: undefined,
        industry: undefined,
        location: undefined,
        education: undefined,
      });
    }

    try {
      const [allRes, savedRes] = await Promise.all([
        candidateApi.getAllJobs(''),
        candidateApi.getSavedJobs().catch(() => ({ success: false, data: [] })),
      ]);

      const rawData: any = allRes;
      let realJobs: Job[] = [];

      if (Array.isArray(rawData)) {
        realJobs = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        realJobs = rawData.data;
      } else if (rawData && rawData.success && Array.isArray(rawData.jobs)) {
        realJobs = rawData.jobs;
      }

      if (realJobs.length > 0) {
        refreshOffsetRef.current = (refreshOffsetRef.current + 3) % realJobs.length;
        const offset = refreshOffsetRef.current;
        const rotatedJobs = [...realJobs.slice(offset), ...realJobs.slice(0, offset)];
        setJobs(rotatedJobs);
      } else {
        setJobs(FALLBACK_JOBS);
      }

      const rawSaved: any = savedRes;
      let savedList: any[] = [];
      if (Array.isArray(rawSaved)) savedList = rawSaved;
      else if (rawSaved && rawSaved.data && Array.isArray(rawSaved.data)) savedList = rawSaved.data;

      const savedIds = savedList.map((j: any) => j.id || j.jobId || j.job_id).filter(Boolean);
      setSavedJobIds(savedIds);
    } catch (e) {
      console.log('Error refreshing candidate jobs from backend:', e);
      setJobs(FALLBACK_JOBS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

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

    candidateApi.toggleSaveJob(jobId).catch(() => { });
  }, [showToast]);

  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatch = job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch = job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatch = titleMatch || companyMatch || locationMatch;

    const catMatch =
      selectedCategory === 'All Jobs' ||
      (job.trade && job.trade.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (job.industry && job.industry.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (job.title && job.title.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'HR Jobs' && (job.title.includes('HR') || job.industry.includes('HR'))) ||
      (selectedCategory === 'Marketing Jobs' && (job.title.includes('Marketing') || job.industry.includes('Marketing'))) ||
      (selectedCategory === 'ITI & Trade Jobs' && (job.title.includes('Welder') || job.title.includes('Wireman') || job.title.includes('CNC') || job.title.includes('Fitter'))) ||
      (selectedCategory === 'Healthcare' && (job.title.includes('Nurse') || job.industry.includes('Healthcare')));

    if (!queryMatch || !catMatch) return false;

    // Filter Side Drawer options
    if (activeFilters.industry !== 'All Industries') {
      const indKey = activeFilters.industry.toLowerCase();
      const jobInd = (job.industry || '').toLowerCase();
      const jobTitle = (job.title || '').toLowerCase();
      if (!jobInd.includes(indKey) && !jobTitle.includes(indKey)) return false;
    }

    if (activeFilters.midcZone !== 'All MIDC Zones') {
      const zoneKey = activeFilters.midcZone.toLowerCase();
      const jobLoc = (job.location || '').toLowerCase();
      if (!jobLoc.includes(zoneKey)) return false;
    }

    if (activeFilters.jobType !== 'All Types') {
      const typeKey = activeFilters.jobType.toLowerCase();
      const jType = (job.job_type || (job as any).jobType || '').toLowerCase();
      if (!jType.includes(typeKey)) return false;
    }

    if (activeFilters.workMode !== 'All Modes') {
      const modeKey = activeFilters.workMode.toLowerCase();
      const jMode = (job.work_mode || (job as any).workMode || '').toLowerCase();
      if (!jMode.includes(modeKey)) return false;
    }

    if (activeFilters.busFacility && !(job.bus_facility || (job as any).busFacility)) return false;
    if (activeFilters.canteen && !(job.canteen || (job as any).canteen)) return false;
    if (activeFilters.accommodation && !(job.accommodation || (job as any).accommodation)) return false;
    if (activeFilters.overtime && !(job.overtime || (job as any).overtime)) return false;

    return true;
  });

  const getMatchingCountForDraft = useCallback(
    (draftFilters: FilterOptions) => {
      return jobs.filter((job) => {
        const titleMatch = job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase());
        const companyMatch = job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase());
        const locationMatch = job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase());
        const queryMatch = titleMatch || companyMatch || locationMatch;

        const catMatch =
          selectedCategory === 'All Jobs' ||
          (job.trade && job.trade.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (job.industry && job.industry.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (job.title && job.title.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (selectedCategory === 'HR Jobs' && (job.title.includes('HR') || job.industry.includes('HR'))) ||
          (selectedCategory === 'Marketing Jobs' && (job.title.includes('Marketing') || job.industry.includes('Marketing'))) ||
          (selectedCategory === 'ITI & Trade Jobs' && (job.title.includes('Welder') || job.title.includes('Wireman') || job.title.includes('CNC') || job.title.includes('Fitter'))) ||
          (selectedCategory === 'Healthcare' && (job.title.includes('Nurse') || job.industry.includes('Healthcare')));

        if (!queryMatch || !catMatch) return false;

        // Filter Side Drawer options
        if (draftFilters.industry !== 'All Industries') {
          const indKey = draftFilters.industry.toLowerCase();
          const jobInd = (job.industry || '').toLowerCase();
          const jobTitle = (job.title || '').toLowerCase();
          if (!jobInd.includes(indKey) && !jobTitle.includes(indKey)) return false;
        }

        if (draftFilters.midcZone !== 'All MIDC Zones') {
          const zoneKey = draftFilters.midcZone.toLowerCase();
          const jobLoc = (job.location || '').toLowerCase();
          if (!jobLoc.includes(zoneKey)) return false;
        }

        if (draftFilters.jobType !== 'All Types') {
          const typeKey = draftFilters.jobType.toLowerCase();
          const jType = (job.job_type || (job as any).jobType || '').toLowerCase();
          if (!jType.includes(typeKey)) return false;
        }

        if (draftFilters.workMode !== 'All Modes') {
          const modeKey = draftFilters.workMode.toLowerCase();
          const jMode = (job.work_mode || (job as any).workMode || '').toLowerCase();
          if (!jMode.includes(modeKey)) return false;
        }

        if (draftFilters.minExperience !== 'All Experience') {
          if (draftFilters.minExperience.includes('Fresher') && (job as any).min_experience && (job as any).min_experience > 0) return false;
        }

        if (draftFilters.busFacility && !(job.bus_facility || (job as any).busFacility)) return false;
        if (draftFilters.canteen && !(job.canteen || (job as any).canteen)) return false;
        if (draftFilters.accommodation && !(job.accommodation || (job as any).accommodation)) return false;
        if (draftFilters.overtime && !(job.overtime || (job as any).overtime)) return false;

        return true;
      }).length;
    },
    [jobs, searchQuery, selectedCategory]
  );

  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 250;

      if (isCloseToBottom && !loading && !loadingMore && visibleCount < filteredJobs.length) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 15, filteredJobs.length));
          setLoadingMore(false);
        }, 200);
      }
    },
    [loading, loadingMore, visibleCount, filteredJobs.length]
  );

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      {/* Find Jobs Title & View Segmented Controls */}
      <View style={[styles.titleViewRow, { paddingHorizontal: 16 }]}>
        <Text style={styles.screenTitleText}>Find Jobs</Text>

        <View style={styles.viewSegmentBox}>
          <TouchableOpacity
            style={[styles.segmentBtn, viewMode === 'grid' && styles.segmentBtnActive]}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.7}
          >
            <LayoutGrid size={15} color={viewMode === 'grid' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.segmentBtnText, viewMode === 'grid' && styles.segmentBtnTextActive]}>Grid</Text>
            {viewMode === 'grid' ? <View style={styles.activeTabIndicator} /> : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, viewMode === 'list' && styles.segmentBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.7}
          >
            <List size={15} color={viewMode === 'list' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.segmentBtnText, viewMode === 'list' && styles.segmentBtnTextActive]}>List</Text>
            {viewMode === 'list' ? <View style={styles.activeTabIndicator} /> : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, viewMode === 'map' && styles.segmentBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.7}
          >
            <Map size={15} color={viewMode === 'map' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.segmentBtnText, viewMode === 'map' && styles.segmentBtnTextActive]}>Map</Text>
            {viewMode === 'map' ? <View style={styles.activeTabIndicator} /> : null}
          </TouchableOpacity>
        </View>
      </View>



      {/* Search Input & Filters Button Row */}
      {(() => {
        const activeFilterCount = [
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

        return (
          <View style={{ zIndex: 999, position: 'relative', marginHorizontal: 16, marginBottom: 12 }}>
            <View style={[styles.inputSearchBox, isInputFocused && styles.inputSearchBoxActive]}>
              <Search size={18} color={isInputFocused ? '#2563EB' : '#64748B'} />
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <SlidersHorizontal size={18} color={activeFilterCount > 0 ? '#2563EB' : '#475569'} />
                {activeFilterCount > 0 && (
                  <View style={styles.filterBadgePillInline}>
                    <Text style={styles.filterBadgePillText}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Live Autocomplete Suggestions Overlay (Only visible when text is entered) */}
            {showSuggestions && searchQuery.trim().length > 0 ? (
              <View style={styles.suggestionsContainer}>
                {searchQuery.trim().length > 0 ? (
                  <TouchableOpacity
                    style={styles.suggestionRowHeader}
                    onPress={() => {
                      setShowSuggestions(false);
                    }}
                  >
                    <Search size={15} color="#2563EB" />
                    <Text style={styles.suggestionHeaderText} numberOfLines={1}>
                      Search all jobs matching "<Text style={{ fontWeight: '800', color: '#2563EB' }}>{searchQuery.trim()}</Text>"
                    </Text>
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
                          setActiveSelectedJobId(j.id);
                          setDrawerOpen(true);
                        }}
                      >
                        <Briefcase size={16} color="#2563EB" />
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
              </View>
            ) : null}
          </View>
        );
      })()}

      {/* Dynamic View Mode Switching: Map View vs Scrollable Stream */}
      {viewMode === 'map' ? (
        <InteractiveJobMapView
          jobs={filteredJobs}
          activeJobId={activeSelectedJobId}
          onSelectJob={(job) => setActiveSelectedJobId(job.id)}
          navigation={navigation}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        >
          {/* Jobs Stream Skeleton Loading */}
          {loading ? (
            <View style={{ marginTop: 4 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((key) => (
                viewMode === 'list' ? (
                  <View key={key} style={styles.compactListCard}>
                    <SkeletonLoader width={44} height={44} style={{ borderRadius: 6 }} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <SkeletonLoader width="65%" height={15} style={{ borderRadius: 4 }} />
                      <SkeletonLoader width="45%" height={12} style={{ borderRadius: 4 }} />
                    </View>
                  </View>
                ) : (
                  <View key={key} style={[styles.naukriJobCard, { marginBottom: 12 }]}>
                    <View style={styles.naukriCardTopSection}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SkeletonLoader width="70%" height={18} style={{ borderRadius: 4 }} />
                        <SkeletonLoader width={20} height={20} style={{ borderRadius: 10 }} />
                      </View>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                        <SkeletonLoader width="30%" height={14} style={{ borderRadius: 4 }} />
                        <SkeletonLoader width="30%" height={14} style={{ borderRadius: 4 }} />
                        <SkeletonLoader width="25%" height={14} style={{ borderRadius: 4 }} />
                      </View>
                    </View>
                    <View style={styles.naukriCardMiddleSection}>
                      <SkeletonLoader width={65} height={20} style={{ borderRadius: 4 }} />
                      <SkeletonLoader width={65} height={20} style={{ borderRadius: 4 }} />
                      <SkeletonLoader width={80} height={20} style={{ borderRadius: 4 }} />
                    </View>
                    <View style={styles.naukriCardBottomSection}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <SkeletonLoader width={38} height={38} style={{ borderRadius: 6 }} />
                        <View style={{ flex: 1, gap: 4 }}>
                          <SkeletonLoader width="50%" height={13} style={{ borderRadius: 4 }} />
                          <SkeletonLoader width="35%" height={11} style={{ borderRadius: 4 }} />
                        </View>
                      </View>
                      <SkeletonLoader width={45} height={11} style={{ borderRadius: 4 }} />
                    </View>
                  </View>
                )
              ))}
            </View>
          ) : filteredJobs.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Building2 size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Industrial Vacancies Found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your search query or trade category.</Text>
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Jobs');
                }}
              >
                <Text style={styles.resetFilterBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {filteredJobs.slice(0, visibleCount).map((job) => {
                const logoUrl = getCompanyLogoUrl(
                  job.company,
                  job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo,
                  (job as any).companyColor
                );

                if (viewMode === 'list') {
                  const isSelected = activeSelectedJobId === job.id;

                  return (
                    <TouchableOpacity
                      key={job.id}
                      activeOpacity={0.88}
                      style={[styles.compactListCard, isSelected && styles.compactListCardActive]}
                      onPress={() => {
                        setActiveSelectedJobId(job.id);
                        navigation.navigate('CandidateJobDetail', { jobId: job.id });
                      }}
                    >
                      {/* Left Company Logo Badge */}
                      <CompanyLogoAvatar
                        logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo}
                        companyName={job.company}
                        size={42}
                        borderRadius={6}
                      />

                      {/* Center Title & Location Stack */}
                      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                        <Text style={styles.listJobTitle} numberOfLines={1} ellipsizeMode="tail">
                          {job.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0 }}>
                          <MapPin size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
                          <Text style={styles.listLocationText} numberOfLines={1} ellipsizeMode="tail">
                            {job.location || 'Chhatrapati Sambhajinagar'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }

                const isSaved = savedJobIds.includes(job.id);
                const expText =
                  job.min_experience !== undefined || job.minExperience !== undefined
                    ? `${job.min_experience ?? job.minExperience}-${job.max_experience ?? job.maxExperience} Yrs Exp`
                    : '0-2 Yrs Exp';

                return (
                  <TouchableOpacity
                    key={job.id}
                    activeOpacity={0.92}
                    style={styles.naukriJobCard}
                    onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
                  >
                    {/* Grid Card Top Section */}
                    <View style={styles.naukriCardTopSection}>
                      <View style={styles.naukriTitleRow}>
                        <Text style={styles.naukriJobTitle} numberOfLines={1}>
                          {job.title}
                        </Text>
                        <TouchableOpacity
                          style={styles.naukriBookmarkBtn}
                          onPress={() => handleToggleSave(job.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Bookmark
                            size={18}
                            color={isSaved ? '#2563EB' : '#94A3B8'}
                            fill={isSaved ? '#2563EB' : 'transparent'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.naukriSpecsRow}>
                        <View style={styles.naukriSpecItem}>
                          <Briefcase size={13} color="#64748B" />
                          <Text style={styles.naukriSpecText}>{expText}</Text>
                        </View>

                        <Text style={styles.naukriDivider}>|</Text>

                        <View style={styles.naukriSpecItem}>
                          <Text style={{ fontWeight: '700', color: '#64748B', fontSize: 12 }}>₹</Text>
                          <Text style={styles.naukriSpecText}>
                            {(job.salary_min ?? job.salaryMin) && (job.salary_max ?? job.salaryMax)
                              ? `${((job.salary_min ?? job.salaryMin) / 100000).toFixed(1)}-${((job.salary_max ?? job.salaryMax) / 100000).toFixed(1)} Lacs PA`
                              : '3.5-5.5 Lacs PA'}
                          </Text>
                        </View>

                        <Text style={styles.naukriDivider}>|</Text>

                        <View style={styles.naukriSpecItem}>
                          <MapPin size={13} color="#64748B" />
                          <Text style={styles.naukriSpecText} numberOfLines={1}>
                            {job.location || 'Chhatrapati Sambhajinagar'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Grid Card Middle Simple Text Row with Icons (No Separators) */}
                    <View style={styles.naukriCardMiddleSection}>
                      <View style={styles.naukriSpecItem}>
                        <Clock size={13} color="#64748B" />
                        <Text style={styles.naukriSimpleText}>{job.job_type || (job as any).jobType || 'Full-time'}</Text>
                      </View>

                      <View style={styles.naukriSpecItem}>
                        <Building2 size={13} color="#64748B" />
                        <Text style={styles.naukriSimpleText}>{job.work_mode || (job as any).workMode || 'On-site'}</Text>
                      </View>

                      {(job.openings || (job as any).vacancies) ? (
                        <View style={styles.naukriSpecItem}>
                          <Users size={13} color="#64748B" />
                          <Text style={styles.naukriSimpleText}>
                            {job.openings || (job as any).vacancies} Vacancies
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Grid Card Bottom Company & Duration Footer Section */}
                    <View style={styles.naukriCardBottomSection}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <CompanyLogoAvatar
                          logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo}
                          companyName={job.company}
                          size={38}
                          borderRadius={6}
                        />

                        <View style={{ flex: 1 }}>
                          <Text style={styles.naukriCompanyName} numberOfLines={1}>
                            {job.company || 'Industrial Company'}
                          </Text>
                          <Text style={styles.naukriPostedByText} numberOfLines={1}>
                            Posted by {job.company || 'Recruiter'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.naukriTimeAgoText}>
                        {formatTimeAgo(job.posted_at || (job as any).postedAt || (job as any).created_at || (job as any).createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Load Next Vacancies Pagination Action */}
              {visibleCount < filteredJobs.length && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.loadMoreNextJobsBtn}
                  onPress={() => {
                    setLoadingMore(true);
                    setTimeout(() => {
                      setVisibleCount((prev) => Math.min(prev + 15, filteredJobs.length));
                      setLoadingMore(false);
                    }, 200);
                  }}
                >
                  <Text style={styles.loadMoreNextJobsBtnText}>
                    Load Next Vacancies ({visibleCount} of {filteredJobs.length} Shown)
                  </Text>
                  <ChevronRight size={16} color="#2563EB" />
                </TouchableOpacity>
              )}

              {/* Infinite Scroll Bottom Spinner */}
              {loadingMore && (
                <View style={styles.infiniteScrollContainer}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={styles.infiniteScrollText}>Loading more vacancies...</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Filter Side Drawer Modal */}
      <JobFilterSideDrawer
        visible={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        currentFilters={activeFilters}
        onApplyFilters={(newFilters) => setActiveFilters(newFilters)}
        onResetFilters={() =>
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
          })
        }
        totalMatchingJobsCount={filteredJobs.length}
        onGetMatchingCount={getMatchingCountForDraft}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  brandTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
  },
  brandSubtitleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    position: 'relative',
    padding: 6,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  menuBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  topSearchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
  titleViewRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
  },
  screenTitleText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    flexShrink: 1,
  },
  viewSegmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: 'relative',
  },
  segmentBtnActive: {},
  activeTabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  segmentBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  categoryCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillsRow: {
    gap: 8,
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  categoryPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  catArrowRightBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  inputSearchBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  inputSearchBoxActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
  inlineFilterBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inlineFilterBtnActive: {
    backgroundColor: '#EFF6FF',
  },
  filterBadgePillInline: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgePillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  suggestionGroup: {
    marginBottom: 8,
  },
  suggestionGroupLabel: {
    fontSize: 10,
    fontWeight: '800',
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
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    marginBottom: 4,
  },
  suggestionItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionItemSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  inputSearchText: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  compactListCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  compactListCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  listLogoSquare: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  listLogoImg: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  listJobTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  listLocationText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  naukriJobCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginVertical: 3,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  naukriCardTopSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 6,
  },
  naukriTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  naukriJobTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
    letterSpacing: -0.2,
    flex: 1,
  },
  naukriBookmarkBtn: {
    padding: 2,
  },
  naukriSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  naukriSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  naukriSpecText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  naukriSpecTextBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  naukriDivider: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  naukriCardMiddleSection: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  naukriSimpleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  naukriCardBottomSection: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  naukriLogoSquare: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  naukriLogoImg: {
    width: 34,
    height: 34,
    borderRadius: 4,
  },
  naukriCompanyName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  naukriPostedByText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 1,
  },
  naukriTimeAgoText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  webJobCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  cardHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  companyIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyLogoImg: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  titleCompanyStack: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    marginLeft: 4,
  },
  cardJobTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 18,
  },
  subCompanyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
  },
  companyNameText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  bulletDot: {
    color: '#94A3B8',
    fontSize: 10,
  },
  cardLocationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  bookmarkBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardExpSalaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 6,
  },
  leftExpAddressGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metaItemGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verticalDivider: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '400',
  },
  expText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '700',
  },
  salaryText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '900',
  },
  tagsBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    overflow: 'hidden',
  },
  onsiteBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onsiteBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  fullTimeBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fullTimeBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 1,
  },
  shiftBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 1,
  },
  companyFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postedByText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  timeAgoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
  },
  resetFilterBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  resetFilterBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  loadMoreNextJobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  loadMoreNextJobsBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  infiniteScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  infiniteScrollText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});
