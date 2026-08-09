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
  Compass,
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
        {/* CARD 1: HERO HEADER & PLATFORM STATS */}
        <Text style={styles.groupHeaderLabel}>OVERVIEW & IMPACT</Text>
        <View style={styles.card}>
          <Text style={styles.heroTitle}>About JobMarket</Text>
          <Text style={styles.heroSubtitle}>
            India's most trusted industrial and factory job marketplace, connecting skilled professionals with top manufacturing companies.
          </Text>

          {/* 4 Statistics Items (Flat Grid Cells, No Nested Cards) */}
          <View style={styles.statsGrid}>
            {/* Stat 1 */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Globe size={18} color="#2563EB" />
              </View>
              <Text style={styles.statNumber}>10M+</Text>
              <Text style={styles.statLabel} numberOfLines={1}>Active Users</Text>
            </View>

            {/* Stat 2 */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#ECFEFF' }]}>
                <Briefcase size={18} color="#0891B2" />
              </View>
              <Text style={styles.statNumber}>500K+</Text>
              <Text style={styles.statLabel} numberOfLines={1}>Jobs Posted</Text>
            </View>

            {/* Stat 3 */}
            <View style={styles.statCell}>
              <View style={[styles.statIconBox, { backgroundColor: '#F0FDF4' }]}>
                <CheckCircle2 size={18} color="#15803D" />
              </View>
              <Text style={styles.statNumber}>2M+</Text>
              <Text style={styles.statLabel} numberOfLines={1}>Hires Made</Text>
            </View>

            {/* Stat 4 */}
            <View style={[styles.statCell, { borderRightWidth: 0 }]}>
              <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Building2 size={18} color="#B45309" />
              </View>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel} numberOfLines={1}>Companies</Text>
            </View>
          </View>
        </View>

        {/* CARD 2: OUR MISSION */}
        <Text style={styles.groupHeaderLabel}>OUR MISSION</Text>
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Compass size={20} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Our Mission</Text>
          </View>

          <Text style={styles.bodyText}>
            At JobMarket, we believe everyone deserves access to meaningful employment. Our platform bridges the gap between skilled workers and top organizations across India. We leverage direct matching to make hiring fast, transparent, and direct for candidate and recruiter alike.
          </Text>
        </View>

        {/* CARD 3: WHY CHOOSE JOBMARKET FEATURE SECTION */}
        <Text style={styles.groupHeaderLabel}>PLATFORM HIGHLIGHTS</Text>
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Award size={20} color="#15803D" />
            </View>
            <Text style={styles.cardTitle}>Why Choose JobMarket?</Text>
          </View>

          <View style={styles.featuresList}>
            {/* Feature 1 */}
            <View style={styles.featureItemRow}>
              <View style={[styles.featureIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Sparkles size={18} color="#2563EB" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Job Matching</Text>
                <Text style={styles.featureDesc}>
                  AI-powered recommendations that match your trade skills with suitable job opportunities.
                </Text>
              </View>
            </View>

            {/* Feature 2 */}
            <View style={styles.featureItemRow}>
              <View style={[styles.featureIconBox, { backgroundColor: '#EFF6FF' }]}>
                <ShieldCheck size={18} color="#2563EB" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Verified Employers</Text>
                <Text style={styles.featureDesc}>
                  Every manufacturing company on our platform goes through identity and GST verification.
                </Text>
              </View>
            </View>

            {/* Feature 3 */}
            <View style={styles.featureItemRow}>
              <View style={[styles.featureIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Zap size={18} color="#2563EB" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Instant Applications</Text>
                <Text style={styles.featureDesc}>
                  Apply to industrial jobs instantly with a single tap using your saved profile and resume.
                </Text>
              </View>
            </View>

            {/* Feature 4 */}
            <View style={[styles.featureItemRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.featureIconBox, { backgroundColor: '#EFF6FF' }]}>
                <BarChart3 size={18} color="#2563EB" />
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

        {/* CARD 4: EMPOWERING INDIA'S WORKFORCE */}
        <Text style={styles.groupHeaderLabel}>WORKFORCE COMMITMENT</Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  groupHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    paddingLeft: 4,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 20,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    fontWeight: '500',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 14,
    marginTop: 4,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardHeaderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  bodyText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 21,
  },
  featuresList: {
    gap: 0,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
});
