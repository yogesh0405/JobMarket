import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Wrench,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import {
  matchesIndustry,
  matchesEducation,
  matchesExperience,
  matchesLocation,
  matchesTrade,
} from './components/CandidatesUtils';

export type FilterTabKey = 'INDUSTRY' | 'EDUCATION' | 'TRADE' | 'EXPERIENCE' | 'LOCATION';

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

export const CandidateFilterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialFilters = route.params?.initialFilters || {};
  const totalCandidates = route.params?.totalCount || 0;
  const candidatesList: any[] = route.params?.candidatesList || [];
  const initialTab: FilterTabKey = route.params?.defaultTab || 'INDUSTRY';

  const [activeFilterTab, setActiveFilterTab] = useState<FilterTabKey>(initialTab);
  const [draftIndustry, setDraftIndustry] = useState<string | null>(initialFilters.industry || null);
  const [draftEducation, setDraftEducation] = useState<string | null>(initialFilters.education || null);
  const [draftTrade, setDraftTrade] = useState<string | null>(initialFilters.trade || null);
  const [draftExp, setDraftExp] = useState<string | null>(initialFilters.exp || null);
  const [draftLocation, setDraftLocation] = useState<string | null>(initialFilters.location || null);

  const handleResetFilters = () => {
    setDraftIndustry(null);
    setDraftEducation(null);
    setDraftTrade(null);
    setDraftExp(null);
    setDraftLocation(null);
  };

  const handleApplyFilters = () => {
    if (route.params?.onApply) {
      route.params.onApply({
        industry: draftIndustry,
        education: draftEducation,
        trade: draftTrade,
        exp: draftExp,
        location: draftLocation,
      });
    }
    navigation.goBack();
  };

  const draftMatchingCount = useMemo(() => {
    if (!candidatesList || candidatesList.length === 0) return totalCandidates;
    return candidatesList.filter((item) => {
      if (!matchesIndustry(item, draftIndustry)) return false;
      if (!matchesEducation(item, draftEducation)) return false;
      if (!matchesTrade(item, draftTrade)) return false;
      if (!matchesExperience(item, draftExp)) return false;
      if (!matchesLocation(item, draftLocation)) return false;
      return true;
    }).length;
  }, [candidatesList, totalCandidates, draftIndustry, draftEducation, draftTrade, draftExp, draftLocation]);

  const renderTabContent = () => {
    switch (activeFilterTab) {
      case 'INDUSTRY':
        return INDUSTRY_FILTER_OPTIONS.map((ind) => {
          const isSelected = ind === 'All Industries' ? !draftIndustry || draftIndustry === 'All Industries' : draftIndustry === ind;
          return (
            <TouchableOpacity
              key={ind}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => setDraftIndustry(ind === 'All Industries' ? null : isSelected ? null : ind)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {ind}
              </Text>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        });

      case 'EDUCATION':
        return EDUCATION_FILTER_OPTIONS.map((edu) => {
          const isSelected = edu === 'All Education Levels' ? !draftEducation || draftEducation === 'All Education Levels' : draftEducation === edu;
          return (
            <TouchableOpacity
              key={edu}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => setDraftEducation(edu === 'All Education Levels' ? null : isSelected ? null : edu)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {edu}
              </Text>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        });

      case 'TRADE':
        return TRADE_FILTER_OPTIONS.map((tr) => {
          const isSelected = tr === 'All Trades' ? !draftTrade || draftTrade === 'All Trades' : draftTrade === tr;
          return (
            <TouchableOpacity
              key={tr}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => setDraftTrade(tr === 'All Trades' ? null : isSelected ? null : tr)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {tr}
              </Text>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        });

      case 'EXPERIENCE':
        return EXPERIENCE_FILTER_OPTIONS.map((exp) => {
          const isSelected = exp === 'All Experience' ? !draftExp || draftExp === 'All Experience' : draftExp === exp;
          return (
            <TouchableOpacity
              key={exp}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => setDraftExp(exp === 'All Experience' ? null : isSelected ? null : exp)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {exp}
              </Text>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        });

      case 'LOCATION':
        return LOCATION_FILTER_OPTIONS.map((loc) => {
          const isSelected = loc === 'All Locations' ? !draftLocation || draftLocation === 'All Locations' : draftLocation === loc;
          return (
            <TouchableOpacity
              key={loc}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => setDraftLocation(loc === 'All Locations' ? null : isSelected ? null : loc)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {loc}
              </Text>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        });

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
          <Text style={styles.headerTitle}>Filter Candidates</Text>
        </View>

        {/* Header Reset Icon Button */}
        <TouchableOpacity
          style={styles.headerResetBtn}
          onPress={handleResetFilters}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <RotateCcw size={17} color="#475569" strokeWidth={2.2} />
        </TouchableOpacity>
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
                {draftIndustry && draftIndustry !== 'All Industries' && (
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
                {draftEducation && draftEducation !== 'All Education Levels' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 3. Job Roles */}
            <TouchableOpacity
              style={[styles.tabItem, activeFilterTab === 'TRADE' && styles.tabItemActive]}
              onPress={() => setActiveFilterTab('TRADE')}
              activeOpacity={0.8}
            >
              <Wrench
                size={18}
                color={activeFilterTab === 'TRADE' ? COLORS.primary : '#64748B'}
                strokeWidth={activeFilterTab === 'TRADE' ? 2.2 : 1.8}
              />
              <View style={styles.tabTextGroup}>
                <Text style={[styles.tabTitle, activeFilterTab === 'TRADE' && styles.tabTitleActive]}>
                  Job Roles
                </Text>
                {draftTrade && draftTrade !== 'All Trades' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 4. Experience */}
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
                {draftExp && draftExp !== 'All Experience' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* 5. Location */}
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
                {draftLocation && draftLocation !== 'All Locations' && (
                  <View style={styles.tabActiveDot} />
                )}
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Right Column: Dynamic Options List */}
        <View style={styles.rightOptionsColumn}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsListContainer}
          >
            {renderTabContent()}
          </ScrollView>
        </View>
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
            Show ({draftMatchingCount}) Candidates
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
  headerResetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoColumnContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftTabsColumn: {
    width: 125,
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
