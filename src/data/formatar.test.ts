// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  formatarCientifico, formatarComparacao, formatarDuracao, formatarGrandeza, formatarKm,
  formatarKmPorExtenso, formatarMesAno, formatarNumero, formatarPercentual, formatarPressao,
  formatarTemperatura, formatarUA,
} from './formatar.ts';

// Os helpers usam espaço não separável (U+00A0) entre número e unidade; aqui ele vira espaço comum.
const s = (texto: string) => texto.replace(/\u00A0/g, ' ');

describe('formatar', () => {
  it('números com ponto de milhar e vírgula decimal', () => {
    expect(formatarNumero(12_742)).toBe('12.742');
    expect(formatarNumero(3.7, 1)).toBe('3,7');
    expect(formatarNumero(-65)).toBe('−65');
  });

  it('notação científica legível', () => {
    expect(s(formatarCientifico(5.9722e24, 3, 'kg'))).toBe('5,97 × 10²⁴ kg');
    expect(s(formatarCientifico(3e-15, 1, 'bar'))).toBe('3 × 10⁻¹⁵ bar');
    expect(s(formatarCientifico(9.996e5, 3))).toBe('1,00 × 10⁶');
  });

  it('comparações com a Terra', () => {
    expect(s(formatarComparacao(0.64169, 5.9722))).toBe('0,107 × Terra');
    expect(s(formatarComparacao(1.9884e30, 5.9722e24))).toBe('333.000 × Terra');
    expect(s(formatarComparacao(1.06e16, 5.9722e24))).toBe('1,77 × 10⁻⁹ da Terra');
  });

  it('duração em horas, dias ou anos terrestres conforme a grandeza', () => {
    expect(s(formatarDuracao(9.925))).toBe('9,93 horas');
    expect(s(formatarDuracao(23.9345))).toBe('23,9 horas');
    expect(s(formatarDuracao(-5832.6))).toBe('243,0 dias');
    expect(s(formatarDuracao(87.969 * 24))).toBe('88,0 dias');
    expect(s(formatarDuracao(4332.589 * 24))).toBe('11,86 anos terrestres');
    expect(s(formatarDuracao(60_189.018 * 24))).toBe('164,8 anos terrestres');
  });

  it('temperatura, distâncias, pressão e porcentagem', () => {
    expect(s(formatarTemperatura(-139.15))).toBe('−139 °C');
    expect(s(formatarKm(384_400))).toBe('384.400 km');
    expect(s(formatarUA(149.598e6))).toBe('1,00 UA');
    expect(s(formatarUA(57.909e6))).toBe('0,387 UA');
    expect(s(formatarUA(778.479e6))).toBe('5,20 UA');
    expect(s(formatarKmPorExtenso(57.909e6))).toBe('57,9 milhões de km');
    expect(s(formatarKmPorExtenso(4514.953e6))).toBe('4,51 bilhões de km');
    expect(s(formatarPressao(92))).toBe('92 bar');
    expect(s(formatarPressao(6.36e-3))).toBe('6,36 mbar');
    expect(s(formatarPressao(13e-6))).toBe('13 µbar');
    expect(s(formatarPercentual(96.5))).toBe('96,5 %');
  });

  it('grandezas por extenso e datas', () => {
    expect(formatarGrandeza(1.571e7)).toBe('15,7 milhões');
    expect(formatarGrandeza(1.2e9)).toBe('1,2 bilhão');
    expect(formatarMesAno('2026-10-31')).toBe('outubro de 2026');
  });
});
