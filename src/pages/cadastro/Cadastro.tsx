import { Eye, EyeSlash, UserPlus } from '@phosphor-icons/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PhotoPicker from '../../components/ui/PhotoPicker';
import { useAuth } from '../../contexts/useAuth';
import { cadastrarUsuario } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';
import { getCpfForApi } from '../../utils/formatters';

interface CadastroForm {
  nome: string;
  cpf: string;
  usuario: string;
  foto: string;
  senha: string;
  confirmarSenha: string;
}

type CadastroErrors = Partial<Record<keyof CadastroForm, string>>;

const initialForm: CadastroForm = {
  nome: '',
  cpf: '',
  usuario: '',
  foto: '',
  senha: '',
  confirmarSenha: '',
};

function Cadastro() {
  const [form, setForm] = useState<CadastroForm>(initialForm);
  const [errors, setErrors] = useState<CadastroErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const updateField = (field: keyof CadastroForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: CadastroErrors = {};

    if (!form.nome.trim()) {
      nextErrors.nome = 'Informe seu nome.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.usuario.trim())) {
      nextErrors.usuario = 'Informe um e-mail válido.';
    }

    if (form.senha.length < 6) {
      nextErrors.senha = 'Use ao menos 6 caracteres.';
    }

    if (form.confirmarSenha !== form.senha) {
      nextErrors.confirmarSenha = 'As senhas precisam ser iguais.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      await cadastrarUsuario({
        nome: form.nome.trim(),
        cpf: getCpfForApi(form.cpf),
        usuario: form.usuario.trim(),
        senha: form.senha,
        foto: form.foto.trim() || undefined,
      });
      toast.success(isAuthenticated ? 'Usuário cadastrado com sucesso.' : 'Cadastro realizado. Agora faça login para acessar a plataforma.');
      navigate(isAuthenticated ? '/usuarios' : '/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ekoa-paper px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">
            {isAuthenticated ? 'Cadastrar usuário' : 'Criar conta'}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ekoa-navy">
            {isAuthenticated ? 'Adicione uma pessoa à plataforma' : 'Faça parte dessa transformação'}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {isAuthenticated
              ? 'Preencha os dados necessários para criar um novo acesso. Depois do cadastro, você voltará para a lista de usuários.'
              : 'Preencha apenas os dados necessários para criar seu acesso. Sua senha não será exibida nem armazenada no navegador.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nome" className="text-sm font-bold text-slate-800">
                Nome completo <span className="text-rose-600">*</span>
              </label>
              <input
                id="nome"
                value={form.nome}
                onChange={(event) => updateField('nome', event.target.value)}
                aria-invalid={Boolean(errors.nome)}
                aria-describedby={errors.nome ? 'nome-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                autoComplete="name"
              />
              {errors.nome && (
                <p id="nome-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.nome}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cpf" className="text-sm font-bold text-slate-800">
                CPF
              </label>
              <input
                id="cpf"
                value={form.cpf}
                onChange={(event) => updateField('cpf', event.target.value)}
                aria-invalid={Boolean(errors.cpf)}
                aria-describedby={errors.cpf ? 'cpf-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                placeholder="Opcional ou fictício"
                inputMode="numeric"
                autoComplete="off"
              />
              {errors.cpf && (
                <p id="cpf-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.cpf}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email-cadastro" className="text-sm font-bold text-slate-800">
                E-mail <span className="text-rose-600">*</span>
              </label>
              <input
                id="email-cadastro"
                type="email"
                value={form.usuario}
                onChange={(event) => updateField('usuario', event.target.value)}
                aria-invalid={Boolean(errors.usuario)}
                aria-describedby={errors.usuario ? 'email-cadastro-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                autoComplete="email"
              />
              {errors.usuario && (
                <p id="email-cadastro-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.usuario}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <PhotoPicker
                id="foto"
                label="Foto de perfil"
                value={form.foto}
                onChange={(value) => updateField('foto', value)}
                onError={(message) => toast.error(message)}
              />
            </div>

            <div>
              <label htmlFor="senha-cadastro" className="text-sm font-bold text-slate-800">
                Senha <span className="text-rose-600">*</span>
              </label>
              <div className="mt-2 flex rounded-lg border border-slate-300 focus-within:border-ekoa-purple-600 focus-within:ring-4 focus-within:ring-ekoa-purple-100">
                <input
                  id="senha-cadastro"
                  type={showPassword ? 'text' : 'password'}
                  value={form.senha}
                  onChange={(event) => updateField('senha', event.target.value)}
                  aria-invalid={Boolean(errors.senha)}
                  aria-describedby={errors.senha ? 'senha-cadastro-error' : undefined}
                  className="min-w-0 flex-1 rounded-l-lg px-4 py-3 outline-none"
                  autoComplete="new-password"
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
                <p id="senha-cadastro-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.senha}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmar-senha" className="text-sm font-bold text-slate-800">
                Confirmar senha <span className="text-rose-600">*</span>
              </label>
              <input
                id="confirmar-senha"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmarSenha}
                onChange={(event) => updateField('confirmarSenha', event.target.value)}
                aria-invalid={Boolean(errors.confirmarSenha)}
                aria-describedby={errors.confirmarSenha ? 'confirmar-senha-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                autoComplete="new-password"
              />
              {errors.confirmarSenha && (
                <p id="confirmar-senha-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.confirmarSenha}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ekoa-purple-600 px-5 py-3 text-base font-bold text-white transition hover:bg-ekoa-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-purple-600 disabled:opacity-70"
          >
            <UserPlus size={20} aria-hidden="true" />
            {loading ? 'Cadastrando...' : isAuthenticated ? 'Cadastrar usuário' : 'Criar conta'}
          </button>

          {!isAuthenticated && (
            <p className="mt-5 text-center text-sm text-slate-600">
              Já tem conta?{' '}
              <NavLink to="/login" className="font-bold text-ekoa-purple-700 hover:text-ekoa-navy">
                Entrar
              </NavLink>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
