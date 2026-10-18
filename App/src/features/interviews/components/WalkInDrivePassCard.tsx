import React from 'react';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';
import { WalkInPassData } from './WalkInDrivePassModal';

interface WalkInDrivePassCardProps {
  item: any;
  isPast?: boolean;
  candidateName?: string;
  candidatePhone?: string;
  onPressPass: (data: WalkInPassData) => void;
  onNavigateJob?: (jobId: string) => void;
}

const getDaysFromToday = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  if (isNaN(target.getTime())) return 0;
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Scheduled Date';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const WalkInDrivePassCard: React.FC<WalkInDrivePassCardProps> = ({
  item,
  isPast,
  candidateName,
  candidatePhone,
  onPressPass,
  onNavigateJob,
}) => {
  const walkInDateStr = item.walk_in_date || item.walkInDate || item.interview_date || item.interviewDate || '';
  const days = getDaysFromToday(walkInDateStr);
  const passNumber =
    item.ticket_number ||
    `PASS-WID-${String(item.job_id || item.jobId || 'WID').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '7842'}-${String(item.application_id || item.id || 'APL').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '9120'}`;

  const displayName = candidateName || item.candidate_name || 'Verified Candidate';
  const displayPhone = candidatePhone || item.candidate_phone || '';
  const displayDate = formatDate(walkInDateStr);
  const startTime = item.walk_in_start_time || item.walkInStartTime || '10:00 AM';
  const endTime = item.walk_in_end_time || item.walkInEndTime || '04:00 PM';
  const displayTime =
    item.interview_time ||
    item.interviewTime ||
    (startTime ? `${startTime}${endTime ? ' - ' + endTime : ''}` : '10:00 AM - 04:00 PM');

  const companyName = item.company_name || item.company || 'Industrial Partner';
  const jobTitle = item.job_title || item.title || 'Technical Specialist';
  const venueAddress =
    item.venue_address ||
    item.venueAddress ||
    item.interview_address ||
    item.interviewAddress ||
    item.job_location ||
    item.location ||
    'Company Campus / Plant Premises';

  const mapsLink = item.maps_link || item.mapsLink || item.google_maps_url || item.googleMapsUrl;
  const coordinatorName = item.walk_in_contact_person || item.walkInContactPerson;
  const coordinatorPhone = item.walk_in_contact_number || item.walkInContactNumber;
  const logoUrl = item.companyLogo || item.company_logo || (item as any).logoUrl || (item as any).logo_url || (item as any).logo;

  const passPayload: WalkInPassData = {
    jobId: String(item.job_id || item.jobId || ''),
    applicationId: String(item.application_id || item.id || ''),
    ticketNumber: passNumber,
    jobTitle,
    company: companyName,
    companyLogo: logoUrl,
    location: item.location || item.job_location,
    walkInDate: walkInDateStr,
    walkInStartTime: startTime,
    walkInEndTime: endTime,
    interviewAddress: venueAddress,
    walkInContactPerson: coordinatorName,
    walkInContactNumber: coordinatorPhone,
    walkInDocuments: item.walk_in_documents || item.walkInDocuments,
    candidateName: displayName,
    candidatePhone: displayPhone,
    appliedAt: item.applied_at || item.appliedAt,
  };

  const handleOpenMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapsLink && typeof mapsLink === 'string' && mapsLink.startsWith('http')) {
      window.open(mapsLink, '_blank', 'noopener,noreferrer');
      return;
    }
    const query = encodeURIComponent(`${venueAddress} ${companyName}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="walkin-card-root"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
      }}
    >
      <style>{`
        .walkin-card-title {
          margin: 0;
          font-size: 14.5px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
        }

        .walkin-card-company {
          font-size: 12px;
          color: #64748B;
          font-weight: 600;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .walkin-card-footer {
          border-top: 1px solid #F1F5F9;
          padding-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .walkin-card-note {
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
          line-height: 1.35;
        }

        .walkin-card-pass-btn {
          background-color: #1D4ED8;
          color: #FFFFFF;
          border: none;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          transition: background-color 0.15s ease;
          flex-shrink: 0;
        }
        .walkin-card-pass-btn:hover {
          background-color: #1E40AF;
        }

        @media (max-width: 640px) {
          .walkin-card-root {
            padding: 12px !important;
            gap: 10px !important;
          }
          .walkin-header-row {
            gap: 8px !important;
          }
          .walkin-header-left {
            gap: 10px !important;
          }
          .walkin-card-title {
            font-size: 13.5px !important;
            line-height: 1.25 !important;
          }
          .walkin-card-company {
            font-size: 11px !important;
          }
          .walkin-ticket-banner {
            padding: 8px 10px !important;
          }
          .walkin-card-footer {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            padding-top: 8px !important;
          }
          .walkin-card-note {
            text-align: center !important;
            font-size: 11px !important;
            color: #64748B !important;
          }
          .walkin-card-pass-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 9px 14px !important;
            font-size: 12.5px !important;
          }
        }
      `}</style>

      {/* Top Header Row with Company and Status Badges */}
      <div className="walkin-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div className="walkin-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <CompanyDefaultLogo
            companyName={companyName}
            logoUrl={logoUrl}
            size={42}
            borderRadius="8px"
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              onClick={() => onNavigateJob && onNavigateJob(passPayload.jobId)}
              className="walkin-card-title"
              style={{
                cursor: onNavigateJob ? 'pointer' : 'default',
              }}
            >
              {jobTitle}
            </h3>
            <div className="walkin-card-company">
              {companyName} {item.location ? `• ${item.location}` : ''}
            </div>
          </div>
        </div>

        {/* Countdown Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          {isPast || days < 0 ? (
            <span
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#64748B',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.3px',
                whiteSpace: 'nowrap',
              }}
            >
              COMPLETED DRIVE
            </span>
          ) : days === 0 ? (
            <span
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #93C5FD',
                color: '#1D4ED8',
                fontSize: '10.5px',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '4px',
                animation: 'pulse 2s infinite',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
              }}
            >
              🔥 DRIVE TODAY
            </span>
          ) : days === 1 ? (
            <span
              style={{
                backgroundColor: '#FFF7ED',
                border: '1px solid #FED7AA',
                color: '#EA580C',
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              TOMORROW
            </span>
          ) : (
            <span
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                color: '#2563EB',
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              IN {days} DAYS
            </span>
          )}

          <div
            style={{
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '9.5px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
            }}
          >
            <Ticket size={10} color="#1D4ED8" />
            <span>WALK-IN PASS</span>
          </div>
        </div>
      </div>

      {/* Pass Ticket Banner */}
      <div
        className="walkin-ticket-banner"
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '6px',
          border: '1px dashed #CBD5E1',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', display: 'block' }}>
            PASS TICKET ID:
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
            {passNumber}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#16A34A" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', whiteSpace: 'nowrap' }}>
            Confirmed Entry Pass
          </span>
        </div>
      </div>

      {/* Date, Time & Venue Block */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155' }}>
          <Calendar size={14} color="#2563EB" style={{ flexShrink: 0 }} />
          <span>
            Date: <strong>{displayDate}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155' }}>
          <Clock size={14} color="#2563EB" style={{ flexShrink: 0 }} />
          <span>
            Time: <strong>{displayTime}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: '#334155', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', flex: 1, minWidth: 0 }}>
            <MapPin size={14} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}>
              Venue: <strong>{venueAddress}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleOpenMap}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563EB',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 4px',
              flexShrink: 0,
            }}
          >
            <span>Directions</span>
            <ExternalLink size={10} />
          </button>
        </div>
      </div>

      {/* Coordinator strip (if provided) */}
      {(coordinatorName || coordinatorPhone) && (
        <div
          style={{
            backgroundColor: '#F1F5F9',
            padding: '7px 12px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          <span style={{ color: '#475569', fontWeight: 600 }}>
            Drive Coordinator: <strong style={{ color: '#0F172A' }}>{coordinatorName || 'HR Team'}</strong>
          </span>
          {coordinatorPhone && (
            <a
              href={`tel:${coordinatorPhone.replace(/[^0-9+]/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                color: '#2563EB',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Phone size={11} />
              <span>{coordinatorPhone}</span>
            </a>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="walkin-card-footer">
        <span className="walkin-card-note">
          Bring 2 resume copies &amp; original photo ID proof
        </span>

        <button
          type="button"
          onClick={() => onPressPass(passPayload)}
          className="walkin-card-pass-btn"
        >
          <Ticket size={13} color="#FFFFFF" strokeWidth={2.4} />
          <span>View Official Pass</span>
          <ChevronRight size={14} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
};
