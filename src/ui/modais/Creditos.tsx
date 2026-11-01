import type { ReactNode } from 'react';
import { bodies, creditos } from '@/data';
import type { Fonte } from '@/data/types';
import { useInterface } from '@/state/interface';
import { formatarData } from '../formatacao';
import { Modal } from './Modal';

const TIPOGRAFIA = [
  {
    recurso: 'Bricolage Grotesque',
    autor: 'Mathieu Triay',
    licenca: 'SIL Open Font License 1.1',
    url: 'https://github.com/ateliertriay/bricolage',
  },
  {
    recurso: 'JetBrains Mono',
    autor: 'JetBrains',
    licenca: 'SIL Open Font License 1.1',
    url: 'https://github.com/JetBrains/JetBrainsMono',
  },
];

/** Fontes de todos os astros, sem repetição (por URL), com os astros que as citam. */
function fontesDosDados(): { fonte: Fonte; astros: string[] }[] {
  const porUrl = new Map<string, { fonte: Fonte; astros: string[] }>();
  for (const corpo of bodies) {
    for (const fonte of corpo.fontes) {
      const item = porUrl.get(fonte.url) ?? { fonte, astros: [] };
      item.astros.push(corpo.nome);
      porUrl.set(fonte.url, item);
    }
  }
  return [...porUrl.values()].sort((a, b) => a.fonte.titulo.localeCompare(b.fonte.titulo, 'pt-BR'));
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

export default function Creditos() {
  const fecharModal = useInterface((s) => s.fecharModal);
  const fontes = fontesDosDados();

  return (
    <Modal titulo="Créditos e fontes" aoFechar={fecharModal}>
      <section className="modal__secao" aria-labelledby="creditos-recursos">
        <h3 id="creditos-recursos" className="modal__subtitulo">
          Texturas e imagens
        </h3>
        {creditos.length ? (
          <ul className="creditos">
            {creditos.map((c) => (
              <li key={`${c.recurso}-${c.url}`}>
                <Link href={c.url}>{c.recurso}</Link>
                <span className="creditos__meta">
                  {c.autor} · {c.licenca}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="modal__intro">Nenhum recurso de terceiros registrado.</p>
        )}
      </section>

      <section className="modal__secao" aria-labelledby="creditos-dados">
        <h3 id="creditos-dados" className="modal__subtitulo">
          Fontes dos dados
        </h3>
        <ul className="creditos">
          {fontes.map(({ fonte, astros }) => (
            <li key={fonte.url}>
              <Link href={fonte.url}>{fonte.titulo}</Link>
              <span className="creditos__meta">
                Acesso em {formatarData(fonte.acessadoEm)} · {astros.join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="modal__secao" aria-labelledby="creditos-tipografia">
        <h3 id="creditos-tipografia" className="modal__subtitulo">
          Tipografia
        </h3>
        <ul className="creditos">
          {TIPOGRAFIA.map((t) => (
            <li key={t.recurso}>
              <Link href={t.url}>{t.recurso}</Link>
              <span className="creditos__meta">
                {t.autor} · {t.licenca}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Modal>
  );
}
