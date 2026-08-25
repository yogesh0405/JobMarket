import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Map, Navigation2, Compass, AlertCircle } from 'lucide-react-native';
import { Input } from '../../../components/common/Input';
import { JobLocationMapPreview } from '../../../components/map/JobLocationMapPreview';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

interface JobPostStep2LocationProps {
  location: string;
  setLocation: (val: string) => void;
  googleMapsUrl: string;
  setGoogleMapsUrl: (val: string) => void;
  autoResolveMsg: string | null;
  resolvingMap: boolean;
  onResolveMapUrl?: () => void;
  latitude: number | null;
  longitude: number | null;
  resolvedAddress: string | null;
}

export const JobPostStep2Location: React.FC<JobPostStep2LocationProps> = ({
  location,
  setLocation,
  googleMapsUrl,
  setGoogleMapsUrl,
  autoResolveMsg,
  resolvingMap,
  onResolveMapUrl,
  latitude,
  longitude,
  resolvedAddress,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resolvingMap) {
      progressAnim.setValue(0.1);
      Animated.timing(progressAnim, {
        toValue: 0.95,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        progressAnim.setValue(0);
      });
    }
  }, [resolvingMap]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const hasRealCoordinates = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardHeaderTitle}>Location Information</Text>
          <Text style={styles.cardHeaderSub}>Enter factory address & map location</Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <MapPin size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitleText}>Work Location & Real GIS Mapping</Text>
        </View>

        <View style={styles.cardBody}>
          <Input
            label="City Location / Factory Address"
            required
            placeholder="e.g. Plot E-42, Waluj MIDC, Chhatrapati Sambhajinagar"
            value={location}
            onChangeText={setLocation}
            leftIcon={<MapPin size={16} color="#64748B" />}
            inputContainerStyle={{ borderRadius: 8 }}
          />

          <Input
            label="Google Maps Location Link (Auto-Resolves Coordinates)"
            placeholder="e.g. https://maps.app.goo.gl/... or https://google.com/maps/..."
            value={googleMapsUrl}
            onChangeText={setGoogleMapsUrl}
            leftIcon={<Map size={16} color="#64748B" />}
            inputContainerStyle={{ borderRadius: 8 }}
            style={{ marginTop: SPACING.sm }}
          />

          {/* Action Button to trigger fetching & pinning — Hidden while loading */}
          {!resolvingMap ? (
            <TouchableOpacity
              style={styles.fetchLocationBtn}
              onPress={onResolveMapUrl}
              activeOpacity={0.8}
            >
              <Compass size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.fetchLocationBtnText}>Pin Location</Text>
            </TouchableOpacity>
          ) : (
            /* Real-time Resolution Progress Bar Card — Rendered at place of button */
            <View style={styles.progressCard}>
              <View style={styles.progressHeaderRow}>
                <View style={styles.progressIconBox}>
                  <Compass size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.progressTitle}>Fetching Real GPS Coordinates...</Text>
                  <Text style={styles.progressSub}>Resolving live latitude & longitude from map link</Text>
                </View>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
              <View style={styles.progressBarTrack}>
                <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
              </View>
            </View>
          )}



          {/* Interactive Map Preview with Real Pin — Always active and responsive in Step 2 */}
          <JobLocationMapPreview
            latitude={latitude}
            longitude={longitude}
            locationName={resolvedAddress || location || 'Factory Location'}
            height={250}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sectionBlock: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardBody: {
    gap: 12,
  },
  progressCard: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  progressIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  progressSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#DBEAFE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  autoResolveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 4,
  },
  autoResolveBadgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  autoResolveBadgeSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  fetchLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 2,
    minHeight: 46,
  },
  fetchLocationBtnDisabled: {
    opacity: 0.7,
  },
  fetchLocationBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
