import React, { useState, useEffect } from 'react';
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
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
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
}

export const CandidateProfileScreen: React.FC<Props> = ({ navigation }) => {
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

  // Modal States
  const [skillInput, setSkillInput] = useState('');
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduYear, setEduYear] = useState('');

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
        {/* Profile Avatar Header */}
        <View style={styles.card3D}>
          <View style={styles.avatarHeaderRow}>
            <TouchableOpacity style={styles.avatarCircleBox} onPress={handlePickPhoto} activeOpacity={0.8}>
              {profilePhotoUrl ? (
                <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarLetter}>{(name || 'C').charAt(0).toUpperCase()}</Text>
              )}

              <View style={styles.cameraIconBadge}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Camera size={12} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.displayName}>{name || 'Candidate User'}</Text>
              <Text style={styles.displayEmail}>{user?.email}</Text>
              <View style={styles.verifiedBadgePill}>
                <ShieldCheck size={12} color="#10B981" />
                <Text style={styles.verifiedBadgeText}>VERIFIED WORKFORCE CANDIDATE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Completeness Card with Progress Bar */}
        <View style={styles.card3D}>
          <View style={styles.completenessHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Award size={18} color="#2563EB" />
              <Text style={styles.completenessTitle}>Profile Completeness</Text>
            </View>
            <Text style={[styles.completenessPctText, { color: completenessScore >= 80 ? '#16A34A' : completenessScore >= 50 ? '#D97706' : '#2563EB' }]}>
              {completenessScore}% Completed
            </Text>
          </View>

          <View style={styles.progressBgBar}>
            <View
              style={[
                styles.progressFillBar,
                {
                  width: `${completenessScore}%`,
                  backgroundColor: completenessScore >= 80 ? '#16A34A' : completenessScore >= 50 ? '#F59E0B' : '#2563EB',
                },
              ]}
            />
          </View>

          <Text style={styles.completenessHintText}>
            {completenessScore === 100
              ? '🎉 Great job! Your candidate profile is 100% complete and stands out to recruiters.'
              : `Complete remaining profile details to boost candidate visibility by ${100 - completenessScore}%.`}
          </Text>
        </View>

        {/* Resume CV Document Upload & View Card */}
        <View style={styles.card3D}>
          <Text style={styles.sectionTitle}>Resume & Bio-Data Document</Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
            Upload your PDF or Image resume document to auto-attach it to all job applications.
          </Text>

          {resumeUrl ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' }}>
              <FileText size={24} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>
                  {resumeName}
                </Text>
                <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '700' }}>
                  ✓ Document Attached & Live in Database
                </Text>
              </View>

              <TouchableOpacity
                style={{ padding: 8, backgroundColor: '#EFF6FF', borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' }}
                onPress={() => setShowPdfModal(true)}
              >
                <ExternalLink size={16} color="#2563EB" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ padding: 8, backgroundColor: '#FEF2F2', borderRadius: 6, borderWidth: 1, borderColor: '#FCA5A5' }}
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

        {/* Personal Info Form Card */}
        <View style={styles.card3D}>
          <Text style={styles.sectionTitle}>Personal & Contact Details</Text>

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

        {/* Industrial Trade & Work Preferences */}
        <View style={styles.card3D}>
          <Text style={styles.sectionTitle}>Trade Specialization & Preferences</Text>

          <Text style={styles.inputLabel}>Select Trade Specialization *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
            {TRADES.map((trade) => {
              const isActive = (trade === 'Other' && isOtherSelected) || (!isOtherSelected && tradeSpecialization === trade);
              return (
                <TouchableOpacity
                  key={trade}
                  activeOpacity={0.8}
                  style={[styles.tradePill, isActive && styles.tradePillActive]}
                  onPress={() => handleSelectTrade(trade)}
                >
                  <Text style={[styles.tradePillText, isActive && styles.tradePillTextActive]}>{trade}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {SHIFTS.map((shift) => {
              const isActive = preferredShift === shift;
              return (
                <TouchableOpacity
                  key={shift}
                  activeOpacity={0.8}
                  style={[styles.shiftTab, isActive && styles.shiftTabActive]}
                  onPress={() => setPreferredShift(shift)}
                >
                  <Text style={[styles.shiftTabText, isActive && styles.shiftTabTextActive]}>{shift}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

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

        {/* Skills Tag Management Card */}
        <View style={styles.card3D}>
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

        {/* Work Experience Section */}
        <View style={styles.card3D}>
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

        {/* Education & Certifications Section */}
        <View style={styles.card3D}>
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

        {/* Save Profile Button */}
        <Button
          title="Save Profile & Bio-Data"
          onPress={handleSaveProfile}
          loading={saving}
          size="lg"
          style={{ marginBottom: 30 }}
        />
      </ScrollView>

      {/* Experience Modal */}
      <Modal visible={expModalOpen} transparent animationType="slide" onRequestClose={() => setExpModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Work Experience</Text>
              <TouchableOpacity onPress={() => setExpModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <Input label="Job Position / Role *" value={expTitle} onChangeText={setExpTitle} placeholder="e.g. VMC Operator" />
            <Input label="Company Name *" value={expCompany} onChangeText={setExpCompany} placeholder="e.g. Tata Motors Waluj" />
            <Input label="Duration / Years *" value={expDuration} onChangeText={setExpDuration} placeholder="e.g. 2 Years (2022 - 2024)" />
            <Input label="Key Responsibilities" value={expDesc} onChangeText={setExpDesc} placeholder="e.g. VMC program setting..." />
            <Button title="Save Experience Entry" onPress={handleAddExperienceSubmit} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>

      {/* Education Modal */}
      <Modal visible={eduModalOpen} transparent animationType="slide" onRequestClose={() => setEduModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Education / ITI Certificate</Text>
              <TouchableOpacity onPress={() => setEduModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <Input label="Degree / Trade Certificate *" value={eduDegree} onChangeText={setEduDegree} placeholder="e.g. ITI Machinist / Diploma" />
            <Input label="Institution / College Name *" value={eduInstitution} onChangeText={setEduInstitution} placeholder="e.g. Govt ITI Aurangabad" />
            <Input label="Passing Year *" value={eduYear} onChangeText={setEduYear} keyboardType="number-pad" placeholder="e.g. 2023" />
            <Button title="Save Education Entry" onPress={handleAddEducationSubmit} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>

      {/* Resume Document Preview Modal */}
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
    paddingBottom: 95,
    gap: 16,
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
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFillBar: {
    height: '100%',
    borderRadius: 5,
  },
  completenessHintText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 16,
    gap: 12,
  },
  avatarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircleBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  displayName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  displayEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  tradePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tradePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  tradePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tradePillTextActive: {
    color: '#FFFFFF',
  },
  shiftTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  shiftTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  shiftTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  shiftTabTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  },
  addSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    borderRadius: 8,
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
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    gap: 10,
  },
  itemRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemRowSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  itemRowDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
});
