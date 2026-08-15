import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Camera,
  ShieldCheck,
  FileText,
  Clock,
  Bus,
  Home,
  Save,
  X,
  UploadCloud,
  ExternalLink,
  LayoutDashboard,
  Eye,
  Star,
  Globe,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Building2,
  IndianRupee,
  ArrowRight,
  Search,
  Settings,
  ArrowLeft,
  Pencil,
  Edit,
  TrendingUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { CandidateDashboardScreen } from './CandidateDashboardScreen';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { jobsApi } from '../../api/jobsApi';
import { Job } from '../../types';
import { getRecommendedJobsForCandidate } from '../../utils/recommendationMatcher';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Skeleton as SkeletonLoader, ProfileSkeleton } from '../../components/common/SkeletonLoader';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';

const TRADES = [
  'VMC Operator',
  'CNC Machinist',
  'Fitter',
  'Electrician',
  'Quality Inspector',
  'Welder',
  'Tool & Die Maker',
  'Assembly Operator',
  'Turner',
  'Maintenance Technician',
  'Other',
];

const SHIFTS = ['Day Shift', 'Night Shift', 'Rotational Shift'];

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, updateUserProfile, refreshUser } = useAuth();
  const { showToast } = useToast();

  const initialTrade = user?.tradeSpecialization || user?.trade_specialization || 'VMC Operator';
  const initialIsOther = !TRADES.filter((t) => t !== 'Other').includes(initialTrade);

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [tradeSpecialization, setTradeSpecialization] = useState(initialIsOther ? 'Other' : initialTrade);
  const [customTrade, setCustomTrade] = useState(initialIsOther ? initialTrade : '');
  const [isOtherSelected, setIsOtherSelected] = useState(initialIsOther);

  const [preferredShift, setPreferredShift] = useState(user?.preferredShift || user?.preferred_shift || 'Day Shift');
  const [requiresBus, setRequiresBus] = useState(!!(user?.requiresBus || user?.requires_bus));
  const [requiresAccommodation, setRequiresAccommodation] = useState(!!(user?.requiresAccommodation || user?.requires_accommodation));
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [experience, setExperience] = useState<any[]>(Array.isArray(user?.experience) ? (user?.experience as any[]) : []);
  const [education, setEducation] = useState<any[]>(Array.isArray(user?.education) ? (user?.education as any[]) : []);

  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Tabbed Switcher State: PROFILE vs DASHBOARD
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'DASHBOARD'>(
    route?.params?.initialTab === 'DASHBOARD' || route?.params?.tab === 'DASHBOARD' ? 'DASHBOARD' : 'PROFILE'
  );

  useEffect(() => {
    if (route?.params?.initialTab === 'DASHBOARD' || route?.params?.tab === 'DASHBOARD') {
      setActiveTab('DASHBOARD');
    }
  }, [route?.params]);

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.initialTab !== 'DASHBOARD' && route?.params?.tab !== 'DASHBOARD') {
        setActiveTab('PROFILE');
      }
    }, [route?.params])
  );

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
      setLocation(user.location || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');

      const userTrade = user.tradeSpecialization || user.trade_specialization || 'VMC Operator';
      if (TRADES.filter((t) => t !== 'Other').includes(userTrade)) {
        setTradeSpecialization(userTrade);
        setIsOtherSelected(false);
        setCustomTrade('');
      } else {
        setTradeSpecialization('Other');
        setIsOtherSelected(true);
        setCustomTrade(userTrade);
      }

      setPreferredShift(user.preferredShift || user.preferred_shift || 'Day Shift');
      setRequiresBus(!!(user.requiresBus || user.requires_bus));
      setRequiresAccommodation(!!(user.requiresAccommodation || user.requires_accommodation));
      if (Array.isArray(user.skills)) setSkills(user.skills);
      if (Array.isArray(user.experience)) setExperience(user.experience);
      if (Array.isArray(user.education)) setEducation(user.education);
    }
  }, [user]);

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Permission needed to access photo library', 'warning');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        setUploadingPhoto(true);

        let base64Data = '';
        if (file.base64) {
          const mime = file.mimeType || 'image/jpeg';
          base64Data = file.base64.startsWith('data:') ? file.base64 : `data:${mime};base64,${file.base64}`;
        } else if (file.uri && file.uri.startsWith('data:')) {
          base64Data = file.uri;
        } else if (file.uri) {
          try {
            const resp = await fetch(file.uri);
            const blob = await resp.blob();
            base64Data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            base64Data = file.uri;
          }
        }

        if (!base64Data) {
          showToast('Could not process selected image', 'error');
          return;
        }

        // 1. Immediately update UI state locally so profile photo updates instantly
        await updateUserProfile({
          profile_picture_url: base64Data,
          profilePictureUrl: base64Data,
          avatar_url: base64Data,
          avatarUrl: base64Data,
          avatar: base64Data,
        } as any);

        // 2. Upload to Cloudinary backend server
        try {
          const res = await candidateApi.uploadProfilePicture(base64Data);
          const finalUrl = res.data?.url || (res as any)?.url;
          if (finalUrl) {
            await updateUserProfile({
              profile_picture_url: finalUrl,
              profilePictureUrl: finalUrl,
              avatar_url: finalUrl,
              avatarUrl: finalUrl,
              avatar: finalUrl,
            } as any);
          }
          await refreshUser().catch(() => {});
          showToast('Profile picture updated successfully', 'success');
        } catch (err: any) {
          console.warn('Background avatar server upload notice:', err);
          showToast('Profile picture updated', 'success');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (e: any) {
      setUploadingPhoto(false);
      showToast(e.message || 'Failed to pick image', 'error');
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      refreshUser()
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 400);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch (_) {
    } finally {
      setRefreshing(false);
    }
  };

  const [showPdfModal, setShowPdfModal] = useState(false);

  const rawResume = user?.resume;
  let parsedObj: any = null;
  if (typeof rawResume === 'object' && rawResume !== null) {
    parsedObj = rawResume;
  } else if (typeof rawResume === 'string') {
    try { parsedObj = JSON.parse(rawResume); } catch (_) {}
  }
  const profilePhotoUrl = user?.profile_picture_url || user?.profilePictureUrl || (user as any)?.avatar_url || (user as any)?.avatarUrl || (user as any)?.avatar;
  const resumeUrl = user?.resume_url || user?.resumeUrl || parsedObj?.url;
  const resumeName = user?.resumeName || parsedObj?.name || 'Candidate_Resume.pdf';

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="My Profile"
          showBack={true}
          onBack={() => {
            if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation) {
              navigation.navigate('CandidateMain');
            }
          }}
        />

        <ScrollView contentContainerStyle={styles.scrollContentBody} showsVerticalScrollIndicator={false}>
          <ProfileSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          onPress={() => {
            if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation) {
              navigation.navigate('CandidateMain');
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: 4 }}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>My Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContentBody}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        {/* 1. Hero Blue Banner Profile Card */}
        <View style={styles.heroProfileCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePickPhoto}
            style={styles.heroAvatarWrapper}
          >
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.heroAvatarImage} />
            ) : (
              <View style={styles.heroAvatarFallback}>
                <Text style={styles.heroAvatarText}>
                  {(name || 'Y').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.heroCameraBadge}>
              <Camera size={11} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.heroInfoCol}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroNameText} numberOfLines={1}>
                {name || user?.name || 'Candidate Profile'}
              </Text>
            </View>

            <Text style={styles.heroSubtitleText} numberOfLines={1}>
              {headline || (tradeSpecialization === 'Other' ? customTrade : tradeSpecialization) || 'Industrial Workforce'}
            </Text>

            <View style={styles.heroPillRow}>
              {experience.length > 0 ? (
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>
                    {`${experience.length} Entry`}
                  </Text>
                </View>
              ) : null}
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText} numberOfLines={1}>
                  {location || 'Not Specified'}
                </Text>
              </View>
            </View>
          </View>

          {/* Edit Icon on Top-Right Corner of Hero Blue Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.heroEditIconBtn}
            onPress={() => navigation.navigate('CandidateEditProfile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Edit size={15} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* 2. ABOUT SECTION CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>About</Text>
          </View>
          {bio ? (
            <Text style={styles.aboutText}>{bio}</Text>
          ) : (
            <Text style={styles.emptySubText}>No bio summary added yet.</Text>
          )}
        </View>

        <View style={styles.sectionDividerSlate} />

        {/* 3. CONTACT INFORMATION CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>Contact Information</Text>
          </View>

          <View style={styles.contactGrid2x2}>
            <View style={styles.contactGridCell}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactGridLabel}>Email</Text>
                <Text style={styles.contactGridValue} numberOfLines={1}>{user?.email || '—'}</Text>
              </View>
            </View>

            <View style={styles.contactGridCell}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactGridLabel}>Phone</Text>
                <Text style={styles.contactGridValue} numberOfLines={1}>{phone || '—'}</Text>
              </View>
            </View>

            <View style={styles.contactGridCell}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactGridLabel}>Location</Text>
                <Text style={styles.contactGridValue} numberOfLines={1}>{location || '—'}</Text>
              </View>
            </View>

            <View style={styles.contactGridCell}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactGridLabel}>Trade / MIDC</Text>
                <Text style={styles.contactGridValue} numberOfLines={1}>
                  {(isOtherSelected || tradeSpecialization === 'Other') ? (customTrade || '—') : (tradeSpecialization || '—')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionDividerSlate} />

        {/* 4. SKILLS SECTION CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>Skills</Text>
          </View>

          {skills.length > 0 ? (
            <View style={styles.skillsTagRow}>
              {skills.map((s, idx) => (
                <View key={idx} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{s}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptySubText}>No key skills added yet.</Text>
          )}
        </View>

        <View style={styles.sectionDividerSlate} />

        {/* 5. EXPERIENCE SECTION CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>Experience</Text>
          </View>

          <View style={{ marginTop: 8 }}>
            {experience.length === 0 ? (
              <Text style={styles.emptySubText}>No work experience entries added yet.</Text>
            ) : (
              experience.map((item, idx) => {
                const isCurrent = idx === 0;
                const itemSkills = Array.isArray(item.skills) ? item.skills : [];
                const achievementsList = Array.isArray(item.achievements) ? item.achievements : [];

                return (
                  <View key={idx} style={styles.expTimelineRow}>
                    {/* Inner Experience Card Box */}
                    <View style={styles.expCardInnerBox}>
                      {/* Top Company Row */}
                      <View style={styles.expCardTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.expCompanyNameText}>{item.company || 'Company'}</Text>
                          <Text style={styles.expRoleTitleText}>{item.title || 'Role Position'}</Text>
                        </View>
                        {isCurrent ? (
                          <View style={styles.currentRolePill}>
                            <Text style={styles.currentRolePillText}>Current Role</Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Meta Row: Date & Location */}
                      <View style={styles.expMetaRow}>
                        {item.duration ? (
                          <View style={styles.expMetaItem}>
                            <Text style={styles.expMetaText}>{item.duration}</Text>
                          </View>
                        ) : null}
                        {item.location ? (
                          <View style={styles.expMetaItem}>
                            <Text style={styles.expMetaText}>{item.location}</Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Description */}
                      {item.description ? (
                        <Text style={styles.expDescText}>{item.description}</Text>
                      ) : null}

                      {/* Key Achievements Subsection (rendered only if present) */}
                      {achievementsList.length > 0 ? (
                        <View style={styles.expSubBlock}>
                          <View style={styles.expSubHeaderRow}>
                            <Text style={styles.expSubHeaderText}>Key Achievements</Text>
                          </View>
                          {achievementsList.map((ach: string, achIdx: number) => (
                            <View key={achIdx} style={styles.bulletRow}>
                              <Text style={styles.bulletDot}>•</Text>
                              <Text style={styles.bulletText}>{ach}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      {/* Technology & Skills Subsection (rendered only if present) */}
                      {itemSkills.length > 0 ? (
                        <View style={styles.expSubBlock}>
                          <View style={styles.expSubHeaderRow}>
                            <Text style={styles.expSubHeaderText}>Technology & Skills</Text>
                          </View>
                          <View style={styles.expTechChipRow}>
                            {itemSkills.map((sk: string, skIdx: number) => (
                              <View key={skIdx} style={styles.expTechChip}>
                                <Text style={styles.expTechChipText}>{sk}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.sectionDividerSlate} />

        {/* 6. EDUCATION & CERTIFICATION CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>Education & ITI Certification</Text>
          </View>

          <View style={{ marginTop: 10 }}>
            {education.length === 0 ? (
              <Text style={styles.emptySubText}>No education or ITI certificate added yet.</Text>
            ) : (
              education.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <View style={styles.innerCardItemSeparator} />
                  )}
                  <View style={styles.timelineItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineRoleText}>{item.degree || 'Certificate'}</Text>
                      <Text style={styles.timelineCompanyText}>{item.institution || 'Institution'} • Passing Year: {item.year || '—'}</Text>
                    </View>
                  </View>
                </React.Fragment>
              ))
            )}
          </View>
        </View>

        <View style={styles.sectionDividerSlate} />

        {/* 7. RESUME DOCUMENT CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>Resume & Bio-Data Document</Text>
          </View>

          <View style={{ marginTop: 6 }}>
            {resumeUrl ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F172A' }} numberOfLines={1}>
                    {resumeName}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '500', marginTop: 1 }}>
                    ✓ Document Attached & Live
                  </Text>
                </View>

                <TouchableOpacity
                  style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EFF6FF', borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' }}
                  onPress={() => setShowPdfModal(true)}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>View PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.emptySubText}>No resume document attached yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <ResumePdfViewerModal
        visible={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        candidateName={name || user?.name || 'Candidate'}
        candidateRole={tradeSpecialization || 'Industrial Workforce'}
        pdfUrl={resumeUrl}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  scrollContentBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
  },

  // Hero Blue Banner Profile Card
  heroProfileCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    position: 'relative',
  },
  heroEditIconBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
  },
  heroAvatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  heroAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  heroAvatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  heroAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  heroInfoCol: {
    flex: 1,
    gap: 3,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitleText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#E0F2FE',
  },
  heroPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginBottom: 6,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconSquareBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  aboutText: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 18,
  },
  emptySubText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  innerCardItemSeparator: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 14,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 10,
  },

  // Contact Grid 2x2
  contactGrid2x2: {
    gap: 12,
  },
  contactGridCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactGridLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  contactGridValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 1,
  },

  // Skills Tag Row
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  skillPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },

  // Experience Section Rich Layout
  expTimelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  expDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
    marginTop: 14,
  },
  expDotInactive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#94A3B8',
    marginTop: 14,
  },
  expCardInnerBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    gap: 10,
  },
  expCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyLogoSquare: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expCompanyNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  expRoleTitleText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  currentRolePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  currentRolePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  expMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
    marginTop: 2,
  },
  expMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expMetaText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
  expDescText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 17,
  },
  expSubBlock: {
    marginTop: 4,
    gap: 6,
  },
  expSubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expSubHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 16,
  },
  expTechChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  expTechChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expTechChipText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#3730A3',
  },

  // Timeline Education
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
  },
  timelineRoleText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  timelineCompanyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginTop: 2,
  },
});
