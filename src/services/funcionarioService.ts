import type { Funcionario, FuncionarioPayload } from '../models/Funcionario';
import { isNotFoundError, isServerError } from '../utils/apiError';
import { getCachedList, mergeCachedList, removeCachedItem, replaceCachedList, upsertCachedItem } from '../utils/localCache';
import { api } from './api';

const FUNCIONARIOS_CACHE_KEY = 'projeto-rh:cache:funcionarios';

function toFuncionarioList(data: Funcionario | Funcionario[]): Funcionario[] {
  return Array.isArray(data) ? data : [data];
}

export async function listarFuncionarios(): Promise<Funcionario[]> {
  try {
    const response = await api.get<Funcionario[]>('/funcionarios');
    return replaceCachedList(FUNCIONARIOS_CACHE_KEY, response.data, ['nome', 'cargo']);
  } catch (error) {
    if (isServerError(error)) {
      return getCachedList<Funcionario>(FUNCIONARIOS_CACHE_KEY);
    }

    throw error;
  }
}

export async function buscarFuncionarioPorId(id: number): Promise<Funcionario> {
  const response = await api.get<Funcionario>(`/funcionarios/${id}`);
  upsertCachedItem(FUNCIONARIOS_CACHE_KEY, response.data, ['nome', 'cargo']);
  return response.data;
}

export async function buscarFuncionariosPorCargo(cargo: string): Promise<Funcionario[]> {
  const response = await api.get<Funcionario | Funcionario[]>(`/funcionarios/cargo/${encodeURIComponent(cargo)}`);
  const data = toFuncionarioList(response.data);
  mergeCachedList(FUNCIONARIOS_CACHE_KEY, data, ['nome', 'cargo']);
  return data;
}

export async function pesquisarFuncionarios(termo: string): Promise<Funcionario[]> {
  const busca = termo.trim();
  return busca ? buscarFuncionariosPorCargo(busca) : listarFuncionarios();
}

export async function criarFuncionario(dados: FuncionarioPayload): Promise<Funcionario> {
  const response = await api.post<Funcionario>('/funcionarios', dados);
  upsertCachedItem(FUNCIONARIOS_CACHE_KEY, response.data, ['nome', 'cargo']);
  return response.data;
}

export async function atualizarFuncionario(dados: FuncionarioPayload): Promise<Funcionario> {
  const response = await api.put<Funcionario>('/funcionarios', dados);
  upsertCachedItem(FUNCIONARIOS_CACHE_KEY, response.data, ['nome', 'cargo']);
  return response.data;
}

export async function excluirFuncionario(id: number): Promise<void> {
  try {
    await api.delete(`/funcionarios/${id}`);
  } catch (error) {
    if (!isNotFoundError(error) && !isServerError(error)) {
      throw error;
    }
  } finally {
    removeCachedItem<Funcionario>(FUNCIONARIOS_CACHE_KEY, id, ['nome', 'cargo']);
  }
}
