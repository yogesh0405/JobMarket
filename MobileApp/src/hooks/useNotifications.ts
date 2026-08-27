import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi, AppNotification } from '../api/notificationApi';
import { useAuth } from './useAuth';

export const isNotificationRead = (n: any): boolean => {
  if (!n) return true;
  return n.read === true || n.is_read === true || n.isRead === true || n.read === 'true' || n.is_read === 'true';
};

// Global memory cache to eliminate "0 notifications" flash on screen navigation
let globalNotificationsCache: AppNotification[] = [];
let globalHasFetched = false;
let globalIsFetching = false;
const listeners = new Set<(list: AppNotification[]) => void>();

function updateGlobalCache(list: AppNotification[]) {
  globalNotificationsCache = list;
  globalHasFetched = true;
  listeners.forEach((listener) => {
    try {
      listener(list);
    } catch {}
  });
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(globalNotificationsCache);
  const [loading, setLoading] = useState<boolean>(!globalHasFetched && globalNotificationsCache.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  const userId = user?.id || '';
  const hasUser = !!user;

  // Persistence refs to prevent backend refresh from overriding local clear / read actions
  const isClearedAllRef = useRef(false);
  const allMarkedReadRef = useRef(false);
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const readIdsRef = useRef<Set<string>>(new Set());

  // Subscribe to global memory cache updates
  useEffect(() => {
    const listener = (newList: AppNotification[]) => {
      if (isMounted.current) {
        setNotifications(newList);
      }
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (!hasUser) {
      setLoading(false);
      return;
    }

    if (showLoading && !globalHasFetched && globalNotificationsCache.length === 0) {
      setLoading(true);
    }

    if (globalIsFetching) return;
    globalIsFetching = true;

    try {
      const res = await notificationApi.getNotifications();
      if (res.success && isMounted.current) {
        if (isClearedAllRef.current) {
          updateGlobalCache([]);
          return;
        }

        let rawList: AppNotification[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res as any)?.notifications)
          ? (res as any).notifications
          : Array.isArray((res as any)?.data?.notifications)
          ? (res as any).data.notifications
          : Array.isArray(res)
          ? res
          : [];

        // Apply local mutations & normalize read property
        rawList = rawList
          .filter((n) => !deletedIdsRef.current.has(n.id))
          .map((n) => {
            const isRead = isNotificationRead(n) || allMarkedReadRef.current || readIdsRef.current.has(n.id);
            return {
              ...n,
              read: isRead,
              is_read: isRead,
            };
          });

        updateGlobalCache(rawList);
      }
    } catch (e: any) {
      // Graceful error catch for notifications polling
    } finally {
      globalIsFetching = false;
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [hasUser]);

  useEffect(() => {
    isMounted.current = true;
    isClearedAllRef.current = false;
    allMarkedReadRef.current = false;
    deletedIdsRef.current.clear();
    readIdsRef.current.clear();

    if (hasUser) {
      // If we already have cache, don't block with loading spinner
      fetchNotifications(!globalHasFetched && globalNotificationsCache.length === 0);

      // Live polling interval every 30 seconds
      const intervalId = setInterval(() => {
        fetchNotifications(false);
      }, 30000);

      return () => {
        isMounted.current = false;
        clearInterval(intervalId);
      };
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [hasUser, userId, fetchNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(false);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    readIdsRef.current.add(id);
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n));
    updateGlobalCache(updated);
    try {
      await notificationApi.markAsRead(id);
    } catch (e) {
      // Ignore
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    allMarkedReadRef.current = true;
    const updated = notifications.map((n) => {
      readIdsRef.current.add(n.id);
      return { ...n, read: true, is_read: true };
    });
    updateGlobalCache(updated);
    try {
      await notificationApi.markAllAsRead();
    } catch (e) {
      // Ignore
    }
  }, [notifications]);

  const removeNotification = useCallback(async (id: string) => {
    deletedIdsRef.current.add(id);
    const updated = notifications.filter((n) => n.id !== id);
    updateGlobalCache(updated);
    try {
      await notificationApi.deleteNotification(id);
    } catch (e) {
      // Ignore
    }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    isClearedAllRef.current = true;
    updateGlobalCache([]);
    try {
      await notificationApi.clearAll();
    } catch (e) {
      // Ignore
    }
  }, []);

  const unreadCount = notifications.filter((n) => !isNotificationRead(n)).length;
  const formattedUnreadCount = unreadCount > 9 ? '9+' : unreadCount.toString();

  return {
    notifications,
    unreadCount,
    formattedUnreadCount,
    loading,
    refreshing,
    fetchNotifications,
    handleRefresh,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
};
