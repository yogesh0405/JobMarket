import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Home, Search, Building2, ClipboardCheck, BellRing } from 'lucide-react-native';
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
import { NotificationScreen } from '../screens/notifications/NotificationScreen';
import { CompanyProfileScreen } from '../screens/profile/CompanyProfileScreen';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

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

  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  const dockHeight = 58 + Math.max(insets.bottom, 10);

  // Enforce white dark-content StatusBar across all candidate tabs
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFFFFF', true);
      StatusBar.setBarStyle('dark-content', true);
      StatusBar.setTranslucent(false);
    }
  }, [state.index]);

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={[styles.dockContainer, { height: dockHeight }]}>
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

            let IconComponent: any = Home;
            let labelText = 'Home';

            if (route.name === 'CandidateHomeTab') {
              IconComponent = Home;
              labelText = 'Home';
            } else if (route.name === 'CandidateSavedTab' || route.name === 'CandidateCompaniesTab') {
              IconComponent = Building2;
              labelText = 'Companies';
            } else if (route.name === 'CandidateJobsTab' || route.name === 'CandidateSearchFABTab') {
              IconComponent = Search;
              labelText = 'Jobs';
            } else if (route.name === 'NotificationsTab' || route.name === 'CandidateNotificationsTab') {
              IconComponent = BellRing;
              labelText = 'Alerts';
            } else if (route.name === 'CandidateAppliedTab') {
              IconComponent = ClipboardCheck;
              labelText = 'Applied';
            }

            const iconColor = isFocused ? COLORS.employerPrimary : '#64748B';

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={onPress}
                style={styles.tabItem}
              >
                {/* Top Active Indicator Line */}
                {isFocused ? (
                  <View style={styles.topActiveIndicator} />
                ) : (
                  <View style={styles.topInactiveIndicator} />
                )}

                <View style={styles.iconPillBox}>
                  <IconComponent
                    size={23}
                    color={iconColor}
                    fill="none"
                    strokeWidth={isFocused ? 2.4 : 1.8}
                  />
                  {route.name === 'NotificationsTab' && unreadCount > 0 ? (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  ) : null}
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
      <Tab.Screen name="CandidateSavedTab" component={CandidateCompaniesScreen} />
      <Tab.Screen name="CandidateJobsTab" component={CandidateJobsStackNavigator} />
      <Tab.Screen name="NotificationsTab" component={NotificationScreen} />
      <Tab.Screen name="CandidateAppliedTab" component={CandidateAppliedJobsScreen} />
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
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  dockItemsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    zIndex: 10,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    position: 'relative',
  },
  topActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: '60%',
    height: 3,
    backgroundColor: COLORS.employerPrimary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  topInactiveIndicator: {
    position: 'absolute',
    top: 0,
    width: '60%',
    height: 3,
    backgroundColor: 'transparent',
  },
  iconPillBox: {
    width: 36,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 10,
  },
  tabLabelText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  tabLabelTextActive: {
    color: COLORS.employerPrimary,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
});
