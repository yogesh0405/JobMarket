import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Users, ClipboardCheck, PlusCircle, LayoutList, BellRing } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CandidatesScreen } from '../screens/candidates/CandidatesScreen';
import { JobApplicantsScreen } from '../screens/jobs/JobApplicantsScreen';
import { JobPostScreen } from '../screens/jobs/JobPostScreen';
import { EmployerJobsListScreen } from '../screens/jobs/EmployerJobsListScreen';
import { NotificationScreen } from '../screens/notifications/NotificationScreen';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
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

// Custom Full-Width Bottom Dock Navigation Bar with 3D Active Buttons & Labels
const CustomNotchedTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  // Enforce Status Bar styling strictly based on the active tab
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFFFFF', true);
      StatusBar.setBarStyle('dark-content', true);
      StatusBar.setTranslucent(false);
    }
  }, [state.index]);

  const dockHeight = 58 + Math.max(insets.bottom, 10);

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={[styles.dockContainer, { height: dockHeight }]}>
        {/* Tab Items Row */}
        <View style={[styles.dockItemsRow, { paddingBottom: Math.max(insets.bottom, 6) }]}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              if (route.name === 'PostTab') {
                navigation.navigate('ManageJobsTab');
                navigation.navigate('JobPost');
                return;
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Side Tab Icons & Labels
            let IconComponent: any = Users;
            let labelText = 'Candidates';

            if (route.name === 'CandidatesTab') {
              IconComponent = Users;
              labelText = 'Candidates';
            } else if (route.name === 'ApplicantsTab') {
              IconComponent = ClipboardCheck;
              labelText = 'Applicants';
            } else if (route.name === 'PostTab') {
              IconComponent = PlusCircle;
              labelText = 'Post';
            } else if (route.name === 'NotificationsTab') {
              IconComponent = BellRing;
              labelText = 'Alerts';
            } else if (route.name === 'ManageJobsTab') {
              IconComponent = LayoutList;
              labelText = 'Manage Jobs';
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
      <Tab.Screen name="NotificationsTab" component={NotificationScreen} />
      <Tab.Screen name="ManageJobsTab" component={EmployerJobsListScreen} />
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
