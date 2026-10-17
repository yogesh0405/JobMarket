import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  Check,
  ArrowLeft,
  Share2,
  Building2,
  Lock,
  Edit3,
  Users,
  Plus,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { MetaVerifiedBadge } from '../../../components/common/MetaVerifiedBadge';
import { formatFollowersCount } from '../../../api/companyApi';
import { COLORS } from '../../../constants/theme';

interface CompanyHeaderCardProps {
  company: any;
  isOwner: boolean;
  onEditPress: () => void;
  onSharePress: () => void;
  onBackPress?: () => void;
  formattedLocation: string;
  profileTab?: 'PROFILE' | 'ANALYTICS';
  onTabChange?: (tab: 'PROFILE' | 'ANALYTICS') => void;
  followersCount?: number;
  isFollowing?: boolean;
  isSubmittingFollow?: boolean;
  onToggleFollow?: () => void;
}

export const CompanyHeaderCard: React.FC<CompanyHeaderCardProps> = ({
  company,
  isOwner,
  onEditPress,
  onSharePress,
  onBackPress,
  followersCount = 0,
  isFollowing = false,
  isSubmittingFollow = false,
  onToggleFollow,
}) => {
  const insets = useSafeAreaInsets();
  const topInset =
    (Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : (insets.top || 16)) + 4;
  const companyName = company?.name || '';
  const rawCompanyName = (companyName || '').trim();
  const nameParts = rawCompanyName.split(/\s+/).filter(Boolean);
  const leadingName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
  const lastWord = nameParts.length > 0 ? nameParts[nameParts.length - 1] : rawCompanyName;
  const logoUrl = company?.logo || company?.logoUrl || null;
  const industry =
    company?.industry ||
    company?.industry_type ||
    company?.trade_specialization ||
    '';
  const companyType = company?.company_type || company?.companyType || '';

  return (
    <View style={[styles.bannerContainer, { paddingTop: topInset }]}>
      {/* Exact Blue Image Background with Mild Right-Sided Silhouette */}
      <ImageBackground
        source={require('../../../../assets/company_header_bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.headerContentContainer}>
          {/* Top Navigation Controls */}
          <View style={styles.topControlsRow}>
            {onBackPress ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onBackPress}
                style={styles.controlCircleBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
              </TouchableOpacity>
            ) : (
              <View />
            )}

            <View style={styles.topRightControls}>
              {isOwner && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onEditPress}
                  style={styles.controlCircleBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Edit3 size={17} color="#FFFFFF" strokeWidth={2.2} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onSharePress}
                style={styles.controlCircleBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Share2 size={17} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Company Identity Hero Row */}
          <View style={styles.identityRow}>
            {/* Company Logo Avatar (Circular Shape, No outer white ring) */}
            <View style={styles.avatarWrapper}>
              <CompanyLogoAvatar
                logoUrl={logoUrl}
                companyName={companyName}
                size={64}
                borderRadius={32}
              />
            </View>

            {/* Company Info */}
            <View style={styles.detailsCol}>
              {/* Company Name + Meta / Instagram Verified Badge */}
              <View style={styles.titleRow}>
                {leadingName ? (
                  <Text style={styles.companyTitle}>
                    {leadingName}{' '}
                  </Text>
                ) : null}
                <View style={styles.lastWordBadgeGroup}>
                  <Text style={styles.companyTitle}>
                    {lastWord}
                  </Text>
                  <MetaVerifiedBadge size={19} color="#0095F6" style={styles.verifiedBadgeIcon} />
                </View>
              </View>

              {/* Subtitle Category Chips (Single Row) */}
              <View style={styles.badgePillsRow}>
                {industry ? (
                  <View style={styles.translucentPill}>
                    <Building2 size={12} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.translucentPillText} numberOfLines={1}>
                      {industry}
                    </Text>
                  </View>
                ) : null}

                {companyType ? (
                  <View style={styles.translucentPill}>
                    <Lock size={12} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.translucentPillText} numberOfLines={1}>
                      {companyType}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Followers & Follow CTA for Visitors Only */}
          {!isOwner && (
            <View style={styles.followersRow}>
              <View style={styles.followerBadge}>
                <Users size={14} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.followerCountText}>
                  {formatFollowersCount(followersCount)}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isSubmittingFollow}
                onPress={onToggleFollow}
                style={[
                  styles.followBtn,
                  isFollowing ? styles.followingBtn : styles.notFollowingBtn,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 10, right: 10 }}
              >
                {isSubmittingFollow ? (
                  <ActivityIndicator size="small" color={isFollowing ? '#FFFFFF' : '#0A58E2'} />
                ) : isFollowing ? (
                  <>
                    <Check size={14} color="#10B981" strokeWidth={2.6} />
                    <Text style={styles.followingBtnText}>Following</Text>
                  </>
                ) : (
                  <>
                    <Plus size={14} color="#0A58E2" strokeWidth={2.6} />
                    <Text style={styles.notFollowingBtnText}>Follow</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#0A58E2',
    overflow: 'hidden',
  },
  bgImage: {
    width: '100%',
  },
  headerContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 54,
  },
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 6,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlCircleBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarWrapper: {
    marginRight: 14,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  lastWordBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadgeIcon: {
    marginLeft: 6,
  },
  companyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    lineHeight: 23,
  },
  verifiedCircleBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1764E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 6,
  },
  translucentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    flexShrink: 1,
  },
  translucentPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  followersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
  },
  followerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followerCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 92,
  },
  notFollowingBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  notFollowingBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A58E2',
    letterSpacing: -0.1,
  },
  followingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  followingBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  adminIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  adminIndicatorText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
