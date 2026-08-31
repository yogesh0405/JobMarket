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
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      {/* Top Brand Header */}
      <View style={[
        styles.topHeader,
        {
          paddingTop: Platform.OS === 'android'
            ? Math.max((StatusBar.currentHeight || 0) + 10, insets.top + 10, 24)
            : Math.max(insets.top + 8, 16),
        },
      ]}>
        <View style={styles.brandRow}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <JobMarketLogoSvg size={28} />
          )}
          <Text style={styles.brandText}>{platformName}</Text>
        </View>
        <View style={styles.statusBadge}>
          <ShieldAlert size={11} color="#DC2626" />
          <Text style={styles.statusBadgeText}>Maintenance</Text>
        </View>
      </View>

      {/* Section Separator */}
      <View style={styles.sectionDivider} />

      {/* Main Full-Screen Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Center Hero Icon */}
        <View style={styles.heroCircle}>
          <Wrench size={26} color={COLORS.primary} strokeWidth={2.2} />
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
                <Mail size={15} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>{supportEmail}</Text>
              </View>
              <ChevronRight size={15} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}

          {contactNumber ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.contactRow, { marginTop: 6 }]}
              onPress={handleCall}
            >
              <View style={styles.contactIconBox}>
                <Phone size={15} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>Helpline Number</Text>
                <Text style={styles.contactValue}>{contactNumber}</Text>
              </View>
              <ChevronRight size={15} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={[styles.bottomFooter, { paddingBottom: Math.max(insets.bottom + 14, 20) }]}>
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
              <RefreshCw size={15} color="#FFFFFF" />
              <Text style={styles.refreshButtonText}>Check If System Is Back Online</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  heroCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
  },
  mainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  mainDescription: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 6,
  },
  subDescription: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  infoCardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  infoCardSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 9,
    gap: 10,
  },
  contactIconBox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  bottomFooter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  refreshButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default MaintenanceModal;
