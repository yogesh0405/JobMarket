import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';

export const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { showToast } = useToast();

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete your uploaded resume? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const result = await updateUser({ resume: null } as any);
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

  if (currentUser.resume) {
    const uploadDate = new Date(currentUser.resume.uploadedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="resume-page">
        <div className="resume-card">
          <h2>My Resume</h2>
          <p className="resume-subtitle">Your uploaded resume is active and profile is updated</p>

          <div 
            className="file-preview" 
            style={{ 
              border: '1px solid var(--border)', 
              background: 'var(--bg-secondary)', 
              padding: 'var(--space-4)', 
              borderRadius: 'var(--radius-lg)', 
              margin: 'var(--space-6) 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="file-icon" style={{ background: 'rgba(52, 75, 253, 0.1)', color: 'var(--primary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="file-info" style={{ marginLeft: 'var(--space-4)' }}>
                <h4 style={{ fontSize: 'var(--fs-md)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{currentUser.resume.name}</h4>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>{currentUser.resume.size} &bull; Uploaded on {uploadDate}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', borderRadius: '50%', width: 32, height: 32 }} title="Active Resume">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <button
                onClick={() => setPreviewResume(currentUser.resume)}
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

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
              Your resume is saved securely. Upload modifications are disabled.
            </p>
            <Link to="/dashboard" className="btn btn-secondary btn-md btn-pill mt-4" style={{ display: 'inline-block' }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
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
    const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      
      const result = await updateUser({
        resume: {
          name: selectedFile.name,
          size: `${sizeMB} MB`,
          type: selectedFile.type,
          uploadedAt: new Date().toISOString(),
          url: base64Data
        }
      } as any);

      setIsUploading(false);
      if (result.success) {
        showToast('Resume uploaded successfully! 🎉', 'success');
        navigate('/dashboard');
      } else {
        showToast(result.error || 'Failed to upload resume', 'error');
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      showToast('Failed to read file', 'error');
    };

    reader.readAsDataURL(selectedFile);
  };

  const sizeMB = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0';

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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="upload-text">
              <h3>Upload Your Resume</h3>
              <p>Drag & drop your file here, or <span className="browse-link">browse</span></p>
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                Supports PDF, DOC, DOCX, JPG, PNG (Max 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="file-info">
              <h4>{selectedFile.name}</h4>
              <p>{sizeMB} MB</p>
            </div>
            <button className="file-remove" onClick={removeFile}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
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
                Uploading...
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
