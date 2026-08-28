import { Job } from '../../../types';

/**
 * Clean up display names into search terms
 * e.g., "B.E. / B.Tech Jobs" -> "B.E. / B.Tech"
 * "12th Pass Jobs" -> "12th Pass"
 */
export function getCleanSearchTerm(rawName: string): string {
  if (!rawName) return '';
  return rawName
    .replace(/\s*Jobs$/i, '')
    .replace(/^\d+\.\s*/, '')
    .trim();
}

/**
 * Intelligent domain matching between a Job and a search keyword/filter
 */
export function matchJobAgainstKeyword(
  job: Job,
  keyword: string,
  filterType?: 'trade' | 'education' | 'category' | 'all'
): boolean {
  if (!keyword || !keyword.trim()) return true;

  const raw = keyword.toLowerCase().trim();
  const clean = getCleanSearchTerm(raw).toLowerCase();

  // If "all" or "all opportunities", match every active job
  if (clean === 'all' || clean === 'all opportunities' || clean === 'all jobs') {
    return true;
  }

  const title = (job.title || '').toLowerCase();
  const trade = (job.trade || '').toLowerCase();
  const industry = (job.industry || '').toLowerCase();
  const eduReq = (
    job.educationRequirement ||
    job.education_requirement ||
    (typeof (job as any).education === 'string' ? (job as any).education : '')
  ).toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const skills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';
  const requirements = Array.isArray(job.requirements) ? job.requirements.join(' ').toLowerCase() : '';
  const allText = `${title} ${trade} ${industry} ${eduReq} ${desc} ${skills} ${requirements}`;

  // 1. Education specific rules
  if (clean.includes('12th') || clean.includes('12th pass') || clean.includes('hsc')) {
    return (
      eduReq.includes('12th') ||
      eduReq.includes('hsc') ||
      eduReq.includes('higher secondary') ||
      eduReq.includes('10+2') ||
      eduReq.includes('any graduate') ||
      allText.includes('12th pass') ||
      allText.includes('12th') ||
      allText.includes('hsc')
    );
  }

  if (clean.includes('10th') || clean.includes('10th pass') || clean.includes('ssc')) {
    return (
      eduReq.includes('10th') ||
      eduReq.includes('ssc') ||
      eduReq.includes('matric') ||
      allText.includes('10th pass') ||
      allText.includes('10th') ||
      allText.includes('ssc')
    );
  }

  if (clean.includes('b.e') || clean.includes('b.tech') || clean.includes('be / btech') || clean.includes('b.e.')) {
    return (
      eduReq.includes('b.e') ||
      eduReq.includes('b.tech') ||
      eduReq.includes('be ') ||
      eduReq.includes('btech') ||
      eduReq.includes('degree') ||
      eduReq.includes('engineering') ||
      title.includes('engineer') ||
      allText.includes('b.e.') ||
      allText.includes('b.tech')
    );
  }

  if (clean.includes('diploma') || clean.includes('polytechnic')) {
    return (
      eduReq.includes('diploma') ||
      eduReq.includes('polytechnic') ||
      eduReq.includes('dme') ||
      eduReq.includes('dee') ||
      allText.includes('diploma')
    );
  }

  if (clean.includes('b.com') || clean.includes('bcom') || clean.includes('commerce')) {
    return (
      eduReq.includes('b.com') ||
      eduReq.includes('bcom') ||
      eduReq.includes('commerce') ||
      eduReq.includes('graduate') ||
      title.includes('account') ||
      title.includes('billing') ||
      allText.includes('b.com')
    );
  }

  if (clean.includes('ba') || clean.includes('b.a') || clean.includes('arts')) {
    return (
      eduReq.includes('ba ') ||
      eduReq.includes('b.a') ||
      eduReq.includes('arts') ||
      eduReq.includes('graduate') ||
      eduReq.includes('any graduate') ||
      allText.includes('b.a.')
    );
  }

  if (clean.includes('bca') || clean.includes('computer')) {
    return (
      eduReq.includes('bca') ||
      eduReq.includes('computer') ||
      eduReq.includes('mca') ||
      title.includes('data entry') ||
      title.includes('software') ||
      title.includes('it ') ||
      allText.includes('bca')
    );
  }

  if (clean.includes('bba') || clean.includes('management')) {
    return (
      eduReq.includes('bba') ||
      eduReq.includes('management') ||
      eduReq.includes('mba') ||
      eduReq.includes('graduate') ||
      title.includes('manager') ||
      allText.includes('bba')
    );
  }

  if (clean.includes('b.sc') || clean.includes('bsc') || clean.includes('science')) {
    return (
      eduReq.includes('b.sc') ||
      eduReq.includes('bsc') ||
      eduReq.includes('science') ||
      eduReq.includes('chemistry') ||
      allText.includes('b.sc') ||
      allText.includes('bsc')
    );
  }

  // 2. Hospital / Medical
  if (clean.includes('nurse') || clean.includes('nursing')) {
    return allText.includes('nurse') || allText.includes('nursing') || allText.includes('hospital') || allText.includes('clinic');
  }
  if (clean.includes('ward boy') || clean.includes('ward assistant')) {
    return allText.includes('ward boy') || allText.includes('ward assistant') || allText.includes('ward') || allText.includes('patient');
  }
  if (clean.includes('lab') || clean.includes('lab assistant')) {
    return allText.includes('lab') || allText.includes('laboratory') || allText.includes('pathology') || allText.includes('radiology');
  }

  // 3. Hotel & Restaurant
  if (clean.includes('chef') || clean.includes('cook') || clean.includes('commi')) {
    return allText.includes('chef') || allText.includes('cook') || allText.includes('commi') || allText.includes('kitchen') || allText.includes('pantry');
  }
  if (clean.includes('waiter') || clean.includes('steward')) {
    return allText.includes('waiter') || allText.includes('steward') || allText.includes('hotel') || allText.includes('restaurant');
  }
  if (clean.includes('housekeeping')) {
    return allText.includes('housekeeping') || allText.includes('cleaning') || allText.includes('facility') || allText.includes('sweeper');
  }

  // 4. ITI Trades & Technical
  if (clean.includes('fitter')) {
    return trade.includes('fitter') || title.includes('fitter') || allText.includes('fitting') || allText.includes('fitter');
  }
  if (clean.includes('welder')) {
    return trade.includes('welder') || title.includes('welder') || allText.includes('welding') || allText.includes('welder');
  }
  if (clean.includes('cnc') || clean.includes('vmc')) {
    return trade.includes('cnc') || title.includes('cnc') || title.includes('vmc') || allText.includes('machinist');
  }
  if (clean.includes('electrician') || clean.includes('wireman')) {
    return trade.includes('electrician') || title.includes('electrician') || title.includes('wireman') || allText.includes('electrical');
  }
  if (clean.includes('machinist') || clean.includes('turner')) {
    return trade.includes('machinist') || title.includes('machinist') || title.includes('turner') || allText.includes('grinder');
  }
  if (clean.includes('quality') || clean.includes('inspector')) {
    return trade.includes('quality') || title.includes('quality') || title.includes('inspector') || allText.includes('qc') || allText.includes('testing');
  }
  if (clean.includes('helper') || clean.includes('loader')) {
    return trade.includes('helper') || title.includes('helper') || title.includes('loader') || allText.includes('packer') || allText.includes('unloader');
  }
  if (clean.includes('security') || clean.includes('guard')) {
    return trade.includes('security') || title.includes('security') || title.includes('guard') || allText.includes('cctv');
  }
  if (clean.includes('store') || clean.includes('store keeper')) {
    return trade.includes('store') || title.includes('store') || allText.includes('storekeeper') || allText.includes('warehouse');
  }
  if (clean.includes('driver') || clean.includes('forklift')) {
    return trade.includes('driver') || title.includes('driver') || title.includes('forklift') || allText.includes('trailer');
  }
  if (clean.includes('apprentice')) {
    return trade.includes('apprentice') || title.includes('apprentice') || allText.includes('apprenticeship') || allText.includes('trainee');
  }
  if (clean.includes('technician')) {
    return trade.includes('technician') || title.includes('technician') || allText.includes('mechanic') || allText.includes('maintenance');
  }

  // 5. Generic token-based fallback matching
  const tokens = clean
    .split(/[\s&,/()]+/)
    .map((t) => t.replace(/(s|ing|als|ics)$/, ''))
    .filter((t) => t.length >= 2);

  if (tokens.length > 0) {
    return tokens.some((token) => allText.includes(token));
  }

  return allText.includes(clean);
}

/**
 * Return the live, real database count of jobs matching a keyword
 */
export function getRealJobCountForKeyword(
  jobs: Job[],
  keyword: string,
  filterType?: 'trade' | 'education' | 'category' | 'all'
): number {
  if (!Array.isArray(jobs) || jobs.length === 0) return 0;
  if (!keyword || !keyword.trim()) return jobs.length;

  return jobs.filter((job) => matchJobAgainstKeyword(job, keyword, filterType)).length;
}
