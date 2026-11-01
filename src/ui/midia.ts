import { useSyncExternalStore } from 'react';

/** Painel lateral: desktop, tablet em paisagem e celular deitado. Abaixo disso, bottom sheet. */
export const CONSULTA_LATERAL =
  '(min-width: 900px), (orientation: landscape) and (min-width: 640px)';
/** Barra de controles compacta (menu "mais") e catálogo em tela cheia. */
export const CONSULTA_COMPACTA = '(max-width: 639px), (max-height: 500px)';
/** Largura em que catálogo e painel cabem abertos lado a lado sem espremer a cena. */
export const CONSULTA_LARGA = '(min-width: 1440px)';

function consultar(consulta: string): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(consulta)
    : null;
}

export function useMediaQuery(consulta: string): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const mq = consultar(consulta);
      mq?.addEventListener('change', avisar);
      return () => mq?.removeEventListener('change', avisar);
    },
    () => consultar(consulta)?.matches ?? false,
    () => false,
  );
}

export const usePainelLateral = () => useMediaQuery(CONSULTA_LATERAL);
export const useLayoutCompacto = () => useMediaQuery(CONSULTA_COMPACTA);
