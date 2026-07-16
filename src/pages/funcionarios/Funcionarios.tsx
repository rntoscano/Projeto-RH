import { IdentificationCard, MagnifyingGlass, PencilSimple, PlusCircle, Trash } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Departamento } from '../../models/Departamento';
import type { Funcionario, FuncionarioPayload } from '../../models/Funcionario';
import { listarDepartamentos } from '../../services/departamentoService';
import {
  atualizarFuncionario,
  criarFuncionario,
  excluirFuncionario,
  listarFuncionarios,
  pesquisarFuncionarios,
} from '../../services/funcionarioService';
import { getApiErrorMessage, isNotFoundError } from '../../utils/apiError';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface FuncionarioForm {
  id?: number;
  nome: string;
  cargo: string;
  valorHora: string;
  horasTrabalhadas: string;
  descontos: string;
  dataContratacao: string;
  departamentoId: string;
}

type FuncionarioErrors = Partial<Record<keyof FuncionarioForm, string>>;
type NumericFuncionarioField = 'valorHora' | 'horasTrabalhadas' | 'descontos';

const initialForm: FuncionarioForm = {
  nome: '',
  cargo: '',
  valorHora: '',
  horasTrabalhadas: '',
  descontos: '0',
  dataContratacao: '',
  departamentoId: '',
};

const numericFields: Array<{ key: NumericFuncionarioField; label: string; integer?: boolean }> = [
  { key: 'valorHora', label: 'Valor por hora' },
  { key: 'horasTrabalhadas', label: 'Horas trabalhadas', integer: true },
  { key: 'descontos', label: 'Descontos' },
];

function toRequiredNumber(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

function toRequiredInteger(value: string): number {
  return Math.trunc(toRequiredNumber(value));
}

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [form, setForm] = useState<FuncionarioForm>(initialForm);
  const [errors, setErrors] = useState<FuncionarioErrors>({});
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState<Funcionario | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [funcionariosData, departamentosData] = await Promise.all([listarFuncionarios(), listarDepartamentos()]);
      setFuncionarios(funcionariosData);
      setDepartamentos(departamentosData);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [funcionariosData, departamentosData] = await Promise.all([listarFuncionarios(), listarDepartamentos()]);

        if (active) {
          setFuncionarios(funcionariosData);
          setDepartamentos(departamentosData);
          setError('');
        }
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
  };

  const updateField = (field: keyof FuncionarioForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: FuncionarioErrors = {};

    if (form.nome.trim().length < 3) {
      nextErrors.nome = 'Informe ao menos 3 caracteres.';
    }

    if (form.cargo.trim().length < 3) {
      nextErrors.cargo = 'Informe ao menos 3 caracteres.';
    }

    if (!form.departamentoId) {
      nextErrors.departamentoId = 'Selecione um departamento.';
    }

    if (!form.dataContratacao) {
      nextErrors.dataContratacao = 'Informe a data de contratação.';
    }

    numericFields.forEach(({ key, label, integer }) => {
      const value = form[key].trim();

      if (!value) {
        nextErrors[key] = `${label} é obrigatório.`;
        return;
      }

      const parsed = Number(value.replace(',', '.'));

      if (Number.isNaN(parsed) || parsed < 0) {
        nextErrors[key] = `${label} deve ser um número positivo.`;
        return;
      }

      if (integer && !Number.isInteger(parsed)) {
        nextErrors[key] = `${label} deve ser um número inteiro.`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (): FuncionarioPayload => {
    const departamentoId = Number(form.departamentoId);
    const departamento = departamentos.find((item) => item.id === departamentoId);

    return {
      id: form.id,
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      valorHora: toRequiredNumber(form.valorHora),
      horasTrabalhadas: toRequiredInteger(form.horasTrabalhadas),
      descontos: toRequiredNumber(form.descontos),
      dataContratacao: form.dataContratacao,
      departamento: {
        id: departamentoId,
        nome: departamento?.nome ?? '',
        descricao: departamento?.descricao,
      },
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      const salvo = form.id ? await atualizarFuncionario(buildPayload()) : await criarFuncionario(buildPayload());
      setFuncionarios((current) => {
        if (form.id) {
          return current.map((funcionario) => (funcionario.id === salvo.id ? salvo : funcionario));
        }

        return [salvo, ...current];
      });
      toast.success(form.id ? 'Funcionário atualizado com sucesso.' : 'Funcionário cadastrado com sucesso.');
      resetForm();
    } catch (saveError) {
      toast.error(getApiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (funcionario: Funcionario) => {
    setForm({
      id: funcionario.id,
      nome: funcionario.nome ?? '',
      cargo: funcionario.cargo ?? '',
      valorHora: funcionario.valorHora?.toString() ?? '',
      horasTrabalhadas: funcionario.horasTrabalhadas?.toString() ?? '',
      descontos: funcionario.descontos?.toString() ?? '0',
      dataContratacao: funcionario.dataContratacao ?? '',
      departamentoId: funcionario.departamento?.id?.toString() ?? '',
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSearching(true);
      setError('');
      const dados = await pesquisarFuncionarios(busca);
      setFuncionarios(dados);
    } catch (searchError) {
      if (isNotFoundError(searchError)) {
        setFuncionarios([]);
        return;
      }

      setError(getApiErrorMessage(searchError));
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setBusca('');
    loadData();
  };

  const handleDelete = async () => {
    if (!funcionarioParaExcluir?.id) {
      return;
    }

    const funcionarioId = funcionarioParaExcluir.id;

    try {
      setDeleting(true);
      await excluirFuncionario(funcionarioId);
      setFuncionarios((current) => current.filter((funcionario) => funcionario.id !== funcionarioId));
      toast.success('Funcionário excluído com sucesso.');
      setFuncionarioParaExcluir(null);
    } catch (deleteError) {
      if (isNotFoundError(deleteError)) {
        setFuncionarios((current) => current.filter((funcionario) => funcionario.id !== funcionarioId));
        toast.info('Funcionário removido da lista. Ele já havia sido excluído.');
        setFuncionarioParaExcluir(null);
        return;
      }

      toast.error(getApiErrorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Carregando funcionários..." />;
  }

  return (
    <div className="bg-ekoa-paper px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Funcionários</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ekoa-navy">
            {form.id ? 'Editar funcionário' : 'Novo funcionário'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Registre dados profissionais e associe o departamento. A API calcula o salário com valor por hora, horas
            trabalhadas e descontos.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="funcionario-nome" className="text-sm font-bold text-slate-800">
                Nome <span className="text-rose-600">*</span>
              </label>
              <input
                id="funcionario-nome"
                value={form.nome}
                onChange={(event) => updateField('nome', event.target.value)}
                aria-invalid={Boolean(errors.nome)}
                aria-describedby={errors.nome ? 'funcionario-nome-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                maxLength={100}
              />
              {errors.nome && (
                <p id="funcionario-nome-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.nome}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="funcionario-cargo" className="text-sm font-bold text-slate-800">
                Cargo <span className="text-rose-600">*</span>
              </label>
              <input
                id="funcionario-cargo"
                value={form.cargo}
                onChange={(event) => updateField('cargo', event.target.value)}
                aria-invalid={Boolean(errors.cargo)}
                aria-describedby={errors.cargo ? 'funcionario-cargo-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                maxLength={50}
              />
              {errors.cargo && (
                <p id="funcionario-cargo-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.cargo}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="funcionario-departamento" className="text-sm font-bold text-slate-800">
                Departamento <span className="text-rose-600">*</span>
              </label>
              <select
                id="funcionario-departamento"
                value={form.departamentoId}
                onChange={(event) => updateField('departamentoId', event.target.value)}
                aria-invalid={Boolean(errors.departamentoId)}
                aria-describedby={errors.departamentoId ? 'funcionario-departamento-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
              >
                <option value="">Selecione</option>
                {departamentos
                  .filter((departamento) => typeof departamento.id === 'number')
                  .map((departamento) => (
                  <option key={departamento.id} value={departamento.id}>
                    {departamento.nome}
                  </option>
                ))}
              </select>
              {errors.departamentoId && (
                <p id="funcionario-departamento-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.departamentoId}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="funcionario-data" className="text-sm font-bold text-slate-800">
                Data de contratação <span className="text-rose-600">*</span>
              </label>
              <input
                id="funcionario-data"
                type="date"
                value={form.dataContratacao}
                onChange={(event) => updateField('dataContratacao', event.target.value)}
                aria-invalid={Boolean(errors.dataContratacao)}
                aria-describedby={errors.dataContratacao ? 'funcionario-data-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
              />
              {errors.dataContratacao && (
                <p id="funcionario-data-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.dataContratacao}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="funcionario-valor-hora" className="text-sm font-bold text-slate-800">
                Valor por hora <span className="text-rose-600">*</span>
              </label>
              <input
                id="funcionario-valor-hora"
                value={form.valorHora}
                onChange={(event) => updateField('valorHora', event.target.value)}
                aria-invalid={Boolean(errors.valorHora)}
                aria-describedby={errors.valorHora ? 'funcionario-valor-hora-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                inputMode="decimal"
                placeholder="Ex.: 45.50"
              />
              {errors.valorHora && (
                <p id="funcionario-valor-hora-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.valorHora}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="funcionario-horas" className="text-sm font-bold text-slate-800">
                Horas trabalhadas <span className="text-rose-600">*</span>
              </label>
              <input
                id="funcionario-horas"
                value={form.horasTrabalhadas}
                onChange={(event) => updateField('horasTrabalhadas', event.target.value)}
                aria-invalid={Boolean(errors.horasTrabalhadas)}
                aria-describedby={errors.horasTrabalhadas ? 'funcionario-horas-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                inputMode="numeric"
              />
              {errors.horasTrabalhadas && (
                <p id="funcionario-horas-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.horasTrabalhadas}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="funcionario-descontos" className="text-sm font-bold text-slate-800">
                Descontos <span className="text-rose-600">*</span>
              </label>
              <input
                id="funcionario-descontos"
                value={form.descontos}
                onChange={(event) => updateField('descontos', event.target.value)}
                aria-invalid={Boolean(errors.descontos)}
                aria-describedby={errors.descontos ? 'funcionario-descontos-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                inputMode="decimal"
              />
              {errors.descontos && (
                <p id="funcionario-descontos-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.descontos}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ekoa-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-ekoa-purple-700 disabled:opacity-70"
              >
                <PlusCircle size={20} aria-hidden="true" />
                {saving ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Cadastrar'}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-ekoa-navy">Funcionários cadastrados</h2>
                <p className="mt-1 text-sm text-slate-600">Busque por cargo ou veja todos os registros.</p>
              </div>
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="busca-funcionario" className="sr-only">
                  Buscar funcionário por cargo
                </label>
                <div className="flex min-w-0 rounded-lg border border-slate-300 focus-within:border-ekoa-purple-600 focus-within:ring-4 focus-within:ring-ekoa-purple-100 sm:w-72">
                  <span className="flex items-center px-3 text-slate-400">
                    <MagnifyingGlass size={20} aria-hidden="true" />
                  </span>
                  <input
                    id="busca-funcionario"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Cargo"
                    className="min-w-0 flex-1 rounded-r-lg px-2 py-3 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="rounded-lg bg-ekoa-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-ekoa-purple-700 disabled:opacity-70"
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </button>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Limpar
                </button>
              </form>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-5">
            {funcionarios.length === 0 ? (
              <EmptyState
                title="Nenhum funcionário encontrado"
                description="Cadastre o primeiro funcionário ou ajuste o termo de busca."
                icon={IdentificationCard}
              />
            ) : (
              <div className="grid gap-4">
                {funcionarios.map((funcionario) => (
                  <article key={funcionario.id ?? `${funcionario.nome}-${funcionario.cargo}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-ekoa-navy">{funcionario.nome}</h3>
                        <p className="mt-1 text-sm font-semibold text-ekoa-purple-700">{funcionario.cargo}</p>
                        <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                          <div>
                            <dt className="font-bold text-slate-800">Departamento</dt>
                            <dd>{funcionario.departamento?.nome || 'Não vinculado'}</dd>
                          </div>
                          <div>
                            <dt className="font-bold text-slate-800">Contratação</dt>
                            <dd>{formatDate(funcionario.dataContratacao)}</dd>
                          </div>
                          <div>
                            <dt className="font-bold text-slate-800">Salário</dt>
                            <dd>{formatCurrency(funcionario.salario)}</dd>
                          </div>
                          <div>
                            <dt className="font-bold text-slate-800">Valor/hora</dt>
                            <dd>{formatCurrency(funcionario.valorHora)}</dd>
                          </div>
                          <div>
                            <dt className="font-bold text-slate-800">Horas trabalhadas</dt>
                            <dd>{funcionario.horasTrabalhadas ?? 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="font-bold text-slate-800">Descontos</dt>
                            <dd>{formatCurrency(funcionario.descontos)}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(funcionario)}
                          className="inline-flex items-center gap-2 rounded-lg border border-ekoa-purple-200 px-3 py-2 text-sm font-bold text-ekoa-purple-700 transition hover:bg-ekoa-purple-50"
                        >
                          <PencilSimple size={18} aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setFuncionarioParaExcluir(funcionario)}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                        >
                          <Trash size={18} aria-hidden="true" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(funcionarioParaExcluir)}
        title="Excluir funcionário?"
        description={`Essa ação removerá ${funcionarioParaExcluir?.nome ?? 'este funcionário'} se não houver bloqueio da API.`}
        confirmLabel="Excluir funcionário"
        loading={deleting}
        onCancel={() => setFuncionarioParaExcluir(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Funcionarios;
