import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Briefcase,
  Users,
  ShieldCheck,
  Zap,
  Building2,
  Award,
  Star,
  Quote,
  Info,
  PhoneCall,
  Lock,
} from 'lucide-react';

const CORPORATE_PROFESSIONAL_IMG = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
const INDUSTRIAL_WELDER_IMG = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80';
const SOFTWARE_ENGINEER_IMG = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';

const TESTIMONIALS = [
  {
    id: '1',
    name: 'Pooja Deshmukh',
    role: 'Head of Talent Acquisition & HR',
    company: 'Apex Corporate Enterprises',
    rating: 5,
    avatarInitial: 'PD',
    avatarBg: '#1B4FDF',
    image: CORPORATE_PROFESSIONAL_IMG,
    quote:
      'We hired 40+ verified candidates across operations and sales in just one week. Direct calling and pre-verified documents saved our HR team hundreds of recruitment hours.',
  },
  {
    id: '2',
    name: 'Ramesh Kumar',
    role: 'Certified Industrial Welder & Fabricator',
    company: 'Placed at MIDC Heavy Engineering',
    rating: 5,
    avatarInitial: 'RK',
    avatarBg: '#0284C7',
    image: INDUSTRIAL_WELDER_IMG,
    quote:
      'As a welder, getting direct calls from factory owners without any agent charging money changed my life. I got my walk-in interview pass on phone and joined work with great pay!',
  },
  {
    id: '3',
    name: 'Rahul Sharma',
    role: 'Senior Software Engineer',
    company: 'Placed at TechMatrix Inc',
    rating: 5,
    avatarInitial: 'RS',
    avatarBg: '#3B82F6',
    image: SOFTWARE_ENGINEER_IMG,
    quote:
      'Applied directly to verified tech companies and got a call from the engineering manager within 3 hours. Transparent salary packages and zero commission make JobMarket unmatched.',
  },
];

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page-wrapper">
      <style>{`
        .about-page-wrapper {
          background-color: transparent;
          min-height: auto;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }

        .about-header-nav {
          display: none;
        }

        .about-container {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-sizing: border-box;
        }

        .about-card {
          background-color: #FFFFFF;
          border-radius: var(--radius-card, 8px);
          border: 1px solid #E2E8F0;
          padding: 20px 24px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
        }

        .about-features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .about-awards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        /* Mobile View (max-width: 767px) */
        @media (max-width: 767px) {
          .about-page-wrapper {
            background-color: #F8FAFC;
            min-height: 100vh;
            padding-bottom: 32px;
          }
          .about-header-nav {
            position: sticky;
            top: 0;
            z-index: 50;
            background-color: #FFFFFF;
            border-bottom: 1px solid #E2E8F0;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          .about-container {
            max-width: 100%;
            padding: 0 14px;
            gap: 10px;
          }
          .about-card {
            border-radius: var(--radius-card, 8px);
            padding: 14px;
            gap: 8px;
          }
          .about-features-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .about-awards-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
          }
        }
      `}</style>

      {/* Top Fixed Header Nav (Mobile View Only) */}
      <div className="about-header-nav">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/dashboard');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            color: '#0F172A'
          }}
        >
          <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={17} color="#1B4FDF" strokeWidth={2.2} />
          <span style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.2px'
          }}>
            About JobMarket
          </span>
        </div>

        <div style={{ width: '36px' }} />
      </div>

      <div className="about-container">

        {/* 1. HERO SPOTLIGHT CARD */}
        <div className="about-card">
          {/* Badge */}
          <div style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#EFF6FF',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #DBEAFE',
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#1B4FDF'
          }}>
            Platform Overview
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#0F172A',
            lineHeight: '22px',
            letterSpacing: '-0.2px',
            margin: 0
          }}>
            Unlock Your Full Career & Hiring Potential
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '12.5px',
            fontWeight: 400,
            color: '#475569',
            lineHeight: '18px',
            margin: 0
          }}>
            Connecting ambitious job seekers with verified enterprise employers nationwide through direct contact, transparent hiring, and intelligent matching.
          </p>

          {/* Primary Action Button */}
          <button
            onClick={() => navigate('/jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1B4FDF',
              border: 'none',
              borderRadius: '20px',
              height: '40px',
              paddingLeft: '16px',
              paddingRight: '6px',
              cursor: 'pointer',
              marginTop: '4px',
              marginBottom: '2px',
              color: '#FFFFFF',
              maxWidth: '240px'
            }}
          >
            <span style={{ fontSize: '12.5px', fontWeight: 700 }}>Explore 50,000+ Jobs</span>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowRight size={13} color="#1B4FDF" strokeWidth={2.6} />
            </div>
          </button>

          {/* Bullet Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={11} color="#1B4FDF" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500, flex: 1 }}>Direct HR calling & instant interview scheduling</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={11} color="#1B4FDF" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500, flex: 1 }}>100% verified companies & zero placement fees</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={11} color="#1B4FDF" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500, flex: 1 }}>Competitive salaries with transparent company profiles</span>
            </div>
          </div>

          {/* Social Proof Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FAF9F6',
            border: '1px solid #ECEAE4',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={CORPORATE_PROFESSIONAL_IMG} alt="User" style={{ width: '26px', height: '26px', borderRadius: '13px', border: '1.5px solid #FFFFFF', objectFit: 'cover', zIndex: 3 }} />
              <img src={INDUSTRIAL_WELDER_IMG} alt="User" style={{ width: '26px', height: '26px', borderRadius: '13px', border: '1.5px solid #FFFFFF', objectFit: 'cover', marginLeft: '-8px', zIndex: 2 }} />
              <img src={SOFTWARE_ENGINEER_IMG} alt="User" style={{ width: '26px', height: '26px', borderRadius: '13px', border: '1.5px solid #FFFFFF', objectFit: 'cover', marginLeft: '-8px', zIndex: 1 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>1.2M+ Active Job Seekers</div>
              <div style={{ fontSize: '10.5px', color: '#1B4FDF', fontWeight: 600, marginTop: '1px' }}>& 50,000+ Verified Hiring Partners</div>
            </div>
          </div>

          {/* 3-Metric Stats Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1B4FDF' }}>10M+</div>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>Applications</div>
            </div>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#E2E8F0' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1B4FDF' }}>500K+</div>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>Live Vacancies</div>
            </div>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#E2E8F0' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1B4FDF' }}>98%</div>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>Satisfaction</div>
            </div>
          </div>
        </div>

        {/* 2. PLATFORM ARCHITECTURE & CUTTING-EDGE FEATURES */}
        <div className="about-card">
          <div style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#EFF6FF',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #DBEAFE',
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#1B4FDF'
          }}>
            <Zap size={11} color="#1B4FDF" />
            <span>Platform Architecture</span>
          </div>

          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.1px', margin: '0 0 2px' }}>
            Empower Your Journey with Cutting-Edge Features
          </h2>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '17px', margin: '0 0 4px', fontWeight: 400 }}>
            Engineered with advanced mobile workflows, bank-grade encryption, and seamless interview tracking.
          </p>

          <div className="about-features-grid">
            {/* Feature 1 */}
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                  <PhoneCall size={16} strokeWidth={2.2} />
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Direct HR Call & WhatsApp</div>
              </div>
              <p style={{ fontSize: '11.5px', color: '#475569', lineHeight: '16px', margin: 0 }}>
                Directly connect with company talent leaders and HR decision makers without intermediary agencies or hidden spam.
              </p>
              <div style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', fontSize: '10px', fontWeight: 700, color: '#1B4FDF' }}>
                Instant Access
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                  <ShieldCheck size={16} strokeWidth={2.2} />
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>100% Verified Employers</div>
              </div>
              <p style={{ fontSize: '11.5px', color: '#475569', lineHeight: '16px', margin: 0 }}>
                Every company on our platform undergoes strict GSTIN, PAN, and corporate identity verification before posting jobs.
              </p>
              <div style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', fontSize: '10px', fontWeight: 700, color: '#1B4FDF' }}>
                Zero Fraud Guarantee
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                  <Briefcase size={16} strokeWidth={2.2} />
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>500+ Industry Domains</div>
              </div>
              <p style={{ fontSize: '11.5px', color: '#475569', lineHeight: '16px', margin: 0 }}>
                Opportunities spanning Software Engineering, AI, Healthcare, Finance, Skilled Technical Trades, Sales, and Logistics.
              </p>
              <div style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', fontSize: '10px', fontWeight: 700, color: '#1B4FDF' }}>
                All Career Levels
              </div>
            </div>

            {/* Feature 4 */}
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                  <Lock size={16} strokeWidth={2.2} />
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Enterprise Data Privacy</div>
              </div>
              <p style={{ fontSize: '11.5px', color: '#475569', lineHeight: '16px', margin: 0 }}>
                AES-256 encrypted candidate profiles and digital resumes. Your sensitive contact data is shared only when you apply.
              </p>
              <div style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', fontSize: '10px', fontWeight: 700, color: '#1B4FDF' }}>
                AES-256 Encrypted
              </div>
            </div>
          </div>
        </div>

        {/* 3. SOCIAL IMPACT & TESTIMONIALS */}
        <div className="about-card">
          <div style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#EFF6FF',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #DBEAFE',
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#1B4FDF'
          }}>
            <Users size={11} color="#1B4FDF" />
            <span>Social Impact & Stories</span>
          </div>

          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.1px', margin: 0 }}>
            Real Candidates. Real Recruiters. Real Results.
          </h2>

          {/* Trust Rating Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FAF9F6',
            border: '1px solid #ECEAE4',
            borderRadius: '8px',
            padding: '8px 12px'
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={13} color="#1B4FDF" fill="#1B4FDF" />
              ))}
            </div>
            <span style={{ fontSize: '11.5px', color: '#475569' }}>
              <strong style={{ color: '#0F172A', fontWeight: 800 }}>4.9/5 Rating</strong> based on 50,000+ reviews
            </span>
          </div>

          {/* Testimonial List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.id} style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                  <Quote size={14} />
                </div>
                <p style={{ fontSize: '11.5px', color: '#475569', lineHeight: '16.5px', fontStyle: 'italic', margin: 0 }}>
                  "{t.quote}"
                </p>

                <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '2px 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t.image ? (
                    <img src={t.image} alt={t.name} style={{ width: '30px', height: '30px', borderRadius: '15px', border: '1.5px solid #BFDBFE', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '30px', height: '30px', borderRadius: '15px', backgroundColor: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }}>
                      {t.avatarInitial}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{t.name}</div>
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#1B4FDF' }}>{t.role}</div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AWARDS & INDUSTRY RECOGNITION */}
        <div className="about-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={18} color="#1B4FDF" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.1px', margin: 0 }}>
              Awards & Recognition
            </h2>
          </div>

          <div className="about-awards-grid">
            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '8px', padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF', marginBottom: '4px' }}>
                <ShieldCheck size={18} />
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F172A' }}>ISO 27001</div>
              <div style={{ fontSize: '9.5px', fontWeight: 600, color: '#1B4FDF' }}>Information Security</div>
            </div>

            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '8px', padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF', marginBottom: '4px' }}>
                <Building2 size={18} />
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F172A' }}>Startup India</div>
              <div style={{ fontSize: '9.5px', fontWeight: 600, color: '#1B4FDF' }}>DPIIT Recognized</div>
            </div>

            <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '8px', padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF', marginBottom: '4px' }}>
                <Award size={18} />
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F172A' }}>Top Platform</div>
              <div style={{ fontSize: '9.5px', fontWeight: 600, color: '#1B4FDF' }}>Hiring Excellence</div>
            </div>
          </div>
        </div>

        {/* 5. CALL TO ACTION BANNER */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1B4FDF', margin: 0 }}>
            Ready to Accelerate Your Career?
          </h2>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '17px', margin: 0, fontWeight: 400 }}>
            Join over 1.2 million professionals and 50,000 verified employers discovering the future of direct hiring today.
          </p>

          <button
            onClick={() => navigate('/jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#1B4FDF',
              border: 'none',
              borderRadius: '6px',
              padding: '9px 16px',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            <span>Browse All Open Jobs</span>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.4} />
          </button>
        </div>

        {/* 6. APP INFO & FOOTER */}
        <div className="about-card" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={16} color="#1B4FDF" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.1px', margin: 0 }}>
              Application Information
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Platform Version</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>v2.4.0 (Build 112)</span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '2px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Platform Status</span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#DCFCE7',
              border: '1px solid #BBF7D0',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#16A34A' }} />
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#16A34A' }}>Operational 99.99%</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>
            © 2026 JobMarket Technologies Inc. All rights reserved.
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: '14px' }}>
            Empowering job seekers & enterprises with seamless, direct, and zero-fee hiring across India.
          </div>
        </div>
      </div>
    </div>
  );
};
