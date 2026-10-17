export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  trade_specialization?: string | null;
  skills?: string[] | any;
  location?: string | null;
  headline?: string | null;
  experience?: any;
  education?: any;
  preferred_shift?: string | null;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  trade?: string | null;
  iti_trade?: string | null;
  itiTrade?: string | null;
  industry?: string | null;
  location: string;
  midc_zone?: string | null;
  midcZone?: string | null;
  skills?: string[] | any;
  min_experience?: number | null;
  minExperience?: number | null;
  max_experience?: number | null;
  maxExperience?: number | null;
  salary_min?: number | null;
  salaryMin?: number | null;
  salary_max?: number | null;
  salaryMax?: number | null;
  job_type?: string | null;
  jobType?: string | null;
}

export interface MatchResult {
  candidateId: string;
  jobId: string;
  score: number; // 0 - 100
  isQualified: boolean; // score >= 50
  isTopMatch: boolean; // score >= 75
  reasons: string[];
  notificationTitle: string;
  notificationBody: string;
}

export class ProfileJobMatcher {
  /**
   * Evaluates candidate profile against job posting using LinkedIn/Naukri multi-factor weights
   */
  static calculateMatch(candidate: CandidateProfile, job: JobListing): MatchResult {
    let score = 0;
    const reasons: string[] = [];

    const jobTrade = (job.trade || job.iti_trade || job.itiTrade || '').trim().toLowerCase();
    const jobTitle = (job.title || '').trim().toLowerCase();
    const candidateTrade = (candidate.trade_specialization || '').trim().toLowerCase();
    const candidateHeadline = (candidate.headline || '').trim().toLowerCase();

    // 1. Trade & Role Specialization (Weight: 40 points)
    const tradeScore = this.evaluateTradeMatch(jobTrade, jobTitle, candidateTrade, candidateHeadline);
    score += tradeScore.points;
    if (tradeScore.reason) reasons.push(tradeScore.reason);

    // 2. Location & MIDC Zone Proximity (Weight: 25 points)
    const locationScore = this.evaluateLocationMatch(
      job.location || '',
      job.midc_zone || job.midcZone || '',
      candidate.location || ''
    );
    score += locationScore.points;
    if (locationScore.reason) reasons.push(locationScore.reason);

    // 3. Experience Compatibility (Weight: 20 points)
    const minExp = job.min_experience ?? job.minExperience ?? 0;
    const maxExp = job.max_experience ?? job.maxExperience ?? 10;
    const candidateExpYears = this.calculateCandidateExperienceYears(candidate);
    const expScore = this.evaluateExperienceMatch(candidateExpYears, minExp, maxExp);
    score += expScore.points;
    if (expScore.reason) reasons.push(expScore.reason);

    // 4. Skills & Competencies Overlap (Weight: 15 points)
    const candidateSkills = this.normalizeStringArray(candidate.skills);
    const jobSkills = this.normalizeStringArray(job.skills);
    const skillScore = this.evaluateSkillMatch(candidateSkills, jobSkills);
    score += skillScore.points;
    if (skillScore.reason) reasons.push(skillScore.reason);

    const clampedScore = Math.min(100, Math.max(0, Math.round(score)));
    const isQualified = clampedScore >= 50;
    const isTopMatch = clampedScore >= 75;

    // Build Professional Push Notification Copy
    const { title: notificationTitle, body: notificationBody } = this.buildNotificationCopy(
      candidate,
      job,
      clampedScore,
      isTopMatch
    );

    return {
      candidateId: candidate.id,
      jobId: job.id,
      score: clampedScore,
      isQualified,
      isTopMatch,
      reasons,
      notificationTitle,
      notificationBody,
    };
  }

  private static evaluateTradeMatch(
    jobTrade: string,
    jobTitle: string,
    candidateTrade: string,
    candidateHeadline: string
  ): { points: number; reason?: string } {
    if (!candidateTrade && !candidateHeadline) {
      return { points: 10 }; // Neutral baseline
    }

    // Direct Exact Trade match
    if (jobTrade && candidateTrade && (jobTrade === candidateTrade || candidateTrade.includes(jobTrade) || jobTrade.includes(candidateTrade))) {
      return { points: 40, reason: `Exact Trade Match: ${candidateTrade.toUpperCase()}` };
    }

    // Trade found in job title
    if (candidateTrade && jobTitle.includes(candidateTrade)) {
      return { points: 38, reason: `Role Title Matches Trade: ${candidateTrade}` };
    }

    // Headline keywords match job title or trade
    const candidateKeywords = `${candidateTrade} ${candidateHeadline}`.split(/[\s,/-]+/).filter((w) => w.length > 2);
    for (const kw of candidateKeywords) {
      if (jobTitle.includes(kw) || (jobTrade && jobTrade.includes(kw))) {
        return { points: 30, reason: `Trade Keyword Match: ${kw}` };
      }
    }

    return { points: 5 };
  }

  private static evaluateLocationMatch(
    jobLocation: string,
    jobMidcZone: string,
    candidateLocation: string
  ): { points: number; reason?: string } {
    if (!candidateLocation) {
      return { points: 10 }; // Neutral
    }

    const normCandidateLoc = candidateLocation.toLowerCase();
    const normJobLoc = jobLocation.toLowerCase();
    const normJobZone = jobMidcZone.toLowerCase();

    // Exact MIDC Zone Match
    if (normJobZone && normCandidateLoc.includes(normJobZone)) {
      return { points: 25, reason: `Target MIDC Zone Match: ${jobMidcZone}` };
    }

    // City / District overlap
    const cities = ['chhatrapati sambhajinagar', 'aurangabad', 'waluj', 'shendra', 'chikalthana', 'pune', 'bhosari', 'chakan', 'jalna', 'nashik', 'mumbai'];
    for (const city of cities) {
      if ((normCandidateLoc.includes(city) || normJobZone.includes(city)) && (normJobLoc.includes(city) || normJobZone.includes(city))) {
        return { points: 22, reason: `Location Hub Match: ${city.toUpperCase()}` };
      }
    }

    // Substring match
    const locParts = normJobLoc.split(/[\s,]+/).filter((p) => p.length > 3);
    for (const part of locParts) {
      if (normCandidateLoc.includes(part)) {
        return { points: 18, reason: `Proximity Match: ${part}` };
      }
    }

    return { points: 8 };
  }

  private static evaluateExperienceMatch(
    candidateYears: number,
    minExp: number,
    maxExp: number
  ): { points: number; reason?: string } {
    // Fresher friendly job
    if (minExp === 0 && candidateYears <= 1) {
      return { points: 20, reason: 'Fresher Opportunity Alignment' };
    }

    // Candidate experience is inside required range
    if (candidateYears >= minExp && candidateYears <= maxExp) {
      return { points: 20, reason: `Experience Level Match (${candidateYears} Yrs in ${minExp}–${maxExp} Yrs range)` };
    }

    // Candidate within 1 year delta
    if (Math.abs(candidateYears - minExp) <= 1 || Math.abs(candidateYears - maxExp) <= 1) {
      return { points: 14, reason: `Experience Close Match (${candidateYears} Yrs)` };
    }

    return { points: 6 };
  }

  private static evaluateSkillMatch(
    candidateSkills: string[],
    jobSkills: string[]
  ): { points: number; reason?: string } {
    if (jobSkills.length === 0 || candidateSkills.length === 0) {
      return { points: 8 }; // Neutral
    }

    const matched: string[] = [];
    for (const jSkill of jobSkills) {
      const match = candidateSkills.find(
        (cSkill) => cSkill.includes(jSkill) || jSkill.includes(cSkill)
      );
      if (match) {
        matched.push(jSkill);
      }
    }

    if (matched.length > 0) {
      const ratio = matched.length / Math.min(jobSkills.length, 5);
      const points = Math.min(15, Math.max(5, Math.round(ratio * 15)));
      return {
        points,
        reason: `Matched Skills: ${matched.slice(0, 3).join(', ')}`,
      };
    }

    return { points: 4 };
  }

  private static calculateCandidateExperienceYears(candidate: CandidateProfile): number {
    try {
      if (Array.isArray(candidate.experience) && candidate.experience.length > 0) {
        let totalMonths = 0;
        for (const exp of candidate.experience) {
          if (exp.years) {
            totalMonths += Number(exp.years) * 12;
          } else if (exp.startDate && exp.endDate) {
            const start = new Date(exp.startDate).getTime();
            const end = exp.current ? Date.now() : new Date(exp.endDate).getTime();
            const diffMonths = Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30.4));
            totalMonths += diffMonths;
          } else {
            totalMonths += 12; // default 1 yr per job entry
          }
        }
        return Math.round((totalMonths / 12) * 10) / 10;
      }

      // Check headline for experience keywords (e.g. "3 years experience", "Fresher")
      if (candidate.headline) {
        const match = candidate.headline.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
        if (candidate.headline.toLowerCase().includes('fresher')) {
          return 0;
        }
      }
    } catch (_) {}

    return 1; // Default to 1 yr junior technician
  }

  private static normalizeStringArray(input: any): string[] {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
    }
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return parsed.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
        }
      } catch (_) {
        return input.split(/[\s,]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
      }
    }
    return [];
  }

  /**
   * Industry-Grade Push Notification Copy (LinkedIn & Naukri format)
   */
  private static buildNotificationCopy(
    candidate: CandidateProfile,
    job: JobListing,
    score: number,
    isTopMatch: boolean
  ): { title: string; body: string } {
    const company = job.company || 'A Verified Employer';
    const roleTitle = job.title || 'Technical Role';
    const location = job.midc_zone || job.midcZone || job.location || 'Your Region';

    let salarySnippet = '';
    const minSal = job.salary_min ?? job.salaryMin;
    const maxSal = job.salary_max ?? job.salaryMax;
    if (minSal && maxSal && minSal > 0 && maxSal > 0) {
      salarySnippet = ` (₹${(minSal / 1000).toFixed(0)}k–₹${(maxSal / 1000).toFixed(0)}k/mo)`;
    }

    if (isTopMatch) {
      return {
        title: `🎯 Top Match: ${roleTitle} at ${company}`,
        body: `${company} is actively hiring in ${location}${salarySnippet}. Your profile is an exceptional ${score}% match. Tap to apply instantly!`,
      };
    }

    return {
      title: `💼 New Opening: ${roleTitle}`,
      body: `${company} just published a new opening in ${location}${salarySnippet}. Matches your trade background. Tap to view details.`,
    };
  }
}
