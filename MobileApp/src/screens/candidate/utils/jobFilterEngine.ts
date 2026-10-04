import { Job } from '../../../types';
import { FilterOptions } from '../../../components/common/JobFilterSideDrawer';
import { matchJobAgainstKeyword } from './jobMatchUtils';

/**
 * Normalizes text by removing hyphens, underscores, and whitespace
 */
function normalizeAlphanumeric(val: string): string {
  return (val || '').toLowerCase().replace(/[-_\s]+/g, '');
}

/**
 * Checks if a candidate's industry selection matches a given job
 */
function matchIndustry(job: Job, targetIndustry: string): boolean {
  if (!targetIndustry || targetIndustry === 'All Industries') return true;

  const rawTarget = targetIndustry.toLowerCase().trim();
  const jobInd = (job.industry || '').toLowerCase();
  const jobTitle = (job.title || '').toLowerCase();
  const jobTrade = (job.trade || '').toLowerCase();
  const jobDesc = (job.description || '').toLowerCase();
  const jobCompany = (job.company || '').toLowerCase();
  const allJobText = `${jobInd} ${jobTitle} ${jobTrade} ${jobCompany} ${jobDesc}`;

  // Direct substring match
  if (jobInd.includes(rawTarget) || rawTarget.includes(jobInd)) {
    return true;
  }

  // Domain synonym clusters for enterprise-grade matching
  if (rawTarget.includes('auto')) {
    const autoKeywords = [
      'auto',
      'automotive',
      'automobile',
      'vehicle',
      'motor',
      'car',
      'bike',
      'oem',
      'tyre',
      'rubber',
      'wiring harness',
      'component',
      'chassis',
      'transmission',
    ];
    if (autoKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('heavy') || rawTarget.includes('industrial') || rawTarget.includes('manufacturing')) {
    const mfgKeywords = [
      'manufactur',
      'industrial',
      'heavy',
      'equipment',
      'production',
      'plant',
      'diesel',
      'engine',
      'machinery',
      'assembly',
      'factory',
      'casting',
    ];
    if (mfgKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('cnc') || rawTarget.includes('machin') || rawTarget.includes('tool')) {
    const cncKeywords = [
      'cnc',
      'vmc',
      'machin',
      'tooling',
      'precision',
      'lathe',
      'forging',
      'milling',
      'die maker',
      'turner',
      'grind',
      'honing',
    ];
    if (cncKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('pharma') || rawTarget.includes('chemical')) {
    const pharmaKeywords = [
      'pharma',
      'pharmaceutical',
      'chemical',
      'biotech',
      'drug',
      'formulation',
      'healthcare',
      'cosmetic',
      'lab',
      'medicine',
      'hospital',
      'clinic',
    ];
    if (pharmaKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('electric') || rawTarget.includes('electron')) {
    const elecKeywords = [
      'electric',
      'electron',
      'wiring',
      'harness',
      'circuit',
      'automation',
      'switch',
      'appliance',
      'optical fibre',
      'telecom',
      'pcb',
      'cable',
    ];
    if (elecKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('steel') || rawTarget.includes('metal') || rawTarget.includes('fabricat')) {
    const metalKeywords = [
      'steel',
      'metal',
      'fabricat',
      'weld',
      'sheet metal',
      'tubular',
      'iron',
      'casting',
      'foundry',
      'structural',
      'fitting',
    ];
    if (metalKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('packag') || rawTarget.includes('paper') || rawTarget.includes('print')) {
    const packKeywords = [
      'packag',
      'paper',
      'print',
      'polymer',
      'film',
      'can',
      'box',
      'corrugat',
      'carton',
      'label',
    ];
    if (packKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('food') || rawTarget.includes('beverage')) {
    const foodKeywords = [
      'food',
      'beverage',
      'dairy',
      'brew',
      'fmcg',
      'distill',
      'spirits',
      'snack',
      'edible',
      'grain',
      'sugar',
      'biscuit',
      'bakery',
    ];
    if (foodKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('textile') || rawTarget.includes('garment')) {
    const textileKeywords = [
      'textile',
      'garment',
      'fibre',
      'fiber',
      'cloth',
      'yarn',
      'fabric',
      'spin',
      'weaving',
      'apparel',
      'stitching',
    ];
    if (textileKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('warehouse') || rawTarget.includes('logistic')) {
    const logKeywords = [
      'warehouse',
      'logistic',
      'supply',
      'dispatch',
      'store',
      'transport',
      'forklift',
      'inventory',
      'shipping',
      'delivery',
    ];
    if (logKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  if (rawTarget.includes('it ') || rawTarget.includes('software')) {
    const itKeywords = [
      'software',
      'it ',
      'information tech',
      'developer',
      'computer',
      'web',
      'engineer r&d',
      'programming',
      'system',
    ];
    if (itKeywords.some((kw) => allJobText.includes(kw))) return true;
  }

  // Token fallback
  const indTokens = rawTarget
    .split(/[\s&,/()]+/)
    .map((t) => t.replace(/(s|ing|als|ics)$/, ''))
    .filter((t) => t.length >= 3);

  return (
    indTokens.length === 0 ||
    indTokens.some((t) => allJobText.includes(t))
  );
}

/**
 * Checks if a candidate's education selection matches a given job
 */
function matchEducation(job: Job, targetEducation: string): boolean {
  if (!targetEducation || targetEducation === 'All Education Levels') return true;

  const target = targetEducation.toLowerCase().trim();
  const eduReq = (
    job.educationRequirement ||
    job.education_requirement ||
    (typeof (job as any).education === 'string' ? (job as any).education : '')
  ).toLowerCase();

  const title = (job.title || '').toLowerCase();
  const trade = (job.trade || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const reqs = Array.isArray(job.requirements) ? job.requirements.join(' ').toLowerCase() : '';
  const allText = `${eduReq} ${title} ${trade} ${desc} ${reqs}`;

  if (target.includes('10th') || target.includes('ssc')) {
    return (
      eduReq.includes('10th') ||
      eduReq.includes('ssc') ||
      eduReq.includes('matric') ||
      eduReq.includes('school') ||
      allText.includes('10th pass') ||
      allText.includes('10th') ||
      allText.includes('ssc') ||
      allText.includes('helper') ||
      allText.includes('general worker') ||
      allText.includes('unskilled')
    );
  }

  if (target.includes('12th') || target.includes('hsc')) {
    return (
      eduReq.includes('12th') ||
      eduReq.includes('hsc') ||
      eduReq.includes('10+2') ||
      eduReq.includes('higher secondary') ||
      eduReq.includes('intermediate') ||
      allText.includes('12th pass') ||
      allText.includes('12th') ||
      allText.includes('hsc')
    );
  }

  if (target.includes('iti')) {
    return (
      eduReq.includes('iti') ||
      eduReq.includes('nctvt') ||
      eduReq.includes('ncvt') ||
      eduReq.includes('trade') ||
      allText.includes('iti') ||
      allText.includes('fitter') ||
      allText.includes('welder') ||
      allText.includes('electrician') ||
      allText.includes('machinist') ||
      allText.includes('turner') ||
      allText.includes('tool & die') ||
      allText.includes('cnc') ||
      allText.includes('vmc')
    );
  }

  if (target.includes('diploma')) {
    return (
      eduReq.includes('diploma') ||
      eduReq.includes('polytechnic') ||
      eduReq.includes('dme') ||
      eduReq.includes('dee') ||
      eduReq.includes('dce') ||
      allText.includes('diploma') ||
      allText.includes('polytechnic')
    );
  }

  if (target.includes('b.e') || target.includes('b.tech') || target.includes('engineering graduate')) {
    return (
      eduReq.includes('b.e') ||
      eduReq.includes('b.tech') ||
      eduReq.includes('be ') ||
      eduReq.includes('btech') ||
      eduReq.includes('engineering') ||
      eduReq.includes('degree') ||
      allText.includes('b.e.') ||
      allText.includes('b.tech') ||
      allText.includes('graduate engineer')
    );
  }

  if (target.includes('graduate') && !target.includes('post graduate')) {
    return (
      eduReq.includes('graduate') ||
      eduReq.includes('degree') ||
      eduReq.includes('b.sc') ||
      eduReq.includes('bsc') ||
      eduReq.includes('b.com') ||
      eduReq.includes('bcom') ||
      eduReq.includes('ba ') ||
      eduReq.includes('bca') ||
      eduReq.includes('bba') ||
      allText.includes('graduate') ||
      allText.includes('b.sc') ||
      allText.includes('b.com') ||
      allText.includes('bca')
    );
  }

  if (target.includes('post graduate') || target.includes('m.tech') || target.includes('mba')) {
    return (
      eduReq.includes('post graduate') ||
      eduReq.includes('pg') ||
      eduReq.includes('m.tech') ||
      eduReq.includes('mtech') ||
      eduReq.includes('mba') ||
      eduReq.includes('mca') ||
      eduReq.includes('m.sc') ||
      eduReq.includes('master') ||
      allText.includes('post graduate') ||
      allText.includes('m.tech') ||
      allText.includes('mba')
    );
  }

  return matchJobAgainstKeyword(job, targetEducation);
}

/**
 * Checks if a candidate's job role matches a given job
 */
function matchJobRole(job: Job, targetRole?: string): boolean {
  if (!targetRole || targetRole === 'All Roles') return true;

  const roleTarget = targetRole.toLowerCase().trim();
  const jobTitle = (job.title || '').toLowerCase();
  const jobTrade = (job.trade || '').toLowerCase();
  const jobDesc = (job.description || '').toLowerCase();
  const skillsText = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';
  const reqsText = Array.isArray(job.requirements) ? job.requirements.join(' ').toLowerCase() : '';
  const allText = `${jobTitle} ${jobTrade} ${skillsText} ${reqsText} ${jobDesc}`;

  if (allText.includes(roleTarget)) {
    return true;
  }

  const roleTokens = roleTarget
    .split(/[\s/()&,]+/)
    .map((t) => t.replace(/(s|ing|er|or|ist)$/, ''))
    .filter((t) => t.length >= 2);

  return (
    roleTokens.length === 0 ||
    roleTokens.some((t) => allText.includes(t))
  );
}

/**
 * Checks if a candidate's experience selection matches a given job
 */
function matchExperience(job: Job, targetExp?: string): boolean {
  if (!targetExp || targetExp === 'All Experience') return true;

  const rawExp = targetExp.toLowerCase().trim();
  const minExp = Number(job.min_experience ?? (job as any).minExperience ?? 0);
  const maxExp = Number(job.max_experience ?? (job as any).maxExperience ?? (minExp > 0 ? minExp + 2 : 0));
  const expRequired = job.experience_required ?? (job as any).experienceRequired ?? (minExp > 0);

  const title = (job.title || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const reqs = Array.isArray(job.requirements) ? job.requirements.join(' ').toLowerCase() : '';
  const allText = `${title} ${desc} ${reqs}`;

  if (rawExp.includes('fresher') || rawExp.includes('0 yr')) {
    return (
      minExp === 0 ||
      expRequired === false ||
      allText.includes('fresher') ||
      allText.includes('trainee') ||
      allText.includes('entry level') ||
      allText.includes('no experience') ||
      allText.includes('apprentice')
    );
  }

  if (rawExp.includes('1-3') || rawExp.includes('1 to 3')) {
    return (
      (minExp <= 3 && maxExp >= 1) ||
      (minExp >= 1 && minExp <= 3) ||
      (minExp === 0 && maxExp >= 1) ||
      allText.includes('1 year') ||
      allText.includes('2 year') ||
      allText.includes('3 year') ||
      allText.includes('1-3')
    );
  }

  if (rawExp.includes('3-5') || rawExp.includes('3 to 5')) {
    return (
      (minExp <= 5 && maxExp >= 3) ||
      (minExp >= 3 && minExp <= 5) ||
      allText.includes('3 year') ||
      allText.includes('4 year') ||
      allText.includes('5 year') ||
      allText.includes('3-5')
    );
  }

  if (rawExp.includes('5+') || rawExp.includes('5 plus') || rawExp.includes('5 years')) {
    return (
      maxExp >= 5 ||
      minExp >= 4 ||
      allText.includes('5+ years') ||
      allText.includes('senior') ||
      allText.includes('lead') ||
      allText.includes('manager')
    );
  }

  return true;
}

/**
 * Checks if a candidate's MIDC / Location selection matches a given job
 */
function matchLocation(job: Job, targetZone?: string): boolean {
  if (!targetZone || targetZone === 'All MIDC Zones') return true;

  const rawZone = targetZone.toLowerCase().trim();
  const jobMidc = ((job as any).midc_zone || (job as any).midcZone || '').toLowerCase();
  const jobLoc = (job.location || '').toLowerCase();
  const jobAddr = ((job as any).interview_address || (job as any).interviewAddress || '').toLowerCase();
  const jobDesc = (job.description || '').toLowerCase();
  const allLocText = `${jobMidc} ${jobLoc} ${jobAddr} ${jobDesc}`;

  // Direct substring match
  if (allLocText.includes(rawZone) || (jobMidc && rawZone.includes(jobMidc))) {
    return true;
  }

  // Key industrial cluster tokens
  if (rawZone.includes('waluj')) return allLocText.includes('waluj');
  if (rawZone.includes('shendra')) return allLocText.includes('shendra') || allLocText.includes('auric');
  if (rawZone.includes('chikalthana')) return allLocText.includes('chikalthana');
  if (rawZone.includes('chitegaon')) return allLocText.includes('chitegaon');
  if (rawZone.includes('paithan')) return allLocText.includes('paithan');
  if (rawZone.includes('bidkin')) return allLocText.includes('bidkin') || allLocText.includes('auric');
  if (rawZone.includes('railway station')) return allLocText.includes('railway') || allLocText.includes('station');
  if (rawZone.includes('chhatrapati sambhajinagar') || rawZone.includes('aurangabad')) {
    return (
      allLocText.includes('sambhajinagar') ||
      allLocText.includes('aurangabad') ||
      allLocText.includes('waluj') ||
      allLocText.includes('shendra') ||
      allLocText.includes('chikalthana') ||
      allLocText.includes('chitegaon') ||
      allLocText.includes('bidkin')
    );
  }
  if (rawZone.includes('chakan')) return allLocText.includes('chakan');
  if (rawZone.includes('bhosari')) return allLocText.includes('bhosari');
  if (rawZone.includes('talegaon')) return allLocText.includes('talegaon');
  if (rawZone.includes('ranjangaon')) return allLocText.includes('ranjangaon');
  if (rawZone.includes('taloja')) return allLocText.includes('taloja');
  if (rawZone.includes('thane') || rawZone.includes('belapur')) return allLocText.includes('thane') || allLocText.includes('belapur');

  const zoneTokens = rawZone
    .replace(/\s*\([^)]*\)/g, '')
    .split(/[\s,/-]+/)
    .filter((t) => t.length > 2 && t !== 'midc' && t !== 'zone' && t !== 'area');

  return (
    zoneTokens.length === 0 ||
    zoneTokens.some((t) => allLocText.includes(t))
  );
}

/**
 * Checks if a candidate's Job Type selection matches a given job
 */
function matchJobType(job: Job, targetType?: string): boolean {
  if (!targetType || targetType === 'All Types') return true;

  const targetClean = normalizeAlphanumeric(targetType);
  const jTypeClean = normalizeAlphanumeric(job.job_type || (job as any).jobType || '');

  if (!jTypeClean) return true; // If unspecified, don't over-filter
  return jTypeClean.includes(targetClean) || targetClean.includes(jTypeClean);
}

/**
 * Checks if a candidate's Work Mode selection matches a given job
 */
function matchWorkMode(job: Job, targetMode?: string): boolean {
  if (!targetMode || targetMode === 'All Modes') return true;

  const targetClean = normalizeAlphanumeric(targetMode);
  const jModeClean = normalizeAlphanumeric(job.work_mode || (job as any).workMode || '');

  if (!jModeClean) return true; // If unspecified, don't over-filter
  return jModeClean.includes(targetClean) || targetClean.includes(jModeClean);
}

/**
 * Checks if candidate's amenities selection matches a given job
 */
function matchAmenities(job: Job, filters: FilterOptions): boolean {
  const perks = Array.isArray(job.perks)
    ? job.perks.map((p) => (p || '').toLowerCase())
    : [];

  if (filters.busFacility) {
    const hasBus =
      Boolean(job.bus_facility || (job as any).busFacility) ||
      perks.some((p) => p.includes('bus') || p.includes('transport') || p.includes('pick') || p.includes('drop'));
    if (!hasBus) return false;
  }

  if (filters.canteen) {
    const hasCanteen =
      Boolean(job.canteen || (job as any).canteen) ||
      perks.some((p) => p.includes('canteen') || p.includes('food') || p.includes('meal') || p.includes('lunch'));
    if (!hasCanteen) return false;
  }

  if (filters.accommodation) {
    const hasRoom =
      Boolean(job.accommodation || (job as any).accommodation) ||
      perks.some((p) => p.includes('room') || p.includes('hostel') || p.includes('accommodation') || p.includes('stay'));
    if (!hasRoom) return false;
  }

  if (filters.overtime) {
    const hasOt =
      Boolean(job.overtime || (job as any).overtime) ||
      perks.some((p) => p.includes('overtime') || p.includes('ot') || p.includes('extra hours'));
    if (!hasOt) return false;
  }

  return true;
}

/**
 * Matches category filter chips (e.g. 'All Jobs', 'HR Jobs', 'ITI & Trade Jobs')
 */
function matchCategory(job: Job, category?: string): boolean {
  if (!category || category === 'All Jobs') return true;

  const cat = category.toLowerCase().trim();
  const title = (job.title || '').toLowerCase();
  const trade = (job.trade || '').toLowerCase();
  const industry = (job.industry || '').toLowerCase();
  const allText = `${title} ${trade} ${industry}`;

  if (cat.includes('hr')) {
    return allText.includes('hr') || allText.includes('human resource') || allText.includes('recruiter') || allText.includes('talent');
  }

  if (cat.includes('marketing')) {
    return allText.includes('marketing') || allText.includes('sales') || allText.includes('business development') || allText.includes('branding');
  }

  if (cat.includes('iti') || cat.includes('trade')) {
    return (
      allText.includes('iti') ||
      allText.includes('fitter') ||
      allText.includes('welder') ||
      allText.includes('wireman') ||
      allText.includes('electrician') ||
      allText.includes('cnc') ||
      allText.includes('vmc') ||
      allText.includes('machinist') ||
      allText.includes('turner') ||
      allText.includes('operator') ||
      allText.includes('technician')
    );
  }

  if (cat.includes('health') || cat.includes('medical')) {
    return (
      allText.includes('nurse') ||
      allText.includes('health') ||
      allText.includes('pharma') ||
      allText.includes('medical') ||
      allText.includes('hospital') ||
      allText.includes('clinic') ||
      allText.includes('doctor')
    );
  }

  if (cat.includes('auto')) {
    return allText.includes('auto') || allText.includes('vehicle') || allText.includes('motor') || allText.includes('mechanic');
  }

  return allText.includes(cat);
}

/**
 * Unified Industry-Grade Job Filter Engine
 * Evaluates whether a job passes all specified filter parameters.
 */
export function evaluateJobMatchesFilter(
  job: Job,
  filters: FilterOptions,
  searchQuery: string = '',
  selectedCategory: string = 'All Jobs'
): boolean {
  if (!job) return false;

  // 1. Text Search Query
  const cleanQ = searchQuery.toLowerCase().trim();
  if (cleanQ) {
    if (!matchJobAgainstKeyword(job, cleanQ)) {
      return false;
    }
  }

  // 2. Category Chip
  if (!matchCategory(job, selectedCategory)) {
    return false;
  }

  // 3. Industry
  if (!matchIndustry(job, filters.industry)) {
    return false;
  }

  // 4. Education
  if (!matchEducation(job, filters.education || 'All Education Levels')) {
    return false;
  }

  // 5. Job Role
  if (!matchJobRole(job, filters.jobRole)) {
    return false;
  }

  // 6. Experience
  if (!matchExperience(job, filters.minExperience)) {
    return false;
  }

  // 7. Location / MIDC Zone
  if (!matchLocation(job, filters.midcZone)) {
    return false;
  }

  // 8. Job Type
  if (!matchJobType(job, filters.jobType)) {
    return false;
  }

  // 9. Work Mode
  if (!matchWorkMode(job, filters.workMode)) {
    return false;
  }

  // 10. Amenities / Perks
  if (!matchAmenities(job, filters)) {
    return false;
  }

  // 11. Salary (Minimum Expected)
  if (filters.salaryMin && filters.salaryMin > 0) {
    const maxSalary = Number(job.salary_max ?? (job as any).salaryMax ?? job.salary_min ?? (job as any).salaryMin ?? 0);
    const isDiscloseSalary = job.disclose_salary ?? (job as any).discloseSalary ?? true;
    if (isDiscloseSalary && maxSalary > 0 && maxSalary < filters.salaryMin) {
      return false;
    }
  }

  return true;
}
