import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Users,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export type CompanyFilterCategoryKey = 'LOCATION' | 'INDUSTRY' | 'TYPE' | 'SIZE' | 'HIRING';

export const MIDC_ZONES_LIST = [
  'All Locations',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Shendra MIDC / AURIC City (Chhatrapati Sambhajinagar)',
  'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
  'Chitegaon MIDC (Chhatrapati Sambhajinagar)',
  'Paithan MIDC (Chhatrapati Sambhajinagar)',
  'Bidkin DMIC / AURIC City (Chhatrapati Sambhajinagar)',
  'Railway Station Industrial Area (Chhatrapati Sambhajinagar)',
  'Jalna Road Industrial Belt (Chhatrapati Sambhajinagar)',
  'Chhatrapati Sambhajinagar (All Areas)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Ranjangaon MIDC (Pune)',
  'Taloja MIDC (Navi Mumbai)',
  'Thane Belapur MIDC',
];

export const INDUSTRIES_LIST = [
  'All Industries',
  'Automotive Manufacturing',
  'Auto Components & Precision Forging',
  'Pharmaceuticals & Biotech',
  'Electrical & Industrial Automation',
  'Tyre & Rubber Manufacturing',
  'Technical Textiles & Fibres',
  'Heavy Engineering & Fabrication',
  'Food Processing & FMCG',
  'IT & Electronics Hardware',
];

export const COMPANY_TYPES_LIST = [
  'All Types',
  'Public Limited',
  'Private Limited',
  'Multinational Corporation (MNC)',
  'Joint Venture / Partnership',
];

export const COMPANY_SIZES_LIST = [
  'All Sizes',
  '10,000+ employees',
  '5,000-10,000 employees',
  '1,000-5,000 employees',
  '500-1,000 employees',
  '100-500 employees',
];

export interface CompanyFilterState {
  midcZone: string;
  industry: string;
  companyType: string;
  companySize: string;
  onlyHiring: boolean;
}

export const CompanyFilterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const currentFilters: CompanyFilterState = route.params?.currentFilters || {
    midcZone: 'All Locations',
    industry: 'All Industries',
    companyType: 'All Types',
    companySize: 'All Sizes',
    onlyHiring: false,
  };

  const initialTab: CompanyFilterCategoryKey = route.params?.defaultTab || 'LOCATION';
  const companiesList: any[] = route.params?.companies || [];

  const [activeFilterTab, setActiveFilterTab] = useState<CompanyFilterCategoryKey>(initialTab);
  const [draftZone, setDraftZone] = useState<string | null>(
    currentFilters.midcZone === 'All Locations' ? null : currentFilters.midcZone
  );
  const [draftIndustry, setDraftIndustry] = useState<string | null>(
    currentFilters.industry === 'All Industries' ? null : currentFilters.industry
  );
  const [draftType, setDraftType] = useState<string | null>(
    currentFilters.companyType === 'All Types' ? null : currentFilters.companyType
  );
  const [draftSize, setDraftSize] = useState<string | null>(
    currentFilters.companySize === 'All Sizes' ? null : currentFilters.companySize
  );
  const [draftOnlyHiring, setDraftOnlyHiring] = useState<boolean>(currentFilters.onlyHiring);

  const handleResetFilters = () => {
    setDraftZone(null);
    setDraftIndustry(null);
    setDraftType(null);
    setDraftSize(null);
    setDraftOnlyHiring(false);
  };

  const handleApplyFilters = () => {
    const applied: CompanyFilterState = {
      midcZone: draftZone || 'All Locations',
      industry: draftIndustry || 'All Industries',
      companyType: draftType || 'All Types',
      companySize: draftSize || 'All Sizes',
      onlyHiring: draftOnlyHiring,
    };
    if (typeof route.params?.onApplyFilters === 'function') {
      route.params.onApplyFilters(applied);
      navigation.goBack();
    } else {
      const returnScreen = route.params?.returnScreen || 'CandidateCompanies';
      navigation.navigate(returnScreen, { appliedCompanyFilters: applied });
    }
  };

  // Real-time calculation of matching count
  const draftMatchingCount = useMemo(() => {
    if (!companiesList || companiesList.length === 0) return 0;
    const targetZone = draftZone || 'All Locations';
    const targetIndustry = draftIndustry || 'All Industries';
    const targetType = draftType || 'All Types';
    const targetSize = draftSize || 'All Sizes';

    return companiesList.filter((c) => {
      // 1. Zone
      if (targetZone && targetZone !== 'All Locations' && targetZone !== 'All MIDC Zones & Cities') {
        const zoneStr = (c.midc_zone || c.midcZone || c.address || c.city || c.location || '').toLowerCase();
        let keyword = targetZone.toLowerCase();
        if (keyword.includes('waluj')) keyword = 'waluj';
        else if (keyword.includes('shendra')) keyword = 'shendra';
        else if (keyword.includes('chikalthana')) keyword = 'chikalthana';
        else if (keyword.includes('chitegaon')) keyword = 'chitegaon';
        else if (keyword.includes('paithan')) keyword = 'paithan';
        else if (keyword.includes('bidkin')) keyword = 'bidkin';
        else if (keyword.includes('railway station')) keyword = 'railway';
        else if (keyword.includes('jalna road')) keyword = 'jalna';
        else if (keyword.includes('chhatrapati sambhajinagar') || keyword.includes('aurangabad')) keyword = 'sambhajinagar';
        else if (keyword.includes('chakan')) keyword = 'chakan';
        else if (keyword.includes('bhosari')) keyword = 'bhosari';
        else if (keyword.includes('talegaon')) keyword = 'talegaon';
        else if (keyword.includes('ranjangaon')) keyword = 'ranjangaon';
        else if (keyword.includes('taloja')) keyword = 'taloja';
        else if (keyword.includes('thane')) keyword = 'thane';

        const isMatch = zoneStr.includes(keyword) || 
          (keyword === 'sambhajinagar' && (
            zoneStr.includes('aurangabad') || 
            zoneStr.includes('waluj') || 
            zoneStr.includes('shendra') || 
            zoneStr.includes('chikalthana') || 
            zoneStr.includes('chitegaon') || 
            zoneStr.includes('paithan') ||
            zoneStr.includes('bidkin')
          ));
        if (!isMatch) return false;
      }

      // 2. Industry
      if (targetIndustry && targetIndustry !== 'All Industries') {
        const ind = (c.industry || '').toLowerCase();
        const target = targetIndustry.toLowerCase();
        if (!ind.includes(target) && !target.includes(ind)) return false;
      }

      // 3. Type
      if (targetType && targetType !== 'All Types') {
        const cType = (c.company_type || c.companyType || '').toLowerCase();
        const target = targetType.toLowerCase();
        if (!cType.includes(target) && !target.includes(cType)) return false;
      }

      // 4. Size
      if (targetSize && targetSize !== 'All Sizes') {
        const cSize = (c.company_size || c.companySize || '').toLowerCase();
        const target = targetSize.toLowerCase();
        if (!cSize.includes(target) && !target.includes(cSize)) return false;
      }

      // 5. Only Hiring
      if (draftOnlyHiring) {
        const jobsCount = c.open_jobs_count ?? c.jobs_count ?? c.openings_count ?? c.jobsCount ?? 0;
        if (jobsCount <= 0) return false;
      }

      return true;
    }).length;
  }, [companiesList, draftZone, draftIndustry, draftType, draftSize, draftOnlyHiring]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) }]}>
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
          <View>
            <Text style={styles.headerTitle}>Filter Companies</Text>
            <Text style={styles.headerSubtitle}>Showing {draftMatchingCount} matching companies</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleResetFilters} style={styles.resetBtn}>
          <RotateCcw size={12} color={COLORS.primary} />
          <Text style={styles.resetText}>Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Category Navigation Bar (Horizontal Scrollable Tabs with Pill Badges) */}
      <View style={styles.tabBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {[
            { key: 'LOCATION', label: 'Location', icon: MapPin, activeVal: draftZone },
            { key: 'INDUSTRY', label: 'Industry', icon: Building2, activeVal: draftIndustry },
            { key: 'TYPE', label: 'Ownership', icon: Briefcase, activeVal: draftType },
            { key: 'SIZE', label: 'Workforce', icon: Users, activeVal: draftSize },
            { key: 'HIRING', label: 'Hiring', icon: Sparkles, activeVal: draftOnlyHiring ? 'Active Hiring' : null },
          ].map((cat) => {
            const isSelected = activeFilterTab === cat.key;
            const Icon = cat.icon;
            const hasSelection = cat.activeVal && !cat.activeVal.startsWith('All ');

            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.8}
                onPress={() => setActiveFilterTab(cat.key as CompanyFilterCategoryKey)}
                style={[
                  styles.tabPill,
                  isSelected && styles.tabPillActive,
                ]}
              >
                <Icon size={12} color={isSelected ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.tabPillText, isSelected && styles.tabPillTextActive]}>
                  {cat.label}
                </Text>
                {hasSelection && (
                  <View style={[styles.tabDot, isSelected && styles.tabDotActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Options List Body (Vertically Scrollable Area) */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.optionsSectionTitle}>
          SELECT {activeFilterTab === 'LOCATION' ? 'LOCATION / MIDC ZONE' : activeFilterTab === 'TYPE' ? 'OWNERSHIP / COMPANY TYPE' : activeFilterTab === 'SIZE' ? 'WORKFORCE SCALE' : activeFilterTab === 'HIRING' ? 'HIRING STATUS' : 'INDUSTRY'}
        </Text>

        {activeFilterTab === 'LOCATION' && (
          <View style={styles.optionsGroup}>
            {MIDC_ZONES_LIST.map((opt) => {
              const isChecked = (draftZone === opt) || (!draftZone && opt === 'All Locations');
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.8}
                  onPress={() => setDraftZone(opt === 'All Locations' ? null : opt)}
                  style={[styles.optionRow, isChecked && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isChecked && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {isChecked && <Check size={14} color={COLORS.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeFilterTab === 'INDUSTRY' && (
          <View style={styles.optionsGroup}>
            {INDUSTRIES_LIST.map((opt) => {
              const isChecked = (draftIndustry === opt) || (!draftIndustry && opt === 'All Industries');
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.8}
                  onPress={() => setDraftIndustry(opt === 'All Industries' ? null : opt)}
                  style={[styles.optionRow, isChecked && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isChecked && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {isChecked && <Check size={14} color={COLORS.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeFilterTab === 'TYPE' && (
          <View style={styles.optionsGroup}>
            {COMPANY_TYPES_LIST.map((opt) => {
              const isChecked = (draftType === opt) || (!draftType && opt === 'All Types');
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.8}
                  onPress={() => setDraftType(opt === 'All Types' ? null : opt)}
                  style={[styles.optionRow, isChecked && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isChecked && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {isChecked && <Check size={14} color={COLORS.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeFilterTab === 'SIZE' && (
          <View style={styles.optionsGroup}>
            {COMPANY_SIZES_LIST.map((opt) => {
              const isChecked = (draftSize === opt) || (!draftSize && opt === 'All Sizes');
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.8}
                  onPress={() => setDraftSize(opt === 'All Sizes' ? null : opt)}
                  style={[styles.optionRow, isChecked && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isChecked && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {isChecked && <Check size={14} color={COLORS.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeFilterTab === 'HIRING' && (
          <View style={styles.optionsGroup}>
            {[
              { label: 'All Companies', val: false },
              { label: 'Actively Hiring Only (With Open Vacancies)', val: true },
            ].map((opt) => {
              const isChecked = draftOnlyHiring === opt.val;
              return (
                <TouchableOpacity
                  key={opt.label}
                  activeOpacity={0.8}
                  onPress={() => setDraftOnlyHiring(opt.val)}
                  style={[styles.optionRow, isChecked && styles.optionRowActive]}
                >
                  <Text style={[styles.optionText, isChecked && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                  {isChecked && <Check size={14} color={COLORS.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomFooter}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleApplyFilters}
          style={styles.applyBtn}
        >
          <Check size={15} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.applyText}>Apply Filters ({draftMatchingCount})</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  resetText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tabBarWrap: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabBar: {
    paddingHorizontal: 16,
    gap: 6,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  tabDotActive: {
    backgroundColor: '#FFFFFF',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  optionsSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  optionsGroup: {
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  optionRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  optionText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '400',
    flex: 1,
    marginRight: 8,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  bottomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  applyBtn: {
    flex: 2,
    height: 42,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  applyText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
