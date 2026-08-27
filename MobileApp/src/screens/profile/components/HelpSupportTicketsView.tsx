import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Plus,
  Ticket,
  ChevronRight,
  Briefcase,
  HelpCircle,
  FileText,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  Search,
  Headphones,
  X,
  PlusCircle,
  ArrowUpCircle,
  Info,
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../../../constants/theme';
import { Input } from '../../../components/common/Input';
import { SelectDropdown } from '../../../components/common/SelectDropdown';
import { Button } from '../../../components/common/Button';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { KeyboardAwareScrollView, handleFocusInput } from '../../../components/common/KeyboardAwareScrollView';
import { SupportTicket } from './HelpSupportConstants';

interface HelpSupportTicketsViewProps {
  onBackToMain: () => void;
  ticketTab: 'CREATE' | 'MY_TICKETS';
  setTicketTab: (tab: 'CREATE' | 'MY_TICKETS') => void;
  myTickets: SupportTicket[];

  // Create Ticket State & Callbacks
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  priority: 'low' | 'medium' | 'high';
  setPriority: (val: 'low' | 'medium' | 'high') => void;
  subject: string;
  setSubject: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  isSubmitting: boolean;
  formError: string | null;
  categoryOptions: string[];
  ticketAttachment: { uri: string; name: string; base64?: string } | null;
  setTicketAttachment: (att: { uri: string; name: string; base64?: string } | null) => void;
  onCreateTicket: () => void;

  // Tickets List Callbacks
  refreshing: boolean;
  onRefresh: () => void;
  onOpenTicketChat: (ticket: SupportTicket) => void;
}

export const HelpSupportTicketsView: React.FC<HelpSupportTicketsViewProps> = ({
  onBackToMain,
  ticketTab,
  setTicketTab,
  myTickets,

  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  category,
  setCategory,
  priority,
  setPriority,
  subject,
  setSubject,
  description,
  setDescription,
  isSubmitting,
  formError,
  categoryOptions,
  ticketAttachment,
  setTicketAttachment,
  onCreateTicket,

  refreshing,
  onRefresh,
  onOpenTicketChat,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const handlePickFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename = asset.fileName || `Attachment_${Date.now()}.jpg`;
        const base64Data = asset.base64
          ? (asset.base64.startsWith('data:') ? asset.base64 : `data:image/jpeg;base64,${asset.base64}`)
          : undefined;

        setTicketAttachment({
          uri: asset.uri,
          name: filename,
          base64: base64Data,
        });
      }
    } catch (_) {}
  };

  const filteredTickets = myTickets.filter((t) => {
    if (filterStatus === 'ACTIVE' && (t.status === 'RESOLVED' || t.status === 'CLOSED')) return false;
    if (filterStatus === 'RESOLVED' && t.status !== 'RESOLVED' && t.status !== 'CLOSED') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  if (ticketTab === 'CREATE') {
    const isUrgent = priority === 'high';

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Top Clean Header for Create Ticket Page (Matching Reference) */}
        <View style={[styles.newTicketHeader, { paddingTop: topInset + (Platform.OS === 'android' ? 8 : 4) }]}>
          <View style={styles.headerTitleLeftGroup}>
            <TouchableOpacity
              onPress={() => setTicketTab('MY_TICKETS')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.headerBackBtn}
            >
              <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
            </TouchableOpacity>
            <Text style={styles.newTicketHeaderTitle}>New ticket</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onBackToMain}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.headerSupportBtn}
          >
            <Headphones size={20} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView
          ref={scrollViewRef}
          extraScrollHeight={180}
          contentContainerStyle={styles.newTicketScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {formError ? <ErrorBanner message={formError} style={{ marginBottom: 16 }} /> : null}

          {/* 1. Category */}
          <View style={styles.formItemBlock}>
            <Text style={styles.formItemLabel}>Category</Text>
            <SelectDropdown
              value={category}
              options={categoryOptions}
              onSelect={setCategory}
              placeholder="Select a category"
              triggerStyle={styles.categoryDropdownTrigger}
            />
          </View>

          {/* 2. Subject */}
          <View style={styles.formItemBlock}>
            <Text style={styles.formItemLabel}>Subject</Text>
            <View style={styles.simpleTextInputWrapper}>
              <TextInput
                style={styles.simpleTextInput}
                placeholder="E.g, Payment not going though"
                placeholderTextColor="#94A3B8"
                value={subject}
                onChangeText={setSubject}
                onFocus={(e) => handleFocusInput(e, scrollViewRef, 100)}
              />
            </View>
          </View>

          {/* 3. Describe your issue */}
          <View style={styles.formItemBlock}>
            <Text style={styles.formItemLabel}>Describe your issue</Text>
            <View style={styles.simpleTextAreaWrapper}>
              <TextInput
                style={styles.simpleTextAreaInput}
                placeholder="Please provide as much details as possible"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                onFocus={(e) => {
                  handleFocusInput(e, scrollViewRef, 180);
                  setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                }}
              />
            </View>
          </View>

          {/* 4. Upload file */}
          <View style={styles.formItemBlock}>
            <Text style={styles.formItemLabel}>Upload file</Text>
            {ticketAttachment ? (
              <View style={styles.attachmentSelectedCard}>
                {ticketAttachment.uri ? (
                  <Image source={{ uri: ticketAttachment.uri }} style={styles.attachmentThumbnail} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.attachmentFileName} numberOfLines={1}>
                    {ticketAttachment.name}
                  </Text>
                  <Text style={styles.attachmentFileSize}>Ready to upload (Max 10 MB)</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setTicketAttachment(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.attachmentRemoveBtn}
                >
                  <X size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handlePickFile}
                style={styles.uploadDashedCard}
              >
                <PlusCircle size={22} color="#0F172A" strokeWidth={2} />
                <Text style={styles.uploadCardMainText}>Add screenshot / file</Text>
                <View style={styles.uploadCardSubRow}>
                  <Info size={12} color="#94A3B8" />
                  <Text style={styles.uploadCardSubText}>Max 10 Mb</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* 5. Mark as urgent Switch */}
          <View style={styles.markUrgentRow}>
            <Text style={styles.markUrgentLabel}>Mark as urgent</Text>
            <Switch
              value={isUrgent}
              onValueChange={(val) => setPriority(val ? 'high' : 'medium')}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          {/* 6. Submit Ticket Pill Button (Exact Reference Match) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onCreateTicket}
            disabled={isSubmitting}
            style={styles.submitTicketPillBtn}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitTicketPillText}>Submit Ticket</Text>
                <ArrowUpCircle size={20} color="#FFFFFF" strokeWidth={2.2} />
              </>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Clean Header Banner for My Tickets List (Matching Reference Image) */}
      <View style={[styles.ticketsHeaderBannerWhite, { paddingTop: topInset + (Platform.OS === 'android' ? 8 : 6) }]}>
        {/* Title Row with Back Button, Title, and Support Headphone Icon */}
        <View style={styles.headerTitleRowNav}>
          <View style={styles.headerTitleLeftGroup}>
            <TouchableOpacity
              onPress={onBackToMain}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.headerBackBtn}
            >
              <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
            </TouchableOpacity>
            <Text style={styles.ticketsHeaderTitleTextDark}>Support Tickets Desk</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onBackToMain}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.headerSupportBtn}
          >
            <Headphones size={20} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Search Conversation Bar (Matching Reference Image) */}
        <View style={styles.searchConversationBarContainer}>
          <View style={styles.searchConversationInputRow}>
            <Search size={16} color="#94A3B8" strokeWidth={2} />
            <TextInput
              style={styles.searchConversationTextInput}
              placeholder="Search conversation"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={15} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* Direct Tickets List View */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.ticketsListScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredTickets.length === 0 ? (
          <View style={styles.emptyTicketsStateCard}>
            <Ticket size={36} color="#94A3B8" />
            <Text style={styles.emptyTicketsTitleText}>
              {searchQuery.trim() || filterStatus !== 'ALL' ? 'No Matching Tickets Found' : 'No Support Tickets Found'}
            </Text>
            <Text style={styles.emptyTicketsSubText}>
              {searchQuery.trim() || filterStatus !== 'ALL'
                ? 'Try adjusting your search keywords or reset active filters.'
                : "You haven't submitted any technical tickets yet. Tap the '+' button below to log an inquiry."}
            </Text>
            {(searchQuery.trim() || filterStatus !== 'ALL') ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setFilterStatus('ALL');
                }}
                style={styles.clearSearchBtn}
              >
                <Text style={styles.clearSearchBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filteredTickets.map((t) => {
            const isResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
            return (
              <TouchableOpacity
                key={t.id}
                activeOpacity={0.88}
                style={styles.ticketListItemCard}
                onPress={() => onOpenTicketChat(t)}
              >
                <View style={styles.ticketCardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ticket size={14} color={COLORS.primary} />
                    <Text style={styles.ticketCardNumberText}>{t.ticketNumber}</Text>
                  </View>
                  <View
                    style={[
                      styles.ticketCardStatusPill,
                      isResolved ? styles.statusPillResolved : styles.statusPillOpen,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ticketCardStatusText,
                        isResolved ? styles.statusTextResolved : styles.statusTextOpen,
                      ]}
                    >
                      {t.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ticketCardSubjectText} numberOfLines={1}>
                  {t.subject}
                </Text>
                <Text style={styles.ticketCardDescSnippetText} numberOfLines={2}>
                  {t.description}
                </Text>

                <View style={styles.ticketCardFooterRow}>
                  <View style={styles.categoryPillTag}>
                    <Text style={styles.categoryPillTagText}>{t.category}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#94A3B8" />
                    <Text style={styles.ticketCardMetaText}>{t.createdAt}</Text>
                    <ChevronRight size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) for Creating Ticket */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setTicketTab('CREATE')}
        style={[
          styles.createTicketFab,
          { bottom: Math.max(insets.bottom + 20, 24) }
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  /* New Ticket Dedicated Screen Styles (100% Matching Reference Image) */
  newTicketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  newTicketHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  newTicketScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  formItemBlock: {
    gap: 8,
  },
  formItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  categoryDropdownTrigger: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 48,
  },
  simpleTextInputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  simpleTextInput: {
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 10,
  },
  simpleTextAreaWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 110,
  },
  simpleTextAreaInput: {
    fontSize: 14,
    color: '#0F172A',
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 2,
  },
  uploadDashedCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadCardMainText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 4,
  },
  uploadCardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  uploadCardSubText: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  attachmentSelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    gap: 12,
  },
  attachmentThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  attachmentFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  attachmentFileSize: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  attachmentRemoveBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
  },
  markUrgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  markUrgentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  submitTicketPillBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitTicketPillText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  ticketsListScrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
    gap: 10,
  },
  ticketsHeaderBannerWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRowNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketsHeaderTitleTextDark: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSupportBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Search Conversation Bar (Exact Reference Match) */
  searchConversationBarContainer: {
    marginBottom: 12,
  },
  searchConversationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Soft light gray pill from reference
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchConversationTextInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
    fontWeight: '400',
  },
  clearSearchBtn: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignSelf: 'center',
  },
  clearSearchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  topBannerStatsCardWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    marginBottom: 12,
  },
  statColItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValDarkText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabelMutedTextDark: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  statColDividerDark: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  whiteHeaderUnderlineTabs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navyHeaderTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  whiteHeaderTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  whiteHeaderTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  whiteHeaderActiveUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  ticketsScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  createTicketCardContainer: {
    gap: 10,
  },
  formMainHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  formMainHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  formSectionCategoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  horizontalSoftSeparatorLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  inputLabelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  prioritySelectorGroup: {
    marginVertical: 2,
  },
  priorityPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityPillBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priorityPillLowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  priorityPillMediumActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  priorityPillHighActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  priorityPillTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  emptyTicketsStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
    marginTop: 10,
  },
  emptyTicketsTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyTicketsSubText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  ticketListItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    gap: 6,
  },
  ticketCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketCardNumberText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ticketCardStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusPillOpen: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusPillResolved: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  ticketCardStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statusTextOpen: {
    color: '#B45309',
  },
  statusTextResolved: {
    color: '#15803D',
  },
  ticketCardSubjectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  ticketCardDescSnippetText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  ticketCardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  categoryPillTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryPillTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  ticketCardMetaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  createTicketFab: {
    position: 'absolute',
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
