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
import { KeyboardAwareScrollView, handleFocusInput } from '../../components/common/KeyboardAwareScrollView';
import { COLORS } from '../../constants/theme';
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
  const [currentStep, setCurrentStep] = useState(initialStepNum);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (routeStep && Number(routeStep) >= 1 && Number(routeStep) <= 4) {
      setCurrentStep(Number(routeStep));
    }
  }, [routeStep]);

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

  const handleConfirmBack = () => {
    Alert.alert(
      'Discard Profile Changes?',
      'Are you sure you want to go back? Any unsaved profile edits will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard & Leave', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
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

      // Primary: DocumentPicker allowing PDF documents and Image files (*/* or pdf & images)
      const docRes = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!docRes.canceled && docRes.assets && docRes.assets[0]) {
        const asset = docRes.assets[0];
        const fileName = asset.name || 'Candidate_Resume.pdf';
        const fileUri = asset.uri;

        const uploadRes = await candidateApi.uploadResume(fileUri, fileName);
        const returnedUrl = (uploadRes as any)?.data?.resumeUrl || (uploadRes as any)?.data?.url || fileUri;

        setResumeUrl(returnedUrl);
        setResumeName(fileName);
        showToast('Resume file attached successfully!', 'success');
        return;
      }
    } catch (docErr) {
      console.warn('DocumentPicker notice, trying ImagePicker fallback:', docErr);
      try {
        const imgRes = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });

        if (!imgRes.canceled && imgRes.assets[0]) {
          const asset = imgRes.assets[0];
          const fileName = asset.fileName || 'Candidate_Resume_Photo.jpg';
          const base64Data = asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri;

          const uploadRes = await candidateApi.uploadResume(base64Data, fileName);
          const returnedUrl = (uploadRes as any)?.data?.resumeUrl || (uploadRes as any)?.data?.url || base64Data;

          setResumeUrl(returnedUrl);
          setResumeName(fileName);
          showToast('Resume image attached!', 'success');
        }
      } catch (imgErr) {
        Alert.alert('Upload Error', 'Failed to attach resume document or image.');
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

  const handleAddEducation = () => {
    if (!eduDegree.trim() || !eduInstitution.trim()) {
      Alert.alert('Validation Error', 'Degree/Certificate and School/College are required.');
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
        expDuration={expDuration}
        setExpDuration={setExpDuration}
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
