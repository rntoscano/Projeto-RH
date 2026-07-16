import { ArrowLeft } from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex min-h-[65vh] items-center bg-ekoa-paper px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Erro 404</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-ekoa-navy sm:text-5xl">
          Página não encontrada
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          O endereço acessado não existe ou foi movido. Volte para o início e continue navegando pela plataforma.
        </p>
        <NavLink
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-ekoa-purple-600 px-6 py-3 text-base font-bold text-white transition hover:bg-ekoa-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-purple-600"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          Voltar ao início
        </NavLink>
      </div>
    </div>
  );
}

export default NotFound;
