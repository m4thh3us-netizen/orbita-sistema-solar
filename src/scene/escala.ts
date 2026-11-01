import type { BodyType } from '@/data/types';

export const KM_POR_UA = 149_597_870.7;

const RAIO_TERRA_KM = 6_371;
export const RAIO_TERRA_CENA = 0.6;
const LIMIAR_RAIO_KM = 80_000;
export const RAIO_MINIMO_CENA = 0.045;

export function raioCena(raioKm: number): number {
  if (!(raioKm > 0)) return RAIO_MINIMO_CENA;
  const relativo =
    raioKm <= LIMIAR_RAIO_KM
      ? Math.sqrt(raioKm / RAIO_TERRA_KM)
      : Math.sqrt(LIMIAR_RAIO_KM / RAIO_TERRA_KM) * Math.pow(raioKm / LIMIAR_RAIO_KM, 0.25);
  const r = relativo * RAIO_TERRA_CENA;
  return Math.hypot(r, RAIO_MINIMO_CENA);
}

const DIST_BASE = 2;
const DIST_ESCALA = 24;

const LUA_BASE = 1.25;
const LUA_ESCALA = 1.1;

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

const DIAS_POR_ANO = 365.256;
export const SEGUNDOS_ORBITA_TERRA = 60;
const PERIODO_CURTO_DIAS = 87.969;
const EXP_CURTO = 0.25;
const PERIODO_LONGO_DIAS = 2 * DIAS_POR_ANO;
const EXP_LONGO = 0.55;

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

export function velocidadeAngular(periodoDias: number): number {
  const t = periodoCena(periodoDias);
  if (!Number.isFinite(t)) return 0;
  return (Math.sign(periodoDias) * 2 * Math.PI) / t;
}

export const SEGUNDOS_ROTACAO_TERRA = 20;
const EXP_ROTACAO = 0.4;

export function velocidadeRotacao(periodoHoras: number): number {
  const p = Math.abs(periodoHoras);
  if (!(p > 0)) return 0;
  const segundos = SEGUNDOS_ROTACAO_TERRA * Math.pow(p / 24, EXP_ROTACAO);
  return (Math.sign(periodoHoras) * 2 * Math.PI) / segundos;
}

export function sentidoRotacao(inclinacaoAxialGraus: number, periodoRotacaoHoras: number): 1 | -1 {
  if (inclinacaoAxialGraus > 90) return 1;
  return periodoRotacaoHoras < 0 ? -1 : 1;
}

export function sentidoOrbital(inclinacaoGraus: number, retrograda?: boolean): 1 | -1 {
  if (inclinacaoGraus > 90) return 1;
  return retrograda ? -1 : 1;
}
