import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ImageBackground,
  StatusBar,
  Share,
} from 'react-native';
import {
  Camera,
  Edit3,
  Share2,
  User,
  Briefcase,
  Check,
  MapPin,
  Award,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateCandidateProfileCompletion } from '../../../utils/profileCompleteness';

interface CandidateProfileHeroCardProps {
  user: any;
  name: string;
  headline: string;
  tradeSpecialization: string;
  customTrade: string;
  isOtherSelected: boolean;
  location: string;
  phone: string;
  bio: string;
  experience: any[];
  skills?: string[];
  education?: any[];
  resumeUrl?: string;
  profilePhotoUrl: string;
  onPickPhoto: () => void;
  onEditPress: () => void;
  activeTab?: 'PERSONAL' | 'PROFESSIONAL';
  onTabChange?: (tab: 'PERSONAL' | 'PROFESSIONAL') => void;
}

export const CandidateProfileHeroCard: React.FC<CandidateProfileHeroCardProps> = ({
  user,
  name,
  headline,
  tradeSpecialization,
  customTrade,
  isOtherSelected,
  location,
  phone,
  bio,
  experience,
  skills,
  education,
  resumeUrl,
  profilePhotoUrl,
  onPickPhoto,
  onEditPress,
  activeTab = 'PERSONAL',
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const topInset =
    (Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : (insets.top || 16)) + 4;

  const tradeDisplay =
    isOtherSelected || tradeSpecialization === 'Other'
      ? customTrade || 'Industrial Workforce'
      : tradeSpecialization || 'Industrial Workforce';

  const userFull = {
    ...user,
    name,
    headline,
    tradeSpecialization,
    customTrade,
    location,
    phone,
    bio,
    experience: experience || user?.experience || [],
    skills: skills || user?.skills || [],
    education: education || user?.education || [],
    resume_url: resumeUrl || user?.resume_url || user?.resumeUrl,
    avatar_url: profilePhotoUrl || user?.avatar_url || user?.avatarUrl,
  };
  const completionPercentage = calculateCandidateProfileCompletion(userFull).totalScore;
  const skillsCount =
    skills && skills.length > 0 ? skills.length : user?.skills?.length || 0;

  const displayName = name || user?.name || 'Candidate';
  const getInitials = (str: string) => {
    if (!str) return 'C';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };
  const initials = getInitials(displayName);

  return (
    <>
      {/* 1. ROYAL BLUE HERO HEADER BANNER (EMPLOYEE CAREER THEME) */}
      <View style={[styles.bannerContainer, { paddingTop: topInset }]}>
        <ImageBackground
          source={require('../../../../assets/employee_header_bg.jpg')}
          style={styles.bgImage}
          resizeMode="cover"
        >
          <View style={styles.headerContentContainer}>
            {/* Top Navigation / Edit Control Row */}
            <View style={styles.topControlsRow}>
              <View />
              <View style={styles.topRightControls}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onEditPress}
                  style={styles.controlCircleBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Edit3 size={16} color="#FFFFFF" strokeWidth={2.2} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Share.share({
                      message: `Check out ${displayName}'s professional profile on JobMarket!`,
                    }).catch((err) => console.warn(err));
                  }}
                  style={styles.controlCircleBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Share2 size={16} color="#FFFFFF" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Candidate Identity Hero Row */}
            <View style={styles.identityRow}>
              {/* Circular Avatar Container with Camera Badge */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={onPickPhoto}
                style={styles.avatarCircle}
              >
                <View style={styles.heroAvatarFallback}>
                  <Text style={styles.heroAvatarText}>{initials}</Text>
                </View>
                {profilePhotoUrl &&
                typeof profilePhotoUrl === 'string' &&
                profilePhotoUrl.trim().length > 5 ? (
                  <Image
                    source={{ uri: profilePhotoUrl.trim() }}
                    style={styles.heroAvatarImage}
                  />
                ) : null}
                <View style={styles.heroCameraBadge}>
                  <Camera size={11} color={COLORS.primary} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>

              {/* Candidate Info */}
              <View style={styles.detailsCol}>
                {/* Candidate Name + Verified Badge */}
                <View style={styles.titleRow}>
                  <Text style={styles.candidateTitle} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <View style={styles.verifiedCircleBadge}>
                    <Check size={10} color="#FFFFFF" strokeWidth={3} />
                  </View>
                </View>

                {/* Subtitle Category Chips on Blue Banner */}
                <View style={styles.badgePillsRow}>
                  <View style={styles.translucentPill}>
                    <Award size={12} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.translucentPillText} numberOfLines={1}>
                      {tradeDisplay}
                    </Text>
                  </View>

                  {location ? (
                    <View style={styles.translucentPill}>
                      <MapPin size={12} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.translucentPillText} numberOfLines={1}>
                        {location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* 2. BODY CONTENT (STATS BAR, TAB MENU, PERSONAL DETAILS) */}
      <View style={styles.bodyWrapper}>
        {/* Quick Stats Floating Card (Overlapping Blue Banner) */}
        <View style={styles.statsBarRow}>
          <View style={styles.statCol}>
            <Text style={styles.statValText}>{experience.length}</Text>
            <Text style={styles.statLabelText}>Work Exp</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValText}>{completionPercentage}%</Text>
            <Text style={styles.statLabelText}>Completeness</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValText}>{skillsCount}</Text>
            <Text style={styles.statLabelText}>Key Skills</Text>
          </View>
        </View>

        {/* 2-Option Tab Menu with Standard Underline */}
        {onTabChange && (
          <View style={styles.tabMenuContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.tabItem}
              onPress={() => onTabChange('PERSONAL')}
            >
              <View style={styles.tabItemInner}>
                <User
                  size={14}
                  color={activeTab === 'PERSONAL' ? COLORS.primary : COLORS.textSecondary}
                  strokeWidth={activeTab === 'PERSONAL' ? 2.3 : 1.8}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === 'PERSONAL' && styles.tabItemTextActive,
                  ]}
                >
                  Personal Info
                </Text>
              </View>
              {activeTab === 'PERSONAL' && <View style={styles.tabActiveUnderline} />}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.tabItem}
              onPress={() => onTabChange('PROFESSIONAL')}
            >
              <View style={styles.tabItemInner}>
                <Briefcase
                  size={14}
                  color={
                    activeTab === 'PROFESSIONAL' ? COLORS.primary : COLORS.textSecondary
                  }
                  strokeWidth={activeTab === 'PROFESSIONAL' ? 2.3 : 1.8}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === 'PROFESSIONAL' && styles.tabItemTextActive,
                  ]}
                >
                  Professional Info
                </Text>
              </View>
              {activeTab === 'PROFESSIONAL' && <View style={styles.tabActiveUnderline} />}
            </TouchableOpacity>
          </View>
        )}

        {/* Personal Details Section Card (Shown when Personal Info is active) */}
        {activeTab === 'PERSONAL' && (
          <View style={styles.sectionCard}>
            <Text style={styles.serifCardTitle}>Personal Details</Text>

            <View style={styles.fieldsList}>
              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.fieldValueBox}>
                  <Text style={styles.fieldValueText} numberOfLines={1}>
                    {displayName}
                  </Text>
                </View>
              </View>

              {/* Role / Specialization */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Role / Trade Specialization</Text>
                <View style={styles.fieldValueBox}>
                  <Text style={styles.fieldValueText} numberOfLines={1}>
                    {tradeDisplay}
                  </Text>
                </View>
              </View>

              {/* Registered Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Registered Email</Text>
                <View style={styles.fieldValueBox}>
                  <Text style={styles.fieldValueText} numberOfLines={1}>
                    {user?.email || '—'}
                  </Text>
                </View>
              </View>

              {/* Phone / WhatsApp */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Phone / WhatsApp</Text>
                <View style={styles.fieldValueBox}>
                  <Text style={styles.fieldValueText} numberOfLines={1}>
                    {phone || '—'}
                  </Text>
                </View>
              </View>

              {/* Home City / Location Base */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Home City / Location Base</Text>
                <View style={styles.fieldValueBox}>
                  <Text style={styles.fieldValueText} numberOfLines={1}>
                    {location || '—'}
                  </Text>
                </View>
              </View>

              {/* Bio & Notes */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Professional Bio & Notes</Text>
                <View style={[styles.fieldValueBox, styles.fieldValueBoxMultiline]}>
                  <Text style={styles.fieldValueTextMultiline}>
                    {bio ||
                      'No professional bio summary added yet. Tap Edit Profile to add a summary.'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#174CB6',
    overflow: 'hidden',
  },
  bgImage: {
    width: '100%',
  },
  headerContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 44,
  },
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 4,
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
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
    shadowColor: '#102A5C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  heroAvatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroAvatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  heroAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
  candidateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  verifiedCircleBadge: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: COLORS.primary,
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
  bodyWrapper: {
    paddingHorizontal: 16,
  },
  statsBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    marginTop: -24,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 10,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabelText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.slate300,
  },
  tabMenuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    position: 'relative',
  },
  tabItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabItemText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabItemTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  tabActiveUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  serifCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  fieldsList: {
    gap: 8,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  fieldValueBox: {
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    height: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  fieldValueText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  fieldValueBoxMultiline: {
    height: 'auto',
    minHeight: 52,
    paddingVertical: 8,
  },
  fieldValueTextMultiline: {
    fontSize: 11.5,
    fontWeight: '400',
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
});
