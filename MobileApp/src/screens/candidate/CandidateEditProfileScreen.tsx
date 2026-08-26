import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { KeyboardAwareScrollView, handleFocusInput } from '../../components/common/KeyboardAwareScrollView';
import { COLORS } from '../../constants/theme';
import { isRemoteHttpUrl } from '../../utils/fileUploadHelper';
import { TRADES, STEPS } from './components/CandidateEditConstants';
import { CandidateEditStep1Basic } from './components/CandidateEditStep1Basic';
import { CandidateEditStep2Education } from './components/CandidateEditStep2Education';
import { CandidateEditStep3Experience } from './components/CandidateEditStep3Experience';
import { CandidateEditStep4SkillsResume } from './components/CandidateEditStep4SkillsResume';
import { CandidateEditModals } from './components/CandidateEditModals';

export const CandidateEditProfileScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const routeStep = route?.params?.step || route?.params?.initialStep;
  const initialStepNum = routeStep && Number(routeStep) >= 1 && Number(routeStep) <= 4 ? Number(routeStep) : 1;

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

  const extractResumeInfo = (userData: any) => {
    if (!userData) return { url: '', name: 'Candidate_Resume.pdf' };
    const rawResume = userData.resume;
    let parsedObj: any = null;
    if (typeof rawResume === 'object' && rawResume !== null) {
      parsedObj = rawResume;
    } else if (typeof rawResume === 'string' && rawResume.trim()) {
      try {
        parsedObj = JSON.parse(rawResume);
      } catch (_) {
        if (rawResume.startsWith('http')) {
          parsedObj = { url: rawResume, name: 'Candidate_Resume.pdf' };
        }
      }
    }

    const rawUrl =
      userData.resumeUrl ||
      userData.resume_url ||
      parsedObj?.url ||
      parsedObj?.resumeUrl ||
      (typeof rawResume === 'string' && rawResume.startsWith('http') ? rawResume : '');

    const resolvedUrl = isRemoteHttpUrl(rawUrl) ? rawUrl : (rawUrl || '');
    const resolvedName =
      userData.resumeName ||
      userData.resume_name ||
      parsedObj?.name ||
      parsedObj?.fileName ||
      'Candidate_Resume.pdf';

    return {
      url: typeof resolvedUrl === 'string' ? resolvedUrl.trim() : '',
      name: typeof resolvedName === 'string' ? resolvedName.trim() : 'Candidate_Resume.pdf',
    };
  };

  const initialResume = extractResumeInfo(user);
  const [resumeUrl, setResumeUrl] = useState(initialResume.url);
  const [resumeName, setResumeName] = useState(initialResume.name);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const parseJsonArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [];
  };

  const [skills, setSkills] = useState<string[]>(
    Array.isArray(user?.skills) ? user?.skills : ['Welding', 'Machining', 'Fanuc Control', 'Vernier Caliper']
  );
  const [experience, setExperience] = useState<any[]>(parseJsonArray(user?.experience));
  const [education, setEducation] = useState<any[]>(parseJsonArray(user?.education));

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);

  // Stepper Wizard State
  const [currentStep, setCurrentStep] = useState(initialStepNum);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (routeStep && Number(routeStep) >= 1 && Number(routeStep) <= 4) {
      setCurrentStep(Number(routeStep));
    }
  }, [routeStep]);

  useEffect(() => {
    if (user) {
      const freshResume = extractResumeInfo(user);
      if (freshResume.url && !resumeUrl) {
        setResumeUrl(freshResume.url);
        setResumeName(freshResume.name);
      }
    }
  }, [user]);

  // Modal States
  const [skillInput, setSkillInput] = useState('');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expStartYear, setExpStartYear] = useState('2022');
  const [expEndYear, setExpEndYear] = useState(String(new Date().getFullYear()));
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState('');

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduYear, setEduYear] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const handleConfirmBack = () => {
    setShowDiscardModal(true);
  };

  useEffect(() => {
    const backAction = () => {
      handleConfirmBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handlePickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Gallery permission is required to upload profile avatar.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!res.canceled && res.assets[0]) {
        setUploadingPhoto(true);
        const asset = res.assets[0];
        if (!asset.base64) {
          Alert.alert('Upload Error', 'Could not read image data. Please select a different photo.');
          return;
        }

        const base64Data = `data:image/webp;base64,${asset.base64}`;
        const uploadRes = await candidateApi.uploadProfilePicture(base64Data);
        const finalUrl = uploadRes?.data?.url || base64Data;

        setProfilePhotoUrl(finalUrl);
        await updateUserProfile({
          profile_picture_url: finalUrl,
          profilePictureUrl: finalUrl,
          avatar_url: finalUrl,
          avatarUrl: finalUrl,
          avatar: finalUrl,
        } as any);
        showToast('Profile photo updated successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      Alert.alert('Upload Error', err?.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePickResume = async () => {
    try {
      setUploadingResume(true);

      // Primary: DocumentPicker allowing PDF documents and Image files
      const docRes = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (docRes.canceled) {
        setUploadingResume(false);
        return;
      }

      if (docRes.assets && docRes.assets[0]) {
        const asset = docRes.assets[0];
        const fileName = asset.name || 'Candidate_Resume.pdf';
        const fileUri = asset.uri;

        const uploadRes = await candidateApi.uploadResume(fileUri, fileName);
        const cloudUrl = uploadRes?.data?.url;

        if (uploadRes.success && cloudUrl && isRemoteHttpUrl(cloudUrl)) {
          setResumeUrl(cloudUrl);
          setResumeName(fileName);
          updateUserProfile({
            resume: {
              url: cloudUrl,
              name: fileName,
              uploadedAt: new Date().toISOString(),
            },
          } as any);
          showToast('Resume uploaded & saved to cloud successfully!', 'success');
          return;
        } else {
          throw new Error('Cloud storage URL not received for uploaded resume.');
        }
      }
    } catch (docErr: any) {
      console.warn('DocumentPicker notice, trying ImagePicker fallback:', docErr);
      try {
        const imgRes = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });

        if (imgRes.canceled) {
          setUploadingResume(false);
          return;
        }

        if (imgRes.assets && imgRes.assets[0]) {
          const asset = imgRes.assets[0];
          const fileName = asset.fileName || 'Candidate_Resume_Photo.jpg';
          const fileInput = asset.base64
            ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
            : asset.uri;

          const uploadRes = await candidateApi.uploadResume(fileInput, fileName);
          const cloudUrl = uploadRes?.data?.url;

          if (uploadRes.success && cloudUrl && isRemoteHttpUrl(cloudUrl)) {
            setResumeUrl(cloudUrl);
            setResumeName(fileName);
            updateUserProfile({
              resume: {
                url: cloudUrl,
                name: fileName,
                uploadedAt: new Date().toISOString(),
              },
            } as any);
            showToast('Resume photo uploaded to cloud successfully!', 'success');
            return;
          } else {
            throw new Error('Cloud storage URL not received for uploaded resume photo.');
          }
        }
      } catch (imgErr: any) {
        Alert.alert('Upload Error', imgErr?.message || docErr?.message || 'Failed to upload resume to cloud storage.');
      }
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    Alert.alert(
      'Remove Resume Document',
      'Are you sure you want to remove your attached resume document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeletingResume(true);
            try {
              await candidateApi.deleteResume();
              setResumeUrl('');
              setResumeName('');
              showToast('Resume document removed', 'info');
            } catch (e) {
              setResumeUrl('');
              setResumeName('');
            } finally {
              setDeletingResume(false);
            }
          },
        },
      ]
    );
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddExperience = () => {
    if (!expTitle.trim() || !expCompany.trim()) {
      Alert.alert('Validation Error', 'Job Title and Company Name are required.');
      return;
    }
    const start = parseInt(expStartYear || '2022', 10);
    const end = expIsCurrent ? new Date().getFullYear() : parseInt(expEndYear || String(new Date().getFullYear()), 10);
    const diffYears = Math.max(end - start, 0);
    const diffText = diffYears === 0 ? '< 1 Year' : diffYears === 1 ? '1 Year' : `${diffYears} Years`;
    const formattedDuration = `${diffText} (${start} - ${expIsCurrent ? 'Present' : end})`;

    const newEntry = {
      title: expTitle.trim(),
      company: expCompany.trim(),
      startYear: String(start),
      endYear: expIsCurrent ? 'Present' : String(end),
      duration: formattedDuration,
      description: expDesc.trim(),
    };
    setExperience((prev) => [...prev, newEntry]);
    setExpTitle('');
    setExpCompany('');
    setExpStartYear('2022');
    setExpEndYear(String(new Date().getFullYear()));
    setExpIsCurrent(false);
    setExpDesc('');
    setExpModalOpen(false);
    showToast('Work experience entry added', 'success');
  };

  const handleRemoveExperience = (index: number) => {
    setExperience((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Work experience entry removed', 'info');
  };

  const handleAddEducation = () => {
    if (!eduDegree.trim() || !eduInstitution.trim()) {
      Alert.alert('Validation Error', 'Degree/Certificate and School/College are required.');
      return;
    }
    const newEntry = {
      degree: eduDegree.trim(),
      institution: eduInstitution.trim(),
      year: eduYear.trim() || String(new Date().getFullYear()),
    };
    setEducation((prev) => [...prev, newEntry]);
    setEduDegree('');
    setEduInstitution('');
    setEduYear('');
    setEduModalOpen(false);
    showToast('Education entry added', 'success');
  };

  const handleRemoveEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Education entry removed', 'info');
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

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile phone number.');
      return;
    }

    const finalTrade = isOtherSelected || tradeSpecialization === 'Other' ? customTrade.trim() || 'Other' : tradeSpecialization;

    try {
      setSaving(true);
      const cleanSkills = Array.isArray(skills) ? skills.map((s) => String(s).trim()).filter(Boolean) : [];
      const cleanExp = Array.isArray(experience) ? experience : [];
      const cleanEdu = Array.isArray(education) ? education : [];

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
        skills: cleanSkills,
        experience: cleanExp,
        education: cleanEdu,
      };

      if (resumeUrl && typeof resumeUrl === 'string' && resumeUrl.trim()) {
        const trimmedUrl = resumeUrl.trim();
        updateData.resumeUrl = trimmedUrl;
        updateData.resumeName = resumeName || 'Candidate_Resume.pdf';
        updateData.resume = {
          url: trimmedUrl,
          name: resumeName || 'Candidate_Resume.pdf',
          uploadedAt: new Date().toISOString(),
        };
      }

      if (profilePhotoUrl && typeof profilePhotoUrl === 'string' && profilePhotoUrl.trim()) {
        const trimmedPhoto = profilePhotoUrl.trim();
        updateData.profilePhotoUrl = trimmedPhoto;
        updateData.profile_picture_url = trimmedPhoto;
        updateData.avatar = trimmedPhoto;
      }

      await updateUserProfile(updateData);

      showToast('Candidate profile updated successfully in database!', 'success');
      navigation.goBack();
    } catch (err: any) {
      console.error('Update profile save error:', err);
      Alert.alert('Save Failed', err?.message || 'Failed to update profile in database. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Edit Profile"
        subtitle="Update worker details & preferences"
        onBack={handleConfirmBack}
        hideRightActions={true}
      />

      {/* Stepper Header Bar */}
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
                  <View style={[styles.stepCircle, isCompleted && styles.stepCircleCompleted, isActive && styles.stepCircleActive]}>
                    {isCompleted ? (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Text style={[styles.stepCircleText, isActive && styles.stepCircleTextActive]}>{stepNumber}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepNodeTitle, isActive && styles.stepNodeTitleActive]} numberOfLines={1}>
                    {step.title}
                  </Text>
                </TouchableOpacity>

                {!isLast && (
                  <View style={styles.connectorTrack}>
                    <View style={[styles.connectorLine, currentStep > stepNumber && styles.connectorLineActive]} />
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
        {currentStep === 1 ? (
          <CandidateEditStep1Basic
            name={name}
            setName={setName}
            headline={headline}
            setHeadline={setHeadline}
            location={location}
            setLocation={setLocation}
            phone={phone}
            setPhone={setPhone}
            bio={bio}
            setBio={setBio}
            profilePhotoUrl={profilePhotoUrl}
            uploadingPhoto={uploadingPhoto}
            onPickPhoto={handlePickPhoto}
            onFocusBio={(e) => handleFocusInput(e, scrollViewRef, 150)}
          />
        ) : null}

        {currentStep === 2 ? (
          <CandidateEditStep2Education
            tradeSpecialization={tradeSpecialization}
            isOtherSelected={isOtherSelected}
            customTrade={customTrade}
            setCustomTrade={setCustomTrade}
            education={education}
            onOpenTradeModal={() => setTradeModalOpen(true)}
            onOpenEduModal={() => setEduModalOpen(true)}
            onRemoveEducation={handleRemoveEducation}
          />
        ) : null}

        {currentStep === 3 ? (
          <CandidateEditStep3Experience
            experience={experience}
            preferredShift={preferredShift}
            requiresBus={requiresBus}
            setRequiresBus={setRequiresBus}
            requiresAccommodation={requiresAccommodation}
            setRequiresAccommodation={setRequiresAccommodation}
            onOpenExpModal={() => setExpModalOpen(true)}
            onOpenShiftModal={() => setShiftModalOpen(true)}
            onRemoveExperience={handleRemoveExperience}
          />
        ) : null}

        {currentStep === 4 ? (
          <CandidateEditStep4SkillsResume
            skills={skills}
            skillInput={skillInput}
            setSkillInput={setSkillInput}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            resumeUrl={resumeUrl}
            resumeName={resumeName}
            uploadingResume={uploadingResume}
            deletingResume={deletingResume}
            onPickResume={handlePickResume}
            onDeleteResume={handleDeleteResume}
            onOpenPdfModal={() => setShowPdfModal(true)}
            onFocusSkillInput={(e) => handleFocusInput(e, scrollViewRef, 140)}
          />
        ) : null}
      </KeyboardAwareScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom + 10, 20) }]}>
        {currentStep === 1 ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleConfirmBack}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.prevBtn} onPress={handlePrevStep}>
            <Text style={styles.prevBtnText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < 4 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
            <Text style={styles.nextBtnText}>Next Step</Text>
          </TouchableOpacity>
        ) : (
          <Button
            title="Save Profile"
            onPress={handleSaveProfile}
            loading={saving}
            style={{ flex: 1.5, height: 44, borderRadius: 8 }}
          />
        )}
      </View>

      <CandidateEditModals
        tradeModalOpen={tradeModalOpen}
        onCloseTradeModal={() => setTradeModalOpen(false)}
        onSelectTrade={(t) => {
          if (t === 'Other') {
            setIsOtherSelected(true);
            setTradeSpecialization('Other');
          } else {
            setIsOtherSelected(false);
            setTradeSpecialization(t);
            setCustomTrade('');
          }
          setTradeModalOpen(false);
        }}
        shiftModalOpen={shiftModalOpen}
        onCloseShiftModal={() => setShiftModalOpen(false)}
        onSelectShift={(s) => {
          setPreferredShift(s);
          setShiftModalOpen(false);
        }}
        expModalOpen={expModalOpen}
        onCloseExpModal={() => setExpModalOpen(false)}
        expTitle={expTitle}
        setExpTitle={setExpTitle}
        expCompany={expCompany}
        setExpCompany={setExpCompany}
        expStartYear={expStartYear}
        setExpStartYear={setExpStartYear}
        expEndYear={expEndYear}
        setExpEndYear={setExpEndYear}
        expIsCurrent={expIsCurrent}
        setExpIsCurrent={setExpIsCurrent}
        expDesc={expDesc}
        setExpDesc={setExpDesc}
        onAddExperience={handleAddExperience}
        eduModalOpen={eduModalOpen}
        onCloseEduModal={() => setEduModalOpen(false)}
        eduDegree={eduDegree}
        setEduDegree={setEduDegree}
        eduInstitution={eduInstitution}
        setEduInstitution={setEduInstitution}
        eduYear={eduYear}
        setEduYear={setEduYear}
        onAddEducation={handleAddEducation}
        showPdfModal={showPdfModal}
        onClosePdfModal={() => setShowPdfModal(false)}
        candidateName={name}
        candidateRole={tradeSpecialization}
        pdfUrl={resumeUrl}
      />

      {/* Themed Discard Changes Confirmation Modal */}
      <ConfirmationModal
        visible={showDiscardModal}
        type="danger"
        title="Discard Profile Changes?"
        message="You have unsaved changes in your candidate profile. Are you sure you want to exit? All progress entered so far will be lost."
        cancelText="Keep Editing"
        confirmText="Discard & Exit"
        onClose={() => setShowDiscardModal(false)}
        onConfirm={() => {
          setShowDiscardModal(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
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
    paddingBottom: 28,
  },
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  prevBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  prevBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  nextBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
