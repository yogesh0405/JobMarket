import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { Camera, Edit } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';
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
}) => {
  const tradeDisplay = (isOtherSelected || tradeSpecialization === 'Other') ? (customTrade || '—') : (tradeSpecialization || '—');

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
  const skillsCount = (skills && skills.length > 0) ? skills.length : (user?.skills?.length || 0);

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
      {/* HEADER PROFILE CARD (MATCHING USER REFERENCE) */}
      <View style={styles.whiteHeroHeaderCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.heroEditIconCircleBtn}
          onPress={onEditPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Edit size={14} color={COLORS.textSecondary} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.heroRow}>
          <TouchableOpacity activeOpacity={0.88} onPress={onPickPhoto} style={styles.heroAvatarWrapper}>
            <View style={styles.heroAvatarFallback}>
              <Text style={styles.heroAvatarText}>
                {initials}
              </Text>
            </View>
            {profilePhotoUrl && typeof profilePhotoUrl === 'string' && profilePhotoUrl.trim().length > 5 ? (
              <Image
                source={{ uri: profilePhotoUrl.trim() }}
                style={[styles.heroAvatarImage, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
              />
            ) : null}
            <View style={styles.heroCameraBadge}>
              <Camera size={11} color={COLORS.primary} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          <View style={styles.heroInfoCol}>
            <Text style={styles.heroNameText} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.heroEmailText} numberOfLines={1}>
              {user?.email || '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* QUICK STATS ROW */}
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

      {/* PERSONAL DETAILS CARD (MATCHING REFERENCE UI) */}
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
                {bio || 'No professional bio summary added yet. Tap Edit Profile to add a summary.'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  whiteHeroHeaderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroEditIconCircleBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'relative',
  },
  heroAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  heroAvatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3D4A3E',
  },
  heroAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textWhite,
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
    borderColor: COLORS.surface,
  },
  heroInfoCol: {
    flex: 1,
    paddingRight: 32,
  },
  heroNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.2,
  },
  heroEmailText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    marginTop: 2,
    marginBottom: 12,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: COLORS.slate300,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  serifCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  fieldsList: {
    gap: 9,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  fieldValueBox: {
    backgroundColor: COLORS.softWarmBg,
    borderWidth: 1,
    borderColor: COLORS.softWarmBorder,
    borderRadius: 12,
    height: 40,
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
    paddingVertical: 9,
  },
  fieldValueTextMultiline: {
    fontSize: 11.5,
    fontWeight: '400',
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
});
