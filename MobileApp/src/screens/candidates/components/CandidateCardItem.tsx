import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ExtendedCandidate, safeString } from './CandidatesUtils';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { COLORS } from '../../../constants/theme';

interface CandidateCardItemProps {
  item: ExtendedCandidate;
  onSelectCandidate: (candidate: ExtendedCandidate) => void;
}

export const CandidateCardItem: React.FC<CandidateCardItemProps> = ({ item, onSelectCandidate }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelectCandidate(item)}
      style={styles.candidateGridCard}
    >
      {/* Centered Profile Avatar */}
      <View style={styles.avatarCenterBox}>
        <CompanyLogoAvatar
          logoUrl={item.avatarUrl || item.profile_picture_url}
          companyName={item.name}
          size={58}
          borderRadius={29}
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
        activeOpacity={0.8}
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
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    alignItems: 'center',
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
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    width: '100%',
  },
  gridCandidateTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
    textAlign: 'center',
    width: '100%',
  },
  gridCandidateCompany: {
    fontSize: 10.5,
    color: '#64748B',
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '75%',
  },
  gridSkillTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  gridSkillTagPlus: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridSkillTagPlusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  gridContactButton: {
    width: '100%',
    height: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  gridContactButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
