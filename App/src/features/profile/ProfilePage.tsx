import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { getInitials, formatDate, capitalize, shareContent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { Resume } from '../../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser, deleteResume, syncUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
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
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please select a valid PDF document file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('PDF file size must be less than 10 MB', 'error');
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
            url: base64
          }
        } as any);

        if (result.success) {
          showToast('Resume PDF uploaded successfully! 📄', 'success');
          setResumeModalOpen(false);
        } else {
          showToast(result.error || 'Failed to upload resume PDF', 'error');
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

  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');

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

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);

  // States for adding new experience
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // States for adding new education
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduYear, setEduYear] = useState('');

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

  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempHeadline, setTempHeadline] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempPhone, setTempPhone] = useState('');

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

  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [tempTrade, setTempTrade] = useState('');
  const [customTrade, setCustomTrade] = useState('');
  const [tempShift, setTempShift] = useState('');
  const [tempBus, setTempBus] = useState(false);
  const [tempAccommodation, setTempAccommodation] = useState(false);

  const openPrefModal = () => {
    if (!currentUser) return;
    const currentSpecialty = currentUser.tradeSpecialization || '';
    if (currentSpecialty && !tradesList.includes(currentSpecialty)) {
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

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');

  // Industrial fields
  const [tradeSpecialization, setTradeSpecialization] = useState('');
  const [preferredShift, setPreferredShift] = useState('');
  const [requiresBus, setRequiresBus] = useState(false);
  const [requiresAccommodation, setRequiresAccommodation] = useState(false);
  const [customTradeEdit, setCustomTradeEdit] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    setName(currentUser.name);
    setCompanyName(currentUser.companyName || '');
    setGstNumber(currentUser.gstNumber || '');
    setHeadline(currentUser.headline || '');
    setLocation(currentUser.location || '');
    setPhone(currentUser.phone || '');
    setSkills((currentUser.skills || []).join(', '));
    
    const currentSpecialty = currentUser.tradeSpecialization || '';
    if (currentSpecialty && !tradesList.includes(currentSpecialty)) {
      setTradeSpecialization('Other');
      setCustomTradeEdit(currentSpecialty);
    } else {
      setTradeSpecialization(currentSpecialty);
      setCustomTradeEdit('');
    }

    setPreferredShift(currentUser.preferredShift || '');
    setRequiresBus(!!currentUser.requiresBus);
    setRequiresAccommodation(!!currentUser.requiresAccommodation);
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

  if (!currentUser) {
    return null;
  }

  const tradesList = ['Fitter', 'Welder', 'CNC Operator', 'Electrician', 'Machinist', 'Helper', 'Quality Inspector'];

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header Hero Card */}
        <div className="profile-header-card">
          <div className="profile-top">
            <div 
              className="profile-avatar-large"
              onClick={triggerFileInput}
              title="Click to change profile picture"
            >
              {currentUser.profilePictureUrl ? (
                <img 
                  src={currentUser.profilePictureUrl} 
                  alt={currentUser.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                getInitials(currentUser.name)
              )}
              
              {/* Hover upload overlay */}
              <div className="avatar-upload-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginBottom: 2 }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>{currentUser.profilePictureUrl ? 'Change' : 'Upload'}</span>
              </div>
              
              {/* Loading overlay */}
              {isUploading && (
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 4
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                    <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
              
              {/* Camera upload badge */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  background: '#2563eb',
                  color: '#ffffff',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  zIndex: 3,
                  pointerEvents: 'none'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>
            
            <div className="profile-info">
              <div className="profile-info-title-row">
                <h1>{currentUser.companyName || currentUser.name}</h1>
                <span className="role-badge-pill">
                  {currentUser.role === 'employer' ? 'Verified Employer' : 'Industrial Candidate'}
                </span>
              </div>

              <p className="profile-subtitle">
                {currentUser.role === 'employer' 
                  ? (currentUser.name ? `Recruiter: ${currentUser.name}` : 'Industrial Employer Account') 
                  : (currentUser.headline || 'ITI Industrial Worker / Apprentice')}
              </p>
              
              <div className="profile-meta-bar">
                {currentUser.location && (
                  <div className="profile-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{currentUser.location}</span>
                  </div>
                )}
                {currentUser.phone && (
                  <div className="profile-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>+91 {currentUser.phone}</span>
                  </div>
                )}
                <div className="profile-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Member since {formatDate(currentUser.createdAt)}</span>
                </div>
              </div>

              {/* Hero Action Buttons */}
              <div className="profile-hero-actions">
                <button onClick={openEditModal} className="glass-action-btn primary-glass">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <button onClick={handleShare} className="glass-action-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  <span>Share Profile</span>
                </button>

                <Link to={`/profile/${currentUser.id}`} className="glass-action-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>View Public Page</span>
                </Link>

                <Link to="/dashboard?tab=security" className="glass-action-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Security & 2FA</span>
                </Link>
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

        {/* Profile Completeness Status Card */}
        {(() => {
          const isCand = currentUser.role === 'candidate' || !currentUser.role;
          
          const photoOk = !!currentUser.profilePictureUrl;
          const locOk = !!currentUser.location;
          let basicPct = 10;
          if (photoOk) basicPct += 5;
          if (locOk) basicPct += 5;

          const tradeOk = !!currentUser.tradeSpecialization;
          const shiftOk = !!currentUser.preferredShift;
          let prefPct = 0;
          if (isCand) {
            if (tradeOk) prefPct += 10;
            if (shiftOk) prefPct += 10;
          } else {
            const compOk = !!currentUser.companyName;
            const gstOk = !!currentUser.gstNumber;
            if (compOk) prefPct += 10;
            if (gstOk) prefPct += 10;
          }

          const skillsArr = Array.isArray(currentUser.skills) ? currentUser.skills : [];
          const skillsCount = skillsArr.length;
          const skillsPct = Math.min(20, skillsCount * 4);

          const expArr = Array.isArray(currentUser.experience) ? currentUser.experience : [];
          const expPct = expArr.length >= 1 ? 20 : 0;

          const resumeOk = !!(currentUser.resume && (currentUser.resume.url || currentUser.resume.name));
          const resumePct = resumeOk ? 20 : 0;

          const totalPct = Math.min(100, basicPct + prefPct + skillsPct + expPct + resumePct);

          return (
            <div 
              className="profile-section profile-completeness-card" 
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Profile Strength & Recruiter Visibility
                    </h3>
                    <span 
                      style={{
                        background: totalPct === 100 ? '#dcfce7' : (totalPct >= 60 ? '#eff6ff' : '#fef3c7'),
                        color: totalPct === 100 ? '#15803d' : (totalPct >= 60 ? '#1d4ed8' : '#b45309'),
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: '800',
                        border: `1px solid ${totalPct === 100 ? '#bbf7d0' : (totalPct >= 60 ? '#bfdbfe' : '#fde68a')}`
                      }}
                    >
                      {totalPct === 100 ? 'All-Star Profile ⭐' : (totalPct >= 60 ? 'Intermediate Strength' : 'Basic Profile')}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Complete all 5 profile sections for 100% profile strength and 5x priority ranking in employer candidate searches.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '34px', fontWeight: '900', color: '#2563eb', lineHeight: 1 }}>
                      {totalPct}%
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b' }}>Completed</span>
                  </div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <div 
                  style={{
                    width: `${totalPct}%`,
                    height: '100%',
                    background: totalPct === 100 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                    borderRadius: '10px',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>

              {/* Section Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                
                {/* 1. Basic Info & Photo */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>Basic Info & Photo</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: basicPct === 20 ? '#16a34a' : '#0f172a' }}>
                      {basicPct} / 20%
                    </div>
                  </div>
                  {basicPct === 20 ? (
                    <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '16px' }}>✓</span>
                  ) : (
                    <button onClick={triggerFileInput} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                      Add Photo
                    </button>
                  )}
                </div>

                {/* 2. Job Preferences / Company */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>{isCand ? 'Trade & Preferences' : 'Company Details'}</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: prefPct === 20 ? '#16a34a' : '#0f172a' }}>
                      {prefPct} / 20%
                    </div>
                  </div>
                  {prefPct === 20 ? (
                    <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '16px' }}>✓</span>
                  ) : (
                    <button onClick={openPrefModal} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                      Edit
                    </button>
                  )}
                </div>

                {/* 3. Skills */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>
                      Skills ({skillsCount}/5 min)
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: skillsPct === 20 ? '#16a34a' : '#0f172a' }}>
                      {skillsPct} / 20%
                    </div>
                  </div>
                  {skillsPct === 20 ? (
                    <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '16px' }}>✓</span>
                  ) : (
                    <button onClick={() => setSkillsModalOpen(true)} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                      {skillsCount === 0 ? 'Add Skills' : `Add ${5 - skillsCount} More`}
                    </button>
                  )}
                </div>

                {/* 4. Experience */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>Work Experience</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: expPct === 20 ? '#16a34a' : '#0f172a' }}>
                      {expPct} / 20%
                    </div>
                  </div>
                  {expPct === 20 ? (
                    <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '16px' }}>✓</span>
                  ) : (
                    <button onClick={() => setExpModalOpen(true)} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                      Add Work
                    </button>
                  )}
                </div>

                {/* 5. Resume */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>Resume / CV</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: resumePct === 20 ? '#16a34a' : '#0f172a' }}>
                      {resumePct} / 20%
                    </div>
                  </div>
                  {resumePct === 20 ? (
                    <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '16px' }}>✓</span>
                  ) : (
                    <button onClick={() => navigate('/resume')} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                      Upload
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* SECTION 1: ABOUT ME & PERSONAL INFORMATION */}
        <div className="profile-section">
          <div className="profile-section-header">
            <div className="profile-section-title-wrap">
              <div className="icon-box-head icon-box-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2>Personal Info & Contact</h2>
            </div>
            
            <button 
              onClick={openAboutModal}
              className="btn-section-action"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>Edit Details</span>
            </button>
          </div>
          
          <div className="profile-section-body">
            <div className="profile-details-grid">
              <div className="profile-detail-tile">
                <span className="profile-detail-label">Full Name</span>
                <p className="profile-detail-value">{currentUser.name}</p>
              </div>
              <div className="profile-detail-tile">
                <span className="profile-detail-label">Headline / Specialty Title</span>
                <p className="profile-detail-value">{currentUser.headline || 'Not provided'}</p>
              </div>
              <div className="profile-detail-tile">
                <span className="profile-detail-label">Location / City</span>
                <p className="profile-detail-value">{currentUser.location || 'Not provided'}</p>
              </div>
              <div className="profile-detail-tile">
                <span className="profile-detail-label">Registered Email</span>
                <p className="profile-detail-value">{currentUser.email}</p>
              </div>
              <div className="profile-detail-tile">
                <span className="profile-detail-label">Mobile Phone</span>
                <p className="profile-detail-value">{currentUser.phone ? `+91 ${currentUser.phone}` : 'Not provided'}</p>
              </div>
              <div className="profile-detail-tile">
                <span className="profile-detail-label">Account Role</span>
                <p className="profile-detail-value" style={{ textTransform: 'capitalize' }}>{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: INDUSTRIAL PREFERENCES (Candidate) OR COMPANY DETAILS (Employer) */}
        {currentUser.role === 'candidate' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <div className="profile-section-title-wrap">
                <div className="icon-box-head icon-box-emerald">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <h2>Job & Shift Preferences</h2>
              </div>

              <button 
                onClick={openPrefModal}
                className="btn-section-action"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>Edit Preferences</span>
              </button>
            </div>
            
            <div className="profile-section-body">
              <div className="profile-details-grid">
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Trade Specialization</span>
                  <p className="profile-detail-value" style={{ color: '#059669' }}>{currentUser.tradeSpecialization || 'Not specified'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Preferred Shift</span>
                  <p className="profile-detail-value">{currentUser.preferredShift || 'Any Shift'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Bus Transport Required</span>
                  <p className="profile-detail-value">{currentUser.requiresBus ? 'Yes (Bus Facility Required)' : 'No (Self Transport)'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Hostel Accommodation Required</span>
                  <p className="profile-detail-value">{currentUser.requiresAccommodation ? 'Yes (Hostel Stay Required)' : 'No (Local Stay)'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'employer' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <div className="profile-section-title-wrap">
                <div className="icon-box-head icon-box-emerald">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <h2>Company Details</h2>
              </div>

              <button 
                onClick={openEditModal}
                className="btn-section-action"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>Edit Details</span>
              </button>
            </div>

            <div className="profile-section-body">
              <div className="profile-details-grid">
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Company Name</span>
                  <p className="profile-detail-value" style={{ fontSize: '15.5px', color: '#0f172a' }}>{currentUser.companyName || 'Not provided'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">GST Tax Number</span>
                  <p className="profile-detail-value">{currentUser.gstNumber || 'Not provided'}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Recruiter / Contact Person</span>
                  <p className="profile-detail-value">{currentUser.name}</p>
                </div>
                <div className="profile-detail-tile">
                  <span className="profile-detail-label">Official Contact Phone</span>
                  <p className="profile-detail-value">{currentUser.phone ? `+91 ${currentUser.phone}` : 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: WORK EXPERIENCE TIMELINE */}
        {currentUser.role === 'candidate' && (
          <>
            <div className="profile-section">
              <div className="profile-section-header">
                <div className="profile-section-title-wrap">
                  <div className="icon-box-head icon-box-amber">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 7h-3V4a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM9 4h6v3H9V4z"/>
                    </svg>
                  </div>
                  <h2>Work Experience</h2>
                </div>

                <button 
                  onClick={() => setExpModalOpen(true)}
                  className="btn-section-action"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <span>Add / Manage</span>
                </button>
              </div>

              <div className="profile-section-body">
                {currentUser.experience && currentUser.experience.length > 0 ? (
                  <div className="timeline-list">
                    {currentUser.experience.map((exp: any, index: number) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot-col">
                          <div className="timeline-dot" />
                          <div className="timeline-line" />
                        </div>
                        <div className="timeline-card">
                          <div className="timeline-title-row">
                            <div>
                              <h4 className="timeline-title">{exp.title}</h4>
                              <div className="timeline-subtitle">{exp.company}</div>
                            </div>
                            <span className="timeline-date-pill">{exp.duration}</span>
                          </div>
                          {exp.description && <p className="timeline-description">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>No work experience added yet.</p>
                    <p style={{ margin: '4px 0 12px 0', fontSize: '12.5px', color: '#64748b' }}>Adding plant or industrial work experience increases recruiter responses by 3x.</p>
                    <button onClick={() => setExpModalOpen(true)} className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
                      + Add Work Experience
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: EDUCATION & CERTIFICATIONS */}
            <div className="profile-section">
              <div className="profile-section-header">
                <div className="profile-section-title-wrap">
                  <div className="icon-box-head icon-box-purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/>
                    </svg>
                  </div>
                  <h2>Education & Trade Certs</h2>
                </div>

                <button 
                  onClick={() => setEduModalOpen(true)}
                  className="btn-section-action"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <span>Add / Manage</span>
                </button>
              </div>

              <div className="profile-section-body">
                {currentUser.education && currentUser.education.length > 0 ? (
                  <div className="timeline-list">
                    {currentUser.education.map((edu: any, index: number) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-dot-col">
                          <div className="timeline-dot" style={{ background: '#9333ea', borderColor: '#f3e8ff', boxShadow: '0 0 0 2px #9333ea' }} />
                          <div className="timeline-line" />
                        </div>
                        <div className="timeline-card">
                          <div className="timeline-title-row">
                            <div>
                              <h4 className="timeline-title">{edu.degree}</h4>
                              <div className="timeline-subtitle" style={{ color: '#9333ea' }}>{edu.institution}</div>
                            </div>
                            <span className="timeline-date-pill" style={{ background: '#f3e8ff', color: '#6b21a8' }}>{edu.year}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>No education or trade certificates added.</p>
                    <button onClick={() => setEduModalOpen(true)} className="btn btn-secondary btn-sm" style={{ borderRadius: '8px', marginTop: '10px' }}>
                      + Add Education
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 5: SKILLS MATRIX */}
            <div className="profile-section">
              <div className="profile-section-header">
                <div className="profile-section-title-wrap">
                  <div className="icon-box-head icon-box-indigo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <h2>Skills & Competencies</h2>
                </div>

                <button 
                  onClick={() => setSkillsModalOpen(true)}
                  className="btn-section-action"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <span>Add / Manage</span>
                </button>
              </div>

              <div className="profile-section-body">
                {currentUser.skills && currentUser.skills.length > 0 ? (
                  <div className="skills-grid">
                    {currentUser.skills.map(s => (
                      <span key={s} className="skill-chip">
                        <span>⚡</span>
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>No skills added yet.</p>
                    <p style={{ margin: '4px 0 12px 0', fontSize: '12.5px', color: '#64748b' }}>Add at least 5 industrial skills (e.g. MIG Welding, CNC Operating, Fitting) for full profile rank.</p>
                    <button onClick={() => setSkillsModalOpen(true)} className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
                      + Add Industrial Skills
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 6: RESUME DOCUMENT */}
            <div className="profile-section">
              <div className="profile-section-header">
                <div className="profile-section-title-wrap">
                  <div className="icon-box-head icon-box-rose">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <h2>Resume / CV Document</h2>
                </div>

                <button 
                  onClick={() => setResumeModalOpen(true)}
                  className="btn-section-action"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>Upload / Manage</span>
                </button>
              </div>

              <div className="profile-section-body">
                {(() => {
                  const resume = currentUser.resume;
                  if (resume && (resume.name || resume.url)) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            width: '100%', 
                            padding: '16px 18px', 
                            background: '#f8fafc', 
                            borderRadius: '14px', 
                            border: '1px solid #e2e8f0',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #fecdd3' }}>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              </svg>
                            </div>
                            <div>
                              <h4 style={{ margin: '0 0 2px 0', fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>{resume.name}</h4>
                              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Verified PDF Document {resume.size ? `• ${resume.size}` : ''}</p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => setPreviewResume(resume)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '6px 12px' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                              <span>View Document</span>
                            </button>

                            <button
                              onClick={handleDeleteResume}
                              className="btn btn-danger btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '6px 12px', background: '#ef4444', color: '#ffffff', border: 'none' }}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                                  <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              )}
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Public Resume Visibility Toggle Box */}
                        <div 
                          style={{
                            background: currentUser.isResumePublic !== false ? '#eff6ff' : '#f8fafc',
                            border: `1.5px solid ${currentUser.isResumePublic !== false ? '#bfdbfe' : '#e2e8f0'}`,
                            borderRadius: '14px',
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '16px' }}>{currentUser.isResumePublic !== false ? '👁️' : '🔒'}</span>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                                Public Resume Search Visibility
                              </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                              {currentUser.isResumePublic !== false 
                                ? 'Employers can search and view your resume in the public candidate talent directory.' 
                                : 'Hidden from public search. Visible only to employers when you apply for their jobs.'}
                            </p>
                          </div>

                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
                            <input 
                              type="checkbox"
                              checked={currentUser.isResumePublic !== false}
                              onChange={async (e) => {
                                const checked = e.target.checked;
                                try {
                                  const res = await updateUser({ isResumePublic: checked });
                                  if (res.success) {
                                    showToast(checked ? 'Resume is now public to employers' : 'Resume is now hidden from public candidate section', 'info');
                                  } else {
                                    showToast(res.error || 'Failed to update visibility', 'error');
                                  }
                                } catch (err) {
                                  showToast('Failed to update visibility', 'error');
                                }
                              }}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: currentUser.isResumePublic !== false ? '#1d4ed8' : '#64748b' }}>
                              {currentUser.isResumePublic !== false ? 'Public' : 'Private'}
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>No resume document uploaded yet.</p>
                      <p style={{ margin: '4px 0 14px 0', fontSize: '12.5px', color: '#64748b' }}>Upload your PDF resume to let employers review your trade experience instantly.</p>
                      <button onClick={() => setResumeModalOpen(true)} className="btn btn-primary btn-sm" style={{ borderRadius: '8px', padding: '8px 18px', background: 'var(--gradient-accent)' }}>
                        + Upload PDF Resume
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}
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
                  {isUploadingResume ? 'Uploading Document...' : 'Select PDF Resume File'}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                  Supports PDF documents up to 10 MB. Click anywhere to select file.
                </p>
                <input 
                  type="file" 
                  ref={pdfInputRef} 
                  accept="application/pdf" 
                  style={{ display: 'none' }} 
                  onChange={handlePdfFileChange} 
                />
              </div>

              {isUploadingResume && (
                <div style={{ marginTop: '16px', textAlign: 'center', color: '#2563eb', fontSize: '13px', fontWeight: '700' }}>
                  ⏳ Uploading and attaching PDF to your profile...
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile</h3>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form id="edit-profile-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {currentUser.role === 'employer' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Company Name <span style={{ color: '#dc2626' }}>*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={companyName}
                        placeholder="e.g. InsightForge Precision Industries"
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GST / Tax Registration Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={gstNumber}
                        placeholder="e.g. 27AAAAA0000A1Z5"
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Recruiter / Contact Person Name <span style={{ color: '#dc2626' }}>*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={name}
                        placeholder="e.g. Yogesh Dandawalkar"
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={headline}
                    placeholder="e.g. ITI Welder Apprentice"
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    placeholder="e.g. Chakan MIDC, Pune"
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhone(val);
                    }}
                  />
                </div>

                {currentUser.role === 'candidate' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Trade Specialty</label>
                      <select className="form-select" value={tradeSpecialization} onChange={(e) => setTradeSpecialization(e.target.value)}>
                        <option value="">Select Specialty</option>
                        {tradesList.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {tradeSpecialization === 'Other' && (
                      <div className="form-group" style={{ marginTop: 'var(--space-2)' }}>
                        <label className="form-label">Specify Specialty *</label>
                        <input
                          type="text"
                          className="form-input"
                          required
                          placeholder="e.g. Lathe Operator"
                          value={customTradeEdit}
                          onChange={(e) => setCustomTradeEdit(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Preferred Shift</label>
                      <select className="form-select" value={preferredShift} onChange={(e) => setPreferredShift(e.target.value)}>
                        <option value="">Any Shift</option>
                        <option value="Day Shift (8 AM - 5 PM)">Day Shift (8 AM - 5 PM)</option>
                        <option value="Night Shift (8 PM - 5 AM)">Night Shift (8 PM - 5 AM)</option>
                        <option value="Rotational (Shift A / B)">Rotational (Shift A / B)</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', margin: 'var(--space-2) 0' }}>
                      <label className="form-checkbox">
                        <input type="checkbox" checked={requiresBus} onChange={(e) => setRequiresBus(e.target.checked)} />
                        Requires Bus Transport
                      </label>
                      <label className="form-checkbox">
                        <input type="checkbox" checked={requiresAccommodation} onChange={(e) => setRequiresAccommodation(e.target.checked)} />
                        Requires Hostel Stay
                      </label>
                    </div>

                  </>
                )}
                
                <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditModalOpen(false)} disabled={isSaving}>Cancel</button>
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
                {currentUser.experience && currentUser.experience.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {currentUser.experience.map((exp: any, index: number) => (
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
                {currentUser.education && currentUser.education.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {currentUser.education.map((edu: any, index: number) => (
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
                {currentUser.skills && currentUser.skills.length > 0 ? (
                  <div className="skills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {currentUser.skills.map((s) => (
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
                    {tradesList.map(t => <option key={t} value={t}>{t}</option>)}
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
export default ProfilePage;
