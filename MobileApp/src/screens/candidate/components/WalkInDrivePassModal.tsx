import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Building2,
  PhoneCall,
  Share2,
  CheckCircle2,
  X,
  Navigation2,
  ShieldCheck,
  FileText,
} from 'lucide-react-native';
import { InterviewItem } from '../../../api/candidateApi';
import { COLORS, RADIUS } from '../../../constants/theme';
import { shareWalkInPass } from '../../../utils/shareUtils';

interface Props {
  visible: boolean;
  item: InterviewItem | null;
  candidateName?: string;
  candidatePhone?: string;
  onClose: () => void;
}

export const WalkInDrivePassModal: React.FC<Props> = ({
  visible,
  item,
  candidateName,
  candidatePhone,
  onClose,
}) => {
  if (!item) return null;

  const passNumber =
    item.ticket_number ||
    `PASS-WID-${(item.job_id || 'WID').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '7842'}-${(item.application_id || 'APL').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '9120'}`;

  const displayName = candidateName || item.candidate_name || 'Verified Candidate';
  const displayPhone = candidatePhone || item.candidate_phone || 'Phone Verified';
  const displayDate = item.walk_in_date || item.interview_date || 'Drive Date';
  const displayTime =
    item.interview_time ||
    (item.walk_in_start_time ? `${item.walk_in_start_time}${item.walk_in_end_time ? ' - ' + item.walk_in_end_time : ''}` : '10:00 AM - 04:00 PM');
  const venueAddress = item.venue_address || item.job_location || 'Company Factory Premises';

  const handleOpenMap = () => {
    if (item.maps_link && typeof item.maps_link === 'string' && item.maps_link.trim().startsWith('http')) {
      Linking.openURL(item.maps_link.trim()).catch(() => {});
      return;
    }
    const query = encodeURIComponent(`${venueAddress} ${item.company || ''}`);
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    if (mapUrl) {
      Linking.openURL(mapUrl).catch(() => {});
    }
  };

  const handleCallCoordinator = () => {
    if (item.walk_in_contact_number) {
      const tel = item.walk_in_contact_number.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${tel}`).catch(() => {});
    }
  };

  const handleShare = () => {
    shareWalkInPass({
      passNumber,
      candidateName: displayName,
      candidatePhone: displayPhone,
      jobTitle: item.job_title,
      company: item.company_name || item.company,
      walkInDate: displayDate,
      walkInTime: displayTime,
      venueAddress,
      contactPerson: item.walk_in_contact_person,
      contactNumber: item.walk_in_contact_number,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Top Blue Header Strip */}
          <View style={styles.passHeaderStrip}>
            <View style={styles.passHeaderTitleRow}>
              <Ticket size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.passHeaderTitleText}>WALK-IN DRIVE ENTRY PASS</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.closeIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Ticket Pass Identifier & Barcode */}
            <View style={styles.barcodeSection}>
              <View style={styles.passIdBadge}>
                <Text style={styles.passIdText}>{passNumber}</Text>
                <View style={styles.activeStatusPill}>
                  <Text style={styles.activeStatusText}>VERIFIED PASS</Text>
                </View>
              </View>

              {/* Graphic Barcode Simulation */}
              <View style={styles.barcodeBarsContainer}>
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1, 3].map(
                  (width, idx) => (
                    <View
                      key={idx}
                      style={{
                        width,
                        height: 38,
                        backgroundColor: '#0F172A',
                        marginHorizontal: 1.5,
                      }}
                    />
                  )
                )}
              </View>
              <Text style={styles.barcodeNoticeText}>
                SCAN / PRESENT AT GATE RECEPTION FOR ON-SPOT VERIFICATION
              </Text>
            </View>

            {/* Perforated Divider */}
            <View style={styles.perforatedLine} />

            {/* Candidate Details Block */}
            <View style={styles.candidateDetailsBlock}>
              <Text style={styles.blockSectionLabel}>CANDIDATE ADMIT DETAILS</Text>
              <View style={styles.infoRow2Col}>
                <View style={styles.infoCol}>
                  <Text style={styles.metaLabel}>CANDIDATE NAME</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>{displayName}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.metaLabel}>REGISTERED PHONE</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>{displayPhone}</Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.sectionDividerSlate} />

            {/* Job & Drive Schedule Block */}
            <View style={styles.jobDriveBlock}>
              <Text style={styles.blockSectionLabel}>DRIVE SPECIFICATIONS</Text>
              <Text style={styles.jobTitleText}>{item.job_title}</Text>
              <Text style={styles.companyNameText}>
                {item.company_name || item.company}
                {item.job_location ? ` • ${item.job_location}` : ''}
              </Text>

              <View style={styles.scheduleRowGrid}>
                <View style={styles.scheduleBox}>
                  <View style={styles.scheduleHeaderRow}>
                    <Calendar size={13} color={COLORS.primary} strokeWidth={2.4} />
                    <Text style={styles.scheduleBoxLabel}>REPORTING DATE</Text>
                  </View>
                  <Text style={styles.scheduleBoxValue}>{displayDate}</Text>
                </View>

                <View style={styles.scheduleBox}>
                  <View style={styles.scheduleHeaderRow}>
                    <Clock size={13} color={COLORS.primary} strokeWidth={2.4} />
                    <Text style={styles.scheduleBoxLabel}>REPORTING WINDOW</Text>
                  </View>
                  <Text style={styles.scheduleBoxValue}>{displayTime}</Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.sectionDividerSlate} />

            {/* Venue & Directions */}
            <View style={styles.venueSectionBlock}>
              <Text style={styles.blockSectionLabel}>INTERVIEW VENUE & GATE ADDRESS</Text>
              <View style={styles.venueContentRow}>
                <MapPin size={15} color={COLORS.primary} style={{ marginTop: 2 }} />
                <Text style={styles.venueAddressFullText}>{venueAddress}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.mapNavigationBtn}
                onPress={handleOpenMap}
              >
                <Navigation2 size={14} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.mapNavigationBtnText}>Open Location in Google Maps</Text>
              </TouchableOpacity>
            </View>

            {/* Coordinator Section (if present) */}
            {item.walk_in_contact_person ? (
              <>
                <View style={styles.sectionDividerSlate} />
                <View style={styles.coordinatorBlock}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.blockSectionLabel}>ON-SITE RECRUITMENT COORDINATOR</Text>
                    <Text style={styles.coordinatorNameText}>{item.walk_in_contact_person}</Text>
                    {item.walk_in_contact_number ? (
                      <Text style={styles.coordinatorPhoneText}>{item.walk_in_contact_number}</Text>
                    ) : null}
                  </View>
                  {item.walk_in_contact_number ? (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.callCoordinatorBtn}
                      onPress={handleCallCoordinator}
                    >
                      <PhoneCall size={14} color="#FFFFFF" strokeWidth={2.4} />
                      <Text style={styles.callCoordinatorBtnText}>Call</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </>
            ) : null}

            {/* Divider */}
            <View style={styles.sectionDividerSlate} />

            {/* Mandatory Documents Checklist */}
            <View style={styles.checklistBlock}>
              <Text style={styles.blockSectionLabel}>MANDATORY DOCUMENTS TO CARRY</Text>
              {[
                '2 Hard copies of updated Resume / Bio-Data',
                'Original Govt Photo ID Proof (Aadhaar Card / Voter ID)',
                'Original & Photocopies of Educational / ITI Certificates',
                '2 Recent Passport size colored photographs',
              ].map((doc, idx) => (
                <View key={idx} style={styles.checkItemRow}>
                  <CheckCircle2 size={13} color="#16A34A" strokeWidth={2.4} />
                  <Text style={styles.checkItemText}>{doc}</Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.sectionDividerSlate} />

            {/* Safety & Protocol Instructions */}
            <View style={styles.instructionsBox}>
              <ShieldCheck size={14} color="#475569" strokeWidth={2.2} />
              <Text style={styles.instructionText}>
                Entry into industrial shopfloors requires closed shoes and formal/safe clothing. Please report at least 15 minutes before the start time.
              </Text>
            </View>
          </ScrollView>

          {/* Modal Bottom Action Footer */}
          <View style={styles.modalActionFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.sharePassBtn}
              onPress={handleShare}
            >
              <Share2 size={15} color={COLORS.primary} strokeWidth={2.4} />
              <Text style={styles.sharePassBtnText}>Share Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.doneBtn}
              onPress={onClose}
            >
              <Text style={styles.doneBtnText}>Close Pass</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#94A3B8',
    overflow: 'hidden',
  },
  passHeaderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1764E8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
  },
  passHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passHeaderTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  closeIconBtn: {
    padding: 4,
  },
  scrollBody: {
    padding: 16,
    gap: 10,
  },
  barcodeSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  passIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  passIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  activeStatusPill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  activeStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  barcodeBarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    marginVertical: 4,
  },
  barcodeNoticeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.4,
  },
  perforatedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  blockSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  candidateDetailsBlock: {
    paddingVertical: 2,
  },
  infoRow2Col: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  metaValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  jobDriveBlock: {
    paddingVertical: 2,
  },
  jobTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  companyNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  scheduleRowGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  scheduleBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.xs,
    padding: 8,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  scheduleBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  scheduleBoxValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  venueSectionBlock: {
    paddingVertical: 2,
  },
  venueContentRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  venueAddressFullText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: '#334155',
  },
  mapNavigationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1764E8',
    paddingVertical: 8,
    borderRadius: RADIUS.xs,
  },
  mapNavigationBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  coordinatorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  coordinatorNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  coordinatorPhoneText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#475569',
    marginTop: 1,
  },
  callCoordinatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.xs,
  },
  callCoordinatorBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  checklistBlock: {
    paddingVertical: 2,
    gap: 5,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkItemText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.xs,
    padding: 8,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#475569',
  },
  modalActionFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  sharePassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#1764E8',
    borderRadius: RADIUS.card,
  },
  sharePassBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1764E8',
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.card,
  },
  doneBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
