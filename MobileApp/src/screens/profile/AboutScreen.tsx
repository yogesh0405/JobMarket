import { COLORS, RADIUS } from '../../constants/theme';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { WhyChooseJobMarket } from '../../components/profile/WhyChooseJobMarket';
import {
  ArrowLeft,
  Globe,
  Briefcase,
  CheckCircle2,
  Building2,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  Compass,
  Award,
  Users,
  ChevronRight,
  Info,
  FileText,
} from 'lucide-react-native';

interface Props {
  navigation: any;
}

export const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  return (
    <View style={styles.container}>
      {/* Top Header Banner with Back & Stats (Pure White / Slate - No Blue Color) */}
      <View style={[styles.headerBannerContainer, { paddingTop: topInset + (Platform.OS === 'android' ? 8 : 6) }]}>
        <View style={styles.headerTitleNavRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ padding: 4 }}
          >
            <ArrowLeft size={22} color="#1E293B" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>About Us</Text>
        </View>

        {/* Top Stats Card in Pure White / Slate */}
        <View style={styles.topBannerStatsCard}>
          <View style={styles.statColItem}>
            <Text style={styles.statValWhiteText}>10M+</Text>
            <Text style={styles.statLabelMutedText}>Active Users</Text>
          </View>
          <View style={styles.statColDivider} />
          <View style={styles.statColItem}>
            <Text style={styles.statValWhiteText}>500K+</Text>
            <Text style={styles.statLabelMutedText}>Jobs Posted</Text>
          </View>
          <View style={styles.statColDivider} />
          <View style={styles.statColItem}>
            <Text style={styles.statValWhiteText}>2M+</Text>
            <Text style={styles.statLabelMutedText}>Hires Made</Text>
          </View>
          <View style={styles.statColDivider} />
          <View style={styles.statColItem}>
            <Text style={styles.statValWhiteText}>50K+</Text>
            <Text style={styles.statLabelMutedText}>Companies</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD BLOCK 1: OUR MISSION & VISION */}
        <View style={styles.cardBlock}>
          <View style={styles.sectionHeaderRow}>
            <Compass size={18} color={COLORS.primary} />
            <Text style={styles.sectionBlockTitle}>Our Mission & Vision</Text>
          </View>

          <Text style={styles.bodyText}>
            JobMarket is India's comprehensive, all-in-one job marketplace built for every career domain. We bridge the gap between job seekers and top enterprise employers across all industries — from IT software engineering, corporate management, finance, healthcare, and sales, to skilled technical trades and industrial operations.
          </Text>
        </View>

        {/* Crisp Section Divider Line */}
        <View style={styles.slateSectionDivider} />

        {/* CARD BLOCK 2: WHY CHOOSE JOBMARKET (REDESIGNED V2) */}
        <WhyChooseJobMarket />

        {/* Crisp Section Divider Line */}
        <View style={styles.slateSectionDivider} />

        {/* CARD BLOCK 3: APP INFORMATION & LEGAL */}
        <View style={styles.cardBlock}>
          <View style={styles.sectionHeaderRow}>
            <Info size={18} color={COLORS.primary} />
            <Text style={styles.sectionBlockTitle}>Application Information</Text>
          </View>

          <View style={styles.infoRowItem}>
            <Text style={styles.infoRowLabel}>Platform Version</Text>
            <Text style={styles.infoRowValue}>v2.4.0 (Build 108)</Text>
          </View>

          <View style={styles.rowDividerLine} />

          <TouchableOpacity activeOpacity={0.7} style={styles.actionRowItem}>
            <FileText size={16} color={COLORS.primary} />
            <Text style={styles.actionRowText}>Terms of Service & Usage Policies</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDividerLine} />

          <TouchableOpacity activeOpacity={0.7} style={styles.actionRowItem}>
            <ShieldCheck size={16} color={COLORS.primary} />
            <Text style={styles.actionRowText}>Privacy Policy & Data Security</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Footer Copyright */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>© 2026 JobMarket Inc. All rights reserved.</Text>
          <Text style={styles.footerSubText}>Empowering Job Seekers & Employers Across All Sectors Nationwide.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topOverscrollBlueFill: {
    position: 'absolute',
    top: -400,
    left: 0,
    right: 0,
    height: 400,
  },

  /* Header Banner (Pure White Background - No Blue Color) */
  headerBannerContainer: {
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  headerTitleNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  topBannerStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  statColItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValWhiteText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabelMutedText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statColDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },

  /* Scroll Content & Cards */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 60,
  },
  cardBlock: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    padding: 14,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionBlockTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  bodyText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '400',
  },

  /* Section Separator Rule */
  slateSectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  rowDividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  /* Feature List */
  featuresList: {
    gap: 8,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 2,
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  featureDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },

  /* Info & Action Rows */
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoRowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  infoRowValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  actionRowText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Footer */
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  footerSubText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
});
