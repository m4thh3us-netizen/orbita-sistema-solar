import { SphereGeometry } from 'three';

const esferas = new Map<number, SphereGeometry>();

export function esferaUnitaria(segmentos: number): SphereGeometry {
  const s = Math.max(12, Math.round(segmentos));
  let g = esferas.get(s);
  if (!g) {
    g = new SphereGeometry(1, s, Math.round(s * 0.75));
    esferas.set(s, g);
  }
  return g;
}

export const ESFERA_COLISOR = new SphereGeometry(1, 16, 12);
