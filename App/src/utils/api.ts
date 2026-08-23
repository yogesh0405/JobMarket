interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  };
}

let activeRefreshPromise: Promise<string | null> | null = null;

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://jobmarket-ongn.onrender.com';
  }
  return '';
};

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = (options.headers as Record<string, string>) || {};
  let token = localStorage.getItem('accessToken');

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  // Include user ID from stored session state if available for fallback authentication
  const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser') || localStorage.getItem('jobMarketplace_react');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const userId = parsed?.id || parsed?.currentUser?.id;
      if (userId) {
        headers['x-user-id'] = userId;
      }
    } catch (_) {}
  }

  // Set content-type to application/json by default unless it's FormData (for file uploads)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  options.headers = headers;

  const baseUrl = getApiBaseUrl();
  const targetUrl = url.startsWith('/') && baseUrl ? `${baseUrl}${url}` : url;
  
  let response: Response;
  try {
    response = await fetch(targetUrl, options);
  } catch (netErr: any) {
    // Retry once after 1.5s for transient deployment restarts
    try {
      await new Promise((res) => setTimeout(res, 1500));
      response = await fetch(targetUrl, options);
    } catch (retryErr: any) {
      console.error(`API fetch network error [${options.method || 'GET'} ${targetUrl}]:`, retryErr);
      throw new Error('Network error: Unable to connect to backend server. Please check network connection.');
    }
  }

  // If token is invalid or expired (401 Unauthorized), try to refresh it
  if (response.status === 401) {
    if (url.includes('/api/v1/auth/refresh')) {
      return response;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');

    if (refreshToken && sessionId) {
      try {
        let newAccessToken: string | null = null;

        if (!activeRefreshPromise) {
          activeRefreshPromise = (async () => {
            try {
              const refreshUrl = `${baseUrl}/api/v1/auth/refresh`;
              const refreshResponse = await fetch(refreshUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken, sessionId }),
              });

              if (refreshResponse.ok) {
                const refreshData: RefreshResponse = await refreshResponse.json();
                const { accessToken, refreshToken: newRefreshToken, sessionId: newSessionId } = refreshData.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                localStorage.setItem('sessionId', newSessionId);

                return accessToken;
              } else {
                clearSession();
                return null;
              }
            } catch (err) {
              clearSession();
              return null;
            } finally {
              activeRefreshPromise = null;
            }
          })();
        }

        newAccessToken = await activeRefreshPromise;

        if (newAccessToken) {
          // Retry the original request with the new access token
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          options.headers = headers;
          
          response = await fetch(targetUrl, options);
        }
      } catch (err) {
        // Network error during refresh - keep session intact
        console.warn('Network error during silent refresh:', err);
      }
    }
  }

  return response;
}

function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sessionId');
  // Dispatch a custom logout event so hooks/store can capture it and redirect
  window.dispatchEvent(new Event('auth:logout'));
}

export async function safeParseJson<T = any>(res: Response): Promise<{ ok: boolean; status: number; data: T }> {
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { message: text };
    }
  }
  return {
    ok: res.ok,
    status: res.status,
    data
  };
}

