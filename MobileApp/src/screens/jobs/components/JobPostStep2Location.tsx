import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MapPin, Map, CheckCircle2 } from 'lucide-react-native';
import { Input } from '../../../components/common/Input';
import { JobLocationMapPreview } from '../../../components/map/JobLocationMapPreview';
import { COLORS, SPACING } from '../../../constants/theme';

interface JobPostStep2LocationProps {
  location: string;
  setLocation: (val: string) => void;
  googleMapsUrl: string;
  setGoogleMapsUrl: (val: string) => void;
  autoResolveMsg: string | null;
  resolvingMap: boolean;
  onResolveMapUrl: () => void;
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
          <Text style={styles.sectionTitleText}>Work Location & GIS Mapping</Text>
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
            label="Google Maps Short Link (Auto-Resolves Coordinates)"
            placeholder="e.g. https://maps.app.goo.gl/..."
            value={googleMapsUrl}
            onChangeText={setGoogleMapsUrl}
            leftIcon={<Map size={16} color="#64748B" />}
            inputContainerStyle={{ borderRadius: 8 }}
            style={{ marginTop: SPACING.sm }}
          />

          {autoResolveMsg ? (
            <View style={styles.autoResolveBadge}>
              <CheckCircle2 size={15} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.autoResolveBadgeText}>{autoResolveMsg}</Text>
            </View>
          ) : null}

          {googleMapsUrl || location.includes('http') ? (
            <TouchableOpacity
              style={styles.resolveBtn}
              onPress={onResolveMapUrl}
              disabled={resolvingMap}
            >
              <Map size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.resolveText}>
                {resolvingMap ? 'Resolving Coordinates...' : 'Re-verify Map Coordinates'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {(latitude !== null && longitude !== null) || (googleMapsUrl && googleMapsUrl.trim().length > 0) ? (
            <JobLocationMapPreview
              latitude={latitude}
              longitude={longitude}
              locationName={resolvedAddress || location || 'Factory Location'}
              height={240}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  autoResolveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  autoResolveBadgeText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#059669',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 9,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginTop: 4,
  },
  resolveText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
