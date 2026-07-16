import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import type { ReactNode } from 'react';
import type { UsuarioAutenticado, UsuarioLogin } from '../models/Usuario';
import { autenticarUsuario } from '../services/authService';
import { AUTH_STORAGE_KEY } from '../services/api';
import { AuthContext } from './authContextValue';

function readStoredUser(): UsuarioAutenticado | null {
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => readStoredUser());

  const persistirUsuario = useCallback((dados: UsuarioAutenticado | null) => {
    setUsuario(dados);

    if (dados) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(dados));
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (credenciais: UsuarioLogin) => {
      const usuarioAutenticado = await autenticarUsuario(credenciais);
      persistirUsuario(usuarioAutenticado);
    },
    [persistirUsuario],
  );

  const logout = useCallback(() => {
    persistirUsuario(null);
  }, [persistirUsuario]);

  const atualizarUsuarioLogado = useCallback(
    (dados: Partial<UsuarioAutenticado>) => {
      setUsuario((usuarioAtual) => {
        if (!usuarioAtual) {
          return usuarioAtual;
        }

        const atualizado = { ...usuarioAtual, ...dados };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(atualizado));
        return atualizado;
      });
    },
    [],
  );

  useEffect(() => {
    const handleSessionExpired = () => {
      persistirUsuario(null);
      toast.warning('Sua sessão expirou. Faça login novamente.');
    };

    window.addEventListener('auth:expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:expired', handleSessionExpired);
    };
  }, [persistirUsuario]);

  const value = useMemo(
    () => ({
      usuario,
      isAuthenticated: Boolean(usuario?.token),
      login,
      logout,
      atualizarUsuarioLogado,
    }),
    [atualizarUsuarioLogado, login, logout, usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
