import CardIntegrante from './CardIntegrante';
import type { Integrante } from './CardIntegrante';

const linkedinProfile = (slug: string) => `https://br.linkedin.com/in/${slug}`;

const integrantes: Integrante[] = [
  {
    nome: 'Danielle Caricati',
    foto: '/images/equipe/danielle-caricati.jpg',
    linkedin: linkedinProfile('daniellecaricati'),
    github: 'https://github.com/daniellecaricati',
  },
  {
    nome: 'Felipe Marques',
    foto: '/images/equipe/felipe-marques.jpg',
    linkedin: linkedinProfile('felipemarquesdebrito'),
    github: 'https://github.com/Felipe-MDB',
  },
  {
    nome: 'Kauã Alves Cazemiro',
    foto: '/images/equipe/kaua-alves-cazemiro.jpg',
    linkedin: linkedinProfile('kauaalvesti'),
    github: 'https://github.com/kauaalves7163-collab',
  },
  {
    nome: 'Paulo Gustavo Brito',
    foto: '/images/equipe/paulo-gustavo-brito.jpg',
    linkedin: linkedinProfile('paulogsbrito'),
    github: 'https://github.com/Paulogsbrito',
  },
  {
    nome: 'Riane Toscano',
    foto: '/images/equipe/riane-toscano.jpg',
    linkedin: linkedinProfile('rianetoscano'),
    github: 'https://github.com/rntoscano',
  },
  {
    nome: 'Talita Oliveira Santos',
    foto: '/images/equipe/talita-oliveira-santos.jpg',
    linkedin: linkedinProfile('talitasantosdev'),
    github: 'https://github.com/talitatech',
  },
];

function ListaIntegrantes() {
  return (
    <section className="mt-16 rounded-[0.5rem] bg-white py-12 shadow-sm ring-1 ring-ekoa-purple-100">
      <div className="px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ekoa-magenta-600">Equipe</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-ekoa-navy sm:text-4xl">Conheça nossa equipe</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Pessoas diferentes constroem resultados extraordinários. Conheça quem ajudou a transformar a proposta do
            Projeto RH em uma experiência digital inclusiva, moderna e humana.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrantes.map((integrante) => (
            <CardIntegrante key={integrante.nome} integrante={integrante} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ListaIntegrantes;
