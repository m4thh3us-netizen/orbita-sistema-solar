export function hermite(p0: number, m0: number, p1: number, m1: number, u: number): number {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1
  );
}

export function lombada(u: number): number {
  const v = u * (1 - u);
  return 16 * v * v;
}

export function anguloMaisProximo(destino: number, atual: number): number {
  const dois = Math.PI * 2;
  return destino + Math.round((atual - destino) / dois) * dois;
}

export function diferencaAngular(a: number, b: number): number {
  const d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) return d - Math.PI * 2;
  if (d <= -Math.PI) return d + Math.PI * 2;
  return d;
}

export const DURACAO_VOO_MIN = 1.2;
export const DURACAO_VOO_MAX = 1.8;

export function duracaoVoo(deslocamentoAlvo: number, distInicial: number, distFinal: number): number {
  const escala = Math.abs(Math.log(Math.max(distFinal, 1e-6) / Math.max(distInicial, 1e-6)));
  const relativo = deslocamentoAlvo / Math.max(distInicial, distFinal, 1e-6);
  const esforco = Math.log1p(relativo) + escala * 0.25;
  return Math.min(DURACAO_VOO_MAX, DURACAO_VOO_MIN + 0.25 * esforco);
}

export function amplitudeAfastamento(deslocamentoAlvo: number, distInicial: number, distFinal: number): number {
  return Math.log1p((0.5 * deslocamentoAlvo) / Math.max(distInicial, distFinal, 1e-6));
}

export function elevacaoExtra(deslocamentoAlvo: number, distInicial: number, distFinal: number): number {
  const relativo = deslocamentoAlvo / Math.max(distInicial, distFinal, 1e-6);
  return Math.min(0.35, 0.12 * Math.log1p(relativo));
}
