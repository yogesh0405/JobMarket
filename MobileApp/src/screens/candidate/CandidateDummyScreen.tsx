import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { UserCheck, ShieldCheck, LogOut, Briefcase, Award, CheckCircle2, Sparkles, Building2 } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export const CandidateDummyScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const displayName = user?.name || user?.email || 'Candidate User';
  const displayEmail = user?.email || '';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandBox}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>JM</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>JobMarket</Text>
            <Text style={styles.brandSub}>Candidate / Employee Workspace</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={16} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.candidateName}>{displayName}</Text>
              <Text style={styles.candidateEmail}>{displayEmail}</Text>
              <View style={styles.roleBadge}>
                <ShieldCheck size={12} color="#2563EB" />
                <Text style={styles.roleBadgeText}>ROLE: EMPLOYEE / CANDIDATE (RBAC)</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.liveStatusRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveStatusText}>100% Authenticated Live Backend Session</Text>
          </View>
        </View>

        {/* Dummy Placeholder Card */}
        <View style={styles.card3D}>
          <View style={styles.sectionHeaderRow}>
            <Sparkles size={22} color="#2563EB" />
            <Text style={styles.cardTitle}>Employee Portal Workspace</Text>
          </View>

          <Text style={styles.cardBodyText}>
            Welcome to JobMarket Candidate Portal! Your account has been authenticated successfully via live database endpoints.
          </Text>

          <View style={styles.featureBox}>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.featureText}>RBAC Access Granted: Employee / Candidate Role</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.featureText}>Live Database Token & Session Active</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.featureText}>Industrial Job Search & Application Engine</Text>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              Note: This candidate portal section is a placeholder workspace. Full job search, ITI trade filters, and candidate profile management modules are under active deployment.
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
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  brandSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  candidateName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  candidateEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardBodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  featureBox: {
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  noticeBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    borderRadius: 6,
  },
  noticeText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
});
