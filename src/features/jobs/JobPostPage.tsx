import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { Job, JobType, WorkMode } from '../../types';
import { parseJobPrompt } from '../../utils/aiParser';
import { AdminApiService } from '../../modules/admin/services/adminApi';

interface JobPostPageProps {
  isEmbedded?: boolean;
  onComplete?: () => void;
}

export const JobPostPage: React.FC<JobPostPageProps> = ({ isEmbedded = false, onComplete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createJob, updateJob, getJobById } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  const isEdit = !!id;
  const existingJob = id ? getJobById(id) : undefined;

  // AI Prompt input
  const [aiPrompt, setAiPrompt] = useState('');

  // Live Categories & Skills suggestions state
  const [availableSkills, setAvailableSkills] = useState<string[]>(['Nursing', 'PLC', 'PYTHON', 'React', 'Shop Floor Safety', 'TIG Welding', 'Welding', 'CNC Operation', 'AutoCAD drafting']);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      apiFetch('/api/v1/jobs/meta/skills').then(r => r.ok ? r.json() : null).catch(() => null),
      apiFetch('/api/v1/jobs/meta/categories').then(r => r.ok ? r.json() : null).catch(() => null)
    ]).then(([sksRes, catsRes]) => {
      if (!isMounted) return;
      if (sksRes && sksRes.success && Array.isArray(sksRes.data) && sksRes.data.length > 0) {
        setAvailableSkills(sksRes.data.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean));
      }
      if (catsRes && catsRes.success && Array.isArray(catsRes.data) && catsRes.data.length > 0) {
        setAvailableCategories(catsRes.data.map((c: any) => typeof c === 'string' ? c : c.name).filter(Boolean));
      }
    }).catch(err => {
      console.warn('Meta categories/skills fetch notice:', err);
    });
    return () => { isMounted = false; };
  }, []);

  // Form states
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [openings, setOpenings] = useState(1);
  const [minExperience, setMinExperience] = useState(0);
  const [maxExperience, setMaxExperience] = useState(0);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(0);
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState<JobType>('Full-Time');
  const [workMode, setWorkMode] = useState<WorkMode>('Onsite');
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const [customPerkInput, setCustomPerkInput] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skills, setSkills] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_SIZE = 400;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
          setCompanyLogo(webpDataUrl);
        }
        setIsUploadingLogo(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLogo = () => {
    setCompanyLogo('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // Industrial fields
  const [customIndustry, setCustomIndustry] = useState('');
  const [customIndustryIcon, setCustomIndustryIcon] = useState('💼');
  const [trade, setTrade] = useState('');
  const [customTrade, setCustomTrade] = useState('');
  const [midcZone, setMidcZone] = useState('');
  const [shiftDetails, setShiftDetails] = useState('');
  const [overtime, setOvertime] = useState(false);
  const [accommodation, setAccommodation] = useState(false);
  const [busFacility, setBusFacility] = useState(false);
  const [canteen, setCanteen] = useState(false);
  const [joiningBonus, setJoiningBonus] = useState(false);
  const [attendanceBonus, setAttendanceBonus] = useState(false);
  const [contractDuration, setContractDuration] = useState('');
  const [walkInDate, setWalkInDate] = useState('');
  const [interviewAddress, setInterviewAddress] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'employer') {
      showToast('Employer access only. Please log in as an employer.', 'error');
      navigate('/login?role=employer');
    }
  }, [currentUser, navigate, showToast]);

  useEffect(() => {
    if (isEdit && existingJob) {
      setTitle(existingJob.title);
      setIndustry(existingJob.industry);
      setOpenings(existingJob.openings);
      setMinExperience(existingJob.minExperience);
      setMaxExperience(existingJob.maxExperience);
      setSalaryMin(existingJob.salaryMin);
      setSalaryMax(existingJob.salaryMax);
      setLocation(existingJob.location);
      setWorkType(existingJob.jobType);
      setWorkMode(existingJob.workMode);
      setSelectedPerks(existingJob.perks || []);
      setDescription(existingJob.description);
      setResponsibilities(existingJob.responsibilities ? existingJob.responsibilities.join('\n') : '');
      setRequirements(existingJob.requirements ? existingJob.requirements.join('\n') : '');
      setSkills(existingJob.skills ? existingJob.skills.join(', ') : '');

      const isCustom = existingJob.trade && !tradesList.includes(existingJob.trade);
      if (isCustom) {
        setTrade('Other');
        setCustomTrade(existingJob.trade || '');
      } else {
        setTrade(existingJob.trade || '');
        setCustomTrade('');
      }
      setMidcZone(existingJob.midcZone || '');
      setShiftDetails(existingJob.shiftDetails || '');
      setOvertime(!!existingJob.overtime);
      setAccommodation(!!existingJob.accommodation);
      setBusFacility(!!existingJob.busFacility);
      setCanteen(!!existingJob.canteen);
      setJoiningBonus(!!existingJob.joiningBonus);
      setAttendanceBonus(!!existingJob.attendanceBonus);
      setContractDuration(existingJob.contractDuration || '');
      setWalkInDate(existingJob.walkInDate || '');
      setInterviewAddress(existingJob.interviewAddress || '');
      setCompanyLogo(existingJob.companyLogo || '');
    }
  }, [isEdit, existingJob]);

  const handleAiBuild = () => {
    if (!aiPrompt.trim()) {
      showToast('Please type a prompt first', 'error');
      return;
    }
    const parsed = parseJobPrompt(aiPrompt);

    if (parsed.title) setTitle(parsed.title);
    if (parsed.trade) {
      if (parsed.trade && !tradesList.includes(parsed.trade)) {
        setTrade('Other');
        setCustomTrade(parsed.trade);
      } else {
        setTrade(parsed.trade);
      }
    }
    if (parsed.industry) setIndustry(parsed.industry);
    if (parsed.openings) setOpenings(parsed.openings);
    if (parsed.midcZone) setMidcZone(parsed.midcZone);
    if (parsed.location) setLocation(parsed.location);
    if (parsed.shiftDetails) setShiftDetails(parsed.shiftDetails);
    
    setOvertime(!!parsed.overtime);
    setAccommodation(!!parsed.accommodation);
    setBusFacility(!!parsed.busFacility);
    setCanteen(!!parsed.canteen);
    setJoiningBonus(!!parsed.joiningBonus);
    setAttendanceBonus(!!parsed.attendanceBonus);

    if (parsed.salaryMin) setSalaryMin(parsed.salaryMin);
    if (parsed.salaryMax) setSalaryMax(parsed.salaryMax);
    if (parsed.minExperience !== undefined) setMinExperience(parsed.minExperience);
    if (parsed.maxExperience !== undefined) setMaxExperience(parsed.maxExperience);
    if (parsed.description) setDescription(parsed.description);

    showToast('Form prefilled by AI! 🤖', 'success');
  };

  const industriesList = ['IT & Software', 'Marketing', 'Finance', 'Healthcare', 'Education',
    'Design & Creative', 'Logistics', 'Construction', 'Automotive', 'FMCG', 'Agriculture', 'HR & Admin', 'Manufacturing', 'Mechanical & Assembly', 'Electricals'];

  const midcList = ['Chakan MIDC', 'Bhosari MIDC', 'Ranjangaon MIDC', 'Hinjawadi MIDC', 'Rabale MIDC', 'Taloja MIDC', 'Waluj MIDC', 'Butibori MIDC'];
  const tradesList = ['Fitter', 'Welder', 'CNC Operator', 'Electrician', 'Machinist', 'Helper', 'Quality Inspector'];

  const expOptions = Array.from({ length: 11 }, (_, i) => i);
  
  const salaryOptions = [
    { value: 0, label: '₹0' }, 
    { value: 120000, label: '₹10,000 / mo (~₹1.2 LPA)' }, 
    { value: 180000, label: '₹15,000 / mo (~₹1.8 LPA)' },
    { value: 240000, label: '₹20,000 / mo (~₹2.4 LPA)' }, 
    { value: 300000, label: '₹25,000 / mo (~₹3 LPA)' }, 
    { value: 360000, label: '₹30,000 / mo (~₹3.6 LPA)' }, 
    { value: 480000, label: '₹40,000 / mo (~₹4.8 LPA)' }, 
    { value: 600000, label: '₹50,000 / mo (~₹6 LPA)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !industry || (industry === 'Other' && !customIndustry.trim()) || !location || !description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    let finalIndustry = industry;
    if (industry === 'Other') {
      finalIndustry = customIndustry.trim();
    }

    const jobData = {
      title,
      industry: finalIndustry,
      location,
      description,
      openings: Number(openings) || 1,
      minExperience: Number(minExperience) || 0,
      maxExperience: Number(maxExperience) || 0,
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      jobType: workType,
      workMode: workMode,
      perks: selectedPerks,
      responsibilities: responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
      requirements: requirements.split('\n').map(req => req.trim()).filter(Boolean),
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      // Industrial specific
      trade: trade === 'Other' ? customTrade : trade,
      midcZone,
      shiftDetails,
      overtime,
      accommodation,
      busFacility,
      canteen,
      joiningBonus,
      attendanceBonus,
      contractDuration: contractDuration || undefined,
      walkInDate: walkInDate || undefined,
      interviewAddress: interviewAddress || undefined,
      companyLogo: companyLogo || undefined
    };

    try {
      if (isEdit && id) {
        await updateJob(id, jobData);
        showToast('Job updated successfully!', 'success');
      } else {
        await createJob(jobData);
        showToast('Job posted successfully! 🎉 Info sent on WhatsApp.', 'success');
      }

      if (isEmbedded && onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save job', 'error');
    }
  };

  const content = (
    <>
      <div className="post-job-header" style={isEmbedded ? { padding: 0, marginBottom: 'var(--space-6)' } : undefined}>
        <h2 style={{ fontSize: 'var(--fs-2xl)' }}>{isEdit ? 'Edit Plant Job Listing' : 'Post a New Factory Job'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: '4px' }}>Fill out the details or use the AI Job Builder below to generate fields automatically.</p>
      </div>

        {/* AI Job Builder input box */}
        {!isEdit && (
          <div className="ai-builder-card">
            <h3 className="ai-builder-title">
              🤖 AI Job Builder
            </h3>
            <p className="ai-builder-desc">
              Type requirements in simple English (e.g. *"Need 10 CNC operators at Chakan MIDC, night shift with bus and canteen"*)
            </p>
            <div className="ai-builder-row">
              <input
                type="text"
                className="form-input ai-builder-input"
                placeholder="Type job requirements..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button type="button" className="btn btn-primary" onClick={handleAiBuild}>
                Generate Form
              </button>
            </div>
          </div>
        )}

        <form className="post-job-form" onSubmit={handleSubmit}>
          {/* Job Details */}
          <div className="form-section">
            <div className="form-section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              Plant Job Details
            </div>
            <div className="form-section-body">
              <div className="form-row" style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Upload Company / Factory / Hospital Logo</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '0.3rem', 
                      background: '#344BFD', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1.5px solid #E2E8F0',
                      flexShrink: 0
                    }}>
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
                          <rect width="100" height="100" fill="#344BFD" />
                          <path d="M20 90 L20 40 L45 40 L45 90 Z" fill="#ffffff" opacity="0.15" />
                          <path d="M40 90 L40 25 L70 25 L70 90 Z" fill="#ffffff" opacity="0.25" />
                          <rect x="47" y="32" width="6" height="8" fill="#ffffff" opacity="0.7" />
                        </svg>
                      )}
                      {isUploadingLogo && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite', color: 'white' }}>
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                            <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                      >
                        Upload Logo
                      </button>
                      {companyLogo && (
                        <button 
                          type="button" 
                          className="btn btn-danger btn-sm" 
                          style={{ marginLeft: '8px', background: 'var(--danger)', color: 'white', border: 'none' }}
                          onClick={handleDeleteLogo}
                          disabled={isUploadingLogo}
                        >
                          Remove Logo
                        </button>
                      )}
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>Supports PNG, JPG, JPEG. Compressed to WebP format.</p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={logoInputRef} 
                    onChange={handleLogoChange} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Job Title / Role <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CNC Machine Operator"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Select Industry / Category <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                  >
                    <option value="">Select Category / Industry</option>
                    {Array.from(new Set([...availableCategories, ...industriesList])).map(i => <option key={i} value={i}>{i}</option>)}
                    <option value="Other">+ Other / Add Custom Category...</option>
                  </select>
                  {industry === 'Other' && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Type custom category name (e.g. Solar Tech)"
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Emoji"
                        value={customIndustryIcon}
                        onChange={(e) => setCustomIndustryIcon(e.target.value)}
                        style={{ width: '80px', textAlign: 'center' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Select ITI Trade Specialty</label>
                  <select
                    className="form-select"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                  >
                    <option value="">Select Trade</option>
                    {tradesList.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {trade === 'Other' && (
                    <input
                      type="text"
                      className="form-input"
                      style={{ marginTop: '8px' }}
                      placeholder="Type custom trade specialty"
                      value={customTrade}
                      onChange={(e) => setCustomTrade(e.target.value)}
                      required
                    />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">MIDC Zone</label>
                  <select
                    className="form-select"
                    value={midcZone}
                    onChange={(e) => setMidcZone(e.target.value)}
                  >
                    <option value="">Select MIDC Zone</option>
                    {midcList.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">No. of Vacancies</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={openings}
                    onChange={(e) => setOpenings(Math.max(1, Math.abs(parseInt(e.target.value) || 1)))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Experience</label>
                  <div className="salary-row">
                    <select
                      className="form-select"
                      value={minExperience}
                      onChange={(e) => setMinExperience(parseInt(e.target.value) || 0)}
                    >
                      <option value="">Min Exp</option>
                      {expOptions.map(e => <option key={e} value={e}>{e} yr</option>)}
                    </select>
                    <span className="to-label">to</span>
                    <select
                      className="form-select"
                      value={maxExperience}
                      onChange={(e) => setMaxExperience(parseInt(e.target.value) || 0)}
                    >
                      <option value="">Max Exp</option>
                      {expOptions.map(e => <option key={e} value={e}>{e} yr</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Monthly Salary Range</label>
                  <div className="salary-row">
                    <select
                      className="form-select"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(parseInt(e.target.value) || 0)}
                    >
                      <option value="">Min Salary</option>
                      {salaryOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <span className="to-label">to</span>
                    <select
                      className="form-select"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(parseInt(e.target.value) || 0)}
                    >
                      <option value="">Max Salary</option>
                      {salaryOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">City Location <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pune, Mumbai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Shift details</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Day Shift (8 AM - 5 PM) or Night Shift"
                    value={shiftDetails}
                    onChange={(e) => setShiftDetails(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contract Duration (If applicable)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 6 Months, 1 Year"
                    value={contractDuration}
                    onChange={(e) => setContractDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Job Work Type</label>
                  <div className="work-toggle-group">
                    {['Full-Time', 'Part-Time', 'Contract', 'Freelance'].map(wt => (
                      <div
                        key={wt}
                        className={`work-toggle ${workType === wt ? 'selected' : ''}`}
                        onClick={() => setWorkType(wt as JobType)}
                      >
                        {wt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Job Work Mode</label>
                  <div className="work-toggle-group">
                    {['Onsite', 'Remote', 'Hybrid'].map(wm => (
                      <div
                        key={wm}
                        className={`work-toggle ${workMode === wm ? 'selected' : ''}`}
                        onClick={() => setWorkMode(wm as WorkMode)}
                      >
                        {wm}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Factory Plant Facilities */}
          <div className="form-section">
            <div className="form-section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Factory Plant Facilities & Benefits
            </div>
            <div className="form-section-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                <label className={`facility-checkbox-card ${overtime ? 'selected' : ''}`}>
                  <input type="checkbox" checked={overtime} onChange={(e) => setOvertime(e.target.checked)} style={{ display: 'none' }} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: overtime ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <div className="facility-info">
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{t.otPay}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Double rate shift calculation</p>
                  </div>
                </label>
                <label className={`facility-checkbox-card ${accommodation ? 'selected' : ''}`}>
                  <input type="checkbox" checked={accommodation} onChange={(e) => setAccommodation(e.target.checked)} style={{ display: 'none' }} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: accommodation ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <div className="facility-info">
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{t.accommodation}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Company-managed hostels</p>
                  </div>
                </label>
                <label className={`facility-checkbox-card ${busFacility ? 'selected' : ''}`}>
                  <input type="checkbox" checked={busFacility} onChange={(e) => setBusFacility(e.target.checked)} style={{ display: 'none' }} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: busFacility ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                  </svg>
                  <div className="facility-info">
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{t.busFacility}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Standard transport routes</p>
                  </div>
                </label>
                <label className={`facility-checkbox-card ${canteen ? 'selected' : ''}`}>
                  <input type="checkbox" checked={canteen} onChange={(e) => setCanteen(e.target.checked)} style={{ display: 'none' }} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: canteen ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  </svg>
                  <div className="facility-info">
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{t.canteen}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Subsidized plant meals</p>
                  </div>
                </label>
                <label className={`facility-checkbox-card ${joiningBonus ? 'selected' : ''}`}>
                  <input type="checkbox" checked={joiningBonus} onChange={(e) => setJoiningBonus(e.target.checked)} style={{ display: 'none' }} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: joiningBonus ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                  <div className="facility-info">
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{t.joiningBonus}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>On joining first month</p>
                  </div>
                </label>
                <label className={`facility-checkbox-card ${attendanceBonus ? 'selected' : ''}`}>
                  <input type="checkbox" checked={attendanceBonus} onChange={(e) => setAttendanceBonus(e.target.checked)} style={{ display: 'none' }} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: attendanceBonus ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  <div className="facility-info">
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{t.attendanceBonus}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Regular monthly payouts</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Walk-in Interview Details */}
          <div className="form-section">
            <div className="form-section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Walk-In Interview Drive Details (Optional)
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Walk-In Drive Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={walkInDate}
                    onChange={(e) => setWalkInDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Walk-In Interview Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter factory gate details or office details"
                    value={interviewAddress}
                    onChange={(e) => setInterviewAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description & Requirements */}
          <div className="form-section">
            <div className="form-section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Job Operations, Description & Skills
            </div>
            <div className="form-section-body">
              <div className="form-group">
                <label className="form-label">Job Description <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the plant operations and what tasks the candidate needs to perform..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{ minHeight: 140 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Operations / Responsibilities (one per line)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter each responsibility on a new line..."
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Eligible Criteria / Requirements (one per line)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter each requirement on a new line..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills Needed (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TIG Welding, CNC Operation, Micrometer reading"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
                
                {/* Live Suggested Skill Tags */}
                {availableSkills.length > 0 && (
                  <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      💡 Click suggested skill tags to add automatically:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {availableSkills.map((sk) => {
                        const isSelected = skills
                          .split(',')
                          .map(s => s.trim().toLowerCase())
                          .includes(sk.toLowerCase());
                        
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => {
                              const currentList = skills.split(',').map(s => s.trim()).filter(Boolean);
                              if (isSelected) {
                                setSkills(currentList.filter(s => s.toLowerCase() !== sk.toLowerCase()).join(', '));
                              } else {
                                setSkills([...currentList, sk].join(', '));
                              }
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              border: isSelected ? '1.5px solid #344BFD' : '1px solid #cbd5e1',
                              background: isSelected ? '#344BFD' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#334155',
                              boxShadow: isSelected ? '0 2px 8px rgba(52, 75, 253, 0.25)' : 'none',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{sk}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="post-job-actions">
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => isEmbedded ? (onComplete ? onComplete() : navigate('/dashboard')) : navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg">
              {isEdit ? 'Update Job' : 'Post Job'}
            </button>
          </div>
        </form>
    </>
  );

  if (isEmbedded) {
    return <div style={{ padding: '0 0 var(--space-12) 0' }}>{content}</div>;
  }

  return (
    <div className="post-job-page">
      <div className="container">
        {content}
      </div>
    </div>
  );
};
export default JobPostPage;
