import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'agency_access_token';

/** Retrieve stored access token */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
}

/** Store access token (short-lived, lax samesite for dev) */
export function setAccessToken(token: string, expiresInSeconds: number): void {
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires: expiresInSeconds / 86400, // js-cookie uses days
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

/** Remove access token */
export function clearAccessToken(): void {
  Cookies.remove(ACCESS_TOKEN_KEY);
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
}

/**
 * Main API client — attaches Bearer token to every request.
 * Automatically refreshes the access token when a 401 is received.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send httpOnly refresh cookie
  timeout: 30_000,
});

// ─── Request interceptor — attach access token ────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — auto-refresh on 401 ──────────────────────────────
export const marketplaceService = {
  getProfile: () => apiClient.get('/marketplace/profile').then((res) => res.data),
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put('/marketplace/profile', data).then((res) => res.data),
  publishProfile: () => apiClient.post('/marketplace/profile/publish').then((res) => res.data),
};

export const reviewService = {
  getReviews: () => apiClient.get('/reviews').then((res) => res.data),
  requestReview: (data: { travelerName: string; travelerEmail: string; packageId?: string }) =>
    apiClient.post('/reviews/request', data).then((res) => res.data),
};

export const notificationService = {
  getNotifications: (page = 1, limit = 20) =>
    apiClient.get(`/notifications?page=${page}&limit=${limit}`).then((res) => res.data),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: () => apiClient.post('/notifications/read-all').then((res) => res.data),
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{
          success: boolean;
          data: { accessToken: string; expiresIn: number };
        }>(
          `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken, expiresIn } = data.data;
        setAccessToken(accessToken, expiresIn);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalise error shape
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
    const code =
      (error.response?.data as { error?: { code?: string } } | undefined)?.error?.code ??
      'UNKNOWN_ERROR';
    const enriched = new Error(message) as Error & { status: number; code: string };
    enriched.status = error.response?.status ?? 0;
    enriched.code = code;
    return Promise.reject(enriched);
  },
);
