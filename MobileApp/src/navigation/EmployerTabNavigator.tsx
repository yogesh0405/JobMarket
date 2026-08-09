import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Users, ClipboardCheck, Plus, Briefcase, Building2, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CandidatesScreen } from '../screens/candidates/CandidatesScreen';
import { JobApplicantsScreen } from '../screens/jobs/JobApplicantsScreen';
import { JobPostScreen } from '../screens/jobs/JobPostScreen';
import { EmployerJobsListScreen } from '../screens/jobs/EmployerJobsListScreen';
import { EmployerDashboardScreen } from '../screens/dashboard/EmployerDashboardScreen';
import { CompanyProfileScreen } from '../screens/profile/CompanyProfileScreen';
import { CompanyLogoAvatar } from '../components/common/CompanyLogoAvatar';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

// Dummy wrapper for Applicants tab when opened directly from bottom navbar
const DefaultApplicantsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return <JobApplicantsScreen route={{ params: { jobId: undefined, jobTitle: 'All Applicants' } }} navigation={navigation} />;
};

// Custom Notched Full-Width Bottom Dock Navigation Bar with 3D Active Buttons & Labels
const CustomNotchedTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userName = user?.name || user?.companyName || user?.company_name || 'Employer';
  const firstInitial = userName.charAt(0).toUpperCase();

  const dockWidth = windowWidth;
  const dockHeight = 62 + Math.max(insets.bottom, 6);
  const center = dockWidth / 2;

  // Edge-to-Edge Full Width Path with Center Concave Dip Notch
  const pathD = `
    M 0,0
    H ${center - 38}
    C ${center - 24},0 ${center - 20},22 ${center},22
    C ${center + 20},22 ${center + 24},0 ${center + 38},0
    H ${dockWidth}
    V ${dockHeight}
    H 0
    Z
  `;

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={[styles.dockContainer, { width: dockWidth, height: dockHeight }]}>
        {/* SVG Background - 3D Full Width White Notched Bar */}
        <Svg width={dockWidth} height={dockHeight} style={StyleSheet.absoluteFill}>
          <Path d={pathD} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.5} />
        </Svg>

        {/* Tab Items Row */}
        <View style={[styles.dockItemsRow, { paddingBottom: Math.max(insets.bottom, 4) }]}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Center Floating Action FAB (Post Tab)
            if (route.name === 'PostTab') {
              return (
                <View key={route.key} style={styles.centerFabSlot}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onPress}
                    style={styles.fabTouchable}
                  >
                    <LinearGradient
                      colors={['#2563EB', '#1D4ED8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.fabCircleGradient}
                    >
                      <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
                    </LinearGradient>
                    <Text style={[styles.tabLabelText, isFocused && styles.tabLabelTextActive, { marginTop: 6 }]}>Post</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            // Side Tab Icons & Labels
            let IconComponent: any = Users;
            let labelText = 'Candidates';

            if (route.name === 'CandidatesTab') {
              IconComponent = Users;
              labelText = 'Candidates';
            } else if (route.name === 'ApplicantsTab') {
              IconComponent = ClipboardCheck;
              labelText = 'Applicants';
            } else if (route.name === 'ManageJobsTab') {
              IconComponent = Briefcase;
              labelText = 'Manage Jobs';
            } else if (route.name === 'ProfileTab') {
              IconComponent = Building2;
              labelText = 'Company';
            }

            const isProfileTab = route.name === 'ProfileTab';

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View style={[styles.iconPillBox, isFocused && styles.iconPillBoxActive]}>
                  {isProfileTab ? (
                    <CompanyLogoAvatar
                      logoUrl={(user as any)?.companyLogoUrl || user?.company_logo || user?.profile_picture_url}
                      companyName={user?.companyName || user?.company_name || user?.name}
                      size={24}
                      borderRadius={12}
                    />
                  ) : (
                    <IconComponent
                      size={20}
                      color={isFocused ? '#FFFFFF' : '#0F172A'}
                      strokeWidth={isFocused ? 2.5 : 2.2}
                    />
                  )}
                </View>
                <Text style={[styles.tabLabelText, isFocused && styles.tabLabelTextActive]} numberOfLines={1}>
                  {labelText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export const EmployerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomNotchedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="CandidatesTab" component={CandidatesScreen} />
      <Tab.Screen name="ApplicantsTab" component={DefaultApplicantsScreen} />
      <Tab.Screen name="PostTab" component={JobPostScreen} />
      <Tab.Screen name="ManageJobsTab" component={EmployerJobsListScreen} />
      <Tab.Screen name="ProfileTab" component={CompanyProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dockContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 14,
  },
  dockItemsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    zIndex: 10,
    elevation: 10,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  iconPillBoxActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  tabLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  centerFabSlot: {
    width: 62,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabTouchable: {
    top: -15,
    alignItems: 'center',
  },
  fabCircleGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#60A5FA',
    borderBottomWidth: 3.5,
    borderBottomColor: '#1E40AF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  avatarMiniImg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    resizeMode: 'cover',
  },
  avatarInitialText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
});
