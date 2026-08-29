import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Download, ExternalLink, FileText, RefreshCw, AlertCircle } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { API_BASE_URL } from '../../api/client';
import { RADIUS } from '../../constants/theme';
import { resolveResumeUrl } from '../../utils/fileUtils';

export { resolveResumeUrl };

interface ResumePdfViewerModalProps {
  visible: boolean;
  onClose: () => void;
  candidateName?: string;
  candidateRole?: string;
  pdfUrl?: string | any;
}

export const ResumePdfViewerModal: React.FC<ResumePdfViewerModalProps> = ({
  visible,
  onClose,
  candidateName = 'Candidate',
  candidateRole = 'Resume',
  pdfUrl,
}) => {
  const [webViewError, setWebViewError] = useState(false);
  const [loading, setLoading] = useState(true);

  const targetDocUrl = resolveResumeUrl(pdfUrl);

  const isImage =
    (targetDocUrl &&
      (targetDocUrl.toLowerCase().endsWith('.jpg') ||
        targetDocUrl.toLowerCase().endsWith('.jpeg') ||
        targetDocUrl.toLowerCase().endsWith('.png') ||
        targetDocUrl.toLowerCase().endsWith('.webp') ||
        targetDocUrl.startsWith('data:image'))) ||
    (pdfUrl && typeof pdfUrl === 'object' && (pdfUrl as any).type === 'image');

  const googleDocsViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(targetDocUrl)}`;

  const handleOpenExternal = async () => {
    if (!targetDocUrl) {
      Alert.alert('Notice', 'No resume document URL available.');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(targetDocUrl);
      if (supported) {
        await Linking.openURL(targetDocUrl);
      } else {
        await Linking.openURL(targetDocUrl);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Unable to open file in external browser.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* In-App Document Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <View style={styles.docIconSquircle}>
              <FileText size={16} color="#1764E8" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {candidateName.replace(/\s+/g, '_')}_Resume{isImage ? '.png' : '.pdf'}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {candidateRole || 'Industrial Candidate'}
              </Text>
            </View>
          </View>

          {/* Header Action Buttons */}
          <View style={styles.headerRightActions}>
            {targetDocUrl ? (
              <TouchableOpacity
                style={styles.headerIconBtn}
                activeOpacity={0.7}
                onPress={handleOpenExternal}
              >
                <ExternalLink size={15} color="#475569" strokeWidth={2} />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={onClose}>
              <X size={16} color="#475569" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Viewer Body */}
        <View style={styles.bodyWrapper}>
          {isImage && targetDocUrl ? (
            <ScrollView
              contentContainerStyle={styles.imageScrollBody}
              maximumZoomScale={4}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={{ uri: targetDocUrl }}
                style={styles.fullImageDoc}
                resizeMode="contain"
                onLoadEnd={() => setLoading(false)}
              />
            </ScrollView>
          ) : targetDocUrl && !webViewError ? (
            <View style={{ flex: 1 }}>
              <WebView
                source={{
                  uri: targetDocUrl.startsWith('http')
                    ? googleDocsViewerUrl
                    : targetDocUrl,
                }}
                style={{ flex: 1 }}
                startInLoadingState={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setWebViewError(true);
                  setLoading(false);
                }}
                renderLoading={() => (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#1764E8" />
                    <Text style={styles.loadingText}>Loading Document Preview...</Text>
                  </View>
                )}
              />
            </View>
          ) : targetDocUrl && webViewError ? (
            /* Fallback Card if In-App Google Docs Viewer Fails */
            <View style={styles.fallbackCardWrapper}>
              <View style={styles.fallbackCard}>
                <View style={styles.fallbackIconSquircle}>
                  <FileText size={28} color="#1764E8" strokeWidth={2} />
                </View>
                <Text style={styles.fallbackTitle}>Resume Document Ready</Text>
                <Text style={styles.fallbackDesc}>
                  The candidate's uploaded resume is available. You can view or download it directly on your device.
                </Text>

                <TouchableOpacity
                  style={styles.primaryOpenBtn}
                  activeOpacity={0.8}
                  onPress={handleOpenExternal}
                >
                  <ExternalLink size={15} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.primaryOpenBtnText}>Open Document</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.retryBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    setWebViewError(false);
                    setLoading(true);
                  }}
                >
                  <RefreshCw size={13} color="#657796" strokeWidth={2} />
                  <Text style={styles.retryBtnText}>Retry In-App Preview</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Empty State */
            <View style={styles.noResumeBox}>
              <View style={styles.emptyIconSquircle}>
                <FileText size={28} color="#94A3B8" strokeWidth={1.75} />
              </View>
              <Text style={styles.noResumeTitle}>No Resume Uploaded</Text>
              <Text style={styles.noResumeSub}>
                The candidate has not uploaded an attachment yet.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Action Footer */}
        {targetDocUrl ? (
          <View style={styles.bottomFooter}>
            <TouchableOpacity
              style={styles.footerOpenExternalBtn}
              activeOpacity={0.8}
              onPress={handleOpenExternal}
            >
              <Download size={14} color="#1764E8" strokeWidth={2} />
              <Text style={styles.footerOpenExternalText}>Open / Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerCloseBtn}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={styles.footerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bottomFooter}>
            <TouchableOpacity
              style={styles.footerCloseBtnFull}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={styles.footerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  docIconSquircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102A5C',
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: '#657796',
    fontWeight: '500',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyWrapper: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  imageScrollBody: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
  },
  fullImageDoc: {
    width: '100%',
    height: '100%',
    minHeight: 500,
  },
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657796',
  },
  fallbackCardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fallbackCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  fallbackIconSquircle: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  fallbackTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#102A5C',
    textAlign: 'center',
  },
  fallbackDesc: {
    fontSize: 11.5,
    color: '#657796',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 16,
  },
  primaryOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    height: 38,
    backgroundColor: '#1764E8',
    borderRadius: 6,
  },
  primaryOpenBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
    height: 34,
    marginTop: 8,
  },
  retryBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#657796',
  },
  noResumeBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconSquircle: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noResumeTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#102A5C',
  },
  noResumeSub: {
    fontSize: 11.5,
    color: '#657796',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  bottomFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7EBF2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerOpenExternalBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerOpenExternalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1764E8',
  },
  footerCloseBtn: {
    height: 38,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCloseBtnFull: {
    flex: 1,
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCloseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
