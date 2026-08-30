import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { Wrench, Mail, Phone, RefreshCw, ChevronRight, ShieldAlert } from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { JobMarketLogoSvg } from './JobMarketLogoSvg';

interface MaintenanceModalProps {
  visible: boolean;
  platformName?: string;
  logoUrl?: string;
  supportEmail?: string;
  contactNumber?: string;
  onRefresh?: () => Promise<void> | void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  visible,
  platformName = 'JobMarket',
  logoUrl,
  supportEmail = 'support@csnjobmarket.com',
  contactNumber = '+91 240 2554000',
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  if (!visible) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 900);
    }
  };

  const handleEmail = () => {
    if (supportEmail) {
      Linking.openURL(`mailto:${supportEmail}`).catch(() => {});
    }
  };

  const handleCall = () => {
    if (contactNumber) {
      Linking.openURL(`tel:${contactNumber}`).catch(() => {});
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      statusBarTranslucent
      animationType="fade"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Brand Header */}
          <View style={styles.topHeader}>
            <View style={styles.brandRow}>
              {logoUrl ? (
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <JobMarketLogoSvg size={36} />
              )}
              <Text style={styles.brandText}>{platformName}</Text>
            </View>
            <View style={styles.statusBadge}>
              <ShieldAlert size={13} color="#DC2626" />
              <Text style={styles.statusBadgeText}>Maintenance</Text>
            </View>
          </View>

          {/* Section Separator */}
          <View style={styles.sectionDivider} />

          {/* Main Full-Screen Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Center Hero Icon */}
            <View style={styles.heroCircle}>
              <Wrench size={42} color={COLORS.primary} strokeWidth={2.2} />
            </View>

            <Text style={styles.mainTitle}>Scheduled System Maintenance</Text>

            <Text style={styles.mainDescription}>
              We are currently performing critical infrastructure updates and database performance tuning to improve your experience.
            </Text>

            <Text style={styles.subDescription}>
              All platform services are temporarily offline. Normal access will resume automatically as soon as maintenance is complete.
            </Text>

            {/* Assistance Information Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardHeader}>Need Urgent Help?</Text>
              <Text style={styles.infoCardSub}>
                Our administrative support team is available during this maintenance window:
              </Text>

              {supportEmail ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.contactRow}
                  onPress={handleEmail}
                >
                  <View style={styles.contactIconBox}>
                    <Mail size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactLabel}>Email Support</Text>
                    <Text style={styles.contactValue}>{supportEmail}</Text>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}

              {contactNumber ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.contactRow, { marginTop: 8 }]}
                  onPress={handleCall}
                >
                  <View style={styles.contactIconBox}>
                    <Phone size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactLabel}>Helpline Number</Text>
                    <Text style={styles.contactValue}>{contactNumber}</Text>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.bottomFooter}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw size={18} color="#FFFFFF" />
                  <Text style={styles.refreshButtonText}>Check If System Is Back Online</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 0,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  mainDescription: {
    fontSize: 14.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  subDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoCardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoCardSub: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
    gap: 12,
  },
  contactIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 13.5,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  bottomFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  refreshButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default MaintenanceModal;
