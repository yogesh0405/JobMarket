import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import {
  Eye,
  MousePointerClick,
  Trash2,
  Edit3,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react-native';
import { Advertisement } from '../../../types';
import { COLORS } from '../../../constants/theme';

interface EmployerBannerItemCardProps {
  banner: Advertisement;
  onEdit: (banner: Advertisement) => void;
  onDelete: (id: string, title: string) => void;
}

export const EmployerBannerItemCard: React.FC<EmployerBannerItemCardProps> = ({
  banner,
  onEdit,
  onDelete,
}) => {
  if (!banner) return null;
  const isRejected = (banner.status || '').toUpperCase() === 'REJECTED';

  const renderStatusBadge = (item: Advertisement) => {
    const status = (item.status || 'PENDING').toUpperCase();
    if (status === 'APPROVED' || item.is_active) {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeActive]}>
          <CheckCircle2 size={12} color="#16A34A" />
          <Text style={[styles.statusBadgeText, { color: '#16A34A' }]}>Approved & Live</Text>
        </View>
      );
    } else if (status === 'REJECTED') {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeRejected]}>
          <XCircle size={12} color="#DC2626" />
          <Text style={[styles.statusBadgeText, { color: '#DC2626' }]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, styles.statusBadgePending]}>
        <Clock size={12} color="#D97706" />
        <Text style={[styles.statusBadgeText, { color: '#D97706' }]}>Pending Approval</Text>
      </View>
    );
  };

  return (
    <View style={styles.bannerCardContainer}>
      <View style={styles.cardHeaderRow}>
        {renderStatusBadge(banner)}
        <Text style={styles.campaignDateText}>
          {banner.start_date ? banner.start_date.slice(0, 10) : ''} - {banner.end_date ? banner.end_date.slice(0, 10) : ''}
        </Text>
      </View>

      <View style={styles.liveHomepageBannerCard}>
        <Image
          source={{
            uri: banner.banner_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
          }}
          style={styles.livePromoImage}
          resizeMode="cover"
        />

        <View style={styles.livePromoOverlay}>
          <View style={styles.livePromoBadgeOrange}>
            <Text style={styles.livePromoBadgeOrangeText}>
              {(banner.advertisement_type || 'BANNER').replace('_', ' ')}
            </Text>
          </View>

          <View style={{ gap: 2 }}>
            <Text style={styles.livePromoTitle} numberOfLines={1}>
              {banner.title}
            </Text>
            {banner.description ? (
              <Text style={styles.livePromoDesc} numberOfLines={2}>
                {banner.description}
              </Text>
            ) : null}
          </View>

          <View style={styles.livePromoActionBtnBlue}>
            <Text style={styles.livePromoActionBtnText}>
              {banner.button_text || 'Apply Now'}
            </Text>
            <ArrowRight size={13} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {isRejected && banner.rejection_reason ? (
        <View style={styles.rejectionNoticeBox}>
          <AlertCircle size={14} color="#DC2626" />
          <Text style={styles.rejectionNoticeText}>
            Rejection Reason: {banner.rejection_reason}
          </Text>
        </View>
      ) : null}

      <View style={styles.bannerFooterRow}>
        <View style={styles.statsBarInline}>
          <View style={styles.statItem}>
            <Eye size={13} color="#64748B" />
            <Text style={styles.statText}>{banner.views_count || 0} Views</Text>
          </View>
          <Text style={{ color: '#CBD5E1' }}>•</Text>
          <View style={styles.statItem}>
            <MousePointerClick size={13} color="#64748B" />
            <Text style={styles.statText}>{banner.clicks_count || 0} Clicks</Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => onEdit(banner)}>
            <Edit3 size={14} color={COLORS.primary} />
            <Text style={styles.actionBtnSecondaryText}>{isRejected ? 'Resubmit' : 'Edit'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtnDanger} onPress={() => onDelete(banner.id, banner.title)}>
            <Trash2 size={14} color="#DC2626" />
            <Text style={styles.actionBtnDangerText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  campaignDateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  liveHomepageBannerCard: {
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  livePromoImage: {
    width: '100%',
    height: '100%',
  },
  livePromoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    padding: 12,
    justifyContent: 'space-between',
  },
  livePromoBadgeOrange: {
    alignSelf: 'flex-start',
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  livePromoBadgeOrangeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  livePromoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  livePromoDesc: {
    fontSize: 11.5,
    color: '#E2E8F0',
    lineHeight: 15,
  },
  livePromoActionBtnBlue: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  livePromoActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rejectionNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  rejectionNoticeText: {
    fontSize: 11.5,
    color: '#DC2626',
    flex: 1,
    fontWeight: '600',
  },
  bannerFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statsBarInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnSecondaryText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnDangerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
});
