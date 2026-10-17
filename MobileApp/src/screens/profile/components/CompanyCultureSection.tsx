import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Heart,
  ShieldCheck,
  Coffee,
  Truck,
  Award,
  GraduationCap,
  Wrench,
} from 'lucide-react-native';
import { RADIUS } from '../../../constants/theme';

interface CompanyCultureSectionProps {
  companyName?: string;
}

export const CompanyCultureSection: React.FC<CompanyCultureSectionProps> = ({ companyName }) => {
  const name = companyName || 'Company';

  const perks = [
    {
      icon: ShieldCheck,
      iconColor: '#1B4FDF',
      iconBg: '#EFF6FF',
      title: 'PF & ESIC Medical Coverage',
      desc: '100% statutory Provident Fund and comprehensive ESIC medical healthcare for employees and family.',
    },
    {
      icon: Coffee,
      iconColor: '#059669',
      iconBg: '#ECFDF5',
      title: 'Subsidized Canteen & Meals',
      desc: 'Nutritious hot lunch, breakfast, and tea served daily in certified hygienic plant facilities.',
    },
    {
      icon: Truck,
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
      title: 'Company Bus & Transport',
      desc: 'Free shuttle routes covering key MIDC junctions, connecting cities, and residential routes.',
    },
    {
      icon: Award,
      iconColor: '#7C3AED',
      iconBg: '#F5F3FF',
      title: 'Attendance & Shift Bonus',
      desc: 'Production incentives, 100% attendance awards, and statutory overtime allowances.',
    },
    {
      icon: GraduationCap,
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
      title: 'Apprenticeship & Skill Training',
      desc: 'Hands-on tooling certification, advanced machine simulation, and promotion tracks.',
    },
    {
      icon: Wrench,
      iconColor: '#DC2626',
      iconBg: '#FEF2F2',
      title: 'Safety & PPE Equipment',
      desc: 'Full safety gear, helmets, gloves, shoes, and regular certified industrial safety training.',
    },
  ];

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.iconSquare}>
          <Heart size={16} color="#E11D48" strokeWidth={2.2} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.cardTitle}>Why Join {name}</Text>
          <Text style={styles.cardSubtitle}>
            Perks, social security, skill advancement and safety values
          </Text>
        </View>
      </View>

      <View style={styles.perksList}>
        {perks.map((perk, idx) => {
          const IconComp = perk.icon;
          return (
            <View key={idx} style={styles.perkCard}>
              <View style={[styles.perkIconBox, { backgroundColor: perk.iconBg }]}>
                <IconComp size={18} color={perk.iconColor} strokeWidth={2.2} />
              </View>
              <View style={styles.perkInfo}>
                <Text style={styles.perkTitle}>{perk.title}</Text>
                <Text style={styles.perkDesc}>{perk.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
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
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  iconSquare: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A5C',
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  perksList: {
    gap: 10,
  },
  perkCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  perkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  perkInfo: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  perkDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
});
