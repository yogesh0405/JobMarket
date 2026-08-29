import { extractCandidateResume } from './fileUtils';

export interface SectionCompletionStatus {
  totalScore: number;
  sections: {
    personalInfo: { score: number; maxScore: number; completed: boolean; label: string; missingFields: string[] };
    tradeSpecialization: { score: number; maxScore: number; completed: boolean; label: string; missingFields: string[] };
    locationAddress: { score: number; maxScore: number; completed: boolean; label: string; missingFields: string[] };
    skillsCertifications: { score: number; maxScore: number; completed: boolean; label: string; missingFields: string[] };
    educationQualifications: { score: number; maxScore: number; completed: boolean; label: string; missingFields: string[] };
    resumeBio: { score: number; maxScore: number; completed: boolean; label: string; missingFields: string[] };
  };
  missingSectionsList: string[];
  nextRecommendedAction: string;
}

export function calculateCandidateProfileCompletion(user: any): SectionCompletionStatus {
  // 1. Personal Information (20%)
  const hasName = !!(user?.name || user?.full_name || user?.fullName);
  const hasPhone = !!user?.phone;
  const hasEmail = !!user?.email;
  const hasAvatar = !!(user?.avatar_url || user?.avatarUrl || user?.profile_picture_url || user?.avatar);

  let personalScore = 0;
  const personalMissing: string[] = [];
  if (hasName) personalScore += 6; else personalMissing.push('Full Name');
  if (hasPhone) personalScore += 6; else personalMissing.push('Phone Number');
  if (hasEmail) personalScore += 4; else personalMissing.push('Email Address');
  if (hasAvatar) personalScore += 4; else personalMissing.push('Profile Photo');

  // 2. Trade Specialization & Experience (25%)
  const hasTrade = !!(user?.tradeSpecialization || user?.trade_specialization || user?.headline);
  const hasExp = Array.isArray(user?.experience) ? user.experience.length > 0 : !!(user?.experience || user?.total_experience);
  const hasShift = !!(user?.preferredShift || user?.preferred_shift);

  let tradeScore = 0;
  const tradeMissing: string[] = [];
  if (hasTrade) tradeScore += 10; else tradeMissing.push('Trade Specialization');
  if (hasExp) tradeScore += 10; else tradeMissing.push('Work Experience');
  if (hasShift) tradeScore += 5; else tradeMissing.push('Preferred Shift');

  // 3. Location & Contact Address (15%)
  const hasLocation = !!(user?.location || user?.city || user?.address);
  const hasPincode = !!(user?.pincode || user?.pin_code || user?.postal_code || user?.locality);

  let locationScore = 0;
  const locationMissing: string[] = [];
  if (hasLocation) locationScore += 10; else locationMissing.push('City / MIDC Zone');
  if (hasPincode || hasLocation) locationScore += 5; else locationMissing.push('Locality / Pin Code');

  // 4. Skills & Certifications (15%)
  const skillsCount = Array.isArray(user?.skills) ? user.skills.length : 0;
  let skillsScore = 0;
  const skillsMissing: string[] = [];
  if (skillsCount >= 3) {
    skillsScore = 15;
  } else if (skillsCount > 0) {
    skillsScore = 8;
    skillsMissing.push('Add at least 3 trade skills');
  } else {
    skillsMissing.push('Trade Skills');
  }

  // 5. Education & Qualifications (15%)
  const hasEducation = Array.isArray(user?.education) ? user.education.length > 0 : !!(user?.education || user?.highest_qualification || user?.qualification);
  let eduScore = 0;
  const eduMissing: string[] = [];
  if (hasEducation) eduScore = 15; else eduMissing.push('Education / ITI Qualification');

  // 6. Resume Document & Bio Summary (10%)
  const hasBio = !!(user?.bio || user?.about);
  const hasResume = !!extractCandidateResume(user).url;
  let resumeScore = 0;
  const resumeMissing: string[] = [];
  if (hasBio) resumeScore += 5; else resumeMissing.push('About Bio Summary');
  if (hasResume) resumeScore += 5; else resumeMissing.push('Resume PDF Upload');

  const totalScore = Math.min(100, Math.round(personalScore + tradeScore + locationScore + skillsScore + eduScore + resumeScore));

  const missingSectionsList: string[] = [];
  if (personalMissing.length > 0) missingSectionsList.push(`Personal Data (${personalMissing.join(', ')})`);
  if (tradeMissing.length > 0) missingSectionsList.push(`Trade & Experience (${tradeMissing.join(', ')})`);
  if (locationMissing.length > 0) missingSectionsList.push(`Location (${locationMissing.join(', ')})`);
  if (skillsMissing.length > 0) missingSectionsList.push(`Skills (${skillsMissing.join(', ')})`);
  if (eduMissing.length > 0) missingSectionsList.push(`Education (${eduMissing.join(', ')})`);
  if (resumeMissing.length > 0) missingSectionsList.push(`Resume & Bio (${resumeMissing.join(', ')})`);

  let nextRecommendedAction = 'Your profile is 100% complete!';
  if (missingSectionsList.length > 0) {
    nextRecommendedAction = `Complete ${missingSectionsList[0]} to reach 100% completeness.`;
  }

  return {
    totalScore,
    sections: {
      personalInfo: { score: personalScore, maxScore: 20, completed: personalScore === 20, label: 'Personal Information', missingFields: personalMissing },
      tradeSpecialization: { score: tradeScore, maxScore: 25, completed: tradeScore === 25, label: 'Trade Specialization & Experience', missingFields: tradeMissing },
      locationAddress: { score: locationScore, maxScore: 15, completed: locationScore === 15, label: 'Location & Contact Address', missingFields: locationMissing },
      skillsCertifications: { score: skillsScore, maxScore: 15, completed: skillsScore === 15, label: 'Trade Skills & Certifications', missingFields: skillsMissing },
      educationQualifications: { score: eduScore, maxScore: 15, completed: eduScore === 15, label: 'Education & ITI Qualifications', missingFields: eduMissing },
      resumeBio: { score: resumeScore, maxScore: 10, completed: resumeScore === 10, label: 'Resume Document & Bio Summary', missingFields: resumeMissing },
    },
    missingSectionsList,
    nextRecommendedAction,
  };
}
