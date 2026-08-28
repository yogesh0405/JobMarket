import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Mail,
  FileText,
  Eye,
  Database,
  UserCheck
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
          <span style={{ color: '#2563EB', fontWeight: 600 }}>Privacy Policy</span>
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
              <ShieldCheck size={14} /> Data Protection & Privacy
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
              Last updated: August 2026 • Your privacy and personal data security are our top priorities
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/terms"
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
              <FileText size={16} /> Terms & Conditions
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
          {/* Privacy Section 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Database size={18} color="#2563EB" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                1. Information We Collect
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              We collect information you provide directly to us when creating a profile, including your full name, email address, phone number, employment history, skills, and uploaded resume files. When signing in with Google OAuth, we receive only your verified email and name.
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
              <li><strong>Job Applications:</strong> Your resume and profile details are shared with employers only when you actively apply for their vacancies or enable public visibility.</li>
              <li><strong>Zero Data Selling:</strong> We never sell, rent, or trade your personal information or contact details to third-party telemarketers or advertisers.</li>
              <li><strong>Encrypted Storage:</strong> All database transactions, sessions, and uploads are encrypted using modern industry standards (SSL/TLS HTTPS encryption).</li>
            </ul>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

          {/* Privacy Section 3 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Eye size={18} color="#2563EB" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                3. Cookies & Session Management
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              JobMarket uses secure session cookies and local storage tokens solely to keep you logged in and preserve your job search preferences. We do not track you across external third-party websites.
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
              You have complete ownership over your data. You may edit your profile, update or remove your resume, or request permanent deletion of your account and records anytime from your dashboard settings or by contacting our data protection officer.
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
              Have privacy concerns or data requests?
            </h3>
            <p style={{ fontSize: '13px', color: '#3B82F6', margin: 0 }}>
              Our data privacy team will be happy to assist you.
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
            <Mail size={16} /> Contact Privacy Team
          </Link>
        </div>

        {/* Copyright */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
            © 2026 JobMarket Inc. All rights reserved. • Built with enterprise-grade data privacy.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPage;
