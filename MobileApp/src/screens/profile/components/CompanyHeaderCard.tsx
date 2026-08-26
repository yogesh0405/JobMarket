import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Check,
  Camera,
  MapPin,
  Edit3,
  Share2,
  ArrowLeft,
  Users,
  Calendar,
  Building2,
  BarChart3,
  Briefcase,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
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
}

export const CompanyHeaderCard: React.FC<CompanyHeaderCardProps> = ({
  company,
  isOwner,
  onEditPress,
  onSharePress,
  onBackPress,
  formattedLocation,
  profileTab = 'PROFILE',
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top || 0,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
  );
  const companyName = company?.name || 'Company';
  const logoUrl = company?.logo || company?.logoUrl || null;
  const industry =
    company?.industry ||
    company?.industry_type ||
    company?.industryType ||
    company?.trade_specialization ||
    company?.specialization ||
    'Industrial Manufacturing & Operations';
  const companyType = company?.company_type || company?.companyType || company?.type;
  const companySize = company?.company_size || company?.companySize;
  const foundedYear = company?.founded_year || company?.foundedYear;
  const completionPct = company?.completion_percentage || 85;

  return (
    <View style={[styles.bannerContainer, { paddingTop: topInset }]}>
      {/* Top Controls Row inside Blue Banner: Left = Back | Right = Edit Icon & Share Icon */}
      <View style={styles.topControlsRow}>
        {/* Back Button (Left) */}
        {onBackPress ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onBackPress}
            style={styles.controlCircleBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {/* Action Icons Group (Right): Edit Icon & Share Icon */}
        <View style={styles.topRightControls}>
          {isOwner && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onEditPress}
              style={styles.controlCircleBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit3 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onSharePress}
            style={styles.controlCircleBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Share2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Solid Primary Blue Header Content */}
      <View style={[styles.bannerContent, { paddingBottom: isOwner && onTabChange ? 0 : 16 }]}>
        {/* Top Info Row: Logo Avatar + Text Block */}
        <View style={styles.heroLeftRow}>
          {/* Circular Company Logo Avatar with Camera Overlay Badge */}
          <TouchableOpacity
            activeOpacity={isOwner ? 0.85 : 1}
            onPress={() => isOwner && onEditPress()}
            style={styles.avatarWrapper}
          >
            <View style={styles.avatarCircleInner}>
              <CompanyLogoAvatar
                logoUrl={logoUrl}
                companyName={companyName}
                size={52}
                borderRadius={26}
              />
            </View>
            {isOwner && (
              <View style={styles.cameraBadge}>
                <Camera size={10} color={COLORS.primary} strokeWidth={2.5} />
              </View>
            )}
          </TouchableOpacity>

          {/* Hero Text Info */}
          <View style={styles.textBlock}>
            <Text style={styles.companyTitle} numberOfLines={2}>
              {companyName}
            </Text>

            {/* Industry Type & Sector Badges in Blue Banner */}
            <View style={styles.industryBadgeRow}>
              <View style={styles.industryPill}>
                <Briefcase size={11} color="#DBEAFE" />
                <Text style={styles.industryPillText} numberOfLines={1}>
                  {industry}
                </Text>
              </View>

              {companyType ? (
                <View style={styles.companyTypePill}>
                  <Building2 size={11} color="#DBEAFE" />
                  <Text style={styles.companyTypePillText} numberOfLines={1}>
                    {companyType}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Standard Tabular Menu UI inside Blue Banner (For Employer Owners) */}
        {isOwner && onTabChange ? (
          <View style={styles.inBannerTabsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onTabChange('PROFILE')}
              style={styles.inBannerTabBtn}
            >
              <View style={styles.tabContentRow}>
                <Building2
                  size={15}
                  color={profileTab === 'PROFILE' ? '#FFFFFF' : '#BFDBFE'}
                />
                <Text
                  style={[
                    styles.inBannerTabText,
                    profileTab === 'PROFILE' && styles.inBannerTabTextActive,
                  ]}
                >
                  Enterprise Profile
                </Text>
              </View>
              {profileTab === 'PROFILE' ? (
                <View style={styles.activeUnderlineIndicator} />
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onTabChange('ANALYTICS')}
              style={styles.inBannerTabBtn}
            >
              <View style={styles.tabContentRow}>
                <BarChart3
                  size={15}
                  color={profileTab === 'ANALYTICS' ? '#FFFFFF' : '#BFDBFE'}
                />
                <Text
                  style={[
                    styles.inBannerTabText,
                    profileTab === 'ANALYTICS' && styles.inBannerTabTextActive,
                  ]}
                >
                  Recruitment Analytics
                </Text>
              </View>
              {profileTab === 'ANALYTICS' ? (
                <View style={styles.activeUnderlineIndicator} />
              ) : null}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlCircleBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 8,
  },
  heroLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
    width: 54,
    height: 54,
    flexShrink: 0,
  },
  avatarCircleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  textBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  companyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  verifiedBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  industryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  industryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    maxWidth: '100%',
    flexShrink: 1,
  },
  industryPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  companyTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    flexShrink: 1,
  },
  companyTypePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DBEAFE',
    flexShrink: 1,
  },
  taglineText: {
    fontSize: 12.5,
    color: '#DBEAFE',
    marginTop: 2,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#BFDBFE',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  completionBanner: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  completionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completionPctText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#93C5FD',
  },
  completionTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 0,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  completionChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  checkItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DBEAFE',
  },
  bannerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 110,
  },
  statItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inBannerTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 0,
  },
  inBannerTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inBannerTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#BFDBFE',
  },
  inBannerTabTextActive: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeUnderlineIndicator: {
    position: 'absolute',
    bottom: -8,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});
