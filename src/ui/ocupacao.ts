import { useEffect, useId, type RefObject } from 'react';
import { useOrbita } from '@/state/store';

type Lado = 'top' | 'right' | 'bottom' | 'left';

/**
 * Cada painel registra quantos px cobre na sua borda; o store recebe o máximo por lado.
 * A câmera usa `ocupacaoInterface` para enquadrar o astro na área livre.
 */
const registros = new Map<string, { lado: Lado; px: number }>();

function publicar() {
  const ocupacao = { top: 0, right: 0, bottom: 0, left: 0 };
  for (const { lado, px } of registros.values()) ocupacao[lado] = Math.max(ocupacao[lado], px);
  useOrbita.getState().setOcupacaoInterface(ocupacao);
  // Também como variáveis CSS, para painéis se posicionarem uns em relação aos outros
  // (ex.: a barra de controles fica centrada entre catálogo e painel lateral).
  const estilo = document.documentElement.style;
  for (const lado of ['top', 'right', 'bottom', 'left'] as const) {
    estilo.setProperty(`--ocupacao-${lado}`, `${ocupacao[lado]}px`);
  }
}

function medir(el: Element, lado: Lado): number {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return 0;
  const px = {
    top: r.bottom,
    bottom: window.innerHeight - r.top,
    left: r.right,
    right: window.innerWidth - r.left,
  }[lado];
  return Math.max(0, Math.round(px));
}

/**
 * Mede o elemento com ResizeObserver (e ao fim de transições/animações, que mudam a posição
 * sem mudar o tamanho) e publica a área coberta. `ativo = false` remove o registro.
 */
export function useOcupacao(ref: RefObject<HTMLElement | null>, lado: Lado, ativo = true): void {
  const chave = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el || !ativo) return;

    let quadro = 0;
    const atualizar = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        registros.set(chave, { lado, px: medir(el, lado) });
        publicar();
      });
    };

    atualizar();
    const observador = typeof ResizeObserver === 'function' ? new ResizeObserver(atualizar) : null;
    observador?.observe(el);
    window.addEventListener('resize', atualizar);
    el.addEventListener('transitionend', atualizar);
    el.addEventListener('animationend', atualizar);

    return () => {
      cancelAnimationFrame(quadro);
      observador?.disconnect();
      window.removeEventListener('resize', atualizar);
      el.removeEventListener('transitionend', atualizar);
      el.removeEventListener('animationend', atualizar);
      registros.delete(chave);
      publicar();
    };
  }, [ref, lado, ativo, chave]);
}
