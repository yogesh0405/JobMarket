export const safeValue = (val?: any): string => {
  if (val === null || val === undefined || val === '') return 'Not Provided';
  if (typeof val === 'string') return val.trim().length > 0 && val !== '[object Object]' && val !== 'object Object' ? val : 'Not Provided';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return 'Not Provided';
    const items = val.map((item) => safeValue(item)).filter((x) => x && x !== 'Not Provided' && x !== '[object Object]' && x !== 'object Object');
    return items.length > 0 ? items.join(' • ') : 'Not Provided';
  }

  if (typeof val === 'object') {
    if (val.title || val.company || val.years || val.duration) {
      const expParts = [val.title, val.company, val.years ? `${val.years} Yrs` : val.duration].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (expParts.length > 0) return expParts.join(' - ');
    }
    if (val.degree || val.trade || val.qualification || val.institution) {
      const eduParts = [val.degree || val.qualification, val.trade, val.institution, val.year].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (eduParts.length > 0) return eduParts.join(' - ');
    }
    if (val.city || val.state || val.midc || val.address || val.locality) {
      const locParts = [val.locality || val.midc || val.address, val.city, val.state].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (locParts.length > 0) return locParts.join(', ');
    }
    const primitives = Object.values(val)
      .map((v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : (typeof v === 'object' && v ? safeValue(v) : '')))
      .filter((v) => v.length > 0 && v !== 'Not Provided' && v !== '[object Object]' && v !== 'object Object');

    return primitives.length > 0 ? primitives.join(' • ') : 'Not Provided';
  }

  return String(val);
};

export const APPLICANT_SEARCH_SUGGESTIONS = [
  'Search by Trade Type (e.g. VMC Operator, Fitter)...',
  'Search by Role (e.g. Quality Inspector, Turner)...',
  'Search Locality (e.g. Waluj MIDC, Chitegaon)...',
  'Search by Shift (e.g. Day Shift, Rotational)...',
  'Search by Industry (e.g. Automotive, Electronics)...',
  'Search by Skills (e.g. CNC, Vernier, AutoCAD)...',
  'Search Candidates by Name or Phone...',
];

export const EMAIL_TEMPLATES = [
  {
    key: 'INTERVIEW',
    label: 'Interview Invitation',
    desc: 'Invite candidate for in-person or video interview',
    subject: (title: string) => `Interview Invitation: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nWe are pleased to invite you for an interview for the ${title} position. Please review the scheduled details and reply to confirm your availability.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'DOCUMENT',
    label: 'Document Verification Request',
    desc: 'Request ITI certificates, marksheets, Aadhaar & bank details',
    subject: (title: string) => `Document Verification Request: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nTo process your application for ${title}, please submit copies of your ITI/Diploma Trade Certificate, Aadhaar Card, PAN Card, and latest bank passbook.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'OFFER',
    label: 'Job Offer Letter',
    desc: 'Extend official job offer with salary & joining details',
    subject: (title: string) => `Job Offer Letter: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nWe are delighted to extend a formal job offer for the position of ${title}. Please find your offer terms enclosed and reply to confirm your acceptance.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'SHORTLIST',
    label: 'Profile Shortlisted Notification',
    desc: 'Inform candidate that their application is shortlisted',
    subject: (title: string) => `Application Update: Shortlisted for ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nCongratulations! Your profile has been shortlisted for the ${title} position. Our hiring manager is currently scheduling the interview rounds and we will reach out shortly.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'PRACTICAL',
    label: 'Trade / Practical Test Invite',
    desc: 'Invite for VMC/CNC/Fitter machine practical assessment',
    subject: (title: string) => `Practical Trade Assessment: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nYou have been scheduled for a practical trade skill test for ${title}. Please arrive at our workshop facility with proper safety gear.\n\nBest regards,\nRecruitment Team`,
  },
  {
    key: 'INTERVIEW_EVALUATION',
    label: 'Interview Evaluation Update',
    desc: 'Inform candidate that interview is done & under evaluation',
    subject: (title: string) => `Interview Process Update: ${title}`,
    message: (name: string, title: string) =>
      `Dear ${name},\n\nThank you for attending the interview for the ${title} position. Your interview session has now been conducted.\n\nYour profile and interview assessment are currently under evaluation by our technical and recruitment panel. Once the review is finalized, you will receive further updates regarding the next steps and selection outcome.\n\nBest regards,\nRecruitment Team`,
  },
];
