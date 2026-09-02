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
        <View style={styles.iconSquare}>
          <Building2 size={16} color="#1764E8" strokeWidth={2.2} />
        </View>
        <Text style={styles.cardTitle}>About {name}</Text>
      </View>

      <Text style={styles.descriptionText}>
        {hasDesc
          ? description.trim()
          : 'No overview description provided yet. Edit profile to add manufacturing operations, plant capacity, and career growth details.'}
      </Text>

      {hasSpecs ? (
        <View style={styles.specsWrap}>
          {specializations.map((spec, idx) => (
            <View key={idx} style={styles.specChip}>
              <Text style={styles.specChipText}>{spec}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBF2',
    borderRadius: RADIUS.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#102A5C',
  },
  descriptionText: {
    fontSize: 13,
    color: '#66789B',
    lineHeight: 20,
  },
  specsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  specChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  specChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
});
