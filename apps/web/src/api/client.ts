const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export function getToken(): string | null {
  return localStorage.getItem('asgrid_token');
}

export function setToken(token: string) {
  localStorage.setItem('asgrid_token', token);
}

export function clearToken() {
  localStorage.removeItem('asgrid_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.reload(); // простой редирект на логин
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || error?.error?.message || 'API Error');
  }

  return res.json();
}