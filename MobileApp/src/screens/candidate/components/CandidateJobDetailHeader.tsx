import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import {
  ChevronLeft,
  Share2,
  Bookmark,
  CheckCircle2,
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
}

export const CandidateJobDetailHeader: React.FC<CandidateJobDetailHeaderProps> = ({
  job,
  isSaved,
  activeTab,
  setActiveTab,
  onBack,
  onShare,
  onToggleSave,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);
  const logoUrl =
    job.companyLogo ||
    (job as any).company_logo ||
    (job as any).logoUrl ||
    (job as any).logo_url ||
    (job as any).logo;

  return (
    <View style={styles.profileHeaderMasterCard}>
      {/* Primary Blue Top Banner Section */}
      <View style={[styles.topHeaderBandPrimary, { paddingTop: topInset + (Platform.OS === 'android' ? 10 : 8), paddingBottom: 16 }]}>
        {/* Navigation Action Buttons Row */}
        <View style={styles.headerBandTopActions}>
          <TouchableOpacity
            style={styles.backBtnHeader}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
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
          <View style={styles.bannerAvatarBox}>
            <CompanyLogoAvatar logoUrl={logoUrl} companyName={job.company} size={58} borderRadius={29} />
          </View>

          <View style={styles.bannerTitleTextStack}>
            <View style={styles.bannerCompanyRow}>
              <Text style={styles.bannerCompanyNameText} numberOfLines={1}>
                {job.company || 'Industrial Partner'}
              </Text>
              <CheckCircle2 size={14} color="#38BDF8" strokeWidth={2.2} />
            </View>

            <Text style={styles.bannerJobRoleSubText} numberOfLines={2}>
              {job.title}
            </Text>
          </View>
        </View>
      </View>

      {/* Secondary Meta Information Card Body */}
      <View style={styles.whiteHeaderCardBody}>
        <View style={styles.refMetaStack}>
          {job.location || (job as any).website ? (
            <View style={styles.refMetaRow}>
              {job.location ? (
                <>
                  <MapPin size={13} color="#64748B" />
                  <Text style={styles.refMetaText}>{job.location}</Text>
                </>
              ) : null}
              {(job as any).website ? (
                <>
                  <Globe size={13} color={COLORS.primary} style={{ marginLeft: job.location ? 12 : 0 }} />
                  <Text style={styles.refMetaLink}>{(job as any).website}</Text>
                </>
              ) : null}
            </View>
          ) : null}

          {job.industry || job.trade ? (
            <View style={styles.refMetaRow}>
              <Building2 size={13} color="#64748B" />
              <Text style={styles.refMetaText}>Industry : {job.industry || job.trade}</Text>
            </View>
          ) : null}
        </View>

        {/* Tab Navigation Controls */}
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    marginBottom: 0,
  },
  topHeaderBandPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
  },
  headerBandTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtnHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transparentIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerHeaderFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerAvatarBox: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  bannerTitleTextStack: {
    flex: 1,
    minWidth: 0,
  },
  bannerCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bannerCompanyNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BAE6FD',
  },
  bannerJobRoleSubText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 21,
    marginTop: 2,
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
    paddingTop: 12,
    position: 'relative',
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
