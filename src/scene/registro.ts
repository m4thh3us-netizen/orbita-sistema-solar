/**
 * Registro dos astros montados na cena. A câmera, os rótulos e o destaque de hover
 * consultam aqui a posição no mundo de cada astro, sem passar pelo React a cada quadro.
 */
import type { Object3D } from 'three';
import type { BodyId, BodyType } from '@/data/types';

export interface EntradaRegistro {
  id: BodyId;
  nome: string;
  tipo: BodyType;
  pai: BodyId | null;
  /** Raio da malha em unidades de cena. */
  raio: number;
  /** Raio que precisa caber no enquadramento (inclui anéis e atmosfera). */
  raioVisual: number;
  corAcento: string;
  /** Grupo que acompanha a órbita; a posição de mundo dele é o centro do astro. */
  objeto: Object3D;
}

const entradas = new Map<BodyId, EntradaRegistro>();
const ouvintes = new Set<() => void>();
let versao = 0;

function avisar(): void {
  versao++;
  for (const f of ouvintes) f();
}

export const registro = {
  registrar(e: EntradaRegistro): () => void {
    entradas.set(e.id, e);
    avisar();
    return () => {
      if (entradas.get(e.id) === e) {
        entradas.delete(e.id);
        avisar();
      }
    };
  },
  obter(id: BodyId | null | undefined): EntradaRegistro | undefined {
    return id ? entradas.get(id) : undefined;
  },
  todos(): IterableIterator<EntradaRegistro> {
    return entradas.values();
  },
  /** Muda a cada registro/remoção; útil para recalcular listas fora do quadro. */
  versao(): number {
    return versao;
  },
  ouvir(f: () => void): () => void {
    ouvintes.add(f);
    return () => ouvintes.delete(f);
  },
};
