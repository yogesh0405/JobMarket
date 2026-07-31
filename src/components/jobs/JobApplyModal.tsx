import React from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Mail, Phone, MapPin, Wrench, FileText, CheckCircle2, X, Briefcase, Clock, ShieldCheck, Sparkles 
} from 'lucide-react';
import { User as UserType } from '../../types';

interface JobApplyModalProps {
  job: any;
  user: UserType;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isApplying: boolean;
}

export const JobApplyModal: React.FC<JobApplyModalProps> = ({
  job,
  user,
  onClose,
  onConfirm,
  isApplying
}) => {
  if (!job || !user) return null;

  const skillsList: string[] = Array.isArray(user.skills)
    ? user.skills
    : typeof user.skills === 'string'
    ? (user.skills as string).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '6px',
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.2)',
          background: '#ffffff',
          border: '1.5px solid #cbd5e1'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1.5px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #344BFD 100%)',
            color: '#ffffff',
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              <span>Confirm Job Application</span>
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', opacity: 0.9 }}>
              Review your profile & resume before submitting to {job.company || 'Employer'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: '#f8fafc'
          }}
        >
          {/* Target Job Summary */}
          <div
            style={{
              background: '#ffffff',
              padding: '14px',
              borderRadius: '6px',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '6px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#344BFD',
                flexShrink: 0
              }}
            >
              <Briefcase size={22} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                {job.title}
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569', fontWeight: '600' }}>
                {job.company} • {job.location || 'Maharashtra'}
              </p>
            </div>
          </div>

          {/* Candidate Profile Details To Send */}
          <div
            style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '6px',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your Application Profile Specs
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} style={{ color: '#344BFD' }} />
                  <span>FULL NAME</span>
                </div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>
                  {user.name}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} style={{ color: '#2563eb' }} />
                  <span>EMAIL ADDRESS</span>
                </div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '800', marginTop: '2px', wordBreak: 'break-all' }}>
                  {user.email}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} style={{ color: '#16a34a' }} />
                  <span>PHONE NUMBER</span>
                </div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>
                  {user.phone || 'Not Provided'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wrench size={12} style={{ color: '#344BFD' }} />
                  <span>PRIMARY TRADE</span>
                </div>
                <div style={{ fontSize: '13px', color: '#344BFD', fontWeight: '800', marginTop: '2px' }}>
                  {user.tradeSpecialization || user.headline || 'Industrial Specialist'}
                </div>
              </div>
            </div>

            {/* Attached Resume */}
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: '#344BFD' }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                    {user.resume?.name || 'Candidate Resume Attachment'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                    Submitted along with profile specs
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', padding: '2px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px', fontWeight: '700' }}>
                Attached ✓
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1.5px solid #cbd5e1',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            style={{
              padding: '9px 18px',
              borderRadius: '4px',
              border: '1.5px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isApplying}
            style={{
              padding: '10px 22px',
              borderRadius: '4px',
              border: 'none',
              background: '#344BFD',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13.5px',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(52, 75, 253, 0.35)'
            }}
          >
            {isApplying ? (
              <>
                <div className="spinner-sm" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Confirm & Submit Application</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
