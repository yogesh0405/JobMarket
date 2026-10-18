import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  MapPin,
  Building2,
  Navigation,
  ExternalLink,
} from 'lucide-react-native';
import { RADIUS, COLORS } from '../../../constants/theme';

interface CompanyOperationsSectionProps {
  company: any;
  formattedLocation: string;
}

export const CompanyOperationsSection: React.FC<CompanyOperationsSectionProps> = ({
  company,
  formattedLocation,
}) => {
  const fullAddress =
    company?.address?.trim() ||
    formattedLocation ||
    company?.city?.trim() ||
    'Chhatrapati Sambhajinagar, Maharashtra';

  const midcZone = company?.midc_zone || company?.midcZone || 'Waluj Industrial Area';
  const gstin = company?.gst_number || company?.gstNumber || company?.gstin || '27AABCU9603R1ZN';
  const phone = company?.phone || company?.contact_phone || '+91 240 2554000';
  const email = company?.email || company?.contact_email || 'careers@jobmarket.in';

  const handleOpenMaps = () => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleCallPhone = () => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {});
  };

  const handleSendEmail = () => {
    Linking.openURL(`mailto:${email}`).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.surfaceCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <MapPin size={17} color={COLORS.primary} strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Plant Location & Operations</Text>
            <Text style={styles.cardSubtitle}>Primary manufacturing facility, shifts & compliance</Text>
          </View>
        </View>

        {/* Facility Address Block */}
        <View style={styles.facilitySection}>
          <Text style={styles.addressText}>{fullAddress}</Text>

          <View style={styles.facilityMetaRow}>
            <View style={styles.zoneTag}>
              <Building2 size={12} color="#64748B" />
              <Text style={styles.zoneText}>Zone: {midcZone}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenMaps}
              style={styles.directionsBtn}
            >
              <Navigation size={12} color={COLORS.primary} strokeWidth={2.4} />
              <Text style={styles.directionsBtnText}>Directions</Text>
              <ExternalLink size={11} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.sectionDivider} />

        {/* Operations & Statutory Rows */}
        <View style={styles.specsList}>
          {/* Operating Shifts */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Operating Shifts</Text>
            <Text style={styles.specValue}>3 Shifts (Morning, General, Night)</Text>
          </View>

          {/* GSTIN / Registration */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>GSTIN / Registration</Text>
            <Text style={styles.monoValue}>{gstin}</Text>
          </View>

          {/* Plant Phone */}
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Plant Desk Phone</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleCallPhone}>
              <Text style={styles.linkValue}>{phone}</Text>
            </TouchableOpacity>
          </View>

          {/* Facility Email */}
          <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.specLabel}>Facility Email</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleSendEmail}>
              <Text style={styles.linkValue}>{email}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  surfaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  facilitySection: {
    paddingTop: 2,
  },
  addressText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    fontWeight: '500',
  },
  facilityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  zoneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  zoneText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  directionsBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  specsList: {
    width: '100%',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  specLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'right',
  },
  gstinWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monoValue: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  linkValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

