import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: any;
  height?: any;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width || '100%',
          height: height || 20,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const JobCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Skeleton width={50} height={50} style={styles.avatar} />
        <View style={styles.headerText}>
          <Skeleton width="70%" height={16} style={styles.line} />
          <Skeleton width="40%" height={12} style={styles.line} />
        </View>
      </View>
      <Skeleton width="90%" height={12} style={styles.line} />
      <Skeleton width="50%" height={12} style={styles.line} />
      <View style={styles.footerRow}>
        <Skeleton width={80} height={20} style={styles.badge} />
        <Skeleton width={100} height={20} style={styles.badge} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    borderRadius: 25,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  line: {
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  badge: {
    marginRight: 8,
    borderRadius: 12,
  },
});