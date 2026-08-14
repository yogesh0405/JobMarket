import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {
  User as UserIcon,
  FileText,
  ShieldCheck,
  Info,
  HelpCircle,
  LogOut,
  X,
  ChevronRight,
  LayoutGrid,
  Calendar,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/theme';

interface CandidateSideDrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

export const CandidateSideDrawer: React.FC<CandidateSideDrawerProps> = ({
  visible,
  onClose,
  navigation,
}) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleNavigate = (screenName: string) => {
    onClose();
    navigation.navigate(screenName);
  };

  const handleLogout = async () => {
    onClose();
    try {
      await logout();
    } catch (err) {
      console.error('Logout error in drawer:', err);
    }
  };

  const coreMenuItems = [
    {
      label: 'Dashboard & Analytics',
      icon: LayoutGrid,
      action: () => {
        onClose();
        navigation.navigate('CandidateMain', {
          screen: 'CandidateProfileTab',
          params: { initialTab: 'DASHBOARD', tab: 'DASHBOARD' },
        });
      },
    },
    {
      label: 'My Candidate Profile',
      icon: UserIcon,
      action: () => handleNavigate('CandidateProfile'),
    },
    {
      label: 'My Interviews',
      icon: Calendar,
      action: () => handleNavigate('MyInterviews'),
    },
    {
      label: 'Resume & Bio-Data',
      icon: FileText,
      action: () => handleNavigate('CandidateResume'),
    },
  ];

  const secMenuItems = [
    {
      label: 'Security Settings',
      icon: ShieldCheck,
      action: () => handleNavigate('SecuritySettings'),
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      action: () => handleNavigate('HelpSupport'),
    },
    {
      label: 'About JobMarket',
      icon: Info,
      action: () => handleNavigate('AboutUs'),
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.drawerContainer, { paddingTop: Math.max(insets.top + 8, 20) }]}>
          <View style={styles.profileHeaderCard}>
            <View style={styles.headerInfo}>
              <View style={styles.avatarContainer}>
                {user?.profilePictureUrl ? (
                  <Image
                    source={{ uri: user.profilePictureUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {(user?.name || 'C').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.profileTextContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.name || 'Candidate User'}
                  </Text>
                  <ShieldCheck size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || 'candidate@jobmarket.com'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuContainer}>
            <Text style={styles.sectionHeaderLabel}>CORE NAVIGATION</Text>
            <View style={styles.groupedMenuCard}>
              {coreMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === coreMenuItems.length - 1;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                    activeOpacity={0.7}
                    onPress={item.action}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconBox}>
                        <Icon size={17} color={COLORS.primary} />
                      </View>
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>
                    <ChevronRight size={15} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionHeaderLabel}>SETTINGS & SUPPORT</Text>
            <View style={styles.groupedMenuCard}>
              {secMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === secMenuItems.length - 1;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                    activeOpacity={0.7}
                    onPress={item.action}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconBox}>
                        <Icon size={17} color={COLORS.primary} />
                      </View>
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>
                    <ChevronRight size={15} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
              <LogOut size={16} color="#DC2626" />
              <Text style={styles.logoutText}>Log Out Account</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>JobMarket Mobile v1.0 • MIDC Verified</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#F8FAFC',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 16,
    paddingTop: 52,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    marginHorizontal: 14,
    marginBottom: 6,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  menuContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 14,
  },
  sectionHeaderLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingLeft: 4,
  },
  groupedMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  drawerFooter: {
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 14,
    gap: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  versionText: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },
});
