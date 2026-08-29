import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Home, Search, Building2, ClipboardCheck, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, COLORS } from '../constants/theme';

import { CandidateHomeScreen } from '../screens/candidate/CandidateHomeScreen';
import { CandidateJobSearchScreen } from '../screens/candidate/CandidateJobSearchScreen';
import { CandidateJobDetailScreen } from '../screens/candidate/CandidateJobDetailScreen';
import { CandidateApplyConfirmScreen } from '../screens/candidate/CandidateApplyConfirmScreen';
import { CandidateAppliedJobsScreen } from '../screens/candidate/CandidateAppliedJobsScreen';
import { CandidateSavedJobsScreen } from '../screens/candidate/CandidateSavedJobsScreen';
import { CandidateCompaniesScreen } from '../screens/candidate/CandidateCompaniesScreen';
import { CandidateProfileScreen } from '../screens/candidate/CandidateProfileScreen';
import { CandidateJobMapViewScreen } from '../screens/candidate/CandidateJobMapViewScreen';
import { CompanyProfileScreen } from '../screens/profile/CompanyProfileScreen';
import { useAuth } from '../hooks/useAuth';

const Tab = createBottomTabNavigator();
const JobsStackNav = createNativeStackNavigator();

const CandidateJobsStackNavigator = () => (
  <JobsStackNav.Navigator screenOptions={{ headerShown: false }}>
    <JobsStackNav.Screen name="CandidateJobSearch" component={CandidateJobSearchScreen} />
    <JobsStackNav.Screen name="CandidateJobMapView" component={CandidateJobMapViewScreen} />
    <JobsStackNav.Screen name="CandidateJobDetail" component={CandidateJobDetailScreen} />
    <JobsStackNav.Screen name="CandidateApplyConfirm" component={CandidateApplyConfirmScreen} />
    <JobsStackNav.Screen name="CompanyProfile" component={CompanyProfileScreen} />
  </JobsStackNav.Navigator>
);

const CandidateCustomNotchedTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const currentRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(currentRoute) || currentRoute.name;

  if (
    focusedRouteName === 'CandidateJobDetail' ||
    focusedRouteName === 'CandidateApplyConfirm' ||
    focusedRouteName === 'CandidateJobMapView' ||
    focusedRouteName === 'JobDetail' ||
    focusedRouteName === 'JobDetails'
  ) {
    return null;
  }

  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const avatarUri =
    user?.profilePictureUrl ||
    (user as any)?.profile_picture_url ||
    (user as any)?.profilePhotoUrl ||
    (user as any)?.avatar;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const dockWidth = windowWidth;
  const dockHeight = 58 + Math.max(insets.bottom, 10);
  const center = dockWidth / 2;

  // Enforce white dark-content StatusBar across all candidate tabs
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFFFFF', true);
      StatusBar.setBarStyle('dark-content', true);
      StatusBar.setTranslucent(false);
    }
  }, [state.index]);

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
        <Svg width={dockWidth} height={dockHeight} style={StyleSheet.absoluteFill}>
          <Path d={pathD} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={0.8} />
        </Svg>

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

            if (route.name === 'CandidateJobsTab' || route.name === 'CandidateSearchFABTab') {
              return (
                <View key={route.key} style={styles.centerFabSlot}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onPress}
                    style={styles.fabTouchable}
                  >
                    <LinearGradient
                      colors={COLORS.employerGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.fabCircleGradient}
                    >
                      <Search size={18} color="#FFFFFF" fill="none" strokeWidth={2.2} />
                    </LinearGradient>
                    <Text style={[styles.tabLabelText, isFocused && styles.tabLabelTextActive, { marginTop: 4 }]}>Find Jobs</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            let IconComponent: any = Home;
            let labelText = 'Home';

            if (route.name === 'CandidateHomeTab') {
              IconComponent = Home;
              labelText = 'Home';
            } else if (route.name === 'CandidateAppliedTab') {
              IconComponent = ClipboardCheck;
              labelText = 'Applied';
            } else if (route.name === 'CandidateSavedTab' || route.name === 'CandidateCompaniesTab') {
              IconComponent = Building2;
              labelText = 'Companies';
            } else if (route.name === 'CandidateProfileTab') {
              IconComponent = User;
              labelText = 'Profile';
            }

            const isProfileTab = route.name === 'CandidateProfileTab';
            const iconColor = isFocused ? COLORS.employerPrimary : '#1E293B';

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View style={[styles.iconPillBox, isFocused && styles.iconPillBoxActive]}>
                  {isProfileTab && avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={{
                        width: isFocused ? 24 : 22,
                        height: isFocused ? 24 : 22,
                        borderRadius: isFocused ? 12 : 11,
                        borderWidth: isFocused ? 2 : 1.5,
                        borderColor: isFocused ? COLORS.employerPrimary : '#1E293B',
                      }}
                    />
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

export const CandidateTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CandidateCustomNotchedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="CandidateHomeTab" component={CandidateHomeScreen} />
      <Tab.Screen name="CandidateSavedTab" component={CandidateCompaniesScreen} />
      <Tab.Screen name="CandidateJobsTab" component={CandidateJobsStackNavigator} />
      <Tab.Screen name="CandidateAppliedTab" component={CandidateAppliedJobsScreen} />
      <Tab.Screen name="CandidateProfileTab" component={CandidateProfileScreen} />
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
