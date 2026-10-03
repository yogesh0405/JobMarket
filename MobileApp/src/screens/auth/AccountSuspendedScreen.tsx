import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { AlertCircle, Mail } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  reason?: string | null;
  message?: string | null;
  onSignOut?: () => void;
}

export const AccountSuspendedScreen: React.FC<Props> = ({
  reason,
  message,
  onSignOut,
}) => {
  const { logout, clearSuspension } = useAuth();

  const isBlocked = !reason || reason === 'ACCOUNT_BLOCKED';
  const errorCode = reason || 'ACCOUNT_BLOCKED';

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@jobmarket.com?subject=Account%20Suspension%20Appeal').catch(() => {});
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      clearSuspension();
      logout();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Circular Alert Icon Badge */}
          <View style={styles.iconWrap}>
            <AlertCircle size={40} color="#DC2626" strokeWidth={2} />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isBlocked ? 'Account Suspended' : 'Account Inactive'}
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {message || (isBlocked
              ? 'Your account has been suspended by the platform administrator due to a violation of our Terms of Service or Community Guidelines.'
              : 'Your account is currently inactive. Please verify your email address to regain access to the platform.')}
          </Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What you can do</Text>
            {isBlocked ? (
              <View style={styles.infoList}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Review our Terms of Service and Community Guidelines
                  </Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Contact our support team to appeal this decision
                  </Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Provide any necessary verification documents
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.infoList}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Check your email inbox for the verification link
                  </Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Check your spam or junk folder
                  </Text>
                </View>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Contact support if you didn't receive the verification email
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Error Code Reference Box */}
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>ERROR CODE</Text>
            <Text style={styles.refValue}>{errorCode}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={handleContactSupport}
            >
              <Mail size={16} color="#FFFFFF" strokeWidth={2.5} style={styles.btnIcon} />
              <Text style={styles.primaryBtnText}>Contact Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.7}
              onPress={handleSignOut}
            >
              <Text style={styles.secondaryBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <View style={styles.supportRow}>
            <Text style={styles.supportText}>Need help? </Text>
            <TouchableOpacity onPress={handleContactSupport}>
              <Text style={styles.supportLink}>support@jobmarket.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 28,
    paddingVertical: 36,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 18,
    marginBottom: 18,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 14,
    color: '#475569',
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '400',
  },
  refBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
    width: '100%',
    gap: 10,
  },
  refLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  supportLink: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
});
