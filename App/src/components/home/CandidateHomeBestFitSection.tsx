import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Building2,
  Calendar,
  Share2,
} from 'lucide-react';
import { Job } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { CompanyDefaultLogo } from '../company/CompanyDefaultLogo';

interface CandidateHomeBestFitSectionProps {
  jobs?: Job[];
  loading?: boolean;
}

interface ScoredJob {
  job: Job;
  score: number;
  matchPercentage: number;
  matchedSkills: string[];
  matchBadgeText: string;
}

export const CandidateHomeBestFitSection: React.FC<CandidateHomeBestFitSectionProps> = ({
  jobs: passedJobs,
  loading: passedLoading = false,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getJobs, toggleSaveJob, isJobSaved, loading: jobsLoading } = useJobs();
  const { showToast } = useToast();

  const jobs = useMemo(() => {
    return passedJobs || getJobs({});
  }, [passedJobs, getJobs]);

  const loading = passedLoading || (jobsLoading && (!jobs || jobs.length === 0));

  // 1. Candidate Primary Trade & Category
  const primaryTrade = useMemo(() => {
    const trade =
      currentUser?.tradeSpecialization ||
      currentUser?.trade_specialization ||
      (currentUser as any)?.trade ||
      (currentUser as any)?.headline ||
      (currentUser as any)?.industry ||
      '';
    return typeof trade === 'string' ? trade.trim() : '';
  }, [currentUser]);

  // 2. Candidate Skills
  const candidateSkills = useMemo(() => {
    let rawSkills = currentUser?.skills || (currentUser as any)?.keySkills || (currentUser as any)?.skills_list || [];
    if (typeof rawSkills === 'string') {
      rawSkills = rawSkills.split(',').map((s: string) => s.trim());
    }
    if (!Array.isArray(rawSkills)) return [];
    return rawSkills
      .map((s: any) => (typeof s === 'string' ? s.trim() : (s?.name || s?.title || '')))
      .filter((s: string) => s.length >= 2);
  }, [currentUser]);

  // 3. Precision Matching & Scoring Algorithm (100% same backend logic as MobileApp)
  const bestFitJobs = useMemo<ScoredJob[]>(() => {
    if (!jobs || jobs.length === 0) return [];

    const tradeClean = primaryTrade.toLowerCase();
    const skillsClean = candidateSkills.map((s) => s.toLowerCase());

    const scoredList: ScoredJob[] = jobs.map((job) => {
      let score = 0;
      const matchedSkills: string[] = [];

      const title = (job.title || '').toLowerCase();
      const trade = (job.trade || '').toLowerCase();
      const industry = (job.industry || '').toLowerCase();
      const desc = (job.description || '').toLowerCase();
      const jobSkills = Array.isArray(job.skills) ? job.skills.map((s) => (s || '').toLowerCase()) : [];
      const jobReqs = Array.isArray(job.requirements) ? job.requirements.map((r) => (r || '').toLowerCase()) : [];
      const jobResps = Array.isArray(job.responsibilities) ? job.responsibilities.map((r) => (r || '').toLowerCase()) : [];
      const allJobText = `${title} ${trade} ${industry} ${desc} ${jobSkills.join(' ')} ${jobReqs.join(' ')} ${jobResps.join(' ')}`;

      // Primary Trade / Category Match (up to 50 pts)
      let tradeMatched = false;
      if (tradeClean) {
        if (trade && (trade === tradeClean || trade.includes(tradeClean) || tradeClean.includes(trade))) {
          score += 50;
          tradeMatched = true;
        } else if (title && (title.includes(tradeClean) || tradeClean.includes(title))) {
          score += 45;
          tradeMatched = true;
        } else if (industry && (industry.includes(tradeClean) || tradeClean.includes(industry))) {
          score += 38;
          tradeMatched = true;
        } else {
          const tokens = tradeClean.split(/\s+/).filter((t) => t.length > 2);
          const hits = tokens.filter((t) => allJobText.includes(t));
          if (hits.length > 0) {
            score += hits.length * 15;
            tradeMatched = true;
          }
        }
      }

      // Skills Overlap Match (up to 35 pts)
      skillsClean.forEach((skill, idx) => {
        const origSkill = candidateSkills[idx] || skill;
        const inSkills = jobSkills.some((js) => js === skill || js.includes(skill) || skill.includes(js));
        const inText = allJobText.includes(skill);

        if (inSkills || inText) {
          if (!matchedSkills.includes(origSkill)) {
            matchedSkills.push(origSkill);
            score += 15;
          }
        }
      });

      // Industry / Sector Match (up to 10 pts)
      if (currentUser?.industry) {
        const uInd = currentUser.industry.toLowerCase();
        if (industry.includes(uInd) || uInd.includes(industry)) {
          score += 10;
        }
      }

      // Freshness (up to 5 pts)
      const rawPosted = job.posted_at || (job as any).postedAt || (job as any).created_at || (job as any).createdAt;
      const ageDays = rawPosted ? (Date.now() - new Date(rawPosted).getTime()) / (1000 * 60 * 60 * 24) : 999;
      if (ageDays <= 3) score += 5;
      else if (ageDays <= 7) score += 3;

      // Realistic Match Percentage
      let matchPct = 82;
      if (tradeMatched && matchedSkills.length >= 2) {
        matchPct = Math.min(99, 93 + Math.min(6, matchedSkills.length * 2));
      } else if (tradeMatched || matchedSkills.length >= 1) {
        matchPct = Math.min(95, 87 + matchedSkills.length * 2);
      } else {
        matchPct = Math.min(88, 78 + Math.round((score / 100) * 10));
      }

      let matchBadge = `${matchPct}% Match`;
      if (tradeMatched && matchedSkills.length > 0) {
        matchBadge = `${matchPct}% Best Fit`;
      } else if (tradeMatched) {
        matchBadge = `${matchPct}% Role Fit`;
      } else if (matchedSkills.length > 0) {
        matchBadge = `${matchPct}% Skill Fit`;
      }

      return {
        job,
        score,
        matchPercentage: matchPct,
        matchedSkills: matchedSkills.slice(0, 3),
        matchBadgeText: matchBadge,
      };
    });

    // Sort by highest score descending, then match percentage, then recency
    return scoredList
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
        const rawA = a.job.posted_at || (a.job as any).postedAt || (a.job as any).created_at;
        const rawB = b.job.posted_at || (b.job as any).postedAt || (b.job as any).created_at;
        const tA = rawA ? new Date(rawA).getTime() : 0;
        const tB = rawB ? new Date(rawB).getTime() : 0;
        return tB - tA;
      })
      .slice(0, 3);
  }, [jobs, primaryTrade, candidateSkills, currentUser?.industry]);

  const handleToggleSave = useCallback(
    (jobId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!currentUser) {
        showToast('Please log in to save jobs', 'warning');
        navigate('/login');
        return;
      }
      const isNowSaved = toggleSaveJob(jobId);
      showToast(
        isNowSaved ? 'Job saved to your bookmarks! 🔖' : 'Job removed from saved',
        isNowSaved ? 'success' : 'info'
      );
    },
    [currentUser, toggleSaveJob, showToast, navigate]
  );

  const handleShareJob = useCallback(
    (job: Job, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const compName = job.company || (job as any).company_name || 'Industrial Company';
      const shareUrl = `${window.location.origin}/job/${job.id}`;
      if (navigator.share) {
        navigator
          .share({
            title: `${job.title} at ${compName}`,
            text: `Check out this opening for ${job.title} at ${compName} on JobMarket!`,
            url: shareUrl,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(shareUrl);
        showToast('Job link copied to clipboard! 📋', 'success');
      }
    },
    [showToast]
  );

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return 'Recently';
  };

  const isApplied = useCallback(
    (jobId: string) => {
      const appliedList = Array.isArray(currentUser?.appliedJobs) ? currentUser.appliedJobs : [];
      return appliedList.includes(jobId);
    },
    [currentUser?.appliedJobs]
  );

  return (
    <section className="home-best-fit-section" style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ flex: 1, paddingRight: '8px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
              Best Fit For You
            </h3>
            <span
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                padding: '1.5px 6px',
                fontSize: '10px',
                fontWeight: 900,
                color: '#1B4FDF',
                letterSpacing: '0.5px',
              }}
            >
              TOP 3
            </span>
          </div>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '12.5px',
              color: '#64748B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {primaryTrade
              ? `Matched to trade "${primaryTrade}" & verified skills`
              : 'Precision matches based on profile trade & skills'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (primaryTrade) {
              navigate(`/jobs?search=${encodeURIComponent(primaryTrade)}`);
            } else {
              navigate('/profile');
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '4px 6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#1B4FDF',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span>{primaryTrade ? 'View All' : 'Edit Skills'}</span>
          <ChevronRight size={14} color="#1B4FDF" strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Section Divider */}
      <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '6px 0 14px 0' }} />

      {/* Profile Prompt Banner if no skills or trade configured */}
      {!primaryTrade && candidateSkills.length === 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '14px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Sparkles size={20} color="#1B4FDF" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
              Personalize Your Recommendations
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Add your primary trade and technical skills to get laser-focused job matches.
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={{
              backgroundColor: '#1B4FDF',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(27, 79, 223, 0.2)',
            }}
          >
            Add Trade
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                height: '180px',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
        </div>
      ) : bestFitJobs.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Building2 size={28} color="#94A3B8" />
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            No matching job vacancies available right now
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Try updating your trade specialization or adding additional skills.
          </div>
        </div>
      ) : (
        /* Top 3 Best Fit Job Cards (Exact UI Match to MobileApp) */
        <div
          className="home-best-fit-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '14px',
          }}
        >
          {bestFitJobs.map(({ job }) => {
            const isSaved = isJobSaved(job.id);
            const applied = isApplied(job.id);

            const isExpNotRequired =
              job.experienceRequired === false || (job as any).experience_required === false;
            const minExp = job.minExperience ?? (job as any).min_experience;
            const maxExp = job.maxExperience ?? (job as any).max_experience;
            const isFresher =
              isExpNotRequired || (minExp === 0 && (maxExp === 0 || maxExp === undefined || maxExp === null));
            const expText = isFresher
              ? 'Fresher'
              : minExp !== undefined && maxExp !== undefined
              ? `${minExp}-${maxExp} Yrs Exp`
              : minExp !== undefined
              ? `${minExp}+ Yrs Exp`
              : 'Fresher';

            const sMin = job.salaryMin ?? (job as any).salary_min;
            const sMax = job.salaryMax ?? (job as any).salary_max;
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
              <div
                key={`best-fit-${job.id}`}
                onClick={() => navigate(`/job/${job.id}`)}
                className="best-fit-clean-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1B4FDF';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 79, 223, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04)';
                }}
              >
                <div>
                  {/* 1. Header: Logo + Title & Subtitle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <CompanyDefaultLogo
                        logoUrl={displayLogo}
                        companyName={compName}
                        size={40}
                        borderRadius="8px"
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '15px',
                          fontWeight: 800,
                          color: '#0F172A',
                          letterSpacing: '-0.15px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {job.title}
                      </h4>
                      <p
                        style={{
                          margin: '2px 0 0 0',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        Hiring at {compName}
                      </p>
                    </div>
                  </div>

                  {/* 2. Metadata Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="#64748B" style={{ flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        Posted {timeText} • {locationText}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={13} color="#64748B" style={{ flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {expText} &nbsp;|&nbsp; {salaryText} &nbsp;|&nbsp; {jobType}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* 3. Clean Divider */}
                  <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '10px 0' }} />

                  {/* 4. Bottom Footer: Meta Indicators on Left | Actions on Right */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1 }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#64748B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {job.openings ? `${job.openings} Openings` : 'Immediate Hiring'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#CBD5E1' }}>|</span>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#64748B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {workMode}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={(e) => handleShareJob(job, e)}
                        title="Share opening"
                        aria-label="Share opening"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748B',
                        }}
                      >
                        <Share2 size={16} />
                      </button>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(job.id, e)}
                        title={isSaved ? 'Remove from Saved' : 'Save Job'}
                        aria-label={isSaved ? 'Remove from Saved' : 'Save Job'}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSaved ? '#1B4FDF' : '#64748B',
                        }}
                      >
                        <Bookmark
                          size={17}
                          color={isSaved ? '#1B4FDF' : '#64748B'}
                          fill={isSaved ? '#1B4FDF' : 'transparent'}
                        />
                      </button>

                      {/* Quick Apply CTA Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/job/${job.id}`);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: applied ? '#F1F5F9' : '#1B4FDF',
                          border: applied ? '1px solid #CBD5E1' : 'none',
                          borderRadius: '18px',
                          height: '28px',
                          padding: '0 12px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: applied ? '#059669' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: applied ? 'none' : '0 2px 6px rgba(27, 79, 223, 0.25)',
                        }}
                      >
                        {applied ? (
                          <>
                            <CheckCircle2 size={12} color="#059669" strokeWidth={2.5} />
                            <span>Applied</span>
                          </>
                        ) : (
                          <>
                            <span>Apply</span>
                            <ArrowRight size={12} strokeWidth={2.5} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
