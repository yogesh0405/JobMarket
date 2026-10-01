import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  Phone,
  ExternalLink,
  ChevronRight,
  Ticket,
  CheckCircle2,
} from 'lucide-react';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';

interface EmployerWalkInDriveCardProps {
  job: any;
  applicantCount?: number;
  isPast?: boolean;
  onViewApplicants?: (jobId: string) => void;
  onEditJob?: (jobId: string) => void;
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
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const EmployerWalkInDriveCard: React.FC<EmployerWalkInDriveCardProps> = ({
  job,
  applicantCount = 0,
  isPast = false,
  onViewApplicants,
  onEditJob,
}) => {
  const walkInDateStr = job.walkInDate || job.walk_in_date || '';
  const days = walkInDateStr ? getDaysFromToday(walkInDateStr) : 0;
  const actuallyPast = isPast || days < 0;

  const startTime = job.walkInStartTime || job.walk_in_start_time || '10:00 AM';
  const endTime = job.walkInEndTime || job.walk_in_end_time || '04:00 PM';
  const timeWindow = `${startTime} - ${endTime}`;

  const venueAddress =
    job.interviewAddress ||
    job.interview_address ||
    job.venue_address ||
    job.location ||
    'Company Campus / Plant Premises';

  const mapsLink = job.googleMapsUrl || job.google_maps_url || job.maps_link;
  const contactPerson = job.walkInContactPerson || job.walk_in_contact_person;
  const contactNumber = job.walkInContactNumber || job.walk_in_contact_number;
  const companyName = job.company || job.company_name || 'Your Company';
  const logoUrl = job.company_logo || job.companyLogo || (job as any).logo;

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
        gap: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <CompanyDefaultLogo
            companyName={companyName}
            logoUrl={logoUrl}
            size={44}
            borderRadius="8px"
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {job.title}
              </h3>
              <span
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Ticket size={11} color="#1D4ED8" />
                <span>WALK-IN DRIVE</span>
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '3px' }}>
              {companyName} {job.location ? `• ${job.location}` : ''} {job.openings ? `• ${job.openings} Openings` : ''}
            </div>
          </div>
        </div>

        {/* Countdown Badge */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          {actuallyPast ? (
            <span
              style={{
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#64748B',
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
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
                fontSize: '11px',
                fontWeight: 900,
                padding: '3px 9px',
                borderRadius: '4px',
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
                fontSize: '11px',
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
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px',
              }}
            >
              IN {days} DAYS
            </span>
          )}
        </div>
      </div>

      {/* Drive Details Grid */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '6px',
          border: '1px solid #E2E8F0',
          padding: '12px 14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#1E293B' }}>
          <Calendar size={14} color="#1D4ED8" style={{ flexShrink: 0 }} />
          <span>
            Drive Date: <strong>{formatDate(walkInDateStr)}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#1E293B' }}>
          <Clock size={14} color="#1D4ED8" style={{ flexShrink: 0 }} />
          <span>
            Reporting Window: <strong>{timeWindow}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#1E293B', gridColumn: '1 / -1' }}>
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
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
            }}
          >
            <span>View Map</span>
            <ExternalLink size={11} />
          </button>
        </div>

        {(contactPerson || contactNumber) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#1E293B', gridColumn: '1 / -1' }}>
            <Users size={14} color="#16A34A" style={{ flexShrink: 0 }} />
            <span>
              On-Site Coordinator: <strong>{contactPerson || 'HR Team'}</strong> {contactNumber ? `(${contactNumber})` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Footer Row with Applicant Count & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #F1F5F9',
          paddingTop: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Users size={12} color="#1D4ED8" />
            <span>{applicantCount} Registered Candidate{applicantCount !== 1 ? 's' : ''}</span>
          </div>

          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
            Admit passes issued
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onEditJob && (
            <button
              onClick={() => onEditJob(String(job.id))}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#475569',
                border: '1px solid #CBD5E1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Edit Drive
            </button>
          )}

          {onViewApplicants && (
            <button
              onClick={() => onViewApplicants(String(job.id))}
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
                gap: '5px',
              }}
            >
              <Users size={13} color="#FFFFFF" />
              <span>View Candidates</span>
              <ChevronRight size={13} color="#FFFFFF" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
