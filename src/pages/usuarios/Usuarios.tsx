import { Eye, EyeSlash, FloppyDisk, MagnifyingGlass, PencilSimple, Trash, UserCircle, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PhotoPicker from '../../components/ui/PhotoPicker';
import { useAuth } from '../../contexts/useAuth';
import type { Usuario } from '../../models/Usuario';
import { atualizarUsuario, excluirUsuario, listarUsuarios, pesquisarUsuarios } from '../../services/usuarioService';
import { getApiErrorMessage, isNotFoundError } from '../../utils/apiError';
import { getCpfForApi, maskCpf } from '../../utils/formatters';

interface UsuarioEditForm {
  id?: number;
  nome: string;
  cpf: string;
  usuario: string;
  foto: string;
  senha: string;
  confirmarSenha: string;
}

type UsuarioEditErrors = Partial<Record<keyof UsuarioEditForm, string>>;

interface UsuariosProps {
  editarUsuarioLogado?: boolean;
}

function toEditForm(usuario: Usuario): UsuarioEditForm {
  return {
    id: usuario.id,
    nome: usuario.nome ?? '',
    cpf: usuario.cpf ?? '',
    usuario: usuario.usuario ?? '',
    foto: usuario.foto ?? '',
    senha: '',
    confirmarSenha: '',
  };
}

function getInitials(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
}

function Usuarios({ editarUsuarioLogado = false }: UsuariosProps) {
  const { usuario: usuarioLogado, atualizarUsuarioLogado, logout } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Usuario | null>(null);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState<UsuarioEditForm>({
    nome: '',
    cpf: '',
    usuario: '',
    foto: '',
    senha: '',
    confirmarSenha: '',
  });
  const [editErrors, setEditErrors] = useState<UsuarioEditErrors>({});
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await listarUsuarios();
      setUsuarios(dados);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const findUsuarioLogado = (dados: Usuario[]): Usuario | null => {
      const usuarioEncontrado = dados.find((usuario) => {
        if (usuarioLogado?.id && usuario.id === usuarioLogado.id) {
          return true;
        }

        return Boolean(usuarioLogado?.usuario && usuario.usuario === usuarioLogado.usuario);
      });

      if (usuarioEncontrado) {
        return usuarioEncontrado;
      }

      if (!usuarioLogado?.usuario) {
        return null;
      }

      return {
        id: usuarioLogado.id,
        nome: usuarioLogado.nome,
        cpf: '',
        usuario: usuarioLogado.usuario,
        foto: usuarioLogado.foto,
      };
    };

    async function loadInitialUsuarios() {
      try {
        const dados = await listarUsuarios();

        if (active) {
          const usuarioParaEdicao = editarUsuarioLogado ? findUsuarioLogado(dados) : null;
          const usuarioJaEstaNaLista = usuarioParaEdicao
            ? dados.some((usuario) => {
                if (usuarioParaEdicao.id && usuario.id === usuarioParaEdicao.id) {
                  return true;
                }

                return usuario.usuario === usuarioParaEdicao.usuario;
              })
            : true;

          setUsuarios(usuarioParaEdicao && !usuarioJaEstaNaLista ? [usuarioParaEdicao, ...dados] : dados);
          setError('');

          if (editarUsuarioLogado) {
            if (usuarioParaEdicao) {
              setUsuarioParaEditar(usuarioParaEdicao);
              setEditForm(toEditForm(usuarioParaEdicao));
              setEditErrors({});
              setShowEditPassword(false);
            } else {
              setError('Não foi possível encontrar o usuário logado para edição.');
            }
          }
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

    void loadInitialUsuarios();

    return () => {
      active = false;
    };
  }, [editarUsuarioLogado, usuarioLogado?.foto, usuarioLogado?.id, usuarioLogado?.nome, usuarioLogado?.usuario]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSearching(true);
      setError('');
      const dados = await pesquisarUsuarios(busca);
      setUsuarios(dados);
    } catch (searchError) {
      if (isNotFoundError(searchError)) {
        setUsuarios([]);
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
    loadUsuarios();
  };

  const openEditForm = (usuario: Usuario) => {
    setUsuarioParaEditar(usuario);
    setEditForm(toEditForm(usuario));
    setEditErrors({});
    setShowEditPassword(false);
  };

  const closeEditForm = () => {
    if (editarUsuarioLogado) {
      navigate('/usuarios');
      return;
    }

    setUsuarioParaEditar(null);
    setEditErrors({});
    setShowEditPassword(false);
  };

  const updateEditField = (field: keyof UsuarioEditForm, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const validateEditForm = () => {
    const nextErrors: UsuarioEditErrors = {};

    if (!editForm.id) {
      nextErrors.id = 'Usuário sem identificador para edição.';
    }

    if (!editForm.nome.trim()) {
      nextErrors.nome = 'Informe o nome.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.usuario.trim())) {
      nextErrors.usuario = 'Informe um e-mail válido.';
    }

    if (editForm.senha.length < 6) {
      nextErrors.senha = 'Informe uma senha com ao menos 6 caracteres para salvar.';
    }

    if (editForm.confirmarSenha !== editForm.senha) {
      nextErrors.confirmarSenha = 'As senhas precisam ser iguais.';
    }

    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEditForm() || !editForm.id) {
      return;
    }

    try {
      setUpdating(true);
      const atualizado = await atualizarUsuario({
        id: editForm.id,
        nome: editForm.nome.trim(),
        cpf: getCpfForApi(editForm.cpf),
        usuario: editForm.usuario.trim(),
        senha: editForm.senha,
        foto: editForm.foto.trim() || undefined,
      });

      setUsuarios((current) => current.map((usuario) => (usuario.id === atualizado.id ? atualizado : usuario)));

      if (atualizado.id === usuarioLogado?.id) {
        atualizarUsuarioLogado({
          nome: atualizado.nome,
          usuario: atualizado.usuario,
          foto: atualizado.foto,
        });
      }

      toast.success('Usuário atualizado com sucesso.');

      if (editarUsuarioLogado) {
        setUsuarioParaEditar(atualizado);
        setEditForm(toEditForm(atualizado));
        setShowEditPassword(false);
        return;
      }

      closeEditForm();
    } catch (updateError) {
      toast.error(getApiErrorMessage(updateError));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!usuarioParaExcluir?.id) {
      return;
    }

    const usuarioId = usuarioParaExcluir.id;

    try {
      setDeleting(true);
      await excluirUsuario(usuarioId);
      setUsuarios((current) => current.filter((usuario) => usuario.id !== usuarioId));
      toast.success('Usuário excluído com sucesso.');

      if (usuarioId === usuarioLogado?.id) {
        logout();
        navigate('/login');
      }

      setUsuarioParaExcluir(null);
    } catch (deleteError) {
      if (isNotFoundError(deleteError)) {
        setUsuarios((current) => current.filter((usuario) => usuario.id !== usuarioId));
        toast.info('Usuário removido da lista. Ele já havia sido excluído.');

        if (usuarioId === usuarioLogado?.id) {
          logout();
          navigate('/login');
        }

        setUsuarioParaExcluir(null);
        return;
      }

      toast.error(getApiErrorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Carregando usuários..." />;
  }

  return (
    <div className="bg-ekoa-paper px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">
              {editarUsuarioLogado ? 'Editar usuário' : 'Usuários'}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-ekoa-navy sm:text-4xl">
              {editarUsuarioLogado ? 'Editar meu usuário' : 'Gestão de acessos'}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              {editarUsuarioLogado
                ? 'Atualize os dados do usuário conectado. Informe uma senha para confirmar a alteração.'
                : 'Consulte usuários cadastrados por e-mail ou CPF. Informações sensíveis como senha e token não são exibidas.'}
            </p>
          </div>

          {!editarUsuarioLogado && (
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="busca-usuario" className="sr-only">
              Buscar usuário por e-mail ou CPF
            </label>
            <div className="flex min-w-0 rounded-lg border border-slate-300 bg-white focus-within:border-ekoa-purple-600 focus-within:ring-4 focus-within:ring-ekoa-purple-100 sm:w-80">
              <span className="flex items-center px-3 text-slate-400">
                <MagnifyingGlass size={20} aria-hidden="true" />
              </span>
              <input
                id="busca-usuario"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="E-mail ou CPF"
                className="min-w-0 flex-1 rounded-r-lg px-2 py-3 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="rounded-lg bg-ekoa-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-ekoa-purple-700 disabled:opacity-70"
            >
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Limpar
            </button>
            </form>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          {usuarioParaEditar && (
            <section className="mb-6 rounded-lg border border-ekoa-purple-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Editar usuário</p>
                  <h2 className="mt-2 text-2xl font-black text-ekoa-navy">{usuarioParaEditar.nome}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Informe uma senha para salvar a atualização. Senhas antigas não são exibidas nem reaproveitadas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditForm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <X size={18} aria-hidden="true" />
                  {editarUsuarioLogado ? 'Voltar para usuários' : 'Fechar'}
                </button>
              </div>

              <form onSubmit={handleUpdate} className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="editar-nome" className="text-sm font-bold text-slate-800">
                    Nome <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="editar-nome"
                    value={editForm.nome}
                    onChange={(event) => updateEditField('nome', event.target.value)}
                    aria-invalid={Boolean(editErrors.nome)}
                    aria-describedby={editErrors.nome ? 'editar-nome-error' : undefined}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                  />
                  {editErrors.nome && (
                    <p id="editar-nome-error" className="mt-2 text-sm font-medium text-rose-600">
                      {editErrors.nome}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="editar-email" className="text-sm font-bold text-slate-800">
                    E-mail <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="editar-email"
                    type="email"
                    value={editForm.usuario}
                    onChange={(event) => updateEditField('usuario', event.target.value)}
                    aria-invalid={Boolean(editErrors.usuario)}
                    aria-describedby={editErrors.usuario ? 'editar-email-error' : undefined}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                  />
                  {editErrors.usuario && (
                    <p id="editar-email-error" className="mt-2 text-sm font-medium text-rose-600">
                      {editErrors.usuario}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="editar-cpf" className="text-sm font-bold text-slate-800">
                    CPF
                  </label>
                  <input
                    id="editar-cpf"
                    value={editForm.cpf}
                    onChange={(event) => updateEditField('cpf', event.target.value)}
                    aria-invalid={Boolean(editErrors.cpf)}
                    aria-describedby={editErrors.cpf ? 'editar-cpf-error' : undefined}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                    placeholder="Opcional ou fictício"
                    inputMode="numeric"
                  />
                  {editErrors.cpf && (
                    <p id="editar-cpf-error" className="mt-2 text-sm font-medium text-rose-600">
                      {editErrors.cpf}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <PhotoPicker
                    id="editar-foto"
                    label="Foto de perfil"
                    value={editForm.foto}
                    onChange={(value) => updateEditField('foto', value)}
                    onError={(message) => toast.error(message)}
                    helperText="Escolha uma nova foto para esse usuário ou remova a foto atual."
                  />
                </div>

                <div>
                  <label htmlFor="editar-senha" className="text-sm font-bold text-slate-800">
                    Senha <span className="text-rose-600">*</span>
                  </label>
                  <div className="mt-2 flex rounded-lg border border-slate-300 focus-within:border-ekoa-purple-600 focus-within:ring-4 focus-within:ring-ekoa-purple-100">
                    <input
                      id="editar-senha"
                      type={showEditPassword ? 'text' : 'password'}
                      value={editForm.senha}
                      onChange={(event) => updateEditField('senha', event.target.value)}
                      aria-invalid={Boolean(editErrors.senha)}
                      aria-describedby={editErrors.senha ? 'editar-senha-error' : undefined}
                      className="min-w-0 flex-1 rounded-l-lg px-4 py-3 outline-none"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((current) => !current)}
                      className="rounded-r-lg px-4 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      aria-label={showEditPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showEditPassword ? <EyeSlash size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
                    </button>
                  </div>
                  {editErrors.senha && (
                    <p id="editar-senha-error" className="mt-2 text-sm font-medium text-rose-600">
                      {editErrors.senha}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="editar-confirmar-senha" className="text-sm font-bold text-slate-800">
                    Confirmar senha <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="editar-confirmar-senha"
                    type={showEditPassword ? 'text' : 'password'}
                    value={editForm.confirmarSenha}
                    onChange={(event) => updateEditField('confirmarSenha', event.target.value)}
                    aria-invalid={Boolean(editErrors.confirmarSenha)}
                    aria-describedby={editErrors.confirmarSenha ? 'editar-confirmar-senha-error' : undefined}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                    autoComplete="new-password"
                  />
                  {editErrors.confirmarSenha && (
                    <p id="editar-confirmar-senha-error" className="mt-2 text-sm font-medium text-rose-600">
                      {editErrors.confirmarSenha}
                    </p>
                  )}
                </div>

                {editErrors.id && <p className="text-sm font-medium text-rose-600 md:col-span-2">{editErrors.id}</p>}

                <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-ekoa-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-ekoa-purple-700 disabled:opacity-70"
                  >
                    <FloppyDisk size={20} aria-hidden="true" />
                    {updating ? 'Salvando...' : 'Salvar usuário'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditForm}
                    className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    {editarUsuarioLogado ? 'Voltar para usuários' : 'Cancelar'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {!editarUsuarioLogado && usuarios.length === 0 ? (
            <EmptyState title="Nenhum usuário encontrado" description="Tente ajustar a busca ou cadastre um novo usuário." />
          ) : !editarUsuarioLogado ? (
            <>
              <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-sm uppercase tracking-[0.12em] text-slate-600">
                    <tr>
                      <th className="px-5 py-4">Usuário</th>
                      <th className="px-5 py-4">E-mail</th>
                      <th className="px-5 py-4">CPF</th>
                      <th className="px-5 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id ?? usuario.usuario} className="hover:bg-ekoa-paper">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {usuario.foto ? (
                              <img
                                src={usuario.foto}
                                alt={`Foto de ${usuario.nome}`}
                                className="h-10 w-10 rounded-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ekoa-purple-50 text-sm font-black text-ekoa-purple-700">
                                {getInitials(usuario.nome) || <UserCircle size={22} aria-hidden="true" />}
                              </div>
                            )}
                            <span className="font-semibold text-ekoa-navy">{usuario.nome}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{usuario.usuario}</td>
                        <td className="px-5 py-4 text-slate-600">{maskCpf(usuario.cpf)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(usuario)}
                              className="inline-flex items-center gap-2 rounded-lg border border-ekoa-purple-200 px-3 py-2 text-sm font-bold text-ekoa-purple-700 transition hover:bg-ekoa-purple-50"
                              aria-label={`Editar usuário ${usuario.nome}`}
                            >
                              <PencilSimple size={18} aria-hidden="true" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setUsuarioParaExcluir(usuario)}
                              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                              aria-label={`Excluir usuário ${usuario.nome}`}
                            >
                              <Trash size={18} aria-hidden="true" />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 md:hidden">
                {usuarios.map((usuario) => (
                  <article key={usuario.id ?? usuario.usuario} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      {usuario.foto ? (
                        <img src={usuario.foto} alt={`Foto de ${usuario.nome}`} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ekoa-purple-50 text-sm font-black text-ekoa-purple-700">
                          {getInitials(usuario.nome) || <UserCircle size={22} aria-hidden="true" />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="font-bold text-ekoa-navy">{usuario.nome}</h2>
                        <p className="break-words text-sm text-slate-600">{usuario.usuario}</p>
                        <p className="mt-1 text-sm text-slate-600">CPF {maskCpf(usuario.cpf)}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(usuario)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ekoa-purple-200 px-3 py-2 text-sm font-bold text-ekoa-purple-700 transition hover:bg-ekoa-purple-50"
                      >
                        <PencilSimple size={18} aria-hidden="true" />
                        Editar usuário
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsuarioParaExcluir(usuario)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash size={18} aria-hidden="true" />
                        Excluir usuário
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(usuarioParaExcluir)}
        title="Excluir usuário?"
        description={
          usuarioParaExcluir?.id === usuarioLogado?.id
            ? 'Você está excluindo o próprio usuário. Se a API permitir, sua sessão será encerrada e você voltará para o login.'
            : `Essa ação removerá ${usuarioParaExcluir?.nome ?? 'este usuário'} se a API permitir. Ela não pode ser desfeita pela interface.`
        }
        confirmLabel="Excluir usuário"
        loading={deleting}
        onCancel={() => setUsuarioParaExcluir(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Usuarios;
