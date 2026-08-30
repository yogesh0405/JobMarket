import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import {
  Bookmark,
  Search,
  X,
  Layers,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Job } from '../../types';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { CandidateJobCardItem } from './components/CandidateJobCardItem';
import { useToast } from '../../context/ToastContext';
import { savedJobsStore } from '../../utils/savedJobsStore';
import { COLORS } from '../../constants/theme';

interface Props {
  navigation: any;
}

export const CandidateSavedJobsScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [savedJobs, setSavedJobs] = useState<Job[]>(savedJobsStore.getSavedJobs());
  const [loading, setLoading] = useState(savedJobsStore.getSavedJobs().length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    setSavedJobs(savedJobsStore.getSavedJobs());
    const unsubscribe = savedJobsStore.subscribe(() => {
      setSavedJobs(savedJobsStore.getSavedJobs());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchSavedData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton && savedJobsStore.getSavedJobs().length === 0) setLoading(true);
    try {
      const jobs = await savedJobsStore.syncFromApi();
      setSavedJobs(jobs);
    } catch (e) {
      console.log('Error loading saved jobs from database:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedData(false);
    }, [fetchSavedData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedData(false);
  };

  const handleToggleSave = useCallback(
    (jobId: string) => {
      savedJobsStore.toggleSave(jobId);
      showToast('Removed from saved vacancies', 'info');
    },
    [showToast]
  );

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return savedJobs;
    const q = searchQuery.toLowerCase().trim();
    return savedJobs.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const company = (job.company || '').toLowerCase();
      const loc = (job.location || '').toLowerCase();
      const trade = ((job as any).trade || (job as any).industry || '').toLowerCase();

      return title.includes(q) || company.includes(q) || loc.includes(q) || trade.includes(q);
    });
  }, [savedJobs, searchQuery]);

  return (
    <View style={styles.container}>
      <Header
        title="Saved Jobs"
        subtitle="Bookmarked industrial vacancies"
        showBack={false}
      />

      {/* Search Toolbar */}
      {savedJobs.length > 0 && (
        <View style={styles.toolbarContainer}>
          <View style={styles.searchBarWrapper}>
            <Search size={14} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search saved jobs by title, company, MIDC..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={14} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Main Content Area */}
      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.cardSkeleton}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <SkeletonLoader width="70%" height={18} style={{ borderRadius: 0 }} />
                <SkeletonLoader width={22} height={22} style={{ borderRadius: 0 }} />
              </View>
              <SkeletonLoader width="45%" height={14} style={{ borderRadius: 0, marginBottom: 14 }} />
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                <SkeletonLoader width={80} height={12} style={{ borderRadius: 0 }} />
                <SkeletonLoader width={90} height={12} style={{ borderRadius: 0 }} />
                <SkeletonLoader width={70} height={12} style={{ borderRadius: 0 }} />
              </View>
              <View style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between' }}>
                <SkeletonLoader width={120} height={14} style={{ borderRadius: 0 }} />
                <SkeletonLoader width={60} height={14} style={{ borderRadius: 0 }} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          {savedJobs.length === 0 ? (
            /* Empty State when no jobs are saved */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Bookmark size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Saved Jobs Yet</Text>
              <Text style={styles.emptyDesc}>
                Tap the bookmark icon on any job card while browsing to save it for quick reference here.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.browseJobsCtaBtn}
                onPress={() => navigation.navigate('CandidateJobsTab')}
              >
                <Search size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.browseJobsCtaText}>Browse Industrial Jobs</Text>
              </TouchableOpacity>
            </View>
          ) : filteredJobs.length === 0 ? (
            /* Empty Search Results */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Layers size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Matching Saved Jobs</Text>
              <Text style={styles.emptyDesc}>
                No saved vacancies matched "{searchQuery}". Try a different keyword.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.resetSearchBtn}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.resetSearchBtnText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Saved Job Cards List */
            filteredJobs.map((job) => (
              <CandidateJobCardItem
                key={job.id}
                job={job}
                viewMode="grid"
                isSaved={true}
                onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id, job: job })}
                onToggleSave={handleToggleSave}
                onCompanyPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id, job: job })}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* ── SEARCH TOOLBAR ── */
  toolbarContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },

  /* ── SCROLL CONTENT & SKELETONS ── */
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
  },

  /* ── EMPTY STATES ── */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  browseJobsCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 0,
    marginTop: 10,
  },
  browseJobsCtaText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  resetSearchBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0,
    marginTop: 8,
  },
  resetSearchBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
});
