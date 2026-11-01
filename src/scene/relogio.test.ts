import { describe, expect, it } from 'vitest';
import { DT_MAXIMO, RelogioSimulacao, type EntradaRelogio } from './relogio';

const base: EntradaRelogio = { velocidade: 1, pausada: false, rotacaoPausada: false, suavizar: false };

describe('RelogioSimulacao', () => {
  it('avança em segundos de cena multiplicados pela velocidade', () => {
    const r = new RelogioSimulacao();
    r.avancar(0.05, { ...base, velocidade: 4 });
    expect(r.tempoOrbital).toBeCloseTo(0.2, 9);
  });

  it('pausar congela o tempo e retomar continua do mesmo ponto, sem salto', () => {
    const r = new RelogioSimulacao();
    r.avancar(0.05, base);
    const antes = r.tempoOrbital;
    for (let i = 0; i < 100; i++) r.avancar(0.05, { ...base, pausada: true });
    expect(r.tempoOrbital).toBe(antes);
    r.avancar(0.016, base);
    expect(r.tempoOrbital - antes).toBeCloseTo(0.016, 9);
  });

  it('ignora quadros longos (aba em segundo plano)', () => {
    const r = new RelogioSimulacao();
    r.avancar(30, base);
    expect(r.tempoOrbital).toBeCloseTo(DT_MAXIMO, 9);
  });

  it('pausar a rotação do astro não para as órbitas', () => {
    const r = new RelogioSimulacao();
    r.avancar(0.05, { ...base, rotacaoPausada: true });
    expect(r.tempoOrbital).toBeCloseTo(0.05, 9);
    expect(r.tempoRotacao).toBe(0);
  });

  it('suaviza a mudança de velocidade sem descontinuidade', () => {
    const r = new RelogioSimulacao();
    const passos: number[] = [];
    let anterior = 0;
    for (let i = 0; i < 120; i++) {
      r.avancar(1 / 60, { ...base, velocidade: 16, suavizar: true });
      passos.push(r.tempoOrbital - anterior);
      anterior = r.tempoOrbital;
    }
    // Cada passo é no máximo um pouco maior que o anterior: acelera, não salta.
    for (let i = 1; i < passos.length; i++) expect(passos[i]).toBeLessThan(passos[i - 1] + 0.03);
    expect(r.velocidadeEfetiva).toBeCloseTo(16, 2);
  });
});
