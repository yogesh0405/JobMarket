import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  Lock,
  AlertCircle,
  Database,
  UserCheck,
  Mail,
  ChevronRight,
  Scale,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
  route?: {
    params?: {
      initialTab?: 'terms' | 'privacy';
      tab?: 'terms' | 'privacy';
    };
  };
}

export const TermsAndPrivacyScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 12 : 24);

  const initialTabParam = route?.params?.initialTab || route?.params?.tab;
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(
    initialTabParam === 'privacy' ? 'privacy' : 'terms'
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header Bar */}
      <View style={[styles.topHeaderBar, { paddingTop: topInset }]}>
        <View style={styles.topHeaderNavRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color={COLORS.slate900} strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.topHeaderTitle}>Terms & Privacy</Text>

          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Segmented Tab Switcher */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('terms')}
            style={[styles.tabButton, activeTab === 'terms' && styles.tabButtonActive]}
          >
            <View style={styles.tabContentRow}>
              <Scale size={15} color={activeTab === 'terms' ? COLORS.primary : COLORS.slate500} />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'terms' && styles.tabButtonTextActive,
                ]}
              >
                Terms of Service
              </Text>
            </View>
            {activeTab === 'terms' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('privacy')}
            style={[styles.tabButton, activeTab === 'privacy' && styles.tabButtonActive]}
          >
            <View style={styles.tabContentRow}>
              <ShieldCheck
                size={15}
                color={activeTab === 'privacy' ? COLORS.primary : COLORS.slate500}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'privacy' && styles.tabButtonTextActive,
                ]}
              >
                Privacy Policy
              </Text>
            </View>
            {activeTab === 'privacy' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content Body */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'terms' ? (
          /* ================= TERMS OF SERVICE VIEW ================= */
          <View style={styles.legalBodyContainer}>
            {/* Spotlight Banner Card */}
            <View style={styles.summaryCard}>
              <View style={styles.headerInfoRow}>
                <Text style={styles.heroTitle}>Terms of Service</Text>
                <Text style={styles.lastUpdatedText}>Updated August 2026</Text>
              </View>
              <Text style={styles.heroDescription}>
                Effective for all candidates and employers accessing the JobMarket platform via web
                or mobile application. Please review these terms carefully.
              </Text>
            </View>

            {/* Main Policy Content Card */}
            <View style={styles.sectionCard}>
              {/* Clause 1 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <CheckCircle2 size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>1. Acceptance of Terms</Text>
                </View>
                <Text style={styles.clauseBody}>
                  By creating an account, browsing listings, or accessing the JobMarket platform
                  (web or mobile app), you agree to be legally bound by these Terms of Service and
                  all applicable local employment regulations. If you do not agree to these terms,
                  please do not access our services.
                </Text>
              </View>

              <View style={styles.sectionDivider} />

              {/* Clause 2 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <Users size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>2. User Accounts & Responsibilities</Text>
                </View>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Candidates: </Text>
                      You agree to provide complete, authentic information regarding your skills,
                      work history, certifications, and contact details. Misrepresenting identity or
                      qualifications is strictly prohibited.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Employers: </Text>
                      All job postings must represent genuine, active employment vacancies with
                      transparent compensation, designated roles, and authentic company details.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Account Confidentiality: </Text>
                      You are solely responsible for safeguarding your login credentials and
                      one-time passcodes (OTP). Notify us immediately if you suspect unauthorized
                      access.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionDivider} />

              {/* Clause 3 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <Briefcase size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>3. Job Postings & Fair Hiring Policy</Text>
                </View>
                <Text style={styles.clauseBody}>
                  JobMarket strictly prohibits discriminatory hiring, deceptive job descriptions,
                  advance application fee demands, or multi-level marketing (MLM) schemes. Any job
                  post violating these principles will be terminated immediately, and offending
                  accounts permanently barred.
                </Text>
              </View>

              <View style={styles.sectionDivider} />

              {/* Clause 4 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <Lock size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>4. Free Candidate Access Guarantee</Text>
                </View>
                <Text style={styles.clauseBody}>
                  Job searching, profile creation, resume uploads, direct employer contact, and job
                  applications are 100% free for all job seekers. JobMarket will never solicit fees
                  from candidates for job interviews or recruitment placement.
                </Text>
              </View>

              <View style={styles.sectionDivider} />

              {/* Clause 5 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <AlertCircle size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>5. Limitation of Liability</Text>
                </View>
                <Text style={styles.clauseBody}>
                  JobMarket facilitates direct connections between employers and job candidates.
                  While we verify employer credentials and listings, JobMarket does not guarantee
                  interview outcomes, employment offers, or individual workplace performance.
                </Text>
              </View>

              <View style={styles.sectionDivider} />

              {/* Clause 6 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <Scale size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>6. Violations & Account Termination</Text>
                </View>
                <Text style={styles.clauseBody}>
                  We reserve the right to temporarily suspend or permanently terminate access for
                  any user or enterprise who breaches these terms, engages in spamming, abuses
                  direct communication channels, or violates community trust standards.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          /* ================= PRIVACY POLICY VIEW ================= */
          <View style={styles.legalBodyContainer}>
            {/* Spotlight Banner Card */}
            <View style={styles.summaryCard}>
              <View style={styles.headerInfoRow}>
                <Text style={styles.heroTitle}>Privacy Policy</Text>
                <Text style={styles.lastUpdatedText}>Updated August 2026</Text>
              </View>
              <Text style={styles.heroDescription}>
                Your privacy and data security are our highest priority. This policy outlines how
                we collect, process, and protect your information across our services.
              </Text>
            </View>

            {/* Main Policy Content Card */}
            <View style={styles.sectionCard}>
              {/* Privacy Clause 1 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <Database size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>1. Information We Collect</Text>
                </View>
                <Text style={styles.clauseBody}>
                  We collect information you provide directly when creating a candidate or employer
                  profile, including your full name, email address, mobile phone number, employment
                  history, skills, education, and uploaded resume files. When authenticating via
                  Google OAuth, we receive only your verified email, display name, and avatar.
                </Text>
              </View>

              <View style={styles.sectionDivider} />

              {/* Privacy Clause 2 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <Lock size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>2. How We Use & Protect Your Data</Text>
                </View>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Job Applications: </Text>
                      Your resume and profile credentials are shared with employers exclusively
                      when you apply to their job postings or opt-in to verified discovery.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Zero Data Selling: </Text>
                      We strictly never sell, trade, or rent candidate personal details, resumes,
                      or phone numbers to third-party telemarketers or advertisers.
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.boldText}>Encrypted Storage: </Text>
                      All database transactions, session authentication tokens, and uploaded files
                      are encrypted with industry-standard TLS/SSL encryption protocols.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionDivider} />

              {/* Privacy Clause 3 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <ShieldCheck size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>3. Cookies & Session Management</Text>
                </View>
                <Text style={styles.clauseBody}>
                  JobMarket utilizes secure session tokens and device identifiers solely to
                  maintain active logins, preserve filters, and deliver real-time push
                  notifications for interviews and messages. We do not track users across external
                  websites or apps.
                </Text>
              </View>

              <View style={styles.sectionDivider} />

              {/* Privacy Clause 4 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <UserCheck size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>4. Candidate Rights & Account Deletion</Text>
                </View>
                <Text style={styles.clauseBody}>
                  You retain complete ownership over your information. In accordance with Google
                  Play and global privacy standards, you can edit your profile, update documents,
                  or permanently delete your account and all associated data directly from the
                  Security Settings screen at any time.
                </Text>
              </View>

              <View style={styles.sectionDivider} />

              {/* Privacy Clause 5 */}
              <View style={styles.clauseBlock}>
                <View style={styles.clauseHeaderRow}>
                  <CheckCircle2 size={17} color={COLORS.primary} />
                  <Text style={styles.clauseTitle}>5. Data Retention & Erasure Standards</Text>
                </View>
                <Text style={styles.clauseBody}>
                  Upon account deletion confirmation, all active sessions are invalidated immediately,
                  and personal records, resumes, and contact credentials are permanently purged
                  from our operational database within 30 days.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Switch Card between Terms & Privacy */}
        <TouchableOpacity
          style={styles.switchPolicyCard}
          activeOpacity={0.7}
          onPress={() => setActiveTab(activeTab === 'terms' ? 'privacy' : 'terms')}
        >
          <View style={styles.switchPolicyLeft}>
            {activeTab === 'terms' ? (
              <ShieldCheck size={18} color={COLORS.primary} />
            ) : (
              <Scale size={18} color={COLORS.primary} />
            )}
            <View>
              <Text style={styles.switchPolicyTitle}>
                {activeTab === 'terms' ? 'View Privacy Policy' : 'View Terms of Service'}
              </Text>
              <Text style={styles.switchPolicySub}>
                {activeTab === 'terms'
                  ? 'Learn how we protect and process your data'
                  : 'Review user rules and platform obligations'}
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color={COLORS.slate400} />
        </TouchableOpacity>

        {/* Support & Assistance Card */}
        <View style={styles.supportCard}>
          <View style={styles.supportCardLeft}>
            <View style={styles.supportIconBox}>
              <Mail size={16} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Questions about Legal or Privacy?</Text>
              <Text style={styles.supportSubtitle}>
                Our compliance and support desk is available to assist you.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.supportActionBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.supportActionBtnText}>Contact Support</Text>
            <ChevronRight size={14} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerCopyText}>
            © 2026 JobMarket Technologies Inc. All rights reserved.
          </Text>
          <Text style={styles.footerNoteText}>
            Committed to fair, transparent hiring and enterprise-grade candidate privacy.
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

  /* Top Header Bar */
  topHeaderBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topHeaderNavRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  topHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.slate900,
    letterSpacing: -0.2,
  },
  backButtonPlaceholder: {
    width: 44,
    height: 44,
  },

  /* Tab Bar */
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 44,
  },
  tabButtonActive: {},
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.slate500,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  /* Scroll Area */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  /* Legal Container */
  legalBodyContainer: {
    gap: 16,
  },

  /* Summary Hero Card */
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 8,
    ...SHADOWS.sm,
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lastUpdatedText: {
    fontSize: 11.5,
    color: COLORS.slate500,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate900,
    letterSpacing: -0.2,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.slate600,
  },

  /* Main Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 14,
    ...SHADOWS.sm,
  },
  clauseBlock: {
    gap: 6,
  },
  clauseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clauseTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.slate900,
    letterSpacing: -0.1,
  },
  clauseBody: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.slate600,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },

  /* Bullet List */
  bulletList: {
    gap: 8,
    paddingLeft: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    fontSize: 14,
    color: COLORS.primary,
    lineHeight: 19,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.slate600,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.slate900,
  },

  /* Switch Policy Card */
  switchPolicyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    ...SHADOWS.sm,
  },
  switchPolicyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  switchPolicyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  switchPolicySub: {
    fontSize: 11.5,
    color: COLORS.slate500,
    marginTop: 1,
  },

  /* Support Card */
  supportCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    gap: 12,
    ...SHADOWS.sm,
  },
  supportCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  supportIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  supportSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 16,
  },
  supportActionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
  },
  supportActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Footer Note */
  footerWrap: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  footerCopyText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.slate500,
    textAlign: 'center',
  },
  footerNoteText: {
    fontSize: 11,
    color: COLORS.slate400,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 15,
  },
});

export default TermsAndPrivacyScreen;
