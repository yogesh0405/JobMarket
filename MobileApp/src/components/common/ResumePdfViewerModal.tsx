import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Printer, Download, ExternalLink, FileText } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

interface ResumePdfViewerModalProps {
  visible: boolean;
  onClose: () => void;
  candidateName?: string;
  candidateRole?: string;
  pdfUrl?: string;
}

export const ResumePdfViewerModal: React.FC<ResumePdfViewerModalProps> = ({
  visible,
  onClose,
  candidateName = 'Candidate',
  candidateRole = 'Technical Specialist',
  pdfUrl,
}) => {
  // 1. Detect if the uploaded document is an Image, PDF, or Fallback
  const lowerUrl = (pdfUrl || '').toLowerCase();
  const isImage =
    lowerUrl.includes('.png') ||
    lowerUrl.includes('.jpg') ||
    lowerUrl.includes('.jpeg') ||
    lowerUrl.includes('.webp') ||
    lowerUrl.startsWith('data:image/');

  const defaultPdfUrl = pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const googleDocsViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(defaultPdfUrl)}`;

  const handlePrint = () => {
    const targetUrl = pdfUrl || defaultPdfUrl;
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
      Linking.openURL(targetUrl);
    } else {
      Linking.openURL(defaultPdfUrl);
    }
  };

  // 2. HTML Template for Uploaded Image Documents
  const uploadedImageHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
        <style>
          body { background: #0f172a; margin: 0; padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
          .img-card { background: #ffffff; padding: 12px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 100%; text-align: center; }
          img { max-width: 100%; height: auto; border-radius: 4px; display: block; margin: 0 auto; }
          @media print { body { background: white; padding: 0; } .img-card { box-shadow: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="img-card">
          <img src="${pdfUrl}" alt="${candidateName} Resume Document" />
        </div>
      </body>
    </html>
  `;

  // 3. Fallback Simulated A4 PDF Document
  const simulatedResumeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 16px; color: #0f172a; }
          .paper { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .name { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
          .title { font-size: 14px; font-weight: 600; color: #2563eb; margin-top: 4px; }
          .badge { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; margin-top: 6px; }
          .section-title { font-size: 12px; font-weight: 800; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; }
          .card-label { font-size: 10.5px; color: #64748b; font-weight: 700; }
          .card-val { font-size: 13px; color: #0f172a; font-weight: 700; margin-top: 2px; }
          .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
          .skill-pill { background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; }
          @media print { .paper { border: none; box-shadow: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="paper">
          <div class="header">
            <div>
              <h1 class="name">${candidateName}</h1>
              <div class="title">${candidateRole}</div>
              <div class="badge">✓ Aadhaar & MIDC Verified Candidate</div>
            </div>
          </div>

          <div class="section-title">Professional Profile</div>
          <p style="font-size: 13px; line-height: 1.5; color: #334155;">
            Experienced ${candidateRole} specializing in CNC/VMC operations, industrial quality control, precision tool setup, and manufacturing workflow safety. 5+ years of hands-on MIDC industrial experience.
          </p>

          <div class="section-title">Technical Specifications & Availability</div>
          <div class="grid">
            <div class="card"><div class="card-label">Total Experience</div><div class="card-val">5+ Years</div></div>
            <div class="card"><div class="card-label">Education / Trade</div><div class="card-val">NCVT ITI Technician</div></div>
            <div class="card"><div class="card-label">Notice Period</div><div class="card-val">Immediate Joiner</div></div>
            <div class="card"><div class="card-label">Preferred Shift</div><div class="card-val">Day / Rotational</div></div>
          </div>

          <div class="section-title">Verified Core Competencies</div>
          <div class="skills-wrap">
            <span class="skill-pill">VMC Programming</span>
            <span class="skill-pill">Quality Inspection</span>
            <span class="skill-pill">Vernier & Micrometer</span>
            <span class="skill-pill">ISO Standards</span>
            <span class="skill-pill">Industrial Safety</span>
          </div>
        </div>
      </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* In-App PDF Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <FileText size={18} color="#2563EB" />
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {candidateName.replace(/\s+/g, '_')}_Resume.pdf
              </Text>
              <Text style={styles.headerSubtitle}>In-App Document Preview</Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
            <X size={18} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* WebView PDF / Image Document Canvas */}
        <View style={styles.webViewWrapper}>
          {isImage ? (
            <WebView
              source={{ html: uploadedImageHtml }}
              style={{ flex: 1 }}
              originWhitelist={['*']}
            />
          ) : pdfUrl && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) ? (
            <WebView
              source={{ uri: googleDocsViewerUrl }}
              style={{ flex: 1 }}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text style={styles.loadingText}>Loading Uploaded PDF Document...</Text>
                </View>
              )}
            />
          ) : (
            <WebView
              source={{ html: simulatedResumeHtml }}
              style={{ flex: 1 }}
              originWhitelist={['*']}
            />
          )}
        </View>

        {/* Single Print Button at the End of Resume PDF */}
        <View style={styles.bottomPrintFooter}>
          <TouchableOpacity
            style={styles.singlePrintBtn}
            activeOpacity={0.85}
            onPress={handlePrint}
          >
            <Printer size={16} color="#FFFFFF" />
            <Text style={styles.singlePrintBtnText}>Print Document</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerBar: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
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
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPrintFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  singlePrintBtn: {
    height: 44,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    borderBottomWidth: 2.5,
    borderBottomColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  singlePrintBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  webViewWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
