import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  ShieldCheck,
  Phone,
  Mail,
  Search,
  X,
  MessageCircle,
  CheckCircle2,
  Award,
  FileText,
  Calendar,
  ChevronRight,
  UserCheck,
  SlidersHorizontal,
  Check,
} from 'lucide-react-native';
import { apiFetch } from '../../api/client';
import { User } from '../../types';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { Header } from '../../components/common/Header';
import { WebHeader } from '../../components/common/WebHeader';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface ExtendedCandidate extends Partial<User> {
  id: string;
  name: string;
  verified?: boolean;
  aadhaar_verified?: boolean;
  title?: string;
  trade_specialization?: string;
  headline?: string;
  location?: string;
  experience?: string;
  skills?: string[];
  avatarUrl?: string;
  phone?: string;
  email?: string;
  education?: string;
  bio?: string;
  resume_url?: string;
  resumeUrl?: string;
  resume?: string;
  notice_period?: string;
  preferred_shift?: string;
}

const FILTER_TAGS = ['VMC Programming', 'Mastercam', 'AutoCAD', 'Fixture Design', 'Hydraulics', 'CNC Operator'];

const safeString = (val: any, fallback: string = ''): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return fallback;
    const parts = val.map((item) => safeString(item)).filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  if (typeof val === 'object') {
    // 1. Education object: { degree, institution, year }
    if (val.degree || val.institution || val.year) {
      const eduParts = [val.degree, val.institution, val.year].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (eduParts.length > 0) return eduParts.join(' • ');
    }
    // 2. Work object: { title, company, duration }
    if (val.title || val.company || val.duration) {
      const workParts = [val.title, val.company, val.duration].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (workParts.length > 0) return workParts.join(' - ');
    }
    // 3. Location object: { city, state }
    if (val.city || val.state) {
      const locParts = [val.city, val.state].filter((x) => typeof x === 'string');
      if (locParts.length > 0) return locParts.join(', ');
    }
    // 4. Generic object values
    const stringValues = Object.values(val)
      .map((v) => (typeof v === 'string' || typeof v === 'number' ? String(v) : ''))
      .filter(Boolean);
    return stringValues.length > 0 ? stringValues.join(' • ') : fallback;
  }
  return String(val);
};

const CANDIDATE_SEARCH_SUGGESTIONS = [
  'Search candidates by name or skill...',
  'Search by trade (e.g. VMC, Fitter)...',
  'Search by location (e.g. MIDC)...',
  'Search by education (e.g. ITI, BE)...',
];

export const CandidatesScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<ExtendedCandidate[]>([]);
  const searchInputRef = React.useRef<any>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rotating live search suggestion placeholder
  useEffect(() => {
    if (searchQuery) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % CANDIDATE_SEARCH_SUGGESTIONS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const fetchCandidates = async () => {
    setError(null);
    try {
      const res = await apiFetch('/api/v1/jobs/workers/all');
      if (res.success && Array.isArray(res.data)) {
        const mapped: ExtendedCandidate[] = res.data.map((u: any, idx: number) => {
          return {
            ...u,
            id: safeString(u.id, `worker-${idx}`),
            name: safeString(u.name || u.displayName || u.fullName, 'Registered Candidate'),
            verified: u.aadhaar_verified ?? u.is_verified ?? false,
            title: safeString(u.headline || u.trade_specialization || u.trade || u.role, 'Skilled Technical Operator'),
            location: safeString(u.location || u.address || u.midc_zone, 'MIDC Industrial Zone'),
            experience: safeString(u.experience, 'Industrial Experience'),
            skills: Array.isArray(u.skills)
              ? u.skills.map((s: any) => safeString(s)).filter(Boolean)
              : typeof u.skills === 'string'
              ? u.skills.split(',').map((s: string) => s.trim())
              : [],
            avatarUrl: safeString(u.profilePictureUrl || u.profile_picture_url || u.avatar_url || u.avatarUrl || u.avatar, ''),
            phone: safeString(u.phone || u.mobile || u.phoneNumber, ''),
            email: safeString(u.email, ''),
            education: safeString(u.education || u.qualifications, 'NCVT ITI Certified'),
            bio: safeString(u.bio || u.summary || u.about, 'Registered candidate in JobMarket database.'),
            notice_period: safeString(u.notice_period || u.noticePeriod, 'Immediate'),
            preferred_shift: safeString(u.preferred_shift || u.shiftPreference, 'General Shift'),
          };
        });
        setCandidates(mapped);
      } else {
        setCandidates([]);
      }
    } catch (err: any) {
      setCandidates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const [activeTradeFilter, setActiveTradeFilter] = useState<string | null>(null);
  const [activeExpFilter, setActiveExpFilter] = useState<string | null>(null);
  const [aadhaarOnlyFilter, setAadhaarOnlyFilter] = useState<boolean>(false);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

  const hasActiveFilters = Boolean(activeTradeFilter || activeExpFilter || aadhaarOnlyFilter);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    setActiveFilter(null);
    setActiveTradeFilter(null);
    setActiveExpFilter(null);
    setAadhaarOnlyFilter(false);
    fetchCandidates();
  };

  const filteredCandidates = candidates.filter((item) => {
    // 1. Multi-field search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = safeString(item.name).toLowerCase().includes(q);
      const titleMatch = safeString(item.title || item.trade_specialization || item.headline).toLowerCase().includes(q);
      const locationMatch = safeString(item.location).toLowerCase().includes(q);
      const educationMatch = safeString(item.education).toLowerCase().includes(q);
      const experienceMatch = safeString(item.experience).toLowerCase().includes(q);
      const phoneMatch = safeString(item.phone).toLowerCase().includes(q);
      const emailMatch = safeString(item.email).toLowerCase().includes(q);
      const bioMatch = safeString(item.bio).toLowerCase().includes(q);
      const skillMatch = item.skills?.some((s) => safeString(s).toLowerCase().includes(q));

      if (
        !nameMatch &&
        !titleMatch &&
        !locationMatch &&
        !educationMatch &&
        !experienceMatch &&
        !phoneMatch &&
        !emailMatch &&
        !bioMatch &&
        !skillMatch
      ) {
        return false;
      }
    }
    // 2. Trade Specialization Filter
    if (activeTradeFilter) {
      const f = activeTradeFilter.toLowerCase();
      const matchesSkill = item.skills?.some((s) => safeString(s).toLowerCase().includes(f));
      const matchesTitle = safeString(item.title || item.trade_specialization).toLowerCase().includes(f);
      if (!matchesSkill && !matchesTitle) return false;
    }
    // 3. Experience Level Filter
    if (activeExpFilter) {
      const expStr = safeString(item.experience).toLowerCase();
      const numMatch = parseInt(expStr.match(/\d+/)?.[0] || '0', 10);
      if (activeExpFilter === '1+ Yrs' && numMatch < 1) return false;
      if (activeExpFilter === '3+ Yrs' && numMatch < 3) return false;
      if (activeExpFilter === '5+ Yrs' && numMatch < 5) return false;
      if (activeExpFilter === '8+ Yrs' && numMatch < 8) return false;
    }
    // 4. Aadhaar Verification Filter
    if (aadhaarOnlyFilter) {
      if (!item.verified && !item.aadhaar_verified) return false;
    }
    return true;
  });

  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedCandidate | null>(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  const renderCandidateCard = ({ item }: { item: ExtendedCandidate }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setSelectedCandidate(item)}
      style={styles.card}
    >
      {/* Header Row (Profile Pic, Name, Trade Speciality) with subtle gray background */}
      <View style={styles.cardHeaderRow}>
        <CompanyLogoAvatar
          logoUrl={item.avatarUrl}
          companyName={item.name}
          size={40}
          borderRadius={0}
          style={{ marginRight: 10 }}
        />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.candidateName} numberOfLines={1}>
              {safeString(item.name, 'Candidate')}
            </Text>
            {item.verified || item.aadhaar_verified ? (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={14} color="#16A34A" />
              </View>
            ) : null}
          </View>
          <View style={styles.tradeTitleBadge}>
            <Briefcase size={12} color="#2563EB" />
            <Text style={styles.candidateTitle} numberOfLines={1}>
              {safeString(item.title, 'Skilled Technical Operator')}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color="#94A3B8" style={{ marginLeft: 4 }} />
      </View>

      {/* Location & Experience Light Gray Container - Compact & Crisp */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <MapPin size={13} color="#64748B" style={styles.infoIcon} />
          <Text style={styles.infoLocationText} numberOfLines={1}>
            {safeString(item.location, 'MIDC Industrial Zone, Chhatrapati Sambhajinagar')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Briefcase size={13} color="#64748B" style={styles.infoIcon} />
          <Text style={styles.infoExperienceText}>
            {safeString(item.experience, '5+ Years Experience')}
          </Text>
        </View>
      </View>

      {/* Skill Pills Flex Wrap - Industry Grade Less-Rounded Tags */}
      {item.skills && item.skills.length > 0 ? (
        <View style={styles.skillsContainer}>
          {item.skills.map((skill, idx) => {
            const skillText = safeString(skill);
            if (!skillText) return null;
            return (
              <View key={idx} style={styles.skillPill}>
                <View style={styles.skillDot} />
                <Text style={styles.skillText}>{skillText}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 100% Exact Same Header */}
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      {/* Integrated Live Candidate Search Bar + Filter Section */}
      <View style={styles.searchBarWrapper}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => searchInputRef.current?.focus()}
          style={[
            styles.searchBarContainer,
            (isSearchFocused || !!searchQuery) && styles.searchBarContainerActive,
          ]}
        >
          <Search size={18} color={isSearchFocused ? '#2563EB' : '#64748B'} style={{ marginRight: 8 }} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={CANDIDATE_SEARCH_SUGGESTIONS[suggestionIndex]}
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            numberOfLines={1}
            multiline={false}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4, marginRight: 2 }}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          ) : null}

          {/* Inline Soft Divider */}
          <View style={styles.inlineFilterDivider} />

          {/* Integrated Filter Action Button Inside Search Bar (Icon Only, Transparent Background) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModalVisible(true)}
            style={styles.inlineFilterBtnIconOnly}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal size={18} color={hasActiveFilters ? '#2563EB' : '#64748B'} />
            {hasActiveFilters ? (
              <View style={styles.inlineFilterBadgeDotOnly} />
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>

        {searchQuery || hasActiveFilters ? (
          <View style={styles.searchResultsInfoRow}>
            <Text style={styles.searchResultsCountText}>
              Found {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? '' : 's'}
              {activeTradeFilter ? ` • ${activeTradeFilter}` : ''}
              {activeExpFilter ? ` • ${activeExpFilter}` : ''}
              {aadhaarOnlyFilter ? ' • Aadhaar Verified' : ''}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setActiveTradeFilter(null);
                setActiveExpFilter(null);
                setAadhaarOnlyFilter(false);
              }}
            >
              <Text style={styles.clearSearchText}>Reset All</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Error Banner */}

      {error ? (
        <ErrorBanner message={error} onRetry={fetchCandidates} style={{ marginHorizontal: SPACING.lg }} />
      ) : null}

      {/* Candidates List */}
      {loading ? (
        <View style={{ padding: SPACING.lg }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredCandidates}
          renderItem={renderCandidateCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      )}

      {/* Candidate Full Information Separate Screen Page */}
      <Modal
        visible={!!selectedCandidate}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedCandidate(null)}
      >
        <SafeAreaView style={styles.fullScreenPageContainer} edges={['top', 'bottom']}>
          <View style={{ flex: 1 }}>
            {selectedCandidate ? (
              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Clean Candidate Hero Profile Banner with Inline Action Buttons */}
                <View style={styles.heroProfileCard}>
                  <View style={styles.heroTopRow}>
                    <CompanyLogoAvatar
                      logoUrl={selectedCandidate.avatarUrl}
                      companyName={selectedCandidate.name}
                      size={44}
                      borderRadius={0}
                      style={{ marginRight: 10 }}
                    />

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={styles.nameBadgeRow}>
                        <Text style={styles.heroNameText}>{selectedCandidate.name}</Text>
                        {selectedCandidate.verified || selectedCandidate.aadhaar_verified ? (
                          <ShieldCheck size={16} color="#16A34A" />
                        ) : null}
                      </View>

                      <Text style={styles.heroTitleText}>{safeString(selectedCandidate.title, 'Technical Operator')}</Text>
                    </View>

                    {/* Close Cross Button on the Right */}
                    <TouchableOpacity
                      style={styles.modalCloseBtn}
                      onPress={() => setSelectedCandidate(null)}
                      activeOpacity={0.7}
                    >
                      <X size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  {/* Direct Action Contact Row Inside Hero Section Below Profile & Name */}
                  <View style={styles.contactActionBarInline}>
                    {/* 1. Phone Call */}
                    <TouchableOpacity
                      style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1 }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        const ph = safeString(selectedCandidate.phone);
                        if (ph) Linking.openURL(`tel:${ph}`);
                        else Alert.alert('Notice', 'Phone number not provided.');
                      }}
                    >
                      <Phone size={15} color="#2563EB" />
                      <Text style={[styles.contactPillText, { color: '#2563EB' }]}>Call</Text>
                    </TouchableOpacity>

                    {/* 2. WhatsApp */}
                    <TouchableOpacity
                      style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1.35 }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        const ph = safeString(selectedCandidate.phone);
                        if (ph) Linking.openURL(`https://wa.me/${ph.replace(/[^0-9]/g, '')}`);
                        else Alert.alert('Notice', 'WhatsApp number not provided.');
                      }}
                    >
                      <WhatsAppIcon size={16} color="#16A34A" />
                      <Text style={[styles.contactPillText, { color: '#15803D' }]}>WhatsApp</Text>
                    </TouchableOpacity>

                    {/* 3. Email */}
                    <TouchableOpacity
                      style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1 }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        const em = safeString(selectedCandidate.email);
                        if (em) Linking.openURL(`mailto:${em}`);
                        else Alert.alert('Notice', 'Email address not provided.');
                      }}
                    >
                      <Mail size={15} color="#DC2626" />
                      <Text style={[styles.contactPillText, { color: '#DC2626' }]}>Email</Text>
                    </TouchableOpacity>

                    {/* 4. Resume */}
                    <TouchableOpacity
                      style={[styles.contactPillBtn, { borderColor: '#2563EB', flex: 1.3 }]}
                      activeOpacity={0.8}
                      onPress={() => setPdfModalVisible(true)}
                    >
                      <FileText size={15} color="#2563EB" />
                      <Text style={[styles.contactPillText, { color: '#2563EB' }]}>Resume</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Section Separator */}
                <View style={styles.sectionSeparator} />

                {/* Candidate Overview Bio */}
                {selectedCandidate.bio ? (
                  <>
                    <View style={styles.modalSectionBox}>
                      <Text style={styles.sectionHeadingTitle}>PROFESSIONAL SUMMARY</Text>
                      <Text style={styles.bioTextContent}>{safeString(selectedCandidate.bio)}</Text>
                    </View>
                    <View style={styles.sectionSeparator} />
                  </>
                ) : null}

                {/* Key Technical Information Grid - Perfectly Aligned iOS Rows */}
                <View style={styles.modalSectionBox}>
                  <Text style={styles.sectionHeadingTitle}>WORK & AVAILABILITY</Text>

                  <View style={styles.specRowsContainer}>
                    {/* Row 1: Location Address */}
                    <View style={styles.specRowItem}>
                      <View style={styles.specIconBadge}>
                        <MapPin size={15} color="#0284C7" />
                      </View>
                      <View style={styles.specTextCol}>
                        <Text style={styles.specGridLabel}>MIDC Location Address</Text>
                        <Text style={styles.specGridValue}>
                          {safeString(selectedCandidate.location, 'Chhatrapati Sambhajinagar MIDC Industrial Area')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rowDivider} />

                    {/* Row 2: Experience */}
                    <View style={styles.specRowItem}>
                      <View style={styles.specIconBadge}>
                        <Briefcase size={15} color="#2563EB" />
                      </View>
                      <View style={styles.specTextCol}>
                        <Text style={styles.specGridLabel}>Work Experience</Text>
                        <Text style={styles.specGridValue}>
                          {safeString(selectedCandidate.experience, '5+ Years')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rowDivider} />

                    {/* Row 3: Education */}
                    <View style={styles.specRowItem}>
                      <View style={styles.specIconBadge}>
                        <Award size={15} color="#16A34A" />
                      </View>
                      <View style={styles.specTextCol}>
                        <Text style={styles.specGridLabel}>Education & Trade</Text>
                        <Text style={styles.specGridValue}>
                          {safeString(selectedCandidate.education, 'NCVT ITI Fitter & Switchgear Technician')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rowDivider} />

                    {/* Row 4: Preferred Shift */}
                    <View style={styles.specRowItem}>
                      <View style={styles.specIconBadge}>
                        <UserCheck size={15} color="#D97706" />
                      </View>
                      <View style={styles.specTextCol}>
                        <Text style={styles.specGridLabel}>Preferred Shift</Text>
                        <Text style={styles.specGridValue}>
                          {safeString(selectedCandidate.preferred_shift, 'Day / Rotational')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Technical Skills Section inside main card */}
                  {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.sectionHeadingTitle}>TECHNICAL SKILLS & CERTIFICATIONS</Text>
                      <View style={styles.modalSkillsFlex}>
                        {selectedCandidate.skills.map((sk, index) => (
                          <View key={index} style={styles.modalSkillTag}>
                            <CheckCircle2 size={12} color="#0F172A" />
                            <Text style={styles.modalSkillText}>{sk}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              </ScrollView>
            ) : null}

            {/* Sticky Action Footer */}
            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalPrimaryCallBtn}
                activeOpacity={0.85}
                onPress={() => {
                  if (selectedCandidate?.phone) {
                    Linking.openURL(`tel:${selectedCandidate.phone}`);
                  } else {
                    Alert.alert('Notice', 'Contact phone number not provided.');
                  }
                }}
              >
                <Text style={styles.modalPrimaryCallText}>Contact Candidate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* In-App Resume PDF Viewer Modal */}
      {selectedCandidate ? (
        <ResumePdfViewerModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          candidateName={selectedCandidate.name}
          candidateRole={selectedCandidate.title || 'Technical Specialist'}
          pdfUrl={selectedCandidate.resume_url || selectedCandidate.resumeUrl || selectedCandidate.resume}
        />
      ) : null}

      {/* Interactive Candidate Filter Action Sheet Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.sheetOverlayBottom}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
          <View style={styles.cleanIosSheetCard}>
            <View style={styles.sheetGrabHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitleText}>FILTER CANDIDATES</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380, marginVertical: 8 }} showsVerticalScrollIndicator={false}>
              {/* Trade Specialization */}
              <Text style={styles.filterSectionTitle}>TRADE SPECIALIZATION</Text>
              <View style={styles.filterOptionsGrid}>
                {['VMC Operator', 'CNC Turner', 'Fitter', 'Welder', 'Electrician', 'Quality Inspector'].map((trade) => {
                  const isSelected = activeTradeFilter === trade;
                  return (
                    <TouchableOpacity
                      key={trade}
                      activeOpacity={0.8}
                      onPress={() => setActiveTradeFilter(isSelected ? null : trade)}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>{trade}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.rowDivider} />

              {/* Experience Level */}
              <Text style={styles.filterSectionTitle}>MINIMUM EXPERIENCE</Text>
              <View style={styles.filterOptionsGrid}>
                {['1+ Yrs', '3+ Yrs', '5+ Yrs', '8+ Yrs'].map((exp) => {
                  const isSelected = activeExpFilter === exp;
                  return (
                    <TouchableOpacity
                      key={exp}
                      activeOpacity={0.8}
                      onPress={() => setActiveExpFilter(isSelected ? null : exp)}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>{exp}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.rowDivider} />

              {/* Verification Status */}
              <Text style={styles.filterSectionTitle}>VERIFICATION STATUS</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAadhaarOnlyFilter(!aadhaarOnlyFilter)}
                style={[styles.filterCheckRow, aadhaarOnlyFilter && styles.filterCheckRowSelected]}
              >
                <ShieldCheck size={18} color={aadhaarOnlyFilter ? '#2563EB' : '#64748B'} />
                <Text style={styles.filterCheckLabel}>Aadhaar Verified Candidates Only</Text>
                {aadhaarOnlyFilter ? <Check size={18} color="#2563EB" /> : null}
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.sheetActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTradeFilter(null);
                  setActiveExpFilter(null);
                  setAadhaarOnlyFilter(false);
                }}
                style={styles.sheetResetBtn}
              >
                <Text style={styles.sheetResetText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setFilterModalVisible(false)}
                style={styles.sheetApplyBtn}
              >
                <Text style={styles.sheetApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBarWrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchBarContainerActive: {
    borderColor: '#2563EB',
    borderBottomColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineFilterDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  inlineFilterBtnIconOnly: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  inlineFilterBadgeDotOnly: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  quickFilterScrollView: {
    marginTop: 10,
  },
  quickFilterScrollContent: {
    paddingRight: 12,
    gap: 6,
  },
  quickFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 0,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  quickFilterPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  quickFilterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  quickFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sheetOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  cleanIosSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    width: '100%',
  },
  sheetGrabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  filterChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  filterCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  filterCheckRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  filterCheckLabel: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  sheetResetBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetResetText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
  },
  sheetApplyBtn: {
    flex: 1.5,
    height: 42,
    backgroundColor: '#2563EB',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetApplyText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 0,
  },
  searchResultsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  searchResultsCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  clearSearchText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  filterStripContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  filterStripContent: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  filterTagPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6, // Less rounded, crisp industry grade
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterTagPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTagText: {
    color: '#2563EB',
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterTagTextActive: {
    color: COLORS.textWhite,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: 8,
    paddingBottom: 130,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#CBD5E1',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  candidateName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  verifiedBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  tradeTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  candidateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  infoBox: {
    paddingVertical: 4,
    marginBottom: 6,
    gap: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  infoLocationText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  infoExperienceText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 1,
    marginRight: 8,
  },
  skillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563EB',
  },
  skillText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Candidate Full Info Modal Styles */
  fullScreenPageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullPageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  fullPageBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: SPACING.sm,
  },
  modalHeaderTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 0,
    backgroundColor: '#F1F5F9',
  },
  modalScrollBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroProfileCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  contactActionBarInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroAvatar: {
    width: 58,
    height: 58,
    borderRadius: 0,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroNameText: {
    ...TYPOGRAPHY.h2,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  aadhaarBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  aadhaarBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  heroTitleText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.slate700,
    marginTop: 2,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroLocationText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: COLORS.slate500,
  },
  contactActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  contactPillBtn: {
    flex: 1,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 4,
  },
  contactPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  modalSectionBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionSeparator: {
    height: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  specRowsContainer: {
    marginTop: 6,
  },
  specRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  specIconBadge: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specTextCol: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  twoColRowSpec: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 6,
    paddingLeft: 46,
  },
  halfSpecCol: {
    flex: 1,
  },
  specMetaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  specGridLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  specGridValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHeadingTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs + 2,
  },
  bioTextContent: {
    ...TYPOGRAPHY.body,
    fontSize: 12.5,
    color: COLORS.slate700,
    lineHeight: 18,
  },
  infoGridTwoCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  gridInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  gridLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.slate400,
    fontWeight: '700',
  },
  gridValue: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.slate800,
    marginTop: 1,
  },
  modalSkillsFlex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 2,
    marginRight: 8,
  },
  modalSkillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalFooterRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalPrimaryCallBtn: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 0,
    marginBottom: 4,
  },
  modalPrimaryCallText: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textWhite,
  },
});

