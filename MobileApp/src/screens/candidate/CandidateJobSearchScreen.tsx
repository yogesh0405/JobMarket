import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  Building2,
  Clock,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map,
  ChevronRight,
  Bell,
  Menu,
  MoreVertical,
  Star,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';
import { CandidateSideDrawer } from '../../components/common/CandidateSideDrawer';

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

export const CandidateJobSearchScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>(FALLBACK_JOBS);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Jobs');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [drawerOpen, setDrawerOpen] = useState(false);

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

      if (realJobs && realJobs.length > 0) {
        console.log(`Successfully loaded ${realJobs.length} REAL DATABASE JOBS from backend!`);
        setJobs(realJobs);
      } else {
        setJobs(FALLBACK_JOBS);
      }

      const savedData: any = savedRes;
      if (savedData && Array.isArray(savedData)) {
        setSavedJobIds(savedData.map((j: any) => j.id));
      } else if (savedData && savedData.success && Array.isArray(savedData.data)) {
        setSavedJobIds(savedData.data.map((j: any) => j.id));
      }
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
      loadJobsData(false);
    }, [loadJobsData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadJobsData(false);
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

    return queryMatch && catMatch;
  });

  return (
    <View style= { styles.container } >
    {/* Web Identical Top Header Bar */ }
    <View style = { styles.topHeaderBar } >
      <View style={ styles.brandRow }>
        <View style={ styles.brandLogoSquare }>
          <Text style={ styles.brandLogoText }> JM </Text>
            </View>
            <View >
            <Text style={ styles.brandTitleText }> JobMarket </Text>
              <Text style = { styles.brandSubtitleText } > Industrial & Factory Jobs </Text>
                </View>
                </View>

                <View style = { styles.headerIconsRow } >
                  <TouchableOpacity style={ styles.bellBtn }>
                    <Bell size={ 20 } color = "#0F172A" />
                      <View style={ styles.bellBadge }>
                        <Text style={ styles.bellBadgeText }> 1 </Text>
                          </View>
                          </TouchableOpacity>
                          <TouchableOpacity style = { styles.menuBtn } onPress = {() => setDrawerOpen(true)}>
                            <MoreVertical size={ 24 } color = "#0F172A" />
                              </TouchableOpacity>
                              </View>
                              </View>

                              <CandidateSideDrawer
visible = { drawerOpen }
onClose = {() => setDrawerOpen(false)}
navigation = { navigation }
  />

  {/* Main Scroll Content */ }
  <ScrollView
contentContainerStyle = { styles.scrollContent }
showsVerticalScrollIndicator = { false}
refreshControl = {<RefreshControl refreshing = { refreshing } onRefresh = { onRefresh } colors = { ['#2563EB']} />}
      >
  {/* Find Jobs Title & View Segmented Controls */ }
  <View style = { styles.titleViewRow } >
    <Text style={ styles.screenTitleText }> Find Jobs </Text>

      <View style = { styles.viewSegmentBox } >
        <TouchableOpacity
              style={ [styles.segmentBtn, viewMode === 'grid' && styles.segmentBtnActive] }
onPress = {() => setViewMode('grid')}
            >
  <LayoutGrid size={ 15 } color = { viewMode === 'grid' ? '#2563EB' : '#64748B'} />
    <Text style = { [styles.segmentBtnText, viewMode === 'grid' && styles.segmentBtnTextActive]} > Grid </Text>
      </TouchableOpacity>

      <TouchableOpacity
style = { [styles.segmentBtn, viewMode === 'list' && styles.segmentBtnActive]}
onPress = {() => setViewMode('list')}
            >
  <List size={ 15 } color = { viewMode === 'list' ? '#2563EB' : '#64748B'} />
    <Text style = { [styles.segmentBtnText, viewMode === 'list' && styles.segmentBtnTextActive]} > List </Text>
      </TouchableOpacity>

      <TouchableOpacity
style = { [styles.segmentBtn, viewMode === 'map' && styles.segmentBtnActive]}
onPress = {() => setViewMode('map')}
            >
  <Map size={ 15 } color = { viewMode === 'map' ? '#2563EB' : '#64748B'} />
    <Text style = { [styles.segmentBtnText, viewMode === 'map' && styles.segmentBtnTextActive]} > Map </Text>
      </TouchableOpacity>
      </View>
      </View>

{/* Category Horizontal Filter Card */ }
<View style={ styles.categoryCardContainer }>
  <ScrollView horizontal showsHorizontalScrollIndicator = { false} contentContainerStyle = { styles.categoryPillsRow } >
  {
    CATEGORIES.map((cat) => {
      const isActive = selectedCategory === cat;
      return (
        <TouchableOpacity
                  key= { cat }
      activeOpacity = { 0.85}
      style = { [styles.categoryPill, isActive && styles.categoryPillActive]}
      onPress = {() => setSelectedCategory(cat)
    }
                >
      <Text style={ [styles.categoryPillText, isActive && styles.categoryPillTextActive]} > { cat } </Text>
    </TouchableOpacity>
    );
  })}
</ScrollView>
  <TouchableOpacity style = { styles.catArrowRightBtn } >
    <ChevronRight size={ 16 } color = "#64748B" />
      </TouchableOpacity>
      </View>

{/* Search Input & Filters Button Row */ }
<View style={ styles.searchFilterRow }>
  <View style={ styles.inputSearchBox }>
    <Search size={ 18 } color = "#94A3B8" />
      <TextInput
              style={ styles.inputSearchText }
placeholder = "Search jobs, skills..."
placeholderTextColor = "#94A3B8"
value = { searchQuery }
onChangeText = { setSearchQuery }
  />
  </View>

  <TouchableOpacity style = { styles.filtersBtn } >
    <SlidersHorizontal size={ 16 } color = "#0F172A" />
      <Text style={ styles.filtersBtnText }> Filters </Text>
        </TouchableOpacity>
        </View>

{/* Jobs Stream */ }
{
  loading && !refreshing ? (
    <View style= {{ gap: 12 }
}>
  <SkeletonLoader width="100%" height = { 180} style = {{ borderRadius: 8 }} />
    <SkeletonLoader width = "100%" height = { 180} style = {{ borderRadius: 8 }} />
      </View>
        ) : filteredJobs.length === 0 ? (
  <View style= { styles.emptyStateCard } >
  <Building2 size={ 44 } color = "#94A3B8" />
    <Text style={ styles.emptyTitle }> No Industrial Vacancies Found </Text>
      <Text style = { styles.emptyDesc } > Try adjusting your search query or trade category.</Text>
        <TouchableOpacity
style = { styles.resetFilterBtn }
onPress = {() => {
  setSearchQuery('');
  setSelectedCategory('All Jobs');
}}
            >
  <Text style={ styles.resetFilterBtnText }> Reset Filters </Text>
    </TouchableOpacity>
    </View>
        ) : (
  filteredJobs.map((job) => {
    const isSaved = savedJobIds.includes(job.id);
    const expText =
      job.min_experience !== undefined || job.minExperience !== undefined
        ? `${job.min_experience ?? job.minExperience}-${job.max_experience ?? job.maxExperience} Yrs Exp`
        : '0-2 Yrs Exp';
    const salaryText = job.salary_min
      ? `₹${(job.salary_min / 100000).toFixed(0)}-${(job.salary_max / 100000).toFixed(0)} Lacs / yr`
      : '₹2-4 Lacs / yr';

    const logoUrl = job.companyLogo || (job as any).company_logo;

    return (
      <TouchableOpacity
                key= { job.id }
    activeOpacity = { 0.88}
    style = { styles.webJobCard }
    onPress = {() => navigation.navigate('CandidateJobDetail', { jobId: job.id })
  }
              >
    {/* Header: Company Icon + Job Title Stack + Bookmark */ }
    <View style = { styles.cardHeaderTopRow } >
    <View style={ styles.companyIconSquare } >
  {
    logoUrl?(
                      <Image
                        source = {{ uri: logoUrl }}
                        style = { styles.companyLogoImg }
                        resizeMode = "contain"
    />
                    ) : (
  <Building2 size= { 18} color = "#2563EB" />
                    )}
</View>

  <View style = { styles.titleCompanyStack } >
    <Text style={ styles.cardJobTitle } numberOfLines = { 1} >
      { job.title }
      </Text>
      <Text style = { styles.companyNameText } numberOfLines = { 1} >
        { job.company || 'Skyline Manufacturing' }
        </Text>
        </View>

        <TouchableOpacity
style = { styles.bookmarkBtn }
activeOpacity = { 0.4}
hitSlop = {{ top: 12, bottom: 12, left: 12, right: 12 }}
onPress = {(e) => {
  e.stopPropagation();
  handleToggleSave(job.id);
}}
                  >
  <Bookmark
                      size={ 18 }
color = { isSaved? '#2563EB': '#94A3B8' }
fill = { isSaved? '#2563EB': 'transparent' }
  />
  </TouchableOpacity>
  </View>

{/* Experience, Address & Salary Unified Row */ }
<View style={ styles.cardExpSalaryRow }>
  <View style={ styles.leftExpAddressGroup }>
    <View style={ styles.metaItemGroup }>
      <Briefcase size={ 13 } color = "#2563EB" />
        <Text style={ styles.expText }> { expText } </Text>
          </View>

          <Text style = { styles.verticalDivider } >| </Text>

            <View style = { styles.metaItemGroup } >
              <MapPin size={ 13 } color = "#64748B" />
                <Text style={ styles.cardLocationText } numberOfLines = { 1} >
                  { job.location || 'Pune MIDC' }
                  </Text>
                  </View>
                  </View>

                  <Text style = { styles.salaryText } > { salaryText } </Text>
                    </View>

{/* Tags Badge Row - All in One Single Row */ }
<View style={ styles.tagsBadgeRow }>
  <View style={ styles.onsiteBadge }>
    <Text style={ styles.onsiteBadgeText } numberOfLines = { 1} > { job.work_mode || job.workMode || 'Onsite' } </Text>
      </View>
      <View style = { styles.fullTimeBadge } >
        <Text style={ styles.fullTimeBadgeText } numberOfLines = { 1} > { job.job_type || job.jobType || 'Full-Time' } </Text>
          </View>
          <View style = { styles.shiftBadge } >
            <Clock size={ 11 } color = "#7C3AED" />
              <Text style={ styles.shiftBadgeText } numberOfLines = { 1} > { job.shift_details || 'Day Shift (8:00 AM - 5:00 PM)' } </Text>
                </View>
                </View>

{/* Footer Divider */ }
<View style={ styles.cardDivider } />

{/* Company & Posted Time Footer */ }
<View style={ styles.companyFooterRow }>
  <Text style={ styles.postedByText }> Posted by { job.company || 'Skyline' } </Text>
    <Text style = { styles.timeAgoText } > { job.posted_at || '7h ago' } </Text>
      </View>
      </TouchableOpacity>
            );
          })
        )}
</ScrollView>
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
    paddingBottom: 95,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  topSearchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  topSearchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  titleViewRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '700',
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
    borderRadius: 10,
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
    borderRadius: 6,
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
    borderRadius: 16,
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
  },
  inputSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputSearchText: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  webJobCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2,
    borderBottomColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10,
    gap: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  companyIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyLogoImg: {
    width: 32,
    height: 32,
    borderRadius: 5,
  },
  titleCompanyStack: {
    flex: 1,
    justifyContent: 'center',
    gap: 1,
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
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
