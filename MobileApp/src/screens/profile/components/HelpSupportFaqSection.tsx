import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import { Search, ChevronDown, ChevronUp, HelpCircle, X, SlidersHorizontal } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';
import { FAQ_DATA } from './HelpSupportConstants';

interface HelpSupportFaqSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFAQCategory: string;
  setActiveFAQCategory: (cat: string) => void;
}

export const HelpSupportFaqSection: React.FC<HelpSupportFaqSectionProps> = ({
  searchQuery,
  setSearchQuery,
  activeFAQCategory,
  setActiveFAQCategory,
}) => {
  const [expandedFAQIndex, setExpandedFAQIndex] = useState<number | null>(0);

  const categories = ['General', 'Account', 'Job Search', 'Applications', 'Resume', 'Security', 'Technical'];

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      activeFAQCategory === 'General'
        ? true // General shows all / top questions
        : faq.category.toLowerCase() === activeFAQCategory.toLowerCase();

    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  return (
    <View style={styles.container}>
      {/* Category Pills (Matching Reference Image) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
        style={styles.categoriesScrollView}
      >
        {categories.map((cat) => {
          const isSelected = activeFAQCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.75}
              style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              onPress={() => {
                setActiveFAQCategory(cat);
                setExpandedFAQIndex(0);
              }}
            >
              <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Clean Minimal Search Bar (Matching Reference Image) */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color="#64748B" />
          </TouchableOpacity>
        ) : (
          <SlidersHorizontal size={16} color="#94A3B8" />
        )}
      </View>

      {/* FAQ Accordion List (Matching Reference Image) */}
      <View style={styles.faqList}>
        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <HelpCircle size={32} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try searching with different keywords or switch categories.
            </Text>
          </View>
        ) : (
          filteredFAQs.map((faq, idx) => {
            const isExpanded = expandedFAQIndex === idx;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                onPress={() => setExpandedFAQIndex(isExpanded ? null : idx)}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestionText, isExpanded && styles.faqQuestionTextActive]}>
                    {faq.question}
                  </Text>
                  <View style={styles.chevronWrap}>
                    {isExpanded ? (
                      <ChevronUp size={20} color={COLORS.primary} strokeWidth={2.2} />
                    ) : (
                      <ChevronDown size={20} color="#64748B" strokeWidth={2.2} />
                    )}
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  /* Category Pills Carousel */
  categoriesScrollView: {
    marginBottom: 14,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Search Bar */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 10,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },

  /* FAQ List */
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  faqCardExpanded: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  faqQuestionTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  chevronWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqAnswerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  faqAnswerText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '400',
  },

  /* Empty State */
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 10,
  },
  emptyStateSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});

export default HelpSupportFaqSection;
