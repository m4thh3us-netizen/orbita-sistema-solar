import { describe, expect, it } from 'vitest';
import { areaLivre, deslocamentoCentro, distanciaEnquadramento, sanitizarOcupacao } from './enquadramento';
import {
  DURACAO_VOO_MAX,
  DURACAO_VOO_MIN,
  anguloMaisProximo,
  diferencaAngular,
  duracaoVoo,
  hermite,
  lombada,
} from './trajetoria';

const nada = { top: 0, right: 0, bottom: 0, left: 0 };

describe('enquadramento', () => {
  it('sem painéis, o centro não se desloca', () => {
    expect(deslocamentoCentro(nada, 1440, 900)).toEqual({ dx: 0, dy: 0 });
  });

  it('painel lateral direito empurra o centro para a esquerda', () => {
    expect(deslocamentoCentro({ ...nada, right: 400 }, 1440, 900)).toEqual({ dx: -200, dy: 0 });
  });

  it('painel inferior (celular) sobe o centro', () => {
    expect(deslocamentoCentro({ ...nada, bottom: 400 }, 390, 844).dy).toBe(-200);
  });

  it('nunca deixa a área livre sumir', () => {
    const s = sanitizarOcupacao({ top: 0, right: 2000, bottom: 900, left: 0 }, 1000, 1000);
    expect(1000 - s.right).toBeGreaterThanOrEqual(299.99);
    expect(1000 - s.bottom).toBeGreaterThanOrEqual(299.99);
    expect(sanitizarOcupacao({ top: -10, right: Number.NaN, bottom: 0, left: 0 }, 100, 100)).toEqual(nada);
  });

  it('afasta mais quando a área livre é menor', () => {
    const cheia = distanciaEnquadramento(1, 45, 1440, 900, nada, 0.6);
    const comPainel = distanciaEnquadramento(1, 45, 1440, 900, { ...nada, bottom: 450 }, 0.6);
    expect(comPainel).toBeGreaterThan(cheia);
  });

  it('a esfera ocupa a fração pedida da altura livre', () => {
    const d = distanciaEnquadramento(1, 45, 1600, 900, nada, 0.5);
    const raioAngular = Math.asin(1 / d);
    const fracaoAltura = Math.tan(raioAngular) / Math.tan((45 * Math.PI) / 360);
    expect(fracaoAltura).toBeCloseTo(0.5, 6);
    expect(areaLivre(nada, 1600, 900)).toEqual({ largura: 1600, altura: 900 });
  });
});

describe('trajetória', () => {
  it('Hermite respeita pontas e derivadas', () => {
    expect(hermite(2, 5, 7, -1, 0)).toBe(2);
    expect(hermite(2, 5, 7, -1, 1)).toBe(7);
    const e = 1e-6;
    expect((hermite(2, 5, 7, -1, e) - 2) / e).toBeCloseTo(5, 3);
    expect((7 - hermite(2, 5, 7, -1, 1 - e)) / e).toBeCloseTo(-1, 3);
  });

  it('a lombada é suave nas pontas e vale 1 no meio', () => {
    expect(lombada(0)).toBe(0);
    expect(lombada(1)).toBe(0);
    expect(lombada(0.5)).toBe(1);
    expect(lombada(1e-4)).toBeLessThan(1e-6);
  });

  it('escolhe o caminho angular mais curto', () => {
    expect(anguloMaisProximo(-3, 3)).toBeCloseTo(-3 + 2 * Math.PI, 9);
    expect(anguloMaisProximo(0.5, 0.2 + 4 * Math.PI)).toBeCloseTo(0.5 + 4 * Math.PI, 9);
    expect(diferencaAngular(3.1, -3.1)).toBeCloseTo(6.2 - 2 * Math.PI, 9);
  });

  it('a duração dos voos fica entre 1,2 e 1,8 s', () => {
    expect(duracaoVoo(0, 1, 1)).toBe(DURACAO_VOO_MIN);
    expect(duracaoVoo(18, 200, 2)).toBeLessThanOrEqual(DURACAO_VOO_MAX);
    expect(duracaoVoo(1e6, 0.1, 1e4)).toBe(DURACAO_VOO_MAX);
    expect(duracaoVoo(40, 2, 2)).toBeGreaterThan(duracaoVoo(2, 2, 2));
  });
});
