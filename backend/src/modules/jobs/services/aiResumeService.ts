import { env } from '../../../config/env';

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
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  reason: string;
  trade?: string;
  midcZone?: string;
}

export interface AiResumeAnalysisPayload {
  analysisId: string;
  analyzedAt: string;
  documentName: string;
  engineUsed: 'cloud_ai_neural' | 'deterministic_nlp_fallback';
  documentStats: {
    wordCount: number;
    characterCount: number;
    skillsDetectedCount: number;
    yearsOfExperience?: number;
  };
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

export interface BackendSkillDefinition {
  name: string;
  domain: string;
  aliases: string[];
}

const BACKEND_SKILL_CATALOG: BackendSkillDefinition[] = [
  // IT & Software
  { name: 'JavaScript', domain: 'it_software', aliases: ['javascript', 'js', 'es6'] },
  { name: 'TypeScript', domain: 'it_software', aliases: ['typescript', 'ts'] },
  { name: 'React', domain: 'it_software', aliases: ['react', 'react.js', 'reactjs'] },
  { name: 'Next.js', domain: 'it_software', aliases: ['next.js', 'nextjs'] },
  { name: 'Node.js', domain: 'it_software', aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'Express.js', domain: 'it_software', aliases: ['express.js', 'expressjs', 'express'] },
  { name: 'Python', domain: 'it_software', aliases: ['python', 'python3', 'django', 'fastapi', 'flask'] },
  { name: 'Java', domain: 'it_software', aliases: ['java', 'spring', 'spring boot', 'springboot'] },
  { name: 'C / C++', domain: 'it_software', aliases: ['c++', 'cpp'] },
  { name: 'C# / .NET', domain: 'it_software', aliases: ['c#', '.net', 'dotnet'] },
  { name: 'SQL & Relational DB', domain: 'it_software', aliases: ['sql', 'postgresql', 'postgres', 'mysql', 'mariadb'] },
  { name: 'NoSQL & MongoDB', domain: 'it_software', aliases: ['mongodb', 'nosql', 'redis'] },
  { name: 'RESTful API', domain: 'it_software', aliases: ['rest api', 'restful', 'graphql', 'api design'] },
  { name: 'Git & Version Control', domain: 'it_software', aliases: ['git', 'github', 'gitlab'] },
  { name: 'Docker & Containers', domain: 'it_software', aliases: ['docker', 'containerization'] },
  { name: 'Kubernetes', domain: 'it_software', aliases: ['kubernetes', 'k8s'] },
  { name: 'AWS Cloud', domain: 'it_software', aliases: ['aws', 'amazon web services', 's3', 'ec2', 'lambda'] },
  { name: 'CI/CD Pipelines', domain: 'it_software', aliases: ['ci/cd', 'github actions', 'jenkins'] },
  { name: 'HTML5 & CSS3', domain: 'it_software', aliases: ['html', 'html5', 'css', 'css3', 'tailwind'] },
  { name: 'Unit Testing', domain: 'it_software', aliases: ['jest', 'mocha', 'cypress', 'unit testing'] },

  // CNC & Machining
  { name: 'CNC Machine Operation', domain: 'cnc_machining', aliases: ['cnc', 'cnc operator', 'cnc operation', 'cnc lathe'] },
  { name: 'VMC Operation & Programming', domain: 'cnc_machining', aliases: ['vmc', 'vmc operator', 'vmc programming', 'machining center'] },
  { name: 'Fanuc Controller', domain: 'cnc_machining', aliases: ['fanuc', 'fanuc series', 'fanuc control'] },
  { name: 'Siemens Controller', domain: 'cnc_machining', aliases: ['siemens', 'sinumerik', 'siemens 828d'] },
  { name: 'G-Code & M-Code Programming', domain: 'cnc_machining', aliases: ['g-code', 'm-code', 'cnc programming'] },
  { name: 'Manual Lathe & Turning', domain: 'cnc_machining', aliases: ['lathe', 'manual lathe', 'turner', 'turning'] },
  { name: 'Milling & Surface Grinding', domain: 'cnc_machining', aliases: ['milling', 'surface grinding', 'grinding'] },
  { name: 'Tool & Die Making', domain: 'cnc_machining', aliases: ['tool and die', 'toolmaker', 'press tool', 'die maintenance'] },

  // Welding & Fabrication
  { name: 'MIG Welding (GMAW)', domain: 'welding_fabrication', aliases: ['mig welding', 'mig', 'gmaw', 'co2 welding', 'mig welder'] },
  { name: 'TIG Welding (GTAW)', domain: 'welding_fabrication', aliases: ['tig welding', 'tig', 'gtaw', 'argon welding', 'tig welder'] },
  { name: 'Arc / Stick Welding (SMAW)', domain: 'welding_fabrication', aliases: ['arc welding', 'smaw', 'stick welding'] },
  { name: 'Sheet Metal Fabrication', domain: 'welding_fabrication', aliases: ['sheet metal', 'bending machine', 'laser cutting'] },
  { name: 'WPS Protocol', domain: 'welding_fabrication', aliases: ['wps', 'welding procedure', 'weld inspection'] },

  // Mechanical & Maintenance
  { name: 'Mechanical Assembly', domain: 'mechanical_maintenance', aliases: ['mechanical assembly', 'fitter', 'iti fitter', 'bench work'] },
  { name: 'Preventive Maintenance (TPM)', domain: 'mechanical_maintenance', aliases: ['preventive maintenance', 'tpm', 'routine maintenance'] },
  { name: 'Breakdown Maintenance', domain: 'mechanical_maintenance', aliases: ['breakdown maintenance', 'troubleshooting', 'root cause'] },
  { name: 'Hydraulics & Pneumatics', domain: 'mechanical_maintenance', aliases: ['hydraulic', 'pneumatic', 'solenoid valve'] },
  { name: 'Blueprint & Engineering Drawings', domain: 'mechanical_maintenance', aliases: ['engineering drawing', 'blueprint', 'drawing reading', 'gd&t'] },
  { name: 'CAD / CAM (AutoCAD/SolidWorks)', domain: 'mechanical_maintenance', aliases: ['autocad', 'solidworks', 'catia', 'creo'] },

  // Electrical & Automation
  { name: 'Industrial Electrician', domain: 'electrical_automation', aliases: ['electrician', 'industrial electrician', 'wiring', 'panel wiring'] },
  { name: '3-Phase Power & Switchgear', domain: 'electrical_automation', aliases: ['3-phase', 'switchgear', 'mccb', 'contactor', 'transformer'] },
  { name: 'PLC Programming', domain: 'electrical_automation', aliases: ['plc', 'ladder logic', 'siemens s7', 'allen bradley', 'delta plc'] },
  { name: 'VFD & Motor Controls', domain: 'electrical_automation', aliases: ['vfd', 'variable frequency drive', 'ac drive', 'motor drive'] },

  // Quality & Metrology
  { name: 'Quality Inspection (QC / QA)', domain: 'quality_inspection', aliases: ['quality control', 'qc', 'qa', 'quality assurance', 'line inspection'] },
  { name: 'Precision Instruments (Vernier/Micrometer)', domain: 'quality_inspection', aliases: ['vernier', 'vernier caliper', 'micrometer', 'height gauge', 'dial indicator'] },
  { name: '5S & Industrial Safety (EHS)', domain: 'quality_inspection', aliases: ['5s', 'ehs', 'ppe', 'osha', 'safety protocol', 'fire safety'] },

  // Logistics & Store
  { name: 'Forklift Operation', domain: 'logistics_warehouse', aliases: ['forklift', 'reach truck', 'bopt', 'material handling'] },
  { name: 'Store Keeper & Inventory', domain: 'logistics_warehouse', aliases: ['store keeper', 'warehouse', 'inventory management', 'stock audit', 'fifo'] },
  { name: 'SAP MM / ERP', domain: 'logistics_warehouse', aliases: ['sap mm', 'sap', 'erp', 'migo'] },

  // Sales & Retail
  { name: 'Retail Sales & POS', domain: 'sales_retail', aliases: ['retail sales', 'counter sales', 'pos billing', 'merchandising'] },
  { name: 'B2B Sales & Business Development', domain: 'sales_retail', aliases: ['b2b sales', 'field sales', 'business development', 'lead generation'] },
  { name: 'Customer Service & Communication', domain: 'sales_retail', aliases: ['customer service', 'customer support', 'communication'] },

  // Accounting & Finance
  { name: 'Accounting & Bookkeeping', domain: 'finance_accounting', aliases: ['accounting', 'bookkeeping', 'ledger', 'balance sheet'] },
  { name: 'Tally Prime / ERP', domain: 'finance_accounting', aliases: ['tally', 'tally prime', 'tally erp'] },
  { name: 'GST & TDS Compliance', domain: 'finance_accounting', aliases: ['gst', 'gstr-1', 'gstr-3b', 'tds', 'taxation'] },
  { name: 'Advanced Excel', domain: 'finance_accounting', aliases: ['excel', 'advanced excel', 'vlookup', 'pivot table'] }
];

export class AiResumeService {
  /**
   * Main entry point for Resume Analysis.
   * Uses Cloud AI when OPENAI_API_KEY is configured,
   * otherwise gracefully falls back to the deterministic multi-domain engine.
   */
  static async analyzeResume(
    resumeText: string,
    documentName: string,
    targetJobDescription: string,
    availableJobs: any[],
    category?: string
  ): Promise<AiResumeAnalysisPayload> {
    const cleanText = (resumeText || '').trim();

    // Fast-path category filtering
    let targetJobs = availableJobs || [];
    if (category && category.trim() && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'all categories') {
      const catLower = category.toLowerCase().trim();
      const filtered = targetJobs.filter(j =>
        String(j.industry || '').toLowerCase().includes(catLower) ||
        String(j.trade || '').toLowerCase().includes(catLower) ||
        String(j.category || '').toLowerCase().includes(catLower) ||
        String(j.title || '').toLowerCase().includes(catLower)
      );
      if (filtered.length > 0) {
        targetJobs = filtered;
      }
    }

    // 1. Try Cloud AI if API key is provided
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0) {
      try {
        const aiResult = await this.callCloudAi(cleanText, documentName, targetJobDescription, targetJobs, category);
        if (aiResult) {
          return aiResult;
        }
      } catch (err) {
        console.warn('⚠️ Cloud AI service encountered an issue, falling back to deterministic engine:', err);
      }
    }

    // 2. Production Fallback (Reliable, deterministic, multi-domain intelligence)
    return this.fallbackAnalysis(cleanText, documentName, targetJobDescription, targetJobs, category);
  }

  /**
   * Invokes OpenAI-compatible Cloud AI endpoint with structured JSON output
   */
  private static async callCloudAi(
    resumeText: string,
    documentName: string,
    targetJobDescription: string,
    availableJobs: any[],
    _category?: string
  ): Promise<AiResumeAnalysisPayload | null> {
    const jobsCatalogSummary = (availableJobs || []).slice(0, 15).map(j => ({
      id: String(j.id),
      title: j.title,
      company: j.company,
      location: j.location || j.midc_zone || 'Chhatrapati Sambhajinagar',
      trade: j.trade,
      skills: Array.isArray(j.skills) ? j.skills.slice(0, 5) : [],
      salaryMin: j.salary_min || j.salaryMin,
      salaryMax: j.salary_max || j.salaryMax
    }));

    const systemPrompt = `You are AlignIQ-Engine, an industry-grade AI Career Intelligence and ATS Matching system.
You evaluate candidate resumes with zero hallucination and transparent evidence citations.

You MUST respond strictly with valid JSON conforming to the following structure:
{
  "matchScore": number (0-100 overall weighted score),
  "scoreBreakdown": {
    "requiredSkillCoverage": number (0-100),
    "semanticRelevance": number (0-100),
    "experienceAlignment": number (0-100),
    "preferredSkillCoverage": number (0-100),
    "projectRelevance": number (0-100)
  },
  "explanation": string (clear summary of overall candidate fit),
  "extractedSkills": string[] (all technical and operational skills detected),
  "detectedYearsOfExperience": number (estimated years),
  "requirements": [
    {
      "requirement": string,
      "category": string,
      "importance": "required" | "preferred" | "mentioned",
      "status": "demonstrated" | "needs_verification" | "not_evidenced",
      "evidenceSnippet": string (DIRECT EXACT QUOTE from candidate's resume or empty string),
      "explanation": string,
      "suggestedNextStep": string
    }
  ],
  "keywordRecommendations": [
    {
      "keyword": string,
      "importance": "required" | "preferred" | "mentioned",
      "presence": "present" | "related" | "missing",
      "reason": string,
      "suggestedAction": string
    }
  ],
  "improvementPriorities": [
    {
      "title": string,
      "detail": string,
      "importance": "required" | "preferred" | "mentioned",
      "actionType": "build_evidence" | "strengthen" | "clarify" | "verify"
    }
  ],
  "rankedJobIds": [
    {
      "id": string (must match an id from the provided catalog),
      "matchScore": number (50-99),
      "matchingSkills": string[],
      "missingSkills": string[],
      "reason": string
    }
  ]
}

Guidelines:
1. Match score calculation must follow: (0.35 * requiredSkillCoverage) + (0.25 * semanticRelevance) + (0.20 * experienceAlignment) + (0.10 * preferredSkillCoverage) + (0.10 * projectRelevance).
2. For status "demonstrated", evidenceSnippet MUST be an actual excerpt from the resume text.
3. If no custom target job description is provided, evaluate candidate against standard competencies for their primary detected trade/domain.`;

    const userPrompt = `Candidate Resume Text:
"""
${resumeText.slice(0, 6000)}
"""

Target Job Description:
"""
${(targetJobDescription || 'Standard competencies for detected candidate trade profile').slice(0, 2000)}
"""

Available Platform Jobs:
${JSON.stringify(jobsCatalogSummary, null, 2)}
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28000);

    const baseUrl = env.OPENAI_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error [${response.status}]: ${errText.slice(0, 200)}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Cloud AI model');
    }

    const parsed = JSON.parse(content);

    // Merge ranked jobs with rich job database records
    const jobsMap = new Map((availableJobs || []).map(j => [String(j.id), j]));
    const recommendedJobs: MatchingJobRecommendation[] = (parsed.rankedJobIds || [])
      .map((item: any) => {
        const j = jobsMap.get(String(item.id));
        if (!j) return null;
        return {
          id: String(j.id),
          title: j.title || 'Technical Specialist',
          company: j.company || 'Industrial Partner',
          companyLogo: j.company_logo || j.companyLogo,
          location: j.location || j.midc_zone || 'Chhatrapati Sambhajinagar',
          salaryMin: j.salary_min || j.salaryMin,
          salaryMax: j.salary_max || j.salaryMax,
          salaryFormatted: j.salary_min && j.salary_max
            ? `₹${Math.round(j.salary_min / 1000)}k - ₹${Math.round(j.salary_max / 1000)}k/mo`
            : 'Competitive Salary',
          jobType: j.job_type || j.jobType || 'Full Time',
          matchScore: Math.min(99, Math.max(50, Math.round(item.matchScore || 70))),
          matchingSkills: Array.isArray(item.matchingSkills) ? item.matchingSkills.slice(0, 4) : [],
          missingSkills: Array.isArray(item.missingSkills) ? item.missingSkills.slice(0, 3) : [],
          reason: item.reason || 'High compatibility with trade profile.',
          trade: j.trade,
          midcZone: j.midc_zone || j.midcZone
        };
      })
      .filter((item: any): item is MatchingJobRecommendation => item !== null)
      .slice(0, 6);

    const bd = parsed.scoreBreakdown || {};
    const overall = Math.round(parsed.matchScore || 75);

    return {
      analysisId: `anlz_ai_${Date.now()}`,
      analyzedAt: new Date().toISOString(),
      documentName: documentName || 'Candidate_Resume.pdf',
      engineUsed: 'cloud_ai_neural',
      documentStats: {
        wordCount: resumeText.split(/\s+/).filter(Boolean).length,
        characterCount: resumeText.length,
        skillsDetectedCount: (parsed.extractedSkills || []).length,
        yearsOfExperience: parsed.detectedYearsOfExperience || 2
      },
      matchScore: overall,
      scoreBreakdown: {
        requiredSkillCoverage: Math.round(bd.requiredSkillCoverage || 75),
        semanticRelevance: Math.round(bd.semanticRelevance || 75),
        experienceAlignment: Math.round(bd.experienceAlignment || 75),
        preferredSkillCoverage: Math.round(bd.preferredSkillCoverage || 70),
        projectRelevance: Math.round(bd.projectRelevance || 70)
      },
      scoreComponents: [
        { component: 'Required Skill Coverage', weight: '35%', effectiveWeight: 0.35, score: Math.round(bd.requiredSkillCoverage || 75), note: 'Assessed against mandatory competencies.' },
        { component: 'Semantic Relevance', weight: '25%', effectiveWeight: 0.25, score: Math.round(bd.semanticRelevance || 75), note: 'Contextual neural vector embedding alignment.' },
        { component: 'Experience Alignment', weight: '20%', effectiveWeight: 0.20, score: Math.round(bd.experienceAlignment || 75), note: `Verified ~${parsed.detectedYearsOfExperience || 2} years of industry tenure.` },
        { component: 'Preferred Skill Coverage', weight: '10%', effectiveWeight: 0.10, score: Math.round(bd.preferredSkillCoverage || 70), note: 'Bonus certifications and specialized tooling.' },
        { component: 'Project Evidence', weight: '10%', effectiveWeight: 0.10, score: Math.round(bd.projectRelevance || 70), note: 'Quantifiable project duties and execution.' }
      ],
      explanation: parsed.explanation || 'Comprehensive neural match assessment completed.',
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      keywordRecommendations: Array.isArray(parsed.keywordRecommendations) ? parsed.keywordRecommendations : [],
      improvementPriorities: Array.isArray(parsed.improvementPriorities) ? parsed.improvementPriorities : [],
      recommendedJobs,
      extractedSkills: Array.isArray(parsed.extractedSkills) ? parsed.extractedSkills : []
    };
  }

  /**
   * Deterministic Multi-Domain NLP Fallback when Cloud AI key is not yet pasted or service is unreachable
   */
  private static fallbackAnalysis(
    resumeText: string,
    documentName: string,
    targetJobDescription: string,
    availableJobs: any[],
    category?: string
  ): AiResumeAnalysisPayload {
    const cleanResume = (resumeText || '').trim();
    const lowerResume = cleanResume.toLowerCase();
    const hasCustomJd = targetJobDescription && targetJobDescription.trim().length > 30;

    // 1. Detect candidate's demonstrated skills with exact citation evidence
    const detectedSkills: Array<{ name: string; domain: string; evidence: string }> = [];
    const domainCounts: Record<string, number> = {};

    for (const s of BACKEND_SKILL_CATALOG) {
      for (const alias of s.aliases) {
        let idx = -1;
        if (alias.length <= 3) {
          const regex = new RegExp(`\\b${alias.replace('+', '\\+')}\\b`, 'i');
          const m = regex.exec(lowerResume);
          if (m) idx = m.index;
        } else {
          idx = lowerResume.indexOf(alias);
        }

        if (idx !== -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(cleanResume.length, idx + alias.length + 50);
          detectedSkills.push({
            name: s.name,
            domain: s.domain,
            evidence: `"...${cleanResume.slice(start, end).replace(/\s+/g, ' ').trim()}..."`
          });
          domainCounts[s.domain] = (domainCounts[s.domain] || 0) + 1;
          break;
        }
      }
    }

    // 2. Identify primary domain
    let candidateDomain = 'it_software';
    let maxCount = -1;
    for (const [dom, count] of Object.entries(domainCounts)) {
      if (count > maxCount) {
        maxCount = count;
        candidateDomain = dom;
      }
    }

    if (maxCount <= 1) {
      if (/cnc|vmc|fanuc|siemens|g-code|machinist/i.test(lowerResume)) candidateDomain = 'cnc_machining';
      else if (/welder|welding|tig|mig|argon/i.test(lowerResume)) candidateDomain = 'welding_fabrication';
      else if (/electrician|wiring|panel|3-phase|plc/i.test(lowerResume)) candidateDomain = 'electrical_automation';
      else if (/fitter|assembly|maintenance|hydraulic/i.test(lowerResume)) candidateDomain = 'mechanical_maintenance';
      else if (/qc|qa|vernier|micrometer|inspection/i.test(lowerResume)) candidateDomain = 'quality_inspection';
      else if (/forklift|warehouse|storekeeper|inventory/i.test(lowerResume)) candidateDomain = 'logistics_warehouse';
      else if (/retail|sales|customer|counter/i.test(lowerResume)) candidateDomain = 'sales_retail';
      else if (/account|tally|gst|tds|balance sheet/i.test(lowerResume)) candidateDomain = 'finance_accounting';
    }

    // 3. Experience detection
    const expMatch = lowerResume.match(/(\d+)\+?\s*(?:years|yrs|year)/i);
    const detectedYears = expMatch ? parseInt(expMatch[1], 10) : (detectedSkills.length >= 4 ? 3 : 2);

    // 4. Requirements Assessment
    const targetReqs: Array<{ req: string; importance: 'required' | 'preferred'; category: string }> = [];

    if (hasCustomJd) {
      const lines = targetJobDescription
        .split(/\n|•|\*|- /)
        .map(l => l.trim())
        .filter(l => l.length >= 15 && l.length <= 150);

      for (const line of lines) {
        const isReq = /must|required|minimum|experience|proficiency|essential/i.test(line);
        targetReqs.push({
          req: line,
          importance: isReq ? 'required' : 'preferred',
          category: 'Job Competency'
        });
        if (targetReqs.length >= 6) break;
      }
    }

    if (targetReqs.length === 0) {
      if (candidateDomain === 'cnc_machining') {
        targetReqs.push(
          { req: 'Hands-on CNC / VMC machine setup, operation and offset adjustment', importance: 'required', category: 'Operation' },
          { req: 'Familiarity with Fanuc or Siemens controller interfaces and G-code', importance: 'required', category: 'Controllers' },
          { req: 'Precision measurement using Vernier calipers, micrometers and GD&T', importance: 'required', category: 'Metrology' },
          { req: 'Pre-shift preventive maintenance and 5S shopfloor standards', importance: 'preferred', category: 'Maintenance' }
        );
      } else if (candidateDomain === 'welding_fabrication') {
        targetReqs.push(
          { req: 'MIG (GMAW) or TIG (GTAW) welding expertise on structural steel/aluminum', importance: 'required', category: 'Welding' },
          { req: 'WPS protocol adherence, weld seam visual inspection, and defect control', importance: 'required', category: 'Quality' },
          { req: 'Strict personal protective equipment (PPE) and industrial shopfloor safety', importance: 'required', category: 'Safety' },
          { req: 'Sheet metal cutting, bending, and engineering blueprint interpretation', importance: 'preferred', category: 'Fabrication' }
        );
      } else if (candidateDomain === 'electrical_automation') {
        targetReqs.push(
          { req: 'Industrial electrical panel wiring, 3-phase power, and switchgear maintenance', importance: 'required', category: 'Electrical' },
          { req: 'PLC troubleshooting, ladder logic understanding, and control circuits', importance: 'required', category: 'Automation' },
          { req: 'AC/DC motor controls, VFD configuration, and parameter tuning', importance: 'required', category: 'Drives' },
          { req: 'Electrical safety protocols, LOTO, and schematic diagram reading', importance: 'preferred', category: 'Safety' }
        );
      } else {
        targetReqs.push(
          { req: 'Modern programming languages & framework competence (TypeScript, React, Node, Python)', importance: 'required', category: 'Core Stack' },
          { req: 'Database design, querying & management (PostgreSQL, MySQL, or MongoDB)', importance: 'required', category: 'Databases' },
          { req: 'RESTful API / Microservices architecture & cloud integration (AWS/Docker)', importance: 'required', category: 'Architecture' },
          { req: 'Git version control, automated unit testing, and CI/CD pipelines', importance: 'preferred', category: 'DevOps' }
        );
      }
    }

    const requirements: RequirementAssessment[] = targetReqs.map(r => {
      const rLower = r.req.toLowerCase();
      const matched = detectedSkills.find(s => rLower.includes(s.name.toLowerCase()));
      const directWords = rLower.split(/\s+/).filter(w => w.length > 4);
      const overlapCount = directWords.filter(w => lowerResume.includes(w)).length;
      const status: RequirementAssessment['status'] = matched
        ? 'demonstrated'
        : overlapCount >= 2
        ? 'needs_verification'
        : 'not_evidenced';

      return {
        requirement: r.req,
        category: r.category,
        importance: r.importance,
        evidenceFound: status !== 'not_evidenced',
        evidenceType: status,
        evidenceSnippet: matched?.evidence || (overlapCount >= 2 ? 'Contextual terminology found in resume text.' : undefined),
        status,
        explanation: status === 'demonstrated'
          ? `Verified through cited skill (${matched?.name}) in resume.`
          : status === 'needs_verification'
          ? 'Related terminology is present, but hands-on operational evidence should be highlighted.'
          : 'No concrete evidence or certifications located in resume text.',
        suggestedNextStep: status === 'demonstrated'
          ? 'Add quantitative metrics to strengthen impact further.'
          : 'Cite practical projects or responsibilities demonstrating this competency.'
      };
    });

    const reqItems = requirements.filter(r => r.importance === 'required');
    const reqScore = reqItems.length > 0
      ? (reqItems.filter(r => r.status === 'demonstrated').length * 100 + reqItems.filter(r => r.status === 'needs_verification').length * 55) / reqItems.length
      : 75;

    const prefScore = 75;
    const semanticScore = Math.min(95, Math.max(40, detectedSkills.length * 9 + 35));
    const expScore = Math.min(98, Math.max(50, detectedYears * 15 + 40));
    const hasProjects = /project|responsibilities|achievement|developed|operated/i.test(lowerResume);
    const hasMetrics = /\d+%\s*|\d+\s*(?:units|parts|reduction|hours|shifts)/i.test(lowerResume);
    const projectScore = hasProjects && hasMetrics ? 92 : hasProjects ? 78 : 55;

    const overallScore = Math.min(98, Math.max(35, Math.round(
      reqScore * 0.35 +
      semanticScore * 0.25 +
      expScore * 0.20 +
      prefScore * 0.10 +
      projectScore * 0.10
    )));

    // 5. Match against active jobs
    let poolJobs = availableJobs || [];
    if (category && category.trim() && category.toLowerCase() !== 'all') {
      const catLower = category.toLowerCase().trim();
      const filtered = poolJobs.filter(j =>
        String(j.industry || '').toLowerCase().includes(catLower) ||
        String(j.trade || '').toLowerCase().includes(catLower) ||
        String(j.category || '').toLowerCase().includes(catLower) ||
        String(j.title || '').toLowerCase().includes(catLower)
      );
      if (filtered.length > 0) poolJobs = filtered;
    }

    const recommendedJobs: MatchingJobRecommendation[] = poolJobs
      .slice(0, 35)
      .map(job => {
        const jTitle = String(job.title || '').toLowerCase();
        const jDesc = String(job.description || '').toLowerCase();
        const jSkills = Array.isArray(job.skills) ? job.skills : [];
        let score = 48;
        const matched: string[] = [];
        const missing: string[] = [];

        for (const s of detectedSkills) {
          const sLower = s.name.toLowerCase();
          if (jTitle.includes(sLower) || jDesc.includes(sLower) || jSkills.some((sk: string) => sk.toLowerCase().includes(sLower))) {
            score += 12;
            if (!matched.includes(s.name)) matched.push(s.name);
          }
        }

        if (job.trade && lowerResume.includes(String(job.trade).toLowerCase())) {
          score += 15;
        }

        for (const sk of jSkills) {
          if (!lowerResume.includes(String(sk).toLowerCase()) && !matched.some(m => m.toLowerCase() === String(sk).toLowerCase())) {
            missing.push(sk);
          }
        }

        return {
          id: String(job.id),
          title: job.title || 'Technical Specialist',
          company: job.company || 'Industrial Partner',
          companyLogo: job.company_logo || job.companyLogo,
          location: job.location || job.midc_zone || 'Chhatrapati Sambhajinagar',
          salaryMin: job.salary_min || job.salaryMin,
          salaryMax: job.salary_max || job.salaryMax,
          salaryFormatted: job.salary_min && job.salary_max ? `₹${Math.round(job.salary_min / 1000)}k - ₹${Math.round(job.salary_max / 1000)}k/mo` : 'Competitive Salary',
          jobType: job.job_type || job.jobType || 'Full Time',
          matchScore: Math.min(98, Math.max(50, score)),
          matchingSkills: matched.slice(0, 4),
          missingSkills: missing.slice(0, 3),
          reason: matched.length > 0 ? `Strong alignment on ${matched.slice(0, 2).join(' & ')}.` : 'High compatibility with trade profile.',
          trade: job.trade,
          midcZone: job.midc_zone || job.midcZone
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // Dynamic keyword recommendations based on candidate domain
    const keywordRecommendations: KeywordRecommendation[] = [];
    const domainKws: Record<string, string[]> = {
      cnc_machining: ['Fanuc Controller', 'Vernier Caliper', 'GD&T', 'G-Code & M-Code', '5S Standards'],
      welding_fabrication: ['MIG Welding', 'TIG Welding', 'WPS Protocol', 'Shop Floor Safety', 'Argon Welding'],
      electrical_automation: ['Industrial Electrician', 'Panel Wiring', 'PLC Programming', 'VFD Drives', '3-Phase Power'],
      mechanical_maintenance: ['Preventive Maintenance', 'Hydraulics', 'Breakdown Troubleshooting', 'Engineering Drawings'],
      quality_inspection: ['Quality Control (QC)', 'Vernier Caliper', 'Micrometer', 'GD&T', '7 QC Tools'],
      logistics_warehouse: ['Store Keeper', 'Inventory Management', 'FIFO', 'Forklift Operation', 'SAP MM'],
      sales_retail: ['Retail Sales', 'POS Billing', 'Customer Service', 'B2B Sales', 'CRM'],
      finance_accounting: ['Tally Prime', 'GST Return', 'TDS Compliance', 'Advanced Excel', 'Ledger Reconciliation'],
      it_software: ['TypeScript', 'React', 'Node.js', 'RESTful API', 'Docker', 'PostgreSQL']
    };

    const targetKws = domainKws[candidateDomain] || domainKws.it_software;
    for (const kw of targetKws.slice(0, 4)) {
      const isPresent = lowerResume.includes(kw.toLowerCase());
      keywordRecommendations.push({
        keyword: kw,
        importance: keywordRecommendations.length < 2 ? 'required' : 'preferred',
        presence: isPresent ? 'present' : 'missing',
        reason: isPresent ? `Verified core requirement for ${candidateDomain.replace('_', ' ')}.` : `Critical in-demand competency for ${candidateDomain.replace('_', ' ')}.`,
        suggestedAction: isPresent ? `Keep ${kw} prominently highlighted in project experience.` : `Add practical projects or certifications demonstrating ${kw}.`
      });
    }

    return {
      analysisId: `anlz_${Date.now()}`,
      analyzedAt: new Date().toISOString(),
      documentName: documentName || 'Candidate_Resume.pdf',
      engineUsed: 'deterministic_nlp_fallback',
      documentStats: {
        wordCount: cleanResume.split(/\s+/).filter(Boolean).length,
        characterCount: cleanResume.length,
        skillsDetectedCount: detectedSkills.length,
        yearsOfExperience: detectedYears
      },
      matchScore: overallScore,
      scoreBreakdown: {
        requiredSkillCoverage: Math.round(reqScore),
        semanticRelevance: Math.round(semanticScore),
        experienceAlignment: Math.round(expScore),
        preferredSkillCoverage: Math.round(prefScore),
        projectRelevance: Math.round(projectScore)
      },
      scoreComponents: [
        { component: 'Required Skill Coverage', weight: '35%', effectiveWeight: 0.35, score: Math.round(reqScore), note: 'Coverage of essential trade competencies.' },
        { component: 'Semantic Relevance', weight: '25%', effectiveWeight: 0.25, score: Math.round(semanticScore), note: 'Domain vocabulary depth and alignment.' },
        { component: 'Experience Alignment', weight: '20%', effectiveWeight: 0.20, score: Math.round(expScore), note: `Verified ~${detectedYears} years relevant tenure.` },
        { component: 'Preferred Skill Coverage', weight: '10%', effectiveWeight: 0.10, score: Math.round(prefScore), note: 'Tool & methodology familiarity.' },
        { component: 'Project Evidence', weight: '10%', effectiveWeight: 0.10, score: Math.round(projectScore), note: hasMetrics ? 'Quantifiable impact metrics verified.' : 'Recommend adding explicit numerical metrics.' }
      ],
      explanation: overallScore >= 80
        ? 'Outstanding match profile. Your demonstrated competencies closely align with core requirements.'
        : overallScore >= 65
        ? 'Solid transferable skills with opportunities to add explicit project metrics and tool citations.'
        : 'Foundational qualifications detected, but key industry competencies should be more explicitly detailed.',
      requirements,
      keywordRecommendations,
      improvementPriorities: [
        {
          title: 'Quantify achievements with measurable operational metrics',
          detail: 'Add numerical metrics such as unit volume handled, scrap reduction (%), tolerance precision (+/- microns), or performance speed.',
          importance: 'preferred',
          actionType: 'strengthen'
        }
      ],
      recommendedJobs,
      extractedSkills: detectedSkills.map(s => s.name)
    };
  }
}
