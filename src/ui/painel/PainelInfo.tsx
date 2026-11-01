import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { getBody } from '@/data';
import type { CelestialBody } from '@/data/types';
import { useInterface, type EstadoSheet } from '@/state/interface';
import { useOrbita } from '@/state/store';
import { IconeFechar } from '../icones';
import { useLayoutCompacto, usePainelLateral } from '../midia';
import { useOcupacao } from '../ocupacao';
import { BarraCompacta, NotaEscala } from '../Rodape';
import { ConteudoAstro } from './ConteudoAstro';
import './Painel.css';

export function PainelInfo() {
  const selecionado = useOrbita((s) => s.selecionado);
  const lateral = usePainelLateral();
  const corpo = selecionado ? getBody(selecionado) : undefined;
  if (!corpo) return null;
  return lateral ? <PainelLateral corpo={corpo} /> : <BottomSheet corpo={corpo} />;
}

function PainelLateral({ corpo }: { corpo: CelestialBody }) {
  const ref = useRef<HTMLElement>(null);
  const idTitulo = useId();
  useOcupacao(ref, 'right');

  return (
    <section ref={ref} className="painel-lateral" aria-labelledby={idTitulo}>
      {/* key: troca de astro reinicia rolagem e animação de entrada */}
      <div key={corpo.id} className="painel-lateral__rolagem">
        <ConteudoAstro corpo={corpo} idTitulo={idTitulo} />
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ Bottom sheet

/** Recolhido mostra só tipo + nome; no celular soma a linha de controles e a nota de escala. */
const ALTURA_RECOLHIDO = 116;
const ALTURA_RECOLHIDO_COMPACTO = 184;
const ESTADOS: readonly EstadoSheet[] = ['recolhido', 'meio', 'expandido'];

function alturasDoSheet(
  alturaJanela: number,
  topo: number,
  recolhido: number,
): Record<EstadoSheet, number> {
  const expandido = Math.max(alturaJanela - topo - 8, recolhido + 160);
  return {
    recolhido,
    meio: Math.min(Math.max(Math.round(alturaJanela * 0.44), recolhido + 80), expandido),
    expandido,
  };
}

function useAlturaJanela(): number {
  return useSyncExternalStore(
    (avisar) => {
      window.addEventListener('resize', avisar);
      return () => window.removeEventListener('resize', avisar);
    },
    () => window.innerHeight,
    () => 800,
  );
}

interface Gesto {
  y0: number;
  altura0: number;
  yAnterior: number;
  tAnterior: number;
  velocidade: number; // px/ms, positivo = para baixo
  arrastou: boolean;
}

/**
 * Bottom sheet com três estados (recolhido mostra o nome; meio; expandido).
 * A alça é um botão grande: arrastar ajusta a altura, soltar encaixa no estado mais próximo
 * (considerando a velocidade), arrastar para baixo além do recolhido fecha (volta um nível).
 * Clique/Enter alterna os estados; ↑/↓ sobem e descem um estado.
 */
function BottomSheet({ corpo }: { corpo: CelestialBody }) {
  const estado = useInterface((s) => s.sheet);
  const setSheet = useInterface((s) => s.setSheet);
  const voltar = useOrbita((s) => s.voltar);
  const topo = useOrbita((s) => s.ocupacaoInterface.top);
  const alturaJanela = useAlturaJanela();
  const compacto = useLayoutCompacto();
  const ref = useRef<HTMLElement>(null);
  const gesto = useRef<Gesto | null>(null);
  const ignorarClique = useRef(false);
  const [arrasto, setArrasto] = useState<number | null>(null);
  const idTitulo = useId();
  const idConteudo = useId();

  const alturaRecolhido = compacto ? ALTURA_RECOLHIDO_COMPACTO : ALTURA_RECOLHIDO;
  const alturas = alturasDoSheet(alturaJanela, topo, alturaRecolhido);
  const altura = arrasto ?? alturas[estado];

  useOcupacao(ref, 'bottom');

  // Cada nova abertura (vinda da visão geral) começa no meio.
  useEffect(() => {
    setSheet('meio');
  }, [setSheet]);

  // A barra de controles flutua logo acima do sheet.
  useEffect(() => {
    const estilo = document.documentElement.style;
    estilo.setProperty('--altura-sheet', `${altura}px`);
    return () => estilo.setProperty('--altura-sheet', '0px');
  }, [altura]);

  const limitar = (h: number) => Math.min(Math.max(h, 48), alturas.expandido);

  const aoPressionar = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gesto.current = {
      y0: e.clientY,
      altura0: altura,
      yAnterior: e.clientY,
      tAnterior: e.timeStamp,
      velocidade: 0,
      arrastou: false,
    };
  };

  const aoMover = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesto.current;
    if (!g) return;
    const dy = e.clientY - g.y0;
    if (!g.arrastou && Math.abs(dy) < 6) return;
    g.arrastou = true;
    const dt = e.timeStamp - g.tAnterior;
    if (dt > 0) g.velocidade = (e.clientY - g.yAnterior) / dt;
    g.yAnterior = e.clientY;
    g.tAnterior = e.timeStamp;
    setArrasto(limitar(g.altura0 - dy));
  };

  const aoSoltar = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesto.current;
    gesto.current = null;
    if (!g?.arrastou) return;
    ignorarClique.current = true;
    const final = limitar(g.altura0 - (e.clientY - g.y0));
    setArrasto(null);

    const fechou = final < alturaRecolhido - 36 || (estado === 'recolhido' && g.velocidade > 0.8);
    if (fechou) {
      voltar();
      return;
    }
    // Projeta a posição pela velocidade para um "arremesso" pular de estado.
    const projetada = final - g.velocidade * 180;
    const alvo = ESTADOS.reduce((melhor, s) =>
      Math.abs(alturas[s] - projetada) < Math.abs(alturas[melhor] - projetada) ? s : melhor,
    );
    setSheet(alvo);
  };

  const aoCancelar = () => {
    gesto.current = null;
    setArrasto(null);
  };

  const alternar = () => {
    if (ignorarClique.current) {
      ignorarClique.current = false;
      return;
    }
    setSheet(estado === 'recolhido' ? 'meio' : estado === 'meio' ? 'expandido' : 'recolhido');
  };

  const aoTeclar = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = ESTADOS.indexOf(estado);
    if (e.key === 'ArrowUp' && i < ESTADOS.length - 1) setSheet(ESTADOS[i + 1]);
    else if (e.key === 'ArrowDown' && i > 0) setSheet(ESTADOS[i - 1]);
    else return;
    e.preventDefault();
  };

  return (
    <section
      ref={ref}
      className={`sheet${arrasto !== null ? ' sheet--arrastando' : ''}`}
      data-estado={estado}
      aria-labelledby={idTitulo}
      style={{ height: `calc(${altura}px + var(--seguro-base))` }}
    >
      <div className={`sheet__topo${compacto ? ' sheet__topo--controles' : ''}`}>
        {compacto && <BarraCompacta />}
        <button
          type="button"
          className="sheet__alca"
          aria-label={estado === 'expandido' ? 'Recolher painel' : 'Expandir painel'}
          aria-expanded={estado !== 'recolhido'}
          aria-controls={idConteudo}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoCancelar}
          onClick={alternar}
          onKeyDown={aoTeclar}
        >
          <span className="sheet__alca-barra" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="botao botao--icone botao--sem-borda sheet__fechar"
          aria-label="Fechar painel"
          onClick={voltar}
        >
          <IconeFechar />
        </button>
      </div>
      {compacto && <NotaEscala className="rodape__nota sheet__nota" />}
      <div key={corpo.id} id={idConteudo} className="sheet__conteudo">
        <ConteudoAstro corpo={corpo} idTitulo={idTitulo} />
      </div>
    </section>
  );
}
