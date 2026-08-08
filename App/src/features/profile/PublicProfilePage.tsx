import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Share2, 
  Copy, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2,
  Calendar,
  Clock,
  Bus,
  Home,
  User,
  Building2,
  ExternalLink
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { shareContent, getInitials, formatDate } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';

export const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const { state } = useStore();

  const targetId = id || searchParams.get('id') || currentUser?.id;

  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [previewResume, setPreviewResume] = useState<any>(null);

  useEffect(() => {
    if (!targetId) {
      setErrorMsg('No user profile specified');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg('');

    // Fetch public profile from backend
    apiFetch(`/api/v1/auth/public-profile/${targetId}`)
      .then(res => {
        if (!res.ok) throw new Error('User profile not found');
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        if (data.success && data.user) {
          setProfileUser(data.user);
        } else {
          throw new Error(data.error || 'Profile not available');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('API public profile fetch failed, checking local store:', err);

        // Fallback to local store/current user if matches or candidate list
        if (currentUser && (currentUser.id === targetId || targetId === 'me')) {
          setProfileUser({
            id: currentUser.id,
            name: currentUser.name,
            headline: currentUser.headline,
            location: currentUser.location,
            trade_specialization: currentUser.tradeSpecialization,
            skills: currentUser.skills,
            experience: currentUser.experience,
            education: currentUser.education,
            preferred_shift: currentUser.preferredShift,
            requires_bus: currentUser.requiresBus,
            requires_accommodation: currentUser.requiresAccommodation,
            profile_picture_url: currentUser.profilePictureUrl,
            resume: currentUser.resume,
            created_at: currentUser.createdAt,
            role: currentUser.role,
            company_name: currentUser.companyName,
            aadhaar_verified: currentUser.aadhaarVerified,
            phone: currentUser.phone,
            email: currentUser.email
          });
        } else {
          // Check users in state store
          const foundCandidate = state.users?.find((c: any) => c.id === targetId);
          if (foundCandidate) {
            setProfileUser({
              id: foundCandidate.id || targetId,
              name: foundCandidate.name,
              headline: foundCandidate.headline || foundCandidate.tradeSpecialization || 'ITI Industrial Candidate',
              location: foundCandidate.location,
              trade_specialization: foundCandidate.tradeSpecialization,
              skills: foundCandidate.skills,
              experience: foundCandidate.experience,
              education: foundCandidate.education,
              preferred_shift: foundCandidate.preferredShift,
              requires_bus: foundCandidate.requiresBus,
              requires_accommodation: foundCandidate.requiresAccommodation,
              profile_picture_url: foundCandidate.profilePictureUrl,
              resume: foundCandidate.resume,
              created_at: foundCandidate.createdAt || new Date().toISOString(),
              role: foundCandidate.role || 'candidate',
              aadhaar_verified: foundCandidate.aadhaarVerified !== false,
              phone: foundCandidate.phone,
              email: foundCandidate.email
            });
          } else {
            setErrorMsg('Profile not found. The link may be invalid or expired.');
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetId, currentUser, state.users]);

  const profileUrl = targetId ? `${window.location.origin}/profile/${targetId}` : window.location.href;

  const handleShare = () => {
    const title = profileUser?.name || 'User Profile';
    const text = `Check out ${profileUser?.name || 'this'}'s profile on JobMarket`;
    
    shareContent(title, text, profileUrl, () => {
      showToast('Profile link copied to clipboard! Anyone on any device can view this profile. 📋', 'success');
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    showToast('Public profile link copied! 📋', 'success');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #f8fafc)', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #cbd5e1', borderTopColor: '#2563eb', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Loading Public Profile...</h3>
        </div>
      </div>
    );
  }

  if (errorMsg || !profileUser) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #f8fafc)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #cbd5e1', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          <User size={56} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Profile Not Found</h2>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
            {errorMsg || 'The requested candidate profile could not be loaded.'}
          </p>
          <button onClick={() => navigate('/jobs')} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} />
            Explore Job Postings
          </button>
        </div>
      </div>
    );
  }

  const isCandidate = profileUser.role === 'candidate' || !profileUser.role;
  const isEmployer = profileUser.role === 'employer';
  const name = profileUser.company_name || profileUser.name || 'User Profile';
  const headline = profileUser.headline || profileUser.trade_specialization || (isEmployer ? 'Verified Industrial Employer' : 'Industrial Worker');

  return (
    <div className="public-profile-page" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Top Header Bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', maxWidth: '1000px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#475569',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Copy size={15} />
              <span>Copy Link</span>
            </button>

            <button
              onClick={handleShare}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#2563eb',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Share2 size={15} />
              <span>Share Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1000px', margin: '24px auto 0', padding: '0 16px' }}>
        
        {/* Profile Main Banner Card */}
        <div className="card" style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
          
          {/* Cover Header Banner */}
          <div style={{ height: '140px', background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #312e81 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {profileUser.role || 'Candidate'}
              </span>
              {profileUser.aadhaar_verified && (
                <span style={{ background: '#22c55e', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} /> Verified
                </span>
              )}
            </div>
          </div>

          {/* Profile Header Body */}
          <div style={{ padding: '0 28px 28px', position: 'relative', marginTop: '-50px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ width: '104px', height: '104px', borderRadius: '50%', background: '#ffffff', border: '4px solid #ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {profileUser.profile_picture_url ? (
                    <img src={profileUser.profile_picture_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getInitials(name)}
                    </div>
                  )}
                </div>

                <div style={{ paddingBottom: '4px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {name}
                  </h1>
                  <p style={{ fontSize: '14.5px', color: '#475569', margin: 0, fontWeight: '600' }}>
                    {headline}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {profileUser.email && (
                  <a
                    href={`mailto:${profileUser.email}`}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      fontWeight: '700',
                      fontSize: '13.5px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Mail size={16} />
                    <span>Email</span>
                  </a>
                )}

                {profileUser.phone && (
                  <a
                    href={`tel:${profileUser.phone}`}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      fontWeight: '700',
                      fontSize: '13.5px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Phone size={16} />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>

            {/* Location & Quick Meta */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
              {profileUser.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} style={{ color: '#2563eb' }} />
                  <strong>{profileUser.location}</strong>
                </span>
              )}

              {profileUser.trade_specialization && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={15} style={{ color: '#ea580c' }} />
                  Specialty: <strong>{profileUser.trade_specialization}</strong>
                </span>
              )}

              {profileUser.created_at && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} style={{ color: '#9333ea' }} />
                  Member since: <strong>{formatDate(profileUser.created_at)}</strong>
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Content Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Left Column: Industrial Preferences & Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Industrial Preferences */}
            {isCandidate && (
              <div className="card" style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} style={{ color: '#2563eb' }} />
                  <span>Industrial Preferences</span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={15} /> Preferred Shift:
                    </span>
                    <strong style={{ color: '#0f172a' }}>{profileUser.preferred_shift || 'Any Shift'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bus size={15} /> Bus Transport Facility:
                    </span>
                    <strong style={{ color: profileUser.requires_bus ? '#2563eb' : '#64748b' }}>
                      {profileUser.requires_bus ? 'Required ✓' : 'Not Required'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Home size={15} /> Hostel Accommodation:
                    </span>
                    <strong style={{ color: profileUser.requires_accommodation ? '#2563eb' : '#64748b' }}>
                      {profileUser.requires_accommodation ? 'Required ✓' : 'Not Required'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="card" style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                <span>Skills & Trade Expertise</span>
              </h3>

              {profileUser.skills && profileUser.skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profileUser.skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 12px',
                        background: '#eef2ff',
                        color: '#344BFD',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        border: '1px solid #c7d2fe'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No specific skills listed.</p>
              )}
            </div>

            {/* Resume Card */}
            {profileUser.resume && (profileUser.resume.url || profileUser.resume.name) && (
              <div className="card" style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} style={{ color: '#dc2626' }} />
                  <span>Resume / Curriculum Vitae</span>
                </h3>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profileUser.resume.name || 'Candidate Resume.pdf'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                        {profileUser.resume.size || 'PDF Document'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewResume(profileUser.resume)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Preview PDF
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Experience & Education */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Work Experience */}
            <div className="card" style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} style={{ color: '#2563eb' }} />
                <span>Work Experience</span>
              </h3>

              {profileUser.experience && profileUser.experience.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  {profileUser.experience.map((exp: any, index: number) => (
                    <div key={index} style={{ paddingLeft: '20px', borderLeft: '2.5px solid #3b82f6', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-6.5px', top: '2px', width: '11px', height: '11px', borderRadius: '50%', background: '#3b82f6' }}></div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px' }}>{exp.title}</h4>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', marginBottom: '4px' }}>{exp.company}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{exp.duration}</div>
                      {exp.description && <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.45 }}>{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No work experience details provided.</p>
              )}
            </div>

            {/* Education */}
            <div className="card" style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} style={{ color: '#9333ea' }} />
                <span>Education & Qualifications</span>
              </h3>

              {profileUser.education && profileUser.education.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profileUser.education.map((edu: any, index: number) => (
                    <div key={index} style={{ paddingLeft: '20px', borderLeft: '2.5px solid #9333ea', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-6.5px', top: '2px', width: '11px', height: '11px', borderRadius: '50%', background: '#9333ea' }}></div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px' }}>{edu.degree}</h4>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#7e22ce', marginBottom: '4px' }}>{edu.institution}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Year: {edu.year}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No education details provided.</p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Resume Preview Modal */}
      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          onClose={() => setPreviewResume(null)}
          userId={targetId}
        />
      )}

    </div>
  );
};
