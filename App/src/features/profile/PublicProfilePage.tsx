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
  User
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
  const headline = profileUser.headline || profileUser.trade_specialization || 'Industrial Specialist';

  // Format skills list
  const rawSkills = safeJsonParse(profileUser.skills, profileUser.skills);
  const skillsList: string[] = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === 'string'
    ? rawSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  // Summary / Bio calculation (safely handling string vs object)
  const rawBio = profileUser.bio || profileUser.summary || profileUser.about;
  const bioText = (typeof rawBio === 'string' && rawBio.trim() && !rawBio.includes('[object Object]'))
    ? rawBio.trim()
    : 'Not provided';

  const expDisplay = getExperienceDisplay(profileUser.experience);
  const eduDisplay = getEducationDisplay(profileUser.education || profileUser.qualification);
  const shiftDisplay = profileUser.preferred_shift || profileUser.preferredShift ? `${profileUser.preferred_shift || profileUser.preferredShift} • Notice: Immediate` : 'Not provided';

  const busVal = profileUser.requires_bus ?? profileUser.requiresBus;
  const accVal = profileUser.requires_accommodation ?? profileUser.requiresAccommodation;
  const transportDisplay = (busVal !== undefined || accVal !== undefined)
    ? `Bus: ${busVal ? 'Required ✓' : 'Not Required'} • Accommodation: ${accVal ? 'Required ✓' : 'Not Required'}`
    : 'Not provided';

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '0 0 60px 0' }}>
      
      {/* FULL-WIDTH HERO HEADER SECTION (Solid Primary Blue #344BFD, No Margin, No Gradient) */}
      <div style={{
        backgroundColor: '#344BFD',
        width: '100%',
        padding: '16px 20px 20px 20px',
        color: '#FFFFFF',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Top Header Row with Close Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
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
                padding: '4px'
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Candidate Avatar & Name Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
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
              {profileUser.profile_picture_url && typeof profileUser.profile_picture_url === 'string' ? (
                <img 
                  src={profileUser.profile_picture_url} 
                  alt={typeof name === 'string' ? name : 'User'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: '800', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getInitials(name)}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {name}
                </h1>
                {profileUser.aadhaar_verified && (
                  <CheckCircle2 size={17} color="#4ADE80" fill="#4ADE80" style={{ stroke: '#344BFD', flexShrink: 0 }} />
                )}
              </div>
              <p style={{ fontSize: '13.5px', fontWeight: '600', color: '#DBEAFE', margin: '3px 0 0 0', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {headline}
              </p>
            </div>
          </div>

          {/* Quick Contact Toolbar Row (Call, WhatsApp, Email, Resume) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <a
              href={profileUser.phone ? `tel:${profileUser.phone}` : '#'}
              onClick={(e) => { if (!profileUser.phone) { e.preventDefault(); showToast('Phone number not provided', 'warning'); } }}
              style={{
                height: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                textDecoration: 'none'
              }}
            >
              <Phone size={14} color="#FFFFFF" />
              <span>Call</span>
            </a>

            <a
              href={profileUser.phone ? `https://wa.me/91${profileUser.phone.replace(/\D/g, '')}` : '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { if (!profileUser.phone) { e.preventDefault(); showToast('WhatsApp number not provided', 'warning'); } }}
              style={{
                height: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                textDecoration: 'none'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.004 2C6.48 2 2 6.48 2 12c0 2.17.693 4.18 1.871 5.823L2.5 21.5l3.8-1.33A9.957 9.957 0 0012.004 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.468 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
                  fill="#25D366"
                />
              </svg>
              <span>WhatsApp</span>
            </a>

            <a
              href={profileUser.email ? `mailto:${profileUser.email}` : '#'}
              onClick={(e) => { if (!profileUser.email) { e.preventDefault(); showToast('Email address not provided', 'warning'); } }}
              style={{
                height: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                textDecoration: 'none'
              }}
            >
              <Mail size={14} color="#FFFFFF" />
              <span>Email</span>
            </a>

            <button
              onClick={() => {
                if (profileUser.resume) {
                  setPreviewResume(typeof profileUser.resume === 'string' ? { url: profileUser.resume, name: `${name}_Resume.pdf` } : profileUser.resume);
                } else {
                  showToast('Resume document not provided', 'info');
                }
              }}
              style={{
                height: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <FileText size={14} color="#FFFFFF" />
              <span>Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* BODY CARDS CONTAINER */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* CARD 1: PROFESSIONAL SUMMARY */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          padding: '14px'
        }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#2563EB',
            letterSpacing: '0.6px',
            margin: '0 0 8px 0',
            textTransform: 'uppercase'
          }}>
            PROFESSIONAL SUMMARY
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#334155',
            lineHeight: '19px',
            margin: 0,
            fontWeight: '500'
          }}>
            {bioText}
          </p>
        </div>

        {/* Section Separator */}
        <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '4px 0' }} />

        {/* CARD 2: WORK & AVAILABILITY */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          padding: '14px'
        }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#2563EB',
            letterSpacing: '0.6px',
            margin: '0 0 12px 0',
            textTransform: 'uppercase'
          }}>
            WORK & AVAILABILITY
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Location Address */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={16} color="#0284C7" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>Location Address</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginTop: '1px' }}>
                  {profileUser.location || 'Not provided'}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

            {/* Work Experience */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={16} color="#2563EB" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>Work Experience</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginTop: '1px' }}>
                  {expDisplay}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

            {/* Education & Qualifications */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GraduationCap size={16} color="#16A34A" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>Education & Qualifications</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginTop: '1px' }}>
                  {eduDisplay}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

            {/* Preferred Shift & Availability */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={16} color="#D97706" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>Preferred Shift & Availability</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginTop: '1px' }}>
                  {shiftDisplay}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

            {/* Transport & Accommodation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="#2563EB" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>Bus & Accommodation Preference</div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginTop: '1px' }}>
                  {transportDisplay}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Separator */}
        <div style={{ height: '1px', backgroundColor: '#94A3B8', margin: '4px 0' }} />

        {/* CARD 3: SKILLS & COMPETENCIES */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          padding: '14px'
        }}>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#2563EB',
            letterSpacing: '0.6px',
            margin: '0 0 10px 0',
            textTransform: 'uppercase'
          }}>
            SKILLS & COMPETENCIES
          </h3>

          {skillsList.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skillsList.map((skill: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '5px 10px',
                    borderRadius: '6px'
                  }}
                >
                  <CheckCircle2 size={12} color="#2563EB" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB' }}>{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Not provided</p>
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

