import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import {
  Briefcase,
  Calendar,
  BarChart2,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  EyeOff,
  RefreshCw,
} from 'lucide-react-native';
import { Advertisement } from '../../../types';
import { COLORS } from '../../../constants/theme';

interface EmployerBannerItemCardProps {
  banner: Advertisement;
  onEdit: (banner: Advertisement) => void;
  onDelete: (id: string, title: string) => void;
  onViewAnalytics: (banner: Advertisement) => void;
}

const DEFAULT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';

export const EmployerBannerItemCard: React.FC<EmployerBannerItemCardProps> = ({
  banner,
  onEdit,
  onDelete,
  onViewAnalytics,
}) => {
  if (!banner) return null;

  const rawImage = banner.banner_image?.trim();
  const initialUri = rawImage && rawImage.length > 5 ? rawImage : DEFAULT_BANNER_IMAGE;
  const [imageUri, setImageUri] = React.useState<string>(initialUri);

  React.useEffect(() => {
    const raw = banner.banner_image?.trim();
    setImageUri(raw && raw.length > 5 ? raw : DEFAULT_BANNER_IMAGE);
  }, [banner.banner_image]);

  const rawStatus = (banner.status || (banner as any).approval_status || 'PENDING_APPROVAL').toUpperCase();
  const isPast = rawStatus === 'EXPIRED' || (banner.end_date ? new Date(banner.end_date).getTime() < new Date().getTime() : false);
  const isLive = !isPast && (rawStatus === 'APPROVED' || rawStatus === 'PUBLISHED') && banner.is_active === true;
  const isRejected = rawStatus === 'REJECTED';
  const isResubmitted = rawStatus === 'RESUBMITTED';
  const isUnpublished = !isPast && (rawStatus === 'UNPUBLISHED' || ((rawStatus === 'DRAFT' || rawStatus === 'APPROVED' || rawStatus === 'PUBLISHED') && banner.is_active === false));
  const isInReview = !isLive && !isPast && !isRejected && !isUnpublished && !isResubmitted;

  const reasonText = (
    banner.rejection_reason ||
    (banner as any).rejectionReason ||
    (banner as any).unpublish_reason ||
    (banner as any).unpublishReason ||
    (banner as any).admin_reason ||
    (banner as any).adminReason ||
    (banner as any).notes ||
    (banner as any).reason ||
    ''
  ).trim();

  // Format dates e.g. 26/08/2026 -> 09/09/2026
  const formatDate = (dStr?: string) => {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dStr.slice(0, 10);
    }
  };

  const startFormatted = formatDate(banner.start_date) || '26/08/2026';
  const endFormatted = formatDate(banner.end_date) || '09/09/2026';
  const linkedTitle = (banner as any).job_title || (banner as any).jobTitle || (banner as any).job?.title || 'Weaving & Spinning Technician';
  const adTypeLabel = (banner.advertisement_type || 'FEATURED_JOB').replace(/_/g, ' ');

  return (
    <View style={styles.cardWrapper}>
      {/* 1. Image Banner Area with Top Badges & Bottom Overlay Title */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: imageUri }}
          onError={() => setImageUri(DEFAULT_BANNER_IMAGE)}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        {/* Top Badges Row */}
        <View style={styles.imageTopRow}>
          {/* Tag Pill (e.g. FEATURED JOB) */}
          <View style={styles.featuredJobTag}>
            <Text style={styles.featuredJobTagText}>{adTypeLabel}</Text>
          </View>

          {/* Status Badge (In Review / Resubmitted / Live / Rejected / Unpublished / Expired) */}
          {isInReview && (
            <View style={styles.statusBadgeReview}>
              <Clock size={13} color="#B45309" strokeWidth={2.4} />
              <Text style={styles.statusTextReview}>In Review</Text>
            </View>
          )}

          {isResubmitted && (
            <View style={styles.statusBadgeResubmitted}>
              <RefreshCw size={12} color="#1D4ED8" strokeWidth={2.5} />
              <Text style={styles.statusTextResubmitted}>Resubmitted</Text>
            </View>
          )}

          {isLive && (
            <View style={styles.statusBadgeLive}>
              <CheckCircle2 size={13} color="#15803D" strokeWidth={2.4} />
              <Text style={styles.statusTextLive}>Live</Text>
            </View>
          )}

          {isPast && (
            <View style={styles.statusBadgeExpired}>
              <Calendar size={13} color="#64748B" strokeWidth={2.4} />
              <Text style={styles.statusTextExpired}>Expired</Text>
            </View>
          )}

          {isRejected && (
            <View style={styles.statusBadgeRejected}>
              <XCircle size={13} color="#DC2626" strokeWidth={2.4} />
              <Text style={styles.statusTextRejected}>Rejected</Text>
            </View>
          )}

          {isUnpublished && (
            <View style={styles.statusBadgeUnpublished}>
              <EyeOff size={13} color="#D97706" strokeWidth={2.4} />
              <Text style={styles.statusTextUnpublished}>Unpublished</Text>
            </View>
          )}
        </View>

        {/* Dark Gradient Overlay for Title */}
        <View style={styles.titleGradientOverlay}>
          <Text style={styles.bannerTitleText} numberOfLines={2}>
            {banner.title || 'Simple and easy applying for job'}
          </Text>
        </View>
      </View>

      {/* 2. Linked Job Row */}
      <View style={styles.linkedJobRow}>
        <Briefcase size={15} color={COLORS.primary} />
        <Text style={styles.linkedLabel}>
          Linked: <Text style={styles.linkedTitle}>{linkedTitle}</Text>
        </Text>
      </View>

      {/* 3. Reason for Rejection Notice if applicable */}
      {isRejected && (
        <View style={styles.rejectionNoticeBox}>
          <View style={styles.noticeHeaderRow}>
            <AlertCircle size={14} color="#DC2626" strokeWidth={2.5} />
            <Text style={styles.rejectionNoticeHeading}>Reason for Rejection</Text>
          </View>
          <Text style={styles.rejectionNoticeText}>
            {reasonText || 'This advertisement banner did not meet platform guidelines. Please update the details and resubmit.'}
          </Text>
        </View>
      )}

      {/* 4. Reason for Unpublishing Notice if applicable */}
      {isUnpublished && (
        <View style={styles.unpublishedNoticeBox}>
          <View style={styles.noticeHeaderRow}>
            <EyeOff size={14} color="#D97706" strokeWidth={2.5} />
            <Text style={styles.unpublishedNoticeHeading}>Reason for Unpublishing</Text>
          </View>
          <Text style={styles.unpublishedNoticeText}>
            {reasonText || 'This banner was unpublished from the homepage by an administrator. You can edit and resubmit it.'}
          </Text>
        </View>
      )}

      {/* 5. Expired Notice if applicable */}
      {isPast && (
        <View style={styles.expiredNoticeBox}>
          <View style={styles.noticeHeaderRow}>
            <Calendar size={14} color="#64748B" strokeWidth={2.5} />
            <Text style={styles.expiredNoticeHeading}>Campaign Expired</Text>
          </View>
          <Text style={styles.expiredNoticeText}>
            This banner campaign duration has ended. You can update dates to resubmit or run a new campaign.
          </Text>
        </View>
      )}

      {/* 6. Resubmitted Notice if applicable */}
      {isResubmitted && (
        <View style={styles.resubmittedNoticeBox}>
          <View style={styles.noticeHeaderRow}>
            <RefreshCw size={13} color="#1D4ED8" strokeWidth={2.4} />
            <Text style={styles.resubmittedNoticeHeading}>Resubmitted for Review</Text>
          </View>
          <Text style={styles.resubmittedNoticeText}>
            You have resubmitted this advertisement with changes. It is currently under moderation review by administrators.
          </Text>
        </View>
      )}

      {/* 5. Action Buttons (Analytics, Edit, Delete) */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.analyticsBtn}
          activeOpacity={0.8}
          onPress={() => onViewAnalytics(banner)}
        >
          <BarChart2 size={15} color={COLORS.primary} />
          <Text style={styles.analyticsBtnText}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.8}
          onPress={() => onEdit(banner)}
        >
          <Edit3 size={15} color="#334155" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          activeOpacity={0.8}
          onPress={() => onDelete(banner.id, banner.title)}
        >
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },

  /* 1. Image Thumbnail & Overlays */
  imageBox: {
    width: '100%',
    height: 145,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imageTopRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  featuredJobTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 4,
  },
  featuredJobTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Status Badges */
  statusBadgeReview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusTextReview: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  statusBadgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusTextLive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  statusBadgeRejected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusTextRejected: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  statusBadgeUnpublished: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusTextUnpublished: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadgeExpired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusTextExpired: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  statusBadgeResubmitted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusTextResubmitted: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  titleGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  bannerTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },

  /* 2. Linked Job */
  linkedJobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  linkedLabel: {
    fontSize: 12.5,
    color: '#64748B',
    flex: 1,
  },
  linkedTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Notice Boxes */
  noticeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  rejectionNoticeBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderLeftWidth: 3.5,
    borderLeftColor: '#DC2626',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  rejectionNoticeHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#991B1B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rejectionNoticeText: {
    fontSize: 12,
    color: '#7F1D1D',
    fontWeight: '500',
    lineHeight: 17,
  },
  unpublishedNoticeBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderLeftWidth: 3.5,
    borderLeftColor: '#D97706',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  unpublishedNoticeHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  unpublishedNoticeText: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '500',
    lineHeight: 17,
  },
  resubmittedNoticeBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderLeftWidth: 3.5,
    borderLeftColor: '#1D4ED8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  resubmittedNoticeHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  resubmittedNoticeText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '500',
    lineHeight: 17,
  },
  expiredNoticeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 3.5,
    borderLeftColor: '#64748B',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  expiredNoticeHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  expiredNoticeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 17,
  },

  /* 3. Date & Priority Box */
  datePriorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },

  /* 4. Action Buttons */
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyticsBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 6,
    paddingVertical: 8,
  },
  analyticsBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  editBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 8,
  },
  editBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  deleteBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
