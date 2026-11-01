/**
 * Trajetória dos voos de câmera. Cada grandeza (alvo xyz, azimute, ângulo polar e
 * log da distância) é interpolada por Hermite cúbico entre o estado atual — com a
 * velocidade atual — e o destino, que chega com a velocidade do astro. Assim um voo
 * interrompido por outro parte de onde está, na velocidade em que está, sem salto.
 * Interpolar o log da distância dá um zoom perceptualmente uniforme; uma "lombada"
 * afasta e eleva a câmera no meio de voos longos (não atravessa o Sol nem planetas).
 */

/** Hermite cúbico; `m0` e `m1` são as derivadas já multiplicadas pela duração. */
export function hermite(p0: number, m0: number, p1: number, m1: number, u: number): number {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1
  );
}

/** 16·u²·(1−u)²: vale 0 nas pontas com derivada 0 e 1 no meio. */
export function lombada(u: number): number {
  const v = u * (1 - u);
  return 16 * v * v;
}

/** Ângulo equivalente a `destino` (± 2πk) mais próximo de `atual`. */
export function anguloMaisProximo(destino: number, atual: number): number {
  const dois = Math.PI * 2;
  return destino + Math.round((atual - destino) / dois) * dois;
}

/** Diferença angular em (−π, π]. */
export function diferencaAngular(a: number, b: number): number {
  const d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) return d - Math.PI * 2;
  if (d <= -Math.PI) return d + Math.PI * 2;
  return d;
}

export const DURACAO_VOO_MIN = 1.2;
export const DURACAO_VOO_MAX = 1.8;

/** Duração entre 1,2 e 1,8 s, crescendo com o deslocamento e com a mudança de escala. */
export function duracaoVoo(deslocamentoAlvo: number, distInicial: number, distFinal: number): number {
  const escala = Math.abs(Math.log(Math.max(distFinal, 1e-6) / Math.max(distInicial, 1e-6)));
  const relativo = deslocamentoAlvo / Math.max(distInicial, distFinal, 1e-6);
  const esforco = Math.log1p(relativo) + escala * 0.25;
  return Math.min(DURACAO_VOO_MAX, DURACAO_VOO_MIN + 0.25 * esforco);
}

/** Quanto o log da distância sobe no meio do voo (afastar para ver o caminho). */
export function amplitudeAfastamento(deslocamentoAlvo: number, distInicial: number, distFinal: number): number {
  return Math.log1p((0.5 * deslocamentoAlvo) / Math.max(distInicial, distFinal, 1e-6));
}

/** Quanto a câmera sobe (rad de ângulo polar) no meio do voo. */
export function elevacaoExtra(deslocamentoAlvo: number, distInicial: number, distFinal: number): number {
  const relativo = deslocamentoAlvo / Math.max(distInicial, distFinal, 1e-6);
  return Math.min(0.35, 0.12 * Math.log1p(relativo));
}
