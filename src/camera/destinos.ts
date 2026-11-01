/**
 * Para onde a câmera vai em cada estado da navegação: alvo, ângulos, distância de
 * enquadramento e limites de órbita/zoom.
 */
import { Box3, Vector3 } from 'three';
import { getBody, getChildren } from '@/data';
import type { BodyId } from '@/data/types';
import type { OrbitaState } from '@/state/store';
import { KM_POR_UA, distanciaCena, raioCena } from '@/scene/escala';
import { registro } from '@/scene/registro';
import { distanciaEnquadramento, type Ocupacao } from './enquadramento';

export interface Limites {
  minDistancia: number;
  maxDistancia: number;
  minPolar: number;
  maxPolar: number;
  /** Visão geral: arrastar com o botão direito/dois dedos desloca, e o alvo fica numa caixa. */
  livre: boolean;
}

export interface Destino {
  /** Astro seguido; null = ponto fixo (visão geral). */
  alvoId: BodyId | null;
  alvoFixo: Vector3;
  azimute: number;
  polar: number;
  distancia: number;
  limites: Limites;
}

export interface ContextoEnquadramento {
  fov: number;
  largura: number;
  altura: number;
  ocupacao: Ocupacao;
  /** Azimute atual da câmera (o Sol não tem lado iluminado preferido). */
  azimuteAtual: number;
}

const GRAUS = Math.PI / 180;
const ORIGEM = new Vector3();

/** Raio da cena que a visão geral enquadra: até a órbita de Netuno. */
export const RAIO_SISTEMA = distanciaCena(30.5 * KM_POR_UA, 'planeta') + 2;
/** Caixa onde o alvo pode passear na visão geral, para o usuário não se perder. */
export const CAIXA_VISAO_GERAL = new Box3(new Vector3(-140, -45, -140), new Vector3(140, 45, 140));

const AZIMUTE_GERAL = 0.65;
/** 26° acima do plano orbital. */
const POLAR_GERAL = (90 - 26) * GRAUS;

const tmp = new Vector3();
const tmp2 = new Vector3();

function azimuteDe(v: Vector3): number {
  return Math.atan2(v.x, v.z);
}

export function destinoVisaoGeral(ctx: ContextoEnquadramento): Destino {
  const distancia = distanciaEnquadramento(RAIO_SISTEMA, ctx.fov, ctx.largura, ctx.altura, ctx.ocupacao, 0.95);
  return {
    alvoId: null,
    alvoFixo: ORIGEM,
    azimute: AZIMUTE_GERAL,
    polar: POLAR_GERAL,
    distancia,
    limites: {
      minDistancia: 9,
      maxDistancia: Math.max(420, distancia * 1.8),
      minPolar: 0.08,
      maxPolar: Math.PI - 0.08,
      livre: true,
    },
  };
}

/** Maior distância (centro a centro, no apoastro) das luas exploráveis de `id`. */
function alcanceDasLuas(id: BodyId): number {
  const pai = getBody(id);
  if (!pai) return 0;
  let maior = 0;
  for (const lua of getChildren(id, { exploravel3D: true })) {
    if (!lua.orbita) continue;
    const apo = lua.orbita.semiEixoMaiorKm * (1 + lua.orbita.excentricidade);
    const d = distanciaCena(apo, 'lua', pai.fisico.raioMedioKm) + raioCena(lua.fisico.raioMedioKm);
    maior = Math.max(maior, d);
  }
  return maior;
}

/**
 * Destino para o estado atual do store, ou null se o astro ainda não está montado
 * (luas aparecem um quadro depois da seleção).
 */
export function calcularDestino(s: OrbitaState, ctx: ContextoEnquadramento): Destino | null {
  if (s.modo === 'visao-geral' || !s.selecionado) return destinoVisaoGeral(ctx);
  const corpo = getBody(s.selecionado);
  if (!corpo) return destinoVisaoGeral(ctx);

  const ehLua = corpo.tipo === 'lua';
  const modoLuas = s.modo === 'luas';
  // Em modo luas o alvo é o planeta (se a seleção for uma lua, o pai dela).
  const alvoId = modoLuas && ehLua && corpo.pai ? corpo.pai : corpo.id;
  const entrada = registro.obter(alvoId);
  if (!entrada) return null;
  entrada.objeto.getWorldPosition(tmp);

  const { fov, largura, altura, ocupacao } = ctx;
  const polarPadrao = (90 - 13) * GRAUS;
  const minPolar = 0.05;
  const maxPolar = Math.PI - 0.05;

  if (modoLuas) {
    const alcance = Math.max(alcanceDasLuas(alvoId), entrada.raioVisual * 2);
    const distancia = distanciaEnquadramento(alcance * 1.06, fov, largura, altura, ocupacao, 0.94);
    return {
      alvoId,
      alvoFixo: ORIGEM,
      azimute: azimuteDe(tmp2.copy(tmp).negate()) + 0.5,
      polar: (90 - 34) * GRAUS,
      distancia,
      limites: { minDistancia: entrada.raio * 1.5, maxDistancia: distancia * 2.2, minPolar, maxPolar, livre: false },
    };
  }

  if (ehLua && corpo.pai) {
    // Câmera do lado de fora da órbita, girada ~29°: o planeta aparece ao fundo, ao lado.
    const pai = registro.obter(corpo.pai);
    const fora = pai ? tmp2.copy(tmp).sub(pai.objeto.getWorldPosition(new Vector3())) : tmp2.copy(tmp).negate();
    const distancia = distanciaEnquadramento(entrada.raioVisual, fov, largura, altura, ocupacao, 0.36);
    return {
      alvoId,
      alvoFixo: ORIGEM,
      azimute: azimuteDe(fora) + 0.5,
      polar: (90 - 14) * GRAUS,
      distancia,
      limites: {
        minDistancia: entrada.raio * 1.5,
        maxDistancia: Math.max(entrada.raio * 8, distancia * 1.6),
        minPolar,
        maxPolar,
        livre: false,
      },
    };
  }

  const ehSol = corpo.tipo === 'estrela';
  const fracao = ehSol ? 0.5 : 0.62;
  const distancia = distanciaEnquadramento(entrada.raioVisual, fov, largura, altura, ocupacao, fracao);
  // Do lado do Sol, girado ~34°: disco quase todo iluminado, com um pouco de terminador.
  const azimute = ehSol ? ctx.azimuteAtual : azimuteDe(tmp2.copy(tmp).negate()) + 0.6;
  return {
    alvoId,
    alvoFixo: ORIGEM,
    azimute,
    polar: polarPadrao,
    distancia,
    limites: {
      minDistancia: entrada.raio * 1.5,
      maxDistancia: Math.max(entrada.raio * 8, distancia * 1.5),
      minPolar,
      maxPolar,
      livre: false,
    },
  };
}
