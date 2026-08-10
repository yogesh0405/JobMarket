import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { jobsApi } from '../../api/jobsApi';
import { Job } from '../../types';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [personalInfoOpen, setPersonalInfoOpen] = useState(true);
  const [tradePrefOpen, setTradePrefOpen] = useState(true);

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
        setRecommendedJobs(jobsRes.data.slice(0, 5));
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
    let text = '#2563EB';
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

      if (!result.canceled && result.assets && result.assets[0]?.base64) {
        setUploadingPhoto(true);
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const res = await candidateApi.uploadProfilePicture(base64Img);
        setUploadingPhoto(false);

        if (res.success) {
          await refreshUser();
          showToast('Profile photo updated successfully', 'success');
        } else {
          showToast(res.message || 'Failed to update photo', 'error');
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
        headline,
        location,
        phone,
        bio,
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
      await refreshUser();
      showToast('Candidate Profile Updated', 'success');
    } catch (e: any) {
      setSaving(false);
      showToast(e.message || 'Failed to save profile', 'error');
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      showToast('Skill already added', 'warning');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperienceSubmit = () => {
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
    setExperience([...experience, newItem]);
    setExpTitle('');
    setExpCompany('');
    setExpDuration('');
    setExpDesc('');
    setExpModalOpen(false);
  };

  const handleRemoveExperience = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleAddEducationSubmit = () => {
    if (!eduDegree.trim() || !eduInstitution.trim() || !eduYear.trim()) {
      showToast('Please fill in required education fields', 'warning');
      return;
    }
    const newItem = {
      degree: eduDegree.trim(),
      institution: eduInstitution.trim(),
      year: eduYear.trim(),
    };
    setEducation([...education, newItem]);
    setEduDegree('');
    setEduInstitution('');
    setEduYear('');
    setEduModalOpen(false);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
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
  const profilePhotoUrl = user?.profile_picture_url || user?.profilePictureUrl;
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

        if (res.success) {
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
          title="Profile"
          showBack={true}
          onBack={() => {
            if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation) {
              navigation.navigate('CandidateMain');
            }
          }}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Header Skeleton */}
          <View style={styles.card3D}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <SkeletonLoader width={76} height={76} style={{ borderRadius: 38 }} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonLoader width="65%" height={20} style={{ borderRadius: 4 }} />
                <SkeletonLoader width="45%" height={14} style={{ borderRadius: 4 }} />
                <SkeletonLoader width={160} height={22} style={{ borderRadius: 12 }} />
              </View>
            </View>
          </View>

          {/* Personal Details Form Skeleton */}
          <View style={styles.card3D}>
            <SkeletonLoader width="45%" height={18} style={{ borderRadius: 4, marginBottom: 14 }} />
            <SkeletonLoader width="100%" height={46} style={{ borderRadius: 8, marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={46} style={{ borderRadius: 8, marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={46} style={{ borderRadius: 8, marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={46} style={{ borderRadius: 8, marginBottom: 12 }} />
          </View>

          {/* Industrial Preferences Skeleton */}
          <View style={styles.card3D}>
            <SkeletonLoader width="50%" height={18} style={{ borderRadius: 4, marginBottom: 14 }} />
            <SkeletonLoader width="100%" height={46} style={{ borderRadius: 8, marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={46} style={{ borderRadius: 8, marginBottom: 12 }} />
          </View>

          {/* Skills & Experience Skeleton */}
          <View style={styles.card3D}>
            <SkeletonLoader width="35%" height={18} style={{ borderRadius: 4, marginBottom: 14 }} />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <SkeletonLoader width={80} height={32} style={{ borderRadius: 16 }} />
              <SkeletonLoader width={95} height={32} style={{ borderRadius: 16 }} />
              <SkeletonLoader width={85} height={32} style={{ borderRadius: 16 }} />
              <SkeletonLoader width={105} height={32} style={{ borderRadius: 16 }} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={activeTab === 'DASHBOARD' ? 'Dashboard' : 'Profile & Account'}
        subtitle="Industrial & Factory Workforce"
        showBack={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tabbed Menu Switcher Bar: Profile vs Dashboard (Apple Underline Tab Menu) */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[styles.tabSegmentBtn, activeTab === 'PROFILE' && styles.tabSegmentBtnActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab('PROFILE')}
          >
            <UserIcon size={16} color={activeTab === 'PROFILE' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.tabSegmentText, activeTab === 'PROFILE' && styles.tabSegmentTextActive]}>
              Profile
            </Text>
            {activeTab === 'PROFILE' ? <View style={styles.activeTabIndicator} /> : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabSegmentBtn, activeTab === 'DASHBOARD' && styles.tabSegmentBtnActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab('DASHBOARD')}
          >
            <LayoutDashboard size={16} color={activeTab === 'DASHBOARD' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.tabSegmentText, activeTab === 'DASHBOARD' && styles.tabSegmentTextActive]}>
              Dashboard
            </Text>
            {activeTab === 'DASHBOARD' ? <View style={styles.activeTabIndicator} /> : null}
          </TouchableOpacity>
        </View>

        {activeTab === 'PROFILE' ? (
          <>
            <View style={styles.singleMasterCard}>
            {/* 1. Profile Avatar Header with Circular Svg Progress Ring */}
            <View style={styles.avatarHeaderRow}>
              <View style={styles.circularAvatarWrapper}>
                {/* SVG Progress Ring */}
                <Svg width={72} height={72} style={styles.svgRingOverlay}>
                  {/* Background Track */}
                  <Circle
                    cx={36}
                    cy={36}
                    r={33}
                    stroke="#E2E8F0"
                    strokeWidth={3.5}
                    fill="transparent"
                  />
                  {/* Active Progress Segment */}
                  <Circle
                    cx={36}
                    cy={36}
                    r={33}
                    stroke={completenessScore >= 80 ? '#16A34A' : completenessScore >= 50 ? '#F59E0B' : '#2563EB'}
                    strokeWidth={3.5}
                    strokeDasharray={207.35}
                    strokeDashoffset={207.35 * (1 - completenessScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    transform="rotate(-90 36 36)"
                  />
                </Svg>

                {/* Avatar Touch Target */}
                <TouchableOpacity style={styles.avatarCircleBoxInner} onPress={handlePickPhoto} activeOpacity={0.85}>
                  {profilePhotoUrl ? (
                    <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImgInner} />
                  ) : (
                    <Text style={styles.avatarLetter}>{(name || 'C').charAt(0).toUpperCase()}</Text>
                  )}

                  <View style={styles.cameraIconBadge}>
                    {uploadingPhoto ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Camera size={10} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.displayName} numberOfLines={1}>
                    {name || 'Candidate User'}
                  </Text>
                  <CheckCircle2 size={16} color="#2563EB" />
                </View>

                <Text style={styles.displayEmail} numberOfLines={1}>{user?.email}</Text>
                {headline ? <Text style={styles.displayHeadline} numberOfLines={1}>{headline}</Text> : null}

                <View style={styles.headerBadgesRow}>
                  <View style={[styles.completenessBadgePill, { backgroundColor: completenessScore >= 80 ? '#DCFCE7' : completenessScore >= 50 ? '#FEF3C7' : '#EFF6FF', borderColor: completenessScore >= 80 ? '#86EFAC' : completenessScore >= 50 ? '#FDE68A' : '#BFDBFE' }]}>
                    <Text style={[styles.completenessBadgeText, { color: completenessScore >= 80 ? '#15803D' : completenessScore >= 50 ? '#B45309' : '#2563EB' }]}>
                      {completenessScore}% Complete
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.sectionDivider, !personalInfoOpen && { marginVertical: 6 }]} />

            {/* 4. Personal Info Form (Collapsible Accordion) */}
            <View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.collapsibleHeaderRow, !personalInfoOpen && { paddingVertical: 2 }]}
                onPress={() => setPersonalInfoOpen((prev) => !prev)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <UserIcon size={18} color="#2563EB" />
                  <Text style={styles.sectionTitleNoMargin}>Personal & Contact Details</Text>
                </View>
                <View style={styles.chevronCircleBadge}>
                  {personalInfoOpen ? (
                    <ChevronUp size={18} color="#2563EB" />
                  ) : (
                    <ChevronDown size={18} color="#64748B" />
                  )}
                </View>
              </TouchableOpacity>

              {personalInfoOpen ? (
                <View style={{ marginTop: 12 }}>
                  <Input
                    label="Full Name *"
                    required
                    value={name}
                    onChangeText={setName}
                    leftIcon={<UserIcon size={18} color="#64748B" />}
                  />

                  <Input
                    label="Professional Headline *"
                    value={headline}
                    placeholder="e.g. ITI VMC Operator & CNC Setter"
                    onChangeText={setHeadline}
                    leftIcon={<Briefcase size={18} color="#64748B" />}
                  />

                  <Input
                    label="Current City / MIDC Location *"
                    required
                    value={location}
                    placeholder="e.g. Waluj MIDC, Chhatrapati Sambhajinagar"
                    onChangeText={setLocation}
                    leftIcon={<MapPin size={18} color="#64748B" />}
                  />

                  <Input
                    label="Mobile Phone Number *"
                    required
                    value={phone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onChangeText={setPhone}
                    leftIcon={<Phone size={18} color="#64748B" />}
                  />

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bio / Career Summary</Text>
                    <TextInput
                      style={styles.textArea}
                      multiline
                      numberOfLines={3}
                      placeholder="Brief summary of your factory experience and technical skills..."
                      placeholderTextColor="#94A3B8"
                      value={bio}
                      onChangeText={setBio}
                    />
                  </View>
                </View>
              ) : null}
            </View>

            <View style={[styles.sectionDivider, !personalInfoOpen && { marginVertical: 6 }]} />

            {/* 5. Industrial Trade & Work Preferences (Collapsible Accordion) */}
            <View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.collapsibleHeaderRow, !tradePrefOpen && { paddingVertical: 2 }]}
                onPress={() => setTradePrefOpen((prev) => !prev)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Award size={18} color="#2563EB" />
                  <Text style={styles.sectionTitleNoMargin}>Trade Specialization & Preferences</Text>
                </View>
                <View style={styles.chevronCircleBadge}>
                  {tradePrefOpen ? (
                    <ChevronUp size={18} color="#2563EB" />
                  ) : (
                    <ChevronDown size={18} color="#64748B" />
                  )}
                </View>
              </TouchableOpacity>

              {tradePrefOpen ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>Trade Specialization *</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.dropdownPickerRow}
                    onPress={() => setTradeModalOpen(true)}
                  >
                    <Award size={18} color="#2563EB" />
                    <Text style={styles.dropdownPickerText}>
                      {(isOtherSelected || tradeSpecialization === 'Other') ? (customTrade || 'Other (Specify Below)') : tradeSpecialization}
                    </Text>
                    <ChevronDown size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {(isOtherSelected || tradeSpecialization === 'Other') ? (
                    <Input
                      label="Custom Trade Specialization *"
                      placeholder="e.g. Laser Cutting Operator / PLC Automation Programmer"
                      value={customTrade}
                      onChangeText={setCustomTrade}
                      leftIcon={<Award size={18} color="#64748B" />}
                    />
                  ) : null}

                  <Text style={styles.inputLabel}>Preferred Shift *</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.dropdownPickerRow}
                    onPress={() => setShiftModalOpen(true)}
                  >
                    <Clock size={18} color="#2563EB" />
                    <Text style={styles.dropdownPickerText}>{preferredShift}</Text>
                    <ChevronDown size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Requires Bus Transport</Text>
                      <Text style={styles.toggleDesc}>Company bus pickup/drop facility needed</Text>
                    </View>
                    <Switch
                      value={requiresBus}
                      onValueChange={setRequiresBus}
                      trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                      thumbColor={requiresBus ? '#2563EB' : '#94A3B8'}
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Requires Hostel Stay</Text>
                      <Text style={styles.toggleDesc}>Accommodation / Hostel room facility needed</Text>
                    </View>
                    <Switch
                      value={requiresAccommodation}
                      onValueChange={setRequiresAccommodation}
                      trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                      thumbColor={requiresAccommodation ? '#2563EB' : '#94A3B8'}
                    />
                  </View>
                </View>
              ) : null}
            </View>

            <View style={[styles.sectionDivider, !tradePrefOpen && { marginVertical: 6 }]} />

            {/* 6. Skills Tag Management */}
            <View>
              <Text style={styles.sectionTitle}>Skills & Technical Capabilities</Text>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="e.g. Vernier Caliper, Fanuc Control..."
                  placeholderTextColor="#94A3B8"
                  value={skillInput}
                  onChangeText={setSkillInput}
                />
                <TouchableOpacity style={styles.addSkillBtn} onPress={handleAddSkill}>
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.addSkillBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.skillsTagRow}>
                {skills.map((s, idx) => (
                  <View key={idx} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{s}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSkill(s)}>
                      <X size={13} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* 7. Work Experience Section */}
            <View>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>Work Experience History</Text>
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => setExpModalOpen(true)}>
                  <Plus size={14} color="#2563EB" />
                  <Text style={styles.addBtnSmallText}>Add Experience</Text>
                </TouchableOpacity>
              </View>

              {experience.length === 0 ? (
                <Text style={styles.emptySubText}>No work experience entries added yet.</Text>
              ) : (
                experience.map((item, idx) => (
                  <View key={idx} style={styles.itemRowCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemRowTitle}>{item.title}</Text>
                      <Text style={styles.itemRowSub}>{item.company} • {item.duration}</Text>
                      {item.description ? <Text style={styles.itemRowDesc}>{item.description}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveExperience(idx)}>
                      <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionDivider} />

            {/* 8. Education Section */}
            <View>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>Education & ITI Certification</Text>
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => setEduModalOpen(true)}>
                  <Plus size={14} color="#2563EB" />
                  <Text style={styles.addBtnSmallText}>Add Education</Text>
                </TouchableOpacity>
              </View>

              {education.length === 0 ? (
                <Text style={styles.emptySubText}>No education or ITI certificate entries added yet.</Text>
              ) : (
                education.map((item, idx) => (
                  <View key={idx} style={styles.itemRowCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemRowTitle}>{item.degree}</Text>
                      <Text style={styles.itemRowSub}>{item.institution} • Passing Year: {item.year}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveEducation(idx)}>
                      <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionDivider} />

            {/* 9. Resume CV Document Section */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <FileText size={18} color="#2563EB" />
                <Text style={styles.sectionTitleNoMargin}>Resume & Bio-Data Document</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                Upload your PDF or Image resume document to auto-attach it to all job applications.
              </Text>

              {resumeUrl ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                  <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>
                      {resumeName}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '700', marginTop: 1 }}>
                      ✓ Document Attached & Live in Database
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{ padding: 9, backgroundColor: '#EFF6FF', borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE' }}
                    onPress={() => setShowPdfModal(true)}
                  >
                    <ExternalLink size={16} color="#2563EB" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ padding: 9, backgroundColor: '#FEF2F2', borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5' }}
                    onPress={handleDeleteResumeDoc}
                    disabled={deletingResume}
                  >
                    {deletingResume ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <Trash2 size={16} color="#DC2626" />
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 8 }}
                  onPress={handlePickResume}
                  disabled={uploadingResume}
                >
                  {uploadingResume ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <UploadCloud size={18} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Upload Resume PDF / Image</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Save Profile Changes Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.saveProfileBtn}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.saveProfileBtnText}>Save Profile Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      ) : (
      /* Dashboard Tab View */
      <View style={{ gap: 14 }}>
        {/* Stats Grid (Single Master Card with 4 Metrics & Soft Dividers) */}
        <View style={styles.singleMasterCard}>
          <View style={styles.statsQuadGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.statMetricItem}
              onPress={() => navigation.navigate('CandidateAppliedTab')}
            >
              <Briefcase size={18} color="#2563EB" />
              <View style={styles.statTextStack}>
                <Text style={styles.statNumber}>{appliedJobs.length}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Jobs Applied</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.statVerticalDivider} />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.statMetricItem}
              onPress={() => navigation.navigate('CandidateSavedTab')}
            >
              <Bookmark size={18} color="#7C3AED" />
              <View style={styles.statTextStack}>
                <Text style={styles.statNumber}>{savedJobs.length}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Saved Jobs</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statHorizontalDivider} />

          <View style={styles.statsQuadGrid}>
            <View style={styles.statMetricItem}>
              <Eye size={18} color="#059669" />
              <View style={styles.statTextStack}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Profile Views</Text>
              </View>
            </View>

            <View style={styles.statVerticalDivider} />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.statMetricItem}
              onPress={() => setActiveTab('PROFILE')}
            >
              <Award size={18} color="#D97706" />
              <View style={styles.statTextStack}>
                <Text style={styles.statNumber}>{skills.length}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Skills & Trades</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Applications Card */}
        <View style={styles.card3D}>
          <View style={styles.cardHeaderRow}>
            <Briefcase size={18} color="#0F172A" />
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CandidateAppliedTab')}
            >
              <Text style={styles.viewAllText}>View All ({appliedJobs.length})</Text>
            </TouchableOpacity>
          </View>

          {loadingDashboard ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 12 }} />
          ) : appliedJobs.length === 0 ? (
            <View style={styles.emptyApplicationsBox}>
              <Building2 size={32} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Job Applications Yet</Text>
              <Text style={styles.emptyDesc}>
                Start applying to industrial vacancies across MIDC zones.
              </Text>
              <TouchableOpacity
                style={styles.searchJobsBtn}
                onPress={() => navigation.navigate('CandidateJobsTab')}
              >
                <Search size={14} color="#FFFFFF" />
                <Text style={styles.searchJobsBtnText}>Explore Vacancies</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.applicationsList}>
              {appliedJobs.slice(0, 4).map((appItem, idx) => {
                const job = appItem.job || appItem;
                return (
                  <TouchableOpacity
                    key={appItem.id || idx}
                    style={styles.applicationItemRow}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('CandidateJobsTab', { screen: 'CandidateJobDetail', params: { jobId: job.id } })}
                  >
                    <View style={styles.companyIconSquare}>
                      <Building2 size={18} color="#2563EB" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.appJobTitle} numberOfLines={1}>
                        {job.title || 'Technical Role'}
                      </Text>
                      <Text style={styles.appCompanyText} numberOfLines={1}>
                        {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC'}
                      </Text>
                    </View>

                    {renderStatusPill(appItem.status)}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Recommended Industrial Jobs Section */}
        {recommendedJobs.length > 0 ? (
          <View style={styles.card3D}>
            <View style={styles.cardHeaderRow}>
              <Sparkles size={18} color="#2563EB" />
              <Text style={styles.sectionTitle}>Recommended Industrial Jobs</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CandidateJobsTab')}
              >
                <Text style={styles.viewAllText}>Browse All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {recommendedJobs.map((recJob) => (
                <TouchableOpacity
                  key={recJob.id}
                  activeOpacity={0.85}
                  style={styles.recCardBox}
                  onPress={() => navigation.navigate('CandidateJobsTab', { screen: 'CandidateJobDetail', params: { jobId: recJob.id } })}
                >
                  <Text style={styles.recTitleText} numberOfLines={1}>{recJob.title}</Text>
                  <Text style={styles.recCompanyText} numberOfLines={1}>{recJob.company}</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <MapPin size={11} color="#64748B" />
                    <Text style={{ fontSize: 11, color: '#64748B' }}>{recJob.location}</Text>
                  </View>

                  <View style={styles.recCardFooter}>
                    <Text style={styles.recSalaryText}>
                      ₹{(recJob.salary_max || (recJob as any).salaryMax || 25000).toLocaleString()}/mo
                    </Text>
                    <View style={styles.arrowIconPill}>
                      <ArrowRight size={12} color="#2563EB" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
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
                    {isSel ? <CheckCircle2 size={16} color="#2563EB" /> : null}
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
                    {isSel ? <CheckCircle2 size={16} color="#2563EB" /> : null}
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
    gap: 16,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 6,
    gap: 24,
    paddingHorizontal: 4,
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
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  tabSegmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  tabSegmentTextActive: {
    color: '#2563EB',
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
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
    backgroundColor: '#2563EB',
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
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    flex: 1,
  },
  displayEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  displayHeadline: {
    fontSize: 11.5,
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
    borderRadius: 6,
    borderWidth: 1,
  },
  completenessBadgeText: {
    fontSize: 10.5,
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
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.3,
  },
  completenessHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completenessTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  completenessPctText: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressBgBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFillBar: {
    height: '100%',
    borderRadius: 4,
  },
  completenessHintText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  sectionTitleNoMargin: {
    fontSize: 15,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    gap: 4,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  dropdownPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
    marginBottom: 12,
  },
  dropdownPickerText: {
    flex: 1,
    fontSize: 13.5,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  pickerItemTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 13.5,
    color: '#0F172A',
    minHeight: 74,
    textAlignVertical: 'top',
  },
  tradePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tradePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
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
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  shiftTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
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
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    borderRadius: 8,
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
    borderRadius: 6,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnSmallText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 12,
    borderTopWidth: 3,
    borderTopColor: '#2563EB',
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
    color: '#2563EB',
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
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
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
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillSmallText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  recCardBox: {
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
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
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
