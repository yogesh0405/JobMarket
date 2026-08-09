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
              <Building2 size={22} color={COLORS.primary} />
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
              {item.company}
            </Text>

            <View style={styles.locationIndustryRow}>
              {item.industry ? (
                <View style={styles.industryTagPill}>
                  <Text style={styles.industryTagText}>{item.industry}</Text>
                </View>
              ) : null}

              <View style={styles.metaInline}>
                <MapPin size={12} color={COLORS.slate500} />
                <Text style={styles.metaInlineText} numberOfLines={1}>
                  {item.location || 'Location Not Set'}
                </Text>
              </View>
            </View>
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

        {/* Salary & Openings Bar */}
        <View style={styles.detailsRow}>
          <View style={styles.salaryTag}>
            <Text style={styles.salaryLabel}>SALARY</Text>
            <Text style={styles.salaryText}>
              {salaryStr}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.openingsTag}
            activeOpacity={0.8}
            onPress={() => setManageVacanciesJob(item)}
          >
            <Briefcase size={13} color={COLORS.primary} />
            <Text style={styles.openingsText}>
              {filledVacancies} / {totalVacancies} Vacancies
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Footer Bar */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.applicantBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('JobApplicants', { jobId: item.id, jobTitle: item.title })}
          >
            <Users size={15} color={COLORS.primary} />
            <Text style={styles.applicantBtnText}>
              {actualApplicantCount} {actualApplicantCount === 1 ? 'Candidate' : 'Candidates'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={styles.adjustVacanciesBtn}
              activeOpacity={0.8}
              onPress={() => setManageVacanciesJob(item)}
            >
              <Briefcase size={13} color="#0284C7" />
              <Text style={styles.adjustVacanciesBtnText}>Adjust Vacancies</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconButton}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('PostTab', { jobId: item.id });
              }}
            >
              <Edit3 size={16} color={COLORS.slate600} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionIconButton, styles.deleteBtn]}
              activeOpacity={0.7}
              onPress={() => handleDeleteJob(item.id, item.title)}
            >
              <Trash2 size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      {/* Filter Tabs Bar - Industry Grade */}
      <View style={styles.tabsBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
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
                style={[styles.industryTabPill, isSelected && styles.industryTabPillActive]}
              >
                <Text style={[styles.industryTabText, isSelected && styles.industryTabTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabCountBadge, isSelected && styles.tabCountBadgeActive]}>
                  <Text style={[styles.tabCountText, isSelected && styles.tabCountTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  /* Industry Grade Tab Bar Styles */
  tabsBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 7,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  industryTabPill: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  industryTabPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    borderBottomWidth: 2.5,
    borderBottomColor: '#1E40AF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 3,
  },
  industryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  industryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  tabCountTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 130,
  },
  jobCard3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm + 2,
    marginBottom: SPACING.xs + 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
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
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.slate900,
    flex: 1,
  },
  companyNameText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.slate600,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  tradeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tradeBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  locationText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.slate500,
  },
  pendingCardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 6,
  },
  pendingNoticeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },
  salaryTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    flex: 1,
  },
  salaryLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.slate400,
    letterSpacing: 0.5,
  },
  salaryText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  openingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
  },
  openingsText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  applicantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    flex: 1,
  },
  applicantBtnText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  adjustVacanciesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  adjustVacanciesBtnText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  actionIconButton: {
    width: 28,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  industryTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaInlineText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: COLORS.slate500,
  },
});
