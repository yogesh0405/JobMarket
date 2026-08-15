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
  Award,
  Users,
  Phone,
  UserCheck,
  User,
  FileText,
  Wrench,
  CheckCircle2,
  Map,
  Plus,
  Minus,
  Check,
  Sun,
  Moon,
  RotateCw,
  X,
  Camera,
  ArrowLeft,
  ChevronDown,
  Upload,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { jobsApi } from '../../api/jobsApi';
import { JobLocationMapPreview } from '../../components/map/JobLocationMapPreview';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { SelectDropdown } from '../../components/common/SelectDropdown';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { DatePickerField } from '../../components/common/DatePickerField';
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { COLORS, SPACING } from '../../constants/theme';

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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Props {
  route?: any;
  navigation: any;
}

export const JobPostScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const editJobId = route?.params?.jobId;
  const isEdit = !!editJobId;
  const { user } = useAuth();

  const defaultProfileLogo =
    user?.companyLogo ||
    (user as any)?.company_logo ||
    (user as any)?.avatarUrl ||
    (user as any)?.profilePicture ||
    (user as any)?.avatar ||
    null;

  // AI Prompt input
  const [aiPrompt, setAiPrompt] = useState('');

  // 1. Company Logo
  const [companyLogo, setCompanyLogo] = useState<string | null>(defaultProfileLogo);

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
  const isSubmittedRef = useRef<boolean>(false);

  // Confirm Discard / Exit Alert on Back navigation
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('beforeRemove', (e: any) => {
      if (isSubmittedRef.current) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Discard Job Post?',
        'Unsaved changes will be lost.',
        [
          { text: 'Keep Editing', style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

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
  const [customSkillInput, setCustomSkillInput] = useState('');

  // UI States
  const [resolvingMap, setResolvingMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-step Wizard States (4 Steps)
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  const STEPS = [
    { id: 1, title: 'Basic Details' },
    { id: 2, title: 'Location' },
    { id: 3, title: 'Work & Pay' },
    { id: 4, title: 'Role & Skills' },
  ];

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1) {
      const activeInd = industry === 'Other' ? customIndustry.trim() : industry.trim();
      const activeRole = title === 'Other' ? customTitle.trim() : title.trim();
      if (!activeInd) {
        setError('Please select or specify an Industry Sector.');
        return;
      }
      if (!activeRole) {
        setError('Please select or specify a Job Role.');
        return;
      }
      if (!openingsInput || parseInt(openingsInput, 10) < 1) {
        setError('Please enter a valid number of vacancies (minimum 1).');
        return;
      }
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === 2) {
      if (!location.trim()) {
        setError('Please enter a City Location / Factory Address.');
        return;
      }
      setCurrentStep(3);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === 3) {
      setCurrentStep(4);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

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
              `Coordinates Auto-Resolved${latStr ? ` (${latStr}, ${lngStr})` : ''}`
            );
          } else {
            setAutoResolveMsg('Map link captured (Coordinates will process)');
          }
        } catch (e: any) {
          setAutoResolveMsg('Map URL captured');
        } finally {
          setResolvingMap(false);
        }
      }, 500);

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
    setCompanyLogo(defaultProfileLogo);
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
  }, [defaultProfileLogo]);

  // Load existing job for editing whenever screen gains focus with jobId
  useFocusEffect(
    React.useCallback(() => {
      const targetJobId = route?.params?.jobId;
      if (targetJobId) {
        setLoading(true);
        jobsApi.getJobById(targetJobId).then((res) => {
          setLoading(false);
          if (res.success && res.data) {
            const j = res.data as any;
            setCompanyLogo(j.companyLogo || j.company_logo || defaultProfileLogo);
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

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!skillsTags.includes(trimmed)) {
      setSkillsTags([...skillsTags, trimmed]);
    }
    setCustomSkillInput('');
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

    // Dual-Key Database Payload
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
          isSubmittedRef.current = true;
          Alert.alert(
            'Job Listing Updated',
            `Your updated job posting for "${finalTitle}" has been submitted for approval. It will go live once approved by the JobMarket team.`,
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
          isSubmittedRef.current = true;
          resetForm();
          Alert.alert(
            'Job Posted Successfully',
            `Your job post "${finalTitle}" has been sent for approval. It will go live once approved by the JobMarket team.`,
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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Multi-Step Stepper Progress Bar Header */}
      <View style={styles.stepperHeaderCard}>
        <View style={styles.stepTrack}>
          {STEPS.map((step, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = currentStep > stepNumber;
            const isActive = currentStep === stepNumber;
            const isLast = idx === STEPS.length - 1;

            return (
              <React.Fragment key={step.id}>
                <TouchableOpacity
                  style={styles.stepNodeCol}
                  activeOpacity={0.7}
                  disabled={stepNumber > currentStep}
                  onPress={() => {
                    if (stepNumber < currentStep) {
                      setCurrentStep(stepNumber);
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }
                  }}
                >
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCircleCompleted,
                      isActive && styles.stepCircleActive,
                    ]}
                  >
                    {isCompleted ? (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Text style={[styles.stepCircleText, isActive && styles.stepCircleTextActive]}>
                        {stepNumber}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.stepNodeTitle, isActive && styles.stepNodeTitleActive]} numberOfLines={1}>
                    {step.title}
                  </Text>
                </TouchableOpacity>

                {!isLast && (
                  <View style={styles.connectorTrack}>
                    <View
                      style={[
                        styles.connectorLine,
                        currentStep > stepNumber && styles.connectorLineActive,
                      ]}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          {error ? <ErrorBanner message={error} /> : null}

          {/* STEP 1: Basic Details & Industry Specifications */}
          {currentStep === 1 ? (
            <View style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Basic Job Details</Text>
                  <Text style={styles.cardHeaderSub}>Enter company logo & job specifications</Text>
                </View>
              </View>

              {/* Clean Upload Box for Company Logo */}
              <View style={styles.logoUploadContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.logoUploadBox}
                  onPress={handlePickLogo}
                >
                  {companyLogo ? (
                    <View style={styles.logoPreviewWrapper}>
                      <Image source={{ uri: companyLogo }} style={styles.logoPreviewImage} resizeMode="contain" />
                      <View style={styles.logoEditBadge}>
                        <Camera size={12} color="#FFFFFF" />
                        <Text style={styles.logoEditText}>Change Logo</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.logoPlaceholderWrapper}>
                      <View style={styles.uploadIconCircle}>
                        <Upload size={18} color={COLORS.primary} />
                      </View>
                      <Text style={styles.logoUploadTitle}>Upload Company Logo</Text>
                      <Text style={styles.logoUploadSub}>JPG, PNG or WEBP (Tap to upload)</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.sectionSeparator} />

              {/* Industry & Role Specifications */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Building2 size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Industry & Role Specifications</Text>
                </View>

                <View style={styles.cardBody}>
                  <SelectDropdown
                    label="Industry Type / Sector"
                    required
                    placeholder="Select Industry / Sector..."
                    value={industry}
                    options={[...INDUSTRY_LIST, 'Other']}
                    onSelect={(val) => handleIndustryChange(val)}
                    triggerStyle={{ borderRadius: 8 }}
                  />

                  {industry === 'Other' ? (
                    <Input
                      placeholder="Type custom industry sector (e.g. Renewable Energy & Solar)"
                      value={customIndustry}
                      onChangeText={setCustomIndustry}
                      inputContainerStyle={{ borderRadius: 8 }}
                      style={{ marginTop: -SPACING.xs }}
                    />
                  ) : null}

                  <SelectDropdown
                    label="Job Role"
                    required
                    placeholder={
                      industry
                        ? 'Select Role for this Industry...'
                        : 'Select Industry Type first'
                    }
                    disabledPlaceholder="Select Industry Type first"
                    disabled={!industry}
                    value={title}
                    options={[...currentRoleOptions, 'Other']}
                    onSelect={(val) => {
                      setTitle(val);
                      if (val !== 'Other') setCustomTitle('');
                    }}
                    triggerStyle={{ borderRadius: 8 }}
                  />

                  {title === 'Other' ? (
                    <Input
                      placeholder="Type custom job role (e.g. Senior VMC Programmer)"
                      value={customTitle}
                      onChangeText={setCustomTitle}
                      inputContainerStyle={{ borderRadius: 8 }}
                      style={{ marginTop: -SPACING.xs }}
                    />
                  ) : null}

                  {/* Vacancy Quantity Stepper */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>
                      No. of Vacancies <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.stepperBox}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        activeOpacity={0.7}
                        onPress={() => {
                          const curr = parseInt(openingsInput, 10) || 1;
                          setOpeningsInput(String(Math.max(1, curr - 1)));
                        }}
                      >
                        <Minus size={15} color="#0F172A" strokeWidth={2.5} />
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
                        activeOpacity={0.7}
                        onPress={() => {
                          const curr = parseInt(openingsInput, 10) || 1;
                          setOpeningsInput(String(curr + 1));
                        }}
                      >
                        <Plus size={15} color="#0F172A" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.sectionSeparator} />

                  {/* Target ITI Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    activeOpacity={0.8}
                    onPress={() => setTargetIti(!targetIti)}
                  >
                    <Award size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.checkboxText}>Target ITI Professionals</Text>
                    <Switch value={targetIti} onValueChange={setTargetIti} trackColor={{ true: COLORS.primary }} />
                  </TouchableOpacity>

                  {targetIti ? (
                    <View style={{ marginTop: SPACING.xs }}>
                      <SelectDropdown
                        label="ITI Specialization Trade"
                        placeholder="Select ITI Specialization Trade..."
                        value={itiTrade}
                        options={ITI_TRADES_LIST}
                        onSelect={(val) => setItiTrade(val)}
                        triggerStyle={{ borderRadius: 8 }}
                      />
                    </View>
                  ) : null}

                  {/* MIDC Area Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    activeOpacity={0.8}
                    onPress={() => setIsMidcLocation(!isMidcLocation)}
                  >
                    <Building2 size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.checkboxText}>This Job is Located in an MIDC Area</Text>
                    <Switch value={isMidcLocation} onValueChange={setIsMidcLocation} trackColor={{ true: COLORS.primary }} />
                  </TouchableOpacity>

                  {isMidcLocation ? (
                    <View style={{ marginTop: SPACING.xs }}>
                      <SelectDropdown
                        label="Select MIDC Zone in Maharashtra"
                        placeholder="Select MIDC Zone in Maharashtra..."
                        value={midcZone}
                        options={MIDC_LIST}
                        onSelect={(val) => setMidcZone(val)}
                        triggerStyle={{ borderRadius: 8 }}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}

          {/* STEP 2: Work Location & GIS Mapping */}
          {currentStep === 2 ? (
            <View style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Location Information</Text>
                  <Text style={styles.cardHeaderSub}>Enter factory address & map location</Text>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <MapPin size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Work Location & GIS Mapping</Text>
                </View>

                <View style={styles.cardBody}>
                  <Input
                    label="City Location / Factory Address"
                    required
                    placeholder="e.g. Plot E-42, Waluj MIDC, Chhatrapati Sambhajinagar"
                    value={location}
                    onChangeText={setLocation}
                    leftIcon={<MapPin size={16} color="#64748B" />}
                    inputContainerStyle={{ borderRadius: 8 }}
                  />

                  <Input
                    label="Google Maps Short Link (Auto-Resolves Coordinates)"
                    placeholder="e.g. https://maps.app.goo.gl/..."
                    value={googleMapsUrl}
                    onChangeText={setGoogleMapsUrl}
                    leftIcon={<Map size={16} color="#64748B" />}
                    inputContainerStyle={{ borderRadius: 8 }}
                    style={{ marginTop: SPACING.sm }}
                  />

                  {autoResolveMsg ? (
                    <View style={styles.autoResolveBadge}>
                      <CheckCircle2 size={15} color="#059669" style={{ marginRight: 6 }} />
                      <Text style={styles.autoResolveBadgeText}>{autoResolveMsg}</Text>
                    </View>
                  ) : null}

                  {googleMapsUrl || location.includes('http') ? (
                    <TouchableOpacity
                      style={styles.resolveBtn}
                      onPress={handleResolveMapUrl}
                      disabled={resolvingMap}
                    >
                      <Map size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.resolveText}>
                        {resolvingMap ? 'Resolving Coordinates...' : 'Re-verify Map Coordinates'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {((latitude !== null && longitude !== null) || (googleMapsUrl && googleMapsUrl.trim().length > 0)) ? (
                    <JobLocationMapPreview
                      latitude={latitude}
                      longitude={longitude}
                      locationName={resolvedAddress || location || 'Factory Location'}
                      height={240}
                    />
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}

          {/* STEP 3: Experience, Salary, Workplace & Shift Perks */}
          {currentStep === 3 ? (
            <View style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Work & Pay Information</Text>
                  <Text style={styles.cardHeaderSub}>Enter salary range, shift timings & benefits</Text>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Briefcase size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Experience & Salary Requirements</Text>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.switchHeaderRow}>
                    <Text style={styles.fieldLabel}>Require Previous Work Experience</Text>
                    <Switch value={experienceRequired} onValueChange={setExperienceRequired} trackColor={{ true: COLORS.primary }} />
                  </View>

                  {experienceRequired ? (
                    <View style={styles.rowTwo}>
                      <View style={{ flex: 1 }}>
                        <Input
                          label="Min Experience (Yrs)"
                          keyboardType="numeric"
                          value={minExperience}
                          onChangeText={setMinExperience}
                          inputContainerStyle={{ borderRadius: 8 }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Input
                          label="Max Experience (Yrs)"
                          keyboardType="numeric"
                          value={maxExperience}
                          onChangeText={setMaxExperience}
                          inputContainerStyle={{ borderRadius: 8 }}
                        />
                      </View>
                    </View>
                  ) : null}

                  <View style={[styles.switchHeaderRow, { marginTop: SPACING.md }]}>
                    <Text style={styles.fieldLabel}>Disclose Monthly Salary Range to Candidates</Text>
                    <Switch value={discloseSalary} onValueChange={setDiscloseSalary} trackColor={{ true: COLORS.primary }} />
                  </View>

                  {discloseSalary ? (
                    <View style={styles.rowTwo}>
                      <View style={{ flex: 1 }}>
                        <Input
                          label="Min Salary (₹/Month)"
                          keyboardType="numeric"
                          value={salaryMin}
                          onChangeText={setSalaryMin}
                          leftIcon={<IndianRupee size={15} color="#64748B" />}
                          inputContainerStyle={{ borderRadius: 8 }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Input
                          label="Max Salary (₹/Month)"
                          keyboardType="numeric"
                          value={salaryMax}
                          onChangeText={setSalaryMax}
                          leftIcon={<IndianRupee size={15} color="#64748B" />}
                          inputContainerStyle={{ borderRadius: 8 }}
                        />
                      </View>
                    </View>
                  ) : null}

                  <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Work Mode</Text>
                  <View style={styles.segmentedRow}>
                    {(['On-site', 'Remote', 'Hybrid'] as const).map((m, idx, arr) => {
                      const isSelected = workMode === m;
                      const isLast = idx === arr.length - 1;
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[
                            styles.segmentBtn,
                            !isLast && styles.tabBtnBorderRight,
                            isSelected && styles.segmentBtnActive,
                          ]}
                          onPress={() => setWorkMode(m)}
                        >
                          <Text
                            style={[styles.segmentText, isSelected && styles.segmentTextActive]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {m}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Work Type</Text>
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
              </View>

              <View style={styles.sectionSeparator} />

              {/* Shift Timing & Statutory Facilities */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Clock size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Shift Timing & Statutory Facilities</Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.fieldLabel}>Shift Category</Text>
                  <View style={styles.hiringSegmentedTrack}>
                    {(['Day Shift', 'Night Shift', 'Rotational Shift'] as const).map((s, idx, arr) => {
                      const isSelected = shiftCategory === s;
                      const IconComp = s === 'Day Shift' ? Sun : (s === 'Night Shift' ? Moon : RotateCw);
                      const isLast = idx === arr.length - 1;
                      return (
                        <TouchableOpacity
                          key={s}
                          activeOpacity={0.8}
                          style={[
                            styles.hiringTabBtn,
                            !isLast && styles.tabBtnBorderRight,
                            isSelected && styles.hiringTabBtnActive,
                          ]}
                          onPress={() => setShiftCategory(s)}
                        >
                          <IconComp size={14} color={isSelected ? '#FFFFFF' : '#64748B'} />
                          <Text
                            style={[styles.hiringTabText, isSelected && styles.hiringTabTextActive]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {s}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.perkGrid}>
                    <View style={styles.perkItem}>
                      <Text style={styles.perkLabel}>Overtime Pay (OT)</Text>
                      <Switch value={overtime} onValueChange={setOvertime} trackColor={{ true: COLORS.primary }} />
                    </View>
                    <View style={styles.perkItem}>
                      <Text style={styles.perkLabel}>Subsidized Canteen</Text>
                      <Switch value={canteen} onValueChange={setCanteen} trackColor={{ true: COLORS.primary }} />
                    </View>
                    <View style={styles.perkItem}>
                      <Text style={styles.perkLabel}>Bus / Transport Facility</Text>
                      <Switch value={busFacility} onValueChange={setBusFacility} trackColor={{ true: COLORS.primary }} />
                    </View>
                    <View style={styles.perkItem}>
                      <Text style={styles.perkLabel}>Free Accommodation / Quarters</Text>
                      <Switch value={accommodation} onValueChange={setAccommodation} trackColor={{ true: COLORS.primary }} />
                    </View>
                    <View style={styles.perkItem}>
                      <Text style={styles.perkLabel}>Provident Fund (PF)</Text>
                      <Switch value={pf} onValueChange={setPf} trackColor={{ true: COLORS.primary }} />
                    </View>
                    <View style={styles.perkItem}>
                      <Text style={styles.perkLabel}>ESIC Medical Facility</Text>
                      <Switch value={esic} onValueChange={setEsic} trackColor={{ true: COLORS.primary }} />
                    </View>
                    <View style={styles.perkItem}>
                      <Text style={styles.perkLabel}>Uniform & Safety Shoes</Text>
                      <Switch value={uniform} onValueChange={setUniform} trackColor={{ true: COLORS.primary }} />
                    </View>
                    <View style={styles.perkItem}>
                      <Text style={styles.perkLabel}>Medical Insurance</Text>
                      <Switch value={medicalInsurance} onValueChange={setMedicalInsurance} trackColor={{ true: COLORS.primary }} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* STEP 4: Eligibility, Hiring Mode & Description/Skills */}
          {currentStep === 4 ? (
            <View style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Role & Eligibility</Text>
                  <Text style={styles.cardHeaderSub}>Enter age criteria, hiring mode & key skills</Text>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Users size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Applicant Eligibility & Age Criteria</Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.fieldLabel}>Gender Preference</Text>
                  <View style={styles.hiringSegmentedTrack}>
                    {(['No Preference', 'Male Only', 'Female Only'] as const).map((g, idx, arr) => {
                      const isSelected = genderPreference === g;
                      const IconComp = g === 'No Preference' ? Users : (g === 'Male Only' ? User : UserCheck);
                      const isLast = idx === arr.length - 1;
                      return (
                        <TouchableOpacity
                          key={g}
                          activeOpacity={0.8}
                          style={[
                            styles.hiringTabBtn,
                            !isLast && styles.tabBtnBorderRight,
                            isSelected && styles.hiringTabBtnActive,
                          ]}
                          onPress={() => setGenderPreference(g)}
                        >
                          <IconComp size={14} color={isSelected ? '#FFFFFF' : '#64748B'} />
                          <Text
                            style={[styles.hiringTabText, isSelected && styles.hiringTabTextActive]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {g}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={[styles.rowTwo, { marginTop: SPACING.md }]}>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Min Age (Years)"
                        keyboardType="numeric"
                        value={minAgeInput}
                        onChangeText={setMinAgeInput}
                        inputContainerStyle={{ borderRadius: 8 }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Max Age (Years)"
                        keyboardType="numeric"
                        value={maxAgeInput}
                        onChangeText={setMaxAgeInput}
                        inputContainerStyle={{ borderRadius: 8 }}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.sectionSeparator} />

              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <FileText size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Application and Hiring Mode</Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.fieldLabel}>Select Hiring Mode</Text>
                  <View style={styles.hiringSegmentedTrack}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.hiringTabBtn,
                        styles.tabBtnBorderRight,
                        hiringMethod === 'STANDARD' && styles.hiringTabBtnActive,
                      ]}
                      onPress={() => setHiringMethod('STANDARD')}
                    >
                      <Building2 size={14} color={hiringMethod === 'STANDARD' ? '#FFFFFF' : '#64748B'} />
                      <Text
                        style={[styles.hiringTabText, hiringMethod === 'STANDARD' && styles.hiringTabTextActive]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        Standard Online
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.hiringTabBtn,
                        hiringMethod === 'WALK_IN' && styles.hiringTabBtnActive,
                      ]}
                      onPress={() => setHiringMethod('WALK_IN')}
                    >
                      <UserCheck size={14} color={hiringMethod === 'WALK_IN' ? '#FFFFFF' : '#64748B'} />
                      <Text
                        style={[styles.hiringTabText, hiringMethod === 'WALK_IN' && styles.hiringTabTextActive]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        Direct Walk-in Drive
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
                          <Input
                            label="Start Time"
                            placeholder="10:00 AM"
                            value={walkInStartTime}
                            onChangeText={setWalkInStartTime}
                            inputContainerStyle={{ borderRadius: 8 }}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Input
                            label="End Time"
                            placeholder="04:00 PM"
                            value={walkInEndTime}
                            onChangeText={setWalkInEndTime}
                            inputContainerStyle={{ borderRadius: 8 }}
                          />
                        </View>
                      </View>
                      <Input
                        label="Interview Venue Address"
                        placeholder="Gate No 2, Factory Reception, MIDC"
                        value={interviewAddress}
                        onChangeText={setInterviewAddress}
                        leftIcon={<MapPin size={16} color="#64748B" />}
                        inputContainerStyle={{ borderRadius: 8 }}
                      />
                      <View style={styles.rowTwo}>
                        <View style={{ flex: 1 }}>
                          <Input
                            label="Contact Person"
                            placeholder="HR Manager / Supervisor"
                            value={walkInContactPerson}
                            onChangeText={setWalkInContactPerson}
                            leftIcon={<UserCheck size={16} color="#64748B" />}
                            inputContainerStyle={{ borderRadius: 8 }}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Input
                            label="Contact Mobile"
                            placeholder="10-digit number"
                            keyboardType="phone-pad"
                            value={walkInContactNumber}
                            onChangeText={setWalkInContactNumber}
                            leftIcon={<Phone size={16} color="#64748B" />}
                            inputContainerStyle={{ borderRadius: 8 }}
                          />
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
                        inputContainerStyle={{ borderRadius: 8 }}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.sectionSeparator} />

              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Wrench size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Job Description, Responsibilities & Skills</Text>
                </View>

                <View style={styles.cardBody}>
                  <Input
                    label="Job Description"
                    required
                    multiline
                    numberOfLines={4}
                    placeholder="Describe machine operations, shop floor duties, and expectations..."
                    value={description}
                    onChangeText={setDescription}
                    inputContainerStyle={{ borderRadius: 8 }}
                    style={{ minHeight: 90 }}
                  />

                  <View style={[styles.switchHeaderRow, { marginTop: 14, paddingVertical: 4 }]}>
                    <Text style={styles.fieldLabel}>Add Key Responsibilities</Text>
                    <Switch
                      value={showResponsibilities}
                      onValueChange={(val) => {
                        setShowResponsibilities(val);
                        if (!val) setResponsibilities('');
                      }}
                      trackColor={{ true: COLORS.primary }}
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
                      inputContainerStyle={{ borderRadius: 8 }}
                      style={{ marginTop: 4, minHeight: 70 }}
                    />
                  ) : null}

                  <View style={[styles.switchHeaderRow, { marginTop: 14, paddingVertical: 4 }]}>
                    <Text style={styles.fieldLabel}>Add Job Requirements & Qualifications</Text>
                    <Switch
                      value={showRequirements}
                      onValueChange={(val) => {
                        setShowRequirements(val);
                        if (!val) setRequirements('');
                      }}
                      trackColor={{ true: COLORS.primary }}
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
                      inputContainerStyle={{ borderRadius: 8 }}
                      style={{ marginTop: 4, minHeight: 70 }}
                    />
                  ) : null}

                  <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>
                    Key Skills <Text style={styles.required}>*</Text>
                  </Text>
                  
                  <View style={styles.customSkillInputRow}>
                    <TextInput
                      style={styles.customSkillInput}
                      placeholder="Enter skills (e.g. CNC Operating)"
                      placeholderTextColor="#94A3B8"
                      value={customSkillInput}
                      onChangeText={setCustomSkillInput}
                      onSubmitEditing={handleAddCustomSkill}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={styles.addCustomSkillBtn}
                      activeOpacity={0.8}
                      onPress={handleAddCustomSkill}
                    >
                      <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.addSkillBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {skillsTags.length > 0 ? (
                    <View style={styles.selectedTagsWrap}>
                      {skillsTags.map((sk) => (
                        <View key={`selected-${sk}`} style={styles.selectedTagChip}>
                          <Text style={styles.selectedTagText}>{sk}</Text>
                          <TouchableOpacity
                            onPress={() => handleToggleSkill(sk)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={{ marginLeft: 6 }}
                          >
                            <X size={13} color={COLORS.primary} strokeWidth={2.5} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {availableSkills.filter((sk) => !skillsTags.includes(sk)).length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                      {availableSkills
                        .filter((sk) => !skillsTags.includes(sk))
                        .map((sk) => (
                          <TouchableOpacity
                            key={sk}
                            style={styles.chip}
                            onPress={() => handleToggleSkill(sk)}
                          >
                            <Text style={styles.chipText}>+ {sk}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}
      </KeyboardAwareScrollView>

        {/* Fixed Sticky Action Bar at Bottom */}
        <View style={[styles.submitContainer, { paddingBottom: Math.max(insets.bottom + 10, 24) }]}>
          {currentStep === 1 ? (
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.85}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.prevBtn}
              activeOpacity={0.85}
              onPress={handlePrevStep}
            >
              <ArrowLeft size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.prevBtnText}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < 4 ? (
            <TouchableOpacity
              style={styles.nextBtn}
              activeOpacity={0.85}
              onPress={handleNextStep}
            >
              <Text style={styles.nextBtnText}>Next Step</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              activeOpacity={0.85}
              disabled={loading}
              onPress={handleSubmitJob}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stepperHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepNodeCol: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  stepCircleCompleted: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stepCircleTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepNodeTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  stepNodeTitleActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  connectorTrack: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: -12,
    marginHorizontal: -4,
  },
  connectorLine: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  connectorLineActive: {
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 2,
  },

  // Company Logo Upload Box Styling
  logoUploadContainer: {
    marginBottom: 12,
  },
  logoUploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logoUploadTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  logoUploadSub: {
    fontSize: 11,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 2,
  },
  logoPreviewWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 2,
  },
  logoPreviewImage: {
    width: 80,
    height: 52,
    borderRadius: 4,
  },
  logoEditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  logoEditText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  sectionSeparator: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  sectionBlock: {
    marginVertical: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionTitleText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardBody: {
    gap: 10,
  },
  fieldBlock: {
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 5,
  },
  required: {
    color: '#DC2626',
    fontWeight: '700',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 44,
    width: 130,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  checkboxText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 10,
  },
  autoResolveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  autoResolveBadgeText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#059669',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 9,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginTop: 4,
  },
  resolveText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  switchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentedRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginRight: 6,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hiringSegmentedTrack: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  hiringTabBtn: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 5,
    backgroundColor: '#FFFFFF',
  },
  tabBtnBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  hiringTabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  hiringTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  hiringTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  perkGrid: {
    marginTop: 6,
    gap: 2,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  perkLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  customSkillInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customSkillInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    borderRadius: 8,
  },
  addCustomSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    borderRadius: 8,
    gap: 4,
  },
  addSkillBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  submitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  prevBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  prevBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nextBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  nextBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
