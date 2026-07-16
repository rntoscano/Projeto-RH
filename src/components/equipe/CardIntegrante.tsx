import { GithubLogo, LinkedinLogo } from '@phosphor-icons/react';

const FALLBACK_IMAGE = '/images/integrante-placeholder.svg';

export interface Integrante {
  nome: string;
  foto: string;
  linkedin: string;
  github: string;
  observacaoFoto?: string;
}

interface CardIntegranteProps {
  integrante: Integrante;
}

function CardIntegrante({ integrante }: CardIntegranteProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-ekoa-purple-200 hover:shadow-xl hover:shadow-ekoa-purple-100">
      <div className="flex justify-center px-4 pt-4">
        <img
          src={integrante.foto || FALLBACK_IMAGE}
          alt={`Foto de ${integrante.nome}`}
          className="h-64 w-auto max-w-full rounded-lg object-cover shadow-sm transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-black text-ekoa-navy">{integrante.nome}</h3>
        {integrante.observacaoFoto && <p className="mt-2 text-sm leading-6 text-slate-500">{integrante.observacaoFoto}</p>}

        <div className="mt-5 flex items-center gap-3">
          <a
            href={integrante.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir LinkedIn de ${integrante.nome}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-ekoa-purple-50 text-ekoa-purple-700 transition hover:bg-ekoa-purple-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-purple-600"
          >
            <LinkedinLogo size={24} weight="fill" aria-hidden="true" />
          </a>
          <a
            href={integrante.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir GitHub de ${integrante.nome}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-ekoa-blue-50 text-ekoa-navy transition hover:bg-ekoa-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-navy"
          >
            <GithubLogo size={24} weight="fill" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default CardIntegrante;
