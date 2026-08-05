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

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (!hasUser) return;
    
    // Only show the loading state spinner on the very first initial load if we don't have notifications yet
    if (showLoading && !hasFetchedRef.current) {
      setLoading(true);
    }
    
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && res.data && isMounted.current) {
        setNotifications(res.data);
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
    hasFetchedRef.current = false; // Reset when user logging state changes

    if (hasUser) {
      fetchNotifications(true);

      // Live polling interval every 30 seconds for background updates (avoid continuous updates and server rate limits)
      const intervalId = setInterval(() => {
        fetchNotifications(false);
      }, 30000);

      return () => {
        isMounted.current = false;
        clearInterval(intervalId);
      };
    }
  }, [hasUser, fetchNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(false);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
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
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, is_read: true }))
    );
    try {
      await notificationApi.markAllAsRead();
    } catch (e) {
      // Ignore
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationApi.deleteNotification(id);
    } catch (e) {
      // Ignore
    }
  }, []);

  const clearAll = useCallback(async () => {
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

  return {
    notifications,
    unreadCount,
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
