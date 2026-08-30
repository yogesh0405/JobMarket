import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import {
  Phone,
  Mail,
  FileText,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Bus,
  Home,
  ExternalLink,
  GraduationCap,
} from 'lucide-react-native';
import { JobApplication } from '../../../types';
import { WhatsAppIcon } from '../../../components/common/WhatsAppIcon';
import { RADIUS } from '../../../constants/theme';
import { extractCandidateResume } from '../../../utils/fileUtils';

const parseStringOrObject = (val: any, fallback: string = 'Not Provided'): string => {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'string') return val.trim().length > 0 ? val.trim() : fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return fallback;
    const parsed = val.map((item) => parseStringOrObject(item, '')).filter(Boolean);
    return parsed.length > 0 ? parsed.join(' • ') : fallback;
  }
  if (typeof val === 'object') {
    if (val.title || val.company || val.duration || val.years) {
      const parts = [val.title, val.company, val.years ? `${val.years} Yrs` : val.duration].filter(Boolean);
      if (parts.length > 0) return parts.join(' - ');
    }
    if (val.degree || val.qualification || val.institution || val.college) {
      const parts = [val.degree || val.qualification, val.institution || val.college, val.year].filter(Boolean);
      if (parts.length > 0) return parts.join(' - ');
    }
    if (val.city || val.state || val.address || val.location) {
      const parts = [val.address || val.location, val.city, val.state].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }
    const values = Object.values(val).map((v) => parseStringOrObject(v, '')).filter(Boolean);
    return values.length > 0 ? values.join(' • ') : fallback;
  }
  return String(val);
};

interface ApplicantDetailCandidateTabProps {
  selectedApplicant: JobApplication | null;
  onOpenPdfModal: () => void;
  onSelectEmailTab: () => void;
}

export const ApplicantDetailCandidateTab: React.FC<ApplicantDetailCandidateTabProps> = ({
  selectedApplicant,
  onOpenPdfModal,
  onSelectEmailTab,
}) => {
  const user = selectedApplicant?.user as any;
  const resumeInfo = extractCandidateResume(selectedApplicant);

  const phone = typeof user?.phone === 'string' ? user.phone : '';
  const email = typeof user?.email === 'string' ? user.email : '';
  
  const location = user?.city
    ? `${parseStringOrObject(user.city)}, ${parseStringOrObject(user.state, 'Maharashtra')}`
    : parseStringOrObject(user?.location || user?.address, 'Chhatrapati Sambhajinagar');
  
  const trade = parseStringOrObject(user?.trade_specialization || user?.headline, 'Industrial Technical Specialist');
  const shift = parseStringOrObject(user?.preferred_shift || user?.shift_preference || user?.shift_timing, 'Rotational / Day Shift');
  const midcZone = parseStringOrObject(user?.midc_zone || user?.midcZone || user?.preferred_location, 'Waluj / Shendra MIDC');
  const requiresBus = user?.requires_bus || user?.requiresBus;
  const requiresAccommodation = user?.requires_accommodation || user?.requiresAccommodation;

  const bioText = typeof user?.bio === 'string' ? user.bio.trim() : (typeof user?.about === 'string' ? user.about.trim() : '');

  const skillsList: string[] = Array.isArray(user?.skills)
    ? user.skills.map((s: any) => parseStringOrObject(s, '')).filter((s: string) => s.length > 0)
    : (typeof user?.skills === 'string' && user.skills.trim() ? [user.skills.trim()] : []);

  // Normalize Work Experience list
  let experienceList: any[] = [];
  let rawExp = user?.experience ?? (selectedApplicant as any)?.experience;
  if (typeof rawExp === 'string' && (rawExp.startsWith('[') || rawExp.startsWith('{'))) {
    try {
      rawExp = JSON.parse(rawExp);
    } catch (_) {}
  }
  if (Array.isArray(rawExp) && rawExp.length > 0) {
    experienceList = rawExp;
  } else if (typeof rawExp === 'object' && rawExp) {
    experienceList = [rawExp];
  } else if (user?.experience || user?.experience_years != null || user?.current_company || user?.trade_specialization) {
    experienceList = [
      {
        title: user?.trade_specialization || user?.headline || 'Industrial Technical Specialist',
        company: user?.current_company || user?.company_name || 'Industrial Engineering Works',
        duration: user?.experience_years != null ? `${user.experience_years} Years Experience` : (typeof user?.experience === 'string' ? user.experience : '2022 - Present'),
        description: user?.bio || user?.role_summary || '',
        isCurrent: true,
      },
    ];
  }

  // Normalize Education list
  let educationList: any[] = [];
  let rawEdu = user?.education ?? (selectedApplicant as any)?.education;
  if (typeof rawEdu === 'string' && (rawEdu.startsWith('[') || rawEdu.startsWith('{'))) {
    try {
      rawEdu = JSON.parse(rawEdu);
    } catch (_) {}
  }
  if (Array.isArray(rawEdu) && rawEdu.length > 0) {
    educationList = rawEdu;
  } else if (typeof rawEdu === 'object' && rawEdu) {
    educationList = [rawEdu];
  } else if (user?.highest_qualification || user?.education || user?.degree) {
    educationList = [
      {
        degree: user?.highest_qualification || user?.degree || (typeof user?.education === 'string' ? user.education : 'ITI / Technical Diploma'),
        institution: user?.institute_name || user?.college || 'Government Industrial Training Institute (ITI)',
        year: user?.passing_year || user?.graduation_year || '2022',
      },
    ];
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        {/* 1. Quick Contact Action Bar */}
        <View style={styles.contactActionBarInlineRow}>
          <TouchableOpacity
            style={[styles.contactPillBtn, { flex: 1 }]}
            activeOpacity={0.8}
            onPress={() => {
              if (phone) Linking.openURL(`tel:${phone}`);
              else Alert.alert('Notice', 'Phone number not provided.');
            }}
          >
            <Phone size={13} color="#1764E8" />
            <Text style={[styles.contactPillText, { color: '#1764E8' }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactPillBtn, { flex: 1.3 }]}
            activeOpacity={0.8}
            onPress={() => {
              const cleanedPhone = phone?.replace(/[^0-9]/g, '');
              if (cleanedPhone) Linking.openURL(`https://wa.me/${cleanedPhone}`);
              else Alert.alert('Notice', 'WhatsApp number not provided.');
            }}
          >
            <WhatsAppIcon size={14} color="#16A34A" />
            <Text style={[styles.contactPillText, { color: '#15803D' }]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactPillBtn, { flex: 1 }]}
            activeOpacity={0.8}
            onPress={() => {
              if (email) Linking.openURL(`mailto:${email}`);
              else onSelectEmailTab();
            }}
          >
            <Mail size={13} color="#DC2626" />
            <Text style={[styles.contactPillText, { color: '#DC2626' }]}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactPillBtn, { flex: 1.25, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}
            activeOpacity={0.8}
            onPress={() => {
              if (resumeInfo.url) {
                onOpenPdfModal();
              } else {
                Alert.alert('Notice', "Candidate hasn't uploaded the resume yet.");
              }
            }}
          >
            <FileText size={13} color="#1764E8" />
            <Text style={[styles.contactPillText, { color: '#1764E8' }]}>Resume</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Candidate Bio Summary */}
        {bioText ? (
          <>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionHeadingTitle}>ABOUT CANDIDATE</Text>
            <Text style={styles.infoSectionBody}>{bioText}</Text>
          </>
        ) : null}

        {/* 3. WORK EXPERIENCE TIMELINE */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeadingTitle}>WORK EXPERIENCE</Text>

        {experienceList.length > 0 ? (
          <View style={styles.timelineContainer}>
            {experienceList.map((item, idx) => {
              const isCurrent = idx === 0 || item.isCurrent;
              const isLast = idx === experienceList.length - 1;
              const durationText = item.duration || (item.years ? `${item.years} Yrs Experience` : '2021 - Present');
              const roleTitle = item.title || 'Technical Specialist';
              const companyName = item.company || 'Industrial Company';
              const displayHeading = companyName ? `${roleTitle} at ${companyName}` : roleTitle;
              const descText = item.description || roleTitle;

              return (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelineLeftCol}>
                    {!isLast ? <View style={styles.timelineConnectorLine} /> : null}
                    <View style={styles.timelineDot} />
                  </View>

                  <View style={styles.timelineCard}>
                    <View style={styles.timelineCardHeaderRow}>
                      <Text style={[styles.timelineDurationText, { flexShrink: 1 }]} numberOfLines={1}>
                        {durationText}
                      </Text>
                      {isCurrent ? (
                        <View style={styles.currentRoleBadge}>
                          <Text style={styles.currentRoleBadgeText}>Current Role</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.timelineMainTitle}>{displayHeading}</Text>
                    {descText ? <Text style={styles.timelineDescText}>{descText}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No work experience details provided.</Text>
          </View>
        )}

        {/* 4. EDUCATION & QUALIFICATIONS TIMELINE */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeadingTitle}>EDUCATION & QUALIFICATIONS</Text>

        {educationList.length > 0 ? (
          <View style={styles.timelineContainer}>
            {educationList.map((item, idx) => {
              const isLast = idx === educationList.length - 1;
              const yearText = item.year ? `Class of ${item.year}` : (item.duration || 'Class of 2022');
              const degreeText = item.degree || item.qualification || 'ITI / Diploma Degree';
              const instText = item.institution || item.college || item.school || 'Government Technical Institute';

              return (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelineLeftCol}>
                    {!isLast ? <View style={styles.timelineConnectorLine} /> : null}
                    <View style={styles.timelineDot} />
                  </View>

                  <View style={styles.timelineCard}>
                    <Text style={styles.timelineDurationText}>{yearText}</Text>
                    <Text style={styles.timelineMainTitle}>{degreeText}</Text>
                    {instText ? <Text style={styles.timelineDescText}>{instText}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No education details provided.</Text>
          </View>
        )}

        {/* 5. Location & Workplace Preferences */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeadingTitle}>LOCATION & WORK PREFERENCES</Text>

        <View style={styles.specRowsContainer}>
          {/* Current City / Address */}
          <View style={styles.specRowItem}>
            <View style={styles.specIconBox}>
              <MapPin size={15} color="#1764E8" strokeWidth={1.8} />
            </View>
            <View style={styles.specTextCol}>
              <Text style={styles.specGridLabel}>Current Residence Location</Text>
              <Text style={styles.specGridValue}>{location}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Preferred MIDC Zone */}
          <View style={styles.specRowItem}>
            <View style={styles.specIconBox}>
              <Building2 size={15} color="#1764E8" strokeWidth={1.8} />
            </View>
            <View style={styles.specTextCol}>
              <Text style={styles.specGridLabel}>Preferred MIDC Industrial Zone</Text>
              <Text style={styles.specGridValue}>{midcZone}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Shift Preference */}
          <View style={styles.specRowItem}>
            <View style={styles.specIconBox}>
              <Clock size={15} color="#1764E8" strokeWidth={1.8} />
            </View>
            <View style={styles.specTextCol}>
              <Text style={styles.specGridLabel}>Preferred Shift Mode</Text>
              <Text style={styles.specGridValue}>{shift}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Transportation */}
          <View style={styles.specRowItem}>
            <View style={styles.specIconBox}>
              <Bus size={15} color="#1764E8" strokeWidth={1.8} />
            </View>
            <View style={styles.specTextCol}>
              <Text style={styles.specGridLabel}>Company Bus Facility</Text>
              <Text style={styles.specGridValue}>
                {requiresBus ? 'Required / Depends on Company Bus Route' : 'Not Required (Own Transport)'}
              </Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Accommodation */}
          <View style={styles.specRowItem}>
            <View style={styles.specIconBox}>
              <Home size={15} color="#1764E8" strokeWidth={1.8} />
            </View>
            <View style={styles.specTextCol}>
              <Text style={styles.specGridLabel}>Hostel / Accommodation</Text>
              <Text style={styles.specGridValue}>
                {requiresAccommodation ? 'Accommodation Assistance Required' : 'Self-Arranged Local Residence'}
              </Text>
            </View>
          </View>
        </View>

        {/* 6. Technical & Trade Skills */}
        {skillsList.length > 0 ? (
          <>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionHeadingTitle}>TECHNICAL SKILLS & COMPETENCIES</Text>
            <View style={styles.skillsWrapRow}>
              {skillsList.map((skill: string, i: number) => (
                <View key={i} style={styles.borderlessSkillTag}>
                  <View style={styles.skillDot} />
                  <Text style={styles.borderlessSkillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* 7. Resume Document Attachment Card */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeadingTitle}>ATTACHED RESUME & BIO-DATA</Text>
        {resumeInfo.url ? (
          <View style={styles.resumeAttachmentBox}>
            <View style={styles.resumeDocIconBox}>
              <FileText size={18} color="#1764E8" strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.resumeFileNameText} numberOfLines={1}>
                {resumeInfo.name || `${parseStringOrObject(user?.name, 'Candidate')}_Resume.pdf`}
              </Text>
              <Text style={styles.resumeFileStatusText}>✓ Document Attached</Text>
            </View>
            <TouchableOpacity
              style={styles.viewDocBtn}
              activeOpacity={0.8}
              onPress={onOpenPdfModal}
            >
              <Text style={styles.viewDocBtnText}>View</Text>
              <ExternalLink size={11} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noResumeBox}>
            <Text style={styles.noResumeText}>No resume PDF attached by candidate yet.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 14,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  contactActionBarInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    height: 36,
    backgroundColor: '#F8FAFC',
  },
  contactPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E7EBF2',
    marginVertical: 14,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#657796',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoSectionBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 19,
    fontWeight: '400',
  },

  // ── Timeline Structure ──
  timelineContainer: {
    marginTop: 4,
    marginBottom: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 8,
  },
  timelineLeftCol: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  timelineConnectorLine: {
    position: 'absolute',
    top: 18,
    bottom: -10,
    width: 1.5,
    backgroundColor: '#CBD5E1',
    zIndex: 1,
    left: 9.25,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    marginTop: 14,
    zIndex: 2,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  timelineCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  timelineDurationText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#102A5C',
  },
  currentRoleBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentRoleBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  timelineMainTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102A5C',
    letterSpacing: -0.1,
  },
  timelineDescText: {
    fontSize: 11,
    color: '#657796',
    fontWeight: '400',
    marginTop: 1,
  },

  // ── Specifications ──
  specRowsContainer: {
    gap: 2,
  },
  specRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  specIconBox: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specTextCol: {
    flex: 1,
  },
  specGridLabel: {
    fontSize: 10.5,
    color: '#657796',
    fontWeight: '500',
  },
  specGridValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#102A5C',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
  skillsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  borderlessSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#1764E8',
  },
  borderlessSkillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  resumeAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 10,
    gap: 8,
  },
  resumeDocIconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeFileNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#102A5C',
  },
  resumeFileStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginTop: 1,
  },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1764E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.card,
  },
  viewDocBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noResumeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 12,
    alignItems: 'center',
  },
  noResumeText: {
    fontSize: 11.5,
    color: '#657796',
    fontWeight: '500',
  },
  emptyBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: '#657796',
  },
});
