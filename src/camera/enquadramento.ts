/**
 * Enquadramento com a interface por cima do canvas. `ocupacaoInterface` diz quantos px
 * cada borda tem coberta por painéis; a câmera desloca a projeção (setViewOffset) para
 * que o centro da área livre vire o centro óptico, e escolhe a distância para que o astro
 * caiba nessa área. Funções puras, sem three.
 */
export interface Ocupacao {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A área livre nunca fica menor que esta fração da tela, mesmo com painéis enormes. */
const FRACAO_LIVRE_MINIMA = 0.3;

function limitarPar(a: number, b: number, total: number): [number, number] {
  const x = Math.max(0, Number.isFinite(a) ? a : 0);
  const y = Math.max(0, Number.isFinite(b) ? b : 0);
  const maximo = total * (1 - FRACAO_LIVRE_MINIMA);
  const soma = x + y;
  if (soma <= maximo || soma === 0) return [x, y];
  const k = maximo / soma;
  return [x * k, y * k];
}

export function sanitizarOcupacao(o: Ocupacao, largura: number, altura: number): Ocupacao {
  const [left, right] = limitarPar(o.left, o.right, largura);
  const [top, bottom] = limitarPar(o.top, o.bottom, altura);
  return { top, right, bottom, left };
}

export function areaLivre(o: Ocupacao, largura: number, altura: number): { largura: number; altura: number } {
  const s = sanitizarOcupacao(o, largura, altura);
  return { largura: largura - s.left - s.right, altura: altura - s.top - s.bottom };
}

/** Deslocamento em px do centro da área livre em relação ao centro da tela (y para baixo). */
export function deslocamentoCentro(o: Ocupacao, largura: number, altura: number): { dx: number; dy: number } {
  const s = sanitizarOcupacao(o, largura, altura);
  return { dx: (s.left - s.right) / 2, dy: (s.top - s.bottom) / 2 };
}

/**
 * Distância do centro de uma esfera de raio `raio` para que ela ocupe `fracao` do menor
 * lado da área livre. `fovGraus` é o campo de visão vertical da tela inteira.
 */
export function distanciaEnquadramento(
  raio: number,
  fovGraus: number,
  largura: number,
  altura: number,
  o: Ocupacao,
  fracao: number,
): number {
  const livre = areaLivre(o, largura, altura);
  const ladoPx = Math.max(1, Math.min(livre.largura, livre.altura));
  const tanMeioFov = Math.tan((fovGraus * Math.PI) / 360);
  const tanAlvo = ((fracao * ladoPx) / Math.max(1, altura)) * tanMeioFov;
  const angulo = Math.atan(tanAlvo);
  return raio / Math.sin(angulo);
}
