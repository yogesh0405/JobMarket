import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <Text style={styles.sectionCardTitle}>Skills</Text>
        </View>

        {skills.length > 0 ? (
          <View style={styles.skillsTagRow}>
            {skills.map((s, idx) => (
              <View key={idx} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{s}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptySubText}>No key skills added yet.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <Text style={styles.sectionCardTitle}>Experience</Text>
        </View>

        <View style={{ marginTop: 8 }}>
          {experience.length === 0 ? (
            <Text style={styles.emptySubText}>No work experience entries added yet.</Text>
          ) : (
            experience.map((item, idx) => {
              const isCurrent = idx === 0;
              const itemSkills = Array.isArray(item.skills) ? item.skills : [];
              const achievementsList = Array.isArray(item.achievements) ? item.achievements : [];

              return (
                <View key={idx} style={styles.expTimelineRow}>
                  <View style={styles.expCardInnerBox}>
                    <View style={styles.expCardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.expCompanyNameText}>{item.company || 'Company'}</Text>
                        <Text style={styles.expRoleTitleText}>{item.title || 'Role Position'}</Text>
                      </View>
                      {isCurrent ? (
                        <View style={styles.currentRolePill}>
                          <Text style={styles.currentRolePillText}>Current Role</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.expMetaRow}>
                      {item.duration ? (
                        <View style={styles.expMetaItem}>
                          <Text style={styles.expMetaText}>{item.duration}</Text>
                        </View>
                      ) : null}
                      {item.location ? (
                        <View style={styles.expMetaItem}>
                          <Text style={styles.expMetaText}>{item.location}</Text>
                        </View>
                      ) : null}
                    </View>

                    {item.description ? <Text style={styles.expDescText}>{item.description}</Text> : null}

                    {achievementsList.length > 0 ? (
                      <View style={styles.expSubBlock}>
                        <View style={styles.expSubHeaderRow}>
                          <Text style={styles.expSubHeaderText}>Key Achievements</Text>
                        </View>
                        {achievementsList.map((ach: string, achIdx: number) => (
                          <View key={achIdx} style={styles.bulletRow}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText}>{ach}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {itemSkills.length > 0 ? (
                      <View style={styles.expSubBlock}>
                        <View style={styles.expSubHeaderRow}>
                          <Text style={styles.expSubHeaderText}>Technology & Skills</Text>
                        </View>
                        <View style={styles.expTechChipRow}>
                          {itemSkills.map((sk: string, skIdx: number) => (
                            <View key={skIdx} style={styles.expTechChip}>
                              <Text style={styles.expTechChipText}>{sk}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <Text style={styles.sectionCardTitle}>Education & ITI Certification</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          {education.length === 0 ? (
            <Text style={styles.emptySubText}>No education or ITI certificate added yet.</Text>
          ) : (
            education.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <View style={styles.innerCardItemSeparator} />}
                <View style={styles.timelineItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timelineRoleText}>{item.degree || 'Certificate'}</Text>
                    <Text style={styles.timelineCompanyText}>{item.institution || 'Institution'} • Passing Year: {item.year || '—'}</Text>
                  </View>
                </View>
              </React.Fragment>
            ))
          )}
        </View>
      </View>

      <View style={[styles.sectionCard, { marginBottom: 24 }]}>
        <View style={styles.sectionCardHeader}>
          <Text style={styles.sectionCardTitle}>Resume & Bio-Data Document</Text>
        </View>

        <View style={{ marginTop: 6 }}>
          {resumeUrl ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F172A' }} numberOfLines={1}>
                  {resumeName}
                </Text>
                <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '500', marginTop: 1 }}>
                  ✓ Document Attached & Live
                </Text>
              </View>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EFF6FF', borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' }}
                onPress={onOpenPdf}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>View PDF</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptySubText}>No resume document attached yet.</Text>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#B4C3D4',
    padding: 16,
    marginBottom: 10,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  emptySubText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  skillPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 10,
  },
  expTimelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  expCardInnerBox: {
    flex: 1,
    paddingVertical: 4,
    gap: 8,
  },
  expCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expCompanyNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  expRoleTitleText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  currentRolePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  currentRolePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  expMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
    marginTop: 2,
  },
  expMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expMetaText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
  expDescText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 17,
  },
  expSubBlock: {
    marginTop: 4,
    gap: 6,
  },
  expSubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expSubHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 16,
  },
  expTechChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  expTechChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  expTechChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  innerCardItemSeparator: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineRoleText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  timelineCompanyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
