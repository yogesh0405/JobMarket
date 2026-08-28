import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { getInitials, formatDate, capitalize, shareContent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { CandidateEditProfileModal } from './CandidateEditProfileModal';
import { EditCompanyProfileModal } from '../company/EditCompanyProfileModal';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { calculateCandidateProfileCompletion } from '../../utils/profileCompleteness';
import { 
  Camera, 
  Mail, 
  Edit3, 
  CheckCircle, 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Briefcase, 
  PlusCircle, 
  Share2, 
  FileText, 
  Users,
  BarChart3,
  Eye,
  Lock,
  Loader2,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Resume } from '../../types';

const TRADES_LIST = ['Fitter', 'Welder', 'CNC Operator', 'Electrician', 'Machinist', 'Helper', 'Quality Inspector'];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, deleteResume, syncUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const { getJobsByEmployer } = useJobs();
  const t = useTranslation(state.language);

  const handleShare = () => {
    if (!currentUser) return;
    const profileId = currentUser.id;
    const shareUrl = `${window.location.origin}/profile/${profileId}`;
    shareContent(
      currentUser.name || 'User Profile',
      `Check out my profile on JobMarket`,
      shareUrl,
      () => showToast('Public profile link copied to clipboard! Anyone on any device can open this link to view your profile. 📋', 'success')
    );
  };

  // Modals & Uploading States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Skill Modal & States
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Experience & Education Modal States
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduYear, setEduYear] = useState('');

  // About Modal States
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempHeadline, setTempHeadline] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempPhone, setTempPhone] = useState('');

  // Preferences Modal States
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [tempTrade, setTempTrade] = useState('');
  const [customTrade, setCustomTrade] = useState('');
  const [tempShift, setTempShift] = useState('');
  const [tempBus, setTempBus] = useState(false);
  const [tempAccommodation, setTempAccommodation] = useState(false);

  // Profile Form Edit Fields
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [tradeSpecialization, setTradeSpecialization] = useState('');
  const [preferredShift, setPreferredShift] = useState('');
  const [requiresBus, setRequiresBus] = useState(false);
  const [requiresAccommodation, setRequiresAccommodation] = useState(false);
  const [customTradeEdit, setCustomTradeEdit] = useState('');
  const [activeEditPart, setActiveEditPart] = useState<1 | 2 | 3>(1);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const convertToWebP = (file: File, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const webpBase64 = canvas.toDataURL('image/webp', quality);
          resolve(webpBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const webpBase64 = await convertToWebP(file);
      const response = await apiFetch('/api/v1/auth/profile/picture', {
        method: 'POST',
        body: JSON.stringify({ image: webpBase64 })
      });

      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to upload profile photo', 'error');
        return;
      }

      await syncUser();
      showToast('Profile photo updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!isPdf && !isImage) {
      showToast('Please select a valid PDF document or image file (.pdf, .png, .jpg, .jpeg, .webp)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10 MB', 'error');
      return;
    }

    setIsUploadingResume(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target?.result as string;
        const sizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;
        const result = await updateUser({
          resume: {
            name: file.name,
            size: sizeFormatted,
            url: base64,
            type: file.type || (isPdf ? 'application/pdf' : 'image/jpeg')
          }
        } as any);

        if (result.success) {
          showToast('Resume uploaded successfully! 📄', 'success');
          setResumeModalOpen(false);
        } else {
          showToast(result.error || 'Failed to upload resume', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Failed to upload resume document', 'error');
    } finally {
      setIsUploadingResume(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    setIsUploading(true);
    try {
      const response = await apiFetch('/api/v1/auth/profile/picture', {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to remove profile photo', 'error');
        return;
      }

      await syncUser();
      showToast('Profile photo removed successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete your uploaded resume? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const result = await deleteResume();
        if (result.success) {
          showToast('Resume deleted successfully', 'success');
        } else {
          showToast(result.error || 'Failed to delete resume', 'error');
        }
      } catch (error) {
        showToast('Failed to delete resume', 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    const currentSkills = currentUser.skills || [];
    if (currentSkills.includes(trimmed)) {
      showToast('Skill already added', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updatedSkills = [...currentSkills, trimmed];
      const result = await updateUser({ skills: updatedSkills });
      if (result.success) {
        showToast('Skill added successfully', 'success');
        setNewSkill('');
      } else {
        showToast(result.error || 'Failed to add skill', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (skillToDelete: string) => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const currentSkills = currentUser.skills || [];
      const updatedSkills = currentSkills.filter(s => s !== skillToDelete);
      const result = await updateUser({ skills: updatedSkills });
      if (result.success) {
        showToast('Skill removed successfully', 'success');
      } else {
        showToast(result.error || 'Failed to remove skill', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!expTitle || !expCompany || !expDuration) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let currentExp: any[] = currentUser.experience || [];
      if (typeof currentExp === 'string') {
        try { currentExp = JSON.parse(currentExp); } catch (_) { currentExp = []; }
      }
      if (!Array.isArray(currentExp)) currentExp = [];

      const newExpItem = {
        title: expTitle,
        company: expCompany,
        duration: expDuration,
        description: expDesc
      };
      const updatedExp = [...currentExp, newExpItem];
      
      const result = await updateUser({ experience: updatedExp } as any);
      if (result.success) {
        showToast('Experience added successfully', 'success');
        setExpTitle('');
        setExpCompany('');
        setExpDuration('');
        setExpDesc('');
      } else {
        showToast(result.error || 'Failed to add experience', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'An error occurred while saving experience', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async (indexToDelete: number) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this experience item?')) return;
    
    setIsSaving(true);
    try {
      let currentExp: any[] = currentUser.experience || [];
      if (typeof currentExp === 'string') {
        try { currentExp = JSON.parse(currentExp); } catch (_) { currentExp = []; }
      }
      if (!Array.isArray(currentExp)) currentExp = [];

      const updatedExp = currentExp.filter((_, i) => i !== indexToDelete);
      
      const result = await updateUser({ experience: updatedExp } as any);
      if (result.success) {
        showToast('Experience deleted successfully', 'success');
      } else {
        showToast(result.error || 'Failed to delete experience', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'An error occurred while deleting experience', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!eduDegree || !eduInstitution || !eduYear) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let currentEdu: any[] = currentUser.education || [];
      if (typeof currentEdu === 'string') {
        try { currentEdu = JSON.parse(currentEdu); } catch (_) { currentEdu = []; }
      }
      if (!Array.isArray(currentEdu)) currentEdu = [];

      const newEduItem = {
        degree: eduDegree,
        institution: eduInstitution,
        year: eduYear
      };
      const updatedEdu = [...currentEdu, newEduItem];
      
      const result = await updateUser({ education: updatedEdu } as any);
      if (result.success) {
        showToast('Education added successfully', 'success');
        setEduDegree('');
        setEduInstitution('');
        setEduYear('');
      } else {
        showToast(result.error || 'Failed to add education', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'An error occurred while saving education', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (indexToDelete: number) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this education item?')) return;
    
    setIsSaving(true);
    try {
      let currentEdu: any[] = currentUser.education || [];
      if (typeof currentEdu === 'string') {
        try { currentEdu = JSON.parse(currentEdu); } catch (_) { currentEdu = []; }
      }
      if (!Array.isArray(currentEdu)) currentEdu = [];

      const updatedEdu = currentEdu.filter((_, i) => i !== indexToDelete);
      
      const result = await updateUser({ education: updatedEdu } as any);
      if (result.success) {
        showToast('Education deleted successfully', 'success');
      } else {
        showToast(result.error || 'Failed to delete education', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'An error occurred while deleting education', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openAboutModal = () => {
    if (!currentUser) return;
    setTempName(currentUser.name);
    setTempHeadline(currentUser.headline || '');
    setTempLocation(currentUser.location || '');
    setTempPhone(currentUser.phone || '');
    setAboutModalOpen(true);
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!tempName.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (tempPhone && tempPhone.length !== 10) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateUser({
        name: tempName,
        headline: tempHeadline,
        location: tempLocation,
        phone: tempPhone
      });
      if (result.success) {
        showToast('About details saved successfully', 'success');
        setAboutModalOpen(false);
      } else {
        showToast(result.error || 'Failed to save details', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openPrefModal = () => {
    if (!currentUser) return;
    const currentSpecialty = currentUser.tradeSpecialization || '';
    if (currentSpecialty && !TRADES_LIST.includes(currentSpecialty)) {
      setTempTrade('Other');
      setCustomTrade(currentSpecialty);
    } else {
      setTempTrade(currentSpecialty);
      setCustomTrade('');
    }
    setTempShift(currentUser.preferredShift || '');
    setTempBus(!!currentUser.requiresBus);
    setTempAccommodation(!!currentUser.requiresAccommodation);
    setPrefModalOpen(true);
  };

  const handleSavePref = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const finalTrade = tempTrade === 'Other' ? customTrade.trim() : tempTrade;
    if (tempTrade === 'Other' && !finalTrade) {
      showToast('Please specify your specialty', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUser({
        tradeSpecialization: finalTrade,
        preferredShift: tempShift,
        requiresBus: tempBus,
        requiresAccommodation: tempAccommodation
      });
      if (result.success) {
        showToast('Job preferences saved successfully', 'success');
        setPrefModalOpen(false);
      } else {
        showToast(result.error || 'Failed to save preferences', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3>Please Log In</h3>
          <p>Log in to view and manage your profile.</p>
          <Link to="/login" className="btn btn-primary mt-4">Login</Link>
        </div>
      </div>
    );
  }

  const openEditModal = () => {
    setName(currentUser.name || '');
    setCompanyName(currentUser.companyName || '');
    setGstNumber(currentUser.gstNumber || '');
    setHeadline(currentUser.headline || '');
    setLocation(currentUser.location || '');
    setPhone(currentUser.phone || '');
    setSkills((currentUser.skills || []).join(', '));
    
    const currentSpecialty = currentUser.tradeSpecialization || '';
    if (currentSpecialty && !TRADES_LIST.includes(currentSpecialty)) {
      setTradeSpecialization('Other');
      setCustomTradeEdit(currentSpecialty);
    } else {
      setTradeSpecialization(currentSpecialty);
      setCustomTradeEdit('');
    }

    setPreferredShift(currentUser.preferredShift || '');
    setRequiresBus(!!currentUser.requiresBus);
    setRequiresAccommodation(!!currentUser.requiresAccommodation);
    setActiveEditPart(1);
    setEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (currentUser.role === 'employer' && !companyName.trim()) {
      showToast('Company name is required', 'error');
      return;
    }
    if (phone && phone.length !== 10) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }

    const finalTrade = tradeSpecialization === 'Other' ? customTradeEdit.trim() : tradeSpecialization;
    if (currentUser.role === 'candidate' && tradeSpecialization === 'Other' && !finalTrade) {
      showToast('Please specify your specialty', 'error');
      return;
    }

    const updatedSkills = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const result = await updateUser({
        name,
        companyName,
        gstNumber,
        headline,
        location,
        phone,
        skills: updatedSkills,
        tradeSpecialization: finalTrade,
        preferredShift,
        requiresBus,
        requiresAccommodation
      });

      if (result.success) {
        showToast('Profile updated successfully', 'success');
        setEditModalOpen(false);
      } else {
        showToast(result.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  let experienceList: any[] = currentUser.experience || [];
  if (typeof experienceList === 'string') {
    try { experienceList = JSON.parse(experienceList); } catch (_) { experienceList = []; }
  }
  if (!Array.isArray(experienceList)) experienceList = [];

  let educationList: any[] = currentUser.education || [];
  if (typeof educationList === 'string') {
    try { educationList = JSON.parse(educationList); } catch (_) { educationList = []; }
  }
  if (!Array.isArray(educationList)) educationList = [];

  let skillsList: string[] = currentUser.skills || [];
  if (typeof skillsList === 'string') {
    try { skillsList = JSON.parse(skillsList); } catch (_) { skillsList = []; }
  }
  if (!Array.isArray(skillsList)) skillsList = [];

  const candidateForCompleteness = {
    ...currentUser,
    experience: experienceList,
    skills: skillsList,
    education: educationList,
    resume_url: currentUser.resume?.url || currentUser.resumeUrl || currentUser.resume_url,
    avatar_url: currentUser.profilePictureUrl || currentUser.avatarUrl || currentUser.avatar_url || currentUser.avatar,
  };
  const completionPercentage = calculateCandidateProfileCompletion(candidateForCompleteness).totalScore;

  if (currentUser.role === 'employer') {
    const myJobs = getJobsByEmployer(currentUser.id) || [];
    const activeJobs = myJobs.filter((j: any) => !j.status || j.status.toLowerCase() === 'active' || j.status.toLowerCase() === 'approved');
    const totalApplicants = myJobs.reduce((sum: number, j: any) => sum + (j.applicants?.length || 0), 0);
    const totalViews = myJobs.reduce((sum: number, j: any) => sum + (j.views || j.viewsCount || 0), 0);

    return (
      <div className="profile-page">
        <div className="container">
          {/* Company Hero Card */}
          <div className="company-hero-card">
            {/* Top-Right Circular Share Icon */}
            <button
              onClick={handleShare}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                padding: 0
              }}
              title="Share Profile"
            >
              <Share2 size={16} />
            </button>

            <div className="company-hero-flex">
              <div className="company-hero-info">
                {/* Company Logo Avatar with Edit Badge */}
                <div 
                  className="company-logo-wrap"
                  onClick={openEditModal}
                  title="Click to edit company profile"
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {currentUser.profilePictureUrl && typeof currentUser.profilePictureUrl === 'string' ? (
                      <img 
                        src={currentUser.profilePictureUrl} 
                        alt={typeof (currentUser.companyName || currentUser.name) === 'string' ? (currentUser.companyName || currentUser.name) : 'Company Logo'} 
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <CompanyDefaultLogo logoUrl={null} companyName={currentUser.companyName || currentUser.name} size={54} />
                    )}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #2563EB',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    zIndex: 10
                  }}>
                    <Edit3 size={13} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Company Name & Details */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                      {currentUser.companyName || currentUser.name}
                    </h1>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#DBEAFE', marginTop: '6px', flexWrap: 'wrap' }}>
                    {currentUser.industry && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={14} color="#DBEAFE" />
                        <span>{currentUser.industry}</span>
                      </div>
                    )}
                    {(currentUser.location || currentUser.midcZone) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={14} color="#DBEAFE" />
                        <span>{currentUser.midcZone || currentUser.location}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={14} color="#DBEAFE" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          {/* Quick Metrics Cards */}
          <div className="company-metrics-grid">
            <div style={{ textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
              <div className="metric-val" style={{ fontSize: '16px', fontWeight: '800', color: '#2563EB' }}>
                {currentUser.gstNumber ? 'Verified GST' : 'Registered'}
              </div>
              <div className="metric-lbl" style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', marginTop: '2px' }}>
                GST Verification
              </div>
            </div>

            <div style={{ textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
              <div className="metric-val" style={{ fontSize: '16px', fontWeight: '800', color: '#2563EB' }}>
                {currentUser.midcZone ? 'MIDC Zone' : (currentUser.location || 'Maharashtra')}
              </div>
              <div className="metric-lbl" style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', marginTop: '2px' }}>
                Industrial Region
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div className="metric-val" style={{ fontSize: '16px', fontWeight: '800', color: '#2563EB' }}>
                Verified
              </div>
              <div className="metric-lbl" style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', marginTop: '2px' }}>
                Account Status
              </div>
            </div>
          </div>

          {/* SECTION 1: COMPANY OVERVIEW & CORE DETAILS */}
          <div className="profile-section">
            <div className="profile-section-header">
              <div className="profile-section-title-wrap">
                <div className="icon-box-head icon-box-blue">
                  <Building2 size={20} />
                </div>
                <h2>Company Profile Details</h2>
              </div>
            </div>

            <div className="profile-section-body">
              <div className="profile-details-grid">
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Official Company Name</span>
                  <p className="profile-detail-value" style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                    {currentUser.companyName || currentUser.name}
                  </p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">GSTIN / Tax Registration</span>
                  <p className="profile-detail-value">{currentUser.gstNumber || 'Not provided'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Industrial Sector / Industry</span>
                  <p className="profile-detail-value">{currentUser.industry || 'Industrial Manufacturing'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">MIDC Zone / Location</span>
                  <p className="profile-detail-value">{currentUser.midcZone || currentUser.location || 'Not provided'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Company Workforce Size</span>
                  <p className="profile-detail-value">{currentUser.employeeCount || currentUser.size || '50-200 employees'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Contact Person / HR Lead</span>
                  <p className="profile-detail-value">{currentUser.name}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Official Contact Email</span>
                  <p className="profile-detail-value">{currentUser.email}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Official Contact Phone</span>
                  <p className="profile-detail-value">{currentUser.phone ? `+91 ${currentUser.phone}` : 'Not provided'}</p>
                </div>
                {currentUser.website && (
                  <div className="profile-detail-tile">
                    <span className="profile-detail-label">Official Website / Portal</span>
                    <p className="profile-detail-value">
                      <a href={currentUser.website.startsWith('http') ? currentUser.website : `https://${currentUser.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                        {currentUser.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: OVERVIEW & RECRUITMENT ACTIVITY */}
          <div className="profile-section" style={{ marginTop: '20px' }}>
            <div className="profile-section-header">
              <div className="profile-section-title-wrap">
                <div className="icon-box-head icon-box-emerald">
                  <BarChart3 size={20} />
                </div>
                <h2>Overview & Recruitment Activity</h2>
              </div>
            </div>

            <div className="profile-section-body">
              {/* Stats Grid */}
              <div className="company-metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
                  <div className="metric-val" style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>
                    {activeJobs.length}
                  </div>
                  <div className="metric-lbl" style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', marginTop: '2px' }}>
                    Active Jobs
                  </div>
                </div>

                <div style={{ textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
                  <div className="metric-val" style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>
                    {totalApplicants}
                  </div>
                  <div className="metric-lbl" style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', marginTop: '2px' }}>
                    Total Applicants
                  </div>
                </div>

                <div style={{ textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
                  <div className="metric-val" style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>
                    {totalViews}
                  </div>
                  <div className="metric-lbl" style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', marginTop: '2px' }}>
                    Total Views
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div className="metric-val" style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>
                    {myJobs.length}
                  </div>
                  <div className="metric-lbl" style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B', marginTop: '2px' }}>
                    Total Posted
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Edit Company Profile Modal */}
        <EditCompanyProfileModal 
          isOpen={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          company={currentUser} 
          onSaveSuccess={() => syncUser()} 
        />
      </div>
    );
  }

  const displayName = currentUser.companyName || currentUser.name || 'Candidate';
  const tradeDisplay = currentUser.tradeSpecialization || currentUser.headline || 'Industrial Workforce';

  return (
    <div className="profile-page" style={{ paddingTop: '12px', paddingBottom: '40px', background: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 14px', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
        
        {/* 1. HEADER PROFILE CARD (MATCHING USER REFERENCE) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
        }}>
          {/* Top Right Edit Button */}
          <button
            onClick={openEditModal}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '30px',
              height: '30px',
              borderRadius: '15px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Edit Profile"
          >
            <Edit3 size={14} strokeWidth={2} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Avatar with Camera Badge */}
            <div
              onClick={triggerFileInput}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '30px',
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Click to update photo"
            >
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '30px',
                backgroundColor: '#3D4A3E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: '800',
                letterSpacing: '0.5px',
                overflow: 'hidden'
              }}>
                {currentUser.profilePictureUrl && typeof currentUser.profilePictureUrl === 'string' ? (
                  <img
                    src={currentUser.profilePictureUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  getInitials(displayName)
                )}
              </div>

              {/* Camera Badge Icon */}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '22px',
                height: '22px',
                borderRadius: '11px',
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1B4FDF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Camera size={11} strokeWidth={2.5} />
              </div>

              {/* Loading overlay */}
              {isUploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '30px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Loader2 size={16} color="#FFFFFF" className="animate-spin" />
                </div>
              )}
            </div>

            {/* Info Col */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: '28px' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#0F172A',
                fontFamily: 'Georgia, serif',
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {displayName}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#64748B',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentUser.email || '—'}
              </div>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>

        {/* 2. QUICK STATS ROW */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '10px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center', borderRight: '1px solid #CBD5E1' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1B4FDF' }}>
              {experienceList.length}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', marginTop: '1px' }}>
              Work Exp
            </div>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid #CBD5E1' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1B4FDF' }}>
              {completionPercentage}%
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', marginTop: '1px' }}>
              Completeness
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1B4FDF' }}>
              {skillsList.length}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', marginTop: '1px' }}>
              Key Skills
            </div>
          </div>
        </div>

        {/* 3. PERSONAL DETAILS CARD (EXACT MATCH REFERENCE UI) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '14px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '9px'
        }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', fontFamily: 'Georgia, serif', letterSpacing: '-0.2px', marginBottom: '2px' }}>
            Personal Details
          </h2>

          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>Full Name</label>
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', height: '40px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
              {displayName}
            </div>
          </div>

          {/* Role / Specialization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>Role / Trade Specialization</label>
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', height: '40px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
              {tradeDisplay}
            </div>
          </div>

          {/* Registered Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>Registered Email</label>
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', height: '40px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
              {currentUser.email || '—'}
            </div>
          </div>

          {/* Phone / WhatsApp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>Phone / WhatsApp</label>
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', height: '40px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
              {currentUser.phone ? `+91 ${currentUser.phone}` : '—'}
            </div>
          </div>

          {/* Home City / Location Base */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>Home City / Location Base</label>
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', height: '40px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
              {currentUser.location || '—'}
            </div>
          </div>

          {/* Bio & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>Professional Bio & Notes</label>
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', minHeight: '52px', padding: '9px 12px', fontSize: '11.5px', fontWeight: '400', color: '#0F172A', lineHeight: '16px' }}>
              {currentUser.headline || 'No professional bio summary added yet. Tap Edit Profile to add a summary.'}
            </div>
          </div>
        </div>

        {/* 4. SKILLS & EXPERTISE CARD */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '14px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', fontFamily: 'Georgia, serif', letterSpacing: '-0.2px' }}>
            Skills & Expertise
          </h2>

          {skillsList.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skillsList.map((s, idx) => (
                <div key={idx} style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '10px', padding: '5px 10px', fontSize: '11px', fontWeight: '600', color: '#0F172A' }}>
                  {s}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', padding: '12px', textAlign: 'center', fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
              No key skills added yet.
            </div>
          )}
        </div>

        {/* 5. WORK EXPERIENCE CARD (VERTICAL TIMELINE) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '14px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', fontFamily: 'Georgia, serif', letterSpacing: '-0.2px' }}>
            Work Experience
          </h2>

          {experienceList.length === 0 ? (
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', padding: '12px', textAlign: 'center', fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
              No work experience entries added yet.
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '4px', marginTop: '4px' }}>
              {/* Continuous vertical line */}
              <div style={{ position: 'absolute', left: '8px', top: '12px', bottom: '12px', width: '1.5px', backgroundColor: '#CBD5E1' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {experienceList.map((item: any, idx: number) => {
                  const isCurrent = idx === 0;
                  const itemSkills = Array.isArray(item.skills) ? item.skills : [];
                  const achievementsList = Array.isArray(item.achievements) ? item.achievements : [];
                  const durationText = item.duration || '2020 - Present';
                  const roleCompanyTitle = item.company ? `${item.title || 'Role'} at ${item.company}` : (item.title || 'Role Position');

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      {/* Node Indicator Dot */}
                      <div style={{ width: '10px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#0F172A' }} />
                      </div>

                      {/* Timeline Experience Card */}
                      <div style={{ flex: 1, backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A' }}>{durationText}</span>
                          {isCurrent && (
                            <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '1.5px 6px', borderRadius: '5px', fontSize: '9px', fontWeight: '700' }}>
                              Current Role
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', marginTop: '1px' }}>
                          {roleCompanyTitle}
                        </div>

                        {item.location && (
                          <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '500' }}>
                            {item.location}
                          </div>
                        )}

                        {item.description && (
                          <div style={{ fontSize: '10.5px', color: '#334155', lineHeight: '15px', marginTop: '2px' }}>
                            {item.description}
                          </div>
                        )}

                        {achievementsList.length > 0 && (
                          <div style={{ marginTop: '3px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#0F172A' }}>Key Achievements</span>
                            {achievementsList.map((ach: string, achIdx: number) => (
                              <div key={achIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', paddingLeft: '2px' }}>
                                <span style={{ fontSize: '10px', color: '#1B4FDF', fontWeight: '700' }}>•</span>
                                <span style={{ fontSize: '10px', color: '#475569', lineHeight: '14px' }}>{ach}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {itemSkills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' }}>
                            {itemSkills.map((sk: string, skIdx: number) => (
                              <span key={skIdx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '6px', fontSize: '9.5px', fontWeight: '600', color: '#475569' }}>
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 6. EDUCATION & QUALIFICATIONS CARD (VERTICAL TIMELINE) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '14px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', fontFamily: 'Georgia, serif', letterSpacing: '-0.2px' }}>
            Education & Qualifications
          </h2>

          {educationList.length === 0 ? (
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', padding: '12px', textAlign: 'center', fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
              No education or ITI certificate added yet.
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '4px', marginTop: '4px' }}>
              <div style={{ position: 'absolute', left: '8px', top: '12px', bottom: '12px', width: '1.5px', backgroundColor: '#CBD5E1' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {educationList.map((item: any, idx: number) => {
                  const yearText = item.year ? `Class of ${item.year}` : (item.duration || 'Passing Year —');
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '10px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#0F172A' }} />
                      </div>

                      <div style={{ flex: 1, backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A' }}>{yearText}</span>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                          {item.degree || 'Degree / ITI Certification'}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '500' }}>
                          {item.institution || 'Institution / Board'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 7. RESUME & BIO-DATA */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '14px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', fontFamily: 'Georgia, serif', letterSpacing: '-0.2px' }}>
            Resume & Bio-Data
          </h2>

          {currentUser.resume ? (
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF', flexShrink: 0 }}>
                  <FileText size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.resume.name || 'Candidate_Resume.pdf'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: '600', marginTop: '1px' }}>
                    ✓ Document Attached
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPreviewResume(currentUser.resume)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: '#1B4FDF',
                  borderRadius: '14px',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <span>View PDF</span>
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '12px', padding: '12px', textAlign: 'center', fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
              No resume document attached yet.
            </div>
          )}
        </div>

      </div>

      {/* Resume Preview Modal */}
      {previewResume && (
        <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} />
      )}

      {/* Resume Upload Modal */}
      {resumeModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setResumeModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Resume PDF</h3>
              <button className="modal-close" onClick={() => setResumeModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div 
                onClick={() => pdfInputRef.current?.click()}
                style={{
                  border: '2px dashed #93c5fd',
                  borderRadius: '16px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: '#eff6ff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '1px solid #bfdbfe' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                  {isUploadingResume ? 'Uploading Document...' : 'Select Resume File (PDF or Image)'}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                  Supports PDF documents and images (PNG, JPG, JPEG, WEBP) up to 10 MB. Click anywhere to select file.
                </p>
                <input 
                  type="file" 
                  ref={pdfInputRef} 
                  accept=".pdf,application/pdf,image/*,.png,.jpg,.jpeg,.webp" 
                  style={{ display: 'none' }} 
                  onChange={handlePdfFileChange} 
                />
              </div>

              {isUploadingResume && (
                <div style={{ marginTop: '16px', textAlign: 'center', color: '#2563eb', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading and attaching resume to your profile...</span>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Profile Modal (Candidate 4-Step Stepper or Employer Profile Modal) */}
      {currentUser.role !== 'employer' ? (
        <CandidateEditProfileModal 
          isOpen={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          onSuccess={() => syncUser()} 
        />
      ) : (
        <EditCompanyProfileModal 
          isOpen={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          company={currentUser} 
          onSaveSuccess={() => syncUser()} 
        />
      )}

      {/* Experience Modal */}
      {expModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setExpModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Work Experience</h3>
              <button className="modal-close" onClick={() => setExpModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <form onSubmit={handleAddExperience} style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>Add Work Experience</h4>
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Job Title *</label>
                  <input type="text" className="form-input" required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Senior Welder" />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Company Name *</label>
                  <input type="text" className="form-input" required value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="e.g. Tata Motors" />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Duration *</label>
                  <input type="text" className="form-input" required value={expDuration} onChange={(e) => setExpDuration(e.target.value)} placeholder="e.g. 2021 - Present or 2 Years" />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="e.g. Managed heavy parts welding and assembly..." style={{ minHeight: '80px', resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                        <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                      </svg>
                      Adding...
                    </span>
                  ) : 'Add Experience'}
                </button>
              </form>

              <div>
                <h4 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>Current Work Experience</h4>
                {experienceList && experienceList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {experienceList.map((exp: any, index: number) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <h5 style={{ fontWeight: '600' }}>{exp.title}</h5>
                          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--primary)' }}>{exp.company}</p>
                          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{exp.duration}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteExperience(index)}
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '4px 8px', background: 'var(--danger)', color: 'white', border: 'none' }}
                          disabled={isSaving}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>No experience items added yet.</p>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Education Modal */}
      {eduModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setEduModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Education</h3>
              <button className="modal-close" onClick={() => setEduModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <form onSubmit={handleAddEducation} style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>Add Education Details</h4>
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Degree / Certificate / Trade *</label>
                  <input type="text" className="form-input" required value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} placeholder="e.g. ITI Welder or High School" />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Institution / School *</label>
                  <input type="text" className="form-input" required value={eduInstitution} onChange={(e) => setEduInstitution(e.target.value)} placeholder="e.g. Government ITI College" />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Year of Completion *</label>
                  <input type="text" className="form-input" required value={eduYear} onChange={(e) => setEduYear(e.target.value)} placeholder="e.g. 2020" />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                        <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                      </svg>
                      Adding...
                    </span>
                  ) : 'Add Education'}
                </button>
              </form>

              <div>
                <h4 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>Current Education Details</h4>
                {educationList && educationList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {educationList.map((edu: any, index: number) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <h5 style={{ fontWeight: '600' }}>{edu.degree}</h5>
                          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--primary)' }}>{edu.institution}</p>
                          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{edu.year}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteEducation(index)}
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '4px 8px', background: 'var(--danger)', color: 'white', border: 'none' }}
                          disabled={isSaving}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>No education items added yet.</p>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Skills Modal */}
      {skillsModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setSkillsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Skills</h3>
              <button className="modal-close" onClick={() => setSkillsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)} 
                  placeholder="e.g. MIG Welding"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 var(--space-4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '80px' }} disabled={isSaving}>
                  {isSaving ? (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                      <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                    </svg>
                  ) : 'Add'}
                </button>
              </form>

              <div>
                <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Current Skills</h4>
                {skillsList && skillsList.length > 0 ? (
                  <div className="skills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {skillsList.map((s) => (
                      <span 
                        key={s} 
                        className="skill-tag" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                      >
                        {s}
                        <button 
                          type="button" 
                          onClick={() => handleDeleteSkill(s)}
                          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold', fontSize: '10px', padding: '0 2px' }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>No skills added yet.</p>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit About Modal */}
      {aboutModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setAboutModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit About Info</h3>
              <button className="modal-close" onClick={() => setAboutModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveAbout} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Headline / Specialty Subtitle</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. ITI Certified Fitter | Quality Inspector" 
                    value={tempHeadline} 
                    onChange={(e) => setTempHeadline(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location / City</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Chatarapti Sambhajinagar" 
                    value={tempLocation} 
                    onChange={(e) => setTempLocation(e.target.value)} 
                  />
                </div>
                 <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={tempPhone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setTempPhone(val);
                    }}
                  />
                </div>
                <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setAboutModalOpen(false)} disabled={isSaving}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                          <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                        </svg>
                        Saving...
                      </span>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Job Preferences Modal */}
      {prefModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setPrefModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Job Preferences</h3>
              <button className="modal-close" onClick={() => setPrefModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSavePref} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Trade Specialty</label>
                  <select className="form-select" value={tempTrade} onChange={(e) => setTempTrade(e.target.value)}>
                    <option value="">Select Specialty</option>
                    {TRADES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>

                {tempTrade === 'Other' && (
                  <div className="form-group" style={{ marginTop: 'var(--space-2)' }}>
                    <label className="form-label">Specify Specialty *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      placeholder="e.g. Lathe Operator" 
                      value={customTrade} 
                      onChange={(e) => setCustomTrade(e.target.value)} 
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Preferred Shift</label>
                  <select className="form-select" value={tempShift} onChange={(e) => setTempShift(e.target.value)}>
                    <option value="">Any Shift</option>
                    <option value="Day Shift (8 AM - 5 PM)">Day Shift (8 AM - 5 PM)</option>
                    <option value="Night Shift (8 PM - 5 AM)">Night Shift (8 PM - 5 AM)</option>
                    <option value="Rotational (Shift A / B)">Rotational (Shift A / B)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', margin: 'var(--space-2) 0' }}>
                  <label className="form-checkbox">
                    <input type="checkbox" checked={tempBus} onChange={(e) => setTempBus(e.target.checked)} />
                    Requires Bus Transport
                  </label>
                  <label className="form-checkbox">
                    <input type="checkbox" checked={tempAccommodation} onChange={(e) => setTempAccommodation(e.target.checked)} />
                    Requires Hostel Stay
                  </label>
                </div>

                <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setPrefModalOpen(false)} disabled={isSaving}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                          <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                        </svg>
                        Saving...
                      </span>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
