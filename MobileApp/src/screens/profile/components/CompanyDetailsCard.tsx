import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
} from 'lucide-react-native';
import { RADIUS, COLORS } from '../../../constants/theme';

interface CompanyDetailsCardProps {
  company: any;
}

export const CompanyDetailsCard: React.FC<CompanyDetailsCardProps> = ({ company }) => {
  const industry = company?.industry;
  const companyType = company?.company_type || company?.companyType;
  const companySize = company?.company_size || company?.companySize;
  const foundedYear = company?.founded_year || company?.foundedYear;
  const rawGstNumber = company?.gst_number || company?.gstNumber;
  const gstNumber =
    rawGstNumber && !rawGstNumber.includes('@') && !rawGstNumber.includes('.com')
      ? rawGstNumber
      : undefined;
  const email = company?.email;
  const phone = company?.phone;
  const website = company?.website;

  const address = company?.address;
  const city = company?.city;
  const state = company?.state;
  const pincode = company?.pincode;
  const midcZone = company?.midc_zone || company?.midcZone;

  const formattedAddressParts: string[] = [];
  if (address?.trim()) formattedAddressParts.push(address.trim());
  if (midcZone?.trim() && !formattedAddressParts.join(', ').includes(midcZone.split('(')[0].trim())) {
    formattedAddressParts.push(midcZone.split('(')[0].trim());
  }
  if (city?.trim() && !formattedAddressParts.join(', ').toLowerCase().includes(city.trim().toLowerCase())) {
    formattedAddressParts.push(city.trim());
  }
  if (state?.trim() && !formattedAddressParts.join(', ').toLowerCase().includes(state.trim().toLowerCase())) {
    formattedAddressParts.push(state.trim());
  }
  if (pincode?.trim()) formattedAddressParts.push(pincode.trim());

  const fullLocation = formattedAddressParts.join(', ') || company?.location || 'Waluj MIDC, Chhatrapati Sambhajinagar, Maharashtra';

  const handleOpenWebsite = () => {
    if (!website) return;
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url).catch(() => {});
  };

  const hasAnyDetail =
    industry ||
    companyType ||
    companySize ||
    foundedYear ||
    fullLocation ||
    (gstNumber && gstNumber.trim()) ||
    (email && email.trim()) ||
    (phone && phone.trim()) ||
    (website && website.trim());

  if (!hasAnyDetail) return null;

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardTitle}>Company Details</Text>

      <View style={styles.detailsList}>
        {/* Plant Location & Address */}
        {fullLocation && fullLocation.trim() ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Plant Address & Location</Text>
            <View style={[styles.fieldValueBox, styles.fieldValueBoxMultiline]}>
              <Text style={styles.fieldValueTextMultiline}>{fullLocation.trim()}</Text>
            </View>
          </View>
        ) : null}

        {/* Legal Type */}
        {companyType ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Company Legal Type</Text>
            <View style={styles.fieldValueBox}>
              <Text style={styles.fieldValueText} numberOfLines={1}>{companyType}</Text>
            </View>
          </View>
        ) : null}

        {/* Company Size */}
        {companySize ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Company Size</Text>
            <View style={styles.fieldValueBox}>
              <Text style={styles.fieldValueText} numberOfLines={1}>{companySize}</Text>
            </View>
          </View>
        ) : null}

        {/* Founded Year */}
        {foundedYear ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Founded Year</Text>
            <View style={styles.fieldValueBox}>
              <Text style={styles.fieldValueText} numberOfLines={1}>{foundedYear}</Text>
            </View>
          </View>
        ) : null}

        {/* GST Registration Number */}
        {gstNumber && gstNumber.trim() ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>GST Registration Number</Text>
            <View style={styles.fieldValueBox}>
              <Text style={[styles.fieldValueText, styles.monoText]} numberOfLines={1}>{gstNumber.trim()}</Text>
            </View>
          </View>
        ) : null}

        {/* Official HR Email */}
        {email && email.trim() ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Official HR Email</Text>
            <View style={styles.fieldValueBox}>
              <Text style={styles.fieldValueText} numberOfLines={1}>{email.trim()}</Text>
            </View>
          </View>
        ) : null}

        {/* Helpline Phone */}
        {phone && phone.trim() ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Helpline Phone Number</Text>
            <View style={styles.fieldValueBox}>
              <Text style={styles.fieldValueText} numberOfLines={1}>{phone.trim()}</Text>
            </View>
          </View>
        ) : null}

        {/* Official Website */}
        {website && website.trim() ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Official Website</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={handleOpenWebsite} style={styles.fieldValueBox}>
              <View style={styles.websiteLinkRow}>
                <Text style={styles.websiteLinkText} numberOfLines={1}>{website.trim()}</Text>
                <ExternalLink size={13} color="#2563EB" />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  detailsList: {
    gap: 10,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  fieldValueBox: {
    backgroundColor: COLORS.softWarmBg,
    borderWidth: 1,
    borderColor: COLORS.softWarmBorder,
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  fieldValueText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#0F172A',
  },
  fieldValueBoxMultiline: {
    height: 'auto',
    minHeight: 52,
    paddingVertical: 10,
  },
  fieldValueTextMultiline: {
    fontSize: 12,
    fontWeight: '400',
    color: '#0F172A',
    lineHeight: 16,
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
    color: '#1E40AF',
    fontWeight: '700',
  },
  websiteLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  websiteLinkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
});
