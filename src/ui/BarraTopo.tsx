import { useRef } from 'react';
import { getAncestors, getBody } from '@/data';
import { useInterface } from '@/state/interface';
import { useOrbita } from '@/state/store';
import { rotaParaHash } from '@/state/url';
import { ID_BOTAO_CATALOGO } from './atalhos';
import { focarConteudo } from './foco';
import { IconeAjuda, IconeCatalogo, IconeSeta } from './icones';
import { useOcupacao } from './ocupacao';

export function Marca() {
  return (
    <a href="#/" className="marca">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" focusable="false">
        <ellipse
          cx="16"
          cy="16"
          rx="13"
          ry="5.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".5"
          transform="rotate(-24 16 16)"
        />
        <circle cx="16" cy="16" r="4.5" fill="var(--cor-acento)" />
        <circle cx="27" cy="11" r="1.8" fill="currentColor" />
      </svg>
      <span>Órbita</span>
      <span className="sr-only"> — ir para a visão geral</span>
    </a>
  );
}

export function Trilha() {
  const selecionado = useOrbita((s) => s.selecionado);
  const modo = useOrbita((s) => s.modo);
  const corpo = selecionado ? getBody(selecionado) : undefined;

  const itens = [{ rotulo: 'Sistema Solar', href: '#/' }];
  if (corpo) {
    for (const ancestral of getAncestors(corpo.id)) {
      if (ancestral.pai === null) continue;
      itens.push({
        rotulo: ancestral.nome,
        href: rotaParaHash({ selecionado: ancestral.id, modo: 'astro' }),
      });
    }
    itens.push({
      rotulo: corpo.nome,
      href: rotaParaHash({ selecionado: corpo.id, modo: 'astro' }),
    });
    if (modo === 'luas') {
      itens.push({ rotulo: 'Luas', href: rotaParaHash({ selecionado: corpo.id, modo: 'luas' }) });
    }
  }

  return (
    <nav aria-label="Você está em" className="trilha">
      <ol role="list">
        {itens.map((item, i) => (
          <li key={item.href}>
            <a href={item.href} aria-current={i === itens.length - 1 ? 'page' : undefined}>
              {item.rotulo}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function BarraTopo() {
  const foraDaVisaoGeral = useOrbita((s) => s.selecionado !== null);
  const irParaVisaoGeral = useOrbita((s) => s.irParaVisaoGeral);
  const catalogoAberto = useInterface((s) => s.catalogoAberto);
  const alternarCatalogo = useInterface((s) => s.alternarCatalogo);
  const abrirModal = useInterface((s) => s.abrirModal);
  const ref = useRef<HTMLElement>(null);
  useOcupacao(ref, 'top');

  return (
    <header ref={ref} className="topo">
      <h1 className="sr-only">Órbita — explorador 3D do Sistema Solar</h1>
      <div className="topo__esquerda">
        <div className="topo__linha">
          <Marca />
          <Trilha />
        </div>
        {foraDaVisaoGeral && (
          <button
            type="button"
            className="botao-texto topo__voltar"
            onClick={() => {
              irParaVisaoGeral();
              focarConteudo();
            }}
          >
            <IconeSeta />
            Voltar ao Sistema Solar
          </button>
        )}
      </div>
      <div className="topo__direita">
        <button
          id={ID_BOTAO_CATALOGO}
          type="button"
          className="botao topo__catalogo"
          aria-expanded={catalogoAberto}
          aria-controls="catalogo"
          data-dica="Catálogo · /"
          data-dica-lado="baixo"
          onClick={alternarCatalogo}
        >
          <IconeCatalogo />
          <span className="topo__rotulo">Catálogo</span>
        </button>
        <button
          type="button"
          className="botao botao--icone"
          aria-label="Ajuda e atalhos"
          aria-haspopup="dialog"
          data-dica="Ajuda · ?"
          data-dica-lado="baixo-esquerda"
          onClick={() => abrirModal('ajuda')}
        >
          <IconeAjuda />
        </button>
      </div>
    </header>
  );
}
