import type { StoreApi } from 'zustand';
import { getBody } from '@/data';
import type { BodyId } from '@/data/types';
import { podeSelecionar, temLuasExploraveis, type Modo, type OrbitaState } from './store';

export interface Rota {
  selecionado: BodyId | null;
  modo: Modo;
}

export const ROTA_VISAO_GERAL: Rota = { selecionado: null, modo: 'visao-geral' };

export function rotaParaHash(rota: Rota): string {
  const { selecionado, modo } = rota;
  if (!selecionado || modo === 'visao-geral') return '#/';
  if (modo === 'luas') return `#/${selecionado}/luas`;
  const corpo = getBody(selecionado);
  if (corpo?.tipo === 'lua' && corpo.pai) return `#/${corpo.pai}/${selecionado}`;
  return `#/${selecionado}`;
}

export function hashParaRota(hash: string): { rota: Rota; valida: boolean } {
  const invalida = { rota: ROTA_VISAO_GERAL, valida: false };
  const caminho = hash.replace(/^#/, '').replace(/^\/+|\/+$/g, '');
  if (!caminho) return { rota: ROTA_VISAO_GERAL, valida: true };

  let partes: string[];
  try {
    partes = caminho.split('/').map((p) => decodeURIComponent(p).trim().toLowerCase());
  } catch {
    return invalida;
  }

  const [primeiro, segundo] = partes;
  if (partes.length > 2 || !primeiro || !podeSelecionar(primeiro)) return invalida;
  if (segundo === undefined)
    return { rota: { selecionado: primeiro, modo: 'astro' }, valida: true };

  if (segundo === 'luas') {
    return temLuasExploraveis(primeiro)
      ? { rota: { selecionado: primeiro, modo: 'luas' }, valida: true }
      : invalida;
  }

  const lua = getBody(segundo);
  if (!lua || lua.pai !== primeiro || !podeSelecionar(lua.id)) return invalida;
  return { rota: { selecionado: lua.id, modo: 'astro' }, valida: true };
}

function mesmoHash(a: string, b: string): boolean {
  const limpar = (h: string) => (h === '' || h === '#' ? '#/' : h);
  return limpar(a) === limpar(b);
}

export function iniciarSincronizacaoURL(
  store: StoreApi<OrbitaState>,
  win: Window = window,
): () => void {
  const aplicarURL = () => {
    const { rota } = hashParaRota(win.location.hash);
    const atual = store.getState();
    if (atual.selecionado !== rota.selecionado || atual.modo !== rota.modo) {
      store.setState({ selecionado: rota.selecionado, modo: rota.modo });
    }
    const canonico = rotaParaHash(rota);
    if (!mesmoHash(win.location.hash, canonico)) {
      win.history.replaceState(win.history.state, '', canonico);
    }
  };

  aplicarURL();

  const cancelarAssinatura = store.subscribe((s, anterior) => {
    if (s.selecionado === anterior.selecionado && s.modo === anterior.modo) return;
    const destino = rotaParaHash(s);
    if (mesmoHash(win.location.hash, destino)) return;
    win.history.pushState(null, '', destino);
  });

  win.addEventListener('popstate', aplicarURL);
  win.addEventListener('hashchange', aplicarURL);

  return () => {
    cancelarAssinatura();
    win.removeEventListener('popstate', aplicarURL);
    win.removeEventListener('hashchange', aplicarURL);
  };
}
