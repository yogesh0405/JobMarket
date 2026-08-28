import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowLeft,
  Mail,
  Scale,
  Users,
  Briefcase,
  ShieldCheck
} from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '32px 16px 64px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Home
          </Link>
          <span>/</span>
          <Link to="/about" style={{ color: '#64748B', textDecoration: 'none' }}>
            About Us
          </Link>
          <span>/</span>
          <span style={{ color: '#2563EB', fontWeight: 600 }}>Terms & Conditions</span>
        </div>

        {/* Header Hero Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
          padding: '28px 24px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
              <Scale size={14} /> Legal & Usage Agreement
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Terms & Conditions
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
              Last updated: August 2026 • Effective for all JobMarket candidates and employers
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/privacy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #BFDBFE'
              }}
            >
              <ShieldCheck size={16} /> Privacy Policy
            </Link>
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
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={16} /> About Us
            </Link>
          </div>
        </div>

        {/* Content Body Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
          padding: '32px 28px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Section 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} color="#2563EB" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                1. Acceptance of Terms
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              By creating an account or accessing the JobMarket platform (web or mobile), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
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
              <li><strong>Candidates:</strong> You agree to provide accurate information regarding your skills, work history, and contact details. Misrepresenting identity or qualifications is strictly prohibited.</li>
              <li><strong>Employers:</strong> You agree that all job postings represent genuine employment opportunities with transparent compensation, job roles, and locations.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and one-time passcodes (OTP).</li>
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
              JobMarket strictly prohibits discriminatory hiring practices, deceptive job offers, advance fee scams, or multi-level marketing schemes. Any job post violating these standards will be removed immediately, and offending accounts will be banned.
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
              Job searching, profile creation, and applying for jobs is 100% free for all job seekers. JobMarket will never ask candidates to pay for job applications or interviews.
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
              JobMarket facilitates connections between employers and candidates. While we verify employers and job listings, we do not guarantee employment, interview outcomes, or candidate performance.
            </p>
          </div>
        </div>

        {/* Contact Support Card */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E40AF', margin: '0 0 4px' }}>
              Questions about our Terms of Service?
            </h3>
            <p style={{ fontSize: '13px', color: '#3B82F6', margin: 0 }}>
              Our compliance team is ready to answer any questions.
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
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)'
            }}
          >
            <Mail size={16} /> Contact Support
          </Link>
        </div>

        {/* Copyright */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
            © 2026 JobMarket Inc. All rights reserved. • Built for trust & transparency.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;
