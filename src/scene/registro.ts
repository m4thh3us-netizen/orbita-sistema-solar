import type { Object3D } from 'three';
import type { BodyId, BodyType } from '@/data/types';

export interface EntradaRegistro {
  id: BodyId;
  nome: string;
  tipo: BodyType;
  pai: BodyId | null;
  raio: number;
  raioVisual: number;
  corAcento: string;
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
  versao(): number {
    return versao;
  },
  ouvir(f: () => void): () => void {
    ouvintes.add(f);
    return () => ouvintes.delete(f);
  },
};
