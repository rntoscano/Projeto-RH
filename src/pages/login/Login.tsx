import { Eye, EyeSlash, SignIn } from '@phosphor-icons/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';

interface LoginErrors {
  usuario?: string;
  senha?: string;
}

function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const nextErrors: LoginErrors = {};

    if (!usuario.trim()) {
      nextErrors.usuario = 'Informe o e-mail de acesso.';
    }

    if (!senha.trim()) {
      nextErrors.senha = 'Informe sua senha.';
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
      await login({ usuario: usuario.trim(), senha });
      toast.success('Login realizado com sucesso.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ekoa-paper px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Acesso seguro</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ekoa-navy sm:text-5xl">
            Entre para cuidar de pessoas com dados organizados.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Use seu e-mail e senha cadastrados. O token da sessão é armazenado apenas para manter o acesso às áreas
            protegidas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-5">
            <div>
              <label htmlFor="usuario" className="text-sm font-bold text-slate-800">
                E-mail <span className="text-rose-600">*</span>
              </label>
              <input
                id="usuario"
                type="email"
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                aria-invalid={Boolean(errors.usuario)}
                aria-describedby={errors.usuario ? 'usuario-error' : undefined}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-ekoa-navy outline-none transition focus:border-ekoa-purple-600 focus:ring-4 focus:ring-ekoa-purple-100"
                placeholder="voce@email.com"
                autoComplete="email"
              />
              {errors.usuario && (
                <p id="usuario-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.usuario}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="senha" className="text-sm font-bold text-slate-800">
                Senha <span className="text-rose-600">*</span>
              </label>
              <div className="mt-2 flex rounded-lg border border-slate-300 focus-within:border-ekoa-purple-600 focus-within:ring-4 focus-within:ring-ekoa-purple-100">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  aria-invalid={Boolean(errors.senha)}
                  aria-describedby={errors.senha ? 'senha-error' : undefined}
                  className="min-w-0 flex-1 rounded-l-lg px-4 py-3 text-ekoa-navy outline-none"
                  placeholder="Sua senha"
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
                <p id="senha-error" className="mt-2 text-sm font-medium text-rose-600">
                  {errors.senha}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ekoa-purple-600 px-5 py-3 text-base font-bold text-white transition hover:bg-ekoa-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-purple-600 disabled:opacity-70"
          >
            <SignIn size={20} aria-hidden="true" />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Ainda não tem conta?{' '}
            <NavLink to="/cadastro" className="font-bold text-ekoa-purple-700 hover:text-ekoa-navy">
              Cadastre-se
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
