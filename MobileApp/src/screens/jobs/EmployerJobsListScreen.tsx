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
  DeviceEventEmitter,
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
  AlertTriangle,
  Banknote,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi } from '../../api/jobsApi';
import { applicantsApi } from '../../api/applicantsApi';
import { Job } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { formatTimeAgo } from '../candidate/components/CandidateJobSearchUtils';
import { shareJob } from '../../utils/shareUtils';
import { Header } from '../../components/common/Header';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { ManageVacanciesModal } from '../../components/jobs/ManageVacanciesModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { SuccessModal } from '../../components/common/SuccessModal';
import { appliedJobsStore } from '../../utils/appliedJobsStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
}

type FilterTab = 'ALL' | 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';

export const EmployerJobsListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobApplicantCounts, setJobApplicantCounts] = useState<Record<string, number>>({});
  const [manageVacanciesJob, setManageVacanciesJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setError(null);
    try {
      const [res, appsRes] = await Promise.all([
        jobsApi.getMyJobs().catch(() => ({ success: false, data: [] } as any)),
        applicantsApi.getAllApplicants().catch(() => ({ success: false, data: [] } as any)),
      ]);

      const counts: Record<string, number> = {};
      const allApps = Array.isArray(appsRes)
        ? appsRes
        : Array.isArray(appsRes?.data)
        ? appsRes.data
        : [];
      allApps.forEach((a: any) => {
        const jid = String(a.jobId || a.job_id || a.job?.id || '').toLowerCase().trim().replace(/^job-/i, '');
        if (jid) {
          counts[jid] = (counts[jid] || 0) + 1;
        }
      });
      setJobApplicantCounts(counts);

      const jobsData = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray((res as any)?.data?.jobs)
        ? (res as any).data.jobs
        : [];
      setJobs(jobsData);
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
      DeviceEventEmitter.emit('JOB_DELETED');
      setJobs((prev) => prev.filter((j) => j.id !== deleteConfirmConfig.jobId));
      setDeleteConfirmConfig({ visible: false, jobId: '', jobTitle: '' });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete job posting.');
    } finally {
      setDeleting(false);
    }
  };

  const handleShareJob = async (job: Job) => {
    await shareJob({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location || (job as any).midcZone,
      salaryMin: job.salary_min ?? job.salaryMin,
      salaryMax: job.salary_max ?? job.salaryMax,
    });
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
    if (activeTab === 'APPROVED' && !isApprovedStatus(j.status)) return false;
    if (activeTab === 'PENDING_REVIEW' && !isPendingStatus(j.status)) return false;
    if (activeTab === 'REJECTED' && !isRejectedStatus(j.status)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const title = (j.title || '').toLowerCase();
      const trade = (j.trade || (j as any).trade_specialization || '').toLowerCase();
      const location = (j.location || '').toLowerCase();
      const category = ((j as any).category || (j as any).industry || '').toLowerCase();
      const skills = Array.isArray(j.skills) ? j.skills.join(' ').toLowerCase() : ((j.skills as any) || '').toLowerCase();
      return title.includes(q) || trade.includes(q) || location.includes(q) || category.includes(q) || skills.includes(q);
    }

    return true;
  });

  const pendingCount = jobs.filter((j) => isPendingStatus(j.status)).length;
  const approvedCount = jobs.filter((j) => isApprovedStatus(j.status)).length;
  const rejectedCount = jobs.filter((j) => isRejectedStatus(j.status)).length;

  const renderJobItem = ({ item }: { item: Job }) => {
    const pending = isPendingStatus(item.status);
    const logoUri =
      item.companyLogo ||
      (item as any).company_logo ||
      (item as any).logoUrl ||
      (item as any).logo_url ||
      (item as any).logo ||
      user?.companyLogo ||
      user?.company_logo;

    const isExpNotRequired = item.experience_required === false || (item as any).experienceRequired === false;
    const minExp = item.min_experience ?? (item as any).minExperience;
    const maxExp = item.max_experience ?? (item as any).maxExperience;
    const isFresher = isExpNotRequired || (minExp === 0 && (maxExp === 0 || maxExp === undefined || maxExp === null));
    const expText =
      isFresher
        ? 'Fresher'
        : minExp !== undefined && maxExp !== undefined
        ? `${minExp}-${maxExp} Yrs Exp`
        : minExp !== undefined
        ? `${minExp}+ Yrs Exp`
        : 'Fresher';

    const salMin = item.salary_min ?? item.salaryMin ?? (item as any).salary_min ?? (item as any).salaryMin;
    const salMax = item.salary_max ?? item.salaryMax ?? (item as any).salary_max ?? (item as any).salaryMax;

    let salaryStr = 'Undisclosed';
    if (salMin && salMax) {
      if (salMin >= 100000) {
        salaryStr = `${(salMin / 100000).toFixed(1)}-${(salMax / 100000).toFixed(1)} Lacs PA`;
      } else {
        salaryStr = `₹${Number(salMin).toLocaleString('en-IN')} - ₹${Number(salMax).toLocaleString('en-IN')}`;
      }
    } else if (salMin || salMax) {
      const val = salMin || salMax;
      salaryStr = val >= 100000 ? `₹${(val / 100000).toFixed(1)} Lacs PA` : `₹${Number(val).toLocaleString('en-IN')}`;
    }

    const totalVacancies = item.openings ?? (item as any).openings ?? 1;
    const filledVacancies = item.filledOpenings ?? (item as any).filled_openings ?? (item as any).filledOpenings ?? 0;
    const storeAppsCount = appliedJobsStore
      .getAppliedJobs()
      .filter(
        (a) => String(a.jobId || a.job?.id).toLowerCase() === String(item.id).toLowerCase()
      ).length;
    const rawApps = (item as any).applicants || (item as any).applications;
    const parsedApps = Array.isArray(rawApps)
      ? rawApps
      : typeof rawApps === 'string' && rawApps.trim()
      ? (() => { try { const p = JSON.parse(rawApps); return Array.isArray(p) ? p : []; } catch { return []; } })()
      : [];
    const directApiCount = jobApplicantCounts[String(item.id).toLowerCase().trim().replace(/^job-/i, '')] || 0;
    const backendApplicantCount =
      typeof (item as any).applicants_count === 'number' && (item as any).applicants_count > 0
        ? (item as any).applicants_count
        : typeof (item as any).applicantsCount === 'number' && (item as any).applicantsCount > 0
        ? (item as any).applicantsCount
        : Math.max(parsedApps.length, directApiCount);
    const actualApplicantCount = Math.max(backendApplicantCount, storeAppsCount);

    const locationText = item.location || (item as any).midcZone || (item as any).city || 'MIDC Area';
    const companyName = item.company || (item as any).company_name || user?.companyName || 'Company';
    const tradeText = (item as any).tradeSpecialization || (item as any).trade_specialization || item.industry;
    const jobType = item.job_type || item.jobType || (item as any).type || 'Full-time';
    const workMode = item.work_mode || (item as any).workMode || (item as any).shift || 'On-site';
    const timeText = formatTimeAgo(item.posted_at || (item as any).postedAt || (item as any).created_at || (item as any).createdAt);

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          navigation.navigate('CandidateJobDetail', {
            jobId: item.id,
            job: item,
          });
        }}
        style={styles.workJobCard}
      >
        {/* Top Section: Logo, Title, Company + Trade, Status Badge */}
        <View style={styles.workJobTopSection}>
          <View style={styles.workJobTitleRow}>
            <CompanyLogoAvatar
              logoUrl={logoUri}
              companyName={companyName}
              size={42}
              borderRadius={8}
            />

            <View style={styles.workJobHeaderCol}>
              <Text style={styles.workJobTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.workJobCompanyText} numberOfLines={1}>
                {companyName}{tradeText ? ` • ${tradeText}` : ''}
              </Text>
            </View>

            <Badge
              status={item.status}
              style={isRejectedStatus(item.status) ? styles.rejectedBadgeClean : undefined}
            />
          </View>

          {/* Specs Row: Experience | Salary | Location */}
          <View style={styles.workJobSpecsRow}>
            <View style={styles.workJobSpecItem}>
              <Briefcase size={12.5} color="#64748B" />
              <Text style={styles.workJobSpecText}>{expText}</Text>
            </View>

            <Text style={styles.workJobDivider}>|</Text>

            <View style={styles.workJobSpecItem}>
              <Text style={styles.workJobRupeeText}>₹</Text>
              <Text style={styles.workJobSpecText}>{salaryStr}</Text>
            </View>

            <Text style={styles.workJobDivider}>|</Text>

            <View style={[styles.workJobSpecItem, { flex: 1, minWidth: 0 }]}>
              <MapPin size={12.5} color="#64748B" style={{ flexShrink: 0 }} />
              <Text style={[styles.workJobSpecText, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                {locationText}
              </Text>
            </View>
          </View>
        </View>

        {/* Middle Section: Job Type, Work Mode, Time Ago */}
        <View style={styles.workJobMiddleSection}>
          <View style={styles.workJobSpecItem}>
            <Clock size={12} color="#64748B" />
            <Text style={styles.workJobSimpleText}>{jobType}</Text>
          </View>

          <View style={styles.workJobSpecItem}>
            <Building2 size={12} color="#64748B" />
            <Text style={styles.workJobSimpleText}>{workMode}</Text>
          </View>

          <View style={{ flex: 1 }} />

          <Text style={styles.workJobTimeAgoText}>
            {timeText}
          </Text>
        </View>

        {/* Rejection / Changes Requested Notice Banner */}
        {((item.status || '').toUpperCase() === 'REJECTED' || (item as any).dbStatus === 'REJECTED') && (
          <View style={styles.rejectedNoticeBanner}>
            <AlertTriangle size={13} color="#DC2626" strokeWidth={2.4} />
            <Text style={styles.rejectedNoticeBannerText} numberOfLines={2}>
              <Text style={{ fontWeight: '700' }}>Admin Remark: </Text>
              {(item as any).rejectReason || (item as any).reject_reason || (item as any).rejection_reason || 'Listing was rejected during moderation. Click Edit & Resubmit to review notes and update.'}
            </Text>
          </View>
        )}

        {/* Bottom Section: Employer Action Footer */}
        <View style={styles.workJobBottomSection}>
          <View style={styles.footerLeftPills}>
            <TouchableOpacity
              style={styles.applicantPillBtn}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('JobApplicants', { jobId: item.id, jobTitle: item.title });
              }}
            >
              <Users size={12.5} color="#1764E8" strokeWidth={2} />
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

          {isRejectedStatus(item.status) || (item.status || '').toLowerCase() === 'unpublished' || (item.status || '').toLowerCase() === 'draft' ? (
            <TouchableOpacity
              style={styles.resubmitBtn}
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate('JobPost', { jobId: item.id, job: item });
              }}
            >
              <Edit3 size={12} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.resubmitBtnText}>Edit & Resubmit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionsGroupInline}>
              <TouchableOpacity
                style={styles.actionBtnSmall}
                activeOpacity={0.7}
                onPress={() => handleShareJob(item)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Share2 size={13} color="#475569" strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnSmall}
                activeOpacity={0.7}
                onPress={() => {
                  navigation.navigate('PostTab', { jobId: item.id });
                }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Edit3 size={13} color="#475569" strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtnSmall, styles.deleteBtnSmall]}
                activeOpacity={0.7}
                onPress={() => handleDeleteJob(item.id, item.title)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Trash2 size={13} color="#EF4444" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        searchPlaceholder="Search Jobs"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showBack={false}
        hideVoice={true}
      />

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
  workJobCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  workJobTopSection: {
    padding: 14,
  },
  workJobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  workJobHeaderCol: {
    flex: 1,
    justifyContent: 'center',
  },
  workJobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.15,
  },
  workJobCompanyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  workJobSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  workJobSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workJobRupeeText: {
    fontWeight: '700',
    color: '#64748B',
    fontSize: 12,
  },
  workJobSpecText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  workJobDivider: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  workJobMiddleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  workJobSimpleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  workJobTimeAgoText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  rejectedNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rejectedNoticeBannerText: {
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
  },
  rejectedBadgeClean: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  workJobBottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  footerLeftPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  applicantPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
  },
  applicantPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1764E8',
  },
  vacanciesPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
  },
  vacanciesPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  actionsGroupInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnSmall: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnSmall: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  resubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1764E8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#1764E8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  resubmitBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
