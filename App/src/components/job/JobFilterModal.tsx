import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  XCircle,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Building2,
  Briefcase,
  MapPin,
  GraduationCap,
  Wrench,
  Clock,
  Layers,
  Sparkles,
  Bus,
  Utensils,
  Home,
  Zap,
} from 'lucide-react';

export type JobFilterCategoryKey =
  | 'LOCATION'
  | 'INDUSTRY'
  | 'TRADE'
  | 'EDUCATION'
  | 'TYPE'
  | 'MODE'
  | 'EXP'
  | 'PERKS';

export interface JobFilterValues {
  midcZone: string;
  industry: string;
  trade: string;
  education: string;
  jobType: string;
  workMode: string;
  minExperience: string;
  busFacility: boolean;
  canteen: boolean;
  accommodation: boolean;
  overtime: boolean;
}

export const DEFAULT_JOB_FILTERS: JobFilterValues = {
  midcZone: 'All Locations',
  industry: 'All Industries',
  trade: 'All Trades',
  education: 'All Education Levels',
  jobType: 'All Types',
  workMode: 'All Modes',
  minExperience: 'All Experience',
  busFacility: false,
  canteen: false,
  accommodation: false,
  overtime: false,
};

export const MIDC_ZONES_OPTIONS = [
  'All Locations',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Shendra MIDC / AURIC City (Chhatrapati Sambhajinagar)',
  'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
  'Chitegaon MIDC (Chhatrapati Sambhajinagar)',
  'Paithan MIDC (Chhatrapati Sambhajinagar)',
  'Bidkin DMIC / AURIC City (Chhatrapati Sambhajinagar)',
  'Railway Station Industrial Area (Chhatrapati Sambhajinagar)',
  'Jalna Road Industrial Belt (Chhatrapati Sambhajinagar)',
  'Chhatrapati Sambhajinagar (All Areas)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Ranjangaon MIDC (Pune)',
  'Taloja MIDC (Navi Mumbai)',
  'Thane Belapur MIDC',
];

export const INDUSTRIES_OPTIONS = [
  'All Industries',
  'Automotive & Auto Components',
  'Machining & Precision Tooling',
  'Pharmaceuticals & Chemical Manufacturing',
  'Heavy Engineering & Fabrication',
  'Electronics & Electrical Assembly',
  'Technical Textiles & Garments',
  'Food Processing & Agro Industries',
  'Packaging & Printing',
  'Steel & Metal Processing',
  'Plastic & Polymer Manufacturing',
  'Warehouse & Logistics Operations',
  'IT & Software Engineering',
];

export const TRADES_OPTIONS = [
  'All Trades',
  'CNC Operator',
  'VMC Operator',
  'Fitter',
  'Welder (TIG/MIG/ARC)',
  'Electrician',
  'Machinist',
  'Quality Inspector (QA/QC)',
  'Maintenance Technician',
  'Tool & Die Maker',
  'Assembly Operator',
  'Turner',
  'PLC Programmer',
  'Store Keeper / Inventory',
  'Production Supervisor',
];

export const EDUCATION_OPTIONS = [
  'All Education Levels',
  '10th / SSC Pass',
  '12th / HSC Pass',
  'ITI Certified',
  'Diploma in Engineering',
  'BE / B.Tech Graduate',
  'B.Sc / Chemistry Graduate',
  'Graduate (BA / B.Com / BBA / BCA)',
  'Post Graduate / ME / M.Tech / MBA',
];

export const JOB_TYPES_OPTIONS = [
  'All Types',
  'Full-time',
  'Part-time',
  'Contract',
  'Apprenticeship',
  'Internship',
];

export const WORK_MODES_OPTIONS = [
  'All Modes',
  'On-site (Plant / Factory)',
  'Hybrid',
  'Remote',
];

export const EXPERIENCES_OPTIONS = [
  'All Experience',
  'Fresher (0 Years)',
  '1–3 Years',
  '3–5 Years',
  '5+ Years',
];

export interface JobFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: JobFilterValues;
  onApplyFilters: (filters: JobFilterValues) => void;
  onResetFilters?: () => void;
  totalJobsCount?: number;
  allJobs?: any[];
  defaultTab?: JobFilterCategoryKey;
}

export const JobFilterModal: React.FC<JobFilterModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
  onResetFilters,
  totalJobsCount = 0,
  allJobs = [],
  defaultTab = 'LOCATION',
}) => {
  const [activeTab, setActiveTab] = useState<JobFilterCategoryKey>(defaultTab);

  // Draft internal state
  const [draftZone, setDraftZone] = useState<string | null>(null);
  const [draftIndustry, setDraftIndustry] = useState<string | null>(null);
  const [draftTrade, setDraftTrade] = useState<string | null>(null);
  const [draftEducation, setDraftEducation] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<string | null>(null);
  const [draftMode, setDraftMode] = useState<string | null>(null);
  const [draftExp, setDraftExp] = useState<string | null>(null);
  const [draftBus, setDraftBus] = useState<boolean>(false);
  const [draftCanteen, setDraftCanteen] = useState<boolean>(false);
  const [draftHostel, setDraftHostel] = useState<boolean>(false);
  const [draftOt, setDraftOt] = useState<boolean>(false);

  // Sync draft filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setDraftZone(currentFilters.midcZone === 'All Locations' ? null : currentFilters.midcZone);
      setDraftIndustry(currentFilters.industry === 'All Industries' ? null : currentFilters.industry);
      setDraftTrade(currentFilters.trade === 'All Trades' ? null : currentFilters.trade);
      setDraftEducation(currentFilters.education === 'All Education Levels' ? null : currentFilters.education);
      setDraftType(currentFilters.jobType === 'All Types' ? null : currentFilters.jobType);
      setDraftMode(currentFilters.workMode === 'All Modes' ? null : currentFilters.workMode);
      setDraftExp(currentFilters.minExperience === 'All Experience' ? null : currentFilters.minExperience);
      setDraftBus(!!currentFilters.busFacility);
      setDraftCanteen(!!currentFilters.canteen);
      setDraftHostel(!!currentFilters.accommodation);
      setDraftOt(!!currentFilters.overtime);
    }
  }, [isOpen, currentFilters, defaultTab]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  const handleResetDraft = () => {
    setDraftZone(null);
    setDraftIndustry(null);
    setDraftTrade(null);
    setDraftEducation(null);
    setDraftType(null);
    setDraftMode(null);
    setDraftExp(null);
    setDraftBus(false);
    setDraftCanteen(false);
    setDraftHostel(false);
    setDraftOt(false);
    if (onResetFilters) {
      onResetFilters();
    }
  };

  const handleApplyDraft = () => {
    const applied: JobFilterValues = {
      midcZone: draftZone || 'All Locations',
      industry: draftIndustry || 'All Industries',
      trade: draftTrade || 'All Trades',
      education: draftEducation || 'All Education Levels',
      jobType: draftType || 'All Types',
      workMode: draftMode || 'All Modes',
      minExperience: draftExp || 'All Experience',
      busFacility: draftBus,
      canteen: draftCanteen,
      accommodation: draftHostel,
      overtime: draftOt,
    };
    onApplyFilters(applied);
    onClose();
  };

  // Real-time dynamic count calculation based on draft filters
  const draftMatchingCount = useMemo(() => {
    if (!allJobs || allJobs.length === 0) return totalJobsCount;

    return allJobs.filter((job) => {
      // 1. Zone
      if (draftZone && draftZone !== 'All Locations') {
        const zoneStr = (job.midc_zone || job.midcZone || job.address || job.city || job.location || '').toLowerCase();
        let keyword = draftZone.toLowerCase();
        if (keyword.includes('waluj')) keyword = 'waluj';
        else if (keyword.includes('shendra')) keyword = 'shendra';
        else if (keyword.includes('chikalthana')) keyword = 'chikalthana';
        else if (keyword.includes('chitegaon')) keyword = 'chitegaon';
        else if (keyword.includes('paithan')) keyword = 'paithan';
        else if (keyword.includes('bidkin')) keyword = 'bidkin';
        else if (keyword.includes('railway station')) keyword = 'railway';
        else if (keyword.includes('jalna road')) keyword = 'jalna';
        else if (keyword.includes('chhatrapati sambhajinagar') || keyword.includes('aurangabad')) keyword = 'sambhajinagar';
        else if (keyword.includes('chakan')) keyword = 'chakan';
        else if (keyword.includes('bhosari')) keyword = 'bhosari';
        else if (keyword.includes('talegaon')) keyword = 'talegaon';
        else if (keyword.includes('ranjangaon')) keyword = 'ranjangaon';
        else if (keyword.includes('taloja')) keyword = 'taloja';
        else if (keyword.includes('thane')) keyword = 'thane';

        const isMatch = zoneStr.includes(keyword) ||
          (keyword === 'sambhajinagar' && (
            zoneStr.includes('aurangabad') ||
            zoneStr.includes('waluj') ||
            zoneStr.includes('shendra') ||
            zoneStr.includes('chikalthana') ||
            zoneStr.includes('chitegaon') ||
            zoneStr.includes('paithan') ||
            zoneStr.includes('bidkin')
          ));
        if (!isMatch) return false;
      }

      // 2. Industry
      if (draftIndustry && draftIndustry !== 'All Industries') {
        const ind = (job.industry || '').toLowerCase();
        const target = draftIndustry.toLowerCase();
        if (!ind.includes(target) && !target.includes(ind)) return false;
      }

      // 3. Trade / Role
      if (draftTrade && draftTrade !== 'All Trades') {
        const title = (job.title || job.role || job.job_title || '').toLowerCase();
        const target = draftTrade.toLowerCase();
        if (!title.includes(target) && !target.includes(title)) return false;
      }

      // 4. Education
      if (draftEducation && draftEducation !== 'All Education Levels') {
        const edu = (job.education || job.qualification || '').toLowerCase();
        const target = draftEducation.toLowerCase();
        if (!edu.includes(target) && !target.includes(edu)) return false;
      }

      // 5. Job Type
      if (draftType && draftType !== 'All Types') {
        const t = (job.job_type || job.jobType || job.type || '').toLowerCase();
        const target = draftType.toLowerCase();
        if (!t.includes(target) && !target.includes(t)) return false;
      }

      // 6. Work Mode
      if (draftMode && draftMode !== 'All Modes') {
        const m = (job.work_mode || job.workMode || '').toLowerCase();
        const target = draftMode.toLowerCase();
        if (!m.includes(target) && !target.includes(m)) return false;
      }

      // 7. Experience
      if (draftExp && draftExp !== 'All Experience') {
        const expStr = (job.experience || job.min_experience || job.minExperience || '').toLowerCase();
        const target = draftExp.toLowerCase();
        if (!expStr.includes(target) && !target.includes(expStr)) return false;
      }

      // 8. Perks & Facilities
      if (draftBus && !(job.bus_facility ?? job.busFacility)) return false;
      if (draftCanteen && !(job.canteen ?? job.canteenFacility)) return false;
      if (draftHostel && !(job.accommodation ?? job.hostelFacility)) return false;
      if (draftOt && !(job.overtime ?? job.otFacility)) return false;

      return true;
    }).length;
  }, [
    allJobs,
    totalJobsCount,
    draftZone,
    draftIndustry,
    draftTrade,
    draftEducation,
    draftType,
    draftMode,
    draftExp,
    draftBus,
    draftCanteen,
    draftHostel,
    draftOt,
  ]);

  // Responsive detection: Mobile vs Desktop Drawer
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const categoryTabs = [
    { key: 'LOCATION', label: 'Location', icon: MapPin, activeVal: draftZone },
    { key: 'INDUSTRY', label: 'Industry', icon: Building2, activeVal: draftIndustry },
    { key: 'TRADE', label: 'Trade / Role', icon: Wrench, activeVal: draftTrade },
    { key: 'EDUCATION', label: 'Education', icon: GraduationCap, activeVal: draftEducation },
    { key: 'TYPE', label: 'Job Type', icon: Briefcase, activeVal: draftType },
    { key: 'MODE', label: 'Work Mode', icon: Layers, activeVal: draftMode },
    { key: 'EXP', label: 'Experience', icon: Clock, activeVal: draftExp },
    {
      key: 'PERKS',
      label: 'Perks',
      icon: Sparkles,
      activeVal: (draftBus || draftCanteen || draftHostel || draftOt) ? 'Perks Active' : null,
    },
  ];

  return createPortal(
    <>
      {/* Desktop Backdrop Overlay */}
      {!isMobile && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 9999998,
            touchAction: 'none',
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* Filter View Container (Full-Page on Mobile, Right-Side Drawer on Desktop) */}
      <div
        style={{
          position: 'fixed',
          ...(isMobile
            ? {
                inset: 0,
                width: '100vw',
                height: '100dvh',
                backgroundColor: '#F8FAFC',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }
            : {
                top: 0,
                right: 0,
                bottom: 0,
                width: '420px',
                maxWidth: '90vw',
                height: '100dvh',
                backgroundColor: '#FFFFFF',
                boxShadow: '-6px 0 28px rgba(15, 23, 42, 0.2)',
              }),
          maxHeight: '100dvh',
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
          touchAction: 'none',
          boxSizing: 'border-box',
        }}
      >
        {/* Header (Fixed at top) */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            flexShrink: 0,
            userSelect: 'none',
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? '920px' : '100%',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SlidersHorizontal size={14} color="#1764E8" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.1px' }}>
                  Filter Vacancies
                </h3>
                <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#64748B' }}>
                  Showing {draftMatchingCount} matching opportunities
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleResetDraft}
                style={{
                  background: '#EFF6FF',
                  border: 'none',
                  color: '#1764E8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
                title="Reset All"
              >
                <RotateCcw size={11} />
                <span>Reset All</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                title="Close Filter"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar (Horizontal Scrollable Tabs with Pill Badges) */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            flexShrink: 0,
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? '920px' : '100%',
              padding: '7px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              overscrollBehaviorX: 'contain',
              touchAction: 'pan-x',
              scrollbarWidth: 'none',
              boxSizing: 'border-box',
            }}
          >
          {categoryTabs.map((cat) => {
            const isSelected = activeTab === cat.key;
            const Icon = cat.icon;
            const hasSelection = cat.activeVal && !cat.activeVal.startsWith('All ');

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveTab(cat.key as JobFilterCategoryKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '25px',
                  padding: '0 9px',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid #1764E8' : '1px solid #CBD5E1',
                  backgroundColor: isSelected ? '#1764E8' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  fontSize: '10.5px',
                  fontWeight: isSelected ? 600 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <Icon size={11} color={isSelected ? '#FFFFFF' : '#64748B'} />
                <span>{cat.label}</span>
                {hasSelection && (
                  <span
                    style={{
                      width: '3.5px',
                      height: '3.5px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#FFFFFF' : '#1764E8',
                      marginLeft: '1px',
                    }}
                  />
                )}
              </button>
            );
          })}
          </div>
        </div>

        {/* Options List Body (Full Page Scrollable Area on Mobile, Side Drawer on Desktop) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            backgroundColor: isMobile ? '#F8FAFC' : '#FFFFFF',
            overscrollBehaviorY: 'contain',
            touchAction: 'pan-y',
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? '920px' : '100%',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              SELECT {
                activeTab === 'LOCATION' ? 'LOCATION / MIDC ZONE' :
                activeTab === 'INDUSTRY' ? 'INDUSTRY SECTOR' :
                activeTab === 'TRADE' ? 'TRADE / JOB ROLE' :
                activeTab === 'EDUCATION' ? 'EDUCATION QUALIFICATION' :
                activeTab === 'TYPE' ? 'EMPLOYMENT TYPE' :
                activeTab === 'MODE' ? 'WORK MODE' :
                activeTab === 'EXP' ? 'EXPERIENCE LEVEL' : 'PERKS & FACILITIES'
              }
            </div>

            {/* 1. LOCATION */}
            {activeTab === 'LOCATION' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: '6px',
                }}
              >
                {MIDC_ZONES_OPTIONS.map((opt) => {
                  const isChecked = (draftZone === opt) || (!draftZone && opt === 'All Locations');
                  return (
                    <div
                      key={opt}
                      onClick={() => setDraftZone(opt === 'All Locations' ? null : opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: isChecked ? '#1764E8' : '#1E293B', fontWeight: isChecked ? 600 : 400 }}>
                        {opt}
                      </span>
                      {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. INDUSTRY */}
            {activeTab === 'INDUSTRY' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: '6px',
                }}
              >
                {INDUSTRIES_OPTIONS.map((opt) => {
                  const isChecked = (draftIndustry === opt) || (!draftIndustry && opt === 'All Industries');
                  return (
                    <div
                      key={opt}
                      onClick={() => setDraftIndustry(opt === 'All Industries' ? null : opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: isChecked ? '#1764E8' : '#1E293B', fontWeight: isChecked ? 600 : 400 }}>
                        {opt}
                      </span>
                      {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. TRADE / ROLE */}
            {activeTab === 'TRADE' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: '6px',
                }}
              >
                {TRADES_OPTIONS.map((opt) => {
                  const isChecked = (draftTrade === opt) || (!draftTrade && opt === 'All Trades');
                  return (
                    <div
                      key={opt}
                      onClick={() => setDraftTrade(opt === 'All Trades' ? null : opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: isChecked ? '#1764E8' : '#1E293B', fontWeight: isChecked ? 600 : 400 }}>
                        {opt}
                      </span>
                      {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. EDUCATION */}
            {activeTab === 'EDUCATION' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: '6px',
                }}
              >
                {EDUCATION_OPTIONS.map((opt) => {
                  const isChecked = (draftEducation === opt) || (!draftEducation && opt === 'All Education Levels');
                  return (
                    <div
                      key={opt}
                      onClick={() => setDraftEducation(opt === 'All Education Levels' ? null : opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: isChecked ? '#1764E8' : '#1E293B', fontWeight: isChecked ? 600 : 400 }}>
                        {opt}
                      </span>
                      {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. JOB TYPE */}
            {activeTab === 'TYPE' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: '6px',
                }}
              >
                {JOB_TYPES_OPTIONS.map((opt) => {
                  const isChecked = (draftType === opt) || (!draftType && opt === 'All Types');
                  return (
                    <div
                      key={opt}
                      onClick={() => setDraftType(opt === 'All Types' ? null : opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: isChecked ? '#1764E8' : '#1E293B', fontWeight: isChecked ? 600 : 400 }}>
                        {opt}
                      </span>
                      {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 6. WORK MODE */}
            {activeTab === 'MODE' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: '6px',
                }}
              >
                {WORK_MODES_OPTIONS.map((opt) => {
                  const isChecked = (draftMode === opt) || (!draftMode && opt === 'All Modes');
                  return (
                    <div
                      key={opt}
                      onClick={() => setDraftMode(opt === 'All Modes' ? null : opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: isChecked ? '#1764E8' : '#1E293B', fontWeight: isChecked ? 600 : 400 }}>
                        {opt}
                      </span>
                      {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 7. EXPERIENCE */}
            {activeTab === 'EXP' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: '6px',
                }}
              >
                {EXPERIENCES_OPTIONS.map((opt) => {
                  const isChecked = (draftExp === opt) || (!draftExp && opt === 'All Experience');
                  return (
                    <div
                      key={opt}
                      onClick={() => setDraftExp(opt === 'All Experience' ? null : opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: isChecked ? '#1764E8' : '#1E293B', fontWeight: isChecked ? 600 : 400 }}>
                        {opt}
                      </span>
                      {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 8. PERKS & FACILITIES */}
            {activeTab === 'PERKS' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                  gap: '8px',
                }}
              >
                {[
                  { label: 'Company Bus / Pick-and-Drop Transport', icon: Bus, active: draftBus, toggle: () => setDraftBus(!draftBus), color: '#2563EB' },
                  { label: 'Subsidized Canteen / Meals', icon: Utensils, active: draftCanteen, toggle: () => setDraftCanteen(!draftCanteen), color: '#D97706' },
                  { label: 'Subsidized Hostel Accommodation', icon: Home, active: draftHostel, toggle: () => setDraftHostel(!draftHostel), color: '#16A34A' },
                  { label: 'Overtime Pay (OT Available)', icon: Clock, active: draftOt, toggle: () => setDraftOt(!draftOt), color: '#7C3AED' },
                ].map((perk) => {
                  const PerkIcon = perk.icon;
                  return (
                    <div
                      key={perk.label}
                      onClick={perk.toggle}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: perk.active ? '1px solid #1764E8' : '1px solid #E2E8F0',
                        backgroundColor: perk.active ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PerkIcon size={15} color={perk.color} />
                        <span style={{ fontSize: '11px', color: perk.active ? '#1764E8' : '#1E293B', fontWeight: perk.active ? 600 : 400 }}>
                          {perk.label}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: perk.active ? '1.5px solid #1764E8' : '1px solid #CBD5E1',
                          backgroundColor: perk.active ? '#1764E8' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {perk.active && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Action Bar (Fixed at bottom with safe-area spacing) */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            flexShrink: 0,
            boxShadow: '0 -2px 10px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? '920px' : '100%',
              padding: '10px 14px',
              paddingBottom: isMobile ? 'calc(12px + env(safe-area-inset-bottom, 0px))' : '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              onClick={handleResetDraft}
              style={{
                padding: '7px 12px',
                borderRadius: '5px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RotateCcw size={11} />
              <span>Reset All</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '7px 14px',
                  borderRadius: '5px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyDraft}
                style={{
                  padding: '7px 18px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: '#1764E8',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(23, 100, 232, 0.2)',
                }}
              >
                <Check size={13} strokeWidth={2.5} />
                <span>Apply Filters ({draftMatchingCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
