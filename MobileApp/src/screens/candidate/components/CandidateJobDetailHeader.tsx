import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Platform, StatusBar } from 'react-native';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  ExternalLink,
  Briefcase,
  Award,
  Flag,
  Clock,
  MoreVertical,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { MetaVerifiedBadge } from '../../../components/common/MetaVerifiedBadge';
import { formatTimeAgo } from '../components/CandidateJobSearchUtils';
import { Job } from '../../../types';
import { COLORS, RADIUS } from '../../../constants/theme';

export interface CandidateJobDetailHeaderProps {
  job: Job;
  isSaved: boolean;
  activeTab: 'job_overview' | 'company_info';
  setActiveTab: (tab: 'job_overview' | 'company_info') => void;
  onBack?: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  onReport?: () => void;
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
  onReport,
  onCompanyPress,
}) => {
  const insets = useSafeAreaInsets();
  const safeTopOffset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);
  const [menuVisible, setMenuVisible] = useState(false);

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

  const industryTrade = job.industry || job.trade || (job as any).trade_category;
  const rawWorkMode = job.work_mode || (job as any).workMode || job.job_type || (job as any).jobType;
  const workMode = (() => {
    if (!rawWorkMode) return 'On-site';
    const str = String(rawWorkMode).trim();
    const lower = str.toLowerCase();
    if (lower === 'remote') return 'Remote';
    if (lower === 'hybrid') return 'Hybrid';
    if (lower === 'onsite' || lower === 'on_site' || lower === 'on-site') return 'On-site';
    return str;
  })();
  const shiftDetails = (job as any).shift_details || (job as any).shiftDetails;
  const vacancies = job.openings || (job as any).vacancies;

  const isWalkIn =
    ((job as any).hiringMethod || (job as any).hiring_method || '').toUpperCase() === 'WALK_IN' ||
    Boolean(job.isWalkIn) ||
    Boolean((job as any).is_walk_in) ||
    Boolean((job as any).walkInDate) ||
    Boolean((job as any).walk_in_date);

  const minSalary = Number(job.salary_min || (job as any).salaryMin || 0);
  const maxSalary = Number(job.salary_max || (job as any).salaryMax || 0);
  const isSalaryDisclosed =
    (job as any).disclose_salary !== false &&
    (job as any).discloseSalary !== false &&
    (minSalary > 0 || maxSalary > 0);

  let salaryDisplay = 'Salary Not Disclosed';
  if (isSalaryDisclosed) {
    if (minSalary > 0 && maxSalary > 0) {
      salaryDisplay = `₹${minSalary.toLocaleString('en-IN')} - ₹${maxSalary.toLocaleString('en-IN')}`;
    } else if (minSalary > 0) {
      salaryDisplay = `₹${minSalary.toLocaleString('en-IN')}+`;
    } else if (maxSalary > 0) {
      salaryDisplay = `Up to ₹${maxSalary.toLocaleString('en-IN')}`;
    }
  }

  const postedDate = job.posted_at || (job as any).postedAt || (job as any).created_at || (job as any).createdAt || new Date();
  const postedTimeAgo = formatTimeAgo(postedDate);

  return (
    <View style={styles.headerWrapper}>
      {/* Three-Dot Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuModalOverlay}>
            <View
              style={[
                styles.dropdownMenuCard,
                { top: safeTopOffset + 45 },
              ]}
            >
              {/* Option 1: Share Opening */}
              <TouchableOpacity
                style={styles.dropdownMenuItem}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuVisible(false);
                  onShare();
                }}
              >
                <Share2 size={16} color="#475569" strokeWidth={2} style={styles.dropdownMenuIcon} />
                <Text style={styles.dropdownMenuItemText}>Share</Text>
              </TouchableOpacity>

              <View style={styles.dropdownDivider} />

              {/* Option 2: Save / Bookmark */}
              <TouchableOpacity
                style={styles.dropdownMenuItem}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuVisible(false);
                  onToggleSave();
                }}
              >
                <Bookmark
                  size={16}
                  color={isSaved ? '#1D4ED8' : '#475569'}
                  fill={isSaved ? '#1D4ED8' : 'transparent'}
                  strokeWidth={2}
                  style={styles.dropdownMenuIcon}
                />
                <Text style={[styles.dropdownMenuItemText, isSaved && styles.dropdownMenuItemTextSaved]}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>

              {onReport ? (
                <>
                  <View style={styles.dropdownDivider} />

                  {/* Option 3: Report */}
                  <TouchableOpacity
                    style={styles.dropdownMenuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setMenuVisible(false);
                      onReport();
                    }}
                  >
                    <Flag size={16} color="#DC2626" strokeWidth={2} style={styles.dropdownMenuIcon} />
                    <Text style={[styles.dropdownMenuItemText, styles.dropdownMenuItemTextDanger]}>
                      Report
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 1. Hero Header Card matching Web App .jd-hero-card */}
      <View style={styles.heroCard}>
        {/* Top Blue Accent Stripe */}
        <View style={styles.heroTopStripe} />

        <View style={styles.heroBody}>
          {/* Top Nav Row: Back Arrow + Role Name on Left, Three-Dot Menu on Right */}
          <View style={styles.heroTopNavRow}>
            <View style={styles.heroTopLeftRoleGroup}>
              {onBack ? (
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.heroBackBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  accessibilityLabel="Go back"
                >
                  <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
                </TouchableOpacity>
              ) : null}

              <Text style={styles.heroRoleNameTop} numberOfLines={1}>
                {jobTitle}
              </Text>
            </View>

            {/* Three-Dot Menu Trigger */}
            <TouchableOpacity
              style={styles.moreOptionsBtn}
              onPress={() => setMenuVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              accessibilityLabel="More options"
            >
              <MoreVertical size={20} color="#334155" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Company Info Row: Logo on Left, Company Name & Work Mode on Right */}
          <View style={styles.companyInfoRow}>
            <TouchableOpacity
              activeOpacity={onCompanyPress ? 0.8 : 1}
              onPress={onCompanyPress}
              style={styles.logoAvatarBox}
            >
              <CompanyLogoAvatar
                logoUrl={logoUrl}
                companyName={companyName}
                size={52}
                borderRadius={8}
              />
            </TouchableOpacity>

            <View style={styles.companyInfoRightCol}>
              <View style={styles.companyBadgeRightGroup}>
                <TouchableOpacity
                  activeOpacity={onCompanyPress ? 0.8 : 1}
                  onPress={onCompanyPress}
                  style={styles.companyLinkBtn}
                >
                  <Text style={styles.companyLinkText} numberOfLines={1}>
                    {companyName}
                  </Text>
                  <ExternalLink size={12} color="#2563EB" strokeWidth={2.4} />
                </TouchableOpacity>
                <MetaVerifiedBadge size={15} color="#0095F6" />
              </View>

              {workMode ? (
                <View style={styles.workModeRow}>
                  <Text style={styles.workModeText} numberOfLines={1}>
                    {workMode}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Badges Strip matching Web App .jd-meta-pills-row */}
          <View style={styles.metaPillsRow}>
            {industryTrade ? (
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText} numberOfLines={1}>
                  {industryTrade}
                </Text>
              </View>
            ) : null}

            {shiftDetails ? (
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText} numberOfLines={1}>
                  {shiftDetails}
                </Text>
              </View>
            ) : null}

            {vacancies ? (
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText} numberOfLines={1}>
                  {vacancies} Openings
                </Text>
              </View>
            ) : null}

            {isWalkIn ? (
              <View style={[styles.pillBadge, styles.pillBadgeWalkIn]}>
                <Text style={[styles.pillBadgeText, styles.pillBadgeWalkInText]} numberOfLines={1}>
                  Walk-in Drive
                </Text>
              </View>
            ) : null}
          </View>

          {/* Hero Bottom Bar matching Web App .jd-hero-bottom-bar */}
          <View style={styles.heroBottomBar}>
            <View style={styles.salaryWrap}>
              <Text style={isSalaryDisclosed ? styles.salaryAmountText : styles.salaryUndisclosedText}>
                {salaryDisplay}
              </Text>
              {isSalaryDisclosed ? (
                <Text style={styles.salarySubText}> / month (take-home salary)</Text>
              ) : null}
            </View>

            <View style={styles.postedMetaRow}>
              <Clock size={12} color="#64748B" />
              <Text style={styles.postedMetaText}>Posted {postedTimeAgo}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.directHiringText}>Direct Industrial Hiring</Text>
            </View>
          </View>
        </View>

        {/* Standard Underline Tab Bar inside Upper Card under Posted Section */}
        <View style={styles.standardUnderlineTabBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.underlineTabItem,
              activeTab === 'job_overview' && styles.underlineTabItemActive,
            ]}
            onPress={() => setActiveTab('job_overview')}
          >
            <Briefcase
              size={15}
              color={activeTab === 'job_overview' ? '#1B4FDF' : '#64748B'}
              strokeWidth={activeTab === 'job_overview' ? 2.4 : 2}
            />
            <Text
              style={[
                styles.underlineTabLabel,
                activeTab === 'job_overview' && styles.underlineTabLabelActive,
              ]}
            >
              Job Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.underlineTabItem,
              activeTab === 'company_info' && styles.underlineTabItemActive,
            ]}
            onPress={() => setActiveTab('company_info')}
          >
            <Award
              size={15}
              color={activeTab === 'company_info' ? '#1B4FDF' : '#64748B'}
              strokeWidth={activeTab === 'company_info' ? 2.4 : 2}
            />
            <Text
              style={[
                styles.underlineTabLabel,
                activeTab === 'company_info' && styles.underlineTabLabelActive,
              ]}
            >
              Requirements & Perks
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    marginBottom: 0,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 0,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  heroTopStripe: {
    height: 4,
    backgroundColor: '#2563EB',
    width: '100%',
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  heroBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  heroTopNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroTopLeftRoleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    marginRight: 10,
  },
  heroRoleNameTop: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    letterSpacing: -0.2,
  },
  heroBackBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: -4,
  },
  companyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 2,
  },
  logoAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  companyBadgeRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  companyInfoRightCol: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  companyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  companyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    flexShrink: 1,
  },
  workModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  workModeText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  moreOptionsBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: -4,
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  dropdownMenuCard: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 175,
    paddingVertical: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownMenuIcon: {
    marginRight: 10,
  },
  dropdownMenuItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  dropdownMenuItemTextSaved: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  dropdownMenuItemTextDanger: {
    color: '#DC2626',
    fontWeight: '600',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  metaPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    marginBottom: 12,
  },
  pillBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillBadgeText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#334155',
  },
  pillBadgeWalkIn: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  pillBadgeWalkInText: {
    color: '#0284C7',
    fontWeight: '700',
  },
  heroBottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    gap: 6,
  },
  salaryWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  salaryAmountText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: -0.2,
  },
  salaryUndisclosedText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#475569',
  },
  salarySubText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  postedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  postedMetaText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  metaDot: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  directHiringText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },
  standardUnderlineTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  underlineTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  underlineTabItemActive: {
    borderBottomColor: '#1B4FDF',
  },
  underlineTabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  underlineTabLabelActive: {
    color: '#1B4FDF',
    fontWeight: '700',
  },
});
