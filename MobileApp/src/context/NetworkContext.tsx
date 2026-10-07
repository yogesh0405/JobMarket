import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { API_BASE_URL } from '../api/config';

interface NetworkContextType {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isOffline: boolean;
  isChecking: boolean;
  retryConnection: () => Promise<boolean>;
  setOfflineStatus: (offline: boolean) => void;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: true,
  isOffline: false,
  isChecking: false,
  retryConnection: async () => true,
  setOfflineStatus: () => {},
});

// Global singleton state so non-React services (like ToastContext and client.ts) can read/notify immediately
let globalIsOffline = false;
let globalSetOffline: ((offline: boolean) => void) | null = null;
let globalRetryConnection: (() => Promise<boolean>) | null = null;

export const isAppOffline = (): boolean => globalIsOffline;

export const reportNetworkOffline = () => {
  globalIsOffline = true;
  if (globalSetOffline) {
    globalSetOffline(true);
  }
};

export const reportNetworkOnline = () => {
  globalIsOffline = false;
  if (globalSetOffline) {
    globalSetOffline(false);
  }
};

export const triggerGlobalNetworkRetry = async (): Promise<boolean> => {
  if (globalRetryConnection) {
    return await globalRetryConnection();
  }
  return true;
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Keep ref to avoid stale state in callbacks
  const isOfflineRef = useRef(isOffline);
  isOfflineRef.current = isOffline;

  const updateOfflineState = useCallback((offline: boolean) => {
    globalIsOffline = offline;
    setIsOffline(offline);
  }, []);

  // Standard lightweight reachability ping
  const pingReachability = useCallback(async (): Promise<boolean> => {
    try {
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${baseUrl}/api/v1/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok || res.status < 500;
    } catch (_) {
      // Fallback check against a reliable global endpoint if backend is asleep
      try {
        const fallbackController = new AbortController();
        const fallbackTimer = setTimeout(() => fallbackController.abort(), 3000);
        const fallbackRes = await fetch('https://clients3.google.com/generate_204', {
          method: 'GET',
          signal: fallbackController.signal,
        });
        clearTimeout(fallbackTimer);
        return fallbackRes.ok || fallbackRes.status === 204;
      } catch (__) {
        return false;
      }
    }
  }, []);

  // Full connection check and retry method
  const retryConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      // 1. Ask NetInfo to fetch current state
      const state: NetInfoState = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);

      // If interface is disconnected, we are definitely offline
      if (state.isConnected === false) {
        updateOfflineState(true);
        return false;
      }

      // If NetInfo explicitly says internet is unreachable, verify with ping
      if (state.isInternetReachable === false) {
        const reachable = await pingReachability();
        updateOfflineState(!reachable);
        return reachable;
      }

      // If connected, verify with ping
      const reachable = await pingReachability();
      updateOfflineState(!reachable);
      return reachable;
    } catch (_) {
      // If NetInfo fetch threw, do ping test
      const reachable = await pingReachability();
      updateOfflineState(!reachable);
      return reachable;
    } finally {
      setIsChecking(false);
    }
  }, [pingReachability, updateOfflineState]);

  // Register global singletons
  useEffect(() => {
    globalSetOffline = updateOfflineState;
    globalRetryConnection = retryConnection;

    return () => {
      globalSetOffline = null;
      globalRetryConnection = null;
    };
  }, [updateOfflineState, retryConnection]);

  // Standard Event Listener: automatically updates and clears offline screen as soon as internet is restored
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        setIsConnected(state.isConnected);
        setIsInternetReachable(state.isInternetReachable);

        if (state.isConnected === false) {
          // Device has lost all network connections (No WiFi, No Cellular)
          updateOfflineState(true);
        } else if (state.isConnected === true && state.isInternetReachable === false) {
          // Connected to WiFi/Cellular but no actual internet access
          updateOfflineState(true);
        } else if (state.isConnected === true && (state.isInternetReachable === true || state.isInternetReachable === null)) {
          // Internet connection is restored! Screen will be gone automatically.
          updateOfflineState(false);
        }
      });
    } catch (e) {
      // Fallback if NetInfo native module fails in some environments
      console.warn('NetInfo addEventListener error:', e);
    }

    // Initial check on mount
    NetInfo.fetch()
      .then((state) => {
        setIsConnected(state.isConnected);
        setIsInternetReachable(state.isInternetReachable);
        if (state.isConnected === false) {
          updateOfflineState(true);
        }
      })
      .catch(() => {});

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [updateOfflineState]);

  // Re-verify network when app returns from background to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        NetInfo.fetch().then((state) => {
          setIsConnected(state.isConnected);
          setIsInternetReachable(state.isInternetReachable);
          const isNetworkOff = state.isConnected === false || state.isInternetReachable === false;
          if (isNetworkOff) {
            updateOfflineState(true);
          } else if (state.isConnected === true) {
            updateOfflineState(false);
          }
        }).catch(() => {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, [updateOfflineState]);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        isOffline,
        isChecking,
        retryConnection,
        setOfflineStatus: updateOfflineState,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
