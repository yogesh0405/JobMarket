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
  Building2,
  Briefcase,
  Plus,
  X,
} from 'lucide-react-native';
import { formatTimeAgo } from '../../candidate/components/CandidateJobSearchUtils';
import { isJobLive } from '../../../utils/jobStatusUtils';

interface JobItem {
  id?: string | number;
  title: string;
  company?: string;
  department?: string;
  location?: string;
  job_type?: string;
  jobType?: string;
  work_mode?: string;
  workMode?: string;
  salary_min?: number;
  salary_max?: number;
  salary?: string;
  salaryRange?: string;
  experience?: string;
  experienceLevel?: string;
  experience_level?: string;
  trade?: string;
  shift?: string;
  shiftType?: string;
  shift_type?: string;
  created_at?: string;
  createdAt?: string;
  posted_at?: string;
  postedAt?: string;
  status?: string;
  approval_status?: string;
  approvalStatus?: string;
  is_active?: boolean;
  isActive?: boolean;
}

interface CompanyActiveJobsSectionProps {
  jobs: JobItem[];
  companyName?: string;
  isOwner?: boolean;
  selectedDept?: string | null;
  onClearDept?: () => void;
  onPostJobPress?: () => void;
  onJobPress?: (job: JobItem) => void;
  onViewAllPress?: () => void;
}

export const CompanyActiveJobsSection: React.FC<CompanyActiveJobsSectionProps> = ({
  jobs,
  companyName = 'Company',
  isOwner = false,
  selectedDept = null,
  onClearDept,
  onPostJobPress,
  onJobPress,
  onViewAllPress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Strictly filter only live and active job postings
  const displayJobs: JobItem[] = (jobs || []).filter(isJobLive);

  const filteredJobs = displayJobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (j.title || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q) ||
      (j.job_type || j.jobType || '').toLowerCase().includes(q) ||
      (j.trade || '').toLowerCase().includes(q)
    );
  });

  const formatSalary = (j: JobItem) => {
    if (j.salaryRange) return j.salaryRange;
    if (j.salary) return j.salary;
    if (j.salary_min && j.salary_max) {
      return `₹${j.salary_min.toLocaleString('en-IN')} - ₹${j.salary_max.toLocaleString('en-IN')} / month`;
    }
    if (j.salary_min) {
      return `₹${j.salary_min.toLocaleString('en-IN')} / month`;
    }
    return '₹18,000 - ₹28,000 / month';
  };

  const formatExperience = (j: JobItem) => {
    return (
      j.experienceLevel ||
      j.experience_level ||
      j.experience ||
      '1-3 Years Experience'
    );
  };

  const formatShift = (j: JobItem) => {
    return (
      j.shiftType ||
      j.shift_type ||
      j.shift ||
      'General / Rotational Shift'
    );
  };

  return (
    <View style={styles.surfaceCard}>
      {/* 1. Header with Icon Box, Title & Subtitle */}
      <View style={styles.cardHeader}>
        <View style={styles.titleGroup}>
          <View style={styles.cardIconWrap}>
            <Briefcase size={16} color="#1B4FDF" strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Active Job Openings</Text>
            <Text style={styles.cardSubtitle}>
              Showing {filteredJobs.length} of {displayJobs.length} published vacancies
            </Text>
          </View>
        </View>

        {isOwner && onPostJobPress && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPostJobPress}
            style={styles.postJobBtn}
          >
            <Plus size={14} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.postJobBtnText}>Post Vacancy</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Search Toolbar */}
      <View style={styles.searchBar}>
        <Search size={16} color="#64748B" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search roles by title, trade, skill, or loc..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={15} color="#94A3B8" strokeWidth={2} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Active Department Filter Indicator */}
      {selectedDept && (
        <View style={styles.activeFilterChip}>
          <Text style={styles.activeFilterText}>Dept: {selectedDept}</Text>
          {onClearDept && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClearDept}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={13} color="#1D4ED8" strokeWidth={2.2} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 3. Job Cards List */}
      <View style={styles.jobsList}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, idx) => {
            const locationText =
              job.location || 'Waluj MIDC, Chhatrapati Sambhajinagar';
            const timeText = formatTimeAgo(
              job.created_at ||
                job.createdAt ||
                job.posted_at ||
                job.postedAt
            );
            const jobType = job.job_type || job.jobType || 'Full-Time';
            const salary = formatSalary(job);
            const exp = formatExperience(job);
            const shift = formatShift(job);

            return (
              <View
                key={job.id ? `job-${job.id}` : `idx-${idx}`}
                style={styles.jobItemCard}
              >
                {/* Title */}
                <Text
                  style={styles.jobItemTitle}
                  numberOfLines={1}
                  onPress={() => onJobPress && onJobPress(job)}
                >
                  {job.title}
                </Text>

                {/* Meta Row: Building2 CompanyName • MapPin Location • Briefcase JobType */}
                <View style={styles.jobMetaRow}>
                  <View style={styles.metaItem}>
                    <Building2 size={13} color="#1B4FDF" strokeWidth={2.2} />
                    <Text style={styles.metaItemTextBlue} numberOfLines={1}>
                      {companyName}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <MapPin size={13} color="#64748B" strokeWidth={2} />
                    <Text style={styles.metaItemText} numberOfLines={1}>
                      {locationText}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Briefcase size={13} color="#64748B" strokeWidth={2} />
                    <Text style={styles.metaItemText} numberOfLines={1}>
                      {jobType}
                    </Text>
                  </View>
                </View>

                {/* Details Row: Salary • Experience • Trade • Shift */}
                <View style={styles.jobDetailsRow}>
                  <Text style={styles.detailItemSalary}>{salary}</Text>
                  <Text style={styles.detailSeparator}>•</Text>
                  <Text style={styles.detailItem}>{exp}</Text>
                  {job.trade ? (
                    <>
                      <Text style={styles.detailSeparator}>•</Text>
                      <Text style={styles.detailItem}>Trade: {job.trade}</Text>
                    </>
                  ) : null}
                  <Text style={styles.detailSeparator}>•</Text>
                  <Text style={styles.detailItem}>{shift}</Text>
                </View>

                {/* Footer: Posted time on Left, View Details & Apply Now on Right */}
                <View style={styles.jobFooterRow}>
                  <Text style={styles.postedTimeText}>
                    Posted {timeText}
                  </Text>

                  <View style={styles.actionsGroup}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => onJobPress && onJobPress(job)}
                      style={styles.viewDetailsBtn}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => onJobPress && onJobPress(job)}
                      style={styles.applyNowBtn}
                    >
                      <Text style={styles.applyNowText}>Apply Now</Text>
                      <ChevronRight size={13} color="#FFFFFF" strokeWidth={2.4} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Briefcase size={36} color="#94A3B8" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>No openings match your search</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your keywords or clearing the department filter.
            </Text>
            {(searchQuery || selectedDept) && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery('');
                  if (onClearDept) onClearDept();
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  surfaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1B4FDF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  postJobBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  activeFilterText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  jobsList: {
    gap: 10,
  },
  jobItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  jobItemTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemTextBlue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B4FDF',
  },
  metaItemText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  jobDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItemSalary: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailSeparator: {
    fontSize: 10,
    color: '#94A3B8',
  },
  detailItem: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  jobFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  postedTimeText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewDetailsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  viewDetailsText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1B4FDF',
  },
  applyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1B4FDF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  applyNowText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  resetBtn: {
    backgroundColor: '#1B4FDF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
