import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  SlidersHorizontal,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Wrench,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export type FilterTabKey = 'INDUSTRY' | 'EDUCATION' | 'EXPERIENCE' | 'LOCATION' | 'TRADE';

export const INDUSTRY_FILTER_OPTIONS = [
  'All Industries',
  'Automotive & Auto Components',
  'Pharmaceutical & Chemical Manufacturing',
  'Heavy Engineering & Fabrication',
  'CNC Machining & Precision Tooling',
  'Electronics & Electrical Assembly',
  'Packaging & Printing',
  'Textile & Garment Manufacturing',
  'Food Processing & Agro Industries',
  'Steel & Metal Processing',
  'Plastic & Polymer Manufacturing',
  'Warehouse & Logistics Operations',
];

export const EDUCATION_FILTER_OPTIONS = [
  'All Education Levels',
  '10th / SSC Pass',
  '12th / HSC Pass',
  'ITI Certified',
  'Diploma in Engineering',
  'BE / B.Tech Graduate',
  'B.Sc / Chemistry Graduate',
  'Post Graduate / ME / M.Tech',
];

export const EXPERIENCE_FILTER_OPTIONS = [
  'All Experience',
  'Fresher (0 Years)',
  '1–3 Years',
  '3–5 Years',
  '5+ Years',
];

export const LOCATION_FILTER_OPTIONS = [
  'All Locations',
  'Waluj MIDC',
  'Chikhalthana MIDC',
  'Shendra MIDC',
  'Paithan MIDC',
  'Railway Station MIDC',
  'Aurangabad City',
];

export const TRADE_FILTER_OPTIONS = [
  'All Trades',
  'CNC Operator',
  'VMC Operator',
  'Fitter',
  'Welder (TIG/MIG/ARC)',
  'Electrician',
  'Machinist',
  'Quality Inspector (QA/QC)',
  'Maintenance Technician',
  'Tool & Die Maker',
  'Assembly Operator',
  'Turner',
  'PLC Programmer',
  'Store Keeper / Inventory',
];

export const CandidateFilterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialFilters = route.params?.initialFilters || {};
  const totalCandidates = route.params?.totalCount || 0;
  const initialTab: FilterTabKey = route.params?.defaultTab || 'INDUSTRY';

  const [activeFilterTab, setActiveFilterTab] = useState<FilterTabKey>(initialTab);
  const [draftIndustry, setDraftIndustry] = useState<string | null>(initialFilters.industry || null);
  const [draftEducation, setDraftEducation] = useState<string | null>(initialFilters.education || null);
  const [draftExp, setDraftExp] = useState<string | null>(initialFilters.exp || null);
  const [draftLocation, setDraftLocation] = useState<string | null>(initialFilters.location || null);
  const [draftTrade, setDraftTrade] = useState<string | null>(initialFilters.trade || null);

  const handleResetFilters = () => {
    setDraftIndustry(null);
    setDraftEducation(null);
    setDraftExp(null);
    setDraftLocation(null);
    setDraftTrade(null);
  };

  const handleApplyFilters = () => {
    if (route.params?.onApply) {
      route.params.onApply({
        industry: draftIndustry,
        education: draftEducation,
        exp: draftExp,
        location: draftLocation,
        trade: draftTrade,
      });
    }
    navigation.goBack();
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (draftIndustry) count++;
    if (draftEducation) count++;
    if (draftExp) count++;
    if (draftLocation) count++;
    if (draftTrade) count++;
    return count;
  }, [draftIndustry, draftEducation, draftExp, draftLocation, draftTrade]);

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
          <Text style={styles.headerTitle}>Filter Candidates</Text>
        </View>

        {activeFiltersCount > 0 && (
          <View style={styles.activeFilterCountBadge}>
            <Text style={styles.activeFilterCountText}>{activeFiltersCount} active</Text>
          </View>
        )}
      </View>

      {/* Horizontal Category Tabs */}
      <View style={styles.categoryNavWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsScroll}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilterTab('INDUSTRY')}
            style={[styles.categoryTabItem, activeFilterTab === 'INDUSTRY' && styles.categoryTabItemActive]}
          >
            <Building2 size={12} color={activeFilterTab === 'INDUSTRY' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.categoryTabText, activeFilterTab === 'INDUSTRY' && styles.categoryTabTextActive]}>
              Industry {draftIndustry ? '•' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilterTab('EDUCATION')}
            style={[styles.categoryTabItem, activeFilterTab === 'EDUCATION' && styles.categoryTabItemActive]}
          >
            <GraduationCap size={12} color={activeFilterTab === 'EDUCATION' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.categoryTabText, activeFilterTab === 'EDUCATION' && styles.categoryTabTextActive]}>
              Education {draftEducation ? '•' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilterTab('EXPERIENCE')}
            style={[styles.categoryTabItem, activeFilterTab === 'EXPERIENCE' && styles.categoryTabItemActive]}
          >
            <Briefcase size={12} color={activeFilterTab === 'EXPERIENCE' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.categoryTabText, activeFilterTab === 'EXPERIENCE' && styles.categoryTabTextActive]}>
              Experience {draftExp ? '•' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilterTab('LOCATION')}
            style={[styles.categoryTabItem, activeFilterTab === 'LOCATION' && styles.categoryTabItemActive]}
          >
            <MapPin size={12} color={activeFilterTab === 'LOCATION' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.categoryTabText, activeFilterTab === 'LOCATION' && styles.categoryTabTextActive]}>
              Location {draftLocation ? '•' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilterTab('TRADE')}
            style={[styles.categoryTabItem, activeFilterTab === 'TRADE' && styles.categoryTabItemActive]}
          >
            <Wrench size={12} color={activeFilterTab === 'TRADE' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.categoryTabText, activeFilterTab === 'TRADE' && styles.categoryTabTextActive]}>
              Trade {draftTrade ? '•' : ''}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Scrollable Option Rows */}
      <ScrollView
        style={styles.optionsScroll}
        contentContainerStyle={styles.optionsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. INDUSTRY SECTORS */}
        {activeFilterTab === 'INDUSTRY' && (
          <View style={styles.optionsBlock}>
            <Text style={styles.optionsSubHeader}>SELECT INDUSTRY SECTOR</Text>
            {INDUSTRY_FILTER_OPTIONS.map((ind) => {
              const isSelected = ind === 'All Industries' ? !draftIndustry : draftIndustry === ind;
              return (
                <TouchableOpacity
                  key={ind}
                  activeOpacity={0.8}
                  onPress={() => setDraftIndustry(ind === 'All Industries' ? null : isSelected ? null : ind)}
                  style={[styles.optionRow, isSelected && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {ind}
                  </Text>
                  {isSelected ? (
                    <Check size={16} color={COLORS.primary} strokeWidth={2.5} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 2. EDUCATION LEVEL */}
        {activeFilterTab === 'EDUCATION' && (
          <View style={styles.optionsBlock}>
            <Text style={styles.optionsSubHeader}>SELECT MINIMUM EDUCATION</Text>
            {EDUCATION_FILTER_OPTIONS.map((edu) => {
              const isSelected = edu === 'All Education Levels' ? !draftEducation : draftEducation === edu;
              return (
                <TouchableOpacity
                  key={edu}
                  activeOpacity={0.8}
                  onPress={() => setDraftEducation(edu === 'All Education Levels' ? null : isSelected ? null : edu)}
                  style={[styles.optionRow, isSelected && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {edu}
                  </Text>
                  {isSelected ? (
                    <Check size={16} color={COLORS.primary} strokeWidth={2.5} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 3. EXPERIENCE / FRESHERS */}
        {activeFilterTab === 'EXPERIENCE' && (
          <View style={styles.optionsBlock}>
            <Text style={styles.optionsSubHeader}>SELECT EXPERIENCE LEVEL</Text>
            {EXPERIENCE_FILTER_OPTIONS.map((exp) => {
              const isSelected = exp === 'All Experience' ? !draftExp : draftExp === exp;
              return (
                <TouchableOpacity
                  key={exp}
                  activeOpacity={0.8}
                  onPress={() => setDraftExp(exp === 'All Experience' ? null : isSelected ? null : exp)}
                  style={[styles.optionRow, isSelected && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {exp}
                  </Text>
                  {isSelected ? (
                    <Check size={16} color={COLORS.primary} strokeWidth={2.5} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 4. LOCATION / MIDC ZONES */}
        {activeFilterTab === 'LOCATION' && (
          <View style={styles.optionsBlock}>
            <Text style={styles.optionsSubHeader}>SELECT MIDC ZONE / LOCATION</Text>
            {LOCATION_FILTER_OPTIONS.map((loc) => {
              const isSelected = loc === 'All Locations' ? !draftLocation : draftLocation === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  activeOpacity={0.8}
                  onPress={() => setDraftLocation(loc === 'All Locations' ? null : isSelected ? null : loc)}
                  style={[styles.optionRow, isSelected && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {loc}
                  </Text>
                  {isSelected ? (
                    <Check size={16} color={COLORS.primary} strokeWidth={2.5} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 5. TRADE SPECIALIZATION */}
        {activeFilterTab === 'TRADE' && (
          <View style={styles.optionsBlock}>
            <Text style={styles.optionsSubHeader}>SELECT TRADE SPECIALIZATION</Text>
            {TRADE_FILTER_OPTIONS.map((tr) => {
              const isSelected = tr === 'All Trades' ? !draftTrade : draftTrade === tr;
              return (
                <TouchableOpacity
                  key={tr}
                  activeOpacity={0.8}
                  onPress={() => setDraftTrade(tr === 'All Trades' ? null : isSelected ? null : tr)}
                  style={[styles.optionRow, isSelected && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {tr}
                  </Text>
                  {isSelected ? (
                    <Check size={16} color={COLORS.primary} strokeWidth={2.5} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleResetFilters}
          style={styles.resetBtn}
        >
          <RotateCcw size={14} color="#64748B" />
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleApplyFilters}
          style={styles.applyBtn}
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
  activeFilterCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  activeFilterCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoryNavWrapper: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 6,
  },
  categoryTabsScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  categoryTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryTabItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#334155',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionsBlock: {
    gap: 5,
  },
  optionsSubHeader: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.card,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  optionText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#334155',
    flex: 1,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  bottomActionBar: {
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
