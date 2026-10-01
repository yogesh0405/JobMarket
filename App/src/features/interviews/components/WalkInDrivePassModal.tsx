import React, { useState } from 'react';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Phone,
  Share2,
  CheckCircle2,
  X,
  ExternalLink,
  Printer,
  Copy,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';

export interface WalkInPassData {
  jobId: string;
  applicationId?: string;
  ticketNumber?: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location?: string;
  walkInDate?: string;
  walkInStartTime?: string;
  walkInEndTime?: string;
  interviewAddress?: string;
  walkInContactPerson?: string;
  walkInContactNumber?: string;
  walkInDocuments?: string;
  candidateName?: string;
  candidatePhone?: string;
  candidateEmail?: string;
  appliedAt?: string;
}

interface WalkInDrivePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WalkInPassData | null;
}

export const WalkInDrivePassModal: React.FC<WalkInDrivePassModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const passNumber =
    data.ticketNumber ||
    `PASS-WID-${String(data.jobId || 'WID').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '7842'}-${String(data.applicationId || 'APL').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '9120'}`;

  const displayName = data.candidateName || 'Verified Candidate';
  const displayPhone = data.candidatePhone || 'Phone Verified';
  const displayDate = data.walkInDate
    ? new Date(data.walkInDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Walk-in Drive Scheduled';

  const timeWindow =
    data.walkInStartTime && data.walkInEndTime
      ? `${data.walkInStartTime} - ${data.walkInEndTime}`
      : data.walkInStartTime || '10:00 AM - 04:00 PM';

  const venueAddress = data.interviewAddress || data.location || 'Company Factory / Plant Premises';

  const handleCopyDetails = () => {
    const textToCopy = `WALK-IN DRIVE ENTRY PASS\nPass ID: ${passNumber}\nCandidate: ${displayName}\nRole: ${data.jobTitle}\nCompany: ${data.company}\nDate: ${displayDate}\nTime: ${timeWindow}\nVenue: ${venueAddress}\nCoordinator: ${data.walkInContactPerson || 'HR Team'} (${data.walkInContactNumber || 'On Site'})\nCarry: ${data.walkInDocuments || 'Resume, Govt Photo ID, 2 Photos'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenMap = () => {
    const query = encodeURIComponent(`${venueAddress} ${data.company}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pass Modal Top Banner */}
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #1E293B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                border: '1px solid #3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ticket size={20} color="#60A5FA" strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#93C5FD', letterSpacing: '1px' }}>
                OFFICIAL ADMIT CARD
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                Walk-in Drive Entry Pass
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Pass Ticket Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#F8FAFC',
          }}
        >
          {/* Ticket Card Container with Cut-out Notches */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Ticket Header: Company & Job */}
            <div
              style={{
                padding: '16px',
                borderBottom: '1px dashed #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <CompanyDefaultLogo
                  companyName={data.company}
                  logoUrl={data.companyLogo}
                  size={46}
                  borderRadius="8px"
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {data.jobTitle}
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                    {data.company}
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#1D4ED8', display: 'block', letterSpacing: '0.5px' }}>
                  CONFIRMED ENTRY
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF' }}>
                  ADMITTED
                </span>
              </div>
            </div>

            {/* Pass Identification Strip & Barcode Aesthetic */}
            <div
              style={{
                backgroundColor: '#F1F5F9',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px dashed #CBD5E1',
              }}
            >
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', display: 'block' }}>
                  ENTRY PASS TICKET NO:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>
                  {passNumber}
                </span>
              </div>

              {/* Faux Barcode Graphic */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  height: '24px',
                  opacity: 0.7,
                }}
                title="Verified Verification Hash"
              >
                <div style={{ width: '3px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '1px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '4px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '2px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '1px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '3px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '5px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '2px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '1px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '4px', height: '100%', backgroundColor: '#0F172A' }} />
                <div style={{ width: '2px', height: '100%', backgroundColor: '#0F172A' }} />
              </div>
            </div>

            {/* Candidate Verification Block */}
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block' }}>
                  Candidate Name
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {displayName}
                  <ShieldCheck size={14} color="#16A34A" />
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block' }}>
                  Candidate Phone
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px', display: 'block' }}>
                  {displayPhone}
                </span>
              </div>
            </div>

            {/* Date, Time & Venue Block */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E40AF', fontSize: '11px', fontWeight: 800, marginBottom: '4px' }}>
                    <Calendar size={13} color="#1D4ED8" />
                    <span>DRIVE DATE</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    {displayDate}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E40AF', fontSize: '11px', fontWeight: 800, marginBottom: '4px' }}>
                    <Clock size={13} color="#1D4ED8" />
                    <span>REPORTING TIME</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    {timeWindow}
                  </div>
                </div>
              </div>

              {/* Venue Address */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E40AF', fontSize: '11px', fontWeight: 800 }}>
                    <MapPin size={13} color="#1D4ED8" />
                    <span>REPORTING VENUE & ADDRESS</span>
                  </div>
                  <button
                    onClick={handleOpenMap}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1D4ED8',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0,
                    }}
                  >
                    <span>Directions</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
                <div style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, lineHeight: 1.45 }}>
                  {venueAddress}
                </div>
              </div>

              {/* Coordinator Contact */}
              {(data.walkInContactPerson || data.walkInContactNumber) && (
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.5px', display: 'block' }}>
                      ON-SITE DRIVE COORDINATOR
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>
                      {data.walkInContactPerson || 'Recruiting Team'}
                      {data.walkInContactNumber ? ` • ${data.walkInContactNumber}` : ''}
                    </span>
                  </div>
                  {data.walkInContactNumber && (
                    <a
                      href={`tel:${data.walkInContactNumber.replace(/[^0-9+]/g, '')}`}
                      style={{
                        backgroundColor: '#1D4ED8',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Phone size={11} color="#FFFFFF" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mandatory Documents Checklist Box */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              <FileText size={14} color="#1D4ED8" />
              <span>MANDATORY DOCUMENTS TO CARRY FOR WALK-IN DRIVE:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#475569', lineHeight: 1.6, fontWeight: 500 }}>
              <li>2 printed hard copies of updated Resume / Biodata.</li>
              <li>Original Government Photo ID Proof (Aadhaar Card, PAN Card, or Driving License).</li>
              <li>2 recent passport-size color photographs.</li>
              <li>Original & Xerox of educational / ITI / Trade certificates and marksheets.</li>
              <li>Previous company experience letter or last 3 months salary slips (if applicable).</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0F172A')}
            >
              <Printer size={13} color="#FFFFFF" />
              <span>Print Admit Pass</span>
            </button>

            <button
              onClick={handleCopyDetails}
              style={{
                backgroundColor: copied ? '#DCFCE7' : '#F1F5F9',
                color: copied ? '#15803D' : '#334155',
                border: `1px solid ${copied ? '#86EFAC' : '#CBD5E1'}`,
                padding: '9px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? <CheckCircle2 size={13} color="#15803D" /> : <Copy size={13} color="#334155" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Pass Info'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              border: '1px solid #CBD5E1',
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
