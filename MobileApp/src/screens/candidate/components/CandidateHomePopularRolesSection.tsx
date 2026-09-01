import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Briefcase,
  MapPin,
  Bookmark,
  ArrowRight,
} from 'lucide-react-native';
import { Job } from '../../../types';
import { COLORS, RADIUS } from '../../../constants/theme';
import { Skeleton as SkeletonLoader } from '../../../components/common/SkeletonLoader';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { RoleTabItem } from './CandidateHomeConstants';

interface CandidateHomePopularRolesSectionProps {
  roleTabsList: RoleTabItem[];
  activeRoleTab: string;
  setActiveRoleTab: (id: string) => void;
  getRoleJobCount: (tabId: string, keyword: string) => number;
  loading: boolean;
  roleFilteredJobs: Job[];
  savedJobIds: string[];
  handleToggleSave: (jobId: string) => void;
  navigation: any;
}

export const CandidateHomePopularRolesSection: React.FC<CandidateHomePopularRolesSectionProps> = ({
  roleTabsList,
  activeRoleTab,
  setActiveRoleTab,
  getRoleJobCount,
  loading,
  roleFilteredJobs,
  savedJobIds,
  handleToggleSave,
  navigation,
}) => {
  return (
    <View style={styles.standaloneSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleTabsRowContainer}>
        {roleTabsList.map((tab) => {
          const isActive = activeRoleTab === tab.id;
          const count = getRoleJobCount(tab.id, tab.keyword);
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              style={[styles.skewedTabPill, isActive ? styles.skewedTabPillActive : styles.skewedTabPillInactive]}
              onPress={() => setActiveRoleTab(tab.id)}
            >
              <View style={styles.unskewContentRow}>
                <Text style={[styles.tabDot, isActive && styles.tabDotActive]}>•</Text>
                <Text style={[styles.tabTitleText, isActive && styles.tabTitleTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.countPillBadge, isActive ? styles.countPillBadgeActive : styles.countPillBadgeInactive]}>
                  <Text style={[styles.countPillText, isActive ? styles.countPillTextActive : styles.countPillTextInactive]}>
                    {count}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <SkeletonLoader width="100%" height={160} style={{ borderRadius: 10, marginTop: 12 }} />
      ) : roleFilteredJobs.length === 0 ? (
        <View style={styles.emptyRoleBox}>
          <Text style={styles.emptyRoleText}>No vacancies under "{activeRoleTab}" currently.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularCardsCarousel}>
          {roleFilteredJobs.slice(0, 8).map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const minExp = job.min_experience ?? (job as any).minExperience ?? 0;
            const maxExp = job.max_experience ?? (job as any).maxExperience ?? 2;
            const expStr = minExp === maxExp ? `${minExp} Yrs` : `${minExp}-${maxExp} Yrs`;

            let salaryStr = '3-5 Lacs';
            const sMin = job.salary_min ?? (job as any).salaryMin;
            const sMax = job.salary_max ?? (job as any).salaryMax;
            if (sMin && sMax) {
              if (sMin >= 100000) {
                salaryStr = `${(sMin / 100000).toFixed(0)}-${(sMax / 100000).toFixed(0)} Lacs`;
              } else {
                salaryStr = `${Math.round(sMin / 1000)}k-${Math.round(sMax / 1000)}k`;
              }
            }

            return (
              <TouchableOpacity
                key={job.id}
                activeOpacity={0.9}
                style={styles.webPopularJobCard}
                onPress={() =>
                  navigation.navigate('CandidateJobsTab', {
                    screen: 'CandidateJobDetail',
                    params: { jobId: job.id, job: job },
                  })
                }
              >
                <View style={styles.webCardTitleRow}>
                  <Text style={styles.webCardTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.webBookmarkBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleSave(job.id);
                    }}
                  >
                    <Bookmark
                      size={18}
                      color={isSaved ? COLORS.primary : '#94A3B8'}
                      fill={isSaved ? COLORS.primary : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.webLocRow}>
                  <MapPin size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <Text style={styles.webLocText} numberOfLines={1} ellipsizeMode="tail">
                    {job.location || 'Chhatrapati Sambhajinagar'}
                  </Text>
                </View>

                <View style={styles.webSpecsRow}>
                  <Briefcase size={13} color="#94A3B8" />
                  <Text style={styles.webSpecsText}>
                    {expStr}   |   ₹ {salaryStr}
                  </Text>
                </View>

                <View style={styles.webBadgesRow}>
                  <View style={styles.webBadgeGray}>
                    <Text style={styles.webBadgeGrayText}>
                      {job.work_mode || (job as any).workMode || 'Onsite'}
                    </Text>
                  </View>

                  <View style={styles.webBadgeGray}>
                    <Text style={styles.webBadgeGrayText}>
                      {job.job_type || (job as any).jobType || 'Full-Time'}
                    </Text>
                  </View>
                </View>

                <View style={styles.webCardDivider} />

                <View style={styles.webCompanyFooter}>
                  <CompanyLogoAvatar
                    logoUrl={
                      job.companyLogo ||
                      (job as any).company_logo ||
                      (job as any).logoUrl ||
                      (job as any).logo_url ||
                      (job as any).logo ||
                      (job as any).employer_logo ||
                      (job as any).avatar_url ||
                      (job as any).avatar
                    }
                    companyName={job.company || (job as any).company_name || (job as any).companyName || 'Industrial Company'}
                    size={38}
                    borderRadius={6}
                  />

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.webCompanyTitle} numberOfLines={1}>
                      {job.company || (job as any).company_name || (job as any).companyName || 'Industrial Company'}
                    </Text>
                    <Text style={styles.webPostedByText} numberOfLines={1}>
                      Posted by {job.company || (job as any).company_name || 'Recruiter'}
                    </Text>
                  </View>

                  <Text style={styles.webDurationText}>1d ago</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.exploreMoreEndCard}
            onPress={() => {
              const kw = activeRoleTab !== 'All Opportunities' ? activeRoleTab : undefined;
              navigation.navigate('CandidateJobsTab', {
                screen: 'CandidateJobSearch',
                params: {
                  keyword: kw,
                  rawFilterTitle: kw,
                },
              });
            }}
          >
            <View style={styles.exploreMoreCircleIcon}>
              <ArrowRight size={22} color={COLORS.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.exploreMoreTitleText}>Explore All Roles</Text>
            <Text style={styles.exploreMoreSubText}>View full catalog of live vacancies</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  standaloneSection: {
    marginVertical: 12,
  },
  popularHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  popularIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  popularSubtext: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  roleTabsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  skewedTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  skewedTabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  skewedTabPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  unskewContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabDot: {
    fontSize: 14,
    color: '#94A3B8',
  },
  tabDotActive: {
    color: '#FFFFFF',
  },
  tabTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  tabTitleTextActive: {
    color: '#FFFFFF',
  },
  countPillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countPillBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countPillBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  countPillTextActive: {
    color: '#FFFFFF',
  },
  countPillTextInactive: {
    color: '#64748B',
  },
  emptyRoleBox: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  emptyRoleText: {
    fontSize: 13,
    color: '#64748B',
  },
  popularCardsCarousel: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  webPopularJobCard: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  webCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  webCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  webBookmarkBtn: {
    padding: 2,
  },
  webLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  webLocText: {
    fontSize: 12,
    color: '#64748B',
  },
  webSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  webSpecsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  webBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  webBadgeGray: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  webBadgeGrayText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  webShiftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    marginTop: 8,
  },
  webShiftText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B21A8',
  },
  webCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  webCompanyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  webCompanyTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  webPostedByText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  webDurationText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  exploreMoreEndCard: {
    width: 140,
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  exploreMoreCircleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exploreMoreTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  exploreMoreSubText: {
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
});
