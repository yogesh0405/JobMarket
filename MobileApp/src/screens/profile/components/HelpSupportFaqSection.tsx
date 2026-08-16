import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Search, ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react-native';
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

  const categories = ['All', 'Job Search', 'Saved Jobs', 'Applications', 'Resume & Profile', 'Account', 'Technical'];

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeFAQCategory === 'All' || faq.category === activeFAQCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>KNOWLEDGEBASE & FAQS</Text>
          <Text style={styles.sectionSub}>Find verified answers to common platform queries</Text>
        </View>
        <View style={styles.countBadgePill}>
          <Text style={styles.countBadgeText}>{filteredFAQs.length} FAQs</Text>
        </View>
      </View>

      {/* FAQ Search Bar */}
      <View style={styles.faqSearchBox}>
        <Search size={16} color="#64748B" />
        <TextInput
          style={styles.faqSearchInput}
          placeholder="Search topics, keywords, or features..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
        {categories.map((cat) => {
          const isSelected = activeFAQCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              onPress={() => {
                setActiveFAQCategory(cat);
                setExpandedFAQIndex(0);
              }}
            >
              <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FAQ Accordion List */}
      <View style={styles.faqList}>
        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyFaqState}>
            <HelpCircle size={28} color="#94A3B8" />
            <Text style={styles.emptyFaqText}>No matching questions found</Text>
            <Text style={styles.emptyFaqSub}>Try adjusting your search query or switching categories.</Text>
          </View>
        ) : (
          filteredFAQs.map((faq, idx) => {
            const isExpanded = expandedFAQIndex === idx;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.9}
                style={[styles.faqAccordionCard, isExpanded && styles.faqAccordionCardActive]}
                onPress={() => setExpandedFAQIndex(isExpanded ? null : idx)}
              >
                <View style={styles.faqHeaderRow}>
                  <HelpCircle size={16} color={isExpanded ? COLORS.primary : '#64748B'} style={{ marginTop: 2 }} />
                  <Text style={[styles.faqQuestionText, isExpanded && styles.faqQuestionTextActive]}>
                    {faq.question}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={16} color={COLORS.primary} />
                  ) : (
                    <ChevronDown size={16} color="#94A3B8" />
                  )}
                </View>
                {isExpanded ? (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  countBadgePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  faqSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 10,
  },
  faqSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 4,
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  faqList: {
    gap: 8,
  },
  emptyFaqState: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  emptyFaqText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  emptyFaqSub: {
    fontSize: 11.5,
    color: '#64748B',
  },
  faqAccordionCard: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  faqAccordionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  faqQuestionTextActive: {
    color: COLORS.primary,
  },
  faqAnswerBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  faqAnswerText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
});
