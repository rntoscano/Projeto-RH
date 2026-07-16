import { Eye, EyeSlash, FloppyDisk, UserCircle } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PhotoPicker from '../../components/ui/PhotoPicker';
import { useAuth } from '../../contexts/useAuth';
import { atualizarUsuario, buscarUsuarioPorId } from '../../services/usuarioService';
import { getApiErrorMessage } from '../../utils/apiError';
import { getCpfForApi, maskCpf } from '../../utils/formatters';

interface PerfilForm {
  nome: string;
  cpf: string;
  usuario: string;
  foto: string;
  senha: string;
}

type PerfilErrors = Partial<Record<keyof PerfilForm, string>>;

const initialForm: PerfilForm = {
  nome: '',
  cpf: '',
  usuario: '',
  foto: '',
  senha: '',
};

function Perfil() {
  const { usuario, atualizarUsuarioLogado } = useAuth();
  const [form, setForm] = useState<PerfilForm>(initialForm);
  const [errors, setErrors] = useState<PerfilErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadPerfil() {
      if (!usuario?.id) {
        setForm((current) => ({
          ...current,
          nome: usuario?.nome ?? '',
          usuario: usuario?.usuario ?? '',
          foto: usuario?.foto ?? '',
        }));
        setLoadError('Não foi possível identificar o ID do usuário logado para carregar o perfil completo.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError('');
        const dados = await buscarUsuarioPorId(usuario.id);
        setForm({
          nome: dados.nome ?? '',
          cpf: dados.cpf ?? '',
          usuario: dados.usuario ?? '',
          foto: dados.foto ?? '',
          senha: '',
        });
      } catch (error) {
        setLoadError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadPerfil();
  }, [usuario]);

  const updateField = (field: keyof PerfilForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: PerfilErrors = {};

    if (!form.nome.trim()) {
      nextErrors.nome = 'Informe seu nome.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.usuario.trim())) {
      nextErrors.usuario = 'Informe um e-mail válido.';
    }

    if (!form.senha.trim()) {
      nextErrors.senha = 'Informe a senha para confirmar a atualização.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!usuario?.id || !validate()) {
      return;
    }

    try {
      setSaving(true);
      const atualizado = await atualizarUsuario({
        id: usuario.id,
        nome: form.nome.trim(),
        cpf: getCpfForApi(form.cpf),
        usuario: form.usuario.trim(),
        senha: form.senha,
        foto: form.foto.trim() || undefined,
      });

      atualizarUsuarioLogado({
        nome: atualizado.nome,
        usuario: atualizado.usuario,
        foto: atualizado.foto,
      });
      setForm((current) => ({ ...current, senha: '' }));
      toast.success('Perfil atualizado com sucesso.');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Carregando seu perfil..." />;
  }

  return (
    <div className="bg-ekoa-paper px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {form.foto ? (
                <img
                  src={form.foto}
                  alt={`Foto de perfil de ${form.nome || 'usuário'}`}
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-ekoa-purple-100"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-ekoa-purple-50 text-ekoa-purple-600 ring-4 ring-ekoa-purple-100">
                  <UserCircle size={70} aria-hidden="true" />
                </div>
              )}
              <h1 className="mt-5 text-2xl font-black text-ekoa-navy">{form.nome || 'Meu perfil'}</h1>
              <p className="mt-2 text-sm text-slate-600">{form.usuario}</p>
              <p className="mt-4 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                CPF {maskCpf(form.cpf)}
              </p>
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-600">
              Para sua segurança, confirme a senha ao atualizar os dados. Ela é enviada apenas para a API e não fica
              salva no navegador.
            </p>
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Editar meu usuário</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ekoa-navy">Atualize seus dados</h2>

            {loadError && (
              <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {loadError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="perfil-nome" className="text-sm font-bold text-slate-800">
                  Nome completo <span className="text-rose-600">*</span>
                </label>
                <input
                  id="perfil-nome"
                  value={form.nome}
                  onChange={(event) => updateField('nome', event.target.value)}
                  aria-invalid={Boolean(errors.nome)}
                  aria-describedby={errors.nome ? 'perfil-nome-error' : undefined}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                  autoComplete="name"
                />
                {errors.nome && (
                  <p id="perfil-nome-error" className="mt-2 text-sm font-medium text-rose-600">
                    {errors.nome}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="perfil-cpf" className="text-sm font-bold text-slate-800">
                  CPF
                </label>
                <input
                  id="perfil-cpf"
                  value={form.cpf}
                  onChange={(event) => updateField('cpf', event.target.value)}
                  aria-invalid={Boolean(errors.cpf)}
                  aria-describedby={errors.cpf ? 'perfil-cpf-error' : undefined}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                  placeholder="Opcional ou fictício"
                  inputMode="numeric"
                />
                {errors.cpf && (
                  <p id="perfil-cpf-error" className="mt-2 text-sm font-medium text-rose-600">
                    {errors.cpf}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="perfil-email" className="text-sm font-bold text-slate-800">
                  E-mail <span className="text-rose-600">*</span>
                </label>
                <input
                  id="perfil-email"
                  type="email"
                  value={form.usuario}
                  onChange={(event) => updateField('usuario', event.target.value)}
                  aria-invalid={Boolean(errors.usuario)}
                  aria-describedby={errors.usuario ? 'perfil-email-error' : undefined}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                  autoComplete="email"
                />
                {errors.usuario && (
                  <p id="perfil-email-error" className="mt-2 text-sm font-medium text-rose-600">
                    {errors.usuario}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <PhotoPicker
                  id="perfil-foto"
                  label="Foto de perfil"
                  value={form.foto}
                  onChange={(value) => updateField('foto', value)}
                  onError={(message) => toast.error(message)}
                  helperText="Escolha uma foto para aparecer no seu perfil e na lista de usuários."
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="perfil-senha" className="text-sm font-bold text-slate-800">
                  Senha para confirmação <span className="text-rose-600">*</span>
                </label>
                <div className="mt-2 flex rounded-lg border border-slate-300 focus-within:border-ekoa-purple-600 focus-within:ring-4 focus-within:ring-ekoa-purple-100">
                  <input
                    id="perfil-senha"
                    type={showPassword ? 'text' : 'password'}
                    value={form.senha}
                    onChange={(event) => updateField('senha', event.target.value)}
                    aria-invalid={Boolean(errors.senha)}
                    aria-describedby={errors.senha ? 'perfil-senha-error' : undefined}
                    className="min-w-0 flex-1 rounded-l-lg px-4 py-3 outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="rounded-r-lg px-4 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeSlash size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
                  </button>
                </div>
                {errors.senha && (
                  <p id="perfil-senha-error" className="mt-2 text-sm font-medium text-rose-600">
                    {errors.senha}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving || !usuario?.id}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ekoa-purple-600 px-5 py-3 text-base font-bold text-white transition hover:bg-ekoa-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-purple-600 disabled:opacity-70 sm:w-auto"
                >
                  <FloppyDisk size={20} aria-hidden="true" />
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
