import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import {
  User as UserIcon,
  Phone,
  FileText,
  ShieldCheck,
  MapPin,
  Briefcase,
} from 'lucide-react-native';
import { JobApplication } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { CompanyLogoAvatar } from '../common/CompanyLogoAvatar';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

interface ApplicantCardProps {
  item: JobApplication & {
    candidate_name?: string;
    name?: string;
    trade_specialization?: string;
    title?: string;
    experience?: string;
    resumeUrl?: string;
    resume?: string;
    avatarUrl?: string;
    verified?: boolean;
    aadhaar_verified?: boolean;
    location?: string;
    phone?: string;
  };
  onUpdateStatus: (applicant: JobApplication) => void;
  onViewResume: (url: string, name: string) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  item,
  onUpdateStatus,
  onViewResume,
}) => {
  const candidateName = item.candidate_name || item.name || item.user?.name || 'Anonymous Candidate';
  const trade = item.trade_specialization || item.title || item.user?.trade_specialization || 'General Worker';
  const exp = item.experience || item.user?.experience ? `${item.experience || item.user?.experience} Exp` : 'Fresher';
  const resumeUrl = item.resume_url || item.resumeUrl || item.resume || item.user?.resume_url;
  const phoneNum = item.phone || item.user?.phone;
  const locationText = item.location || item.user?.location;
  const avatarUri = item.avatarUrl || item.user?.profile_picture_url;
  const isVerified = item.verified || item.aadhaar_verified || item.user?.aadhaar_verified;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <CompanyLogoAvatar
          logoUrl={avatarUri}
          companyName={candidateName}
          size={40}
          borderRadius={0}
          style={{ marginRight: 10 }}
        />
        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={styles.candidateName}>{candidateName}</Text>
            {isVerified && (
              <ShieldCheck size={16} color="#059669" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.tradeText}>{trade}</Text>
        </View>
        <Badge status={item.status} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaBadge}>
          <Briefcase size={12} color="#475569" />
          <Text style={styles.metaText}>{exp}</Text>
        </View>
        {locationText && (
          <View style={styles.metaBadge}>
            <MapPin size={12} color="#475569" />
            <Text style={styles.metaText} numberOfLines={1}>{locationText}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        {phoneNum && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(`tel:${phoneNum}`)}
          >
            <Phone size={14} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>
        )}

        {phoneNum && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${phoneNum.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                  candidateName
                )},%20we%20reviewed%20your%20application%20on%20CSN%20JobMarket.`
              )
            }
          >
            <WhatsAppIcon size={14} color="#16A34A" />
            <Text style={[styles.actionBtnText, { color: '#16A34A' }]}>WhatsApp</Text>
          </TouchableOpacity>
        )}

        {resumeUrl && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onViewResume(resumeUrl, candidateName)}
          >
            <FileText size={14} color="#475569" />
            <Text style={[styles.actionBtnText, { color: '#475569' }]}>Resume</Text>
          </TouchableOpacity>
        )}

        <Button
          title="Status"
          variant="outline"
          size="sm"
          onPress={() => onUpdateStatus(item)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  nameCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  tradeText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
