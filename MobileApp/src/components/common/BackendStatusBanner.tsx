import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react-native';
import { useBackendStatus } from '../../context/BackendStatusContext';
import { COLORS } from '../../constants/theme';

export const BackendStatusBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { status, errorMessage, checkHealth } = useBackendStatus();
  const [retrying, setRetrying] = useState(false);
  const [showRecovered, setShowRecovered] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);

  // Transition animation
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (prevStatus === 'warming_up' && status === 'healthy') {
      setShowRecovered(true);
      const t = setTimeout(() => {
        setShowRecovered(false);
      }, 2500);
      return () => clearTimeout(t);
    }
    setPrevStatus(status);
  }, [status, prevStatus]);

  const isVisible = status === 'warming_up' || status === 'error' || showRecovered;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  if (!isVisible) return null;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await checkHealth();
    } finally {
      setRetrying(false);
    }
  };

  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 12 : 0);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: topInset + 6,
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-60, 0],
              }),
            },
          ],
        },
      ]}
    >
      {status === 'warming_up' && (
        <View style={[styles.bannerCard, styles.warmingBanner]}>
          <View style={styles.iconWrapper}>
            <ActivityIndicator size="small" color="#D97706" />
          </View>
          <View style={styles.textWrapper}>
            <View style={styles.titleRow}>
              <Zap size={14} color="#D97706" fill="#F59E0B" />
              <Text style={styles.warmingTitle}>Server is warming up...</Text>
            </View>
            <Text style={styles.warmingSub}>
              Instance is waking up from standby. Reconnecting automatically...
            </Text>
          </View>
        </View>
      )}

      {status === 'error' && (
        <View style={[styles.bannerCard, styles.errorBanner]}>
          <View style={styles.iconWrapper}>
            <AlertTriangle size={18} color="#DC2626" />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.errorTitle}>Server Connection Issue</Text>
            <Text style={styles.errorSub}>
              {errorMessage || 'Unable to reach backend service. Check network & retry.'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={retrying}
            activeOpacity={0.8}
          >
            {retrying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.retryBtnContent}>
                <RefreshCw size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.retryBtnText}>Retry</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {showRecovered && status === 'healthy' && (
        <View style={[styles.bannerCard, styles.successBanner]}>
          <CheckCircle size={18} color="#16A34A" />
          <Text style={styles.successText}>Server connected & ready!</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    paddingHorizontal: 12,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  bannerCard: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
  },
  warmingBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  warmingTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
  },
  warmingSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  errorTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorSub: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 1,
  },
  successText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
