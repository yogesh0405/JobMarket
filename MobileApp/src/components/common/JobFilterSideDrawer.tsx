import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
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
} from 'lucide-react-native';

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
  'Waluj MIDC',
  'Shendra DMIC',
  'Chikalthana MIDC',
  'Railway Station MIDC',
  'Paithan MIDC',
  'CIDCO Commercial',
];

export const JobFilterSideDrawer: React.FC<JobFilterSideDrawerProps> = ({
  visible,
  onClose,
  onApplyFilters,
  onResetFilters,
  currentFilters,
  totalMatchingJobsCount,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropOverlay} activeOpacity={1} onPress={onClose} />

        <View style={styles.drawerContainer}>
          {/* Header Bar */}
          <View style={styles.drawerHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.headerIconSquare}>
                <SlidersHorizontal size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.drawerTitle}>Filter Jobs</Text>
                <Text style={styles.drawerSubtitle}>Refine industrial vacancies</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Filter Body Options */}
          <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
            {/* 1. Industry / Trade Category */}
            <View style={styles.filterSection}>
              <View style={styles.sectionTitleRow}>
                <Building2 size={15} color="#2563EB" />
                <Text style={styles.sectionTitle}>Industry & Trade Sector</Text>
              </View>
              <View style={styles.pillsWrap}>
                {INDUSTRIES.map((ind) => {
                  const active = filters.industry === ind;
                  return (
                    <TouchableOpacity
                      key={ind}
                      activeOpacity={0.8}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, industry: ind })}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{ind}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. MIDC Industrial Zone */}
            <View style={styles.filterSection}>
              <View style={styles.sectionTitleRow}>
                <MapPin size={15} color="#2563EB" />
                <Text style={styles.sectionTitle}>MIDC Zone / Location</Text>
              </View>
              <View style={styles.pillsWrap}>
                {MIDC_ZONES.map((zone) => {
                  const active = filters.midcZone === zone;
                  return (
                    <TouchableOpacity
                      key={zone}
                      activeOpacity={0.8}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, midcZone: zone })}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{zone}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Job Type & Work Mode */}
            <View style={styles.filterSection}>
              <View style={styles.sectionTitleRow}>
                <Briefcase size={15} color="#2563EB" />
                <Text style={styles.sectionTitle}>Job Type</Text>
              </View>
              <View style={styles.pillsWrap}>
                {JOB_TYPES.map((type) => {
                  const active = filters.jobType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      activeOpacity={0.8}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, jobType: type })}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Work Mode */}
            <View style={styles.filterSection}>
              <View style={styles.sectionTitleRow}>
                <Layers size={15} color="#2563EB" />
                <Text style={styles.sectionTitle}>Work Mode</Text>
              </View>
              <View style={styles.pillsWrap}>
                {WORK_MODES.map((mode) => {
                  const active = filters.workMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      activeOpacity={0.8}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, workMode: mode })}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{mode}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. Experience Level */}
            <View style={styles.filterSection}>
              <View style={styles.sectionTitleRow}>
                <Award size={15} color="#2563EB" />
                <Text style={styles.sectionTitle}>Experience Level</Text>
              </View>
              <View style={styles.pillsWrap}>
                {EXPERIENCE_LEVELS.map((exp) => {
                  const active = filters.minExperience === exp;
                  return (
                    <TouchableOpacity
                      key={exp}
                      activeOpacity={0.8}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, minExperience: exp })}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{exp}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 6. Perks & Facilities Checkboxes */}
            <View style={styles.filterSection}>
              <View style={styles.sectionTitleRow}>
                <Sparkles size={15} color="#2563EB" />
                <Text style={styles.sectionTitle}>Perks & Facilities</Text>
              </View>

              <View style={{ gap: 8, marginTop: 4 }}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => setFilters({ ...filters, busFacility: !filters.busFacility })}
                >
                  <View style={[styles.checkboxBox, filters.busFacility && styles.checkboxBoxActive]}>
                    {filters.busFacility && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Bus / Transport Facility</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => setFilters({ ...filters, canteen: !filters.canteen })}
                >
                  <View style={[styles.checkboxBox, filters.canteen && styles.checkboxBoxActive]}>
                    {filters.canteen && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Subsidized Canteen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => setFilters({ ...filters, accommodation: !filters.accommodation })}
                >
                  <View style={[styles.checkboxBox, filters.accommodation && styles.checkboxBoxActive]}>
                    {filters.accommodation && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Hostel / Accommodation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => setFilters({ ...filters, overtime: !filters.overtime })}
                >
                  <View style={[styles.checkboxBox, filters.overtime && styles.checkboxBoxActive]}>
                    {filters.overtime && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Overtime Pay (OT)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Sticky Actions Bar */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
              <RotateCcw size={16} color="#64748B" />
              <Text style={styles.resetBtnText}>Reset All</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
              <Text style={styles.applyBtnText}>
                Apply ({totalMatchingJobsCount} Jobs)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    flexDirection: 'row',
  },
  backdropOverlay: {
    flex: 1,
  },
  drawerContainer: {
    width: '82%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  drawerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  drawerBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
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
    paddingHorizontal: 12,
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
    paddingVertical: 4,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
  },
});
