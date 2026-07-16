import { ArrowRight, ChartLineUp, ShieldCheck, UsersThree } from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';

function Home() {
  return (
    <div>
      <section className="relative isolate flex min-h-[calc(100vh-4.25rem)] items-center overflow-hidden">
        <img
          src="/images/foto-capa.png?v=20260716"
          alt="Equipe diversa em ambiente profissional representando a plataforma Ekoa"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.55)]">
            <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-ekoa-gold-100 ring-1 ring-white/25">
              Aqui, cada pessoa importa.
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Talentos diversos transformam o futuro.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
              Uma plataforma de Recursos Humanos criada para conectar pessoas, valorizar diferenças e construir ambientes
              de trabalho mais justos, humanos e inovadores.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <NavLink
                to="/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ekoa-gold-500 px-6 py-3 text-base font-bold text-ekoa-navy shadow-lg shadow-ekoa-gold-950/20 transition hover:bg-ekoa-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-gold-200"
              >
                Faça parte dessa transformação
                <ArrowRight size={20} aria-hidden="true" />
              </NavLink>
              <NavLink
                to="/produto"
                className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-base font-bold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Conheça nossa plataforma
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ekoa-paper py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: UsersThree,
              title: 'Pessoas no centro',
              text: 'Cadastre, acompanhe e organize informações de usuários e equipes com clareza.',
            },
            {
              icon: ShieldCheck,
              title: 'Dados com cuidado',
              text: 'Autenticação por token, rotas protegidas e tratamento de sessão expirada.',
            },
            {
              icon: ChartLineUp,
              title: 'Gestão integrada',
              text: 'Departamentos e funcionários conectados em uma experiência simples de navegar.',
            },
          ].map((item) => (
            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ekoa-purple-50 text-ekoa-purple-600">
                <item.icon size={26} aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-ekoa-navy">{item.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
