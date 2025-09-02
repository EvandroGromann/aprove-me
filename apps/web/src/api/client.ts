const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LoginResponse {
  access_token: string;
  expires_in?: number;
}

export async function apiLogin(login: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/integrations/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Falha no login');
  }
  
  const data = (await res.json()) as LoginResponse;
  
  if (data.expires_in) {
    const expiresAt = Date.now() + (data.expires_in * 1000);
    localStorage.setItem('token_expires_at', expiresAt.toString());
    setupAutoLogout(data.expires_in);
  }
  
  return data.access_token;
}

export interface Assignor {
  id: string;
  document: string;
  email: string;
  phone: string;
  name: string;
}

export interface CreatePayableRequest {
  id: string;
  value: number;
  emissionDate: string;
  assignor: Assignor;
}

export interface PayableResponse {
  id: string;
  value: number;
  emissionDate: string;
  assignor: {
    id: string;
    document: string;
    email: string;
    phone: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

function getAuthHeader(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const expiresAtStr = localStorage.getItem('token_expires_at');
  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() >= expiresAt) {
      logout();
      return null;
    }
  }
  
  return `Bearer ${token}`;
}

let autoLogoutTimer: number | null = null;

function setupAutoLogout(expiresInSeconds: number) {
  if (autoLogoutTimer !== null) {
    window.clearTimeout(autoLogoutTimer);
  }
  
  const timeoutMs = Math.max((expiresInSeconds - 3) * 1000, 0);
  
  autoLogoutTimer = window.setTimeout(() => {
    logout('session-expired');
  }, timeoutMs);
}

export function isTokenExpiringSoon(withinSeconds = 5): boolean {
  const expiresAtStr = localStorage.getItem('token_expires_at');
  if (!expiresAtStr) return false;
  
  const expiresAt = parseInt(expiresAtStr, 10);
  const now = Date.now();
  
  return expiresAt - now < withinSeconds * 1000;
}

export function logout(reason?: 'session-expired') {
  if (autoLogoutTimer !== null) {
    window.clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }
  
  localStorage.removeItem('token');
  localStorage.removeItem('token_expires_at');
  
  if (reason) {
    redirectToLoginIfNeeded(reason);
  }
}

function redirectToLoginIfNeeded(reason: 'session-expired') {
  if (typeof window === 'undefined') return;
  const { pathname } = window.location;
  if (pathname.startsWith('/login')) return;
  const url = new URL('/login', window.location.origin);
  url.searchParams.set('reason', reason);
  url.searchParams.set('redirect', pathname + window.location.search);
  window.location.href = url.toString();
}

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const expiresAtStr = localStorage.getItem('token_expires_at');
  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() >= expiresAt) {
      logout('session-expired');
      throw new Error('Sua sessão expirou. Redirecionando para login...');
    }
  }
  
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>), Accept: 'application/json' };
  if (!headers['Authorization']) {
    const auth = getAuthHeader();
    if (auth) headers['Authorization'] = auth;
  }
  
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401) {
    logout('session-expired');
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    try {
      if (contentType.includes('application/json')) {
        const data = await res.json();
        const msg = data?.message || data?.error || 'Algo deu errado';
        throw new Error(typeof msg === 'string' ? msg : 'Falha na requisição');
      }
      const text = await res.text();
      throw new Error(text || 'Falha na requisição');
    } catch (e: any) {
      throw e instanceof Error ? e : new Error('Falha na requisição');
    }
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export async function createPayable(payload: CreatePayableRequest): Promise<PayableResponse> {
  try {
    return await request<PayableResponse>(`/integrations/payable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to create payable:', error);
    throw error;
  }
}

export async function getPayable(id: string): Promise<PayableResponse> {
  return await request<PayableResponse>(`/integrations/payable/${id}`);
}
