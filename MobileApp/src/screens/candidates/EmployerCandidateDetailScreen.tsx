import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { ExtendedCandidate, safeString } from './components/CandidatesUtils';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { COLORS, RADIUS } from '../../constants/theme';
import { extractCandidateResume } from '../../utils/fileUtils';
import { ApplicantDetailCandidateTab } from '../jobs/components/ApplicantDetailCandidateTab';
import { apiFetch } from '../../api/client';

interface Props {
  navigation?: any;
  route?: {
    params?: {
      candidateId?: string;
      candidate?: ExtendedCandidate;
    };
  };
}

export const EmployerCandidateDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const initialCandidate = route?.params?.candidate;
  const candidateId = route?.params?.candidateId || initialCandidate?.id || (initialCandidate as any)?.user_id || (initialCandidate as any)?.userId;
  const [liveCandidate, setLiveCandidate] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  useEffect(() => {
    if (candidateId) {
      setLoadingProfile(true);
      apiFetch(`/api/v1/auth/public-profile/${candidateId}`)
        .then((res: any) => {
          if (res?.user) {
            setLiveCandidate(res.user);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch live candidate in MobileApp:', err);
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    }
  }, [candidateId]);

  const candidate: any = {
    ...(initialCandidate || {}),
    ...(liveCandidate || {}),
  };

  const topInset = Math.max(
    insets.top || 0,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    Platform.OS === 'ios' ? 44 : 24
  );

  if (!candidate || (!candidate.name && !candidate.id)) {
    return (
      <View style={styles.emptyContainer}>
        <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <View style={styles.topBackHeader}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Candidate Profile</Text>
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyNoticeText}>Candidate information is unavailable.</Text>
          <TouchableOpacity style={styles.returnButton} onPress={() => navigation?.goBack()}>
            <Text style={styles.returnButtonText}>Back to Candidates</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const resumeInfo = extractCandidateResume(candidate);
  const photoUrl =
    candidate.profile_picture_url ||
    candidate.profilePictureUrl ||
    candidate.avatarUrl ||
    candidate.avatar_url ||
    candidate.candidate_avatar ||
    candidate.avatar ||
    candidate.photo ||
    candidate.photo_url;

  // Bridge real candidate object to JobApplication structure for 100% exact parity with ApplicantDetailCandidateTab
  const applicantData = {
    ...candidate,
    id: candidate.id || candidateId,
    user: {
      ...candidate,
      ...(candidate as any)?.user,
      id: candidate.id || candidateId,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      trade_specialization: candidate.trade_specialization || candidate.tradeSpecialization || candidate.title,
      location: candidate.city ? `${candidate.city}${candidate.state ? `, ${candidate.state}` : ''}` : candidate.location,
      bio: candidate.bio || candidate.about,
      skills: candidate.skills,
      experience: candidate.experience,
      education: candidate.education || candidate.qualification,
      preferred_shift: candidate.preferred_shift || candidate.preferredShift,
      requires_bus: candidate.requires_bus || candidate.requiresBus,
      requires_accommodation: candidate.requires_accommodation || candidate.requiresAccommodation,
      notice_period: candidate.notice_period,
      resume_url: resumeInfo.url || candidate.resume_url || candidate.resumeUrl || candidate.resume,
      profile_picture_url: photoUrl,
    },
  };

  return (
    <View style={styles.mainContainer}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={true} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP ROYAL BLUE HERO HEADER */}
        <LinearGradient
          colors={COLORS.employerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.detailHeaderBanner, { paddingTop: topInset + 10 }]}
        >
          {/* Hero Candidate Info Block with Back Button at Left of Profile Picture */}
          <View style={styles.heroInfoRow}>
            {/* Clean Back Button on the Left of Profile Pic with No Background */}
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.cleanBackBtn}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            <CompanyLogoAvatar
              logoUrl={photoUrl}
              companyName={candidate.name}
              size={54}
              borderRadius={27}
              style={styles.detailAvatarBorder}
            />
            <View style={styles.heroTextCol}>
              <View style={styles.nameRow}>
                <Text style={styles.candidateNameText} numberOfLines={1}>
                  {candidate.name}
                </Text>
                {candidate.verified || candidate.aadhaar_verified ? (
                  <ShieldCheck size={16} color="#4ADE80" strokeWidth={2.5} />
                ) : null}
              </View>
              <Text style={styles.candidateRoleText} numberOfLines={1}>
                {safeString(candidate.trade_specialization || candidate.title, 'Industrial Technical Specialist')}
              </Text>
              <Text style={styles.candidateLocText} numberOfLines={1}>
                {safeString(candidate.location, 'Chhatrapati Sambhajinagar')}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* 100% EXACT APPLICANT CANDIDATE TAB BODY */}
        <ApplicantDetailCandidateTab
          selectedApplicant={applicantData as any}
          onOpenPdfModal={() => setPdfModalVisible(true)}
          onSelectEmailTab={() => {
            const em = safeString(candidate.email);
            if (em) Linking.openURL(`mailto:${em}`);
          }}
        />
      </ScrollView>

      {/* Resume PDF Modal */}
      <ResumePdfViewerModal
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        candidateName={candidate.name}
        candidateRole={candidate.title || 'Technical Specialist'}
        pdfUrl={resumeInfo.url}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  detailHeaderBanner: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    backgroundColor: COLORS.primary,
  },
  cleanBackBtn: {
    paddingVertical: 6,
    paddingRight: 4,
    paddingLeft: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailAvatarBorder: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  heroTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  candidateNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  candidateRoleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#EFF6FF',
    marginBottom: 2,
  },
  candidateLocText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyNoticeText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  returnButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
