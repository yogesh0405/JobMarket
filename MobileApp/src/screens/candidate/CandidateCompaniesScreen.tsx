import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  Check,
  ChevronRight,
  Filter,
  Users,
  Calendar,
  ShieldCheck,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { apiFetch } from '../../api/client';
import { COLORS, RADIUS } from '../../constants/theme';

interface CandidateCompaniesScreenProps {
  navigation: any;
}

const FALLBACK_COMPANIES = [
  {
    id: 'Bajaj Auto Ltd',
    name: 'Bajaj Auto Ltd',
    logo: 'https://logo.clearbit.com/bajajauto.com',
    industry: 'Automotive Manufacturing',
    company_type: 'Public Limited',
    description: 'Premier two-wheeler and three-wheeler manufacturing facility producing Pulsar, Chetak EV, and Commercial RE auto rickshaws at Waluj plant.',
    website: 'https://www.bajajauto.com',
    address: 'Plot No. A-1, Waluj Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    email: 'careers.waluj@bajajauto.co.in',
    phone: '+91 240 2554000',
    company_size: '10,000+ employees',
    founded_year: 1945,
    jobs_count: 14,
    verified: true,
  },
  {
    id: 'Škoda Auto Volkswagen India',
    name: 'Škoda Auto Volkswagen India',
    logo: 'https://logo.clearbit.com/skoda-auto.com',
    industry: 'Automotive Manufacturing',
    company_type: 'Public Limited',
    description: 'State-of-the-art passenger vehicle assembly manufacturing Kushaq, Slavia, Taigun, and Virtus models for domestic and global export markets.',
    website: 'https://www.skoda-vw.co.in',
    address: 'Plot A-1, Shendra Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Shendra MIDC (Chhatrapati Sambhajinagar)',
    email: 'hr.shendra@skoda-vw.co.in',
    phone: '+91 240 6631000',
    company_size: '5,000-10,000 employees',
    founded_year: 2001,
    jobs_count: 12,
    verified: true,
  },
  {
    id: 'Endurance Technologies Ltd',
    name: 'Endurance Technologies Ltd',
    logo: 'https://logo.clearbit.com/endurancegroup.com',
    industry: 'Auto Components',
    company_type: 'Public Limited',
    description: 'Leading automotive component manufacturer producing aluminium die-castings, suspension systems, transmission components, and braking systems.',
    website: 'https://www.endurancegroup.com',
    address: 'Plot No. E-92, Waluj Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    email: 'careers@endurancegroup.com',
    phone: '+91 240 2552860',
    company_size: '5,000-10,000 employees',
    founded_year: 1985,
    jobs_count: 9,
    verified: true,
  },
  {
    id: 'Varroc Engineering Ltd',
    name: 'Varroc Engineering Ltd',
    logo: 'https://logo.clearbit.com/varroc.com',
    industry: 'Auto Components & Lighting',
    company_type: 'Public Limited',
    description: 'Global Tier-1 automotive component group manufacturing exterior lighting, polymer components, electrical systems, and precision forgings.',
    website: 'https://www.varroc.com',
    address: 'Plot No. L-4, MIDC Industrial Area, Waluj',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    email: 'careers@varroc.com',
    phone: '+91 240 6652400',
    company_size: '5,000-10,000 employees',
    founded_year: 1990,
    jobs_count: 11,
    verified: true,
  },
  {
    id: 'Siemens Limited',
    name: 'Siemens Limited',
    logo: 'https://logo.clearbit.com/siemens.com',
    industry: 'Electrical & Industrial Automation',
    company_type: 'MNC Branch',
    description: 'Global engineering powerhouse manufacturing medium voltage switchgears, industrial circuit breakers, and power distribution systems.',
    website: 'https://www.siemens.co.in',
    address: 'Plot B-5, Waluj Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    email: 'recruitment.aurangabad@siemens.com',
    phone: '+91 240 6642000',
    company_size: '5,000-10,000 employees',
    founded_year: 1847,
    jobs_count: 8,
    verified: true,
  },
  {
    id: 'Wockhardt Ltd',
    name: 'Wockhardt Ltd',
    logo: 'https://logo.clearbit.com/wockhardt.com',
    industry: 'Pharmaceuticals',
    company_type: 'Public Limited',
    description: 'Global pharmaceutical and biotechnology major manufacturing active pharmaceutical ingredients (APIs), sterile injectables, and formulations.',
    website: 'https://www.wockhardt.com',
    address: 'L-1, Chikalthana MIDC Area, Jalna Road',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Chikalthana MIDC',
    email: 'careers.aurangabad@wockhardt.com',
    phone: '+91 240 6637444',
    company_size: '5,000-10,000 employees',
    founded_year: 1967,
    jobs_count: 6,
    verified: true,
  },
  {
    id: 'CEAT Tyres Ltd',
    name: 'CEAT Tyres Ltd',
    logo: 'https://logo.clearbit.com/ceat.com',
    industry: 'Tyre Manufacturing',
    company_type: 'Public Limited',
    description: 'RPG Group company manufacturing high-performance radial tyres for truck, bus, agricultural, and passenger cars in Waluj.',
    website: 'https://www.ceat.com',
    address: 'Plot No. H-3, Waluj MIDC Industrial Area',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    email: 'hr.waluj@ceat.com',
    phone: '+91 240 2552400',
    company_size: '1,000-5,000 employees',
    founded_year: 1958,
    jobs_count: 7,
    verified: true,
  },
  {
    id: 'Garware Technical Fibres Ltd',
    name: 'Garware Technical Fibres Ltd',
    logo: 'https://logo.clearbit.com/garwarefibres.com',
    industry: 'Technical Textiles & Fibres',
    company_type: 'Public Limited',
    description: 'Leading technical textiles manufacturer producing synthetic cordage, aquaculture nets, coated fabrics, and geo-synthetics.',
    website: 'https://www.garwarefibres.com',
    address: 'Plot No. 3, Chikalthana Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Chikalthana MIDC',
    email: 'hr.aurangabad@garwarefibres.com',
    phone: '+91 240 2484311',
    company_size: '1,000-5,000 employees',
    founded_year: 1976,
    jobs_count: 5,
    verified: true,
  },
];

const ZONE_FILTERS = [
  'All Companies',
  'Waluj MIDC',
  'Chakan MIDC',
  'Shendra MIDC',
  'Chikalthana MIDC',
];

export const CandidateCompaniesScreen: React.FC<CandidateCompaniesScreenProps> = ({
  navigation,
}) => {
  const [companies, setCompanies] = useState<any[]>(FALLBACK_COMPANIES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All Companies');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const json = await apiFetch('/api/v1/companies');
      const list = Array.isArray(json) ? json : (json?.data || json?.companies || []);
      if (Array.isArray(list) && list.length > 0) {
        setCompanies(list);
      } else {
        setCompanies(FALLBACK_COMPANIES);
      }
    } catch (err) {
      console.warn('Live companies fetch notice:', err);
      setCompanies(FALLBACK_COMPANIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompanies();
    setRefreshing(false);
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (selectedZone && selectedZone !== 'All Companies' && selectedZone !== 'All Zones') {
        const zoneStr = (c.midc_zone || c.midcZone || c.address || c.city || c.location || '').toLowerCase();
        const filterKeyword = selectedZone.toLowerCase().replace(' midc', '').trim();
        if (!zoneStr.includes(filterKeyword)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (c.name || c.companyName || '').toLowerCase().includes(q);
        const matchIndustry = (c.industry || '').toLowerCase().includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        const matchZone = (c.midc_zone || c.midcZone || c.location || '').toLowerCase();
        return matchName || matchIndustry || matchCity || matchZone;
      }
      return true;
    });
  }, [companies, selectedZone, searchQuery]);

  return (
    <View style={styles.container}>
      <Header
        title="JobMarket"
        subtitle="Companies"
        showBack={false}
      />

      <FlatList
        data={loading ? [] : filteredCompanies}
        keyExtractor={(item, index) => `company-${item.id || item.name}-${index}`}
        renderItem={({ item: comp }) => {
          const jobsCount = comp.open_jobs_count ?? comp.jobs_count ?? comp.openings_count ?? comp.jobsCount ?? 4;
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
                {/* Row 1: Address & Estd Year (Clean Plain Text with Icons) */}
                <View style={styles.fixedMetaRow}>
                  <View style={[styles.plainMetaItem, { flexShrink: 1 }]}>
                    <MapPin size={12} color="#64748B" style={{ flexShrink: 0 }} />
                    <Text style={styles.plainMetaText} numberOfLines={1} ellipsizeMode="tail">
                      {locationText}
                    </Text>
                  </View>

                  {(comp.founded_year || comp.founded) ? (
                    <View style={[styles.plainMetaItem, { flexShrink: 0 }]}>
                      <Calendar size={12} color="#64748B" style={{ flexShrink: 0 }} />
                      <Text style={[styles.plainMetaText, { flexShrink: 0 }]} numberOfLines={1}>
                        Estd. {comp.founded_year || comp.founded}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Row 2: Employee Count Pill */}
                <View style={styles.fixedMetaRow}>
                  <View style={[styles.metaTagPill, { flexShrink: 1 }]}>
                    <Users size={11} color="#64748B" style={{ flexShrink: 0 }} />
                    <Text style={styles.metaTagText} numberOfLines={1} ellipsizeMode="tail">
                      {companySize}
                    </Text>
                  </View>
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
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <View>
            <View style={styles.searchBar}>
              <Search size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search companies by name, MIDC zone..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterChipScroll}
              contentContainerStyle={styles.filterChipContainer}
            >
              {ZONE_FILTERS.map((zone) => {
                const isActive = selectedZone === zone;
                return (
                  <TouchableOpacity
                    key={zone}
                    activeOpacity={0.8}
                    onPress={() => setSelectedZone(zone)}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {zone}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.countRow}>
              <Text style={styles.countText}>
                Showing {filteredCompanies.length} Verified Companies
              </Text>
            </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    paddingVertical: 0,
    margin: 0,
  },
  filterChipScroll: {
    marginBottom: 12,
  },
  filterChipContainer: {
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.xs,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  countRow: {
    marginBottom: 14,
  },
  countText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  fixedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    overflow: 'hidden',
  },
  plainMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  plainMetaText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    flexShrink: 1,
  },
  metaTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    flexShrink: 1,
    maxWidth: '100%',
  },
  metaTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  verifiedTagPill: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  companyDescription: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 1,
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
});
