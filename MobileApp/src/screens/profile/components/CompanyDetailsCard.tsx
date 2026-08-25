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
import { RADIUS } from '../../../constants/theme';

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
      <Text style={styles.cardTitle}>Company Details & Verification</Text>

      {/* Divider */}
      <View style={styles.divider} />

      <View style={styles.detailsList}>
        {/* Industry Sector */}
        {industry ? (
          <View style={styles.detailRow}>
            <Briefcase size={16} color="#64748B" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Industry Sector</Text>
              <Text style={styles.detailValue}>{industry}</Text>
            </View>
          </View>
        ) : null}

        {/* Plant Location & Address */}
        {fullLocation && fullLocation.trim() ? (
          <View style={styles.detailRow}>
            <MapPin size={16} color="#64748B" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Plant Address & Location</Text>
              <Text style={styles.detailValue}>{fullLocation.trim()}</Text>
            </View>
          </View>
        ) : null}

        {/* Legal Type */}
        {companyType ? (
          <View style={styles.detailRow}>
            <Building2 size={16} color="#64748B" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Company Legal Type</Text>
              <Text style={styles.detailValue}>{companyType}</Text>
            </View>
          </View>
        ) : null}

        {/* Company Size */}
        {companySize ? (
          <View style={styles.detailRow}>
            <Users size={16} color="#64748B" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Company Size</Text>
              <Text style={styles.detailValue}>{companySize}</Text>
            </View>
          </View>
        ) : null}

        {/* Founded Year */}
        {foundedYear ? (
          <View style={styles.detailRow}>
            <Calendar size={16} color="#64748B" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Founded Year</Text>
              <Text style={styles.detailValue}>{foundedYear}</Text>
            </View>
          </View>
        ) : null}

        {/* GST Registration Number */}
        {gstNumber && gstNumber.trim() ? (
          <View style={styles.detailRow}>
            <FileText size={16} color="#64748B" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>GST Registration Number</Text>
              <Text style={[styles.detailValue, styles.monoText]}>{gstNumber.trim()}</Text>
            </View>
          </View>
        ) : null}

        {/* Official HR Email */}
        {email && email.trim() ? (
          <View style={styles.detailRow}>
            <Mail size={16} color="#64748B" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Official HR Email</Text>
              <Text style={styles.detailValue}>{email.trim()}</Text>
            </View>
          </View>
        ) : null}

        {/* Helpline Phone */}
        {phone && phone.trim() ? (
          <View style={styles.detailRow}>
            <Phone size={16} color="#64748B" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Helpline Phone Number</Text>
              <Text style={styles.detailValue}>{phone.trim()}</Text>
            </View>
          </View>
        ) : null}

        {/* Official Website - ONLY shown if website is provided by company */}
        {website && website.trim() ? (
          <TouchableOpacity activeOpacity={0.8} onPress={handleOpenWebsite} style={styles.detailRow}>
            <Globe size={16} color="#2563EB" />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Official Website</Text>
              <View style={styles.websiteLinkRow}>
                <Text style={styles.websiteLinkText} numberOfLines={1}>{website.trim()}</Text>
                <ExternalLink size={13} color="#2563EB" />
              </View>
            </View>
          </TouchableOpacity>
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
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  detailsList: {
    gap: 14,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
    color: '#1E40AF',
  },
  websiteLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  websiteLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
});
