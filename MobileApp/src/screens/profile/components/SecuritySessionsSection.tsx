import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  Smartphone,
  Laptop,
  LogOut,
  MapPin,
  Clock,
  History,
} from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

interface SecuritySessionsSectionProps {
  sessions: any[];
  sessionsLoading: boolean;
  onRevokeSession: (sessionId: string, deviceName: string) => void;
  onTerminateOtherSessions?: () => void;
  isTerminatingOtherSessions?: boolean;
}

export const SecuritySessionsSection: React.FC<SecuritySessionsSectionProps> = ({
  sessions,
  sessionsLoading,
  onRevokeSession,
  onTerminateOtherSessions,
  isTerminatingOtherSessions = false,
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* Header Block matching Web App */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <History size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Login Sessions History & Security Log</Text>
          </View>
          <Text style={styles.sectionSub}>
            Audit log of active & past logins across browsers and mobile platforms.
          </Text>
        </View>

        {sessions.length > 1 && onTerminateOtherSessions ? (
          <TouchableOpacity
            style={styles.terminateAllButton}
            activeOpacity={0.7}
            disabled={isTerminatingOtherSessions}
            onPress={onTerminateOtherSessions}
          >
            <LogOut size={12} color="#DC2626" />
            <Text style={styles.terminateAllText}>
              {isTerminatingOtherSessions ? 'Terminating...' : 'Logout Others'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Loading Box */}
      {sessionsLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Detecting active device sessions...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No active sessions detected.</Text>
        </View>
      ) : (
        /* Sessions List Cards matching Web App styling */
        <View style={styles.sessionsList}>
          {sessions.map((sess, idx) => {
            const isCurrent = Boolean(sess.isCurrent || sess.is_current);
            const dType = (sess?.deviceType || sess?.device_type || '').toLowerCase();
            const osStr = (sess?.os || '').toLowerCase();
            const isMobile =
              dType === 'mobile' ||
              dType === 'tablet' ||
              osStr.includes('android') ||
              osStr.includes('ios');

            const DeviceIconComp = isMobile ? Smartphone : Laptop;
            const deviceName = sess.deviceName || sess.device_name || (isMobile ? 'JobMarket Android App' : 'Google Chrome on macOS');
            const browserName = sess.browser || (isMobile ? 'JobMarket Android App' : 'Google Chrome');
            const locationStr = sess.location || 'Maharashtra, India';
            const lastActiveTime = isCurrent
              ? 'Active now'
              : sess.lastUsedAt
              ? new Date(sess.lastUsedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              : 'Recently active';

            return (
              <View
                key={sess.id || idx}
                style={[
                  styles.sessionCard,
                  isCurrent ? styles.sessionCardCurrent : styles.sessionCardDefault,
                ]}
              >
                {/* Top Row: Icon + Device Info + Revoke Action */}
                <View style={styles.cardTopRow}>
                  <View style={styles.cardLeftBlock}>
                    <View
                      style={[
                        styles.deviceIconContainer,
                        isCurrent ? styles.deviceIconCurrent : styles.deviceIconDefault,
                      ]}
                    >
                      <DeviceIconComp
                        size={18}
                        color={isCurrent ? '#2563EB' : '#64748B'}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.deviceNameText} numberOfLines={1}>
                        {deviceName}
                      </Text>
                      <Text style={styles.browserSubtitleText} numberOfLines={1}>
                        {browserName}
                      </Text>
                    </View>
                  </View>

                  {!isCurrent ? (
                    <TouchableOpacity
                      style={styles.logoutButton}
                      activeOpacity={0.7}
                      onPress={() => onRevokeSession(sess.id, deviceName)}
                    >
                      <LogOut size={13} color="#DC2626" />
                      <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Bottom Row: Metadata (Location & Active State matching Web App) */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={13} color="#64748B" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {locationStr}
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Clock
                      size={13}
                      color={isCurrent ? '#16A34A' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        isCurrent ? styles.activeStatusText : styles.inactiveStatusText,
                      ]}
                      numberOfLines={1}
                    >
                      {isCurrent ? '● Active now' : `Last active: ${lastActiveTime}`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  terminateAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  terminateAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  loadingBox: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  sessionsList: {
    gap: 10,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    gap: 10,
  },
  sessionCardCurrent: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  sessionCardDefault: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardLeftBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIconCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  deviceIconDefault: {
    backgroundColor: '#F8FAFC',
  },
  deviceNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  browserSubtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 4,
  },
  logoutButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DC2626',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  activeStatusText: {
    color: '#16A34A',
    fontWeight: '700',
  },
  inactiveStatusText: {
    color: '#64748B',
    fontWeight: '500',
  },
});
