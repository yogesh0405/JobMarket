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
} from 'react-native';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUpCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { COLORS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { isRemoteHttpUrl } from '../../utils/fileUploadHelper';
import { extractCandidateResume } from '../../utils/fileUtils';

interface Props {
  navigation: any;
}

export const CandidateResumeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; size?: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isPublic, setIsPublic] = useState(user?.isResumePublic !== false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showReplaceMode, setShowReplaceMode] = useState(false);
  const [confirmModalState, setConfirmModalState] = useState<{ show: boolean; targetState: boolean } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const extracted = extractCandidateResume(user);
  const resumeUrl = extracted.url || null;
  const resumeName = extracted.name;

  const rawDate = extracted.uploadedAt || (user as any)?.updated_at || (user as any)?.updatedAt || (user as any)?.created_at || (user as any)?.createdAt;
  const parsedDate = rawDate && !isNaN(new Date(rawDate).getTime()) ? new Date(rawDate) : null;
  const uploadDateStr = parsedDate ? parsedDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : '29 Aug 2026';

  const handlePickDocument = async () => {
    try {
      // 1. Try DocumentPicker for PDF documents or images
      const docRes = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (docRes.canceled) return;

      if (docRes.assets && docRes.assets[0]) {
        const asset = docRes.assets[0];
        const fileName = asset.name || 'Candidate_Resume.pdf';
        const fileUri = asset.uri;
        const fileSize = asset.size;

        if (fileSize && fileSize > 5 * 1024 * 1024) {
          showToast('File size must be under 5MB', 'error');
          return;
        }

        setSelectedFile({ uri: fileUri, name: fileName, size: fileSize });
      }
    } catch (docErr) {
      console.warn('DocumentPicker notice on Resume screen, trying ImagePicker:', docErr);
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

        if (!result.canceled && result.assets && result.assets[0]) {
          const file = result.assets[0];
          const fileName = file.fileName || 'Candidate_Resume_Photo.jpg';
          const fileInput = file.base64
            ? `data:${file.mimeType || 'image/jpeg'};base64,${file.base64}`
            : file.uri;
          const fileSize = file.fileSize;

          if (fileSize && fileSize > 5 * 1024 * 1024) {
            showToast('File size must be under 5MB', 'error');
            return;
          }

          setSelectedFile({ uri: fileInput, name: fileName, size: fileSize });
        }
      } catch (e: any) {
        showToast(e.message || 'Error selecting resume file', 'error');
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      showToast('Please tap above to choose a resume document first', 'warning');
      return;
    }

    let progressTimer: any = null;
    try {
      setUploading(true);
      setUploadProgress(15);

      progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 88) return prev;
          return prev + Math.floor(Math.random() * 14 + 8);
        });
      }, 250);

      const res = await candidateApi.uploadResume(selectedFile.uri, selectedFile.name);
      if (progressTimer) clearInterval(progressTimer);
      setUploadProgress(100);

      if (res.success && res.data?.url && isRemoteHttpUrl(res.data.url)) {
        await refreshUser();
        setTimeout(() => {
          setSelectedFile(null);
          setShowReplaceMode(false);
          setUploading(false);
          setUploadProgress(0);
          showToast('Resume document uploaded successfully! 🎉', 'success');
        }, 350);
      } else {
        setUploading(false);
        setUploadProgress(0);
        showToast(res.message || 'Failed to upload resume document', 'error');
      }
    } catch (err: any) {
      if (progressTimer) clearInterval(progressTimer);
      setUploading(false);
      setUploadProgress(0);
      showToast(err.message || 'Failed to upload resume', 'error');
    }
  };

  const handleDeleteResume = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      const res = await candidateApi.deleteResume();
      setDeleting(false);
      if (res.success) {
        await refreshUser();
        setSelectedFile(null);
        setShowReplaceMode(false);
        showToast('Resume document removed successfully', 'info');
      } else {
        showToast(res.message || 'Failed to delete resume', 'error');
      }
    } catch (e: any) {
      setDeleting(false);
      showToast(e.message || 'Error deleting resume', 'error');
    }
  };

  const handleRequestToggle = (targetState: boolean) => {
    setConfirmModalState({ show: true, targetState });
  };

  const handleConfirmToggleVisibility = async () => {
    if (!confirmModalState) return;
    const targetState = confirmModalState.targetState;
    setConfirmModalState(null);
    setUpdatingVisibility(true);
    try {
      await candidateApi.toggleResumeVisibility(targetState);
      setIsPublic(targetState);
      showToast(
        targetState 
          ? 'Recruiter Visibility enabled! Your resume is now public to verified recruiters.' 
          : 'Recruiter Visibility disabled. Your resume is now private.',
        'info'
      );
    } catch (e) {
      showToast('Failed to update recruiter visibility', 'error');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const handleViewResume = () => {
    if (resumeUrl) {
      setShowPdfModal(true);
    } else {
      showToast('No uploaded resume document found', 'warning');
    }
  };

  const hasActiveResume = !!resumeUrl;
  const isViewingExisting = hasActiveResume && !showReplaceMode;

  return (
    <View style={styles.container}>
      <Header
        title={isViewingExisting ? 'My Resume' : 'Upload Resume'}
        onBack={() => navigation.goBack()}
        hideRightActions={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Resume Card */}
        <View style={styles.cardContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.cardMainTitle}>
              {isViewingExisting ? 'My Resume' : 'Upload Resume'}
            </Text>
            {!isViewingExisting && showReplaceMode ? (
              <TouchableOpacity onPress={() => { setShowReplaceMode(false); setSelectedFile(null); }}>
                <Text style={styles.cancelReplaceText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.cardSubtitle}>
            Please upload your updated resume document to increase job application response rates.
          </Text>

          {isViewingExisting ? (
            <View style={styles.activeFileCardWrapper}>
              {/* File Info Row */}
              <View style={styles.activeFileInfoRow}>
                <View style={styles.fileIconSquare}>
                  <FileText size={22} color={COLORS.primary} strokeWidth={2.2} />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.fileNameText} numberOfLines={1}>{resumeName}</Text>
                  <Text style={styles.fileSizeText}>
                    {user?.resume?.size || '0.25 MB'} • Uploaded on {uploadDateStr}
                  </Text>
                </View>
              </View>

              {/* Thin Divider */}
              <View style={styles.activeFileDivider} />

              {/* Action Buttons Row */}
              <View style={styles.activeFileActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.viewActionBtn}
                  onPress={handleViewResume}
                >
                  <Eye size={15} color={COLORS.primary} strokeWidth={2.2} />
                  <Text style={styles.viewActionBtnText}>View Resume</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.deleteActionBtn}
                  onPress={handleDeleteResume}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <>
                      <Trash2 size={15} color="#DC2626" strokeWidth={2.2} />
                      <Text style={styles.deleteActionBtnText}>Delete Resume</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : !selectedFile ? (
            /* Dashed Upload Dropzone Box (Exact match from Web/Image) */
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.dropzoneBox}
              onPress={handlePickDocument}
            >
              <View style={styles.uploadIconSquare}>
                <UploadCloud size={24} color={COLORS.primary} strokeWidth={2.2} />
              </View>
              <Text style={styles.dropzoneTitle}>Upload Your Resume</Text>
              <Text style={styles.dropzoneDesc}>
                Drag & drop your file here, or <Text style={styles.browseLinkText}>browse</Text>
              </Text>
              <View style={styles.formatPill}>
                <Text style={styles.formatPillText}>Supports PDF, DOC, DOCX, JPG, PNG (Max 5MB)</Text>
              </View>
            </TouchableOpacity>
          ) : (
            /* Selected File Preview Box & Progress Bar */
            <View style={{ gap: 10 }}>
              <View style={styles.selectedFileBox}>
                <View style={styles.fileIconSquare}>
                  <FileText size={22} color={COLORS.primary} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.fileNameText} numberOfLines={1}>{selectedFile.name}</Text>
                  <Text style={styles.fileSizeText}>
                    {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload` : 'Ready to upload'}
                  </Text>
                </View>
                {!uploading && (
                  <TouchableOpacity
                    style={styles.removeFileBtn}
                    onPress={() => setSelectedFile(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={16} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Live Progress Bar when Uploading (Matching Web App) */}
              {uploading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.progressStatusText}>
                      {uploadProgress < 30
                        ? 'Saving...'
                        : uploadProgress <= 55
                        ? 'Securing & Saving...'
                        : uploadProgress <= 85
                        ? 'Get higher selection chances..'
                        : 'Almost there'}
                    </Text>
                    <Text style={styles.progressPercentText}>{uploadProgress}%</Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons Row (Skip & Submit - Exact match) */}
          {!isViewingExisting && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.skipBtn}
                onPress={() => navigation.goBack()}
                disabled={uploading}
              >
                <Text style={styles.skipBtnText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.submitBtn,
                  selectedFile && !uploading ? styles.submitBtnActive : styles.submitBtnDisabled
                ]}
                onPress={handleUploadSubmit}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Saving ({uploadProgress}%)...</Text>
                  </View>
                ) : (
                  <>
                    <ArrowUpCircle size={16} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.submitBtnText}>Submit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recruiter Search Visibility Toggle (Always visible below main card) */}
        <View style={styles.cardContainer}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                {isPublic ? <Eye size={16} color={COLORS.primary} /> : <EyeOff size={16} color="#64748B" />}
                <Text style={styles.toggleTitle}>Recruiter Search Visibility</Text>
              </View>
              <Text style={styles.toggleDesc}>
                {isPublic
                  ? 'Your candidate profile & resume can be discovered by verified industrial recruiters.'
                  : 'Hidden from public recruiter search. Visible only when you submit job applications.'}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={handleRequestToggle}
              disabled={updatingVisibility}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={isPublic ? COLORS.primary : '#94A3B8'}
            />
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNoteContainer}>
          <Text style={styles.privacyNoteText}>
            🔒 Resume is encrypted and safely stored in compliance with candidate privacy guidelines.
          </Text>
        </View>
      </ScrollView>

      {/* Confirmation Modal for Visibility Toggle */}
      {confirmModalState?.show && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <View style={[
                styles.modalIconBox,
                { backgroundColor: confirmModalState.targetState ? '#EFF6FF' : '#FEF2F2', borderColor: confirmModalState.targetState ? '#DBEAFE' : '#FCA5A5' }
              ]}>
                {confirmModalState.targetState ? (
                  <Eye size={22} color={COLORS.primary} strokeWidth={2.2} />
                ) : (
                  <EyeOff size={22} color="#DC2626" strokeWidth={2.2} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {confirmModalState.targetState ? 'Enable Recruiter Visibility?' : 'Make Resume Private?'}
                </Text>
                <Text style={styles.modalDesc}>
                  {confirmModalState.targetState
                    ? 'Making your resume public allows verified industrial and factory recruiters to discover your profile and contact you directly for new job openings.'
                    : 'Your profile and resume will be hidden from direct candidate searches. Recruiters cannot discover you directly, but you can still apply to jobs manually.'}
                </Text>
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setConfirmModalState(null)}
                disabled={updatingVisibility}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: confirmModalState.targetState ? COLORS.primary : '#DC2626' }
                ]}
                onPress={handleConfirmToggleVisibility}
                disabled={updatingVisibility}
              >
                {updatingVisibility ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>
                    {confirmModalState.targetState ? 'Make Public' : 'Make Private'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Themed Confirmation Modal for Delete Resume */}
      {showDeleteModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                <Trash2 size={22} color="#DC2626" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Delete Resume Document?</Text>
                <Text style={styles.modalDesc}>
                  Are you sure you want to remove your uploaded resume? Verified recruiters won't be able to review your attached document, and employers will rely on your profile details.
                </Text>
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#DC2626' }]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Delete Resume</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 95,
  },

  /* Card Container */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
    lineHeight: 18,
  },
  cancelReplaceText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  activeStatusPill: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },

  /* Active File Card Wrapper (Matching Web Screenshot) */
  activeFileCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
  },
  activeFileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeFileDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  activeFileActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  viewActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 6,
    paddingVertical: 5.5,
    paddingHorizontal: 12,
  },
  viewActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    paddingVertical: 5.5,
    paddingHorizontal: 12,
  },
  deleteActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },

  /* Upload Dropzone Box (Exact match) */
  dropzoneBox: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconSquare: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dropzoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  dropzoneDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  browseLinkText: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  formatPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  formatPillText: {
    fontSize: 11.5,
    color: '#64748B',
  },

  /* Selected File Box */
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  fileSizeText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  removeFileBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Live Progress Bar */
  progressContainer: {
    marginTop: 4,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  /* Action Buttons Row */
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  skipBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  skipBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    minWidth: 110,
  },
  submitBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  /* Active File Box */
  activeFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  fileIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
    color: '#15803D',
    fontWeight: '700',
    marginTop: 1,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Recruiter Search Visibility Toggle */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  /* Privacy Note */
  privacyNoteContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  privacyNoteText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 15,
  },

  /* Visibility Confirmation Modal */
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    marginTop: 4,
  },
  modalCancelBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  modalConfirmBtn: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
