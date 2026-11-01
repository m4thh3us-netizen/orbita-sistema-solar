import { bodies, getBody, getChildren } from '@/data';
import type { BodyId, CelestialBody } from '@/data/types';
import type { Modo } from './store';

export function porOrdem(a: CelestialBody, b: CelestialBody): number {
  return a.ordem - b.ordem || (a.orbita?.semiEixoMaiorKm ?? 0) - (b.orbita?.semiEixoMaiorKm ?? 0);
}

function raizes(): CelestialBody[] {
  return bodies.filter((c) => c.pai === null && c.exploravel3D);
}

export function sequenciaDoNivel(selecionado: BodyId | null, modo: Modo): CelestialBody[] {
  const exploraveis = (id: BodyId) => getChildren(id, { exploravel3D: true }).sort(porOrdem);

  if (selecionado && modo === 'luas') return exploraveis(selecionado);

  const corpo = selecionado ? getBody(selecionado) : undefined;
  if (corpo?.tipo === 'lua' && corpo.pai) return exploraveis(corpo.pai);

  return [...raizes(), ...exploraveis('sol')];
}

export function astroVizinho(
  selecionado: BodyId | null,
  modo: Modo,
  direcao: 1 | -1,
): BodyId | null {
  const sequencia = sequenciaDoNivel(selecionado, modo);
  if (sequencia.length === 0) return null;
  const indice = modo === 'luas' ? -1 : sequencia.findIndex((c) => c.id === selecionado);
  if (indice === -1) return (direcao === 1 ? sequencia[0] : sequencia[sequencia.length - 1]).id;
  const proximo = (indice + direcao + sequencia.length) % sequencia.length;
  return sequencia[proximo].id;
}
