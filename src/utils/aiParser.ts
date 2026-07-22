import { Job, JobType, WorkMode } from '../types';

export const parseJobPrompt = (prompt: string): Partial<Job> => {
  const p = prompt.toLowerCase();
  const job: Partial<Job> = {};

  // Extract openings (numbers)
  const numbers = p.match(/\b\d+\b/);
  if (numbers) {
    job.openings = parseInt(numbers[0]);
  }

  // Extract Trade / Title
  if (p.includes('welder')) {
    job.title = 'Welder (MIG/TIG)';
    job.trade = 'Welder';
    job.industry = 'Mechanical & Assembly';
  } else if (p.includes('cnc') || p.includes('operator')) {
    job.title = 'CNC Machine Operator';
    job.trade = 'CNC Operator';
    job.industry = 'IT & Software'; // Maps to Industrial IT / Automation
  } else if (p.includes('fitter')) {
    job.title = 'Mechanical Assembly Fitter';
    job.trade = 'Fitter';
    job.industry = 'Manufacturing';
  } else if (p.includes('electrician') || p.includes('electrical')) {
    job.title = 'Industrial Electrician';
    job.trade = 'Electrician';
    job.industry = 'Engineering';
  } else if (p.includes('helper') || p.includes('loader') || p.includes('unloader')) {
    job.title = 'Factory Helper / General Worker';
    job.trade = 'Helper';
    job.industry = 'Logistics';
  } else if (p.includes('quality') || p.includes('inspector') || p.includes('qa')) {
    job.title = 'Quality Control Inspector';
    job.trade = 'Quality Inspector';
    job.industry = 'Manufacturing';
  }

  // Extract MIDC Zone
  if (p.includes('ranjangaon')) {
    job.midcZone = 'Ranjangaon MIDC';
    job.location = 'Pune';
  } else if (p.includes('hinjawadi') || p.includes('hinjeweadi')) {
    job.midcZone = 'Hinjawadi MIDC';
    job.location = 'Pune';
  } else if (p.includes('chakan')) {
    job.midcZone = 'Chakan MIDC';
    job.location = 'Pune';
  } else if (p.includes('bhosari')) {
    job.midcZone = 'Bhosari MIDC';
    job.location = 'Pune';
  } else if (p.includes('rabale')) {
    job.midcZone = 'Rabale MIDC';
    job.location = 'Mumbai';
  } else if (p.includes('taloja')) {
    job.midcZone = 'Taloja MIDC';
    job.location = 'Mumbai';
  } else if (p.includes('waluj')) {
    job.midcZone = 'Waluj MIDC';
    job.location = 'Aurangabad';
  } else if (p.includes('butibori')) {
    job.midcZone = 'Butibori MIDC';
    job.location = 'Nagpur';
  }

  // Extract Perks & Facilities
  if (p.includes('bus') || p.includes('transport') || p.includes('cab')) {
    job.busFacility = true;
  }
  if (p.includes('hostel') || p.includes('accommodation') || p.includes('stay') || p.includes('room')) {
    job.accommodation = true;
  }
  if (p.includes('canteen') || p.includes('lunch') || p.includes('food') || p.includes('meal')) {
    job.canteen = true;
  }
  if (p.includes('ot') || p.includes('overtime') || p.includes('extra hours')) {
    job.overtime = true;
  }
  if (p.includes('bonus') || p.includes('incentive')) {
    job.joiningBonus = true;
    job.attendanceBonus = true;
  }

  // Extract Shifts
  if (p.includes('night')) {
    job.shiftDetails = 'Night Shift (8 PM - 5 AM)';
  } else if (p.includes('day')) {
    job.shiftDetails = 'Day Shift (9 AM - 6 PM)';
  } else if (p.includes('rotate') || p.includes('rotational') || p.includes('shift a') || p.includes('shift b')) {
    job.shiftDetails = 'Rotational (Shift A / B)';
  } else {
    job.shiftDetails = 'Day Shift (8 AM - 5 PM)';
  }

  // Auto-generate salary recommendation
  if (job.trade === 'Welder' || job.trade === 'CNC Operator' || job.trade === 'Quality Inspector') {
    job.salaryMin = 180000; // ~15K per month
    job.salaryMax = 300000; // ~25K per month
    job.minExperience = 2;
    job.maxExperience = 5;
  } else if (job.trade === 'Fitter' || job.trade === 'Electrician') {
    job.salaryMin = 150000;
    job.salaryMax = 240000;
    job.minExperience = 1;
    job.maxExperience = 3;
  } else {
    job.salaryMin = 120000;
    job.salaryMax = 180000;
    job.minExperience = 0;
    job.maxExperience = 1;
  }

  // Auto-generated description based on filled details
  job.description = `Urgent hiring for ${job.title || 'Industrial Worker'} at our plant.
MIDC Zone: ${job.midcZone || 'Local Industrial Cluster'}
Number of vacancies: ${job.openings || 5}
Required Experience: ${job.minExperience || 0} - ${job.maxExperience || 2} years.

Facilities provided:
${job.canteen ? '- Canteen & Subsidized Meals\n' : ''}${job.busFacility ? '- Bus/Transport Facility on standard routes\n' : ''}${job.accommodation ? '- Hostel Accommodation for outer station workers\n' : ''}${job.overtime ? '- Overtime pay (OT) as per double rate\n' : ''}`;

  return job;
};
export default parseJobPrompt;
