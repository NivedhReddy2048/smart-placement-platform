import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    console.log("REQUEST TOKEN:", token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor for Token Refresh System and Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auto Token Refresh Check (HTTP 401 Unauthorized)
    if (error.response?.status === 401) {
      console.log("401 ERROR FROM:", error.config?.url);

      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');

        // DEV MODE: ignore fake token
        if (token === "test_token_123") {
          console.warn("DEV MODE: Ignoring 401 for test token");
          return Promise.reject(error);
        }
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
          if (refreshToken) {
            // Hit our TokenRefreshView /api/auth/login/refresh/
            const res = await axios.post(`${apiClient.defaults.baseURL}/auth/login/refresh/`, {
              refresh: refreshToken
            });

            if (res.status === 200) {
              if (typeof window !== 'undefined') localStorage.setItem('access_token', res.data.access);
              if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
              return apiClient(originalRequest);
            }
          } else {
            // REAL TOKEN FAILURE
            if (typeof window !== 'undefined') localStorage.removeItem('access_token');
          }
        } catch (_refreshError) {
          // Absolute auth failure: Expired refresh token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        }
      } else {
        // Already retried, still 401
        if (typeof window !== 'undefined') localStorage.removeItem('access_token');
      }
    }

    // Global Error Monitor
    if (error.response?.status >= 500) {
      console.error('[System Fault] The backend is returning 500+ Codes.', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
