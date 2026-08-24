import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  Plus,
  Trash2,
  FileText,
  X,
  UploadCloud,
  ExternalLink,
} from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

interface CandidateEditStep4SkillsResumeProps {
  skills: string[];
  skillInput: string;
  setSkillInput: (val: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  resumeUrl: string;
  resumeName: string;
  uploadingResume: boolean;
  deletingResume: boolean;
  onPickResume: () => void;
  onDeleteResume: () => void;
  onOpenPdfModal: () => void;
  onFocusSkillInput?: (event: any) => void;
}

export const CandidateEditStep4SkillsResume: React.FC<CandidateEditStep4SkillsResumeProps> = ({
  skills,
  skillInput,
  setSkillInput,
  onAddSkill,
  onRemoveSkill,
  resumeUrl,
  resumeName,
  uploadingResume,
  deletingResume,
  onPickResume,
  onDeleteResume,
  onOpenPdfModal,
  onFocusSkillInput,
}) => {
  return (
    <View style={styles.masterEditCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardHeaderTitle}>Skills & Resume</Text>
          <Text style={styles.cardHeaderSub}>Add key technical skills & attach resume bio-data</Text>
        </View>
      </View>

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
              onFocus={onFocusSkillInput}
            />
            <TouchableOpacity style={styles.addSkillBtn} onPress={onAddSkill}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addSkillBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.skillsTagWrap}>
            {skills.map((sk) => (
              <View key={sk} style={styles.skillChipTag}>
                <Text style={styles.skillChipText}>{sk}</Text>
                <TouchableOpacity onPress={() => onRemoveSkill(sk)}>
                  <X size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.sectionDividerSlate} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>Attach Resume (PDF Document or Image Photo)</Text>
        </View>

        {resumeUrl ? (
          <View style={styles.resumeAttachedBox}>
            <FileText size={24} color={COLORS.primary} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.resumeAttachedName} numberOfLines={1}>{resumeName}</Text>
              <Text style={styles.resumeAttachedSub}>Resume File Attached & Live</Text>
            </View>

            <TouchableOpacity style={styles.viewPdfBtn} onPress={onOpenPdfModal}>
              <ExternalLink size={14} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.deletePdfBtn} onPress={onDeleteResume} disabled={deletingResume}>
              {deletingResume ? <ActivityIndicator size="small" color="#DC2626" /> : <Trash2 size={14} color="#DC2626" />}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadResumeBox} onPress={onPickResume} disabled={uploadingResume}>
            {uploadingResume ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <UploadCloud size={24} color={COLORS.primary} />
                <Text style={styles.uploadResumeTitle}>Tap to Upload PDF Document or Resume Photo</Text>
                <Text style={styles.uploadResumeSub}>Supports PDF documents & JPG / PNG images up to 10MB</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  masterEditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  sectionBlock: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
  },
  addSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addSkillBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skillsTagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillChipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  uploadResumeBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  uploadResumeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  uploadResumeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  resumeAttachedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
  },
  resumeAttachedName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  resumeAttachedSub: {
    fontSize: 11,
    color: '#64748B',
  },
  viewPdfBtn: {
    padding: 6,
  },
  deletePdfBtn: {
    padding: 6,
  },
});
