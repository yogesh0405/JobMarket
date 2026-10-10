import { COLORS } from '../../constants/theme';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Building2,
  Briefcase,
  MapPin,
  IndianRupee,
  Award,
  Layers,
  Sparkles,
  ArrowLeft,
  Wrench,
  Clock,
  Bus,
  Utensils,
  Home,
  Zap,
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export interface FilterOptions {
  industry: string;
  industries?: string[];
  education?: string;
  educations?: string[];
  jobRole?: string;
  jobRoles?: string[];
  jobType: string;
  jobTypes?: string[];
  workMode: string;
  workModes?: string[];
  minExperience: string;
  salaryMin: number;
  midcZone: string;
  locations?: string[];
  distance?: string;
  busFacility: boolean;
  canteen: boolean;
  accommodation: boolean;
  overtime: boolean;
}

interface JobFilterSideDrawerProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  currentFilters: FilterOptions;
  totalMatchingJobsCount: number;
  onGetMatchingCount?: (draftFilters: FilterOptions) => number;
}

const INDUSTRIES = [
  'All Industries',
  'Automotive & Heavy Engineering',
  'Machining & ITI Trades',
  'Pharma & Healthcare',
  'IT & Software Engineering',
  'Hospitality & Retail',
  'Education & Academics',
];

const EDUCATIONS = [
  'All Education Levels',
  '10th Pass',
  '12th Pass',
  'ITI Certificate (Fitter / Welder / Electrician / CNC / Machinist)',
  'Diploma (Mechanical / Electrical / Civil / Automobile)',
  'B.E. / B.Tech (Engineering / Technical)',
  'Graduate (BA / B.Com / B.Sc / BCA / BBA)',
  'Post Graduate (M.Tech / MBA / MCA)',
];

const JOB_TYPES = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Apprenticeship'];
const WORK_MODES = ['All Modes', 'On-site', 'Hybrid', 'Remote'];
const EXPERIENCE_LEVELS = ['All Experience', 'Fresher (0 Yrs)', '1-3 Years', '3-5 Years', '5+ Years'];
const MIDC_ZONES = [
  'All MIDC Zones',
  'Chitegaon MIDC',
  'Waluj MIDC',
  'Shendra MIDC',
  'Chhatrapati Sambhajinagar',
];

export const JobFilterSideDrawer: React.FC<JobFilterSideDrawerProps> = ({
  visible,
  onClose,
  onApplyFilters,
  onResetFilters,
  currentFilters,
  totalMatchingJobsCount,
  onGetMatchingCount,
}) => {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  // Real-time dynamic count calculation based on current draft filters
  const liveCount = onGetMatchingCount ? onGetMatchingCount(filters) : totalMatchingJobsCount;

  // Sync internal state when opened
  React.useEffect(() => {
    if (visible) {
      setFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

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
    onResetFilters();
  };

  const toggleIndustry = (ind: string) => {
    if (ind === 'All Industries') {
      setFilters({ ...filters, industry: 'All Industries', industries: [] });
      return;
    }
    const current = filters.industries && filters.industries.length > 0 
      ? [...filters.industries] 
      : (filters.industry && filters.industry !== 'All Industries' ? [filters.industry] : []);
    const exists = current.includes(ind);
    const updated = exists ? current.filter(x => x !== ind) : [...current, ind];
    setFilters({
      ...filters,
      industry: updated.length > 0 ? updated[0] : 'All Industries',
      industries: updated,
    });
  };

  const isIndustryActive = (ind: string) => {
    if (ind === 'All Industries') {
      return (!filters.industries || filters.industries.length === 0) && (!filters.industry || filters.industry === 'All Industries');
    }
    if (filters.industries && filters.industries.length > 0) {
      return filters.industries.includes(ind);
    }
    return filters.industry === ind;
  };

  const toggleEducation = (edu: string) => {
    if (edu === 'All Education Levels') {
      setFilters({ ...filters, education: 'All Education Levels', educations: [] });
      return;
    }
    const current = filters.educations && filters.educations.length > 0
      ? [...filters.educations]
      : (filters.education && filters.education !== 'All Education Levels' ? [filters.education] : []);
    const exists = current.includes(edu);
    const updated = exists ? current.filter(x => x !== edu) : [...current, edu];
    setFilters({
      ...filters,
      education: updated.length > 0 ? updated[0] : 'All Education Levels',
      educations: updated,
    });
  };

  const isEducationActive = (edu: string) => {
    if (edu === 'All Education Levels') {
      return (!filters.educations || filters.educations.length === 0) && (!filters.education || filters.education === 'All Education Levels');
    }
    if (filters.educations && filters.educations.length > 0) {
      return filters.educations.includes(edu);
    }
    return filters.education === edu;
  };

  const toggleMidcZone = (zone: string) => {
    if (zone === 'All MIDC Zones') {
      setFilters({ ...filters, midcZone: 'All MIDC Zones', locations: [] });
      return;
    }
    const current = filters.locations && filters.locations.length > 0
      ? [...filters.locations]
      : (filters.midcZone && filters.midcZone !== 'All MIDC Zones' ? [filters.midcZone] : []);
    const exists = current.includes(zone);
    const updated = exists ? current.filter(x => x !== zone) : [...current, zone];
    setFilters({
      ...filters,
      midcZone: updated.length > 0 ? updated[0] : 'All MIDC Zones',
      locations: updated,
    });
  };

  const isZoneActive = (zone: string) => {
    if (zone === 'All MIDC Zones') {
      return (!filters.locations || filters.locations.length === 0) && (!filters.midcZone || filters.midcZone === 'All MIDC Zones');
    }
    if (filters.locations && filters.locations.length > 0) {
      return filters.locations.includes(zone);
    }
    return filters.midcZone === zone;
  };

  const toggleWorkMode = (wm: string) => {
    if (wm === 'All Modes') {
      setFilters({ ...filters, workMode: 'All Modes', workModes: [] });
      return;
    }
    const current = filters.workModes && filters.workModes.length > 0
      ? [...filters.workModes]
      : (filters.workMode && filters.workMode !== 'All Modes' ? [filters.workMode] : []);
    const exists = current.includes(wm);
    const updated = exists ? current.filter(x => x !== wm) : [...current, wm];
    setFilters({
      ...filters,
      workMode: updated.length > 0 ? updated[0] : 'All Modes',
      workModes: updated,
    });
  };

  const isWorkModeActive = (wm: string) => {
    if (wm === 'All Modes') {
      return (!filters.workModes || filters.workModes.length === 0) && (!filters.workMode || filters.workMode === 'All Modes');
    }
    if (filters.workModes && filters.workModes.length > 0) {
      return filters.workModes.includes(wm);
    }
    return filters.workMode === wm;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.fullScreenContainer} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {/* iOS Navigation Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filter Vacancies</Text>
          </View>

          {/* Job Count Badge on Far Right Side Completely */}
          <View style={styles.headerCountPillRight}>
            <Text style={styles.headerCountPillText}>{liveCount} Jobs</Text>
          </View>
        </View>

        {/* Scrollable iOS Settings Group List */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 1: INDUSTRY SECTOR */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>INDUSTRY SECTOR (MULTI-SELECT)</Text>
            {INDUSTRIES.map((ind, idx) => {
              const isActive = isIndustryActive(ind);
              const isLast = idx === INDUSTRIES.length - 1;
              return (
                <TouchableOpacity
                  key={ind}
                  activeOpacity={0.7}
                  style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                  onPress={() => toggleIndustry(ind)}
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
            <Text style={styles.groupHeaderLabel}>MINIMUM EDUCATION & DEGREE (MULTI-SELECT)</Text>
            {EDUCATIONS.map((edu, idx) => {
              const isActive = isEducationActive(edu);
              const isLast = idx === EDUCATIONS.length - 1;
              return (
                <TouchableOpacity
                  key={edu}
                  activeOpacity={0.7}
                  style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                  onPress={() => toggleEducation(edu)}
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

          {/* SECTION 3: MIDC INDUSTRIAL ZONE */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>MIDC INDUSTRIAL ZONE (MULTI-SELECT)</Text>
            {MIDC_ZONES.map((zone, idx) => {
              const isActive = isZoneActive(zone);
              const isLast = idx === MIDC_ZONES.length - 1;
              return (
                <TouchableOpacity
                  key={zone}
                  activeOpacity={0.7}
                  style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                  onPress={() => toggleMidcZone(zone)}
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

          {/* SECTION 4: EMPLOYMENT TYPE */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>EMPLOYMENT TYPE</Text>
            {JOB_TYPES.map((jt, idx) => {
              const isActive = filters.jobType === jt;
              const isLast = idx === JOB_TYPES.length - 1;
              return (
                <TouchableOpacity
                  key={jt}
                  activeOpacity={0.7}
                  style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                  onPress={() => setFilters({ ...filters, jobType: jt })}
                >
                  <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                    {jt}
                  </Text>
                  {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.sectionDivider} />

          {/* SECTION 5: WORK MODE */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>WORK MODE (MULTI-SELECT)</Text>
            {WORK_MODES.map((wm, idx) => {
              const isActive = isWorkModeActive(wm);
              const isLast = idx === WORK_MODES.length - 1;
              return (
                <TouchableOpacity
                  key={wm}
                  activeOpacity={0.7}
                  style={[styles.cleanOptionRow, !isLast && styles.cleanRowBorder]}
                  onPress={() => toggleWorkMode(wm)}
                >
                  <Text style={[styles.cleanOptionText, isActive && styles.cleanOptionTextActive]}>
                    {wm}
                  </Text>
                  {isActive && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.sectionDivider} />

          {/* SECTION 5: EXPERIENCE REQUIRED */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>EXPERIENCE REQUIRED</Text>
            {EXPERIENCE_LEVELS.map((exp, idx) => {
              const isActive = filters.minExperience === exp;
              const isLast = idx === EXPERIENCE_LEVELS.length - 1;
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

          {/* SECTION 6: PERKS & FACILITIES */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>PERKS & FACILITIES</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.cleanOptionRow, styles.cleanRowBorder]}
              onPress={() => setFilters({ ...filters, busFacility: !filters.busFacility })}
            >
              <View style={styles.facilityLabelWrap}>
                <Bus size={18} color={COLORS.primary} />
                <Text style={styles.facilityLabelText}>Bus / Company Transport Facility</Text>
              </View>
              <View style={[styles.checkboxSquare, filters.busFacility && styles.checkboxSquareActive]}>
                {filters.busFacility && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.cleanOptionRow, styles.cleanRowBorder]}
              onPress={() => setFilters({ ...filters, canteen: !filters.canteen })}
            >
              <View style={styles.facilityLabelWrap}>
                <Utensils size={18} color="#D97706" />
                <Text style={styles.facilityLabelText}>Subsidized Canteen / Meals</Text>
              </View>
              <View style={[styles.checkboxSquare, filters.canteen && styles.checkboxSquareActive]}>
                {filters.canteen && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.cleanOptionRow, styles.cleanRowBorder]}
              onPress={() => setFilters({ ...filters, accommodation: !filters.accommodation })}
            >
              <View style={styles.facilityLabelWrap}>
                <Home size={18} color="#16A34A" />
                <Text style={styles.facilityLabelText}>Subsidized Hostel Accommodation</Text>
              </View>
              <View style={[styles.checkboxSquare, filters.accommodation && styles.checkboxSquareActive]}>
                {filters.accommodation && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cleanOptionRow}
              onPress={() => setFilters({ ...filters, overtime: !filters.overtime })}
            >
              <View style={styles.facilityLabelWrap}>
                <Clock size={18} color="#7C3AED" />
                <Text style={styles.facilityLabelText}>Overtime Pay (OT Available)</Text>
              </View>
              <View style={[styles.checkboxSquare, filters.overtime && styles.checkboxSquareActive]}>
                {filters.overtime && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.fixedFooter}>
          <TouchableOpacity style={styles.resetFooterBtn} onPress={handleReset} activeOpacity={0.8}>
            <RotateCcw size={16} color="#475569" />
            <Text style={styles.resetFooterBtnText}>Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyFooterBtn} onPress={handleApply} activeOpacity={0.85}>
            <Text style={styles.applyFooterBtnText}>
              Apply Filters ({liveCount} Jobs)
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
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
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerCountPillRight: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerCountPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  groupHeaderLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.0,
    marginTop: 10,
    marginBottom: 8,
    paddingLeft: 2,
  },
  proRightTickBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  cleanRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cleanOptionText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#334155',
  },
  cleanOptionTextActive: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionDivider: {
    height: 1.5,
    backgroundColor: '#CBD5E1',
    marginVertical: 14,
  },
  facilityLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  facilityLabelText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSquareActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  resetFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 16,
    height: 48,
  },
  resetFooterBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  applyFooterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    height: 48,
  },
  applyFooterBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
