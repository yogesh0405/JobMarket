import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ExtendedCandidate, safeString } from './CandidatesUtils';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { RADIUS } from '../../../constants/theme';

interface CandidateCardItemProps {
  item: ExtendedCandidate;
  onSelectCandidate: (candidate: ExtendedCandidate) => void;
}

export const CandidateCardItem: React.FC<CandidateCardItemProps> = ({ item, onSelectCandidate }) => {
  const photoUrl =
    item.avatarUrl ||
    item.profile_picture_url ||
    (item as any).profilePictureUrl ||
    (item as any).avatar_url ||
    (item as any).avatar ||
    (item as any).photo;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelectCandidate(item)}
      style={styles.candidateGridCard}
    >
      {/* Centered Profile Avatar */}
      <View style={styles.avatarCenterBox}>
        <CompanyLogoAvatar
          logoUrl={photoUrl}
          companyName={item.name}
          size={48}
          borderRadius={24}
        />
      </View>

      {/* Uniform Info Block */}
      <View style={styles.candidateCenterInfoBox}>
        <Text style={styles.gridCandidateName} numberOfLines={1}>
          {safeString(item.name, 'Candidate Name')}
        </Text>
        <Text style={styles.gridCandidateTitle} numberOfLines={1}>
          {safeString(item.trade_specialization || item.title, 'Technician')}
        </Text>
        <Text style={styles.gridCandidateCompany} numberOfLines={1}>
          {safeString(item.location || item.education, 'MIDC Zone')}
        </Text>
      </View>

      {/* Uniform Skills Row */}
      <View style={styles.gridSkillsRow}>
        {item.skills && item.skills.length > 0 ? (
          <>
            <View style={styles.gridSkillTag}>
              <Text style={styles.gridSkillTagText} numberOfLines={1}>
                {safeString(item.skills[0])}
              </Text>
            </View>
            {item.skills.length > 1 ? (
              <View style={styles.gridSkillTagPlus}>
                <Text style={styles.gridSkillTagPlusText}>+{item.skills.length - 1}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.gridSkillTag}>
            <Text style={styles.gridSkillTagText} numberOfLines={1}>
              Industrial Trade
            </Text>
          </View>
        )}
      </View>

      {/* Primary CTA Contact Button Pinned at Bottom */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSelectCandidate(item)}
        style={styles.gridContactButton}
      >
        <Text style={styles.gridContactButtonText}>View Profile</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  candidateGridCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  candidateCenterInfoBox: {
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
    marginBottom: 2,
  },
  gridCandidateName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#102A5C',
    textAlign: 'center',
    width: '100%',
  },
  gridCandidateTitle: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#1764E8',
    marginTop: 1,
    textAlign: 'center',
    width: '100%',
  },
  gridCandidateCompany: {
    fontSize: 10,
    color: '#657796',
    marginTop: 1,
    textAlign: 'center',
    width: '100%',
  },
  gridSkillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 20,
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
  },
  gridSkillTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '75%',
  },
  gridSkillTagText: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#475569',
  },
  gridSkillTagPlus: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridSkillTagPlusText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1764E8',
  },
  gridContactButton: {
    width: '100%',
    height: 28,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  gridContactButtonText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1764E8',
  },
});
