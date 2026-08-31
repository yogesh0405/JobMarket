import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
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
  UserCheck,
  MessageSquare,
  X,
  User,
  Building2,
  Clock,
  Bus,
  Home,
  ExternalLink
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { shareContent, getInitials } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';

const safeJsonParse = (data: any, fallback: any = null) => {
  if (!data) return fallback;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const getExperienceDisplay = (expData: any) => {
  if (!expData) return 'Not provided';
  if (typeof expData === 'string') {
    if (expData.includes('[object Object]')) return 'Not provided';
    return expData.trim() || 'Not provided';
  }
  const parsed = safeJsonParse(expData, expData);
  if (Array.isArray(parsed) && parsed.length > 0) {
    const item = parsed[0];
    if (typeof item === 'string') return item.includes('[object Object]') ? 'Not provided' : item;
    if (typeof item === 'object' && item !== null) {
      const role = item.role || item.title || item.designation || '';
      const company = item.company || item.organization || '';
      const duration = item.duration || (item.years ? `${item.years} Years` : '') || (item.startDate ? `${item.startDate} - ${item.endDate || 'Present'}` : '');
      const parts = [role, company, duration].filter(Boolean);
      return parts.length > 0 ? parts.join(' - ') : 'Not provided';
    }
  }
  if (typeof parsed === 'object' && parsed !== null) {
    const role = parsed.role || parsed.title || parsed.designation || '';
    const company = parsed.company || parsed.organization || '';
    const duration = parsed.duration || (parsed.years ? `${parsed.years} Years` : '');
    const parts = [role, company, duration].filter(Boolean);
    return parts.length > 0 ? parts.join(' - ') : 'Not provided';
  }
  return 'Not provided';
};

const getEducationDisplay = (eduData: any) => {
  if (!eduData) return 'Not provided';
  if (typeof eduData === 'string') {
    if (eduData.includes('[object Object]')) return 'Not provided';
    return eduData.trim() || 'Not provided';
  }
  const parsed = safeJsonParse(eduData, eduData);
  if (Array.isArray(parsed) && parsed.length > 0) {
    const item = parsed[0];
    if (typeof item === 'string') return item.includes('[object Object]') ? 'Not provided' : item;
    if (typeof item === 'object' && item !== null) {
      const degree = item.degree || item.qualification || item.title || '';
      const institution = item.institution || item.college || item.school || '';
      const year = item.year || item.passingYear || (item.startDate ? `${item.startDate} - ${item.endDate || ''}` : '');
      const parts = [degree, institution, year].filter(Boolean);
      return parts.length > 0 ? parts.join(' • ') : 'Not provided';
    }
  }
  if (typeof parsed === 'object' && parsed !== null) {
    const degree = parsed.degree || parsed.qualification || parsed.title || '';
    const institution = parsed.institution || parsed.college || parsed.school || '';
    const year = parsed.year || parsed.passingYear || '';
    const parts = [degree, institution, year].filter(Boolean);
    return parts.length > 0 ? parts.join(' • ') : 'Not provided';
  }
  return 'Not provided';
};

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
            email: currentUser.email,
            bio: currentUser.bio
          });
        } else {
          const foundCandidate = state.users?.find((c: any) => c.id === targetId);
          if (foundCandidate) {
            setProfileUser({
              id: foundCandidate.id || targetId,
              name: foundCandidate.name,
              headline: foundCandidate.headline || foundCandidate.tradeSpecialization || 'Industrial Worker',
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
              email: foundCandidate.email,
              bio: foundCandidate.bio
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
      showToast('Profile link copied to clipboard! 📋', 'success');
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    showToast('Public profile link copied! 📋', 'success');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '4px solid #CBD5E1', borderTopColor: '#1D4ED8', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Loading Candidate Details...</h3>
        </div>
      </div>
    );
  }

  if (errorMsg || !profileUser) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '40px 20px' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: '#FFFFFF', padding: '32px 24px', borderRadius: '14px', border: '1.5px solid #CBD5E1', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          <User size={52} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Candidate Profile Not Found</h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
            {errorMsg || 'The requested profile details could not be loaded.'}
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  const name = profileUser.name || profileUser.company_name || 'Candidate Profile';
  const headline = profileUser.headline || profileUser.trade_specialization || 'Industrial Technical Specialist';
  const location = profileUser.city
    ? `${profileUser.city}, ${profileUser.state || 'Maharashtra'}`
    : (profileUser.location || profileUser.address || 'Waluj MIDC');
  const midcZone = profileUser.midc_zone || profileUser.midcZone || profileUser.preferred_location || 'Waluj / Shendra MIDC';
  const shift = profileUser.preferred_shift || profileUser.shift_preference || profileUser.shift_timing || 'Day Shift';
  const requiresBus = profileUser.requires_bus ?? profileUser.requiresBus;
  const requiresAccommodation = profileUser.requires_accommodation ?? profileUser.requiresAccommodation;

  // Format skills list
  const rawSkills = safeJsonParse(profileUser.skills, profileUser.skills);
  const skillsList: string[] = Array.isArray(rawSkills)
    ? rawSkills.map((s: any) => typeof s === 'string' ? s.trim() : (s?.name || '')).filter(Boolean)
    : typeof rawSkills === 'string' && rawSkills.trim()
    ? rawSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  // Summary / Bio
  const rawBio = profileUser.bio || profileUser.summary || profileUser.about;
  const bioText = (typeof rawBio === 'string' && rawBio.trim() && !rawBio.includes('[object Object]'))
    ? rawBio.trim()
    : '';

  // Normalize Work Experience list
  let experienceList: any[] = [];
  let rawExp = safeJsonParse(profileUser.experience, profileUser.experience);
  if (Array.isArray(rawExp) && rawExp.length > 0) {
    experienceList = rawExp;
  } else if (typeof rawExp === 'object' && rawExp) {
    experienceList = [rawExp];
  } else if (profileUser.experience || profileUser.experience_years != null || profileUser.current_company || profileUser.trade_specialization) {
    experienceList = [
      {
        title: profileUser.trade_specialization || profileUser.headline || 'Technical Specialist',
        company: profileUser.current_company || profileUser.company_name || 'Industrial Engineering Works',
        duration: profileUser.experience_years != null ? `${profileUser.experience_years} Years Experience` : (typeof profileUser.experience === 'string' ? profileUser.experience : '2022 - Present'),
        description: profileUser.bio || profileUser.role_summary || '',
        isCurrent: true,
      },
    ];
  }

  // Normalize Education list
  let educationList: any[] = [];
  let rawEdu = safeJsonParse(profileUser.education || profileUser.qualification, profileUser.education);
  if (Array.isArray(rawEdu) && rawEdu.length > 0) {
    educationList = rawEdu;
  } else if (typeof rawEdu === 'object' && rawEdu) {
    educationList = [rawEdu];
  } else if (profileUser.highest_qualification || profileUser.education || profileUser.degree) {
    educationList = [
      {
        degree: profileUser.highest_qualification || profileUser.degree || (typeof profileUser.education === 'string' ? profileUser.education : 'ITI / Technical Diploma'),
        institution: profileUser.institute_name || profileUser.college || 'Government Industrial Training Institute (ITI)',
        year: profileUser.passing_year || profileUser.graduation_year || '2022',
      },
    ];
  }

  // Resume document info
  const rawResume = profileUser.resume || profileUser.resume_url || profileUser.resumeUrl;
  const resumeUrl = typeof rawResume === 'string' ? rawResume : rawResume?.url ? rawResume.url : '';
  const resumeName = typeof rawResume === 'object' && rawResume?.name ? rawResume.name : `${name}_Resume.pdf`;

  const phone = profileUser.phone || '';
  const email = profileUser.email || '';

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '0 0 60px 0' }}>
      
      {/* ── TOP ROYAL BLUE HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1764E8 0%, #0F4BC2 100%)',
        width: '100%',
        padding: '16px 20px 20px 20px',
        color: '#FFFFFF',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* Top Header Row with Close / Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px'
              }}
              title="Go Back"
            >
              <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px'
              }}
              title="Close"
            >
              <X size={20} color="#FFFFFF" strokeWidth={2.2} />
            </button>
          </div>

          {/* Candidate Avatar & Info Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '2.5px solid #FFFFFF',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {(() => {
                const photo = profileUser.profile_picture_url || profileUser.profilePictureUrl || profileUser.avatar_url || profileUser.avatarUrl || profileUser.avatar || profileUser.photo;
                return photo && typeof photo === 'string' ? (
                  <img 
                    src={photo} 
                    alt={typeof name === 'string' ? name : 'User'} 
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: '800', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getInitials(name)}
                  </div>
                );
              })()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{ fontSize: '19px', fontWeight: '800', color: '#FFFFFF', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {name}
                </h1>
                {(profileUser.verified || profileUser.aadhaar_verified) && (
                  <ShieldCheck size={17} color="#4ADE80" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                )}
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#DBEAFE', margin: '2px 0 0 0', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {headline}
              </p>
              <p style={{ fontSize: '12px', fontWeight: '400', color: '#BFDBFE', margin: '2px 0 0 0', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (SINGLE CARD MATCHING MOBILE APP) ── */}
      <div style={{ maxWidth: '640px', margin: '14px auto 0 auto', padding: '0 14px', boxSizing: 'border-box' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E7EBF2',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(20, 42, 80, 0.04)'
        }}>

          {/* 1. Quick Contact Action Bar (4 Pills) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '4px' }}>
            <a
              href={phone ? `tel:${phone}` : '#'}
              onClick={(e) => { if (!phone) { e.preventDefault(); showToast('Phone number not provided', 'warning'); } }}
              style={{
                height: '36px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                color: '#1764E8',
                fontSize: '11.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              <Phone size={13} color="#1764E8" />
              <span>Call</span>
            </a>

            <a
              href={phone ? `https://wa.me/91${phone.replace(/\D/g, '')}` : '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { if (!phone) { e.preventDefault(); showToast('WhatsApp number not provided', 'warning'); } }}
              style={{
                height: '36px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                color: '#15803D',
                fontSize: '11.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.004 2C6.48 2 2 6.48 2 12c0 2.17.693 4.18 1.871 5.823L2.5 21.5l3.8-1.33A9.957 9.957 0 0012.004 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.468 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
                  fill="#16A34A"
                />
              </svg>
              <span>WhatsApp</span>
            </a>

            <a
              href={email ? `mailto:${email}` : '#'}
              onClick={(e) => { if (!email) { e.preventDefault(); showToast('Email address not provided', 'warning'); } }}
              style={{
                height: '36px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                color: '#DC2626',
                fontSize: '11.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              <Mail size={13} color="#DC2626" />
              <span>Email</span>
            </a>

            <button
              onClick={() => {
                if (resumeUrl) {
                  setPreviewResume({ url: resumeUrl, name: resumeName });
                } else {
                  showToast('Resume document not provided', 'info');
                }
              }}
              style={{
                height: '36px',
                backgroundColor: '#EFF6FF',
                borderRadius: '6px',
                border: '1px solid #BFDBFE',
                color: '#1764E8',
                fontSize: '11.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <FileText size={13} color="#1764E8" />
              <span>Resume</span>
            </button>
          </div>

          {/* 2. Candidate Bio / About Candidate */}
          {bioText && (
            <>
              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#657796', letterSpacing: '0.5px', marginBottom: '8px' }}>
                ABOUT CANDIDATE
              </div>
              <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '19px' }}>
                {bioText}
              </div>
            </>
          )}

          {/* 3. WORK EXPERIENCE TIMELINE */}
          <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#657796', letterSpacing: '0.5px', marginBottom: '10px' }}>
            WORK EXPERIENCE
          </div>

          {experienceList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {experienceList.map((item, idx) => {
                const isCurrent = idx === 0 || item?.isCurrent;
                const isLast = idx === experienceList.length - 1;
                const durationText = item?.duration || (item?.years ? `${item.years} Yrs Experience` : '2021 - Present');
                const roleTitle = item?.title || item?.role || 'Technical Specialist';
                const companyName = item?.company || '';
                const displayHeading = companyName ? `${roleTitle} at ${companyName}` : roleTitle;
                const descText = item?.description || roleTitle;

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'stretch' }}>
                    <div style={{ width: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '8px', position: 'relative', flexShrink: 0 }}>
                      {!isLast && (
                        <div style={{
                          position: 'absolute',
                          top: '18px',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '1.5px',
                          backgroundColor: '#CBD5E1',
                          zIndex: 1
                        }} />
                      )}
                      <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#1E293B', marginTop: '14px', zIndex: 2, position: 'relative' }} />
                    </div>

                    <div style={{ flex: 1, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#102A5C' }}>{durationText}</span>
                        {isCurrent && (
                          <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: '9.5px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                            Current Role
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#102A5C' }}>{displayHeading}</div>
                      {descText && <div style={{ fontSize: '11px', color: '#657796', marginTop: '2px' }}>{descText}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '11px', color: '#657796' }}>
              No work experience details provided.
            </div>
          )}

          {/* 4. EDUCATION & QUALIFICATIONS TIMELINE */}
          <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#657796', letterSpacing: '0.5px', marginBottom: '10px' }}>
            EDUCATION & QUALIFICATIONS
          </div>

          {educationList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {educationList.map((item, idx) => {
                const isLast = idx === educationList.length - 1;
                const yearText = item?.year ? `Class of ${item.year}` : (item?.duration || 'Class of 2022');
                const degreeText = item?.degree || item?.qualification || 'ITI / Diploma Degree';
                const instText = item?.institution || item?.college || item?.school || 'Government Technical Institute';

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'stretch' }}>
                    <div style={{ width: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '8px', position: 'relative', flexShrink: 0 }}>
                      {!isLast && (
                        <div style={{
                          position: 'absolute',
                          top: '18px',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '1.5px',
                          backgroundColor: '#CBD5E1',
                          zIndex: 1
                        }} />
                      )}
                      <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#1E293B', marginTop: '14px', zIndex: 2, position: 'relative' }} />
                    </div>

                    <div style={{ flex: 1, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#102A5C', marginBottom: '2px' }}>{yearText}</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#102A5C' }}>{degreeText}</div>
                      {instText && <div style={{ fontSize: '11px', color: '#657796', marginTop: '2px' }}>{instText}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '11px', color: '#657796' }}>
              No education details provided.
            </div>
          )}

          {/* 5. LOCATION & WORK PREFERENCES */}
          <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#657796', letterSpacing: '0.5px', marginBottom: '10px' }}>
            LOCATION & WORK PREFERENCES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={15} color="#1764E8" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: '600' }}>Current Residence Location</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#102A5C', marginTop: '1px' }}>{location}</div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

            {/* MIDC Zone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={15} color="#1764E8" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: '600' }}>Preferred MIDC Industrial Zone</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#102A5C', marginTop: '1px' }}>{midcZone}</div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

            {/* Shift Mode */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={15} color="#1764E8" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: '600' }}>Preferred Shift Mode</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#102A5C', marginTop: '1px' }}>{shift}</div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

            {/* Bus Facility */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bus size={15} color="#1764E8" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: '600' }}>Company Bus Facility</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#102A5C', marginTop: '1px' }}>
                  {requiresBus ? 'Required / Depends on Company Bus Route' : 'Not Required (Own Transport)'}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

            {/* Accommodation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={15} color="#1764E8" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#657796', fontWeight: '600' }}>Hostel / Accommodation</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#102A5C', marginTop: '1px' }}>
                  {requiresAccommodation ? 'Accommodation Assistance Required' : 'Self-Arranged Local Residence'}
                </div>
              </div>
            </div>
          </div>

          {/* 6. TECHNICAL SKILLS & COMPETENCIES */}
          {skillsList.length > 0 && (
            <>
              <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#657796', letterSpacing: '0.5px', marginBottom: '10px' }}>
                TECHNICAL SKILLS & COMPETENCIES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skillsList.map((skill: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      padding: '5px 12px',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#1764E8' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A' }}>{skill}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 7. ATTACHED RESUME & BIO-DATA */}
          <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '14px 0' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#657796', letterSpacing: '0.5px', marginBottom: '10px' }}>
            ATTACHED RESUME & BIO-DATA
          </div>

          {resumeUrl ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1764E8',
                  flexShrink: 0
                }}>
                  <FileText size={18} color="#1764E8" strokeWidth={1.8} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#102A5C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {resumeName}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#16A34A', marginTop: '1px' }}>
                    ✓ Document Attached
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPreviewResume({ url: resumeUrl, name: resumeName })}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  backgroundColor: '#1764E8',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                  transition: 'opacity 0.15s ease'
                }}
              >
                <span>View</span>
                <ExternalLink size={11} color="#FFFFFF" />
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '11px', color: '#657796' }}>
              No resume PDF attached by candidate yet.
            </div>
          )}

        </div>
      </div>

      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          onClose={() => setPreviewResume(null)}
          userId={profileUser.id}
        />
      )}
    </div>
  );
};

