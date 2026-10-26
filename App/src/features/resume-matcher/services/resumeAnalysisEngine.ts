import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import mammoth from 'mammoth';
import {
  ResumeAnalysisResult,
  MatchingJobRecommendation,
  RequirementAssessment,
  ImprovementPriority,
  KeywordRecommendation
} from '../types';

// Configure PDF.js worker in browser environment
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch {
    // Fallback CDN if local worker URL fails
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE MULTI-DOMAIN SKILL & COMPETENCY ONTOLOGY
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillDefinition {
  name: string;
  domain: string;
  category: string;
  aliases: string[];
}

export const COMPREHENSIVE_SKILL_CATALOG: SkillDefinition[] = [
  // ── 1. Software Engineering, Web, Mobile & Cloud ──
  { name: 'JavaScript', domain: 'it_software', category: 'Programming Languages', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { name: 'TypeScript', domain: 'it_software', category: 'Programming Languages', aliases: ['typescript', 'ts'] },
  { name: 'React', domain: 'it_software', category: 'Frontend', aliases: ['react', 'react.js', 'reactjs'] },
  { name: 'Next.js', domain: 'it_software', category: 'Frontend', aliases: ['next.js', 'nextjs'] },
  { name: 'Node.js', domain: 'it_software', category: 'Backend', aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'Express.js', domain: 'it_software', category: 'Backend', aliases: ['express.js', 'expressjs', 'express'] },
  { name: 'Python', domain: 'it_software', category: 'Programming Languages', aliases: ['python', 'python3', 'django', 'fastapi', 'flask'] },
  { name: 'Java', domain: 'it_software', category: 'Programming Languages', aliases: ['java', 'spring', 'spring boot', 'springboot'] },
  { name: 'C / C++', domain: 'it_software', category: 'Programming Languages', aliases: ['c++', 'cpp', 'embedded c'] },
  { name: 'C# / .NET', domain: 'it_software', category: 'Programming Languages', aliases: ['c#', '.net', 'dotnet', 'asp.net'] },
  { name: 'PHP', domain: 'it_software', category: 'Backend', aliases: ['php', 'laravel', 'codeigniter'] },
  { name: 'Go (Golang)', domain: 'it_software', category: 'Backend', aliases: ['golang', 'go language'] },
  { name: 'Flutter & Dart', domain: 'it_software', category: 'Mobile App', aliases: ['flutter', 'dart'] },
  { name: 'React Native', domain: 'it_software', category: 'Mobile App', aliases: ['react native', 'react-native'] },
  { name: 'Android / Kotlin', domain: 'it_software', category: 'Mobile App', aliases: ['android', 'kotlin', 'android studio'] },
  { name: 'SQL & Relational DB', domain: 'it_software', category: 'Databases', aliases: ['sql', 'postgresql', 'postgres', 'mysql', 'mariadb', 'oracle db'] },
  { name: 'NoSQL & MongoDB', domain: 'it_software', category: 'Databases', aliases: ['mongodb', 'nosql', 'mongoose', 'redis', 'cassandra'] },
  { name: 'RESTful API & GraphQL', domain: 'it_software', category: 'API Architecture', aliases: ['rest api', 'restful', 'graphql', 'endpoints', 'api design'] },
  { name: 'Git & Version Control', domain: 'it_software', category: 'DevOps & Tools', aliases: ['git', 'github', 'gitlab', 'version control'] },
  { name: 'Docker & Containers', domain: 'it_software', category: 'DevOps & Cloud', aliases: ['docker', 'containerization', 'compose'] },
  { name: 'Kubernetes', domain: 'it_software', category: 'DevOps & Cloud', aliases: ['kubernetes', 'k8s'] },
  { name: 'AWS Cloud', domain: 'it_software', category: 'DevOps & Cloud', aliases: ['aws', 'amazon web services', 's3', 'ec2', 'lambda', 'cloudfront'] },
  { name: 'CI/CD Pipelines', domain: 'it_software', category: 'DevOps & Cloud', aliases: ['ci/cd', 'github actions', 'jenkins', 'pipeline'] },
  { name: 'Linux Administration', domain: 'it_software', category: 'Infrastructure', aliases: ['linux', 'ubuntu', 'centos', 'bash', 'shell scripting'] },
  { name: 'HTML5 & CSS3', domain: 'it_software', category: 'Frontend', aliases: ['html', 'html5', 'css', 'css3', 'sass', 'tailwind', 'bootstrap'] },
  { name: 'Unit Testing & QA', domain: 'it_software', category: 'Quality', aliases: ['jest', 'mocha', 'cypress', 'unit testing', 'playwright', 'selenium'] },
  { name: 'Agile & Scrum', domain: 'it_software', category: 'Project Management', aliases: ['agile', 'scrum', 'jira', 'sprints', 'kanban'] },

  // ── 2. Machining, CNC, Tooling & Precision Fabrication ──
  { name: 'CNC Machine Operation', domain: 'cnc_machining', category: 'Machining', aliases: ['cnc', 'cnc operator', 'cnc operation', 'cnc lathe', 'cnc turning'] },
  { name: 'VMC Operation & Programming', domain: 'cnc_machining', category: 'Machining', aliases: ['vmc', 'vmc operator', 'vmc programming', 'machining center', '4-axis'] },
  { name: 'Fanuc Controller', domain: 'cnc_machining', category: 'Controllers', aliases: ['fanuc', 'fanuc series', 'fanuc control'] },
  { name: 'Siemens Controller', domain: 'cnc_machining', category: 'Controllers', aliases: ['siemens', 'sinumerik', 'siemens 828d', 'siemens 840d'] },
  { name: 'G-Code & M-Code Programming', domain: 'cnc_machining', category: 'Programming', aliases: ['g-code', 'm-code', 'cnc programming', 'part programming'] },
  { name: 'Manual Lathe & Turning', domain: 'cnc_machining', category: 'Machining', aliases: ['lathe', 'manual lathe', 'turner', 'turning', 'facing', 'threading'] },
  { name: 'Milling & Surface Grinding', domain: 'cnc_machining', category: 'Machining', aliases: ['milling', 'surface grinding', 'cylindrical grinding', 'grinder'] },
  { name: 'Tool & Die Making', domain: 'cnc_machining', category: 'Tooling', aliases: ['tool and die', 'toolmaker', 'die maintenance', 'press tool', 'jigs and fixtures'] },
  { name: 'Cutting Tools & Offsets', domain: 'cnc_machining', category: 'Machining', aliases: ['tool offset', 'carbide insert', 'boring bar', 'end mill', 'drill bit', 'tool wear'] },

  // ── 3. Welding & Metal Fabrication ──
  { name: 'MIG Welding (GMAW)', domain: 'welding_fabrication', category: 'Welding', aliases: ['mig welding', 'mig', 'gmaw', 'co2 welding', 'mig welder'] },
  { name: 'TIG Welding (GTAW)', domain: 'welding_fabrication', category: 'Welding', aliases: ['tig welding', 'tig', 'gtaw', 'argon welding', 'tig welder'] },
  { name: 'Arc / Stick Welding (SMAW)', domain: 'welding_fabrication', category: 'Welding', aliases: ['arc welding', 'smaw', 'stick welding', 'shielded metal arc'] },
  { name: 'Spot & Resistance Welding', domain: 'welding_fabrication', category: 'Welding', aliases: ['spot welding', 'projection welding', 'resistance welding'] },
  { name: 'Sheet Metal Fabrication', domain: 'welding_fabrication', category: 'Fabrication', aliases: ['sheet metal', 'bending machine', 'laser cutting', 'plasma cutting', 'shearing'] },
  { name: 'WPS & Welding Inspection', domain: 'welding_fabrication', category: 'Quality', aliases: ['wps', 'weld inspection', 'weld defect', 'penetration test', 'dpt test'] },

  // ── 4. Mechanical Assembly, Fitting & Maintenance ──
  { name: 'Mechanical Assembly & Fitting', domain: 'mechanical_maintenance', category: 'Assembly', aliases: ['mechanical assembly', 'fitter', 'iti fitter', 'bench work', 'sub-assembly', 'assembly line'] },
  { name: 'Preventive Maintenance (TPM)', domain: 'mechanical_maintenance', category: 'Maintenance', aliases: ['preventive maintenance', 'tpm', 'routine maintenance', 'pre-shift check', 'lubrication'] },
  { name: 'Breakdown Maintenance', domain: 'mechanical_maintenance', category: 'Maintenance', aliases: ['breakdown maintenance', 'troubleshooting', 'root cause', 'fault finding', 'machine overhaul'] },
  { name: 'Hydraulics & Pneumatics', domain: 'mechanical_maintenance', category: 'Systems', aliases: ['hydraulic', 'pneumatic', 'solenoid valve', 'actuator', 'cylinder', 'compressor'] },
  { name: 'Blueprint & Engineering Drawings', domain: 'mechanical_maintenance', category: 'Design & Drafting', aliases: ['engineering drawing', 'blueprint', 'drawing reading', 'technical schematic', 'gd&t'] },
  { name: 'CAD / 3D Modeling (AutoCAD/SolidWorks)', domain: 'mechanical_maintenance', category: 'Design', aliases: ['autocad', 'solidworks', 'catia', 'creo', 'nx cad', 'cad/cam'] },

  // ── 5. Electrical, Electronics & Industrial Automation ──
  { name: 'Industrial Electrician', domain: 'electrical_automation', category: 'Electrical', aliases: ['electrician', 'industrial electrician', 'wiring', 'panel wiring', 'cable laying'] },
  { name: '3-Phase Power & Switchgear', domain: 'electrical_automation', category: 'Electrical', aliases: ['3-phase', '415v', 'switchgear', 'mccb', 'contactor', 'transformer', 'busbar'] },
  { name: 'PLC Programming & Troubleshooting', domain: 'electrical_automation', category: 'Automation', aliases: ['plc', 'programmable logic controller', 'ladder logic', 'siemens s7', 'allen bradley', 'delta plc', 'mitsubishi plc'] },
  { name: 'SCADA & HMI Systems', domain: 'electrical_automation', category: 'Automation', aliases: ['scada', 'hmi', 'wonderware', 'wincc'] },
  { name: 'VFD & Motor Controls', domain: 'electrical_automation', category: 'Electrical', aliases: ['vfd', 'variable frequency drive', 'ac drive', 'induction motor', 'servo motor'] },

  // ── 6. Quality Control, Metrology & EHS Compliance ──
  { name: 'Quality Inspection (QC / QA)', domain: 'quality_inspection', category: 'Quality', aliases: ['quality control', 'qc', 'qa', 'quality assurance', 'line inspection', 'incoming inspection', 'rework reduction'] },
  { name: 'Precision Instruments (Vernier/Micrometer)', domain: 'quality_inspection', category: 'Metrology', aliases: ['vernier', 'vernier caliper', 'micrometer', 'height gauge', 'dial indicator', 'bore gauge'] },
  { name: 'CMM Operation', domain: 'quality_inspection', category: 'Metrology', aliases: ['cmm', 'coordinate measuring machine'] },
  { name: '5S & Workplace Organization', domain: 'quality_inspection', category: 'Standards', aliases: ['5s', 'sort set shine', 'workplace organization', 'housekeeping standard'] },
  { name: 'Industrial Safety & EHS', domain: 'quality_inspection', category: 'Safety', aliases: ['ehs', 'industrial safety', 'ppe', 'osha', 'safety protocol', 'fire extinguisher', 'first aid', 'accident prevention'] },
  { name: 'Kaizen & Six Sigma', domain: 'quality_inspection', category: 'Continuous Improvement', aliases: ['kaizen', 'six sigma', 'lean manufacturing', 'poka-yoke', '7 qc tools'] },

  // ── 7. Logistics, Warehouse & Material Handling ──
  { name: 'Forklift & Reach Truck Operation', domain: 'logistics_warehouse', category: 'Equipment', aliases: ['forklift', 'reach truck', 'bopt', 'pallet truck', 'stacker', 'material handling'] },
  { name: 'Warehouse Inventory & Storekeeping', domain: 'logistics_warehouse', category: 'Operations', aliases: ['store keeper', 'warehouse', 'inventory management', 'stock audit', 'fifo', 'binning', 'grn', 'migo'] },
  { name: 'SAP MM / ERP Inventory', domain: 'logistics_warehouse', category: 'Systems', aliases: ['sap mm', 'sap', 'erp', 'inventory software', 'gate pass'] },
  { name: 'Dispatch & Logistics Coordination', domain: 'logistics_warehouse', category: 'Logistics', aliases: ['dispatch', 'shipping', 'packaging', 'consignment', 'fleet management', 'line feeding'] },

  // ── 8. Retail, Sales, Business & Office ──
  { name: 'Retail Sales & Merchandising', domain: 'sales_retail', category: 'Sales', aliases: ['retail sales', 'counter sales', 'merchandising', 'visual merchandising', 'shelf display'] },
  { name: 'POS Billing & Cash Handling', domain: 'sales_retail', category: 'Operations', aliases: ['pos billing', 'pos', 'cash handling', 'cashier', 'daily reconciliation'] },
  { name: 'B2B & Field Sales', domain: 'sales_retail', category: 'Sales', aliases: ['b2b sales', 'field sales', 'business development', 'lead generation', 'cold calling', 'client acquisition'] },
  { name: 'Customer Service & Communication', domain: 'sales_retail', category: 'Customer Relations', aliases: ['customer service', 'customer support', 'communication skills', 'client relationship', 'handling queries'] },
  { name: 'CRM Systems (Salesforce/HubSpot)', domain: 'sales_retail', category: 'Systems', aliases: ['crm', 'salesforce', 'hubspot', 'lead tracking'] },

  // ── 9. Accounting, Finance & Administration ──
  { name: 'Accounting & Bookkeeping', domain: 'finance_accounting', category: 'Finance', aliases: ['accounting', 'bookkeeping', 'ledger', 'balance sheet', 'p&l', 'bank reconciliation'] },
  { name: 'Tally Prime / ERP 9', domain: 'finance_accounting', category: 'Finance', aliases: ['tally', 'tally prime', 'tally erp', 'voucher entry'] },
  { name: 'GST & TDS Compliance', domain: 'finance_accounting', category: 'Taxation', aliases: ['gst', 'gst return', 'gstr-1', 'gstr-3b', 'tds', 'income tax', 'taxation'] },
  { name: 'Advanced Excel & Data Reporting', domain: 'finance_accounting', category: 'Analytics', aliases: ['excel', 'advanced excel', 'vlookup', 'pivot table', 'xlookup', 'data entry', 'mis report', 'power bi'] },
  { name: 'HR & Payroll Management', domain: 'finance_accounting', category: 'Human Resources', aliases: ['payroll', 'hr', 'recruitment', 'talent acquisition', 'pf & esic', 'attendance management', 'onboarding'] }
];

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT EXTRACTION (PDF, DOCX, TXT, MD, ETC.)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * High-accuracy multi-format document text extraction.
 * Uses PDF.js for genuine PDF stream extraction, mammoth for DOCX, and FileReader for plain text.
 */
export async function extractResumeText(file: File): Promise<string> {
  const extension = (file.name.split('.').pop() || '').toLowerCase();

  // 1. Text, Markdown, CSV, JSON
  if (['txt', 'md', 'json', 'csv', 'rtf'].includes(extension)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(((e.target?.result as string) || '').trim());
      reader.onerror = () => reject(new Error('Failed to read text document.'));
      reader.readAsText(file);
    });
  }

  // 2. DOCX (Word Document) via Mammoth
  if (extension === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = (result.value || '').trim();
      if (text.length > 30) {
        return text;
      }
    } catch (docxErr) {
      console.warn('DOCX extraction warning, attempting binary fallback:', docxErr);
    }
  }

  // 3. PDF Document via PDF.js
  if (extension === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
        isEvalSupported: false
      });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      const pageTexts: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageLines: string[] = [];
        let lastY: number | null = null;
        let currentLine = '';

        for (const item of textContent.items) {
          if ('str' in item) {
            const str = item.str;
            const y = 'transform' in item ? item.transform[5] : null;

            // Simple line grouping by Y-coordinate
            if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
              if (currentLine.trim()) pageLines.push(currentLine.trim());
              currentLine = str;
            } else {
              currentLine += (currentLine ? ' ' : '') + str;
            }
            lastY = y;
          }
        }
        if (currentLine.trim()) pageLines.push(currentLine.trim());
        pageTexts.push(pageLines.join('\n'));
      }

      const fullPdfText = pageTexts.join('\n\n').trim();
      if (fullPdfText.length > 40) {
        return fullPdfText;
      }
    } catch (pdfErr) {
      console.warn('PDF.js parse warning, trying stream extraction:', pdfErr);
    }
  }

  // 4. Robust Binary Stream Fallback (for older .doc, scanned, or complex streams)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        let extracted = '';
        let chunk = '';

        // Extract contiguous sequences of printable ASCII & common Latin characters
        for (let i = 0; i < bytes.length; i++) {
          const byte = bytes[i];
          if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
            chunk += String.fromCharCode(byte);
          } else {
            if (chunk.length >= 4) {
              extracted += chunk + ' ';
            }
            chunk = '';
          }
        }
        if (chunk.length >= 4) extracted += chunk;

        // Clean up noise and structural markers
        const cleaned = extracted
          .replace(/[\\/]{2,}/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleaned.length > 100) {
          resolve(cleaned);
        } else {
          resolve(
            `Extracted candidate summary from ${file.name}. Technical qualifications and work history loaded.`
          );
        }
      } catch {
        resolve(`Document: ${file.name}`);
      }
    };
    reader.onerror = () => resolve(`Document: ${file.name}`);
    reader.readAsArrayBuffer(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN INTELLIGENCE & REQUIREMENT BENCHMARKS
// ─────────────────────────────────────────────────────────────────────────────

interface DomainBenchmark {
  title: string;
  requirements: Array<{ req: string; importance: 'required' | 'preferred' | 'mentioned'; category: string }>;
  essentialKeywords: string[];
  suggestedActions: Record<string, string>;
}

const DOMAIN_BENCHMARKS: Record<string, DomainBenchmark> = {
  it_software: {
    title: 'Software Development & IT Engineering',
    requirements: [
      { req: 'Proficiency in modern programming languages (TypeScript, JavaScript, Python, or Java)', importance: 'required', category: 'Core Technical' },
      { req: 'Frontend or Backend framework competence (React, Node.js, Next.js, Express, or Spring)', importance: 'required', category: 'Architecture & Stack' },
      { req: 'Database design, querying & data management (PostgreSQL, MySQL, or MongoDB)', importance: 'required', category: 'Data & Storage' },
      { req: 'RESTful API / Microservices development and third-party integration', importance: 'required', category: 'API Architecture' },
      { req: 'Git version control, code reviews and CI/CD automated deployment pipelines', importance: 'preferred', category: 'DevOps & Collaboration' },
      { req: 'Docker containerization or Cloud services (AWS, Azure, or GCP)', importance: 'preferred', category: 'Cloud & Infrastructure' },
      { req: 'Automated unit testing, debugging and performance optimization', importance: 'mentioned', category: 'Code Quality' }
    ],
    essentialKeywords: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST API', 'Docker', 'AWS', 'Git', 'CI/CD', 'Unit Testing'],
    suggestedActions: {
      'TypeScript': 'Specify TypeScript usage in your modern web/backend projects to highlight type safety skills.',
      'REST API': 'Detail RESTful endpoint design and JSON payload optimization in your project descriptions.',
      'Docker': 'Mention containerization experience (Dockerfile, docker-compose) for consistent deployment environments.',
      'AWS': 'Add specific cloud services used such as S3, EC2, Lambda, or CloudWatch.',
      'Unit Testing': 'List unit testing frameworks (Jest, Vitest, Cypress) and test coverage metrics.'
    }
  },
  cnc_machining: {
    title: 'CNC & VMC Precision Machining',
    requirements: [
      { req: 'Hands-on CNC / VMC machine setup, operation and offset adjustment', importance: 'required', category: 'Machine Operation' },
      { req: 'Familiarity with Fanuc or Siemens controller interfaces and G-code/M-code', importance: 'required', category: 'Controllers & Code' },
      { req: 'Precision measurement using Vernier calipers, micrometers and height gauges', importance: 'required', category: 'Metrology & QC' },
      { req: 'Blueprint & engineering drawing interpretation with GD&T tolerance standards', importance: 'required', category: 'Technical Drawings' },
      { req: 'Pre-shift preventive maintenance, coolant care and tool wear monitoring', importance: 'preferred', category: 'Maintenance' },
      { req: 'Adherence to 5S shopfloor organization and PPE safety protocols', importance: 'preferred', category: 'Compliance' }
    ],
    essentialKeywords: ['CNC Operating', 'VMC', 'Fanuc', 'Vernier Caliper', 'Micrometer', 'GD&T', 'G-Code', '5S', 'Preventive Maintenance'],
    suggestedActions: {
      'Fanuc': 'Explicitly mention the controller series (e.g. Fanuc 0i-MF, 31i) to attract top automotive manufacturers.',
      'GD&T': 'Highlight your ability to read Geometric Dimensioning & Tolerancing symbols on technical blueprints.',
      'Micrometer': 'Specify the tolerances achieved (e.g. +/- 10 microns) on critical machined components.',
      'Preventive Maintenance': 'List daily pre-shift checks, lubrication routines, and spindle alignment practices.'
    }
  },
  welding_fabrication: {
    title: 'Welding & Metal Fabrication',
    requirements: [
      { req: 'Hands-on MIG (GMAW) or TIG (GTAW) welding expertise on steel/aluminum', importance: 'required', category: 'Welding Skills' },
      { req: 'Adherence to WPS (Welding Procedure Specification) and quality inspection', importance: 'required', category: 'Quality & Standards' },
      { req: 'Strict adherence to PPE safety protocols, ventilation, and fire safety', importance: 'required', category: 'Workplace Safety' },
      { req: 'Sheet metal cutting, shearing, bending, and structural fabrication', importance: 'preferred', category: 'Fabrication' },
      { req: 'Ability to read welding symbols and structural fabrication blueprints', importance: 'preferred', category: 'Technical Drawings' }
    ],
    essentialKeywords: ['MIG Welding', 'TIG Welding', 'WPS Protocol', 'Shop Floor Safety', 'Argon Welding', 'Sheet Metal', 'Blueprint Reading'],
    suggestedActions: {
      'MIG Welding': 'Specify materials worked with (mild steel, stainless steel, aluminum) and plate thicknesses.',
      'WPS Protocol': 'State compliance with qualified welding procedures to signal professional fabrication training.',
      'Shop Floor Safety': 'Highlight fire safety training and 100% compliance with personal protective gear.'
    }
  },
  mechanical_maintenance: {
    title: 'Mechanical Assembly & Maintenance',
    requirements: [
      { req: 'Mechanical assembly, bench fitting, and alignment of pumps/gearboxes/machinery', importance: 'required', category: 'Assembly' },
      { req: 'Preventive and breakdown maintenance troubleshooting to minimize downtime', importance: 'required', category: 'Maintenance' },
      { req: 'Hydraulic and pneumatic circuit inspection, valves, and cylinder servicing', importance: 'required', category: 'Fluid Power' },
      { req: 'Ability to read mechanical blueprints, assembly schematics, and parts catalogs', importance: 'preferred', category: 'Documentation' },
      { req: 'Compliance with shopfloor 5S, lock-out/tag-out (LOTO), and safety standards', importance: 'preferred', category: 'Safety' }
    ],
    essentialKeywords: ['Mechanical Assembly', 'Preventive Maintenance', 'Breakdown Troubleshooting', 'Hydraulics', 'Pneumatics', '5S', 'Blueprints'],
    suggestedActions: {
      'Preventive Maintenance': 'Quantify equipment uptime or downtime reduction achieved through scheduled maintenance routines.',
      'Hydraulics': 'Cite hands-on experience replacing hydraulic seals, directional valves, and pressure relief valves.',
      '5S': 'Mention leadership in 5S audits or workstation decluttering.'
    }
  },
  electrical_automation: {
    title: 'Industrial Electrical & Automation',
    requirements: [
      { req: 'Industrial electrical panel wiring, 3-phase power systems, and cable routing', importance: 'required', category: 'Power & Distribution' },
      { req: 'Switchgear, MCCB, contactor, and transformer troubleshooting', importance: 'required', category: 'Switchgear' },
      { req: 'PLC troubleshooting, ladder logic understanding, and sensor interfacing', importance: 'required', category: 'Automation' },
      { req: 'AC/DC motor controls, VFD configuration, and parameter tuning', importance: 'preferred', category: 'Motor Control' },
      { req: 'Electrical safety compliance, earthing testing, and PPE protocols', importance: 'preferred', category: 'Safety' }
    ],
    essentialKeywords: ['Industrial Electrician', 'Panel Wiring', '3-Phase', 'PLC Programming', 'VFD', 'Switchgear', 'Electrical Safety'],
    suggestedActions: {
      'PLC Programming': 'List specific brand controllers configured (Siemens S7-1200, Delta, Allen Bradley, Mitsubishi).',
      'VFD': 'Mention parameter setting and frequency tuning for variable speed motor drives.',
      'Panel Wiring': 'State experience with control panel fabrication, terminal block tagging, and wiring continuity tests.'
    }
  },
  quality_inspection: {
    title: 'Quality Control, Metrology & Assurance',
    requirements: [
      { req: 'Precision measurement using Vernier, micrometer, height gauges, and bore gauges', importance: 'required', category: 'Metrology' },
      { req: 'First piece inspection, in-process patrol audits, and final dispatch clearance', importance: 'required', category: 'Inspection' },
      { req: 'Understanding of GD&T symbols, engineering tolerances, and rejection root-cause analysis', importance: 'required', category: 'Quality Standards' },
      { req: 'ISO 9001 quality system documentation, CAPA, and rejection reports', importance: 'preferred', category: 'Compliance' },
      { req: 'CMM operation or surface roughness testing', importance: 'preferred', category: 'Specialized Metrology' }
    ],
    essentialKeywords: ['Quality Control (QC)', 'Vernier Caliper', 'Micrometer', 'GD&T', 'ISO 9001', '7 QC Tools', 'CMM'],
    suggestedActions: {
      'Vernier Caliper': 'Specify the types of dimensions checked (ID, OD, depth) and calibration frequency.',
      'GD&T': 'Highlight familiarity with concentricity, runout, perpendicularity, and true position callouts.',
      '7 QC Tools': 'Cite usage of Pareto charts, Ishikawa fishbone diagrams, and check sheets during root cause investigations.'
    }
  },
  logistics_warehouse: {
    title: 'Logistics, Warehouse & Inventory Operations',
    requirements: [
      { req: 'Warehouse inventory management, material receipt (GRN), and physical stock auditing', importance: 'required', category: 'Inventory' },
      { req: 'FIFO execution, binning allocation, and line feeding coordination', importance: 'required', category: 'Operations' },
      { req: 'Operation of material handling equipment (Forklift, BOPT, Pallet Stacker)', importance: 'required', category: 'Equipment' },
      { req: 'ERP or SAP MM inventory module transaction entry and gate pass processing', importance: 'preferred', category: 'Systems' },
      { req: 'Warehouse safety guidelines, 5S storage cleanliness, and damage prevention', importance: 'preferred', category: 'Safety & 5S' }
    ],
    essentialKeywords: ['Store Keeper', 'Inventory Management', 'FIFO', 'Forklift', 'SAP MM', 'Material Handling', '5S'],
    suggestedActions: {
      'SAP MM': 'Mention specific transaction codes used (MIGO, MB51, MB52) for stock verification.',
      'Forklift': 'Indicate valid equipment operating certifications and safe lifting track record.',
      'FIFO': 'Detail how FIFO rotation was enforced to prevent obsolete or rusted inventory.'
    }
  },
  sales_retail: {
    title: 'Sales, Retail & Business Development',
    requirements: [
      { req: 'Direct customer interaction, sales target achievement, and consultative pitching', importance: 'required', category: 'Sales' },
      { req: 'Relationship management, client follow-ups, and negotiation skills', importance: 'required', category: 'Client Relations' },
      { req: 'POS billing, cash/digital payment reconciliation, and daily sales reporting', importance: 'required', category: 'Operations' },
      { req: 'Product merchandising, stock replenishment, and promotional campaigns', importance: 'preferred', category: 'Merchandising' },
      { req: 'CRM software utilization (Salesforce, HubSpot, or LeadSquared)', importance: 'preferred', category: 'Systems' }
    ],
    essentialKeywords: ['Retail Sales', 'Customer Service', 'POS Billing', 'B2B Sales', 'Lead Generation', 'CRM', 'Communication'],
    suggestedActions: {
      'B2B Sales': 'Include percentage quota achievement (e.g. 115% of annual revenue target).',
      'CRM': 'Mention experience managing sales pipelines and tracking conversion stages in CRM software.',
      'Customer Service': 'Highlight positive customer feedback scores or repeat business generation.'
    }
  },
  finance_accounting: {
    title: 'Accounting, Finance & Taxation',
    requirements: [
      { req: 'Bookkeeping, journal entries, ledger maintenance, and bank reconciliation', importance: 'required', category: 'Bookkeeping' },
      { req: 'Hands-on proficiency in Tally Prime / ERP 9 for sales and purchase entries', importance: 'required', category: 'Software' },
      { req: 'GST filing, TDS deduction, and monthly compliance returns', importance: 'required', category: 'Taxation' },
      { req: 'Advanced Excel reporting (VLOOKUP, Pivot Tables, SUMIFS, financial modeling)', importance: 'preferred', category: 'Reporting' },
      { req: 'Payroll processing, PF/ESIC deductions, and financial statement audit assistance', importance: 'preferred', category: 'Compliance' }
    ],
    essentialKeywords: ['Accounting', 'Tally Prime', 'GST Return', 'TDS', 'Advanced Excel', 'Bank Reconciliation', 'Payroll'],
    suggestedActions: {
      'Tally Prime': 'State exact modules utilized (inventory vouchers, multi-currency, TDS ledger creation).',
      'GST Return': 'Highlight experience preparing GSTR-1, GSTR-3B, and reconciling GSTR-2B input tax credits.',
      'Advanced Excel': 'Mention automated monthly MIS report generation using pivot tables and complex lookups.'
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE ANALYSIS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeResumeLocally(
  resumeText: string,
  targetJobDescription: string,
  availableJobs: any[],
  documentName: string,
  categoryFilter?: string
): ResumeAnalysisResult {
  const cleanResume = (resumeText || '').trim();
  const lowerResume = cleanResume.toLowerCase();
  const hasCustomJd = targetJobDescription && targetJobDescription.trim().length > 30;
  const lowerJd = hasCustomJd ? targetJobDescription.toLowerCase() : '';

  // 1. Detect candidate's demonstrated skills with exact citation evidence
  const detectedSkills: { name: string; domain: string; category: string; evidence: string }[] = [];
  const domainScoreCounts: Record<string, number> = {};

  for (const skill of COMPREHENSIVE_SKILL_CATALOG) {
    let found = false;
    let snippet = '';

    for (const alias of skill.aliases) {
      // Use boundary-safe search for short aliases
      const isShort = alias.length <= 3;
      let idx = -1;

      if (isShort) {
        const regex = new RegExp(`\\b${alias.replace('+', '\\+')}\\b`, 'i');
        const match = regex.exec(lowerResume);
        if (match) idx = match.index;
      } else {
        idx = lowerResume.indexOf(alias);
      }

      if (idx !== -1) {
        found = true;
        const start = Math.max(0, idx - 45);
        const end = Math.min(cleanResume.length, idx + alias.length + 55);
        snippet = `"...${cleanResume.slice(start, end).replace(/\s+/g, ' ').trim()}..."`;
        break;
      }
    }

    if (found) {
      detectedSkills.push({
        name: skill.name,
        domain: skill.domain,
        category: skill.category,
        evidence: snippet || `Demonstrated knowledge of ${skill.name} in resume context.`
      });
      domainScoreCounts[skill.domain] = (domainScoreCounts[skill.domain] || 0) + 1;
    }
  }

  // 2. Identify candidate's primary domain
  let candidateDomain = 'it_software';
  let maxDomainCount = -1;
  for (const [dom, count] of Object.entries(domainScoreCounts)) {
    if (count > maxDomainCount) {
      maxDomainCount = count;
      candidateDomain = dom;
    }
  }

  // Fallback domain detection by trade keywords if skill count was sparse
  if (maxDomainCount <= 1) {
    if (/welder|welding|tig|mig|argon|gmaw|gtaw/i.test(lowerResume)) candidateDomain = 'welding_fabrication';
    else if (/cnc|vmc|fanuc|siemens|g-code|machinist|turner|lathe/i.test(lowerResume)) candidateDomain = 'cnc_machining';
    else if (/electrician|wiring|panel|3-phase|switchgear|plc/i.test(lowerResume)) candidateDomain = 'electrical_automation';
    else if (/fitter|assembly|bench|maintenance|hydraulic|pneumatic/i.test(lowerResume)) candidateDomain = 'mechanical_maintenance';
    else if (/qc|qa|vernier|micrometer|inspection|quality control/i.test(lowerResume)) candidateDomain = 'quality_inspection';
    else if (/forklift|warehouse|storekeeper|inventory|dispatch/i.test(lowerResume)) candidateDomain = 'logistics_warehouse';
    else if (/retail|sales|customer|counter|b2b/i.test(lowerResume)) candidateDomain = 'sales_retail';
    else if (/account|tally|gst|tds|balance sheet|ledger/i.test(lowerResume)) candidateDomain = 'finance_accounting';
    else if (/software|developer|react|javascript|python|java|api|cloud/i.test(lowerResume)) candidateDomain = 'it_software';
  }

  // 3. Extract target requirements
  const targetRequirementsList: { req: string; importance: 'required' | 'preferred' | 'mentioned'; category: string }[] = [];

  if (hasCustomJd) {
    // Parse user's custom JD intelligently
    const lines = targetJobDescription
      .split(/\n|•|\*|- |;/)
      .map(l => l.trim())
      .filter(l => l.length >= 15 && l.length <= 160);

    for (const line of lines) {
      const isReq = /must|required|minimum|experience|proficiency|degree|diploma|iti|essential|mandatory/i.test(line);
      const isPref = /preferred|good to have|advantage|bonus|plus|desired|familiarity/i.test(line);

      targetRequirementsList.push({
        req: line,
        importance: isReq ? 'required' : isPref ? 'preferred' : 'mentioned',
        category: 'Job Competency'
      });
      if (targetRequirementsList.length >= 7) break;
    }
  }

  // If no custom JD lines were extracted, use dynamic domain benchmark
  if (targetRequirementsList.length === 0) {
    const benchmark = DOMAIN_BENCHMARKS[candidateDomain] || DOMAIN_BENCHMARKS.it_software;
    targetRequirementsList.push(...benchmark.requirements);
  }

  // 4. Assess each requirement against the resume text
  const requirementAssessments: RequirementAssessment[] = targetRequirementsList.map((item) => {
    const reqLower = item.req.toLowerCase();

    // Check if any detected skill aligns
    const matchedSkill = detectedSkills.find(s => {
      const nameMatch = reqLower.includes(s.name.toLowerCase());
      const def = COMPREHENSIVE_SKILL_CATALOG.find(cat => cat.name === s.name);
      const aliasMatch = def?.aliases.some(a => reqLower.includes(a));
      return nameMatch || aliasMatch;
    });

    // Check word-level overlap
    const directWords = reqLower
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'have', 'from', 'must', 'plus', 'good', 'years', 'will'].includes(w));

    const matchingWords = directWords.filter(w => lowerResume.includes(w));
    const overlapRatio = directWords.length > 0 ? matchingWords.length / directWords.length : 0;

    let status: 'demonstrated' | 'needs_verification' | 'not_evidenced' = 'not_evidenced';
    let evidenceSnippet = '';
    let explanation = '';
    let suggestedNextStep = '';

    if (matchedSkill) {
      status = 'demonstrated';
      evidenceSnippet = matchedSkill.evidence;
      explanation = `Demonstrated through verified skill citation (${matchedSkill.name}) in resume.`;
      suggestedNextStep = 'Highlight quantitative metrics (e.g. scale, project impact, tolerance accuracy) to strengthen further.';
    } else if (overlapRatio >= 0.5 || matchingWords.length >= 2) {
      status = 'needs_verification';
      const firstWord = matchingWords[0];
      const idx = lowerResume.indexOf(firstWord);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(cleanResume.length, idx + 50);
        evidenceSnippet = `"...${cleanResume.slice(start, end).replace(/\s+/g, ' ').trim()}..."`;
      }
      explanation = `Contextual terms (${matchingWords.slice(0, 3).join(', ')}) are present, but hands-on operational evidence should be more explicit.`;
      suggestedNextStep = `Clarify specific projects, roles or tools demonstrating "${item.req.slice(0, 45)}...".`;
    } else {
      status = 'not_evidenced';
      explanation = 'No concrete evidence, certifications, or direct mention located in resume text.';
      suggestedNextStep = `Add practical experience, coursework, or certifications covering this requirement.`;
    }

    return {
      requirement: item.req,
      category: item.category,
      importance: item.importance,
      evidenceFound: status !== 'not_evidenced',
      evidenceType: status,
      evidenceSnippet,
      status,
      explanation,
      suggestedNextStep
    };
  });

  // 5. Calculate Calibrated Weighted Fit Score
  const reqItems = requirementAssessments.filter(r => r.importance === 'required');
  const prefItems = requirementAssessments.filter(r => r.importance === 'preferred');

  const reqScore = reqItems.length > 0
    ? (reqItems.filter(r => r.status === 'demonstrated').length * 100 + reqItems.filter(r => r.status === 'needs_verification').length * 55) / reqItems.length
    : (detectedSkills.length >= 4 ? 85 : 60);

  const prefScore = prefItems.length > 0
    ? (prefItems.filter(r => r.status === 'demonstrated').length * 100 + prefItems.filter(r => r.status === 'needs_verification').length * 50) / prefItems.length
    : 70;

  // Semantic relevance based on vocabulary diversity & skill density
  const semanticBase = Math.min(95, Math.max(35, detectedSkills.length * 9 + (lowerJd ? 25 : 35)));
  const semanticScore = Math.round(semanticBase);

  // Experience alignment
  const expMatch = lowerResume.match(/(\d+)\+?\s*(?:years|yrs|year)/i);
  const detectedYears = expMatch ? parseInt(expMatch[1], 10) : (detectedSkills.length >= 5 ? 4 : detectedSkills.length >= 2 ? 2 : 1);
  const experienceScore = Math.min(98, Math.max(45, Math.round(Math.min(detectedYears, 6) * 14 + 35)));

  // Project evidence & quantifiable metrics
  const hasProjectsSection = /project|responsibilities|achievement|duty|undertook|implemented|developed|designed|built/i.test(lowerResume);
  const hasMetrics = /\d+%\s*|\d+\s*(?:units|parts|k|lakh|cr|reduction|hours|shifts|clients|users|queries)/i.test(lowerResume);
  const projectScore = hasProjectsSection && hasMetrics ? 92 : hasProjectsSection ? 78 : 50;

  const overallScore = Math.min(98, Math.max(30, Math.round(
    reqScore * 0.35 +
    semanticScore * 0.25 +
    experienceScore * 0.20 +
    prefScore * 0.10 +
    projectScore * 0.10
  )));

  // 6. Dynamic Keyword Recommendations (Never static)
  const benchmark = DOMAIN_BENCHMARKS[candidateDomain] || DOMAIN_BENCHMARKS.it_software;
  const keywordRecommendations: KeywordRecommendation[] = [];

  // Check essential keywords for the domain
  const candidateSkillsLower = detectedSkills.map(s => s.name.toLowerCase());
  const evaluatedKeywords = hasCustomJd
    ? [
        ...benchmark.essentialKeywords.slice(0, 3),
        ...targetRequirementsList.map(r => r.req.split(/\s+/).slice(0, 2).join(' ')).filter(k => k.length > 4)
      ].slice(0, 6)
    : benchmark.essentialKeywords.slice(0, 5);

  const seenKeywords = new Set<string>();

  for (const kw of evaluatedKeywords) {
    if (seenKeywords.has(kw.toLowerCase())) continue;
    seenKeywords.add(kw.toLowerCase());

    const isPresent = lowerResume.includes(kw.toLowerCase()) || candidateSkillsLower.some(s => s.includes(kw.toLowerCase()));
    const customAction = benchmark.suggestedActions[kw];

    keywordRecommendations.push({
      keyword: kw,
      importance: keywordRecommendations.length < 2 ? 'required' : 'preferred',
      presence: isPresent ? 'present' : 'missing',
      reason: isPresent
        ? `Recruiters actively scan for ${kw} to confirm hands-on competence in ${benchmark.title}.`
        : `High-frequency benchmark requirement for top roles in ${benchmark.title}.`,
      suggestedAction: isPresent
        ? (customAction || `Keep ${kw} clearly visible in your core skills and project descriptions.`)
        : (customAction || `Add practical examples or technical coursework demonstrating ${kw}.`)
    });
  }

  // 7. Dynamic Improvement Priorities
  const improvementPriorities: ImprovementPriority[] = [];
  const missingReqs = requirementAssessments.filter(r => r.status === 'not_evidenced');
  const verifyReqs = requirementAssessments.filter(r => r.status === 'needs_verification');

  if (missingReqs.length > 0) {
    improvementPriorities.push({
      title: `Build concrete evidence for: ${missingReqs[0].requirement.slice(0, 50)}`,
      detail: `This requirement is currently unevidenced. Add direct project descriptions, shopfloor duties, or credentials for ${missingReqs[0].requirement.slice(0, 60)}.`,
      requirement: missingReqs[0].requirement,
      importance: missingReqs[0].importance,
      actionType: 'build_evidence'
    });
  }

  if (verifyReqs.length > 0) {
    improvementPriorities.push({
      title: `Clarify terminology & context for: ${verifyReqs[0].requirement.slice(0, 50)}`,
      detail: 'Keywords were located in your document, but specific hands-on application context is ambiguous. Frame this with direct project responsibilities.',
      requirement: verifyReqs[0].requirement,
      importance: verifyReqs[0].importance,
      actionType: 'clarify'
    });
  }

  if (!hasMetrics) {
    improvementPriorities.push({
      title: 'Quantify achievements with measurable numerical metrics',
      detail: candidateDomain === 'it_software'
        ? 'Add quantitative performance indicators such as API response time reduction (%), active users handled, test coverage (%), or sprint velocity.'
        : candidateDomain === 'cnc_machining' || candidateDomain === 'welding_fabrication'
        ? 'Add numerical metrics such as daily piece output, scrap rate reduction (%), micrometer tolerance levels (+/- microns), or OEE improvements.'
        : 'Add quantifiable metrics such as volume handled, turnaround time reduction (%), or percentage of target achieved.',
      importance: 'preferred',
      actionType: 'strengthen'
    });
  }

  // 8. Match against Live JobMarket Listings
  let poolJobs = availableJobs || [];

  // Filter pool by industry category if user selected a specific filter
  if (categoryFilter && categoryFilter !== 'all' && categoryFilter !== 'All Industries & Categories') {
    const catLower = categoryFilter.toLowerCase();
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
    .map((job) => {
      const jobTitle = String(job.title || '').toLowerCase();
      const jobDesc = String(job.description || '').toLowerCase();
      const jobTrade = String(job.trade || '').toLowerCase();
      const jobSkills: string[] = Array.isArray(job.skills) ? job.skills : [];

      let matchPoints = 48;
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      // Check candidate's detected skills against this job
      for (const dSkill of detectedSkills) {
        const sLower = dSkill.name.toLowerCase();
        if (
          jobTitle.includes(sLower) ||
          jobDesc.includes(sLower) ||
          jobSkills.some(s => s.toLowerCase().includes(sLower))
        ) {
          matchPoints += 12;
          if (!matchedSkills.includes(dSkill.name)) {
            matchedSkills.push(dSkill.name);
          }
        }
      }

      // Check trade alignment
      if (jobTrade && (lowerResume.includes(jobTrade) || candidateDomain.includes(jobTrade))) {
        matchPoints += 15;
      }

      // Identify missing skills specified by the job
      for (const s of jobSkills) {
        if (!lowerResume.includes(s.toLowerCase()) && !matchedSkills.some(m => m.toLowerCase() === s.toLowerCase())) {
          missingSkills.push(s);
        }
      }

      const finalScore = Math.min(98, Math.max(50, matchPoints));

      return {
        id: String(job.id),
        title: job.title || 'Technical Specialist',
        company: job.company || 'Industrial Partner',
        companyLogo: job.company_logo || job.companyLogo,
        location: job.location || job.midc_zone || 'Chhatrapati Sambhajinagar',
        salaryMin: job.salary_min || job.salaryMin,
        salaryMax: job.salary_max || job.salaryMax,
        salaryFormatted: job.salary_min && job.salary_max
          ? `₹${Math.round(job.salary_min / 1000)}k - ₹${Math.round(job.salary_max / 1000)}k/mo`
          : 'Competitive Salary',
        jobType: job.job_type || job.jobType || 'Full Time',
        workMode: job.work_mode || job.workMode || 'On-site',
        matchScore: finalScore,
        matchingSkills: matchedSkills.slice(0, 4),
        missingSkills: missingSkills.slice(0, 3),
        reason: matchedSkills.length > 0
          ? `Strong overlap on ${matchedSkills.slice(0, 2).join(' & ')}.`
          : 'High domain compatibility with your experience profile.',
        trade: job.trade,
        midcZone: job.midc_zone || job.midcZone
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);

  return {
    analysisId: `anlz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    analyzedAt: new Date().toISOString(),
    documentName: documentName || 'Candidate_Resume.pdf',
    engineUsed: 'deterministic_nlp_fallback',
    documentStats: {
      wordCount: cleanResume.split(/\s+/).filter(Boolean).length,
      characterCount: cleanResume.length,
      skillsDetectedCount: detectedSkills.length,
      yearsOfExperience: detectedYears
    },
    targetTitle: hasCustomJd ? 'Custom Target Job Description' : benchmark.title,
    matchScore: overallScore,
    scoreBreakdown: {
      requiredSkillCoverage: Math.round(reqScore),
      semanticRelevance: Math.round(semanticScore),
      experienceAlignment: Math.round(experienceScore),
      preferredSkillCoverage: Math.round(prefScore),
      projectRelevance: Math.round(projectScore)
    },
    scoreComponents: [
      {
        component: 'Required Skill Coverage',
        weight: '35%',
        effectiveWeight: 0.35,
        score: Math.round(reqScore),
        note: `${requirementAssessments.filter(r => r.importance === 'required' && r.status === 'demonstrated').length} of ${reqItems.length} required competencies verified.`
      },
      {
        component: 'Semantic Relevance',
        weight: '25%',
        effectiveWeight: 0.25,
        score: Math.round(semanticScore),
        note: `Evaluated against ${benchmark.title} vocabulary density.`
      },
      {
        component: 'Experience Alignment',
        weight: '20%',
        effectiveWeight: 0.20,
        score: Math.round(experienceScore),
        note: `Detected ~${detectedYears} years relevant experience.`
      },
      {
        component: 'Preferred Skill Coverage',
        weight: '10%',
        effectiveWeight: 0.10,
        score: Math.round(prefScore),
        note: 'Bonus points for specialized tools and secondary competencies.'
      },
      {
        component: 'Project Evidence',
        weight: '10%',
        effectiveWeight: 0.10,
        score: Math.round(projectScore),
        note: hasMetrics ? 'Quantifiable impact metrics and project responsibilities verified.' : 'Recommend adding explicit numerical metrics.'
      }
    ],
    explanation: overallScore >= 80
      ? `Outstanding match profile for ${benchmark.title}. Your demonstrated competencies closely align with core industry requirements.`
      : overallScore >= 65
      ? `Solid transferable alignment for ${benchmark.title}. You demonstrate foundational core skills with opportunities to add explicit project metrics.`
      : `Moderate alignment. Your resume contains relevant background, but several core ${benchmark.title} requirements need to be explicitly detailed.`,
    requirements: requirementAssessments,
    keywordRecommendations,
    improvementPriorities,
    recommendedJobs,
    extractedSkills: detectedSkills.map(s => s.name)
  };
}
