import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Briefcase,
  Users,
  ShieldCheck,
  Zap,
  Building2,
  Award,
  Star,
  Quote,
  Info,
  PhoneCall,
  Lock,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

interface Props {
  navigation: any;
}

export const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  const CORPORATE_PROFESSIONAL_IMG = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
  const INDUSTRIAL_WELDER_IMG = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80';
  const SOFTWARE_ENGINEER_IMG = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';

  const TESTIMONIALS = [
    {
      id: '1',
      name: 'Pooja Deshmukh',
      role: 'Head of Talent Acquisition & HR',
      company: 'Apex Corporate Enterprises',
      rating: 5,
      avatarInitial: 'PD',
      avatarBg: COLORS.primary,
      image: CORPORATE_PROFESSIONAL_IMG,
      quote:
        'We hired 40+ verified candidates across operations and sales in just one week. Direct calling and pre-verified documents saved our HR team hundreds of recruitment hours.',
    },
    {
      id: '2',
      name: 'Ramesh Kumar',
      role: 'Certified Industrial Welder & Fabricator',
      company: 'Placed at MIDC Heavy Engineering',
      rating: 5,
      avatarInitial: 'RK',
      avatarBg: '#0284C7',
      image: INDUSTRIAL_WELDER_IMG,
      quote:
        'As a welder, getting direct calls from factory owners without any agent charging money changed my life. I got my walk-in interview pass on phone and joined work with great pay!',
    },
    {
      id: '3',
      name: 'Rahul Sharma',
      role: 'Senior Software Engineer',
      company: 'Placed at TechMatrix Inc',
      rating: 5,
      avatarInitial: 'RS',
      avatarBg: '#3B82F6',
      image: SOFTWARE_ENGINEER_IMG,
      quote:
        'Applied directly to verified tech companies and got a call from the engineering manager within 3 hours. Transparent salary packages and zero commission make JobMarket unmatched.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} translucent={false} />

      {/* Top Fixed Header Nav */}
      <View style={[styles.topNavBar, { paddingTop: topInset + (Platform.OS === 'android' ? 6 : 4) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
        <View style={styles.topNavTitleContainer}>
          <Building2 size={17} color={COLORS.primary} strokeWidth={2.2} />
          <Text style={styles.topNavTitle}>About JobMarket</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HERO SPOTLIGHT CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>Platform Overview</Text>
          </View>

          <Text style={styles.heroTitle}>
            Unlock Your Full Career & Hiring Potential
          </Text>

          <Text style={styles.heroSubtitle}>
            Connecting ambitious job seekers with verified enterprise employers nationwide through direct contact, transparent hiring, and intelligent matching.
          </Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CandidateMain', { screen: 'CandidateJobsTab' })}
          >
            <Text style={styles.primaryBtnText}>Explore 50,000+ Jobs</Text>
            <View style={styles.btnArrowCircle}>
              <ArrowRight size={13} color={COLORS.primary} strokeWidth={2.6} />
            </View>
          </TouchableOpacity>

          {/* Bullet Highlights */}
          <View style={styles.bulletsList}>
            <View style={styles.bulletItem}>
              <View style={styles.bulletDotBox}>
                <Check size={11} color={COLORS.primary} strokeWidth={3} />
              </View>
              <Text style={styles.bulletText}>Direct HR calling & instant interview scheduling</Text>
            </View>

            <View style={styles.bulletItem}>
              <View style={styles.bulletDotBox}>
                <Check size={11} color={COLORS.primary} strokeWidth={3} />
              </View>
              <Text style={styles.bulletText}>100% verified companies & zero placement fees</Text>
            </View>

            <View style={styles.bulletItem}>
              <View style={styles.bulletDotBox}>
                <Check size={11} color={COLORS.primary} strokeWidth={3} />
              </View>
              <Text style={styles.bulletText}>Competitive salaries with transparent company profiles</Text>
            </View>
          </View>

          {/* Social Proof Box */}
          <View style={styles.socialProofBox}>
            <View style={styles.avatarStack}>
              <Image source={{ uri: CORPORATE_PROFESSIONAL_IMG }} style={[styles.avatarStackImg, { zIndex: 3 }]} />
              <Image source={{ uri: INDUSTRIAL_WELDER_IMG }} style={[styles.avatarStackImg, { marginLeft: -8, zIndex: 2 }]} />
              <Image source={{ uri: SOFTWARE_ENGINEER_IMG }} style={[styles.avatarStackImg, { marginLeft: -8, zIndex: 1 }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.socialProofTitle}>1.2M+ Active Job Seekers</Text>
              <Text style={styles.socialProofSub}>& 50,000+ Verified Hiring Partners</Text>
            </View>
          </View>

          {/* 3-Metric Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statValText}>10M+</Text>
              <Text style={styles.statLabelText}>Applications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValText}>500K+</Text>
              <Text style={styles.statLabelText}>Live Vacancies</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValText}>98%</Text>
              <Text style={styles.statLabelText}>Satisfaction</Text>
            </View>
          </View>
        </View>

        {/* 2. PLATFORM ARCHITECTURE & CUTTING-EDGE FEATURES */}
        <View style={styles.sectionCard}>
          <View style={styles.badgePill}>
            <Zap size={11} color={COLORS.primary} />
            <Text style={styles.badgeText}>Platform Architecture</Text>
          </View>

          <Text style={styles.serifCardTitle}>
            Empower Your Journey with Cutting-Edge Features
          </Text>
          <Text style={styles.cardSubtitleText}>
            Engineered with advanced mobile workflows, bank-grade encryption, and seamless interview tracking.
          </Text>

          <View style={styles.featuresStack}>
            {/* Feature 1 */}
            <View style={styles.softBoxItem}>
              <View style={styles.featureHeaderRow}>
                <View style={styles.featureIconBox}>
                  <PhoneCall size={16} color={COLORS.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.featureTitleText}>Direct HR Call & WhatsApp</Text>
              </View>
              <Text style={styles.featureDescText}>
                Directly connect with company talent leaders and HR decision makers without intermediary agencies or hidden spam.
              </Text>
              <View style={styles.featureTagPill}>
                <Text style={styles.featureTagText}>Instant Access</Text>
              </View>
            </View>

            {/* Feature 2 */}
            <View style={styles.softBoxItem}>
              <View style={styles.featureHeaderRow}>
                <View style={styles.featureIconBox}>
                  <ShieldCheck size={16} color={COLORS.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.featureTitleText}>100% Verified Employers</Text>
              </View>
              <Text style={styles.featureDescText}>
                Every company on our platform undergoes strict GSTIN, PAN, and corporate identity verification before posting jobs.
              </Text>
              <View style={styles.featureTagPill}>
                <Text style={styles.featureTagText}>Zero Fraud Guarantee</Text>
              </View>
            </View>

            {/* Feature 3 */}
            <View style={styles.softBoxItem}>
              <View style={styles.featureHeaderRow}>
                <View style={styles.featureIconBox}>
                  <Briefcase size={16} color={COLORS.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.featureTitleText}>500+ Industry Domains</Text>
              </View>
              <Text style={styles.featureDescText}>
                Opportunities spanning Software Engineering, AI, Healthcare, Finance, Skilled Technical Trades, Sales, and Logistics.
              </Text>
              <View style={styles.featureTagPill}>
                <Text style={styles.featureTagText}>All Career Levels</Text>
              </View>
            </View>

            {/* Feature 4 */}
            <View style={styles.softBoxItem}>
              <View style={styles.featureHeaderRow}>
                <View style={styles.featureIconBox}>
                  <Lock size={16} color={COLORS.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.featureTitleText}>Enterprise Data Privacy</Text>
              </View>
              <Text style={styles.featureDescText}>
                AES-256 encrypted candidate profiles and digital resumes. Your sensitive contact data is shared only when you apply.
              </Text>
              <View style={styles.featureTagPill}>
                <Text style={styles.featureTagText}>AES-256 Encrypted</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. SOCIAL IMPACT & TESTIMONIALS */}
        <View style={styles.sectionCard}>
          <View style={styles.badgePill}>
            <Users size={11} color={COLORS.primary} />
            <Text style={styles.badgeText}>Social Impact & Stories</Text>
          </View>

          <Text style={styles.serifCardTitle}>
            Real Candidates. Real Recruiters. Real Results.
          </Text>

          {/* Trust Rating Bar */}
          <View style={styles.trustBarBox}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={13} color={COLORS.primary} fill={COLORS.primary} />
              ))}
            </View>
            <Text style={styles.trustBarText}>
              <Text style={{ fontWeight: '800', color: COLORS.textPrimary }}>4.9/5 Rating</Text> based on 50,000+ reviews
            </Text>
          </View>

          {/* Testimonial List */}
          <View style={styles.testimonialsStack}>
            {TESTIMONIALS.map((t) => (
              <View key={t.id} style={styles.softBoxItem}>
                <View style={styles.quoteIconBadge}>
                  <Quote size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.quoteText}>"{t.quote}"</Text>

                <View style={styles.cardDivider} />

                <View style={styles.authorRow}>
                  {t.image ? (
                    <Image source={{ uri: t.image }} style={styles.authorImg} />
                  ) : (
                    <View style={[styles.authorFallbackCircle, { backgroundColor: t.avatarBg }]}>
                      <Text style={styles.authorFallbackText}>{t.avatarInitial}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.authorNameText}>{t.name}</Text>
                    <Text style={styles.authorRoleText}>{t.role}</Text>
                    <Text style={styles.authorCompanyText}>{t.company}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 4. AWARDS & INDUSTRY RECOGNITION */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Award size={18} color={COLORS.primary} />
            <Text style={styles.serifCardTitleInline}>Awards & Recognition</Text>
          </View>

          <View style={styles.awardsGrid}>
            <View style={styles.awardCardBox}>
              <View style={styles.awardIconCircle}>
                <ShieldCheck size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.awardTitleText}>ISO 27001</Text>
              <Text style={styles.awardSubText}>Information Security</Text>
            </View>

            <View style={styles.awardCardBox}>
              <View style={styles.awardIconCircle}>
                <Building2 size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.awardTitleText}>Startup India</Text>
              <Text style={styles.awardSubText}>DPIIT Recognized</Text>
            </View>

            <View style={styles.awardCardBox}>
              <View style={styles.awardIconCircle}>
                <Award size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.awardTitleText}>Top Platform</Text>
              <Text style={styles.awardSubText}>Hiring Excellence 2026</Text>
            </View>
          </View>
        </View>

        {/* 5. CALL TO ACTION BANNER */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to Accelerate Your Career?</Text>
          <Text style={styles.ctaSubtitle}>
            Join over 1.2 million professionals and 50,000 verified employers discovering the future of direct hiring today.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('CandidateMain', { screen: 'CandidateJobsTab' })}
          >
            <Text style={styles.ctaBtnText}>Browse All Open Jobs</Text>
            <ArrowRight size={14} color={COLORS.primary} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* 6. APP INFO & FOOTER */}
        <View style={[styles.sectionCard, { marginBottom: 12 }]}>
          <View style={styles.cardHeaderRow}>
            <Info size={16} color={COLORS.primary} />
            <Text style={styles.serifCardTitleInline}>Application Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform Version</Text>
            <Text style={styles.infoVal}>v2.4.0 (Build 112)</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform Status</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Operational 99.99%</Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerCopyText}>© 2026 JobMarket Technologies Inc. All rights reserved.</Text>
          <Text style={styles.footerNoteText}>
            Empowering job seekers & enterprises with seamless, direct, and zero-fee hiring across India.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Top Navigation Bar */
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topNavTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.2,
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 10,
  },

  /* Section Containers */
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  serifCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.2,
  },
  serifCardTitleInline: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.2,
  },
  cardSubtitleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    fontWeight: '400',
    marginTop: -2,
    marginBottom: 4,
  },

  /* Badge Pill */
  badgePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* Hero Items */
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    height: 40,
    paddingLeft: 16,
    paddingRight: 6,
    marginTop: 2,
    marginBottom: 2,
  },
  primaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  btnArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Bullets */
  bulletsList: {
    gap: 6,
    marginVertical: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDotBox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },

  /* Social Proof Box */
  socialProofBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.softWarmBg,
    borderWidth: 1,
    borderColor: COLORS.softWarmBorder,
    borderRadius: 12,
    padding: 10,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStackImg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    backgroundColor: '#EFF6FF',
  },
  socialProofTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  socialProofSub: {
    fontSize: 10.5,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 1,
  },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
  },

  /* Soft Box Items (Features & Testimonials) */
  featuresStack: {
    gap: 8,
  },
  softBoxItem: {
    backgroundColor: COLORS.softWarmBg,
    borderWidth: 1,
    borderColor: COLORS.softWarmBorder,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitleText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  featureDescText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  featureTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  featureTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* Trust Bar & Testimonials */
  trustBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.softWarmBg,
    borderWidth: 1,
    borderColor: COLORS.softWarmBorder,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  trustBarText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  testimonialsStack: {
    gap: 8,
    marginTop: 2,
  },
  quoteIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16.5,
    fontStyle: 'italic',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  authorFallbackCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorFallbackText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textWhite,
  },
  authorNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  authorRoleText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  authorCompanyText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  /* Awards Grid */
  awardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  awardCardBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.softWarmBg,
    borderWidth: 1,
    borderColor: COLORS.softWarmBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 2,
  },
  awardIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  awardTitleText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  awardSubText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },

  /* CTA Banner Card */
  ctaCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    gap: 6,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textWhite,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 11.5,
    color: '#DBEAFE',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  ctaBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* App Info Card */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  infoVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },

  /* Footer */
  footerWrap: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  footerCopyText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerNoteText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
});
