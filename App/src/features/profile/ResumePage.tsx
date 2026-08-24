import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Lock } from 'lucide-react';
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

  const handleTogglePublic = async (checked: boolean) => {
    setIsPublic(checked);
    setIsUpdatingPublic(true);
    try {
      const res = await updateUser({ isResumePublic: checked });
      if (res.success) {
        showToast(checked ? 'Resume is now public to employers' : 'Resume is now hidden from public candidate section', 'info');
      } else {
        setIsPublic(!checked);
        showToast(res.error || 'Failed to update resume visibility', 'error');
      }
    } catch (err) {
      setIsPublic(!checked);
      showToast('Failed to update resume visibility', 'error');
    } finally {
      setIsUpdatingPublic(false);
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

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h3>Please Log In</h3>
          <p>Log in to upload your resume.</p>
          <Link to="/login" className="btn btn-primary mt-4">Login</Link>
        </div>
      </div>
    );
  }

  if (currentUser.resume && (currentUser.resume.name || currentUser.resume.url)) {
    const rawDate = currentUser.resume.uploadedAt || (currentUser as any).updated_at || (currentUser as any).updatedAt || (currentUser as any).created_at || (currentUser as any).createdAt;
    const parsedDate = rawDate && !isNaN(new Date(rawDate).getTime()) ? new Date(rawDate) : null;
    const uploadDate = parsedDate ? parsedDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : 'Recently';

    return (
      <div className="resume-page">
        <div className="resume-card">
          <h2>My Resume</h2>
          <p className="resume-subtitle">Your uploaded resume is active and profile is updated</p>

          <div 
            className="file-preview" 
            style={{ 
              border: '1px solid #cbd5e1', 
              background: '#f8fafc', 
              padding: '16px 20px', 
              borderRadius: '8px', 
              margin: '20px 0 12px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* File Info Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div className="file-icon" style={{ background: '#eff6ff', color: '#344BFD', padding: '10px', borderRadius: '6px', flexShrink: 0 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="file-info" style={{ minWidth: 0, textAlign: 'left', flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.resume.name}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                    {currentUser.resume.size} &bull; Uploaded on {uploadDate}
                  </p>
                </div>
              </div>

            </div>
            
            {/* Actions Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <button
                onClick={() => setPreviewResume(currentUser.resume)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, flex: '1 1 auto', maxWidth: '140px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                View
              </button>
              <button
                onClick={handleDeleteResume}
                className="btn btn-danger btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', borderRadius: '4px', background: '#ef4444', color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: '700', flex: '1 1 auto', maxWidth: '140px' }}
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

          {/* Public Resume Visibility Toggle Card */}
          <div 
            style={{
              background: isPublic ? 'rgba(37, 99, 235, 0.04)' : '#f8fafc',
              border: `1.5px solid ${isPublic ? '#93c5fd' : '#cbd5e1'}`,
              borderRadius: '10px',
              padding: '14px 18px',
              margin: '16px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {isPublic ? (
                  <Eye size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                ) : (
                  <Lock size={18} color="#64748B" style={{ flexShrink: 0 }} />
                )}
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Public Resume Visibility
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                {isPublic 
                  ? 'Employers can see your profile and resume in the public Candidate Directory.' 
                  : 'Hidden from public candidate search. Visible only to employers of jobs you apply for.'}
              </p>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: isUpdatingPublic ? 'wait' : 'pointer', flexShrink: 0 }}>
              <input 
                type="checkbox"
                checked={isPublic}
                disabled={isUpdatingPublic}
                onChange={(e) => handleTogglePublic(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: isPublic ? '#1d4ed8' : '#475569' }}>
                {isPublic ? 'Public' : 'Private'}
              </span>
            </label>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
              Your resume is saved securely. Upload modifications are disabled.
            </p>
          </div>
        </div>

        {previewResume && (
          <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} />
        )}
      </div>
    );
  }

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
      showToast('Please select a file', 'error');
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
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Failed to upload resume', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const sizeMB = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0';
  const isImageFile = selectedFile ? selectedFile.type.startsWith('image/') : false;

  return (
    <div className="resume-page">
      <div className="resume-card">
        <h2>Upload Resume</h2>
        <p className="resume-subtitle">Please upload your updated resume</p>

        {!selectedFile ? (
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="upload-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="upload-text">
              <h3>Upload Your Resume</h3>
              <p>Drag & drop your file here, or <span className="browse-link">browse</span></p>
              <p style={{ marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
                Supports PDF, DOC, DOCX, JPG, PNG (Max 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="file-preview-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="file-preview">
              <div className="file-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="file-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0 }}>{selectedFile.name}</h4>
                  {isImageFile && (
                    <span style={{ fontSize: '10px', background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Auto-Compressed
                    </span>
                  )}
                </div>
                <p style={{ margin: '2px 0 0 0' }}>{sizeMB} MB</p>
              </div>
              {!isUploading && (
                <button className="file-remove" onClick={removeFile}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Live Progress Bar when Uploading */}
            {isUploading && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  <span>{uploadProgress < 20 ? 'Compressing & Preparing...' : 'Uploading Resume...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg, #344BFD 0%, #6366f1 100%)',
                      borderRadius: '4px',
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

        <div className="resume-actions">
          <Link to="/dashboard" className="btn btn-secondary btn-lg btn-pill" style={{ pointerEvents: isUploading ? 'none' : 'auto', opacity: isUploading ? 0.6 : 1 }}>Skip</Link>
          <button
            className="btn btn-primary btn-lg btn-pill"
            disabled={!selectedFile || isUploading}
            onClick={handleSubmit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {isUploading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                  <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                </svg>
                Uploading ({uploadProgress}%)...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>

      {previewResume && (
        <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} />
      )}
    </div>
  );
};
export default ResumePage;
