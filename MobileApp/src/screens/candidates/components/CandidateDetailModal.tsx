import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  MapPin,
  Briefcase,
  Award,
  UserCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { ExtendedCandidate, safeString } from './CandidatesUtils';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { WhatsAppIcon } from '../../../components/common/WhatsAppIcon';
import { COLORS } from '../../../constants/theme';
import { extractCandidateResume } from '../../../utils/fileUtils';

interface CandidateDetailModalProps {
  candidate: ExtendedCandidate | null;
  visible: boolean;
  onClose: () => void;
  onOpenPdfModal: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  visible,
  onClose,
  onOpenPdfModal,
}) => {
  if (!candidate) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.fullScreenPageContainer} edges={['top', 'bottom']}>
        <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.topOverscrollBlueFill} />

            <LinearGradient
              colors={COLORS.employerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.detailHeaderBanner}
            >
              <View style={styles.detailHeaderTopNavRow}>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ padding: 4 }}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.detailHeroHorizontalRow}>
                <CompanyLogoAvatar
                  logoUrl={candidate.avatarUrl || candidate.profile_picture_url || (candidate as any).profilePictureUrl}
                  companyName={candidate.name}
                  size={48}
                  borderRadius={24}
                  style={styles.detailAvatarBorder}
                />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.detailCandidateNameText} numberOfLines={1}>
                      {candidate.name}
                    </Text>
                    {candidate.verified || candidate.aadhaar_verified ? (
                      <ShieldCheck size={16} color="#4ADE80" />
                    ) : null}
                  </View>
                  <Text style={styles.detailCandidateRoleText} numberOfLines={1}>
                    {safeString(candidate.title, 'Technical Specialist')}
                  </Text>
                </View>
              </View>

              <View style={styles.quickContactToolbarRow}>
                <TouchableOpacity
                  style={styles.toolbarBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    const ph = safeString(candidate.phone);
                    if (ph) Linking.openURL(`tel:${ph}`);
                    else Alert.alert('Notice', 'Phone number not provided.');
                  }}
                >
                  <Phone size={14} color="#FFFFFF" />
                  <Text style={styles.toolbarBtnText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolbarBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    const ph = safeString(candidate.phone);
                    if (ph) Linking.openURL(`https://wa.me/${ph.replace(/[^0-9]/g, '')}`);
                    else Alert.alert('Notice', 'WhatsApp number not provided.');
                  }}
                >
                  <WhatsAppIcon size={15} color="#4ADE80" />
                  <Text style={styles.toolbarBtnText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolbarBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    const em = safeString(candidate.email);
                    if (em) Linking.openURL(`mailto:${em}`);
                    else Alert.alert('Notice', 'Email address not provided.');
                  }}
                >
                  <Mail size={14} color="#FFFFFF" />
                  <Text style={styles.toolbarBtnText}>Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolbarBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    const ext = extractCandidateResume(candidate);
                    if (ext.url) {
                      onOpenPdfModal();
                    } else {
                      Alert.alert('Notice', "Candidate hasn't uploaded the resume yet.");
                    }
                  }}
                >
                  <FileText size={14} color="#FFFFFF" />
                  <Text style={styles.toolbarBtnText}>Resume</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.detailScrollBodyContent}>
              {candidate.bio ? (
                <>
                  <View style={styles.cardBlock}>
                    <Text style={styles.sectionHeadingTitle}>PROFESSIONAL SUMMARY</Text>
                    <Text style={styles.bioTextContent}>{safeString(candidate.bio)}</Text>
                  </View>
                  <View style={styles.slateSectionDivider} />
                </>
              ) : null}

              <View style={styles.cardBlock}>
                <Text style={styles.sectionHeadingTitle}>WORK & AVAILABILITY</Text>

                <View style={styles.specRowsContainer}>
                  <View style={styles.specRowItem}>
                    <MapPin size={16} color="#0284C7" />
                    <View style={styles.specTextCol}>
                      <Text style={styles.specGridLabel}>Location Address</Text>
                      <Text style={styles.specGridValue}>
                        {safeString(candidate.location, 'Chhatrapati Sambhajinagar Industrial Zone')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.specRowItem}>
                    <Briefcase size={16} color={COLORS.primary} />
                    <View style={styles.specTextCol}>
                      <Text style={styles.specGridLabel}>Work Experience</Text>
                      <Text style={styles.specGridValue}>
                        {safeString(candidate.experience, '5+ Years Experience')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.specRowItem}>
                    <Award size={16} color="#16A34A" />
                    <View style={styles.specTextCol}>
                      <Text style={styles.specGridLabel}>Education & Qualifications</Text>
                      <Text style={styles.specGridValue}>
                        {safeString(candidate.education, 'Certified Professional Degree')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.specRowItem}>
                    <UserCheck size={16} color="#D97706" />
                    <View style={styles.specTextCol}>
                      <Text style={styles.specGridLabel}>Preferred Shift & Availability</Text>
                      <Text style={styles.specGridValue}>
                        {safeString(candidate.preferred_shift, 'General Shift')} • Notice: {safeString(candidate.notice_period, 'Immediate')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.slateSectionDivider} />

              {candidate.skills && candidate.skills.length > 0 ? (
                <View style={styles.cardBlock}>
                  <Text style={styles.sectionHeadingTitle}>SKILLS & COMPETENCIES</Text>
                  <View style={styles.modalSkillsFlex}>
                    {candidate.skills.map((sk, index) => (
                      <View key={index} style={styles.detailSkillPill}>
                        <CheckCircle2 size={12} color={COLORS.primary} />
                        <Text style={styles.detailSkillPillText}>{safeString(sk)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenPageContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topOverscrollBlueFill: {
    height: 300,
    backgroundColor: '#0F172A',
    position: 'absolute',
    top: -300,
    left: 0,
    right: 0,
  },
  detailHeaderBanner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  detailHeaderTopNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  detailHeroHorizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  detailAvatarBorder: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  detailCandidateNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  detailCandidateRoleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93C5FD',
    marginTop: 1,
  },
  quickContactToolbarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toolbarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  toolbarBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailScrollBodyContent: {
    padding: 16,
    gap: 12,
  },
  cardBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  bioTextContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  slateSectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 4,
  },
  specRowsContainer: {
    gap: 8,
  },
  specRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  specTextCol: {
    flex: 1,
  },
  specGridLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  specGridValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modalSkillsFlex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailSkillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  detailSkillPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
