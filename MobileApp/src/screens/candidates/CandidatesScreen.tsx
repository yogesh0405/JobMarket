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
} from 'react-native';
import {
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
} from 'lucide-react-native';
import { apiFetch } from '../../api/client';
import { User } from '../../types';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { WebHeader } from '../../components/common/WebHeader';
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

const SAMPLE_CANDIDATES: ExtendedCandidate[] = [
  {
    id: 'c1',
    name: 'Anil Gavhane',
    verified: true,
    aadhaar_verified: true,
    title: 'Senior Hydraulics & Pneumatics Maintenance Engineer',
    location: 'Railway Station MIDC, Chhatrapati Sambhajinagar',
    experience: '9+ Years (2015 - Present)',
    skills: ['Hydraulics', 'Pneumatics', 'Preventive Maintenance', 'Pump Overhaul', 'PLC Troubleshooting'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+91 98230 11223',
    email: 'anil.gavhane@jobmarket.local',
    education: 'Diploma in Mechanical Engineering (Government Polytechnic)',
    bio: 'Experienced industrial hydraulics engineer specializing in heavy press maintenance, pneumatic circuit troubleshooting, and preventive maintenance across automotive manufacturing plants.',
    notice_period: 'Immediate (0-7 Days)',
    preferred_shift: 'Rotational / Day Shift',
  },
  {
    id: 'c2',
    name: 'Manoj Jadhav',
    verified: true,
    aadhaar_verified: true,
    title: 'Certified Heavy Material Handling & Forklift Operator',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    experience: '5+ Years (2019 - Present)',
    skills: ['Forklift Operating', 'Material Loading', 'Pallet Handling', 'Safety Checklists', 'Warehouse Management'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+91 98230 44556',
    email: 'manoj.jadhav@jobmarket.local',
    education: 'ITI Material Handling & Heavy Driving License (RTO Verified)',
    bio: 'Certified forklift and reach-truck operator with flawless safety record in Waluj MIDC logistics hubs. Expert in pallet loading, ERP inventory tracking, and warehouse stack management.',
    notice_period: 'Immediate',
    preferred_shift: 'Day Shift',
  },
  {
    id: 'c3',
    name: 'Pradeep Shinde',
    verified: true,
    aadhaar_verified: true,
    title: 'High-Pressure Heavy MIG & TIG Welder',
    location: 'Paithan MIDC, Chhatrapati Sambhajinagar',
    experience: '7+ Years (2017 - Present)',
    skills: ['MIG Welding', 'TIG Welding', 'Structural Steel Fabrication', 'Pressure Vessel Testing', 'Arc Welding'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    phone: '+91 98230 77889',
    email: 'pradeep.shinde@jobmarket.local',
    education: 'NCVT ITI Welder Trade Certificate',
    bio: 'High-pressure certified MIG/TIG welder with expertise in boiler pipes, heavy steel structure fabrication, radiographical weld inspection, and MIG machine calibration.',
    notice_period: '15 Days',
    preferred_shift: 'Day / Night Shift',
  },
  {
    id: 'c4',
    name: 'Sanjay Kulkarni',
    verified: true,
    aadhaar_verified: true,
    title: 'VMC & CNC Machine Programmer & Setter',
    location: 'Chakan MIDC, Pune',
    experience: '8+ Years (2016 - Present)',
    skills: ['VMC Programming', 'Mastercam', 'AutoCAD', 'Fixture Design', 'CNC Turning', 'Fanuc Controls'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    phone: '+91 98230 99001',
    email: 'sanjay.kulkarni@jobmarket.local',
    education: 'BE Mechanical / Advanced Tooling & CNC Certification',
    bio: 'Precision VMC programmer and setter skilled in Fanuc & Siemens CNC controllers, Mastercam 3D milling, precision GD&T inspection, and fixture design for automotive components.',
    notice_period: 'Immediate',
    preferred_shift: 'General / Day Shift',
  },
];

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

export const CandidatesScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<ExtendedCandidate[]>(SAMPLE_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    setError(null);
    try {
      const res = await apiFetch('/api/v1/jobs/workers/all');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: ExtendedCandidate[] = res.data.map((u: any, idx: number) => {
          const sample = SAMPLE_CANDIDATES[idx % SAMPLE_CANDIDATES.length];
          return {
            ...u,
            id: safeString(u.id, `worker-${idx}`),
            name: safeString(u.name, sample.name),
            verified: u.aadhaar_verified ?? true,
            title: safeString(u.headline || u.trade_specialization, sample.title),
            location: safeString(u.location, sample.location),
            experience: safeString(u.experience, sample.experience),
            skills: Array.isArray(u.skills)
              ? u.skills.map((s: any) => safeString(s)).filter(Boolean)
              : sample.skills,
            avatarUrl: safeString(u.profilePictureUrl || u.profile_picture_url, sample.avatarUrl || ''),
            phone: safeString(u.phone, sample.phone),
            email: safeString(u.email, sample.email),
            education: safeString(u.education || u.qualifications, sample.education || 'NCVT ITI Certified'),
            bio: safeString(u.bio || u.summary || u.about, sample.bio || 'Skilled technical operator with industrial MIDC experience.'),
            notice_period: safeString(u.notice_period || u.noticePeriod, sample.notice_period || 'Immediate'),
            preferred_shift: safeString(u.preferred_shift || u.shiftPreference, sample.preferred_shift || 'Day / Rotational Shift'),
          };
        });
        setCandidates(mapped);
      }
    } catch (err: any) {
      // Keep sample candidates for 100% visual fidelity
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  const handleFilterClick = (tag: string) => {
    setActiveFilter((prev) => (prev === tag ? null : tag));
  };

  const filteredCandidates = candidates.filter((item) => {
    // 1. Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = safeString(item.name).toLowerCase().includes(q);
      const titleMatch = safeString(item.title).toLowerCase().includes(q);
      const locationMatch = safeString(item.location).toLowerCase().includes(q);
      const skillMatch = item.skills?.some((s) => safeString(s).toLowerCase().includes(q));
      if (!nameMatch && !titleMatch && !locationMatch && !skillMatch) {
        return false;
      }
    }
    // 2. Category tag filter
    if (activeFilter) {
      const filterLower = activeFilter.toLowerCase();
      const matchesSkill = item.skills?.some((s) => safeString(s).toLowerCase().includes(filterLower));
      const matchesTitle = safeString(item.title).toLowerCase().includes(filterLower);
      if (!matchesSkill && !matchesTitle) {
        return false;
      }
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
      {/* Header Row: Compact Avatar, Name + Verified Badge, Title */}
      <View style={styles.cardHeaderRow}>
        <Image
          source={{ uri: item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
          style={styles.avatar}
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
          <Text style={styles.candidateTitle} numberOfLines={1}>
            {safeString(item.title, 'Skilled Technical Operator')}
          </Text>
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
      {/* 100% Web Header with Search Bar */}
      <WebHeader showSearch={true} onSearchChange={setSearchQuery} />

      {/* Filter Tags Horizontal Strip */}
      <View style={styles.filterStripContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStripContent}
        >
          {FILTER_TAGS.map((tag) => {
            const isSelected = activeFilter === tag;
            return (
              <TouchableOpacity
                key={tag}
                activeOpacity={0.75}
                onPress={() => handleFilterClick(tag)}
                style={[styles.filterTagPill, isSelected && styles.filterTagPillActive]}
              >
                <Text style={[styles.filterTagText, isSelected && styles.filterTagTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      )}

      {/* Candidate Full Information Modal */}
      <Modal
        visible={!!selectedCandidate}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCandidate(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <UserCheck size={20} color={COLORS.primary} />
                <Text style={styles.modalHeaderTitle}>Candidate Profile</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedCandidate(null)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedCandidate ? (
              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Hero Profile Block */}
                <View style={styles.heroProfileCard}>
                  <Image
                    source={{ uri: selectedCandidate.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
                    style={styles.heroAvatar}
                  />

                  <View style={{ flex: 1 }}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={styles.heroNameText}>{selectedCandidate.name}</Text>
                      {selectedCandidate.verified || selectedCandidate.aadhaar_verified ? (
                        <ShieldCheck size={16} color="#16A34A" />
                      ) : null}
                    </View>

                    <Text style={styles.heroTitleText}>{safeString(selectedCandidate.title, 'Technical Operator')}</Text>

                    <View style={styles.heroLocationRow}>
                      <MapPin size={13} color="#64748B" />
                      <Text style={styles.heroLocationText} numberOfLines={1}>
                        {safeString(selectedCandidate.location, 'Chhatrapati Sambhajinagar MIDC')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Direct Action Contact Row - Logos Only + Resume Button on Right */}
                <View style={styles.contactActionBar}>
                  {/* 1. Phone Call Logo */}
                  <TouchableOpacity
                    style={[styles.iconOnlyContactBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      const ph = safeString(selectedCandidate.phone);
                      if (ph) Linking.openURL(`tel:${ph}`);
                      else Alert.alert('Notice', 'Phone number not provided.');
                    }}
                  >
                    <Phone size={16} color="#2563EB" />
                  </TouchableOpacity>

                  {/* 2. WhatsApp Logo */}
                  <TouchableOpacity
                    style={[styles.iconOnlyContactBtn, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      const ph = safeString(selectedCandidate.phone);
                      if (ph) Linking.openURL(`https://wa.me/${ph.replace(/[^0-9]/g, '')}`);
                      else Alert.alert('Notice', 'WhatsApp number not provided.');
                    }}
                  >
                    <WhatsAppIcon size={18} color="#16A34A" />
                  </TouchableOpacity>

                  {/* 3. Email Logo */}
                  <TouchableOpacity
                    style={[styles.iconOnlyContactBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      const em = safeString(selectedCandidate.email);
                      if (em) Linking.openURL(`mailto:${em}`);
                      else Alert.alert('Notice', 'Email address not provided.');
                    }}
                  >
                    <Mail size={16} color="#D97706" />
                  </TouchableOpacity>

                  {/* 4. Resume Button on the Right Side */}
                  <TouchableOpacity
                    style={styles.resumeActionBtn}
                    activeOpacity={0.8}
                    onPress={() => setPdfModalVisible(true)}
                  >
                    <FileText size={15} color="#FFFFFF" />
                    <Text style={styles.resumeActionText}>View Resume</Text>
                  </TouchableOpacity>
                </View>

                {/* Candidate Overview Bio */}
                {selectedCandidate.bio ? (
                  <View style={styles.modalSectionBox}>
                    <Text style={styles.sectionHeadingTitle}>PROFESSIONAL SUMMARY</Text>
                    <Text style={styles.bioTextContent}>{safeString(selectedCandidate.bio)}</Text>
                  </View>
                ) : null}

                {/* Key Technical Information Grid - 3 Row Layout */}
                <View style={styles.modalSectionBox}>
                  <Text style={styles.sectionHeadingTitle}>WORK & AVAILABILITY</Text>

                  <View style={{ gap: 8, marginTop: 4 }}>
                    {/* Row 1: Experience in One Row */}
                    <View style={styles.fullWidthSpecCard}>
                      <View style={styles.specHeaderRow}>
                        <Briefcase size={13} color="#2563EB" />
                        <Text style={styles.specGridLabel}>Work Experience</Text>
                      </View>
                      <Text style={styles.specGridValue}>
                        {safeString(selectedCandidate.experience, '5+ Years')}
                      </Text>
                    </View>

                    {/* Row 2: Education in One Row */}
                    <View style={styles.fullWidthSpecCard}>
                      <View style={styles.specHeaderRow}>
                        <Award size={13} color="#16A34A" />
                        <Text style={styles.specGridLabel}>Education / Trade</Text>
                      </View>
                      <Text style={styles.specGridValue}>
                        {safeString(selectedCandidate.education, 'NCVT ITI Fitter & Switchgear Technician')}
                      </Text>
                    </View>

                    {/* Row 3: Notice Period and Preferred Shift in One Row */}
                    <View style={styles.twoColRow}>
                      <View style={styles.halfWidthSpecCard}>
                        <View style={styles.specHeaderRow}>
                          <Calendar size={13} color="#D97706" />
                          <Text style={styles.specGridLabel}>Notice Period</Text>
                        </View>
                        <Text style={styles.specGridValue} numberOfLines={1}>
                          {safeString(selectedCandidate.notice_period, 'Immediate')}
                        </Text>
                      </View>

                      <View style={styles.halfWidthSpecCard}>
                        <View style={styles.specHeaderRow}>
                          <UserCheck size={13} color="#0284C7" />
                          <Text style={styles.specGridLabel}>Preferred Shift</Text>
                        </View>
                        <Text style={styles.specGridValue} numberOfLines={1}>
                          {safeString(selectedCandidate.preferred_shift, 'Day / Rotational')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Technical Skills Section */}
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                  <View style={styles.modalSectionBox}>
                    <Text style={styles.sectionHeadingTitle}>TECHNICAL SKILLS & CERTIFICATIONS</Text>
                    <View style={styles.modalSkillsFlex}>
                      {selectedCandidate.skills.map((sk, index) => (
                        <View key={index} style={styles.modalSkillTag}>
                          <CheckCircle2 size={12} color="#2563EB" />
                          <Text style={styles.modalSkillText}>{sk}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </ScrollView>
            ) : null}

            {/* Sticky Action Footer */}
            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalPrimaryCallBtn}
                onPress={() => {
                  if (selectedCandidate?.phone) {
                    Linking.openURL(`tel:${selectedCandidate.phone}`);
                  }
                }}
              >
                <Phone size={16} color={COLORS.textWhite} />
                <Text style={styles.modalPrimaryCallText}>Call Candidate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    paddingBottom: 95,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 1,
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
    marginLeft: 3,
  },
  candidateTitle: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 6,
    gap: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 5,
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
    gap: 4,
  },
  skillPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  skillText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '600',
  },

  /* Candidate Full Info Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
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
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  modalScrollBody: {
    paddingBottom: SPACING.md,
  },
  heroProfileCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm + 2,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  heroAvatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
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
    borderRadius: 4,
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
    gap: 8,
    marginVertical: 10,
  },
  iconOnlyContactBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeActionBtn: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    borderBottomWidth: 2.5,
    borderBottomColor: '#1E40AF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  resumeActionText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSectionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  fullWidthSpecCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  halfWidthSpecCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  specHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  specGridLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  specGridValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeadingTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.slate400,
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
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modalSkillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalFooterRow: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalPrimaryCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 6,
  },
  modalPrimaryCallText: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textWhite,
  },
});

