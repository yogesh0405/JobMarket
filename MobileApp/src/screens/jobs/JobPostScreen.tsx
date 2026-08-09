import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import {
  Building2,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  ShieldCheck,
  Award,
  Users,
  Upload,
  Trash2,
  Sparkles,
  Info,
  Calendar,
  Phone,
  UserCheck,
  FileText,
  Wrench,
  CheckCircle2,
  Map,
  Plus,
  Minus,
  Check,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { jobsApi } from '../../api/jobsApi';
import { JobLocationMapPreview } from '../../components/map/JobLocationMapPreview';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { SelectDropdown } from '../../components/common/SelectDropdown';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { DatePickerField } from '../../components/common/DatePickerField';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

// Web App Industry & Role Mappings
const INDUSTRY_LIST = [
  'Automotive & Auto Components',
  'Industrial Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Logistics & Warehousing',
  'Services & General Engineering',
];

const INDUSTRY_ROLE_MAPPINGS: Record<string, string[]> = {
  'Automotive & Auto Components': [
    'Assembly Line Operator',
    'VMC & CNC Programmer/Operator',
    'Quality Inspector (QA/QC)',
    'Press Shop Machine Operator',
    'Paint Shop Technician',
    'Automotive Electrician & Wireman',
    'Tool & Die Maintenance Fitter',
  ],
  'Industrial Manufacturing': [
    'CNC & VMC Machine Operator',
    'Heavy Equipment Fitter & Turner',
    'MIG / TIG Welder & Fabricator',
    'Hydraulics & Pneumatics Engineer',
    'Production Supervisor',
    'Maintenance Technician',
    'Sheet Metal Operator',
  ],
  'Electronics & Electricals': [
    'PCB Assembly Technician',
    'Control Panel Wireman',
    'Testing & Calibration Inspector',
    'SMT Machine Operator',
    'Electrical Maintenance Technician',
    'Transformer Winding Operator',
  ],
  'Pharmaceuticals & Chemicals': [
    'Plant Operator (Reactors/Distillation)',
    'Pharma Packaging Machine Operator',
    'Quality Control Analyst (QC)',
    'Utility & Boiler Attendant',
    'HVAC & Cleanroom Technician',
    'Chemical Lab Assistant',
  ],
  'Textiles & Garments': [
    'Industrial Sewing Operator',
    'Weaving & Spinning Technician',
    'Textile Dyeing Operator',
    'Garment Quality Checker',
    'Pattern Maker & Cutter',
  ],
  'Construction & Infrastructure': [
    'Structural Steel Welder',
    'Bar Bender & Steel Fixer',
    'Heavy Crane & Excavator Operator',
    'Site Supervisor',
    'Scaffolding Inspector',
    'Mason & Shuttering Carpenter',
  ],
  'Logistics & Warehousing': [
    'Forklift Operator (Reach Truck)',
    'Warehouse Picker & Packer',
    'Inventory Control Executive',
    'Loading & Unloading Helper',
    'Dispatch & Store Assistant',
  ],
  'Services & General Engineering': [
    'General Fitter & Machinist',
    'Lathe Machine Operator',
    'Facility Maintenance Mechanic',
    'AC & Refrigeration Technician',
    'General Helper / Trainee',
  ],
};

const getRolesForIndustry = (industryName: string): string[] => {
  return INDUSTRY_ROLE_MAPPINGS[industryName] || [
    'General Machine Operator',
    'Assembly Technician',
    'Quality Inspector',
    'Maintenance Fitter',
    'Shop Floor Trainee',
  ];
};

const getSkillsForRole = (roleName: string, industryName: string): string[] => {
  const normRole = (roleName || '').toLowerCase();
  if (normRole.includes('cnc') || normRole.includes('vmc')) {
    return ['CNC Operating', 'VMC Programming', 'Fanuc Control', 'Mastercam', 'Micrometer / Vernier'];
  }
  if (normRole.includes('weld')) {
    return ['MIG Welding', 'TIG Welding', 'Arc Welding', 'Structural Fabrication', 'Blueprint Reading'];
  }
  if (normRole.includes('fitter') || normRole.includes('maintenance')) {
    return ['Hydraulics', 'Pneumatics', 'Preventive Maintenance', 'Pump Overhaul', 'Machine Assembly'];
  }
  if (normRole.includes('quality') || normRole.includes('inspector')) {
    return ['QA/QC Inspection', 'ISO Standards', 'CMM Measurement', 'Defect Analysis', 'Vernier Caliper'];
  }
  return ['Shop Floor Operation', 'Safety Protocols', 'Punctuality', 'Quality Check'];
};

const ITI_TRADES_LIST = [
  'Fitter',
  'Electrician',
  'Welder (Gas & Electric)',
  'Turner',
  'Machinist',
  'Diesel Mechanic',
  'Motor Vehicle Mechanic',
  'COPA (Computer Operator)',
  'Instrument Mechanic',
  'Tool & Die Maker',
  'Draftsman (Mechanical)',
  'Other ITI Trade...',
];

const MIDC_LIST = [
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
  'Other MIDC Zone...',
];

const getDefaultDeadline = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

interface Props {
  route?: any;
  navigation: any;
}

export const JobPostScreen: React.FC<Props> = ({ route, navigation }) => {
  const editJobId = route?.params?.jobId;
  const isEdit = !!editJobId;
  const { user } = useAuth();

  // AI Prompt input
  const [aiPrompt, setAiPrompt] = useState('');

  // 1. Company Logo
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // 2. Industry & Job Role
  const [industry, setIndustry] = useState<string>('');
  const [customIndustry, setCustomIndustry] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [currentRoleOptions, setCurrentRoleOptions] = useState<string[]>([]);

  // 3. Vacancy Stepper
  const [openingsInput, setOpeningsInput] = useState<string>('1');

  // 4. Target ITI Professionals
  const [targetIti, setTargetIti] = useState<boolean>(false);
  const [itiTrade, setItiTrade] = useState<string>('');
  const [customItiTrade, setCustomItiTrade] = useState<string>('');

  // 5. MIDC Location
  const [isMidcLocation, setIsMidcLocation] = useState<boolean>(false);
  const [midcZone, setMidcZone] = useState<string>('');
  const [customMidcZone, setCustomMidcZone] = useState<string>('');

  // 6. Work Location & Map
  const [location, setLocation] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [autoResolveMsg, setAutoResolveMsg] = useState<string | null>(null);
  const lastResolvedUrl = useRef<string>('');

  // 7. Experience & Salary Specs
  const [experienceRequired, setExperienceRequired] = useState<boolean>(true);
  const [minExperience, setMinExperience] = useState<string>('');
  const [maxExperience, setMaxExperience] = useState<string>('');

  const [discloseSalary, setDiscloseSalary] = useState<boolean>(true);
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');

  const [workType, setWorkType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Apprenticeship'>('Full-time');
  const [workMode, setWorkMode] = useState<'On-site' | 'Remote' | 'Hybrid'>('On-site');

  // 8. Shift Details & Benefits
  const [shiftCategory, setShiftCategory] = useState<'Day Shift' | 'Night Shift' | 'Rotational Shift'>('Day Shift');
  const [shiftTimingOption, setShiftTimingOption] = useState('');

  const [overtime, setOvertime] = useState(false);
  const [accommodation, setAccommodation] = useState(false);
  const [busFacility, setBusFacility] = useState(false);
  const [canteen, setCanteen] = useState(false);
  const [joiningBonus, setJoiningBonus] = useState(false);
  const [attendanceBonus, setAttendanceBonus] = useState(false);
  const [pf, setPf] = useState(false);
  const [esic, setEsic] = useState(false);
  const [uniform, setUniform] = useState(false);
  const [medicalInsurance, setMedicalInsurance] = useState(false);
  const [contractDuration, setContractDuration] = useState('');

  // 9. Gender & Age
  const [genderPreference, setGenderPreference] = useState<string>('No Preference');
  const [minAgeInput, setMinAgeInput] = useState<string>('');
  const [maxAgeInput, setMaxAgeInput] = useState<string>('');

  // 10. Hiring Mode & Walk-in
  const [hiringMethod, setHiringMethod] = useState<'STANDARD' | 'WALK_IN'>('STANDARD');
  const [walkInDate, setWalkInDate] = useState('');
  const [walkInStartTime, setWalkInStartTime] = useState('');
  const [walkInEndTime, setWalkInEndTime] = useState('');
  const [interviewAddress, setInterviewAddress] = useState('');
  const [walkInContactPerson, setWalkInContactPerson] = useState('');
  const [walkInContactNumber, setWalkInContactNumber] = useState('');

  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [maxApplicantsInput, setMaxApplicantsInput] = useState<string>('');

  // 11. Description & Skills
  const [description, setDescription] = useState('');
  const [showResponsibilities, setShowResponsibilities] = useState(false);
  const [responsibilities, setResponsibilities] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [skillsTags, setSkillsTags] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // UI States
  const [resolvingMap, setResolvingMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AUTOMATIC MAP COORDINATE RESOLUTION ON INPUT CHANGE / PASTE
  useEffect(() => {
    const rawTarget = (googleMapsUrl || '').trim() || (location || '').trim();
    const isMapLink =
      rawTarget.includes('http://') ||
      rawTarget.includes('https://') ||
      rawTarget.includes('maps.app.goo.gl') ||
      rawTarget.includes('goo.gl/maps') ||
      rawTarget.includes('google.com/maps');

    if (isMapLink && rawTarget !== lastResolvedUrl.current) {
      const timer = setTimeout(async () => {
        lastResolvedUrl.current = rawTarget;
        setResolvingMap(true);
        setAutoResolveMsg('Auto-resolving map coordinates...');
        try {
          const res = await jobsApi.resolveMapUrl(rawTarget);
          if (res.success && res.data) {
            if (res.data.latitude && res.data.longitude) {
              setLatitude(res.data.latitude);
              setLongitude(res.data.longitude);
            }
            if (res.data.formattedAddress) {
              setResolvedAddress(res.data.formattedAddress);
            }
            const latStr = res.data.latitude ? res.data.latitude.toFixed(4) : '';
            const lngStr = res.data.longitude ? res.data.longitude.toFixed(4) : '';
            setAutoResolveMsg(
              `✓ Coordinates Auto-Resolved${latStr ? ` (${latStr}, ${lngStr})` : ''}`
            );
          } else {
            setAutoResolveMsg('Map link captured (Coordinates will process)');
          }
        } catch (e: any) {
          setAutoResolveMsg('Map URL captured');
        } finally {
          setResolvingMap(false);
        }
      }, 500); // 500ms debounce wait for complete URL paste

      return () => clearTimeout(timer);
    }
  }, [googleMapsUrl, location]);

  // Handle Industry Selection -> Populate Roles
  const handleIndustryChange = (newIndustry: string) => {
    setIndustry(newIndustry);
    if (newIndustry !== 'Other') setCustomIndustry('');
    const roles = getRolesForIndustry(newIndustry);
    setCurrentRoleOptions(roles);
    if (title && title !== 'Other' && !roles.includes(title)) {
      setTitle('');
      setCustomTitle('');
    }
  };

  // Update Dynamic Skill Suggestions
  useEffect(() => {
    const activeInd = industry === 'Other' ? customIndustry : industry;
    const activeRole = title === 'Other' ? customTitle : title;
    if (activeRole || activeInd) {
      const sugg = getSkillsForRole(activeRole, activeInd);
      setAvailableSkills(sugg);
    } else {
      setAvailableSkills(['Quality Inspection', 'Shop Floor Operation', 'Safety Protocols', 'Punctuality']);
    }
  }, [industry, customIndustry, title, customTitle]);

  const resetForm = useCallback(() => {
    setAiPrompt('');
    setCompanyLogo(null);
    setIndustry('');
    setCustomIndustry('');
    setTitle('');
    setCustomTitle('');
    setOpeningsInput('1');
    setTargetIti(false);
    setItiTrade('');
    setCustomItiTrade('');
    setIsMidcLocation(false);
    setMidcZone('');
    setCustomMidcZone('');
    setLocation('');
    setGoogleMapsUrl('');
    setLatitude(null);
    setLongitude(null);
    setResolvedAddress(null);
    setAutoResolveMsg(null);
    setExperienceRequired(true);
    setMinExperience('');
    setMaxExperience('');
    setDiscloseSalary(true);
    setSalaryMin('');
    setSalaryMax('');
    setWorkType('Full-time');
    setWorkMode('On-site');
    setShiftCategory('Day Shift');
    setShiftTimingOption('');
    setOvertime(false);
    setAccommodation(false);
    setBusFacility(false);
    setCanteen(false);
    setJoiningBonus(false);
    setAttendanceBonus(false);
    setPf(false);
    setEsic(false);
    setUniform(false);
    setMedicalInsurance(false);
    setContractDuration('');
    setGenderPreference('No Preference');
    setMinAgeInput('');
    setMaxAgeInput('');
    setHiringMethod('STANDARD');
    setWalkInDate('');
    setWalkInStartTime('');
    setWalkInEndTime('');
    setInterviewAddress('');
    setWalkInContactPerson('');
    setWalkInContactNumber('');
    setApplicationDeadline('');
    setMaxApplicantsInput('');
    setDescription('');
    setShowResponsibilities(false);
    setResponsibilities('');
    setShowRequirements(false);
    setRequirements('');
    setSkillsTags([]);
    setError(null);
  }, []);

  // Load existing job for editing whenever screen gains focus with jobId, or reset for new job
  useFocusEffect(
    React.useCallback(() => {
      const targetJobId = route?.params?.jobId;
      if (targetJobId) {
        setLoading(true);
        jobsApi.getJobById(targetJobId).then((res) => {
          setLoading(false);
          if (res.success && res.data) {
            const j = res.data as any;
            setCompanyLogo(j.companyLogo || j.company_logo || null);
            const ind = j.industry || j.trade || 'Industrial Manufacturing';
            setIndustry(ind);
            handleIndustryChange(ind);
            setTitle(j.title || '');
            setOpeningsInput((j.openings ?? 1).toString());
            setTargetIti(!!j.targetIti);
            setItiTrade(j.itiTrade || '');
            setIsMidcLocation(!!(j.isMidcLocation || j.midc_zone || j.midcZone));
            setMidcZone(j.midc_zone || j.midcZone || '');
            setLocation(j.location || '');
            setGoogleMapsUrl(j.googleMapsUrl || j.google_maps_url || '');
            if (j.latitude) setLatitude(j.latitude);
            if (j.longitude) setLongitude(j.longitude);
            setExperienceRequired(j.experienceRequired !== false);
            setMinExperience((j.min_experience ?? j.minExperience ?? 0).toString());
            setMaxExperience((j.max_experience ?? j.maxExperience ?? 3).toString());
            setDiscloseSalary(j.discloseSalary !== false);
            setSalaryMin((j.salary_min ?? j.salaryMin ?? 15000).toString());
            setSalaryMax((j.salary_max ?? j.salaryMax ?? 25000).toString());
            setWorkType((j.job_type || j.jobType || 'Full-time') as any);
            setWorkMode((j.work_mode || j.workMode || 'On-site') as any);
            setShiftCategory((j.shift_details || j.shiftDetails || '').includes('Night') ? 'Night Shift' : (j.shift_details || j.shiftDetails || '').includes('Rotational') ? 'Rotational Shift' : 'Day Shift');
            setOvertime(!!j.overtime);
            setAccommodation(!!j.accommodation);
            setBusFacility(!!(j.bus_facility || j.busFacility));
            setCanteen(!!j.canteen);
            setJoiningBonus(!!(j.joining_bonus || j.joiningBonus));
            setAttendanceBonus(!!(j.attendance_bonus || j.attendanceBonus));
            setPf(!!j.pf);
            setEsic(!!j.esic);
            setGenderPreference(j.gender || j.genderPreference || 'No Preference');
            setMinAgeInput((j.minAge ?? 18).toString());
            setMaxAgeInput((j.maxAge ?? 60).toString());
            const hm = j.hiringMethod || (j.isWalkIn || j.walk_in_date ? 'WALK_IN' : 'STANDARD');
            setHiringMethod(hm);
            setWalkInDate(j.walk_in_date || j.walkInDate || '');
            setWalkInStartTime(j.walkInStartTime || '10:00 AM');
            setWalkInEndTime(j.walkInEndTime || '04:00 PM');
            setInterviewAddress(j.interview_address || j.interviewAddress || '');
            setWalkInContactPerson(j.walkInContactPerson || '');
            setWalkInContactNumber(j.walkInContactNumber || '');
            if (j.application_deadline || j.applicationDeadline) {
              setApplicationDeadline((j.application_deadline || j.applicationDeadline).split('T')[0]);
            }
            setDescription(j.description || '');
            if (Array.isArray(j.responsibilities) && j.responsibilities.length > 0) {
              setShowResponsibilities(true);
              setResponsibilities(j.responsibilities.join('\n'));
            } else {
              setShowResponsibilities(false);
              setResponsibilities('');
            }
            if (Array.isArray(j.requirements) && j.requirements.length > 0) {
              setShowRequirements(true);
              setRequirements(j.requirements.join('\n'));
            } else {
              setShowRequirements(false);
              setRequirements('');
            }
            if (Array.isArray(j.skills)) setSkillsTags(j.skills);
          }
        }).catch(() => setLoading(false));
      }
    }, [route?.params?.jobId])
  );

  // AI Generator Handler
  const handleAiBuild = () => {
    if (!aiPrompt.trim()) {
      Alert.alert('AI Job Builder', 'Please type job requirements first.');
      return;
    }
    const p = aiPrompt.toLowerCase();
    if (p.includes('cnc') || p.includes('vmc')) {
      handleIndustryChange('Industrial Manufacturing');
      setTitle('CNC & VMC Machine Operator');
      setDescription('Seeking experienced CNC & VMC Machine Operator for high-precision components manufacturing at shop floor.');
    } else if (p.includes('weld')) {
      handleIndustryChange('Industrial Manufacturing');
      setTitle('MIG / TIG Welder & Fabricator');
    } else if (p.includes('fitter')) {
      handleIndustryChange('Industrial Manufacturing');
      setTitle('Heavy Equipment Fitter & Turner');
    }
    Alert.alert('AI Job Builder', 'Generated form inputs based on your prompt!');
  };

  // Logo Upload
  const handlePickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Gallery access is needed to upload company logo.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      const base64Data = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      setCompanyLogo(base64Data);
    }
  };

  const handleToggleSkill = (skill: string) => {
    if (skillsTags.includes(skill)) {
      setSkillsTags(skillsTags.filter((s) => s !== skill));
    } else {
      setSkillsTags([...skillsTags, skill]);
    }
  };

  const handleResolveMapUrl = async () => {
    const targetUrl = googleMapsUrl || location;
    if (!targetUrl || !targetUrl.includes('http')) {
      Alert.alert('Map Resolution', 'Please enter a valid Google Maps URL first.');
      return;
    }
    setResolvingMap(true);
    try {
      const res = await jobsApi.resolveMapUrl(targetUrl);
      if (res.success && res.data) {
        if (res.data.latitude && res.data.longitude) {
          setLatitude(res.data.latitude);
          setLongitude(res.data.longitude);
        }
        if (res.data.formattedAddress) {
          setResolvedAddress(res.data.formattedAddress);
        }
        Alert.alert('Coordinates Resolved!', `Extracted Address: ${res.data.formattedAddress || 'Latitude/Longitude saved.'}`);
      }
    } catch (e: any) {
      Alert.alert('Resolution Notice', e.message || 'Could not automatically resolve coordinates.');
    } finally {
      setResolvingMap(false);
    }
  };

  // Form Submit Handler
  const handleSubmitJob = async () => {
    setError(null);

    const finalIndustry = industry === 'Other' ? customIndustry.trim() : industry.trim();
    const finalTitle = title === 'Other' ? customTitle.trim() : title.trim();
    const finalItiTrade = targetIti ? (itiTrade === 'Other ITI Trade...' ? customItiTrade.trim() : itiTrade.trim()) : '';
    const finalMidcZone = isMidcLocation ? (midcZone === 'Other MIDC Zone...' ? customMidcZone.trim() : midcZone.trim()) : '';
    const parsedOpenings = Math.max(1, parseInt(openingsInput, 10) || 1);

    if (!finalIndustry) {
      setError('Please select Industry Type / Sector first.');
      return;
    }
    if (!finalTitle) {
      setError('Please select or specify a Job Role.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify City Location / Factory Address.');
      return;
    }
    if (isMidcLocation && !finalMidcZone) {
      setError('Please select an MIDC Zone.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Job Description is mandatory. Please provide a detailed description (at least 5 characters).');
      return;
    }

    const deadlineValue = applicationDeadline.trim() || getDefaultDeadline();
    const parsedMinExp = experienceRequired ? (parseInt(minExperience, 10) || 0) : 0;
    const parsedMaxExp = experienceRequired ? (parseInt(maxExperience, 10) || 0) : 0;
    const parsedSalaryMin = discloseSalary ? (parseInt(salaryMin, 10) || 0) : 0;
    const parsedSalaryMax = discloseSalary ? (parseInt(salaryMax, 10) || 0) : 0;

    if (experienceRequired && parsedMinExp > parsedMaxExp) {
      setError('Minimum Experience cannot be greater than Maximum Experience.');
      return;
    }
    if (discloseSalary && parsedSalaryMin > parsedSalaryMax) {
      setError('Minimum Salary cannot be greater than Maximum Salary.');
      return;
    }
    if (hiringMethod === 'WALK_IN') {
      if (!walkInDate) {
        setError('Please select a Walk-in Drive Date.');
        return;
      }
      if (!interviewAddress.trim()) {
        setError('Please enter the Interview Venue Address for Walk-in Drive.');
        return;
      }
    }

    const respArray = showResponsibilities
      ? responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];
    const reqArray = showRequirements
      ? requirements.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];

    const finalSkills = Array.from(new Set([...skillsTags, finalTitle, finalIndustry]));

    const workplaceType = workMode === 'Remote' ? 'REMOTE' : workMode === 'Hybrid' ? 'HYBRID' : 'ON_SITE';
    const employmentType = workType === 'Part-time' ? 'PART_TIME' : workType === 'Contract' ? 'CONTRACT' : workType === 'Apprenticeship' ? 'INTERNSHIP' : 'FULL_TIME';

    // 100% Dual-Key Database Payload with GIS Coordinates
    const jobPayload: any = {
      title: finalTitle,
      trade: finalIndustry,
      industry: finalIndustry,
      customIndustry: industry === 'Other' ? customIndustry : undefined,
      customTitle: title === 'Other' ? customTitle : undefined,
      openings: parsedOpenings,
      targetIti,
      itiTrade: finalItiTrade,
      isMidcLocation,
      midcZone: finalMidcZone,
      midc_zone: finalMidcZone,
      location: location.trim(),
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      experienceRequired,
      minExperience: parsedMinExp,
      maxExperience: parsedMaxExp,
      min_experience: parsedMinExp,
      max_experience: parsedMaxExp,
      discloseSalary,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      salary_min: parsedSalaryMin,
      salary_max: parsedSalaryMax,
      jobType: workType,
      job_type: workType,
      employmentType: employmentType,
      workMode: workMode,
      work_mode: workMode,
      workplaceType: workplaceType,
      shiftDetails: `${shiftCategory} (${shiftTimingOption})`,
      shift_details: `${shiftCategory} (${shiftTimingOption})`,
      overtime,
      accommodation,
      busFacility,
      bus_facility: busFacility,
      canteen,
      joiningBonus,
      joining_bonus: joiningBonus,
      attendanceBonus,
      attendance_bonus: attendanceBonus,
      pf,
      esic,
      uniform,
      medicalInsurance,
      contractDuration: contractDuration || undefined,
      genderPreference,
      gender: genderPreference,
      minAge: parseInt(minAgeInput, 10) || 18,
      maxAge: parseInt(maxAgeInput, 10) || 60,
      hiringMethod,
      isWalkIn: hiringMethod === 'WALK_IN',
      walkInDate: hiringMethod === 'WALK_IN' ? walkInDate : undefined,
      walk_in_date: hiringMethod === 'WALK_IN' ? walkInDate : undefined,
      walkInStartTime: hiringMethod === 'WALK_IN' ? walkInStartTime : undefined,
      walkInEndTime: hiringMethod === 'WALK_IN' ? walkInEndTime : undefined,
      interviewAddress: hiringMethod === 'WALK_IN' ? interviewAddress.trim() : undefined,
      interview_address: hiringMethod === 'WALK_IN' ? interviewAddress.trim() : undefined,
      walkInContactPerson: hiringMethod === 'WALK_IN' ? walkInContactPerson.trim() : undefined,
      walkInContactNumber: hiringMethod === 'WALK_IN' ? walkInContactNumber.trim() : undefined,
      maxApplicants: parseInt(maxApplicantsInput, 10) || 0,
      applicationDeadline: deadlineValue,
      application_deadline: deadlineValue,
      companyLogo: companyLogo || undefined,
      description: description.trim(),
      responsibilities: respArray,
      requirements: reqArray,
      skills: finalSkills,
    };

    setLoading(true);
    try {
      if (isEdit && editJobId) {
        const res = await jobsApi.updateJob(editJobId, jobPayload);
        setLoading(false);
        if (res.success) {
          Alert.alert(
            'Job Listing Updated',
            `Updated job posting for "${finalTitle}" has been saved in the live database and submitted for review.`,
            [
              {
                text: 'View Manage Jobs',
                onPress: () => {
                  if (typeof navigation.navigate === 'function') {
                    navigation.navigate('ManageJobsTab');
                  } else if (navigation.goBack) {
                    navigation.goBack();
                  }
                },
              },
            ]
          );
        } else {
          setError(res.message || 'Failed to update job posting');
        }
      } else {
        const res = await jobsApi.createJob(jobPayload);
        setLoading(false);
        if (res.success) {
          resetForm();
          Alert.alert(
            'Job Posted Successfully',
            `Your new job post "${finalTitle}" has been stored in the live database and submitted for review.`,
            [
              {
                text: 'View Manage Jobs',
                onPress: () => {
                  if (typeof navigation.navigate === 'function') {
                    navigation.navigate('ManageJobsTab');
                  }
                },
              },
            ]
          );
        } else {
          setError(res.message || 'Failed to publish job post');
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Network error while uploading job data');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {error ? <ErrorBanner message={error} /> : null}

          {/* AI Job Builder Card */}
          {!isEdit ? (
            <View style={styles.aiCard}>
              <View style={styles.aiTitleRow}>
                <Sparkles size={20} color={COLORS.primary} />
                <Text style={styles.aiTitleText}>AI Job Builder</Text>
              </View>
              <Text style={styles.aiDescText}>
                Type requirements in simple words (e.g. "Need 10 CNC operators at Chakan MIDC, night shift with bus and canteen")
              </Text>
              <View style={styles.aiRow}>
                <TextInput
                  style={styles.aiInput}
                  placeholder="Type job requirements..."
                  placeholderTextColor={COLORS.slate400}
                  value={aiPrompt}
                  onChangeText={setAiPrompt}
                />
                <TouchableOpacity style={styles.aiBtn} onPress={handleAiBuild}>
                  <Text style={styles.aiBtnText}>Generate Form</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Section 1: Governance & Logo */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <ShieldCheck size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Company Logo & Settings</Text>
            </View>

            <Text style={styles.fieldLabel}>Upload Company / Factory / Organization Logo</Text>
            <View style={styles.logoRow}>
              <TouchableOpacity style={styles.logoBox} onPress={handlePickLogo}>
                {companyLogo ? (
                  <Image source={{ uri: companyLogo }} style={styles.logoImage} />
                ) : (
                  <Building2 size={32} color={COLORS.primary} />
                )}
              </TouchableOpacity>
              <View style={styles.logoActions}>
                <TouchableOpacity style={styles.uploadLogoBtn} onPress={handlePickLogo}>
                  <Upload size={14} color={COLORS.textWhite} />
                  <Text style={styles.uploadLogoText}>Upload Logo</Text>
                </TouchableOpacity>
                {companyLogo ? (
                  <TouchableOpacity style={styles.removeLogoBtn} onPress={() => setCompanyLogo(null)}>
                    <Trash2 size={14} color={COLORS.danger} />
                    <Text style={styles.removeLogoText}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          {/* Section 2: Industry & Role Specifications */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Building2 size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Industry & Role Specifications</Text>
            </View>

            {/* Step 1: Select Industry Type / Sector Dropdown */}
            <SelectDropdown
              label="Step 1: Select Industry Type / Sector"
              required
              placeholder="Select Industry / Sector..."
              value={industry}
              options={[...INDUSTRY_LIST, 'Other']}
              onSelect={(val) => handleIndustryChange(val)}
            />

            {industry === 'Other' ? (
              <Input
                placeholder="Type custom industry sector (e.g. Renewable Energy & Solar)"
                value={customIndustry}
                onChangeText={setCustomIndustry}
                style={{ marginTop: -SPACING.xs }}
              />
            ) : null}

            {/* Step 2: Select Job Role Dropdown (Dynamic based on selected Industry!) */}
            <SelectDropdown
              label="Step 2: Select Job Role"
              required
              placeholder={
                industry
                  ? 'Select Role for this Industry...'
                  : '👈 Select Industry Type first'
              }
              disabledPlaceholder="👈 Select Industry Type first"
              disabled={!industry}
              value={title}
              options={[...currentRoleOptions, 'Other']}
              onSelect={(val) => {
                setTitle(val);
                if (val !== 'Other') setCustomTitle('');
              }}
            />

            {title === 'Other' ? (
              <Input
                placeholder="Type custom job role (e.g. Senior VMC Programmer)"
                value={customTitle}
                onChangeText={setCustomTitle}
                style={{ marginTop: -SPACING.xs }}
              />
            ) : null}

            {/* Vacancy Count Stepper */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.xs }]}>
              No. of Vacancies <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.stepperBox}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  const curr = parseInt(openingsInput, 10) || 1;
                  setOpeningsInput(String(Math.max(1, curr - 1)));
                }}
              >
                <Minus size={18} color={COLORS.slate800} />
              </TouchableOpacity>
              <TextInput
                style={styles.stepperInput}
                keyboardType="numeric"
                value={openingsInput}
                onChangeText={(val) => {
                  const sanitized = val.replace(/^0+/, '');
                  setOpeningsInput(sanitized);
                }}
                onBlur={() => {
                  if (!openingsInput || parseInt(openingsInput, 10) < 1) {
                    setOpeningsInput('1');
                  }
                }}
              />
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => {
                  const curr = parseInt(openingsInput, 10) || 1;
                  setOpeningsInput(String(curr + 1));
                }}
              >
                <Plus size={18} color={COLORS.slate800} />
              </TouchableOpacity>
            </View>

            {/* Target ITI Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.8}
              onPress={() => setTargetIti(!targetIti)}
            >
              <Award size={16} color={COLORS.primary} />
              <Text style={styles.checkboxText}>Target ITI Professionals</Text>
              <Switch value={targetIti} onValueChange={setTargetIti} />
            </TouchableOpacity>

            {targetIti ? (
              <View style={{ marginTop: SPACING.xs }}>
                <SelectDropdown
                  label="ITI Specialization Trade"
                  placeholder="Select ITI Specialization Trade..."
                  value={itiTrade}
                  options={ITI_TRADES_LIST}
                  onSelect={(val) => setItiTrade(val)}
                />
              </View>
            ) : null}

            {/* MIDC Area Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.8}
              onPress={() => setIsMidcLocation(!isMidcLocation)}
            >
              <Building2 size={16} color={COLORS.primary} />
              <Text style={styles.checkboxText}>This Job is Located in an MIDC Area</Text>
              <Switch value={isMidcLocation} onValueChange={setIsMidcLocation} />
            </TouchableOpacity>

            {isMidcLocation ? (
              <View style={{ marginTop: SPACING.xs }}>
                <SelectDropdown
                  label="Select MIDC Zone in Maharashtra"
                  placeholder="Select MIDC Zone in Maharashtra..."
                  value={midcZone}
                  options={MIDC_LIST}
                  onSelect={(val) => setMidcZone(val)}
                />
              </View>
            ) : null}
          </View>

          {/* Section 3: Work Location & GIS Mapping */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Work Location & GIS Mapping</Text>
            </View>

            <Input
              label="City Location / Factory Address *"
              required
              placeholder="e.g. Plot E-42, Waluj MIDC, Chhatrapati Sambhajinagar or paste Google Maps link"
              value={location}
              onChangeText={setLocation}
              leftIcon={<MapPin size={18} color={COLORS.slate400} />}
            />

            <Input
              label="Google Maps Short Link (Auto-Resolves Coordinates)"
              placeholder="e.g. https://maps.app.goo.gl/..."
              value={googleMapsUrl}
              onChangeText={setGoogleMapsUrl}
              leftIcon={<Map size={18} color={COLORS.slate400} />}
              style={{ marginTop: SPACING.sm }}
            />

            {/* Auto-Resolution Status Badge */}
            {autoResolveMsg ? (
              <View style={styles.autoResolveBadge}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.autoResolveBadgeText}>{autoResolveMsg}</Text>
              </View>
            ) : null}

            {googleMapsUrl || location.includes('http') ? (
              <TouchableOpacity
                style={styles.resolveBtn}
                onPress={handleResolveMapUrl}
                disabled={resolvingMap}
              >
                <Map size={16} color={COLORS.primary} />
                <Text style={styles.resolveText}>
                  {resolvingMap ? 'Resolving Coordinates...' : 'Re-verify Map Coordinates'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Interactive Leaflet Location Map Preview - Only shown when Map Link or Coordinates are entered */}
            {((latitude !== null && longitude !== null) || (googleMapsUrl && googleMapsUrl.trim().length > 0)) ? (
              <JobLocationMapPreview
                latitude={latitude}
                longitude={longitude}
                locationName={resolvedAddress || location || 'Factory Location'}
                height={220}
              />
            ) : null}
          </View>

          {/* Section 4: Experience & Salary Requirements */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Briefcase size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Experience & Salary Requirements</Text>
            </View>

            {/* Experience Checkbox */}
            <View style={styles.switchHeaderRow}>
              <Text style={styles.fieldLabel}>Require Previous Work Experience</Text>
              <Switch value={experienceRequired} onValueChange={setExperienceRequired} />
            </View>

            {experienceRequired ? (
              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <Input label="Min Experience (Yrs)" keyboardType="numeric" value={minExperience} onChangeText={setMinExperience} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Max Experience (Yrs)" keyboardType="numeric" value={maxExperience} onChangeText={setMaxExperience} />
                </View>
              </View>
            ) : null}

            {/* Disclose Salary Checkbox */}
            <View style={[styles.switchHeaderRow, { marginTop: SPACING.md }]}>
              <Text style={styles.fieldLabel}>Disclose Monthly Salary Range to Candidates</Text>
              <Switch value={discloseSalary} onValueChange={setDiscloseSalary} />
            </View>

            {discloseSalary ? (
              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <Input label="Min Salary (₹/Month)" keyboardType="numeric" value={salaryMin} onChangeText={setSalaryMin} leftIcon={<IndianRupee size={16} color={COLORS.slate400} />} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Max Salary (₹/Month)" keyboardType="numeric" value={salaryMax} onChangeText={setSalaryMax} leftIcon={<IndianRupee size={16} color={COLORS.slate400} />} />
                </View>
              </View>
            ) : null}

            {/* Workplace Mode */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Workplace Mode</Text>
            <View style={styles.segmentedRow}>
              {(['On-site', 'Remote', 'Hybrid'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.segmentBtn, workMode === m && styles.segmentBtnActive]}
                  onPress={() => setWorkMode(m)}
                >
                  <Text style={[styles.segmentText, workMode === m && styles.segmentTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Employment Type */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Employment Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {(['Full-time', 'Part-time', 'Contract', 'Apprenticeship'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, workType === t && styles.chipActive]}
                  onPress={() => setWorkType(t)}
                >
                  <Text style={[styles.chipText, workType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section 5: Shift Timing & Statutory Facilities */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Clock size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Shift Timing & Statutory Facilities</Text>
            </View>

            <Text style={styles.fieldLabel}>Shift Category</Text>
            <View style={styles.segmentedRow}>
              {(['Day Shift', 'Night Shift', 'Rotational Shift'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.segmentBtn, shiftCategory === s && styles.segmentBtnActive]}
                  onPress={() => setShiftCategory(s)}
                >
                  <Text style={[styles.segmentText, shiftCategory === s && styles.segmentTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.perkGrid}>
              <View style={styles.perkItem}>
                <Text style={styles.perkLabel}>Overtime Pay (OT)</Text>
                <Switch value={overtime} onValueChange={setOvertime} />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkLabel}>Subsidized Canteen</Text>
                <Switch value={canteen} onValueChange={setCanteen} />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkLabel}>Bus / Transport Facility</Text>
                <Switch value={busFacility} onValueChange={setBusFacility} />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkLabel}>Free Accommodation / Quarters</Text>
                <Switch value={accommodation} onValueChange={setAccommodation} />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkLabel}>Provident Fund (PF)</Text>
                <Switch value={pf} onValueChange={setPf} />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkLabel}>ESIC Medical Facility</Text>
                <Switch value={esic} onValueChange={setEsic} />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkLabel}>Uniform & Safety Shoes</Text>
                <Switch value={uniform} onValueChange={setUniform} />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkLabel}>Medical Insurance</Text>
                <Switch value={medicalInsurance} onValueChange={setMedicalInsurance} />
              </View>
            </View>
          </View>

          {/* Section 6: Applicant Eligibility & Age Criteria */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Users size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Applicant Eligibility & Age Criteria</Text>
            </View>

            <Text style={styles.fieldLabel}>Gender Preference</Text>
            <View style={styles.segmentedRow}>
              {(['No Preference', 'Male Only', 'Female Only'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.segmentBtn, genderPreference === g && styles.segmentBtnActive]}
                  onPress={() => setGenderPreference(g)}
                >
                  <Text style={[styles.segmentText, genderPreference === g && styles.segmentTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.rowTwo, { marginTop: SPACING.md }]}>
              <View style={{ flex: 1 }}>
                <Input label="Min Age (Years)" keyboardType="numeric" value={minAgeInput} onChangeText={setMinAgeInput} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Max Age (Years)" keyboardType="numeric" value={maxAgeInput} onChangeText={setMaxAgeInput} />
              </View>
            </View>
          </View>

          {/* Section 7: Application Preferences & Hiring Mode */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <FileText size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Application Preferences & Hiring Mode</Text>
            </View>

            <Text style={styles.fieldLabel}>Select Hiring Mode</Text>
            <View style={styles.hiringModeBox}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.hiringCard, hiringMethod === 'STANDARD' && styles.hiringCardActive]}
                onPress={() => setHiringMethod('STANDARD')}
              >
                <Building2 size={22} color={hiringMethod === 'STANDARD' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.hiringTitle, hiringMethod === 'STANDARD' && styles.hiringTitleActive]}>
                  Standard Online Applications
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.hiringCard, hiringMethod === 'WALK_IN' && styles.hiringCardActive]}
                onPress={() => setHiringMethod('WALK_IN')}
              >
                <UserCheck size={22} color={hiringMethod === 'WALK_IN' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.hiringTitle, hiringMethod === 'WALK_IN' && styles.hiringTitleActive]}>
                  Direct Walk-in Interview Drive
                </Text>
              </TouchableOpacity>
            </View>

            {hiringMethod === 'WALK_IN' ? (
              <View style={{ marginTop: 8, gap: 10 }}>
                <DatePickerField
                  label="Walk-in Interview Date"
                  placeholder="Select walk-in date..."
                  value={walkInDate}
                  onChange={setWalkInDate}
                  minDate={new Date()}
                />
                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <Input label="Start Time" placeholder="10:00 AM" value={walkInStartTime} onChangeText={setWalkInStartTime} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="End Time" placeholder="04:00 PM" value={walkInEndTime} onChangeText={setWalkInEndTime} />
                  </View>
                </View>
                <Input
                  label="Interview Venue Address"
                  placeholder="Gate No 2, Factory Reception, MIDC"
                  value={interviewAddress}
                  onChangeText={setInterviewAddress}
                  leftIcon={<MapPin size={18} color={COLORS.slate400} />}
                />
                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <Input label="Contact Person" placeholder="HR Manager / Supervisor" value={walkInContactPerson} onChangeText={setWalkInContactPerson} leftIcon={<UserCheck size={18} color={COLORS.slate400} />} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Contact Mobile" placeholder="10-digit number" keyboardType="phone-pad" value={walkInContactNumber} onChangeText={setWalkInContactNumber} leftIcon={<Phone size={18} color={COLORS.slate400} />} />
                  </View>
                </View>
              </View>
            ) : null}

            <View style={[styles.rowTwo, { marginTop: 12 }]}>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label="Application Deadline"
                  required
                  placeholder="Select deadline date..."
                  value={applicationDeadline}
                  onChange={setApplicationDeadline}
                  minDate={new Date()}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Max Applicants Cap"
                  placeholder="e.g. 50 (0 = Unlimited)"
                  keyboardType="numeric"
                  value={maxApplicantsInput}
                  onChangeText={setMaxApplicantsInput}
                />
              </View>
            </View>
          </View>

          {/* Section 8: Job Description, Responsibilities & Skills */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Wrench size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Job Description, Responsibilities & Skills</Text>
            </View>

            <Input
              label="Job Description *"
              required
              multiline
              numberOfLines={4}
              placeholder="Describe machine operations, shop floor duties, and expectations..."
              value={description}
              onChangeText={setDescription}
              style={{ minHeight: 90 }}
            />

            {/* Responsibilities Toggle Switch */}
            <View style={[styles.switchHeaderRow, { marginTop: 14, paddingVertical: 4 }]}>
              <Text style={styles.fieldLabel}>Add Key Responsibilities</Text>
              <Switch
                value={showResponsibilities}
                onValueChange={(val) => {
                  setShowResponsibilities(val);
                  if (!val) setResponsibilities('');
                }}
              />
            </View>

            {showResponsibilities ? (
              <Input
                label="Key Responsibilities (One per line)"
                multiline
                numberOfLines={3}
                placeholder="e.g. Operate CNC machine per job card&#10;Perform Quality Checks"
                value={responsibilities}
                onChangeText={setResponsibilities}
                style={{ marginTop: 4, minHeight: 70 }}
              />
            ) : null}

            {/* Requirements Toggle Switch */}
            <View style={[styles.switchHeaderRow, { marginTop: 14, paddingVertical: 4 }]}>
              <Text style={styles.fieldLabel}>Add Job Requirements & Qualifications</Text>
              <Switch
                value={showRequirements}
                onValueChange={(val) => {
                  setShowRequirements(val);
                  if (!val) setRequirements('');
                }}
              />
            </View>

            {showRequirements ? (
              <Input
                label="Job Requirements & Qualification (One per line)"
                multiline
                numberOfLines={3}
                placeholder="e.g. ITI / Diploma in Fitter Trade&#10;1+ year shopfloor experience"
                value={requirements}
                onChangeText={setRequirements}
                style={{ marginTop: 4, minHeight: 70 }}
              />
            ) : null}

            {/* Dynamic Skills Pills */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Suggested Skill Tags (Tap to add)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {availableSkills.map((sk) => {
                const isSelected = skillsTags.includes(sk);
                return (
                  <TouchableOpacity
                    key={sk}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => handleToggleSkill(sk)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Form Submit Bar */}
          <View style={styles.submitContainer}>
            <Button
              title={
                loading
                  ? 'Uploading Job Data to Database...'
                  : isEdit
                  ? 'Resubmit Job for Approval'
                  : 'Publish Enterprise Job'
              }
              onPress={handleSubmitJob}
              variant="primary"
              size="lg"
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 140,
  },
  aiCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  aiTitleText: {
    ...TYPOGRAPHY.h2,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  aiDescText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.slate600,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  aiRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  aiInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.slate300,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontSize: 13,
    color: COLORS.textPrimary,
    height: 42,
  },
  aiBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
  },
  aiBtnText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.danger,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    borderBottomWidth: 2.5,
    borderBottomColor: '#1E40AF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 140,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.slate300,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    color: COLORS.slate900,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  checkboxText: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  resolveText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  autoResolveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  autoResolveBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate100,
    borderRadius: RADIUS.sm,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm - 2,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  segmentText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  switchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  perkGrid: {
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  perkLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  hiringModeBox: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  hiringCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  hiringCardActive: {
    borderColor: '#2563EB',
    borderBottomWidth: 3,
    borderBottomColor: '#1D4ED8',
    backgroundColor: '#EFF6FF',
  },
  hiringTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 16,
  },
  hiringTitleActive: {
    color: '#2563EB',
    fontWeight: '900',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.slate100,
    borderWidth: 1,
    borderColor: COLORS.slate300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
  },
  logoActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  uploadLogoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
  },
  uploadLogoText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  removeLogoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
  },
  removeLogoText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  submitContainer: {
    marginTop: SPACING.md,
  },
});
