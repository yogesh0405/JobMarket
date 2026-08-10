import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Home, Search, Bookmark, ClipboardCheck, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CandidateHomeScreen } from '../screens/candidate/CandidateHomeScreen';
import { CandidateJobSearchScreen } from '../screens/candidate/CandidateJobSearchScreen';
import { CandidateJobDetailScreen } from '../screens/candidate/CandidateJobDetailScreen';
import { CandidateApplyConfirmScreen } from '../screens/candidate/CandidateApplyConfirmScreen';
import { CandidateAppliedJobsScreen } from '../screens/candidate/CandidateAppliedJobsScreen';
import { CandidateSavedJobsScreen } from '../screens/candidate/CandidateSavedJobsScreen';
import { CandidateProfileScreen } from '../screens/candidate/CandidateProfileScreen';
import { useAuth } from '../hooks/useAuth';

const Tab = createBottomTabNavigator();
const JobsStackNav = createNativeStackNavigator();

const CandidateJobsStackNavigator = () => (
  <JobsStackNav.Navigator screenOptions={{ headerShown: false }}>
    <JobsStackNav.Screen name="CandidateJobSearch" component={CandidateJobSearchScreen} />
    <JobsStackNav.Screen name="CandidateJobDetail" component={CandidateJobDetailScreen} />
    <JobsStackNav.Screen name="CandidateApplyConfirm" component={CandidateApplyConfirmScreen} />
  </JobsStackNav.Navigator>
);

const CandidateCustomNotchedTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const currentRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(currentRoute) || currentRoute.name;

  if (
    focusedRouteName === 'CandidateJobDetail' ||
    focusedRouteName === 'CandidateApplyConfirm' ||
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
  const dockHeight = 62 + Math.max(insets.bottom, 6);
  const center = dockWidth / 2;

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
        <Svg width={dockWidth} height={dockHeight} style={StyleSheet.absoluteFill}>
          <Path d={pathD} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.5} />
        </Svg>

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

            if (route.name === 'CandidateJobsTab' || route.name === 'CandidateSearchFABTab') {
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
                      <Search size={22} color="#FFFFFF" strokeWidth={2.8} />
                    </LinearGradient>
                    <Text style={[styles.tabLabelText, isFocused && styles.tabLabelTextActive, { marginTop: 6 }]}>Find Jobs</Text>
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
            } else if (route.name === 'CandidateSavedTab') {
              IconComponent = Bookmark;
              labelText = 'Saved';
            } else if (route.name === 'CandidateProfileTab') {
              IconComponent = User;
              labelText = 'Profile';
            }

            const isProfileTab = route.name === 'CandidateProfileTab';

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
                        width: isFocused ? 26 : 24,
                        height: isFocused ? 26 : 24,
                        borderRadius: isFocused ? 13 : 12,
                        borderWidth: isFocused ? 2 : 1,
                        borderColor: isFocused ? '#2563EB' : '#94A3B8',
                      }}
                    />
                  ) : (
                    <IconComponent
                      size={22}
                      color={isFocused ? '#2563EB' : '#64748B'}
                      strokeWidth={isFocused ? 2.4 : 2.0}
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

export const CandidateTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CandidateCustomNotchedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="CandidateHomeTab" component={CandidateHomeScreen} />
      <Tab.Screen name="CandidateAppliedTab" component={CandidateAppliedJobsScreen} />
      <Tab.Screen name="CandidateJobsTab" component={CandidateJobsStackNavigator} />
      <Tab.Screen name="CandidateSavedTab" component={CandidateSavedJobsScreen} />
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  iconPillBoxActive: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
  },
  avatarBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  avatarBoxActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  initialsBg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsBgActive: {
    backgroundColor: '#2563EB',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  initialsTextActive: {
    color: '#FFFFFF',
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
});
