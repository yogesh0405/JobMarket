import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { FilterOptions } from '../../components/common/JobFilterSideDrawer';

export const JOB_INDUSTRIES: string[] = [
  'All Industries',
  'Automotive & Heavy Engineering',
  'Machining & ITI Trades',
  'Pharma & Healthcare',
  'IT & Software Engineering',
  'Hospitality & Retail',
  'Education & Academics',
];

export const JOB_EDUCATIONS: string[] = [
  'All Education Levels',
  '10th Pass',
  '12th Pass',
  'ITI Certificate (Fitter / Welder / Electrician / CNC / Machinist)',
  'Diploma (Mechanical / Electrical / Civil / Automobile)',
  'B.E. / B.Tech (Engineering / Technical)',
  'Graduate (BA / B.Com / B.Sc / BCA / BBA)',
  'Post Graduate (M.Tech / MBA / MCA)',
];

export const JOB_TYPES_LIST: string[] = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Apprenticeship'];
export const JOB_WORK_MODES: string[] = ['All Modes', 'On-site', 'Hybrid', 'Remote'];
export const JOB_EXPERIENCES: string[] = ['All Experience', 'Fresher (0 Yrs)', '1-3 Years', '3-5 Years', '5+ Years'];
export const JOB_MIDC_ZONES: string[] = [
  'All MIDC Zones',
  'Waluj MIDC',
  'Shendra MIDC',
  'Chikalthana MIDC',
  'Chitegaon MIDC',
  'Paithan MIDC',
  'Bidkin DMIC',
  'Railway Station Industrial Area',
  'Chhatrapati Sambhajinagar',
  'Chakan MIDC',
  'Bhosari MIDC',
  'Talegaon MIDC',
  'Ranjangaon MIDC',
];

export const JOB_SALARY_OPTIONS: { label: string; val: number }[] = [
  { label: 'Any Salary', val: 0 },
  { label: '₹10,000+ / month', val: 10000 },
  { label: '₹15,000+ / month', val: 15000 },
  { label: '₹20,000+ / month', val: 20000 },
  { label: '₹30,000+ / month', val: 30000 },
  { label: '₹50,000+ / month', val: 50000 },
];

export const JobFilterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialFilters: FilterOptions = route.params?.currentFilters || {
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

  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
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
    setFilters(defaultFilters);
    if (route.params?.onResetFilters) {
      route.params.onResetFilters();
    }
  };

  const handleApply = () => {
    if (route.params?.onApplyFilters) {
      route.params.onApplyFilters(filters);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
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

        {route.params?.totalMatchingJobsCount !== undefined && (
          <View style={styles.headerCountPillRight}>
            <Text style={styles.headerCountPillText}>{route.params.totalMatchingJobsCount} Jobs</Text>
          </View>
        )}
      </View>

      {/* Scrollable Filters List */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: INDUSTRY SECTOR */}
        <View style={styles.sectionContainer}>
          <Text style={styles.groupHeaderLabel}>INDUSTRY SECTOR</Text>
          {JOB_INDUSTRIES.map((ind: string, idx: number) => {
            const isActive = filters.industry === ind;
            const isLast = idx === JOB_INDUSTRIES.length - 1;
            return (
              <TouchableOpacity
                key={ind}
                activeOpacity={0.7}
                style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                onPress={() => setFilters({ ...filters, industry: ind })}
              >
                <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                  {ind}
                </Text>
                {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionDivider} />

        {/* SECTION 2: MINIMUM EDUCATION & DEGREE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.groupHeaderLabel}>MINIMUM EDUCATION & DEGREE</Text>
          {JOB_EDUCATIONS.map((edu: string, idx: number) => {
            const isActive = (filters.education || 'All Education Levels') === edu;
            const isLast = idx === JOB_EDUCATIONS.length - 1;
            return (
              <TouchableOpacity
                key={edu}
                activeOpacity={0.7}
                style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                onPress={() => setFilters({ ...filters, education: edu })}
              >
                <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                  {edu}
                </Text>
                {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionDivider} />

        {/* SECTION 3: MIDC ZONE & LOCATION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.groupHeaderLabel}>MIDC ZONE / INDUSTRIAL AREA</Text>
          {JOB_MIDC_ZONES.map((zone: string, idx: number) => {
            const isActive = filters.midcZone === zone;
            const isLast = idx === JOB_MIDC_ZONES.length - 1;
            return (
              <TouchableOpacity
                key={zone}
                activeOpacity={0.7}
                style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                onPress={() => setFilters({ ...filters, midcZone: zone })}
              >
                <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                  {zone}
                </Text>
                {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionDivider} />

        {/* SECTION 4: MINIMUM SALARY RANGE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.groupHeaderLabel}>MINIMUM MONTHLY SALARY</Text>
          {JOB_SALARY_OPTIONS.map((sal: { label: string; val: number }, idx: number) => {
            const isActive = (filters.salaryMin || 0) === sal.val;
            const isLast = idx === JOB_SALARY_OPTIONS.length - 1;
            return (
              <TouchableOpacity
                key={sal.label}
                activeOpacity={0.7}
                style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                onPress={() => setFilters({ ...filters, salaryMin: sal.val })}
              >
                <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                  {sal.label}
                </Text>
                {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionDivider} />

        {/* SECTION 5: EXPERIENCE LEVEL */}
        <View style={styles.sectionContainer}>
          <Text style={styles.groupHeaderLabel}>EXPERIENCE LEVEL</Text>
          {JOB_EXPERIENCES.map((exp: string, idx: number) => {
            const isActive = filters.minExperience === exp;
            const isLast = idx === JOB_EXPERIENCES.length - 1;
            return (
              <TouchableOpacity
                key={exp}
                activeOpacity={0.7}
                style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                onPress={() => setFilters({ ...filters, minExperience: exp })}
              >
                <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                  {exp}
                </Text>
                {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionDivider} />

        {/* SECTION 6: WORK MODE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.groupHeaderLabel}>WORK MODE</Text>
          {JOB_WORK_MODES.map((mode: string, idx: number) => {
            const isActive = filters.workMode === mode;
            const isLast = idx === JOB_WORK_MODES.length - 1;
            return (
              <TouchableOpacity
                key={mode}
                activeOpacity={0.7}
                style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                onPress={() => setFilters({ ...filters, workMode: mode })}
              >
                <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                  {mode}
                </Text>
                {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionDivider} />

        {/* SECTION 7: EMPLOYMENT TYPE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.groupHeaderLabel}>JOB CONTRACT TYPE</Text>
          {JOB_TYPES_LIST.map((type: string, idx: number) => {
            const isActive = filters.jobType === type;
            const isLast = idx === JOB_TYPES_LIST.length - 1;
            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.7}
                style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                onPress={() => setFilters({ ...filters, jobType: type })}
              >
                <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                  {type}
                </Text>
                {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionDivider} />

        {/* SECTION 8: INDUSTRIAL PERKS & FACILITIES */}
        <View style={styles.sectionContainer}>
          <Text style={styles.groupHeaderLabel}>FACILITIES & SHIFT PERKS</Text>
          
          <View style={[styles.switchRow, styles.cleanRowBorder]}>
            <Text style={styles.switchLabel}>Bus / Free Transport</Text>
            <Switch
              value={!!filters.busFacility}
              onValueChange={(val: boolean) => setFilters({ ...filters, busFacility: val })}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.switchRow, styles.cleanRowBorder]}>
            <Text style={styles.switchLabel}>Canteen / Subsidized Food</Text>
            <Switch
              value={!!filters.canteen}
              onValueChange={(val: boolean) => setFilters({ ...filters, canteen: val })}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.switchRow, styles.cleanRowBorder]}>
            <Text style={styles.switchLabel}>Accommodation / Room Provided</Text>
            <Switch
              value={!!filters.accommodation}
              onValueChange={(val: boolean) => setFilters({ ...filters, accommodation: val })}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Overtime Pay Available</Text>
            <Switch
              value={!!filters.overtime}
              onValueChange={(val: boolean) => setFilters({ ...filters, overtime: val })}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <RotateCcw size={14} color="#64748B" />
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApply}
          activeOpacity={0.85}
        >
          <Check size={14} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
          <Text style={styles.applyBtnText}>Apply Filters</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerCountPillRight: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  headerCountPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  groupHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#64748B',
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  cleanOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cleanRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cleanOptionText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#334155',
    flex: 1,
    paddingRight: 8,
  },
  cleanOptionTextActive: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#1E293B',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  resetBtn: {
    height: 38,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
  },
  resetBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  applyBtn: {
    flex: 1,
    height: 38,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.card,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
