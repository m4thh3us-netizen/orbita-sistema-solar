import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { getBody, getChildren } from '@/data';
import type { BodyId } from '@/data/types';
import { lerPreferencias } from './preferencias';

export type Modo = 'visao-geral' | 'astro' | 'luas';
export type Velocidade = 0.25 | 1 | 4 | 16;
export type Qualidade = 'alta' | 'media' | 'baixa';

export const VELOCIDADES: readonly Velocidade[] = [0.25, 1, 4, 16];

export interface OrbitaState {
  selecionado: BodyId | null;
  modo: Modo;
  hover: BodyId | null;
  transicaoEmCurso: boolean;
  simulacaoPausada: boolean;
  velocidade: Velocidade;
  rotacaoAstroPausada: boolean;
  mostrarOrbitas: boolean;
  mostrarNomes: boolean;
  movimentoReduzido: boolean;
  qualidade: Qualidade;
  ocupacaoInterface: { top: number; right: number; bottom: number; left: number };
  resetCameraToken: number;

  selecionar(id: BodyId): void;
  explorarLuas(): void;
  voltar(): void;
  irParaVisaoGeral(): void;
  setHover(id: BodyId | null): void;
  setTransicao(v: boolean): void;
  alternarSimulacao(): void;
  setVelocidade(v: Velocidade): void;
  alternarRotacaoAstro(): void;
  alternarOrbitas(): void;
  alternarNomes(): void;
  resetarCamera(): void;
  setOcupacaoInterface(o: OrbitaState['ocupacaoInterface']): void;
  setQualidade(q: Qualidade): void;
  setMovimentoReduzido(v: boolean): void;
}

export function podeSelecionar(id: BodyId): boolean {
  return getBody(id)?.exploravel3D === true;
}

export function temLuasExploraveis(id: BodyId): boolean {
  return getChildren(id, { exploravel3D: true }).length > 0;
}

function prefereMovimentoReduzido(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function criarEstadoInicial() {
  const preferencias = lerPreferencias();
  const movimentoReduzido = prefereMovimentoReduzido();
  return {
    selecionado: null,
    modo: 'visao-geral',
    hover: null,
    transicaoEmCurso: false,
    simulacaoPausada: false,
    velocidade: preferencias.velocidade ?? 1,
    rotacaoAstroPausada: movimentoReduzido,
    mostrarOrbitas: preferencias.mostrarOrbitas ?? true,
    mostrarNomes: preferencias.mostrarNomes ?? true,
    movimentoReduzido,
    qualidade: 'alta',
    ocupacaoInterface: { top: 0, right: 0, bottom: 0, left: 0 },
    resetCameraToken: 0,
  } satisfies Partial<OrbitaState>;
}

export const useOrbita: UseBoundStore<StoreApi<OrbitaState>> = create<OrbitaState>()(
  (set, get) => ({
    ...criarEstadoInicial(),

    selecionar(id) {
      if (!podeSelecionar(id)) return;
      set({ selecionado: id, modo: 'astro' });
    },

    explorarLuas() {
      const { selecionado } = get();
      if (!selecionado || !temLuasExploraveis(selecionado)) return;
      set({ modo: 'luas' });
    },

    voltar() {
      const { selecionado, modo } = get();
      if (!selecionado) return;
      if (modo === 'luas') {
        set({ modo: 'astro' });
        return;
      }
      const corpo = getBody(selecionado);
      if (corpo?.tipo === 'lua' && corpo.pai && podeSelecionar(corpo.pai)) {
        set({ selecionado: corpo.pai, modo: 'astro' });
        return;
      }
      set({ selecionado: null, modo: 'visao-geral' });
    },

    irParaVisaoGeral() {
      set({ selecionado: null, modo: 'visao-geral' });
    },

    setHover(id) {
      if (get().hover !== id) set({ hover: id });
    },

    setTransicao(v) {
      if (get().transicaoEmCurso !== v) set({ transicaoEmCurso: v });
    },

    alternarSimulacao() {
      set((s) => ({ simulacaoPausada: !s.simulacaoPausada }));
    },

    setVelocidade(v) {
      set({ velocidade: v });
    },

    alternarRotacaoAstro() {
      set((s) => ({ rotacaoAstroPausada: !s.rotacaoAstroPausada }));
    },

    alternarOrbitas() {
      set((s) => ({ mostrarOrbitas: !s.mostrarOrbitas }));
    },

    alternarNomes() {
      set((s) => ({ mostrarNomes: !s.mostrarNomes }));
    },

    resetarCamera() {
      set((s) => ({ resetCameraToken: s.resetCameraToken + 1 }));
    },

    setOcupacaoInterface(o) {
      const atual = get().ocupacaoInterface;
      if (
        atual.top === o.top &&
        atual.right === o.right &&
        atual.bottom === o.bottom &&
        atual.left === o.left
      ) {
        return;
      }
      set({ ocupacaoInterface: { ...o } });
    },

    setQualidade(q) {
      if (get().qualidade !== q) set({ qualidade: q });
    },

    setMovimentoReduzido(v) {
      if (get().movimentoReduzido !== v) set({ movimentoReduzido: v });
    },
  }),
);
