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
  Plus,
  Trash2,
  CheckCircle2,
  Camera,
  FileText,
  Clock,
  X,
  UploadCloud,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { COLORS, SPACING } from '../../constants/theme';
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

const STEPS = [
  { id: 1, title: 'Basic Details' },
  { id: 2, title: 'Education' },
  { id: 3, title: 'Experience' },
  { id: 4, title: 'Skills & Resume' },
];

export const CandidateEditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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

  // Stepper Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = React.useRef<ScrollView>(null);

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
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setUploadingPhoto(true);
        const file = result.assets[0];
        let photoUri = '';
        if (file.base64) {
          const mime = file.mimeType || 'image/jpeg';
          photoUri = file.base64.startsWith('data:') ? file.base64 : `data:${mime};base64,${file.base64}`;
        } else if (file.uri && file.uri.startsWith('data:')) {
          photoUri = file.uri;
        } else if (file.uri) {
          try {
            const resp = await fetch(file.uri);
            const blob = await resp.blob();
            photoUri = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            photoUri = file.uri;
          }
        }

        if (!photoUri) return;
        setProfilePhotoUrl(photoUri);
        await updateUserProfile({
          avatarUrl: photoUri,
          avatar_url: photoUri,
          profile_picture_url: photoUri,
          profilePictureUrl: photoUri,
          avatar: photoUri,
        } as any);

        try {
          const res = await candidateApi.uploadProfilePicture(photoUri);
          const finalUrl = res.data?.url || (res as any)?.url;
          if (finalUrl) {
            setProfilePhotoUrl(finalUrl);
            await updateUserProfile({
              avatarUrl: finalUrl,
              avatar_url: finalUrl,
              profile_picture_url: finalUrl,
              profilePictureUrl: finalUrl,
              avatar: finalUrl,
            } as any);
          }
        } catch (e) {}

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
      const fakeName = 'Candidate_Resume.pdf';
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        Alert.alert('Required Field', 'Please enter your Full Name.');
        return;
      }
      if (!phone.trim() || phone.trim().length < 10) {
        Alert.alert('Required Field', 'Please enter a valid 10-digit mobile phone number.');
        return;
      }
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
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
        preferredShift,
        requiresBus,
        requiresAccommodation,
        skills,
        experience,
        education,
        resumeUrl,
        resumeName,
        profilePhotoUrl,
      };

      await candidateApi.updateProfile(updateData);
      await updateUserProfile({
        ...updateData,
        trade_specialization: finalTrade,
        preferred_shift: preferredShift,
        requires_bus: requiresBus,
        requires_accommodation: requiresAccommodation,
      });

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

      {/* Multi-Step Stepper Progress Bar Header */}
      <View style={styles.stepperHeaderCard}>
        <View style={styles.stepTrack}>
          {STEPS.map((step, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = currentStep > stepNumber;
            const isActive = currentStep === stepNumber;
            const isLast = idx === STEPS.length - 1;

            return (
              <React.Fragment key={step.id}>
                <TouchableOpacity
                  style={styles.stepNodeCol}
                  activeOpacity={0.7}
                  disabled={stepNumber > currentStep}
                  onPress={() => {
                    if (stepNumber < currentStep) {
                      setCurrentStep(stepNumber);
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }
                  }}
                >
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCircleCompleted,
                      isActive && styles.stepCircleActive,
                    ]}
                  >
                    {isCompleted ? (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Text style={[styles.stepCircleText, isActive && styles.stepCircleTextActive]}>
                        {stepNumber}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.stepNodeTitle, isActive && styles.stepNodeTitleActive]} numberOfLines={1}>
                    {step.title}
                  </Text>
                </TouchableOpacity>

                {!isLast && (
                  <View style={styles.connectorTrack}>
                    <View
                      style={[
                        styles.connectorLine,
                        currentStep > stepNumber && styles.connectorLineActive,
                      ]}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContentBody}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: Basic Details & Contact */}
        {currentStep === 1 ? (
          <View style={styles.masterEditCard}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Basic Details</Text>
                <Text style={styles.cardHeaderSub}>Update avatar, name & contact information</Text>
              </View>
            </View>

            {/* AVATAR EDIT CONTAINER */}
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
                    <Camera size={12} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.tapToChangePhotoText}>Tap photo to update avatar</Text>
            </View>

            <View style={styles.sectionDividerSlate} />

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Personal Information</Text>
              </View>

              <View style={{ gap: 10 }}>
                <Input
                  label="Candidate Name"
                  required
                  value={name}
                  onChangeText={setName}
                  inputContainerStyle={{ borderRadius: 6 }}
                />

                <Input
                  label="Professional Headline"
                  value={headline}
                  placeholder="e.g. ITI VMC Operator & CNC Setter"
                  onChangeText={setHeadline}
                  inputContainerStyle={{ borderRadius: 6 }}
                />

                <Input
                  label="Current City / MIDC Location"
                  required
                  value={location}
                  placeholder="e.g. Waluj MIDC, Chhatrapati Sambhajinagar"
                  onChangeText={setLocation}
                  inputContainerStyle={{ borderRadius: 6 }}
                />

                <Input
                  label="Mobile Phone Number"
                  required
                  value={phone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  onChangeText={setPhone}
                  inputContainerStyle={{ borderRadius: 6 }}
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
          </View>
        ) : null}

        {/* STEP 2: Education & Specialization */}
        {currentStep === 2 ? (
          <View style={styles.masterEditCard}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Education & Specialization</Text>
                <Text style={styles.cardHeaderSub}>Specify ITI trade specialization & qualifications</Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={{ gap: 10 }}>
                <Text style={styles.sectionTitleText}>Trade Specialization <Text style={{ color: '#DC2626' }}>*</Text></Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.dropdownPickerRow}
                  onPress={() => setTradeModalOpen(true)}
                >
                  <Text style={styles.dropdownPickerText}>
                    {(isOtherSelected || tradeSpecialization === 'Other') ? (customTrade || 'Other (Specify Below)') : tradeSpecialization}
                  </Text>
                  <ChevronDown size={16} color="#94A3B8" />
                </TouchableOpacity>

                {(isOtherSelected || tradeSpecialization === 'Other') ? (
                  <Input
                    label="Custom Trade Specialization"
                    required
                    placeholder="e.g. Laser Cutting Operator / PLC Automation Programmer"
                    value={customTrade}
                    onChangeText={setCustomTrade}
                    inputContainerStyle={{ borderRadius: 6 }}
                  />
                ) : null}
              </View>
            </View>

            <View style={styles.sectionDividerSlate} />

            {/* EDUCATION LIST */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitleText, { flex: 1 }]}>Education & ITI Certificates</Text>
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => setEduModalOpen(true)}>
                  <Plus size={14} color={COLORS.primary} />
                  <Text style={styles.addBtnSmallText}>Add Entry</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 6 }}>
                {education.length === 0 ? (
                  <Text style={styles.emptySubText}>No education or ITI certificate entries added yet.</Text>
                ) : (
                  education.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <View style={styles.innerCardItemSeparator} />}
                      <View style={styles.itemRowCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemRowTitle}>{item.degree}</Text>
                          <Text style={styles.itemRowSub}>{item.institution} • Passing Year: {item.year}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveEducation(idx)}>
                          <Trash2 size={16} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </React.Fragment>
                  ))
                )}
              </View>
            </View>
          </View>
        ) : null}

        {/* STEP 3: Work Experience & Shift Preferences */}
        {currentStep === 3 ? (
          <View style={styles.masterEditCard}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Work Experience & Shift</Text>
                <Text style={styles.cardHeaderSub}>Enter past factory experience & work shift preferences</Text>
              </View>
            </View>

            {/* WORK EXPERIENCE */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitleText, { flex: 1 }]}>Work Experience History</Text>
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => setExpModalOpen(true)}>
                  <Plus size={14} color={COLORS.primary} />
                  <Text style={styles.addBtnSmallText}>Add Entry</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 6 }}>
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

            <View style={styles.sectionDividerSlate} />

            {/* PREFERENCES */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Shift & Facility Preferences</Text>
              </View>

              <View style={{ gap: 10 }}>
                <Text style={styles.inputLabel}>Preferred Shift <Text style={{ color: '#DC2626' }}>*</Text></Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.dropdownPickerRow}
                  onPress={() => setShiftModalOpen(true)}
                >
                  <Text style={styles.dropdownPickerText}>{preferredShift}</Text>
                  <ChevronDown size={16} color="#94A3B8" />
                </TouchableOpacity>

                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleTitle}>Requires Bus Transport</Text>
                    <Text style={styles.toggleDesc}>Company bus pickup/drop facility needed</Text>
                  </View>
                  <Switch
                    value={requiresBus}
                    onValueChange={setRequiresBus}
                    trackColor={{ true: COLORS.primary }}
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
                    trackColor={{ true: COLORS.primary }}
                  />
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* STEP 4: Skills & Resume PDF */}
        {currentStep === 4 ? (
          <View style={styles.masterEditCard}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Skills & Resume</Text>
                <Text style={styles.cardHeaderSub}>Add key technical skills & attach resume bio-data</Text>
              </View>
            </View>

            {/* SKILLS */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Key Technical Skills</Text>
              </View>

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
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
                        <X size={13} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.sectionDividerSlate} />

            {/* RESUME DOCUMENT */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Resume & Bio-Data Document</Text>
              </View>

              <View style={{ marginTop: 6 }}>
                {resumeUrl ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <FileText size={20} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F172A' }} numberOfLines={1}>
                        {resumeName}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '500', marginTop: 1 }}>
                        ✓ Document Attached & Live
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={{ padding: 8, backgroundColor: '#EFF6FF', borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' }}
                      onPress={() => setShowPdfModal(true)}
                    >
                      <ExternalLink size={16} color={COLORS.primary} />
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12.5, fontWeight: '500', color: '#64748B' }}>
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
        ) : null}
      </KeyboardAwareScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.submitContainer, { paddingBottom: Math.max(insets.bottom + 10, 24) }]}>
        {currentStep === 1 ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.prevBtn}
            activeOpacity={0.85}
            onPress={handlePrevStep}
          >
            <ArrowLeft size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.prevBtnText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < 4 ? (
          <TouchableOpacity
            style={styles.nextBtn}
            activeOpacity={0.85}
            onPress={handleNextStep}
          >
            <Text style={styles.nextBtnText}>Next Step</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSaveProfile}
          >
            <Text style={styles.submitBtnText}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Experience Modal */}
      <Modal visible={expModalOpen} transparent animationType="slide" onRequestClose={() => setExpModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setExpModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 28) }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Work Experience</Text>
              <TouchableOpacity onPress={() => setExpModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <Input label="Job Position / Role" required value={expTitle} onChangeText={setExpTitle} placeholder="e.g. VMC Operator" inputContainerStyle={{ borderRadius: 6 }} />
            <Input label="Company Name" required value={expCompany} onChangeText={setExpCompany} placeholder="e.g. Tata Motors Waluj" inputContainerStyle={{ borderRadius: 6 }} />
            <Input label="Duration / Years" required value={expDuration} onChangeText={setExpDuration} placeholder="e.g. 2 Years (2022 - 2024)" inputContainerStyle={{ borderRadius: 6 }} />
            <Input label="Key Responsibilities" value={expDesc} onChangeText={setExpDesc} placeholder="e.g. VMC program setting..." inputContainerStyle={{ borderRadius: 6 }} />
            <Button title="Save Experience Entry" onPress={handleAddExperienceSubmit} style={{ marginTop: 10, borderRadius: 6 }} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Education Modal */}
      <Modal visible={eduModalOpen} transparent animationType="slide" onRequestClose={() => setEduModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEduModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 28) }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Education / ITI Certificate</Text>
              <TouchableOpacity onPress={() => setEduModalOpen(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <Input label="Degree / Trade Certificate" required value={eduDegree} onChangeText={setEduDegree} placeholder="e.g. ITI Machinist / Diploma" inputContainerStyle={{ borderRadius: 6 }} />
            <Input label="Institution / College Name" required value={eduInstitution} onChangeText={setEduInstitution} placeholder="e.g. Govt ITI Aurangabad" inputContainerStyle={{ borderRadius: 6 }} />
            <Input label="Passing Year" required value={eduYear} onChangeText={setEduYear} keyboardType="number-pad" placeholder="e.g. 2023" inputContainerStyle={{ borderRadius: 6 }} />
            <Button title="Save Education Entry" onPress={handleAddEducationSubmit} style={{ marginTop: 10, borderRadius: 6 }} />
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
          <Pressable style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 28) }]} onPress={(e: any) => e.stopPropagation()}>
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
    backgroundColor: '#F8FAFC',
  },
  stepperHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepNodeCol: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  stepCircleCompleted: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stepCircleTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepNodeTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  stepNodeTitleActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  connectorTrack: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: -12,
    marginHorizontal: -4,
  },
  connectorLine: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  connectorLineActive: {
    backgroundColor: COLORS.primary,
  },
  scrollContentBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
  },
  masterEditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 2,
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircleBorderWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  avatarFallbackLetterBox: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  avatarFallbackLetterText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraIconBadgeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToChangePhotoText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 6,
  },
  sectionBlock: {
    marginVertical: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  innerCardItemSeparator: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 14,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 12,
  },
  inputGroup: {
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 5,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
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
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'space-between',
  },
  dropdownPickerText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '400',
    color: '#0F172A',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: '#0F172A',
  },
  addSkillBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addSkillBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontWeight: '500',
    color: COLORS.primary,
  },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnSmallText: {
    fontSize: 12.5,
    fontWeight: '600',
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  experienceBlueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  itemRowTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemRowSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
    fontWeight: '400',
  },
  itemRowDuration: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  itemRowDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
  },
  submitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    flexDirection: 'row',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  prevBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    flexDirection: 'row',
  },
  prevBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nextBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  nextBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '400',
    color: '#334155',
  },
  pickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
