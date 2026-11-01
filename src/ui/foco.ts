import { useEffect, type MouseEvent } from 'react';
import { useOrbita } from '@/state/store';

export const ID_CONTEUDO = 'conteudo';

export function focarConteudo() {
  document.getElementById(ID_CONTEUDO)?.focus({ preventScroll: true });
}

/** "Pular para o conteúdo" sem mexer no hash (que é a rota). */
export function aoPularParaConteudo(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  focarConteudo();
}

/**
 * Se uma navegação removeu o elemento focado (painel trocado, catálogo fechado),
 * o foco iria para <body>; devolve-o ao conteúdo principal para a ordem de Tab continuar lógica.
 */
export function useResgateDeFoco() {
  useEffect(
    () =>
      useOrbita.subscribe((s, anterior) => {
        if (s.selecionado === anterior.selecionado && s.modo === anterior.modo) return;
        requestAnimationFrame(() => {
          const ativo = document.activeElement;
          if (!ativo || ativo === document.body) focarConteudo();
        });
      }),
    [],
  );
}
