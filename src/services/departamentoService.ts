import type { Departamento, DepartamentoPayload } from '../models/Departamento';
import { isNotFoundError, isServerError } from '../utils/apiError';
import { getCachedList, mergeCachedList, removeCachedItem, replaceCachedList, upsertCachedItem } from '../utils/localCache';
import { api } from './api';

const DEPARTAMENTOS_CACHE_KEY = 'projeto-rh:cache:departamentos';

function toDepartamentoList(data: Departamento | Departamento[]): Departamento[] {
  return Array.isArray(data) ? data : [data];
}

function getCachedDepartamentos(): Departamento[] {
  return getCachedList<Departamento>(DEPARTAMENTOS_CACHE_KEY);
}

function findCachedDepartamentoById(id: number): Departamento | undefined {
  return getCachedDepartamentos().find((departamento) => departamento.id === id);
}

function searchCachedDepartamentos(nome: string): Departamento[] {
  const normalizedSearch = nome.trim().toLocaleLowerCase('pt-BR');

  if (!normalizedSearch) {
    return getCachedDepartamentos();
  }

  return getCachedDepartamentos().filter((departamento) =>
    departamento.nome.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
  );
}

function saveLocalDepartamento(dados: DepartamentoPayload): Departamento {
  const cachedById = typeof dados.id === 'number' ? findCachedDepartamentoById(dados.id) : undefined;
  const departamento: Departamento = {
    ...cachedById,
    id: dados.id ?? cachedById?.id ?? -Date.now(),
    nome: dados.nome,
    descricao: dados.descricao,
  };

  return upsertCachedItem(DEPARTAMENTOS_CACHE_KEY, departamento, ['nome']);
}

export async function listarDepartamentos(): Promise<Departamento[]> {
  try {
    const response = await api.get<Departamento[]>('/departamentos');
    return replaceCachedList(DEPARTAMENTOS_CACHE_KEY, response.data, ['nome']);
  } catch (error) {
    if (isServerError(error)) {
      return getCachedDepartamentos();
    }

    throw error;
  }
}

export async function buscarDepartamentoPorId(id: number): Promise<Departamento> {
  try {
    const response = await api.get<Departamento>(`/departamentos/${id}`);
    upsertCachedItem(DEPARTAMENTOS_CACHE_KEY, response.data, ['nome']);
    return response.data;
  } catch (error) {
    const cached = findCachedDepartamentoById(id);

    if ((isServerError(error) || isNotFoundError(error)) && cached) {
      return cached;
    }

    throw error;
  }
}

export async function buscarDepartamentosPorNome(nome: string): Promise<Departamento[]> {
  try {
    const response = await api.get<Departamento | Departamento[]>(`/departamentos/nome/${encodeURIComponent(nome)}`);
    const data = toDepartamentoList(response.data);
    mergeCachedList(DEPARTAMENTOS_CACHE_KEY, data, ['nome']);
    return data;
  } catch (error) {
    if (isServerError(error) || isNotFoundError(error)) {
      return searchCachedDepartamentos(nome);
    }

    throw error;
  }
}

export async function pesquisarDepartamentos(termo: string): Promise<Departamento[]> {
  const busca = termo.trim();
  return busca ? buscarDepartamentosPorNome(busca) : listarDepartamentos();
}

export async function criarDepartamento(dados: DepartamentoPayload): Promise<Departamento> {
  try {
    const response = await api.post<Departamento>('/departamentos', dados);
    upsertCachedItem(DEPARTAMENTOS_CACHE_KEY, response.data, ['nome']);
    return response.data;
  } catch (error) {
    if (isServerError(error)) {
      return saveLocalDepartamento(dados);
    }

    throw error;
  }
}

export async function atualizarDepartamento(dados: DepartamentoPayload): Promise<Departamento> {
  try {
    const response = await api.put<Departamento>('/departamentos', dados);
    upsertCachedItem(DEPARTAMENTOS_CACHE_KEY, response.data, ['nome']);
    return response.data;
  } catch (error) {
    if (isServerError(error)) {
      return saveLocalDepartamento(dados);
    }

    throw error;
  }
}

export async function excluirDepartamento(id: number): Promise<void> {
  try {
    await api.delete(`/departamentos/${id}`);
  } catch (error) {
    if (!isNotFoundError(error) && !isServerError(error)) {
      throw error;
    }
  } finally {
    removeCachedItem<Departamento>(DEPARTAMENTOS_CACHE_KEY, id, ['nome']);
  }
}
