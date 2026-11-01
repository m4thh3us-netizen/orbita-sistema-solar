import { create } from 'zustand';

/**
 * Estado local da interface (fora do contrato): o que está aberto, aba atual, estado do sheet.
 * Fica separado de `useOrbita` para a cena não re-renderizar por causa de painéis.
 */
export type Aba = 'visao-geral' | 'composicao' | 'atmosfera' | 'luas' | 'curiosidades';
export type EstadoSheet = 'recolhido' | 'meio' | 'expandido';
export type Modal = 'ajuda' | 'creditos' | null;

interface InterfaceState {
  catalogoAberto: boolean;
  /** Incrementado para pedir foco no campo de busca (atalho `/`). */
  pedidoFocoBusca: number;
  modal: Modal;
  maisAberto: boolean;
  aba: Aba;
  sheet: EstadoSheet;
  carregado: boolean;

  abrirCatalogo(focarBusca?: boolean): void;
  fecharCatalogo(): void;
  alternarCatalogo(): void;
  abrirModal(m: Exclude<Modal, null>): void;
  fecharModal(): void;
  setMaisAberto(v: boolean): void;
  setAba(a: Aba): void;
  setSheet(s: EstadoSheet): void;
  setCarregado(): void;
}

export const useInterface = create<InterfaceState>()((set) => ({
  catalogoAberto: false,
  pedidoFocoBusca: 0,
  modal: null,
  maisAberto: false,
  aba: 'visao-geral',
  sheet: 'meio',
  carregado: false,

  abrirCatalogo(focarBusca = true) {
    set((s) => ({
      catalogoAberto: true,
      maisAberto: false,
      pedidoFocoBusca: focarBusca ? s.pedidoFocoBusca + 1 : s.pedidoFocoBusca,
    }));
  },
  fecharCatalogo() {
    set({ catalogoAberto: false });
  },
  alternarCatalogo() {
    set((s) =>
      s.catalogoAberto
        ? { catalogoAberto: false }
        : { catalogoAberto: true, maisAberto: false, pedidoFocoBusca: s.pedidoFocoBusca + 1 },
    );
  },
  abrirModal(m) {
    set({ modal: m, maisAberto: false });
  },
  fecharModal() {
    set({ modal: null });
  },
  setMaisAberto(v) {
    set({ maisAberto: v });
  },
  setAba(a) {
    set({ aba: a });
  },
  setSheet(s) {
    set({ sheet: s });
  },
  setCarregado() {
    set({ carregado: true });
  },
}));
