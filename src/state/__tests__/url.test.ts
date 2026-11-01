import { beforeEach, describe, expect, it, vi } from 'vitest';
import { criarEstadoInicial, useOrbita } from '../store';
import { hashParaRota, iniciarSincronizacaoURL, rotaParaHash } from '../url';

vi.mock('@/data', () => import('./fixture'));

/** Janela mínima e síncrona: location.hash, history e eventos. */
class JanelaFalsa extends EventTarget {
  location = { hash: '' };
  historico: string[] = [''];
  history = {
    state: null,
    pushState: vi.fn((_: unknown, __: string, url: string) => {
      this.location.hash = url;
      this.historico.push(url);
    }),
    replaceState: vi.fn((_: unknown, __: string, url: string) => {
      this.location.hash = url;
      this.historico[this.historico.length - 1] = url;
    }),
  };

  /** Simula voltar/avançar ou edição manual da URL. */
  navegar(hash: string) {
    this.location.hash = hash;
    this.dispatchEvent(new Event('popstate'));
  }
}

const janela = (hash = '') => {
  const j = new JanelaFalsa();
  j.location.hash = hash;
  return j;
};

beforeEach(() => {
  useOrbita.setState(criarEstadoInicial());
});

describe('rotaParaHash', () => {
  it('gera as quatro formas de URL', () => {
    expect(rotaParaHash({ selecionado: null, modo: 'visao-geral' })).toBe('#/');
    expect(rotaParaHash({ selecionado: 'saturno', modo: 'astro' })).toBe('#/saturno');
    expect(rotaParaHash({ selecionado: 'saturno', modo: 'luas' })).toBe('#/saturno/luas');
    expect(rotaParaHash({ selecionado: 'tita', modo: 'astro' })).toBe('#/saturno/tita');
  });
});

describe('hashParaRota', () => {
  it.each([
    ['', null, 'visao-geral'],
    ['#/', null, 'visao-geral'],
    ['#/saturno', 'saturno', 'astro'],
    ['#/Saturno/', 'saturno', 'astro'],
    ['#/saturno/luas', 'saturno', 'luas'],
    ['#/saturno/tita', 'tita', 'astro'],
    ['#/tita', 'tita', 'astro'],
  ])('%s → %s (%s)', (hash, selecionado, modo) => {
    const { rota, valida } = hashParaRota(hash);
    expect(valida).toBe(true);
    expect(rota).toEqual({ selecionado, modo });
  });

  it.each([
    '#/xyz',
    '#/saturno/xyz',
    '#/marte/tita', // lua com o pai errado
    '#/mercurio/luas', // sem luas exploráveis
    '#/saturno/pan', // não explorável em 3D
    '#/saturno/tita/extra',
    '#/%E0%A4%A',
  ])('%s é inválido e volta para a visão geral', (hash) => {
    expect(hashParaRota(hash)).toEqual({
      rota: { selecionado: null, modo: 'visao-geral' },
      valida: false,
    });
  });
});

describe('sincronização com a URL', () => {
  it('link direto abre o astro certo', () => {
    const j = janela('#/saturno/tita');
    const parar = iniciarSincronizacaoURL(useOrbita, j as unknown as Window);
    expect(useOrbita.getState()).toMatchObject({ selecionado: 'tita', modo: 'astro' });
    parar();
  });

  it('reescreve link de lua sem o pai para a forma canônica', () => {
    const j = janela('#/tita');
    const parar = iniciarSincronizacaoURL(useOrbita, j as unknown as Window);
    expect(j.history.replaceState).toHaveBeenCalledWith(null, '', '#/saturno/tita');
    parar();
  });

  it('ID inválido volta para a visão geral sem quebrar', () => {
    const j = janela('#/planeta-x');
    const parar = iniciarSincronizacaoURL(useOrbita, j as unknown as Window);
    expect(useOrbita.getState()).toMatchObject({ selecionado: null, modo: 'visao-geral' });
    expect(j.location.hash).toBe('#/');
    parar();
  });

  it('estado → URL com pushState', () => {
    const j = janela();
    const parar = iniciarSincronizacaoURL(useOrbita, j as unknown as Window);
    useOrbita.getState().selecionar('saturno');
    useOrbita.getState().explorarLuas();
    useOrbita.getState().selecionar('tita');
    useOrbita.getState().irParaVisaoGeral();
    expect(j.history.pushState.mock.calls.map((c) => c[2])).toEqual([
      '#/saturno',
      '#/saturno/luas',
      '#/saturno/tita',
      '#/',
    ]);
    parar();
  });

  it('URL → estado no voltar/avançar do navegador, sem empilhar histórico de novo', () => {
    const j = janela();
    const parar = iniciarSincronizacaoURL(useOrbita, j as unknown as Window);
    useOrbita.getState().selecionar('marte');
    useOrbita.getState().selecionar('saturno');
    j.history.pushState.mockClear();

    j.navegar('#/marte'); // voltar
    expect(useOrbita.getState()).toMatchObject({ selecionado: 'marte', modo: 'astro' });
    j.navegar('#/'); // voltar de novo
    expect(useOrbita.getState()).toMatchObject({ selecionado: null, modo: 'visao-geral' });
    expect(j.history.pushState).not.toHaveBeenCalled();
    parar();
  });

  it('para de ouvir após a limpeza', () => {
    const j = janela();
    const parar = iniciarSincronizacaoURL(useOrbita, j as unknown as Window);
    parar();
    j.navegar('#/saturno');
    useOrbita.getState().selecionar('marte');
    expect(useOrbita.getState().selecionado).toBe('marte');
    expect(j.history.pushState).not.toHaveBeenCalled();
  });
});
