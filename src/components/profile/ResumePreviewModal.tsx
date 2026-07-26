import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Resume } from '../../types';
import { apiFetch } from '../../utils/api';

interface ResumePreviewModalProps {
  resume: Resume | null;
  onClose: () => void;
  userId?: string;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({ resume, onClose, userId }) => {
  const [objectUrl, setObjectUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!resume) {
      setObjectUrl('');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMsg('');

    const processResumeUrl = (urlStr: string) => {
      if (urlStr.startsWith('data:')) {
        try {
          const base64Parts = urlStr.split(',');
          const base64WithoutHeader = base64Parts.length > 1 ? base64Parts[1] : urlStr;
          const mimeType = base64Parts.length > 1 ? base64Parts[0].split(';')[0].split(':')[1] : (resume.type || 'application/pdf');

          const byteCharacters = atob(base64WithoutHeader);
          const byteArrays = [];
          const sliceSize = 512;
          for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          const blob = new Blob(byteArrays, { type: mimeType });
          const blobUrl = URL.createObjectURL(blob);
          setObjectUrl(blobUrl);
        } catch (e) {
          console.error('Error converting base64 to Blob:', e);
          setObjectUrl(urlStr);
        }
      } else if (urlStr.includes('/image/upload/') && urlStr.endsWith('.pdf')) {
        // Fix Cloudinary legacy image path for PDFs
        setObjectUrl(urlStr.replace('/image/upload/', '/raw/upload/'));
      } else {
        setObjectUrl(urlStr);
      }
    };

    // If resume object already contains a valid URL or data URL, process it
    if (resume.url) {
      processResumeUrl(resume.url);
      setLoading(false);
      return;
    }

    const fetchUrl = userId ? `/api/v1/auth/resume?userId=${userId}` : '/api/v1/auth/resume';

    apiFetch(fetchUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load resume');
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        if (data.success && data.url) {
          processResumeUrl(data.url);
        } else {
          throw new Error('No resume data returned');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        if (resume.url) {
          processResumeUrl(resume.url);
        } else {
          console.error(err);
          setErrorMsg('Failed to load resume document.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resume, userId]);

  if (!resume) return null;

  const isPdf = resume.type === 'application/pdf' || resume.name.toLowerCase().endsWith('.pdf');
  const isImage = resume.type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(resume.name);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', zIndex: 99999 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div className="modal-header" style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
          <h3 className="modal-title" style={{ margin: 0, fontSize: 'var(--fs-lg)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            {resume.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {objectUrl && (
              <a
                href={objectUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
                style={{
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  textDecoration: 'none'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}
            <button className="modal-close" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
          </div>
        </div>
        
        <div className="modal-body" style={{ flex: 1, padding: 0, background: '#525659', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          {loading ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: '#ffffff' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500' }}>Loading resume...</h3>
            </div>
          ) : errorMsg ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: '#ffffff' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" style={{ marginBottom: 'var(--space-4)' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3>{errorMsg}</h3>
            </div>
          ) : objectUrl && isPdf ? (
            <div style={{ width: '100%', height: '100%', position: 'relative', background: '#323639' }}>
              <iframe 
                src={
                  objectUrl.startsWith('blob:') || objectUrl.startsWith('data:')
                    ? objectUrl
                    : `https://docs.google.com/gview?url=${encodeURIComponent(objectUrl)}&embedded=true`
                }
                title={resume.name} 
                width="100%" 
                height="100%" 
                style={{ border: 'none', background: '#323639' }}
              />
            </div>
          ) : objectUrl && isImage ? (
            <div style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'auto' }}>
              <img 
                src={objectUrl} 
                alt={resume.name} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
              />
            </div>
          ) : (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: '#ffffff' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 'var(--space-4)', opacity: 0.8 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <h3>Preview Not Available</h3>
            </div>
          )}
        </div>
        
        <div className="modal-footer" style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', background: 'var(--bg-secondary)' }}>
          {objectUrl && (
            <a 
              href={objectUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open Full Document
            </a>
          )}
          {!loading && !errorMsg && objectUrl && (
            <a 
              href={objectUrl} 
              download={resume.name} 
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', border: '1px solid var(--border)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </a>
          )}
          <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
