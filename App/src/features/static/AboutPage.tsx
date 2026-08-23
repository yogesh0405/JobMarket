import React from 'react';
import {
  Compass,
  Info,
  FileText,
  ShieldCheck,
  ChevronRight,
  User,
  Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import THEME from '../../constants/theme';

// ─────────────────────────────────────────────────────────────────────────────
// FLAT VECTOR CHARACTER SCENE ILLUSTRATIONS (Matching Mobile Reference Style)
// ─────────────────────────────────────────────────────────────────────────────

const DiscoverJobsScene: React.FC<{ width?: number; height?: number }> = ({ width = 140, height = 95 }) => (
  <svg width={width} height={height} viewBox="0 0 200 138" fill="none">
    <defs>
      <linearGradient id="peachBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF5ED" />
        <stop offset="100%" stopColor="#FFEAD8" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="180" height="120" rx="24" fill="url(#peachBackdrop)" stroke="#FED7AA" strokeWidth="1" />
    <path d="M25 116H175" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <path d="M150 8V35" stroke="#FB923C" strokeWidth="1.5" />
    <path d="M142 35H158L153 45H147L142 35Z" fill="#FDBA74" />
    <rect x="40" y="68" width="120" height="42" rx="8" fill="#F87171" />
    <rect x="34" y="60" width="132" height="16" rx="6" fill="#EF4444" />
    <rect x="44" y="82" width="52" height="24" rx="4" fill="#DC2626" />
    <rect x="104" y="82" width="52" height="24" rx="4" fill="#DC2626" />
    <rect x="46" y="110" width="6" height="8" rx="2" fill="#78350F" />
    <rect x="148" y="110" width="6" height="8" rx="2" fill="#78350F" />
    <circle cx="82" cy="44" r="10" fill="#78350F" />
    <circle cx="82" cy="46" r="8" fill="#FDBA74" />
    <path d="M74 44C74 38 78 36 84 36C90 36 91 40 91 44" fill="#451A03" />
    <path d="M70 60C70 54 75 52 82 52C89 52 94 54 94 60V78H70V60Z" fill="#0D9488" />
    <rect x="72" y="78" width="10" height="26" rx="4" fill="#1D4ED8" />
    <rect x="84" y="78" width="10" height="26" rx="4" fill="#1D4ED8" />
    <rect x="68" y="72" width="28" height="18" rx="3" fill="#1B4FDF" />
    <rect x="70" y="74" width="24" height="13" rx="2" fill="#FFFFFF" />
    <circle cx="80" cy="80" r="4" stroke="#1B4FDF" strokeWidth="1.5" />
    <path d="M83 83L87 87" stroke="#1B4FDF" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="64" y="90" width="36" height="3" rx="1.5" fill="#94A3B8" />
    <g transform="translate(118, 25)">
      <rect x="0" y="0" width="54" height="32" rx="6" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="1" />
      <circle cx="12" cy="12" r="5" fill="#1B4FDF" />
      <rect x="21" y="8" width="24" height="3" rx="1.5" fill="#0F172A" />
      <rect x="21" y="14" width="18" height="2.5" rx="1" fill="#94A3B8" />
      <rect x="8" y="21" width="38" height="5" rx="2.5" fill="#EFF6FF" />
      <text x="14" y="25" fontSize="3.5" fontWeight="bold" fill="#1B4FDF">MIDC TECH</text>
    </g>
  </svg>
);

const CandidateProfileScene: React.FC<{ width?: number; height?: number }> = ({ width = 140, height = 95 }) => (
  <svg width={width} height={height} viewBox="0 0 200 138" fill="none">
    <defs>
      <linearGradient id="purpleBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5F3FF" />
        <stop offset="100%" stopColor="#EDE9FE" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="180" height="120" rx="24" fill="url(#purpleBackdrop)" stroke="#DDD6FE" strokeWidth="1" />
    <path d="M25 116H175" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <rect x="32" y="20" width="90" height="92" rx="8" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="1.5" />
    <rect x="32" y="20" width="90" height="20" rx="8" fill="#7C3AED" />
    <circle cx="50" cy="30" r="7" fill="#EDE9FE" stroke="#FFFFFF" strokeWidth="1.5" />
    <rect x="62" y="26" width="45" height="4" rx="2" fill="#FFFFFF" />
    <rect x="62" y="32" width="30" height="3" rx="1.5" fill="#DDD6FE" />
    <rect x="42" y="48" width="70" height="4" rx="2" fill="#4C1D95" />
    <rect x="42" y="56" width="55" height="3" rx="1.5" fill="#94A3B8" />
    <rect x="42" y="62" width="62" height="3" rx="1.5" fill="#CBD5E1" />
    <rect x="42" y="72" width="20" height="8" rx="4" fill="#F3E8FF" stroke="#C084FC" strokeWidth="1" />
    <rect x="66" y="72" width="22" height="8" rx="4" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1" />
    <rect x="42" y="84" width="46" height="16" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
    <circle cx="108" cy="94" r="9" fill="#059669" />
    <path d="M104 94L107 97L112 91" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="152" cy="38" r="9" fill="#451A03" />
    <circle cx="152" cy="40" r="7" fill="#FDBA74" />
    <path d="M145 38C145 32 150 30 155 30C160 30 161 34 161 38" fill="#1E293B" />
    <path d="M142 54C142 49 146 47 152 47C158 47 162 49 162 54V82H142V54Z" fill="#EC4899" />
    <rect x="144" y="82" width="7" height="32" rx="3.5" fill="#1E293B" />
    <rect x="153" y="82" width="7" height="32" rx="3.5" fill="#1E293B" />
    <path d="M144 54L128 64" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" />
    <circle cx="127" cy="65" r="3" fill="#FDBA74" />
  </svg>
);

const OneTapApplyScene: React.FC<{ width?: number; height?: number }> = ({ width = 140, height = 95 }) => (
  <svg width={width} height={height} viewBox="0 0 200 138" fill="none">
    <defs>
      <linearGradient id="blueBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F0F9FF" />
        <stop offset="100%" stopColor="#E0F2FE" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="180" height="120" rx="24" fill="url(#blueBackdrop)" stroke="#BAE6FD" strokeWidth="1" />
    <path d="M25 116H175" stroke="#7DD3FC" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <rect x="50" y="76" width="100" height="8" rx="2" fill="#78350F" />
    <rect x="56" y="84" width="6" height="32" rx="2" fill="#9A3412" />
    <rect x="138" y="84" width="6" height="32" rx="2" fill="#9A3412" />
    <rect x="82" y="65" width="36" height="45" rx="6" fill="#1E293B" />
    <circle cx="100" cy="38" r="9" fill="#FDBA74" />
    <path d="M92 36C92 30 96 28 100 28C104 28 108 30 108 36" fill="#1B4FDF" />
    <path d="M90 38C90 32 94 30 100 30C106 30 110 32 110 38" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="89" y="35" width="4" height="8" rx="2" fill="#EF4444" />
    <rect x="107" y="35" width="4" height="8" rx="2" fill="#EF4444" />
    <path d="M90 52C90 47 94 45 100 45C106 45 110 47 110 52V76H90V52Z" fill="#2563EB" />
    <rect x="86" y="62" width="28" height="16" rx="3" fill="#0F172A" />
    <rect x="88" y="64" width="24" height="12" rx="2" fill="#FFFFFF" />
    <circle cx="100" cy="70" r="4" fill="#059669" />
    <path d="M98 70L99.5 71.5L102 68.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    <g transform="translate(132, 22)">
      <circle cx="20" cy="20" r="18" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
      <path d="M20 9L27 27L20 23L13 27L20 9Z" fill="#1B4FDF" />
      <circle cx="20" cy="32" r="3" fill="#F59E0B" />
    </g>
  </svg>
);

const TrackingScene: React.FC<{ width?: number; height?: number }> = ({ width = 140, height = 95 }) => (
  <svg width={width} height={height} viewBox="0 0 200 138" fill="none">
    <defs>
      <linearGradient id="yellowBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEFCE8" />
        <stop offset="100%" stopColor="#FEF08A" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="180" height="120" rx="24" fill="url(#yellowBackdrop)" stroke="#FDE047" strokeWidth="1" />
    <path d="M25 116H175" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <rect x="40" y="78" width="120" height="8" rx="2" fill="#B45309" />
    <rect x="50" y="86" width="6" height="30" rx="2" fill="#78350F" />
    <rect x="144" y="86" width="6" height="30" rx="2" fill="#78350F" />
    <circle cx="62" cy="46" r="8" fill="#FDBA74" />
    <path d="M55 44C55 38 60 36 65 36C70 36 71 40 71 44" fill="#78350F" />
    <path d="M52 60C52 54 56 52 62 52C68 52 72 54 72 60V78H52V60Z" fill="#7C3AED" />
    <circle cx="138" cy="46" r="8" fill="#FDBA74" />
    <path d="M131 44C131 38 136 36 141 36C146 36 147 40 147 44" fill="#0F172A" />
    <path d="M128 60C128 54 132 52 138 52C144 52 148 54 148 60V78H128V60Z" fill="#059669" />
    <rect x="74" y="24" width="26" height="16" rx="5" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="1.2" />
    <path d="M80 40L84 45L86 40H80Z" fill="#FFFFFF" />
    <rect x="78" y="29" width="18" height="2" rx="1" fill="#7C3AED" />
    <rect x="78" y="34" width="12" height="2" rx="1" fill="#DDD6FE" />
    <rect x="104" y="24" width="26" height="16" rx="5" fill="#FFFFFF" stroke="#059669" strokeWidth="1.2" />
    <path d="M120 40L116 45L114 40H120Z" fill="#FFFFFF" />
    <rect x="108" y="29" width="18" height="2" rx="1" fill="#059669" />
    <rect x="108" y="34" width="14" height="2" rx="1" fill="#A7F3D0" />
    <rect x="92" y="68" width="16" height="10" rx="2" fill="#64748B" />
    <rect x="114" y="70" width="6" height="8" rx="2" fill="#EF4444" />
  </svg>
);

const PostJobScene: React.FC<{ width?: number; height?: number }> = ({ width = 140, height = 95 }) => (
  <svg width={width} height={height} viewBox="0 0 200 138" fill="none">
    <defs>
      <linearGradient id="empPeachBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF5ED" />
        <stop offset="100%" stopColor="#FFEAD8" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="180" height="120" rx="24" fill="url(#empPeachBackdrop)" stroke="#FED7AA" strokeWidth="1" />
    <path d="M25 116H175" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <rect x="45" y="22" width="75" height="52" rx="6" fill="#FFFFFF" stroke="#1B4FDF" strokeWidth="1.5" />
    <rect x="45" y="22" width="75" height="12" rx="6" fill="#1B4FDF" />
    <rect x="75" y="74" width="15" height="10" fill="#94A3B8" />
    <rect x="65" y="84" width="35" height="4" rx="2" fill="#64748B" />
    <rect x="52" y="40" width="35" height="4" rx="2" fill="#1E293B" />
    <rect x="52" y="47" width="45" height="3" rx="1.5" fill="#94A3B8" />
    <rect x="52" y="53" width="28" height="3" rx="1.5" fill="#CBD5E1" />
    <rect x="52" y="60" width="20" height="8" rx="3" fill="#059669" />
    <circle cx="145" cy="48" r="9" fill="#FDBA74" />
    <path d="M137 46C137 40 142 38 147 38C152 38 153 42 153 46" fill="#1E293B" />
    <path d="M135 64C135 58 139 56 145 56C151 56 155 58 155 64V86H135V64Z" fill="#2563EB" />
    <circle cx="106" cy="30" r="10" fill="#1B4FDF" />
    <path d="M106 24V36M100 30H112" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const CandidatePoolScene: React.FC<{ width?: number; height?: number }> = ({ width = 140, height = 95 }) => (
  <svg width={width} height={height} viewBox="0 0 200 138" fill="none">
    <defs>
      <linearGradient id="empPurpleBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5F3FF" />
        <stop offset="100%" stopColor="#EDE9FE" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="180" height="120" rx="24" fill="url(#empPurpleBackdrop)" stroke="#DDD6FE" strokeWidth="1" />
    <path d="M25 116H175" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <g transform="translate(30, 24)">
      <rect x="0" y="0" width="42" height="48" rx="6" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="1.5" />
      <circle cx="21" cy="16" r="8" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5" />
      <rect x="8" y="28" width="26" height="3" rx="1.5" fill="#4C1D95" />
      <rect x="11" y="34" width="20" height="2.5" rx="1" fill="#94A3B8" />
      <circle cx="34" cy="40" r="5" fill="#059669" />
    </g>
    <g transform="translate(80, 24)">
      <rect x="0" y="0" width="42" height="48" rx="6" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
      <circle cx="21" cy="16" r="8" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.5" />
      <rect x="8" y="28" width="26" height="3" rx="1.5" fill="#1E293B" />
      <rect x="11" y="34" width="20" height="2.5" rx="1" fill="#94A3B8" />
      <circle cx="34" cy="40" r="5" fill="#059669" />
    </g>
    <circle cx="152" cy="46" r="9" fill="#FDBA74" />
    <path d="M144 44C144 38 149 36 154 36C159 36 160 44 160 44" fill="#0F172A" />
    <path d="M142 62C142 56 146 54 152 54C158 54 162 56 162 62V86H142V62Z" fill="#7C3AED" />
    <circle cx="64" cy="76" r="14" fill="#FFFFFF" stroke="#1B4FDF" strokeWidth="2.5" />
    <path d="M74 86L86 98" stroke="#1B4FDF" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const PipelineScene: React.FC<{ width?: number; height?: number }> = ({ width = 140, height = 95 }) => (
  <svg width={width} height={height} viewBox="0 0 200 138" fill="none">
    <defs>
      <linearGradient id="empTealBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F0FDF4" />
        <stop offset="100%" stopColor="#DCFCE7" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="180" height="120" rx="24" fill="url(#empTealBackdrop)" stroke="#86EFAC" strokeWidth="1" />
    <path d="M25 116H175" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <rect x="30" y="22" width="140" height="82" rx="8" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" />
    <rect x="38" y="30" width="36" height="66" rx="4" fill="#F1F5F9" />
    <rect x="42" y="34" width="20" height="3" rx="1.5" fill="#475569" />
    <rect x="42" y="42" width="28" height="14" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
    <rect x="42" y="60" width="28" height="14" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
    <rect x="82" y="30" width="36" height="66" rx="4" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
    <rect x="86" y="34" width="24" height="3" rx="1.5" fill="#059669" />
    <rect x="86" y="42" width="28" height="18" rx="3" fill="#FFFFFF" stroke="#059669" strokeWidth="1.2" />
    <circle cx="106" cy="51" r="4" fill="#F59E0B" />
    <rect x="126" y="30" width="36" height="66" rx="4" fill="#EFF6FF" />
    <rect x="130" y="34" width="22" height="3" rx="1.5" fill="#1B4FDF" />
    <rect x="130" y="42" width="28" height="14" rx="3" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1" />
  </svg>
);

const RecruitmentMetricsScene: React.FC<{ width?: number; height?: number }> = ({ width = 140, height = 95 }) => (
  <svg width={width} height={height} viewBox="0 0 200 138" fill="none">
    <defs>
      <linearGradient id="empYellowBackdrop" x1="0" y1="0" x2="200" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEFCE8" />
        <stop offset="100%" stopColor="#FEF08A" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="180" height="120" rx="24" fill="url(#empYellowBackdrop)" stroke="#FDE047" strokeWidth="1" />
    <path d="M25 116H175" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <rect x="35" y="20" width="130" height="84" rx="8" fill="#FFFFFF" stroke="#EAB308" strokeWidth="1.5" />
    <rect x="45" y="28" width="45" height="4" rx="2" fill="#0F172A" />
    <rect x="50" y="70" width="14" height="22" rx="3" fill="#93C5FD" />
    <rect x="72" y="54" width="14" height="38" rx="3" fill="#3B82F6" />
    <rect x="94" y="42" width="14" height="50" rx="3" fill="#1B4FDF" />
    <rect x="116" y="32" width="14" height="60" rx="3" fill="#059669" />
    <path d="M57 64L79 48L101 38L123 26" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M116 26H124V34" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  Illustration: React.FC<{ width?: number; height?: number }>;
}

const CANDIDATE_FEATURES: FeatureItem[] = [
  {
    id: 'c1',
    title: 'Discover Relevant Jobs',
    description:
      'Search vacancies across IT, Corporate, Healthcare, Sales, and technical trades in major industrial zones.',
    Illustration: DiscoverJobsScene,
  },
  {
    id: 'c2',
    title: 'Build Candidate Profile',
    description:
      'Build a digital resume showcasing your skills, qualifications, trade specialization, and verified work history.',
    Illustration: CandidateProfileScene,
  },
  {
    id: 'c3',
    title: 'Apply to Jobs Easily',
    description:
      'Apply to active postings in seconds using your stored candidate profile without redundant form fills.',
    Illustration: OneTapApplyScene,
  },
  {
    id: 'c4',
    title: 'Track Applications & Status',
    description:
      'Track your job application status from review to shortlist and direct HR interview scheduling.',
    Illustration: TrackingScene,
  },
];

const EMPLOYER_FEATURES: FeatureItem[] = [
  {
    id: 'e1',
    title: 'Publish Job Opportunities',
    description:
      'Post detailed job openings specifying MIDC industrial zones, shift timing, bus facility, and perks.',
    Illustration: PostJobScene,
  },
  {
    id: 'e2',
    title: 'Reach Suitable Candidates',
    description:
      'Connect directly with pre-screened job seekers across engineering, skilled trades, and management.',
    Illustration: CandidatePoolScene,
  },
  {
    id: 'e3',
    title: 'Manage Applications & Pipeline',
    description:
      'Review applicant profiles, evaluate resume credentials, shortlist top talent, and update status seamlessly.',
    Illustration: PipelineScene,
  },
  {
    id: 'e4',
    title: 'Track Recruitment Activity',
    description:
      'Schedule interviews directly, track candidate conversions, and optimize company hiring metrics.',
    Illustration: RecruitmentMetricsScene,
  },
];

export const AboutPage: React.FC = () => {
  const { currentUser } = useAuth();
  const isEmployer = (currentUser?.role || '').toLowerCase() === 'employer';
  const activeFeatures = isEmployer ? EMPLOYER_FEATURES : CANDIDATE_FEATURES;

  return (
    <div style={{ backgroundColor: THEME.colors.offWhite, minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Dynamic Responsive Styles for Mobile vs Desktop Layouts */}
      <style>{`
        .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background-color: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 12px 8px;
          gap: 4px;
        }
        .about-flow-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        .about-flow-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }
        .about-dashed-connector {
          width: 1.5px;
          height: 24px;
          border-left: 1.5px dashed #CBD5E1;
          margin: 12px 0;
        }

        /* Desktop Layout Adjustments (>= 768px) */
        @media (min-width: 768px) {
          .about-flow-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            max-width: 100%;
            align-items: stretch;
          }
          .about-flow-item {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            padding: 20px 14px;
            justify-content: flex-start;
          }
          .about-dashed-connector {
            display: none;
          }
        }
      `}</style>

      {/* Top Header Banner (Pure White Background) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #CBD5E1',
        padding: '24px 16px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px 0', letterSpacing: '-0.4px' }}>
            About Us
          </h1>

          {/* Top Banner Stats Card (Single Container matching Mobile Standard) */}
          <div className="about-stats-grid">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>10M+</div>
              <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#64748B', marginTop: '2px' }}>Active Users</div>
            </div>

            <div style={{ textAlign: 'center', borderLeft: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>500K+</div>
              <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#64748B', marginTop: '2px' }}>Jobs Posted</div>
            </div>

            <div style={{ textAlign: 'center', borderLeft: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>2M+</div>
              <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#64748B', marginTop: '2px' }}>Hires Made</div>
            </div>

            <div style={{ textAlign: 'center', borderLeft: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>50K+</div>
              <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#64748B', marginTop: '2px' }}>Companies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Content Container */}
      <div style={{ maxWidth: '960px', margin: '20px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* CARD BLOCK 1: OUR MISSION & VISION */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '4px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Compass size={20} color="#2563EB" />
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Our Mission & Vision
            </h2>
          </div>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.65', margin: 0, fontWeight: '400' }}>
            JobMarket is India's comprehensive, all-in-one job marketplace built for every career domain. We bridge the gap between job seekers and top enterprise employers across all industries — from IT software engineering, corporate management, finance, healthcare, and sales, to skilled technical trades and industrial operations.
          </p>
        </div>

        {/* Slate 400 Section Divider Line */}
        <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '4px 0' }} />

        {/* CARD BLOCK 2: WHY CHOOSE JOBMARKET? (EXACT MATCH FOR MOBILE IMAGE & DESKTOP GRID) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '4px',
          padding: '24px 20px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
              Why Choose JobMarket?
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
              {isEmployer
                ? 'Built for enterprise recruiters and employers to hire qualified talent efficiently.'
                : 'Designed to accelerate your career growth with verified opportunities nationwide.'}
            </p>
          </div>

          {/* Storytelling Flow Container */}
          <div className="about-flow-container">
            {activeFeatures.map((item, index) => {
              const isLast = index === activeFeatures.length - 1;
              const { Illustration } = item;
              return (
                <React.Fragment key={item.id}>
                  <div className="about-flow-item">
                    {/* Centered Vector Illustration */}
                    <div style={{ marginBottom: '10px' }}>
                      <Illustration width={140} height={95} />
                    </div>

                    {/* Centered Title */}
                    <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.2px' }}>
                      {item.title}
                    </h3>

                    {/* Centered Description */}
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: '1.5', maxWidth: '340px' }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Vertical Dashed Line Connector between items on Mobile */}
                  {!isLast && <div className="about-dashed-connector" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Slate 400 Section Divider Line */}
        <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '4px 0' }} />

        {/* CARD BLOCK 3: APPLICATION INFORMATION & LEGAL */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '4px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={20} color="#2563EB" />
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Application Information
            </h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
            <span style={{ color: '#334155', fontWeight: '600' }}>Platform Version</span>
            <span style={{ color: '#2563EB', fontWeight: '800' }}>v2.4.0 (Build 108)</span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={16} color="#2563EB" />
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>Terms of Service & Usage Policies</span>
            </div>
            <ChevronRight size={18} color="#94A3B8" />
          </div>

          <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="#2563EB" />
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>Privacy Policy & Data Security</span>
            </div>
            <ChevronRight size={18} color="#94A3B8" />
          </div>
        </div>

        {/* Footer Copyright */}
        <div style={{ textAlign: 'center', paddingTop: '16px', paddingBottom: '8px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', margin: 0 }}>
            © 2026 JobMarket Inc. All rights reserved.
          </p>
          <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0 0' }}>
            Empowering Job Seekers & Employers Across All Sectors Nationwide.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
