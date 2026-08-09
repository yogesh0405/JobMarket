import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import {
  Plus,
  Users,
  Edit3,
  Trash2,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  Layers,
  Building2,
  MapPin,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi } from '../../api/jobsApi';
import { Job } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/common/Header';
import { JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { ManageVacanciesModal } from '../../components/jobs/ManageVacanciesModal';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
}

type FilterTab = 'ALL' | 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';

export const EmployerJobsListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manageVacanciesJob, setManageVacanciesJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setError(null);
    try {
      const res = await jobsApi.getMyJobs();
      if (res.success && Array.isArray(res.data)) {
        setJobs(res.data);
      } else {
        setJobs([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job postings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const handleDeleteJob = (id: string, title: string) => {
    Alert.alert(
      'Delete Job Posting',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await jobsApi.deleteJob(id);
              setJobs((prev) => prev.filter((j) => j.id !== id));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete job posting.');
            }
          },
        },
      ]
    );
  };

  const isPendingStatus = (status?: string) => {
    const s = (status || '').toUpperCase();
    return s === 'PENDING' || s === 'PENDING_REVIEW' || s === 'PENDING_APPROVAL' || s === 'DRAFT' || s === 'IN_REVIEW';
  };

  const isApprovedStatus = (status?: string) => {
    const s = (status || '').toUpperCase();
    return s === 'APPROVED' || s === 'ACTIVE';
  };

  const isRejectedStatus = (status?: string) => {
    const s = (status || '').toUpperCase();
    return s === 'REJECTED' || s === 'CLOSED';
  };

  const filteredJobs = jobs.filter((j) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'APPROVED') return isApprovedStatus(j.status);
    if (activeTab === 'PENDING_REVIEW') return isPendingStatus(j.status);
    if (activeTab === 'REJECTED') return isRejectedStatus(j.status);
    return true;
  });

  const pendingCount = jobs.filter((j) => isPendingStatus(j.status)).length;
  const approvedCount = jobs.filter((j) => isApprovedStatus(j.status)).length;
  const rejectedCount = jobs.filter((j) => isRejectedStatus(j.status)).length;

  const renderJobItem = ({ item }: { item: Job }) => {
    const pending = isPendingStatus(item.status);
    const logoUri = item.companyLogo || (item as any).company_logo || user?.companyLogo || user?.company_logo;

    const salMin = item.salary_min ?? item.salaryMin ?? (item as any).salary_min ?? (item as any).salaryMin;
    const salMax = item.salary_max ?? item.salaryMax ?? (item as any).salary_max ?? (item as any).salaryMax;

    let salaryStr = 'Salary Undisclosed';
    if (salMin && salMax) {
      salaryStr = `₹${Number(salMin).toLocaleString('en-IN')} - ₹${Number(salMax).toLocaleString('en-IN')} / mo`;
    } else if (salMin || salMax) {
      salaryStr = `₹${Number(salMin || salMax).toLocaleString('en-IN')} / mo`;
    }

    const totalVacancies = item.openings ?? (item as any).openings ?? 1;
    const filledVacancies = item.filledOpenings ?? (item as any).filled_openings ?? (item as any).filledOpenings ?? 0;
    const actualApplicantCount = typeof (item as any).applicants_count === 'number'
      ? (item as any).applicants_count
      : (typeof (item as any).applicantsCount === 'number'
          ? (item as any).applicantsCount
          : (Array.isArray((item as any).applicants) ? (item as any).applicants.length : 0));

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('JobApplicants', { jobId: item.id, jobTitle: item.title })}
        style={styles.jobCard3D}
      >
        {/* Header Row with Logo */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.companyLogoBox}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.companyLogoImage} resizeMode="cover" />
            ) : (
              <Building2 size={22} color="#2563EB" />
            )}
          </View>

          <View style={styles.headerTextCol}>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.jobTitleText} numberOfLines={1}>
                {item.title}
              </Text>
              <Badge status={item.status} />
            </View>

            <Text style={styles.companyNameText} numberOfLines={1}>
              {item.company}{item.industry ? ` • ${item.industry}` : ''}
            </Text>
          </View>
        </View>

        {pending ? (
          <View style={styles.pendingCardNotice}>
            <Clock size={13} color="#D97706" />
            <Text style={styles.pendingNoticeText}>
              Sent for Admin Review • Stored in Database
            </Text>
          </View>
        ) : null}

        {/* Action Footer Bar with Vacancies Option */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.applicantBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('JobApplicants', { jobId: item.id, jobTitle: item.title })}
          >
            <Users size={14} color="#2563EB" />
            <Text style={styles.applicantBtnText}>
              {actualApplicantCount} {actualApplicantCount === 1 ? 'Candidate' : 'Candidates'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.vacanciesPillBtn}
            activeOpacity={0.8}
            onPress={() => setManageVacanciesJob(item)}
          >
            <Briefcase size={13} color="#0284C7" />
            <Text style={styles.vacanciesPillText}>
              {filledVacancies} / {totalVacancies} Vacancies
            </Text>
          </TouchableOpacity>

          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={styles.actionIconButton}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('PostTab', { jobId: item.id });
              }}
            >
              <Edit3 size={15} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionIconButton, styles.deleteBtn]}
              activeOpacity={0.7}
              onPress={() => handleDeleteJob(item.id, item.title)}
            >
              <Trash2 size={15} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      {/* Filter Tabs Bar - Clean Blue Segmented Control */}
      <View style={styles.tabsBarWrapper}>
        <View style={styles.segmentedTrackContainer}>
          {[
            { key: 'ALL', label: 'All Jobs', count: jobs.length },
            { key: 'APPROVED', label: 'Active', count: approvedCount },
            { key: 'PENDING_REVIEW', label: 'Pending', count: pendingCount },
            { key: 'REJECTED', label: 'Rejected', count: rejectedCount },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.key as FilterTab)}
                style={[styles.segmentedTabBtn, isSelected && styles.segmentedTabBtnActive]}
              >
                <Text style={[styles.segmentedTabText, isSelected && styles.segmentedTabTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {error ? <ErrorBanner message={error} onRetry={fetchJobs} style={{ marginHorizontal: SPACING.lg }} /> : null}

      {loading ? (
        <View style={{ padding: SPACING.lg }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No Job Postings Found"
          description={
            activeTab === 'ALL'
              ? 'You have not created any job postings yet.'
              : `No jobs currently found under the "${activeTab === 'PENDING_REVIEW' ? 'Pending Approval' : activeTab}" filter.`
          }
          actionTitle="Create Job Post"
          onAction={() => navigation.navigate('PostJob')}
        />
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      )}

      {/* Live Vacancy Adjustment Modal */}
      <ManageVacanciesModal
        visible={!!manageVacanciesJob}
        job={manageVacanciesJob}
        onClose={() => setManageVacanciesJob(null)}
        onSuccess={(updatedJob) => {
          setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  addHeaderBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  /* Pure White Borderless Tab Bar Styles */
  tabsBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  segmentedTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  segmentedTabBtn: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentedTabBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  segmentedTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentedTabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 14,
    paddingBottom: 130,
  },
  jobCard3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyLogoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  jobTitleText: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    flex: 1,
  },
  companyNameText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  pendingCardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  pendingNoticeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  applicantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    flex: 1,
  },
  applicantBtnText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  vacanciesPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },
  vacanciesPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  locationIndustryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  industryTagPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  industryTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaInlineText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: '#64748B',
  },
});
