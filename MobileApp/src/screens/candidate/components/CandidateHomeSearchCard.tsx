import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import {
  Briefcase,
  GraduationCap,
  MapPin,
  ChevronDown,
  Search,
  Check,
  X,
  Star,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../../constants/theme';
import { INDUSTRIES, EDUCATIONS, MIDC_ZONES } from './CandidateHomeConstants';

interface CandidateHomeSearchCardProps {
  selectedIndustry: string;
  setSelectedIndustry: (ind: string) => void;
  selectedEducation: string;
  setSelectedEducation: (ed: string) => void;
  locationQuery: string;
  setLocationQuery: (loc: string) => void;
  onSearchSubmit: () => void;
}

export const CandidateHomeSearchCard: React.FC<CandidateHomeSearchCardProps> = ({
  selectedIndustry,
  setSelectedIndustry,
  selectedEducation,
  setSelectedEducation,
  locationQuery,
  setLocationQuery,
  onSearchSubmit,
}) => {
  const [industryModalOpen, setIndustryModalOpen] = React.useState(false);
  const [educationModalOpen, setEducationModalOpen] = React.useState(false);
  const [showMidcSuggestions, setShowMidcSuggestions] = React.useState(false);
  const [isLocationFocused, setIsLocationFocused] = React.useState(false);

  const matchingMidcZones = React.useMemo(() => {
    const query = locationQuery.trim().toLowerCase();
    if (!query) return MIDC_ZONES.slice(0, 4);
    return MIDC_ZONES.filter((zone) => zone.toLowerCase().includes(query)).slice(0, 5);
  }, [locationQuery]);

  return (
    <>
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

      <View style={styles.heroSearchCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.heroInputRow}
          onPress={() => {
            setShowMidcSuggestions(false);
            setIndustryModalOpen(true);
          }}
        >
          <Briefcase size={15} color={COLORS.primary} />
          <Text style={[styles.heroInputText, selectedIndustry !== 'Select Industry' && styles.heroInputTextActive]}>
            {selectedIndustry}
          </Text>
          <ChevronDown size={15} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.heroInputRow}
          onPress={() => {
            setShowMidcSuggestions(false);
            setEducationModalOpen(true);
          }}
        >
          <GraduationCap size={15} color={COLORS.primary} />
          <Text style={[styles.heroInputText, selectedEducation !== 'Select Education' && styles.heroInputTextActive]}>
            {selectedEducation}
          </Text>
          <ChevronDown size={15} color="#94A3B8" />
        </TouchableOpacity>

        <View style={{ position: 'relative', zIndex: 10 }}>
          <View style={[styles.heroInputRow, isLocationFocused && styles.heroInputRowActive]}>
            <MapPin size={15} color={COLORS.primary} />
            <TextInput
              style={styles.heroTextInput}
              placeholder="Search MIDC Zone or City (e.g. Chakan, Waluj)"
              placeholderTextColor="#94A3B8"
              value={locationQuery}
              onChangeText={(txt) => {
                setLocationQuery(txt);
                setShowMidcSuggestions(true);
              }}
              onFocus={() => {
                setIsLocationFocused(true);
                setShowMidcSuggestions(true);
              }}
              onBlur={() => setIsLocationFocused(false)}
            />
            {locationQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setLocationQuery('');
                  setShowMidcSuggestions(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={14} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* MIDC Autocomplete Suggestions Dropdown */}
          {showMidcSuggestions && matchingMidcZones.length > 0 ? (
            <View style={styles.midcSuggestionsBox}>
              <View style={styles.midcHeaderRow}>
                <MapPin size={11} color={COLORS.primary} />
                <Text style={styles.midcHeaderTitle}>SUGGESTED MIDC CLUSTERS</Text>
              </View>
              {matchingMidcZones.map((zone) => (
                <TouchableOpacity
                  key={zone}
                  style={styles.midcSuggestionItem}
                  onPress={() => {
                    setLocationQuery(zone);
                    setShowMidcSuggestions(false);
                  }}
                >
                  <MapPin size={13} color="#64748B" />
                  <Text style={styles.midcSuggestionText} numberOfLines={1}>
                    {zone}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.searchJobsBtn}
          onPress={() => {
            setShowMidcSuggestions(false);
            onSearchSubmit();
          }}
        >
          <Search size={14} color="#FFFFFF" />
          <Text style={styles.searchJobsBtnText}>Search Jobs</Text>
        </TouchableOpacity>
      </View>

      {/* Select Industry Modal Sheet */}
      <Modal
        visible={industryModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIndustryModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIndustryModalOpen(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: 24 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Industry</Text>
              <TouchableOpacity
                onPress={() => setIndustryModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {INDUSTRIES.map((ind) => (
                <TouchableOpacity
                  key={ind}
                  activeOpacity={0.7}
                  style={[styles.pickerItem, selectedIndustry === ind && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedIndustry(ind);
                    setIndustryModalOpen(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, selectedIndustry === ind && styles.pickerItemTextActive]}>{ind}</Text>
                  {selectedIndustry === ind ? <Check size={16} color={COLORS.primary} /> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Select Education Modal Sheet */}
      <Modal
        visible={educationModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEducationModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEducationModalOpen(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: 24 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Education</Text>
              <TouchableOpacity
                onPress={() => setEducationModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {EDUCATIONS.map((ed) => (
                <TouchableOpacity
                  key={ed}
                  activeOpacity={0.7}
                  style={[styles.pickerItem, selectedEducation === ed && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedEducation(ed);
                    setEducationModalOpen(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, selectedEducation === ed && styles.pickerItemTextActive]}>{ed}</Text>
                  {selectedEducation === ed ? <Check size={16} color={COLORS.primary} /> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  heroTextSection: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
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
    marginBottom: 12,
  },
  heroSearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  heroInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  heroInputRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  midcSuggestionsBox: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 8,
    elevation: 4,
    zIndex: 999,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  midcHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 4,
  },
  midcHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  midcSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: RADIUS.xs,
    backgroundColor: '#F8FAFC',
    marginBottom: 3,
  },
  midcSuggestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  heroInputText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  heroInputTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  heroTextInput: {
    flex: 1,
    height: '100%',
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 0,
  },
  searchJobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    height: 38,
    borderRadius: RADIUS.card,
    marginTop: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  searchJobsBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemActive: {
    backgroundColor: '#EFF6FF',
  },
  pickerItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
  pickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
