import type { Usuario, UsuarioAtualizacao } from '../models/Usuario';
import { isNotFoundError, isServerError } from '../utils/apiError';
import { onlyDigits } from '../utils/formatters';
import { getCachedList, mergeCachedList, removeCachedItem, replaceCachedList, upsertCachedItem } from '../utils/localCache';
import { getPhotoForApi } from '../utils/photoUpload';
import { api } from './api';

const USUARIOS_CACHE_KEY = 'projeto-rh:cache:usuarios';
const AUTH_STORAGE_KEY = 'projeto-rh:usuario';

function toUsuarioList(data: Usuario | Usuario[]): Usuario[] {
  return Array.isArray(data) ? data : [data];
}

function findCachedUsuario(usuario: Usuario): Usuario | undefined {
  return getCachedList<Usuario>(USUARIOS_CACHE_KEY).find((cachedUsuario) => {
    if (usuario.id && cachedUsuario.id === usuario.id) {
      return true;
    }

    if (usuario.usuario && cachedUsuario.usuario === usuario.usuario) {
      return true;
    }

    return Boolean(usuario.cpf && cachedUsuario.cpf === usuario.cpf);
  });
}

function withCachedPhoto(usuario: Usuario): Usuario {
  if (usuario.foto) {
    return usuario;
  }

  const cachedUsuario = findCachedUsuario(usuario);
  return cachedUsuario?.foto ? { ...usuario, foto: cachedUsuario.foto } : usuario;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  try {
    const response = await api.get<Usuario[]>('/usuarios');
    return replaceCachedList(USUARIOS_CACHE_KEY, response.data.map(withCachedPhoto), ['usuario', 'cpf']);
  } catch (error) {
    if (!isServerError(error)) {
      throw error;
    }

    const cached = getCachedList<Usuario>(USUARIOS_CACHE_KEY);
    const storedUser = getStoredAuthenticatedUser();

    if (cached.length || !storedUser) {
      return cached;
    }

    return [storedUser];
  }
}

export async function buscarUsuarioPorId(id: number): Promise<Usuario> {
  const response = await api.get<Usuario>(`/usuarios/${id}`);
  const usuario = withCachedPhoto(response.data);
  upsertCachedItem(USUARIOS_CACHE_KEY, usuario, ['usuario', 'cpf']);
  return usuario;
}

export async function buscarUsuarioPorEmail(usuario: string): Promise<Usuario[]> {
  const response = await api.get<Usuario | Usuario[]>(`/usuarios/usuario/${encodeURIComponent(usuario)}`);
  const data = toUsuarioList(response.data).map(withCachedPhoto);
  mergeCachedList(USUARIOS_CACHE_KEY, data, ['usuario', 'cpf']);
  return data;
}

export async function buscarUsuarioPorCpf(cpf: string): Promise<Usuario[]> {
  const response = await api.get<Usuario | Usuario[]>(`/usuarios/cpf/${encodeURIComponent(onlyDigits(cpf))}`);
  const data = toUsuarioList(response.data).map(withCachedPhoto);
  mergeCachedList(USUARIOS_CACHE_KEY, data, ['usuario', 'cpf']);
  return data;
}

export async function pesquisarUsuarios(termo: string): Promise<Usuario[]> {
  const busca = termo.trim();

  if (!busca) {
    return listarUsuarios();
  }

  return onlyDigits(busca).length >= 11 ? buscarUsuarioPorCpf(busca) : buscarUsuarioPorEmail(busca);
}

export async function atualizarUsuario(dados: UsuarioAtualizacao): Promise<Usuario> {
  const response = await api.put<Usuario>('/usuarios', {
    ...dados,
    foto: getPhotoForApi(dados.foto),
  });
  const usuario = { ...response.data, cpf: response.data.cpf || dados.cpf, foto: response.data.foto || dados.foto };
  upsertCachedItem(USUARIOS_CACHE_KEY, usuario, ['usuario', 'cpf']);
  return usuario;
}

export async function excluirUsuario(id: number): Promise<void> {
  try {
    await api.delete(`/usuarios/${id}`);
  } catch (error) {
    if (!isNotFoundError(error) && !isServerError(error)) {
      throw error;
    }
  } finally {
    removeCachedItem<Usuario>(USUARIOS_CACHE_KEY, id, ['usuario', 'cpf']);
  }
}

function getStoredAuthenticatedUser(): Usuario | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Usuario;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}
