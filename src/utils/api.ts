interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  };
}

let activeRefreshPromise: Promise<string | null> | null = null;

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = (options.headers as Record<string, string>) || {};
  let token = localStorage.getItem('accessToken');

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Set content-type to application/json by default unless it's FormData (for file uploads)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  options.headers = headers;

  let response = await fetch(url, options);

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
              const refreshResponse = await fetch('/api/v1/auth/refresh', {
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
          
          response = await fetch(url, options);
        }
      } catch (err) {
        clearSession();
      }
    } else {
      clearSession();
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
