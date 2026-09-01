import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Search,
  SearchX,
  SlidersHorizontal,
  X,
  ArrowRight,
  Briefcase,
  Award,
  MapPin,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';
import { Job } from '../../../types';
import { CATEGORIES } from './CandidateJobSearchUtils';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';

interface CandidateJobSearchFilterHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchPlaceholders: string[];
  placeholderIndex: number;
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  isInputFocused: boolean;
  setIsInputFocused: (val: boolean) => void;
  matchedSuggestions: {
    jobs: Job[];
    companies?: { name: string; logoUrl?: string; industry?: string; count: number }[];
    trades: string[];
    locations: string[];
  };
  onOpenFilterDrawer: () => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  navigation: any;
}

export const CandidateJobSearchFilterHeader: React.FC<CandidateJobSearchFilterHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  searchPlaceholders,
  placeholderIndex,
  showSuggestions,
  setShowSuggestions,
  isInputFocused,
  setIsInputFocused,
  matchedSuggestions,
  onOpenFilterDrawer,
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
  navigation,
}) => {
  const searchInputRef = useRef<TextInput>(null);

  return (
    <>
      {/* Top Tabular View Mode Menu with Standard Underline */}
      <View style={styles.viewModeTabsContainer}>
        <View style={styles.viewModeTabsRow}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.75}
          >
            <View style={styles.tabContentRow}>
              <LayoutGrid
                size={15}
                color={viewMode === 'grid' ? COLORS.primary : '#64748B'}
                strokeWidth={viewMode === 'grid' ? 2.4 : 1.8}
              />
              <Text style={[styles.tabText, viewMode === 'grid' && styles.tabTextActive]}>
                Grid View
              </Text>
            </View>
            {viewMode === 'grid' ? (
              <View style={styles.activeUnderline} />
            ) : (
              <View style={styles.inactiveUnderline} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setViewMode('list')}
            activeOpacity={0.75}
          >
            <View style={styles.tabContentRow}>
              <List
                size={16}
                color={viewMode === 'list' ? COLORS.primary : '#64748B'}
                strokeWidth={viewMode === 'list' ? 2.4 : 1.8}
              />
              <Text style={[styles.tabText, viewMode === 'list' && styles.tabTextActive]}>
                List View
              </Text>
            </View>
            {viewMode === 'list' ? (
              <View style={styles.activeUnderline} />
            ) : (
              <View style={styles.inactiveUnderline} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('CandidateJobMapView')}
            activeOpacity={0.75}
          >
            <View style={styles.tabContentRow}>
              <MapPin
                size={15}
                color="#64748B"
                strokeWidth={1.8}
              />
              <Text style={styles.tabText}>
                Map View
              </Text>
            </View>
            <View style={styles.inactiveUnderline} />
          </TouchableOpacity>
        </View>

        {/* Autocomplete Dropdown Overlay */}
        {showSuggestions && searchQuery.trim().length > 0 ? (
          <View style={styles.suggestionsContainer}>
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{ maxHeight: 270 }}>
              <TouchableOpacity
                style={styles.suggestionRowHeader}
                onPress={() => setShowSuggestions(false)}
              >
                <Search size={15} color={COLORS.primary} />
                <Text style={styles.suggestionHeaderText} numberOfLines={1}>
                  Search all jobs matching "<Text style={{ fontWeight: '800', color: COLORS.primary }}>{searchQuery.trim()}</Text>"
                </Text>
                <ArrowRight size={14} color={COLORS.primary} />
              </TouchableOpacity>

              {/* Matching Companies Section */}
              {matchedSuggestions.companies && matchedSuggestions.companies.length > 0 ? (
                <View style={styles.suggestionGroup}>
                  <Text style={styles.suggestionGroupLabel}>COMPANIES & FACTORIES</Text>
                  {matchedSuggestions.companies.map((c) => (
                    <TouchableOpacity
                      key={c.name}
                      style={styles.suggestionItemRow}
                      onPress={() => {
                        setSearchQuery(c.name);
                        setShowSuggestions(false);
                      }}
                    >
                      <CompanyLogoAvatar
                        logoUrl={c.logoUrl}
                        companyName={c.name}
                        size={32}
                        borderRadius={6}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionItemTitle} numberOfLines={1}>{c.name}</Text>
                        <Text style={styles.suggestionItemSub} numberOfLines={1}>
                          {c.industry || 'Industrial Partner'} • {c.count} open job{c.count !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <ChevronRight size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {/* Matching Live Jobs Section */}
              {matchedSuggestions.jobs.length > 0 ? (
                <View style={styles.suggestionGroup}>
                  <Text style={styles.suggestionGroupLabel}>MATCHING LIVE JOBS</Text>
                  {matchedSuggestions.jobs.map((j) => {
                    const jobLogo =
                      j.companyLogo ||
                      (j as any).company_logo ||
                      (j as any).logoUrl ||
                      (j as any).logo_url ||
                      (j as any).logo ||
                      (j as any).employer_logo ||
                      (j as any).avatar_url ||
                      (j as any).avatar;
                    const compName = j.company || (j as any).company_name || (j as any).companyName || 'Industrial Company';
                    return (
                      <TouchableOpacity
                        key={j.id}
                        style={styles.suggestionItemRow}
                        onPress={() => {
                          setShowSuggestions(false);
                          navigation.navigate('CandidateJobDetail', { jobId: j.id, job: j });
                        }}
                      >
                        <CompanyLogoAvatar
                          logoUrl={jobLogo}
                          companyName={compName}
                          size={32}
                          borderRadius={6}
                          style={{ marginRight: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionItemTitle} numberOfLines={1}>{j.title}</Text>
                          <Text style={styles.suggestionItemSub} numberOfLines={1}>{compName} • {j.location || 'Industrial Area'}</Text>
                        </View>
                        <ChevronRight size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}

              {matchedSuggestions.trades.length > 0 ? (
                <View style={styles.suggestionGroup}>
                  <Text style={styles.suggestionGroupLabel}>POPULAR TRADES & SKILLS</Text>
                  {matchedSuggestions.trades.map((trade) => (
                    <TouchableOpacity
                      key={trade}
                      style={styles.suggestionItemRow}
                      onPress={() => {
                        setSearchQuery(trade);
                        setShowSuggestions(false);
                      }}
                    >
                      <Award size={16} color="#059669" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionItemTitle}>{trade}</Text>
                        <Text style={styles.suggestionItemSub}>ITI / Industrial Trade</Text>
                      </View>
                      <ChevronRight size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {matchedSuggestions.locations.length > 0 ? (
                <View style={styles.suggestionGroup}>
                  <Text style={styles.suggestionGroupLabel}>INDUSTRIAL ZONES & LOCATIONS</Text>
                  {matchedSuggestions.locations.map((loc) => (
                    <TouchableOpacity
                      key={loc}
                      style={styles.suggestionItemRow}
                      onPress={() => {
                        setSearchQuery(loc);
                        setShowSuggestions(false);
                      }}
                    >
                      <MapPin size={16} color="#D97706" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionItemTitle}>{loc}</Text>
                        <Text style={styles.suggestionItemSub}>Industrial Cluster</Text>
                      </View>
                      <ChevronRight size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {matchedSuggestions.jobs.length === 0 &&
              matchedSuggestions.trades.length === 0 &&
              matchedSuggestions.locations.length === 0 ? (
                <View style={styles.noSuggestionsBox}>
                  <SearchX size={18} color="#94A3B8" />
                  <Text style={styles.noSuggestionsTitle}>No live suggestions</Text>
                  <Text style={styles.noSuggestionsSub}>
                    Tap top row to search all vacancies matching "{searchQuery.trim()}"
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12, marginTop: 4 }}
                onPress={() => setShowSuggestions(false)}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>Close Suggestions ✕</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : null}
      </View>

      {/* Horizontal Category Filter Pills */}
      <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.85}
              style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryPillText, selectedCategory === cat && styles.categoryPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topBarWrapperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  topSearchPillRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  filterActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 38,
    justifyContent: 'center',
  },
  filterActionPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchClearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineFilterDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  inlineFilterBtnIconOnly: {
    padding: 4,
  },
  viewModeTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  viewModeTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    position: 'relative',
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 9,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  inactiveUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: 'transparent',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 4,
    zIndex: 999,
  },
  suggestionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  suggestionHeaderText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  suggestionGroup: {
    marginBottom: 8,
  },
  suggestionGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 4,
    paddingLeft: 4,
  },
  suggestionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
    marginBottom: 4,
  },
  suggestionItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionItemSub: {
    fontSize: 11,
    color: '#64748B',
  },
  categoryScrollContainer: {
    gap: 6,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  noSuggestionsBox: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    marginVertical: 4,
  },
  noSuggestionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  noSuggestionsSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
});
