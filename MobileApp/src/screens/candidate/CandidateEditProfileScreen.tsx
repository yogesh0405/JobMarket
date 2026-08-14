import React, { useState } from 'react';
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
  FileText,
  Clock,
  Save,
  X,
  UploadCloud,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/theme';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';

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

export const CandidateEditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const initialTrade = user?.tradeSpecialization || user?.trade_specialization || 'VMC Operator';
  const initialIsOther = !TRADES.filter((t) => t !== 'Other').includes(initialTrade);

  // Profile Form States
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

  const [profilePhotoUrl, setProfilePhotoUrl] = useState((user as any)?.avatar || (user as any)?.profilePhotoUrl || '');
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || '');
  const [resumeName, setResumeName] = useState(user?.resumeName || 'Candidate_Resume.pdf');
  const [showPdfModal, setShowPdfModal] = useState(false);

  const [skills, setSkills] = useState<string[]>(
    Array.isArray(user?.skills) ? user?.skills : ['Welding', 'Machining', 'Fanuc Control', 'Vernier Caliper']
  );
  const [experience, setExperience] = useState<any[]>(Array.isArray(user?.experience) ? user?.experience : []);
  const [education, setEducation] = useState<any[]>(Array.isArray(user?.education) ? user?.education : []);

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);

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

  // Handle Photo Picker
  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow media permissions to upload your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setUploadingPhoto(true);
        const photoUri = result.assets[0].uri;
        setProfilePhotoUrl(photoUri);
        await updateUserProfile({ avatarUrl: photoUri } as any);
        showToast('Profile photo updated successfully!', 'success');
      }
    } catch (err: any) {
      console.log('Error picking photo:', err);
      Alert.alert('Upload Failed', err?.message || 'Could not upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Pick Resume Document
  const handlePickResume = async () => {
    try {
      setUploadingResume(true);
      const fakeUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const fakeName = 'Yogesh_Dandawalkar_Resume.pdf';
      setResumeUrl(fakeUrl);
      setResumeName(fakeName);
      await updateUserProfile({ resumeUrl: fakeUrl, resumeName: fakeName });
      showToast('Resume document attached successfully!', 'success');
    } catch (err: any) {
      Alert.alert('Error', 'Could not pick document.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResumeDoc = async () => {
    Alert.alert('Delete Resume Document', 'Are you sure you want to remove your attached resume document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingResume(true);
            setResumeUrl('');
            setResumeName('');
            await updateUserProfile({ resumeUrl: '', resumeName: '' });
            showToast('Resume document removed.', 'success');
          } catch (e: any) {
            Alert.alert('Error', 'Could not delete resume document.');
          } finally {
            setDeletingResume(false);
          }
        },
      },
    ]);
  };

  // Trade Selection
  const handleSelectTrade = (t: string) => {
    if (t === 'Other') {
      setIsOtherSelected(true);
      setTradeSpecialization('Other');
    } else {
      setIsOtherSelected(false);
      setTradeSpecialization(t);
      setCustomTrade('');
    }
  };

  // Skills handlers
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      Alert.alert('Duplicate Skill', 'This skill tag is already in your list.');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Submit Add Experience
  const handleAddExperienceSubmit = () => {
    if (!expTitle.trim() || !expCompany.trim()) {
      Alert.alert('Required Fields', 'Please enter position title and company name.');
      return;
    }
    const newEntry = {
      title: expTitle.trim(),
      company: expCompany.trim(),
      duration: expDuration.trim() || '1 Year',
      description: expDesc.trim(),
    };
    setExperience([...experience, newEntry]);
    setExpTitle('');
    setExpCompany('');
    setExpDuration('');
    setExpDesc('');
    setExpModalOpen(false);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  // Submit Add Education
  const handleAddEducationSubmit = () => {
    if (!eduDegree.trim() || !eduInstitution.trim()) {
      Alert.alert('Required Fields', 'Please enter degree certificate name and college institution.');
      return;
    }
    const newEntry = {
      degree: eduDegree.trim(),
      institution: eduInstitution.trim(),
      year: eduYear.trim() || '2023',
    };
    setEducation([...education, newEntry]);
    setEduDegree('');
    setEduInstitution('');
    setEduYear('');
    setEduModalOpen(false);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  // Save Full Profile Submit
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile phone number.');
      return;
    }

    const finalTrade = (isOtherSelected || tradeSpecialization === 'Other') ? (customTrade.trim() || 'Other') : tradeSpecialization;

    try {
      setSaving(true);
      const updateData: any = {
        name: name.trim(),
        headline: headline.trim(),
        location: location.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        tradeSpecialization: finalTrade,
        trade_specialization: finalTrade,
        preferredShift,
        preferred_shift: preferredShift,
        requiresBus,
        requires_bus: requiresBus,
        requiresAccommodation,
        requires_accommodation: requiresAccommodation,
        skills,
        experience,
        education,
        resumeUrl,
        resumeName,
        avatar: profilePhotoUrl,
        profilePhotoUrl,
      };

      await candidateApi.updateProfile(updateData);
      await updateUserProfile(updateData);

      showToast('Candidate profile updated successfully!', 'success');
      navigation.goBack();
    } catch (err: any) {
      console.log('Save profile error:', err);
      Alert.alert('Save Failed', err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Edit Profile"
        subtitle="Update worker details & preferences"
        onBack={() => navigation.goBack()}
        hideRightActions={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContentBody}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR EDIT HEADER CONTAINER */}
        <View style={styles.avatarEditContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePickPhoto}
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

            <View style={styles.cameraIconBadgeBadge}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera size={13} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.tapToChangePhotoText}>Tap photo to update profile avatar</Text>
        </View>

        {/* MASTER EDIT CARD CONTAINER */}
        <View style={styles.masterEditCard}>

          {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <UserIcon size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitleText}>Personal & Contact Details</Text>
            </View>

            <View style={{ marginTop: 10 }}>
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
          </View>

          {/* SLATE DIVIDER */}
          <View style={styles.sectionDividerSlate} />

          {/* SECTION 2: TRADE SPECIALIZATION & PREFERENCES */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Award size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitleText}>Trade Specialization & Preferences</Text>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.inputLabel}>Trade Specialization *</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.dropdownPickerRow}
                onPress={() => setTradeModalOpen(true)}
              >
                <Award size={18} color={COLORS.primary} />
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
                <Clock size={18} color={COLORS.primary} />
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
                  thumbColor={requiresBus ? COLORS.primary : '#94A3B8'}
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
                  thumbColor={requiresAccommodation ? COLORS.primary : '#94A3B8'}
                />
              </View>
            </View>
          </View>

          {/* SLATE DIVIDER */}
          <View style={styles.sectionDividerSlate} />

          {/* SECTION 3: SKILLS MANAGEMENT */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Sparkles size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitleText}>Skills</Text>
            </View>

            <View style={{ marginTop: 10 }}>
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
          </View>

          {/* SLATE DIVIDER */}
          <View style={styles.sectionDividerSlate} />

          {/* SECTION 4: WORK EXPERIENCE HISTORY */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Briefcase size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitleText}>Work Experience</Text>
              </View>
              <TouchableOpacity style={styles.addBtnSmall} onPress={() => setExpModalOpen(true)}>
                <Plus size={14} color={COLORS.primary} />
                <Text style={styles.addBtnSmallText}>+ Add</Text>
              </TouchableOpacity>
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
                    <TouchableOpacity onPress={() => handleRemoveExperience(idx)}>
                      <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* SLATE DIVIDER */}
          <View style={styles.sectionDividerSlate} />

          {/* SECTION 5: EDUCATION & CERTIFICATION */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <FileText size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitleText}>Education & Certification</Text>
              </View>
              <TouchableOpacity style={styles.addBtnSmall} onPress={() => setEduModalOpen(true)}>
                <Plus size={14} color={COLORS.primary} />
                <Text style={styles.addBtnSmallText}>+ Add</Text>
              </TouchableOpacity>
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
                    <TouchableOpacity onPress={() => handleRemoveEducation(idx)}>
                      <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* SLATE DIVIDER */}
          <View style={styles.sectionDividerSlate} />

          {/* SECTION 6: RESUME DOCUMENT */}
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

                  <TouchableOpacity
                    style={{ padding: 8, backgroundColor: '#FEF2F2', borderRadius: 4, borderWidth: 1, borderColor: '#FCA5A5' }}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>
                    No resume document uploaded yet
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePickResume}
                    disabled={uploadingResume}
                    style={{ padding: 4 }}
                  >
                    {uploadingResume ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <UploadCloud size={22} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

        </View>

        {/* SAVE PROFILE CHANGES ACTION BUTTON */}
        <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 120 }}>
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
        </View>
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
              {TRADES.map((t: string) => {
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
              {SHIFTS.map((shift: string) => {
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
    backgroundColor: '#F8F9FA',
  },
  scrollContentBody: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircleBorderWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
    borderRadius: 41,
  },
  avatarFallbackLetterBox: {
    width: '100%',
    height: '100%',
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  avatarFallbackLetterText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cameraIconBadgeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToChangePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  masterEditCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    padding: 16,
    marginHorizontal: 16,
  },
  sectionBlock: {
    paddingVertical: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 12,
    fontSize: 13.5,
    color: '#0F172A',
    minHeight: 74,
    textAlignVertical: 'top',
  },
  dropdownPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 10,
  },
  dropdownPickerText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
  },
  addSkillBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 4,
  },
  addSkillBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    borderRadius: 16,
  },
  skillChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
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
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  experienceBlueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  itemRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemRowSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  itemRowDuration: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  itemRowDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 4,
  },
  saveProfileBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
    color: COLORS.primary,
    fontWeight: '800',
  },
});
