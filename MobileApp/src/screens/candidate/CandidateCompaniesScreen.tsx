import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Users,
  Calendar,
  SlidersHorizontal,
  X,
  RotateCcw,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '../../components/common/Header';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { apiFetch } from '../../api/client';
import { COLORS, RADIUS } from '../../constants/theme';
import { CompanyFilterState } from '../company/CompanyFilterScreen';

interface CandidateCompaniesScreenProps {
  navigation: any;
  route?: any;
}

const COMPANIES_CACHE_KEY = 'jobmarket_cached_companies';
let memoryCompaniesCache: any[] = [];

export const CandidateCompaniesScreen: React.FC<CandidateCompaniesScreenProps> = ({
  navigation,
  route,
}) => {
  const [companies, setCompanies] = useState<any[]>(memoryCompaniesCache);
  const [loading, setLoading] = useState(memoryCompaniesCache.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Applied Filters State
  const [filters, setFilters] = useState<CompanyFilterState>({
    midcZone: 'All Locations',
    industry: 'All Industries',
    companyType: 'All Types',
    companySize: 'All Sizes',
    onlyHiring: false,
  });

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.appliedCompanyFilters) {
        setFilters(route.params.appliedCompanyFilters);
      }
    }, [route?.params?.appliedCompanyFilters])
  );

  const handleOpenFilterScreen = (tabKey: string = 'LOCATION') => {
    navigation.navigate('CompanyFilter', {
      defaultTab: tabKey,
      currentFilters: filters,
      companies: companies,
      returnScreen: 'CandidateSavedTab',
    });
  };

  const fetchCompanies = async () => {
    try {
      if (companies.length === 0 && memoryCompaniesCache.length === 0) {
        setLoading(true);
      }
      const json = await apiFetch('/api/v1/companies');
      const list = Array.isArray(json) ? json : (json?.data || json?.companies || []);
      if (Array.isArray(list) && list.length > 0) {
        setCompanies(list);
        memoryCompaniesCache = list;
        AsyncStorage.setItem(COMPANIES_CACHE_KEY, JSON.stringify(list)).catch(() => {});
      }
    } catch (err) {
      console.warn('Live companies fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check AsyncStorage cache
    if (memoryCompaniesCache.length === 0) {
      AsyncStorage.getItem(COMPANIES_CACHE_KEY)
        .then((raw) => {
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              memoryCompaniesCache = parsed;
              setCompanies(parsed);
              setLoading(false);
            }
          }
        })
        .catch(() => {});
    }
    // 2. Fetch fresh records from database
    fetchCompanies();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompanies();
    setRefreshing(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.midcZone !== 'All Locations') count++;
    if (filters.industry !== 'All Industries') count++;
    if (filters.companyType !== 'All Types') count++;
    if (filters.companySize !== 'All Sizes') count++;
    if (filters.onlyHiring) count++;
    return count;
  }, [filters]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilters({
      midcZone: 'All Locations',
      industry: 'All Industries',
      companyType: 'All Types',
      companySize: 'All Sizes',
      onlyHiring: false,
    });
  };

  const isCompanyMatching = useCallback((c: any, targetFilters: CompanyFilterState, search: string) => {
    // 1. Zone filter
    if (targetFilters.midcZone && targetFilters.midcZone !== 'All Locations' && targetFilters.midcZone !== 'All MIDC Zones & Cities') {
      const zoneStr = (c.midc_zone || c.midcZone || c.address || c.city || c.location || '').toLowerCase();
      let keyword = targetFilters.midcZone.toLowerCase();
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
      if (!isMatch) {
        return false;
      }
    }

    // 2. Industry filter
    if (targetFilters.industry && targetFilters.industry !== 'All Industries') {
      const ind = (c.industry || '').toLowerCase();
      const target = targetFilters.industry.toLowerCase();
      if (!ind.includes(target) && !target.includes(ind)) {
        return false;
      }
    }

    // 3. Company Type filter
    if (targetFilters.companyType && targetFilters.companyType !== 'All Types') {
      const cType = (c.company_type || c.companyType || '').toLowerCase();
      const target = targetFilters.companyType.toLowerCase();
      if (!cType.includes(target) && !target.includes(cType)) {
        return false;
      }
    }

    // 4. Company Size filter
    if (targetFilters.companySize && targetFilters.companySize !== 'All Sizes') {
      const cSize = (c.company_size || c.companySize || '').toLowerCase();
      const target = targetFilters.companySize.toLowerCase();
      if (!cSize.includes(target) && !target.includes(cSize)) {
        return false;
      }
    }

    // 5. Only Hiring filter
    if (targetFilters.onlyHiring) {
      const jobsCount = c.open_jobs_count ?? c.jobs_count ?? c.openings_count ?? c.jobsCount ?? 0;
      if (jobsCount <= 0) {
        return false;
      }
    }

    // 6. Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = (c.name || c.companyName || '').toLowerCase().includes(q);
      const matchIndustry = (c.industry || '').toLowerCase().includes(q);
      const matchCity = (c.city || '').toLowerCase().includes(q);
      const matchZone = (c.midc_zone || c.midcZone || c.location || '').toLowerCase().includes(q);
      const matchAbout = (c.about || c.description || '').toLowerCase().includes(q);
      return matchName || matchIndustry || matchCity || matchZone || matchAbout;
    }

    return true;
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => isCompanyMatching(c, filters, searchQuery));
  }, [companies, filters, searchQuery, isCompanyMatching]);

  // Quick preset bar data for companies (matching candidates section design)
  const quickPillOptions = [
    {
      label: 'All Companies',
      active: activeFilterCount === 0,
      onPress: resetAllFilters,
    },
    {
      label: 'Actively Hiring',
      active: filters.onlyHiring,
      onPress: () => setFilters((prev) => ({ ...prev, onlyHiring: !prev.onlyHiring })),
    },
    {
      label: 'Waluj MIDC',
      active: filters.midcZone === 'Waluj MIDC',
      onPress: () =>
        setFilters((prev) => ({
          ...prev,
          midcZone: prev.midcZone === 'Waluj MIDC' ? 'All Locations' : 'Waluj MIDC',
        })),
    },
    {
      label: 'Shendra MIDC',
      active: filters.midcZone === 'Shendra MIDC',
      onPress: () =>
        setFilters((prev) => ({
          ...prev,
          midcZone: prev.midcZone === 'Shendra MIDC' ? 'All Locations' : 'Shendra MIDC',
        })),
    },
    {
      label: 'Chikalthana MIDC',
      active: filters.midcZone === 'Chikalthana MIDC',
      onPress: () =>
        setFilters((prev) => ({
          ...prev,
          midcZone: prev.midcZone === 'Chikalthana MIDC' ? 'All Locations' : 'Chikalthana MIDC',
        })),
    },
    {
      label: 'Automotive',
      active: filters.industry === 'Automotive & Auto Components',
      onPress: () =>
        setFilters((prev) => ({
          ...prev,
          industry:
            prev.industry === 'Automotive & Auto Components'
              ? 'All Industries'
              : 'Automotive & Auto Components',
        })),
    },
    {
      label: 'Manufacturing',
      active: filters.industry === 'Industrial & Heavy Manufacturing',
      onPress: () =>
        setFilters((prev) => ({
          ...prev,
          industry:
            prev.industry === 'Industrial & Heavy Manufacturing'
              ? 'All Industries'
              : 'Industrial & Heavy Manufacturing',
        })),
    },
    {
      label: 'Electronics',
      active: filters.industry === 'Electronics & Electricals',
      onPress: () =>
        setFilters((prev) => ({
          ...prev,
          industry:
            prev.industry === 'Electronics & Electricals'
              ? 'All Industries'
              : 'Electronics & Electricals',
        })),
    },
    {
      label: 'Pharma & Biotech',
      active: filters.industry === 'Pharmaceuticals & Chemicals',
      onPress: () =>
        setFilters((prev) => ({
          ...prev,
          industry:
            prev.industry === 'Pharmaceuticals & Chemicals'
              ? 'All Industries'
              : 'Pharmaceuticals & Chemicals',
        })),
    },
    {
      label: '500+ Employees',
      active: filters.companySize === '500+ employees',
      onPress: () =>
        setFilters((prev) => ({
          ...prev,
          companySize: prev.companySize === '500+ employees' ? 'All Sizes' : '500+ employees',
        })),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        searchPlaceholder="Search companies by name, MIDC zone, sector..."
        searchValue={searchQuery}
        onSearchPress={() => {
          navigation.navigate('CandidateGlobalSearch', { initialQuery: searchQuery });
        }}
        onClearSearch={resetAllFilters}
        showBack={false}
      />

      {/* Filter Action Bar (Identical to Candidates section) */}
      <View style={styles.filterSectionWrapper}>
        <View style={styles.filterRowContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenFilterScreen('LOCATION')}
            style={[styles.filterActionButton, activeFilterCount > 0 && styles.filterActionButtonActive]}
          >
            <SlidersHorizontal size={14} color={activeFilterCount > 0 ? '#FFFFFF' : '#475569'} style={{ marginRight: 6 }} />
            <Text style={[styles.filterActionButtonText, activeFilterCount > 0 && styles.filterActionButtonTextActive]}>
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingLeft: 4 }}>
            {quickPillOptions.map((chip, idx) => (
              <TouchableOpacity
                key={`chip-${idx}`}
                onPress={chip.onPress}
                activeOpacity={0.75}
                style={[styles.quickChip, chip.active && styles.quickChipActive]}
              >
                <Text style={[styles.quickChipText, chip.active && styles.quickChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Applied Filters Summary & Individual Clear Tags */}
        {activeFilterCount > 0 ? (
          <View style={styles.activeTagsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {filters.midcZone !== 'All Locations' && filters.midcZone !== 'All MIDC Zones & Cities' ? (
                <View style={styles.activeFilterTag}>
                  <MapPin size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {filters.midcZone}
                  </Text>
                  <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, midcZone: 'All Locations' }))}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {filters.industry !== 'All Industries' ? (
                <View style={styles.activeFilterTag}>
                  <Building2 size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {filters.industry}
                  </Text>
                  <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, industry: 'All Industries' }))}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {filters.companyType !== 'All Types' ? (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {filters.companyType}
                  </Text>
                  <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, companyType: 'All Types' }))}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {filters.companySize !== 'All Sizes' ? (
                <View style={styles.activeFilterTag}>
                  <Users size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {filters.companySize}
                  </Text>
                  <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, companySize: 'All Sizes' }))}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {filters.onlyHiring ? (
                <View style={styles.activeFilterTag}>
                  <Briefcase size={11} color={COLORS.primary} />
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    Actively Hiring
                  </Text>
                  <TouchableOpacity onPress={() => setFilters((prev) => ({ ...prev, onlyHiring: false }))}>
                    <X size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : null}

              <TouchableOpacity onPress={resetAllFilters} style={styles.resetAllPill}>
                <RotateCcw size={10} color="#DC2626" />
                <Text style={styles.resetAllPillText}>Reset All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : null}
      </View>

      <FlatList
        data={loading ? [] : filteredCompanies}
        keyExtractor={(item, index) => `company-${item.id || item.name}-${index}`}
        renderItem={({ item: comp }) => {
          const jobsCount = comp.open_jobs_count ?? comp.jobs_count ?? comp.openings_count ?? comp.jobsCount ?? 0;
          const locationText = comp.midc_zone || comp.midcZone || comp.city || 'Waluj MIDC, Chhatrapati Sambhajinagar';
          const companyType = comp.company_type || comp.companyType || 'Private Limited';
          const companySize = comp.company_size || comp.companySize || '500+ employees';

          return (
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.companyCard}
              onPress={() => {
                navigation.navigate('CompanyProfile', {
                  companyId: comp.id || comp.name,
                  company: comp,
                  name: comp.name,
                });
              }}
            >
              {/* Card Top Distinct Header Band */}
              <View style={styles.cardTopHeader}>
                <CompanyLogoAvatar
                  logoUrl={comp.logo || comp.logoUrl}
                  companyName={comp.name}
                  size={48}
                  borderRadius={RADIUS.card}
                />

                <View style={styles.cardHeaderTextWrap}>
                  <Text style={styles.companyNameText} numberOfLines={1}>
                    {comp.name}
                  </Text>
                  <Text style={styles.industryText} numberOfLines={1}>
                    {comp.industry || 'Industrial Manufacturing'} • {companyType}
                  </Text>
                </View>

                <ChevronRight size={18} color="#94A3B8" />
              </View>

              {/* Card Body Area */}
              <View style={styles.cardBody}>
                {/* Row 1: Address & Estd strictly in one row (Address truncates with ellipsis) */}
                <View style={styles.addressEstdRow}>
                  <View style={styles.addressLeftItem}>
                    <MapPin size={12} color={COLORS.primary} style={{ flexShrink: 0 }} />
                    <Text style={styles.plainMetaText} numberOfLines={1} ellipsizeMode="tail">
                      {locationText}
                    </Text>
                  </View>

                  {(comp.founded_year || comp.founded) ? (
                    <View style={styles.estdRightItem}>
                      <Calendar size={11} color="#64748B" style={{ flexShrink: 0 }} />
                      <Text style={styles.plainMetaTextSec} numberOfLines={1}>
                        Estd. {comp.founded_year || comp.founded}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Row 2: Number of employees */}
                <View style={styles.employeesRow}>
                  <Users size={11} color="#64748B" style={{ flexShrink: 0 }} />
                  <Text style={styles.plainMetaTextSec} numberOfLines={1} ellipsizeMode="tail">
                    {companySize}
                  </Text>
                </View>

                <View style={styles.cardFooterRow}>
                  <View style={styles.jobsNormalRow}>
                    <Briefcase size={12} color={COLORS.primary} />
                    <Text style={styles.jobsNormalText}>{jobsCount} Vacancies Available</Text>
                  </View>

                  <View style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View Details</Text>
                    <ChevronRight size={13} color={COLORS.primary} strokeWidth={2.5} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={15}
        removeClippedSubviews={false}
        ListHeaderComponent={
          <View style={styles.countRow}>
            <Text style={styles.countText}>
              Showing <Text style={{ fontWeight: '800', color: COLORS.primary }}>({filteredCompanies.length})</Text> Verified Companies
            </Text>

            {(activeFilterCount > 0 || searchQuery.trim()) && (
              <TouchableOpacity onPress={resetAllFilters} style={styles.resetQuickBtn}>
                <RotateCcw size={11} color={COLORS.primary} />
                <Text style={styles.resetQuickText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading verified industrial companies...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Building2 size={26} color={COLORS.primary} strokeWidth={2.2} />
              </View>
              <Text style={styles.emptyTitle}>No Companies Found</Text>
              <Text style={styles.emptySubtitle}>
                No industrial companies match your current search query or zone filter.
              </Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.emptyResetBtn} onPress={resetAllFilters}>
                  <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  filterSectionWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filterActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  filterActionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterActionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  filterActionButtonTextActive: {
    color: '#FFFFFF',
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  quickChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  activeTagsRow: {
    marginTop: 6,
    marginBottom: 2,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    maxWidth: 200,
  },
  activeFilterTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.primary,
    flexShrink: 1,
  },
  resetAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  resetAllPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  resetQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetQuickText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTopHeader: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  companyNameText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.15,
  },
  industryText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  companyDescription: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16.5,
  },
  addressEstdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  addressLeftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    maxWidth: '72%',
  },
  estdRightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  employeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -2,
  },
  plainMetaText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#334155',
  },
  plainMetaTextSec: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 2,
  },
  jobsNormalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  jobsNormalText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 32,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  emptyResetBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.xs,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
