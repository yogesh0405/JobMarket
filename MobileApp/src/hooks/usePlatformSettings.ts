import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../api/client';

const SETTINGS_CACHE_KEY = 'cache:platform_settings_v1';

export interface PlatformSettings {
  platform_name?: string;
  logo?: string;
  logo_url?: string;
  support_email?: string;
  contact_number?: string;
  maintenance_mode?: string;
  job_approval_toggle?: string;
  banner_publish_toggle?: string;
}

let memoryCachedSettings: PlatformSettings | null = null;
const listeners = new Set<(s: PlatformSettings) => void>();

export function triggerMaintenanceMode(info?: { support_email?: string; contact_number?: string }) {
  const updated: PlatformSettings = {
    ...(memoryCachedSettings || {}),
    maintenance_mode: 'true',
    ...(info || {}),
  };
  memoryCachedSettings = updated;
  listeners.forEach((fn) => fn(updated));
}

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(
    memoryCachedSettings || {
      platform_name: 'JobMarket',
      logo: 'JM',
      logo_url: '',
      support_email: 'support@csnjobmarket.com',
      contact_number: '+91 240 2554000',
    }
  );
  const [loading, setLoading] = useState(false);

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      // Try /api/v1/settings first, fallback to /api/v1/public/settings
      let res = await apiFetch<any>('/api/v1/settings').catch(() => null);
      if (!res || !res.success) {
        res = await apiFetch<any>('/api/v1/public/settings').catch(() => null);
      }
      if (res && res.success && res.data) {
        const fetched = res.data as PlatformSettings;
        memoryCachedSettings = fetched;
        setSettings(fetched);
        await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(fetched)).catch(() => {});
        listeners.forEach((fn) => fn(fetched));
      }
    } catch {
      // Keep existing settings if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const onUpdate = (s: PlatformSettings) => {
      if (isMounted) setSettings(s);
    };
    listeners.add(onUpdate);

    // 1. Hydrate from AsyncStorage cache
    if (!memoryCachedSettings) {
      AsyncStorage.getItem(SETTINGS_CACHE_KEY)
        .then((cached) => {
          if (cached && isMounted) {
            const parsed = JSON.parse(cached);
            memoryCachedSettings = parsed;
            setSettings(parsed);
          }
        })
        .catch(() => {});
    }

    // 2. Fetch fresh settings from server on mount
    refreshSettings();

    // 3. Live polling every 5s while app is in foreground
    const pollInterval = setInterval(() => {
      if (AppState.currentState === 'active') {
        refreshSettings();
      }
    }, 5000);

    // 4. Foreground app state listener
    const appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        refreshSettings();
      }
    });

    return () => {
      isMounted = false;
      listeners.delete(onUpdate);
      clearInterval(pollInterval);
      appStateSubscription.remove();
    };
  }, [refreshSettings]);

  return {
    settings,
    logoUrl: settings.logo_url || '',
    platformName: settings.platform_name || 'JobMarket',
    supportEmail: settings.support_email || 'support@csnjobmarket.com',
    contactNumber: settings.contact_number || '+91 240 2554000',
    loading,
    refreshSettings,
  };
}
