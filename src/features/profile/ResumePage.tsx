import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { showToast } = useToast();

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = () => {
    if (!selectedFile) {
      showToast('Please select a file', 'error');
      return;
    }

    const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    
    updateUser({
      resume: {
        name: selectedFile.name,
        size: `${sizeMB} MB`,
        type: selectedFile.type,
        uploadedAt: new Date().toISOString()
      }
    });

    showToast('Resume uploaded successfully! 🎉', 'success');
    navigate('/dashboard');
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
          <Link to="/dashboard" className="btn btn-secondary btn-lg btn-pill">Skip</Link>
          <button
            className="btn btn-primary btn-lg btn-pill"
            disabled={!selectedFile}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
export default ResumePage;
