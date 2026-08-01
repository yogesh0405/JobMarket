import { User, Job, Company, Category } from '../types';
import { getCompanyLogo } from '../utils/companyLogos';

export const initialCompanies: Company[] = [
  { name: 'Tata AutoComp Systems', industry: 'Automotive', size: '5000+', location: 'Chakan MIDC', color: '#1E3A8A', logoUrl: getCompanyLogo('Tata AutoComp Systems') },
  { name: 'Bharat Forge Ltd', industry: 'Manufacturing', size: '5000+', location: 'Bhosari MIDC', color: '#B45309', logoUrl: getCompanyLogo('Bharat Forge Ltd') },
  { name: 'Thermax Industrial', industry: 'Engineering', size: '1000-5000', location: 'Bhosari MIDC', color: '#047857', logoUrl: getCompanyLogo('Thermax Industrial') },
  { name: 'Rucha Yantra Robotics', industry: 'Industrial Automation', size: '50-200', location: 'Hinjawadi MIDC', color: '#6D28D9', logoUrl: getCompanyLogo('Rucha Yantra Robotics') },
  { name: 'Varroc Engineering', industry: 'Automotive', size: '5000+', location: 'Waluj MIDC', color: '#DC2626', logoUrl: getCompanyLogo('Varroc Engineering') },
  { name: 'Sigma Electric', industry: 'Electricals', size: '1000-5000', location: 'Chakan MIDC', color: '#0891B2', logoUrl: getCompanyLogo('Sigma Electric') },
  { name: 'John Deere India', industry: 'Agro Machinery', size: '1000-5000', location: 'Ranjangaon MIDC', color: '#15803D', logoUrl: getCompanyLogo('John Deere India') },
  { name: 'Lupin Pharmaceuticals', industry: 'Chemical & Pharma', size: '5000+', location: 'Taloja MIDC', color: '#BE185D', logoUrl: getCompanyLogo('Lupin Pharmaceuticals') },
  { name: 'Godrej & Boyce', industry: 'Manufacturing', size: '5000+', location: 'Rabale MIDC', color: '#4338CA', logoUrl: getCompanyLogo('Godrej & Boyce') },
  { name: 'Mahindra Heavy Engines', industry: 'Automotive', size: '5000+', location: 'Chakan MIDC', color: '#DC2626', logoUrl: getCompanyLogo('Mahindra Heavy Engines') },
  { name: 'Finolex Cables', industry: 'Electricals', size: '1000-5000', location: 'Bhosari MIDC', color: '#0369A1', logoUrl: getCompanyLogo('Finolex Cables') },
  { name: 'Endurance Technologies', industry: 'Automotive', size: '1000-5000', location: 'Waluj MIDC', color: '#4F46E5', logoUrl: getCompanyLogo('Endurance Technologies') },
  { name: 'Galaxy Care Hospital', industry: 'Healthcare', size: '500-1000', location: 'Pune City', color: '#EF4444', logoUrl: getCompanyLogo('Galaxy Care Hospital') },
  { name: 'Grand Regent Hotels', industry: 'Hospitality', size: '200-500', location: 'Mumbai City', color: '#F59E0B', logoUrl: getCompanyLogo('Grand Regent Hotels') },
  { name: 'Orchids International School', industry: 'Education', size: '1000-5000', location: 'Bhosari', color: '#10B981', logoUrl: getCompanyLogo('Orchids International School') }
];

export const initialCategories: Category[] = [
  { name: 'Fitter', icon: 'wrench', count: 1450 },
  { name: 'Welder', icon: 'zap', count: 980 },
  { name: 'CNC Operator', icon: 'monitor', count: 1200 },
  { name: 'Electrician', icon: 'plug', count: 750 },
  { name: 'Machinist', icon: 'settings', count: 850 },
  { name: 'Helper / Loader', icon: 'box', count: 2100 },
  { name: 'Quality Inspector', icon: 'search', count: 480 },
  { name: 'Apprentice', icon: 'graduation-cap', count: 1600 },
  { name: 'Driver / Forklift', icon: 'truck', count: 320 },
  { name: 'Security Guard', icon: 'shield', count: 550 },
  { name: 'Store Keeper', icon: 'folder-open', count: 420 },
  { name: 'Technician', icon: 'microscope', count: 680 },
  { name: 'Hospital Jobs', icon: 'heart-pulse', count: 1120 },
  { name: 'Hotel Jobs', icon: 'utensils', count: 870 },
  { name: 'School & College', icon: 'school', count: 640 },
  { name: 'Office / Clerk', icon: 'briefcase', count: 510 }
];

export const initialQualifications: Category[] = [
  { name: '12th Pass Jobs', icon: 'graduation-cap', count: 63232 },
  { name: 'B.Com Jobs', icon: 'bar-chart', count: 34503 },
  { name: 'BA Jobs', icon: 'file-text', count: 28123 },
  { name: 'B.E./B.Tech Jobs', icon: 'settings', count: 26397 },
  { name: 'Diploma Jobs', icon: 'scroll', count: 26208 },
  { name: 'BCA Jobs', icon: 'laptop', count: 21767 },
  { name: 'BBA Jobs', icon: 'trending-up', count: 21184 },
  { name: 'B.Sc Jobs', icon: 'microscope', count: 19641 },
  { name: '10th Pass Jobs', icon: 'school', count: 18617 },
  { name: 'MBA Jobs', icon: 'briefcase', count: 7098 },
  { name: 'Vocational Course Jobs', icon: 'hammer', count: 5292 },
  { name: 'MCA Jobs', icon: 'monitor', count: 2825 }
];

export const initialHospitalCategories: Category[] = [
  { name: 'Staff Nurse', icon: 'heart-pulse', count: 450 },
  { name: 'Ward Boy / Assistant', icon: 'user', count: 380 },
  { name: 'Lab Assistant', icon: 'microscope', count: 190 },
  { name: 'Hospital Receptionist', icon: 'phone', count: 120 }
];

export const initialHotelCategories: Category[] = [
  { name: 'Commi 1 Chef / Cook', icon: 'chef-hat', count: 320 },
  { name: 'Hotel Waiter', icon: 'utensils', count: 280 },
  { name: 'Housekeeping Associate', icon: 'sparkles', count: 210 },
  { name: 'Front Desk Executive', icon: 'bell-ring', count: 160 }
];

export const initialSchoolCategories: Category[] = [
  { name: 'Primary Teacher', icon: 'book-open', count: 290 },
  { name: 'High School Teacher', icon: 'book-open', count: 240 },
  { name: 'Librarian Assistant', icon: 'book-text', count: 110 },
  { name: 'Peon / Office Boy', icon: 'box', count: 90 }
];

const pickShift = () => {
  const shifts = [
    'Day Shift (8 AM - 5 PM)',
    'Night Shift (8 PM - 5 AM)',
    'Rotational (Shift A / B)',
    'Rotational (Shift A / B / C)'
  ];
  return shifts[Math.floor(Math.random() * shifts.length)];
};

const daysAgo = (d: number) => {
  const now = new Date();
  return new Date(now.getTime() - d * 86400000).toISOString();
};

const midcList = [
  { name: 'Chakan MIDC', city: 'Pune' },
  { name: 'Bhosari MIDC', city: 'Pune' },
  { name: 'Ranjangaon MIDC', city: 'Pune' },
  { name: 'Hinjawadi MIDC', city: 'Pune' },
  { name: 'Rabale MIDC', city: 'Mumbai' },
  { name: 'Taloja MIDC', city: 'Mumbai' },
  { name: 'Waluj MIDC', city: 'Aurangabad' },
  { name: 'Butibori MIDC', city: 'Nagpur' }
];

// Generate 80+ diverse jobs including healthcare, hospitality, education, and office work
const generateSeedJobs = (): Job[] => {
  const trades = [
    'Fitter', 'Welder', 'CNC Operator', 'Electrician', 'Machinist', 'Helper', 'Quality Inspector',
    'Hospital Jobs', 'Hotel Jobs', 'School & College', 'Office / Clerk'
  ];
  const titles = {
    'Fitter': ['Mechanical Fitter', 'Assembly Fitter', 'Apprentice Fitter', 'Maintenance Fitter'],
    'Welder': ['MIG Welder', 'TIG Welder', 'Arc Welder', 'CO2 Welder'],
    'CNC Operator': ['CNC VMC Operator', 'CNC Setter & Operator', 'Lathe Machine Operator'],
    'Electrician': ['Maintenance Electrician', 'Panel Wireman', 'Industrial Electrician'],
    'Machinist': ['Conventional Machinist', 'Tool & Die Maker', 'Grinder Operator'],
    'Helper': ['Material Handler', 'Factory Helper', 'Loader & Unloader', 'Line Assistant'],
    'Quality Inspector': ['Line Inspector', 'Dimensional Checker', 'QA Inspector'],
    'Hospital Jobs': ['Staff Nurse', 'Ward Boy / Assistant', 'Hospital Receptionist', 'Lab Assistant'],
    'Hotel Jobs': ['Commi 1 Chef / Cook', 'Hotel Waiter', 'Housekeeping Associate', 'Front Desk Executive'],
    'School & College': ['Primary Teacher', 'High School Teacher', 'Librarian Assistant', 'Peon / Office Boy'],
    'Office / Clerk': ['Data Entry Operator', 'Back Office Executive', 'Receptionist / Front Desk', 'Office Assistant']
  };

  const jobs: Job[] = [];

  // Recreate the specific seed jobs from previous setup first for compatibility, then add more
  jobs.push(
    {
      id: 'j1', title: 'Senior MIG Welder', company: 'Tata AutoComp Systems',
      location: 'Pune', jobType: 'Full-Time', workMode: 'Onsite', industry: 'Automotive',
      minExperience: 3, maxExperience: 6, salaryMin: 240000, salaryMax: 360000,
      openings: 15, description: 'Required experienced MIG Welder for automotive parts welding. Should be able to read drawings and perform structural quality welding.',
      responsibilities: ['Perform MIG welding on assemblies', 'Follow safety guidelines on the shop floor', 'Verify weld dimensions'],
      requirements: ['ITI Welder trade completed', '3+ years industrial welding experience', 'Pass weld test on site'],
      skills: ['MIG Welding', 'Blueprint Reading', 'Shop Safety'],
      perks: ['Canteen Subsidized', 'PF & ESIC', 'Overtime Pay'],
      featured: true, postedAt: daysAgo(1), status: 'active',
      applicants: [
        { userId: 'u1', name: 'Rahul Sharma', email: 'worker@demo.com', appliedAt: daysAgo(0.5), status: 'reviewed' }
      ],
      views: 120, employerId: 'emp1', companyColor: '#1E3A8A', companyLogo: getCompanyLogo('Tata AutoComp Systems', '#1E3A8A'),
      trade: 'Welder', midcZone: 'Chakan MIDC', shiftDetails: 'Rotational (Shift A / B)',
      overtime: true, canteen: true, busFacility: true, accommodation: true, joiningBonus: true
    },
    {
      id: 'j2', title: 'CNC Operator (VMC/Turning)', company: 'Bharat Forge Ltd',
      location: 'Pune', jobType: 'Full-Time', workMode: 'Onsite', industry: 'Manufacturing',
      minExperience: 1, maxExperience: 3, salaryMin: 180000, salaryMax: 260000,
      openings: 30, description: 'Hiring CNC and VMC machine operators for heavy forge division. Daily production targets, component loading/unloading and checks using Vernier Calipers.',
      responsibilities: ['Operate CNC turning centers', 'Perform checks using micrometers', 'Maintain production registers'],
      requirements: ['ITI Machinist / Turner trade', '1+ years CNC operation experience'],
      skills: ['CNC Operation', 'Vernier Calipers', 'Micrometer'],
      perks: ['Subsidized Canteen', 'Bus facility available', 'OT Double Rate'],
      featured: true, postedAt: daysAgo(2), status: 'active', applicants: [], views: 240, employerId: 'emp1', companyColor: '#B45309', companyLogo: getCompanyLogo('Bharat Forge Ltd', '#B45309'),
      trade: 'CNC Operator', midcZone: 'Bhosari MIDC', shiftDetails: 'Rotational (Shift A / B / C)',
      overtime: true, canteen: true, busFacility: true, accommodation: false, attendanceBonus: true
    }
  );

  // Generate 77 more jobs to hit 80+ total
  for (let i = 3; i <= 80; i++) {
    const trade = trades[i % trades.length];
    const tradeTitles = titles[trade as keyof typeof titles];
    const title = tradeTitles[i % tradeTitles.length];
    
    // Choose appropriate company matching the trade
    let company = initialCompanies[i % initialCompanies.length];
    if (trade === 'Hospital Jobs') {
      company = initialCompanies.find(c => c.industry === 'Healthcare') || company;
    } else if (trade === 'Hotel Jobs') {
      company = initialCompanies.find(c => c.industry === 'Hospitality') || company;
    } else if (trade === 'School & College') {
      company = initialCompanies.find(c => c.industry === 'Education') || company;
    }

    const midc = midcList[i % midcList.length];
    
    // Non-industrial location fallback
    const isIndustrial = !['Hospital Jobs', 'Hotel Jobs', 'School & College', 'Office / Clerk'].includes(trade);
    const location = isIndustrial ? midc.city : company.location;
    const midcZone = isIndustrial ? midc.name : 'City Center';

    const isHelper = trade === 'Helper';
    const minExp = isHelper ? 0 : (i % 3);
    const maxExp = minExp + (i % 3) + 1;
    const salaryMin = isHelper ? 120000 + (i % 3) * 10000 : 180000 + (i % 4) * 20000;
    const salaryMax = salaryMin + 50000 + (i % 5) * 10000;

    const description = isIndustrial 
      ? `Urgent hiring for ${title} at ${company.name} plant in ${midc.name}. Candidates with ITI certification preferred. Immediate joining for selected candidates.`
      : `Hiring for ${title} at ${company.name} in ${location}. Candidates with relevant experience and positive attitude are welcome. Standard working hours and benefits.`;

    const requirements = isIndustrial
      ? [
          `Completed ITI / Diploma in relevant trade`,
          `Minimum ${minExp} years of work experience in factory setup`,
          'Should be physically fit and ready for shifts'
        ]
      : [
          `Minimum education qualification as required for the role`,
          `Prior experience of ${minExp} years is preferred but freshers can apply`,
          'Good communication skills and customer orientation'
        ];

    const perks = isIndustrial
      ? ['Subsidized Meals', 'Bus Service', 'PF & ESIC benefits']
      : ['Free Meals / Uniforms', 'Health Insurance', 'Paid Leaves'];

    jobs.push({
      id: `j${i}`,
      title: `${title} (${location})`,
      company: company.name,
      location,
      jobType: 'Full-Time',
      workMode: 'Onsite',
      industry: company.industry,
      minExperience: minExp,
      maxExperience: maxExp,
      salaryMin,
      salaryMax,
      openings: 5 + (i % 15),
      description,
      responsibilities: isIndustrial 
        ? [
            'Maintain daily production output standards',
            'Inspect raw material quality checklist',
            'Clean work area and maintain tools'
          ]
        : [
            'Deliver high-quality service to clients/customers',
            'Adhere to institution/organization guidelines',
            'Maintain reports and database'
          ],
      requirements,
      skills: [trade, 'Communication', 'Teamwork'],
      perks,
      featured: i % 7 === 0,
      postedAt: daysAgo(2 + (i % 12)),
      status: 'active',
      applicants: [],
      views: Math.floor(Math.random() * 150) + 12,
      employerId: i % 2 === 0 ? 'emp1' : 'emp2',
      companyColor: company.color,
      companyLogo: getCompanyLogo(company.name, company.color),
      acceptResume: true,
      experienceRequired: true,
      discloseSalary: true,
      trade,
      midcZone,
      shiftDetails: pickShift(),
      overtime: isIndustrial && (i % 2 === 0),
      accommodation: isIndustrial && (i % 3 === 0),
      busFacility: isIndustrial && (i % 4 !== 0),
      canteen: isIndustrial && (i % 5 !== 0),
      joiningBonus: i % 6 === 0,
      attendanceBonus: isIndustrial && (i % 4 === 0),
      contractDuration: i % 10 === 0 ? '6 Months' : undefined,
      walkInDate: i % 8 === 0 ? daysAgo(-2).split('T')[0] : undefined,
      interviewAddress: isIndustrial 
        ? `${company.name} plant, ${midc.name}, Near Toll Plaza, MH`
        : `${company.name}, City Branch office, ${location}, MH`
    });
  }

  return jobs;
};

export const initialJobs: Job[] = [];

export const initialUsers: User[] = [
  {
    id: 'emp1', name: 'Ramesh Sawant', email: 'factory@demo.com', password: 'demo123',
    role: 'employer', companyName: 'Tata AutoComp Systems', phone: '9876543210',
    createdAt: daysAgo(60), profileComplete: true, gstNumber: '27AAAAA1111A1Z1',
    location: 'Chakan MIDC',
    profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'emp2', name: 'HR Manager', email: 'hr@demo.com', password: 'demo123',
    role: 'employer', companyName: 'Bharat Forge Ltd', phone: '9876543211',
    createdAt: daysAgo(45), profileComplete: true, gstNumber: '27BBBBB2222B2Z2',
    location: 'Bhosari MIDC',
    profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'u1', name: 'Rajesh Kumar Sharma', email: 'rajesh.sharma@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011001',
    createdAt: daysAgo(30), profileComplete: true,
    headline: 'Senior CNC Operator & Machinist (ITI Certified)',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    experience: [{ title: 'CNC Operator', company: 'Bajaj Auto Ltd', duration: '2020 - Present', description: 'Operated CNC VMC machines.' }],
    education: [{ degree: 'ITI Machinist', institution: 'Govt ITI Sambhajinagar', year: '2018 - 2020' }],
    skills: ['CNC Operating', 'VMC', 'Fanuc', 'Shop Safety'],
    aadhaarVerified: true, tradeSpecialization: 'CNC Machinist'
  },
  {
    id: 'u2', name: 'Amitabh Verma', email: 'amitabh.verma@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011002',
    createdAt: daysAgo(25), profileComplete: true,
    headline: 'VMC Programmer & CAD/CAM Designer',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    experience: [{ title: 'VMC Programmer', company: 'Wockhardt Ltd', duration: '2021 - Present', description: 'VMC Programming & CAD design.' }],
    education: [{ degree: 'Diploma Mech', institution: 'Government Polytechnic', year: '2018 - 2021' }],
    skills: ['VMC Programming', 'AutoCAD', 'Mastercam'],
    aadhaarVerified: true, tradeSpecialization: 'VMC Programmer'
  },
  {
    id: 'u3', name: 'Sunil Deshmukh', email: 'sunil.deshmukh@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011003',
    createdAt: daysAgo(20), profileComplete: true,
    headline: 'Certified Industrial Electrician & PLC Technician',
    location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    experience: [{ title: 'Electrician', company: 'Siemens Limited', duration: '2019 - Present', description: 'HT/LT panel wiring & PLC.' }],
    education: [{ degree: 'ITI Electrician', institution: 'Govt ITI Sambhajinagar', year: '2017 - 2019' }],
    skills: ['PLC Maintenance', 'Siemens TIA', 'Wiring'],
    aadhaarVerified: true, tradeSpecialization: 'Industrial Electrician'
  },
  {
    id: 'u4', name: 'Vikram Kulkarni', email: 'vikram.kulkarni@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011004',
    createdAt: daysAgo(18), profileComplete: true,
    headline: 'Quality Control Inspector & CMM Specialist',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    skills: ['CMM Inspection', 'IATF 16949', 'Metrology'],
    aadhaarVerified: true, tradeSpecialization: 'Quality Assurance'
  },
  {
    id: 'u5', name: 'Pradeep Shinde', email: 'pradeep.shinde@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011005',
    createdAt: daysAgo(15), profileComplete: true,
    headline: 'High-Pressure Heavy MIG & TIG Welder',
    location: 'Paithan MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    skills: ['MIG Welding', 'TIG Welding', 'Fabrication'],
    aadhaarVerified: true, tradeSpecialization: 'MIG/TIG Welder'
  },
  {
    id: 'u6', name: 'Sachin Joshi', email: 'sachin.joshi@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011006',
    createdAt: daysAgo(12), profileComplete: true,
    headline: 'Warehouse & Inventory Store Supervisor (SAP MM)',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    skills: ['SAP MM', 'Inventory Control', 'Dispatch'],
    aadhaarVerified: true, tradeSpecialization: 'Store Keeper'
  },
  {
    id: 'u7', name: 'Anil Gavhane', email: 'anil.gavhane@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011007',
    createdAt: daysAgo(10), profileComplete: true,
    headline: 'Senior Hydraulics & Pneumatics Maintenance Engineer',
    location: 'Railway Station MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    skills: ['Hydraulics', 'Pneumatics', 'Maintenance'],
    aadhaarVerified: true, tradeSpecialization: 'Plant Maintenance'
  },
  {
    id: 'u8', name: 'Manoj Jadhav', email: 'manoj.jadhav@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011008',
    createdAt: daysAgo(8), profileComplete: true,
    headline: 'Certified Heavy Material Handling & Forklift Operator',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    skills: ['Forklift Operating', 'Material Loading', 'Safety Checklists'],
    aadhaarVerified: true, tradeSpecialization: 'Forklift Driver'
  },
  {
    id: 'u9', name: 'Sanjay Pawar', email: 'sanjay.pawar@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011009',
    createdAt: daysAgo(5), profileComplete: true,
    headline: 'Shop Floor Assembly Line Production Supervisor',
    location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    skills: ['Production Planning', '5S & Kaizen', 'Shift Management'],
    aadhaarVerified: true, tradeSpecialization: 'Assembly Line Supervisor'
  },
  {
    id: 'u10', name: 'Vijay Kale', email: 'vijay.kale@demo.com', password: 'demo123',
    role: 'candidate', phone: '9822011010',
    createdAt: daysAgo(2), profileComplete: true,
    headline: 'Tool & Die Maker Fitter Specialist',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    skills: ['Die Fitting', 'Tool Room', 'Grinding Machine'],
    aadhaarVerified: true, tradeSpecialization: 'Tool & Die Fitter'
  }
];
