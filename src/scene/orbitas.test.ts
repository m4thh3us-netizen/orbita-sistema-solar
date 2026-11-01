import { describe, expect, it } from 'vitest';
import { KM_POR_UA, distanciaCena } from './escala';
import {
  aleatorio,
  amostrarOrbita,
  anomaliaExcentrica,
  anomaliaMedia,
  hashTexto,
  posicaoOrbital,
  type ElementosOrbitais,
  type PontoOrbital,
} from './orbitas';

function elementos(parcial: Partial<ElementosOrbitais> = {}): ElementosOrbitais {
  return {
    semiEixoKm: KM_POR_UA,
    excentricidade: 0,
    inclinacaoRad: 0,
    nodoRad: 0,
    periapseRad: 0,
    anomaliaMedia0: 0,
    movimentoMedio: (2 * Math.PI) / 60,
    tipo: 'planeta',
    ...parcial,
  };
}

const ponto = (): PontoOrbital => ({ x: 0, z: 0, angulo: 0 });

describe('anomaliaExcentrica', () => {
  it('resolve a equação de Kepler', () => {
    for (const e of [0, 0.0167, 0.25, 0.44, 0.9]) {
      for (const m of [0, 0.5, 1, 2, 3, 4, 5.5, 6.2]) {
        const E = anomaliaExcentrica(m, e);
        expect(E - e * Math.sin(E)).toBeCloseTo(m, 8);
      }
    }
  });
});

describe('posicaoOrbital', () => {
  it('órbita circular: raio constante e volta completa no período', () => {
    const el = elementos();
    const r = distanciaCena(KM_POR_UA, 'planeta');
    const a = posicaoOrbital(el, 0, ponto());
    const b = posicaoOrbital(el, 15, ponto());
    const c = posicaoOrbital(el, 60, ponto());
    expect(Math.hypot(a.x, a.z)).toBeCloseTo(r, 6);
    expect(Math.hypot(b.x, b.z)).toBeCloseTo(r, 6);
    expect(c.x).toBeCloseTo(a.x, 6);
    expect(c.z).toBeCloseTo(a.z, 6);
  });

  it('gira no sentido anti-horário visto de +Y (prógrado)', () => {
    const el = elementos();
    const a = posicaoOrbital(el, 0, ponto()); // +X
    const b = posicaoOrbital(el, 15, ponto()); // um quarto de volta → −Z
    expect(a.x).toBeGreaterThan(0);
    expect(b.z).toBeLessThan(0);
    expect(Math.abs(b.x)).toBeLessThan(1e-6);
  });

  it('movimento médio negativo gira no sentido horário', () => {
    const b = posicaoOrbital(elementos({ movimentoMedio: -(2 * Math.PI) / 60 }), 15, ponto());
    expect(b.z).toBeGreaterThan(0);
  });

  it('órbita excêntrica: periélio mais perto que o afélio', () => {
    const el = elementos({ excentricidade: 0.25 });
    const perielio = posicaoOrbital(el, 0, ponto());
    const afelio = posicaoOrbital(el, 30, ponto());
    expect(Math.hypot(perielio.x, perielio.z)).toBeLessThan(Math.hypot(afelio.x, afelio.z));
  });

  it('o ângulo devolvido é o ângulo polar da posição', () => {
    const el = elementos({ excentricidade: 0.1, periapseRad: 1.2 });
    const p = posicaoOrbital(el, 7.3, ponto());
    expect(Math.atan2(-p.z, p.x)).toBeCloseTo(Math.atan2(Math.sin(p.angulo), Math.cos(p.angulo)), 6);
  });
});

describe('anomaliaMedia', () => {
  it('fica sempre em [0, 2π)', () => {
    const el = elementos({ movimentoMedio: -1 });
    for (const t of [0, 1, 10, 1000]) {
      const m = anomaliaMedia(el, t);
      expect(m).toBeGreaterThanOrEqual(0);
      expect(m).toBeLessThan(2 * Math.PI);
    }
  });
});

describe('amostrarOrbita', () => {
  it('gera n pontos e fases crescentes em [0, 1)', () => {
    const { posicoes, fases } = amostrarOrbita(elementos({ excentricidade: 0.2 }), 64);
    expect(posicoes.length).toBe(64 * 3);
    expect(fases[0]).toBe(0);
    for (let i = 1; i < fases.length; i++) expect(fases[i]).toBeGreaterThan(fases[i - 1]);
    expect(fases[fases.length - 1]).toBeLessThan(1);
  });
});

describe('sorteio determinístico', () => {
  it('o mesmo id gera sempre os mesmos números', () => {
    const a = aleatorio(hashTexto('saturno'));
    const b = aleatorio(hashTexto('saturno'));
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(hashTexto('saturno')).not.toBe(hashTexto('urano'));
  });
});
