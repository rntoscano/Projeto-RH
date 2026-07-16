import { Buildings, MagnifyingGlass, PencilSimple, PlusCircle, Trash } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Departamento } from '../../models/Departamento';
import {
  atualizarDepartamento,
  criarDepartamento,
  excluirDepartamento,
  listarDepartamentos,
  pesquisarDepartamentos,
} from '../../services/departamentoService';
import { getApiErrorMessage, isNotFoundError } from '../../utils/apiError';

interface DepartamentoForm {
  id?: number;
  nome: string;
  descricao: string;
}

type DepartamentoErrors = Partial<Record<keyof DepartamentoForm, string>>;

const initialForm: DepartamentoForm = {
  nome: '',
  descricao: '',
};

function Departamentos() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [form, setForm] = useState<DepartamentoForm>(initialForm);
  const [errors, setErrors] = useState<DepartamentoErrors>({});
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [departamentoParaExcluir, setDepartamentoParaExcluir] = useState<Departamento | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDepartamentos = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await listarDepartamentos();
      setDepartamentos(dados);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadInitialDepartamentos() {
      try {
        const dados = await listarDepartamentos();

        if (active) {
          setDepartamentos(dados);
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

    void loadInitialDepartamentos();

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
  };

  const validate = () => {
    const nextErrors: DepartamentoErrors = {};

    if (form.nome.trim().length < 3) {
      nextErrors.nome = 'Informe ao menos 3 caracteres.';
    }

    if (form.descricao.trim().length > 255) {
      nextErrors.descricao = 'Use no máximo 255 caracteres.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      id: form.id,
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
    };

    try {
      setSaving(true);
      const salvo = form.id ? await atualizarDepartamento(payload) : await criarDepartamento(payload);
      setDepartamentos((current) => {
        if (form.id) {
          return current.map((departamento) => (departamento.id === salvo.id ? salvo : departamento));
        }

        return [salvo, ...current];
      });
      toast.success(form.id ? 'Departamento atualizado com sucesso.' : 'Departamento criado com sucesso.');
      resetForm();
    } catch (saveError) {
      toast.error(getApiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (departamento: Departamento) => {
    setForm({
      id: departamento.id,
      nome: departamento.nome ?? '',
      descricao: departamento.descricao ?? '',
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSearching(true);
      setError('');
      const dados = await pesquisarDepartamentos(busca);
      setDepartamentos(dados);
    } catch (searchError) {
      if (isNotFoundError(searchError)) {
        setDepartamentos([]);
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
    loadDepartamentos();
  };

  const handleDelete = async () => {
    if (!departamentoParaExcluir?.id) {
      return;
    }

    const departamentoId = departamentoParaExcluir.id;

    try {
      setDeleting(true);
      await excluirDepartamento(departamentoId);
      setDepartamentos((current) => current.filter((departamento) => departamento.id !== departamentoId));
      toast.success('Departamento excluído com sucesso.');
      setDepartamentoParaExcluir(null);
    } catch (deleteError) {
      if (isNotFoundError(deleteError)) {
        setDepartamentos((current) => current.filter((departamento) => departamento.id !== departamentoId));
        toast.info('Departamento removido da lista. Ele já havia sido excluído.');
        setDepartamentoParaExcluir(null);
        return;
      }

      toast.error(getApiErrorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Carregando departamentos..." />;
  }

  return (
    <div className="bg-ekoa-paper px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Departamentos</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-ekoa-navy">
            {form.id ? 'Editar departamento' : 'Novo departamento'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Cadastre áreas da empresa para organizar equipes e facilitar a associação com funcionários.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="departamento-nome" className="text-sm font-bold text-slate-800">
                Nome <span className="text-rose-600">*</span>
              </label>
              <input
                id="departamento-nome"
                value={form.nome}
                onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                aria-invalid={Boolean(errors.nome)}
                aria-describedby={errors.nome ? 'departamento-nome-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                maxLength={100}
              />
              {errors.nome && (
                <p id="departamento-nome-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.nome}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="departamento-descricao" className="text-sm font-bold text-slate-800">
                Descrição
              </label>
              <textarea
                id="departamento-descricao"
                value={form.descricao}
                onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
                aria-invalid={Boolean(errors.descricao)}
                aria-describedby={errors.descricao ? 'departamento-descricao-error' : undefined}
                className="mt-2 min-h-32 w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                maxLength={255}
              />
              {errors.descricao && (
                <p id="departamento-descricao-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.descricao}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
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
                <h2 className="text-2xl font-black text-ekoa-navy">Departamentos cadastrados</h2>
                <p className="mt-1 text-sm text-slate-600">Busque por nome ou veja todos os registros.</p>
              </div>
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="busca-departamento" className="sr-only">
                  Buscar departamento por nome
                </label>
                <div className="flex min-w-0 rounded-lg border border-slate-300 focus-within:border-ekoa-purple-600 focus-within:ring-4 focus-within:ring-ekoa-purple-100 sm:w-72">
                  <span className="flex items-center px-3 text-slate-400">
                    <MagnifyingGlass size={20} aria-hidden="true" />
                  </span>
                  <input
                    id="busca-departamento"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Nome do departamento"
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
            {departamentos.length === 0 ? (
              <EmptyState
                title="Nenhum departamento encontrado"
                description="Cadastre o primeiro departamento ou ajuste o termo de busca."
                icon={Buildings}
              />
            ) : (
              <div className="grid gap-4">
                {departamentos.map((departamento) => (
                  <article key={departamento.id ?? departamento.nome} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-ekoa-navy">{departamento.nome}</h3>
                        <p className="mt-2 leading-7 text-slate-600">
                          {departamento.descricao || 'Sem descrição informada.'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(departamento)}
                          className="inline-flex items-center gap-2 rounded-lg border border-ekoa-purple-200 px-3 py-2 text-sm font-bold text-ekoa-purple-700 transition hover:bg-ekoa-purple-50"
                        >
                          <PencilSimple size={18} aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepartamentoParaExcluir(departamento)}
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
        open={Boolean(departamentoParaExcluir)}
        title="Excluir departamento?"
        description={`Essa ação removerá ${departamentoParaExcluir?.nome ?? 'este departamento'} se não houver bloqueio da API.`}
        confirmLabel="Excluir departamento"
        loading={deleting}
        onCancel={() => setDepartamentoParaExcluir(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Departamentos;
