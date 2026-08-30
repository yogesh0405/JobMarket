import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
  Share,
  Pressable,
} from 'react-native';
import {
  Briefcase,
  Star,
  Plus,
  ShieldCheck,
  MapPin,
  X,
  Navigation2,
  Share2,
} from 'lucide-react-native';
import { RADIUS, COLORS } from '../../../constants/theme';

interface CompanyMetricsBarProps {
  jobsCount: number;
  midcZone?: string;
  isVerified?: boolean;
  completionPct?: number;
  isOwner?: boolean;
  onPostJobPress?: () => void;
}

export const CompanyMetricsBar: React.FC<CompanyMetricsBarProps> = ({
  jobsCount,
  midcZone,
  isVerified = true,
  completionPct = 75,
  isOwner = false,
  onPostJobPress,
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);

  const fullLocation = midcZone || 'Waluj MIDC, Chhatrapati Sambhajinagar, Maharashtra';
  const cleanLocation = midcZone
    ? midcZone.replace(/\(.*\)/, '').trim()
    : 'Industrial Hub';

  const handleShareOrCopy = async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleOpenMap = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch((err) => console.warn('Could not open map:', err));
  };

  return (
    <View style={styles.metricsBarContainer}>
      {/* 1. Active Jobs */}
      <View style={styles.statCol}>
        <View style={[styles.iconSquare, { backgroundColor: '#EFF5FF' }]}>
          <Briefcase size={15} color={COLORS.primary} strokeWidth={2.2} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.statValText}>{jobsCount || 0}</Text>
          <Text style={styles.statLabelText}>{isOwner ? 'Jobs Posted' : 'Active Jobs'}</Text>
        </View>
      </View>

      {/* Vertical Divider */}
      <View style={styles.colDivider} />

      {/* 2. Middle Metric */}
      {isOwner ? (
        <View style={styles.statCol}>
          <View style={[styles.iconSquare, { backgroundColor: '#ECF9F6' }]}>
            <Star size={15} color="#21A99B" strokeWidth={2} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.statValText}>{completionPct}%</Text>
            <Text style={styles.statLabelText}>Profile Score</Text>
          </View>
        </View>
      ) : (
        <View style={styles.statCol}>
          <View style={[styles.iconSquare, { backgroundColor: '#ECFDF5' }]}>
            <ShieldCheck size={16} color="#059669" strokeWidth={2.2} />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.statValText, { color: '#059669' }]} numberOfLines={1}>
              {isVerified ? 'Verified' : 'Direct'}
            </Text>
            <Text style={styles.statLabelText} numberOfLines={1}>
              Employer
            </Text>
          </View>
        </View>
      )}

      {/* Vertical Divider */}
      <View style={styles.colDivider} />

      {/* 3. Third Metric */}
      {isOwner ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPostJobPress}
          style={[styles.statCol, styles.postJobBtnCol]}
        >
          <View style={[styles.iconSquare, { backgroundColor: '#EEF4FF' }]}>
            <Plus size={16} color="#1764E8" strokeWidth={2.4} />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.statValText, { color: '#1764E8' }]}>Post Job</Text>
            <Text style={styles.statLabelText}>New Vacancy</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowLocationModal(true)}
          style={styles.statCol}
        >
          <View style={[styles.iconSquare, { backgroundColor: '#FFFBEB' }]}>
            <MapPin size={15} color="#D97706" strokeWidth={2.2} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.statValText} numberOfLines={1}>
              {cleanLocation.split(',')[0]}
            </Text>
            <Text style={styles.statLabelText} numberOfLines={1}>
              Plant Location
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Pop Up Detail Modal for Plant Location */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLocationModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={[styles.modalIconBox, { backgroundColor: '#EEF4FF' }]}>
                  <MapPin size={18} color="#1764E8" strokeWidth={2.2} />
                </View>
                <Text style={styles.modalTitle}>Plant Address & Location</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowLocationModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Value Content Box */}
            <View style={styles.modalContentBox}>
              <Text style={styles.modalContentText} selectable={true}>
                {fullLocation}
              </Text>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                activeOpacity={0.8}
                onPress={() => handleShareOrCopy(fullLocation)}
              >
                <Share2 size={14} color="#475569" strokeWidth={2} />
                <Text style={styles.modalSecondaryBtnText}>Share / Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                activeOpacity={0.85}
                onPress={() => {
                  handleOpenMap(fullLocation);
                  setShowLocationModal(false);
                }}
              >
                <Navigation2 size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.modalPrimaryBtnText}>Open Map</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  metricsBarContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -32,
    marginHorizontal: 16,
    marginBottom: 16,
    zIndex: 20,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  statCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  postJobBtnCol: {
    borderRadius: RADIUS.xs,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  colDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
  statValText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLabelText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 0.5,
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
