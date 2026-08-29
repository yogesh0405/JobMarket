import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, UploadCloud, FileText, Trash2, X, CheckCircle2, ArrowUpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { uploadResumeFast } from '../../utils/uploadToCloudinary';

export const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, syncUser, deleteResume, updateUser } = useAuth();
  const { showToast } = useToast();

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(currentUser?.isResumePublic !== false);
  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);
  const [showReplaceUpload, setShowReplaceUpload] = useState(false);
  const [confirmVisibilityModal, setConfirmVisibilityModal] = useState<{ show: boolean; targetState: boolean } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleRequestToggle = (targetState: boolean) => {
    setConfirmVisibilityModal({ show: true, targetState });
  };

  const handleConfirmTogglePublic = async () => {
    if (!confirmVisibilityModal) return;
    const targetState = confirmVisibilityModal.targetState;
    setConfirmVisibilityModal(null);
    setIsUpdatingPublic(true);
    try {
      const res = await updateUser({ isResumePublic: targetState });
      if (res.success) {
        setIsPublic(targetState);
        showToast(
          targetState 
            ? 'Recruiter Visibility enabled! Your resume is now public to verified recruiters.' 
            : 'Recruiter Visibility disabled. Your resume is now private.',
          'info'
        );
      } else {
        showToast(res.error || 'Failed to update recruiter visibility', 'error');
      }
    } catch (err) {
      showToast('Failed to update recruiter visibility', 'error');
    } finally {
      setIsUpdatingPublic(false);
    }
  };

  const handleDeleteResume = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      const result = await deleteResume();
      if (result.success) {
        showToast('Resume document removed successfully', 'info');
        setShowReplaceUpload(false);
      } else {
        showToast(result.error || 'Failed to delete resume', 'error');
      }
    } catch (error) {
      showToast('Failed to delete resume', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileSelection = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('File size must be under 5MB', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);

    try {
      await uploadResumeFast(selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      await syncUser();
      showToast('Resume uploaded successfully! 🎉', 'success');
      setSelectedFile(null);
      setShowReplaceUpload(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Failed to upload resume', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const renderHeader = (title: string, subtitle?: string) => (
    <div
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/dashboard');
            }
          }}
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0F172A',
            padding: 0,
            transition: 'opacity 0.15s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          title="Go back"
        >
          <ArrowLeft size={22} strokeWidth={2.4} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="empty-state" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '40px 24px', maxWidth: '440px', margin: '0 auto' }}>
          <div className="empty-state-icon" style={{ background: '#EFF6FF', color: '#1B4FDF', width: '56px', height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <UploadCloud size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Please Log In</h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Log in to upload and manage your verified candidate resume.</p>
          <Link to="/login" className="btn btn-primary" style={{ background: '#1B4FDF', color: '#FFFFFF', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, fontSize: '13.5px' }}>Login</Link>
        </div>
      </div>
    );
  }

  const renderVisibilityCard = () => (
    <div 
      className="resume-card"
      style={{
        margin: 0,
        width: '100%',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        textAlign: 'left'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          {isPublic ? (
            <Eye size={16} color="#1B4FDF" style={{ flexShrink: 0 }} />
          ) : (
            <EyeOff size={16} color="#64748B" style={{ flexShrink: 0 }} />
          )}
          <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
            Recruiter Search Visibility
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', lineHeight: '16px' }}>
          {isPublic 
            ? 'Your profile & resume can be discovered by verified industrial recruiters.' 
            : 'Hidden from public recruiter search. Visible only when you submit job applications.'}
        </p>
      </div>

      {/* Modern Compact Toggle Switch Slider */}
      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        disabled={isUpdatingPublic}
        onClick={() => handleRequestToggle(!isPublic)}
        style={{
          width: '36px',
          height: '20px',
          borderRadius: '10px',
          backgroundColor: isPublic ? '#1B4FDF' : '#CBD5E1',
          border: 'none',
          padding: '3px',
          cursor: isUpdatingPublic ? 'wait' : 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          outline: 'none',
          boxShadow: isPublic ? '0 1px 3px rgba(27, 79, 223, 0.25)' : 'none'
        }}
      >
        <span
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            position: 'absolute',
            left: isPublic ? '19px' : '3px',
            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
        />
      </button>
    </div>
  );

  const renderPrivacyNote = () => (
    <div style={{ textAlign: 'center', marginTop: '8px', padding: '0 16px' }}>
      <p style={{ color: '#94A3B8', fontSize: '11px', margin: 0, lineHeight: '15px' }}>
        🔒 Resume is encrypted and safely stored in compliance with candidate privacy guidelines.
      </p>
    </div>
  );

  const hasActiveResume = !!(currentUser.resume && (currentUser.resume.name || currentUser.resume.url));

  if (hasActiveResume && !showReplaceUpload) {
    const rawDate = currentUser.resume.uploadedAt || (currentUser as any).updated_at || (currentUser as any).updatedAt || (currentUser as any).created_at || (currentUser as any).createdAt;
    const parsedDate = rawDate && !isNaN(new Date(rawDate).getTime()) ? new Date(rawDate) : null;
    const uploadDate = parsedDate ? parsedDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : 'Recently';

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
        {renderHeader('My Resume', 'Manage your active candidate document')}
        <div className="resume-page" style={{ padding: '20px 16px 60px' }}>
          <div style={{ maxWidth: '540px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', margin: '0 auto' }}>
            {/* Main Card */}
            <div className="resume-card" style={{ margin: 0, width: '100%' }}>
              <div style={{ marginBottom: '6px' }}>
                <h2>My Resume</h2>
              </div>
              <p className="resume-subtitle">Please upload your updated resume document to increase job application response rates.</p>

              <div 
                className="file-preview" 
                style={{ 
                  border: '1px solid #E2E8F0', 
                  background: '#FFFFFF', 
                  padding: '14px', 
                  borderRadius: '8px', 
                  margin: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {/* File Info Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{ background: '#EFF6FF', color: '#1B4FDF', width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0, border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={22} strokeWidth={2.2} />
                    </div>
                    <div style={{ minWidth: 0, textAlign: 'left', flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 3px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.resume.name || 'Candidate_Resume.pdf'}
                      </h4>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0 }}>
                        {currentUser.resume.size || '0.25 MB'} • Uploaded on {uploadDate}
                      </p>
                    </div>
                  </div>
                </div>
              
                {/* Actions Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '12px', width: '100%' }}>
                  <button
                    onClick={() => setPreviewResume(currentUser.resume)}
                    className="btn btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '5.5px 12px', borderRadius: '6px', border: '1px solid #DBEAFE', background: '#EFF6FF', color: '#1B4FDF', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: '100%', whiteSpace: 'nowrap' }}
                  >
                    <Eye size={14} strokeWidth={2.2} />
                    View Resume
                  </button>
                  <button
                    onClick={handleDeleteResume}
                    className="btn btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '5.5px 12px', borderRadius: '6px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: '100%', whiteSpace: 'nowrap' }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Deleting...</span>
                    ) : (
                      <>
                        <Trash2 size={14} strokeWidth={2.2} />
                        Delete Resume
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Separate Recruiter Visibility Card */}
            {renderVisibilityCard()}

            {/* Privacy Note */}
            {renderPrivacyNote()}
          </div>

        {/* Confirmation Modal */}
        {confirmVisibilityModal?.show && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(3px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.2)',
                maxWidth: '440px',
                width: '100%',
                padding: '24px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: confirmVisibilityModal.targetState ? '#EFF6FF' : '#FEF2F2',
                    border: `1px solid ${confirmVisibilityModal.targetState ? '#DBEAFE' : '#FCA5A5'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {confirmVisibilityModal.targetState ? (
                    <Eye size={22} color="#1B4FDF" strokeWidth={2.2} />
                  ) : (
                    <EyeOff size={22} color="#DC2626" strokeWidth={2.2} />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {confirmVisibilityModal.targetState ? 'Enable Recruiter Visibility?' : 'Make Resume Private?'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    {confirmVisibilityModal.targetState
                      ? 'Making your resume public allows verified industrial & factory recruiters to discover your profile and contact you directly for job openings.'
                      : 'Your profile and resume will be hidden from direct recruiter searches. Recruiters cannot find you directly, but you can still apply to jobs manually.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '22px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setConfirmVisibilityModal(null)}
                  disabled={isUpdatingPublic}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTogglePublic}
                  disabled={isUpdatingPublic}
                  style={{
                    background: confirmVisibilityModal.targetState ? '#1B4FDF' : '#DC2626',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 20px',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: confirmVisibilityModal.targetState 
                      ? '0 2px 6px rgba(27, 79, 223, 0.28)' 
                      : '0 2px 6px rgba(220, 38, 38, 0.28)'
                  }}
                >
                  {isUpdatingPublic ? 'Updating...' : confirmVisibilityModal.targetState ? 'Make Public' : 'Make Private'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Themed Delete Confirmation Modal */}
        {showDeleteModal && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(3px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.2)',
                maxWidth: '440px',
                width: '100%',
                padding: '24px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Trash2 size={22} color="#DC2626" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    Delete Resume Document?
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    Are you sure you want to delete your uploaded resume? Verified industrial recruiters won't be able to review your attached document, and employers will rely on your profile details.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '22px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  style={{
                    background: '#DC2626',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 20px',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.28)'
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Resume'}
                </button>
              </div>
            </div>
          </div>
        )}

        {previewResume && (
          <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} />
        )}
        </div>
      </div>
    );
  }

  const sizeMB = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0';
  const isImageFile = selectedFile ? selectedFile.type.startsWith('image/') : false;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {renderHeader('Upload Resume', 'Upload candidate resume document')}
      <div className="resume-page" style={{ padding: '28px 16px 60px' }}>
        <div style={{ maxWidth: '540px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', margin: '0 auto' }}>
        {/* Main Upload Card */}
        <div className="resume-card" style={{ margin: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <h2>Upload Resume</h2>
            {showReplaceUpload && (
              <button 
                onClick={() => setShowReplaceUpload(false)} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '12px', fontWeight: 600 }}
              >
                Cancel Replace
              </button>
            )}
          </div>
          <p className="resume-subtitle">Please upload your updated resume document to increase job application response rates.</p>

          {!selectedFile ? (
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="upload-icon">
                <UploadCloud size={24} strokeWidth={2.2} />
              </div>
              <div className="upload-text">
                <h3>Upload Your Resume</h3>
                <p>Drag & drop your file here, or <span className="browse-link">browse</span></p>
                <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '3px 10px', fontSize: '11.5px', color: '#64748B' }}>
                  Supports PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                </div>
              </div>
            </div>
          ) : (
            <div className="file-preview-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{ background: '#EFF6FF', color: '#1B4FDF', padding: '10px', borderRadius: '8px', border: '1px solid #DBEAFE', flexShrink: 0 }}>
                    <FileText size={22} strokeWidth={2.2} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedFile.name}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748B' }}>{sizeMB} MB</p>
                  </div>
                </div>

                {!isUploading && (
                  <button 
                    onClick={removeFile}
                    style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Live Progress Bar when Uploading */}
              {isUploading && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    <span>
                      {uploadProgress < 30
                        ? 'Saving...'
                        : uploadProgress <= 55
                        ? 'Securing & Saving...'
                        : uploadProgress <= 85
                        ? 'Get higher selection chances..'
                        : 'Almost there'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${uploadProgress}%`,
                        background: '#1B4FDF',
                        borderRadius: '3px',
                        transition: 'width 0.2s ease-out'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />

          <div className="resume-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: 0, border: 'none' }}>
            <Link 
              to="/dashboard" 
              className="btn" 
              style={{ 
                background: '#FFFFFF', 
                border: '1.5px solid #CBD5E1', 
                color: '#475569', 
                padding: '10px 22px', 
                borderRadius: '6px', 
                fontWeight: 700, 
                fontSize: '13.5px', 
                textDecoration: 'none',
                pointerEvents: isUploading ? 'none' : 'auto', 
                opacity: isUploading ? 0.6 : 1 
              }}
            >
              Skip
            </Link>
            <button
              className="btn"
              disabled={!selectedFile || isUploading}
              onClick={handleSubmit}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: selectedFile ? '#1B4FDF' : '#CBD5E1', 
                color: '#FFFFFF', 
                border: 'none', 
                padding: '10px 26px', 
                borderRadius: '6px', 
                fontWeight: 700, 
                fontSize: '13.5px', 
                cursor: selectedFile && !isUploading ? 'pointer' : 'default',
                boxShadow: selectedFile ? '0 2px 6px rgba(27, 79, 223, 0.28)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {isUploading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                    <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                  </svg>
                  Saving ({uploadProgress}%)...
                </span>
              ) : (
                <>
                  <ArrowUpCircle size={16} strokeWidth={2.2} />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Separate Recruiter Visibility Card */}
        {renderVisibilityCard()}

        {/* Privacy Note Below */}
        {renderPrivacyNote()}
      </div>

      {/* Confirmation Modal */}
      {confirmVisibilityModal?.show && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.2)',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: confirmVisibilityModal.targetState ? '#EFF6FF' : '#FEF2F2',
                  border: `1px solid ${confirmVisibilityModal.targetState ? '#DBEAFE' : '#FCA5A5'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {confirmVisibilityModal.targetState ? (
                  <Eye size={22} color="#1B4FDF" strokeWidth={2.2} />
                ) : (
                  <EyeOff size={22} color="#DC2626" strokeWidth={2.2} />
                )}
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  {confirmVisibilityModal.targetState ? 'Enable Recruiter Visibility?' : 'Make Resume Private?'}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                  {confirmVisibilityModal.targetState
                    ? 'Making your resume public allows verified industrial & factory recruiters to discover your profile and contact you directly for job openings.'
                    : 'Your profile and resume will be hidden from direct recruiter searches. Recruiters cannot find you directly, but you can still apply to jobs manually.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '22px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setConfirmVisibilityModal(null)}
                disabled={isUpdatingPublic}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTogglePublic}
                disabled={isUpdatingPublic}
                style={{
                  background: confirmVisibilityModal.targetState ? '#1B4FDF' : '#DC2626',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: confirmVisibilityModal.targetState 
                    ? '0 2px 6px rgba(27, 79, 223, 0.28)' 
                    : '0 2px 6px rgba(220, 38, 38, 0.28)'
                }}
              >
                {isUpdatingPublic ? 'Updating...' : confirmVisibilityModal.targetState ? 'Make Public' : 'Make Private'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewResume && (
        <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} />
      )}
      </div>
    </div>
  );
};

export default ResumePage;

