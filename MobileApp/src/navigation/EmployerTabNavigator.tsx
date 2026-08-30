import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StatusBar,
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
import { CompanyProfileScreen } from '../screens/profile/CompanyProfileScreen';
import { CompanyLogoAvatar } from '../components/common/CompanyLogoAvatar';
import { useAuth } from '../hooks/useAuth';
import { COLORS, FONTS } from '../constants/theme';

const Tab = createBottomTabNavigator();

// Wrapper for Applicants tab — passes through route params from navigation (e.g. from Manage Jobs)
const DefaultApplicantsScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const jobId = route?.params?.jobId ?? undefined;
  const jobTitle = route?.params?.jobTitle || 'All Applicants';
  return <JobApplicantsScreen route={{ params: { jobId, jobTitle } }} navigation={navigation} />;
};

// Redirect component to ensure JobPost opens in full screen and ManageJobs is active underneath
const PostTabRedirectScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  React.useEffect(() => {
    navigation.navigate('ManageJobsTab');
    navigation.navigate('JobPost', route?.params);
  }, [navigation, route?.params]);
  return <EmployerJobsListScreen navigation={navigation} />;
};

// Custom Notched Full-Width Bottom Dock Navigation Bar with 3D Active Buttons & Labels
const CustomNotchedTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userName = user?.name || user?.companyName || user?.company_name || 'Employer';
  const firstInitial = userName.charAt(0).toUpperCase();

  // Enforce Status Bar styling strictly based on the active tab
  React.useEffect(() => {
    const activeRouteName = state.routes[state.index]?.name;
    if (Platform.OS === 'android') {
      if (activeRouteName === 'ProfileTab') {
        StatusBar.setBackgroundColor('#0A58E2', true);
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setTranslucent(true);
      } else {
        StatusBar.setBackgroundColor('#FFFFFF', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(false);
      }
    }
  }, [state.index]);

  const dockWidth = windowWidth;
  const dockHeight = 58 + Math.max(insets.bottom, 10);
  const center = dockWidth / 2;

  // Ultra-Smooth iOS-Style Concave Notch Curve
  const pathD = `
    M 0,0
    H ${center - 42}
    C ${center - 26},0 ${center - 22},24 ${center},24
    C ${center + 22},24 ${center + 26},0 ${center + 42},0
    H ${dockWidth}
    V ${dockHeight}
    H 0
    Z
  `;

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={[styles.dockContainer, { width: dockWidth, height: dockHeight }]}>
        {/* SVG Background - Full Width White Notched Bar (Exact Candidate Theme) */}
        <Svg width={dockWidth} height={dockHeight} style={StyleSheet.absoluteFill}>
          <Path d={pathD} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={0.8} />
        </Svg>

        {/* Tab Items Row */}
        <View style={[styles.dockItemsRow, { paddingBottom: Math.max(insets.bottom, 6) }]}>
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
                    onPress={() => {
                      navigation.navigate('ManageJobsTab');
                      navigation.navigate('JobPost');
                    }}
                    style={styles.fabTouchable}
                  >
                    <LinearGradient
                      colors={COLORS.employerGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.fabCircleGradient}
                    >
                      <Plus size={24} color="#FFFFFF" strokeWidth={2.6} />
                    </LinearGradient>
                    <Text style={[styles.tabLabelText, isFocused && styles.tabLabelTextActive, { marginTop: 4 }]}>Post</Text>
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
            const companyLogo =
              (user as any)?.companyLogo ||
              (user as any)?.company_logo ||
              (user as any)?.logoUrl ||
              (user as any)?.logo_url ||
              (user as any)?.profile_picture_url ||
              (user as any)?.profilePictureUrl ||
              (user as any)?.avatarUrl ||
              (user as any)?.avatar;
            const iconColor = isFocused ? COLORS.employerPrimary : '#1E293B';

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View style={[styles.iconPillBox, isFocused && styles.iconPillBoxActive]}>
                  {isProfileTab && companyLogo ? (
                    <Image
                      source={{ uri: companyLogo }}
                      style={{
                        width: isFocused ? 24 : 22,
                        height: isFocused ? 24 : 22,
                        borderRadius: isFocused ? 12 : 11,
                        borderWidth: isFocused ? 2 : 1.5,
                        borderColor: isFocused ? COLORS.employerPrimary : '#1E293B',
                      }}
                    />
                  ) : isProfileTab ? (
                    <Text style={[styles.avatarInitialText, isFocused && { color: COLORS.employerPrimary }]}>
                      {firstInitial}
                    </Text>
                  ) : (
                    <IconComponent
                      size={22}
                      color={iconColor}
                      fill="none"
                      strokeWidth={isFocused ? 2.5 : 2.2}
                    />
                  )}
                </View>

                {/* Sleek Active Indicator Capsule Underneath */}
                {isFocused ? <View style={styles.activeCapsuleIndicator} /> : null}

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
      <Tab.Screen name="PostTab" component={PostTabRedirectScreen} />
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
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dockItemsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    zIndex: 10,
    elevation: 2,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  iconPillBox: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconPillBoxActive: {
    backgroundColor: 'transparent',
  },
  avatarInitialText: {
    fontSize: 14,
    fontFamily: FONTS.black,
    fontWeight: '900',
    color: '#1E293B',
  },
  activeCapsuleIndicator: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.employerPrimary,
    marginTop: 2,
  },
  tabLabelText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelTextActive: {
    color: COLORS.employerPrimary,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  centerFabSlot: {
    width: 68,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabTouchable: {
    top: -18,
    alignItems: 'center',
  },
  fabCircleGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: COLORS.employerPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
});
