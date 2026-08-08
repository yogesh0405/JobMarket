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
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (!resume) {
      setObjectUrl('');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMsg('');

    const processResumeUrl = (urlStr: string) => {
      if (!urlStr) {
        setErrorMsg('No resume document URL available');
        return;
      }

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
      } else {
        setObjectUrl(urlStr);
      }
    };

    // 1. If resume object already contains a valid URL or data URL, process it
    if (resume.url) {
      processResumeUrl(resume.url);
      setLoading(false);
      return;
    }

    // 2. Fetch from backend API if url is missing from candidate payload
    const targetUserId = userId || (resume as any)?.userId;
    const fetchUrl = targetUserId ? `/api/v1/auth/resume?userId=${targetUserId}` : '/api/v1/auth/resume';

    apiFetch(fetchUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load resume document');
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        if (data.success && data.url) {
          processResumeUrl(data.url);
        } else {
          throw new Error('Resume file not found');
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
    };
  }, [resume, userId]);

  if (!resume) return null;

  const fileNameLower = (resume.name || '').toLowerCase();
  const isPdf = resume.type === 'application/pdf' || fileNameLower.endsWith('.pdf') || objectUrl.includes('.pdf') || objectUrl.includes('data:application/pdf');
  const isImage = resume.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(fileNameLower) || objectUrl.includes('/image/upload/');

  const handleDownload = async () => {
    if (!objectUrl) return;
    setIsDownloading(true);
    try {
      if (objectUrl.startsWith('blob:') || objectUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = resume.name || 'Resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fetch cross-origin URL as blob to guarantee 100% download without NOT_FOUND
        const resp = await fetch(objectUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = resume.name || 'Resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (err) {
      console.warn('Direct blob fetch download failed, opening in new window:', err);
      window.open(objectUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', zIndex: 99999 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #ffffff)', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid var(--border, #cbd5e1)' }}>
        <div className="modal-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <h3 className="modal-title" style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            {resume.name || 'Resume Preview'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {objectUrl && (
              <a
                href={objectUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
                style={{
                  color: '#64748b',
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
            <button className="modal-close" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
          </div>
        </div>
        
        <div className="modal-body" style={{ flex: 1, padding: 0, background: '#323639', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#ffffff' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3.5px solid #ffffff', borderTopColor: '#2563eb', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Loading Resume Preview...</h3>
            </div>
          ) : errorMsg ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#ffffff' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3 style={{ fontSize: '17px', fontWeight: '700' }}>{errorMsg}</h3>
            </div>
          ) : objectUrl && isImage ? (
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'auto' }}>
              <img 
                src={objectUrl} 
                alt={resume.name || 'Resume Document'} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }} 
              />
            </div>
          ) : objectUrl ? (
            <div style={{ width: '100%', height: '100%', position: 'relative', background: '#323639' }}>
              <iframe 
                src={objectUrl}
                title={resume.name || 'Resume PDF'} 
                width="100%" 
                height="100%" 
                style={{ border: 'none', background: '#323639' }}
              />
            </div>
          ) : objectUrl ? (
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'auto' }}>
              <img 
                src={objectUrl} 
                alt={resume.name || 'Resume Document'} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }} 
              />
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#ffffff' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.7 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Preview Not Available</h3>
            </div>
          )}
        </div>
        
        <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border, #e2e8f0)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f8fafc' }}>
          {objectUrl && (
            <a 
              href={objectUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '13px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open Full Document
            </a>
          )}
          {!loading && objectUrl && (
            <button 
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', background: '#2563eb', color: '#ffffff', border: 'none' }}
            >
              {isDownloading ? (
                <span>Downloading...</span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Download Resume</span>
                </>
              )}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '8px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', background: '#e2e8f0', border: 'none', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

