import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useInterface } from '@/state/interface';
import { useOrbita, VELOCIDADES } from '@/state/store';
import { ID_BOTAO_MAIS } from './atalhos';
import { formatarVelocidade } from './formatacao';
import { GrupoOpcoes } from './GrupoOpcoes';
import {
  IconeAlvo,
  IconeMais,
  IconeNomes,
  IconeOrbitas,
  IconePausa,
  IconePlay,
  IconeRotacao,
} from './icones';
import { useLayoutCompacto, usePainelLateral } from './midia';
import { useOcupacao } from './ocupacao';

const OPCOES_VELOCIDADE = VELOCIDADES.map((v) => ({
  valor: v,
  rotulo: formatarVelocidade(v),
  rotuloAcessivel: `${String(v).replace('.', ',')} vezes`,
}));

function useControles() {
  return useOrbita(
    useShallow((s) => ({
      foraDaVisaoGeral: s.selecionado !== null,
      simulacaoPausada: s.simulacaoPausada,
      velocidade: s.velocidade,
      rotacaoAstroPausada: s.rotacaoAstroPausada,
      mostrarOrbitas: s.mostrarOrbitas,
      mostrarNomes: s.mostrarNomes,
      resetarCamera: s.resetarCamera,
      alternarSimulacao: s.alternarSimulacao,
      setVelocidade: s.setVelocidade,
      alternarRotacaoAstro: s.alternarRotacaoAstro,
      alternarOrbitas: s.alternarOrbitas,
      alternarNomes: s.alternarNomes,
    })),
  );
}

function BotaoSimulacao({ c }: { c: ReturnType<typeof useControles> }) {
  return (
    <button
      type="button"
      className="controle"
      aria-pressed={c.simulacaoPausada}
      aria-label="Pausar simulação"
      data-dica={c.simulacaoPausada ? 'Retomar simulação · Espaço' : 'Pausar simulação · Espaço'}
      onClick={c.alternarSimulacao}
    >
      {c.simulacaoPausada ? <IconePlay /> : <IconePausa />}
    </button>
  );
}

function BotaoCamera({ c }: { c: ReturnType<typeof useControles> }) {
  return (
    <button
      type="button"
      className="controle"
      aria-label="Restaurar câmera"
      data-dica="Restaurar câmera · R"
      onClick={c.resetarCamera}
    >
      <IconeAlvo />
    </button>
  );
}

function BotaoRotacao({ c }: { c: ReturnType<typeof useControles> }) {
  return (
    <button
      type="button"
      className="controle"
      aria-pressed={c.rotacaoAstroPausada}
      aria-label="Pausar rotação do astro"
      data-dica={c.rotacaoAstroPausada ? 'Retomar rotação do astro' : 'Pausar rotação do astro'}
      onClick={c.alternarRotacaoAstro}
    >
      <IconeRotacao />
    </button>
  );
}

function BarraCompleta() {
  const c = useControles();
  return (
    <div className="controles" role="group" aria-label="Controles da cena">
      <div className="controles__grupo" role="group" aria-labelledby="controles-camera">
        <span id="controles-camera" className="controles__legenda">
          Câmera
        </span>
        <div className="controles__botoes">
          <BotaoCamera c={c} />
        </div>
      </div>
      {c.foraDaVisaoGeral && (
        <div className="controles__grupo" role="group" aria-labelledby="controles-astro">
          <span id="controles-astro" className="controles__legenda">
            Astro
          </span>
          <div className="controles__botoes">
            <BotaoRotacao c={c} />
          </div>
        </div>
      )}
      <div className="controles__grupo" role="group" aria-labelledby="controles-simulacao">
        <span id="controles-simulacao" className="controles__legenda">
          Simulação
        </span>
        <div className="controles__botoes">
          <BotaoSimulacao c={c} />
          <GrupoOpcoes
            rotulo="Velocidade da simulação"
            opcoes={OPCOES_VELOCIDADE}
            valor={c.velocidade}
            aoMudar={c.setVelocidade}
            className="segmentos controles__velocidade"
          />
          <span className="controles__divisor" aria-hidden="true" />
          <button
            type="button"
            className="controle"
            aria-pressed={c.mostrarOrbitas}
            aria-label="Mostrar órbitas"
            data-dica="Órbitas · O"
            onClick={c.alternarOrbitas}
          >
            <IconeOrbitas />
          </button>
          <button
            type="button"
            className="controle"
            aria-pressed={c.mostrarNomes}
            aria-label="Mostrar nomes"
            data-dica="Nomes · N"
            onClick={c.alternarNomes}
          >
            <IconeNomes />
          </button>
        </div>
      </div>
    </div>
  );
}

export function BarraCompacta() {
  const c = useControles();
  const maisAberto = useInterface((s) => s.maisAberto);
  const setMaisAberto = useInterface((s) => s.setMaisAberto);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!maisAberto) return;
    const aoTocarFora = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMaisAberto(false);
    };
    document.addEventListener('pointerdown', aoTocarFora);
    return () => document.removeEventListener('pointerdown', aoTocarFora);
  }, [maisAberto, setMaisAberto]);

  return (
    <div
      ref={ref}
      className="controles controles--compacta"
      role="group"
      aria-label="Controles da cena"
    >
      <div className="controles__botoes">
        <BotaoSimulacao c={c} />
        <BotaoCamera c={c} />
        {c.foraDaVisaoGeral && <BotaoRotacao c={c} />}
        <button
          id={ID_BOTAO_MAIS}
          type="button"
          className="controle"
          aria-label="Mais controles"
          aria-expanded={maisAberto}
          aria-controls="controles-mais"
          onClick={() => setMaisAberto(!maisAberto)}
        >
          <IconeMais />
        </button>
      </div>
      {maisAberto && (
        <div
          id="controles-mais"
          className="controles__mais"
          role="group"
          aria-label="Mais controles"
        >
          <span className="controles__legenda">Velocidade</span>
          <GrupoOpcoes
            rotulo="Velocidade da simulação"
            opcoes={OPCOES_VELOCIDADE}
            valor={c.velocidade}
            aoMudar={c.setVelocidade}
            className="segmentos controles__velocidade"
          />
          <span className="controles__legenda">Exibir</span>
          <div className="controles__linha">
            <button
              type="button"
              className="botao controles__alternar"
              aria-pressed={c.mostrarOrbitas}
              onClick={c.alternarOrbitas}
            >
              <IconeOrbitas />
              Órbitas
            </button>
            <button
              type="button"
              className="botao controles__alternar"
              aria-pressed={c.mostrarNomes}
              onClick={c.alternarNomes}
            >
              <IconeNomes />
              Nomes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NotaEscala({ className = 'rodape__nota' }: { className?: string }) {
  const abrirModal = useInterface((s) => s.abrirModal);
  return (
    <p className={className}>
      <span>Escala e posições ilustrativas — não é uma simulação astronômica em tempo real.</span>
      <button
        type="button"
        className="rodape__creditos"
        aria-haspopup="dialog"
        onClick={() => abrirModal('creditos')}
      >
        Créditos
      </button>
    </p>
  );
}

export function Rodape() {
  const compacto = useLayoutCompacto();
  const lateral = usePainelLateral();
  const sheetExpandido = useInterface((s) => s.sheet === 'expandido');
  const comSheet = useOrbita((s) => s.selecionado !== null) && !lateral;
  const noSheet = comSheet && compacto;
  const oculto = comSheet && sheetExpandido;
  const ref = useRef<HTMLElement>(null);
  useOcupacao(ref, 'bottom', !oculto && !noSheet);

  if (noSheet) return null;

  return (
    <footer ref={ref} className={`rodape${oculto ? ' rodape--oculto' : ''}`} inert={oculto}>
      {compacto ? <BarraCompacta /> : <BarraCompleta />}
      <NotaEscala />
    </footer>
  );
}
