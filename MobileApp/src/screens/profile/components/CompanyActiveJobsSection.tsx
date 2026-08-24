import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  ChevronRight,
  Building2,
} from 'lucide-react-native';
import { CandidateJobCardItem } from '../../candidate/components/CandidateJobCardItem';

interface CompanyActiveJobsSectionProps {
  jobs: any[];
  loadingJobs: boolean;
  onSelectJob: (job: any) => void;
  isOwner?: boolean;
  onPostJobPress?: () => void;
}

export const CompanyActiveJobsSection: React.FC<CompanyActiveJobsSectionProps> = ({
  jobs,
  loadingJobs,
  onSelectJob,
  isOwner,
  onPostJobPress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (j.title && j.title.toLowerCase().includes(q)) ||
      (j.location && j.location.toLowerCase().includes(q)) ||
      (j.trade && j.trade.toLowerCase().includes(q)) ||
      (j.jobType && j.jobType.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <Briefcase size={18} color="#2563EB" />
          <Text style={styles.cardTitle}>Active Job Openings</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{jobs.length}</Text>
          </View>
        </View>

        {isOwner && onPostJobPress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPostJobPress}
            style={styles.postJobBtn}
          >
            <Text style={styles.postJobBtnText}>+ Post New Job</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Slate 400 Divider */}
      <View style={styles.divider} />

      {/* Filter / Search Input */}
      {jobs.length > 0 ? (
        <View style={styles.searchBar}>
          <Search size={16} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vacancies by title, trade, location..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      ) : null}

      {/* Jobs List */}
      {loadingJobs ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading company job postings...</Text>
        </View>
      ) : filteredJobs.length > 0 ? (
        <View style={styles.jobsList}>
          {filteredJobs.map((job) => (
            <CandidateJobCardItem
              key={job.id || String(Math.random())}
              job={job}
              viewMode="grid"
              isSaved={false}
              onPress={() => onSelectJob(job)}
              onToggleSave={() => {}}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Briefcase size={32} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Active Vacancies</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.trim()
              ? 'No job openings match your search filter.'
              : 'This company currently has no active published job postings.'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  postJobBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
  },
  postJobBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  jobsList: {
    gap: 12,
    marginTop: 6,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
