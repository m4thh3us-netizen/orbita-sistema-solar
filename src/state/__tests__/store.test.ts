import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CHAVE_PREFERENCIAS, iniciarPersistencia, lerPreferencias } from '../preferencias';
import { criarEstadoInicial, useOrbita } from '../store';

vi.mock('@/data', () => import('./fixture'));

const estado = () => useOrbita.getState();

beforeEach(() => {
  localStorage.clear();
  useOrbita.setState(criarEstadoInicial());
});

describe('selecionar', () => {
  it('seleciona um astro e entra no modo astro', () => {
    estado().selecionar('saturno');
    expect(estado()).toMatchObject({ selecionado: 'saturno', modo: 'astro' });
  });

  it('numa lua, leva ao modo astro daquela lua', () => {
    estado().selecionar('saturno');
    estado().explorarLuas();
    estado().selecionar('tita');
    expect(estado()).toMatchObject({ selecionado: 'tita', modo: 'astro' });
  });

  it('ignora IDs inexistentes ou não exploráveis em 3D', () => {
    estado().selecionar('marte');
    estado().selecionar('plutao-x');
    estado().selecionar('pan');
    expect(estado()).toMatchObject({ selecionado: 'marte', modo: 'astro' });
  });
});

describe('explorarLuas', () => {
  it('entra no modo luas quando o astro tem luas exploráveis', () => {
    estado().selecionar('saturno');
    estado().explorarLuas();
    expect(estado()).toMatchObject({ selecionado: 'saturno', modo: 'luas' });
  });

  it('não faz nada sem luas exploráveis ou sem seleção', () => {
    estado().explorarLuas();
    expect(estado().modo).toBe('visao-geral');
    estado().selecionar('mercurio');
    estado().explorarLuas();
    expect(estado().modo).toBe('astro');
    estado().selecionar('makemake');
    estado().explorarLuas();
    expect(estado().modo).toBe('astro');
  });
});

describe('voltar', () => {
  it('sobe um nível: lua → pai → visão geral', () => {
    estado().selecionar('tita');
    estado().voltar();
    expect(estado()).toMatchObject({ selecionado: 'saturno', modo: 'astro' });
    estado().voltar();
    expect(estado()).toMatchObject({ selecionado: null, modo: 'visao-geral' });
  });

  it('luas → astro', () => {
    estado().selecionar('marte');
    estado().explorarLuas();
    estado().voltar();
    expect(estado()).toMatchObject({ selecionado: 'marte', modo: 'astro' });
  });

  it('na visão geral não muda nada', () => {
    const antes = estado();
    estado().voltar();
    expect(estado()).toBe(antes);
  });

  it('irParaVisaoGeral sai de qualquer nível', () => {
    estado().selecionar('lua');
    estado().irParaVisaoGeral();
    expect(estado()).toMatchObject({ selecionado: null, modo: 'visao-geral' });
  });
});

describe('controles', () => {
  it('alterna simulação, rotação, órbitas e nomes', () => {
    const s = estado();
    s.alternarSimulacao();
    s.alternarRotacaoAstro();
    s.alternarOrbitas();
    s.alternarNomes();
    expect(estado()).toMatchObject({
      simulacaoPausada: true,
      rotacaoAstroPausada: true,
      mostrarOrbitas: false,
      mostrarNomes: false,
    });
  });

  it('resetarCamera incrementa o token', () => {
    const antes = estado().resetCameraToken;
    estado().resetarCamera();
    estado().resetarCamera();
    expect(estado().resetCameraToken).toBe(antes + 2);
  });

  it('setOcupacaoInterface não notifica quando nada mudou', () => {
    const ouvinte = vi.fn();
    const cancelar = useOrbita.subscribe(ouvinte);
    estado().setOcupacaoInterface({ top: 10, right: 0, bottom: 0, left: 0 });
    estado().setOcupacaoInterface({ top: 10, right: 0, bottom: 0, left: 0 });
    cancelar();
    expect(ouvinte).toHaveBeenCalledTimes(1);
  });
});

describe('preferências', () => {
  it('grava órbitas, nomes e velocidade no localStorage', () => {
    const cancelar = iniciarPersistencia(useOrbita, localStorage);
    estado().alternarOrbitas();
    estado().setVelocidade(16);
    cancelar();
    expect(JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) ?? '{}')).toEqual({
      mostrarOrbitas: false,
      mostrarNomes: true,
      velocidade: 16,
    });
  });

  it('lê preferências válidas e ignora lixo', () => {
    localStorage.setItem(
      CHAVE_PREFERENCIAS,
      JSON.stringify({ mostrarOrbitas: false, mostrarNomes: 'sim', velocidade: 3 }),
    );
    expect(lerPreferencias(localStorage)).toEqual({ mostrarOrbitas: false });
    localStorage.setItem(CHAVE_PREFERENCIAS, '{quebrado');
    expect(lerPreferencias(localStorage)).toEqual({});
  });

  it('sobrevive a um storage que lança erro', () => {
    const quebrado = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
    } as unknown as Storage;
    expect(lerPreferencias(quebrado)).toEqual({});
    const cancelar = iniciarPersistencia(useOrbita, quebrado);
    expect(() => estado().alternarNomes()).not.toThrow();
    cancelar();
  });

  it('o estado inicial usa as preferências salvas', () => {
    localStorage.setItem(
      CHAVE_PREFERENCIAS,
      JSON.stringify({ mostrarNomes: false, velocidade: 4 }),
    );
    expect(criarEstadoInicial()).toMatchObject({
      mostrarNomes: false,
      velocidade: 4,
      mostrarOrbitas: true,
    });
  });
});
