import { events, type RootState, type RootStore } from '@react-three/fiber';
import { Vector3, type Intersection, type PerspectiveCamera } from 'three';
import type { BodyId } from '@/data/types';

export interface DadosColisor {
  corpoId: BodyId;
  raioMalha: number;
}

const centro = new Vector3();
const relativo = new Vector3();

function pontuacao(hit: Intersection, estado: RootState): number {
  const dados = hit.object.userData.colisor as DadosColisor | undefined;
  if (!dados) return Number.POSITIVE_INFINITY;
  const camera = estado.camera as PerspectiveCamera;
  hit.object.getWorldPosition(centro);
  const distancia = relativo.copy(centro).sub(camera.position).length();
  centro.project(camera);
  const { width, height } = estado.size;
  const dx = ((centro.x - estado.pointer.x) / 2) * width;
  const dy = ((centro.y - estado.pointer.y) / 2) * height;
  const pxPorUnidade = height / (2 * distancia * Math.tan((camera.fov * Math.PI) / 360));
  return Math.max(0, Math.hypot(dx, dy) - dados.raioMalha * pxPorUnidade);
}

export function ordenarPorProximidade(hits: Intersection[], estado: RootState): Intersection[] {
  if (hits.length < 2) return hits;
  const notas = new Map<Intersection, number>();
  for (const h of hits) notas.set(h, pontuacao(h, estado));
  return [...hits].sort((a, b) => notas.get(a)! - notas.get(b)! || a.distance - b.distance);
}

export function eventosOrbita(store: RootStore) {
  return { ...events(store), filter: ordenarPorProximidade };
}
