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

  // Determine missing profile sections
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
    <div className="modal-backdrop" onClick={onClose}>
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
          borderRadius: '0px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1'
        }}
      >
        {/* Top Active Indicator Line */}
        <div style={{ height: '3px', background: '#2563EB', flexShrink: 0 }} />

        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '0px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.2px' }}>
                Confirm Job Application
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                Review specifications before submitting to <strong style={{ color: '#0F172A' }}>{job.company || 'Employer'}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '0px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
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
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: '#FFFFFF'
          }}
        >
          {/* Missing Profile Alert Banner */}
          {missingSections.length > 0 && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '0px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 220px' }}>
                <AlertTriangle size={16} style={{ color: '#D97706', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#B45309' }}>
                    Incomplete Profile ({missingSections.length} Missing)
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#92400E', marginTop: '1px', fontWeight: '600' }}>
                    Missing: {missingSections.join(', ')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpdateProfile}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0px',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontWeight: '700',
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

          {/* Job Target Summary */}
          <div
            style={{
              background: '#F8FAFC',
              padding: '12px 14px',
              borderRadius: '0px',
              border: '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '0px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                flexShrink: 0
              }}
            >
              <Briefcase size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {job.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={13} style={{ color: '#64748B' }} />
                  {job.company}
                </span>
                <span style={{ color: '#94A3B8' }}>•</span>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={12} style={{ color: '#2563EB' }} />
                  {job.location || 'Maharashtra'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Profile Specifications (Clean Key-Value Rows, No Nested Cards) */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '14px',
              borderRadius: '0px',
              border: '1px solid #CBD5E1',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} style={{ color: '#2563EB' }} />
                CANDIDATE APPLICATION SPECS
              </span>
              <span style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: '700', textTransform: 'none' }}>
                ✓ Official Record
              </span>
            </div>

            {/* 2-Column Key-Value Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 16px' }}>
              
              {/* Full Name */}
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={11} style={{ color: '#2563EB' }} />
                  <span>Full Name</span>
                </div>
                <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: '700', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
              </div>

              {/* Email Address */}
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={11} style={{ color: '#2563EB' }} />
                  <span>Email</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: '700', marginTop: '2px', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>

              {/* Phone Number */}
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={11} style={{ color: '#2563EB' }} />
                  <span>Mobile Phone</span>
                </div>
                <div style={{ fontSize: '12.5px', color: user.phone ? '#0F172A' : '#DC2626', fontWeight: '700', marginTop: '2px' }}>
                  {user.phone ? `+91 ${user.phone}` : '⚠️ Not provided'}
                </div>
              </div>

              {/* Location */}
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={11} style={{ color: '#2563EB' }} />
                  <span>Location</span>
                </div>
                <div style={{ fontSize: '12.5px', color: user.location ? '#0F172A' : '#DC2626', fontWeight: '700', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.location || '⚠️ Not provided'}
                </div>
              </div>

              {/* Primary Trade */}
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wrench size={11} style={{ color: '#2563EB' }} />
                  <span>Primary Trade</span>
                </div>
                <div style={{ fontSize: '12.5px', color: user.tradeSpecialization ? '#2563EB' : '#DC2626', fontWeight: '700', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.tradeSpecialization || user.headline || '⚠️ Not specified'}
                </div>
              </div>

              {/* Preferred Shift */}
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} style={{ color: '#2563EB' }} />
                  <span>Preferred Shift</span>
                </div>
                <div style={{ fontSize: '12.5px', color: user.preferredShift ? '#0F172A' : '#DC2626', fontWeight: '700', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.preferredShift || 'Any Shift'}
                </div>
              </div>

            </div>

            {/* Section Separator */}
            <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '4px 0' }} />

            {/* Technical Skills */}
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={12} style={{ color: '#2563EB' }} />
                  <span>Skills & Competencies</span>
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: '700', color: skillsList.length >= 5 ? '#16A34A' : '#D97706' }}>
                  {skillsList.length}/5 Added
                </span>
              </div>

              {skillsList.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        color: '#0F172A'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '600' }}>
                  No skills specified
                </div>
              )}
            </div>

            {/* Work Experience */}
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <Briefcase size={12} style={{ color: '#2563EB' }} />
                <span>Work Experience History</span>
              </div>
              {expList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {expList.map((exp: any, idx: number) => (
                    <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
                        {exp.title} {exp.company ? `— ${exp.company}` : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                        {exp.duration || exp.years || '1 Year'} {exp.description ? `• ${exp.description}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                  No work experience entries added
                </div>
              )}
            </div>

            {/* Education */}
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <GraduationCap size={12} style={{ color: '#2563EB' }} />
                <span>Education & Trade Certs</span>
              </div>
              {eduList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {eduList.map((edu: any, idx: number) => (
                    <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
                        {edu.degree} {edu.institution ? `— ${edu.institution}` : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                        Passing Year: {edu.year || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                  No education entries added
                </div>
              )}
            </div>

            {/* Resume Attachment Status */}
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '0px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
                <FileText size={18} style={{ color: hasResume ? '#2563EB' : '#DC2626', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: hasResume ? '#0F172A' : '#DC2626' }}>
                    {hasResume ? (user.resume?.name || 'Resume Attachment PDF') : 'No Resume Uploaded'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                    {hasResume ? 'Document will be attached to application' : 'Upload CV in profile to share with employer'}
                  </div>
                </div>
              </div>

              {hasResume ? (
                <span style={{ fontSize: '11px', padding: '2px 8px', background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', borderRadius: '0px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} />
                  Attached
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  style={{ fontSize: '11.5px', padding: '4px 10px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '0px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Upload CV
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #CBD5E1',
            background: '#FFFFFF',
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
              padding: '9px 16px',
              borderRadius: '0px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              fontWeight: '700',
              fontSize: '12.5px',
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
              maxWidth: '260px',
              padding: '10px 18px',
              borderRadius: '0px',
              border: 'none',
              background: '#2563EB',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '13px',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isApplying ? (
              <>
                <div className="spinner-sm" style={{ width: '15px', height: '15px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
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
