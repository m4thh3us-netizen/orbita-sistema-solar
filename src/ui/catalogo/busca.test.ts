import { describe, expect, it, vi } from 'vitest';
import { bodies, getBody, getChildren } from '@/data';
import { agruparResultados, buscarCorpos, localizarTrecho, normalizar } from './busca';

vi.mock('@/data', () => import('@/state/__tests__/fixture'));

describe('busca sem acentos e sem caixa', () => {
  it('normaliza acentos e maiúsculas', () => {
    expect(normalizar('Titã')).toBe('tita');
    expect(normalizar('ENCÉLADO')).toBe('encelado');
    expect(normalizar('Plutão')).toBe('plutao');
  });

  it('"tita" encontra "Titã" e marca o trecho no texto original', () => {
    expect(localizarTrecho('Titã', 'tita')).toEqual({ inicio: 0, fim: 4 });
    expect(localizarTrecho('Titã', 'TÃ')).toEqual({ inicio: 2, fim: 4 });
    expect(localizarTrecho('Encélado', 'cela')).toEqual({ inicio: 2, fim: 6 });
  });

  it('funciona com texto decomposto (NFD)', () => {
    const decomposto = 'Titã'; // "Titã" com til combinante
    const trecho = localizarTrecho(decomposto, 'tita');
    expect(trecho).not.toBeNull();
    expect(decomposto.slice(trecho!.inicio, trecho!.fim)).toBe('Titã');
  });

  it('retorna null para consulta vazia ou sem ocorrência', () => {
    expect(localizarTrecho('Titã', '  ')).toBeNull();
    expect(localizarTrecho('Titã', 'xyz')).toBeNull();
  });

  it('busca no nome e, em seguida, na classificação', () => {
    const porNome = buscarCorpos(bodies, 'tita', 'todos');
    expect(porNome.map((r) => r.corpo.id)).toEqual(['tita']);
    expect(porNome[0]).toMatchObject({ campo: 'nome', trecho: { inicio: 0, fim: 4 } });

    const porClasse = buscarCorpos(bodies, 'gasoso', 'todos');
    expect(porClasse.map((r) => [r.corpo.id, r.campo])).toEqual([['saturno', 'classificacao']]);
  });

  it('aplica o filtro de tipo', () => {
    const luas = buscarCorpos(bodies, '', 'lua').map((r) => r.corpo.id);
    expect(luas).toEqual(expect.arrayContaining(['lua', 'fobos', 'deimos', 'tita', 'encelado']));
    expect(luas).not.toContain('saturno');
    expect(buscarCorpos(bodies, '', 'estrela').map((r) => r.corpo.id)).toEqual(['sol']);
  });

  it('agrupa por tipo e as luas por astro pai', () => {
    const exploraveis = bodies.filter((c) => c.exploravel3D);
    const grupos = agruparResultados(
      buscarCorpos(exploraveis, '', 'todos'),
      getBody,
      (id) => getChildren(id, { exploravel3D: true }).length,
    );
    expect(grupos.map((g) => g.titulo)).toEqual([
      'Estrela',
      'Planetas',
      'Planetas anões',
      'Lua da Terra',
      'Luas de Marte',
      'Luas de Saturno',
    ]);
    expect(grupos[1].itens.map((r) => r.corpo.id)).toEqual([
      'mercurio',
      'terra',
      'marte',
      'saturno',
    ]);
  });
});
