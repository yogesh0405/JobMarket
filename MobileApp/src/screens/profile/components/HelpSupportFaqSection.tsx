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

  /* Categories Scroll */
  categoriesScrollView: {
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryPillTextActive: {
    color: COLORS.textWhite,
    fontWeight: '700',
  },

  /* Search Bar */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 9 : 5,
    gap: 8,
    marginBottom: 14,
    shadowColor: COLORS.textPrimary,
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    fontWeight: '500',
    paddingVertical: 0,
  },

  /* FAQ List */
  faqList: {
    gap: 8,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    shadowColor: COLORS.textPrimary,
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  faqCardExpanded: {
    borderColor: '#BFDBFE',
    backgroundColor: COLORS.softWarmBg,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  faqQuestionTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  chevronWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqAnswerContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqAnswerText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16.5,
    fontWeight: '400',
  },

  /* Empty State */
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  emptyStateSubtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});

export default HelpSupportFaqSection;
