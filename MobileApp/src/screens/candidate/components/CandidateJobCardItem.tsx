import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  MapPin,
  Briefcase,
  Bookmark,
  Building2,
  Settings,
  ChevronRight,
  Clock,
  Users,
} from 'lucide-react-native';
import { Job } from '../../../types';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { COLORS, RADIUS } from '../../../constants/theme';
import { formatTimeAgo } from './CandidateJobSearchUtils';

interface CandidateJobCardItemProps {
  job: Job;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isSaved: boolean;
  onPress: () => void;
  onToggleSave: (jobId: string) => void;
  onCompanyPress?: (companyName: string) => void;
}

export const CandidateJobCardItem: React.FC<CandidateJobCardItemProps> = ({
  job,
  viewMode,
  isSelected,
  isFirst,
  isLast,
  isSaved,
  onPress,
  onToggleSave,
  onCompanyPress,
}) => {
  if (!job) return null;

  const jobTitle = job.title || (job as any).job_title || 'Industrial Position';
  const companyName = job.company || (job as any).company_name || (job as any).companyName || 'Industrial Company';
  const locationText = job.location || (job as any)?.city || (job as any)?.midc_zone || 'Chhatrapati Sambhajinagar';
  const timeText = formatTimeAgo(job.posted_at || (job as any).postedAt || (job as any).created_at || (job as any).createdAt);
  const jobType = job.job_type || (job as any).jobType || 'Full-time';
  const workMode = job.work_mode || (job as any).workMode || 'On-site';
  const jobLogo =
    job.companyLogo ||
    (job as any).company_logo ||
    (job as any).logoUrl ||
    (job as any).logo_url ||
    (job as any).logo ||
    (job as any).employer_logo ||
    (job as any).avatar_url ||
    (job as any).avatar;

  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[
          styles.jobItemRow,
          isFirst && styles.jobItemRowFirst,
          isLast && styles.jobItemRowLast,
          isSelected && styles.jobItemRowActive,
        ]}
        onPress={onPress}
      >
        <View style={styles.jobItemContent}>
          {/* Top Info Row with Company Logo */}
          <View style={styles.jobTopRow}>
            <TouchableOpacity
              activeOpacity={onCompanyPress ? 0.75 : 1}
              onPress={() => (onCompanyPress ? onCompanyPress(companyName) : onPress())}
            >
              <CompanyLogoAvatar
                logoUrl={jobLogo}
                companyName={companyName}
                size={40}
                borderRadius={8}
              />
            </TouchableOpacity>

            <View style={styles.jobTextCol}>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {jobTitle}
              </Text>
              <Text
                style={[styles.jobCompanySubText, onCompanyPress && { color: '#2563EB' }]}
                numberOfLines={1}
                onPress={() => onCompanyPress && onCompanyPress(companyName)}
              >
                {companyName}
              </Text>
              <View style={styles.jobLocationRow}>
                <MapPin size={11} color="#64748B" />
                <Text style={styles.jobLocationText} numberOfLines={1}>
                  {locationText}
                </Text>
              </View>
            </View>

            <View style={styles.jobRightCol}>
              <Text style={styles.jobTimeText}>{timeText}</Text>
              <ChevronRight size={14} color="#91A0BA" strokeWidth={2.4} />
            </View>
          </View>

          {/* Bottom Tags Row */}
          <View style={styles.tagsRow}>
            <View style={styles.blueTag}>
              <Text style={styles.blueTagText}>{jobType}</Text>
            </View>
            <View style={styles.blueTag}>
              <Text style={styles.blueTagText}>{workMode}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const minExp = job.min_experience ?? (job as any).minExperience;
  const maxExp = job.max_experience ?? (job as any).maxExperience;
  const expText =
    minExp !== undefined && maxExp !== undefined
      ? `${minExp}-${maxExp} Yrs Exp`
      : minExp !== undefined
      ? `${minExp}+ Yrs Exp`
      : '0-2 Yrs Exp';

  const sMin = job.salary_min ?? (job as any).salaryMin;
  const sMax = job.salary_max ?? (job as any).salaryMax;
  let salaryText = '3.5-5.5 Lacs PA';
  if (sMin && sMax) {
    if (sMin >= 100000) {
      salaryText = `${(sMin / 100000).toFixed(1)}-${(sMax / 100000).toFixed(1)} Lacs PA`;
    } else {
      salaryText = `₹${Math.round(sMin / 1000)}k-${Math.round(sMax / 1000)}k/mo`;
    }
  } else if (sMin) {
    salaryText = sMin >= 100000 ? `₹${(sMin / 100000).toFixed(1)} Lacs+ PA` : `₹${sMin}/mo`;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.naukriJobCard}
      onPress={onPress}
    >
      <View style={styles.naukriCardTopSection}>
        <View style={styles.naukriTitleRow}>
          {/* Company Logo at the Top */}
          <TouchableOpacity
            activeOpacity={onCompanyPress ? 0.75 : 1}
            onPress={() => (onCompanyPress ? onCompanyPress(companyName) : onPress())}
            style={{ marginRight: 10 }}
          >
            <CompanyLogoAvatar
              logoUrl={jobLogo}
              companyName={companyName}
              size={42}
              borderRadius={8}
            />
          </TouchableOpacity>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={styles.naukriJobTitle} numberOfLines={1}>
              {jobTitle}
            </Text>
            <Text
              style={[
                styles.naukriCompanyNameHeader,
                onCompanyPress && { color: '#2563EB' },
              ]}
              numberOfLines={1}
              onPress={() => onCompanyPress && onCompanyPress(companyName)}
            >
              {companyName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.naukriBookmarkBtn}
            onPress={() => onToggleSave(job.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bookmark
              size={18}
              color={isSaved ? COLORS.primary : '#94A3B8'}
              fill={isSaved ? COLORS.primary : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Specs Row: Experience | Salary | Location */}
        <View style={styles.naukriSpecsRow}>
          <View style={styles.naukriSpecItem}>
            <Briefcase size={13} color="#64748B" />
            <Text style={styles.naukriSpecText}>{expText}</Text>
          </View>

          <Text style={styles.naukriDivider}>|</Text>

          <View style={styles.naukriSpecItem}>
            <Text style={{ fontWeight: '700', color: '#64748B', fontSize: 12 }}>₹</Text>
            <Text style={styles.naukriSpecText}>{salaryText}</Text>
          </View>

          <Text style={styles.naukriDivider}>|</Text>

          <View style={[styles.naukriSpecItem, { flex: 1, minWidth: 0 }]}>
            <MapPin size={13} color="#64748B" style={{ flexShrink: 0 }} />
            <Text style={[styles.naukriSpecText, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
              {locationText}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.naukriCardMiddleSection}>
        <View style={styles.naukriSpecItem}>
          <Clock size={13} color="#64748B" />
          <Text style={styles.naukriSimpleText}>{jobType}</Text>
        </View>

        <View style={styles.naukriSpecItem}>
          <Building2 size={13} color="#64748B" />
          <Text style={styles.naukriSimpleText}>{workMode}</Text>
        </View>

        {job.openings || (job as any).vacancies ? (
          <View style={styles.naukriSpecItem}>
            <Users size={13} color="#64748B" />
            <Text style={styles.naukriSimpleText}>
              {job.openings || (job as any).vacancies} Vacancies
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.naukriCardBottomSection}>
        <Text style={styles.naukriPostedByText} numberOfLines={1}>
          Posted by {companyName}
        </Text>

        <Text style={styles.naukriTimeAgoText}>
          {timeText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  jobItemRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobItemRowFirst: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 4,
  },
  jobItemRowLast: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  jobItemRowActive: {
    backgroundColor: '#F0F6FF',
  },
  jobItemContent: {
    gap: 6,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jobIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  jobTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#102A5C',
    marginBottom: 1,
  },
  jobCompanySubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  jobLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  jobLocationText: {
    fontSize: 11,
    color: '#66789B',
    fontWeight: '500',
  },
  jobRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobTimeText: {
    fontSize: 11,
    color: '#66789B',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 50,
  },
  blueTag: {
    backgroundColor: '#EEF5FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  blueTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1764E8',
  },
  naukriJobCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  naukriCardTopSection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  naukriTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  naukriJobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.15,
  },
  naukriCompanyNameHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  naukriBookmarkBtn: {
    padding: 2,
  },
  naukriSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  naukriSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  naukriSpecText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  naukriDivider: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  naukriCardMiddleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  naukriSimpleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  naukriCardBottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  naukriCompanyName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  naukriPostedByText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  naukriTimeAgoText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
