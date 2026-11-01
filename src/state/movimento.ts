import type { StoreApi } from 'zustand';
import type { OrbitaState } from './store';

export const CONSULTA_MOVIMENTO_REDUZIDO = '(prefers-reduced-motion: reduce)';

export function iniciarMovimentoReduzido(
  store: StoreApi<OrbitaState>,
  win: Window = window,
): () => void {
  let consulta: MediaQueryList;
  try {
    consulta = win.matchMedia(CONSULTA_MOVIMENTO_REDUZIDO);
  } catch {
    return () => {};
  }

  const aplicar = () => store.getState().setMovimentoReduzido(consulta.matches);
  aplicar();

  if (typeof consulta.addEventListener === 'function') {
    consulta.addEventListener('change', aplicar);
    return () => consulta.removeEventListener('change', aplicar);
  }
  consulta.addListener(aplicar);
  return () => consulta.removeListener(aplicar);
}
