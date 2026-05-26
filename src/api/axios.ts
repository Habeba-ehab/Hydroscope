import axios from 'axios';
import Cookies from 'js-cookie';

export const API_BASE_URL = 'https://kenzykhaled55-gram-api.hf.space';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // We remove the hardcoded Content-Type: application/json here
  // so axios can automatically detect FormData and set the correct multipart/form-data boundary.
});

// Interceptor to attach the access token from cookies
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration (401 errors)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 or 403 (Not Authenticated) and we haven't retried yet
    // Skip refresh logic for the login endpoint itself
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/login') &&
      !originalRequest.url?.includes('/register')
    ) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token');

      if (refreshToken) {
        try {
          // Final format: FastAPI expects a query parameter named 'token'
          const response = await axios.post(`${API_BASE_URL}/refresh-token`, null, {
            params: { token: refreshToken },
            withCredentials: true,
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data;

          // Store new tokens
          Cookies.set('access_token', access_token, { expires: 1/48 }); // 30 mins
          Cookies.set('refresh_token', newRefreshToken || refreshToken, { expires: 7 }); // 7 days

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError: any) {
          console.error('[Auth] Refresh token failed:', refreshError.response?.status, refreshError.response?.data);
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          Cookies.remove('user_name');
          sessionStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        Cookies.remove('access_token');
        Cookies.remove('user_name');
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
