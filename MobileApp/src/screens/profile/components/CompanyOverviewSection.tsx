import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Building2 } from 'lucide-react-native';
import { RADIUS } from '../../../constants/theme';

interface CompanyOverviewSectionProps {
  description?: string;
  companyName?: string;
  specializations?: string[];
}

export const CompanyOverviewSection: React.FC<CompanyOverviewSectionProps> = ({
  description,
  companyName,
  specializations,
}) => {
  const name = companyName || 'Company';
  const hasDesc = description && description.trim().length > 0;
  const hasSpecs = Array.isArray(specializations) && specializations.length > 0;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.titleRow}>
        <Building2 size={18} color="#2563EB" />
        <Text style={styles.cardTitle}>About {name}</Text>
      </View>

      {/* Slate 400 Divider */}
      <View style={styles.divider} />

      <Text style={[styles.descriptionText, !hasDesc && styles.placeholderText]}>
        {hasDesc ? description.trim() : `${name} is a leading industrial organization operating in manufacturing and engineering operations.`}
      </Text>

      {hasSpecs ? (
        <>
          <View style={styles.innerDivider} />
          <Text style={styles.specsTitle}>Key Specializations</Text>
          <View style={styles.specsWrap}>
            {specializations.map((spec, idx) => (
              <View key={idx} style={styles.specChip}>
                <Text style={styles.specChipText}>{spec}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 8,
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
  },
  placeholderText: {
    fontStyle: 'italic',
    color: '#94A3B8',
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  specsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  specsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
  },
  specChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
});
