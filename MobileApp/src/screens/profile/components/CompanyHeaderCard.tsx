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
  Image,
  Linking,
} from 'react-native';
import {
  Check,
  ArrowLeft,
  Share2,
  Building2,
  Users,
  Plus,
  Globe,
  Edit3,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MetaVerifiedBadge } from '../../../components/common/MetaVerifiedBadge';
import { formatFollowersCount } from '../../../api/companyApi';

interface CompanyHeaderCardProps {
  company: any;
  isOwner: boolean;
  onEditPress: () => void;
  onSharePress: () => void;
  onBackPress?: () => void;
  formattedLocation: string;
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
    (Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : (insets.top || 16)) + 6;

  const companyName = (company?.name || 'Company').trim();
  const logoUrl =
    company?.logo ||
    company?.logoUrl ||
    company?.profile_picture_url ||
    company?.profilePictureUrl ||
    null;

  const industry =
    company?.industry ||
    company?.industry_type ||
    company?.trade_specialization ||
    'Manufacturing & Engineering';

  const companyType =
    company?.company_type ||
    company?.companyType ||
    'Private Limited';

  const tagline =
    company?.description &&
    company.description.trim().length > 3 &&
    !['na', 'n/a', 'none', 'null', 'undefined', '-'].includes(company.description.trim().toLowerCase())
      ? company.description.trim()
      : 'Leading manufacturing and engineering operations plant.';

  const website = company?.website || company?.website_url || null;

  const handleOpenWebsite = () => {
    if (!website) return;
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.headerContainer}>
      {/* 1. Hero Cover Banner */}
      <View style={[styles.heroBanner, { paddingTop: topInset }]}>
        <ImageBackground
          source={require('../../../../assets/company_header_bg.jpg')}
          style={styles.heroBgImage}
          resizeMode="cover"
        >
          {/* Top Utility Controls */}
          <View style={styles.topControlsRow}>
            {onBackPress ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onBackPress}
                style={styles.navIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}

            <View style={styles.topRightControls}>
              {website ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleOpenWebsite}
                  style={styles.navIconBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Globe size={19} color="#FFFFFF" strokeWidth={2.2} />
                </TouchableOpacity>
              ) : null}

              {isOwner ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onEditPress}
                  style={styles.navIconBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Edit3 size={18} color="#FFFFFF" strokeWidth={2.2} />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onSharePress}
                style={styles.navIconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Share2 size={19} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* 2. Floating Elevated Header Card (Exact Web Card Layout) */}
      <View style={styles.floatingCard}>
        {/* Identity Row: Logo + Company Name & Checkmark + Tagline */}
        <View style={styles.identityRow}>
          {/* Square Logo Box with Subtle Shadow & Border */}
          <View style={styles.logoBox}>
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Building2 size={32} color="#1B4FDF" strokeWidth={2.2} />
            )}
          </View>

          {/* Company Info */}
          <View style={styles.identityInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.companyTitle} numberOfLines={1}>
                {companyName}
              </Text>
              <MetaVerifiedBadge size={20} color="#0095F6" />
            </View>

            <Text style={styles.companyTagline} numberOfLines={2}>
              {tagline}
            </Text>
          </View>
        </View>

        {/* Modern Pill Badges Row */}
        <View style={styles.badgesRow}>
          {industry ? (
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText} numberOfLines={1}>
                {industry}
              </Text>
            </View>
          ) : null}

          {companyType ? (
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText} numberOfLines={1}>
                {companyType}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Actions Row: Followers count on Left, Follow / Following button on Right */}
        <View style={styles.cardActionsRow}>
          <View style={styles.followerCountWrap}>
            <Users size={14} color="#64748B" strokeWidth={2.2} />
            <Text style={styles.followerText}>
              <Text style={styles.followerCountBold}>
                {formatFollowersCount(followersCount)}
              </Text>
              {' followers'}
            </Text>
          </View>

          {isOwner ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onEditPress}
              style={styles.ownerEditBtn}
            >
              <Edit3 size={14} color="#1B4FDF" strokeWidth={2.4} />
              <Text style={styles.ownerEditText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isSubmittingFollow}
              onPress={onToggleFollow}
              style={[
                styles.followBtn,
                isFollowing ? styles.followingBtn : styles.notFollowingBtn,
              ]}
            >
              {isSubmittingFollow ? (
                <ActivityIndicator
                  size="small"
                  color={isFollowing ? '#0F172A' : '#FFFFFF'}
                />
              ) : isFollowing ? (
                <>
                  <Check size={15} color="#10B981" strokeWidth={2.8} />
                  <Text style={styles.followingBtnText}>Following</Text>
                </>
              ) : (
                <>
                  <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
                  <Text style={styles.notFollowingBtnText}>Follow</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  heroBanner: {
    backgroundColor: '#0A58E2',
    height: 125,
    overflow: 'hidden',
  },
  heroBgImage: {
    width: '100%',
    height: '100%',
  },
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  navIconBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingCard: {
    marginTop: -34,
    marginHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  identityInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  companyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  companyTagline: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 4,
  },
  pillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  followerCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  followerCountBold: {
    color: '#0F172A',
    fontWeight: '700',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  notFollowingBtn: {
    backgroundColor: '#1B4FDF',
    borderWidth: 1,
    borderColor: '#1B4FDF',
  },
  notFollowingBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  followingBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  followingBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  ownerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  ownerEditText: {
    color: '#1B4FDF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
