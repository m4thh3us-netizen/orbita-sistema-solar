import type { CelestialBody } from '@/data/types';
import type { Aba } from '@/state/interface';

export const ABAS: readonly { id: Aba; rotulo: string }[] = [
  { id: 'visao-geral', rotulo: 'Visão geral' },
  { id: 'composicao', rotulo: 'Composição e estrutura' },
  { id: 'atmosfera', rotulo: 'Atmosfera' },
  { id: 'luas', rotulo: 'Luas' },
  { id: 'curiosidades', rotulo: 'Curiosidades' },
];

export function abasDisponiveis(corpo: CelestialBody): Aba[] {
  return ABAS.filter(({ id }) =>
    id === 'luas' ? corpo.conteudo.luas !== null : corpo.conteudo.secoes[id] !== undefined,
  ).map(({ id }) => id);
}

export function resolverAba(atual: Aba, disponiveis: readonly Aba[]): Aba | null {
  if (disponiveis.includes(atual)) return atual;
  if (disponiveis.includes('visao-geral')) return 'visao-geral';
  return disponiveis[0] ?? null;
}
