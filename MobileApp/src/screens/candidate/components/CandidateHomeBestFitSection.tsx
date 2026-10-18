import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
  Share,
} from 'react-native';
import {
  Briefcase,
  MapPin,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Check,
  Building2,
  Calendar,
  Share2,
  Award,
} from 'lucide-react-native';
import { Job } from '../../../types';
import { COLORS, RADIUS } from '../../../constants/theme';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { Skeleton as SkeletonLoader } from '../../../components/common/SkeletonLoader';
import { useAuth } from '../../../hooks/useAuth';
import { matchJobAgainstKeyword } from '../utils/jobMatchUtils';
import { appliedJobsStore } from '../../../utils/appliedJobsStore';
import { formatTimeAgo } from './CandidateJobSearchUtils';

interface CandidateHomeBestFitSectionProps {
  jobs: Job[];
  loading: boolean;
  savedJobIds: string[];
  handleToggleSave: (jobId: string) => void;
  navigation: any;
}

interface ScoredJob {
  job: Job;
  score: number;
  matchPercentage: number;
  matchedSkills: string[];
  matchBadgeText: string;
}

const STOP_WORDS = /^(operator|operation|operating|operations|technician|worker|engineer|engineering|supervisor|helper|senior|junior|specialist|assistant|executive|line|machine|machinery|heavy|level|grade|trainee|fresher|lead|head|staff|manager|management|general|skill|skills|shop|floor)$/i;

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesWord(text: string, word: string): boolean {
  if (!text || !word) return false;
  const w = word.trim().toLowerCase();
  if (w.length < 2) return false;
  try {
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escapeRegex(w)}([^a-zA-Z0-9]|$)`, 'i');
    return regex.test(text);
  } catch {
    return text.toLowerCase().includes(w);
  }
}

export const CandidateHomeBestFitSection: React.FC<CandidateHomeBestFitSectionProps> = ({
  jobs,
  loading,
  savedJobIds,
  handleToggleSave,
  navigation,
}) => {
  const { user, refreshUser } = useAuth();
  const [profileRefreshTick, setProfileRefreshTick] = useState(0);
  const [appliedTick, setAppliedTick] = useState(0);

  // Subscribe to profile updates and applied jobs store, and refresh profile on mount
  useEffect(() => {
    refreshUser().catch(() => {});
    const subProfile = DeviceEventEmitter.addListener('USER_PROFILE_UPDATED', () => {
      refreshUser().catch(() => {});
      setProfileRefreshTick((prev) => prev + 1);
    });
    const subApplied = appliedJobsStore.subscribe(() => {
      setAppliedTick((prev) => prev + 1);
    });
    return () => {
      subProfile.remove();
      subApplied();
    };
  }, [refreshUser]);

  // 1. Candidate Primary Trade & Category
  const primaryTrade = useMemo(() => {
    const trade =
      user?.tradeSpecialization ||
      (user as any)?.trade_specialization ||
      (user as any)?.trade ||
      (user as any)?.headline ||
      (user as any)?.industry ||
      '';
    return typeof trade === 'string' ? trade.trim() : '';
  }, [
    user?.tradeSpecialization,
    (user as any)?.trade_specialization,
    (user as any)?.trade,
    (user as any)?.headline,
    (user as any)?.industry,
    profileRefreshTick,
  ]);

  // 2. Candidate Skills
  const candidateSkills = useMemo(() => {
    let rawSkills = user?.skills || (user as any)?.keySkills || (user as any)?.skills_list || [];
    if (typeof rawSkills === 'string') {
      rawSkills = rawSkills.split(',').map((s: string) => s.trim());
    }
    if (!Array.isArray(rawSkills)) return [];
    return rawSkills
      .map((s: any) => (typeof s === 'string' ? s.trim() : (s?.name || s?.title || '')))
      .filter((s: string) => s.length >= 2);
  }, [user?.skills, (user as any)?.keySkills, (user as any)?.skills_list, profileRefreshTick]);

  const hasCandidateProfile = Boolean(primaryTrade || candidateSkills.length > 0);

  // 3. Precision Matching & Scoring Algorithm
  const bestFitJobs = useMemo<ScoredJob[]>(() => {
    if (!jobs || jobs.length === 0) return [];

    const tradeClean = primaryTrade.toLowerCase();
    const tradeTokens = tradeClean
      .split(/[\s/&,()+-.]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && !STOP_WORDS.test(t));

    const scoredList = jobs.map((job) => {
      let score = 0;
      let tradeMatched = false;
      const matchedSkills: string[] = [];

      const title = (job.title || '').toLowerCase();
      const trade = (job.trade || '').toLowerCase();
      const industry = (job.industry || '').toLowerCase();
      const desc = (job.description || '').toLowerCase();
      const jobSkills = Array.isArray(job.skills) ? job.skills.map((s) => (s || '').toLowerCase()) : [];
      const jobSkillsText = jobSkills.join(' ');
      const allJobText = `${title} ${trade} ${industry} ${jobSkillsText} ${desc}`;

      // A. Primary Trade Direct & Token Match
      if (tradeClean) {
        if (trade && (trade === tradeClean || trade.includes(tradeClean) || tradeClean.includes(trade))) {
          score += 70;
          tradeMatched = true;
        } else if (title && (title.includes(tradeClean) || tradeClean.includes(title))) {
          score += 60;
          tradeMatched = true;
        }

        tradeTokens.forEach((token) => {
          if (matchesWord(trade, token)) {
            score += 35;
            tradeMatched = true;
          } else if (matchesWord(title, token)) {
            score += 30;
            tradeMatched = true;
          } else if (matchesWord(jobSkillsText, token)) {
            score += 20;
            tradeMatched = true;
          } else if (matchesWord(desc, token)) {
            score += 15;
            tradeMatched = true;
          }
        });
      }

      // B. Candidate Skills Matching (word boundary to prevent substring false-positives)
      candidateSkills.forEach((cSkill) => {
        const inSkills = jobSkills.some((js) => matchesWord(js, cSkill));
        const inText = matchesWord(allJobText, cSkill);

        if (inSkills || inText) {
          if (!matchedSkills.includes(cSkill)) {
            matchedSkills.push(cSkill);
            score += 25;
          }
        }
      });

      // C. Industry / Sector Match (bonus tie-breaker)
      if (user?.industry) {
        const uInd = user.industry.toLowerCase();
        if (matchesWord(industry, uInd) || matchesWord(uInd, industry)) {
          score += 15;
        }
      }

      // D. Freshness (up to 5 pts)
      const ageDays = job.posted_at ? (Date.now() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24) : 999;
      if (ageDays <= 3) score += 5;
      else if (ageDays <= 7) score += 3;

      let matchPct = 90;
      let matchBadge = 'Featured';

      if (hasCandidateProfile) {
        if (tradeMatched && matchedSkills.length >= 2) {
          matchPct = Math.min(99, 94 + matchedSkills.length);
          matchBadge = `${matchPct}% Best Fit`;
        } else if (tradeMatched && matchedSkills.length >= 1) {
          matchPct = 92;
          matchBadge = `${matchPct}% Best Fit`;
        } else if (tradeMatched) {
          matchPct = 88;
          matchBadge = `${matchPct}% Role Fit`;
        } else if (matchedSkills.length > 0) {
          matchPct = Math.min(92, 82 + matchedSkills.length * 4);
          matchBadge = `${matchPct}% Skill Fit`;
        }
      }

      return {
        job,
        score,
        tradeMatched,
        matchPercentage: matchPct,
        matchedSkills: matchedSkills.slice(0, 3),
        matchBadgeText: matchBadge,
      };
    });

    if (hasCandidateProfile) {
      // Strictly only include jobs that match candidate trade or skills with score >= 20
      const matched = scoredList.filter(
        (item) => (item.tradeMatched || item.matchedSkills.length > 0) && item.score >= 20
      );

      return matched
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const tA = a.job.posted_at ? new Date(a.job.posted_at).getTime() : 0;
          const tB = b.job.posted_at ? new Date(b.job.posted_at).getTime() : 0;
          return tB - tA;
        })
        .slice(0, 3);
    } else {
      // Default to top 3 active opportunities
      return scoredList
        .sort((a, b) => {
          const tA = a.job.posted_at ? new Date(a.job.posted_at).getTime() : 0;
          const tB = b.job.posted_at ? new Date(b.job.posted_at).getTime() : 0;
          return tB - tA;
        })
        .slice(0, 3);
    }
  }, [jobs, primaryTrade, candidateSkills, user?.industry, profileRefreshTick, hasCandidateProfile]);

  const handleApplyNow = useCallback((job: Job) => {
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateApplyConfirm',
      params: {
        jobId: job.id,
        job: job,
      },
    });
  }, [navigation]);

  const handleViewJobDetails = useCallback((job: Job) => {
    navigation.navigate('CandidateJobsTab', {
      screen: 'CandidateJobDetail',
      params: {
        jobId: job.id,
        job: job,
      },
    });
  }, [navigation]);

  const handleShareJob = useCallback((job: Job) => {
    const compName = job.company || (job as any).company_name || 'Industrial Company';
    Share.share({
      title: `${job.title} at ${compName}`,
      message: `Check out this opening for ${job.title} at ${compName} on JobMarket app!`,
    }).catch(() => {});
  }, []);

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={styles.titleWithBadgeRow}>
            <Text style={styles.sectionTitle}>Best Fit For You</Text>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>{hasCandidateProfile ? 'TOP 3' : 'FEATURED'}</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle} numberOfLines={1}>
            {hasCandidateProfile
              ? primaryTrade
                ? `Matched to trade "${primaryTrade}" & verified skills`
                : 'Matched to your verified profile skills'
              : 'Featured industrial opportunities across MIDC'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (primaryTrade) {
              navigation.navigate('CandidateJobsTab', {
                screen: 'CandidateJobSearch',
                params: { keyword: primaryTrade },
              });
            } else {
              navigation.navigate('CandidateEditProfile');
            }
          }}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllBtnText}>
            {primaryTrade ? 'View All' : 'Edit Skills'}
          </Text>
          <ChevronRight size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Section Divider */}
      <View style={styles.sectionSeparatorDivider} />

      {/* Profile Prompt Banner if no skills or trade configured */}
      {!primaryTrade && candidateSkills.length === 0 && (
        <View style={styles.personalizeBanner}>
          <Sparkles size={18} color={COLORS.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.personalizeTitle}>Personalize Your Recommendations</Text>
            <Text style={styles.personalizeSub}>
              Add your primary trade and technical skills to get laser-focused job matches.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.personalizeBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CandidateEditProfile')}
          >
            <Text style={styles.personalizeBtnText}>Add Trade</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <View style={{ gap: 12, marginTop: 4 }}>
          <SkeletonLoader width="100%" height={210} style={{ borderRadius: 12 }} />
          <SkeletonLoader width="100%" height={210} style={{ borderRadius: 12 }} />
          <SkeletonLoader width="100%" height={210} style={{ borderRadius: 12 }} />
        </View>
      ) : bestFitJobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Building2 size={24} color="#94A3B8" />
          <Text style={styles.emptyTitle}>
            {primaryTrade
              ? `No active openings match trade "${primaryTrade}"`
              : 'No matching job vacancies available right now'}
          </Text>
          <Text style={styles.emptySub}>
            Try updating your trade specialization or adding additional technical skills to see more matches.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CandidateJobsTab', { screen: 'CandidateJobSearch', params: {} })}
            >
              <Text style={styles.emptyActionBtnText}>Explore All Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emptyActionBtn, styles.emptyActionBtnOutline]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CandidateEditProfile')}
            >
              <Text style={[styles.emptyActionBtnText, { color: COLORS.primary }]}>Update Skills</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Top 3 Best Fit Job Cards using clean, rounded reference style */
        <View style={styles.cardsListContainer}>
          {bestFitJobs.map(({ job }) => {
            const isSaved = savedJobIds.includes(job.id);
            const isApplied = appliedJobsStore.hasApplied(job.id);

            const isExpNotRequired =
              job.experience_required === false || (job as any).experienceRequired === false;
            const minExp = job.min_experience ?? (job as any).minExperience;
            const maxExp = job.max_experience ?? (job as any).maxExperience;
            const isFresher =
              isExpNotRequired || (minExp === 0 && (maxExp === 0 || maxExp === undefined || maxExp === null));
            const expText = isFresher
              ? 'Fresher'
              : minExp !== undefined && maxExp !== undefined
              ? `${minExp}-${maxExp} Yrs Exp`
              : minExp !== undefined
              ? `${minExp}+ Yrs Exp`
              : 'Fresher';

            const sMin = job.salary_min ?? (job as any).salaryMin;
            const sMax = job.salary_max ?? (job as any).salaryMax;
            let salaryText = '3.5-5.5 Lacs PA';
            if (sMin && sMax) {
              if (sMin >= 100000) {
                salaryText = `${(sMin / 100000).toFixed(1)}-${(sMax / 100000).toFixed(1)} Lacs PA`;
              } else {
                salaryText = `₹${Math.round(sMin / 1000)}k-${Math.round(sMax / 1000)}k/mo`;
              }
            } else if (sMin) {
              salaryText = sMin >= 100000 ? `₹${(sMin / 100000).toFixed(1)} Lacs+ PA` : `₹${sMin}/mo`;
            }

            const compName =
              job.company || (job as any).company_name || (job as any).companyName || 'Industrial Company';
            const locationText =
              job.location || (job as any)?.city || (job as any)?.midc_zone || 'Chhatrapati Sambhajinagar';
            const timeText = formatTimeAgo(
              job.posted_at || (job as any).postedAt || (job as any).created_at || (job as any).createdAt
            );
            const jobType = job.job_type || (job as any).jobType || 'Full-time';
            const workMode = job.work_mode || (job as any).workMode || 'On-site';

            const displayLogo =
              job.companyLogo ||
              (job as any).company_logo ||
              (job as any).logoUrl ||
              (job as any).logo_url ||
              (job as any).logo ||
              (job as any).avatar;

            return (
              <TouchableOpacity
                key={`best-fit-${job.id}`}
                activeOpacity={0.92}
                style={styles.cleanJobCard}
                onPress={() => handleViewJobDetails(job)}
              >
                {/* 1. Header: Logo (large rounded box with border) + Title & Subtitle */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.logoSquareContainer}>
                    <CompanyLogoAvatar
                      logoUrl={displayLogo}
                      companyName={compName}
                      size={40}
                      borderRadius={8}
                    />
                  </View>

                  <View style={styles.titleColumn}>
                    <Text style={styles.cardJobTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.cardCompanySubtitle} numberOfLines={1}>
                      Hiring at {compName}
                    </Text>
                  </View>
                </View>

                {/* 2. Metadata Rows (Calendar & Briefcase specs with '|' separator) */}
                <View style={styles.metaRowsContainer}>
                  <View style={styles.metaLine}>
                    <Calendar size={13} color="#64748B" />
                    <Text style={styles.metaLineText}>
                      Posted {timeText} • {locationText}
                    </Text>
                  </View>

                  <View style={styles.metaLine}>
                    <Briefcase size={13} color="#64748B" />
                    <Text style={styles.metaLineText}>
                      {expText}   |   {salaryText}   |   {jobType}
                    </Text>
                  </View>
                </View>

                {/* 3. Clean Divider */}
                <View style={styles.cardDivider} />

                {/* 4. Bottom Footer: Meta Indicators on Left | Actions on Right */}
                <View style={styles.cardFooterRow}>
                  <View style={styles.footerLeftStatsRow}>
                    <Text style={styles.footerStatText}>
                      {job.openings ? `${job.openings} Openings` : 'Immediate Hiring'}
                    </Text>
                    <Text style={styles.footerStatDivider}>|</Text>
                    <Text style={styles.footerStatText}>{workMode}</Text>
                  </View>

                  <View style={styles.footerRightActionsRow}>
                    {/* Share Button */}
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleShareJob(job);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Share2 size={17} color="#64748B" />
                    </TouchableOpacity>

                    {/* Bookmark Button */}
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleSave(job.id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Bookmark
                        size={18}
                        color={isSaved ? COLORS.primary : '#64748B'}
                        fill={isSaved ? COLORS.primary : 'transparent'}
                      />
                    </TouchableOpacity>

                    {/* Quick Apply CTA Button */}
                    <TouchableOpacity
                      style={[styles.applyBtn, isApplied && styles.appliedBtn]}
                      activeOpacity={0.85}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (isApplied) {
                          handleViewJobDetails(job);
                        } else {
                          handleApplyNow(job);
                        }
                      }}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 size={12} color="#059669" />
                          <Text style={styles.appliedBtnText}>Applied</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.applyBtnText}>Apply</Text>
                          <ArrowRight size={12} color="#FFFFFF" />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  topBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionSeparatorDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  personalizeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    marginTop: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  personalizeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  personalizeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  personalizeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  personalizeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyActionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  emptyActionBtnOutline: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardsListContainer: {
    gap: 12,
    marginTop: 4,
  },

  // ─────────────────────────────────────────────────────────────
  // Clean Reference Card Style (Matches user's screenshot)
  // ─────────────────────────────────────────────────────────────
  cleanJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoSquareContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  cardJobTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.15,
  },
  cardCompanySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  metaRowsContainer: {
    gap: 5,
    marginTop: 10,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLineText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },

  // Card Divider
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },

  // Bottom Footer
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeftStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  footerStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  footerStatDivider: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  footerRightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconActionBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    height: 28,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appliedBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  appliedBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});
