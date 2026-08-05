import { getAccessToken, getRefreshToken, getSessionId, saveTokens, clearAuthSession } from '../utils/secureStorage';
// API BASE URL CONFIGURATION WITH AUTOMATIC FALLBACK
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://jobmarket-ongn.onrender.com';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];
let onUnauthenticatedCallback: (() => void) | null = null;

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
    endpoint.includes('/auth/signup') ||
    endpoint.includes('/auth/verify-otp') ||
    endpoint.includes('/auth/refresh') ||
    endpoint.includes('/auth/forgot-password') ||
    endpoint.includes('/auth/reset-password')
  );
};

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !isAuthEndpoint(endpoint)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr: any) {
    throw new Error(netErr.message || 'Network error. Please check your internet connection.');
  }

  // Handle Unauthorized 401 / 418 Token Expiry ONLY for protected non-auth endpoints
  if ((response.status === 401 || response.status === 418) && !isAuthEndpoint(endpoint)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshToken = await getRefreshToken();
        const sessionId = await getSessionId();

        if (!refreshToken || !sessionId) {
          throw new Error('Session expired');
        }

        const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, sessionId }),
        });

        if (!refreshRes.ok) {
          throw new Error('Token refresh failed');
        }

        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData?.data?.accessToken;
        const newRefreshToken = refreshData?.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Invalid token refresh response');
        }

        await saveTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken || refreshToken }, sessionId);
        processQueue(null, newAccessToken);

        // Retry original request with new access token
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        const retryRes = await fetch(url, { ...options, headers });
        const retryText = await retryRes.text();
        return (retryText && retryText.trim() ? JSON.parse(retryText) : {}) as T;
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await clearAuthSession();
        if (onUnauthenticatedCallback) {
          onUnauthenticatedCallback();
        }
        throw new Error('Session expired. Please log in again.');
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
              const res = await fetch(url, { ...options, headers });
              const textRes = await res.text();
              const jsonRes = textRes && textRes.trim() ? JSON.parse(textRes) : {};
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
      throw new Error('Server returned invalid JSON format.');
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
