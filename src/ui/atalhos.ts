import { useEffect } from 'react';
import { useInterface } from '@/state/interface';
import { astroVizinho } from '@/state/navegacao';
import { useOrbita } from '@/state/store';

const TIPOS_TEXTO = new Set([
  'text',
  'search',
  'email',
  'number',
  'password',
  'tel',
  'url',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
]);

export function ehCampoDeTexto(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  return el instanceof HTMLInputElement && TIPOS_TEXTO.has(el.type);
}

/** Controles que já usam Espaço (ativar) — o atalho não pode roubar a tecla deles. */
function usaEspaco(el: EventTarget | null): boolean {
  return (
    el instanceof HTMLElement &&
    el.closest(
      'button, a[href], summary, input, [role="button"], [role="tab"], [role="radio"], [role="option"], [role="checkbox"], [role="switch"]',
    ) !== null
  );
}

/** Widgets em que as setas navegam internamente. */
function usaSetas(el: EventTarget | null): boolean {
  return (
    el instanceof HTMLElement &&
    el.closest(
      '[role="tablist"], [role="radiogroup"], [role="listbox"], [role="slider"], [role="menu"]',
    ) !== null
  );
}

function focarPorId(id: string) {
  document.getElementById(id)?.focus();
}

export const ID_BOTAO_CATALOGO = 'botao-catalogo';
export const ID_BOTAO_MAIS = 'botao-mais-controles';

/**
 * Atalhos globais. Ficam desligados com foco em campo de texto, com modal aberto
 * ou quando um componente já tratou a tecla (`defaultPrevented`).
 * `somenteNavegacao` (fallback sem 3D) deixa só Esc, ←/→ e `?`.
 */
export function useAtalhos({ somenteNavegacao = false } = {}): void {
  useEffect(() => {
    const aoPressionar = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat) return;
      const altGr = e.getModifierState?.('AltGraph') ?? false;
      if (!altGr && (e.ctrlKey || e.metaKey || e.altKey)) return;

      const ui = useInterface.getState();
      if (ui.modal) return;
      if (ehCampoDeTexto(e.target)) return;

      const orbita = useOrbita.getState();

      switch (e.key) {
        case 'Escape': {
          if (ui.maisAberto) {
            ui.setMaisAberto(false);
            focarPorId(ID_BOTAO_MAIS);
          } else if (ui.catalogoAberto) {
            ui.fecharCatalogo();
            focarPorId(ID_BOTAO_CATALOGO);
          } else if (orbita.selecionado) {
            orbita.voltar();
          } else {
            return;
          }
          break;
        }
        case 'ArrowLeft':
        case 'ArrowRight': {
          if (usaSetas(e.target)) return;
          const id = astroVizinho(orbita.selecionado, orbita.modo, e.key === 'ArrowRight' ? 1 : -1);
          if (!id) return;
          orbita.selecionar(id);
          break;
        }
        case '?':
          ui.abrirModal('ajuda');
          break;
        default: {
          if (somenteNavegacao) return;
          switch (e.key.toLowerCase()) {
            case ' ':
              if (usaEspaco(e.target)) return;
              orbita.alternarSimulacao();
              break;
            case 'r':
              orbita.resetarCamera();
              break;
            case 'o':
              orbita.alternarOrbitas();
              break;
            case 'n':
              orbita.alternarNomes();
              break;
            case '/':
              ui.abrirCatalogo(true);
              break;
            default:
              return;
          }
        }
      }
      e.preventDefault();
    };

    window.addEventListener('keydown', aoPressionar);
    return () => window.removeEventListener('keydown', aoPressionar);
  }, [somenteNavegacao]);
}
