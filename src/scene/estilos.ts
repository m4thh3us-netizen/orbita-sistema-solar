/**
 * Aparência de cada astro na cena: qual material usar e os parâmetros do relevo
 * procedural. O procedural é o que aparece quando a textura não existe ou falha, e dá
 * a "variação leve" sobre `corBase` pedida no contrato. Com textura, só `forma`,
 * `deformacao` e `rugosidade` continuam valendo.
 */
import type { CelestialBody } from '@/data/types';

export type TipoSuperficie = 'rochoso' | 'gasoso' | 'gelo' | 'vulcanico';

export interface Mancha {
  latGraus: number;
  lonGraus: number;
  larguraGraus: number;
  alturaGraus: number;
  cor: string;
}

export interface EstiloSuperficie {
  tipo: TipoSuperficie;
  /** Tom secundário: mares, faixas escuras, fissuras. */
  cor2?: string;
  contraste: number;
  mares?: number;
  calotas?: number;
  fissuras?: number;
  faixas?: number;
  turbulencia?: number;
  mancha?: Mancha;
  /** Relevo irregular (0 = esfera). Para luas pequenas como Fobos. */
  deformacao?: number;
  /** Escala por eixo (Haumea é um elipsoide). */
  forma?: [number, number, number];
  rugosidade?: number;
}

export type MaterialCena = 'padrao' | 'terra' | 'sol';

export interface AparenciaCena {
  material: MaterialCena;
  estilo: EstiloSuperficie;
}

const ESTILOS: Record<string, EstiloSuperficie> = {
  mercurio: { tipo: 'rochoso', contraste: 0.55, mares: 0.45, cor2: '#5b5650' },
  venus: { tipo: 'gasoso', contraste: 0.3, faixas: 3, turbulencia: 2.4, cor2: '#b8955c', rugosidade: 1 },
  marte: { tipo: 'rochoso', contraste: 0.45, mares: 0.65, calotas: 0.08, cor2: '#5c2a1d' },
  jupiter: {
    tipo: 'gasoso',
    contraste: 1,
    faixas: 15,
    turbulencia: 1.1,
    cor2: '#8c5d3f',
    rugosidade: 1,
    // Grande Mancha Vermelha: ~22° S, ~16 000 × 12 000 km.
    mancha: { latGraus: -22, lonGraus: 40, larguraGraus: 15, alturaGraus: 7, cor: '#b4583f' },
  },
  saturno: { tipo: 'gasoso', contraste: 0.5, faixas: 11, turbulencia: 0.5, cor2: '#b0925f', rugosidade: 1 },
  urano: { tipo: 'gasoso', contraste: 0.14, faixas: 4, turbulencia: 0.25, cor2: '#7fbcc6', rugosidade: 1 },
  netuno: {
    tipo: 'gasoso',
    contraste: 0.4,
    faixas: 6,
    turbulencia: 0.8,
    cor2: '#26409c',
    rugosidade: 1,
    mancha: { latGraus: -20, lonGraus: -60, larguraGraus: 14, alturaGraus: 8, cor: '#1a2766' },
  },
  ceres: { tipo: 'rochoso', contraste: 0.4, cor2: '#5e5a55' },
  plutao: { tipo: 'rochoso', contraste: 0.5, mares: 0.7, cor2: '#f1e5d6' },
  haumea: { tipo: 'gelo', contraste: 0.2, forma: [1.35, 0.68, 1.07] },
  makemake: { tipo: 'rochoso', contraste: 0.3, mares: 0.3, cor2: '#8c5a46' },
  eris: { tipo: 'gelo', contraste: 0.15 },
  lua: { tipo: 'rochoso', contraste: 0.45, mares: 0.75, cor2: '#454340' },
  fobos: { tipo: 'rochoso', contraste: 0.5, deformacao: 0.28 },
  deimos: { tipo: 'rochoso', contraste: 0.4, deformacao: 0.22 },
  io: { tipo: 'vulcanico', contraste: 0.6, cor2: '#efe27a' },
  europa: { tipo: 'gelo', contraste: 0.25, fissuras: 1, cor2: '#8a5a3a' },
  ganimedes: { tipo: 'rochoso', contraste: 0.35, mares: 0.55, cor2: '#5a524a' },
  calisto: { tipo: 'rochoso', contraste: 0.6, cor2: '#3f3a34' },
  tita: { tipo: 'gasoso', contraste: 0.12, faixas: 2, turbulencia: 0.4, cor2: '#b9802e', rugosidade: 1 },
  encelado: { tipo: 'gelo', contraste: 0.15, fissuras: 0.7, cor2: '#9cc9dd' },
  titania: { tipo: 'rochoso', contraste: 0.4, cor2: '#76706a' },
  oberon: { tipo: 'rochoso', contraste: 0.45, mares: 0.3, cor2: '#5f554c' },
  tritao: { tipo: 'gelo', contraste: 0.3, fissuras: 0.35, cor2: '#d29e90' },
  caronte: { tipo: 'rochoso', contraste: 0.3, mares: 0.45, cor2: '#5e4a40' },
};

function estiloPadrao(corpo: CelestialBody): EstiloSuperficie {
  if (corpo.tipo === 'planeta' && corpo.fisico.raioMedioKm > 20_000) {
    return { tipo: 'gasoso', contraste: 0.35, faixas: 8, turbulencia: 0.6, rugosidade: 1 };
  }
  return { tipo: 'rochoso', contraste: 0.4, deformacao: corpo.fisico.raioMedioKm < 150 ? 0.25 : 0 };
}

export function aparenciaDe(corpo: CelestialBody): AparenciaCena {
  if (corpo.tipo === 'estrela') return { material: 'sol', estilo: { tipo: 'gasoso', contraste: 0 } };
  if (corpo.id === 'terra') return { material: 'terra', estilo: { tipo: 'rochoso', contraste: 0 } };
  return { material: 'padrao', estilo: ESTILOS[corpo.id] ?? estiloPadrao(corpo) };
}
