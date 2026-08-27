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
    <View style={styles.container}>
      {/* Header matching Reference Image */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Active sessions</Text>
          <Text style={styles.subtitle}>
            Devices that are currently signed in to your account
          </Text>
        </View>

        {sessions.length > 1 && onTerminateOtherSessions ? (
          <TouchableOpacity
            style={styles.logoutOthersBtn}
            activeOpacity={0.7}
            disabled={isTerminatingOtherSessions}
            onPress={onTerminateOtherSessions}
          >
            <LogOut size={12} color="#DC2626" strokeWidth={2} />
            <Text style={styles.logoutOthersText}>
              {isTerminatingOtherSessions ? 'Logging out...' : 'Log out others'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Sessions List */}
      {sessionsLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Checking active devices...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No active devices found.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {sessions.map((sess, idx) => {
            const isCurrent = Boolean(sess.isCurrent || sess.is_current);
            const dType = (sess?.deviceType || sess?.device_type || '').toLowerCase();
            const osStr = (sess?.os || '').toLowerCase();
            const isMobile =
              dType === 'mobile' ||
              dType === 'tablet' ||
              osStr.includes('android') ||
              osStr.includes('ios');

            const DeviceIcon = isMobile ? Smartphone : Laptop;
            const rawName = sess.deviceName || sess.device_name || (isMobile ? 'Mobile App' : 'Desktop Browser');
            const cleanName = rawName.replace(/\s*\([^)]*JobMarket[^)]*\)/gi, '').trim() || rawName;

            const locationStr = sess.location || 'Maharashtra, India';
            const activeTimeStr = isCurrent
              ? 'Active now'
              : sess.lastUsedAt
              ? new Date(sess.lastUsedAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recently active';

            return (
              <View key={sess.id || idx}>
                <View style={styles.sessionItem}>
                  {/* Left Icon Container matching Reference */}
                  <View style={styles.iconBox}>
                    <DeviceIcon size={16} color="#475569" strokeWidth={1.8} />
                  </View>

                  {/* Info Block */}
                  <View style={styles.infoCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.deviceName} numberOfLines={1}>
                        {cleanName}
                      </Text>
                      {isCurrent ? (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.metaText} numberOfLines={1}>
                      {locationStr} · {activeTimeStr}
                    </Text>
                  </View>

                  {/* Right Revoke Action */}
                  {!isCurrent ? (
                    <TouchableOpacity
                      style={styles.revokeBtn}
                      activeOpacity={0.7}
                      onPress={() => onRevokeSession(sess.id, cleanName)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <LogOut size={13} color="#EF4444" strokeWidth={1.8} />
                      <Text style={styles.revokeBtnText}>Logout</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {idx < sessions.length - 1 ? <View style={styles.itemDivider} /> : null}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 19,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  logoutOthersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  logoutOthersText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  loadingBox: {
    paddingVertical: 14,
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
  },
  list: {
    gap: 2,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    flexShrink: 1,
  },
  currentBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    flexShrink: 0,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4F46E5',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
  },
  revokeBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#EF4444',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
});
