import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Globe,
  Briefcase,
  CheckCircle2,
  Building2,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  Target,
  Award,
  Users,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
}

export const AboutScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header
        title="About Us"
        subtitle="Industrial & Factory Job Marketplace"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top White Title Header Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>About JobMarket</Text>
          <Text style={styles.heroSubtitle}>
            India's most trusted industrial and factory job marketplace, connecting skilled professionals with top manufacturing companies.
          </Text>
        </View>

        {/* 4 Statistics Cards Grid */}
        <View style={styles.statsGrid}>
          {/* Stat 1 */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Globe size={18} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>10M+</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Active Users</Text>
          </View>

          {/* Stat 2 */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#ECFEFF' }]}>
              <Briefcase size={18} color="#0891B2" />
            </View>
            <Text style={styles.statNumber}>500K+</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Jobs Posted</Text>
          </View>

          {/* Stat 3 */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F0FDF4' }]}>
              <CheckCircle2 size={18} color="#15803D" />
            </View>
            <Text style={styles.statNumber}>2M+</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Hires Made</Text>
          </View>

          {/* Stat 4 */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Building2 size={18} color="#B45309" />
            </View>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Companies</Text>
          </View>
        </View>

        {/* Our Mission Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Target size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Our Mission</Text>
          </View>

          <Text style={styles.bodyText}>
            At JobMarket, we believe everyone deserves access to meaningful employment. Our platform bridges the gap between skilled workers and top organizations across India. We leverage AI-powered matching to make hiring fast, transparent, and direct for candidate and recruiter alike.
          </Text>
        </View>

        {/* Why Choose JobMarket Feature Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Award size={20} color="#15803D" />
            </View>
            <Text style={styles.cardTitle}>Why Choose JobMarket?</Text>
          </View>

          <View style={styles.featuresList}>
            {/* Feature 1 */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Sparkles size={18} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Job Matching</Text>
                <Text style={styles.featureDesc}>
                  AI-powered recommendations that match your skills with suitable job opportunities.
                </Text>
              </View>
            </View>

            {/* Feature 2 */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <ShieldCheck size={18} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Verified Employers</Text>
                <Text style={styles.featureDesc}>
                  Every company on our platform goes through a rigorous identity verification process.
                </Text>
              </View>
            </View>

            {/* Feature 3 */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Zap size={18} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Instant Applications</Text>
                <Text style={styles.featureDesc}>
                  Apply to jobs instantly with a single click using your saved profile and resume.
                </Text>
              </View>
            </View>

            {/* Feature 4 */}
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <BarChart3 size={18} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Real-time Tracking</Text>
                <Text style={styles.featureDesc}>
                  Track your application progress, shortlist updates, and scheduled interview status in real-time.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Industrial Precision & Commitment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Users size={20} color="#B45309" />
            </View>
            <Text style={styles.cardTitle}>Empowering India's Workforce</Text>
          </View>
          <Text style={styles.bodyText}>
            From ITI tradesmen and CNC machinists to plant engineers and production supervisors, JobMarket powers the talent pipeline for India's growing industrial manufacturing ecosystem.
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: SPACING.xl,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  heroBadgeText: {
    color: '#2563EB',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate200,
    ...SHADOWS.sm,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 2,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.slate500,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardHeaderIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  bodyText: {
    ...TYPOGRAPHY.body,
    fontSize: 13.5,
    color: COLORS.slate600,
    lineHeight: 21,
  },
  featuresList: {
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.slate50,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    gap: SPACING.md,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 2,
  },
  featureDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.slate500,
    lineHeight: 17,
  },
});
