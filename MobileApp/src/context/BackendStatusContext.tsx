import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../api/client';

export type BackendStatus = 'healthy' | 'warming_up' | 'error';

interface BackendStatusContextType {
  status: BackendStatus;
  errorMessage: string | null;
  isWarmingUp: boolean;
  checkHealth: () => Promise<boolean>;
  setWarmingUp: (warming: boolean) => void;
  setServerError: (msg: string | null) => void;
  setServerHealthy: () => void;
}

const BackendStatusContext = createContext<BackendStatusContextType>({
  status: 'healthy',
  errorMessage: null,
  isWarmingUp: false,
  checkHealth: async () => true,
  setWarmingUp: () => {},
  setServerError: () => {},
  setServerHealthy: () => {},
});

// Singleton global listener for client.ts to communicate with Context without circular dependencies
let globalSetWarmingUp: ((val: boolean) => void) | null = null;
let globalSetServerError: ((msg: string | null) => void) | null = null;
let globalSetServerHealthy: (() => void) | null = null;

export const reportBackendWarmingUp = (warming: boolean = true) => {
  if (globalSetWarmingUp) {
    globalSetWarmingUp(warming);
  }
};

export const reportBackendError = (msg: string | null) => {
  if (globalSetServerError) {
    globalSetServerError(msg);
  }
};

export const reportBackendHealthy = () => {
  if (globalSetServerHealthy) {
    globalSetServerHealthy();
  }
};

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<BackendStatus>('healthy');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wasWarmingUpRef = useRef(false);
  const healthCheckIntervalRef = useRef<any>(null);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${baseUrl}/api/v1/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setStatus('healthy');
        setErrorMessage(null);
        return true;
      } else {
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          setStatus('warming_up');
        } else {
          setStatus('error');
          setErrorMessage(`Server status error (${res.status})`);
        }
        return false;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('warming_up');
      } else {
        setStatus('warming_up');
      }
      return false;
    }
  }, []);

  const setWarmingUp = useCallback((warming: boolean) => {
    if (warming) {
      wasWarmingUpRef.current = true;
      setStatus('warming_up');
      setErrorMessage(null);
    } else {
      setStatus('healthy');
      setErrorMessage(null);
    }
  }, []);

  const setServerError = useCallback((msg: string | null) => {
    if (msg) {
      setStatus('error');
      setErrorMessage(msg);
    } else {
      setStatus('healthy');
      setErrorMessage(null);
    }
  }, []);

  const setServerHealthy = useCallback(() => {
    setStatus('healthy');
    setErrorMessage(null);
  }, []);

  // Register global singletons
  useEffect(() => {
    globalSetWarmingUp = setWarmingUp;
    globalSetServerError = setServerError;
    globalSetServerHealthy = setServerHealthy;

    return () => {
      globalSetWarmingUp = null;
      globalSetServerError = null;
      globalSetServerHealthy = null;
    };
  }, [setWarmingUp, setServerError, setServerHealthy]);

  // Periodic polling when server is warming up until back online
  useEffect(() => {
    if (status === 'warming_up') {
      healthCheckIntervalRef.current = setInterval(async () => {
        const isUp = await checkHealth();
        if (isUp) {
          if (healthCheckIntervalRef.current) {
            clearInterval(healthCheckIntervalRef.current);
          }
        }
      }, 4000);
    } else {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    }

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [status, checkHealth]);

  return (
    <BackendStatusContext.Provider
      value={{
        status,
        errorMessage,
        isWarmingUp: status === 'warming_up',
        checkHealth,
        setWarmingUp,
        setServerError,
        setServerHealthy,
      }}
    >
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = () => useContext(BackendStatusContext);
