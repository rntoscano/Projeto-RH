import type { Departamento } from './Departamento';

export interface Funcionario {
  id?: number;
  nome: string;
  cargo: string;
  salario?: number;
  valorHora?: number;
  horasTrabalhadas?: number;
  descontos?: number;
  dataContratacao?: string;
  departamento?: Partial<Departamento>;
}

export interface FuncionarioPayload {
  id?: number;
  nome: string;
  cargo: string;
  valorHora: number;
  horasTrabalhadas: number;
  descontos: number;
  dataContratacao: string;
  departamento: Departamento;
}
