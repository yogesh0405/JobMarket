import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Wrench, FileText, CheckCircle2, X, Briefcase, Clock, 
  ShieldCheck, GraduationCap, Award, ArrowRight, Building2, Check, AlertTriangle
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
  const navigate = useNavigate();

  if (!job || !user) return null;

  // Extract skills safely
  const skillsList: string[] = Array.isArray(user.skills)
    ? user.skills
    : typeof user.skills === 'string'
    ? (user.skills as string).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Extract experience safely
  const expList: any[] = Array.isArray(user.experience)
    ? user.experience
    : typeof user.experience === 'string'
    ? ((): any[] => { try { return JSON.parse(user.experience); } catch (_) { return []; } })()
    : [];

  // Extract education safely
  const eduList: any[] = Array.isArray(user.education)
    ? user.education
    : typeof user.education === 'string'
    ? ((): any[] => { try { return JSON.parse(user.education); } catch (_) { return []; } })()
    : [];

  const hasResume = !!(user.resume && (user.resume.url || user.resume.name));

  // Determine all missing sections
  const missingSections: string[] = [];
  if (!user.phone) missingSections.push('Phone Number');
  if (!user.location) missingSections.push('Location');
  if (!user.tradeSpecialization) missingSections.push('Primary Trade');
  if (!user.preferredShift) missingSections.push('Preferred Shift');
  if (skillsList.length < 5) missingSections.push(`Skills (${skillsList.length}/5 min)`);
  if (expList.length === 0) missingSections.push('Work Experience');
  if (eduList.length === 0) missingSections.push('Education');
  if (!hasResume) missingSections.push('Resume CV Document');

  const handleUpdateProfile = () => {
    onClose();
    navigate('/profile');
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100, padding: '12px' }}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '580px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.18)',
          background: '#ffffff',
          border: '1px solid #cbd5e1'
        }}
      >
        {/* Top Gradient Bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%)', flexShrink: 0 }} />

        {/* Clean Light Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.2px' }}>
                Confirm Job Application
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Review candidate profile specs before submitting to <strong style={{ color: '#0f172a' }}>{job.company || 'Employer'}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: '#f8fafc'
          }}
        >
          {/* Missing Profile Alert Box */}
          {missingSections.length > 0 && (
            <div
              style={{
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(250, 173, 20, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 240px' }}>
                <AlertTriangle size={18} style={{ color: '#d48806', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#8c6100' }}>
                    Incomplete Profile ({missingSections.length} Missing)
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#b57200', marginTop: '2px', fontWeight: '600', lineHeight: 1.35 }}>
                    Missing: {missingSections.join(', ')}. Complete profile for 5x response rate!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpdateProfile}
                style={{
                  background: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Edit Profile</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Target Job Summary */}
          <div
            style={{
              background: '#ffffff',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                flexShrink: 0
              }}
            >
              <Briefcase size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {job.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={13} style={{ color: '#64748b' }} />
                  {job.company}
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={12} style={{ color: '#0284c7' }} />
                  {job.location || 'Maharashtra'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Profile Specifications Card */}
          <div
            style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: '#2563eb' }} />
                Candidate Application Specs
              </span>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600', textTransform: 'none' }}>
                Sent to employer
              </span>
            </div>

            {/* 1. Basic Information Grid (Aligned for Mobile & Desktop) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
              
              {/* Full Name */}
              <div style={{ background: '#ffffff', padding: '9px 11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={11} style={{ color: '#2563eb' }} />
                  <span>FULL NAME</span>
                </div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '800', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
              </div>

              {/* Email Address */}
              <div style={{ background: '#ffffff', padding: '9px 11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={11} style={{ color: '#0284c7' }} />
                  <span>EMAIL ADDRESS</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: '800', marginTop: '2px', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>

              {/* Phone Number */}
              <div style={{ background: user.phone ? '#ffffff' : '#fff1f2', padding: '9px 11px', borderRadius: '6px', border: user.phone ? '1px solid #cbd5e1' : '1px solid #fecdd3', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '10px', color: user.phone ? '#64748b' : '#e11d48', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={11} style={{ color: user.phone ? '#16a34a' : '#e11d48' }} />
                  <span>PHONE NUMBER</span>
                </div>
                <div style={{ fontSize: '12.5px', color: user.phone ? '#0f172a' : '#e11d48', fontWeight: '800', marginTop: '2px' }}>
                  {user.phone || '⚠️ Missing'}
                </div>
              </div>

              {/* Location */}
              <div style={{ background: user.location ? '#ffffff' : '#fff1f2', padding: '9px 11px', borderRadius: '6px', border: user.location ? '1px solid #cbd5e1' : '1px solid #fecdd3', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '10px', color: user.location ? '#64748b' : '#e11d48', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={11} style={{ color: '#e11d48' }} />
                  <span>LOCATION</span>
                </div>
                <div style={{ fontSize: '12.5px', color: user.location ? '#0f172a' : '#e11d48', fontWeight: '800', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.location || '⚠️ Missing'}
                </div>
              </div>

              {/* Primary Trade */}
              <div style={{ background: user.tradeSpecialization ? '#ffffff' : '#fff1f2', padding: '9px 11px', borderRadius: '6px', border: user.tradeSpecialization ? '1px solid #cbd5e1' : '1px solid #fecdd3', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '10px', color: user.tradeSpecialization ? '#64748b' : '#e11d48', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wrench size={11} style={{ color: '#2563eb' }} />
                  <span>PRIMARY TRADE</span>
                </div>
                <div style={{ fontSize: '12.5px', color: user.tradeSpecialization ? '#2563eb' : '#e11d48', fontWeight: '800', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.tradeSpecialization || user.headline || '⚠️ Missing'}
                </div>
              </div>

              {/* Preferred Shift */}
              <div style={{ background: user.preferredShift ? '#ffffff' : '#fff1f2', padding: '9px 11px', borderRadius: '6px', border: user.preferredShift ? '1px solid #cbd5e1' : '1px solid #fecdd3', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '10px', color: user.preferredShift ? '#64748b' : '#e11d48', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} style={{ color: '#d97706' }} />
                  <span>PREFERRED SHIFT</span>
                </div>
                <div style={{ fontSize: '12.5px', color: user.preferredShift ? '#0f172a' : '#e11d48', fontWeight: '800', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.preferredShift || '⚠️ Missing'}
                </div>
              </div>

            </div>

            {/* 2. Skills & Technical Expertise */}
            <div style={{ background: skillsList.length >= 5 ? '#ffffff' : '#fffbe6', padding: '12px', borderRadius: '6px', border: skillsList.length >= 5 ? '1px solid #cbd5e1' : '1px solid #fde68a', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={12} style={{ color: '#2563eb' }} />
                  <span>SKILLS & EXPERTISE</span>
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: skillsList.length >= 5 ? '#16a34a' : '#d97706', background: skillsList.length >= 5 ? '#dcfce7' : '#fef3c7', padding: '2px 6px', borderRadius: '10px' }}>
                  {skillsList.length}/5 Skills Added
                </span>
              </div>
              {skillsList.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {skillsList.length < 5 && (
                    <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '700', alignSelf: 'center', marginLeft: '2px' }}>
                      ⚠️ Add {5 - skillsList.length} more skill{5 - skillsList.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '700' }}>
                  ⚠️ Missing — No skills added yet (Minimum 5 required)
                </div>
              )}
            </div>

            {/* 3. Work Experience History */}
            <div style={{ background: expList.length > 0 ? '#ffffff' : '#fff1f2', padding: '12px', borderRadius: '6px', border: expList.length > 0 ? '1px solid #cbd5e1' : '1px solid #fecdd3', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <Briefcase size={12} style={{ color: '#0284c7' }} />
                <span>WORK EXPERIENCE HISTORY</span>
              </div>
              {expList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {expList.map((exp: any, idx: number) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '3px solid #0284c7', padding: '8px 10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                        {exp.title} {exp.company ? `at ${exp.company}` : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '1px' }}>
                        {exp.duration || exp.years || '1 Year'} {exp.description ? `• ${exp.description}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#e11d48', fontWeight: '700' }}>
                  ⚠️ Missing — No work experience entries added
                </div>
              )}
            </div>

            {/* 4. Education History */}
            <div style={{ background: eduList.length > 0 ? '#ffffff' : '#fff1f2', padding: '12px', borderRadius: '6px', border: eduList.length > 0 ? '1px solid #cbd5e1' : '1px solid #fecdd3', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <GraduationCap size={12} style={{ color: '#16a34a' }} />
                <span>EDUCATION HISTORY</span>
              </div>
              {eduList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {eduList.map((edu: any, idx: number) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '3px solid #16a34a', padding: '8px 10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                        {edu.degree} {edu.institution ? `— ${edu.institution}` : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '1px' }}>
                        Passing Year: {edu.year || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#e11d48', fontWeight: '700' }}>
                  ⚠️ Missing — No education details added
                </div>
              )}
            </div>

            {/* 5. Resume Attachment Status */}
            <div style={{ background: hasResume ? '#ffffff' : '#fff1f2', padding: '12px', borderRadius: '6px', border: hasResume ? '1px solid #cbd5e1' : '1px solid #fecdd3', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: hasResume ? '#eff6ff' : '#ffe4e6',
                    border: hasResume ? '1px solid #bfdbfe' : '1px solid #fecdd3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: hasResume ? '#2563eb' : '#e11d48',
                    flexShrink: 0
                  }}
                >
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: hasResume ? '#0f172a' : '#e11d48' }}>
                    {hasResume ? (user.resume?.name || 'Candidate Resume Attachment') : '⚠️ Missing — No Resume Uploaded'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                    {hasResume ? 'Document attached & sent to employer' : 'Upload your resume in profile before applying'}
                  </div>
                </div>
              </div>

              {hasResume ? (
                <span style={{ fontSize: '11px', padding: '3px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} />
                  Attached
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  style={{ fontSize: '11.5px', padding: '5px 10px', background: '#e11d48', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Upload CV
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
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
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
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
              flex: 1,
              maxWidth: '280px',
              padding: '11px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13.5px',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isApplying ? (
              <>
                <div className="spinner-sm" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                <span>Confirm & Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
