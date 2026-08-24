import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { jobsApi } from '../../../api/jobsApi';
import { useAuth } from '../../../hooks/useAuth';
import { getRolesForIndustry, getSkillsForRole, EDUCATION_REQUIREMENT_OPTIONS } from '../components/JobPostConstants';
import { extractCoordinatesFromMapInput, resolveShortMapUrl, geocodeQueryOnClient } from '../../../utils/mapUrlParser';

export const useJobPostForm = (navigation: any, route: any) => {
  const { user } = useAuth();
  const editJobId = route?.params?.jobId;
  const isEdit = !!editJobId;
  const isSubmittedRef = useRef(false);

  const defaultProfileLogo =
    user?.companyLogo ||
    user?.profilePictureUrl ||
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=150&q=80';

  const [aiPrompt, setAiPrompt] = useState('');
  const [companyLogo, setCompanyLogo] = useState(defaultProfileLogo);

  // Form State
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [title, setTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [currentRoleOptions, setCurrentRoleOptions] = useState<string[]>([]);
  const [openingsInput, setOpeningsInput] = useState<string>('1');

  const [targetIti, setTargetIti] = useState(false);
  const [itiTrade, setItiTrade] = useState('');
  const [customItiTrade, setCustomItiTrade] = useState('');

  const [isMidcLocation, setIsMidcLocation] = useState(false);
  const [midcZone, setMidcZone] = useState('');
  const [customMidcZone, setCustomMidcZone] = useState('');

  const [location, setLocation] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [autoResolveMsg, setAutoResolveMsg] = useState<string | null>(null);
  const lastResolvedUrl = useRef<string>('');

  const [experienceRequired, setExperienceRequired] = useState(true);
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');

  const [educationRequirement, setEducationRequirement] = useState<string>('10th Pass');
  const [customEducation, setCustomEducation] = useState<string>('');

  const [discloseSalary, setDiscloseSalary] = useState(true);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  const [workType, setWorkType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Apprenticeship'>('Full-time');
  const [workMode, setWorkMode] = useState<'On-site' | 'Remote' | 'Hybrid'>('On-site');

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

  const [genderPreference, setGenderPreference] = useState<string>('No Preference');
  const [minAgeInput, setMinAgeInput] = useState<string>('');
  const [maxAgeInput, setMaxAgeInput] = useState<string>('');

  const [hiringMethod, setHiringMethod] = useState<'STANDARD' | 'WALK_IN'>('STANDARD');
  const [walkInDate, setWalkInDate] = useState('');
  const [walkInStartTime, setWalkInStartTime] = useState('');
  const [walkInEndTime, setWalkInEndTime] = useState('');
  const [interviewAddress, setInterviewAddress] = useState('');
  const [walkInContactPerson, setWalkInContactPerson] = useState('');
  const [walkInContactNumber, setWalkInContactNumber] = useState('');

  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [maxApplicantsInput, setMaxApplicantsInput] = useState<string>('');

  const [description, setDescription] = useState('');
  const [showResponsibilities, setShowResponsibilities] = useState(false);
  const [responsibilities, setResponsibilities] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [skillsTags, setSkillsTags] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [resolvingMap, setResolvingMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);

  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  // Google Maps URL change handler matching Web App logic
  const handleGoogleMapsUrlChange = async (inputUrl: string) => {
    setGoogleMapsUrl(inputUrl);
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setLatitude(null);
      setLongitude(null);
      setAutoResolveMsg(null);
      return;
    }

    // 1. Synchronous Instant Extraction (<1ms)
    const directCoords = extractCoordinatesFromMapInput(trimmed);
    if (directCoords) {
      setLatitude(directCoords.latitude);
      setLongitude(directCoords.longitude);
      if (directCoords.formattedAddress) {
        setResolvedAddress(directCoords.formattedAddress);
      }
      setAutoResolveMsg(`Coordinates Resolved (${directCoords.latitude.toFixed(4)}, ${directCoords.longitude.toFixed(4)})`);
      return;
    }

    // 2. Asynchronous Short URL & Backend Geocoder Resolution
    setResolvingMap(true);
    setAutoResolveMsg('Resolving coordinates from map link...');

    try {
      const resolved = await resolveShortMapUrl(trimmed, location, midcZone);
      if (resolved) {
        setLatitude(resolved.latitude);
        setLongitude(resolved.longitude);
        if (resolved.formattedAddress) {
          setResolvedAddress(resolved.formattedAddress);
        }
        setAutoResolveMsg(`Coordinates Resolved (${resolved.latitude.toFixed(4)}, ${resolved.longitude.toFixed(4)})`);
      } else {
        const geoFallback = await geocodeQueryOnClient(trimmed);
        if (geoFallback) {
          setLatitude(geoFallback.latitude);
          setLongitude(geoFallback.longitude);
          if (geoFallback.formattedAddress) {
            setResolvedAddress(geoFallback.formattedAddress);
          }
          setAutoResolveMsg(`Coordinates Resolved (${geoFallback.latitude.toFixed(4)}, ${geoFallback.longitude.toFixed(4)})`);
        } else if (location && location.trim()) {
          const locGeo = await geocodeQueryOnClient(location);
          if (locGeo) {
            setLatitude(locGeo.latitude);
            setLongitude(locGeo.longitude);
            if (locGeo.formattedAddress) {
              setResolvedAddress(locGeo.formattedAddress);
            }
            setAutoResolveMsg(`Location Pinned (${locGeo.latitude.toFixed(4)}, ${locGeo.longitude.toFixed(4)})`);
          } else {
            setAutoResolveMsg('Map link captured');
          }
        } else {
          setAutoResolveMsg('Map link captured');
        }
      }
    } catch (err) {
      setAutoResolveMsg('Map link captured');
    } finally {
      setResolvingMap(false);
    }
  };

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (!googleMapsUrl.trim()) {
      const direct = extractCoordinatesFromMapInput(val);
      if (direct) {
        setLatitude(direct.latitude);
        setLongitude(direct.longitude);
        if (direct.formattedAddress) {
          setResolvedAddress(direct.formattedAddress);
        }
        setAutoResolveMsg(`Coordinates Resolved (${direct.latitude.toFixed(4)}, ${direct.longitude.toFixed(4)})`);
      }
    }
  };

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
    setEducationRequirement('10th Pass');
    setCustomEducation('');
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

  useFocusEffect(
    useCallback(() => {
      const targetJobId = route?.params?.jobId;
      if (targetJobId) {
        setLoading(true);
        jobsApi
          .getJobById(targetJobId)
          .then((res) => {
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
              const edu = j.education_requirement || j.educationRequirement || (typeof j.education === 'string' ? j.education : '') || '10th Pass';
              if (EDUCATION_REQUIREMENT_OPTIONS.includes(edu)) {
                setEducationRequirement(edu);
                setCustomEducation('');
              } else if (edu) {
                setEducationRequirement('Others');
                setCustomEducation(edu);
              } else {
                setEducationRequirement('10th Pass');
                setCustomEducation('');
              }
              setDiscloseSalary(j.discloseSalary !== false);
              setSalaryMin((j.salary_min ?? j.salaryMin ?? 15000).toString());
              setSalaryMax((j.salary_max ?? j.salaryMax ?? 25000).toString());
              setWorkType((j.job_type || j.jobType || 'Full-time') as any);
              setWorkMode((j.work_mode || j.workMode || 'On-site') as any);
              setShiftCategory(
                (j.shift_details || j.shiftDetails || '').includes('Night')
                  ? 'Night Shift'
                  : (j.shift_details || j.shiftDetails || '').includes('Rotational')
                  ? 'Rotational Shift'
                  : 'Day Shift'
              );
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
          })
          .catch(() => setLoading(false));
      }
    }, [route?.params?.jobId])
  );

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
    const targetUrl = (googleMapsUrl || location || midcZone || '').trim();
    if (!targetUrl) {
      Alert.alert('Location Required', 'Please enter a Google Maps URL or factory address first.');
      return;
    }
    await handleGoogleMapsUrlChange(targetUrl);
  };

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
    const parsedMinExp = experienceRequired ? parseInt(minExperience, 10) || 0 : 0;
    const parsedMaxExp = experienceRequired ? parseInt(maxExperience, 10) || 0 : 0;
    const parsedSalaryMin = discloseSalary ? parseInt(salaryMin, 10) || 0 : 0;
    const parsedSalaryMax = discloseSalary ? parseInt(salaryMax, 10) || 0 : 0;

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

    const respArray = showResponsibilities ? responsibilities.split('\n').map((r) => r.trim()).filter(Boolean) : [];
    const reqArray = showRequirements ? requirements.split('\n').map((r) => r.trim()).filter(Boolean) : [];
    const finalSkills = Array.from(new Set([...skillsTags, finalTitle, finalIndustry]));

    const workplaceType = workMode === 'Remote' ? 'REMOTE' : workMode === 'Hybrid' ? 'HYBRID' : 'ON_SITE';
    const employmentType =
      workType === 'Part-time'
        ? 'PART_TIME'
        : workType === 'Contract'
        ? 'CONTRACT'
        : workType === 'Apprenticeship'
        ? 'INTERNSHIP'
        : 'FULL_TIME';

    const finalEducation =
      educationRequirement === 'Others'
        ? customEducation.trim() || '10th Pass'
        : educationRequirement.trim() || '10th Pass';

    const jobPayload: any = {
      title: finalTitle,
      trade: finalIndustry,
      industry: finalIndustry,
      educationRequirement: finalEducation,
      education_requirement: finalEducation,
      education: finalEducation,
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
      employmentType,
      workMode,
      work_mode: workMode,
      workplaceType,
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
      const navigateToManageJobs = () => {
        try {
          if (typeof navigation.navigate === 'function') {
            navigation.navigate('EmployerMain', { screen: 'ManageJobsTab' });
            return;
          }
        } catch (e) {}

        try {
          if (typeof navigation.reset === 'function') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'EmployerMain', params: { screen: 'ManageJobsTab' } }],
            });
            return;
          }
        } catch (e) {}

        if (typeof navigation.goBack === 'function' && navigation.canGoBack?.()) {
          navigation.goBack();
        }
      };

      if (isEdit && editJobId) {
        const res = await jobsApi.updateJob(editJobId, jobPayload);
        setLoading(false);
        if (res.success) {
          isSubmittedRef.current = true;
          Alert.alert(
            'Job Listing Updated',
            `Your updated job posting for "${finalTitle}" has been submitted for admin approval. It will go live once approved by the JobMarket team.`,
            [
              {
                text: 'Manage Jobs',
                onPress: navigateToManageJobs,
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
            'Job Submitted for Admin Approval',
            `Your job post "${finalTitle}" has been sent for admin review and approval. It will go live once approved by the JobMarket admin team.`,
            [
              {
                text: 'Manage Jobs',
                onPress: navigateToManageJobs,
              },
            ]
          );
        } else {
          setError(res.message || 'Failed to create job posting');
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Network error while uploading job data');
    }
  };

  return {
    isEdit,
    companyLogo,
    handlePickLogo,
    industry,
    customIndustry,
    setCustomIndustry,
    title,
    customTitle,
    setCustomTitle,
    setTitle,
    currentRoleOptions,
    handleIndustryChange,
    openingsInput,
    setOpeningsInput,
    targetIti,
    setTargetIti,
    itiTrade,
    setItiTrade,
    customItiTrade,
    setCustomItiTrade,
    isMidcLocation,
    setIsMidcLocation,
    midcZone,
    setMidcZone,
    customMidcZone,
    setCustomMidcZone,
    location,
    setLocation: handleLocationChange,
    googleMapsUrl,
    setGoogleMapsUrl: handleGoogleMapsUrlChange,
    handleGoogleMapsUrlChange,
    handleLocationChange,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    resolvedAddress,
    setResolvedAddress,
    autoResolveMsg,
    handleResolveMapUrl,
    resolvingMap,
    experienceRequired,
    setExperienceRequired,
    minExperience,
    setMinExperience,
    maxExperience,
    setMaxExperience,
    educationRequirement,
    setEducationRequirement,
    customEducation,
    setCustomEducation,
    discloseSalary,
    setDiscloseSalary,
    salaryMin,
    setSalaryMin,
    salaryMax,
    setSalaryMax,
    workMode,
    setWorkMode,
    workType,
    setWorkType,
    shiftCategory,
    setShiftCategory,
    overtime,
    setOvertime,
    canteen,
    setCanteen,
    busFacility,
    setBusFacility,
    accommodation,
    setAccommodation,
    pf,
    setPf,
    esic,
    setEsic,
    uniform,
    setUniform,
    medicalInsurance,
    setMedicalInsurance,
    genderPreference,
    setGenderPreference,
    minAgeInput,
    setMinAgeInput,
    maxAgeInput,
    setMaxAgeInput,
    hiringMethod,
    setHiringMethod,
    walkInDate,
    setWalkInDate,
    walkInStartTime,
    setWalkInStartTime,
    walkInEndTime,
    setWalkInEndTime,
    interviewAddress,
    setInterviewAddress,
    walkInContactPerson,
    setWalkInContactPerson,
    walkInContactNumber,
    setWalkInContactNumber,
    applicationDeadline,
    setApplicationDeadline,
    maxApplicantsInput,
    setMaxApplicantsInput,
    description,
    setDescription,
    showResponsibilities,
    setShowResponsibilities,
    responsibilities,
    setResponsibilities,
    showRequirements,
    setShowRequirements,
    requirements,
    setRequirements,
    skillsTags,
    customSkillInput,
    setCustomSkillInput,
    handleAddCustomSkill,
    handleToggleSkill,
    availableSkills,
    currentStep,
    setCurrentStep,
    loading,
    error,
    setError,
    handleSubmitJob,
    isSubmittedRef,
  };
};
