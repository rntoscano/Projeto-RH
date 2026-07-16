import { Heart } from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-ekoa-navy">
            Projeto Integrador RH
            <Heart size={16} weight="fill" className="text-ekoa-magenta-500" aria-hidden="true" />
            2026
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Tecnologia para conectar pessoas, cuidar de dados com responsabilidade e fortalecer ambientes de trabalho
            inclusivos.
          </p>
        </div>

        <nav className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600" aria-label="Links do rodapé">
          <NavLink to="/sobre" className="hover:text-ekoa-purple-700">
            Sobre
          </NavLink>
          <NavLink to="/produto" className="hover:text-ekoa-purple-700">
            Plataforma
          </NavLink>
          <NavLink to="/cadastro" className="hover:text-ekoa-purple-700">
            Criar conta
          </NavLink>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
