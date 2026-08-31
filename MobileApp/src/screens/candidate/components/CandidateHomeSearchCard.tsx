import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

export const CandidateHomeSearchCard: React.FC = () => {
  return (
    <View style={styles.heroTextSection}>
      <View style={styles.heroPillBadge}>
        <Star size={12} color={COLORS.primary} />
        <Text style={styles.heroPillBadgeText}>Industrial & Factory Jobs</Text>
      </View>
      <Text style={styles.heroMainTitle}>Discover Factory & Technical Jobs near you</Text>
      <Text style={styles.heroMainSubtitle}>
        Direct hiring for ITI, CNC operators, Welders, Fitters & Helpers in MIDC industrial clusters.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heroTextSection: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 2,
  },
  heroPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
  },
  heroPillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroMainSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
});

