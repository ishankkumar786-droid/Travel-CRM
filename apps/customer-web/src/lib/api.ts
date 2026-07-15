const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getPublicAgencies(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchApi<PaginatedResponse<Record<string, unknown>>>(`/public/agencies${qs}`);
}

export async function getAgencyProfile(slug: string) {
  return fetchApi<ApiResponse<Record<string, unknown>>>(`/public/agencies/${slug}/profile`);
}

export async function getPublicPackages(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchApi<PaginatedResponse<Record<string, unknown>>>(`/public/packages${qs}`);
}

export async function getPublicPackage(slugOrId: string) {
  return fetchApi<ApiResponse<Record<string, unknown>>>(`/public/packages/${slugOrId}`);
}

export async function getAgencyReviews(slug: string) {
  return fetchApi<ApiResponse<Record<string, unknown>[]>>(`/public/agencies/${slug}/reviews`);
}

export async function verifyReviewToken(token: string) {
  return fetchApi<ApiResponse<Record<string, unknown>>>(`/public/reviews/verify/${token}`);
}

export async function submitReview(token: string, data: { rating: number; content: string }) {
  const res = await fetch(`${API_BASE}/public/reviews/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to submit review');
  }
  return res.json() as Promise<ApiResponse<Record<string, unknown>>>;
}

export async function getPublicDestinations(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchApi<ApiResponse<Record<string, unknown>[]>>(`/public/destinations${qs}`);
}

export async function getRecommendations() {
  return fetchApi<ApiResponse<Record<string, unknown>>>('/public/recommendations');
}
