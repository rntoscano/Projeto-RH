import type { Funcionario } from './Funcionario';

export interface Usuario {
  id?: number;
  nome: string;
  cpf?: string;
  usuario: string;
  senha?: string;
  foto?: string;
  funcionarios?: Funcionario[];
}

export interface UsuarioCadastro {
  nome: string;
  cpf?: string;
  usuario: string;
  senha: string;
  foto?: string;
}

export interface UsuarioAtualizacao extends UsuarioCadastro {
  id: number;
}

export interface UsuarioLogin {
  usuario: string;
  senha: string;
}

export interface UsuarioAutenticado {
  id?: number;
  nome: string;
  usuario: string;
  foto?: string;
  token: string;
}
