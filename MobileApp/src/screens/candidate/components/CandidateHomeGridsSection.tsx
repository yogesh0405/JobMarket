import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  ITI_TRADES_GRID,
  EDUCATION_GRID,
  HOSPITAL_GRID,
  HOTEL_GRID,
  SCHOOL_GRID,
} from './CandidateHomeConstants';
import { COLORS, RADIUS } from '../../../constants/theme';

interface CandidateHomeGridsSectionProps {
  getRealJobCount: (keyword: string) => number;
  onQuickTradeSearch: (tradeName: string, filterType?: 'trade' | 'education') => void;
}

export const CandidateHomeGridsSection: React.FC<CandidateHomeGridsSectionProps> = ({
  getRealJobCount,
  onQuickTradeSearch,
}) => {
  return (
    <>
      {/* Browse by ITI Trade */}
      <View style={styles.standaloneSection}>
        <View style={styles.popularTradesBadge}>
          <Text style={styles.popularTradesBadgeText}>POPULAR TRADES</Text>
        </View>

        <Text style={styles.sectionTitleBig}>Browse by ITI Trade / Specialty</Text>
        <Text style={styles.sectionSubTextCentered}>
          Direct vacancies in production, quality, maintenance & logistics
        </Text>

        <View style={styles.threeColumnGrid}>
          {ITI_TRADES_GRID.map((trade, idx) => {
            const IconComp = trade.icon;
            const realCount = getRealJobCount(trade.name);
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                style={styles.tradeSquareCard}
                onPress={() => onQuickTradeSearch(trade.name)}
              >
                <View style={styles.tradeIconSquare}>
                  <IconComp size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.tradeCardTitle} numberOfLines={1}>{trade.name}</Text>
                <Text style={styles.tradeCardCount}>{realCount} {realCount === 1 ? 'open position' : 'open positions'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Browse Jobs by Qualification */}
      <View style={styles.standaloneSection}>
        <View style={styles.educationBadge}>
          <Text style={styles.educationBadgeText}>EDUCATION</Text>
        </View>

        <Text style={styles.sectionTitleBig}>Browse Jobs by Qualification</Text>
        <Text style={styles.sectionSubTextCentered}>
          Find jobs matching your school education or college degree
        </Text>

        <View style={styles.threeColumnGrid}>
          {EDUCATION_GRID.map((qual, idx) => {
            const IconComp = qual.icon;
            const realCount = getRealJobCount(qual.name);
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                style={styles.qualSquareCard}
                onPress={() => onQuickTradeSearch(qual.name, 'education')}
              >
                <View style={styles.qualIconSquare}>
                  <IconComp size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.qualCardTitle} numberOfLines={1}>{qual.name}</Text>
                <Text style={styles.qualCardCount}>{realCount} {realCount === 1 ? 'Job Opening' : 'Job Openings'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Hospital Jobs */}
      <View style={styles.standaloneSection}>
        <View style={styles.hospitalBadge}>
          <Text style={styles.hospitalBadgeText}>HOSPITAL</Text>
        </View>

        <Text style={styles.sectionTitleBig}>Hospital & Healthcare Jobs</Text>
        <Text style={styles.sectionSubTextCentered}>
          Browse medical, nursing, administration and support staff jobs
        </Text>

        <View style={styles.threeColumnGrid}>
          {HOSPITAL_GRID.map((item, idx) => {
            const IconComp = item.icon;
            const realCount = getRealJobCount(item.name);
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                style={styles.qualSquareCard}
                onPress={() => onQuickTradeSearch(item.name)}
              >
                <View style={styles.qualIconSquare}>
                  <IconComp size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.qualCardCount}>{realCount} {realCount === 1 ? 'Job Opening' : 'Job Openings'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Hotel Jobs */}
      <View style={styles.standaloneSection}>
        <View style={styles.hotelBadge}>
          <Text style={styles.hotelBadgeText}>HOTEL</Text>
        </View>

        <Text style={styles.sectionTitleBig}>Hotel, Restaurant & Catering Jobs</Text>
        <Text style={styles.sectionSubTextCentered}>
          Find jobs in top hotels, cafes, pantries, and food companies
        </Text>

        <View style={styles.threeColumnGrid}>
          {HOTEL_GRID.map((item, idx) => {
            const IconComp = item.icon;
            const realCount = getRealJobCount(item.name);
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                style={styles.qualSquareCard}
                onPress={() => onQuickTradeSearch(item.name)}
              >
                <View style={styles.qualIconSquare}>
                  <IconComp size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.qualCardCount}>{realCount} {realCount === 1 ? 'Job Opening' : 'Job Openings'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* School Jobs */}
      <View style={styles.standaloneSection}>
        <View style={styles.schoolBadge}>
          <Text style={styles.schoolBadgeText}>SCHOOL & COLLEGE</Text>
        </View>

        <Text style={styles.sectionTitleBig}>School, College & Education Jobs</Text>
        <Text style={styles.sectionSubTextCentered}>
          Browse teaching, clerical, administrative and security roles in academic institutes
        </Text>

        <View style={styles.threeColumnGrid}>
          {SCHOOL_GRID.map((item, idx) => {
            const IconComp = item.icon;
            const realCount = getRealJobCount(item.name);
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                style={styles.qualSquareCard}
                onPress={() => onQuickTradeSearch(item.name)}
              >
                <View style={styles.qualIconSquare}>
                  <IconComp size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.qualCardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.qualCardCount}>{realCount} {realCount === 1 ? 'Job Opening' : 'Job Openings'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  standaloneSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    marginBottom: 10,
  },
  popularTradesBadge: {
    alignSelf: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  popularTradesBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  educationBadge: {
    alignSelf: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  educationBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  hospitalBadge: {
    alignSelf: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  hospitalBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  hotelBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  hotelBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D97706',
  },
  schoolBadge: {
    alignSelf: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  schoolBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  sectionTitleBig: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  sectionSubTextCentered: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  threeColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tradeSquareCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    alignItems: 'center',
  },
  tradeIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tradeCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  tradeCardCount: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
  },
  qualSquareCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    alignItems: 'center',
  },
  qualIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  qualCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  qualCardCount: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
  },
});
