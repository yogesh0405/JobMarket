import { Job, User } from '../types';

export interface ScoredJob {
  job: Job;
  matchScore: number;
  matchReasons: string[];
}

/**
 * Smart Candidate Job Recommendation Engine
 * Ranks all available vacancies according to candidate's uploaded profile details:
 * - Trade & Specialization (VMC, CNC, Fitter, Welder, Electrician, Quality, etc.)
 * - Skills (e.g. ['CNC Operating', 'Blueprint Reading', 'PLC', 'Quality Assurance'])
 * - Shift Preference (Day Shift, Night Shift, Rotational Shift)
 * - Bus / Hostel / Canteen Facilities match
 * - Location / MIDC Zone match
 */
export function rankJobsForCandidate(jobs: Job[], user?: User | null): ScoredJob[] {
  if (!jobs || jobs.length === 0) return [];

  // Extract candidate profile details safely
  const tradeSpec = (
    user?.trade_specialization ||
    user?.tradeSpecialization ||
    user?.industry ||
    user?.headline ||
    user?.bio ||
    ''
  ).toLowerCase();

  const shiftPref = (
    user?.preferred_shift ||
    user?.preferredShift ||
    ''
  ).toLowerCase();

  const midcZone = (
    user?.midc_zone ||
    user?.midcZone ||
    user?.location ||
    user?.address ||
    ''
  ).toLowerCase();

  const requiresBus = Boolean(user?.requires_bus || user?.requiresBus);
  const requiresAcc = Boolean(user?.requires_accommodation || user?.requiresAccommodation);

  // Normalize candidate skills
  let candidateSkills: string[] = [];
  if (Array.isArray(user?.skills)) {
    candidateSkills = user.skills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  } else if (typeof user?.skills === 'string') {
    candidateSkills = (user.skills as string)
      .split(',')
      .map((s) => s.toLowerCase().trim())
      .filter(Boolean);
  }

  const scoredList: ScoredJob[] = jobs.map((job) => {
    let score = 0;
    const reasons: string[] = [];

    const jobTitle = (job.title || '').toLowerCase();
    const jobIndustry = (job.industry || '').toLowerCase();
    const jobDesc = (job.description || '').toLowerCase();
    const jobLocation = (job.location || '').toLowerCase();
    const jobMidc = (job.midc_zone || (job as any).midcZone || '').toLowerCase();
    const jobShift = (job.shift_details || (job as any).shiftDetails || (job as any).shift_type || jobDesc).toLowerCase();

    // Extract job skills
    let jobSkills: string[] = [];
    if (Array.isArray(job.skills)) {
      jobSkills = job.skills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
    }
    if (Array.isArray(job.requirements)) {
      const reqSkills = job.requirements.map((r) => String(r).toLowerCase().trim());
      jobSkills = [...jobSkills, ...reqSkills];
    }

    // 1. Trade & Specialization Match (High Priority: 40 Points)
    if (tradeSpec) {
      if (
        jobTitle.includes(tradeSpec) ||
        jobIndustry.includes(tradeSpec) ||
        tradeSpec.includes(jobTitle)
      ) {
        score += 40;
        reasons.push('Trade Match');
      } else {
        // Tokenize trade specialty words (e.g., "VMC Operator", "CNC", "Fitter")
        const tradeWords = tradeSpec.split(/[\s,/-]+/).filter((w) => w.length >= 3);
        const hasWordMatch = tradeWords.some(
          (w) => jobTitle.includes(w) || jobIndustry.includes(w) || jobDesc.includes(w)
        );
        if (hasWordMatch) {
          score += 25;
          reasons.push('Specialty Match');
        }
      }
    }

    // 2. Candidate Skills Match (15 Points per matched skill, up to 45 Points)
    if (candidateSkills.length > 0) {
      let matchedSkillCount = 0;
      candidateSkills.forEach((cSkill) => {
        const isMatched =
          jobSkills.some((jSkill) => jSkill.includes(cSkill) || cSkill.includes(jSkill)) ||
          jobTitle.includes(cSkill) ||
          jobDesc.includes(cSkill);
        if (isMatched) {
          matchedSkillCount++;
        }
      });

      if (matchedSkillCount > 0) {
        const skillScore = Math.min(matchedSkillCount * 15, 45);
        score += skillScore;
        reasons.push(`${matchedSkillCount} Skill${matchedSkillCount > 1 ? 's' : ''} Matched`);
      }
    }

    // 3. Shift Preference Match (15 Points)
    if (shiftPref) {
      const isShiftMatch =
        (shiftPref.includes('day') && (jobShift.includes('day') || jobShift.includes('1st'))) ||
        (shiftPref.includes('night') && (jobShift.includes('night') || jobShift.includes('2nd') || jobShift.includes('3rd'))) ||
        (shiftPref.includes('rotational') && (jobShift.includes('rotational') || jobShift.includes('all')));
      if (isShiftMatch) {
        score += 15;
        reasons.push('Preferred Shift');
      }
    }

    // 4. Bus & Accommodation Facility Match (10 Points)
    if (requiresBus && (job.bus_facility || job.busFacility)) {
      score += 10;
      reasons.push('Bus Provided');
    }
    if (requiresAcc && (job.accommodation || (job as any).accommodation)) {
      score += 10;
      reasons.push('Hostel Provided');
    }

    // 5. MIDC Zone / Location Match (10 Points)
    if (midcZone) {
      if (
        (jobMidc && (jobMidc.includes(midcZone) || midcZone.includes(jobMidc))) ||
        (jobLocation && (jobLocation.includes(midcZone) || midcZone.includes(jobLocation)))
      ) {
        score += 10;
        reasons.push('MIDC Zone Match');
      }
    }

    // Base score so un-matched jobs still have a score based on recency/featured status
    if (job.featured) score += 5;

    return {
      job,
      matchScore: score,
      matchReasons: reasons,
    };
  });

  // Sort descending by match score
  scoredList.sort((a, b) => b.matchScore - a.matchScore);

  return scoredList;
}

/**
 * Filtered array of recommended jobs sorted by profile match score
 */
export function getRecommendedJobsForCandidate(jobs: Job[], user?: User | null): Job[] {
  return rankJobsForCandidate(jobs, user).map((item) => item.job);
}
