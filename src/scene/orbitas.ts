/**
 * Mecânica orbital simplificada (Kepler de dois corpos) em funções puras.
 * Os dados trazem semieixo, excentricidade, inclinação e período, mas não o nodo
 * ascendente, o argumento do periapse nem a fase inicial. A cena sorteia esses três
 * de forma determinística a partir do id, então cada astro tem sempre a mesma órbita.
 */
import type { BodyType, CelestialBody } from '@/data/types';
import { distanciaCena, sentidoOrbital, velocidadeAngular } from './escala';

const GRAUS = Math.PI / 180;
const DOIS_PI = Math.PI * 2;

export interface ElementosOrbitais {
  semiEixoKm: number;
  excentricidade: number;
  /** Rotações do plano orbital, aplicadas pelo grupo pai (Euler 'YXZ'). */
  inclinacaoRad: number;
  nodoRad: number;
  periapseRad: number;
  anomaliaMedia0: number;
  /** rad por segundo de cena, já com o sentido aplicado. */
  movimentoMedio: number;
  tipo: BodyType;
  raioPaiKm?: number;
}

export interface PontoOrbital {
  x: number;
  z: number;
  /** Ângulo polar no plano da órbita; luas síncronas giram exatamente isto. */
  angulo: number;
}

/** Hash FNV-1a de 32 bits; base dos parâmetros sorteados. */
export function hashTexto(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Gerador mulberry32: número em [0, 1) determinístico a partir da semente. */
export function aleatorio(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function elementosDe(corpo: CelestialBody, raioPaiKm?: number): ElementosOrbitais | null {
  const o = corpo.orbita;
  if (!o) return null;
  const sorteio = aleatorio(hashTexto(corpo.id));
  const sentido = sentidoOrbital(o.inclinacaoGraus, o.retrograda);
  return {
    semiEixoKm: o.semiEixoMaiorKm,
    excentricidade: Math.min(Math.max(o.excentricidade, 0), 0.95),
    inclinacaoRad: o.inclinacaoGraus * GRAUS,
    nodoRad: sorteio() * DOIS_PI,
    periapseRad: sorteio() * DOIS_PI,
    anomaliaMedia0: sorteio() * DOIS_PI,
    movimentoMedio: sentido * velocidadeAngular(o.periodoOrbitalDias),
    tipo: corpo.tipo,
    raioPaiKm,
  };
}

/**
 * Referencial das luas: o equador do planeta (luas regulares, anéis) ou, para luas
 * distantes (a > 40 raios do pai, caso da Lua), o plano da órbita do planeta — o plano
 * de Laplace delas fica perto da eclíptica, que é a referência usada nos dados.
 */
export function referencialEquatorial(lua: CelestialBody, pai: CelestialBody): boolean {
  if (!lua.orbita) return true;
  return lua.orbita.semiEixoMaiorKm / pai.fisico.raioMedioKm <= 40;
}

/** Resolve M = E − e·sen E por Newton-Raphson. */
export function anomaliaExcentrica(m: number, e: number): number {
  let E = e < 0.8 ? m : Math.PI;
  for (let i = 0; i < 8; i++) {
    const f = E - e * Math.sin(E) - m;
    const d = 1 - e * Math.cos(E);
    const passo = f / d;
    E -= passo;
    if (Math.abs(passo) < 1e-10) break;
  }
  return E;
}

/** Posição no plano da órbita, a partir da anomalia excêntrica, com o raio já comprimido. */
function pontoPorAnomalia(el: ElementosOrbitais, E: number, out: PontoOrbital): PontoOrbital {
  const e = el.excentricidade;
  const raioKm = el.semiEixoKm * (1 - e * Math.cos(E));
  const verdadeira = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const angulo = verdadeira + el.periapseRad;
  const r = distanciaCena(raioKm, el.tipo, el.raioPaiKm);
  out.x = r * Math.cos(angulo);
  out.z = -r * Math.sin(angulo);
  out.angulo = angulo;
  return out;
}

/** Anomalia média no tempo de cena `t`. */
export function anomaliaMedia(el: ElementosOrbitais, t: number): number {
  const m = (el.anomaliaMedia0 + el.movimentoMedio * t) % DOIS_PI;
  return m < 0 ? m + DOIS_PI : m;
}

export function posicaoOrbital(el: ElementosOrbitais, t: number, out: PontoOrbital): PontoOrbital {
  const m = anomaliaMedia(el, t);
  return pontoPorAnomalia(el, anomaliaExcentrica(m, el.excentricidade), out);
}

/**
 * Amostra a órbita para desenhar a linha: `n` pontos uniformes na anomalia excêntrica
 * (densos no periélio) e, para cada um, a fração da anomalia média em [0, 1), que o
 * shader usa para desenhar o rastro atrás do astro.
 */
export function amostrarOrbita(el: ElementosOrbitais, n: number): { posicoes: Float32Array; fases: Float32Array } {
  const posicoes = new Float32Array(n * 3);
  const fases = new Float32Array(n);
  const p: PontoOrbital = { x: 0, z: 0, angulo: 0 };
  const e = el.excentricidade;
  for (let i = 0; i < n; i++) {
    const E = (i / n) * DOIS_PI;
    pontoPorAnomalia(el, E, p);
    posicoes[i * 3] = p.x;
    posicoes[i * 3 + 1] = 0;
    posicoes[i * 3 + 2] = p.z;
    fases[i] = (E - e * Math.sin(E)) / DOIS_PI;
  }
  return { posicoes, fases };
}
