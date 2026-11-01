// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { bodies, caminhoTextura1k, creditos, getAncestors, getBody, getChildren } from './index.ts';

describe('API de dados', () => {
  it('getBody encontra por id e devolve undefined para ids desconhecidos', () => {
    expect(getBody('tita')?.nome).toBe('Titã');
    expect(getBody('vulcano')).toBeUndefined();
  });

  it('getChildren devolve os filhos em ordem de distância', () => {
    expect(getChildren('jupiter').map((b) => b.id)).toEqual(['io', 'europa', 'ganimedes', 'calisto']);
    expect(getChildren('sol').map((b) => b.id)).toEqual([
      'mercurio', 'venus', 'terra', 'marte', 'ceres', 'jupiter', 'saturno', 'urano', 'netuno',
      'plutao', 'haumea', 'makemake', 'eris',
    ]);
    expect(getChildren('mercurio')).toEqual([]);
  });

  it('getChildren filtra por exploravel3D', () => {
    expect(getChildren('saturno', { exploravel3D: true }).map((b) => b.id)).toEqual(['encelado', 'tita']);
    expect(getChildren('saturno', { exploravel3D: false })).toEqual([]);
  });

  it('getAncestors vai do mais externo ao pai direto', () => {
    expect(getAncestors('tita').map((b) => b.id)).toEqual(['sol', 'saturno']);
    expect(getAncestors('saturno').map((b) => b.id)).toEqual(['sol']);
    expect(getAncestors('sol')).toEqual([]);
    expect(getAncestors('inexistente')).toEqual([]);
  });

  it('bodies lista cada lua logo depois do seu corpo principal', () => {
    bodies.forEach((b, i) => {
      if (b.tipo !== 'lua') return;
      const anterior = bodies.slice(0, i).reverse().find((x) => x.tipo !== 'lua');
      expect(anterior?.id, b.id).toBe(b.pai);
    });
  });

  it('creditos tem recurso, autor, licença e URL', () => {
    expect(creditos.length).toBeGreaterThan(0);
    for (const c of creditos) {
      expect(c.recurso && c.autor && c.licenca).toBeTruthy();
      expect(() => new URL(c.url)).not.toThrow();
    }
  });

  it('caminhoTextura1k aponta para a variante de 1K', () => {
    expect(caminhoTextura1k('textures/terra/mapa.webp')).toBe('textures/terra/mapa-1k.webp');
  });
});
