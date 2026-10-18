import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Headphones } from 'lucide-react';
import { SecuritySettings } from '../../components/profile/SecuritySettings';

export const SecurityPage: React.FC = () => {
  return (
    <div className="security-page-wrapper">
      <style>{`
        .security-page-wrapper {
          min-height: 100vh;
          background-color: #F8FAFC;
          width: 100%;
          box-sizing: border-box;
          padding: 24px 16px 64px;
        }

        .sec-desktop-header-wrap {
          max-width: 680px;
          margin: 0 auto 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (max-width: 768px) {
          .security-page-wrapper {
            padding: 0 !important;
            background-color: #FFFFFF !important;
          }
          .sec-desktop-header-wrap {
            display: none !important;
          }
        }
      `}</style>

      {/* Desktop Breadcrumbs and Header Banner */}
      <div className="sec-desktop-header-wrap">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <Link to="/dashboard" style={{ color: '#64748B', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <span>/</span>
          <span style={{ color: '#1B4FDF', fontWeight: 600 }}>Security & Sessions</span>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF6FF',
              color: '#1B4FDF',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11.5px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              <ShieldCheck size={14} /> Account Protection
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Security & Sessions
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
              Manage your password, two-factor authentication, and active device logins
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#F1F5F9',
                color: '#0F172A',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background-color 0.15s ease'
              }}
            >
              <ArrowLeft size={15} /> Dashboard
            </Link>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#EFF6FF',
                color: '#1B4FDF',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #BFDBFE'
              }}
            >
              <Headphones size={15} /> Help Desk
            </Link>
          </div>
        </div>
      </div>

      <SecuritySettings />
    </div>
  );
};

export default SecurityPage;
