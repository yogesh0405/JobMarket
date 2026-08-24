import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  MapPin,
  Briefcase,
  Bookmark,
  Building2,
  Clock,
  Users,
} from 'lucide-react-native';
import { Job } from '../../../types';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { COLORS } from '../../../constants/theme';
import { formatTimeAgo } from './CandidateJobSearchUtils';

interface CandidateJobCardItemProps {
  job: Job;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  isSaved: boolean;
  onPress: () => void;
  onToggleSave: (jobId: string) => void;
  onCompanyPress?: (companyName: string) => void;
}

export const CandidateJobCardItem: React.FC<CandidateJobCardItemProps> = ({
  job,
  viewMode,
  isSelected,
  isSaved,
  onPress,
  onToggleSave,
  onCompanyPress,
}) => {
  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.compactListCard, isSelected && styles.compactListCardActive]}
        onPress={onPress}
      >
        <CompanyLogoAvatar
          logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo}
          companyName={job.company}
          size={42}
          borderRadius={6}
        />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={styles.listJobTitle} numberOfLines={1} ellipsizeMode="tail">
            {job.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0 }}>
            <MapPin size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
            <Text style={styles.listLocationText} numberOfLines={1} ellipsizeMode="tail">
              {job.location || 'Chhatrapati Sambhajinagar'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const expText =
    job.min_experience !== undefined || job.minExperience !== undefined
      ? `${job.min_experience ?? job.minExperience}-${job.max_experience ?? job.maxExperience} Yrs Exp`
      : '0-2 Yrs Exp';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.naukriJobCard}
      onPress={onPress}
    >
      <View style={styles.naukriCardTopSection}>
        <View style={styles.naukriTitleRow}>
          <Text style={styles.naukriJobTitle} numberOfLines={1}>
            {job.title}
          </Text>
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

        <View style={styles.naukriSpecsRow}>
          <View style={styles.naukriSpecItem}>
            <Briefcase size={13} color="#64748B" />
            <Text style={styles.naukriSpecText}>{expText}</Text>
          </View>

          <Text style={styles.naukriDivider}>|</Text>

          <View style={styles.naukriSpecItem}>
            <Text style={{ fontWeight: '700', color: '#64748B', fontSize: 12 }}>₹</Text>
            <Text style={styles.naukriSpecText}>
              {(job.salary_min ?? job.salaryMin) && (job.salary_max ?? job.salaryMax)
                ? `${((job.salary_min ?? job.salaryMin) / 100000).toFixed(1)}-${((job.salary_max ?? job.salaryMax) / 100000).toFixed(1)} Lacs PA`
                : '3.5-5.5 Lacs PA'}
            </Text>
          </View>

          <Text style={styles.naukriDivider}>|</Text>

          <View style={[styles.naukriSpecItem, { flex: 1, minWidth: 0 }]}>
            <MapPin size={13} color="#64748B" style={{ flexShrink: 0 }} />
            <Text style={[styles.naukriSpecText, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
              {job.location || 'Chhatrapati Sambhajinagar'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.naukriCardMiddleSection}>
        <View style={styles.naukriSpecItem}>
          <Clock size={13} color="#64748B" />
          <Text style={styles.naukriSimpleText}>{job.job_type || (job as any).jobType || 'Full-time'}</Text>
        </View>

        <View style={styles.naukriSpecItem}>
          <Building2 size={13} color="#64748B" />
          <Text style={styles.naukriSimpleText}>{job.work_mode || (job as any).workMode || 'On-site'}</Text>
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
        <TouchableOpacity
          activeOpacity={onCompanyPress ? 0.75 : 1}
          onPress={() => {
            if (onCompanyPress) {
              onCompanyPress(job.company);
            } else {
              onPress();
            }
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
        >
          <CompanyLogoAvatar
            logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo}
            companyName={job.company}
            size={38}
            borderRadius={6}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.naukriCompanyName, onCompanyPress && { color: '#2563EB', textDecorationLine: 'underline' }]} numberOfLines={1}>
              {job.company || 'Industrial Company'}
            </Text>
            <Text style={styles.naukriPostedByText} numberOfLines={1}>
              Posted by {job.company || 'Recruiter'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.naukriTimeAgoText}>
          {formatTimeAgo(job.posted_at || (job as any).postedAt || (job as any).created_at || (job as any).createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B4C3D4',
    padding: 12,
    marginBottom: 8,
  },
  compactListCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  listJobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  listLocationText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  naukriJobCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B4C3D4',
    marginBottom: 8,
    overflow: 'hidden',
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  naukriBookmarkBtn: {
    padding: 2,
  },
  naukriSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  naukriSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  naukriSpecText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  naukriDivider: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  naukriCardMiddleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  naukriSimpleText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  naukriCardBottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  naukriCompanyName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  naukriPostedByText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  naukriTimeAgoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
