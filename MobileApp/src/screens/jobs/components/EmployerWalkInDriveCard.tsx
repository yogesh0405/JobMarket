import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Briefcase,
  User as UserIcon,
  Phone,
  Navigation2,
  Ticket,
  Users,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react-native';
import { Job } from '../../../types';
import { COLORS, RADIUS } from '../../../constants/theme';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { WhatsAppIcon } from '../../../components/common/WhatsAppIcon';
import { appliedJobsStore } from '../../../utils/appliedJobsStore';

interface EmployerWalkInDriveCardProps {
  job: Job;
  applicantCount?: number;
  isPast?: boolean;
  navigation: any;
  onOpenMap?: (venue?: string, mapsLink?: string) => void;
  onCallCoordinator?: (phone?: string) => void;
  onWhatsAppCoordinator?: (phone?: string, contactName?: string) => void;
}

const getDaysFromToday = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
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
  navigation,
  onOpenMap,
  onCallCoordinator,
  onWhatsAppCoordinator,
}) => {
  const walkInDateStr = job.walkInDate || job.walk_in_date || '';
  const days = walkInDateStr ? getDaysFromToday(walkInDateStr) : 0;
  const actuallyPast = isPast || days < 0;

  const startTime = job.walkInStartTime || (job as any).walk_in_start_time || '10:00 AM';
  const endTime = job.walkInEndTime || (job as any).walk_in_end_time || '04:00 PM';
  const timeWindow = `${startTime} - ${endTime}`;

  const venueAddress =
    job.interviewAddress ||
    job.interview_address ||
    (job as any).venue_address ||
    job.location ||
    'Company Campus / Plant Premises';

  const mapsLink = job.googleMapsUrl || (job as any).google_maps_url || (job as any).maps_link;
  const contactPerson = job.walkInContactPerson || (job as any).walk_in_contact_person;
  const contactNumber = job.walkInContactNumber || (job as any).walk_in_contact_number;
  const companyName = job.company || (job as any).company_name || 'Your Company';
  const logoUrl =
    job.company_logo ||
    (job as any).companyLogo ||
    (job as any).logo_url ||
    (job as any).logo;

  const storeCount = appliedJobsStore
    .getAppliedJobs()
    .filter(
      (s) => String(s.jobId || s.job?.id).toLowerCase() === String(job.id).toLowerCase()
    ).length;

  const totalRegistered =
    applicantCount !== undefined && applicantCount !== null && applicantCount > 0
      ? applicantCount
      : Math.max(
          Number(
            job.applicants_count ??
            (job as any).applicantsCount ??
            (job as any).applications_count ??
            (job as any).applicationsCount ??
            (Array.isArray((job as any).applicants) ? (job as any).applicants.length : 0)
          ),
          storeCount
        );

  const handleOpenJobDetails = () => {
    navigation.navigate('CandidateJobDetail', {
      jobId: job.id,
      job: {
        ...job,
        id: job.id,
        title: job.title,
        job_title: job.title,
        company: companyName,
        company_name: companyName,
        location: venueAddress,
      },
    });
  };

  const handleOpenApplicants = () => {
    navigation.navigate('JobApplicants', {
      jobId: job.id,
      jobTitle: job.title,
    });
  };

  const handleCall = () => {
    if (onCallCoordinator) {
      onCallCoordinator(contactNumber);
    } else if (contactNumber) {
      Linking.openURL(`tel:${contactNumber}`);
    }
  };

  const handleWhatsApp = () => {
    if (onWhatsAppCoordinator) {
      onWhatsAppCoordinator(contactNumber, contactPerson);
    } else if (contactNumber) {
      const cleanPhone = contactNumber.replace(/[^0-9]/g, '');
      const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const msg = encodeURIComponent(
        `Hello ${contactPerson || 'Coordinator'}, regarding the Walk-in Drive for ${job.title}:`
      );
      Linking.openURL(`whatsapp://send?phone=${finalPhone}&text=${msg}`).catch(() => {
        Linking.openURL(`https://wa.me/${finalPhone}?text=${msg}`);
      });
    }
  };

  const handleMap = () => {
    if (onOpenMap) {
      onOpenMap(venueAddress, mapsLink);
    } else {
      const url = mapsLink || (venueAddress ? `https://maps.google.com/?q=${encodeURIComponent(venueAddress)}` : null);
      if (url) Linking.openURL(url);
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Band */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.walkInBadgeIconBox}>
            <Ticket size={13} color="#1764E8" strokeWidth={2.4} />
          </View>
          <Text style={styles.badgeTitle}>WALK-IN DRIVE</Text>
          <Text style={styles.badgeBullet}>•</Text>
          <Text style={styles.dateTimeText} numberOfLines={1}>
            {formatDate(walkInDateStr)}
          </Text>
        </View>

        {actuallyPast ? (
          <View style={styles.statusCompletedBadge}>
            <CheckCircle2 size={12} color="#64748B" />
            <Text style={styles.statusCompletedText}>Completed</Text>
          </View>
        ) : days === 0 ? (
          <View style={styles.statusTodayBadge}>
            <Text style={styles.statusTodayText}>TODAY</Text>
          </View>
        ) : days === 1 ? (
          <View style={styles.statusTomorrowBadge}>
            <Text style={styles.statusTomorrowText}>TOMORROW</Text>
          </View>
        ) : (
          <View style={styles.statusUpcomingBadge}>
            <Text style={styles.statusUpcomingText}>
              {days > 0 ? `${days}d left` : 'Upcoming'}
            </Text>
          </View>
        )}
      </View>

      {/* Main Body */}
      <View style={styles.cardBody}>
        {/* Job & Company Info */}
        <View style={styles.jobRow}>
          <CompanyLogoAvatar
            logoUrl={logoUrl}
            companyName={companyName}
            size={44}
            borderRadius={RADIUS.card}
          />
          <View style={styles.jobDetails}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleOpenJobDetails}
              style={styles.jobTitleRow}
            >
              <Text style={styles.jobTitle} numberOfLines={1}>
                {job.title}
              </Text>
              <ExternalLink size={12} color="#1764E8" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <View style={styles.subMetaRow}>
              {job.trade && (
                <View style={styles.tradePill}>
                  <Text style={styles.tradePillText} numberOfLines={1}>
                    {job.trade}
                  </Text>
                </View>
              )}
              <View style={styles.timeWindowPill}>
                <Clock size={11} color="#475569" style={{ marginRight: 3 }} />
                <Text style={styles.timeWindowText} numberOfLines={1}>
                  {timeWindow}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Venue Address */}
        <View style={styles.metaInfoRow}>
          <MapPin size={13} color="#64748B" style={{ marginTop: 2, marginRight: 6 }} />
          <Text style={styles.metaInfoText} numberOfLines={2}>
            Venue: <Text style={styles.metaInfoHighlight}>{venueAddress}</Text>
          </Text>
        </View>

        {/* Coordinator Info if available */}
        {(contactPerson || contactNumber) && (
          <View style={styles.metaInfoRow}>
            <UserIcon size={13} color="#64748B" style={{ marginTop: 1, marginRight: 6 }} />
            <Text style={styles.metaInfoText} numberOfLines={1}>
              Coordinator: <Text style={styles.metaInfoHighlight}>{contactPerson || 'Recruiting Team'}</Text>
              {contactNumber ? ` • ${contactNumber}` : ''}
            </Text>
          </View>
        )}

        {/* Registered Candidates Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.registeredCandidatesBanner}
          onPress={handleOpenApplicants}
        >
          <View style={styles.bannerLeft}>
            <Users size={15} color="#1764E8" style={{ marginRight: 6 }} />
            <Text style={styles.registeredCountText}>
              <Text style={{ fontWeight: '800' }}>{totalRegistered}</Text> Candidate{totalRegistered === 1 ? '' : 's'} Registered / Admit Pass Issued
            </Text>
          </View>
          <View style={styles.bannerRight}>
            <Text style={styles.bannerActionText}>View List</Text>
            <ChevronRight size={13} color="#1764E8" />
          </View>
        </TouchableOpacity>

        {/* Section Separator */}
        <View style={styles.sectionSeparator} />

        {/* Card Footer Actions */}
        <View style={styles.footerRow}>
          <View style={styles.quickActionIcons}>
            {Boolean(contactNumber) && (
              <TouchableOpacity
                style={styles.quickIconBtn}
                onPress={handleCall}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Phone size={15} color="#1764E8" />
              </TouchableOpacity>
            )}
            {Boolean(contactNumber) && (
              <TouchableOpacity
                style={styles.quickIconBtn}
                onPress={handleWhatsApp}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <WhatsAppIcon size={15} />
              </TouchableOpacity>
            )}
            {Boolean(venueAddress || mapsLink) && (
              <TouchableOpacity
                style={styles.quickIconBtn}
                onPress={handleMap}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Navigation2 size={15} color="#334155" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.viewCandidatesBtn}
            activeOpacity={0.8}
            onPress={handleOpenApplicants}
          >
            <Users size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.viewCandidatesBtnText}>View Candidates & Passes</Text>
            <ChevronRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  topHeader: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  walkInBadgeIconBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1764E8',
    letterSpacing: 0.4,
  },
  badgeBullet: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 6,
  },
  dateTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flexShrink: 1,
  },
  statusCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  statusCompletedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  statusTodayBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusTodayText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  statusTomorrowBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusTomorrowText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  statusUpcomingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusUpcomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  cardBody: {
    padding: 14,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobDetails: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tradePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tradePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  timeWindowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeWindowText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  metaInfoText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    flex: 1,
  },
  metaInfoHighlight: {
    color: '#334155',
    fontWeight: '600',
  },
  registeredCandidatesBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  registeredCountText: {
    fontSize: 12,
    color: '#1E40AF',
    flexShrink: 1,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bannerActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1764E8',
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  quickActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCandidatesBtn: {
    backgroundColor: '#1764E8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCandidatesBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
