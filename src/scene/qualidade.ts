import type { Qualidade } from '@/state/store';

export interface PerfilQualidade {
  dprMaximo: number;
  asteroides: number;
  kuiper: number;
  estrelas: number;
  segmentosEsfera: number;
  sombraAneis: boolean;
  bloom: boolean;
  multisampling: number;
  anisotropia: number;
  /** Carrega a textura em alta resolução ao selecionar. */
  texturaAlta: boolean;
  viaLactea: boolean;
}

export const PERFIS: Record<Qualidade, PerfilQualidade> = {
  alta: {
    dprMaximo: 2,
    asteroides: 2600,
    kuiper: 3200,
    estrelas: 7000,
    segmentosEsfera: 96,
    sombraAneis: true,
    bloom: true,
    multisampling: 4,
    anisotropia: 8,
    texturaAlta: true,
    viaLactea: true,
  },
  media: {
    dprMaximo: 1.5,
    asteroides: 1400,
    kuiper: 1700,
    estrelas: 4500,
    segmentosEsfera: 64,
    sombraAneis: false,
    bloom: true,
    multisampling: 0,
    anisotropia: 4,
    texturaAlta: true,
    viaLactea: true,
  },
  baixa: {
    dprMaximo: 1,
    asteroides: 600,
    kuiper: 700,
    estrelas: 2500,
    segmentosEsfera: 40,
    sombraAneis: false,
    bloom: false,
    multisampling: 0,
    anisotropia: 1,
    texturaAlta: false,
    viaLactea: false,
  },
};

export const ORDEM_QUALIDADE: readonly Qualidade[] = ['baixa', 'media', 'alta'];

export function qualidadeAbaixo(q: Qualidade): Qualidade {
  return ORDEM_QUALIDADE[Math.max(0, ORDEM_QUALIDADE.indexOf(q) - 1)];
}

export function qualidadeAcima(q: Qualidade): Qualidade {
  return ORDEM_QUALIDADE[Math.min(ORDEM_QUALIDADE.length - 1, ORDEM_QUALIDADE.indexOf(q) + 1)];
}

/** Ponto de partida antes de medir: celular e telas pequenas começam em 'media'. */
export function qualidadeInicial(): Qualidade {
  try {
    const grosso = window.matchMedia('(pointer: coarse)').matches;
    const pequena = Math.min(window.innerWidth, window.innerHeight) < 768;
    return grosso || pequena ? 'media' : 'alta';
  } catch {
    return 'alta';
  }
}
