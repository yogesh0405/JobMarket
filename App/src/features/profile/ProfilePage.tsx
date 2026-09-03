import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { getInitials, formatDate, capitalize, shareContent, timeAgo } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { CandidateEditProfileModal } from './CandidateEditProfileModal';
import { EditCompanyProfileModal } from '../company/EditCompanyProfileModal';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { calculateCandidateProfileCompletion } from '../../utils/profileCompleteness';
import { MobileHeader } from '../../components/common/MobileHeader';
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
  Plus,
  Star,
  Calendar,
  ChevronRight,
  Check,
  Share2, 
  FileText, 
  Users,
  BarChart3,
  Eye,
  Lock,
  Loader2,
  CheckCircle2,
  Headphones,
  Trash2,
  User,
  Award,
} from 'lucide-react';
import companyHeaderBg from '../../assets/company_header_bg.jpg';
import employeeHeaderBg from '../../assets/employee_header_bg.jpg';
import { Resume } from '../../types';

const TRADES_LIST = ['Fitter', 'Welder', 'CNC Operator', 'Electrician', 'Machinist', 'Helper', 'Quality Inspector'];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, deleteResume, syncUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const { getJobsByEmployer } = useJobs();
  const t = useTranslation(state.language);

  const [activeCandidateTab, setActiveCandidateTab] = useState<'PERSONAL' | 'PROFESSIONAL'>('PERSONAL');

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
    const companyName = currentUser.companyName || currentUser.name || 'Industrial Organization';
    const completionPct = currentUser.completion_percentage || 75;
    const formattedLocation = currentUser.midcZone || currentUser.location || 'Waluj MIDC, Chhatrapati Sambhajinagar';

    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#F7F9FC',
        boxSizing: 'border-box'
      }}>
        <div className="employer-profile-container">
          {/* 1. Primary Blue Hero Header Banner with Exact Mobile App Background Image */}
          <div
            className="employer-profile-banner"
            style={{
              backgroundImage: `url(${companyHeaderBg})`,
            }}
          >
            {/* Top Controls Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '4px 0',
              marginBottom: '6px'
            }}>
              <button
                onClick={openEditModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Edit Company Profile"
              >
                <Edit3 size={15} strokeWidth={2} />
              </button>

              <button
                onClick={handleShare}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Share Profile"
              >
                <Share2 size={19} strokeWidth={2} />
              </button>
            </div>

            {/* Company Identity Hero Row */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
              {/* Circular White Logo Container */}
              <div 
                onClick={openEditModal}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '26px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(16, 42, 92, 0.2)',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                title="Edit Company Logo"
              >
                {currentUser.profilePictureUrl && typeof currentUser.profilePictureUrl === 'string' ? (
                  <img 
                    src={currentUser.profilePictureUrl} 
                    alt={companyName} 
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <CompanyDefaultLogo logoUrl={null} companyName={companyName} size={48} borderRadius="24px" />
                )}
              </div>

              {/* Company Info Column */}
              <div style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <h1 style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.2px'
                  }}>
                    {companyName}
                  </h1>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#1764E8',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }} title="Verified Employer">
                    <Check size={10} strokeWidth={3} />
                  </div>
                </div>

                {/* Subtitle Category Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    padding: '2.5px 7px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    flexShrink: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    <Building2 size={11} color="#FFFFFF" strokeWidth={2.2} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentUser.industry || 'Industrial Manufacturing'}
                    </span>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    padding: '2.5px 7px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    flexShrink: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    <Lock size={11} color="#FFFFFF" strokeWidth={2.2} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(currentUser as any).companyType || 'Private Limited'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Floating Metrics Bar (Exact Mobile App UI - 32px Overlap) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E7EBF2',
            borderRadius: '8px',
            padding: '8px 10px',
            margin: '-28px 16px 14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 3px 8px rgba(20, 42, 80, 0.06)'
          }}>
            {/* Stat 1: Jobs Posted */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: '#EFF5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Briefcase size={14} color="#1764E8" strokeWidth={2} />
              </div>
              <div style={{ flex: 1, justifyContent: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#102A5C', lineHeight: 1.1 }}>{myJobs.length || 0}</div>
                <div style={{ fontSize: '9px', fontWeight: 500, color: '#657796', marginTop: '0.5px' }}>Jobs Posted</div>
              </div>
            </div>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#E3E8F0', margin: '0 2px' }} />

            {/* Stat 2: Profile Score */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: '#ECF9F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Star size={14} color="#21A99B" strokeWidth={2} />
              </div>
              <div style={{ flex: 1, justifyContent: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#102A5C', lineHeight: 1.1 }}>{completionPct}%</div>
                <div style={{ fontSize: '9px', fontWeight: 500, color: '#657796', marginTop: '0.5px' }}>Profile Score</div>
              </div>
            </div>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#E3E8F0', margin: '0 2px' }} />

            {/* Stat 3: Post Job CTA */}
            <div
              onClick={() => navigate('/post-job')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 2px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: '#EEF4FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Plus size={15} color="#1764E8" strokeWidth={2.4} />
              </div>
              <div style={{ flex: 1, justifyContent: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1764E8', lineHeight: 1.1 }}>Post Job</div>
                <div style={{ fontSize: '9px', fontWeight: 500, color: '#657796', marginTop: '0.5px' }}>New Vacancy</div>
              </div>
            </div>
          </div>

          {/* 3. About Company & Operations Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E7EBF2',
            padding: '14px',
            margin: '0 16px 12px 16px',
            boxShadow: '0 2px 6px rgba(20, 42, 80, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#EEF4FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={15} color="#1764E8" strokeWidth={2.2} />
              </div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#102A5C', margin: 0 }}>
                About {companyName}
              </h3>
            </div>

            <p style={{
              fontSize: '11.5px',
              color: '#66789B',
              lineHeight: '18px',
              margin: 0,
              whiteSpace: 'pre-line'
            }}>
              {currentUser.companyDescription || `${companyName} is a leading industrial organization operating in manufacturing and engineering operations.`}
            </p>
          </div>

          {/* 4. Company Details & Verification Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E7EBF2',
            padding: '14px',
            margin: '0 16px 12px 16px',
            boxShadow: '0 2px 6px rgba(20, 42, 80, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#102A5C', margin: 0 }}>
                Company Details & Verification
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#EAF8F5',
                padding: '2.5px 7px',
                borderRadius: '5px'
              }}>
                <ShieldCheck size={12} color="#19A98F" strokeWidth={2.4} />
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#19A98F' }}>Verified</span>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E2E7EF', margin: '10px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Row 1: Location & Legal Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={13} color="#1764E8" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '9.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Plant Address & Location</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#102A5C', lineHeight: '15px', paddingLeft: '28px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {formattedLocation}
                  </div>
                </div>

                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#F2F1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={13} color="#625CEB" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '9.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Legal Company Type</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#102A5C', lineHeight: '15px', paddingLeft: '28px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {(currentUser as any).companyType || 'Private Limited'}
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E5EAF2', margin: '8px 0' }} />

              {/* Row 2: Company Size & Founded Year */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#ECFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={13} color="#21A99B" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '9.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Company Size</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#102A5C', lineHeight: '15px', paddingLeft: '28px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {(currentUser as any).companySize || '200–500 employees'}
                  </div>
                </div>

                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Calendar size={13} color="#D97706" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '9.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Founded Year</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#102A5C', lineHeight: '15px', paddingLeft: '28px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {(currentUser as any).foundedYear || '2005'}
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E5EAF2', margin: '8px 0' }} />

              {/* Row 3: GST Number & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#EFF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={13} color="#1764E8" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '9.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>GSTIN Registration</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#102A5C', lineHeight: '15px', paddingLeft: '28px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {currentUser.gstNumber || '27AABCU9603R1ZN'}
                  </div>
                </div>

                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={13} color="#1764E8" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '9.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Official Contact Email</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#102A5C', lineHeight: '15px', paddingLeft: '28px', minWidth: 0, overflow: 'hidden' }}>
                    <a
                      href={`mailto:${currentUser.email}`}
                      style={{
                        color: '#1764E8',
                        textDecoration: 'none',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                      title={currentUser.email}
                    >
                      {currentUser.email}
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E5EAF2', margin: '8px 0' }} />

              {/* Row 4: Phone & Website */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#ECFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={13} color="#21A99B" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '9.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Contact Phone</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#102A5C', lineHeight: '15px', paddingLeft: '28px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.phone ? `+91 ${currentUser.phone}` : 'Not provided'}
                  </div>
                </div>

                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#EFF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Globe size={13} color="#1764E8" strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '9.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Website Portal</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#1764E8', lineHeight: '15px', paddingLeft: '28px', minWidth: 0, overflow: 'hidden' }}>
                    {currentUser.website ? (
                      <a
                        href={currentUser.website.startsWith('http') ? currentUser.website : `https://${currentUser.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#1764E8',
                          textDecoration: 'none',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}
                        title={currentUser.website}
                      >
                        {currentUser.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span style={{ color: '#657796' }}>jobmarket.in</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Active Job Openings Section */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E7EBF2',
            padding: '14px',
            margin: '0 16px 12px 16px',
            boxShadow: '0 2px 6px rgba(20, 42, 80, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#102A5C', margin: 0 }}>
                  Active Job Openings
                </h3>
                <div style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1764E8',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '6px'
                }}>
                  {activeJobs.length}
                </div>
              </div>

              <button
                onClick={() => navigate('/jobs')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1764E8',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <span>View all</span>
                <ChevronRight size={13} strokeWidth={2.4} />
              </button>
            </div>

            {activeJobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeJobs.map((jobItem: any, idx: number) => (
                  <div
                    key={jobItem.id || idx}
                    onClick={() => navigate(`/job/${jobItem.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderTop: idx > 0 ? '1px solid #DFE5EE' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: idx % 2 === 0 ? '#F2F1FF' : '#ECFAF7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Building2 size={15} color={idx % 2 === 0 ? '#625CEB' : '#21A99B'} strokeWidth={2} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
                        <h4 style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#102A5C',
                          margin: '0 0 1px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {jobItem.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={9} color="#66789B" />
                          <span style={{ fontSize: '9.5px', color: '#66789B', fontWeight: 500 }}>
                            {jobItem.location || 'Waluj MIDC, Maharashtra'} • {jobItem.jobType || jobItem.job_type || 'Full Time'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, paddingLeft: '8px' }}>
                      <span style={{ fontSize: '9.5px', color: '#66789B', fontWeight: 500 }}>
                        {timeAgo((jobItem as any).postedAt || (jobItem as any).posted_at || (jobItem as any).created_at || (jobItem as any).createdAt)}
                      </span>
                      <ChevronRight size={13} color="#94A3B8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#657796', fontSize: '11px' }}>
                No active job postings right now. Click "Post Job" to add vacancies.
              </div>
            )}
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
    <div style={{ width: '100%', minHeight: '100vh', background: '#F7F9FC', boxSizing: 'border-box' }}>
      <style>{`
        .profile-main-container {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding-bottom: 80px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        @media (max-width: 767px) {
          .profile-main-container {
            max-width: 580px;
            padding-bottom: 100px !important;
          }
        }
      `}</style>

      {/* Main Content Area */}
      <div className="profile-main-container">
        {/* 1. ROYAL BLUE HERO HEADER BANNER (EMPLOYEE CAREER THEME) */}
        <div style={{
          backgroundColor: '#174CB6',
          backgroundImage: `url(${employeeHeaderBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '12px 14px 38px 14px',
          boxSizing: 'border-box',
          position: 'relative',
        }}>
          {/* Top Navigation / Edit Control Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2px',
          }}>
            <div />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={openEditModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Edit Profile"
              >
                <Edit3 size={15} color="#FFFFFF" strokeWidth={2.2} />
              </button>

              <button
                onClick={handleShare}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Share Profile"
              >
                <Share2 size={15} color="#FFFFFF" strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Candidate Identity Hero Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '2px',
          }}>
            {/* Circular Avatar Container with Camera Badge */}
            <div
              onClick={triggerFileInput}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '28px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                position: 'relative',
                boxShadow: '0 3px 10px rgba(16, 42, 92, 0.25)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Click to update photo"
            >
              {currentUser.profilePictureUrl && typeof currentUser.profilePictureUrl === 'string' ? (
                <img
                  src={currentUser.profilePictureUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '26px',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '26px',
                  backgroundColor: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: 800,
                }}>
                  {getInitials(displayName)}
                </div>
              )}

              {/* Camera Badge Icon */}
              <div style={{
                position: 'absolute',
                bottom: '-1px',
                right: '-1px',
                width: '18px',
                height: '18px',
                borderRadius: '9px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}>
                <Camera size={9.5} color="#1B4FDF" strokeWidth={2.5} />
              </div>

              {/* Loading overlay */}
              {isUploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '28px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Loader2 size={14} color="#FFFFFF" className="animate-spin" />
                </div>
              )}
            </div>

            {/* Candidate Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Candidate Name + Verified Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '3px',
              }}>
                <h1 style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.2px',
                }}>
                  {displayName}
                </h1>
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '7px',
                  backgroundColor: '#1764E8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }} title="Verified Profile">
                  <Check size={9} strokeWidth={3} />
                </div>
              </div>

              {/* Subtitle Category Chips on Blue Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '9.5px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  flexShrink: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  <Award size={10} color="#FFFFFF" strokeWidth={2.2} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tradeDisplay}
                  </span>
                </div>

                {currentUser.location && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9.5px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    flexShrink: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    <MapPin size={10} color="#FFFFFF" strokeWidth={2.2} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentUser.location}
                    </span>
                  </div>
                )}
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

        {/* 2. BODY CONTENT (STATS BAR, TAB MENU, PERSONAL / PROFESSIONAL SECTIONS) */}
        <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {/* Quick Stats Floating Card (Overlapping Blue Banner) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E7EBF2',
            borderRadius: '7px',
            padding: '8px 10px',
            marginTop: '-24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 2px 6px rgba(20, 42, 80, 0.05)',
          }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1B4FDF' }}>
                {experienceList.length}
              </div>
              <div style={{ fontSize: '9.5px', fontWeight: 600, color: '#64748B', marginTop: '1px' }}>
                Work Exp
              </div>
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0' }} />

            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1B4FDF' }}>
                {completionPercentage}%
              </div>
              <div style={{ fontSize: '9.5px', fontWeight: 600, color: '#64748B', marginTop: '1px' }}>
                Completeness
              </div>
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0' }} />

            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1B4FDF' }}>
                {skillsList.length}
              </div>
              <div style={{ fontSize: '9.5px', fontWeight: 600, color: '#64748B', marginTop: '1px' }}>
                Key Skills
              </div>
            </div>
          </div>

          {/* 2-Option Tab Menu with Underline */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            borderRadius: '5px',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setActiveCandidateTab('PERSONAL')}
              style={{
                flex: 1,
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: activeCandidateTab === 'PERSONAL' ? 700 : 600,
                color: activeCandidateTab === 'PERSONAL' ? '#1B4FDF' : '#64748B',
              }}>
                <User size={12} color={activeCandidateTab === 'PERSONAL' ? '#1B4FDF' : '#64748B'} strokeWidth={2.2} />
                <span>Personal Info</span>
              </div>
              {activeCandidateTab === 'PERSONAL' && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#1B4FDF',
                  borderRadius: '2px 2px 0 0',
                }} />
              )}
            </button>

            <button
              onClick={() => setActiveCandidateTab('PROFESSIONAL')}
              style={{
                flex: 1,
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: activeCandidateTab === 'PROFESSIONAL' ? 700 : 600,
                color: activeCandidateTab === 'PROFESSIONAL' ? '#1B4FDF' : '#64748B',
              }}>
                <Briefcase size={12} color={activeCandidateTab === 'PROFESSIONAL' ? '#1B4FDF' : '#64748B'} strokeWidth={2.2} />
                <span>Professional Info</span>
              </div>
              {activeCandidateTab === 'PROFESSIONAL' && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#1B4FDF',
                  borderRadius: '2px 2px 0 0',
                }} />
              )}
            </button>
          </div>

          {/* TAB 1: PERSONAL DETAILS SECTION */}
          {activeCandidateTab === 'PERSONAL' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '7px',
              border: '1px solid #CBD5E1',
              padding: '11px 13px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.1px',
                marginBottom: '1px',
              }}>
                Personal Details
              </h2>

              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>Full Name</label>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '5px',
                  height: '32px',
                  padding: '0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#0F172A',
                }}>
                  {displayName}
                </div>
              </div>

              {/* Role / Specialization */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>Role / Trade Specialization</label>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '5px',
                  height: '32px',
                  padding: '0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#0F172A',
                }}>
                  {tradeDisplay}
                </div>
              </div>

              {/* Registered Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>Registered Email</label>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '5px',
                  height: '32px',
                  padding: '0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#0F172A',
                }}>
                  {currentUser.email || '—'}
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>Phone / WhatsApp</label>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '5px',
                  height: '32px',
                  padding: '0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#0F172A',
                }}>
                  {currentUser.phone ? `+91 ${currentUser.phone}` : '—'}
                </div>
              </div>

              {/* Home City / Location Base */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>Home City / Location Base</label>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '5px',
                  height: '32px',
                  padding: '0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#0F172A',
                }}>
                  {currentUser.location || '—'}
                </div>
              </div>

              {/* Bio & Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>Professional Bio & Notes</label>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '5px',
                  minHeight: '44px',
                  padding: '7px 10px',
                  fontSize: '10.5px',
                  fontWeight: 400,
                  color: '#0F172A',
                  lineHeight: '14.5px',
                }}>
                  {currentUser.headline || currentUser.bio || 'No professional bio summary added yet. Tap Edit Profile to add a summary.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFESSIONAL DETAILS SECTIONS */}
          {activeCandidateTab === 'PROFESSIONAL' && (
            <>
              {/* 1. SKILLS & EXPERTISE CARD */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '7px',
                border: '1px solid #CBD5E1',
                padding: '11px 13px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.1px',
                }}>
                  Skills & Expertise
                </h2>

                {skillsList.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {skillsList.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                          borderRadius: '4px',
                          padding: '3px 7px',
                          fontSize: '9.5px',
                          fontWeight: 600,
                          color: '#1B4FDF',
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '5px',
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#64748B',
                  }}>
                    No key skills added yet.
                  </div>
                )}
              </div>

              {/* 2. WORK EXPERIENCE TIMELINE CARD */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '7px',
                border: '1px solid #CBD5E1',
                padding: '11px 13px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.1px',
                }}>
                  Work Experience
                </h2>

                {experienceList.length === 0 ? (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '5px',
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#64748B',
                  }}>
                    No work experience entries added yet.
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: '4px', marginTop: '3px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '7px',
                      top: '10px',
                      bottom: '10px',
                      width: '1.5px',
                      backgroundColor: '#CBD5E1',
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {experienceList.map((item: any, idx: number) => {
                        const isCurrent = idx === 0;
                        const itemSkills = Array.isArray(item.skills) ? item.skills : [];
                        const achievementsList = Array.isArray(item.achievements) ? item.achievements : [];
                        const durationText = item.duration || '2020 - Present';
                        const roleCompanyTitle = item.company ? `${item.title || 'Role'} at ${item.company}` : (item.title || 'Role Position');

                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ width: '8px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#1B4FDF' }} />
                            </div>

                            <div style={{
                              flex: 1,
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '5px',
                              padding: '8px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0F172A' }}>{durationText}</span>
                                {isCurrent && (
                                  <span style={{
                                    backgroundColor: '#DCFCE7',
                                    color: '#16A34A',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    fontSize: '8.5px',
                                    fontWeight: 700,
                                  }}>
                                    Current Role
                                  </span>
                                )}
                              </div>

                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', marginTop: '1px' }}>
                                {roleCompanyTitle}
                              </div>

                              {item.location && (
                                <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 500 }}>
                                  {item.location}
                                </div>
                              )}

                              {item.description && (
                                <div style={{ fontSize: '9.5px', color: '#334155', lineHeight: '13.5px', marginTop: '2px' }}>
                                  {item.description}
                                </div>
                              )}

                              {achievementsList.length > 0 && (
                                <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#0F172A' }}>Key Achievements</span>
                                  {achievementsList.map((ach: string, achIdx: number) => (
                                    <div key={achIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', paddingLeft: '2px' }}>
                                      <span style={{ fontSize: '9px', color: '#1B4FDF', fontWeight: 700 }}>•</span>
                                      <span style={{ fontSize: '9px', color: '#475569', lineHeight: '13px' }}>{ach}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {itemSkills.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                                  {itemSkills.map((sk: string, skIdx: number) => (
                                    <span
                                      key={skIdx}
                                      style={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        padding: '1.5px 5px',
                                        borderRadius: '3px',
                                        fontSize: '8.5px',
                                        fontWeight: 600,
                                        color: '#475569',
                                      }}
                                    >
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

              {/* 3. EDUCATION & QUALIFICATIONS TIMELINE CARD */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '7px',
                border: '1px solid #CBD5E1',
                padding: '11px 13px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.1px',
                }}>
                  Education & Qualifications
                </h2>

                {educationList.length === 0 ? (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '5px',
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#64748B',
                  }}>
                    No education or ITI certificate added yet.
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: '4px', marginTop: '3px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '7px',
                      top: '10px',
                      bottom: '10px',
                      width: '1.5px',
                      backgroundColor: '#CBD5E1',
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {educationList.map((item: any, idx: number) => {
                        const yearText = item.year ? `Class of ${item.year}` : (item.duration || 'Passing Year —');
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ width: '8px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#1B4FDF' }} />
                            </div>

                            <div style={{
                              flex: 1,
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '5px',
                              padding: '8px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}>
                              <span style={{ fontSize: '10px', fontWeight: 800, color: '#0F172A' }}>{yearText}</span>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
                                {item.degree || 'Degree / ITI Certification'}
                              </div>
                              <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 500 }}>
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

              {/* 4. RESUME & BIO-DATA DOCUMENT CARD */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '7px',
                border: '1px solid #CBD5E1',
                padding: '11px 13px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.1px',
                }}>
                  Resume
                </h2>

                {currentUser.resume ? (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '5px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '5px',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1B4FDF',
                        flexShrink: 0,
                      }}>
                        <FileText size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {currentUser.resume.name || 'Candidate_Resume.pdf'}
                        </div>
                        <div style={{ fontSize: '9px', color: '#16A34A', fontWeight: 600, marginTop: '1px' }}>
                          ✓ Document Attached
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewResume(currentUser.resume)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '4px 9px',
                        backgroundColor: '#1B4FDF',
                        borderRadius: '3px',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <span>View PDF</span>
                    </button>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '5px',
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#64748B',
                  }}>
                    No resume document attached yet.
                  </div>
                )}
              </div>
            </>
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
