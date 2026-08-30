import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  ExternalLink,
  Users,
  MapPin,
  Globe,
  Building2,
  Briefcase,
  Award,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { Job } from '../../../types';
import { COLORS } from '../../../constants/theme';

interface CandidateJobDetailHeaderProps {
  job: Job;
  isSaved: boolean;
  activeTab: 'job_overview' | 'company_info';
  setActiveTab: (tab: 'job_overview' | 'company_info') => void;
  onBack: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  onCompanyPress?: () => void;
}

export const CandidateJobDetailHeader: React.FC<CandidateJobDetailHeaderProps> = ({
  job,
  isSaved,
  activeTab,
  setActiveTab,
  onBack,
  onShare,
  onToggleSave,
  onCompanyPress,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);
  const logoUrl =
    job.companyLogo ||
    (job as any).company_logo ||
    (job as any).logoUrl ||
    (job as any).logo_url ||
    (job as any).logo ||
    null;

  const companyName =
    job.company ||
    (job as any).company_name ||
    (job as any).companyName ||
    'Industrial Partner';

  const jobTitle =
    job.title ||
    (job as any).job_title ||
    (job as any).jobTitle ||
    (job as any).role ||
    (job as any).trade ||
    'Job Opportunity';

  return (
    <View style={styles.profileHeaderMasterCard}>
      {/* Primary Blue Top Banner Section with Safe Area Inset */}
      <View style={[styles.topHeaderBandPrimary, { paddingTop: topInset + 8 }]}>
        {/* Navigation Action Buttons Row */}
        <View style={styles.headerBandTopActions}>
          <TouchableOpacity
            style={styles.backBtnHeader}
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.topRightActionsRow}>
            <TouchableOpacity
              style={styles.transparentIconBtn}
              onPress={onShare}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Share2 size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.transparentIconBtn}
              onPress={onToggleSave}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Bookmark size={16} color="#FFFFFF" fill={isSaved ? '#FFFFFF' : 'transparent'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Company Avatar & Main Job Title Stack */}
        <View style={styles.bannerHeaderFlexRow}>
          <TouchableOpacity
            activeOpacity={onCompanyPress ? 0.8 : 1}
            onPress={onCompanyPress}
            style={styles.bannerAvatarBox}
          >
            <CompanyLogoAvatar logoUrl={logoUrl} companyName={companyName} size={46} borderRadius={23} />
          </TouchableOpacity>

          <View style={styles.bannerTitleTextStack}>
            <TouchableOpacity
              activeOpacity={onCompanyPress ? 0.8 : 1}
              onPress={onCompanyPress}
              style={styles.bannerCompanyRow}
            >
              <Text style={styles.bannerCompanyNameText} numberOfLines={1}>
                {companyName}
              </Text>
              <ExternalLink size={12} color="#BFDBFE" strokeWidth={2.2} />
            </TouchableOpacity>

            <Text style={styles.bannerJobRoleSubText} numberOfLines={2}>
              {jobTitle}
            </Text>

            {/* Clean Inline Industry & Job Type Metadata without Chips/Backgrounds */}
            {(job.industry || job.trade || job.job_type || (job as any).jobType) ? (
              <View style={styles.metaTextRow}>
                {job.industry || job.trade ? (
                  <View style={styles.metaItemInline}>
                    <Briefcase size={12} color="#BFDBFE" />
                    <Text style={styles.metaItemText} numberOfLines={1}>
                      {job.industry || job.trade}
                    </Text>
                  </View>
                ) : null}

                {(job.industry || job.trade) && (job.job_type || (job as any).jobType) ? (
                  <Text style={styles.metaDotDivider}>•</Text>
                ) : null}

                {job.job_type || (job as any).jobType ? (
                  <View style={styles.metaItemInline}>
                    <Building2 size={12} color="#BFDBFE" />
                    <Text style={styles.metaItemText} numberOfLines={1}>
                      {job.job_type || (job as any).jobType}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Tab Navigation Controls */}
      <View style={styles.whiteHeaderCardBody}>
        <View style={styles.segmentedTabBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.segmentedTabBtn, activeTab === 'job_overview' && styles.segmentedTabBtnActive]}
            onPress={() => setActiveTab('job_overview')}
          >
            <Briefcase size={14} color={activeTab === 'job_overview' ? COLORS.primary : '#64748B'} />
            <Text style={[styles.segmentedTabText, activeTab === 'job_overview' && styles.segmentedTabTextActive]}>
              Job Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.segmentedTabBtn, activeTab === 'company_info' && styles.segmentedTabBtnActive]}
            onPress={() => setActiveTab('company_info')}
          >
            <Award size={14} color={activeTab === 'company_info' ? COLORS.primary : '#64748B'} />
            <Text style={[styles.segmentedTabText, activeTab === 'company_info' && styles.segmentedTabTextActive]}>
              Requirements & Perks
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeaderMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 0,
    overflow: 'hidden',
    marginBottom: 0,
    width: '100%',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  topHeaderBandPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    width: '100%',
  },
  headerBandTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtnHeader: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transparentIconBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerHeaderFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerAvatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flexShrink: 0,
  },
  bannerTitleTextStack: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  bannerCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bannerCompanyNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BFDBFE',
  },
  bannerJobRoleSubText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 23,
    marginTop: 2,
  },
  metaTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  metaItemInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  metaItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DBEAFE',
    flexShrink: 1,
  },
  metaDotDivider: {
    fontSize: 12,
    color: '#93C5FD',
    marginHorizontal: 2,
  },
  bannerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  bannerLocationText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#E0F2FE',
  },
  whiteHeaderCardBody: {
    paddingHorizontal: 16,
    paddingTop: 0,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  openingsBadgeTopRight: {
    position: 'absolute',
    right: 16,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  openingsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  refMetaStack: {
    gap: 6,
    marginBottom: 14,
  },
  refMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refMetaText: {
    fontSize: 12,
    color: '#475569',
  },
  refMetaLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  segmentedTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  segmentedTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentedTabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  segmentedTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentedTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
