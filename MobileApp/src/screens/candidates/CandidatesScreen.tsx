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
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
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
import { extractCandidateResume } from '../../utils/fileUtils';

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

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#FFFFFF', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(false);
      }
    }, [])
  );

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
          const resumeRaw =
            item.resume_url ||
            item.resumeUrl ||
            item.resume ||
            item.user?.resume_url ||
            item.user?.resumeUrl ||
            item.user?.resume;
          const resolvedResume =
            typeof resumeRaw === 'string'
              ? resumeRaw
              : resumeRaw && typeof resumeRaw === 'object'
              ? resumeRaw.url || resumeRaw.fileUrl || resumeRaw.uri || ''
              : '';

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
            resume_url: resolvedResume,
            resumeUrl: resolvedResume,
            resume: typeof resumeRaw === 'object' ? resumeRaw : resolvedResume,
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
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
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
          <Search size={14} color={isSearchFocused ? '#1764E8' : '#91A0BA'} style={{ marginRight: 8 }} />
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
              <X size={14} color="#91A0BA" />
            </TouchableOpacity>
          ) : null}

          <View style={styles.inlineFilterDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModalVisible(true)}
            style={styles.inlineFilterBtnIconOnly}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal size={14} color={hasActiveFilters ? '#1764E8' : '#657796'} />
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
          pdfUrl={extractCandidateResume(selectedCandidate).url}
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
    backgroundColor: '#F7F9FC',
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  searchBarContainerActive: {
    borderColor: '#1764E8',
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#102A5C',
  },
  inlineFilterDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 6,
  },
  inlineFilterBtnIconOnly: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inlineFilterBadgeDotOnly: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1764E8',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  searchResultsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  searchResultsCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#657796',
  },
  clearSearchText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1764E8',
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridListContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 130,
  },
  loadMoreFooterBox: {
    alignItems: 'center',
    marginVertical: 14,
  },
  loadMoreBtn: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
  },
  loadMoreBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1764E8',
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
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  sheetTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102A5C',
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1764E8',
    marginTop: 10,
    marginBottom: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#EEF4FF',
    borderColor: '#DBEAFE',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#657796',
  },
  filterChipTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E7EBF2',
    marginVertical: 8,
  },

  sheetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: Platform.OS === 'android' ? 12 : 4,
  },
  sheetResetBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  sheetResetText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#657796',
  },
  sheetApplyBtn: {
    flex: 1.5,
    height: 42,
    backgroundColor: '#1764E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  sheetApplyText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
