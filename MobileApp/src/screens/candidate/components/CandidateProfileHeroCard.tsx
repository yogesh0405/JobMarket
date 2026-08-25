import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Camera, Edit, Mail, Phone, MapPin, Briefcase, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react-native';
import { COLORS, RADIUS } from '../../../constants/theme';
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

  return (
    <>
      {/* PRIMARY BLUE HERO CARD */}
      <View style={styles.primaryBlueHeroCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.heroEditIconCircleBtn}
          onPress={onEditPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Edit size={14} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.blueHeroRow}>
          <TouchableOpacity activeOpacity={0.88} onPress={onPickPhoto} style={styles.heroAvatarWrapper}>
            <View style={styles.heroAvatarFallback}>
              <Text style={styles.heroAvatarText}>
                {(name || user?.name || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
            {profilePhotoUrl && typeof profilePhotoUrl === 'string' && profilePhotoUrl.trim().length > 5 ? (
              <Image
                source={{ uri: profilePhotoUrl.trim() }}
                style={[styles.heroAvatarImage, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
              />
            ) : null}
            <View style={styles.heroCameraBadge}>
              <Camera size={10} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.blueHeroInfoCol}>
            <View style={styles.nameHeaderRow}>
              <Text style={styles.heroNameText} numberOfLines={1}>
                {name || user?.name || 'Candidate Profile'}
              </Text>
              <CheckCircle2 size={16} color="#60A5FA" />
            </View>

            <View style={styles.heroEmailRow}>
              <Mail size={13} color="#E0F2FE" />
              <Text style={styles.heroEmailText} numberOfLines={1}>
                {user?.email || '—'}
              </Text>
            </View>
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

      {/* ABOUT SUMMARY CARD */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <Text style={styles.sectionCardTitle}>Professional Summary</Text>
        </View>
        <View style={styles.aboutQuoteBox}>
          {bio ? (
            <Text style={styles.aboutText}>{bio}</Text>
          ) : (
            <Text style={styles.emptySubText}>No professional bio summary added yet. Tap Edit Profile to add a summary.</Text>
          )}
        </View>
      </View>

      {/* CONTACT & PERSONAL DETAILS CARD */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <Text style={styles.sectionCardTitle}>Contact & Work Details</Text>
        </View>

        <View style={styles.contactGrid2x2}>
          {headline ? (
            <View style={styles.contactGridCell}>
              <View style={styles.contactIconPill}>
                <UserCheck size={14} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactGridLabel}>Professional Headline</Text>
                <Text style={styles.contactGridValue} numberOfLines={1}>{headline}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.contactGridCell}>
            <View style={styles.contactIconPill}>
              <Mail size={14} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactGridLabel}>Email Address</Text>
              <Text style={styles.contactGridValue} numberOfLines={1}>{user?.email || '—'}</Text>
            </View>
          </View>

          <View style={styles.contactGridCell}>
            <View style={styles.contactIconPill}>
              <Phone size={14} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactGridLabel}>Mobile Phone</Text>
              <Text style={styles.contactGridValue} numberOfLines={1}>{phone || '—'}</Text>
            </View>
          </View>

          <View style={styles.contactGridCell}>
            <View style={styles.contactIconPill}>
              <MapPin size={14} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactGridLabel}>Current City / Location</Text>
              <Text style={styles.contactGridValue} numberOfLines={1}>{location || '—'}</Text>
            </View>
          </View>

          <View style={[styles.contactGridCell, styles.contactGridCellLast]}>
            <View style={styles.contactIconPill}>
              <Briefcase size={14} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactGridLabel}>Primary Trade Specialization</Text>
              <Text style={styles.contactGridValue} numberOfLines={1}>
                {tradeDisplay}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  primaryBlueHeroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#B4C3D4',
    padding: 16,
    marginBottom: 10,
    position: 'relative',
  },
  heroEditIconCircleBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroAvatarWrapper: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  heroAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  heroAvatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  heroAvatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  blueHeroInfoCol: {
    flex: 1,
    gap: 4,
    paddingRight: 24,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroEmailText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E0F2FE',
  },
  statsBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 10,
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
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#CBD5E1',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#B4C3D4',
    padding: 16,
    marginBottom: 10,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  aboutQuoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 10,
  },
  aboutText: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#334155',
    lineHeight: 19,
  },
  emptySubText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 10,
  },
  contactGrid2x2: {
    gap: 0,
  },
  contactGridCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactGridCellLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  contactIconPill: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  contactGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
});
