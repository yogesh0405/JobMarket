import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import {
  Search,
  X,
  SlidersHorizontal,
  Check,
} from 'lucide-react-native';
import { apiFetch } from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { Header } from '../../components/common/Header';
import { JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS, SPACING } from '../../constants/theme';
import {
  ExtendedCandidate,
  CANDIDATE_SEARCH_SUGGESTIONS,
  SEED_CANDIDATES,
} from './components/CandidatesUtils';
import { CandidateCardItem } from './components/CandidateCardItem';
import { CandidateDetailModal } from './components/CandidateDetailModal';

export const CandidatesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [candidates, setCandidates] = useState<ExtendedCandidate[]>([]);
  const searchInputRef = React.useRef<any>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedCandidate | null>(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeTradeFilter, setActiveTradeFilter] = useState<string | null>(null);
  const [activeExpFilter, setActiveExpFilter] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % CANDIDATE_SEARCH_SUGGESTIONS.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const fetchCandidates = async () => {
    setError(null);
    try {
      let rawList: any[] = [];
      const res1 = await apiFetch('/api/v1/jobs/workers/all').catch(() => null);
      if (res1 && res1.success && Array.isArray(res1.data) && res1.data.length > 0) {
        rawList = res1.data;
      } else {
        const res2 = await apiFetch('/api/candidates').catch(() => null);
        if (res2 && res2.success && Array.isArray(res2.data) && res2.data.length > 0) {
          rawList = res2.data;
        }
      }

      if (rawList.length > 0) {
        const formatted: ExtendedCandidate[] = rawList.map((item: any, idx: number) => {
          const expYears = typeof item.experience === 'number' ? `${item.experience} Years` : (item.experience || '2 Years');
          const fallbackPhoto = SEED_CANDIDATES[idx % SEED_CANDIDATES.length]?.avatarUrl;
          const photo =
            item.profilePictureUrl ||
            item.profile_picture_url ||
            item.avatarUrl ||
            item.avatar_url ||
            item.avatar ||
            item.photo ||
            item.image ||
            fallbackPhoto;
          return {
            id: item.id || `candidate-${idx}`,
            name: item.name || 'Industrial Candidate',
            email: item.email || '',
            phone: item.phone || '',
            role: 'candidate',
            avatarUrl: photo,
            profile_picture_url: photo,
            headline: item.headline || item.title || 'Skilled Factory Technician',
            title: item.title || item.headline || 'Machine Operator',
            trade_specialization: item.tradeSpecialization || item.trade_specialization || 'CNC / VMC Machinist',
            location: item.location || 'Waluj MIDC, Chhatrapati Sambhajinagar',
            skills: Array.isArray(item.skills) && item.skills.length > 0 ? item.skills : ['CNC Operating', 'Machine Maintenance', 'Shop Safety'],
            experience: expYears,
            education: item.education || 'ITI Certified',
            aadhaar_verified: item.aadhaarVerified ?? item.aadhaar_verified ?? true,
            verified: true,
            preferred_shift: item.preferredShift || item.preferred_shift || 'Day Shift',
            notice_period: item.noticePeriod || item.notice_period || 'Immediate',
            bio: item.bio || `Certified technician with ${expYears} experience in industrial plant operations.`,
          };
        });
        setCandidates(formatted);
      } else {
        setCandidates(SEED_CANDIDATES);
      }
    } catch (err: any) {
      setCandidates(SEED_CANDIDATES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  const filteredCandidates = candidates.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const nameMatch = item.name && item.name.toLowerCase().includes(query);
      const titleMatch = item.title && item.title.toLowerCase().includes(query);
      const tradeMatch = item.trade_specialization && item.trade_specialization.toLowerCase().includes(query);
      const locationMatch = item.location && item.location.toLowerCase().includes(query);
      const skillMatch = Array.isArray(item.skills) && item.skills.some((s) => s.toLowerCase().includes(query));
      if (!nameMatch && !titleMatch && !tradeMatch && !locationMatch && !skillMatch) return false;
    }

    if (activeTradeFilter) {
      const t = activeTradeFilter.toLowerCase();
      const titleM = (item.title || '').toLowerCase().includes(t);
      const tradeM = (item.trade_specialization || '').toLowerCase().includes(t);
      const skillM = Array.isArray(item.skills) && item.skills.some((s) => s.toLowerCase().includes(t));
      if (!titleM && !tradeM && !skillM) return false;
    }

    if (activeExpFilter) {
      const expNum = parseInt(activeExpFilter, 10) || 0;
      const candExpNum = parseInt(item.experience || '0', 10) || 0;
      if (candExpNum < expNum) return false;
    }

    return true;
  });

  const hasActiveFilters = !!activeTradeFilter || !!activeExpFilter;

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      {/* Search Bar + Filter Section */}
      <View style={styles.searchBarWrapper}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => searchInputRef.current?.focus()}
          style={[
            styles.searchBarContainer,
            (isSearchFocused || !!searchQuery) && styles.searchBarContainerActive,
          ]}
        >
          <Search size={18} color={isSearchFocused ? COLORS.primary : '#64748B'} style={{ marginRight: 8 }} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={CANDIDATE_SEARCH_SUGGESTIONS[suggestionIndex]}
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            numberOfLines={1}
            multiline={false}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4, marginRight: 2 }}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          ) : null}

          <View style={styles.inlineFilterDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModalVisible(true)}
            style={styles.inlineFilterBtnIconOnly}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal size={18} color={hasActiveFilters ? COLORS.primary : '#64748B'} />
            {hasActiveFilters ? <View style={styles.inlineFilterBadgeDotOnly} /> : null}
          </TouchableOpacity>
        </TouchableOpacity>

        {searchQuery || hasActiveFilters ? (
          <View style={styles.searchResultsInfoRow}>
            <Text style={styles.searchResultsCountText}>
              Found {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? '' : 's'}
              {activeTradeFilter ? ` • ${activeTradeFilter}` : ''}
              {activeExpFilter ? ` • ${activeExpFilter}` : ''}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setActiveTradeFilter(null);
                setActiveExpFilter(null);
              }}
            >
              <Text style={styles.clearSearchText}>Reset All</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {error ? (
        <ErrorBanner message={error} onRetry={fetchCandidates} style={{ marginHorizontal: SPACING.lg }} />
      ) : null}

      {loading ? (
        <View style={{ padding: SPACING.lg }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : (
        <FlatList
          key="candidate-grid-2-col"
          numColumns={2}
          data={filteredCandidates}
          renderItem={({ item }) => (
            <CandidateCardItem item={item} onSelectCandidate={setSelectedCandidate} />
          )}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.gridColumnWrapper}
          contentContainerStyle={styles.gridListContentContainer}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListFooterComponent={<View style={{ height: 32 }} />}
        />
      )}

      {/* Candidate Details Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        visible={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onOpenPdfModal={() => setPdfModalVisible(true)}
      />

      {/* Resume PDF Viewer Modal */}
      {selectedCandidate ? (
        <ResumePdfViewerModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          candidateName={selectedCandidate.name}
          candidateRole={selectedCandidate.title || 'Technical Specialist'}
          pdfUrl={selectedCandidate.resume_url || selectedCandidate.resumeUrl || selectedCandidate.resume}
        />
      ) : null}

      {/* Filter Modal Sheet */}
      <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.sheetOverlayBottom}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
          <View style={[styles.cleanIosSheetCard, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom + 48, 64) : Math.max(insets.bottom + 24, 40) }]}>
            <View style={styles.sheetGrabHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitleText}>FILTER CANDIDATES</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380, marginVertical: 8 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>TRADE SPECIALIZATION</Text>
              <View style={styles.filterOptionsGrid}>
                {['VMC Operator', 'CNC Turner', 'Fitter', 'Welder', 'Electrician', 'Quality Inspector'].map((trade) => {
                  const isSelected = activeTradeFilter === trade;
                  return (
                    <TouchableOpacity
                      key={trade}
                      activeOpacity={0.8}
                      onPress={() => setActiveTradeFilter(isSelected ? null : trade)}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>{trade}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.rowDivider} />

              <Text style={styles.filterSectionTitle}>MINIMUM EXPERIENCE</Text>
              <View style={styles.filterOptionsGrid}>
                {['1+ Yrs', '3+ Yrs', '5+ Yrs', '8+ Yrs'].map((exp) => {
                  const isSelected = activeExpFilter === exp;
                  return (
                    <TouchableOpacity
                      key={exp}
                      activeOpacity={0.8}
                      onPress={() => setActiveExpFilter(isSelected ? null : exp)}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>{exp}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.sheetActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTradeFilter(null);
                  setActiveExpFilter(null);
                }}
                style={styles.sheetResetBtn}
              >
                <Text style={styles.sheetResetText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setFilterModalVisible(false)}
                style={styles.sheetApplyBtn}
              >
                <Text style={styles.sheetApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  searchBarWrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarContainerActive: {
    borderColor: COLORS.primary,
    borderBottomColor: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  inlineFilterDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  inlineFilterBtnIconOnly: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inlineFilterBadgeDotOnly: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  searchResultsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  searchResultsCountText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  clearSearchText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridListContentContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 110,
  },
  loadMoreFooterBox: {
    alignItems: 'center',
    marginVertical: 14,
  },
  loadMoreBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loadMoreBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sheetOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  cleanIosSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 12,
    width: '100%',
  },
  sheetGrabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 10,
    marginBottom: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },

  sheetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    marginBottom: Platform.OS === 'android' ? 12 : 4,
  },
  sheetResetBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  sheetResetText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#475569',
  },
  sheetApplyBtn: {
    flex: 1.5,
    height: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  sheetApplyText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
