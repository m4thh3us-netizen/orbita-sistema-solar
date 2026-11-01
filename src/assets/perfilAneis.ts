/**
 * Perfil procedural dos anéis (textura 1D RGBA), usado quando `texturas.aneis` não existe
 * ou falha. Os raios das divisões são reais (km); a textura cobre de `internoKm` a
 * `externoKm` dos dados, então a divisão de Cassini cai na posição certa.
 */
import { ClampToEdgeWrapping, DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RGBAFormat } from 'three';
import { aleatorio, hashTexto } from '@/scene/orbitas';

interface Faixa {
  de: number;
  ate: number;
  alfa: number;
  cor: [number, number, number];
}

// Saturno (km a partir do centro). Fonte dos limites: NASA Saturn Fact Sheet / PDS Rings Node.
const SATURNO: Faixa[] = [
  { de: 66_900, ate: 74_510, alfa: 0.04, cor: [0.35, 0.32, 0.29] }, // D
  { de: 74_658, ate: 92_000, alfa: 0.22, cor: [0.42, 0.38, 0.33] }, // C
  { de: 92_000, ate: 117_580, alfa: 0.92, cor: [0.86, 0.78, 0.64] }, // B
  { de: 117_580, ate: 122_170, alfa: 0.05, cor: [0.4, 0.37, 0.33] }, // Divisão de Cassini
  { de: 122_170, ate: 133_423, alfa: 0.62, cor: [0.76, 0.7, 0.6] }, // A (interno)
  { de: 133_423, ate: 133_745, alfa: 0.03, cor: [0.4, 0.37, 0.33] }, // Divisão de Encke
  { de: 133_745, ate: 136_775, alfa: 0.55, cor: [0.74, 0.68, 0.58] }, // A (externo)
  { de: 140_130, ate: 140_230, alfa: 0.5, cor: [0.8, 0.76, 0.7] }, // F
];

// Urano: anéis estreitos e escuros (6, 5, 4, α, β, η, γ, δ, λ, ε).
const URANO: Faixa[] = [
  [41_837, 2],
  [42_234, 2],
  [42_571, 2],
  [44_718, 6],
  [45_661, 7],
  [47_176, 2],
  [47_627, 3],
  [48_300, 4],
  [50_023, 2],
  [51_149, 40],
].map(([centro, largura]) => ({
  de: centro - largura,
  ate: centro + largura,
  alfa: largura > 20 ? 0.75 : 0.5,
  cor: [0.36, 0.38, 0.4] as [number, number, number],
}));

const PERFIS: Record<string, Faixa[]> = { saturno: SATURNO, urano: URANO };

export function criarPerfilAneis(id: string, internoKm: number, externoKm: number, amostras = 2048): DataTexture {
  const dados = new Uint8Array(amostras * 4);
  const faixas = PERFIS[id];
  const sorteio = aleatorio(hashTexto(id + ':aneis'));
  // Ondulações finas fixas por planeta (soma de senoides com fases sorteadas).
  const ondas = Array.from({ length: 6 }, (_, i) => ({ f: 40 + i * 37 + sorteio() * 20, fase: sorteio() * 6.28, a: 0.06 / (i + 1) }));
  // Faixas estreitas têm de ocupar ao menos ~1,5 amostra para não sumirem no mipmap.
  const kmPorAmostra = (externoKm - internoKm) / amostras;

  for (let i = 0; i < amostras; i++) {
    const u = (i + 0.5) / amostras;
    const km = internoKm + u * (externoKm - internoKm);
    let alfa = 0;
    let cor: [number, number, number] = [0.7, 0.66, 0.6];
    if (faixas) {
      for (const f of faixas) {
        const meia = Math.max((f.ate - f.de) / 2, kmPorAmostra * 0.75);
        const centro = (f.de + f.ate) / 2;
        if (Math.abs(km - centro) <= meia) {
          alfa = f.alfa;
          cor = f.cor;
        }
      }
    } else {
      // Genérico (Júpiter, Netuno, Haumea): anel tênue e difuso.
      alfa = 0.08 * Math.sin(Math.PI * u) ** 2;
    }
    let ondulacao = 1;
    for (const o of ondas) ondulacao += o.a * Math.sin(u * o.f + o.fase);
    alfa = Math.min(1, alfa * ondulacao);
    const brilho = 0.9 + 0.2 * (ondulacao - 1);
    dados[i * 4] = Math.round(Math.min(1, cor[0] * brilho) * 255);
    dados[i * 4 + 1] = Math.round(Math.min(1, cor[1] * brilho) * 255);
    dados[i * 4 + 2] = Math.round(Math.min(1, cor[2] * brilho) * 255);
    dados[i * 4 + 3] = Math.round(alfa * 255);
  }

  const textura = new DataTexture(dados, amostras, 1, RGBAFormat);
  textura.colorSpace = NoColorSpace;
  textura.wrapS = ClampToEdgeWrapping;
  textura.wrapT = ClampToEdgeWrapping;
  textura.magFilter = LinearFilter;
  textura.minFilter = LinearMipmapLinearFilter;
  textura.generateMipmaps = true;
  textura.needsUpdate = true;
  return textura;
}
