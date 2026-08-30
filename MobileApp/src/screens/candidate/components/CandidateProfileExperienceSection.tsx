import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FileText, ExternalLink } from 'lucide-react-native';
import { COLORS, RADIUS } from '../../../constants/theme';

interface CandidateProfileExperienceSectionProps {
  skills: string[];
  experience: any[];
  education: any[];
  resumeUrl: string;
  resumeName: string;
  onOpenPdf: () => void;
}

export const CandidateProfileExperienceSection: React.FC<CandidateProfileExperienceSectionProps> = ({
  skills,
  experience,
  education,
  resumeUrl,
  resumeName,
  onOpenPdf,
}) => {
  return (
    <>
      {/* 1. SKILLS CARD */}
      <View style={styles.sectionCard}>
        <Text style={styles.serifCardTitle}>Skills & Expertise</Text>

        {skills.length > 0 ? (
          <View style={styles.skillsTagRow}>
            {skills.map((s, idx) => (
              <View key={idx} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{s}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptySubText}>No key skills added yet.</Text>
          </View>
        )}
      </View>

      {/* 2. WORK EXPERIENCE TIMELINE CARD (COMPACT / SMALL TEXT) */}
      <View style={styles.sectionCard}>
        <Text style={styles.serifCardTitle}>Work Experience</Text>

        <View style={{ marginTop: 2 }}>
          {experience.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptySubText}>No work experience entries added yet.</Text>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              <View style={styles.timelineVerticalBar} />

              {experience.map((item, idx) => {
                const isCurrent = idx === 0;
                const itemSkills = Array.isArray(item.skills) ? item.skills : [];
                const achievementsList = Array.isArray(item.achievements) ? item.achievements : [];
                const durationText = item.duration || '2020 - Present';
                const roleCompanyTitle = item.company ? `${item.title || 'Role'} at ${item.company}` : (item.title || 'Role Position');

                return (
                  <View key={idx} style={styles.timelineRow}>
                    <View style={styles.nodeCircleWrapper}>
                      <View style={styles.nodeDot} />
                    </View>

                    <View style={styles.timelineItemCard}>
                      <View style={styles.timelineCardHeaderRow}>
                        <Text style={styles.timelineYearText}>{durationText}</Text>
                        {isCurrent ? (
                          <View style={styles.currentRolePill}>
                            <Text style={styles.currentRolePillText}>Current Role</Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.timelineTitleText}>
                        {roleCompanyTitle}
                      </Text>

                      {item.location ? (
                        <Text style={styles.timelineSubText}>{item.location}</Text>
                      ) : null}

                      {item.description ? (
                        <Text style={styles.timelineDescText}>{item.description}</Text>
                      ) : null}

                      {achievementsList.length > 0 ? (
                        <View style={styles.expSubBlock}>
                          <Text style={styles.expSubHeaderText}>Key Achievements</Text>
                          {achievementsList.map((ach: string, achIdx: number) => (
                            <View key={achIdx} style={styles.bulletRow}>
                              <Text style={styles.bulletDot}>•</Text>
                              <Text style={styles.bulletText}>{ach}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      {itemSkills.length > 0 ? (
                        <View style={styles.expTechChipRow}>
                          {itemSkills.map((sk: string, skIdx: number) => (
                            <View key={skIdx} style={styles.expTechChip}>
                              <Text style={styles.expTechChipText}>{sk}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* 3. EDUCATION & QUALIFICATIONS TIMELINE CARD (COMPACT / SMALL TEXT) */}
      <View style={styles.sectionCard}>
        <Text style={styles.serifCardTitle}>Education & Qualifications</Text>

        <View style={{ marginTop: 2 }}>
          {education.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptySubText}>No education or ITI certificate added yet.</Text>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              <View style={styles.timelineVerticalBar} />

              {education.map((item, idx) => {
                const yearText = item.year ? `Class of ${item.year}` : (item.duration || 'Passing Year —');
                return (
                  <View key={idx} style={styles.timelineRow}>
                    <View style={styles.nodeCircleWrapper}>
                      <View style={styles.nodeDot} />
                    </View>

                    <View style={styles.timelineItemCard}>
                      <Text style={styles.timelineYearText}>{yearText}</Text>
                      <Text style={styles.timelineTitleText}>
                        {item.degree || 'Degree / ITI Certification'}
                      </Text>
                      <Text style={styles.timelineSubText}>
                        {item.institution || 'Institution / Board'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* 4. RESUME & BIO-DATA */}
      <View style={[styles.sectionCard, { marginBottom: 24 }]}>
        <Text style={styles.serifCardTitle}>Resume & Bio-Data</Text>

        <View style={{ marginTop: 2 }}>
          {resumeUrl ? (
            <View style={[styles.resumeCardBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }]}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.docIconBox}>
                  <FileText size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.textPrimary }} numberOfLines={1}>
                    {resumeName}
                  </Text>
                  <Text style={{ fontSize: 10, color: COLORS.success, fontWeight: '600', marginTop: 1 }}>
                    ✓ Document Attached
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.viewPdfBtn}
                onPress={onOpenPdf}
              >
                <Text style={styles.viewPdfBtnText}>View PDF</Text>
                <ExternalLink size={11} color={COLORS.textWhite} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptySubText}>No resume document attached yet.</Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  serifCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 4,
  },
  timelineVerticalBar: {
    position: 'absolute',
    left: 8,
    top: 12,
    bottom: 12,
    width: 1.5,
    backgroundColor: COLORS.slate300,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  nodeCircleWrapper: {
    width: 10,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.textPrimary,
  },
  timelineItemCard: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    padding: 10,
    gap: 3,
  },
  timelineCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  timelineYearText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  timelineTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  timelineSubText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  timelineDescText: {
    fontSize: 10.5,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },
  currentRolePill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  currentRolePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  emptyBox: {
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySubText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    backgroundColor: COLORS.slate50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  skillPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  expSubBlock: {
    marginTop: 4,
    gap: 3,
  },
  expSubHeaderText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    paddingLeft: 2,
  },
  bulletDot: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  expTechChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  expTechChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  expTechChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  resumeCardBox: {
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    padding: 12,
  },
  docIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.card,
  },
  viewPdfBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
});
