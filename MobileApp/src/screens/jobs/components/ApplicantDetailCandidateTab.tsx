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
  ShieldCheck,
  MapPin,
  Briefcase,
  Zap,
  Clock,
  Award,
  UserCheck,
} from 'lucide-react-native';
import { JobApplication } from '../../../types';
import { WhatsAppIcon } from '../../../components/common/WhatsAppIcon';
import { COLORS } from '../../../constants/theme';
import { safeValue } from './JobApplicantsUtils';

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
  return (
    <View style={styles.modalSectionBox}>
      <View style={styles.contactActionBarInlineRow}>
        <TouchableOpacity
          style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1 }]}
          activeOpacity={0.8}
          onPress={() => {
            const phone = selectedApplicant?.user?.phone;
            if (phone) Linking.openURL(`tel:${phone}`);
            else Alert.alert('Notice', 'Phone number not provided.');
          }}
        >
          <Phone size={15} color={COLORS.primary} />
          <Text style={[styles.contactPillText, { color: COLORS.primary }]}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1.35 }]}
          activeOpacity={0.8}
          onPress={() => {
            const phone = selectedApplicant?.user?.phone?.replace(/[^0-9]/g, '');
            if (phone) Linking.openURL(`https://wa.me/${phone}`);
            else Alert.alert('Notice', 'WhatsApp number not provided.');
          }}
        >
          <WhatsAppIcon size={16} color="#16A34A" />
          <Text style={[styles.contactPillText, { color: '#15803D' }]}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactPillBtn, { borderColor: '#CBD5E1', flex: 1 }]}
          activeOpacity={0.8}
          onPress={() => {
            const email = selectedApplicant?.user?.email;
            if (email) Linking.openURL(`mailto:${email}`);
            else onSelectEmailTab();
          }}
        >
          <Mail size={15} color="#DC2626" />
          <Text style={[styles.contactPillText, { color: '#DC2626' }]}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactPillBtn, { borderColor: COLORS.primary, flex: 1.3 }]}
          activeOpacity={0.8}
          onPress={() => {
            const candUser = selectedApplicant?.user;
            const rawUrl = selectedApplicant?.resume_url || (selectedApplicant as any)?.resumeUrl || candUser?.resume_url || (candUser as any)?.resumeUrl || (candUser as any)?.resume;
            let urlStr = '';
            if (typeof rawUrl === 'string') urlStr = rawUrl.trim();
            else if (rawUrl && typeof rawUrl === 'object') urlStr = (rawUrl as any).url || (rawUrl as any).fileUrl || (rawUrl as any).uri || '';

            if (urlStr && urlStr.length > 0) {
              onOpenPdfModal();
            } else {
              Alert.alert('Notice', "Candidate hasn't uploaded the resume yet.");
            }
          }}
        >
          <FileText size={15} color={COLORS.primary} />
          <Text style={[styles.contactPillText, { color: COLORS.primary }]}>Resume</Text>
        </TouchableOpacity>
      </View>

      {selectedApplicant?.user?.bio ? (
        <View style={{ marginTop: 12, marginBottom: 10 }}>
          <Text style={styles.sectionHeadingTitle}>ABOUT CANDIDATE</Text>
          <Text style={styles.infoSectionBody}>{safeValue(selectedApplicant?.user?.bio)}</Text>
        </View>
      ) : null}

      <Text style={[styles.sectionHeadingTitle, { marginTop: 12 }]}>WORK & AVAILABILITY</Text>

      <View style={styles.specRowsContainer}>
        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <MapPin size={15} color="#0284C7" />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>MIDC Location Address</Text>
            <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.location)}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <Briefcase size={15} color={COLORS.primary} />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Work Experience</Text>
            <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.experience)}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <Award size={15} color={COLORS.primary} />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Education & Trade</Text>
            <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.education)}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <UserCheck size={15} color="#D97706" />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Preferred Shift</Text>
            <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.preferred_shift)}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <Mail size={15} color="#DC2626" />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Email Address</Text>
            <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.email)}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <Phone size={15} color={COLORS.primary} />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Phone Number</Text>
            <Text style={styles.specGridValue}>{safeValue(selectedApplicant?.user?.phone)}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <ShieldCheck size={15} color="#16A34A" />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Aadhaar Verification</Text>
            <Text style={styles.specGridValue}>
              {selectedApplicant?.user?.aadhaar_verified ? 'Verified (Government Aadhaar)' : 'Pending Verification'}
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <Zap size={15} color={COLORS.primary} />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Bus & Hostel Facility</Text>
            <Text style={styles.specGridValue}>
              {(selectedApplicant?.user as any)?.requiresBus ? 'Bus Required' : 'Self Transport'} • {(selectedApplicant?.user as any)?.requiresAccommodation ? 'Hostel Needed' : 'Local Resident'}
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <Clock size={15} color="#64748B" />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Applied On</Text>
            <Text style={styles.specGridValue}>
              {new Date(selectedApplicant?.applied_at || Date.now()).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {selectedApplicant?.user?.skills && selectedApplicant.user.skills.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeadingTitle}>TECHNICAL SKILLS</Text>
          <View style={styles.skillsWrapRow}>
            {selectedApplicant.user.skills.map((skill, i) => (
              <View key={i} style={styles.borderlessSkillTag}>
                <View style={styles.skillDot} />
                <Text style={styles.borderlessSkillText}>{safeValue(skill)}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  modalSectionBox: {
    padding: 16,
  },
  contactActionBarInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  contactPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoSectionBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  specRowsContainer: {
    gap: 8,
    marginTop: 6,
  },
  specRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  specIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specTextCol: {
    flex: 1,
  },
  specGridLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  specGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  skillsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  borderlessSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  skillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  borderlessSkillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
