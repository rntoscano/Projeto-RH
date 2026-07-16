import axios, { AxiosHeaders } from 'axios';
import type { UsuarioAutenticado } from '../models/Usuario';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://projeto-rh-sqib.onrender.com/';

const AUTH_STORAGE_KEY = 'projeto-rh:usuario';
const PUBLIC_ENDPOINTS = ['/usuarios/logar', '/usuarios/cadastrar'];

function isPublicEndpoint(url?: string): boolean {
  if (!url) {
    return false;
  }

  return PUBLIC_ENDPOINTS.some((endpoint) => url.endsWith(endpoint));
}

function normalizeAuthorizationHeader(token: string): string {
  return token.trim().toLowerCase().startsWith('bearer ') ? token.trim() : `Bearer ${token.trim()}`;
}

function getStoredUser(): UsuarioAutenticado | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as UsuarioAutenticado;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredUser()?.token;

  if (token && !isPublicEndpoint(config.url)) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', normalizeAuthorizationHeader(token));
    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    if ((status === 401 || status === 403) && getStoredUser()?.token) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event('auth:expired'));
    }

    return Promise.reject(error);
  },
);

export { AUTH_STORAGE_KEY };
