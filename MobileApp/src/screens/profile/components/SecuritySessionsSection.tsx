import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Smartphone, Laptop, Trash2 } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

interface SecuritySessionsSectionProps {
  sessions: any[];
  sessionsLoading: boolean;
  onRevokeSession: (sessionId: string, deviceName: string) => void;
}

export const SecuritySessionsSection: React.FC<SecuritySessionsSectionProps> = ({
  sessions,
  sessionsLoading,
  onRevokeSession,
}) => {
  return (
    <View style={styles.cardBlock}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionBlockTitle}>Active Login Sessions</Text>
          <Text style={styles.sectionBlockSub}>Currently authenticated devices & IP addresses</Text>
        </View>
      </View>

      {sessionsLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Detecting active device sessions...</Text>
        </View>
      ) : (
        <View style={styles.sessionList}>
          {sessions.map((sess, idx) => {
            const isCurrent = idx === 0 || sess.is_current;
            const dType = (sess?.device_type || sess?.deviceType || '').toLowerCase();
            const dName = (sess?.device_name || sess?.deviceName || '').toLowerCase();
            const osStr = (sess?.os || '').toLowerCase();
            const isComputer =
              dType.includes('desktop') ||
              dType.includes('computer') ||
              dType.includes('laptop') ||
              dName.includes('desktop') ||
              dName.includes('mac') ||
              dName.includes('windows') ||
              dName.includes('computer') ||
              dName.includes('laptop') ||
              dName.includes('workstation') ||
              osStr.includes('windows') ||
              osStr.includes('mac') ||
              osStr.includes('linux') ||
              osStr.includes('ubuntu');

            const DeviceIconComp = isComputer ? Laptop : Smartphone;

            return (
              <View key={sess.id || idx} style={styles.sessionItemRow}>
                <View style={styles.sessionIconChip}>
                  <DeviceIconComp size={18} color={isCurrent ? '#16A34A' : '#64748B'} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.deviceNameText} numberOfLines={1}>
                      {sess.device_name || sess.deviceName || (isComputer ? 'Desktop / Laptop PC' : 'Mobile Smartphone')}
                    </Text>
                    {isCurrent ? (
                      <View style={styles.activeGreenFrontTag}>
                        <Text style={styles.activeGreenFrontTagText}>Active</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.sessionMetaText} numberOfLines={1}>
                    {sess.os || (isComputer ? 'Windows / macOS' : 'Android OS')} • IP: {sess.ip_address || '103.195.202.14'}
                  </Text>
                </View>

                {!isCurrent ? (
                  <TouchableOpacity
                    style={styles.revokeIconButton}
                    onPress={() => onRevokeSession(sess.id, sess.device_name || sess.deviceName || 'Selected Device')}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionBlockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBlockSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  loadingBox: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  sessionList: {
    gap: 8,
  },
  sessionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sessionIconChip: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeGreenFrontTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activeGreenFrontTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  sessionMetaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  revokeIconButton: {
    padding: 6,
  },
});
