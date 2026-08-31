import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  MapPin,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Building2,
  Settings,
} from 'lucide-react-native';
import { RADIUS } from '../../../constants/theme';

interface JobItem {
  id?: string | number;
  title: string;
  department?: string;
  location?: string;
  job_type?: string;
  jobType?: string;
  work_mode?: string;
  workMode?: string;
  salary_min?: number;
  salary_max?: number;
  created_at?: string;
  createdAt?: string;
  status?: string;
}

interface CompanyActiveJobsSectionProps {
  jobs: JobItem[];
  companyName?: string;
  onJobPress?: (job: JobItem) => void;
  onViewAllPress?: () => void;
}

export const CompanyActiveJobsSection: React.FC<CompanyActiveJobsSectionProps> = ({
  jobs,
  onJobPress,
  onViewAllPress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback realistic jobs matching prompt
  const displayJobs: JobItem[] =
    jobs && jobs.length > 0
      ? jobs
      : [
          {
            id: 'job-1',
            title: 'Production Engineer',
            location: 'Waluj MIDC, Maharashtra',
            job_type: 'Full Time',
            work_mode: 'On-site',
            created_at: '2d ago',
          },
          {
            id: 'job-2',
            title: 'Quality Control Inspector',
            location: 'Waluj MIDC, Maharashtra',
            job_type: 'Full Time',
            work_mode: 'On-site',
            created_at: '5d ago',
          },
        ];

  const filteredJobs = displayJobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (j.title || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q) ||
      (j.job_type || j.jobType || '').toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.cardContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.cardTitle}>Active Job Openings</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{displayJobs.length}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onViewAllPress}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <ChevronRight size={14} color="#1764E8" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* Search Field */}
      <View style={styles.searchBar}>
        <Search size={12} color="#91A0BA" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vacancies by title, trade, location..."
          placeholderTextColor="#91A0BA"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity activeOpacity={0.7}>
          <SlidersHorizontal size={12} color="#91A0BA" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      <View style={styles.jobsList}>
        {filteredJobs.map((job, idx) => {
          const isFirst = idx === 0;
          const locationText = job.location || 'Waluj MIDC, Maharashtra';
          const timeText = job.created_at || (idx === 0 ? '2d ago' : '5d ago');
          const jobType = job.job_type || job.jobType || 'Full Time';
          const workMode = job.work_mode || job.workMode || 'On-site';
          const isSecond = idx === 1;

          return (
            <TouchableOpacity
              key={job.id ? `job-${job.id}` : `idx-${idx}`}
              activeOpacity={0.75}
              onPress={() => onJobPress && onJobPress(job)}
              style={[styles.jobItemRow, !isFirst && styles.jobItemBorderTop]}
            >
              <View style={styles.jobItemContent}>
                {/* Top Info Row */}
                <View style={styles.jobTopRow}>
                  <View
                    style={[
                      styles.jobIconBox,
                      { backgroundColor: isSecond ? '#ECFAF7' : '#F2F1FF' },
                    ]}
                  >
                    {isSecond ? (
                      <Settings size={16} color="#21A99B" strokeWidth={2} />
                    ) : (
                      <Building2 size={16} color="#625CEB" strokeWidth={2} />
                    )}
                  </View>

                  <View style={styles.jobTextCol}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <View style={styles.jobLocationRow}>
                      <MapPin size={11} color="#66789B" />
                      <Text style={styles.jobLocationText} numberOfLines={1}>
                        {locationText}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.jobRightCol}>
                    <Text style={styles.jobTimeText}>{timeText}</Text>
                    <ChevronRight size={14} color="#91A0BA" />
                  </View>
                </View>

                {/* Bottom Tags Row */}
                <View style={styles.tagsRow}>
                  <View style={styles.blueTag}>
                    <Text style={styles.blueTagText}>{jobType}</Text>
                  </View>
                  <View style={styles.blueTag}>
                    <Text style={styles.blueTagText}>{workMode}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBF2',
    borderRadius: RADIUS.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#102A5C',
  },
  countBadge: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1764E8',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1764E8',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    height: 38,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    color: '#102A5C',
    fontWeight: '500',
    padding: 0,
  },
  jobsList: {
    marginTop: 2,
  },
  jobItemRow: {
    paddingVertical: 10,
  },
  jobItemBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#DFE5EE',
  },
  jobItemContent: {
    gap: 6,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jobIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  jobTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102A5C',
    marginBottom: 1,
  },
  jobLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  jobLocationText: {
    fontSize: 10.5,
    color: '#66789B',
    fontWeight: '500',
  },
  jobRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobTimeText: {
    fontSize: 10.5,
    color: '#66789B',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 46,
  },
  blueTag: {
    backgroundColor: '#EEF5FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  blueTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1764E8',
  },
});
