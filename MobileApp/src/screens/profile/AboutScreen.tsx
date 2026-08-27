import React, { useState } from 'react';
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
  Sparkles,
  Check,
  Briefcase,
  Users,
  ShieldCheck,
  Zap,
  Building2,
  TrendingUp,
  Award,
  Star,
  Quote,
  Info,
  PhoneCall,
  Lock,
} from 'lucide-react-native';

interface Props {
  navigation: any;
}

export const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  // Tab State for "Career & Hiring Freedom" Section
  const [activeServiceTab, setActiveServiceTab] = useState<'DIRECT_HR' | 'WALK_IN' | 'ENTERPRISE'>('DIRECT_HR');

  const SERVICE_TABS = [
    { id: 'DIRECT_HR', label: 'Direct HR Connect' },
    { id: 'WALK_IN', label: 'Walk-In Passes' },
    { id: 'ENTERPRISE', label: 'Enterprise Hiring' },
  ];

  const SERVICE_CONTENT = {
    DIRECT_HR: {
      title: 'Direct HR Calling & Instant Connect',
      description:
        'Eliminate endless waiting and recruitment middlemen. Get direct phone contact and instant chat with verified HR managers and talent acquisition leaders.',
      benefits: [
        'Direct phone calls & WhatsApp connect with verified HRs',
        'Guaranteed application status updates within 24-48 hours',
        'Zero commission, zero placement fees for job seekers',
      ],
      badge: 'Most Popular',
      stats: '4.9x Faster Responses',
    },
    WALK_IN: {
      title: 'Verified Walk-In Interview Drives',
      description:
        'Access confirmed, company-verified walk-in interview schedules across major tech parks, industrial corridors, and commercial hubs nationwide.',
      benefits: [
        'Guaranteed entry with digital QR interview passes',
        'Direct venue location mapping and HR contact desk',
        'Immediate on-the-spot offer letters for qualified talent',
      ],
      badge: 'Fast Track',
      stats: '15,000+ Drives Hosted',
    },
    ENTERPRISE: {
      title: 'Enterprise-Grade Talent Acquisition',
      description:
        'Comprehensive candidate sourcing, ATS integration, background verification, and automated applicant pipeline management for companies of all sizes.',
      benefits: [
        'Aadhaar and certificate-verified candidate profiles',
        'Smart candidate filtering with customized screening questions',
        'Dedicated account manager and technical hiring support',
      ],
      badge: 'Corporate Suite',
      stats: '50,000+ Verified Companies',
    },
  };

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
      avatarBg: '#2563EB',
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

  const currentService = SERVICE_CONTENT[activeServiceTab];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Fixed Header Nav (Pure White) */}
      <View style={[styles.topNavBar, { paddingTop: topInset + (Platform.OS === 'android' ? 6 : 4) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>
        <View style={styles.topNavTitleContainer}>
          <Building2 size={18} color="#2563EB" strokeWidth={2.2} />
          <Text style={styles.topNavTitle}>About JobMarket</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SECTION 1: HERO SPOTLIGHT (Pure White & Vibrant Blue) */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Hero Main Headline */}
          <Text style={styles.heroTitle}>
            Unlock Your Full Career & Hiring Potential
          </Text>

          {/* Hero Description */}
          <Text style={styles.heroSubtitle}>
            Connecting ambitious job seekers with verified enterprise employers nationwide through direct contact, transparent hiring, and intelligent matching.
          </Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.heroPrimaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CandidateMain', { screen: 'CandidateJobsTab' })}
          >
            <Text style={styles.heroPrimaryButtonText}>Explore 50,000+ Jobs</Text>
            <View style={styles.heroButtonArrowCircle}>
              <ArrowRight size={14} color="#2563EB" strokeWidth={2.6} />
            </View>
          </TouchableOpacity>

          {/* Bullet Highlights with Blue Icons */}
          <View style={styles.heroBulletsList}>
            <View style={styles.heroBulletItem}>
              <View style={styles.heroBulletDot}>
                <Check size={12} color="#2563EB" strokeWidth={3} />
              </View>
              <Text style={styles.heroBulletText}>Direct HR calling & instant interview scheduling</Text>
            </View>

            <View style={styles.heroBulletItem}>
              <View style={styles.heroBulletDot}>
                <Check size={12} color="#2563EB" strokeWidth={3} />
              </View>
              <Text style={styles.heroBulletText}>100% verified companies & zero placement fees</Text>
            </View>

            <View style={styles.heroBulletItem}>
              <View style={styles.heroBulletDot}>
                <Check size={12} color="#2563EB" strokeWidth={3} />
              </View>
              <Text style={styles.heroBulletText}>Competitive salaries with transparent company profiles</Text>
            </View>
          </View>

          {/* Social Proof Avatar & Metric Banner */}
          <View style={styles.heroSocialProofCard}>
            <View style={styles.heroAvatarStack}>
              <Image
                source={{ uri: CORPORATE_PROFESSIONAL_IMG }}
                style={[styles.heroAvatarImage, { zIndex: 3 }]}
              />
              <Image
                source={{ uri: INDUSTRIAL_WELDER_IMG }}
                style={[styles.heroAvatarImage, { marginLeft: -10, zIndex: 2 }]}
              />
              <Image
                source={{ uri: SOFTWARE_ENGINEER_IMG }}
                style={[styles.heroAvatarImage, { marginLeft: -10, zIndex: 1 }]}
              />
            </View>
            <View style={styles.heroSocialProofContent}>
              <Text style={styles.heroSocialProofVal}>1.2M+ Active Job Seekers</Text>
              <Text style={styles.heroSocialProofSub}>& 50,000+ Verified Hiring Partners</Text>
            </View>
          </View>

          {/* Spotlight Stats Grid */}
          <View style={styles.heroStatsGrid}>
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatNumber}>10M+</Text>
              <Text style={styles.heroStatLabel}>Applications</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatNumber}>500K+</Text>
              <Text style={styles.heroStatLabel}>Live Vacancies</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatNumber}>98%</Text>
              <Text style={styles.heroStatLabel}>Satisfaction</Text>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SECTION 2: CAREER FREEDOM & SERVICES TABS (Pure White & Blue) */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.whiteSectionContainer}>
          <View style={styles.sectionHeaderWrap}>
            <View style={styles.sectionBadgePill}>
              <TrendingUp size={12} color="#2563EB" />
              <Text style={styles.sectionBadgeText}>Career & Hiring Freedom</Text>
            </View>
            <Text style={styles.sectionMainTitle}>
              Built to Accelerate Every Step of Your Career
            </Text>
            <Text style={styles.sectionSubtitle}>
              Our features are designed to address the challenges of modern hiring, giving both candidates and employers the transparent tools needed to succeed.
            </Text>
          </View>

          {/* Interactive Horizontal Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceTabsScroll}
          >
            {SERVICE_TABS.map((tab) => {
              const isActive = activeServiceTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.8}
                  style={[styles.serviceTabPill, isActive && styles.serviceTabPillActive]}
                  onPress={() => setActiveServiceTab(tab.id as any)}
                >
                  <Text style={[styles.serviceTabPillText, isActive && styles.serviceTabPillTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Dynamic Service Spotlight Card */}
          <View style={styles.spotlightCard}>
            <View style={styles.spotlightTopRow}>
              <View style={styles.spotlightBadgePill}>
                <Text style={styles.spotlightBadgeText}>{currentService.badge}</Text>
              </View>
              <Text style={styles.spotlightStatText}>{currentService.stats}</Text>
            </View>

            <Text style={styles.spotlightCardTitle}>{currentService.title}</Text>
            <Text style={styles.spotlightCardDesc}>{currentService.description}</Text>

            <View style={styles.spotlightDivider} />

            <Text style={styles.spotlightBenefitsHeader}>Key Highlights:</Text>
            <View style={styles.spotlightBenefitsList}>
              {currentService.benefits.map((benefit, bIdx) => (
                <View key={bIdx} style={styles.spotlightBenefitItem}>
                  <View style={styles.spotlightBenefitIconCircle}>
                    <Check size={12} color="#2563EB" strokeWidth={2.8} />
                  </View>
                  <Text style={styles.spotlightBenefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.spotlightActionButton}
              onPress={() => navigation.navigate('CandidateMain', { screen: 'CandidateJobsTab' })}
            >
              <Text style={styles.spotlightActionText}>Get Started Now</Text>
              <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SECTION 3: CUTTING-EDGE FEATURES (4 BENTO CARDS) */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.whiteSectionContainer}>
          <View style={styles.sectionHeaderWrap}>
            <View style={styles.sectionBadgePill}>
              <Zap size={12} color="#2563EB" />
              <Text style={styles.sectionBadgeText}>Platform Architecture</Text>
            </View>
            <Text style={styles.sectionMainTitle}>
              Empower Your Journey with Cutting-Edge Features
            </Text>
            <Text style={styles.sectionSubtitle}>
              Engineered with advanced mobile workflows, bank-grade encryption, and seamless interview tracking.
            </Text>
          </View>

          <View style={styles.featureGridContainer}>
            {/* Feature Card 1 */}
            <View style={styles.featureGridCard}>
              <View style={styles.featureCardHeaderRow}>
                <View style={styles.featureCardIconBox}>
                  <PhoneCall size={18} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureCardTitle}>Direct HR Call & WhatsApp</Text>
              </View>
              <Text style={styles.featureCardDesc}>
                Directly connect with company talent leaders and HR decision makers without intermediary agencies or hidden spam.
              </Text>
              <View style={styles.featureCardTagRow}>
                <View style={styles.featureCardTag}>
                  <Text style={styles.featureCardTagText}>Instant Access</Text>
                </View>
              </View>
            </View>

            {/* Feature Card 2 */}
            <View style={styles.featureGridCard}>
              <View style={styles.featureCardHeaderRow}>
                <View style={styles.featureCardIconBox}>
                  <ShieldCheck size={18} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureCardTitle}>100% Verified Employers</Text>
              </View>
              <Text style={styles.featureCardDesc}>
                Every company on our platform undergoes strict GSTIN, PAN, and corporate identity verification before posting jobs.
              </Text>
              <View style={styles.featureCardTagRow}>
                <View style={styles.featureCardTag}>
                  <Text style={styles.featureCardTagText}>Zero Fraud Guarantee</Text>
                </View>
              </View>
            </View>

            {/* Feature Card 3 */}
            <View style={styles.featureGridCard}>
              <View style={styles.featureCardHeaderRow}>
                <View style={styles.featureCardIconBox}>
                  <Briefcase size={18} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureCardTitle}>500+ Industry Domains</Text>
              </View>
              <Text style={styles.featureCardDesc}>
                Opportunities spanning Software Engineering, AI, Healthcare, Finance, Skilled Technical Trades, Sales, and Logistics.
              </Text>
              <View style={styles.featureCardTagRow}>
                <View style={styles.featureCardTag}>
                  <Text style={styles.featureCardTagText}>All Career Levels</Text>
                </View>
              </View>
            </View>

            {/* Feature Card 4 */}
            <View style={styles.featureGridCard}>
              <View style={styles.featureCardHeaderRow}>
                <View style={styles.featureCardIconBox}>
                  <Lock size={18} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureCardTitle}>Enterprise Data Privacy</Text>
              </View>
              <Text style={styles.featureCardDesc}>
                AES-256 encrypted candidate profiles and digital resumes. Your sensitive contact data is shared only when you apply.
              </Text>
              <View style={styles.featureCardTagRow}>
                <View style={styles.featureCardTag}>
                  <Text style={styles.featureCardTagText}>AES-256 Encrypted</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SECTION 4: SOCIAL IMPACT & TESTIMONIALS */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.whiteSectionContainer}>
          <View style={styles.sectionHeaderWrap}>
            <View style={styles.sectionBadgePill}>
              <Users size={12} color="#2563EB" />
              <Text style={styles.sectionBadgeText}>Social Impact & Stories</Text>
            </View>
            <Text style={styles.sectionMainTitle}>
              Real Candidates. Real Recruiters. Real Results.
            </Text>

            {/* Trust Rating Bar */}
            <View style={styles.trustRatingBar}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} color="#2563EB" fill="#2563EB" />
                ))}
              </View>
              <Text style={styles.trustRatingText}>
                <Text style={{ fontWeight: '800', color: '#0F172A' }}>4.9/5 Rating</Text> based on 50,000+ reviews
              </Text>
            </View>
          </View>

          {/* Testimonial Cards */}
          <View style={styles.testimonialsList}>
            {TESTIMONIALS.map((t) => (
              <View key={t.id} style={styles.testimonialCard}>
                <View style={styles.quoteIconBadge}>
                  <Quote size={16} color="#2563EB" />
                </View>
                <Text style={styles.testimonialQuoteText}>"{t.quote}"</Text>

                <View style={styles.testimonialDivider} />

                <View style={styles.testimonialAuthorRow}>
                  {t.image ? (
                    <Image source={{ uri: t.image }} style={styles.authorAvatarImage} />
                  ) : (
                    <View style={[styles.authorAvatarCircle, { backgroundColor: t.avatarBg }]}>
                      <Text style={styles.authorAvatarText}>{t.avatarInitial}</Text>
                    </View>
                  )}
                  <View style={styles.authorInfoCol}>
                    <Text style={styles.authorName}>{t.name}</Text>
                    <Text style={styles.authorRole}>{t.role}</Text>
                    <Text style={styles.authorCompany}>{t.company}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SECTION 5: AWARDS & INDUSTRY RECOGNITION (Pure White & Blue) */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.awardsSectionContainer}>
          <View style={styles.awardsHeaderRow}>
            <Award size={20} color="#2563EB" />
            <Text style={styles.awardsSectionTitle}>Awards & Recognition</Text>
          </View>

          <View style={styles.awardsGrid}>
            <View style={styles.awardBadgeItem}>
              <View style={styles.awardIconCircle}>
                <ShieldCheck size={20} color="#2563EB" />
              </View>
              <Text style={styles.awardBadgeTitle}>ISO 27001</Text>
              <Text style={styles.awardBadgeSubtitle}>Information Security</Text>
            </View>

            <View style={styles.awardBadgeItem}>
              <View style={styles.awardIconCircle}>
                <Building2 size={20} color="#2563EB" />
              </View>
              <Text style={styles.awardBadgeTitle}>Startup India</Text>
              <Text style={styles.awardBadgeSubtitle}>DPIIT Recognized</Text>
            </View>

            <View style={styles.awardBadgeItem}>
              <View style={styles.awardIconCircle}>
                <Award size={20} color="#2563EB" />
              </View>
              <Text style={styles.awardBadgeTitle}>Top Platform</Text>
              <Text style={styles.awardBadgeSubtitle}>Hiring Excellence 2026</Text>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SECTION 6: BOTTOM CALL TO ACTION BANNER */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.ctaBannerContainer}>
          <Text style={styles.ctaBannerTitle}>Ready to Accelerate Your Career?</Text>
          <Text style={styles.ctaBannerSub}>
            Join over 1.2 million professionals and 50,000 verified employers discovering the future of direct hiring today.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.ctaBannerButton}
            onPress={() => navigation.navigate('CandidateMain', { screen: 'CandidateJobsTab' })}
          >
            <Text style={styles.ctaBannerButtonText}>Browse All Open Jobs</Text>
            <ArrowRight size={16} color="#2563EB" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* SECTION 7: APP INFORMATION & POLICIES (Pure White & Blue) */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.appInfoContainer}>
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoHeaderRow}>
              <Info size={16} color="#2563EB" />
              <Text style={styles.appInfoTitle}>Application Information</Text>
            </View>

            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Platform Version</Text>
              <Text style={styles.appInfoVal}>v2.4.0 (Build 112)</Text>
            </View>

            <View style={styles.appInfoDivider} />

            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Platform Status</Text>
              <View style={styles.appStatusPill}>
                <View style={styles.appStatusDot} />
                <Text style={styles.appStatusText}>Operational 99.99%</Text>
              </View>
            </View>
          </View>

          {/* Footer Copyright Notice */}
          <View style={styles.footerWrap}>
            <Text style={styles.footerCopyText}>© 2026 JobMarket Technologies Inc. All rights reserved.</Text>
            <Text style={styles.footerNoteText}>
              Empowering job seekers & enterprises with seamless, direct, and zero-fee hiring across India.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* Top Navigation Bar (Pure White) */
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* SECTION 1: HERO SECTION (Off-White Canvas with White Cards) */
  heroSection: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  heroBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  heroTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 33,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 12,
    paddingLeft: 22,
    paddingRight: 8,
    marginBottom: 22,
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  heroPrimaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroButtonArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroBulletsList: {
    gap: 10,
    marginBottom: 22,
  },
  heroBulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroBulletDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBulletText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },

  heroSocialProofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  heroAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#EFF6FF',
  },
  heroAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroAvatarInit: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSocialProofContent: {
    flex: 1,
  },
  heroSocialProofVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSocialProofSub: {
    fontSize: 11,
    color: '#2563EB',
    marginTop: 1,
    fontWeight: '600',
  },

  heroStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  heroStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2563EB',
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EFF6FF',
  },

  /* OFF-WHITE SECTIONS WITH SOLID WHITE CARDS */
  whiteSectionContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionHeaderWrap: {
    marginBottom: 18,
  },
  sectionBadgePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 10,
  },
  sectionBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 27,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    fontWeight: '400',
  },

  /* SERVICE TABS & SPOTLIGHT */
  serviceTabsScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  serviceTabPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceTabPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  serviceTabPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2563EB',
  },
  serviceTabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  spotlightCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 18,
  },
  spotlightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  spotlightBadgePill: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  spotlightBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  spotlightStatText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  spotlightCardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  spotlightCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 14,
  },
  spotlightDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  spotlightBenefitsHeader: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  spotlightBenefitsList: {
    gap: 8,
    marginBottom: 18,
  },
  spotlightBenefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  spotlightBenefitIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  spotlightBenefitText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    flex: 1,
  },
  spotlightActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
  },
  spotlightActionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* FEATURE GRID */
  featureGridContainer: {
    gap: 12,
  },
  featureGridCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  featureCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  featureCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  featureCardDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  featureCardTagRow: {
    flexDirection: 'row',
  },
  featureCardTag: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  featureCardTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },

  /* SOCIAL IMPACT & TRUST */
  trustRatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  trustRatingText: {
    fontSize: 12,
    color: '#64748B',
  },

  testimonialsList: {
    gap: 14,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  quoteIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  testimonialQuoteText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  testimonialDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  testimonialAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  authorAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  authorInfoCol: {
    flex: 1,
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  authorRole: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 1,
  },
  authorCompany: {
    fontSize: 11,
    color: '#64748B',
  },

  /* SECTION 5: AWARDS SECTION (Off-White & White Cards) */
  awardsSectionContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  awardsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  awardsSectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  awardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  awardBadgeItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  awardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  awardBadgeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  awardBadgeSubtitle: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'center',
  },

  /* SECTION 6: CTA BANNER */
  ctaBannerContainer: {
    backgroundColor: '#2563EB',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 20,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  ctaBannerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaBannerSub: {
    fontSize: 12.5,
    color: '#DBEAFE',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  ctaBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  ctaBannerButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },

  /* SECTION 7: APP INFO & FOOTER */
  appInfoContainer: {
    paddingHorizontal: 16,
  },
  appInfoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  appInfoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  appInfoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  appInfoLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  appInfoVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  appInfoDivider: {
    height: 1,
    backgroundColor: '#DBEAFE',
    marginVertical: 10,
  },
  appStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  appStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  appStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },

  footerWrap: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerCopyText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  footerNoteText: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
});
