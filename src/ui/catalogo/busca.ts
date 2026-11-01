import type { BodyType, CelestialBody } from '@/data/types';
import { porOrdem } from '@/state/navegacao';
import { deNome } from '../formatacao';

export type Filtro = 'todos' | BodyType;

export const FILTROS: readonly { id: Filtro; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'estrela', rotulo: 'Sol' },
  { id: 'planeta', rotulo: 'Planetas' },
  { id: 'planeta-anao', rotulo: 'Planetas anões' },
  { id: 'lua', rotulo: 'Luas' },
];

export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export interface Trecho {
  inicio: number;
  fim: number;
}

export function localizarTrecho(texto: string, consulta: string): Trecho | null {
  const alvo = normalizar(consulta.trim());
  if (!alvo) return null;

  let normalizado = '';
  const inicioOriginal: number[] = [];
  const fimOriginal: number[] = [];
  let i = 0;
  for (const caractere of texto) {
    const n = normalizar(caractere);
    for (let k = 0; k < n.length; k++) {
      inicioOriginal.push(i);
      fimOriginal.push(i + caractere.length);
    }
    normalizado += n;
    i += caractere.length;
  }

  const pos = normalizado.indexOf(alvo);
  if (pos === -1) return null;
  let fim = fimOriginal[pos + alvo.length - 1];
  while (fim < texto.length && /\p{M}/u.test(texto[fim])) fim++;
  return { inicio: inicioOriginal[pos], fim };
}

export interface ResultadoBusca {
  corpo: CelestialBody;
  campo: 'nome' | 'classificacao' | null;
  trecho: Trecho | null;
}

export function buscarCorpos(
  corpos: readonly CelestialBody[],
  consulta: string,
  filtro: Filtro,
): ResultadoBusca[] {
  const vazia = normalizar(consulta.trim()) === '';
  const resultados: ResultadoBusca[] = [];
  for (const corpo of corpos) {
    if (filtro !== 'todos' && corpo.tipo !== filtro) continue;
    if (vazia) {
      resultados.push({ corpo, campo: null, trecho: null });
      continue;
    }
    const noNome = localizarTrecho(corpo.nome, consulta);
    if (noNome) {
      resultados.push({ corpo, campo: 'nome', trecho: noNome });
      continue;
    }
    const naClassificacao = localizarTrecho(corpo.conteudo.classificacao, consulta);
    if (naClassificacao)
      resultados.push({ corpo, campo: 'classificacao', trecho: naClassificacao });
  }
  return resultados;
}

export interface GrupoCatalogo {
  id: string;
  titulo: string;
  itens: ResultadoBusca[];
}

const TITULOS_TIPO: Record<Exclude<BodyType, 'lua'>, string> = {
  estrela: 'Estrela',
  planeta: 'Planetas',
  'planeta-anao': 'Planetas anões',
};

export function agruparResultados(
  resultados: readonly ResultadoBusca[],
  obterCorpo: (id: string) => CelestialBody | undefined,
  contarLuas: (paiId: string) => number,
): GrupoCatalogo[] {
  const ordenados = [...resultados].sort((a, b) => porOrdem(a.corpo, b.corpo));
  const grupos: GrupoCatalogo[] = [];

  for (const tipo of ['estrela', 'planeta', 'planeta-anao'] as const) {
    const itens = ordenados.filter((r) => r.corpo.tipo === tipo);
    if (itens.length) grupos.push({ id: tipo, titulo: TITULOS_TIPO[tipo], itens });
  }

  const luasPorPai = new Map<string, ResultadoBusca[]>();
  for (const r of ordenados) {
    if (r.corpo.tipo !== 'lua' || !r.corpo.pai) continue;
    luasPorPai.set(r.corpo.pai, [...(luasPorPai.get(r.corpo.pai) ?? []), r]);
  }
  const pais = [...luasPorPai.keys()]
    .map((id) => obterCorpo(id))
    .filter((c): c is CelestialBody => c !== undefined)
    .sort((a, b) => {
      const peso = (c: CelestialBody) => (c.tipo === 'planeta' ? 0 : 1);
      return peso(a) - peso(b) || porOrdem(a, b);
    });
  for (const pai of pais) {
    const total = contarLuas(pai.id);
    grupos.push({
      id: `luas-${pai.id}`,
      titulo: `${total === 1 ? 'Lua' : 'Luas'} ${deNome(pai)}`,
      itens: luasPorPai.get(pai.id) ?? [],
    });
  }
  return grupos;
}
