import React, { useState } from 'react';
import { Wrench, RefreshCw, Mail, Phone } from 'lucide-react';
import { JobMarketLogoSvg } from './JobMarketLogoSvg';

interface MaintenancePageProps {
  platformName?: string;
  logoUrl?: string;
  supportEmail?: string;
  contactNumber?: string;
  onRefresh?: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  platformName = 'JobMarket',
  logoUrl,
  supportEmail = 'support@csnjobmarket.com',
  contactNumber = '+91 240 2554000',
  onRefresh,
}) => {
  const [checking, setChecking] = useState(false);

  const handleRefresh = () => {
    setChecking(true);
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
    setTimeout(() => setChecking(false), 1200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={platformName}
            style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
        ) : (
          <JobMarketLogoSvg size={36} />
        )}
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
          {platformName}
        </span>
      </div>

      {/* Main Maintenance Card */}
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          color: '#344BFD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <Wrench size={30} strokeWidth={2.2} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-0.3px' }}>
          Scheduled System Maintenance
        </h1>

        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '22px', margin: '0 0 24px 0' }}>
          We are currently performing critical system upgrades and database optimizations to serve you better. Platform access is temporarily paused and will resume shortly.
        </p>

        {/* Contact info card */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Need Immediate Assistance?
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0f172a' }}>
            <Mail size={14} color="#64748b" />
            <a href={`mailto:${supportEmail}`} style={{ color: '#344BFD', textDecoration: 'none', fontWeight: '600' }}>
              {supportEmail}
            </a>
          </div>
          {contactNumber && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0f172a' }}>
              <Phone size={14} color="#64748b" />
              <span style={{ color: '#334155', fontWeight: '500' }}>{contactNumber}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={checking}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#344BFD',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s ease'
          }}
        >
          <RefreshCw size={15} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Checking Status...' : 'Check If System Is Back Online'}
        </button>
      </div>
    </div>
  );
};

export default MaintenancePage;
