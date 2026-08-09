import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';

interface Props {
  navigation: any;
}

export const CandidateResumeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPublic, setIsPublic] = useState(user?.isResumePublic !== false);

  const [showPdfModal, setShowPdfModal] = useState(false);

  const rawResume = user?.resume;
  let parsedObj: any = null;
  if (typeof rawResume === 'object' && rawResume !== null) {
    parsedObj = rawResume;
  } else if (typeof rawResume === 'string') {
    try { parsedObj = JSON.parse(rawResume); } catch (_) {}
  }
  const resumeUrl = user?.resume_url || user?.resumeUrl || parsedObj?.url;
  const resumeName = user?.resumeName || parsedObj?.name || 'Candidate_BioData_Resume.jpg';

  const handlePickDocument = async () => {
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
        setUploading(true);
        const fileName = file.fileName || 'Resume_BioData.jpg';
        const base64Data = `data:image/jpeg;base64,${file.base64}`;

        const res = await candidateApi.uploadResume(base64Data, fileName);
        setUploading(false);

        if (res.success) {
          await refreshUser();
          showToast('Resume document uploaded successfully', 'success');
        } else {
          showToast(res.message || 'Failed to upload resume document', 'error');
        }
      }
    } catch (e: any) {
      setUploading(false);
      showToast(e.message || 'Error selecting resume file', 'error');
    }
  };

  const handleDeleteResume = async () => {
    Alert.alert(
      'Delete Resume Document?',
      'Are you sure you want to remove your uploaded resume? Employers will rely on your profile bio-data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Resume',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const res = await candidateApi.deleteResume();
              setDeleting(false);
              if (res.success) {
                await refreshUser();
                showToast('Resume removed successfully', 'info');
              } else {
                showToast(res.message || 'Failed to delete resume', 'error');
              }
            } catch (e: any) {
              setDeleting(false);
              showToast(e.message || 'Error deleting resume', 'error');
            }
          },
        },
      ]
    );
  };

  const handleToggleVisibility = async (val: boolean) => {
    setIsPublic(val);
    try {
      await candidateApi.toggleResumeVisibility(val);
      showToast(val ? 'Profile & Resume is Public for Employers' : 'Profile is Private', 'info');
    } catch (e) {
      // Ignore
    }
  };

  const handleViewResume = () => {
    if (resumeUrl) {
      setShowPdfModal(true);
    } else {
      showToast('No uploaded resume document found', 'warning');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Resume & Bio-Data Management" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.card3D}>
          <View style={styles.headerRow}>
            <FileText size={24} color="#2563EB" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Uploaded Resume Document</Text>
              <Text style={styles.cardSub}>PDF / Image file visible to verified industrial recruiters</Text>
            </View>
          </View>

          {resumeUrl ? (
            <View style={styles.resumeBox}>
              <View style={styles.fileIconSquare}>
                <FileText size={24} color="#2563EB" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fileNameText} numberOfLines={1}>{resumeName}</Text>
                <Text style={styles.fileStatusText}>Active Document Attached</Text>
              </View>

              <TouchableOpacity style={styles.viewBtn} onPress={handleViewResume}>
                <ExternalLink size={16} color="#2563EB" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteResume} disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Trash2 size={16} color="#DC2626" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <UploadCloud size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Resume File Uploaded</Text>
              <Text style={styles.emptyDesc}>Upload your latest PDF resume or bio-data document to increase application response rates.</Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.uploadBtn}
                onPress={handlePickDocument}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <UploadCloud size={16} color="#FFFFFF" />
                    <Text style={styles.uploadBtnText}>Upload Resume PDF / Image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Public Search Visibility Toggle */}
        <View style={styles.card3D}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {isPublic ? <Eye size={18} color="#2563EB" /> : <EyeOff size={18} color="#64748B" />}
                <Text style={styles.toggleTitle}>Recruiter Search Visibility</Text>
              </View>
              <Text style={styles.toggleDesc}>
                {isPublic
                  ? 'Your candidate profile & resume can be discovered by verified factory recruiters.'
                  : 'Your profile is hidden from direct candidate search searches.'}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={handleToggleVisibility}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={isPublic ? '#2563EB' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Generated Mobile Bio-Data Card */}
        <View style={styles.card3D}>
          <Text style={styles.cardTitle}>Generated Mobile Bio-Data Summary</Text>
          <Text style={styles.bioDesc}>
            Even without a PDF, your filled profile details (Trade Specialization, Experience, Education, Shift preferences) act as a complete digital bio-data for one-tap job applications.
          </Text>

          <View style={styles.bioSummaryBox}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>FULL NAME:</Text>
              <Text style={styles.summaryValue}>{user?.name || 'N/A'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>TRADE SPECIALIZATION:</Text>
              <Text style={styles.summaryValue}>{user?.tradeSpecialization || user?.trade_specialization || 'VMC / Industrial'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>PREFERRED SHIFT:</Text>
              <Text style={styles.summaryValue}>{user?.preferredShift || user?.preferred_shift || 'Day Shift'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>LOCATION:</Text>
              <Text style={styles.summaryValue}>{user?.location || 'MIDC Zone'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileLink}
            onPress={() => navigation.navigate('CandidateProfileTab')}
          >
            <Text style={styles.editProfileLinkText}>Edit Profile Bio-Data Details →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Resume Document Viewer Modal */}
      <ResumePdfViewerModal
        visible={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        candidateName={user?.name || 'Candidate'}
        candidateRole={user?.tradeSpecialization || user?.trade_specialization || 'Industrial Workforce'}
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
  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  resumeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 0,
    gap: 10,
  },
  fileIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  fileStatusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 1,
  },
  viewBtn: {
    padding: 6,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
    marginTop: 6,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  bioDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 17,
  },
  bioSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 0,
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  editProfileLink: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  editProfileLinkText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2563EB',
  },
});
