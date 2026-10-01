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
  const logoUrl = item.company_logo || item.companyLogo || (item as any).logo;

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
      window.open(mapsLink, '_blank');
      return;
    }
    const query = encodeURIComponent(`${venueAddress} ${companyName}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div
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
      {/* Top Header Row with Company and Status Badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <CompanyDefaultLogo
            companyName={companyName}
            logoUrl={logoUrl}
            size={44}
            borderRadius="8px"
          />
          <div style={{ minWidth: 0 }}>
            <h3
              onClick={() => onNavigateJob && onNavigateJob(passPayload.jobId)}
              style={{
                margin: 0,
                fontSize: '14.5px',
                fontWeight: 800,
                color: '#0F172A',
                cursor: onNavigateJob ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {jobTitle}
            </h3>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
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
            }}
          >
            <Ticket size={10} color="#1D4ED8" />
            <span>WALK-IN PASS</span>
          </div>
        </div>
      </div>

      {/* Pass Ticket Banner */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '6px',
          border: '1px dashed #CBD5E1',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', display: 'block' }}>
            PASS TICKET ID:
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
            {passNumber}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#16A34A" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>
            Confirmed Entry Pass
          </span>
        </div>
      </div>

      {/* Date, Time & Venue Block */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
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

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#334155', gridColumn: '1 / -1' }}>
          <MapPin size={14} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ flex: 1 }}>
            Venue: <strong>{venueAddress}</strong>
          </span>
          <button
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
              padding: 0,
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
      <div
        style={{
          borderTop: '1px solid #F1F5F9',
          paddingTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
          Bring 2 resume copies & original photo ID proof
        </span>

        <button
          onClick={() => onPressPass(passPayload)}
          style={{
            backgroundColor: '#1D4ED8',
            color: '#FFFFFF',
            border: 'none',
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E40AF')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
        >
          <Ticket size={13} color="#FFFFFF" strokeWidth={2.4} />
          <span>View Official Pass</span>
          <ChevronRight size={14} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
};
