import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Clock,
  Gift,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { FilterOptions } from '../../components/common/JobFilterSideDrawer';
import { Job } from '../../types';

export type JobFilterTabKey =
  | 'INDUSTRY'
  | 'EDUCATION'
  | 'EXPERIENCE'
  | 'LOCATION'
  | 'JOB_TYPE'
  | 'WORK_MODE'
  | 'AMENITIES';

export const JOB_INDUSTRIES: string[] = [
  'All Industries',
  'Automotive & Auto Components',
  'Industrial & Heavy Manufacturing',
  'CNC Machining & Precision Tooling',
  'Pharmaceutical & Chemical Manufacturing',
  'Electronics & Electrical Assembly',
  'Steel, Metal & Fabrication',
  'Packaging, Paper & Printing',
  'Food Processing & Beverages',
  'Textile & Garment Manufacturing',
  'Warehouse & Logistics Operations',
  'IT & Software Engineering',
];

export const JOB_EDUCATIONS: string[] = [
  'All Education Levels',
  '10th / SSC Pass',
  '12th / HSC Pass',
  'ITI Certificate (Fitter / Welder / Electrician / CNC / Machinist)',
  'Diploma in Engineering (Mechanical / Electrical / Automobile / Civil)',
  'B.E. / B.Tech (Engineering Graduate)',
  'Graduate (B.Sc / B.Com / BA / BCA / BBA)',
  'Post Graduate (M.Tech / MBA / MCA)',
];

export const JOB_EXPERIENCES: string[] = [
  'All Experience',
  'Fresher (0 Yrs)',
  '1-3 Years',
  '3-5 Years',
  '5+ Years',
];

export const JOB_MIDC_ZONES: string[] = [
  'All MIDC Zones',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Shendra MIDC / AURIC City (Chhatrapati Sambhajinagar)',
  'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
  'Chitegaon MIDC (Chhatrapati Sambhajinagar)',
  'Paithan MIDC (Chhatrapati Sambhajinagar)',
  'Bidkin DMIC / AURIC City (Chhatrapati Sambhajinagar)',
  'Railway Station Industrial Area',
  'Chhatrapati Sambhajinagar (All Areas)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Ranjangaon MIDC (Pune)',
  'Taloja MIDC (Navi Mumbai)',
  'Thane Belapur MIDC',
];

export const JOB_TYPES_LIST: string[] = [
  'All Types',
  'Full-time',
  'Part-time',
  'Contract',
  'Apprenticeship',
];

export const JOB_WORK_MODES: string[] = [
  'All Modes',
  'On-site',
  'Hybrid',
  'Remote',
];

export const JobFilterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const currentFilters: FilterOptions = route.params?.currentFilters || {
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
  };

  const initialTab: JobFilterTabKey = route.params?.defaultTab || 'INDUSTRY';
  const jobsList: Job[] = route.params?.jobs || [];

  const [activeFilterTab, setActiveFilterTab] = useState<JobFilterTabKey>(initialTab);
  const [draftIndustry, setDraftIndustry] = useState<string>(currentFilters.industry || 'All Industries');
  const [draftEducation, setDraftEducation] = useState<string>(currentFilters.education || 'All Education Levels');
  const [draftExp, setDraftExp] = useState<string>(currentFilters.minExperience || 'All Experience');
  const [draftZone, setDraftZone] = useState<string>(currentFilters.midcZone || 'All MIDC Zones');
  const [draftJobType, setDraftJobType] = useState<string>(currentFilters.jobType || 'All Types');
  const [draftWorkMode, setDraftWorkMode] = useState<string>(currentFilters.workMode || 'All Modes');
  const [draftBus, setDraftBus] = useState<boolean>(Boolean(currentFilters.busFacility));
  const [draftCanteen, setDraftCanteen] = useState<boolean>(Boolean(currentFilters.canteen));
  const [draftAccommodation, setDraftAccommodation] = useState<boolean>(Boolean(currentFilters.accommodation));
  const [draftOvertime, setDraftOvertime] = useState<boolean>(Boolean(currentFilters.overtime));

  const handleResetFilters = () => {
    setDraftIndustry('All Industries');
    setDraftEducation('All Education Levels');
    setDraftExp('All Experience');
    setDraftZone('All MIDC Zones');
    setDraftJobType('All Types');
    setDraftWorkMode('All Modes');
    setDraftBus(false);
    setDraftCanteen(false);
    setDraftAccommodation(false);
    setDraftOvertime(false);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (draftIndustry && draftIndustry !== 'All Industries') count++;
    if (draftEducation && draftEducation !== 'All Education Levels') count++;
    if (draftExp && draftExp !== 'All Experience') count++;
    if (draftZone && draftZone !== 'All MIDC Zones') count++;
    if (draftJobType && draftJobType !== 'All Types') count++;
    if (draftWorkMode && draftWorkMode !== 'All Modes') count++;
    if (draftBus) count++;
    if (draftCanteen) count++;
    if (draftAccommodation) count++;
    if (draftOvertime) count++;
    return count;
  }, [
    draftIndustry,
    draftEducation,
    draftExp,
    draftZone,
    draftJobType,
    draftWorkMode,
    draftBus,
    draftCanteen,
    draftAccommodation,
    draftOvertime,
  ]);

  // Real-time matching jobs calculation
  const draftMatchingCount = useMemo(() => {
    if (!jobsList || jobsList.length === 0) {
      return route.params?.totalMatchingJobsCount ?? 0;
    }

    return jobsList.filter((job) => {
      // 1. Industry
      if (draftIndustry && draftIndustry !== 'All Industries') {
        const rawInd = draftIndustry.toLowerCase().trim();
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

      // 2. Education
      if (draftEducation && draftEducation !== 'All Education Levels') {
        const edu = ((job as any).education || (job as any).educationRequirement || (job as any).education_requirement || '').toLowerCase();
        const target = draftEducation.toLowerCase();
        if (target.includes('10th') && !edu.includes('10th') && !edu.includes('ssc')) return false;
        if (target.includes('12th') && !edu.includes('12th') && !edu.includes('hsc')) return false;
        if (target.includes('iti') && !edu.includes('iti')) return false;
        if (target.includes('diploma') && !edu.includes('diploma')) return false;
        if (target.includes('b.e') && !edu.includes('b.e') && !edu.includes('b.tech') && !edu.includes('engineer')) return false;
      }

      // 3. Location / MIDC
      if (draftZone && draftZone !== 'All MIDC Zones') {
        const rawZone = draftZone.toLowerCase();
        const zoneTokens = rawZone.replace(/\s*\([^)]*\)/g, '').split(/[\s,/-]+/).filter((t) => t.length > 2 && t !== 'midc' && t !== 'zone');
        const jobLoc = (job.location || '').toLowerCase();
        const matchesZone = zoneTokens.length === 0 || zoneTokens.some((t) => jobLoc.includes(t));
        if (!matchesZone) return false;
      }

      // 4. Job Type
      if (draftJobType && draftJobType !== 'All Types') {
        const jType = (job.job_type || (job as any).jobType || '').toLowerCase();
        if (!jType.includes(draftJobType.toLowerCase())) return false;
      }

      // 5. Work Mode
      if (draftWorkMode && draftWorkMode !== 'All Modes') {
        const jMode = (job.work_mode || (job as any).workMode || '').toLowerCase();
        if (!jMode.includes(draftWorkMode.toLowerCase())) return false;
      }

      // 6. Amenities
      if (draftBus && !(job.bus_facility || (job as any).busFacility || (job.perks || []).includes('Bus Transport'))) return false;
      if (draftCanteen && !(job.canteen || (job as any).canteen || (job.perks || []).includes('Free Canteen'))) return false;
      if (draftAccommodation && !(job.accommodation || (job as any).accommodation || (job.perks || []).includes('Accommodation'))) return false;
      if (draftOvertime && !(job.overtime || (job as any).overtime || (job.perks || []).includes('Overtime Pay'))) return false;

      return true;
    }).length;
  }, [
    jobsList,
    draftIndustry,
    draftEducation,
    draftExp,
    draftZone,
    draftJobType,
    draftWorkMode,
    draftBus,
    draftCanteen,
    draftAccommodation,
    draftOvertime,
    route.params?.totalMatchingJobsCount,
  ]);

  const handleApplyFilters = () => {
    const applied: FilterOptions = {
      industry: draftIndustry,
      education: draftEducation,
      minExperience: draftExp,
      midcZone: draftZone,
      jobType: draftJobType,
      workMode: draftWorkMode,
      salaryMin: currentFilters.salaryMin || 0,
      busFacility: draftBus,
      canteen: draftCanteen,
      accommodation: draftAccommodation,
      overtime: draftOvertime,
    };

    if (typeof route.params?.onApplyFilters === 'function') {
      route.params.onApplyFilters(applied);
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CandidateMain', {
        screen: 'CandidateJobsTab',
        params: {
          screen: 'CandidateJobSearch',
          params: { appliedFilters: applied },
        },
      });
    }
  };

  const renderTabContent = () => {
    switch (activeFilterTab) {
      case 'INDUSTRY':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_INDUSTRIES.map((option) => {
              const isSelected = draftIndustry === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftIndustry(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                    {option}
                  </Text>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'EDUCATION':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_EDUCATIONS.map((option) => {
              const isSelected = draftEducation === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftEducation(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                    {option}
                  </Text>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'EXPERIENCE':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_EXPERIENCES.map((option) => {
              const isSelected = draftExp === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftExp(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                    {option}
                  </Text>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'LOCATION':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_MIDC_ZONES.map((option) => {
              const isSelected = draftZone === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftZone(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={2}>
                    {option}
                  </Text>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'JOB_TYPE':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_TYPES_LIST.map((option) => {
              const isSelected = draftJobType === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftJobType(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'WORK_MODE':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            {JOB_WORK_MODES.map((option) => {
              const isSelected = draftWorkMode === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setDraftWorkMode(option)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.8} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );

      case 'AMENITIES':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsListContainer}>
            <TouchableOpacity
              style={[styles.switchCardRow, draftBus && styles.switchCardRowActive]}
              onPress={() => setDraftBus(!draftBus)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, draftBus && styles.switchTitleActive]}>Free Bus Facility</Text>
                <Text style={styles.switchSub}>Company provided pick & drop transport</Text>
              </View>
              <Switch
                value={draftBus}
                onValueChange={setDraftBus}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={draftBus ? COLORS.primary : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchCardRow, draftCanteen && styles.switchCardRowActive]}
              onPress={() => setDraftCanteen(!draftCanteen)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, draftCanteen && styles.switchTitleActive]}>Free / Subsidized Canteen</Text>
                <Text style={styles.switchSub}>Tea, breakfast & nutritious meals</Text>
              </View>
              <Switch
                value={draftCanteen}
                onValueChange={setDraftCanteen}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={draftCanteen ? COLORS.primary : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchCardRow, draftAccommodation && styles.switchCardRowActive]}
              onPress={() => setDraftAccommodation(!draftAccommodation)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, draftAccommodation && styles.switchTitleActive]}>Accommodation / Hostel</Text>
                <Text style={styles.switchSub}>Company quarters or shared rooms</Text>
              </View>
              <Switch
                value={draftAccommodation}
                onValueChange={setDraftAccommodation}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={draftAccommodation ? COLORS.primary : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchCardRow, draftOvertime && styles.switchCardRowActive]}
              onPress={() => setDraftOvertime(!draftOvertime)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, draftOvertime && styles.switchTitleActive]}>Overtime (OT) Pay</Text>
                <Text style={styles.switchSub}>Extra double OT rate incentives</Text>
              </View>
              <Switch
                value={draftOvertime}
                onValueChange={setDraftOvertime}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={draftOvertime ? COLORS.primary : '#FFFFFF'}
              />
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter Vacancies</Text>
        </View>

        <View style={styles.headerCountPillRight}>
          <Text style={styles.headerCountPillText}>({draftMatchingCount}) Jobs</Text>
        </View>
      </View>

      {/* Two-Column Master-Detail Layout */}
      <View style={styles.twoColumnContainer}>
        {/* Left Column: Category Tabs */}
        <View style={styles.leftTabsColumn}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
            {/* 1. Industry */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'INDUSTRY' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('INDUSTRY')}
              activeOpacity={0.8}
            >
              <Building2
                size={18}
                color={activeFilterTab === 'INDUSTRY' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'INDUSTRY' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'INDUSTRY' && styles.tabTitleActive]}>
                  Industry
                </Text>
                {draftIndustry !== 'All Industries' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 2. Education */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'EDUCATION' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('EDUCATION')}
              activeOpacity={0.8}
            >
              <GraduationCap
                size={18}
                color={activeFilterTab === 'EDUCATION' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'EDUCATION' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'EDUCATION' && styles.tabTitleActive]}>
                  Education
                </Text>
                {draftEducation !== 'All Education Levels' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 3. Experience */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'EXPERIENCE' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('EXPERIENCE')}
              activeOpacity={0.8}
            >
              <Briefcase
                size={18}
                color={activeFilterTab === 'EXPERIENCE' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'EXPERIENCE' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'EXPERIENCE' && styles.tabTitleActive]}>
                  Experience
                </Text>
                {draftExp !== 'All Experience' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 4. Location / MIDC */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'LOCATION' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('LOCATION')}
              activeOpacity={0.8}
            >
              <MapPin
                size={18}
                color={activeFilterTab === 'LOCATION' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'LOCATION' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'LOCATION' && styles.tabTitleActive]}>
                  Location
                </Text>
                {draftZone !== 'All MIDC Zones' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 5. Job Type */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'JOB_TYPE' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('JOB_TYPE')}
              activeOpacity={0.8}
            >
              <Clock
                size={18}
                color={activeFilterTab === 'JOB_TYPE' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'JOB_TYPE' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'JOB_TYPE' && styles.tabTitleActive]}>
                  Job Type
                </Text>
                {draftJobType !== 'All Types' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 6. Work Mode */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'WORK_MODE' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('WORK_MODE')}
              activeOpacity={0.8}
            >
              <SlidersHorizontal
                size={18}
                color={activeFilterTab === 'WORK_MODE' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'WORK_MODE' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'WORK_MODE' && styles.tabTitleActive]}>
                  Work Mode
                </Text>
                {draftWorkMode !== 'All Modes' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 7. Amenities */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'AMENITIES' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('AMENITIES')}
              activeOpacity={0.8}
            >
              <Gift
                size={18}
                color={activeFilterTab === 'AMENITIES' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'AMENITIES' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'AMENITIES' && styles.tabTitleActive]}>
                  Perks
                </Text>
                {(draftBus || draftCanteen || draftAccommodation || draftOvertime) && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Right Column: Dynamic Options List */}
        <View style={styles.rightOptionsColumn}>{renderTabContent()}</View>
      </View>

      {/* Screen Bottom Actions Footer */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleResetFilters}
          activeOpacity={0.7}
        >
          <RotateCcw size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.resetBtnText}>Reset All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApplyFilters}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>
            Show ({draftMatchingCount}) Jobs
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerCountPillRight: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  headerCountPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  twoColumnContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftTabsColumn: {
    width: 120,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  tabsScrollContent: {
    paddingVertical: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    borderLeftColor: COLORS.primary,
  },
  tabTextGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  rightOptionsColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  optionsListContainer: {
    padding: 12,
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  optionRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  switchCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  switchCardRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  switchTitleActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    color: '#64748B',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  resetBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
