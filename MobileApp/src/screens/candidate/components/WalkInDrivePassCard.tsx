import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Building2,
  PhoneCall,
  Navigation2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react-native';
import { InterviewItem } from '../../../api/candidateApi';
import { COLORS, RADIUS } from '../../../constants/theme';

interface Props {
  item: InterviewItem;
  isPast?: boolean;
  candidateName?: string;
  candidatePhone?: string;
  onPressPass: (item: InterviewItem) => void;
  navigation: any;
}

const getDaysFromToday = (dateStr: string): number => {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  if (isNaN(target.getTime())) return 0;
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr: string): string => {
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

export const WalkInDrivePassCard: React.FC<Props> = ({
  item,
  isPast,
  candidateName,
  candidatePhone,
  onPressPass,
  navigation,
}) => {
  const days = getDaysFromToday(item.walk_in_date || item.interview_date);
  const passNumber =
    item.ticket_number ||
    `PASS-WID-${(item.job_id || 'WID').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '7842'}-${(item.application_id || 'APL').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '9120'}`;

  const displayName = candidateName || item.candidate_name || 'Verified Candidate';
  const displayPhone = candidatePhone || item.candidate_phone || '';
  const displayDate = formatDate(item.walk_in_date || item.interview_date);
  const displayTime =
    item.interview_time ||
    (item.walk_in_start_time
      ? `${item.walk_in_start_time}${item.walk_in_end_time ? ' - ' + item.walk_in_end_time : ''}`
      : '10:00 AM - 04:00 PM');
  const venueAddress = item.venue_address || item.job_location || 'Company Factory Premises';

  const handleOpenMap = () => {
    if (item.maps_link && typeof item.maps_link === 'string' && item.maps_link.trim().startsWith('http')) {
      Linking.openURL(item.maps_link.trim()).catch(() => {});
      return;
    }
    const query = encodeURIComponent(`${venueAddress} ${item.company || ''}`);
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    if (mapUrl) {
      Linking.openURL(mapUrl).catch(() => {});
    }
  };

  const handleCallCoordinator = () => {
    if (item.walk_in_contact_number) {
      const tel = item.walk_in_contact_number.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${tel}`).catch(() => {});
    }
  };

  const handleOpenJobDetails = () => {
    navigation.navigate('CandidateJobDetail', {
      jobId: item.job_id,
      job: {
        ...item,
        id: item.job_id,
        title: item.job_title,
        job_title: item.job_title,
        company: item.company_name || item.company,
        company_name: item.company_name || item.company,
        location: item.job_location || item.venue_address,
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.cardContainer, isPast && styles.cardPast]}
      onPress={() => onPressPass(item)}
    >
      {/* Top Header Ticket Banner */}
      <View style={[styles.headerBanner, isPast && styles.headerBannerPast]}>
        <View style={styles.headerLeft}>
          <Ticket size={14} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.headerTitleText}>WALK-IN DRIVE ENTRY PASS</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={styles.passNumberBadge}>
            <Text style={styles.passNumberText}>{passNumber}</Text>
          </View>
          <ChevronRight size={14} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </View>

      {/* Ticket Perforated Connector */}
      <View style={styles.perforatedConnector}>
        <View style={styles.perforatedNotchLeft} />
        <View style={styles.perforatedDottedLine} />
        <View style={styles.perforatedNotchRight} />
      </View>

      {/* Ticket Content Body */}
      <View style={styles.contentBody}>
        {/* Job Title & Company */}
        <View style={styles.topInfoRow}>
          <View style={styles.companyIconBox}>
            <Building2 size={16} color={isPast ? '#94A3B8' : COLORS.primary} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleOpenJobDetails}>
              <Text style={[styles.jobTitleText, isPast && styles.textMuted]} numberOfLines={1}>
                {item.job_title}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.companyText, isPast && styles.textMuted2]} numberOfLines={1}>
              {item.company_name || item.company}
              {item.job_location ? ` • ${item.job_location}` : ''}
            </Text>
          </View>

          {/* Countdown Badge */}
          {isPast ? (
            <View style={[styles.countdownBadge, styles.countdownBadgePast]}>
              <Text style={styles.countdownTextPast}>COMPLETED</Text>
            </View>
          ) : days === 0 ? (
            <View style={[styles.countdownBadge, styles.countdownBadgeToday]}>
              <Text style={styles.countdownTextToday}>TODAY</Text>
            </View>
          ) : days === 1 ? (
            <View style={[styles.countdownBadge, styles.countdownBadgeTomorrow]}>
              <Text style={styles.countdownTextTomorrow}>TOMORROW</Text>
            </View>
          ) : (
            <View style={[styles.countdownBadge, styles.countdownBadgeFuture]}>
              <Text style={styles.countdownTextFuture}>{days} days left</Text>
            </View>
          )}
        </View>

        {/* Section Divider */}
        <View style={styles.sectionDividerSlate} />

        {/* Schedule Grid: Date & Time */}
        <View style={styles.scheduleGrid}>
          <View style={styles.scheduleGridCell}>
            <View style={styles.scheduleCellHeader}>
              <Calendar size={12} color={isPast ? '#94A3B8' : COLORS.primary} strokeWidth={2.4} />
              <Text style={styles.scheduleCellLabel}>REPORTING DATE</Text>
            </View>
            <Text style={[styles.scheduleCellValue, isPast && styles.textMuted]}>{displayDate}</Text>
          </View>

          <View style={styles.scheduleGridCellDivider} />

          <View style={styles.scheduleGridCell}>
            <View style={styles.scheduleCellHeader}>
              <Clock size={12} color={isPast ? '#94A3B8' : COLORS.primary} strokeWidth={2.4} />
              <Text style={styles.scheduleCellLabel}>TIME WINDOW</Text>
            </View>
            <Text style={[styles.scheduleCellValue, isPast && styles.textMuted]}>{displayTime}</Text>
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.sectionDividerSlate} />

        {/* Venue Address Row */}
        <View style={styles.venueRowBlock}>
          <View style={{ flex: 1 }}>
            <Text style={styles.venueLabel}>VENUE & GATE ADDRESS</Text>
            <Text style={[styles.venueValueText, isPast && styles.textMuted]} numberOfLines={2}>
              {venueAddress}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={styles.navigateMiniBtn} onPress={handleOpenMap}>
            <Navigation2 size={12} color={COLORS.primary} strokeWidth={2.4} />
            <Text style={styles.navigateMiniBtnText}>Map</Text>
          </TouchableOpacity>
        </View>

        {/* Coordinator Info (if available) */}
        {item.walk_in_contact_person ? (
          <>
            <View style={styles.sectionDividerSlate} />
            <View style={styles.coordinatorRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.coordinatorLabel}>ON-SITE RECRUITER</Text>
                <Text style={[styles.coordinatorName, isPast && styles.textMuted]} numberOfLines={1}>
                  {item.walk_in_contact_person}
                  {item.walk_in_contact_number ? ` (${item.walk_in_contact_number})` : ''}
                </Text>
              </View>
              {item.walk_in_contact_number && !isPast ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.callRecruiterBtn}
                  onPress={handleCallCoordinator}
                >
                  <PhoneCall size={11} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.callRecruiterBtnText}>Call</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        ) : null}

        {/* Gate Barcode Verification Strip */}
        <View style={styles.barcodeStrip}>
          <View style={styles.barcodeBars}>
            {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 4, 1, 2, 3, 1, 2].map((w, i) => (
              <View
                key={i}
                style={{
                  width: w,
                  height: 20,
                  backgroundColor: isPast ? '#94A3B8' : '#0F172A',
                  marginHorizontal: 1,
                }}
              />
            ))}
          </View>
          <Text style={styles.barcodeNoteText}>
            TAP CARD TO VIEW FULL PASS & SHARING
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardPast: {
    borderColor: '#CBD5E1',
    opacity: 0.88,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1764E8',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
  },
  headerBannerPast: {
    backgroundColor: '#64748B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitleText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.7,
  },
  passNumberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  passNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  perforatedConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  perforatedNotchLeft: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F7F7F7',
    marginLeft: -6,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  perforatedDottedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  perforatedNotchRight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F7F7F7',
    marginRight: -6,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  contentBody: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.xs,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  companyText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  countdownBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  countdownBadgeToday: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  countdownTextToday: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#1764E8',
    letterSpacing: 0.4,
  },
  countdownBadgeTomorrow: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  countdownTextTomorrow: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.4,
  },
  countdownBadgeFuture: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  countdownTextFuture: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  countdownBadgePast: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  countdownTextPast: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  scheduleGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleGridCell: {
    flex: 1,
  },
  scheduleCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  scheduleCellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  scheduleCellValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleGridCellDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 10,
  },
  venueRowBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  venueLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  venueValueText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 16,
  },
  navigateMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.xs,
  },
  navigateMiniBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  coordinatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  coordinatorLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  coordinatorName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  callRecruiterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  callRecruiterBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  barcodeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 2,
    borderRadius: RADIUS.xs,
  },
  barcodeBars: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  barcodeNoteText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  textMuted: {
    color: '#94A3B8',
  },
  textMuted2: {
    color: '#CBD5E1',
  },
});
