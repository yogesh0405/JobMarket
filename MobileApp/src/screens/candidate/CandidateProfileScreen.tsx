import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { ProfileSkeleton } from '../../components/common/SkeletonLoader';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { COLORS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CandidateProfileHeroCard } from './components/CandidateProfileHeroCard';
import { CandidateProfileExperienceSection } from './components/CandidateProfileExperienceSection';

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

interface Props {
  navigation: any;
  route?: any;
}

export const CandidateProfileScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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

  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [experience, setExperience] = useState<any[]>(Array.isArray(user?.experience) ? (user?.experience as any[]) : []);
  const [education, setEducation] = useState<any[]>(Array.isArray(user?.education) ? (user?.education as any[]) : []);

  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setHeadline(user?.headline || '');
    setLocation(user?.location || '');
    setPhone(user?.phone || '');
    setBio(user?.bio || '');
    setSkills(user?.skills || []);
    setExperience(Array.isArray(user?.experience) ? (user?.experience as any[]) : []);
    setEducation(Array.isArray(user?.education) ? (user?.education as any[]) : []);
  }, [user]);

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

  const handlePickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showToast('Gallery permission is required to update photo', 'error');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!res.canceled && res.assets[0]) {
        setUploadingPhoto(true);
        const file = res.assets[0];
        if (!file.base64) {
          showToast('Could not read image file. Please try selecting a different photo.', 'error');
          return;
        }

        const base64Data = `data:image/webp;base64,${file.base64}`;

        try {
          const apiRes = await candidateApi.uploadProfilePicture(base64Data);
          const finalUrl = apiRes?.data?.url || base64Data;
          await updateUserProfile({
            profile_picture_url: finalUrl,
            profilePictureUrl: finalUrl,
            avatar_url: finalUrl,
            avatarUrl: finalUrl,
            avatar: finalUrl,
          } as any);

          await refreshUser().catch(() => {});
          showToast('Profile picture updated successfully', 'success');
        } catch (err: any) {
          console.error('Profile photo upload error:', err);
          showToast(err?.message || 'Failed to upload profile picture to server', 'error');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (e: any) {
      setUploadingPhoto(false);
      showToast(e.message || 'Failed to pick image', 'error');
    }
  };

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

      <ScrollView
        contentContainerStyle={[styles.scrollContentBody, { paddingBottom: Math.max(insets.bottom + 90, 120) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        <CandidateProfileHeroCard
          user={user}
          name={name}
          headline={headline}
          tradeSpecialization={tradeSpecialization}
          customTrade={customTrade}
          isOtherSelected={isOtherSelected}
          location={location}
          phone={phone}
          bio={bio}
          experience={experience}
          skills={skills}
          education={education}
          resumeUrl={resumeUrl}
          profilePhotoUrl={profilePhotoUrl}
          onPickPhoto={handlePickPhoto}
          onEditPress={() => navigation.navigate('CandidateEditProfile')}
        />

        <CandidateProfileExperienceSection
          skills={skills}
          experience={experience}
          education={education}
          resumeUrl={resumeUrl}
          resumeName={resumeName}
          onOpenPdf={() => setShowPdfModal(true)}
        />
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
    backgroundColor: '#F7F7F7',
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
});
