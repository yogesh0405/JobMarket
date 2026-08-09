import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Easing,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  MoreVertical,
  Menu,
  Search,
  LayoutGrid,
  User as UserIcon,
  PlusCircle,
  Lock,
  Info,
  HelpCircle,
  MessageSquare,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationModal } from './NotificationModal';
import { JobMarketLogoSvg } from './JobMarketLogoSvg';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface WebHeaderProps {
  onSearchChange?: (text: string) => void;
  showSearch?: boolean;
  useThreeDots?: boolean;
  onBack?: () => void;
  showBack?: boolean;
}

const SEARCH_SUGGESTIONS = [
  'Search by Trade Type (e.g. VMC, Fitter)...',
  'Search by Role (e.g. Quality Inspector)...',
  'Search Locality (e.g. Waluj MIDC)...',
  'Search by Shift (e.g. Day, Rotational)...',
  'Search by Industry (e.g. Auto, Electronics)...',
  'Search by Skills (e.g. CNC, Vernier)...',
  'Search Candidates by Name or Phone...',
];

export const WebHeader: React.FC<WebHeaderProps> = ({
  onSearchChange,
  showSearch = true,
  useThreeDots = true,
  onBack,
  showBack = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    refreshing: notifRefreshing,
    handleRefresh: onNotifRefresh,
    markAsRead: onMarkNotifRead,
    markAllAsRead: onMarkAllNotifRead,
    removeNotification: onDeleteNotif,
    clearAll: onClearAllNotif,
  } = useNotifications();

  const [searchText, setSearchText] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(400)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    slideAnim.setValue(400);
    fadeAnim.setValue(0);
    setModalMounted(true);
  };

  React.useEffect(() => {
    if (modalMounted) {
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 26,
            mass: 0.8,
            stiffness: 240,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [modalMounted]);

  const closeDrawer = (action?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalMounted(false);
      if (action) action();
    });
  };

  // 1 Second (1000ms) Rotating Placeholder Timer
  React.useEffect(() => {
    if (searchText) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [searchText]);



  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const canGoBackInNav = navigation && typeof navigation.canGoBack === 'function' ? navigation.canGoBack() : false;
  const isBackAvailable = (showBack || !!onBack) && (onBack || canGoBackInNav);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (onSearchChange) {
      onSearchChange(text);
    }
  };

  // Derive Profile Info
  const displayName = user?.companyName || user?.company_name || user?.name || 'insightforge';
  const displayEmail = user?.email || 'noreply.insightforge19@gmail.com';
  const initialLetter = displayName.charAt(0).toUpperCase() || 'I';

  return (
    <>
      <View style={[styles.headerWrapper, { paddingTop: Math.max(insets.top, 12) }]}>
        {/* Top Header Row */}
        <View style={styles.topRow}>
          {/* Brand Logo & Name */}
          <View style={styles.brandContainer}>
            {isBackAvailable ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBack}
                style={styles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <ArrowLeft size={22} color={COLORS.slate900} />
              </TouchableOpacity>
            ) : null}

            <View style={styles.logoBadge}>
              <JobMarketLogoSvg size={34} />
            </View>
            <View style={styles.brandTitleBox}>
              <Text style={styles.brandName}>JobMarket</Text>
              <Text style={styles.brandSubtitle}>Industrial & Factory Jobs</Text>
            </View>
          </View>

          {/* Right Actions Slot: Notification Bell & Three-Dot / Menu Icon */}
          <View style={styles.rightActions}>
            {/* Notification Bell Button with Real-Time Live Red Badge */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.bellButton}
              onPress={() => setNotifModalVisible(true)}
            >
              <Bell size={20} color={COLORS.slate700} />
              {unreadCount > 0 ? (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>

            {/* Menu / Three-Dot Icon (Triggers Drawer Menu) */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuButton}
              onPress={openDrawer}
            >
              {useThreeDots ? (
                <MoreVertical size={24} color={COLORS.slate800} />
              ) : (
                <Menu size={24} color={COLORS.slate800} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Strip */}
        {showSearch ? (
          <View style={styles.searchRow}>
            <View style={styles.searchPill}>
              <Search size={18} color={COLORS.primary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={SEARCH_SUGGESTIONS[suggestionIndex]}
                placeholderTextColor={COLORS.slate400}
                value={searchText}
                onChangeText={handleSearchTextChange}
              />
            </View>
          </View>
        ) : null}
      </View>

      {/* Slide-out Drawer / Three-Dot Options Menu Modal */}
      <Modal
        visible={modalMounted}
        transparent
        animationType="none"
        onRequestClose={() => closeDrawer()}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => closeDrawer()}>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim, backgroundColor: 'rgba(15, 23, 42, 0.45)' }]} />
          </TouchableWithoutFeedback>

          {/* Sliding Drawer Menu Panel */}
          <Animated.View
            style={[
              styles.drawerPanel,
              {
                paddingTop: Math.max(insets.top + 12, 24),
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Top Close Button */}
            <View style={styles.topCloseRow}>
              <Text style={styles.menuDrawerTitle}>Menu</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.closeBtn}
                onPress={() => closeDrawer()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={COLORS.slate600} />
              </TouchableOpacity>
            </View>

            {/* Profile Info Hero Card - Minimalist White & Slate */}
            <View style={styles.profileHeaderBlock}>
              <View style={styles.avatarRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{initialLetter}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.profileNameText} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.profileEmailText} numberOfLines={1}>
                    {displayEmail}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {/* SECTION 1: WORKSPACE */}
              <Text style={styles.groupHeaderLabel}>PLATFORM WORKSPACE</Text>

              <TouchableOpacity
                style={styles.menuItemRow}
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer(() => {
                    if (navigation && typeof navigation.navigate === 'function') {
                      navigation.navigate('EmployerDashboard');
                    }
                  });
                }}
              >
                <View style={styles.iconSquircle}>
                  <LayoutGrid size={17} color="#334155" />
                </View>
                <Text style={styles.menuItemTitle}>Dashboard & Analytics</Text>
                <ChevronRight size={16} color={COLORS.slate400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItemRow}
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer(() => {
                    if (navigation && typeof navigation.navigate === 'function') {
                      navigation.navigate('CompanyProfile');
                    }
                  });
                }}
              >
                <View style={styles.iconSquircle}>
                  <UserIcon size={17} color="#334155" />
                </View>
                <Text style={styles.menuItemTitle}>Company Profile</Text>
                <ChevronRight size={16} color={COLORS.slate400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItemRow}
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer(() => {
                    if (navigation && typeof navigation.navigate === 'function') {
                      navigation.navigate('EmployerMain', { screen: 'PostTab' });
                    }
                  });
                }}
              >
                <View style={styles.iconSquircle}>
                  <PlusCircle size={17} color="#334155" />
                </View>
                <Text style={styles.menuItemTitle}>Post a Job</Text>
                <ChevronRight size={16} color={COLORS.slate400} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              {/* SECURITY & SYSTEM SECTION */}
              <Text style={styles.groupHeaderLabel}>SYSTEM & SECURITY</Text>

              <TouchableOpacity
                style={styles.menuItemRow}
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer(() => {
                    if (navigation && typeof navigation.navigate === 'function') {
                      navigation.navigate('SecuritySettings');
                    }
                  });
                }}
              >
                <View style={styles.iconSquircle}>
                  <Lock size={17} color="#334155" />
                </View>
                <Text style={styles.menuItemTitle}>Security & Sessions</Text>
                <ChevronRight size={16} color={COLORS.slate400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItemRow}
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer(() => {
                    if (navigation && typeof navigation.navigate === 'function') {
                      navigation.navigate('HelpSupport');
                    }
                  });
                }}
              >
                <View style={styles.iconSquircle}>
                  <HelpCircle size={17} color="#334155" />
                </View>
                <Text style={styles.menuItemTitle}>Help & Support Desk</Text>
                <ChevronRight size={16} color={COLORS.slate400} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItemRow}
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer(() => {
                    if (navigation && typeof navigation.navigate === 'function') {
                      navigation.navigate('AboutUs');
                    }
                  });
                }}
              >
                <View style={styles.iconSquircle}>
                  <Info size={17} color="#334155" />
                </View>
                <Text style={styles.menuItemTitle}>About JobMarket</Text>
                <ChevronRight size={16} color={COLORS.slate400} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              {/* ACCOUNT ACTION */}
              <Text style={styles.groupHeaderLabel}>ACCOUNT</Text>

              <TouchableOpacity
                style={[styles.menuItemRow, { borderBottomWidth: 0, marginTop: 2 }]}
                activeOpacity={0.7}
                onPress={() => {
                  closeDrawer(() => {
                    if (logout && typeof logout === 'function') {
                      logout();
                    }
                  });
                }}
              >
                <View style={[styles.iconSquircle, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                  <LogOut size={17} color="#DC2626" />
                </View>
                <Text style={[styles.menuItemTitle, { color: '#DC2626' }]}>Sign Out Account</Text>
                <ChevronRight size={16} color="#DC2626" />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <NotificationModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={notifLoading}
        refreshing={notifRefreshing}
        onRefresh={onNotifRefresh}
        onMarkAsRead={onMarkNotifRead}
        onMarkAllAsRead={onMarkAllNotifRead}
        onDelete={onDeleteNotif}
        onClearAll={onClearAllNotif}
        onNavigateItem={(item) => {
          setNotifModalVisible(false);
          if (item.type?.includes('JOB') && navigation && typeof navigation.navigate === 'function') {
            navigation.navigate('JobApplicants', { jobId: undefined, jobTitle: 'Notifications' });
          }
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backButton: {
    marginRight: SPACING.xs,
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#032B69',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textWhite,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTitleBox: {
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  notifText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    marginTop: SPACING.xs,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate300,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    height: 46,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  /* Drawer Modal Styles */
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawerPanel: {
    width: '82%',
    maxWidth: 310,
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
  },
  topCloseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: 2,
  },
  menuDrawerTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.slate100,
  },
  profileHeaderBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  profileNameText: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileEmailText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  menuScroll: {
    flex: 1,
  },
  groupHeaderLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    paddingLeft: 6,
    marginTop: 14,
    marginBottom: 6,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 12,
  },
  iconSquircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItemTitle: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.slate900,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: SPACING.xs,
  },
});
