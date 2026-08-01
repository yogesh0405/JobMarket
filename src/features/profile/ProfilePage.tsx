import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { getInitials, formatDate, capitalize } from '../../utils/helpers';
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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
      const currentExp = currentUser.experience || [];
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
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async (indexToDelete: number) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this experience item?')) return;
    
    setIsSaving(true);
    try {
      const currentExp = currentUser.experience || [];
      const updatedExp = currentExp.filter((_, i) => i !== indexToDelete);
      
      const result = await updateUser({ experience: updatedExp } as any);
      if (result.success) {
        showToast('Experience deleted successfully', 'success');
      } else {
        showToast(result.error || 'Failed to delete experience', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
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
      const currentEdu = currentUser.education || [];
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
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (indexToDelete: number) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this education item?')) return;
    
    setIsSaving(true);
    try {
      const currentEdu = currentUser.education || [];
      const updatedEdu = currentEdu.filter((_, i) => i !== indexToDelete);
      
      const result = await updateUser({ education: updatedEdu } as any);
      if (result.success) {
        showToast('Education deleted successfully', 'success');
      } else {
        showToast(result.error || 'Failed to delete education', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempPhone, setTempPhone] = useState('');

  const openAboutModal = () => {
    if (!currentUser) return;
    setTempName(currentUser.name);
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
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-top">
            <div 
              className="profile-avatar-large"
              style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}
              onClick={triggerFileInput}
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
              <div 
                className="avatar-upload-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: 'none'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: 2 }}>
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
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                    <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <h1 style={{ color: 'white', fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-bold)', marginBottom: '4px' }}>
                {currentUser.companyName || currentUser.name}
              </h1>
              <p className="profile-subtitle" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {currentUser.role}
                </span>
                {currentUser.role === 'employer' 
                  ? (currentUser.name ? `Recruiter: ${currentUser.name}` : 'Employer Account') 
                  : (currentUser.headline || 'ITI Industrial Worker')}
              </p>
              
              {currentUser.location && (
                <div className="profile-location-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {currentUser.location}
                </div>
              )}

              <div className="profile-actions-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <button 
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span>{currentUser.profilePictureUrl ? 'Change Photo / Logo' : 'Upload Photo / Logo'}</span>
                </button>

                {currentUser.profilePictureUrl && (
                  <button 
                    onClick={handleDeletePhoto}
                    disabled={isUploading}
                    style={{
                      background: 'rgba(239, 68, 68, 0.25)',
                      border: '1px solid rgba(239, 68, 68, 0.45)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>Remove</span>
                  </button>
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

        {/* About */}
        <div className="profile-section">
          <div className="profile-section-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              About
            </h2>
            <button 
              onClick={openAboutModal}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
          <div className="profile-section-body">
            <div className="profile-details-grid">
              <div><span className="text-sm text-secondary">Email</span><p className="font-medium">{currentUser.email}</p></div>
              <div><span className="text-sm text-secondary">Phone</span><p className="font-medium">{currentUser.phone || 'Not provided'}</p></div>
              <div><span className="text-sm text-secondary">Role</span><p className="font-medium">{capitalize(currentUser.role)}</p></div>
              <div><span className="text-sm text-secondary">Joined</span><p className="font-medium">{formatDate(currentUser.createdAt)}</p></div>
            </div>
          </div>
        </div>

        {/* Industrial Profile section for candidates */}
        {currentUser.role === 'candidate' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                Industrial Job Preferences
              </h2>
              <button 
                onClick={openPrefModal}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
            </div>
            <div className="profile-section-body">
              <div className="profile-details-grid">
                <div>
                  <span className="text-sm text-secondary">Trade Specialization</span>
                  <p className="font-medium">{currentUser.tradeSpecialization || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Preferred Shift</span>
                  <p className="font-medium">{currentUser.preferredShift || 'Any Shift'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Requires Bus facility</span>
                  <p className="font-medium">{currentUser.requiresBus ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Requires Hostel accommodation</span>
                  <p className="font-medium">{currentUser.requiresAccommodation ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company & Business Information section for Employers */}
        {currentUser.role === 'employer' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                Company & Business Information
              </h2>
              <button 
                onClick={openEditModal}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Details
              </button>
            </div>
            <div className="profile-section-body">
              <div className="profile-details-grid">
                <div>
                  <span className="text-sm text-secondary">Company Name</span>
                  <p className="font-medium" style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{currentUser.companyName || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">GST Registration Number</span>
                  <p className="font-medium">{currentUser.gstNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Recruiter / Contact Person</span>
                  <p className="font-medium">{currentUser.name}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Contact Phone</span>
                  <p className="font-medium">{currentUser.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Official Email</span>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
                <div>
                  <span className="text-sm text-secondary">Factory / MIDC Location</span>
                  <p className="font-medium">{currentUser.location || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experience */}
        {currentUser.role === 'candidate' && (
          <>
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  Work Experience
                </h2>
                <button 
                  onClick={() => setExpModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add / Edit
                </button>
              </div>
              <div className="profile-section-body">
                {currentUser.experience && currentUser.experience.length > 0 ? (
                  currentUser.experience.map((exp: any, index: number) => (
                    <div key={index} className="experience-item">
                      <div className="exp-dot"></div>
                      <div className="exp-content">
                        <h4>{exp.title}</h4>
                        <div className="exp-company">{exp.company}</div>
                        <div className="exp-duration">{exp.duration}</div>
                        {exp.description && <p className="exp-description">{exp.description}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No experience details added.</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 10 3 12 0v-5"/>
                  </svg>
                  Education
                </h2>
                <button 
                  onClick={() => setEduModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add / Edit
                </button>
              </div>
              <div className="profile-section-body">
                {currentUser.education && currentUser.education.length > 0 ? (
                  currentUser.education.map((edu: any, index: number) => (
                    <div key={index} className="experience-item">
                      <div className="exp-dot"></div>
                      <div className="exp-content">
                        <h4>{edu.degree}</h4>
                        <div className="exp-company">{edu.institution}</div>
                        <div className="exp-duration">{edu.year}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No education details added.</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Skills
                </h2>
                <button 
                  onClick={() => setSkillsModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add / Edit
                </button>
              </div>
              <div className="profile-section-body">
                {currentUser.skills && currentUser.skills.length > 0 ? (
                  <div className="skills-list">
                    {currentUser.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No skills listed.</p>
                )}
              </div>
            </div>

            {/* Resume */}
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Resume
                </h2>
              </div>
              <div className="profile-section-body">
                {(() => {
                  const resume = currentUser.resume;
                  if (resume && (resume.name || resume.url)) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                        <div className="file-preview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="file-icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              </svg>
                            </div>
                            <div className="file-info">
                              <h4>{resume.name}</h4>
                              <p>{resume.size}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <button
                              onClick={() => setPreviewResume(resume)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid var(--border)' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                              View
                            </button>
                            <button
                              onClick={handleDeleteResume}
                              className="btn btn-danger btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'var(--danger)', color: '#ffffff', border: 'none' }}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                                  <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                              )}
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Public Resume Visibility Toggle Box */}
                        <div 
                          style={{
                            background: currentUser.isResumePublic !== false ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-secondary)',
                            border: `1.5px solid ${currentUser.isResumePublic !== false ? '#93c5fd' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '15px' }}>{currentUser.isResumePublic !== false ? '👁️' : '🔒'}</span>
                              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Public Resume Visibility
                              </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                              {currentUser.isResumePublic !== false 
                                ? 'Employers can view your resume in the public candidate directory.' 
                                : 'Hidden from public candidate search. Visible only to employers when you apply for their jobs.'}
                            </p>
                          </div>

                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
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
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: currentUser.isResumePublic !== false ? '#1d4ed8' : 'var(--text-secondary)' }}>
                              {currentUser.isResumePublic !== false ? 'Public' : 'Private'}
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>No resume uploaded yet.</p>
                      <Link to="/resume" className="btn btn-primary btn-sm">Upload Resume</Link>
                    </>
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
