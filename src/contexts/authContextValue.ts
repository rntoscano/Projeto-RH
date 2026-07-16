import { createContext } from 'react';
import type { UsuarioAutenticado, UsuarioLogin } from '../models/Usuario';

export interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  isAuthenticated: boolean;
  login: (credenciais: UsuarioLogin) => Promise<void>;
  logout: () => void;
  atualizarUsuarioLogado: (dados: Partial<UsuarioAutenticado>) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
