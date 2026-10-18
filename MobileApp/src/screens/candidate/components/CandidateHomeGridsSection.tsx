import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import {
  ITI_TRADES_GRID,
  EDUCATION_GRID,
  HOSPITAL_GRID,
  HOTEL_GRID,
  SCHOOL_GRID,
  HOSPITAL_HORIZONTAL_DATA,
  ITI_HORIZONTAL_DATA,
  EDUCATION_HORIZONTAL_DATA,
} from './CandidateHomeConstants';
import { COLORS, RADIUS } from '../../../constants/theme';

const TRADE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-158109226825-a6a2a5aee158?w=600&q=80';
const HEALTHCARE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80';
const EDUCATION_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80';

const SafeCardImage: React.FC<{ uri: string; fallbackUri: string }> = ({ uri, fallbackUri }) => {
  const [currentUri, setCurrentUri] = useState(uri);
  return (
    <Image
      source={{ uri: currentUri }}
      onError={() => setCurrentUri(fallbackUri)}
      style={styles.cardImageCover}
      resizeMode="cover"
    />
  );
};

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

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleHeader}>Browse by ITI Trade / Specialty</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onQuickTradeSearch('')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionSubTextLeft}>
          Direct vacancies in production, quality, maintenance & logistics
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalFilterScroll}
        >
          {ITI_HORIZONTAL_DATA.map((item) => {
            const realCount = getRealJobCount(item.keyword || item.name);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={styles.horizontalCard}
                onPress={() => onQuickTradeSearch(item.name, 'trade')}
              >
                <SafeCardImage uri={item.image} fallbackUri={TRADE_FALLBACK_IMAGE} />
                <View style={styles.horizontalCardBody}>
                  <Text style={styles.horizontalCardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.horizontalJobCountText}>
                    {realCount > 0 ? `${realCount} ${realCount === 1 ? 'Job Opening' : 'Job Openings'}` : 'Direct Openings'}
                  </Text>
                  <View style={styles.horizontalPriceRow}>
                    <Text style={styles.horizontalPriceFrom}>From </Text>
                    <Text style={styles.horizontalPriceValue}>{item.startingSalary}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Browse Jobs by Qualification */}
      <View style={styles.standaloneSection}>
        <View style={styles.educationBadge}>
          <Text style={styles.educationBadgeText}>EDUCATION</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleHeader}>Browse Jobs by Qualification</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onQuickTradeSearch('', 'education')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionSubTextLeft}>
          Find jobs matching your school education or college degree
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalFilterScroll}
        >
          {EDUCATION_HORIZONTAL_DATA.map((item) => {
            const realCount = getRealJobCount(item.keyword || item.name);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={styles.horizontalCard}
                onPress={() => onQuickTradeSearch(item.name, 'education')}
              >
                <SafeCardImage uri={item.image} fallbackUri={EDUCATION_FALLBACK_IMAGE} />
                <View style={styles.horizontalCardBody}>
                  <Text style={styles.horizontalCardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.horizontalJobCountText}>
                    {realCount > 0 ? `${realCount} ${realCount === 1 ? 'Job Opening' : 'Job Openings'}` : 'Direct Openings'}
                  </Text>
                  <View style={styles.horizontalPriceRow}>
                    <Text style={styles.horizontalPriceFrom}>From </Text>
                    <Text style={styles.horizontalPriceValue}>{item.startingSalary}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Hospital Jobs */}
      <View style={styles.standaloneSection}>
        <View style={styles.hospitalBadge}>
          <Text style={styles.hospitalBadgeText}>HOSPITAL</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleHeader}>Hospital & Healthcare Jobs</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onQuickTradeSearch('Hospital')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionSubTextLeft}>
          Browse medical, nursing, administration and support staff jobs
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalFilterScroll}
        >
          {HOSPITAL_HORIZONTAL_DATA.map((item) => {
            const realCount = getRealJobCount(item.keyword || item.name);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={styles.horizontalCard}
                onPress={() => onQuickTradeSearch(item.name)}
              >
                <SafeCardImage uri={item.image} fallbackUri={HEALTHCARE_FALLBACK_IMAGE} />
                <View style={styles.horizontalCardBody}>
                  <Text style={styles.horizontalCardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.horizontalJobCountText}>
                    {realCount > 0 ? `${realCount} ${realCount === 1 ? 'Job Opening' : 'Job Openings'}` : 'Direct Openings'}
                  </Text>
                  <View style={styles.horizontalPriceRow}>
                    <Text style={styles.horizontalPriceFrom}>From </Text>
                    <Text style={styles.horizontalPriceValue}>{item.startingSalary}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    marginVertical: 10,
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
    marginBottom: 12,
  },
  threeColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tradeSquareCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  tradeIconSquare: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
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
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  qualIconSquare: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionTitleHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionSubTextLeft: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 12,
  },
  horizontalFilterScroll: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 8,
  },
  horizontalCard: {
    width: 148,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImageCover: {
    width: '100%',
    height: 104,
    backgroundColor: '#F1F5F9',
  },
  horizontalCardBody: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  horizontalCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  horizontalJobCountText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  horizontalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 5,
  },
  horizontalPriceFrom: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
  },
  horizontalPriceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});
