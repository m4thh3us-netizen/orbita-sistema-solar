/**
 * Luz única da cena: ponto no Sol sem decaimento (as distâncias são ilustrativas) e
 * um preenchimento ambiente mínimo para o lado noturno não ficar 100% preto.
 * Os shaders próprios (Terra, nuvens, anéis) usam a mesma fórmula do MeshStandardMaterial:
 * radiância = albedo · (N·L) · luz / π.
 */
export const LUZ_SOL = 3.3;
export const LUZ_AMBIENTE = 0.16;
export const COR_LUZ_SOL = '#fff4e6';
export const COR_FUNDO = '#05060A';

/** Valores HDR acima disto entram no bloom; só o Sol e a coroa chegam lá. */
export const LIMIAR_BLOOM = 1.15;
