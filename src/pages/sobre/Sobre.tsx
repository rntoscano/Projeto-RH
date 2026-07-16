import { HandHeart, LockKey, UsersFour } from '@phosphor-icons/react';
import ListaIntegrantes from '../../components/equipe/ListaIntegrantes';

function Sobre() {
  return (
    <div className="bg-ekoa-paper py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-purple-600">Sobre nós</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ekoa-navy sm:text-5xl">
            Diversidade não é apenas presença. É participação, respeito e oportunidade.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            O Ekoa apoia empresas e pessoas na construção de processos mais humanos. A plataforma organiza dados
            essenciais de usuários, funcionários e departamentos para que a gestão de talentos seja mais clara, segura e
            inclusiva.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: UsersFour,
              title: 'Representatividade com responsabilidade',
              text: 'A comunicação valoriza diferentes trajetórias sem expor informações sensíveis em áreas públicas.',
            },
            {
              icon: HandHeart,
              title: 'Acolhimento na experiência',
              text: 'Textos, formulários e estados de interface foram pensados para orientar sem constranger.',
            },
            {
              icon: LockKey,
              title: 'Privacidade por padrão',
              text: 'Senhas não são armazenadas, tokens não aparecem na tela e rotas internas exigem autenticação.',
            },
          ].map((item) => (
            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ekoa-magenta-50 text-ekoa-magenta-600">
                <item.icon size={26} aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-ekoa-navy">{item.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>

        <ListaIntegrantes />
      </div>
    </div>
  );
}

export default Sobre;
