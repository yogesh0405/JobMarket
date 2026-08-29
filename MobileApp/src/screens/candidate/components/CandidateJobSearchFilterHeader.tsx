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
      {/* Top Search Bar & View Mode Bar */}
      <View style={{ zIndex: 999, position: 'relative', marginHorizontal: 16, marginTop: 10, marginBottom: 8 }}>
        <View style={styles.topBarWrapperRow}>
          <View style={[styles.topSearchPillRow, isInputFocused && styles.topSearchPillRowActive]}>
            <TouchableOpacity onPress={() => setShowSuggestions(false)} style={styles.searchIconBadge3D} activeOpacity={0.8}>
              <Search size={18} color={isInputFocused ? COLORS.primary : '#64748B'} strokeWidth={2.2} />
            </TouchableOpacity>

            <TextInput
              ref={searchInputRef}
              style={styles.topSearchInput}
              placeholder={searchPlaceholders[placeholderIndex]}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={(txt) => {
                setSearchQuery(txt);
                setShowSuggestions(txt.trim().length > 0);
              }}
              onPressIn={() => setIsInputFocused(true)}
              onFocus={() => {
                setIsInputFocused(true);
                setShowSuggestions(searchQuery.trim().length > 0);
              }}
              onBlur={() => setIsInputFocused(false)}
              returnKeyType="search"
            />

            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                style={styles.searchClearBtn}
              >
                <X size={14} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            ) : null}

            <View style={styles.inlineFilterDivider} />

            <TouchableOpacity
              style={styles.inlineFilterBtnIconOnly}
              onPress={onOpenFilterDrawer}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <SlidersHorizontal size={18} color={COLORS.primary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* View Mode Toggle Buttons */}
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
              onPress={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} color={viewMode === 'grid' ? COLORS.primary : '#64748B'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <List size={16} color={viewMode === 'list' ? COLORS.primary : '#64748B'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => navigation.navigate('CandidateJobMapView')}
            >
              <MapPin size={16} color="#059669" />
            </TouchableOpacity>
          </View>
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

              {matchedSuggestions.jobs.length > 0 ? (
                <View style={styles.suggestionGroup}>
                  <Text style={styles.suggestionGroupLabel}>MATCHING LIVE JOBS</Text>
                  {matchedSuggestions.jobs.map((j) => (
                    <TouchableOpacity
                      key={j.id}
                      style={styles.suggestionItemRow}
                      onPress={() => {
                        setShowSuggestions(false);
                        navigation.navigate('CandidateJobDetail', { jobId: j.id, job: j });
                      }}
                    >
                      <Briefcase size={16} color={COLORS.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionItemTitle} numberOfLines={1}>{j.title}</Text>
                        <Text style={styles.suggestionItemSub} numberOfLines={1}>{j.company} • {j.location}</Text>
                      </View>
                      <ChevronRight size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
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
    height: 40,
    gap: 8,
  },
  topSearchPillRowActive: {
    borderColor: COLORS.primary,
  },
  searchIconBadge3D: {
    padding: 2,
  },
  topSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
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
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 2,
    gap: 2,
    height: 40,
    alignItems: 'center',
  },
  toggleBtn: {
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 4,
  },
  toggleBtnActive: {
    backgroundColor: '#EFF6FF',
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
});
