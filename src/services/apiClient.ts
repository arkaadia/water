// Use relative /api/v1 in browser so it seamlessly works on any host, port, VPS, or cloud proxy
export const API_URL = (typeof window !== 'undefined' ? '' : 'http://localhost:3000') + '/api/v1';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `خطا در ارتباط با سرور (کد ${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
