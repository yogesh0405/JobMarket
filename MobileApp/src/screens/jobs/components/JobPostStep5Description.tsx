import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Keyboard,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {
  FileText,
  ArrowLeft,
  ListChecks,
  Send,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

interface JobPostStep5DescriptionProps {
  description: string;
  setDescription: (val: string) => void;
  showResponsibilities: boolean;
  setShowResponsibilities: (val: boolean) => void;
  responsibilities: string;
  setResponsibilities: (val: string) => void;
  showRequirements: boolean;
  setShowRequirements: (val: boolean) => void;
  requirements: string;
  setRequirements: (val: string) => void;
  title?: string;
  industry?: string;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  isRejected?: boolean;
  error?: string | null;
  bottomInset: number;
}

export const JobPostStep5Description: React.FC<JobPostStep5DescriptionProps> = ({
  description,
  setDescription,
  showResponsibilities,
  setShowResponsibilities,
  responsibilities,
  setResponsibilities,
  showRequirements,
  setShowRequirements,
  requirements,
  setRequirements,
  title = '',
  industry = '',
  onSubmit,
  onBack,
  loading,
  isRejected = false,
  error = null,
  bottomInset,
}) => {
  const textInputRef = useRef<TextInput>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAdvancedBullets, setShowAdvancedBullets] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'structured'>('description');

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const height = e?.endCoordinates?.height || 0;
      setKeyboardHeight(height);
      setIsKeyboardActive(true);
      setIsTyping(true);
    };

    const onHide = () => {
      setKeyboardHeight(0);
      setIsKeyboardActive(false);
      setIsTyping(false);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const roleName = title ? title.trim() : 'Candidate';
  const industryName = industry ? industry.trim() : 'Manufacturing';

  const isValid = description.trim().length >= 5;

  return (
    <View style={styles.fullPageContainer}>
      {/* Top Header Card */}
      <View style={styles.topHeaderCard}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircle}>
            <FileText size={18} color={COLORS.primary} strokeWidth={2.5} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerMainTitle}>Job Description</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {roleName} • {industryName}
            </Text>
          </View>
        </View>
      </View>

      {/* Mode Switcher (Main Description vs Structured Responsibilities) */}
      <View style={styles.modeTabBar}>
        <TouchableOpacity
          style={[styles.modeTabBtn, activeTab === 'description' && styles.modeTabBtnActive]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('description')}
        >
          <FileText size={13} color={activeTab === 'description' ? COLORS.primary : '#64748B'} />
          <Text style={[styles.modeTabBtnText, activeTab === 'description' && styles.modeTabBtnTextActive]}>
            Description
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTabBtn, activeTab === 'structured' && styles.modeTabBtnActive]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('structured')}
        >
          <ListChecks size={13} color={activeTab === 'structured' ? COLORS.primary : '#64748B'} />
          <Text style={[styles.modeTabBtnText, activeTab === 'structured' && styles.modeTabBtnTextActive]}>
            Key Responsibilities & Requirements
            {(showResponsibilities || showRequirements) && ' (Active)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Full-Page Canvas Area */}
      {activeTab === 'description' ? (
        <View style={styles.editorBox}>
          <TextInput
            ref={textInputRef}
            style={styles.fullPageTextInput}
            multiline
            scrollEnabled
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            onFocus={() => {
              setIsTyping(true);
              setIsKeyboardActive(true);
            }}
            onBlur={() => {
              setIsTyping(false);
              setIsKeyboardActive(false);
            }}
            placeholder="Provide a comprehensive job description detailing day-to-day operations, workshop responsibilities, line management, reporting hierarchy, and candidate expectations..."
            placeholderTextColor="#94A3B8"
            autoCapitalize="sentences"
            autoCorrect
          />
        </View>
      ) : (
        <ScrollView
          style={styles.structuredScroll}
          contentContainerStyle={styles.structuredScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Key Responsibilities Block */}
          <View style={styles.structuredCard}>
            <View style={styles.structuredHeaderRow}>
              <View style={styles.structuredTitleCol}>
                <Text style={styles.structuredTitle}>Key Responsibilities</Text>
                <Text style={styles.structuredSub}>Structured line-by-line tasks for candidate summary</Text>
              </View>
              <Switch
                value={showResponsibilities}
                onValueChange={(val) => {
                  setShowResponsibilities(val);
                  if (!val) setResponsibilities('');
                }}
                trackColor={{ true: COLORS.primary }}
              />
            </View>

            {showResponsibilities && (
              <TextInput
                style={styles.structuredInput}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={responsibilities}
                onChangeText={setResponsibilities}
                onFocus={() => {
                  setIsTyping(true);
                  setIsKeyboardActive(true);
                }}
                onBlur={() => {
                  setIsTyping(false);
                  setIsKeyboardActive(false);
                }}
                placeholder={`Operate CNC machine per daily job card\nPerform first-piece quality checks\nMaintain shift output log`}
                placeholderTextColor="#94A3B8"
              />
            )}
          </View>

          {/* Key Requirements Block */}
          <View style={styles.structuredCard}>
            <View style={styles.structuredHeaderRow}>
              <View style={styles.structuredTitleCol}>
                <Text style={styles.structuredTitle}>Candidate Requirements & Qualifications</Text>
                <Text style={styles.structuredSub}>Specific qualifications or certifications required</Text>
              </View>
              <Switch
                value={showRequirements}
                onValueChange={(val) => {
                  setShowRequirements(val);
                  if (!val) setRequirements('');
                }}
                trackColor={{ true: COLORS.primary }}
              />
            </View>

            {showRequirements && (
              <TextInput
                style={styles.structuredInput}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={requirements}
                onChangeText={setRequirements}
                onFocus={() => {
                  setIsTyping(true);
                  setIsKeyboardActive(true);
                }}
                onBlur={() => {
                  setIsTyping(false);
                  setIsKeyboardActive(false);
                }}
                placeholder={`ITI / Diploma in Mechanical or Fitter Trade\n1+ year practical shopfloor experience\nKnowledge of micrometers and vernier calipers`}
                placeholderTextColor="#94A3B8"
              />
            )}
          </View>
        </ScrollView>
      )}

      {/* Sticky Bottom Action Bar with Back and Submit Job (Stuck to bottom and never gets up while typing) */}
      {!isTyping && !isKeyboardActive && (
        <View style={[styles.bottomActionBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.85}
            onPress={onBack}
          >
            <ArrowLeft size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
            activeOpacity={0.88}
            disabled={!isValid || loading}
            onPress={onSubmit}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {isRejected ? 'Resubmit for Approval' : 'Submit Job'}
                </Text>
                <Send size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullPageContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeaderCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  modeTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  modeTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 6,
  },
  modeTabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  modeTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  editorBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  fullPageTextInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#0F172A',
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  structuredScroll: {
    flex: 1,
  },
  structuredScrollContent: {
    padding: 12,
    gap: 12,
  },
  structuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  structuredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  structuredTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  structuredTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  structuredSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  structuredInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
    minHeight: 100,
    marginTop: 6,
  },
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 4,
  },
  backBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  submitBtn: {
    flex: 1.5,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
