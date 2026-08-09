import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  MoreVertical,
  Menu,
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
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationModal } from './NotificationModal';
import { JobMarketLogoSvg } from './JobMarketLogoSvg';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  useThreeDots?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightAction,
  useThreeDots = true,
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

  const [modalMounted, setModalMounted] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  
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



  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const canGoBackInNav = navigation && typeof navigation.canGoBack === 'function' ? navigation.canGoBack() : false;
  const isBackAvailable = (showBack || !!onBack) && (onBack || canGoBackInNav);

  const displayName = user?.companyName || user?.company_name || user?.name || 'insightforge';
  const displayEmail = user?.email || 'noreply.insightforge19@gmail.com';
  const initialLetter = displayName.charAt(0).toUpperCase() || 'I';

  return (
    <>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.content}>
          {/* Back propagation arrow */}
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

          {/* Title & Subtitle with Brand Logo */}
          <View style={styles.titleContainer}>
            <View style={styles.brandHeaderLeft}>
              {!isBackAvailable ? (
                <View style={{ marginRight: 8 }}>
                  <JobMarketLogoSvg size={34} />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
              </View>
            </View>
          </View>

          {/* Right Header Actions */}
          <View style={styles.rightSlot}>
            {rightAction ? <View style={{ marginRight: SPACING.xs }}>{rightAction}</View> : null}

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
      </View>

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

          <Animated.View
            style={[
              styles.drawerPanel,
              {
                paddingTop: Math.max(insets.top + 12, 24),
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
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

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.profileHeaderBlock}
              onPress={() => {
                closeDrawer(() => {
                  const isCandidate = (user?.role || '').toLowerCase() === 'candidate';
                  if (navigation && typeof navigation.navigate === 'function') {
                    if (isCandidate) {
                      navigation.navigate('CandidateProfile');
                    } else {
                      navigation.navigate('CompanyProfile');
                    }
                  }
                });
              }}
            >
              <View style={styles.avatarRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{initialLetter}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileNameText} numberOfLines={1}>{displayName}</Text>
                  <Text style={styles.profileEmailText} numberOfLines={1}>{displayEmail}</Text>
                </View>
                <ChevronRight size={16} color={COLORS.slate400} />
              </View>
            </TouchableOpacity>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.groupHeaderLabel}>PLATFORM WORKSPACE</Text>

              {/* Dynamic RBAC Menu Items */}
              {(user?.role || '').toLowerCase() === 'candidate' ? (
                <>
                  <TouchableOpacity
                    style={styles.menuItemRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      closeDrawer(() => {
                        if (navigation && typeof navigation.navigate === 'function') {
                          navigation.navigate('CandidateProfile');
                        }
                      });
                    }}
                  >
                    <View style={[styles.iconSquircle, { backgroundColor: '#EFF6FF' }]}>
                      <UserIcon size={17} color="#2563EB" />
                    </View>
                    <Text style={[styles.menuItemTitle, { fontWeight: '800', color: '#2563EB' }]}>
                      My Profile & Bio-Data
                    </Text>
                    <ChevronRight size={16} color="#2563EB" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItemRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      closeDrawer(() => {
                        if (navigation && typeof navigation.navigate === 'function') {
                          navigation.navigate('CandidateResume');
                        }
                      });
                    }}
                  >
                    <View style={styles.iconSquircle}>
                      <UserIcon size={17} color="#334155" />
                    </View>
                    <Text style={styles.menuItemTitle}>My Resume Document</Text>
                    <ChevronRight size={16} color={COLORS.slate400} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItemRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      closeDrawer(() => {
                        if (navigation && typeof navigation.navigate === 'function') {
                          navigation.navigate('CandidateMain', {
                            screen: 'CandidateProfileTab',
                            params: { initialTab: 'DASHBOARD', tab: 'DASHBOARD' },
                          });
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
                </>
              ) : (
                <>
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

                  <TouchableOpacity
                    style={styles.menuItemRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      closeDrawer(() => {
                        if (navigation && typeof navigation.navigate === 'function') {
                          navigation.navigate('EmployerBanners');
                        }
                      });
                    }}
                  >
                    <View style={[styles.iconSquircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                      <Sparkles size={17} color="#2563EB" />
                    </View>
                    <Text style={[styles.menuItemTitle, { color: '#2563EB', fontWeight: '800' }]}>Promote Banner / Ads</Text>
                    <ChevronRight size={16} color="#2563EB" />
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.menuDivider} />

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
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 6,
    paddingHorizontal: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  backButton: {
    marginRight: SPACING.xs,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  brandHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLogoBadge: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerLogoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  title: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  bellButton: {
    padding: 6,
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
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
