import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationApi } from '../api/notificationApi';

const STORED_FCM_TOKEN_KEY = '@jobmarket_device_fcm_token';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class PushNotificationManager {
  private static notificationListener: any = null;
  private static responseListener: any = null;
  private static navigationRef: any = null;

  /**
   * Set global navigation reference for handling deep links from notification clicks
   */
  static setNavigationRef(ref: any) {
    this.navigationRef = ref;
  }

  /**
   * Initialize Android channel & notification event listeners
   */
  static async init(navigationRef?: any) {
    if (navigationRef) {
      this.navigationRef = navigationRef;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0066CC',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Clean up previous listeners if re-initializing
    this.cleanupListeners();

    // 1. Foreground notification received listener
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Push notification received in foreground:', notification.request.content.title);
    });

    // 2. Notification tap response listener
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('User tapped push notification:', data);
      this.handleDeepLink(data);
    });
  }

  /**
   * Request push notification permissions and register token with backend
   */
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
      }

      // Check existing permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return null;
      }

      // Get the native FCM/APNs device push token
      let token: string | null = null;
      try {
        const deviceTokenResult = await Notifications.getDevicePushTokenAsync();
        token = deviceTokenResult.data;
      } catch (deviceTokenErr) {
        // Fallback to Expo push token if getDevicePushToken is not available in current runner
        try {
          const expoTokenResult = await Notifications.getExpoPushTokenAsync();
          token = expoTokenResult.data;
        } catch (expoTokenErr) {
          console.error('Error fetching push token:', expoTokenErr);
        }
      }

      if (!token) {
        console.warn('Could not retrieve push device token');
        return null;
      }

      console.log('Retrieved device push token successfully');

      // Store token locally
      await AsyncStorage.setItem(STORED_FCM_TOKEN_KEY, token);

      // Register token with backend
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      await notificationApi.registerDeviceToken(token, platform);

      return token;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Unregister device token on logout
   */
  static async unregisterDeviceToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(STORED_FCM_TOKEN_KEY);
      if (token) {
        await notificationApi.unregisterDeviceToken(token);
        await AsyncStorage.removeItem(STORED_FCM_TOKEN_KEY);
        console.log('Device push token unregistered successfully');
      }
    } catch (error) {
      console.error('Failed to unregister device push token:', error);
    }
  }

  /**
   * Clean up notification listeners on unmount
   */
  static cleanupListeners() {
    if (this.notificationListener) {
      if (typeof this.notificationListener.remove === 'function') {
        this.notificationListener.remove();
      }
      this.notificationListener = null;
    }
    if (this.responseListener) {
      if (typeof this.responseListener.remove === 'function') {
        this.responseListener.remove();
      }
      this.responseListener = null;
    }
  }

  /**
   * Route user to the correct screen based on notification type and entity data.
   *
   * Notification data shape (sent by backend PushNotificationService):
   *   type         → notification type string (e.g. 'JOB_APPLICATION', 'JOB_STATUS', etc.)
   *   entityType   → 'job' | 'application' | 'interview' | 'support' | 'ad'
   *   entityId     → UUID of the related entity
   *   screen       → optional explicit screen override
   *   link         → optional URL hint
   */
  private static handleDeepLink(data: any) {
    if (!data) return;

    // Wait until navigator is ready (retry up to 10 times with 200ms intervals)
    const navigate = () => {
      if (!this.navigationRef?.isReady?.()) return;
      try {
        this.performNavigation(data);
      } catch (e) {
        console.error('[PushNotificationManager] Navigation error:', e);
      }
    };

    if (this.navigationRef?.isReady?.()) {
      navigate();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (this.navigationRef?.isReady?.()) {
          clearInterval(interval);
          navigate();
        } else if (attempts >= 10) {
          clearInterval(interval);
        }
      }, 200);
    }
  }

  /**
   * Core routing logic — maps notification type/entity to the correct screen + params
   */
  private static performNavigation(data: any) {
    const type: string = data.type || '';
    const entityId: string = data.entityId || '';
    const screen: string = data.screen || '';
    const nav = this.navigationRef;

    // 1. Explicit screen override from notification payload
    if (screen && screen !== 'Notifications') {
      const params: Record<string, string> = {};
      if (entityId) {
        // Pass entity ID with the right key for each screen type
        if (screen === 'CandidateJobDetail') params.jobId = entityId;
        else if (screen === 'JobApplicants') params.jobId = entityId;
        else if (screen === 'ApplicantDetail') params.applicantId = entityId;
        else if (screen === 'EmployerCandidateDetail') params.candidateId = entityId;
        else if (screen === 'MyInterviews') { /* no params needed */ }
        else if (screen === 'EmployerInterviews') { /* no params needed */ }
        else params.id = entityId;
      }
      nav.navigate(screen, Object.keys(params).length > 0 ? params : undefined);
      return;
    }

    // 2. Type-based routing map
    switch (type) {
      // Candidate received: employer applied / shortlisted their job
      case 'JOB_APPLICATION':
        // Candidate → go to their applications / job detail
        if (entityId) {
          nav.navigate('CandidateJobDetail', { jobId: entityId });
        } else {
          nav.navigate('Notifications');
        }
        break;

      // Candidate received: their application status changed
      case 'JOB_STATUS':
        nav.navigate('Notifications');
        break;

      // Candidate or Employer: interview scheduled
      case 'JOB_INTERVIEW':
        // Try employer screen first; if not available, fallback to candidate
        try {
          nav.navigate('EmployerInterviews');
        } catch {
          nav.navigate('MyInterviews');
        }
        break;

      // Employer: their job post was approved/rejected by admin
      case 'JOB_APPROVAL':
        if (entityId) {
          nav.navigate('JobApplicants', { jobId: entityId });
        } else {
          nav.navigate('Notifications');
        }
        break;

      // Employer: banner ad approved
      case 'AD_APPROVED':
      case 'AD_REJECTED':
        nav.navigate('EmployerBanners');
        break;

      // Support ticket reply
      case 'SUPPORT':
        nav.navigate('HelpSupport');
        break;

      // Broadcast or system-wide alert
      case 'BROADCAST':
      case 'SYSTEM':
      default:
        // Fall back to link-based routing if provided
        if (data.link) {
          const link = String(data.link);
          if (link.includes('/job/')) {
            const jobId = link.split('/job/')[1]?.split('?')[0];
            if (jobId) {
              nav.navigate('CandidateJobDetail', { jobId });
              return;
            }
          }
          if (link.includes('/applicants/')) {
            const jobId = link.split('/applicants/')[1]?.split('?')[0];
            if (jobId) {
              nav.navigate('JobApplicants', { jobId });
              return;
            }
          }
        }
        nav.navigate('Notifications');
        break;
    }
  }
}

