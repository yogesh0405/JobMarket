interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  };
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = (options.headers as Record<string, string>) || {};
  const token = localStorage.getItem('accessToken');

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
    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');

    if (refreshToken && sessionId) {
      try {
        const refreshResponse = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, sessionId }),
        });

        if (refreshResponse.ok) {
          const refreshData: RefreshResponse = await refreshResponse.json();
          const { accessToken: newAccessToken, refreshToken: newRefreshToken, sessionId: newSessionId } = refreshData.data;

          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          localStorage.setItem('sessionId', newSessionId);

          // Retry the original request with the new access token
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          options.headers = headers;
          
          response = await fetch(url, options);
        } else {
          // Refresh token is also expired or invalid - clear session
          clearSession();
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
