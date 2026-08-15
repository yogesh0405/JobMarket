import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { User as UserIcon, Briefcase, ChevronRight } from 'lucide-react-native';
import { JobApplication } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import { COLORS } from '../../../constants/theme';
import { safeValue } from './JobApplicantsUtils';

interface JobApplicantsCardProps {
  item: JobApplication;
  onPress: (applicant: JobApplication) => void;
}

export const JobApplicantsCard: React.FC<JobApplicantsCardProps> = ({ item, onPress }) => {
  const candidateName = safeValue(item.user?.name);
  const candidateTrade = safeValue(item.user?.headline || item.user?.trade_specialization);
  const candidateExp = safeValue(item.user?.experience);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      style={styles.candidateCard}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.avatarBox}>
          {item.user?.profilePictureUrl || item.user?.profile_picture_url ? (
            <Image
              source={{ uri: item.user?.profilePictureUrl || item.user?.profile_picture_url }}
              style={styles.avatarImg}
            />
          ) : (
            <UserIcon size={20} color={COLORS.primary} />
          )}
        </View>

        <View style={styles.headerTextCol}>
          <View style={styles.titleBadgeRow}>
            <Text style={styles.candidateName} numberOfLines={1}>
              {candidateName}
            </Text>
            <Badge status={item.status} />
          </View>

          <Text style={styles.candidateTrade} numberOfLines={1}>
            {candidateTrade}
          </Text>

          <View style={styles.metaPillRow}>
            <View style={styles.inlineIconTextItem}>
              <Briefcase size={12} color={COLORS.primary} />
              <Text style={styles.candidateMetaTextInline} numberOfLines={1}>
                {candidateExp}
              </Text>
            </View>
          </View>
        </View>

        <ChevronRight size={18} color={COLORS.slate400} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  candidateName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  candidateTrade: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#475569',
    marginTop: 1,
  },
  metaPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  inlineIconTextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  candidateMetaTextInline: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
});
