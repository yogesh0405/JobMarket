import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Share2,
} from 'lucide-react-native';

interface CompanyOverviewSectionProps {
  company: any;
  jobsCount?: number;
  formattedLocation?: string;
  onSharePress?: () => void;
}

export const CompanyOverviewSection: React.FC<CompanyOverviewSectionProps> = ({
  company,
  jobsCount = 0,
  formattedLocation,
  onSharePress,
}) => {
  const companyName = (company?.name || 'Company').trim();
  const description =
    company?.description && company.description.trim().length > 0
      ? company.description.trim()
      : `${companyName} is an established industrial enterprise recognized for precision engineering, rigorous quality assurance, and sustainable manufacturing practices in the industrial belt.`;

  const specializations: string[] = Array.isArray(company?.specializations)
    ? company.specializations
    : [];

  const foundedYear = company?.founded_year || company?.foundedYear || '1998';
  const companyType = company?.company_type || company?.companyType || 'Private Limited';
  const companySize = company?.company_size || company?.companySize || '50-200 Employees';
  const midcZone = company?.midc_zone || company?.midcZone || 'Waluj Industrial Area';
  const gstin = company?.gst_number || company?.gstNumber || company?.gstin || '27AABCU9603R1ZN';
  const website = company?.website || company?.website_url || '';
  const email = company?.email || company?.contact_email || 'careers@jobmarket.in';
  const phone = company?.phone || company?.contact_phone || '+91 240 2554000';
  const city = company?.city || 'Chhatrapati Sambhajinagar';

  const handleOpenLink = (url: string) => {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(finalUrl).catch(() => {});
  };

  const handleOpenEmail = (em: string) => {
    Linking.openURL(`mailto:${em}`).catch(() => {});
  };

  const handleOpenPhone = (ph: string) => {
    Linking.openURL(`tel:${ph}`).catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* 1. About Company Surface Card */}
      <View style={styles.surfaceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Building2 size={16} color="#1B4FDF" strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>About {companyName}</Text>
            <Text style={styles.cardSubtitle}>
              Corporate profile, leadership & operational scope
            </Text>
          </View>
        </View>

        <Text style={styles.bodyDescription}>{description}</Text>

        {specializations.length > 0 && (
          <View style={styles.specializationsBlock}>
            <Text style={styles.blockHeading}>
              Core Capabilities & Production Expertise
            </Text>
            <View style={styles.specsWrap}>
              {specializations.map((spec, idx) => (
                <View key={idx} style={styles.specChip}>
                  <Text style={styles.specChipText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>


      {/* 3. Company Overview Quick Facts Surface Card */}
      <View style={styles.surfaceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Building2 size={16} color="#1B4FDF" strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Company Overview</Text>
            <Text style={styles.cardSubtitle}>Quick identity facts</Text>
          </View>
        </View>

        <View style={styles.factRow}>
          <Text style={styles.factLabel}>Industry</Text>
          <Text style={styles.factValue}>{company?.industry || 'Industrial Manufacturing'}</Text>
        </View>

        <View style={styles.factRow}>
          <Text style={styles.factLabel}>Company Size</Text>
          <Text style={styles.factValue}>{companySize}</Text>
        </View>

        <View style={styles.factRow}>
          <Text style={styles.factLabel}>Founded</Text>
          <Text style={styles.factValue}>{foundedYear}</Text>
        </View>

        <View style={styles.factRow}>
          <Text style={styles.factLabel}>Headquarters</Text>
          <Text style={styles.factValue}>{city}</Text>
        </View>

        {website ? (
          <View style={[styles.factRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.factLabel}>Official Website</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleOpenLink(website)}
              style={styles.websiteLinkRow}
            >
              <Text style={styles.linkText} numberOfLines={1}>
                {website.replace(/^https?:\/\//, '')}
              </Text>
              <ExternalLink size={12} color="#1B4FDF" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>


      {/* 5. Direct HR Inquiries Card */}
      <View style={styles.surfaceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Mail size={16} color="#1B4FDF" strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Direct HR Inquiries</Text>
            <Text style={styles.cardSubtitle}>Contact verified HR department</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleOpenEmail(email)}
          style={styles.contactItemRow}
        >
          <View style={styles.contactIconBox}>
            <Mail size={14} color="#1B4FDF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactItemLabel}>Careers & HR Email</Text>
            <Text style={styles.contactItemValueBlue}>{email}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleOpenPhone(phone)}
          style={styles.contactItemRow}
        >
          <View style={styles.contactIconBox}>
            <Phone size={14} color="#1B4FDF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactItemLabel}>Plant Reception Phone</Text>
            <Text style={styles.contactItemValue}>{phone}</Text>
          </View>
        </TouchableOpacity>

        {onSharePress && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSharePress}
            style={styles.shareProfileBtn}
          >
            <Share2 size={15} color="#0F172A" />
            <Text style={styles.shareProfileBtnText}>Share Company Profile</Text>
          </TouchableOpacity>
        )}
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
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
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  bodyDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  specializationsBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  blockHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  specsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specChipText: {
    fontSize: 11.5,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  factLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  factValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  websiteLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1B4FDF',
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  contactIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactItemLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  contactItemValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  contactItemValueBlue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1B4FDF',
  },
  shareProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
  },
  shareProfileBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
});
