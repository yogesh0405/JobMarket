import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { notificationApi } from '../api/notificationApi';
import { resolveMobileNotificationRoute } from '../utils/notificationRouter';

const STORED_FCM_TOKEN_KEY = '@jobmarket_device_fcm_token';

// Safely detect if running inside the Expo Go client app
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any)?.appOwnership === 'expo';

/**
 * Lightweight in-process event bus so PushNotificationManager can signal
 * the useNotifications hook to refresh immediately when a push arrives.
 */
type RefreshCallback = () => void;
const refreshListeners = new Set<RefreshCallback>();

export const onPushNotificationRefresh = (cb: RefreshCallback) => {
  refreshListeners.add(cb);
  return () => refreshListeners.delete(cb);
};

function triggerNotificationRefresh() {
  refreshListeners.forEach((cb) => {
    try { cb(); } catch { }
  });
}

// Configure foreground notification behavior safely
try {
  if (!isExpoGo) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  console.warn('[PushNotificationManager] Could not set notification handler:', e);
}

export class PushNotificationManager {
  private static notificationListener: any = null;
  private static responseListener: any = null;
  private static navigationRef: any = null;
  private static userRole: string = 'candidate';

  /**
   * Set the current logged-in user's role so push navigation routes correctly.
   * Should be called from AuthContext whenever user changes.
   */
  static setUserRole(role: string) {
    this.userRole = (role || 'candidate').toLowerCase();
  }

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

    // Remote push notifications are not supported in Expo Go (iOS & Android)
    if (isExpoGo) {
      console.log(
        `[PushNotificationManager] Running in Expo Go on ${Platform.OS}: remote push notifications are disabled in Expo Go. Use a development build or standalone app for push notifications.`
      );
      return;
    }

    try {
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

      // 1. Foreground notification received listener — refresh badge + list immediately
      this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
        console.log('[Push] Foreground notification received:', notification.request.content.title);
        // Immediately signal all useNotifications subscribers to re-fetch
        triggerNotificationRefresh();
      });

      // 2. Notification tap response listener — refresh + deep-link navigate
      this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('[Push] User tapped notification:', data);
        // Refresh notification list (marks as seen state)
        triggerNotificationRefresh();
        this.handleDeepLink(data);
      });
    } catch (err) {
      console.warn('[PushNotificationManager] Listener initialization skipped or failed:', err);
    }
  }

  /**
   * Request push notification permissions and register token with backend
   */
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      if (isExpoGo) {
        console.log('[PushNotificationManager] Push token registration skipped: running inside Expo Go client.');
        return null;
      }

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
    try {
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
    } catch (err) {
      // Silently ignore cleanup errors
    }
  }

  /**
   * Route user to the correct screen based on notification type and entity data.
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
   * Core routing logic — uses resolveMobileNotificationRoute for consistent,
   * role-aware navigation across all notification types.
   *
   * Notification data shape (sent by backend PushNotificationService):
   *   type         → notification type string (e.g. 'JOB_APPLICATION', 'JOB_STATUS', etc.)
   *   entityType   → 'job' | 'application' | 'interview' | 'support' | 'ad'
   *   entityId     → UUID of the related entity
   *   screen       → optional explicit screen override
   *   link         → optional URL hint
   */
  private static performNavigation(data: any) {
    const nav = this.navigationRef;
    const role = this.userRole;

    // Build a notification-router-compatible payload from raw push data
    const payload = {
      id: data.id || '',
      title: data.title || '',
      message: data.message || data.body || '',
      type: data.type || data.notificationType || '',
      link: data.link || data.url || '',
      entityType: data.entityType || data.entity_type || '',
      entity_type: data.entity_type || data.entityType || '',
      entityId: data.entityId || data.entity_id || data.jobId || '',
      entity_id: data.entity_id || data.entityId || data.jobId || '',
      metadata: data.metadata || {},
    };

    // Use resolveMobileNotificationRoute which handles ALL notification types + roles
    const target = resolveMobileNotificationRoute(payload, role);

    if (target && target.screen) {
      console.log('[Push] Navigating to:', target.screen, target.params);
      if (target.params) {
        nav.navigate(target.screen, target.params);
      } else {
        nav.navigate(target.screen);
      }
      return;
    }

    // If route cannot be resolved, open Notifications screen as fallback
    console.log('[Push] No route resolved, falling back to Notifications');
    try {
      nav.navigate('Notifications');
    } catch {
      // Screen may not be registered — silently ignore
    }
  }
}
