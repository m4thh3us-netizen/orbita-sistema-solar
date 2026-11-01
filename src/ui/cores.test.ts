import { describe, expect, it } from 'vitest';
import { contraste, COR_FUNDO, garantirContraste, hexParaRgb } from './cores';

const razao = (cor: string) => contraste(hexParaRgb(cor)!, hexParaRgb(COR_FUNDO)!);

describe('garantirContraste', () => {
  it('mantém acentos que já passam no AA', () => {
    expect(garantirContraste('#f2b45a')).toBe('#f2b45a');
  });

  it('clareia acentos escuros até 4,5:1 sobre o fundo', () => {
    const ajustada = garantirContraste('#1b2a6b');
    expect(ajustada).not.toBe('#1b2a6b');
    expect(razao(ajustada)).toBeGreaterThanOrEqual(4.5);
  });

  it('aceita #rgb e devolve a entrada se não entender o formato', () => {
    expect(razao(garantirContraste('#235'))).toBeGreaterThanOrEqual(4.5);
    expect(garantirContraste('rebeccapurple')).toBe('rebeccapurple');
  });
});
