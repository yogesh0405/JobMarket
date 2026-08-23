import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { Job, JobType, WorkMode } from '../../types';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { extractCoordinatesFromMapInput, resolveShortMapUrl, geocodeQueryOnClient } from '../../utils/mapUrlParser';
import { JobLocationMapPreview } from '../../components/map/JobLocationMapPreview';
import { 
  Building2, 
  Briefcase, 
  MapPin, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  X, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Award, 
  Wrench, 
  Users, 
  Upload, 
  Trash2, 
  Sparkles,
  Gift,
  Info,
  Calendar,
  Phone,
  UserCheck,
  Zap,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { 
  INDUSTRY_LIST, 
  INDUSTRY_ROLE_MAPPINGS, 
  getRolesForIndustry, 
  getSkillsForRole 
} from '../../data/industryRoles';
import { ITI_TRADES_LIST } from '../../data/tradeRoles';

interface JobPostPageProps {
  isEmbedded?: boolean;
  onComplete?: () => void;
}

export const JobPostPage: React.FC<JobPostPageProps> = ({ isEmbedded = false, onComplete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createJob, updateJob, getJobById, fetchJobById } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  const isEdit = !!id;
  const existingJob = id ? getJobById(id) : undefined;

  // Enterprise Governance & Form States
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STEPS = [
    { id: 1, title: 'Basic Details' },
    { id: 2, title: 'Location' },
    { id: 3, title: 'Work & Pay' },
    { id: 4, title: 'Role & Skills' },
  ];

  const handleNextStep = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      const activeInd = industry === 'Other' ? customIndustry.trim() : industry.trim();
      const activeRole = title === 'Other' ? customTitle.trim() : title.trim();
      if (!activeInd) {
        setErrorMsg('Please select or specify an Industry Sector.');
        showToast('Please select or specify an Industry Sector.', 'error');
        return;
      }
      if (!activeRole) {
        setErrorMsg('Please select or specify a Job Role.');
        showToast('Please select or specify a Job Role.', 'error');
        return;
      }
      if (!openingsInput || parseInt(openingsInput, 10) < 1) {
        setErrorMsg('Please enter a valid number of vacancies (minimum 1).');
        showToast('Please enter a valid number of vacancies (minimum 1).', 'error');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (!location.trim()) {
        setErrorMsg('Please enter a City Location / Factory Address.');
        showToast('Please enter a City Location / Factory Address.', 'error');
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. Resume Acceptance (Default: Enabled)
  const [acceptResume, setAcceptResume] = useState<boolean>(true);

  // 2. Trade Type -> Dynamic Job Role workflow
  const [trade, setTrade] = useState<string>('');
  const [customTrade, setCustomTrade] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');

  // 3. Industry / Category Selection
  const [industry, setIndustry] = useState<string>('');
  const [customIndustry, setCustomIndustry] = useState<string>('');
  const [customIndustryIcon, setCustomIndustryIcon] = useState<string>('💼');

  // 4. Target ITI Professionals
  const [targetIti, setTargetIti] = useState<boolean>(false);
  const [itiTrade, setItiTrade] = useState<string>('');
  const [customItiTrade, setCustomItiTrade] = useState<string>('');

  // 5. MIDC Location
  const [isMidcLocation, setIsMidcLocation] = useState<boolean>(false);
  const [midcZone, setMidcZone] = useState<string>('');

  // 6. Vacancy Count (Stepper Control with string state to fix clearing/editing bugs)
  const [openingsInput, setOpeningsInput] = useState<string>('1');

  // 7. Experience Requirement (Checkbox controlled)
  const [experienceRequired, setExperienceRequired] = useState<boolean>(true);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [maxExperience, setMaxExperience] = useState<number>(0);
  const [isCustomMinExp, setIsCustomMinExp] = useState(false);
  const [isCustomMaxExp, setIsCustomMaxExp] = useState(false);
  const [customMinExpVal, setCustomMinExpVal] = useState('');
  const [customMaxExpVal, setCustomMaxExpVal] = useState('');

  // 8. Salary Disclosure (Checkbox controlled)
  const [discloseSalary, setDiscloseSalary] = useState<boolean>(true);
  const [salaryMin, setSalaryMin] = useState<number>(0);
  const [salaryMax, setSalaryMax] = useState<number>(0);
  const [isCustomMinSalary, setIsCustomMinSalary] = useState(false);
  const [isCustomMaxSalary, setIsCustomMaxSalary] = useState(false);
  const [customMinSalaryVal, setCustomMinSalaryVal] = useState('');
  const [customMaxSalaryVal, setCustomMaxSalaryVal] = useState('');

  const handleMinExpSelect = (val: string) => {
    if (val === 'custom') {
      setIsCustomMinExp(true);
      return;
    }
    setIsCustomMinExp(false);
    const num = parseInt(val) || 0;
    setMinExperience(num);
    if (!isCustomMaxExp && maxExperience < num) {
      setMaxExperience(num);
    }
  };

  const handleMaxExpSelect = (val: string) => {
    if (val === 'custom') {
      setIsCustomMaxExp(true);
      return;
    }
    setIsCustomMaxExp(false);
    const num = parseInt(val) || 0;
    if (!isCustomMinExp && num < minExperience) {
      setMinExperience(num);
    }
    setMaxExperience(num);
  };

  const handleMinSalarySelect = (val: string) => {
    if (val === 'custom') {
      setIsCustomMinSalary(true);
      return;
    }
    setIsCustomMinSalary(false);
    const num = parseInt(val) || 0;
    setSalaryMin(num);
    if (!isCustomMaxSalary && salaryMax > 0 && salaryMax < num) {
      setSalaryMax(num);
    }
  };

  const handleMaxSalarySelect = (val: string) => {
    if (val === 'custom') {
      setIsCustomMaxSalary(true);
      return;
    }
    setIsCustomMaxSalary(false);
    const num = parseInt(val) || 0;
    if (!isCustomMinSalary && num > 0 && num < salaryMin) {
      setSalaryMin(num);
    }
    setSalaryMax(num);
  };

  // General Location & Work Specs
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState<JobType>('Full-Time');
  const [workMode, setWorkMode] = useState<WorkMode>('Onsite');
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const defaultEmployerLogo = currentUser?.profilePictureUrl || (currentUser as any)?.companyLogo || (currentUser as any)?.logoUrl || '';
  const [companyLogo, setCompanyLogo] = useState(defaultEmployerLogo);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  // Description, Responsibilities & Skills
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [showResponsibilities, setShowResponsibilities] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [skills, setSkills] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Gender & Age Criteria
  const [genderPreference, setGenderPreference] = useState<string>('No Preference');
  const [minAgeInput, setMinAgeInput] = useState<string>('18');
  const [maxAgeInput, setMaxAgeInput] = useState<string>('60');

  // Education Requirement state
  const [educationRequirement, setEducationRequirement] = useState<string>('10th Pass');
  const [customEducation, setCustomEducation] = useState<string>('');

  // Shift & Facility states
  const [shiftCategory, setShiftCategory] = useState<'Day Shift' | 'Night Shift' | 'Rotational Shift' | 'Custom Shift'>('Day Shift');
  const [shiftTimingOption, setShiftTimingOption] = useState('8:00 AM - 5:00 PM (9 hrs)');
  const [customTimingText, setCustomTimingText] = useState('');
  const [shiftDetails, setShiftDetails] = useState('');
  const [overtime, setOvertime] = useState(false);
  const [accommodation, setAccommodation] = useState(false);
  const [busFacility, setBusFacility] = useState(false);
  const [canteen, setCanteen] = useState(false);
  const [joiningBonus, setJoiningBonus] = useState(false);
  const [attendanceBonus, setAttendanceBonus] = useState(false);
  const [transport, setTransport] = useState(false);
  const [pf, setPf] = useState(false);
  const [esic, setEsic] = useState(false);
  const [uniform, setUniform] = useState(false);
  const [medicalInsurance, setMedicalInsurance] = useState(false);
  const [bonus, setBonus] = useState(false);
  const [contractDuration, setContractDuration] = useState('');

  // Application Preferences & Governance
  const [hiringMethod, setHiringMethod] = useState<'STANDARD' | 'WALK_IN' | 'SCHEDULED_INTERVIEW'>('STANDARD');
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInDate, setWalkInDate] = useState('');
  const [walkInTime, setWalkInTime] = useState('');
  const [walkInStartTime, setWalkInStartTime] = useState<string>('10:00 AM');
  const [walkInEndTime, setWalkInEndTime] = useState<string>('05:00 PM');
  const [interviewAddress, setInterviewAddress] = useState('');
  const [walkInContactPerson, setWalkInContactPerson] = useState<string>('');
  const [walkInContactNumber, setWalkInContactNumber] = useState<string>('');
  const [walkInDocuments, setWalkInDocuments] = useState<string>('Resume, Govt Photo ID (Aadhaar/PAN), 2 Passport Photos');
  const [activeTooltip, setActiveTooltip] = useState<'STANDARD' | 'WALK_IN' | 'SCHEDULED_INTERVIEW' | null>(null);

  const [acceptFreshers, setAcceptFreshers] = useState(true);
  const [acceptExperienced, setAcceptExperienced] = useState(true);
  const [maxApplicantsInput, setMaxApplicantsInput] = useState<string>('0');
  const [applicationDeadline, setApplicationDeadline] = useState<string>('');

  // Map states
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isParsingMapUrl, setIsParsingMapUrl] = useState(false);
  const [mapUrlStatusMsg, setMapUrlStatusMsg] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);

  // Intercept Mobile/Laptop Browser Back Button & Unsaved Tab Close
  useEffect(() => {
    window.history.pushState({ postJobExitGuard: true }, '');

    const handlePopState = () => {
      window.history.pushState({ postJobExitGuard: true }, '');
      setShowExitConfirmModal(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleConfirmExit = () => {
    setShowExitConfirmModal(false);
    if (isEmbedded && onComplete) {
      onComplete();
    } else {
      navigate('/dashboard');
    }
  };

  // Load Categories on mount
  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/v1/jobs/meta/categories')
      .then(r => r.ok ? r.json() : null)
      .then(catsRes => {
        if (!isMounted) return;
        if (catsRes && catsRes.success && Array.isArray(catsRes.data) && catsRes.data.length > 0) {
          setAvailableCategories(catsRes.data.map((c: any) => typeof c === 'string' ? c : c.name).filter(Boolean));
        }
      })
      .catch(() => null);
    return () => { isMounted = false; };
  }, []);

  const [currentRoleOptions, setCurrentRoleOptions] = useState<string[]>([]);

  // Dynamic Industry & Role active names
  const activeIndustryName = industry === 'Other' ? customIndustry : industry;
  const activeRoleName = title === 'Other' ? customTitle : title;

  // Handle Industry Change -> Update Roles dropdown & Sync trade
  const handleIndustryChange = (newIndustry: string) => {
    setIndustry(newIndustry);
    setTrade(newIndustry); // Maintain DB trade consistency
    if (newIndustry !== 'Other') setCustomIndustry('');
    
    const rolesForInd = getRolesForIndustry(newIndustry);
    setCurrentRoleOptions(rolesForInd);
    
    if (title && title !== 'Other' && !rolesForInd.includes(title)) {
      setTitle('');
      setCustomTitle('');
    }
  };

  // Dynamic Skill Suggestions Effect
  useEffect(() => {
    if (activeRoleName || activeIndustryName) {
      const dynamicSkills = getSkillsForRole(activeRoleName, activeIndustryName);
      setAvailableSkills(dynamicSkills);
    } else {
      setAvailableSkills(['Quality Inspection', 'Shop Floor Operation', 'Safety Protocols', 'Punctuality']);
    }
  }, [activeRoleName, activeIndustryName]);

  // Handle Logo Upload
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

  // Google Maps & Location Geocoding Handler
  const handleGoogleMapsUrlChange = async (inputUrl: string) => {
    setGoogleMapsUrl(inputUrl);
    if (!inputUrl.trim()) {
      setLatitude(null);
      setLongitude(null);
      setMapUrlStatusMsg('');
      return;
    }

    const coords = extractCoordinatesFromMapInput(inputUrl);
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      setMapUrlStatusMsg(`SUCCESS:Exact location pinned on map (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
      return;
    }

    setIsParsingMapUrl(true);
    setMapUrlStatusMsg('LOADING:Extracting location coordinates from map link...');

    const resolved = await resolveShortMapUrl(inputUrl, location);
    setIsParsingMapUrl(false);

    if (resolved) {
      setLatitude(resolved.latitude);
      setLongitude(resolved.longitude);
      setMapUrlStatusMsg(`SUCCESS:Exact location pinned on map (${resolved.latitude.toFixed(4)}, ${resolved.longitude.toFixed(4)})`);
    } else {
      const geoFallback = await geocodeQueryOnClient(inputUrl);
      if (geoFallback) {
        setLatitude(geoFallback.latitude);
        setLongitude(geoFallback.longitude);
        setMapUrlStatusMsg(`SUCCESS:Exact location pinned on map (${geoFallback.latitude.toFixed(4)}, ${geoFallback.longitude.toFixed(4)})`);
      } else if (location && location.trim()) {
        const cityGeo = await geocodeQueryOnClient(location);
        if (cityGeo) {
          setLatitude(cityGeo.latitude);
          setLongitude(cityGeo.longitude);
          setMapUrlStatusMsg(`SUCCESS:Location pinned on map (${cityGeo.latitude.toFixed(4)}, ${cityGeo.longitude.toFixed(4)})`);
        } else {
          setMapUrlStatusMsg('WARN:Could not extract exact coordinates from link. Please verify link format.');
        }
      } else {
        setMapUrlStatusMsg('WARN:Could not extract exact coordinates from link. Please verify link format.');
      }
    }
  };

  // Remove auto-resolve effect that set lat/lng without link input

  // Shift Timing Effect
  useEffect(() => {
    if (shiftCategory === 'Custom Shift') {
      setShiftDetails(customTimingText ? `Custom Shift (${customTimingText})` : 'Custom Shift');
    } else if (shiftTimingOption === 'custom') {
      setShiftDetails(`${shiftCategory} (${customTimingText || 'Custom Timing'})`);
    } else {
      setShiftDetails(`${shiftCategory} (${shiftTimingOption})`);
    }
  }, [shiftCategory, shiftTimingOption, customTimingText]);

  // Employer Auth Check
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token && !currentUser) {
      showToast('Employer access only. Please log in as an employer.', 'error');
      navigate('/login?role=employer');
      return;
    }
    if (currentUser) {
      const userRole = (currentUser.role || '').toLowerCase().trim();
      if (userRole !== 'employer' && userRole !== 'admin' && userRole !== 'recruiter') {
        showToast('Employer access only. Please log in as an employer.', 'error');
        navigate('/login?role=employer');
      }
    }
  }, [currentUser, navigate, showToast]);

  // Load Existing Job for Edit Mode
  useEffect(() => {
    if (isEdit && !existingJob && id) {
      fetchJobById(id);
    }
  }, [isEdit, existingJob, id, fetchJobById]);

  useEffect(() => {
    if (isEdit && existingJob) {
      setAcceptResume(existingJob.acceptResume !== false);
      const ind = existingJob.industry || existingJob.trade || '';
      
      const knownIndustries = INDUSTRY_LIST.map(i => typeof i === 'string' ? i : (i as any).name || String(i));
      if (ind && !knownIndustries.includes(ind)) {
        setIndustry('Other');
        setCustomIndustry(ind);
      } else {
        setIndustry(ind);
      }
      setTrade(ind);
      
      const rolesForInd = getRolesForIndustry(ind);
      setCurrentRoleOptions(rolesForInd);

      if (existingJob.title && !rolesForInd.includes(existingJob.title)) {
        setTitle('Other');
        setCustomTitle(existingJob.title);
      } else {
        setTitle(existingJob.title || '');
      }

      setOpeningsInput(String(existingJob.openings || 1));
      
      setExperienceRequired(existingJob.experienceRequired !== false);
      setMinExperience(existingJob.minExperience || 0);
      setMaxExperience(existingJob.maxExperience || 0);

      setDiscloseSalary(existingJob.discloseSalary !== false);
      setSalaryMin(existingJob.salaryMin || 0);
      setSalaryMax(existingJob.salaryMax || 0);

      setLocation(existingJob.location || '');
      setWorkType(existingJob.jobType || 'Full-Time');
      setWorkMode(existingJob.workMode || 'Onsite');
      setSelectedPerks(existingJob.perks || []);
      setDescription(existingJob.description || '');
      const respsStr = Array.isArray(existingJob.responsibilities) ? existingJob.responsibilities.join('\n') : (existingJob.responsibilities || '');
      const reqsStr = Array.isArray(existingJob.requirements) ? existingJob.requirements.join('\n') : (existingJob.requirements || '');
      setResponsibilities(respsStr);
      setShowResponsibilities(respsStr.trim().length > 0);
      setRequirements(reqsStr);
      setShowRequirements(reqsStr.trim().length > 0);
      setSkills(Array.isArray(existingJob.skills) ? existingJob.skills.join(', ') : (existingJob.skills || ''));

      setTargetIti(!!existingJob.targetIti);
      if (existingJob.targetIti && existingJob.itiTrade) {
        const knownTrades = ITI_TRADES_LIST.map(t => typeof t === 'string' ? t : (t as any).name || String(t));
        if (!knownTrades.includes(existingJob.itiTrade)) {
          setItiTrade('Other');
          setCustomItiTrade(existingJob.itiTrade);
        } else {
          setItiTrade(existingJob.itiTrade);
        }
      } else {
        setItiTrade(existingJob.itiTrade || '');
      }

      setMidcZone(existingJob.midcZone || '');
      setIsMidcLocation(!!existingJob.midcZone);

      setGoogleMapsUrl((existingJob as any).googleMapsUrl || (existingJob as any).google_maps_url || '');
      setLatitude(existingJob.latitude || null);
      setLongitude(existingJob.longitude || null);
      if (existingJob.latitude && existingJob.longitude) {
        setMapUrlStatusMsg(`✅ Pinpoint coordinates saved: ${existingJob.latitude.toFixed(4)}, ${existingJob.longitude.toFixed(4)}`);
      }

      setShiftDetails(existingJob.shiftDetails || '');
      setOvertime(!!existingJob.overtime);
      setAccommodation(!!existingJob.accommodation);
      setBusFacility(!!existingJob.busFacility);
      setCanteen(!!existingJob.canteen);
      setJoiningBonus(!!existingJob.joiningBonus);
      setAttendanceBonus(!!existingJob.attendanceBonus);
      setTransport(!!existingJob.transport);
      setPf(!!existingJob.pf);
      setEsic(!!existingJob.esic);
      setUniform(!!existingJob.uniform);
      setMedicalInsurance(!!existingJob.medicalInsurance);
      setBonus(!!existingJob.joiningBonus || !!existingJob.attendanceBonus);
      setContractDuration(existingJob.contractDuration || '');

      setGenderPreference(existingJob.genderPreference || existingJob.gender || 'No Preference');
      setMinAgeInput(String(existingJob.minAge || 18));
      setMaxAgeInput(String(existingJob.maxAge || 60));

      const edu = existingJob.educationRequirement || (existingJob as any).education_requirement;
      const standardEdus = ['10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', "Post Graduate / Master's", 'Doctorate / PhD'];
      if (edu) {
        if (standardEdus.includes(edu)) {
          setEducationRequirement(edu);
          setCustomEducation('');
        } else {
          setEducationRequirement('Others');
          setCustomEducation(edu);
        }
      } else {
        setEducationRequirement('10th Pass');
      }

      const hm = existingJob.hiringMethod || (existingJob.isWalkIn || existingJob.walkInDate ? 'WALK_IN' : 'STANDARD');
      setHiringMethod(hm as any);
      setIsWalkIn(hm === 'WALK_IN');
      
      // Date formatting to YYYY-MM-DD for HTML5 date inputs
      if (existingJob.walkInDate) {
        const d = new Date(existingJob.walkInDate);
        if (!isNaN(d.getTime())) {
          setWalkInDate(d.toISOString().split('T')[0]);
        } else {
          setWalkInDate(existingJob.walkInDate);
        }
      }
      
      setWalkInTime(existingJob.walkInTime || '');
      setWalkInStartTime(existingJob.walkInStartTime || '10:00 AM');
      setWalkInEndTime(existingJob.walkInEndTime || '05:00 PM');
      setInterviewAddress(existingJob.interviewAddress || '');
      setWalkInContactPerson(existingJob.walkInContactPerson || '');
      setWalkInContactNumber(existingJob.walkInContactNumber || '');
      setWalkInDocuments(existingJob.walkInDocuments || 'Resume, Govt Photo ID (Aadhaar/PAN), 2 Passport Photos');
      setAcceptFreshers(existingJob.acceptFreshers !== false);
      setAcceptExperienced(existingJob.acceptExperienced !== false);
      setMaxApplicantsInput(String(existingJob.maxApplicants || 0));
      
      if (existingJob.applicationDeadline) {
        const d = new Date(existingJob.applicationDeadline);
        if (!isNaN(d.getTime())) {
          setApplicationDeadline(d.toISOString().split('T')[0]);
        } else {
          setApplicationDeadline(existingJob.applicationDeadline);
        }
      }

      setCompanyLogo(existingJob.companyLogo || defaultEmployerLogo);
    } else if (!isEdit) {
      setCompanyLogo(defaultEmployerLogo);
    }
  }, [isEdit, existingJob, defaultEmployerLogo]);

  const midcList = [
    'Waluj MIDC (Chhatrapati Sambhajinagar)',
    'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
    'Paithan MIDC (Chhatrapati Sambhajinagar)',
    'Shendra DMIC / MIDC (Chhatrapati Sambhajinagar)',
    'Bidkin DMIC / MIDC (Chhatrapati Sambhajinagar)',
    'Railway Station Industrial Area (Chhatrapati Sambhajinagar)',
    'Chakan MIDC (Pune)',
    'Bhosari MIDC (Pune)',
    'Ranjangaon MIDC (Pune)',
    'Hinjawadi MIDC (Pune)',
    'Rabale MIDC (Navi Mumbai)',
    'Taloja MIDC (Navi Mumbai)',
    'Tarapur MIDC (Palghar)',
    'Butibori MIDC (Nagpur)',
    'Other MIDC Zone...'
  ];

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

  // Stepper handlers for Vacancy Count
  const handleOpeningsIncrement = () => {
    const curr = parseInt(openingsInput) || 1;
    setOpeningsInput(String(curr + 1));
  };

  const handleOpeningsDecrement = () => {
    const curr = parseInt(openingsInput) || 1;
    setOpeningsInput(String(Math.max(1, curr - 1)));
  };

  const preventNegativeKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalIndustry = industry === 'Other' ? customIndustry.trim() : industry.trim();
    const finalTitle = title === 'Other' ? customTitle.trim() : title.trim();
    const finalTrade = finalIndustry; // Automatically sync trade with industry
    const finalItiTrade = targetIti ? (itiTrade === 'Other' ? customItiTrade.trim() : itiTrade.trim()) : '';
    const finalEducation = educationRequirement === 'Others' ? customEducation.trim() : educationRequirement.trim();
    const parsedOpenings = Math.max(1, parseInt(openingsInput) || 1);
    const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);

    // Validation Requirements
    if (!finalIndustry) {
      showToast('Please select Industry Type / Sector first', 'error');
      return;
    }
    if (!finalTitle) {
      showToast('Please select or specify a Job Role', 'error');
      return;
    }
    if (!finalEducation) {
      showToast('Education Requirement is mandatory. Please select or specify Education Qualification.', 'error');
      return;
    }
    if (!location.trim()) {
      showToast('Please specify City Location', 'error');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      showToast('Job Description is mandatory. Please provide a detailed description.', 'error');
      return;
    }
    if (parsedSkills.length === 0) {
      showToast('Skills section is mandatory. Please add at least 1 skill tag.', 'error');
      return;
    }
    if (!applicationDeadline) {
      showToast('Application Deadline date is mandatory. Please select a valid deadline date.', 'error');
      return;
    }

    // Age Validations: FROM must be <= TO, no negative numbers, min age >= 18
    const parsedMinAge = parseInt(minAgeInput) || 18;
    const parsedMaxAge = parseInt(maxAgeInput) || 60;
    if (parsedMinAge < 0 || parsedMaxAge < 0) {
      showToast('Age criteria cannot be a negative number', 'error');
      return;
    }
    if (parsedMinAge < 18) {
      showToast('Minimum Age must be at least 18 years', 'error');
      return;
    }
    if (parsedMinAge > parsedMaxAge) {
      showToast('Minimum Age (From) must be less than or equal to Maximum Age (To)', 'error');
      return;
    }

    // Salary Validations: FROM must be <= TO, no negative numbers
    const parsedMinSalary = discloseSalary ? (Number(salaryMin) || 0) : 0;
    const parsedMaxSalary = discloseSalary ? (Number(salaryMax) || 0) : 0;
    if (parsedMinSalary < 0 || parsedMaxSalary < 0) {
      showToast('Salary amounts cannot be negative numbers', 'error');
      return;
    }
    if (discloseSalary && parsedMinSalary > 0 && parsedMaxSalary > 0 && parsedMinSalary > parsedMaxSalary) {
      showToast('Minimum Salary (From) must be less than or equal to Maximum Salary (To)', 'error');
      return;
    }

    // Experience Validations: FROM must be <= TO, no negative numbers
    const parsedMinExp = experienceRequired ? (Number(minExperience) || 0) : 0;
    const parsedMaxExp = experienceRequired ? (Number(maxExperience) || 0) : 0;
    if (parsedMinExp < 0 || parsedMaxExp < 0) {
      showToast('Experience years cannot be a negative number', 'error');
      return;
    }
    if (experienceRequired && parsedMinExp > parsedMaxExp) {
      showToast('Minimum Experience (From) must be less than or equal to Maximum Experience (To)', 'error');
      return;
    }

    // Vacancy and Applicant Cap Validation
    if (parsedOpenings < 1) {
      showToast('Vacancy count must be at least 1', 'error');
      return;
    }
    const parsedMaxApplicants = parseInt(maxApplicantsInput) || 0;
    if (parsedMaxApplicants < 0) {
      showToast('Maximum Applicants Limit cannot be negative', 'error');
      return;
    }

    // Hiring Method Walk-in Drive Mandatory Validation
    if (hiringMethod === 'WALK_IN') {
      if (!walkInDate) {
        showToast('Please select a Walk-in Drive Date', 'error');
        return;
      }
      if (!walkInStartTime || !walkInEndTime) {
        showToast('Please specify Walk-in Drive Start Time and End Time', 'error');
        return;
      }
      if (!interviewAddress.trim()) {
        showToast('Please enter the Interview Venue Address for Walk-in Drive', 'error');
        return;
      }
      if (!walkInContactPerson.trim()) {
        showToast('Please enter the Contact Person Name for Walk-in Drive', 'error');
        return;
      }
      if (!walkInContactNumber.trim()) {
        showToast('Please enter the Contact Mobile Number for Walk-in Drive', 'error');
        return;
      }
    }

    const jobData = {
      acceptResume,
      title: finalTitle,
      trade: finalTrade,
      industry: finalIndustry,
      location: location.trim(),
      description: description.trim(),
      openings: parsedOpenings,
      targetIti,
      itiTrade: finalItiTrade,
      isMidcLocation,
      midcZone: isMidcLocation ? midcZone : '',
      experienceRequired,
      minExperience: experienceRequired ? (Number(minExperience) || 0) : 0,
      maxExperience: experienceRequired ? (Number(maxExperience) || 0) : 0,
      discloseSalary,
      salaryMin: discloseSalary ? (Number(salaryMin) || 0) : 0,
      salaryMax: discloseSalary ? (Number(salaryMax) || 0) : 0,
      jobType: workType,
      workMode: workMode,
      perks: selectedPerks,
      responsibilities: showResponsibilities ? responsibilities.split('\n').map(r => r.trim()).filter(Boolean) : [],
      requirements: showRequirements ? requirements.split('\n').map(req => req.trim()).filter(Boolean) : [],
      skills: parsedSkills,
      googleMapsUrl: googleMapsUrl || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      shiftDetails,
      overtime,
      accommodation,
      busFacility,
      canteen,
      joiningBonus,
      attendanceBonus,
      transport,
      pf,
      esic,
      uniform,
      medicalInsurance,
      contractDuration: contractDuration || undefined,
      genderPreference,
      educationRequirement: finalEducation,
      minAge: parseInt(minAgeInput) || 18,
      maxAge: parseInt(maxAgeInput) || 60,
      hiringMethod,
      isWalkIn: hiringMethod === 'WALK_IN',
      walkInDate: hiringMethod === 'WALK_IN' ? (walkInDate || undefined) : undefined,
      interviewAddress: hiringMethod === 'WALK_IN' ? (interviewAddress.trim() || undefined) : undefined,
      walkInTime: hiringMethod === 'WALK_IN' ? `${walkInStartTime} - ${walkInEndTime}` : undefined,
      walkInStartTime: hiringMethod === 'WALK_IN' ? (walkInStartTime || undefined) : undefined,
      walkInEndTime: hiringMethod === 'WALK_IN' ? (walkInEndTime || undefined) : undefined,
      walkInContactPerson: hiringMethod === 'WALK_IN' ? (walkInContactPerson.trim() || undefined) : undefined,
      walkInContactNumber: hiringMethod === 'WALK_IN' ? (walkInContactNumber.trim() || undefined) : undefined,
      walkInDocuments: hiringMethod === 'WALK_IN' ? (walkInDocuments.trim() || undefined) : undefined,
      acceptFreshers,
      acceptExperienced,
      maxApplicants: parseInt(maxApplicantsInput) || 0,
      applicationDeadline,
      companyLogo: companyLogo || undefined
    };

    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <>
      <div className="post-job-header" style={isEmbedded ? { padding: 0, marginBottom: 'var(--space-6)' } : undefined}>
        <h2 style={{ fontSize: 'var(--fs-2xl)' }}>{isEdit ? 'Edit Job Posting' : 'Post a New Industrial & Enterprise Job'}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', marginTop: '4px' }}>
          Select Trade Type to populate relevant Job Roles and dynamic skill suggestions.
        </p>
      </div>

      {/* Admin Rejection / Correction Required Alert Banner */}
      {isEdit && existingJob && (existingJob.dbStatus === 'REJECTED' || existingJob.status === 'rejected' || existingJob.rejectReason) && (
        <div style={{
          background: '#FEF2F2',
          border: '1.5px solid #FCA5A5',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
        }}>
          <AlertCircle size={22} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', color: '#991B1B' }}>
              Action Required: Admin Feedback for Listing Correction
            </h4>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#7F1D1D', lineHeight: 1.5, fontWeight: '500' }}>
              <strong>Rejection Reason:</strong> "{existingJob.rejectReason || 'Admin requested updates to this job listing.'}"
            </p>
            <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: '#B91C1C', fontWeight: '600' }}>
              💡 Make the requested corrections below and click "Resubmit Job for Approval" to send back to Admin for review.
            </span>
          </div>
        </div>
      )}

      {/* 4-Step Stepper Header Bar (Exact Mobile App Flow Parity) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        padding: '14px 10px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          minWidth: '280px'
        }}>
          {STEPS.map((step, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = currentStep > stepNumber;
            const isActive = currentStep === stepNumber;
            const isLast = idx === STEPS.length - 1;

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => {
                    if (stepNumber < currentStep) {
                      setErrorMsg(null);
                      setCurrentStep(stepNumber);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: stepNumber < currentStep ? 'pointer' : 'default',
                    zIndex: 2,
                    flex: '1 1 0px',
                    minWidth: 0
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: isActive ? '2px solid #1B4FDF' : isCompleted ? '1.5px solid #1B4FDF' : '1.5px solid #CBD5E1',
                    backgroundColor: isCompleted ? '#1B4FDF' : '#FFFFFF',
                    color: isCompleted ? '#FFFFFF' : isActive ? '#1B4FDF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}>
                    {isCompleted ? <CheckCircle2 size={15} color="#FFFFFF" /> : stepNumber}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? '#0F172A' : '#64748B',
                    marginTop: '4px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}>
                    {step.title}
                  </span>
                </div>

                {!isLast && (
                  <div style={{
                    flex: '0 0 10px',
                    height: '2px',
                    backgroundColor: currentStep > stepNumber ? '#1B4FDF' : '#E2E8F0',
                    margin: '0 2px',
                    marginTop: '-16px',
                    transition: 'all 0.2s ease'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1.5px solid #FCA5A5',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#991B1B',
          fontSize: '13.5px',
          fontWeight: '600'
        }}>
          <AlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

        {/* STEP 1: BASIC DETAILS */}
        {currentStep === 1 && (
          <>
            {/* Governance & Logo Section */}
            <div className="form-section">
          <div className="form-section-header">
            <ShieldCheck size={20} style={{ color: '#344BFD' }} />
            Company Logo & Settings
          </div>
          <div className="form-section-body">
            {/* Logo Upload Row */}
            <div className="form-row" style={{ marginBottom: '0' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Upload Company / Factory / Organization Logo</label>
                <div className="logo-upload-card">
                  <div className="logo-preview-box">
                    <CompanyDefaultLogo
                      logoUrl={companyLogo}
                      companyName={currentUser?.companyName || currentUser?.name || 'Company'}
                      size={64}
                      borderRadius="8px"
                    />
                    {isUploadingLogo && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={20} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
                      </div>
                    )}
                  </div>
                  <div className="logo-upload-info">
                    <div className="logo-upload-actions">
                      <button 
                        type="button" 
                        className="logo-btn-upload" 
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                      >
                        <Upload size={14} />
                        <span>Upload Logo</span>
                      </button>
                      {companyLogo && (
                        <button 
                          type="button" 
                          className="logo-btn-remove" 
                          onClick={handleDeleteLogo}
                          disabled={isUploadingLogo}
                        >
                          <Trash2 size={14} />
                          <span>Remove Logo</span>
                        </button>
                      )}
                    </div>
                    <p className="logo-upload-hint">Supports PNG, JPG, JPEG. Compressed to WebP format.</p>
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
          </div>
        </div>

        {/* Dynamic Industry & Job Role Section */}
        <div className="form-section">
          <div className="form-section-header">
            <Building2 size={20} style={{ color: '#344BFD' }} />
            Industry & Role Specifications
          </div>
          <div className="form-section-body">
            {/* Step 1: Select Industry Type / Sector */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Step 1: Select Industry Type / Sector <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={industry}
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  required
                  style={{ fontWeight: '600', borderColor: industry ? '#344BFD' : undefined }}
                >
                  <option value="">Select Industry / Sector...</option>
                  {INDUSTRY_LIST.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  <option value="Other">+ Other Industry Sector...</option>
                </select>
                {industry === 'Other' && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: '8px' }}
                    placeholder="Type custom industry sector (e.g. Renewable Energy & Solar)"
                    value={customIndustry}
                    onChange={(e) => {
                      setCustomIndustry(e.target.value);
                      setTrade(e.target.value);
                    }}
                    required
                  />
                )}
              </div>

              {/* Step 2: Select Job Role */}
              <div className="form-group">
                <label className="form-label">
                  Step 2: Select Job Role <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value !== 'Other') setCustomTitle('');
                  }}
                  disabled={!industry}
                  required
                  style={{
                    opacity: industry ? 1 : 0.65,
                    cursor: industry ? 'pointer' : 'not-allowed',
                    fontWeight: '600'
                  }}
                >
                  <option value="">{industry ? 'Select Role for this Industry...' : '👈 Select Industry Type first'}</option>
                  {currentRoleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  <option value="Other">+ Add Custom Job Role...</option>
                </select>
                {title === 'Other' && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: '8px' }}
                    placeholder="Type custom job role (e.g. Senior VMC Programmer)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>

            <div className="form-row">
              {/* Vacancy Count Stepper */}
              <div className="form-group">
                <label className="form-label">No. of Vacancies <span className="required">*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', maxWidth: '220px' }}>
                  <button
                    type="button"
                    onClick={handleOpeningsDecrement}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '0',
                      border: '1px solid #cbd5e1',
                      borderRight: 'none',
                      background: '#f8fafc',
                      color: '#1e293b',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    title="Decrease vacancy count"
                  >
                    <Minus size={15} />
                  </button>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={openingsInput}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setOpeningsInput(e.target.value)}
                    onBlur={() => setOpeningsInput(prev => String(Math.max(1, parseInt(prev) || 1)))}
                    style={{
                      borderRadius: 0,
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '13px',
                      height: '38px',
                      flex: 1
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleOpeningsIncrement}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '0',
                      border: '1px solid #cbd5e1',
                      borderLeft: 'none',
                      background: '#f8fafc',
                      color: '#1e293b',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    title="Increase vacancy count"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Target ITI Professionals Checkbox & Dropdown */}
            <div className="form-row" style={{ marginTop: '12px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    id="targetItiCheckbox"
                    checked={targetIti}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setTargetIti(checked);
                      if (!checked) {
                        setItiTrade('');
                        setCustomItiTrade('');
                      }
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#344BFD', cursor: 'pointer' }}
                  />
                  <label htmlFor="targetItiCheckbox" className="form-label" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={15} style={{ color: '#344BFD', flexShrink: 0 }} />
                    <span>Target ITI Professionals</span>
                  </label>
                </div>

                {targetIti && (
                  <div style={{ marginTop: '8px', transition: 'all 0.2s ease' }}>
                    <select
                      className="form-select"
                      value={itiTrade}
                      onChange={(e) => setItiTrade(e.target.value)}
                      required={targetIti}
                    >
                      <option value="">Select ITI Specialization Trade...</option>
                      {ITI_TRADES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {itiTrade === 'Other ITI Trade...' && (
                      <input
                        type="text"
                        className="form-input"
                        style={{ marginTop: '8px' }}
                        placeholder="Type custom ITI Trade name"
                        value={customItiTrade}
                        onChange={(e) => setCustomItiTrade(e.target.value)}
                        required
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* MIDC Location Checkbox & Dropdown */}
            <div className="form-row" style={{ marginTop: '12px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    id="isMidcCheckbox"
                    checked={isMidcLocation}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsMidcLocation(checked);
                      if (!checked) setMidcZone('');
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#344BFD', cursor: 'pointer' }}
                  />
                  <label htmlFor="isMidcCheckbox" className="form-label" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} style={{ color: '#344BFD', flexShrink: 0 }} />
                    <span>This Job is Located in an MIDC Area</span>
                  </label>
                </div>

                {isMidcLocation && (
                  <div style={{ marginTop: '8px', transition: 'all 0.2s ease' }}>
                    <select
                      className="form-select"
                      value={midcZone}
                      onChange={(e) => setMidcZone(e.target.value)}
                      required={isMidcLocation}
                    >
                      <option value="">Select MIDC Zone in Maharashtra...</option>
                      {midcList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 2 && (
          <div className="form-section">
            <div className="form-section-header">
              <MapPin size={20} style={{ color: '#344BFD' }} />
              Location & Factory Address
            </div>
            <div className="form-section-body">
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">City Location / Factory Address <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chhatrapati Sambhajinagar, Pune, Mumbai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Google Maps Location Link Input */}
              <div className="form-row" style={{ marginTop: '12px', marginBottom: '12px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={18} style={{ color: '#344BFD' }} />
                    <span>Google Maps Location Link (For Interactive Map View)</span>
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Paste Google Maps link e.g. https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
                    value={googleMapsUrl}
                    onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                    style={{
                      borderColor: latitude && longitude ? '#10b981' : isParsingMapUrl ? '#344BFD' : undefined,
                      boxShadow: latitude && longitude ? '0 0 0 2px rgba(16, 185, 129, 0.15)' : undefined
                    }}
                  />
                  {mapUrlStatusMsg && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      color: mapUrlStatusMsg.startsWith('SUCCESS:') ? '#059669' : mapUrlStatusMsg.startsWith('LOADING:') ? '#1D4ED8' : '#B45309',
                      background: mapUrlStatusMsg.startsWith('SUCCESS:') ? '#ECFDF5' : mapUrlStatusMsg.startsWith('LOADING:') ? '#EFF6FF' : '#FFFBEB',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${mapUrlStatusMsg.startsWith('SUCCESS:') ? '#A7F3D0' : mapUrlStatusMsg.startsWith('LOADING:') ? '#BFDBFE' : '#FDE68A'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {mapUrlStatusMsg.startsWith('LOADING:') && <Loader2 size={16} style={{ color: '#344BFD', animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
                      {mapUrlStatusMsg.startsWith('SUCCESS:') && <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />}
                      {mapUrlStatusMsg.startsWith('WARN:') && <AlertCircle size={16} style={{ color: '#D97706', flexShrink: 0 }} />}
                      <span>{mapUrlStatusMsg.replace(/^(SUCCESS:|LOADING:|WARN:)/, '')}</span>
                    </div>
                  )}

                  {/* Render Map ONLY AFTER Inserting Link and Coordinates are fetched */}
                  {googleMapsUrl.trim() !== '' && latitude !== null && longitude !== null && (
                    <JobLocationMapPreview
                      latitude={latitude}
                      longitude={longitude}
                      locationName={location || title || 'Job Location'}
                      height="280px"
                      readOnly={false}
                      onLocationSelect={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                        setMapUrlStatusMsg(`SUCCESS:Location pinned on map (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: WORK & PAY */}
        {currentStep === 3 && (
          <>
            {/* Experience & Salary Requirements */}
            <div className="form-section">
              <div className="form-section-header">
                <IndianRupee size={20} style={{ color: '#344BFD' }} />
                Experience & Salary Preferences
              </div>
              <div className="form-section-body">
            <div className="form-row">
              {/* Experience Requirement Checkbox & Selector */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    id="expRequiredToggle"
                    checked={experienceRequired}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setExperienceRequired(checked);
                      if (!checked) {
                        setMinExperience(0);
                        setMaxExperience(0);
                      }
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#344BFD', cursor: 'pointer' }}
                  />
                  <label htmlFor="expRequiredToggle" className="form-label" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={15} style={{ color: '#344BFD', flexShrink: 0 }} />
                    <span>Experience Required</span>
                  </label>
                </div>

                {experienceRequired ? (
                  <div className="salary-row" style={{ flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {isCustomMinExp ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: '130px' }}>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          max="50"
                          placeholder="Min yrs"
                          value={customMinExpVal}
                          onKeyDown={preventNegativeKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomMinExpVal(val);
                            const num = parseInt(val) || 0;
                            setMinExperience(num);
                            if (!isCustomMaxExp && maxExperience < num) setMaxExperience(num);
                          }}
                        />
                        <button type="button" onClick={() => setIsCustomMinExp(false)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>✕ List</button>
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        value={isCustomMinExp ? 'custom' : minExperience}
                        onChange={(e) => handleMinExpSelect(e.target.value)}
                      >
                        <option value="0">Min Exp (0 yr - Fresher)</option>
                        {expOptions.map(e => <option key={e} value={e}>{e} yr</option>)}
                        <option value="custom">+ Custom Years...</option>
                      </select>
                    )}

                    <span className="to-label">to</span>

                    {isCustomMaxExp ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: '130px' }}>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          max="50"
                          placeholder="Max yrs"
                          value={customMaxExpVal}
                          onKeyDown={preventNegativeKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomMaxExpVal(val);
                            const num = parseInt(val) || 0;
                            setMaxExperience(num);
                            if (!isCustomMinExp && num < minExperience) setMinExperience(num);
                          }}
                        />
                        <button type="button" onClick={() => setIsCustomMaxExp(false)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>✕ List</button>
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        value={isCustomMaxExp ? 'custom' : maxExperience}
                        onChange={(e) => handleMaxExpSelect(e.target.value)}
                      >
                        <option value="0">Max Exp (0 yr)</option>
                        {expOptions.filter(e => e >= minExperience).map(e => (
                          <option key={e} value={e}>{e} yr</option>
                        ))}
                        <option value="custom">+ Custom Years...</option>
                      </select>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
                    Fresher welcome — No experience required.
                  </p>
                )}
              </div>

              {/* Salary Disclosure Checkbox & Range Selector */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    id="discloseSalaryToggle"
                    checked={discloseSalary}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDiscloseSalary(checked);
                      if (!checked) {
                        setSalaryMin(0);
                        setSalaryMax(0);
                      }
                    }}
                    style={{ width: '18px', height: '18px', accentColor: '#344BFD', cursor: 'pointer' }}
                  />
                  <label htmlFor="discloseSalaryToggle" className="form-label" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IndianRupee size={15} style={{ color: '#059669', flexShrink: 0 }} />
                    <span>Disclose Salary</span>
                  </label>
                </div>

                {discloseSalary ? (
                  <div className="salary-row" style={{ flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {isCustomMinSalary ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: '130px' }}>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          placeholder="Min ₹/mo"
                          value={customMinSalaryVal}
                          onKeyDown={preventNegativeKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomMinSalaryVal(val);
                            const monthly = parseInt(val) || 0;
                            const annual = monthly * 12;
                            setSalaryMin(annual);
                            if (!isCustomMaxSalary && salaryMax > 0 && salaryMax < annual) setSalaryMax(annual);
                          }}
                        />
                        <button type="button" onClick={() => setIsCustomMinSalary(false)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>✕ List</button>
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        value={isCustomMinSalary ? 'custom' : salaryMin}
                        onChange={(e) => handleMinSalarySelect(e.target.value)}
                      >
                        <option value="0">Min Salary</option>
                        {salaryOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        <option value="custom">+ Custom Amount...</option>
                      </select>
                    )}

                    <span className="to-label">to</span>

                    {isCustomMaxSalary ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: '130px' }}>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          placeholder="Max ₹/mo"
                          value={customMaxSalaryVal}
                          onKeyDown={preventNegativeKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomMaxSalaryVal(val);
                            const monthly = parseInt(val) || 0;
                            const annual = monthly * 12;
                            setSalaryMax(annual);
                            if (!isCustomMinSalary && annual > 0 && annual < salaryMin) setSalaryMin(annual);
                          }}
                        />
                        <button type="button" onClick={() => setIsCustomMaxSalary(false)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>✕ List</button>
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        value={isCustomMaxSalary ? 'custom' : salaryMax}
                        onChange={(e) => handleMaxSalarySelect(e.target.value)}
                      >
                        <option value="0">Max Salary</option>
                        {salaryOptions.filter(s => s.value === 0 || s.value >= salaryMin).map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                        <option value="custom">+ Custom Amount...</option>
                      </select>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
                    Salary hidden from job listing — Displayed as "Salary Not Disclosed".
                  </p>
                )}
              </div>
            </div>

            {/* Candidate Eligibility & Age Criteria Section */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #E2E8F0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} style={{ color: '#344BFD' }} />
                <span>Candidate Eligibility & Age Criteria</span>
              </h4>
              <div className="form-row">
                {/* Gender Preference */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>Gender Preference</label>
                  <select
                    className="form-select"
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value)}
                  >
                    <option value="No Preference">No Preference (Any Gender)</option>
                    <option value="Male Candidates Only">Male Candidates Only</option>
                    <option value="Female Candidates Only">Female Candidates Only</option>
                  </select>
                </div>

                {/* Age Criteria */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>Age Criteria (Years)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      className="form-input"
                      min="18"
                      max="60"
                      placeholder="Min Age (18)"
                      value={minAgeInput}
                      onKeyDown={preventNegativeKey}
                      onChange={(e) => setMinAgeInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>to</span>
                    <input
                      type="number"
                      className="form-input"
                      min="18"
                      max="65"
                      placeholder="Max Age (60)"
                      value={maxAgeInput}
                      onKeyDown={preventNegativeKey}
                      onChange={(e) => setMaxAgeInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                {/* Mandatory Education Requirement */}
                <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <label className="form-label" style={{ fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} style={{ color: '#344BFD' }} />
                    <span>Education Qualification Requirement <span style={{ color: '#EF4444' }}>*</span></span>
                  </label>
                  <select
                    className="form-select"
                    value={educationRequirement}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEducationRequirement(val);
                      if (val !== 'Others') setCustomEducation('');
                    }}
                    required
                    style={{ fontWeight: '600', color: '#0F172A' }}
                  >
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="ITI">ITI (Industrial Training Institute)</option>
                    <option value="Diploma">Diploma (Polytechnic / Technical)</option>
                    <option value="Graduate">Graduate (B.A / B.Com / B.Sc / B.E / B.Tech / BBA / BCA etc.)</option>
                    <option value="Post Graduate / Master's">Post Graduate / Master's (M.A / M.Com / M.Sc / M.Tech / MBA / MCA etc.)</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                    <option value="Others">Others (Specify Custom Qualification)</option>
                  </select>

                  {educationRequirement === 'Others' && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter custom education qualification (e.g. B.Tech Mechanical, CA, 8th Pass)"
                        value={customEducation}
                        onChange={(e) => setCustomEducation(e.target.value)}
                        required
                        style={{ fontWeight: '600' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>



            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>
                  Shift Details & Timing
                </label>
                
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {[
                    { id: 'Day Shift', label: 'Day Shift' },
                    { id: 'Night Shift', label: 'Night Shift' },
                    { id: 'Rotational Shift', label: 'Rotational' },
                    { id: 'Custom Shift', label: 'Custom' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setShiftCategory(cat.id as any);
                        if (cat.id === 'Day Shift') setShiftTimingOption('8:00 AM - 5:00 PM (9 hrs)');
                        else if (cat.id === 'Night Shift') setShiftTimingOption('8:00 PM - 5:00 AM (9 hrs)');
                        else if (cat.id === 'Rotational Shift') setShiftTimingOption('8 hr Rotational (3 Shifts: Morning, Evening, Night)');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: shiftCategory === cat.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: shiftCategory === cat.id ? '#eff6ff' : '#ffffff',
                        color: shiftCategory === cat.id ? '#1d4ed8' : '#334155',
                        fontWeight: shiftCategory === cat.id ? '800' : '600',
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {shiftCategory !== 'Custom Shift' ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      className="form-select"
                      value={shiftTimingOption}
                      onChange={(e) => setShiftTimingOption(e.target.value)}
                      style={{ flex: 1, minWidth: '160px' }}
                    >
                      <option value="8:00 AM - 5:00 PM (9 hrs)">8:00 AM - 5:00 PM (9 hrs)</option>
                      <option value="9:00 AM - 6:00 PM (9 hrs)">9:00 AM - 6:00 PM (9 hrs)</option>
                      <option value="8:00 PM - 5:00 AM (9 hrs)">8:00 PM - 5:00 AM (9 hrs)</option>
                      <option value="8 hr Rotational (3 Shifts: Morning, Evening, Night)">8 hr Rotational (3 Shifts)</option>
                      <option value="12 hr Rotational (2 Shifts: Day & Night)">12 hr Rotational (2 Shifts)</option>
                      <option value="custom">+ Custom Timing...</option>
                    </select>

                    {shiftTimingOption === 'custom' && (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 8:30 AM to 5:30 PM"
                        value={customTimingText}
                        onChange={(e) => setCustomTimingText(e.target.value)}
                        style={{ flex: 1, minWidth: '180px' }}
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Flexible 9 hours between 7 AM to 9 PM"
                    value={customTimingText}
                    onChange={(e) => setCustomTimingText(e.target.value)}
                  />
                )}
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

        {/* Plant & Workplace Facilities (10 Facilities) */}
        <div className="form-section">
          <div className="form-section-header">
            <Gift size={20} style={{ color: '#344BFD' }} />
            Plant & Workplace Facilities (Perks & Benefits)
          </div>
          <div className="form-section-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
              {/* 1. Transport */}
              <label className={`facility-checkbox-card ${transport ? 'selected' : ''}`}>
                <input type="checkbox" checked={transport} onChange={(e) => setTransport(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Company Transport</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cab / Pickup facility</p>
                </div>
              </label>

              {/* 2. Bus Facility */}
              <label className={`facility-checkbox-card ${busFacility ? 'selected' : ''}`}>
                <input type="checkbox" checked={busFacility} onChange={(e) => setBusFacility(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Bus Facility</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Transport routes available</p>
                </div>
              </label>

              {/* 3. Canteen */}
              <label className={`facility-checkbox-card ${canteen ? 'selected' : ''}`}>
                <input type="checkbox" checked={canteen} onChange={(e) => setCanteen(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Canteen</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Subsidized meals / tea</p>
                </div>
              </label>

              {/* 4. Accommodation */}
              <label className={`facility-checkbox-card ${accommodation ? 'selected' : ''}`}>
                <input type="checkbox" checked={accommodation} onChange={(e) => setAccommodation(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Accommodation</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hostel / Room facility</p>
                </div>
              </label>

              {/* 5. PF */}
              <label className={`facility-checkbox-card ${pf ? 'selected' : ''}`}>
                <input type="checkbox" checked={pf} onChange={(e) => setPf(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>PF (Provident Fund)</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>EPFO retirement savings</p>
                </div>
              </label>

              {/* 6. ESIC */}
              <label className={`facility-checkbox-card ${esic ? 'selected' : ''}`}>
                <input type="checkbox" checked={esic} onChange={(e) => setEsic(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>ESIC Insurance</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>State health coverage</p>
                </div>
              </label>

              {/* 7. Uniform */}
              <label className={`facility-checkbox-card ${uniform ? 'selected' : ''}`}>
                <input type="checkbox" checked={uniform} onChange={(e) => setUniform(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Free Uniform & Shoes</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Safety gear provided</p>
                </div>
              </label>

              {/* 8. Overtime */}
              <label className={`facility-checkbox-card ${overtime ? 'selected' : ''}`}>
                <input type="checkbox" checked={overtime} onChange={(e) => setOvertime(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Overtime Pay</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Double OT rate pay</p>
                </div>
              </label>

              {/* 9. Medical Insurance */}
              <label className={`facility-checkbox-card ${medicalInsurance ? 'selected' : ''}`}>
                <input type="checkbox" checked={medicalInsurance} onChange={(e) => setMedicalInsurance(e.target.checked)} style={{ display: 'none' }} />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Medical Insurance</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mediclaim cover</p>
                </div>
              </label>

              {/* 10. Bonus */}
              <label className={`facility-checkbox-card ${bonus || joiningBonus || attendanceBonus ? 'selected' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={bonus || joiningBonus || attendanceBonus} 
                  onChange={(e) => {
                    const chk = e.target.checked;
                    setBonus(chk);
                    setJoiningBonus(chk);
                    setAttendanceBonus(chk);
                  }} 
                  style={{ display: 'none' }} 
                />
                <div className="facility-info">
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Performance Bonus</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Joining & attendance payouts</p>
                </div>
              </label>
            </div>
          </div>
        </div>
        </>
        )}

        {/* STEP 4: ROLE & SKILLS */}
        {currentStep === 4 && (
          <>
            {/* Application Preferences & Governance */}
            <div className="form-section">
          <div className="form-section-header">
            <ShieldCheck size={20} style={{ color: '#344BFD' }} />
            Application Preferences & Governance
          </div>
          <div className="form-section-body">
            {/* Hiring Method Title & Subtitle */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Hiring Method</h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Choose how candidates will proceed after submitting their application.
              </p>
            </div>

            {/* 3 Hiring Method Cards */}
            <div className="hiring-methods-grid">
              {/* Card 1: Standard Hiring */}
              <div 
                className={`hiring-method-card ${hiringMethod === 'STANDARD' ? 'selected' : ''}`}
                onClick={() => setHiringMethod('STANDARD')}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setHiringMethod('STANDARD'); }}
                role="radio"
                aria-checked={hiringMethod === 'STANDARD'}
              >
                <div className="hiring-card-header">
                  <div className="hiring-card-icon-box">
                    <FileText size={20} className="hiring-card-icon" />
                  </div>
                  <div className="hiring-card-info">
                    <h4 className="hiring-card-title">Standard Hiring (Default)</h4>
                    <span className="hiring-card-subtitle">Review & schedule</span>
                  </div>
                  <div className="hiring-card-action">
                    <div 
                      className="info-icon-btn" 
                      onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'STANDARD' ? null : 'STANDARD'); }}
                      onMouseEnter={() => setActiveTooltip('STANDARD')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      title="Click or hover for hiring method details"
                      aria-label="Information about Standard Hiring"
                    >
                      <Info size={16} />
                    </div>
                    {hiringMethod === 'STANDARD' && (
                      <div className="hiring-check-indicator">
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </div>
                </div>
                <p className="hiring-card-desc">
                  Employer reviews applications first and manually schedules interviews for shortlisted candidates.
                </p>

                {/* Information Tooltip Popover */}
                {activeTooltip === 'STANDARD' && (
                  <div className="hiring-tooltip-popover" onClick={(e) => e.stopPropagation()}>
                    <div className="tooltip-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={15} style={{ color: '#60A5FA' }} />
                      <span>Standard Hiring Workflow</span>
                    </div>
                    <p className="tooltip-body">
                      Candidates submit applications normally. Employers review applications, shortlist suitable candidates, and schedule interviews manually. Recommended for most hiring scenarios.
                    </p>
                  </div>
                )}
              </div>

              {/* Card 2: Walk-in Drive */}
              <div 
                className={`hiring-method-card ${hiringMethod === 'WALK_IN' ? 'selected' : ''}`}
                onClick={() => setHiringMethod('WALK_IN')}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setHiringMethod('WALK_IN'); }}
                role="radio"
                aria-checked={hiringMethod === 'WALK_IN'}
              >
                <div className="hiring-card-header">
                  <div className="hiring-card-icon-box walkin-icon-box">
                    <MapPin size={20} className="hiring-card-icon" />
                  </div>
                  <div className="hiring-card-info">
                    <h4 className="hiring-card-title">Walk-in Drive</h4>
                    <span className="hiring-card-subtitle">Direct on-site venue</span>
                  </div>
                  <div className="hiring-card-action">
                    <div 
                      className="info-icon-btn" 
                      onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'WALK_IN' ? null : 'WALK_IN'); }}
                      onMouseEnter={() => setActiveTooltip('WALK_IN')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      title="Click or hover for hiring method details"
                      aria-label="Information about Walk-in Drive"
                    >
                      <Info size={16} />
                    </div>
                    {hiringMethod === 'WALK_IN' && (
                      <div className="hiring-check-indicator">
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </div>
                </div>
                <p className="hiring-card-desc">
                  Candidates receive walk-in venue details immediately after applying and can attend the interview directly.
                </p>
                <div className="hiring-tags-row">
                  <span className="hiring-tag">Manufacturing</span>
                  <span className="hiring-tag">MIDC</span>
                  <span className="hiring-tag">Warehouse</span>
                  <span className="hiring-tag">ITI</span>
                  <span className="hiring-tag">Bulk Hiring</span>
                </div>

                {/* Information Tooltip Popover */}
                {activeTooltip === 'WALK_IN' && (
                  <div className="hiring-tooltip-popover" onClick={(e) => e.stopPropagation()}>
                    <div className="tooltip-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={15} style={{ color: '#FBBF24' }} />
                      <span>Walk-in Drive Workflow</span>
                    </div>
                    <p className="tooltip-body">
                      Candidates receive the walk-in venue, date, and timing immediately after applying. Suitable for mass hiring and on-site recruitment events.
                    </p>
                  </div>
                )}
              </div>

              {/* Card 3: Scheduled Interview */}
              <div 
                className={`hiring-method-card ${hiringMethod === 'SCHEDULED_INTERVIEW' ? 'selected' : ''}`}
                onClick={() => setHiringMethod('SCHEDULED_INTERVIEW')}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setHiringMethod('SCHEDULED_INTERVIEW'); }}
                role="radio"
                aria-checked={hiringMethod === 'SCHEDULED_INTERVIEW'}
              >
                <div className="hiring-card-header">
                  <div className="hiring-card-icon-box scheduled-icon-box">
                    <Calendar size={20} className="hiring-card-icon" />
                  </div>
                  <div className="hiring-card-info">
                    <h4 className="hiring-card-title">Scheduled Interview</h4>
                    <span className="hiring-card-subtitle">Structured 1-on-1 slots</span>
                  </div>
                  <div className="hiring-card-action">
                    <div 
                      className="info-icon-btn" 
                      onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'SCHEDULED_INTERVIEW' ? null : 'SCHEDULED_INTERVIEW'); }}
                      onMouseEnter={() => setActiveTooltip('SCHEDULED_INTERVIEW')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      title="Click or hover for hiring method details"
                      aria-label="Information about Scheduled Interview"
                    >
                      <Info size={16} />
                    </div>
                    {hiringMethod === 'SCHEDULED_INTERVIEW' && (
                      <div className="hiring-check-indicator">
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </div>
                </div>
                <p className="hiring-card-desc">
                  Employer reviews applications, shortlists candidates, and schedules interviews individually.
                </p>
                <div className="hiring-tags-row">
                  <span className="hiring-tag">Corporate</span>
                  <span className="hiring-tag">IT</span>
                  <span className="hiring-tag">Healthcare</span>
                  <span className="hiring-tag">Engineering</span>
                </div>

                {/* Information Tooltip Popover */}
                {activeTooltip === 'SCHEDULED_INTERVIEW' && (
                  <div className="hiring-tooltip-popover" onClick={(e) => e.stopPropagation()}>
                    <div className="tooltip-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={15} style={{ color: '#34D399' }} />
                      <span>Scheduled Interview Workflow</span>
                    </div>
                    <p className="tooltip-body">
                      Candidates apply normally. Employers review applications and schedule interviews individually for shortlisted candidates. Ideal for structured hiring processes.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Conditional Walk-In Configuration Fields (Rendered only when hiringMethod === 'WALK_IN') */}
            {hiringMethod === 'WALK_IN' && (
              <div className="walkin-configuration-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #FCD34D', paddingBottom: '10px' }}>
                  <Clock size={18} style={{ color: '#D97706' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Walk-In Drive Event Details <span className="required">*</span>
                  </h4>
                </div>

                <div className="walkin-fields-grid">
                  {/* Walk-in Date */}
                  <div>
                    <label className="form-label" style={{ fontWeight: '700' }}>
                      Walk-In Drive Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={walkInDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setWalkInDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Start Time & End Time */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: '700' }}>
                        Start Time <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 10:00 AM"
                        value={walkInStartTime}
                        onChange={(e) => setWalkInStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: '700' }}>
                        End Time <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 05:00 PM"
                        value={walkInEndTime}
                        onChange={(e) => setWalkInEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Person Name */}
                  <div>
                    <label className="form-label" style={{ fontWeight: '700' }}>
                      Contact Person Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahul Sharma (HR Manager)"
                      value={walkInContactPerson}
                      onChange={(e) => setWalkInContactPerson(e.target.value)}
                      required
                    />
                  </div>

                  {/* Contact Mobile Number */}
                  <div>
                    <label className="form-label" style={{ fontWeight: '700' }}>
                      Contact Mobile Number <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 9876543210"
                      value={walkInContactNumber}
                      onChange={(e) => setWalkInContactNumber(e.target.value)}
                      required
                    />
                  </div>

                  {/* Interview Venue Address */}
                  <div className="full-width-field">
                    <label className="form-label" style={{ fontWeight: '700' }}>
                      Interview Venue Address <span className="required">*</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      placeholder="Enter full factory gate, campus, or office venue address for candidates..."
                      value={interviewAddress}
                      onChange={(e) => setInterviewAddress(e.target.value)}
                      required
                      style={{ minHeight: '70px' }}
                    />
                  </div>

                  {/* Documents to Carry (Optional) */}
                  <div className="full-width-field">
                    <label className="form-label" style={{ fontWeight: '700' }}>
                      Documents to Carry (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Resume, Govt Photo ID (Aadhaar/PAN), ITI Marksheet, 2 Passport Photos"
                      value={walkInDocuments}
                      onChange={(e) => setWalkInDocuments(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Resume Acceptance Toggle */}
            <div className="pref-setting-card" style={{ marginBottom: '16px' }}>
              <div className="pref-setting-header">
                <div>
                  <label htmlFor="acceptResumeToggle" className="pref-setting-title">
                    <FileText size={16} style={{ color: '#344BFD', flexShrink: 0 }} />
                    <span>Accept Applicant Resume</span>
                  </label>
                  <span className="pref-setting-desc">
                    When enabled, candidates submit their resume and employers can view it.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="acceptResumeToggle"
                  className="pref-setting-checkbox"
                  checked={acceptResume}
                  onChange={(e) => setAcceptResume(e.target.checked)}
                />
              </div>
            </div>

            {/* 3. Maximum Applicants Cap */}
            <div className="form-row">
              <div className="form-group full-width-field" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Maximum Applicants Limit</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  placeholder="e.g. 100 (Type 0 for unlimited)"
                  value={maxApplicantsInput}
                  onKeyDown={preventNegativeKey}
                  onChange={(e) => setMaxApplicantsInput(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Type 0 for unlimited applicants or specify maximum applications allowed.
                </span>
              </div>
            </div>

            {/* 5. Mandatory Application Deadline & Auto Close Job Banner */}
            <div className="form-row" style={{ marginTop: '12px' }}>
              <div className="form-group full-width-field" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontWeight: '700', color: '#0F172A' }}>
                  Application Deadline Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{ borderColor: applicationDeadline ? '#10B981' : undefined }}
                />
                <div className="auto-close-banner" style={{ marginTop: '8px', background: '#EFF6FF', padding: '10px 14px', borderRadius: '6px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1E40AF', fontWeight: '600' }}>
                  <AlertCircle size={16} style={{ color: '#344BFD', flexShrink: 0 }} />
                  <span>⚡ Auto Close Job: The job posting will automatically switch to Closed/Expired after this deadline.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Dynamic Skills */}
        <div className="form-section">
          <div className="form-section-header">
            <FileText size={20} style={{ color: '#344BFD' }} />
            Job Operations, Description & Dynamic Skills
          </div>
          <div className="form-section-body">
            {/* 7. Mandatory Job Description */}
            <div className="form-group">
              <label className="form-label">Job Description <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                placeholder="Describe the job duties, shift operations, plant environment, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ minHeight: 140 }}
              />
            </div>

            {/* 9. Optional Responsibilities (Checkbox Governed - Unchecked by Default) */}
            <div className="pref-setting-card" style={{ marginBottom: '16px' }}>
              <div className="pref-setting-header">
                <div>
                  <label htmlFor="showResponsibilitiesToggle" className="pref-setting-title">
                    <CheckCircle2 size={16} style={{ color: showResponsibilities ? '#344BFD' : '#64748B', flexShrink: 0 }} />
                    <span>Add Key Operations / Responsibilities</span>
                  </label>
                  <span className="pref-setting-desc">
                    Check if you want to specify detailed line-by-line key responsibilities.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="showResponsibilitiesToggle"
                  className="pref-setting-checkbox"
                  checked={showResponsibilities}
                  onChange={(e) => setShowResponsibilities(e.target.checked)}
                />
              </div>

              {showResponsibilities && (
                <div style={{ marginTop: '12px' }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>
                    Key Operations / Responsibilities (one per line)
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter each key responsibility on a new line..."
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    style={{ minHeight: '100px' }}
                  />
                </div>
              )}
            </div>

            {/* 10. Optional Requirements (Checkbox Governed - Unchecked by Default) */}
            <div className="pref-setting-card" style={{ marginBottom: '16px' }}>
              <div className="pref-setting-header">
                <div>
                  <label htmlFor="showRequirementsToggle" className="pref-setting-title">
                    <CheckCircle2 size={16} style={{ color: showRequirements ? '#344BFD' : '#64748B', flexShrink: 0 }} />
                    <span>Add Eligible Criteria / Requirements</span>
                  </label>
                  <span className="pref-setting-desc">
                    Check if you want to specify detailed candidate eligibility criteria or requirements.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="showRequirementsToggle"
                  className="pref-setting-checkbox"
                  checked={showRequirements}
                  onChange={(e) => setShowRequirements(e.target.checked)}
                />
              </div>

              {showRequirements && (
                <div style={{ marginTop: '12px' }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>
                    Eligible Criteria / Requirements (one per line)
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter each requirement on a new line..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    style={{ minHeight: '100px' }}
                  />
                </div>
              )}
            </div>

            {/* 8. Mandatory Skills & Dynamic Role Suggestions */}
            <div className="form-group">
              <label className="form-label">Skills Needed (comma separated) <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Micrometer Reading, CNC Operation, Shop Floor Safety"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />
              
              {/* Dynamic Suggested Skill Tags updated based on Trade & Role */}
              {availableSkills.length > 0 && (
                <div 
                  className="suggested-skills-container"
                  style={{ 
                    marginTop: '12px', 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', 
                    padding: '14px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #dbeafe',
                    boxShadow: '0 2px 8px rgba(52, 75, 253, 0.04)'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', lineHeight: '1.4' }}>
                    <Lightbulb size={16} style={{ color: '#344BFD', flexShrink: 0, marginTop: '2px' }} /> 
                    <span>
                      Click role-suggested skills for <strong style={{ color: '#1e293b', fontWeight: '700' }}>{activeRoleName || activeIndustryName || 'this position'}</strong>:
                    </span>
                  </div>
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
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            border: isSelected ? '1.5px solid #344BFD' : '1px solid #cbd5e1',
                            background: isSelected ? 'linear-gradient(135deg, #344BFD 0%, #2563eb 100%)' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#334155',
                            boxShadow: isSelected ? '0 3px 10px rgba(52, 75, 253, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            maxWidth: '100%',
                            textAlign: 'left',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: '1.3'
                          }}
                        >
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{isSelected ? '✓' : '+'}</span>
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
        </>
        )}

    </>
  );

  return (
    <div 
      className="post-job-viewport-wrapper" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: isEmbedded ? '100%' : '100dvh', 
        maxHeight: '100dvh', 
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#F8FAFC'
      }}
    >
      <form 
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}
      >
        {/* AREA 1: Independent Scrollable Form Content Area */}
        <div 
          className="post-job-scroll-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '16px 12px 32px 12px',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            {content}
          </div>
        </div>

        {/* AREA 2: Permanently Anchored Fixed Action Footer Bar */}
        <div 
          className="post-job-fixed-footer"
          style={{
            flexShrink: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #CBD5E1',
            padding: '12px 16px',
            boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.08)',
            width: '100%',
            boxSizing: 'border-box',
            zIndex: 100
          }}
        >
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={() => setShowExitConfirmModal(true)}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrevStep}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '8px',
                  border: '1.5px solid #2563EB',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>← Back</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  flex: 1.5,
                  height: '44px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#344BFD',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(52, 75, 253, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1.5,
                  height: '44px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#344BFD',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(52, 75, 253, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>
                      {isEdit 
                        ? (existingJob && (existingJob.dbStatus === 'REJECTED' || existingJob.status === 'rejected' || existingJob.rejectReason) ? 'Resubmitting...' : 'Updating...') 
                        : 'Posting...'}
                    </span>
                  </>
                ) : (
                  <span>
                    {isEdit 
                      ? (existingJob && (existingJob.dbStatus === 'REJECTED' || existingJob.status === 'rejected' || existingJob.rejectReason) ? 'Resubmit' : 'Update Job Posting') 
                      : 'Submit & Post Job'}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Exit Confirmation Dialog Modal */}
      {showExitConfirmModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px 20px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            boxSizing: 'border-box',
            animation: 'fadeInUp 200ms ease forwards'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
              Discard Job Listing?
            </h3>

            <p style={{ margin: '0 0 24px 0', fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', fontWeight: '500' }}>
              You have unsaved changes in this job post form. Are you sure you want to exit? All progress entered so far will be lost.
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Keep Editing
              </button>

              <button
                type="button"
                onClick={handleConfirmExit}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostPage;
