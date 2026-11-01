import { SphereGeometry } from 'three';

/** Esferas de raio 1 compartilhadas por resolução; as malhas escalam pelo raio. */
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

/** Colisores: baixa resolução basta para o raycast. */
export const ESFERA_COLISOR = new SphereGeometry(1, 16, 12);
