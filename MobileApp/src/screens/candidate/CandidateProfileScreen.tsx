import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
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
  Bookmark,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Building2,
  IndianRupee,
  ArrowRight,
  Search,
  Settings,
  ArrowLeft,
  Pencil,
  Edit3,
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

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(true);
  const [personalInfoOpen, setPersonalInfoOpen] = useState(false);
  const [tradePrefOpen, setTradePrefOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);

  // Modal States
  const [skillInput, setSkillInput] = useState('');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduYear, setEduYear] = useState('');

  // Tabbed Switcher State: PROFILE vs DASHBOARD
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'DASHBOARD'>(
    route?.params?.initialTab === 'DASHBOARD' || route?.params?.tab === 'DASHBOARD' ? 'DASHBOARD' : 'PROFILE'
  );
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  useEffect(() => {
    if (route?.params?.initialTab === 'DASHBOARD' || route?.params?.tab === 'DASHBOARD') {
      setActiveTab('DASHBOARD');
    }
  }, [route?.params]);

  // Reset to About tab every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only reset to PROFILE if no explicit DASHBOARD param is passed
      if (route?.params?.initialTab !== 'DASHBOARD' && route?.params?.tab !== 'DASHBOARD') {
        setActiveTab('PROFILE');
      }
    }, [route?.params])
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      const [appliedRes, savedRes, jobsRes] = await Promise.all([
        candidateApi.getAppliedJobs(),
        candidateApi.getSavedJobs(),
        candidateApi.getAllJobs(),
      ]);
      if (appliedRes.success && Array.isArray(appliedRes.data)) {
        setAppliedJobs(appliedRes.data);
      }
      if (savedRes.success && Array.isArray(savedRes.data)) {
        setSavedJobs(savedRes.data);
      }
      if (jobsRes.success && Array.isArray(jobsRes.data)) {
        const matched = getRecommendedJobsForCandidate(jobsRes.data, user);
        setRecommendedJobs(matched.slice(0, 5));
      }
    } catch (e) {
      console.log('Error loading dashboard stats:', e);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const renderStatusPill = (statusStr?: string) => {
    const s = (statusStr || '').toUpperCase();
    let bg = '#EFF6FF';
    let border = '#BFDBFE';
    let text = COLORS.primary;
    let label = 'APPLIED';

    if (s.includes('SHORTLIST')) {
      bg = '#DCFCE7';
      border = '#86EFAC';
      text = '#15803D';
      label = 'SHORTLISTED';
    } else if (s.includes('INTERVIEW')) {
      bg = '#FEF3C7';
      border = '#FDE68A';
      text = '#B45309';
      label = 'INTERVIEW SCHEDULED';
    } else if (s.includes('HIRED') || s.includes('ACCEPTED')) {
      bg = '#D1FAE5';
      border = '#6EE7B7';
      text = '#047857';
      label = 'HIRED';
    } else if (s.includes('REJECT')) {
      bg = '#FEE2E2';
      border = '#FCA5A5';
      text = '#DC2626';
      label = 'REJECTED';
    }

    return (
      <View style={[styles.statusPillSmall, { backgroundColor: bg, borderColor: border }]}>
        <Text style={[styles.statusPillSmallText, { color: text }]}>{label}</Text>
      </View>
    );
  };

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
      setSkills(user.skills || []);
      setExperience(Array.isArray(user.experience) ? (user.experience as any[]) : []);
      setEducation(Array.isArray(user.education) ? (user.education as any[]) : []);
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
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setUploadingPhoto(true);
        const imageUri = asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : (asset.uri || '');
        const base64Img = imageUri;

        // 1. Immediately update global user state & local storage so photo changes instantly everywhere!
        await updateUserProfile({
          profile_picture_url: imageUri,
          profilePictureUrl: imageUri,
          avatar_url: imageUri,
          avatarUrl: imageUri,
          avatar: imageUri,
        } as any);

        showToast('Profile photo updated successfully', 'success');

        // 2. Sync to server in background
        try {
          const res = await candidateApi.uploadProfilePicture(base64Img);
          const finalUrl = res?.data?.url || (res as any)?.url || imageUri;
          await updateUserProfile({
            profile_picture_url: finalUrl,
            profilePictureUrl: finalUrl,
            avatar_url: finalUrl,
            avatarUrl: finalUrl,
            avatar: finalUrl,
          } as any);
        } catch (err: any) {
          console.warn('Background avatar server upload notice:', err);
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (e: any) {
      setUploadingPhoto(false);
      showToast(e.message || 'Failed to pick image', 'error');
    }
  };

  const handleSelectTrade = (trade: string) => {
    if (trade === 'Other') {
      setTradeSpecialization('Other');
      setIsOtherSelected(true);
    } else {
      setTradeSpecialization(trade);
      setIsOtherSelected(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const finalTrade = (isOtherSelected || tradeSpecialization === 'Other')
        ? (customTrade.trim() || 'Other')
        : tradeSpecialization;

      const payload: any = {
        name,
        headline: headline.trim() || finalTrade,
        location: location.trim() || 'Maharashtra MIDC Zone',
        phone,
        bio: bio.trim(),
        tradeSpecialization: finalTrade,
        preferredShift,
        requiresBus,
        requiresAccommodation,
        skills,
        experience,
        education,
      };

      await updateUserProfile(payload);
      setSaving(false);
      showToast('Candidate Profile Updated & Saved', 'success');
    } catch (e: any) {
      setSaving(false);
      showToast(e.message || 'Failed to save profile', 'error');
    }
  };

  const handleAddSkill = async () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      showToast('Skill already added', 'warning');
      return;
    }
    const updatedSkills = [...skills, trimmed];
    setSkills(updatedSkills);
    setSkillInput('');
    await updateUserProfile({ skills: updatedSkills });
    showToast('Skill added & saved', 'success');
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(updatedSkills);
    await updateUserProfile({ skills: updatedSkills });
  };

  const handleAddExperienceSubmit = async () => {
    if (!expTitle.trim() || !expCompany.trim() || !expDuration.trim()) {
      showToast('Please fill in required experience fields', 'warning');
      return;
    }
    const newItem = {
      title: expTitle.trim(),
      company: expCompany.trim(),
      duration: expDuration.trim(),
      description: expDesc.trim(),
    };
    const updatedExp = [...experience, newItem];
    setExperience(updatedExp);
    setExpTitle('');
    setExpCompany('');
    setExpDuration('');
    setExpDesc('');
    setExpModalOpen(false);
    await updateUserProfile({ experience: updatedExp as any });
    showToast('Experience added & saved', 'success');
  };

  const handleRemoveExperience = async (idx: number) => {
    const updatedExp = experience.filter((_, i) => i !== idx);
    setExperience(updatedExp);
    await updateUserProfile({ experience: updatedExp as any });
  };

  const handleAddEducationSubmit = async () => {
    if (!eduDegree.trim() || !eduInstitution.trim() || !eduYear.trim()) {
      showToast('Please fill in required education fields', 'warning');
      return;
    }
    const newItem = {
      degree: eduDegree.trim(),
      institution: eduInstitution.trim(),
      year: eduYear.trim(),
    };
    const updatedEdu = [...education, newItem];
    setEducation(updatedEdu);
    setEduDegree('');
    setEduInstitution('');
    setEduYear('');
    setEduModalOpen(false);
    await updateUserProfile({ education: updatedEdu as any });
    showToast('Education added & saved', 'success');
  };

  const handleRemoveEducation = async (idx: number) => {
    const updatedEdu = education.filter((_, i) => i !== idx);
    setEducation(updatedEdu);
    await updateUserProfile({ education: updatedEdu as any });
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

  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
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
  const resumeName = user?.resumeName || parsedObj?.name || 'Candidate_BioData_Resume.jpg';

  const handlePickResume = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Permission needed to access photo library', 'warning');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]?.base64) {
        const file = result.assets[0];
        setUploadingResume(true);
        const fileName = file.fileName || 'Resume_BioData.jpg';
        const base64Data = `data:image/jpeg;base64,${file.base64}`;

        const res = await candidateApi.uploadResume(base64Data, fileName);
        setUploadingResume(false);

        if (res.success || res.data) {
          const finalResumeUrl = res.data?.url || (res as any).url || base64Data;
          await updateUserProfile({
            resume_url: finalResumeUrl,
            resumeUrl: finalResumeUrl,
            resumeName: fileName,
            resume: { url: finalResumeUrl, name: fileName },
          } as any);
          await refreshUser();
          showToast('Resume document uploaded successfully', 'success');
        } else {
          showToast(res.message || 'Failed to upload resume document', 'error');
        }
      }
    } catch (e: any) {
      setUploadingResume(false);
      showToast(e.message || 'Error selecting resume file', 'error');
    }
  };

  const handleDeleteResumeDoc = async () => {
    Alert.alert('Delete Resume Document', 'Are you sure you want to delete your uploaded resume?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Resume',
        style: 'destructive',
        onPress: async () => {
          setDeletingResume(true);
          try {
            const res = await candidateApi.deleteResume();
            setDeletingResume(false);
            if (res.success) {
              await refreshUser();
              showToast('Resume deleted successfully', 'info');
            } else {
              showToast(res.message || 'Failed to delete resume', 'error');
            }
          } catch (e: any) {
            setDeletingResume(false);
            showToast(e.message || 'Error deleting resume', 'error');
          }
        },
      },
    ]);
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (name?.trim()) score += 10;
    if (headline?.trim()) score += 10;
    if (location?.trim()) score += 10;
    if (phone?.trim()) score += 10;
    if (bio?.trim()) score += 10;
    if (tradeSpecialization?.trim()) score += 10;
    if (profilePhotoUrl || resumeUrl) score += 10;
    if (skills && skills.length > 0) score += 10;
    if (experience && experience.length > 0) score += 10;
    if (education && education.length > 0) score += 10;
    return score;
  };

  const completenessScore = calculateCompleteness();

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="JobMarket"
          subtitle="Industrial & Factory Jobs"
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
      {/* Top Overscroll Blue Fill */}
      <View style={styles.topOverscrollBlueFill} />

      {/* 1. Top Navy Blue Header Banner */}
      <LinearGradient
        colors={COLORS.employerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.profileHeaderBanner}
      >
        <View style={styles.bannerTopNavRow}>
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
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Profile Completeness % Badge in place of Verified Worker */}
          <View style={styles.verifiedWorkerPill}>
            <ShieldCheck size={10} color="#FFFFFF" />
            <Text style={styles.verifiedWorkerPillText}>
              {completenessScore}% COMPLETE
            </Text>
          </View>
        </View>

        {/* Centered Overlapping Avatar with Edit Pencil Badge */}
        <View style={styles.overlappingAvatarContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CandidateEditProfile')}
            style={styles.avatarCircleBorderWrapper}
          >
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallbackLetterBox}>
                <Text style={styles.avatarFallbackLetterText}>
                  {(name || 'Y').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Edit Pencil Icon Badge on Bottom Right Edge */}
            <View style={styles.editPencilBadgeOnAvatar}>
              <Pencil size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Candidate Name Section */}
      <View style={styles.candidateProfileInfoBox}>
        <View style={styles.nameRowCentered}>
          <Text style={styles.candidateNameTitleText}>
            {name || user?.name || 'Yogesh Dandawalkar'}
          </Text>
          <CheckCircle2 size={18} color={COLORS.primary} />
        </View>
      </View>

      {/* Tab Menu Bar: About vs Dashboard */}
      <View style={styles.underlineTabBarRow}>
        <TouchableOpacity
          style={styles.underlineTabBtn}
          activeOpacity={0.7}
          onPress={() => setActiveTab('PROFILE')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <UserIcon size={16} color={activeTab === 'PROFILE' ? COLORS.primary : '#64748B'} />
            <Text style={[styles.underlineTabText, activeTab === 'PROFILE' && styles.underlineTabTextActive]}>
              About
            </Text>
          </View>
          {activeTab === 'PROFILE' ? <View style={styles.underlineActiveIndicator} /> : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.underlineTabBtn}
          activeOpacity={0.7}
          onPress={() => setActiveTab('DASHBOARD')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <LayoutDashboard size={16} color={activeTab === 'DASHBOARD' ? COLORS.primary : '#64748B'} />
            <Text style={[styles.underlineTabText, activeTab === 'DASHBOARD' && styles.underlineTabTextActive]}>
              Dashboard
            </Text>
          </View>
          {activeTab === 'DASHBOARD' ? <View style={styles.underlineActiveIndicator} /> : null}
        </TouchableOpacity>
      </View>
      <View style={styles.underlineTabBarDivider} />

      <ScrollView
        contentContainerStyle={styles.scrollContentBody}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        {activeTab === 'PROFILE' ? (
          <>
            {/* MASTER SINGLE PROFILE CONTAINER */}
            <View style={styles.cardBlockContainer}>

              {/* 1. ABOUT SECTION */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <UserIcon size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>About</Text>
                </View>

                <Text style={styles.aboutBodyText}>
                  {bio || 'Passionate factory operator & ITI specialist with hands-on precision machining, shop-floor safety protocols, and technical equipment operations.'}
                </Text>
              </View>

              {/* SLATE SECTION DIVIDER */}
              <View style={styles.sectionDividerSlate} />

              {/* 2. PERSONAL & CONTACT DETAILS SECTION */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Mail size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Personal & Contact Information</Text>
                </View>

                <View style={styles.infoRowsList}>
                  <View style={styles.infoDetailRow}>
                    <UserIcon size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Full Name</Text>
                      <Text style={styles.infoDetailValue}>{name || user?.name || 'Yogesh Dandawalkar'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoDetailRow}>
                    <Briefcase size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Professional Headline</Text>
                      <Text style={styles.infoDetailValue}>{headline || 'Tool & Die Maker • Junior developer'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoDetailRow}>
                    <Mail size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Email Address</Text>
                      <Text style={styles.infoDetailValue}>{user?.email || 'yogeshdand04@gmail.com'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoDetailRow}>
                    <MapPin size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Current Location / MIDC</Text>
                      <Text style={styles.infoDetailValue}>{location || 'Mumbai'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoDetailRow}>
                    <Phone size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Mobile Phone</Text>
                      <Text style={styles.infoDetailValue}>{phone || '9703346356'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* SLATE SECTION DIVIDER */}
              <View style={styles.sectionDividerSlate} />

              {/* 3. TRADE SPECIALIZATION & PREFERENCES */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Award size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Trade Specialization & Preferences</Text>
                </View>

                <View style={styles.infoRowsList}>
                  <View style={styles.infoDetailRow}>
                    <Award size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Trade Specialization</Text>
                      <Text style={styles.infoDetailValue}>
                        {(isOtherSelected || tradeSpecialization === 'Other') ? (customTrade || 'Other Trade') : tradeSpecialization}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoDetailRow}>
                    <Clock size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Preferred Shift</Text>
                      <Text style={styles.infoDetailValue}>{preferredShift || 'Any Shift'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoDetailRow}>
                    <Bus size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Bus Transport Facility</Text>
                      <Text style={styles.infoDetailValue}>{requiresBus ? 'Company Bus Pickup Required' : 'Not Needed'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoDetailRow}>
                    <Home size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoDetailLabel}>Hostel Accommodation</Text>
                      <Text style={styles.infoDetailValue}>{requiresAccommodation ? 'Hostel Stay Required' : 'Not Needed'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* SLATE SECTION DIVIDER */}
              <View style={styles.sectionDividerSlate} />

              {/* 4. SKILLS SECTION */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Sparkles size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Skills</Text>
                </View>

                <View style={styles.skillsTagRow}>
                  {skills.map((s, idx) => (
                    <View key={idx} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* SLATE SECTION DIVIDER */}
              <View style={styles.sectionDividerSlate} />

              {/* 5. EXPERIENCE SECTION */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Briefcase size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Experience</Text>
                </View>

                <View style={{ marginTop: 10 }}>
                  {experience.length === 0 ? (
                    <Text style={styles.emptySubText}>No work experience entries added yet.</Text>
                  ) : (
                    experience.map((item, idx) => (
                      <View key={idx} style={styles.itemRowCard}>
                        <View style={styles.experienceBlueDot} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemRowTitle}>{item.title}</Text>
                          <Text style={styles.itemRowSub}>{item.company}</Text>
                          <Text style={styles.itemRowDuration}>{item.duration}</Text>
                          {item.description ? <Text style={styles.itemRowDesc}>{item.description}</Text> : null}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* SLATE SECTION DIVIDER */}
              <View style={styles.sectionDividerSlate} />

              {/* 6. EDUCATION & CERTIFICATION SECTION */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <FileText size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Education & Certification</Text>
                </View>

                <View style={{ marginTop: 10 }}>
                  {education.length === 0 ? (
                    <Text style={styles.emptySubText}>No education or ITI certificate entries added yet.</Text>
                  ) : (
                    education.map((item, idx) => (
                      <View key={idx} style={styles.itemRowCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemRowTitle}>{item.degree}</Text>
                          <Text style={styles.itemRowSub}>{item.institution} • Passing Year: {item.year}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* SLATE SECTION DIVIDER */}
              <View style={styles.sectionDividerSlate} />

              {/* 7. RESUME & BIO-DATA DOCUMENT SECTION */}
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <FileText size={18} color={COLORS.primary} />
                  <Text style={styles.sectionTitleText}>Resume & Bio-Data Document</Text>
                </View>

                <View style={{ marginTop: 12 }}>
                  {resumeUrl ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <FileText size={20} color={COLORS.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>
                          {resumeName}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '700', marginTop: 1 }}>
                          ✓ Document Attached & Live in Database
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={{ padding: 8, backgroundColor: '#EFF6FF', borderRadius: 4, borderWidth: 1, borderColor: '#BFDBFE' }}
                        onPress={() => setShowPdfModal(true)}
                      >
                        <ExternalLink size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>
                      No resume document uploaded yet
                    </Text>
                  )}
                </View>
              </View>

            </View>
          </>
        ) : (
        /* Dashboard Tab View */
        <CandidateDashboardScreen navigation={navigation} hideHeader={true} />
      )}
    </ScrollView>

      {/* Experience Modal */}
      <Modal visible={expModalOpen} transparent animationType="slide" onRequestClose={() => setExpModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setExpModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Work Experience</Text>
              <TouchableOpacity onPress={() => setExpModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <Input label="Job Position / Role *" value={expTitle} onChangeText={setExpTitle} placeholder="e.g. VMC Operator" />
            <Input label="Company Name *" value={expCompany} onChangeText={setExpCompany} placeholder="e.g. Tata Motors Waluj" />
            <Input label="Duration / Years *" value={expDuration} onChangeText={setExpDuration} placeholder="e.g. 2 Years (2022 - 2024)" />
            <Input label="Key Responsibilities" value={expDesc} onChangeText={setExpDesc} placeholder="e.g. VMC program setting..." />
            <Button title="Save Experience Entry" onPress={handleAddExperienceSubmit} style={{ marginTop: 10 }} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Education Modal */}
      <Modal visible={eduModalOpen} transparent animationType="slide" onRequestClose={() => setEduModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEduModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Education / ITI Certificate</Text>
              <TouchableOpacity onPress={() => setEduModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <Input label="Degree / Trade Certificate *" value={eduDegree} onChangeText={setEduDegree} placeholder="e.g. ITI Machinist / Diploma" />
            <Input label="Institution / College Name *" value={eduInstitution} onChangeText={setEduInstitution} placeholder="e.g. Govt ITI Aurangabad" />
            <Input label="Passing Year *" value={eduYear} onChangeText={setEduYear} keyboardType="number-pad" placeholder="e.g. 2023" />
            <Button title="Save Education Entry" onPress={handleAddEducationSubmit} style={{ marginTop: 10 }} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Select Trade Specialization Modal Sheet */}
      <Modal
        visible={tradeModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTradeModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTradeModalOpen(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: 24 }]} onPress={(e: any) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Trade Specialization</Text>
              <TouchableOpacity
                onPress={() => setTradeModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {TRADES.map((t) => {
                const isSel = (t === 'Other' && isOtherSelected) || (!isOtherSelected && tradeSpecialization === t);
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.7}
                    style={[styles.pickerItem, isSel && styles.pickerItemActive]}
                    onPress={() => {
                      handleSelectTrade(t);
                      setTradeModalOpen(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSel && styles.pickerItemTextActive]}>{t}</Text>
                    {isSel ? <CheckCircle2 size={16} color={COLORS.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Select Preferred Shift Modal Sheet */}
      <Modal
        visible={shiftModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setShiftModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShiftModalOpen(false)}>
          <Pressable style={[styles.modalSheet, { paddingBottom: 24 }]} onPress={(e: any) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Preferred Shift</Text>
              <TouchableOpacity
                onPress={() => setShiftModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {SHIFTS.map((shift) => {
                const isSel = preferredShift === shift;
                return (
                  <TouchableOpacity
                    key={shift}
                    activeOpacity={0.7}
                    style={[styles.pickerItem, isSel && styles.pickerItemActive]}
                    onPress={() => {
                      setPreferredShift(shift);
                      setShiftModalOpen(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSel && styles.pickerItemTextActive]}>{shift}</Text>
                    {isSel ? <CheckCircle2 size={16} color={COLORS.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
    backgroundColor: '#F7F7F7',
  },
  topOverscrollBlueFill: {
    position: 'absolute',
    top: -500,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: COLORS.primary,
  },
  profileHeaderBanner: {
    height: 98,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 16,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  bannerTopNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedWorkerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  verifiedWorkerPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bannerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bannerEditBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardHeaderEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  cardHeaderEditBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  aboutBodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    marginTop: 10,
    fontWeight: '400',
  },
  aboutQuickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  aboutGridItem: {
    width: '47.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 8,
  },
  aboutGridIconBox: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutGridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  aboutGridValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  overlappingAvatarContainer: {
    position: 'absolute',
    bottom: -46,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  avatarCircleBorderWrapper: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    backgroundColor: COLORS.primary,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
  },
  avatarFallbackLetterBox: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  avatarFallbackLetterText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  editPencilBadgeOnAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateProfileInfoBox: {
    backgroundColor: '#FFFFFF',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  candidateNameTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  candidateSpecializationSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  underlineTabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 40,
    paddingHorizontal: 16,
  },
  underlineTabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
    alignItems: 'center',
  },
  underlineTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  underlineTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  underlineActiveIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  underlineTabBarDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  scrollContentBody: {
    paddingTop: 8,
    paddingBottom: 130,
  },
  cardsStackWrapper: {
    gap: 14,
  },
  cardBlockContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    padding: 16,
    marginHorizontal: 12,
  },
  cardBlockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBlockTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionBlock: {
    paddingVertical: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },
  infoRowsList: {
    gap: 12,
    marginTop: 6,
  },
  infoDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoDetailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoDetailValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  experienceBlueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  itemRowDuration: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  tabSegmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 4,
    position: 'relative',
  },
  tabSegmentBtnActive: {},
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  tabSegmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  tabSegmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginTop: 10,
    marginBottom: 24,
  },
  avatarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circularAvatarWrapper: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svgRingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  avatarCircleBoxInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImgInner: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  displayName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    flex: 1,
  },
  displayEmail: {
    fontSize: 11.5,
    color: '#64748B',
  },
  displayHeadline: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  headerBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  completenessBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1,
  },
  completenessBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  verifiedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  completenessHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completenessTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  completenessPctText: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBgBar: {
    height: 6,
    borderRadius: 0,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFillBar: {
    height: '100%',
    borderRadius: 0,
  },
  completenessHintText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  sectionTitleNoMargin: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  collapsibleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  chevronCircleBadge: {
    padding: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    gap: 4,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  dropdownPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
    marginBottom: 12,
  },
  dropdownPickerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemActive: {
    backgroundColor: '#EFF6FF',
  },
  pickerItemText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  pickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 12,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 74,
    textAlignVertical: 'top',
  },
  tradePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 0,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tradePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tradePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tradePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  shiftTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  shiftTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  shiftTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  shiftTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  toggleDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  addSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    borderRadius: 0,
    justifyContent: 'center',
  },
  addSkillBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnSmallText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptySubText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  itemRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  itemRowTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemRowSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  itemRowDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 20,
    gap: 12,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statsQuadGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statMetricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  statVerticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  statHorizontalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  statTextStack: {
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyApplicationsBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },
  searchJobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 0,
    marginTop: 4,
  },
  searchJobsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  applicationsList: {
    gap: 0,
  },
  applicationItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  companyIconSquare: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appJobTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  appCompanyText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  statusPillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1,
  },
  statusPillSmallText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  recCardBox: {
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
  },
  recTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  recCompanyText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  recCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  recSalaryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  arrowIconPill: {
    padding: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 0,
    marginTop: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
