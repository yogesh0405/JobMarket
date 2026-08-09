import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
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
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface FilterOptions {
  industry: string;
  jobType: string;
  workMode: string;
  minExperience: string;
  salaryMin: number;
  midcZone: string;
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
}) => {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.fullScreenContainer, { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 12) }]}>
        {/* Full Page Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.headerTitle}>Filter Vacancies</Text>
            <Text style={styles.headerSubtitle}>Refine by MIDC zone, trade & benefits</Text>
          </View>

          <TouchableOpacity style={styles.resetHeaderBtn} onPress={handleReset}>
            <RotateCcw size={14} color="#2563EB" />
            <Text style={styles.resetHeaderBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Filter Options Body */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Industry / Trade Category */}
          <View style={styles.filterCard3D}>
            <View style={styles.sectionTitleRow}>
              <Building2 size={16} color="#2563EB" />
              <Text style={styles.sectionTitle}>Industry Sector</Text>
            </View>
            <View style={styles.pillsWrap}>
              {INDUSTRIES.map((ind) => {
                const isActive = filters.industry === ind;
                return (
                  <TouchableOpacity
                    key={ind}
                    activeOpacity={0.8}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, industry: ind })}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {ind}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. MIDC Industrial Zone */}
          <View style={styles.filterCard3D}>
            <View style={styles.sectionTitleRow}>
              <MapPin size={16} color="#2563EB" />
              <Text style={styles.sectionTitle}>MIDC Industrial Zone</Text>
            </View>
            <View style={styles.pillsWrap}>
              {MIDC_ZONES.map((zone) => {
                const isActive = filters.midcZone === zone;
                return (
                  <TouchableOpacity
                    key={zone}
                    activeOpacity={0.8}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, midcZone: zone })}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {zone}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Job Type & Work Mode */}
          <View style={styles.filterCard3D}>
            <View style={styles.sectionTitleRow}>
              <Briefcase size={16} color="#2563EB" />
              <Text style={styles.sectionTitle}>Employment Type</Text>
            </View>
            <View style={styles.pillsWrap}>
              {JOB_TYPES.map((jt) => {
                const isActive = filters.jobType === jt;
                return (
                  <TouchableOpacity
                    key={jt}
                    activeOpacity={0.8}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, jobType: jt })}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {jt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.sectionTitleRow, { marginTop: 12 }]}>
              <Clock size={16} color="#2563EB" />
              <Text style={styles.sectionTitle}>Work Mode</Text>
            </View>
            <View style={styles.pillsWrap}>
              {WORK_MODES.map((wm) => {
                const isActive = filters.workMode === wm;
                return (
                  <TouchableOpacity
                    key={wm}
                    activeOpacity={0.8}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, workMode: wm })}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {wm}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Experience Level */}
          <View style={styles.filterCard3D}>
            <View style={styles.sectionTitleRow}>
              <Award size={16} color="#2563EB" />
              <Text style={styles.sectionTitle}>Experience Required</Text>
            </View>
            <View style={styles.pillsWrap}>
              {EXPERIENCE_LEVELS.map((exp) => {
                const isActive = filters.minExperience === exp;
                return (
                  <TouchableOpacity
                    key={exp}
                    activeOpacity={0.8}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, minExperience: exp })}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {exp}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Company Facilities & Amenities */}
          <View style={styles.filterCard3D}>
            <View style={styles.sectionTitleRow}>
              <Sparkles size={16} color="#2563EB" />
              <Text style={styles.sectionTitle}>Factory Perks & Facilities</Text>
            </View>
            <View style={{ gap: 8 }}>
              {/* Bus Facility */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.checkboxRow}
                onPress={() => setFilters({ ...filters, busFacility: !filters.busFacility })}
              >
                <View style={[styles.checkboxBox, filters.busFacility && styles.checkboxBoxActive]}>
                  {filters.busFacility && <Check size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Bus / Company Transport Facility</Text>
              </TouchableOpacity>

              {/* Subsidized Canteen */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.checkboxRow}
                onPress={() => setFilters({ ...filters, canteen: !filters.canteen })}
              >
                <View style={[styles.checkboxBox, filters.canteen && styles.checkboxBoxActive]}>
                  {filters.canteen && <Check size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Subsidized Canteen / Meals</Text>
              </TouchableOpacity>

              {/* Hostel / Accommodation */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.checkboxRow}
                onPress={() => setFilters({ ...filters, accommodation: !filters.accommodation })}
              >
                <View style={[styles.checkboxBox, filters.accommodation && styles.checkboxBoxActive]}>
                  {filters.accommodation && <Check size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Free / Subsidized Hostel Accommodation</Text>
              </TouchableOpacity>

              {/* Overtime Pay */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.checkboxRow}
                onPress={() => setFilters({ ...filters, overtime: !filters.overtime })}
              >
                <View style={[styles.checkboxBox, filters.overtime && styles.checkboxBoxActive]}>
                  {filters.overtime && <Check size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Overtime Pay (OT Available)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Full Page Action Bar */}
        <View style={[styles.fixedFooter, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
          <TouchableOpacity style={styles.resetFooterBtn} onPress={handleReset} activeOpacity={0.8}>
            <RotateCcw size={16} color="#475569" />
            <Text style={styles.resetFooterBtnText}>Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyFooterBtn} onPress={handleApply} activeOpacity={0.85}>
            <Text style={styles.applyFooterBtnText}>
              Apply Filters ({totalMatchingJobsCount} Vacancies)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  resetHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  resetHeaderBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  filterCard3D: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  resetFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
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
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 13,
  },
  applyFooterBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
