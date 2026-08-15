import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi, AppNotification } from '../api/notificationApi';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  const userId = user?.id || '';
  const hasUser = !!user;
  const hasFetchedRef = useRef(false);

  // Persistence refs to prevent backend refresh from overriding local clear / read actions
  const isClearedAllRef = useRef(false);
  const allMarkedReadRef = useRef(false);
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const readIdsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (!hasUser) return;
    
    // Only show loading spinner on initial load
    if (showLoading && !hasFetchedRef.current) {
      setLoading(true);
    }
    
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && isMounted.current) {
        if (isClearedAllRef.current) {
          setNotifications([]);
          hasFetchedRef.current = true;
          return;
        }

        let rawList: AppNotification[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res as any)?.notifications)
          ? (res as any).notifications
          : Array.isArray((res as any)?.data?.notifications)
          ? (res as any).data.notifications
          : [];

        // Apply local mutations (deleted IDs, read IDs, all marked read)
        rawList = rawList
          .filter((n) => !deletedIdsRef.current.has(n.id))
          .map((n) => {
            if (allMarkedReadRef.current || readIdsRef.current.has(n.id)) {
              return { ...n, read: true, is_read: true };
            }
            return n;
          });

        setNotifications(rawList);
        hasFetchedRef.current = true;
      }
    } catch (e) {
      console.log('Failed to fetch real-time notifications:', e);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [hasUser]);

  useEffect(() => {
    isMounted.current = true;
    hasFetchedRef.current = false;
    isClearedAllRef.current = false;
    allMarkedReadRef.current = false;
    deletedIdsRef.current.clear();
    readIdsRef.current.clear();

    if (hasUser) {
      fetchNotifications(true);

      // Live polling interval every 30 seconds
      const intervalId = setInterval(() => {
        fetchNotifications(false);
      }, 30000);

      return () => {
        isMounted.current = false;
        clearInterval(intervalId);
      };
    }
  }, [hasUser, userId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(false);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    readIdsRef.current.add(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n))
    );
    try {
      await notificationApi.markAsRead(id);
    } catch (e) {
      // Ignore
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    allMarkedReadRef.current = true;
    setNotifications((prev) =>
      prev.map((n) => {
        readIdsRef.current.add(n.id);
        return { ...n, read: true, is_read: true };
      })
    );
    try {
      await notificationApi.markAllAsRead();
    } catch (e) {
      // Ignore
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    deletedIdsRef.current.add(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationApi.deleteNotification(id);
    } catch (e) {
      // Ignore
    }
  }, []);

  const clearAll = useCallback(async () => {
    isClearedAllRef.current = true;
    setNotifications([]);
    try {
      await notificationApi.clearAll();
    } catch (e) {
      // Ignore
    }
  }, []);

  const unreadCount = notifications.filter(
    (n) => !(n.read || n.is_read)
  ).length;

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
