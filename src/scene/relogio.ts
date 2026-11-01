/**
 * Relógio próprio da simulação. Acumula "segundos de cena" (um segundo real em 1×),
 * então pausar e retomar continua do mesmo instante, sem salto. Mudanças de velocidade
 * e de pausa são suavizadas (~0,2 s), exceto com movimento reduzido.
 */
export interface EntradaRelogio {
  velocidade: number;
  pausada: boolean;
  rotacaoPausada: boolean;
  suavizar: boolean;
}

/** Quadros mais longos que isto (aba em segundo plano, depurador) não adiantam o relógio. */
export const DT_MAXIMO = 0.1;
const CONSTANTE_SUAVIZACAO = 0.18;

export class RelogioSimulacao {
  /** Tempo das órbitas, em segundos de cena. */
  tempoOrbital = 0;
  /** Tempo das rotações axiais; para quando a rotação do astro está pausada. */
  tempoRotacao = 0;
  velocidadeEfetiva = 1;
  fatorRotacao = 1;

  constructor(tempoInicial = 0) {
    this.tempoOrbital = tempoInicial;
    this.tempoRotacao = tempoInicial;
  }

  avancar(dtReal: number, entrada: EntradaRelogio): void {
    const dt = Math.min(Math.max(dtReal, 0), DT_MAXIMO);
    const alvoVelocidade = entrada.pausada ? 0 : entrada.velocidade;
    const alvoRotacao = entrada.rotacaoPausada ? 0 : 1;
    if (entrada.suavizar) {
      const k = 1 - Math.exp(-dt / CONSTANTE_SUAVIZACAO);
      this.velocidadeEfetiva += (alvoVelocidade - this.velocidadeEfetiva) * k;
      this.fatorRotacao += (alvoRotacao - this.fatorRotacao) * k;
      if (Math.abs(this.velocidadeEfetiva - alvoVelocidade) < 1e-4) this.velocidadeEfetiva = alvoVelocidade;
      if (Math.abs(this.fatorRotacao - alvoRotacao) < 1e-4) this.fatorRotacao = alvoRotacao;
    } else {
      this.velocidadeEfetiva = alvoVelocidade;
      this.fatorRotacao = alvoRotacao;
    }
    this.tempoOrbital += dt * this.velocidadeEfetiva;
    this.tempoRotacao += dt * this.velocidadeEfetiva * this.fatorRotacao;
  }
}
