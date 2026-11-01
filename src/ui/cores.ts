type Rgb = [number, number, number];

export const COR_FUNDO = '#05060A';

export function hexParaRgb(cor: string): Rgb | null {
  const hex = cor.trim().replace(/^#/, '');
  const completo =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  if (!/^[0-9a-f]{6}$/i.test(completo)) return null;
  const n = Number.parseInt(completo, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbParaHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** Luminância relativa (WCAG 2.x). */
export function luminancia([r, g, b]: Rgb): number {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function contraste(a: Rgb, b: Rgb): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

/**
 * Clareia a cor de acento (misturando com branco) até atingir o contraste mínimo sobre o fundo.
 * Os acentos vêm dos dados; alguns (azuis e vermelhos escuros) não passariam no AA sem isso.
 */
export function garantirContraste(cor: string, fundo = COR_FUNDO, minimo = 4.5): string {
  const rgb = hexParaRgb(cor);
  const rgbFundo = hexParaRgb(fundo);
  if (!rgb || !rgbFundo) return cor;
  if (contraste(rgb, rgbFundo) >= minimo) return rgbParaHex(rgb);
  for (let t = 0.05; t <= 1; t += 0.05) {
    const misturada: Rgb = [
      rgb[0] + (255 - rgb[0]) * t,
      rgb[1] + (255 - rgb[1]) * t,
      rgb[2] + (255 - rgb[2]) * t,
    ];
    if (contraste(misturada, rgbFundo) >= minimo) return rgbParaHex(misturada);
  }
  return '#ffffff';
}
