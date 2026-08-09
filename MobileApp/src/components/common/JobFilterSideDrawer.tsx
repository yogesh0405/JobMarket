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
  Bus,
  Utensils,
  Home,
  Zap,
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
        {/* iOS Navigation Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Filter Vacancies</Text>
            <Text style={styles.headerSubtitle}>{totalMatchingJobsCount} Matching Jobs Found</Text>
          </View>

          <TouchableOpacity style={styles.resetHeaderBtn} onPress={handleReset}>
            <Text style={styles.resetHeaderBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable iOS Settings Group List */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 1: INDUSTRY SECTOR */}
          <Text style={styles.groupHeaderLabel}>INDUSTRY SECTOR</Text>
          <View style={styles.singleMasterCard}>
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

          {/* SECTION 2: MIDC INDUSTRIAL ZONE */}
          <Text style={styles.groupHeaderLabel}>MIDC INDUSTRIAL ZONE</Text>
          <View style={styles.singleMasterCard}>
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

          {/* SECTION 3: EMPLOYMENT TYPE */}
          <Text style={styles.groupHeaderLabel}>EMPLOYMENT TYPE</Text>
          <View style={styles.singleMasterCard}>
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
          </View>

          {/* SECTION 4: WORK MODE */}
          <Text style={styles.groupHeaderLabel}>WORK MODE</Text>
          <View style={styles.singleMasterCard}>
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

          {/* SECTION 5: EXPERIENCE REQUIRED */}
          <Text style={styles.groupHeaderLabel}>EXPERIENCE REQUIRED</Text>
          <View style={styles.singleMasterCard}>
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

          {/* SECTION 6: PERKS & FACILITIES */}
          <Text style={styles.groupHeaderLabel}>PERKS & FACILITIES</Text>
          <View style={styles.singleMasterCard}>
            {/* Bus Facility */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.facilityRow}
              onPress={() => setFilters({ ...filters, busFacility: !filters.busFacility })}
            >
              <View style={[styles.facilityIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Bus size={18} color="#2563EB" />
              </View>
              <Text style={styles.facilityLabel}>Bus / Company Transport Facility</Text>
              <View style={[styles.checkboxBox, filters.busFacility && styles.checkboxBoxActive]}>
                {filters.busFacility && <Check size={14} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            {/* Subsidized Canteen */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.facilityRow}
              onPress={() => setFilters({ ...filters, canteen: !filters.canteen })}
            >
              <View style={[styles.facilityIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Utensils size={18} color="#D97706" />
              </View>
              <Text style={styles.facilityLabel}>Subsidized Canteen / Meals</Text>
              <View style={[styles.checkboxBox, filters.canteen && styles.checkboxBoxActive]}>
                {filters.canteen && <Check size={14} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            {/* Hostel Accommodation */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.facilityRow}
              onPress={() => setFilters({ ...filters, accommodation: !filters.accommodation })}
            >
              <View style={[styles.facilityIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Home size={18} color="#16A34A" />
              </View>
              <Text style={styles.facilityLabel}>Subsidized Hostel Accommodation</Text>
              <View style={[styles.checkboxBox, filters.accommodation && styles.checkboxBoxActive]}>
                {filters.accommodation && <Check size={14} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            {/* Overtime Pay */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.facilityRow, { borderBottomWidth: 0 }]}
              onPress={() => setFilters({ ...filters, overtime: !filters.overtime })}
            >
              <View style={[styles.facilityIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Clock size={18} color="#7C3AED" />
              </View>
              <Text style={styles.facilityLabel}>Overtime Pay (OT Available)</Text>
              <View style={[styles.checkboxBox, filters.overtime && styles.checkboxBoxActive]}>
                {filters.overtime && <Check size={14} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={[styles.fixedFooter, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
          <TouchableOpacity style={styles.resetFooterBtn} onPress={handleReset} activeOpacity={0.8}>
            <RotateCcw size={16} color="#475569" />
            <Text style={styles.resetFooterBtnText}>Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyFooterBtn} onPress={handleApply} activeOpacity={0.85}>
            <Text style={styles.applyFooterBtnText}>
              Apply Filters ({totalMatchingJobsCount} Jobs)
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  groupHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
    paddingLeft: 4,
  },
  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
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
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  facilityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
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
    height: 46,
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
    borderRadius: 0,
    height: 46,
  },
  applyFooterBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
