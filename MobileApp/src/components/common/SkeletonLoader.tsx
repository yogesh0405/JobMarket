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

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Header Profile Hero Card */}
      <View style={styles.heroCardSkeleton}>
        <View style={styles.heroRow}>
          <Skeleton width={44} height={44} style={{ borderRadius: 8 }} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="60%" height={16} style={{ borderRadius: 4 }} />
            <Skeleton width="40%" height={12} style={{ borderRadius: 4 }} />
          </View>
        </View>
        <View style={styles.heroDivider} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Skeleton width={110} height={28} style={{ borderRadius: 6 }} />
          <Skeleton width={110} height={28} style={{ borderRadius: 6 }} />
        </View>
      </View>

      {/* 4 Stats Grid */}
      <View style={styles.gridRow}>
        <View style={styles.gridCard}>
          <View style={styles.gridHeader}>
            <Skeleton width="55%" height={12} style={{ borderRadius: 4 }} />
            <Skeleton width={24} height={24} style={{ borderRadius: 6 }} />
          </View>
          <Skeleton width="40%" height={24} style={{ borderRadius: 4 }} />
        </View>
        <View style={styles.gridCard}>
          <View style={styles.gridHeader}>
            <Skeleton width="55%" height={12} style={{ borderRadius: 4 }} />
            <Skeleton width={24} height={24} style={{ borderRadius: 6 }} />
          </View>
          <Skeleton width="40%" height={24} style={{ borderRadius: 4 }} />
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={styles.gridCard}>
          <View style={styles.gridHeader}>
            <Skeleton width="55%" height={12} style={{ borderRadius: 4 }} />
            <Skeleton width={24} height={24} style={{ borderRadius: 6 }} />
          </View>
          <Skeleton width="40%" height={24} style={{ borderRadius: 4 }} />
        </View>
        <View style={styles.gridCard}>
          <View style={styles.gridHeader}>
            <Skeleton width="55%" height={12} style={{ borderRadius: 4 }} />
            <Skeleton width={24} height={24} style={{ borderRadius: 6 }} />
          </View>
          <Skeleton width="40%" height={24} style={{ borderRadius: 4 }} />
        </View>
      </View>

      {/* Recent Feed Cards */}
      <JobCardSkeleton />
      <JobCardSkeleton />
    </View>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Profile Hero Header Card */}
      <View style={styles.heroCardSkeleton}>
        <View style={styles.heroRow}>
          <Skeleton width={60} height={60} style={{ borderRadius: 8 }} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="65%" height={18} style={{ borderRadius: 4 }} />
            <Skeleton width="45%" height={14} style={{ borderRadius: 4 }} />
          </View>
        </View>
        <View style={styles.heroDivider} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Skeleton width="48%" height={32} style={{ borderRadius: 6 }} />
          <Skeleton width="48%" height={32} style={{ borderRadius: 6 }} />
        </View>
      </View>

      {/* Profile Info Details Card */}
      <View style={styles.card}>
        <Skeleton width="40%" height={16} style={{ marginBottom: 16, borderRadius: 4 }} />
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Skeleton width="30%" height={14} style={{ borderRadius: 4 }} />
            <Skeleton width="50%" height={14} style={{ borderRadius: 4 }} />
          </View>
        ))}
      </View>

      {/* Action Settings Row */}
      <View style={styles.card}>
        <Skeleton width="50%" height={16} style={{ marginBottom: 12, borderRadius: 4 }} />
        <Skeleton width="100%" height={40} style={{ borderRadius: 6, marginBottom: 8 }} />
        <Skeleton width="100%" height={40} style={{ borderRadius: 6 }} />
      </View>
    </View>
  );
};

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Analytics Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Skeleton width={32} height={32} style={{ borderRadius: 6 }} />
          <View style={{ flex: 1, gap: 4 }}>
            <Skeleton width="50%" height={16} style={{ borderRadius: 4 }} />
            <Skeleton width="70%" height={12} style={{ borderRadius: 4 }} />
          </View>
        </View>

        {/* 6 Metric Rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Skeleton width="40%" height={12} style={{ borderRadius: 4 }} />
              <Skeleton width="20%" height={12} style={{ borderRadius: 4 }} />
            </View>
            <Skeleton width="100%" height={8} style={{ borderRadius: 4 }} />
          </View>
        ))}
      </View>

      {/* Conversion Funnel Skeleton Card */}
      <View style={styles.card}>
        <Skeleton width="45%" height={16} style={{ marginBottom: 14, borderRadius: 4 }} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 120 }}>
          <Skeleton width={35} height={110} style={{ borderRadius: 4 }} />
          <Skeleton width={35} height={85} style={{ borderRadius: 4 }} />
          <Skeleton width={35} height={60} style={{ borderRadius: 4 }} />
          <Skeleton width={35} height={40} style={{ borderRadius: 4 }} />
          <Skeleton width={35} height={25} style={{ borderRadius: 4 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  skeletonContainer: {
    width: '100%',
  },
  heroCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
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