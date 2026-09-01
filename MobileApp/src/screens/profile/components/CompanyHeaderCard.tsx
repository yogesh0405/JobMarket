import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ImageBackground,
  StatusBar,
} from 'react-native';
import {
  Check,
  ArrowLeft,
  Share2,
  Building2,
  Lock,
  Headphones,
  Edit3,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';

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
}) => {
  const insets = useSafeAreaInsets();
  const topInset =
    (Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : (insets.top || 16)) + 4;
  const companyName = company?.name || 'insightforge';
  const logoUrl = company?.logo || company?.logoUrl || null;
  const industry =
    company?.industry ||
    company?.industry_type ||
    company?.trade_specialization ||
    'Industrial Manufacturing';
  const companyType = company?.company_type || company?.companyType || 'Private Limited';

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
            {/* Large Circular White Logo Container */}
            <View style={styles.avatarCircle}>
              {logoUrl ? (
                <CompanyLogoAvatar
                  logoUrl={logoUrl}
                  companyName={companyName}
                  size={68}
                  borderRadius={34}
                />
              ) : (
                <Headphones size={38} color="#1764E8" strokeWidth={2.3} />
              )}
            </View>

            {/* Company Info */}
            <View style={styles.detailsCol}>
              {/* Company Name + Verified Badge */}
              <View style={styles.titleRow}>
                <Text style={styles.companyTitle} numberOfLines={1}>
                  {companyName}
                </Text>
                <View style={styles.verifiedCircleBadge}>
                  <Check size={11} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>

              {/* Subtitle Category Chips (Single Row) */}
              <View style={styles.badgePillsRow}>
                <View style={styles.translucentPill}>
                  <Building2 size={12} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.translucentPillText} numberOfLines={1}>
                    {industry}
                  </Text>
                </View>

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
    paddingBottom: 48,
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
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#102A5C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  companyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
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
});
