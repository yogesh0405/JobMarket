import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  Lock,
  AlertCircle,
  Database,
  UserCheck,
  Mail,
  ArrowLeft,
  FileText,
} from 'lucide-react';

interface Props {
  initialTab?: 'terms' | 'privacy';
}

export const TermsAndPrivacyPage: React.FC<Props> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') || searchParams.get('view');

  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(() => {
    if (queryTab === 'privacy' || initialTab === 'privacy') return 'privacy';
    return 'terms';
  });

  useEffect(() => {
    if (queryTab === 'privacy' || queryTab === 'terms') {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabSwitch = (tab: 'terms' | 'privacy') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '32px 16px 64px' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <Link to="/about" style={{ color: '#64748B', textDecoration: 'none' }}>
            About Us
          </Link>
          <span>/</span>
          <span style={{ color: '#2563EB', fontWeight: 600 }}>
            {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </span>
        </div>

        {/* Hero Banner with Segmented Tabs */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h1>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                {activeTab === 'terms'
                  ? 'Last updated: August 2026 • Effective for all JobMarket candidates and employers'
                  : 'Last updated: August 2026 • Your personal data security and privacy rights are our priority'}
              </p>
            </div>

            <Link
              to="/about"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> About Us
            </Link>
          </div>

          {/* Interactive Tab Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '8px',
              gap: '4px',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <button
              type="button"
              onClick={() => handleTabSwitch('terms')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'terms' ? 700 : 500,
                backgroundColor: activeTab === 'terms' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'terms' ? '#2563EB' : '#64748B',
                boxShadow: activeTab === 'terms' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Scale size={15} /> Terms of Service
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('privacy')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'privacy' ? 700 : 500,
                backgroundColor: activeTab === 'privacy' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'privacy' ? '#2563EB' : '#64748B',
                boxShadow: activeTab === 'privacy' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <ShieldCheck size={15} /> Privacy Policy
            </button>
          </div>
        </div>

        {/* Content Body Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '32px 28px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {activeTab === 'terms' ? (
            /* ================= TERMS CONTENT ================= */
            <>
              {/* Section 1 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    1. Acceptance of Terms
                  </h2>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  By creating an account, browsing listings, or accessing the JobMarket platform
                  (web or mobile), you agree to be bound by these Terms of Service. If you do not
                  agree, please do not use our services.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

              {/* Section 2 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Users size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    2. User Accounts & Responsibilities
                  </h2>
                </div>
                <ul style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: 0, paddingLeft: '20px' }}>
                  <li>
                    <strong>Candidates:</strong> You agree to provide accurate, honest information
                    regarding your skills, work history, and contact details. Misrepresenting
                    identity or qualifications is strictly prohibited.
                  </li>
                  <li>
                    <strong>Employers:</strong> You agree that all job postings represent genuine
                    employment opportunities with transparent compensation, job roles, and locations.
                  </li>
                  <li>
                    <strong>Security:</strong> You are responsible for safeguarding your login credentials
                    and one-time passcodes (OTP). Notify our compliance team immediately if you suspect unauthorized access.
                  </li>
                </ul>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

              {/* Section 3 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Briefcase size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    3. Job Postings & Fair Hiring Policy
                  </h2>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  JobMarket strictly prohibits discriminatory hiring practices, deceptive job
                  offers, advance fee scams, or multi-level marketing (MLM) schemes. Any job post
                  violating these standards will be removed immediately, and offending accounts
                  permanently banned.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

              {/* Section 4 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Lock size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    4. Free Candidate Access & Employer Services
                  </h2>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  Job searching, profile creation, and applying for jobs is 100% free for all job
                  seekers. JobMarket will never ask candidates to pay for job applications, screening,
                  or interviews.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

              {/* Section 5 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertCircle size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    5. Limitation of Liability
                  </h2>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  JobMarket facilitates direct connections between employers and candidates. While
                  we verify employers and job listings, we do not guarantee employment, interview
                  outcomes, or candidate performance.
                </p>
              </div>
            </>
          ) : (
            /* ================= PRIVACY CONTENT ================= */
            <>
              {/* Privacy Section 1 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Database size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    1. Information We Collect
                  </h2>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  We collect information you provide directly to us when creating a profile,
                  including your full name, email address, phone number, employment history, skills,
                  and uploaded resume files. When signing in with Google OAuth, we receive only
                  your verified email and name.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

              {/* Privacy Section 2 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Lock size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    2. How We Use & Protect Your Data
                  </h2>
                </div>
                <ul style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: 0, paddingLeft: '20px' }}>
                  <li>
                    <strong>Job Applications:</strong> Your resume and profile details are shared with
                    employers only when you actively apply for their vacancies or enable public visibility.
                  </li>
                  <li>
                    <strong>Zero Data Selling:</strong> We never sell, rent, or trade your personal
                    information or contact details to third-party telemarketers or advertisers.
                  </li>
                  <li>
                    <strong>Encrypted Storage:</strong> All database transactions, sessions, and uploads
                    are encrypted using modern industry standards (SSL/TLS HTTPS encryption).
                  </li>
                </ul>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

              {/* Privacy Section 3 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <ShieldCheck size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    3. Cookies & Session Management
                  </h2>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  JobMarket uses secure session cookies and local storage tokens solely to keep you
                  logged in and preserve your job search preferences. We do not track you across
                  external third-party websites.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

              {/* Privacy Section 4 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <UserCheck size={18} color="#2563EB" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    4. Your Rights & Account Deletion
                  </h2>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  You have complete ownership over your data. You may edit your profile, update or
                  remove your resume, or request permanent deletion of your account and records anytime
                  from your Security Settings screen or by contacting our data protection officer.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Quick Switch Card */}
        <div
          onClick={() => handleTabSwitch(activeTab === 'terms' ? 'privacy' : 'terms')}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '16px 20px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F8FAFC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeTab === 'terms' ? (
              <ShieldCheck size={20} color="#2563EB" />
            ) : (
              <Scale size={20} color="#2563EB" />
            )}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                {activeTab === 'terms' ? 'Read our Privacy Policy' : 'Read our Terms of Service'}
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                {activeTab === 'terms'
                  ? 'Learn how your personal details, resumes, and accounts are protected'
                  : 'Review conditions of use, candidate rights, and employer policies'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB' }}>
            View {activeTab === 'terms' ? 'Privacy' : 'Terms'} &rarr;
          </span>
        </div>

        {/* Contact Support Card */}
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E40AF', margin: '0 0 4px' }}>
              Have questions about our Legal or Privacy Policies?
            </h3>
            <p style={{ fontSize: '13px', color: '#3B82F6', margin: 0 }}>
              Our compliance and support desk is ready to assist you.
            </p>
          </div>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)',
            }}
          >
            <Mail size={16} /> Contact Support
          </Link>
        </div>

        {/* Copyright */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
            © 2026 JobMarket Inc. All rights reserved. • Built for trust & transparency across India.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TermsAndPrivacyPage;
