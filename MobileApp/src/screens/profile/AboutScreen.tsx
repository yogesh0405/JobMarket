import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
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
        {/* SINGLE MASTER CARD: ABOUT US PLATFORM OVERVIEW */}
        <View style={styles.singleMasterCard}>
          {/* SECTION 1: OVERVIEW & PLATFORM STATS */}
          <View>
            <Text style={styles.heroTitle}>About JobMarket</Text>
            <Text style={styles.heroSubtitle}>
              India's most trusted industrial and factory job marketplace, connecting skilled professionals with top manufacturing companies.
            </Text>

            {/* 4 Statistics Items (No icon background boxes) */}
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Globe size={18} color="#2563EB" />
                <Text style={styles.statNumber}>10M+</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Active Users</Text>
              </View>

              <View style={styles.statCell}>
                <Briefcase size={18} color="#0891B2" />
                <Text style={styles.statNumber}>500K+</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Jobs Posted</Text>
              </View>

              <View style={styles.statCell}>
                <CheckCircle2 size={18} color="#15803D" />
                <Text style={styles.statNumber}>2M+</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Hires Made</Text>
              </View>

              <View style={[styles.statCell, { borderRightWidth: 0 }]}>
                <Building2 size={18} color="#B45309" />
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Companies</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionDividerInline} />

          {/* SECTION 2: OUR MISSION */}
          <View>
            <View style={styles.sectionHeaderRow}>
              <Compass size={18} color="#2563EB" />
              <Text style={styles.sectionTitle}>Our Mission</Text>
            </View>

            <Text style={styles.bodyText}>
              At JobMarket, we believe everyone deserves access to meaningful employment. Our platform bridges the gap between skilled workers and top organizations across India. We leverage direct matching to make hiring fast, transparent, and direct for candidate and recruiter alike.
            </Text>
          </View>

          <View style={styles.sectionDividerInline} />

          {/* SECTION 3: PLATFORM HIGHLIGHTS / WHY CHOOSE JOBMARKET */}
          <View>
            <View style={styles.sectionHeaderRow}>
              <Award size={18} color="#15803D" />
              <Text style={styles.sectionTitle}>Why Choose JobMarket?</Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItemRow}>
                <Sparkles size={16} color="#2563EB" style={{ marginTop: 2 }} />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Smart Job Matching</Text>
                  <Text style={styles.featureDesc}>
                    AI-powered recommendations that match your trade skills with suitable job opportunities.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItemRow}>
                <ShieldCheck size={16} color="#2563EB" style={{ marginTop: 2 }} />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Verified Employers</Text>
                  <Text style={styles.featureDesc}>
                    Every manufacturing company on our platform goes through identity and GST verification.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItemRow}>
                <Zap size={16} color="#2563EB" style={{ marginTop: 2 }} />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Instant Applications</Text>
                  <Text style={styles.featureDesc}>
                    Apply to industrial jobs instantly with a single tap using your saved profile and resume.
                  </Text>
                </View>
              </View>

              <View style={[styles.featureItemRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <BarChart3 size={16} color="#2563EB" style={{ marginTop: 2 }} />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Real-time Tracking</Text>
                  <Text style={styles.featureDesc}>
                    Track your application progress, shortlist updates, and scheduled interview status in real-time.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionDividerInline} />

          {/* SECTION 4: WORKFORCE COMMITMENT */}
          <View>
            <View style={styles.sectionHeaderRow}>
              <Users size={18} color="#B45309" />
              <Text style={styles.sectionTitle}>Empowering India's Workforce</Text>
            </View>

            <Text style={styles.bodyText}>
              From ITI tradesmen and CNC machinists to plant engineers and production supervisors, JobMarket powers the talent pipeline for India's growing industrial manufacturing ecosystem.
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
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 18,
    gap: 12,
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
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    gap: 4,
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionDividerInline: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  bodyText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '400',
  },
  featuresList: {
    marginTop: 4,
    gap: 10,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  featureContent: {
    flex: 1,
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
});
