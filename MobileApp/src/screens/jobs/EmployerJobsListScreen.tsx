import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  FlatList,
  ScrollView,
  Image,
  Alert,
  Platform,
  StatusBar,
  Share,
} from 'react-native';
import {
  Plus,
  Users,
  Edit3,
  Trash2,
  Share2,
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
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { ManageVacanciesModal } from '../../components/jobs/ManageVacanciesModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { SuccessModal } from '../../components/common/SuccessModal';
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
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#FFFFFF', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(false);
      }
      fetchJobs();
    }, [fetchJobs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState<{
    visible: boolean;
    jobId: string;
    jobTitle: string;
  }>({
    visible: false,
    jobId: '',
    jobTitle: '',
  });
  const [deleting, setDeleting] = useState(false);

  const [successModalConfig, setSuccessModalConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
  }>({
    visible: false,
    title: '',
  });

  const handleDeleteJob = (id: string, title: string) => {
    setDeleteConfirmConfig({
      visible: true,
      jobId: id,
      jobTitle: title,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmConfig.jobId) return;
    setDeleting(true);
    try {
      await jobsApi.deleteJob(deleteConfirmConfig.jobId);
      setJobs((prev) => prev.filter((j) => j.id !== deleteConfirmConfig.jobId));
      setDeleteConfirmConfig({ visible: false, jobId: '', jobTitle: '' });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete job posting.');
    } finally {
      setDeleting(false);
    }
  };

  const handleShareJob = async (job: Job) => {
    const jobUrl = `https://jobmarket.in/job/${job.id}`;
    const locationStr = job.location || (job as any).midcZone || 'MIDC Industrial Area';

    const salMin = job.salary_min ?? job.salaryMin ?? (job as any).salary_min;
    const salMax = job.salary_max ?? job.salaryMax ?? (job as any).salary_max;
    let salStr = 'Salary Undisclosed';
    if (salMin && salMax) {
      salStr = `₹${Number(salMin).toLocaleString('en-IN')} - ₹${Number(salMax).toLocaleString('en-IN')}`;
    } else if (salMin || salMax) {
      salStr = `₹${Number(salMin || salMax).toLocaleString('en-IN')}`;
    }

    const shareMsg = `🔥 Open Industrial Job Role!\n\n📋 Role: ${job.title}\n🏢 Company: ${job.company || 'JobMarket'}\n📍 Location: ${locationStr}\n💰 Salary: ${salStr}\n\n👉 Apply / View Details:\n${jobUrl}`;
    const shareTitle = `Job Opportunity: ${job.title} at ${job.company || 'JobMarket'}`;

    try {
      if (Platform.OS === 'ios') {
        await Share.share({ title: shareTitle, message: shareMsg, url: jobUrl });
      } else {
        await Share.share({ title: shareTitle, message: shareMsg }, { dialogTitle: shareTitle });
      }
    } catch (err: any) {
      console.warn('Share error:', err);
    }
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
      salaryStr = `₹${Number(salMin).toLocaleString('en-IN')} - ₹${Number(salMax).toLocaleString('en-IN')}`;
    } else if (salMin || salMax) {
      salaryStr = `₹${Number(salMin || salMax).toLocaleString('en-IN')}`;
    }

    const totalVacancies = item.openings ?? (item as any).openings ?? 1;
    const filledVacancies = item.filledOpenings ?? (item as any).filled_openings ?? (item as any).filledOpenings ?? 0;
    const actualApplicantCount = typeof (item as any).applicants_count === 'number'
      ? (item as any).applicants_count
      : (typeof (item as any).applicantsCount === 'number'
          ? (item as any).applicantsCount
          : (Array.isArray((item as any).applicants) ? (item as any).applicants.length : 0));

    const locationText = item.location || (item as any).midcZone || 'MIDC Area';
    const tradeText = (item as any).tradeSpecialization || (item as any).trade_specialization || item.industry;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          navigation.navigate('ApplicantsTab', { jobId: item.id, jobTitle: item.title });
        }}
        style={styles.jobCard3D}
      >
        {/* Header Row with Logo, Title & Status */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.companyLogoBox}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.companyLogoImage} resizeMode="cover" />
            ) : (
              <Building2 size={18} color="#1764E8" strokeWidth={2} />
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
              {item.company}{tradeText ? ` • ${tradeText}` : ''}
            </Text>
          </View>
        </View>

        {/* Chips / Meta Details Row */}
        <View style={styles.metaChipsRow}>
          <View style={styles.metaChip}>
            <MapPin size={11} color="#657796" />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{salaryStr}</Text>
          </View>
          {item.job_type || item.jobType || (item as any).type ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{item.job_type || item.jobType || (item as any).type}</Text>
            </View>
          ) : null}
        </View>

        {isRejectedStatus(item.status) ? (
          <View style={styles.rejectedNoticeBanner}>
            <XCircle size={12} color="#DC2626" />
            <Text style={styles.rejectedNoticeBannerText}>
              Job Rejected — {(item as any).rejectReason || (item as any).reject_reason || 'Does not meet posting requirements.'}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardRowDivider} />

        {/* Action Footer Bar */}
        <View style={styles.cardFooterInline}>
          <View style={styles.footerLeftPills}>
            <TouchableOpacity
              style={styles.applicantPillBtn}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('ApplicantsTab', { jobId: item.id, jobTitle: item.title });
              }}
            >
              <Users size={13} color="#475569" strokeWidth={2} />
              <Text style={styles.applicantPillText}>
                {actualApplicantCount} {actualApplicantCount === 1 ? 'Applicant' : 'Applicants'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.vacanciesPillBtn}
              activeOpacity={0.7}
              onPress={() => setManageVacanciesJob(item)}
            >
              <Briefcase size={12} color="#475569" strokeWidth={2} />
              <Text style={styles.vacanciesPillText}>
                {filledVacancies}/{totalVacancies} Vacancies
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsGroupInline}>
            <TouchableOpacity
              style={styles.actionBtnSmall}
              activeOpacity={0.7}
              onPress={() => handleShareJob(item)}
            >
              <Share2 size={13} color="#475569" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSmall}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('PostTab', { jobId: item.id });
              }}
            >
              <Edit3 size={13} color="#475569" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtnSmall, styles.deleteBtnSmall]}
              activeOpacity={0.7}
              onPress={() => handleDeleteJob(item.id, item.title)}
            >
              <Trash2 size={13} color="#EF4444" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <Header title="JobMarket" subtitle="Manage Jobs" showBack={false} />

      {/* Filter Tabs Bar - Industry Grade LinkedIn / iPhone Underline Tab Navigation */}
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
          setSuccessModalConfig({
            visible: true,
            title: 'Your Job Details Updated Successfully !',
          });
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={deleteConfirmConfig.visible}
        title="Delete Job Role"
        message={`Are you sure you want to delete "${deleteConfirmConfig.jobTitle}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        iconBgColor="#FEE2E2"
        icon={<Trash2 size={26} color="#DC2626" />}
        loading={deleting}
        onClose={() => setDeleteConfirmConfig({ visible: false, jobId: '', jobTitle: '' })}
        onConfirm={handleConfirmDelete}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={successModalConfig.visible}
        title={successModalConfig.title}
        message={successModalConfig.message}
        onClose={() => setSuccessModalConfig({ visible: false, title: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  /* Industry Grade Status Filter Bar */
  tabsBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
    paddingTop: 4,
    paddingBottom: 0,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  industryTabPill: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingHorizontal: 2,
    marginBottom: -1,
  },
  industryTabPillActive: {
    backgroundColor: 'transparent',
    borderBottomColor: '#1764E8',
  },
  industryTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#657796',
  },
  industryTabTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountBadgeActive: {
    backgroundColor: '#EEF4FF',
  },
  tabCountText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#657796',
  },
  tabCountTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 130,
  },
  jobCard3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
    fontSize: 13.5,
    fontWeight: '700',
    color: '#102A5C',
    letterSpacing: -0.2,
    flex: 1,
  },
  companyNameText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#657796',
    marginTop: 1.5,
  },
  metaChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  metaChipText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#657796',
  },
  pendingNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
  },
  pendingNoticeBannerText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#B45309',
    flex: 1,
  },
  rejectedNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
  },
  rejectedNoticeBannerText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#B91C1C',
    flex: 1,
  },
  cardRowDivider: {
    height: 1,
    backgroundColor: '#E7EBF2',
    marginVertical: 9,
  },
  cardFooterInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  footerLeftPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  applicantPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingRight: 6,
  },
  applicantPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  vacanciesPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  vacanciesPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  actionsGroupInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnSmall: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
});
