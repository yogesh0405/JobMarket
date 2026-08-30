import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Share,
  Pressable,
} from 'react-native';
import {
  MapPin,
  Building,
  Users,
  Calendar,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  X,
  Send,
  Navigation2,
  Share2,
} from 'lucide-react-native';
import { RADIUS, COLORS } from '../../../constants/theme';

interface CompanyDetailsCardProps {
  company: any;
  formattedLocation: string;
}

export const CompanyDetailsCard: React.FC<CompanyDetailsCardProps> = ({
  company,
  formattedLocation,
}) => {
  const [modalData, setModalData] = useState<{
    visible: boolean;
    title: string;
    value: string;
    type: 'address' | 'email';
  }>({
    visible: false,
    title: '',
    value: '',
    type: 'address',
  });

  const legalType = company?.company_type || company?.companyType || 'Private Limited';
  const size = company?.company_size || company?.companySize || '200–500 employees';
  const foundedYear = company?.founded_year || company?.foundedYear || '2005';
  const gstNumber = company?.gstin || company?.gstNumber || company?.gst || '82hqejbcna';
  const email = company?.email || company?.contact_email || 'noreply.insightforge19@gmail.com';
  const phone = company?.phone || company?.contact_phone || '9162845245';
  const fullAddress =
    formattedLocation || 'Waluj MIDC, Chhatrapati Sambhajinagar, Maharashtra';

  const handleOpenPopup = (type: 'address' | 'email') => {
    if (type === 'address') {
      setModalData({
        visible: true,
        title: 'Plant Address & Location',
        value: fullAddress,
        type: 'address',
      });
    } else {
      setModalData({
        visible: true,
        title: 'Official HR Email',
        value: email,
        type: 'email',
      });
    }
  };

  const handleShareOrCopy = async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch (e) {
      console.warn(e);
    }
  };

  const handlePrimaryAction = (type: 'address' | 'email', value: string) => {
    if (type === 'address') {
      const url = `https://maps.google.com/?q=${encodeURIComponent(value)}`;
      Linking.openURL(url).catch((err) => console.warn('Could not open map:', err));
    } else {
      Linking.openURL(`mailto:${value}`).catch((err) => console.warn('Could not open mail:', err));
    }
  };

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
        <TouchableOpacity
          style={styles.gridCol}
          activeOpacity={0.7}
          onPress={() => handleOpenPopup('address')}
        >
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF4FF' }]}>
              <MapPin size={14} color="#1764E8" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel}>Plant Address & Location</Text>
          </View>
          <Text style={styles.fieldValueText} numberOfLines={2}>
            {fullAddress}
          </Text>
        </TouchableOpacity>

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

        <TouchableOpacity
          style={styles.gridCol}
          activeOpacity={0.7}
          onPress={() => handleOpenPopup('email')}
        >
          <View style={styles.fieldHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F2F1FF' }]}>
              <Mail size={14} color="#625CEB" strokeWidth={2} />
            </View>
            <Text style={styles.fieldLabel} numberOfLines={1}>Official HR Email</Text>
          </View>
          <Text style={styles.fieldValueText} numberOfLines={1} ellipsizeMode="tail">
            {email}
          </Text>
        </TouchableOpacity>
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

      {/* Pop Up Detail Modal */}
      <Modal
        visible={modalData.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalData((prev) => ({ ...prev, visible: false }))}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalData((prev) => ({ ...prev, visible: false }))}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View
                  style={[
                    styles.modalIconBox,
                    {
                      backgroundColor:
                        modalData.type === 'email' ? '#F2F1FF' : '#EEF4FF',
                    },
                  ]}
                >
                  {modalData.type === 'email' ? (
                    <Mail size={18} color="#625CEB" strokeWidth={2.2} />
                  ) : (
                    <MapPin size={18} color="#1764E8" strokeWidth={2.2} />
                  )}
                </View>
                <Text style={styles.modalTitle}>{modalData.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalData((prev) => ({ ...prev, visible: false }))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Value Content Box */}
            <View style={styles.modalContentBox}>
              <Text style={styles.modalContentText} selectable={true}>
                {modalData.value}
              </Text>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                activeOpacity={0.8}
                onPress={() => handleShareOrCopy(modalData.value)}
              >
                <Share2 size={14} color="#475569" strokeWidth={2} />
                <Text style={styles.modalSecondaryBtnText}>Share / Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                activeOpacity={0.85}
                onPress={() => {
                  handlePrimaryAction(modalData.type, modalData.value);
                  setModalData((prev) => ({ ...prev, visible: false }));
                }}
              >
                {modalData.type === 'email' ? (
                  <>
                    <Send size={14} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.modalPrimaryBtnText}>Send Email</Text>
                  </>
                ) : (
                  <>
                    <Navigation2 size={14} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.modalPrimaryBtnText}>Open Map</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalContentBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  modalContentText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalSecondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  modalPrimaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
  },
  modalPrimaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
