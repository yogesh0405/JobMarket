import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  MapPin,
  Building,
  Users,
  Calendar,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react-native';
import { RADIUS } from '../../../constants/theme';

interface CompanyDetailsCardProps {
  company: any;
  formattedLocation: string;
}

export const CompanyDetailsCard: React.FC<CompanyDetailsCardProps> = ({
  company,
  formattedLocation,
}) => {
  const legalType = company?.company_type || company?.companyType || 'Private Limited';
  const size = company?.company_size || company?.companySize || '200–500 employees';
  const foundedYear = company?.founded_year || company?.foundedYear || '2005';
  const gstNumber = company?.gstin || company?.gstNumber || company?.gst || '82hqejbcna';
  const email = company?.email || company?.contact_email || 'noreply.insightforge19@gmail.com';
  const phone = company?.phone || company?.contact_phone || '9162845245';
  const fullAddress =
    formattedLocation || 'Waluj MIDC, Chhatrapati Sambhajinagar, Maharashtra';

  return (
    <View style={styles.cardContainer}>
      {/* Header with Title and Green Verified Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Company Details & Verification</Text>
        <View style={styles.verifiedBadge}>
          <ShieldCheck size={13} color="#19A98F" strokeWidth={2.4} />
          <Text style={styles.verifiedBadgeText}>Verified</Text>
        </View>
      </View>

      <View style={styles.headerDivider} />

      {/* Row 1: Location | Legal Type */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF4FF' }]}>
              <MapPin size={14} color="#1764E8" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel}>Plant Address & Location</Text>
          </View>
          <Text style={styles.fieldValueText} numberOfLines={2}>
            {fullAddress}
          </Text>
        </View>

        <View style={styles.gridCol}>
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F2F1FF' }]}>
              <Building size={14} color="#625CEB" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel}>Company Legal Type</Text>
          </View>
          <Text style={styles.fieldValueText}>{legalType}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 2: Company Size | Founded Year */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFAF7' }]}>
              <Users size={14} color="#21A99B" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel}>Company Size</Text>
          </View>
          <Text style={styles.fieldValueText}>{size}</Text>
        </View>

        <View style={styles.gridCol}>
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <Calendar size={14} color="#D97706" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel}>Founded Year</Text>
          </View>
          <Text style={styles.fieldValueText}>{foundedYear}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 3: GST Number | HR Email */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF4FF' }]}>
              <FileText size={14} color="#1764E8" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel}>GST Registration Number</Text>
          </View>
          <Text style={[styles.fieldValueText, { color: '#1764E8' }]}>{gstNumber}</Text>
        </View>

        <View style={styles.gridCol}>
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F2F1FF' }]}>
              <Mail size={14} color="#625CEB" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel} numberOfLines={1}>Official HR Email</Text>
          </View>
          <Text style={styles.fieldValueText} numberOfLines={1} ellipsizeMode="tail">
            {email}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 4: Helpline Phone Number */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#E9F8F4' }]}>
              <Phone size={14} color="#19A98F" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel} numberOfLines={1}>Helpline Phone Number</Text>
          </View>
          <Text style={styles.fieldValueText} numberOfLines={1} ellipsizeMode="tail">{phone}</Text>
        </View>
        <View style={styles.gridCol} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBF2',
    borderRadius: RADIUS.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#102A5C',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF8F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#19A98F',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E2E7EF',
    marginTop: 12,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCol: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 10.5,
    color: '#66789B',
    fontWeight: '500',
  },
  fieldValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#102A5C',
    lineHeight: 16,
    paddingLeft: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5EAF2',
    marginVertical: 10,
  },
});
