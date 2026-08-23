import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ArrowLeft, 
  Check, 
  Camera, 
  Plus, 
  Trash2, 
  UploadCloud, 
  FileText, 
  ChevronDown,
  Building2,
  Calendar,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

interface CandidateEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TRADES_LIST = [
  'Tool & Die Maker',
  'Welder',
  'Fitter',
  'Electrician',
  'Turner',
  'Machinist',
  'VMC Operator',
  'CNC Operator',
  'Quality Inspector',
  'Maintenance Technician',
  'Assembly Line Worker',
  'Other'
];

const SHIFT_OPTIONS = [
  'Day Shift (8 AM - 5 PM)',
  'Night Shift (8 PM - 5 AM)',
  'Rotational Shift (Shift A / B)'
];

export const CandidateEditProfileModal: React.FC<CandidateEditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, updateUser } = useAuth();
  const { showToast } = useToast();

  // Stepper state: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1: Basic Details
  const [name, setName] = useState(currentUser?.name || '');
  const [headline, setHeadline] = useState(currentUser?.headline || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    currentUser?.profilePictureUrl || (currentUser as any)?.avatar || ''
  );

  // STEP 2: Education & Specialization
  const initialTrade = currentUser?.tradeSpecialization || 'Tool & Die Maker';
  const initialIsCustom = !TRADES_LIST.includes(initialTrade);
  const [tradeSpecialization, setTradeSpecialization] = useState(initialIsCustom ? 'Other' : initialTrade);
  const [customTrade, setCustomTrade] = useState(initialIsCustom ? initialTrade : '');
  const [educationList, setEducationList] = useState<any[]>(
    Array.isArray(currentUser?.education) ? currentUser.education : []
  );

  // STEP 3: Experience & Shift Preferences
  const [experienceList, setExperienceList] = useState<any[]>(
    Array.isArray(currentUser?.experience) ? currentUser.experience : []
  );
  const [preferredShift, setPreferredShift] = useState(currentUser?.preferredShift || 'Rotational Shift (Shift A / B)');
  const [requiresBus, setRequiresBus] = useState(!!currentUser?.requiresBus);
  const [requiresAccommodation, setRequiresAccommodation] = useState(!!currentUser?.requiresAccommodation);

  // STEP 4: Skills & Resume
  const [skillsList, setSkillsList] = useState<string[]>(
    Array.isArray(currentUser?.skills) && currentUser.skills.length > 0
      ? currentUser.skills
      : ['Welding', 'Machining', 'Fanuc Control', 'Vernier Caliper']
  );
  const [skillInput, setSkillInput] = useState('');
  const [resumeUrl, setResumeUrl] = useState(currentUser?.resumeUrl || '');
  const [resumeName, setResumeName] = useState(currentUser?.resumeName || 'Candidate_Resume.pdf');
  const [isResumePublic, setIsResumePublic] = useState(currentUser?.isResumePublic !== false);

  // Modal Sub-States for Adding Education / Experience
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduYear, setEduYear] = useState('');

  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Intercept Mobile/Laptop Browser Back Button & Unsaved Tab Close when Modal is Open
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ candidateProfileExitGuard: true }, '');

    const handlePopState = () => {
      window.history.pushState({ candidateProfileExitGuard: true }, '');
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
  }, [isOpen]);

  const handleConfirmExit = () => {
    setShowExitConfirmModal(false);
    onClose();
  };

  // Reset or Sync State when Modal Opens
  useEffect(() => {
    setName(currentUser.name || '');
    setHeadline(currentUser.headline || '');
    setLocation(currentUser.location || '');
    setPhone(currentUser.phone || '');
    setBio(currentUser.bio || '');
    setProfilePhotoUrl(currentUser.profilePictureUrl || (currentUser as any).avatar || '');
    
    const currTrade = currentUser.tradeSpecialization || 'Tool & Die Maker';
    if (!TRADES_LIST.includes(currTrade)) {
      setTradeSpecialization('Other');
      setCustomTrade(currTrade);
    } else {
      setTradeSpecialization(currTrade);
      setCustomTrade('');
    }

    setEducationList(Array.isArray(currentUser.education) ? currentUser.education : []);
    setExperienceList(Array.isArray(currentUser.experience) ? currentUser.experience : []);
    setPreferredShift(currentUser.preferredShift || 'Rotational Shift (Shift A / B)');
    setRequiresBus(!!currentUser.requiresBus);
    setRequiresAccommodation(!!currentUser.requiresAccommodation);
    
    if (Array.isArray(currentUser.skills) && currentUser.skills.length > 0) {
      setSkillsList(currentUser.skills);
    } else {
      setSkillsList(['Welding', 'Machining', 'Fanuc Control', 'Vernier Caliper']);
    }

    setResumeUrl(currentUser.resumeUrl || '');
    setResumeName(currentUser.resumeName || 'Candidate_Resume.pdf');
    setIsResumePublic(currentUser.isResumePublic !== false);
    setCurrentStep(1);
  }, [isOpen, currentUser]);

  // Image Avatar File Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Profile picture size should be less than 5MB.', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setProfilePhotoUrl(base64);
      try {
        await updateUser({ profilePictureUrl: base64 });
        showToast('Profile photo updated!', 'success');
      } catch (err) {
        showToast('Failed to save profile photo.', 'error');
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // PDF Resume Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please upload a valid PDF document.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('PDF file size should be less than 10MB.', 'error');
      return;
    }

    setIsUploadingPdf(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Pdf = reader.result as string;
      setResumeUrl(base64Pdf);
      setResumeName(file.name);
      try {
        await updateUser({ resumeUrl: base64Pdf, resumeName: file.name, isResumePublic });
        showToast('Resume attached successfully!', 'success');
      } catch (err) {
        showToast('Failed to attach resume.', 'error');
      } finally {
        setIsUploadingPdf(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Skill Handler
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skillsList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Skill already added', 'info');
      return;
    }
    setSkillsList([...skillsList, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  // Education Handlers
  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduDegree.trim()) {
      showToast('Qualification / Degree title is required', 'error');
      return;
    }
    const newEdu = {
      degree: eduDegree.trim(),
      institution: eduInstitution.trim() || 'Govt ITI College',
      year: eduYear.trim() || '2022'
    };
    setEducationList([...educationList, newEdu]);
    setEduDegree('');
    setEduInstitution('');
    setEduYear('');
    setShowAddEduModal(false);
    showToast('Education entry added', 'success');
  };

  const handleDeleteEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  // Experience Handlers
  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expCompany.trim()) {
      showToast('Job Title and Company Name are required', 'error');
      return;
    }
    const newExp = {
      title: expTitle.trim(),
      company: expCompany.trim(),
      duration: expDuration.trim() || '2022-2025',
      description: expDesc.trim()
    };
    setExperienceList([...experienceList, newExp]);
    setExpTitle('');
    setExpCompany('');
    setExpDuration('');
    setExpDesc('');
    setShowAddExpModal(false);
    showToast('Experience entry added', 'success');
  };

  const handleDeleteExperience = (index: number) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        showToast('Candidate name is required', 'error');
        return;
      }
      if (!location.trim()) {
        showToast('Current City / MIDC location is required', 'error');
        return;
      }
      if (!phone.trim() || phone.length !== 10) {
        showToast('Valid 10-digit phone number is required', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const finalTrade = tradeSpecialization === 'Other' ? customTrade.trim() : tradeSpecialization;
      if (!finalTrade) {
        showToast('Please select or specify your trade specialization', 'error');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!preferredShift) {
        showToast('Please select your preferred shift', 'error');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  // Final Save Handler
  const handleFinalSave = async () => {
    const finalTrade = tradeSpecialization === 'Other' ? customTrade.trim() : tradeSpecialization;
    
    setIsSaving(true);
    try {
      const res = await updateUser({
        name: name.trim(),
        headline: headline.trim(),
        location: location.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        tradeSpecialization: finalTrade,
        trade_specialization: finalTrade,
        education: educationList,
        experience: experienceList,
        preferredShift,
        preferred_shift: preferredShift,
        requiresBus,
        requires_bus: requiresBus,
        requiresAccommodation,
        requires_accommodation: requiresAccommodation,
        skills: skillsList,
        resumeUrl,
        resumeName,
        isResumePublic
      });

      if (res.success) {
        showToast('Profile updated successfully!', 'success');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred while saving', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  return createPortal(
    <div
      className="edit-profile-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="edit-profile-modal-container"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '0px',
          border: '1px solid #CBD5E1',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden'
        }}
      >
        
        {/* Modal Top Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FFFFFF'
        }}>
          <button
            type="button"
            onClick={() => setShowExitConfirmModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0F172A',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
              Edit Profile
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Update worker details & preferences
            </p>
          </div>
        </div>

        {/* 4-Step Stepper Header */}
        <div style={{
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '14px 16px 12px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            
            {/* Step 1 */}
            <div 
              onClick={() => setCurrentStep(1)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 1 ? '#FFFFFF' : currentStep > 1 ? '#2563EB' : '#F1F5F9',
                border: currentStep === 1 ? '2px solid #2563EB' : currentStep > 1 ? 'none' : '1px solid #CBD5E1',
                color: currentStep === 1 ? '#2563EB' : currentStep > 1 ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                transition: 'all 0.2s ease'
              }}>
                {currentStep > 1 ? <Check size={16} strokeWidth={3} /> : '1'}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: currentStep === 1 ? '800' : '600',
                color: currentStep === 1 ? '#0F172A' : '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Basic Details
              </span>
            </div>

            {/* Line 1-2 */}
            <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > 1 ? '#2563EB' : '#E2E8F0', margin: '0 4px', marginTop: '-18px' }} />

            {/* Step 2 */}
            <div 
              onClick={() => currentStep > 1 && setCurrentStep(2)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: currentStep > 1 ? 'pointer' : 'default' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 2 ? '#FFFFFF' : currentStep > 2 ? '#2563EB' : '#F1F5F9',
                border: currentStep === 2 ? '2px solid #2563EB' : currentStep > 2 ? 'none' : '1px solid #CBD5E1',
                color: currentStep === 2 ? '#2563EB' : currentStep > 2 ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                transition: 'all 0.2s ease'
              }}>
                {currentStep > 2 ? <Check size={16} strokeWidth={3} /> : '2'}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: currentStep === 2 ? '800' : '600',
                color: currentStep === 2 ? '#0F172A' : '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Education
              </span>
            </div>

            {/* Line 2-3 */}
            <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > 2 ? '#2563EB' : '#E2E8F0', margin: '0 4px', marginTop: '-18px' }} />

            {/* Step 3 */}
            <div 
              onClick={() => currentStep > 2 && setCurrentStep(3)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: currentStep > 2 ? 'pointer' : 'default' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 3 ? '#FFFFFF' : currentStep > 3 ? '#2563EB' : '#F1F5F9',
                border: currentStep === 3 ? '2px solid #2563EB' : currentStep > 3 ? 'none' : '1px solid #CBD5E1',
                color: currentStep === 3 ? '#2563EB' : currentStep > 3 ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                transition: 'all 0.2s ease'
              }}>
                {currentStep > 3 ? <Check size={16} strokeWidth={3} /> : '3'}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: currentStep === 3 ? '800' : '600',
                color: currentStep === 3 ? '#0F172A' : '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Experience
              </span>
            </div>

            {/* Line 3-4 */}
            <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > 3 ? '#2563EB' : '#E2E8F0', margin: '0 4px', marginTop: '-18px' }} />

            {/* Step 4 */}
            <div 
              onClick={() => currentStep > 3 && setCurrentStep(4)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: currentStep > 3 ? 'pointer' : 'default' }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 4 ? '#FFFFFF' : '#F1F5F9',
                border: currentStep === 4 ? '2px solid #2563EB' : '1px solid #CBD5E1',
                color: currentStep === 4 ? '#2563EB' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                transition: 'all 0.2s ease'
              }}>
                4
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: currentStep === 4 ? '800' : '600',
                color: currentStep === 4 ? '#0F172A' : '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                Skills & Re...
              </span>
            </div>

          </div>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#F8FAFC' }}>

          {/* STEP 1: BASIC DETAILS */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Avatar Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '4px 0 10px 0' }}>
                <div style={{ position: 'relative', width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #3B82F6', background: '#E2E8F0' }}>
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DBEAFE', color: '#1D4ED8', fontWeight: '800', fontSize: '28px' }}>
                      {(name || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <label 
                    htmlFor="candidate-avatar-input"
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Camera size={14} />
                    <input
                      id="candidate-avatar-input"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', marginTop: '8px' }}>
                  {isUploadingPhoto ? 'Uploading photo...' : 'Tap photo to update avatar'}
                </span>
              </div>

              {/* Personal Information Card */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '0px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Personal Information
                </h3>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Candidate Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter full name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '0px',
                      fontSize: '13.5px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Junior developer / VMC Operator"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '0px',
                      fontSize: '13.5px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Current City / MIDC Location <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g. Mumbai / Chakan MIDC"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '0px',
                      fontSize: '13.5px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Mobile Phone Number <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhone(val);
                    }}
                    required
                    placeholder="10-digit mobile number"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '0px',
                      fontSize: '13.5px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Bio / Career Summary
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief summary of your factory experience and trade expertise..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '0px',
                      fontSize: '13.5px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      resize: 'vertical'
                    }}
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '0px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Education & Specialization
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    Specify ITI trade specialization & qualifications
                  </p>
                </div>

                {/* Trade Specialization Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Trade Specialization <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={tradeSpecialization}
                    onChange={(e) => setTradeSpecialization(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '0px',
                      fontSize: '13.5px',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {TRADES_LIST.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {tradeSpecialization === 'Other' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Specify Specialty Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={customTrade}
                      onChange={(e) => setCustomTrade(e.target.value)}
                      placeholder="e.g. Hydraulic Press Operator"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}

                <div style={{ height: 1, backgroundColor: '#E2E8F0', margin: '4px 0' }} />

                {/* Education & Certificates Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    Education & ITI Certificates
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddEduModal(true)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      borderRadius: '0px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Entry</span>
                  </button>
                </div>

                {/* Education Cards List */}
                {educationList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {educationList.map((edu, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '0px'
                        }}
                      >
                        <div>
                          <h5 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                            {edu.degree || edu.qualification || 'ITI Trade Certificate'}
                          </h5>
                          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                            {edu.institution || 'Govt College'} • Passing Year: {edu.year || edu.passingYear || '2022'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#DC2626',
                            padding: '4px'
                          }}
                          title="Delete Education Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', textOverflow: 'ellipsis', textAlign: 'center', background: '#F8FAFC', border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '12.5px' }}>
                    No ITI or academic trade certificates added yet. Click "+ Add Entry" to add qualification.
                  </div>
                )}

              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE & SHIFT */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '0px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Work Experience & Shift
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    Enter past factory experience & work shift preferences
                  </p>
                </div>

                {/* Experience History Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    Work Experience History
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddExpModal(true)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      borderRadius: '0px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Entry</span>
                  </button>
                </div>

                {/* Experience Cards List */}
                {experienceList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {experienceList.map((exp, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '0px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', marginTop: '5px', flexShrink: 0 }} />
                          <div>
                            <h5 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                              {exp.title || 'Welder'}
                            </h5>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#475569', fontWeight: '600' }}>
                              {exp.company || 'Tata Motors'}
                            </p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                              {exp.duration || '2022-2025'}
                            </p>
                            {exp.description && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#DC2626',
                            padding: '4px'
                          }}
                          title="Delete Experience Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', background: '#F8FAFC', border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '12.5px' }}>
                    No work experience history added yet. Click "+ Add Entry" to add past factory experience.
                  </div>
                )}

                <div style={{ height: 1, backgroundColor: '#E2E8F0', margin: '4px 0' }} />

                {/* Shift & Facility Preferences */}
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  Shift & Facility Preferences
                </h4>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Preferred Shift <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={preferredShift}
                    onChange={(e) => setPreferredShift(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '0px',
                      fontSize: '13.5px',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {SHIFT_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Bus Transport Switch Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                      Requires Bus Transport
                    </h5>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748B' }}>
                      Company bus pickup/drop facility needed
                    </p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={requiresBus}
                      onChange={(e) => setRequiresBus(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: requiresBus ? '#2563EB' : '#CBD5E1',
                      borderRadius: '20px',
                      transition: '0.2s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: requiresBus ? '21px' : '2px',
                        bottom: '2px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '50%',
                        transition: '0.2s'
                      }} />
                    </span>
                  </label>
                </div>

                {/* Hostel Accommodation Switch Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                      Requires Hostel Stay
                    </h5>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748B' }}>
                      Accommodation / Hostel room facility needed
                    </p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={requiresAccommodation}
                      onChange={(e) => setRequiresAccommodation(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: requiresAccommodation ? '#2563EB' : '#CBD5E1',
                      borderRadius: '20px',
                      transition: '0.2s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: requiresAccommodation ? '21px' : '2px',
                        bottom: '2px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '50%',
                        transition: '0.2s'
                      }} />
                    </span>
                  </label>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: SKILLS & RESUME */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '0px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Skills & Resume
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    Add key technical skills & attach resume bio-data
                  </p>
                </div>

                {/* Key Technical Skills Input & Chips */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Key Technical Skills
                  </label>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="e.g. Vernier Caliper, Fanuc Control..."
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={16} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Chips Tag Display Area */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1D4ED8',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          borderRadius: '0px'
                        }}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#1D4ED8',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '800',
                            padding: 0,
                            marginLeft: '2px',
                            lineHeight: 1
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, backgroundColor: '#E2E8F0', margin: '4px 0' }} />

                {/* Attach Resume PDF Document Section */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                    Attach Resume PDF Document
                  </label>

                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    style={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: '0px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px'
                    }}>
                      <UploadCloud size={24} />
                    </div>

                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                      {isUploadingPdf ? 'Uploading PDF Document...' : 'Tap to Upload PDF Resume'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                      Supports PDF documents up to 10MB
                    </p>

                    <input
                      type="file"
                      ref={pdfInputRef}
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {resumeUrl && (
                    <div style={{ marginTop: '10px', padding: '10px 12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="#166534" />
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#166534' }}>
                          {resumeName}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 8px' }}>
                        Attached ✓
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Fixed Action Bar */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '14px',
                fontWeight: '700',
                borderRadius: '0px',
                cursor: 'pointer',
                textAlign: 'center'
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
                padding: '11px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '14px',
                fontWeight: '700',
                borderRadius: '0px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Back
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              style={{
                flex: 1,
                padding: '11px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '700',
                borderRadius: '0px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSave}
              disabled={isSaving}
              style={{
                flex: 1,
                padding: '11px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '700',
                borderRadius: '0px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          )}
        </div>

      </div>

      {/* SUB-MODAL: Add Education Entry */}
      {showAddEduModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1200,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            width: '100%',
            maxWidth: '460px',
            borderRadius: '0px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add Education & ITI Certificate</h3>
              <button onClick={() => setShowAddEduModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={handleSaveEducation} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Degree / Qualification *</label>
                <input type="text" required value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} placeholder="e.g. ITI Welder / Fitter / Diploma" style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '0px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>College / Govt Institute Name</label>
                <input type="text" value={eduInstitution} onChange={(e) => setEduInstitution(e.target.value)} placeholder="e.g. Govt ITI College, Chakan" style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '0px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Passing Year</label>
                <input type="text" value={eduYear} onChange={(e) => setEduYear(e.target.value)} placeholder="e.g. 2022" style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '0px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowAddEduModal(false)} style={{ padding: '8px 14px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '13px', fontWeight: '700' }}>Add Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Add Experience Entry */}
      {showAddExpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1200,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            width: '100%',
            maxWidth: '460px',
            borderRadius: '0px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add Factory Work Experience</h3>
              <button onClick={() => setShowAddExpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={handleSaveExperience} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Job Role / Title *</label>
                <input type="text" required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Welder / CNC Operator" style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '0px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Company Name *</label>
                <input type="text" required value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="e.g. Tata Motors Ltd" style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '0px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Duration / Years</label>
                <input type="text" value={expDuration} onChange={(e) => setExpDuration(e.target.value)} placeholder="e.g. 2022 - 2025" style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '0px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Role Description</label>
                <textarea rows={2} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="e.g. Operated MIG welding machine and part assembly..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '0px', fontSize: '13px', outline: 'none', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowAddExpModal(false)} style={{ padding: '8px 14px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '13px', fontWeight: '700' }}>Add Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Discard Profile Changes?
            </h3>

            <p style={{ margin: '0 0 24px 0', fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', fontWeight: '500' }}>
              You have unsaved changes in your candidate profile. Are you sure you want to exit? All progress entered so far will be lost.
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

    </div>,
    document.body
  );
};
