import { describe, expect, it, vi } from 'vitest';
import { astroVizinho } from '../navegacao';

vi.mock('@/data', () => import('./fixture'));

describe('astroVizinho (←/→ pela ordem)', () => {
  it('da visão geral, → começa no Sol e ← vai para o último', () => {
    expect(astroVizinho(null, 'visao-geral', 1)).toBe('sol');
    expect(astroVizinho(null, 'visao-geral', -1)).toBe('makemake');
  });

  it('percorre Sol, planetas e planetas anões pela ordem, com volta circular', () => {
    expect(astroVizinho('sol', 'astro', 1)).toBe('mercurio');
    expect(astroVizinho('marte', 'astro', 1)).toBe('ceres');
    expect(astroVizinho('makemake', 'astro', 1)).toBe('sol');
    expect(astroVizinho('sol', 'astro', -1)).toBe('makemake');
  });

  it('numa lua, percorre as luas irmãs exploráveis', () => {
    expect(astroVizinho('encelado', 'astro', 1)).toBe('tita');
    expect(astroVizinho('tita', 'astro', 1)).toBe('encelado');
  });

  it('no modo luas, → vai para a primeira lua', () => {
    expect(astroVizinho('saturno', 'luas', 1)).toBe('encelado');
    expect(astroVizinho('saturno', 'luas', -1)).toBe('tita');
  });
});
