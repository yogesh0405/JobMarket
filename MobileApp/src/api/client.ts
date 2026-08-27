import { Platform } from 'react-native';
import {
  getAccessToken,
  getRefreshToken,
  getSessionId,
  getStoredUser,
  saveTokens,
  clearAuthSession,
} from '../utils/secureStorage';

// CANONICAL BACKEND API URL (defaults to live Render backend: https://jobmarket-ongn.onrender.com)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://jobmarket-ongn.onrender.com';

const MOBILE_USER_AGENT = `JobMarketApp/1.0 (${Platform.OS === 'android' ? 'Android Mobile' : Platform.OS === 'ios' ? 'iOS Mobile' : 'Mobile App'})`;

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];
let onUnauthenticatedCallback: (() => void) | null = null;

export function isValidId(id: any): boolean {
  if (id === null || id === undefined) return false;
  const str = String(id).trim();
  if (!str || str === 'undefined' || str === 'null' || str === 'NaN') return false;
  return true;
}

export const setOnUnauthenticated = (callback: () => void) => {
  onUnauthenticatedCallback = callback;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const isAuthEndpoint = (endpoint: string): boolean => {
  return (
    endpoint.includes('/auth/login') ||
    endpoint.includes('/auth/google') ||
    endpoint.includes('/auth/signup') ||
    endpoint.includes('/auth/verify-otp') ||
    endpoint.includes('/auth/refresh') ||
    endpoint.includes('/auth/forgot-password') ||
    endpoint.includes('/auth/reset-password')
  );
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (netErr: any) {
    // Fast retry after 800ms for transient network restarts or Render wakeups
    try {
      await new Promise((res) => setTimeout(res, 800));
      return await fetch(url, options);
    } catch (retryErr: any) {
      throw new Error(retryErr?.message || 'Network error: Unable to connect to backend server.');
    }
  }
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (endpoint.includes('/undefined') || endpoint.includes('/null') || endpoint.includes('/NaN')) {
    throw new Error('Invalid resource identifier in request URL.');
  }
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  const token = await getAccessToken();
  const sessionId = await getSessionId();
  const storedUser = await getStoredUser();

  let dynamicDeviceName = 'Android Mobile';
  if (Platform.OS === 'android') {
    const constants = Platform.constants as any;
    const brand = (constants?.Brand || constants?.Manufacturer || 'Android').toUpperCase();
    const model = constants?.Model || 'Phone';
    dynamicDeviceName = `${brand} ${model}`;
  } else if (Platform.OS === 'ios') {
    dynamicDeviceName = 'iPhone';
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'User-Agent': MOBILE_USER_AGENT,
    'x-device-type': Platform.OS === 'ios' ? 'iOS' : 'Android',
    'x-device-name': dynamicDeviceName,
    'x-client-platform': 'mobile-app',
    ...(options.headers as Record<string, string>),
  };

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  if (storedUser?.id) {
    headers['x-user-id'] = storedUser.id;
  }

  if (isFormData && (options.headers as Record<string, string>)?.[ 'Content-Type' ] === undefined) {
    delete headers['Content-Type'];
  }

  if (token && !isAuthEndpoint(endpoint)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(url, { ...options, headers });
  } catch (netErr: any) {
    throw new Error(netErr.message || 'Network error. Please check your internet connection.');
  }

  // Handle Unauthorized 401 / 418 Token Expiry ONLY for protected non-auth endpoints
  if ((response.status === 401 || response.status === 418) && !isAuthEndpoint(endpoint)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshToken = (await getRefreshToken()) || (await getAccessToken());
        const sessionId = await getSessionId();

        if (!refreshToken) {
          throw new Error('Session expired');
        }

        const refreshRes = await fetchWithTimeout(`${baseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, ...(sessionId ? { sessionId } : {}) }),
        });

        if (!refreshRes.ok) {
          const isExplicitUnauthorized = refreshRes.status === 401 || refreshRes.status === 403;
          const err: any = new Error('Token refresh failed');
          err.isExplicitUnauthorized = isExplicitUnauthorized;
          throw err;
        }

        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData?.data?.accessToken || refreshData?.tokens?.accessToken || refreshData?.accessToken;
        const newRefreshToken = refreshData?.data?.refreshToken || refreshData?.tokens?.refreshToken || refreshData?.refreshToken;
        const newSessionId = refreshData?.data?.sessionId || refreshData?.sessionId || sessionId;

        if (!newAccessToken) {
          throw new Error('Invalid token refresh response');
        }

        await saveTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken || refreshToken }, newSessionId);
        processQueue(null, newAccessToken);

        // Retry original request with new access token
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        const retryRes = await fetchWithTimeout(url, { ...options, headers });
        const retryText = await retryRes.text();
        let retryJson: any = {};
        if (retryText && retryText.trim()) {
          try {
            retryJson = JSON.parse(retryText);
          } catch (e) {
            if (!retryRes.ok) {
              throw new Error(`Server status ${retryRes.status}: Temporary server error.`);
            }
            throw new Error('Server returned non-JSON response.');
          }
        }
        if (!retryRes.ok) {
          const errorMsg =
            retryJson?.error ||
            retryJson?.message ||
            (Array.isArray(retryJson?.errors) && typeof retryJson.errors[0] === 'object' ? retryJson.errors[0].message : retryJson?.errors?.[0]) ||
            `Request failed with status ${retryRes.status}`;
          throw new Error(errorMsg);
        }
        return retryJson as T;
      } catch (refreshErr: any) {
        processQueue(refreshErr, null);
        if (refreshErr?.isExplicitUnauthorized) {
          await clearAuthSession();
          if (onUnauthenticatedCallback) {
            onUnauthenticatedCallback();
          }
        }
        throw new Error(refreshErr?.message || 'Session expired. Please log in again.');
      } finally {
        isRefreshing = false;
      }
    } else {
      // Queue request until token refresh completes
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async (newToken: string) => {
            headers['Authorization'] = `Bearer ${newToken}`;
            try {
              const res = await fetchWithTimeout(url, { ...options, headers });
              const textRes = await res.text();
              let jsonRes: any = {};
              if (textRes && textRes.trim()) {
                try {
                  jsonRes = JSON.parse(textRes);
                } catch (e) {
                  if (!res.ok) {
                    reject(new Error(`Server status ${res.status}: Temporary server error.`));
                    return;
                  }
                }
              }
              if (!res.ok) {
                const errorMsg = jsonRes?.error || jsonRes?.message || `Request failed with status ${res.status}`;
                reject(new Error(errorMsg));
                return;
              }
              resolve(jsonRes);
            } catch (err) {
              reject(err);
            }
          },
          reject: (err) => reject(err),
        });
      });
    }
  }

  // Parse JSON Safely with empty-text guard
  let json: any = {};
  const text = await response.text();
  if (text && text.trim()) {
    try {
      json = JSON.parse(text);
    } catch (e) {
      if (!response.ok) {
        throw new Error(`Server status ${response.status}: Render backend warming up or temporary error.`);
      }
      throw new Error('Server returned non-JSON response.');
    }
  }

  if (!response.ok) {
    const errorMsg =
      json?.error ||
      json?.message ||
      (Array.isArray(json?.errors) && typeof json.errors[0] === 'object' ? json.errors[0].message : json?.errors?.[0]) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return json as T;
}
