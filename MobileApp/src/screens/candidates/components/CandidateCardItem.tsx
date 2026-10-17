import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Briefcase, Wrench, ShieldCheck, Clock } from 'lucide-react-native';
import { ExtendedCandidate, safeString } from './CandidatesUtils';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { COLORS, RADIUS } from '../../../constants/theme';

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

  const days = Number(item.availableInDays ?? item.available_in_days ?? 0);
  const isImmediate = days === 0;
  const availabilityText = isImmediate ? 'Immediate Joiner' : `Available in ${days}d`;

  const expYears = item.experience_years ?? (typeof item.experience === 'number' ? item.experience : undefined);
  const expText =
    expYears !== undefined
      ? expYears === 0
        ? 'Fresher'
        : `${expYears} Yrs Exp`
      : typeof item.experience === 'string' && item.experience.trim()
      ? item.experience.trim()
      : 'Fresher';

  const primarySkill =
    item.skills && item.skills.length > 0
      ? `${safeString(item.skills[0])}${item.skills.length > 1 ? ` (+${item.skills.length - 1})` : ''}`
      : safeString(item.trade_specialization, 'Industrial Trade');

  const locationText = safeString(item.location, 'MIDC Zone');
  const isVerified = Boolean(item.verified || item.aadhaar_verified);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onSelectCandidate(item)}
      style={styles.workCandidateCard}
    >
      {/* Top Header Row - Clean Icon + Text (No Chip Containers, No Verified Text) */}
      <View style={styles.cardTopBadgeRow}>
        <View style={styles.availabilityRow}>
          <Clock size={10} color={isImmediate ? '#059669' : '#1764E8'} strokeWidth={2.2} />
          <Text
            style={[styles.availabilityText, isImmediate ? styles.immediateText : styles.standardText]}
            numberOfLines={1}
          >
            {availabilityText}
          </Text>
        </View>

        {isVerified ? (
          <ShieldCheck size={13} color="#059669" strokeWidth={2.4} />
        ) : null}
      </View>

      {/* Centered Profile Avatar & Identity */}
      <View style={styles.cardProfileSection}>
        <View style={styles.avatarWrapper}>
          <CompanyLogoAvatar
            logoUrl={photoUrl}
            companyName={item.name}
            size={48}
            borderRadius={24}
          />
        </View>

        <Text style={styles.candidateNameText} numberOfLines={1}>
          {safeString(item.name, 'Candidate Name')}
        </Text>
        <Text style={styles.candidateTradeText} numberOfLines={1}>
          {safeString(item.trade_specialization || item.title, 'Industrial Technician')}
        </Text>
      </View>

      {/* Middle Specs Section (Work-Job Theme Specs Band) */}
      <View style={styles.cardSpecsSection}>
        <View style={styles.specItemRow}>
          <Briefcase size={11.5} color="#64748B" strokeWidth={2} style={styles.specIcon} />
          <Text style={styles.specItemText} numberOfLines={1}>
            {expText}
          </Text>
        </View>

        <View style={styles.specItemRow}>
          <MapPin size={11.5} color="#64748B" strokeWidth={2} style={styles.specIcon} />
          <Text style={styles.specItemText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>

        <View style={styles.specItemRow}>
          <Wrench size={11.5} color="#64748B" strokeWidth={2} style={styles.specIcon} />
          <Text style={styles.specItemText} numberOfLines={1}>
            {primarySkill}
          </Text>
        </View>
      </View>

      {/* Bottom Action Footer */}
      <View style={styles.cardBottomSection}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectCandidate(item)}
          style={styles.viewProfileBtn}
        >
          <Text style={styles.viewProfileBtnText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  workCandidateCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardTopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 22,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '85%',
  },
  availabilityText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  immediateText: {
    color: '#059669',
  },
  standardText: {
    color: '#0A58E2',
  },
  cardProfileSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 8,
  },
  avatarWrapper: {
    marginVertical: 4,
  },
  candidateNameText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    width: '100%',
    letterSpacing: -0.1,
  },
  candidateTradeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0A58E2',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  cardSpecsSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
  },
  specItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: '100%',
  },
  specIcon: {
    flexShrink: 0,
  },
  specItemText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  cardBottomSection: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  viewProfileBtn: {
    width: '100%',
    height: 31,
    backgroundColor: '#0A58E2',
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.15,
  },
});
