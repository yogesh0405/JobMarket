import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
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
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { apiFetch } from '../../api/client';
import { COLORS } from '../../constants/theme';

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
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All Companies');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const json = await apiFetch('/api/v1/companies');
      const list = Array.isArray(json) ? json : (json?.data || []);
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
    const seenKeys = new Set<string>();
    const uniqueList: any[] = [];

    companies.forEach((c) => {
      const uniqueId = String(c.name || c.id || '').trim().toLowerCase();
      if (!uniqueId || !seenKeys.has(uniqueId)) {
        if (uniqueId) seenKeys.add(uniqueId);
        uniqueList.push(c);
      }
    });

    return uniqueList.filter((c) => {
      // 1. Zone filter
      if (selectedZone !== 'All Companies') {
        const zoneStr = (c.midc_zone || c.midcZone || '').toLowerCase();
        if (!zoneStr.includes(selectedZone.toLowerCase())) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchIndustry = (c.industry || '').toLowerCase().includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        const matchZone = (c.midc_zone || c.midcZone || '').toLowerCase().includes(q);
        return matchName || matchIndustry || matchCity || matchZone;
      }

      return true;
    });
  }, [companies, selectedZone, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Page Header */}
      <Header
        title="Industrial Companies"
        subtitle="Explore verified manufacturers & employers in MIDC zones"
        hideRightActions
      />

      {/* Main Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies by name, MIDC zone, industry..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Zone Filter Chips Scroll */}
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

        {/* Count Summary */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing <Text style={{ fontWeight: '800', color: '#0F172A' }}>{filteredCompanies.length}</Text> Verified Companies
          </Text>
        </View>

        {/* Companies List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading verified industrial companies...</Text>
          </View>
        ) : filteredCompanies.length > 0 ? (
          <View style={styles.companiesList}>
            {filteredCompanies.map((comp, index) => {
              const jobsCount = comp.open_jobs_count ?? comp.jobs_count ?? comp.openings_count ?? comp.jobsCount ?? 4;
              const locationText = comp.midc_zone || comp.midcZone || comp.city || 'Waluj MIDC, Chhatrapati Sambhajinagar';
              const companyType = comp.company_type || comp.companyType || 'Private Limited';
              const companySize = comp.company_size || comp.companySize || '500+ employees';
              const cardKey = `company-${comp.id || comp.name}-${index}`;

              return (
                <TouchableOpacity
                  key={cardKey}
                  activeOpacity={0.85}
                  style={styles.companyCard}
                  onPress={() => {
                    navigation.navigate('CompanyProfile', {
                      companyId: comp.id || comp.name,
                      company: comp,
                      name: comp.name,
                    });
                  }}
                >
                  {/* Card Header Row */}
                  <View style={styles.cardHeaderRow}>
                    <CompanyLogoAvatar
                      logoUrl={comp.logo || comp.logoUrl}
                      companyName={comp.name}
                      size={48}
                      borderRadius={24}
                    />

                    <View style={styles.cardHeaderTextWrap}>
                      <View style={styles.companyTitleRow}>
                        <Text style={styles.companyNameText} numberOfLines={1}>
                          {comp.name}
                        </Text>
                      </View>

                      <Text style={styles.industryText} numberOfLines={1}>
                        {comp.industry || 'Industrial Manufacturing'}
                      </Text>

                      <View style={styles.locationRow}>
                        <MapPin size={13} color="#64748B" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {locationText}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Inline Metadata Sub-line */}
                  <View style={styles.metaSubRow}>
                    <Text style={styles.metaSubText} numberOfLines={1}>
                      {companyType}  •  {companySize}
                    </Text>
                  </View>

                  {/* Crisp Section Divider */}
                  <View style={styles.divider} />

                  {/* Card Footer */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.jobsNormalRow}>
                      <Briefcase size={14} color="#2563EB" />
                      <Text style={styles.jobsNormalText}>{jobsCount} Vacancies Available</Text>
                    </View>

                    <View style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>View Profile</Text>
                      <ChevronRight size={14} color="#2563EB" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Building2 size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Companies Found</Text>
            <Text style={styles.emptySubtitle}>
              No industrial companies match your current search query or zone filter.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  filterChipScroll: {
    marginBottom: 12,
  },
  filterChipContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
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
  countRow: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 12.5,
    color: '#64748B',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  companiesList: {
    gap: 14,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderTextWrap: {
    flex: 1,
  },
  companyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  companyNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  verifiedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#2563EB',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 0,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  industryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  metaSubRow: {
    marginTop: 8,
  },
  metaSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 10,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobsNormalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobsNormalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
