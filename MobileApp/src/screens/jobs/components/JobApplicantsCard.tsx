import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { User as UserIcon, Briefcase, MapPin, ChevronRight } from 'lucide-react-native';
import { JobApplication } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import { RADIUS } from '../../../constants/theme';
import { safeValue } from './JobApplicantsUtils';

interface JobApplicantsCardProps {
  item: JobApplication;
  onPress: (applicant: JobApplication) => void;
}

export const JobApplicantsCard: React.FC<JobApplicantsCardProps> = ({ item, onPress }) => {
  const candidateName = safeValue(item.user?.name) || 'Applicant';
  const candidateTrade = safeValue(item.user?.headline || item.user?.trade_specialization);
  const candidateExp = safeValue(item.user?.experience);
  const candidateLocation = safeValue(item.user?.location || (item.user as any)?.midc_zone || (item.user as any)?.midcZone);

  const avatarUri =
    item.user?.profilePictureUrl ||
    item.user?.profile_picture_url ||
    (item.user as any)?.profilePhotoUrl ||
    (item.user as any)?.avatar;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item)}
      style={styles.candidateCard}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.avatarBox}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <UserIcon size={18} color="#1764E8" strokeWidth={2} />
          )}
        </View>

        <View style={styles.headerTextCol}>
          <View style={styles.titleBadgeRow}>
            <Text style={styles.candidateName} numberOfLines={1}>
              {candidateName}
            </Text>
            <Badge status={item.status} />
          </View>

          {candidateTrade ? (
            <Text style={styles.candidateTrade} numberOfLines={1}>
              {candidateTrade}
            </Text>
          ) : null}
        </View>

        <ChevronRight size={14} color="#91A0BA" style={{ marginLeft: 4 }} />
      </View>

      {/* Meta Chips Row */}
      <View style={styles.metaChipsRow}>
        {candidateExp ? (
          <View style={styles.metaChip}>
            <Briefcase size={11} color="#657796" style={{ flexShrink: 0 }} />
            <Text style={styles.metaChipText} numberOfLines={1} ellipsizeMode="tail">
              {candidateExp}
            </Text>
          </View>
        ) : null}

        {candidateLocation ? (
          <View style={styles.metaChip}>
            <MapPin size={11} color="#657796" style={{ flexShrink: 0 }} />
            <Text style={styles.metaChipText} numberOfLines={1} ellipsizeMode="tail">
              {candidateLocation}
            </Text>
          </View>
        ) : null}

        {(item.user as any)?.preferred_shift || (item.user as any)?.preferredShift ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText} numberOfLines={1} ellipsizeMode="tail">
              {(item.user as any)?.preferred_shift || (item.user as any)?.preferredShift}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTextCol: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    width: '100%',
  },
  candidateName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#102A5C',
    letterSpacing: -0.2,
    flex: 1,
    flexShrink: 1,
  },
  candidateTrade: {
    fontSize: 11,
    fontWeight: '500',
    color: '#657796',
    marginTop: 1.5,
    width: '100%',
  },
  metaChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    width: '100%',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    maxWidth: '100%',
    flexShrink: 1,
  },
  metaChipText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#657796',
    flexShrink: 1,
  },
});
