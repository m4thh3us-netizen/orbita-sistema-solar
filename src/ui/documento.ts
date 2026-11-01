import type { StoreApi } from 'zustand';
import { getBody } from '@/data';
import type { OrbitaState } from '@/state/store';
import { garantirContraste } from './cores';

const TITULO_BASE = 'Órbita — explorador do Sistema Solar';

export function iniciarAtributosDocumento(
  store: StoreApi<OrbitaState>,
  doc: Document = document,
): () => void {
  const raiz = doc.documentElement;

  const aplicar = (s: OrbitaState) => {
    raiz.dataset.movimentoReduzido = String(s.movimentoReduzido);
    const corpo = s.selecionado ? getBody(s.selecionado) : undefined;
    if (corpo) {
      raiz.style.setProperty('--cor-acento', garantirContraste(corpo.aparencia.corAcento));
      doc.title = `${corpo.nome}${s.modo === 'luas' ? ' · luas' : ''} — Órbita`;
    } else {
      raiz.style.removeProperty('--cor-acento');
      doc.title = TITULO_BASE;
    }
  };

  aplicar(store.getState());
  return store.subscribe((s, anterior) => {
    if (
      s.selecionado !== anterior.selecionado ||
      s.modo !== anterior.modo ||
      s.movimentoReduzido !== anterior.movimentoReduzido
    ) {
      aplicar(s);
    }
  });
}
