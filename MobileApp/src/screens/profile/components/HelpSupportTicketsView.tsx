import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Plus,
  Ticket,
  ChevronRight,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/theme';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { KeyboardAwareScrollView } from '../../../components/common/KeyboardAwareScrollView';
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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Top Clean Header Banner */}
      <View style={styles.ticketsHeaderBannerWhite}>
        <View style={styles.headerTitleRowNav}>
          <TouchableOpacity
            onPress={onBackToMain}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 4 }}
          >
            <ArrowLeft size={20} color="#0F172A" />
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
              {myTickets.filter((t) => t.status !== 'RESOLVED').length || 1}
            </Text>
            <Text style={styles.statLabelMutedTextDark}>Active Tickets</Text>
          </View>
          <View style={styles.statColDividerDark} />
          <View style={styles.statColItem}>
            <Text style={styles.statValDarkText}>24/7</Text>
            <Text style={styles.statLabelMutedTextDark}>Helpdesk Live</Text>
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
        contentContainerStyle={styles.ticketsScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {ticketTab === 'CREATE' ? (
          <View style={styles.createTicketCardContainer}>
            <View style={{ marginBottom: 2 }}>
              <Text style={styles.formMainHeaderTitle}>Submit Support Ticket</Text>
              <Text style={styles.formMainHeaderSub}>
                Fill in your inquiry details below. Our technical support engineering team will respond within 2 hours.
              </Text>
            </View>

            {formError ? <ErrorBanner message={formError} style={{ marginVertical: 2 }} /> : null}

            <Text style={styles.formSectionCategoryTitle}>CONTACT INFORMATION</Text>

            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<User size={18} color="#64748B" />}
            />

            <Input
              label="Email Address *"
              placeholder="name@company.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={18} color="#64748B" />}
            />

            <Input
              label="Mobile Number (Optional)"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              leftIcon={<Phone size={18} color="#64748B" />}
            />

            <View style={styles.horizontalSoftSeparatorLine} />

            <Text style={styles.formSectionCategoryTitle}>INQUIRY DETAILS</Text>

            <Text style={styles.selectCategoryLabelText}>Issue Category *</Text>
            <View style={styles.categoryRadioWrap}>
              {categoryOptions.map((catOption) => {
                const isSelected = category === catOption;
                return (
                  <TouchableOpacity
                    key={catOption}
                    activeOpacity={0.8}
                    style={[styles.categoryOptionChip, isSelected && styles.categoryOptionChipSelected]}
                    onPress={() => setCategory(catOption)}
                  >
                    <View style={[styles.radioCircleOuter, isSelected && styles.radioCircleOuterSelected]}>
                      {isSelected ? <View style={styles.radioDotInner} /> : null}
                    </View>
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                      {catOption}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Subject / Topic Title *"
              placeholder="Brief title summarizing your issue"
              value={subject}
              onChangeText={setSubject}
            />

            <View style={styles.textAreaInputGroup}>
              <Text style={styles.textAreaLabelText}>Detailed Explanation *</Text>
              <Input
                placeholder="Describe your issue or request in detail..."
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <Button
              title="Submit Support Ticket"
              onPress={onCreateTicket}
              loading={isSubmitting}
              style={{ marginTop: 8 }}
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
                <Text style={styles.emptyTicketsTitleText}>No Tickets Submitted Yet</Text>
                <Text style={styles.emptyTicketsSubText}>
                  You haven't logged any technical support tickets. Tap 'Create Ticket' above to reach our helpdesk.
                </Text>
              </View>
            ) : (
              myTickets.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.85}
                  style={styles.ticketListItemCard}
                  onPress={() => onOpenTicketChat(t)}
                >
                  <View style={styles.ticketCardHeaderRow}>
                    <Text style={styles.ticketCardNumberText}>{t.ticketNumber}</Text>
                    <View style={[styles.ticketCardStatusPill, t.status === 'RESOLVED' ? styles.statusPillResolved : styles.statusPillOpen]}>
                      <Text style={styles.ticketCardStatusText}>{t.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.ticketCardSubjectText} numberOfLines={1}>{t.subject}</Text>
                  <Text style={styles.ticketCardDescSnippetText} numberOfLines={2}>{t.description}</Text>

                  <View style={styles.ticketCardFooterRow}>
                    <Text style={styles.ticketCardMetaText}>Category: {t.category}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.ticketCardMetaText}>{t.createdAt}</Text>
                      <ChevronRight size={14} color="#94A3B8" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
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
  selectCategoryLabelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  categoryRadioWrap: {
    gap: 6,
  },
  categoryOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryOptionChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  radioCircleOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  textAreaInputGroup: {
    gap: 6,
  },
  textAreaLabelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  emptyTicketsStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillOpen: {
    backgroundColor: '#FEF3C7',
  },
  statusPillResolved: {
    backgroundColor: '#DCFCE7',
  },
  ticketCardStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
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
  ticketCardMetaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
