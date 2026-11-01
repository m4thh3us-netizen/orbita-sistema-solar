/**
 * Escalas ilustrativas da cena. Funções puras: recebem valores reais (km, dias, horas)
 * e devolvem unidades de cena ou velocidades angulares em rad por "segundo de cena"
 * (um segundo real na velocidade 1×). As decisões estão em docs/decisoes-cena.md.
 */
import type { BodyType } from '@/data/types';

export const KM_POR_UA = 149_597_870.7;

// ── Raio ──────────────────────────────────────────────────────────────────────

const RAIO_TERRA_KM = 6_371;
/** Raio da Terra em unidades de cena; é a régua de todos os tamanhos. */
export const RAIO_TERRA_CENA = 0.6;
/** Acima deste raio (só o Sol) a curva passa de raiz quadrada para raiz quarta. */
const LIMIAR_RAIO_KM = 80_000;
/** Piso suave para luas de poucos km continuarem visíveis e clicáveis. */
export const RAIO_MINIMO_CENA = 0.045;

/**
 * Raio em unidades de cena. Raiz quadrada em relação à Terra até 80 000 km e raiz
 * quarta acima disso, para que o Sol (≈ 6× a Terra) não domine a cena. Contínua,
 * crescente e com piso suave (√(r² + mín²)).
 */
export function raioCena(raioKm: number): number {
  if (!(raioKm > 0)) return RAIO_MINIMO_CENA;
  const relativo =
    raioKm <= LIMIAR_RAIO_KM
      ? Math.sqrt(raioKm / RAIO_TERRA_KM)
      : Math.sqrt(LIMIAR_RAIO_KM / RAIO_TERRA_KM) * Math.pow(raioKm / LIMIAR_RAIO_KM, 0.25);
  const r = relativo * RAIO_TERRA_CENA;
  return Math.hypot(r, RAIO_MINIMO_CENA);
}

// ── Distância ─────────────────────────────────────────────────────────────────

/** Afastamento mínimo do centro do Sol (já fora da coroa). */
const DIST_BASE = 2;
/** Unidades de cena por unidade de ln(1 + d/UA). */
const DIST_ESCALA = 24;

/** Distância das luas ao pai, em raios do pai na cena: BASE + ESCALA·ln(a / raio real). */
const LUA_BASE = 1.25;
const LUA_ESCALA = 1.1;

/**
 * Distância em unidades de cena.
 * - Corpos que orbitam o Sol: `2 + 24·ln(1 + d/UA)`. Quase linear perto do Sol e
 *   logarítmica longe dele: Mercúrio fica a ~10, a Terra a ~19 e Netuno a ~85.
 * - Luas (`tipo === 'lua'`): relativa ao pai, `Rpai·(1,25 + 1,1·ln(a/RpaiKm))`. Fica
 *   sempre fora do pai, e Encélado fica fora dos anéis de Saturno.
 * A mesma função serve para o semieixo e para a distância instantânea numa órbita
 * excêntrica: a cena comprime o raio vetor real, então a ordem é preservada a cada
 * instante (Plutão ainda cruza a órbita de Netuno).
 */
export function distanciaCena(distKm: number, tipo: BodyType, raioPaiKm?: number): number {
  if (tipo === 'estrela') return 0;
  const d = Math.max(0, distKm);
  if (tipo === 'lua') {
    const raioPai = raioPaiKm && raioPaiKm > 0 ? raioPaiKm : RAIO_TERRA_KM;
    const proporcao = Math.max(1, d / raioPai);
    return raioCena(raioPai) * (LUA_BASE + LUA_ESCALA * Math.log(proporcao));
  }
  return DIST_BASE + DIST_ESCALA * Math.log1p(d / KM_POR_UA);
}

// ── Tempo ─────────────────────────────────────────────────────────────────────

const DIAS_POR_ANO = 365.256;
/** Na velocidade 1× a Terra completa uma órbita neste tempo. */
export const SEGUNDOS_ORBITA_TERRA = 60;
/** Abaixo deste período (Mercúrio) os períodos são comprimidos: luas não giram como hélices. */
const PERIODO_CURTO_DIAS = 87.969;
const EXP_CURTO = 0.25;
/** Acima deste período os corpos externos são comprimidos para não parecerem parados. */
const PERIODO_LONGO_DIAS = 2 * DIAS_POR_ANO;
const EXP_LONGO = 0.55;

/**
 * Duração em segundos de cena de uma volta com período `periodoDias`.
 * Proporcional entre Mercúrio e 2 anos (Mercúrio, Vênus, Terra e Marte mantêm a
 * proporção exata). Fora dessa faixa usa lei de potência, contínua e crescente.
 */
export function periodoCena(periodoDias: number): number {
  const p = Math.abs(periodoDias);
  if (!(p > 0)) return Infinity;
  const linear = (dias: number) => (SEGUNDOS_ORBITA_TERRA * dias) / DIAS_POR_ANO;
  if (p < PERIODO_CURTO_DIAS) {
    return linear(PERIODO_CURTO_DIAS) * Math.pow(p / PERIODO_CURTO_DIAS, EXP_CURTO);
  }
  if (p > PERIODO_LONGO_DIAS) {
    return linear(PERIODO_LONGO_DIAS) * Math.pow(p / PERIODO_LONGO_DIAS, EXP_LONGO);
  }
  return linear(p);
}

/** Velocidade angular orbital em rad por segundo de cena. O sinal do período é preservado. */
export function velocidadeAngular(periodoDias: number): number {
  const t = periodoCena(periodoDias);
  if (!Number.isFinite(t)) return 0;
  return (Math.sign(periodoDias) * 2 * Math.PI) / t;
}

/** Uma rotação da Terra dura isto em segundos de cena (1×). */
export const SEGUNDOS_ROTACAO_TERRA = 20;
const EXP_ROTACAO = 0.4;

/**
 * Velocidade de rotação axial em rad por segundo de cena. Comprimida por `(|P|/24 h)^0,4`
 * para que Júpiter (~10 h) e Vênus (~5 800 h) girem de forma perceptível.
 * Período negativo = rotação retrógrada (velocidade negativa).
 */
export function velocidadeRotacao(periodoHoras: number): number {
  const p = Math.abs(periodoHoras);
  if (!(p > 0)) return 0;
  const segundos = SEGUNDOS_ROTACAO_TERRA * Math.pow(p / 24, EXP_ROTACAO);
  return (Math.sign(periodoHoras) * 2 * Math.PI) / segundos;
}

/**
 * Sentido de rotação axial segundo a convenção dos dados: obliquidade > 90° já descreve
 * a rotação retrógrada (gira-se com |período| em torno do eixo inclinado). O sinal do
 * período só vale quando a obliquidade é ≤ 90°, para não inverter duas vezes.
 */
export function sentidoRotacao(inclinacaoAxialGraus: number, periodoRotacaoHoras: number): 1 | -1 {
  if (inclinacaoAxialGraus > 90) return 1;
  return periodoRotacaoHoras < 0 ? -1 : 1;
}

/**
 * Sentido orbital: inclinação > 90° já inverte o movimento ao girar o plano da órbita.
 * `retrograda` só é aplicado quando a inclinação não o descreve.
 */
export function sentidoOrbital(inclinacaoGraus: number, retrograda?: boolean): 1 | -1 {
  if (inclinacaoGraus > 90) return 1;
  return retrograda ? -1 : 1;
}
