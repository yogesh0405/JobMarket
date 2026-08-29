import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Resume } from '../../types';
import { apiFetch } from '../../utils/api';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Printer, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  AlertCircle, 
  Loader2,
  Maximize2
} from 'lucide-react';

interface ResumePreviewModalProps {
  resume: Resume | null;
  onClose: () => void;
  userId?: string;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({ resume, onClose, userId }) => {
  const [objectUrl, setObjectUrl] = useState<string>('');
  const [rawUrl, setRawUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (!resume) {
      setObjectUrl('');
      setRawUrl('');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMsg('');
    setZoomLevel(100);
    setRotation(0);

    const convertBase64ToBlobUrl = (base64Str: string, mime: string) => {
      try {
        const base64Parts = base64Str.split(',');
        const cleanBase64 = base64Parts.length > 1 ? base64Parts[1] : base64Str;
        const resolvedMime = base64Parts.length > 1 && base64Parts[0].includes(';') 
          ? base64Parts[0].split(';')[0].split(':')[1] 
          : mime;

        const byteCharacters = atob(cleanBase64);
        const sliceSize = 1024;
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          byteArrays.push(new Uint8Array(byteNumbers));
        }
        const blob = new Blob(byteArrays, { type: resolvedMime });
        return URL.createObjectURL(blob);
      } catch (e) {
        console.error('Error converting base64 to Blob URL:', e);
        return base64Str;
      }
    };

    const processUrl = async (urlStr: string) => {
      if (!urlStr) {
        setErrorMsg('No resume file URL or content found');
        setLoading(false);
        return;
      }

      setRawUrl(urlStr);

      const fileNameLower = (resume.name || '').toLowerCase();
      const isPdf = (resume.type && resume.type.includes('pdf')) || 
        fileNameLower.endsWith('.pdf') || 
        urlStr.toLowerCase().includes('.pdf') ||
        urlStr.startsWith('data:application/pdf');

      const isImg = !isPdf && (
        (resume.type && resume.type.startsWith('image/')) || 
        /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileNameLower) || 
        urlStr.startsWith('data:image/') ||
        (urlStr.includes('/image/upload/') && !urlStr.toLowerCase().includes('.pdf'))
      );

      if (urlStr.startsWith('data:')) {
        const mime = isImg ? (resume.type || 'image/jpeg') : 'application/pdf';
        const blobUrl = convertBase64ToBlobUrl(urlStr, mime);
        if (isMounted) {
          setObjectUrl(blobUrl);
          setLoading(false);
        }
      } else if (urlStr.startsWith('blob:')) {
        if (isMounted) {
          setObjectUrl(urlStr);
          setLoading(false);
        }
      } else if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        if (isImg) {
          if (isMounted) {
            setObjectUrl(urlStr);
            setLoading(false);
          }
        } else {
          // Fetch remote PDF into memory and create a local Blob URL for in-app native display
          try {
            const resp = await fetch(urlStr);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const blob = await resp.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(pdfBlob);
            if (isMounted) {
              setObjectUrl(blobUrl);
              setLoading(false);
            }
          } catch (fetchErr: any) {
            console.warn('Failed to fetch remote PDF blob:', fetchErr);
            if (isMounted) {
              setObjectUrl(urlStr);
              setLoading(false);
            }
          }
        }
      } else {
        if (isMounted) {
          setObjectUrl(urlStr);
          setLoading(false);
        }
      }
    };

    if (resume.url) {
      processUrl(resume.url);
      return;
    }

    const targetUserId = userId || (resume as any)?.userId;
    const fetchUrl = targetUserId ? `/api/v1/auth/resume?userId=${targetUserId}` : '/api/v1/auth/resume';

    apiFetch(fetchUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch resume file');
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        if (data.success && data.url) {
          processUrl(data.url);
        } else {
          throw new Error('Resume file not found');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        if (resume.url) {
          processUrl(resume.url);
        } else {
          console.error(err);
          setErrorMsg('Failed to load resume file. Please verify upload.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resume, userId]);

  if (!resume) return null;

  const fileNameLower = (resume.name || '').toLowerCase();
  const isPdf = (resume.type && resume.type.includes('pdf')) || 
    fileNameLower.endsWith('.pdf') || 
    (objectUrl && objectUrl.toLowerCase().includes('.pdf')) ||
    (rawUrl && rawUrl.toLowerCase().includes('.pdf'));

  const isImage = !isPdf && (
    (resume.type && resume.type.startsWith('image/')) || 
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileNameLower) || 
    objectUrl.startsWith('data:image/') ||
    (objectUrl.includes('/image/upload/') && !objectUrl.toLowerCase().includes('.pdf'))
  );

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = async () => {
    if (!objectUrl && !rawUrl) return;
    setIsDownloading(true);
    try {
      const target = objectUrl || rawUrl;
      const downloadName = resume.name || (isImage ? 'Resume_Image.jpg' : 'Resume_Document.pdf');

      if (target.startsWith('blob:') || target.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = target;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const resp = await fetch(target);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
      }
    } catch (err) {
      console.warn('Blob download fallback:', err);
      window.open(rawUrl || objectUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (isImage) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${resume.name || 'Resume Document'}</title>
              <style>
                body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${objectUrl || rawUrl}" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      if (objectUrl) {
        const printWindow = window.open(objectUrl, '_blank');
        if (printWindow) {
          printWindow.focus();
        }
      }
    }
  };

  return createPortal(
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'rgba(15, 23, 42, 0.82)', 
        zIndex: 99999,
        padding: '16px'
      }}
    >
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '100%', 
          maxWidth: '1020px', 
          height: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          background: '#FFFFFF', 
          borderRadius: '14px', 
          overflow: 'hidden', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #CBD5E1'
        }}
      >
        {/* Header Bar */}
        <div 
          style={{ 
            padding: '12px 20px', 
            borderBottom: '1px solid #E2E8F0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: '#FFFFFF',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: '#EFF6FF', 
              color: '#2563EB', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {resume.name || (isImage ? 'Resume_Image.jpg' : 'Resume_Document.pdf')}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                {isImage ? 'Image Document' : 'PDF Document'} {resume.size ? `• ${resume.size}` : ''}
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {objectUrl && (
              <a
                href={objectUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new window"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={14} />
                <span className="hidden-mobile">Open Window</span>
              </a>
            )}

            <button 
              onClick={onClose} 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: '#F1F5F9', 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                color: '#64748B' 
              }}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* In-Modal Viewer Body */}
        <div 
          style={{ 
            flex: 1, 
            padding: 0, 
            background: '#1E293B', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#FFFFFF' }}>
              <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 12px', color: '#3B82F6' }} />
              <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Opening Resume in App...</h4>
              <p style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '4px' }}>Rendering preview canvas</p>
            </div>
          ) : errorMsg ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#FFFFFF', maxWidth: '400px' }}>
              <AlertCircle size={44} color="#EF4444" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{errorMsg}</h4>
              {rawUrl && (
                <div style={{ marginTop: '14px' }}>
                  <a 
                    href={rawUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    Open Document Link
                  </a>
                </div>
              )}
            </div>
          ) : isImage && objectUrl ? (
            /* Direct Image Viewer with Zoom & Rotate */
            <div 
              style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'auto',
                padding: '20px'
              }}
            >
              <img 
                src={objectUrl} 
                alt={resume.name || 'Resume Document'} 
                style={{ 
                  maxWidth: zoomLevel === 100 ? '100%' : 'none', 
                  maxHeight: zoomLevel === 100 ? '100%' : 'none', 
                  width: zoomLevel !== 100 ? `${zoomLevel}%` : 'auto',
                  objectFit: 'contain', 
                  borderRadius: '6px', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease, width 0.2s ease'
                }} 
              />
            </div>
          ) : objectUrl ? (
            /* Direct Native In-App PDF Viewer (No Auto-Download) */
            <div style={{ width: '100%', height: '100%', position: 'relative', background: '#334155' }}>
              <iframe 
                src={`${objectUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                title={resume.name || 'Resume Document'} 
                width="100%" 
                height="100%" 
                style={{ border: 'none', width: '100%', height: '100%', display: 'block', background: '#334155' }}
              />
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
              <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Preview Not Available</h4>
            </div>
          )}
        </div>

        {/* Footer Toolbar */}
        <div 
          style={{ 
            padding: '10px 18px', 
            borderTop: '1px solid #E2E8F0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '8px', 
            flexWrap: 'wrap',
            background: '#F8FAFC',
            flexShrink: 0
          }}
        >
          {/* Left Controls (Zoom for image) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isImage && (
              <>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                  <span>Zoom In</span>
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                  <span>Zoom Out</span>
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Rotate"
                >
                  <RotateCw size={14} />
                  <span>Rotate</span>
                </button>
              </>
            )}
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn btn-secondary btn-sm"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '7px 16px', 
                borderRadius: '6px', 
                fontWeight: '700', 
                fontSize: '12.5px', 
                cursor: 'pointer', 
                background: '#F8FAFC', 
                color: '#0F172A', 
                border: '1px solid #CBD5E1'
              }}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download</span>
                </>
              )}
            </button>

            <button 
              type="button"
              className="btn btn-primary btn-sm" 
              onClick={onClose} 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px', 
                borderRadius: '6px', 
                fontWeight: '700', 
                fontSize: '12.5px', 
                background: '#1B4FDF', 
                color: '#FFFFFF', 
                border: 'none', 
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(27, 79, 223, 0.25)'
              }}
            >
              <X size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
