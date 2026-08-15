import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react-native';
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
      <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
      <Text style={styles.sectionSub}>Find quick answers to common platform questions</Text>

      {/* FAQ Search Bar */}
      <View style={styles.faqSearchBox}>
        <Search size={16} color={COLORS.slate400} />
        <TextInput
          style={styles.faqSearchInput}
          placeholder="Search questions or keywords..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesRow}>
        {categories.map((cat) => {
          const isSelected = activeFAQCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              onPress={() => setActiveFAQCategory(cat)}
            >
              <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* FAQ Accordion List */}
      <View style={styles.faqList}>
        {filteredFAQs.map((faq, idx) => {
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
                <Text style={[styles.faqQuestionText, isExpanded && styles.faqQuestionTextActive]}>{faq.question}</Text>
                {isExpanded ? <ChevronUp size={16} color={COLORS.primary} /> : <ChevronDown size={16} color="#94A3B8" />}
              </View>
              {isExpanded ? (
                <View style={styles.faqAnswerBox}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 12,
  },
  faqSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
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
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
