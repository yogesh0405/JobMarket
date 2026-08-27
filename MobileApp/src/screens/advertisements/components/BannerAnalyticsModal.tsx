import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Eye,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  EyeOff,
} from 'lucide-react-native';
import { Advertisement } from '../../../types';
import { COLORS } from '../../../constants/theme';
import { apiFetch } from '../../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BannerAnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
  banner: Advertisement | null;
}

export const BannerAnalyticsModal: React.FC<BannerAnalyticsModalProps> = ({
  visible,
  onClose,
  banner,
}) => {
  const insets = useSafeAreaInsets();
  const [liveBanner, setLiveBanner] = useState<Advertisement | null>(banner);
  const [loadingFresh, setLoadingFresh] = useState(false);

  useEffect(() => {
    if (banner && visible) {
      setLiveBanner(banner);
      const fetchFresh = (silent = false) => {
        if (!silent) setLoadingFresh(true);
        apiFetch(`/api/v1/employer/advertisements/${banner.id}`)
          .then((res) => {
            if (res.success && res.data) {
              setLiveBanner(res.data);
            }
          })
          .catch(() => {})
          .finally(() => {
            if (!silent) setLoadingFresh(false);
          });
      };

      fetchFresh(false);
      const timer = setInterval(() => fetchFresh(true), 4000);
      return () => clearInterval(timer);
    }
  }, [banner, visible]);

  if (!banner && !liveBanner) return null;
  const current = liveBanner || banner;
  if (!current) return null;

  // Real Database Metrics
  const views = Number(current.views_count ?? (current as any).views ?? 0);
  const clicks = Number(current.clicks_count ?? (current as any).clicks ?? 0);
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

  const rawStatus = (current.status || (current as any).approval_status || 'PENDING_APPROVAL').toUpperCase();
  const isLive = (rawStatus === 'APPROVED' || rawStatus === 'PUBLISHED') && current.is_active === true;
  const isRejected = rawStatus === 'REJECTED';
  const isResubmitted = rawStatus === 'RESUBMITTED';
  const isUnpublished = rawStatus === 'UNPUBLISHED' || ((rawStatus === 'DRAFT' || rawStatus === 'APPROVED' || rawStatus === 'PUBLISHED') && current.is_active === false);
  const isInReview = !isLive && !isRejected && !isUnpublished && !isResubmitted;

  const reasonText = (
    current.rejection_reason ||
    (current as any).rejectionReason ||
    (current as any).unpublish_reason ||
    (current as any).unpublishReason ||
    (current as any).admin_reason ||
    (current as any).adminReason ||
    (current as any).notes ||
    (current as any).reason ||
    ''
  ).trim();

  const displayStatusLabel = isLive
    ? 'LIVE ON HOMEPAGE'
    : isResubmitted
    ? 'RESUBMITTED (PENDING APPROVAL)'
    : isRejected
    ? 'REJECTED'
    : isUnpublished
    ? 'UNPUBLISHED (INACTIVE)'
    : 'IN REVIEW (PENDING APPROVAL)';

  const formatDate = (dStr?: string) => {
    if (!dStr) return 'N/A';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString();
    } catch {
      return dStr.slice(0, 10);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom || 0, 24) + 24 }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.headerTitle}>Real-Time Banner Analytics</Text>
                {loadingFresh && <ActivityIndicator size="small" color={COLORS.primary} />}
              </View>
              <Text style={styles.headerSub} numberOfLines={1}>
                {current.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentPadding}
          >
            {/* Metric KPI Cards (100% Real Live Database Metrics) */}
            <View style={styles.kpiRow}>
              {/* Total Views */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Eye size={15} color="#2563EB" />
                  </View>
                  <Text style={styles.kpiValue}>{views.toLocaleString()}</Text>
                </View>
                <Text style={styles.kpiLabel}>Total Views</Text>
              </View>

              {/* Total Clicks */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#F0FDF4' }]}>
                    <MousePointerClick size={15} color="#16A34A" />
                  </View>
                  <Text style={styles.kpiValue}>{clicks.toLocaleString()}</Text>
                </View>
                <Text style={styles.kpiLabel}>Total Clicks</Text>
              </View>

              {/* CTR % */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <TrendingUp size={15} color="#D97706" />
                  </View>
                  <Text style={styles.kpiValue}>{ctr}%</Text>
                </View>
                <Text style={styles.kpiLabel}>Click Rate (CTR)</Text>
              </View>
            </View>

            {/* Admin Reason Notice if Rejected or Unpublished */}
            {(isRejected || isUnpublished) && (
              <View style={isRejected ? styles.modalNoticeBoxRejected : styles.modalNoticeBoxUnpublished}>
                <View style={styles.modalNoticeHeader}>
                  {isRejected ? (
                    <AlertCircle size={15} color="#DC2626" strokeWidth={2.4} />
                  ) : (
                    <EyeOff size={15} color="#D97706" strokeWidth={2.4} />
                  )}
                  <Text style={isRejected ? styles.modalNoticeTitleRejected : styles.modalNoticeTitleUnpublished}>
                    {isRejected ? 'REASON FOR REJECTION' : 'REASON FOR UNPUBLISHING'}
                  </Text>
                </View>
                <Text style={isRejected ? styles.modalNoticeBodyRejected : styles.modalNoticeBodyUnpublished}>
                  {reasonText ||
                    (isRejected
                      ? 'This advertisement banner did not meet platform guidelines.'
                      : 'This banner was unpublished from the homepage by an administrator.')}
                </Text>
              </View>
            )}

            {/* Campaign Specifications */}
            <View style={styles.specsSection}>
              <Text style={styles.specsSectionTitle}>CAMPAIGN PERFORMANCE SPECIFICATIONS</Text>

              <View style={styles.specRow}>
                <Layers size={15} color={COLORS.primary} />
                <Text style={styles.specLabel}>Ad Type:</Text>
                <Text style={styles.specVal}>
                  {(current.advertisement_type || 'FEATURED_JOB').replace(/_/g, ' ')}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.specRow}>
                <Briefcase size={15} color={COLORS.primary} />
                <Text style={styles.specLabel}>Linked Job:</Text>
                <Text style={styles.specVal} numberOfLines={1}>
                  {(current as any).job_title ||
                    (current as any).jobTitle ||
                    (current as any).job?.title ||
                    'Direct Application'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.specRow}>
                <Calendar size={15} color={COLORS.primary} />
                <Text style={styles.specLabel}>Active Window:</Text>
                <Text style={styles.specVal}>
                  {formatDate(current.start_date)} → {formatDate(current.end_date)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.specRow}>
                {isLive ? (
                  <CheckCircle2 size={15} color="#16A34A" />
                ) : isRejected ? (
                  <XCircle size={15} color="#DC2626" />
                ) : isUnpublished ? (
                  <EyeOff size={15} color="#D97706" />
                ) : (
                  <Clock size={15} color="#D97706" />
                )}
                <Text style={styles.specLabel}>Live Status:</Text>
                <Text
                  style={[
                    styles.specVal,
                    {
                      color: isLive ? '#16A34A' : isRejected ? '#DC2626' : isUnpublished ? '#D97706' : '#D97706',
                      fontWeight: '800',
                    },
                  ]}
                >
                  {displayStatusLabel}
                </Text>
              </View>

              {current.target_audience ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.specRow}>
                    <Layers size={15} color={COLORS.primary} />
                    <Text style={styles.specLabel}>Audience Target:</Text>
                    <Text style={styles.specVal} numberOfLines={1}>
                      {current.target_audience}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.doneBtn} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close Analytics</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 18,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  kpiIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  specsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 18,
  },
  specsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  specLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  specVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  doneBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContentPadding: {
    paddingBottom: 28,
  },

  /* Admin Moderation Notice in Modal */
  modalNoticeBoxRejected: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderLeftWidth: 3.5,
    borderLeftColor: '#DC2626',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalNoticeBoxUnpublished: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderLeftWidth: 3.5,
    borderLeftColor: '#D97706',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  modalNoticeTitleRejected: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.4,
  },
  modalNoticeTitleUnpublished: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.4,
  },
  modalNoticeBodyRejected: {
    fontSize: 12,
    color: '#7F1D1D',
    fontWeight: '500',
    lineHeight: 16,
  },
  modalNoticeBodyUnpublished: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '500',
    lineHeight: 16,
  },
});
