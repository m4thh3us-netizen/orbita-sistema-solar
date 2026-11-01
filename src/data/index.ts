// API pública da camada de dados (contrato compartilhado).
// Para adicionar um astro: crie a entrada no arquivo do sistema (ou um arquivo novo) e inclua-a
// em `bodies`. Nada na cena ou na interface depende de ids fixos.

import type { BodyId, CelestialBody } from './types.ts';
import { sol } from './sol.ts';
import { mercurio } from './mercurio.ts';
import { venus } from './venus.ts';
import { terra, lua } from './terra.ts';
import { marte, fobos, deimos } from './marte.ts';
import { ceres } from './ceres.ts';
import { jupiter, io, europa, ganimedes, calisto } from './jupiter.ts';
import { saturno, encelado, tita } from './saturno.ts';
import { urano, titania, oberon } from './urano.ts';
import { netuno, tritao } from './netuno.ts';
import { plutao, caronte } from './plutao.ts';
import { haumea } from './haumea.ts';
import { makemake } from './makemake.ts';
import { eris } from './eris.ts';

export type { BodyId, BodyType, CelestialBody, Dado, Fonte, Secao } from './types.ts';

/** Todos os astros, em ordem de distância ao Sol, cada lua logo depois do seu corpo principal. */
export const bodies: readonly CelestialBody[] = [
  sol,
  mercurio,
  venus,
  terra, lua,
  marte, fobos, deimos,
  ceres,
  jupiter, io, europa, ganimedes, calisto,
  saturno, encelado, tita,
  urano, titania, oberon,
  netuno, tritao,
  plutao, caronte,
  haumea,
  makemake,
  eris,
];

const porId = new Map<BodyId, CelestialBody>(bodies.map((b) => [b.id, b]));

export function getBody(id: BodyId): CelestialBody | undefined {
  return porId.get(id);
}

/** Filhos diretos de um astro, ordenados por `ordem` (distância ao pai). */
export function getChildren(id: BodyId, opts?: { exploravel3D?: boolean }): CelestialBody[] {
  return bodies
    .filter((b) => b.pai === id && (opts?.exploravel3D === undefined || b.exploravel3D === opts.exploravel3D))
    .sort((a, b) => a.ordem - b.ordem);
}

/** Ancestrais do mais externo ao pai direto: getAncestors('tita') → [sol, saturno]. */
export function getAncestors(id: BodyId): CelestialBody[] {
  const ancestrais: CelestialBody[] = [];
  let atual = getBody(id);
  while (atual?.pai) {
    const pai = getBody(atual.pai);
    if (!pai || ancestrais.includes(pai)) break; // pai inexistente ou ciclo: os testes acusam
    ancestrais.unshift(pai);
    atual = pai;
  }
  return ancestrais;
}

export { creditos } from './creditos.ts';

// Extras (fora do contrato, opcionais para a cena e a interface).
export { caminhoTextura1k } from './construtores.ts';
