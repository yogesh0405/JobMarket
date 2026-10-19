import { pool } from '../../config/database/pool';
import { S3Util } from '../../utils/s3';
import { CacheService } from '../../utils/redisCache';
import { v4 as uuidv4 } from 'uuid';

interface CompanySeed {
  name: string;
  industry: string;
  company_type: string;
  description: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  email: string;
  phone: string;
  company_size: string;
  founded_year: number;
  midc_zone: string;
  specializations: string[];
  color: string;
  svgLogo: string;
  sampleJobs: {
    title: string;
    department: string;
    job_type: string;
    experience_level: string;
    salary_range: string;
    location: string;
    description: string;
  }[];
}

const COMPANIES_DATA: CompanySeed[] = [
  {
    name: 'NexaForge Cloud Systems',
    industry: 'Cloud & AI Infrastructure',
    company_type: 'Enterprise IT & Cloud Provider',
    description: 'Enterprise-grade cloud infrastructure, distributed microservices, and specialized AI workload acceleration powering mission-critical architectures across India.',
    website: 'https://nexaforge.cloud',
    address: 'Plot A-14, AURIC City Technology Park, Shendra MIDC',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431154',
    latitude: 19.8785,
    longitude: 75.4822,
    email: 'contact@nexaforge.cloud',
    phone: '+91 240 298 4401',
    company_size: '500-1000 employees',
    founded_year: 2018,
    midc_zone: 'Shendra MIDC',
    specializations: ['Cloud Architecture', 'Distributed Systems', 'Kubernetes', 'Enterprise AI Ops', 'High Availability DB'],
    color: '#2563EB',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#2563EB" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#bgGrad)" />
  <g filter="url(#shadow)" transform="translate(250, 205)">
    <!-- Hexagonal 3D Isometric Cluster -->
    <!-- Top Face -->
    <polygon points="0,-100 86,-50 0,0 -86,-50" fill="url(#blueGlow)" />
    <!-- Left Face -->
    <polygon points="-86,-50 0,0 0,100 -86,50" fill="#1D4ED8" />
    <!-- Right Face -->
    <polygon points="0,0 86,-50 86,50 0,100" fill="url(#purpleGlow)" />
    <!-- Inner Core Nexus -->
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" opacity="0.95" />
    <circle cx="0" cy="0" r="32" fill="none" stroke="#60A5FA" stroke-width="4" stroke-dasharray="10 6" opacity="0.8" />
  </g>
  <!-- Brand Typography -->
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="38" letter-spacing="4" fill="#FFFFFF">NEXAFORGE</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="6" fill="#38BDF8">CLOUD SYSTEMS</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Senior Cloud Infrastructure Engineer',
        department: 'Cloud Ops',
        job_type: 'Full-time',
        experience_level: '5-8 years',
        salary_range: '₹18,00,000 - ₹26,00,000 P.A.',
        location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
        description: 'Design and deploy multi-region Kubernetes clusters with zero-downtime microservices and automated infrastructure provisioning.'
      },
      {
        title: 'DevOps / Site Reliability Engineer (SRE)',
        department: 'Engineering',
        job_type: 'Full-time',
        experience_level: '3-6 years',
        salary_range: '₹14,00,000 - ₹20,00,000 P.A.',
        location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
        description: 'Maintain 99.99% system availability, establish distributed tracing, and optimize CI/CD delivery pipelines.'
      }
    ]
  },
  {
    name: 'Apexion Mobility',
    industry: 'Automotive & Electric Vehicles',
    company_type: 'OEM & EV Engineering',
    description: 'Pioneering next-generation electric vehicle powertrains, modular lithium battery architectures, and connected vehicle telemetry for India and global export markets.',
    website: 'https://apexionmobility.com',
    address: 'Sector 5, E-Block, Waluj Industrial Area',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431136',
    latitude: 19.8398,
    longitude: 75.2415,
    email: 'careers@apexionmobility.com',
    phone: '+91 240 255 1890',
    company_size: '1000-5000 employees',
    founded_year: 2016,
    midc_zone: 'Waluj MIDC',
    specializations: ['Electric Powertrains', 'Battery Management Systems', 'Automotive Embedded Systems', 'Vehicle Dynamics'],
    color: '#0284C7',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="apexBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#082F49" />
      <stop offset="100%" stop-color="#0C4A6E" />
    </linearGradient>
    <linearGradient id="cyanSpark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="silverSpeed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>
    <filter id="apexGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#38BDF8" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#apexBg)" />
  <g filter="url(#apexGlow)" transform="translate(250, 200)">
    <!-- Aerodynamic Forward Apex Chevrons -->
    <path d="M-90,60 L0,-75 L90,60 L45,60 L0,-15 L-45,60 Z" fill="url(#silverSpeed)" />
    <path d="M-65,95 L0,0 L65,95 L30,95 L0,50 L-30,95 Z" fill="url(#cyanSpark)" />
    <polygon points="0,-95 15,-65 -15,-65" fill="#38BDF8" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="40" letter-spacing="5" fill="#FFFFFF">APEXION</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="7" fill="#38BDF8">MOBILITY</text>
</svg>`,
    sampleJobs: [
      {
        title: 'BMS Embedded Firmware Lead',
        department: 'R&D Powertrain',
        job_type: 'Full-time',
        experience_level: '6-10 years',
        salary_range: '₹22,00,000 - ₹32,00,000 P.A.',
        location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
        description: 'Architect state-of-charge algorithms, cell-balancing controllers, and ISO 26262 functional safety firmware for EV batteries.'
      },
      {
        title: 'Automotive Quality Assurance Manager',
        department: 'Quality & Testing',
        job_type: 'Full-time',
        experience_level: '5-8 years',
        salary_range: '₹12,00,000 - ₹18,00,000 P.A.',
        location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
        description: 'Manage IATF 16949 compliance, PPAP submissions, and assembly line reliability metrics.'
      }
    ]
  },
  {
    name: 'Lumina BioSciences',
    industry: 'Biopharmaceuticals & Therapeutics',
    company_type: 'Biotech Corporation',
    description: 'Advanced life sciences research and biomanufacturing facility focused on affordable biosimilar therapeutics, peptide synthesis, and clinical genomics.',
    website: 'https://luminabio.com',
    address: 'Plot C-8/2, Chikalthana Industrial Estate',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431006',
    latitude: 19.8821,
    longitude: 75.3854,
    email: 'info@luminabio.com',
    phone: '+91 240 248 7632',
    company_size: '200-500 employees',
    founded_year: 2015,
    midc_zone: 'Chikalthana MIDC',
    specializations: ['Biosimilars', 'Molecular Diagnostics', 'Peptide Synthesis', 'Regulatory QA', 'Sterile Formulations'],
    color: '#0D9488',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="luminaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#042F2E" />
      <stop offset="100%" stop-color="#115E59" />
    </linearGradient>
    <linearGradient id="emeraldBio" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2DD4BF" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="bioGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#2DD4BF" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#luminaBg)" />
  <g filter="url(#bioGlow)" transform="translate(250, 195)">
    <!-- Intersecting Bio-Helix Rings -->
    <ellipse cx="-20" cy="-20" rx="65" ry="40" transform="rotate(-30)" fill="none" stroke="url(#emeraldBio)" stroke-width="12" />
    <ellipse cx="20" cy="20" rx="65" ry="40" transform="rotate(-30)" fill="none" stroke="#5EEAD4" stroke-width="10" opacity="0.9" />
    <!-- Molecular Central Node -->
    <circle cx="0" cy="0" r="22" fill="#FFFFFF" />
    <circle cx="-50" cy="-45" r="10" fill="#2DD4BF" />
    <circle cx="50" cy="45" r="10" fill="#5EEAD4" />
    <circle cx="45" cy="-35" r="8" fill="#A7F3D0" />
    <circle cx="-45" cy="35" r="8" fill="#A7F3D0" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="38" letter-spacing="4" fill="#FFFFFF">LUMINA</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="6" fill="#2DD4BF">BIOSCIENCES</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Principal Scientist - Biosimilar Analytics',
        department: 'Research & Development',
        job_type: 'Full-time',
        experience_level: '7-12 years',
        salary_range: '₹20,00,000 - ₹28,00,000 P.A.',
        location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
        description: 'Lead chromatographic characterization (HPLC/LC-MS) for monoclonal antibodies and biosimilar release assays.'
      },
      {
        title: 'QA / Regulatory Compliance Executive',
        department: 'Quality Assurance',
        job_type: 'Full-time',
        experience_level: '3-5 years',
        salary_range: '₹8,00,000 - ₹12,00,000 P.A.',
        location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
        description: 'Prepare US FDA / MHRA dossier filings, oversee cleanroom validation, and audit cGMP compliance.'
      }
    ]
  },
  {
    name: 'Aerodyne Aerospace Labs',
    industry: 'Aerospace & Precision Machining',
    company_type: 'Defense & Aerospace Contractor',
    description: 'AS9100D certified precision engineering firm fabricating structural titanium sub-assemblies, avionics enclosures, and unmanned aerial vehicle (UAV) airframes.',
    website: 'https://aerodynelabs.in',
    address: 'Plot D-2, Defense Hub, Shendra Industrial Area',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431154',
    latitude: 19.8732,
    longitude: 75.4789,
    email: 'contracts@aerodynelabs.in',
    phone: '+91 240 299 8110',
    company_size: '100-250 employees',
    founded_year: 2017,
    midc_zone: 'Shendra MIDC',
    specializations: ['5-Axis Precision CNC', 'Aerospace Metallurgy', 'Avionics Packaging', 'Composites & Carbon Fiber'],
    color: '#1E3A8A',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="aeroBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B" />
      <stop offset="100%" stop-color="#1C2541" />
    </linearGradient>
    <linearGradient id="deltaGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <linearGradient id="silverWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>
    <filter id="aeroShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#F59E0B" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#aeroBg)" />
  <g filter="url(#aeroShadow)" transform="translate(250, 195)">
    <!-- Precision Compass Ring -->
    <circle cx="0" cy="0" r="95" fill="none" stroke="#334155" stroke-width="3" />
    <circle cx="0" cy="0" r="85" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="6 4" />
    <!-- Supersonic Delta Wings -->
    <path d="M0,-85 L80,55 L35,45 L0,20 L-35,45 L-80,55 Z" fill="url(#silverWing)" />
    <!-- Center Thrust Jet Core -->
    <polygon points="0,-40 22,35 0,22 -22,35" fill="url(#deltaGold)" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="38" letter-spacing="4" fill="#FFFFFF">AERODYNE</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="7" fill="#FBBF24">AEROSPACE LABS</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Lead 5-Axis CNC Programmer',
        department: 'Manufacturing',
        job_type: 'Full-time',
        experience_level: '6-9 years',
        salary_range: '₹12,00,000 - ₹18,00,000 P.A.',
        location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
        description: 'Program Mastercam/NX for complex aerospace titanium and Inconel components with sub-micron tolerances.'
      },
      {
        title: 'Avionics Systems Design Engineer',
        department: 'Engineering',
        job_type: 'Full-time',
        experience_level: '4-7 years',
        salary_range: '₹15,00,000 - ₹22,00,000 P.A.',
        location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
        description: 'Design ruggedized thermal enclosures and EMI-shielded avionics bays for drone and defense applications.'
      }
    ]
  },
  {
    name: 'Zenith Financial Cloud',
    industry: 'FinTech & Core Banking',
    company_type: 'Financial Technology Provider',
    description: 'High-throughput, ultra-secure transaction settlement rails and automated digital lending infrastructure for tier-1 banks and neo-banking institutions.',
    website: 'https://zenithfinancial.io',
    address: 'Tower B, Level 18, One BKC, Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    latitude: 19.0657,
    longitude: 72.8683,
    email: 'enterprise@zenithfinancial.io',
    phone: '+91 22 6902 4500',
    company_size: '500-1000 employees',
    founded_year: 2019,
    midc_zone: 'Bandra Kurla Complex',
    specializations: ['Core Banking APIs', 'Payment Gateway Rails', 'ISO 20022 Messaging', 'Zero Trust Cryptography'],
    color: '#1D4ED8',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="zenithBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="goldVault" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="blueShield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <filter id="zenithGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#3B82F6" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#zenithBg)" />
  <g filter="url(#zenithGlow)" transform="translate(250, 195)">
    <!-- Stylized Geometric Z Emblem with Vault Security Arch -->
    <path d="M-80,-70 L80,-70 L10,0 L80,70 L-80,70 L-10,0 Z" fill="url(#blueShield)" />
    <!-- Golden Ascending Axis -->
    <polygon points="0,-90 18,-60 -18,-60" fill="url(#goldVault)" />
    <polygon points="-40,-15 40,-15 20,15 -60,15" fill="#93C5FD" opacity="0.9" />
    <circle cx="0" cy="0" r="14" fill="#FFFFFF" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="38" letter-spacing="4" fill="#FFFFFF">ZENITH</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="6" fill="#60A5FA">FINANCIAL CLOUD</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Staff Backend Architect (Go / Distributed Systems)',
        department: 'Core Architecture',
        job_type: 'Full-time',
        experience_level: '8-12 years',
        salary_range: '₹35,00,000 - ₹50,00,000 P.A.',
        location: 'BKC, Mumbai (Hybrid)',
        description: 'Build low-latency payment processors handling 20,000+ financial TPS with multi-region state replication.'
      },
      {
        title: 'Information Security & Compliance Lead (CISA/CISSP)',
        department: 'SecOps',
        job_type: 'Full-time',
        experience_level: '6-10 years',
        salary_range: '₹24,00,000 - ₹34,00,000 P.A.',
        location: 'BKC, Mumbai',
        description: 'Oversee RBI cybersecurity framework compliance, SOC2 Type II audits, and zero-trust perimeter enforcement.'
      }
    ]
  },
  {
    name: 'Solara Clean Energy',
    industry: 'Renewable Energy & Storage',
    company_type: 'Renewables Infrastructure',
    description: 'Utility-scale solar power development, high-capacity commercial battery storage installations, and AI-powered industrial microgrid management systems.',
    website: 'https://solaracleanenergy.in',
    address: 'Solar Park 3, Paithan Road Industrial Area',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431005',
    latitude: 19.8245,
    longitude: 75.3312,
    email: 'info@solaracleanenergy.in',
    phone: '+91 240 236 9940',
    company_size: '200-500 employees',
    founded_year: 2014,
    midc_zone: 'Paithan Road',
    specializations: ['Solar Farm EPC', 'BESS Storage', 'Microgrid SCADA', 'Power Purchase Agreements', 'Grid Decarbonization'],
    color: '#059669',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="solaraBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B" />
      <stop offset="100%" stop-color="#022C22" />
    </linearGradient>
    <linearGradient id="sunEnergy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <linearGradient id="greenLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#F59E0B" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#solaraBg)" />
  <g filter="url(#sunGlow)" transform="translate(250, 195)">
    <!-- Multi-Ray Radiant Solar Crest -->
    <circle cx="0" cy="0" r="42" fill="url(#sunEnergy)" />
    <!-- Dynamic Energy Leaves in Orbit -->
    <path d="M0,-85 C25,-55 25,-15 0,0 C-25,-15 -25,-55 0,-85 Z" fill="url(#greenLeaf)" />
    <path d="M0,85 C-25,55 -25,15 0,0 C25,15 25,55 0,85 Z" fill="url(#greenLeaf)" />
    <path d="M85,0 C55,25 15,25 0,0 C15,-25 55,-25 85,0 Z" fill="url(#sunEnergy)" />
    <path d="M-85,0 C-55,-25 -15,-25 0,0 C-15,25 -55,25 -85,0 Z" fill="url(#sunEnergy)" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="40" letter-spacing="4" fill="#FFFFFF">SOLARA</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="6" fill="#34D399">CLEAN ENERGY</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Senior Solar EPC Project Manager',
        department: 'Operations & EPC',
        job_type: 'Full-time',
        experience_level: '7-10 years',
        salary_range: '₹16,00,000 - ₹24,00,000 P.A.',
        location: 'Paithan Road, Chhatrapati Sambhajinagar',
        description: 'Supervise 50MW+ utility solar farm installations, land acquisition coordination, and grid transmission tie-ins.'
      },
      {
        title: 'BESS Storage Systems Engineer',
        department: 'Engineering',
        job_type: 'Full-time',
        experience_level: '4-7 years',
        salary_range: '₹14,00,000 - ₹20,00,000 P.A.',
        location: 'Paithan Road, Chhatrapati Sambhajinagar',
        description: 'Integrate megawatt-scale battery energy storage systems, inverter controllers, and grid synchronization logic.'
      }
    ]
  },
  {
    name: 'QuantumByte Logistics',
    industry: 'Logistics Automation & Freight',
    company_type: 'Supply Chain Intelligence',
    description: 'Next-gen supply chain automation connecting India’s manufacturing corridors with smart IoT fleet telemetry, predictive freight dispatch, and automated warehousing.',
    website: 'https://quantumbytelogistics.com',
    address: 'Logistics Park Phase II, Waluj MIDC',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431136',
    latitude: 19.8451,
    longitude: 75.2534,
    email: 'ops@quantumbytelogistics.com',
    phone: '+91 240 255 7712',
    company_size: '500-1000 employees',
    founded_year: 2020,
    midc_zone: 'Waluj MIDC',
    specializations: ['Automated Freight Matching', 'Warehouse WMS', 'IoT Cold Chain Telemetry', 'Route Optimization'],
    color: '#6366F1',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="qBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="100%" stop-color="#312E81" />
    </linearGradient>
    <linearGradient id="indigoVelocity" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A5B4FC" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>
    <linearGradient id="cyanData" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <filter id="qGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#6366F1" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#qBg)" />
  <g filter="url(#qGlow)" transform="translate(250, 195)">
    <!-- Isometric Velocity Quantum Cube & Network Routing Nodes -->
    <path d="M0,-85 L75,-42 L75,42 L0,85 L-75,42 L-75,-42 Z" fill="none" stroke="url(#indigoVelocity)" stroke-width="8" />
    <path d="M0,-85 L0,85" stroke="url(#cyanData)" stroke-width="4" stroke-dasharray="8 6" />
    <path d="M-75,-42 L75,42" stroke="url(#cyanData)" stroke-width="4" stroke-dasharray="8 6" />
    <path d="M-75,42 L75,-42" stroke="url(#cyanData)" stroke-width="4" stroke-dasharray="8 6" />
    <!-- Dynamic Forward Freight Arrow -->
    <polygon points="-30,-15 25,-15 25,-35 60,0 25,35 25,15 -30,15" fill="#FFFFFF" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="34" letter-spacing="3" fill="#FFFFFF">QUANTUMBYTE</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="6" fill="#A5B4FC">SUPPLY CHAIN &amp; FREIGHT</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Operations Hub General Manager',
        department: 'Freight Operations',
        job_type: 'Full-time',
        experience_level: '8-12 years',
        salary_range: '₹18,00,000 - ₹25,00,000 P.A.',
        location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
        description: 'Oversee regional cross-docking operations, 200+ fleet management, and SLA delivery tracking across Maharashtra.'
      },
      {
        title: 'Logistics Data Scientist (Route Optimization)',
        department: 'Analytics',
        job_type: 'Full-time',
        experience_level: '3-6 years',
        salary_range: '₹14,00,000 - ₹22,00,000 P.A.',
        location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
        description: 'Build predictive dispatch models, fuel consumption optimizers, and dynamic load-clustering algorithms.'
      }
    ]
  },
  {
    name: 'Veloce Robotics',
    industry: 'Industrial Automation & Robotics',
    company_type: 'Advanced Robotics Manufacturer',
    description: 'Designer and integrator of high-speed collaborative robotic arms, automated optical inspection cells, and automated guided vehicles (AGVs) for smart manufacturing.',
    website: 'https://velocerobotics.com',
    address: 'Robotics Center of Excellence, AURIC Smart City, Shendra',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431154',
    latitude: 19.8864,
    longitude: 75.4912,
    email: 'solutions@velocerobotics.com',
    phone: '+91 240 298 9033',
    company_size: '100-250 employees',
    founded_year: 2021,
    midc_zone: 'Shendra MIDC',
    specializations: ['Collaborative Cobots', 'Computer Vision Sorting', 'AGV Fleet Systems', 'PLC/SCADA Integration'],
    color: '#E11D48',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="veloceBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B" />
      <stop offset="100%" stop-color="#27272A" />
    </linearGradient>
    <linearGradient id="rubyArm" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB7185" />
      <stop offset="100%" stop-color="#E11D48" />
    </linearGradient>
    <linearGradient id="silverJoint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#A1A1AA" />
    </linearGradient>
    <filter id="veloceGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#E11D48" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#veloceBg)" />
  <g filter="url(#veloceGlow)" transform="translate(250, 195)">
    <!-- Articulated Robotic Arm Monogram 'V' -->
    <path d="M-85,-75 L-25,70 L25,70 L85,-75 L45,-75 L0,30 L-45,-75 Z" fill="url(#rubyArm)" />
    <!-- Robotic Joint Bearings -->
    <circle cx="0" cy="30" r="14" fill="url(#silverJoint)" />
    <circle cx="-65" cy="-75" r="10" fill="url(#silverJoint)" />
    <circle cx="65" cy="-75" r="10" fill="url(#silverJoint)" />
    <!-- Laser Optical Sensor Beam -->
    <polygon points="0,44 10,75 -10,75" fill="#FDA4AF" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="40" letter-spacing="4" fill="#FFFFFF">VELOCE</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="6" fill="#FB7185">ROBOTICS &amp; AUTOMATION</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Robotics Controls & PLC Engineer',
        department: 'Automation Engineering',
        job_type: 'Full-time',
        experience_level: '4-8 years',
        salary_range: '₹12,00,000 - ₹19,00,000 P.A.',
        location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
        description: 'Program Fanuc, KUKA, and Universal Robots cobot arms, implement safety PLCs, and commission automotive assembly cells.'
      },
      {
        title: 'Computer Vision AI Engineer',
        department: 'Vision R&D',
        job_type: 'Full-time',
        experience_level: '3-6 years',
        salary_range: '₹15,00,000 - ₹24,00,000 P.A.',
        location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
        description: 'Deploy real-time PyTorch/OpenCV defect detection models on NVIDIA Jetson edge inference hardware.'
      }
    ]
  },
  {
    name: 'TerraCarbon Solutions',
    industry: 'Environmental Tech & Circular Economy',
    company_type: 'CleanTech Enterprise',
    description: 'Transforming industrial flue emissions into valuable precipitated minerals, offering automated carbon accounting software and sustainable polymer recycling.',
    website: 'https://terracarbon.tech',
    address: 'Plot F-19, Green Tech Zone, Chikalthana MIDC Phase II',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    pincode: '431006',
    latitude: 19.8912,
    longitude: 75.3941,
    email: 'esg@terracarbon.tech',
    phone: '+91 240 248 9981',
    company_size: '100-250 employees',
    founded_year: 2022,
    midc_zone: 'Chikalthana MIDC',
    specializations: ['Carbon Capture Utilization (CCU)', 'ESG Auditing', 'Polymer Upcycling', 'Industrial Decarbonization'],
    color: '#0F766E',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="terraBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022C22" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <linearGradient id="terraLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="skyAqua" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67E8F9" />
      <stop offset="100%" stop-color="#0E7490" />
    </linearGradient>
    <filter id="terraGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#34D399" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#terraBg)" />
  <g filter="url(#terraGlow)" transform="translate(250, 195)">
    <!-- Closed Circular Infinity Eco Loop -->
    <path d="M-60,-40 C-80,-15 -80,25 -50,55 C-20,80 20,80 50,55 C80,25 80,-15 60,-40 C40,-65 -40,-65 -60,-40 Z" fill="none" stroke="url(#skyAqua)" stroke-width="12" />
    <!-- Botanical Center Leaf Core -->
    <path d="M0,-55 C35,-20 35,25 0,55 C-35,25 -35,-20 0,-55 Z" fill="url(#terraLeaf)" />
    <!-- Center Carbon Node -->
    <circle cx="0" cy="5" r="14" fill="#FFFFFF" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="36" letter-spacing="4" fill="#FFFFFF">TERRACARBON</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="6" fill="#34D399">SOLUTIONS</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Chemical Process Engineer (Carbon Mineralization)',
        department: 'Process Engineering',
        job_type: 'Full-time',
        experience_level: '4-7 years',
        salary_range: '₹12,00,000 - ₹17,00,000 P.A.',
        location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
        description: 'Optimize gas-liquid scrubbers, precipitation reactors, and carbonate byproduct purification columns.'
      },
      {
        title: 'ESG Reporting & Carbon Credit Consultant',
        department: 'Sustainability Advisory',
        job_type: 'Full-time',
        experience_level: '3-6 years',
        salary_range: '₹10,00,000 - ₹15,00,000 P.A.',
        location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
        description: 'Conduct Scope 1/2/3 greenhouse gas audits and verify carbon credits on international voluntary carbon registries.'
      }
    ]
  },
  {
    name: 'StrataCore Infrastructure',
    industry: 'Data Centers & Hyperscale Infrastructure',
    company_type: 'Digital Infrastructure Carrier',
    description: 'Constructing and operating Tier-IV hyper-resilient sovereign edge data centers, optical dark fiber rings, and cloud interconnection nodes across Maharashtra.',
    website: 'https://stratacore.io',
    address: 'Campus 4, Rajiv Gandhi Infotech Park Phase III, Hinjawadi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    latitude: 18.5912,
    longitude: 73.7198,
    email: 'datacenter@stratacore.io',
    phone: '+91 20 6791 8000',
    company_size: '500-1000 employees',
    founded_year: 2017,
    midc_zone: 'Hinjawadi IT Park',
    specializations: ['Tier IV Data Centers', 'Edge Colocation', 'Dark Fiber Interconnect', 'High-Density Liquid Cooling'],
    color: '#4F46E5',
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="strataBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E1B4B" />
    </linearGradient>
    <linearGradient id="strataIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>
    <linearGradient id="cyanPillars" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <filter id="strataGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#4F46E5" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="500" height="500" rx="80" fill="url(#strataBg)" />
  <g filter="url(#strataGlow)" transform="translate(250, 195)">
    <!-- Stacked Isometric Hyperscale Server Layers -->
    <!-- Layer 1 Bottom -->
    <polygon points="0,50 80,10 0,-30 -80,10" fill="#312E81" />
    <!-- Layer 2 Middle -->
    <polygon points="0,20 80,-20 0,-60 -80,-20" fill="url(#strataIndigo)" />
    <!-- Layer 3 Top -->
    <polygon points="0,-10 80,-50 0,-90 -80,-50" fill="url(#cyanPillars)" />
    <!-- Beacon Vertical Fiber Array -->
    <line x1="0" y1="-90" x2="0" y2="50" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="8 6" />
    <circle cx="0" cy="-90" r="10" fill="#FFFFFF" />
  </g>
  <text x="250" y="375" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="38" letter-spacing="4" fill="#FFFFFF">STRATACORE</text>
  <text x="250" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" font-weight="600" font-size="16" letter-spacing="6" fill="#818CF8">INFRASTRUCTURE</text>
</svg>`,
    sampleJobs: [
      {
        title: 'Critical Facilities Data Center Manager',
        department: 'Data Center Infrastructure',
        job_type: 'Full-time',
        experience_level: '8-14 years',
        salary_range: '₹22,00,000 - ₹34,00,000 P.A.',
        location: 'Hinjawadi Phase III, Pune',
        description: 'Direct 24/7 HVAC chilled water loop, UPS generator backup power redundancy, and PUE optimization.'
      },
      {
        title: 'Optical Network Architect (DWDM / Terabit Fiber)',
        department: 'Network Operations',
        job_type: 'Full-time',
        experience_level: '5-9 years',
        salary_range: '₹18,00,000 - ₹28,00,000 P.A.',
        location: 'Hinjawadi Phase III, Pune',
        description: 'Design dark fiber metro loops, DWDM muxponders, and BGP edge routing for hyper-scale interconnects.'
      }
    ]
  }
];

export async function seed10ProfessionalCompanies() {
  console.log('🚀 Starting Seeding of 10 High-Prestige Enterprise Companies with Custom S3 Logos...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const company of COMPANIES_DATA) {
      console.log(`\n🎨 Uploading genuine vector logo to S3 for: ${company.name}...`);
      
      // Convert SVG to Base64 Data URI
      const base64Svg = `data:image/svg+xml;base64,${Buffer.from(company.svgLogo).toString('base64')}`;
      
      const fileKey = `company_logo_${company.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
      const s3LogoUrl = await S3Util.uploadBase64(base64Svg, 'company_logos', `${fileKey}.svg`);
      
      console.log(`   ✨ Real S3 Logo URL: ${s3LogoUrl}`);

      // Check if company exists to preserve or generate ID
      const checkRes = await client.query('SELECT id FROM companies WHERE name = $1 LIMIT 1;', [company.name]);
      const companyId = checkRes.rows.length > 0 ? checkRes.rows[0].id : uuidv4();

      // Upsert into companies table
      await client.query(
        `
        INSERT INTO companies (
          id, name, logo, color, industry, company_type, description,
          website, address, city, state, pincode, latitude, longitude,
          email, phone, company_size, founded_year, midc_zone,
          specializations, verified, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, NOW()
        )
        ON CONFLICT (name) DO UPDATE SET
          logo = EXCLUDED.logo,
          color = EXCLUDED.color,
          industry = EXCLUDED.industry,
          company_type = EXCLUDED.company_type,
          description = EXCLUDED.description,
          website = EXCLUDED.website,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          company_size = EXCLUDED.company_size,
          founded_year = EXCLUDED.founded_year,
          midc_zone = EXCLUDED.midc_zone,
          specializations = EXCLUDED.specializations,
          verified = TRUE,
          updated_at = NOW();
        `,
        [
          companyId,
          company.name,
          s3LogoUrl,
          company.color,
          company.industry,
          company.company_type,
          company.description,
          company.website,
          company.address,
          company.city,
          company.state,
          company.pincode,
          company.latitude,
          company.longitude,
          company.email,
          company.phone,
          company.company_size,
          company.founded_year,
          company.midc_zone,
          JSON.stringify(company.specializations),
          true
        ]
      );

      // Seed 2 sample jobs for each company so company detail page exhibits rich job listings
      for (const job of company.sampleJobs) {
        const jobId = uuidv4();
        await client.query(
          `
          INSERT INTO jobs (
            id, title, company, company_logo, company_color, industry,
            location, description, status, job_type, work_mode,
            min_experience, max_experience, openings, filled_openings,
            salary_min, salary_max, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, 'active', $9, 'On-site',
            3, 8, 2, 0,
            25000, 65000, NOW(), NOW()
          )
          ON CONFLICT (id) DO NOTHING;
          `,
          [
            jobId,
            job.title,
            company.name,
            s3LogoUrl,
            company.color,
            company.industry,
            job.location,
            job.description,
            job.job_type
          ]
        );
      }

      console.log(`   ✅ Seeded: ${company.name} with ${company.sampleJobs.length} active jobs.`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 Successfully committed all 10 companies to the database!');

    // Invalidate company caches
    try {
      await CacheService.invalidate(['cache:companies:all', 'companies:all']);
      await CacheService.invalidatePattern('company:profile:*');
      console.log('🧹 Flushed company cache keys from Redis/CacheService.');
    } catch (cacheErr) {
      console.log('⚠️ Notice: Cache flush skipped or completed:', cacheErr);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during company seeding:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow direct CLI execution
if (require.main === module || process.argv[1]?.includes('seed_10_professional_companies')) {
  seed10ProfessionalCompanies()
    .then(() => {
      console.log('✨ All 10 companies successfully seeded! Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal execution error:', err);
      process.exit(1);
    });
}
