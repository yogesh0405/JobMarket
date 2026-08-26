import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
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
  onCreateTicket,

  refreshing,
  onRefresh,
  onOpenTicketChat,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Clean Header Banner */}
      <View style={[styles.ticketsHeaderBannerWhite, { paddingTop: topInset + (Platform.OS === 'android' ? 8 : 6) }]}>
        <View style={styles.headerTitleRowNav}>
          <TouchableOpacity
            onPress={onBackToMain}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ padding: 4 }}
          >
            <ArrowLeft size={22} color="#1E293B" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.ticketsHeaderTitleTextDark}>Support Tickets Desk</Text>
        </View>

        <View style={styles.topBannerStatsCardWhite}>
          <View style={styles.statColItem}>
            <Text style={styles.statValDarkText}>{myTickets.length}</Text>
            <Text style={styles.statLabelMutedTextDark}>Total Tickets</Text>
          </View>
          <View style={styles.statColDividerDark} />
          <View style={styles.statColItem}>
            <Text style={styles.statValDarkText}>
              {myTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length}
            </Text>
            <Text style={styles.statLabelMutedTextDark}>Active Tickets</Text>
          </View>
          <View style={styles.statColDividerDark} />
          <View style={styles.statColItem}>
            <Text style={styles.statValDarkText}>&lt;2 Hrs</Text>
            <Text style={styles.statLabelMutedTextDark}>Avg SLA</Text>
          </View>
        </View>

        <View style={styles.whiteHeaderUnderlineTabs}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTicketTab('CREATE')}
            style={styles.navyHeaderTabItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Plus size={15} color={ticketTab === 'CREATE' ? COLORS.primary : '#64748B'} />
              <Text
                style={[
                  styles.whiteHeaderTabText,
                  ticketTab === 'CREATE' && styles.whiteHeaderTabTextActive,
                ]}
              >
                Create Ticket
              </Text>
            </View>
            {ticketTab === 'CREATE' ? <View style={styles.whiteHeaderActiveUnderline} /> : null}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTicketTab('MY_TICKETS')}
            style={styles.navyHeaderTabItem}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ticket size={15} color={ticketTab === 'MY_TICKETS' ? COLORS.primary : '#64748B'} />
              <Text
                style={[
                  styles.whiteHeaderTabText,
                  ticketTab === 'MY_TICKETS' && styles.whiteHeaderTabTextActive,
                ]}
              >
                My Tickets ({myTickets.length})
              </Text>
            </View>
            {ticketTab === 'MY_TICKETS' ? <View style={styles.whiteHeaderActiveUnderline} /> : null}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        extraScrollHeight={180}
        contentContainerStyle={styles.ticketsScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {ticketTab === 'CREATE' ? (
          <View style={styles.createTicketCardContainer}>
            <View style={{ marginBottom: 2 }}>
              <Text style={styles.formMainHeaderTitle}>Log Technical Support Ticket</Text>
              <Text style={styles.formMainHeaderSub}>
                Provide your details below. Our Chhatrapati Sambhajinagar desk will inspect and respond shortly.
              </Text>
            </View>

            {formError ? <ErrorBanner message={formError} style={{ marginVertical: 2 }} /> : null}

            <Text style={styles.formSectionCategoryTitle}>CONTACT INFORMATION</Text>

            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              onFocus={(e) => handleFocusInput(e, scrollViewRef, 120)}
              leftIcon={<User size={18} color="#64748B" />}
            />

            <Input
              label="Email Address *"
              placeholder="name@company.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onFocus={(e) => handleFocusInput(e, scrollViewRef, 120)}
              leftIcon={<Mail size={18} color="#64748B" />}
            />

            <Input
              label="Mobile Phone Number (Optional)"
              placeholder="10-digit mobile number"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
              onFocus={(e) => handleFocusInput(e, scrollViewRef, 120)}
              leftIcon={<Phone size={18} color="#64748B" />}
            />

            <View style={styles.horizontalSoftSeparatorLine} />

            <Text style={styles.formSectionCategoryTitle}>INQUIRY DETAILS</Text>

            <SelectDropdown
              label="Inquiry Category *"
              value={category}
              options={categoryOptions}
              onSelect={setCategory}
              leftIcon={<Briefcase size={18} color="#64748B" />}
            />

            {/* Priority Selector */}
            <View style={styles.prioritySelectorGroup}>
              <Text style={styles.inputLabelText}>Ticket Priority Level</Text>
              <View style={styles.priorityPillRow}>
                {(['low', 'medium', 'high'] as const).map((pLevel) => {
                  const isSelected = priority === pLevel;
                  const labelCap = pLevel.toUpperCase();
                  return (
                    <TouchableOpacity
                      key={pLevel}
                      activeOpacity={0.8}
                      style={[
                        styles.priorityPillBtn,
                        isSelected && pLevel === 'low' && styles.priorityPillLowActive,
                        isSelected && pLevel === 'medium' && styles.priorityPillMediumActive,
                        isSelected && pLevel === 'high' && styles.priorityPillHighActive,
                      ]}
                      onPress={() => setPriority(pLevel)}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          isSelected && styles.priorityPillTextActive,
                        ]}
                      >
                        {labelCap} PRIORITY
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Input
              label="Subject / Topic Title *"
              placeholder="Brief summary of your query or technical issue"
              value={subject}
              onChangeText={setSubject}
              onFocus={(e) => handleFocusInput(e, scrollViewRef, 160)}
              leftIcon={<HelpCircle size={18} color="#64748B" />}
            />

            <Input
              label="Detailed Explanation *"
              placeholder="Describe your request, steps to reproduce, or issue details..."
              multiline={true}
              value={description}
              onChangeText={setDescription}
              onFocus={(e) => {
                handleFocusInput(e, scrollViewRef, 240);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 120);
              }}
              leftIcon={<FileText size={18} color="#64748B" />}
            />

            <Button
              title="Submit Support Ticket"
              onPress={onCreateTicket}
              loading={isSubmitting}
              icon={<MessageSquare size={16} color="#FFFFFF" />}
              style={{ marginTop: 8, borderRadius: 6, height: 46 }}
            />
          </View>
        ) : (
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          >
            {myTickets.length === 0 ? (
              <View style={styles.emptyTicketsStateCard}>
                <Ticket size={36} color="#94A3B8" />
                <Text style={styles.emptyTicketsTitleText}>No Support Tickets Found</Text>
                <Text style={styles.emptyTicketsSubText}>
                  You haven't submitted any technical tickets yet. Tap 'Create Ticket' above to log an inquiry.
                </Text>
              </View>
            ) : (
              myTickets.map((t) => {
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
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    gap: 12,
    marginBottom: 12,
  },
  ticketsHeaderTitleTextDark: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
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
});
