export interface ScoreBreakdown {
  requiredSkillCoverage: number;
  semanticRelevance: number;
  experienceAlignment: number;
  preferredSkillCoverage: number;
  projectRelevance: number;
}

export interface ScoreComponentNote {
  component: string;
  weight: string;
  effectiveWeight: number;
  score: number;
  note: string;
}

export interface RequirementAssessment {
  requirement: string;
  category: string;
  importance: 'required' | 'preferred' | 'mentioned';
  evidenceFound: boolean;
  evidenceType: 'demonstrated' | 'needs_verification' | 'not_evidenced';
  evidenceSnippet?: string;
  status: 'demonstrated' | 'needs_verification' | 'not_evidenced';
  explanation: string;
  suggestedNextStep: string;
}

export interface KeywordRecommendation {
  keyword: string;
  importance: 'required' | 'preferred' | 'mentioned';
  presence: 'present' | 'related' | 'missing';
  reason: string;
  suggestedAction: string;
}

export interface ImprovementPriority {
  title: string;
  detail: string;
  requirement?: string;
  importance: 'required' | 'preferred' | 'mentioned';
  actionType: 'build_evidence' | 'strengthen' | 'clarify' | 'verify';
}

export interface MatchingJobRecommendation {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryFormatted?: string;
  jobType?: string;
  workMode?: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  reason: string;
  trade?: string;
  midcZone?: string;
}

export interface ResumeAnalysisResult {
  analysisId: string;
  analyzedAt: string;
  documentName: string;
  engineUsed?: 'cloud_ai_neural' | 'deterministic_nlp_fallback';
  documentStats: {
    wordCount: number;
    characterCount: number;
    skillsDetectedCount: number;
    yearsOfExperience?: number;
  };
  targetTitle?: string;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreComponents: ScoreComponentNote[];
  explanation: string;
  requirements: RequirementAssessment[];
  keywordRecommendations: KeywordRecommendation[];
  improvementPriorities: ImprovementPriority[];
  recommendedJobs: MatchingJobRecommendation[];
  extractedSkills: string[];
}
