import { Buildings, IdentificationCard, UserCircleGear } from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';

function Produto() {
  return (
    <div className="bg-ekoa-paper py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Plataforma</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-ekoa-navy sm:text-5xl">
              Mais inclusão. Mais inovação. Mais possibilidades.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              A Ekoa reúne em um só lugar as informações essenciais de pessoas, equipes e áreas da empresa, facilitando
              uma gestão de RH mais simples, organizada e inclusiva.
            </p>
            <NavLink
              to="/cadastro"
              className="mt-8 inline-flex rounded-lg bg-ekoa-purple-600 px-6 py-3 text-base font-bold text-white shadow-sm shadow-ekoa-purple-200 transition hover:bg-ekoa-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-purple-600"
            >
              Criar conta
            </NavLink>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                icon: UserCircleGear,
                title: 'Usuários',
                text: 'Crie acessos, atualize perfis e mantenha as informações de cada pessoa sempre fáceis de encontrar.',
              },
              {
                icon: Buildings,
                title: 'Departamentos',
                text: 'Organize as áreas da empresa para conectar pessoas, responsabilidades e rotinas de trabalho.',
              },
              {
                icon: IdentificationCard,
                title: 'Funcionários',
                text: 'Acompanhe dados profissionais, cargos e vínculos com clareza para apoiar decisões mais humanas.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ekoa-gold-50 text-ekoa-blue-600">
                  <item.icon size={26} aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-ekoa-navy">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Produto;
