import type { CelestialBody, Dado } from './types.ts';
import type { FonteId } from './fontes.ts';
import {
  celsiusParaKelvin,
  formatarCientifico,
  formatarComparacao,
  formatarDuracao,
  formatarKelvin,
  formatarKm,
  formatarKmPorExtenso,
  formatarMesAno,
  formatarNumero,
  formatarPercentual,
  formatarPressao,
  formatarSignificativos,
  formatarTemperatura,
  formatarUA,
  kelvinParaCelsius,
  ESPACO,
} from './formatar.ts';

export const TERRA = { massaKg: 5.9722e24, gravidadeMs2: 9.8 } as const;

const G = 6.6743e-11;

export function massaDeGM(gmKm3s2: number): number {
  return (gmKm3s2 * 1e9) / G;
}

export function gravidadeDeGM(gmKm3s2: number, raioKm: number): number {
  return (gmKm3s2 * 1e9) / (raioKm * 1e3) ** 2;
}

type Temperatura = { c: number } | { k: number };

function emCelsius(t: Temperatura): number {
  return 'c' in t ? t.c : kelvinParaCelsius(t.k);
}

function emKelvin(t: Temperatura): number {
  return 'k' in t ? t.k : celsiusParaKelvin(t.c);
}

export function dado(rotulo: string, valor: string, fonteId?: FonteId, nota?: string, valorNumerico?: number): Dado {
  const d: Dado = { rotulo, valor };
  if (valorNumerico !== undefined) d.valorNumerico = valorNumerico;
  if (nota) d.nota = nota;
  if (fonteId) d.fonteId = fonteId;
  return d;
}

export function diametro(km: number, fonteId: FonteId, nota?: string): Dado {
  return dado('Diâmetro', formatarKm(km, km < 100 ? 1 : 0), fonteId, nota, km * 1e3);
}

export function massa(kg: number, fonteId: FonteId, nota?: string): Dado {
  const valor = `${formatarCientifico(kg, 3, 'kg')} (${formatarComparacao(kg, TERRA.massaKg)})`;
  return dado('Massa', valor, fonteId, nota, kg);
}

export function gravidade(ms2: number, fonteId: FonteId, nota?: string): Dado {
  const numero = ms2 >= 1 ? formatarNumero(ms2, 1) : formatarSignificativos(ms2, 2);
  const valor = `${numero}${ESPACO}m/s² (${formatarComparacao(ms2, TERRA.gravidadeMs2, 'Terra', 2)})`;
  return dado('Gravidade na superfície', valor, fonteId, nota, ms2);
}

export function temperatura(t: Temperatura, representa: string, fonteId: FonteId, rotulo = 'Temperatura'): Dado {
  const nota = `${representa} (${formatarKelvin(emKelvin(t))}).`;
  return dado(rotulo, formatarTemperatura(emCelsius(t)), fonteId, nota, emKelvin(t));
}

export function faixaTemperatura(min: Temperatura, max: Temperatura, representa: string, fonteId: FonteId, rotulo = 'Temperatura'): Dado {
  const valor = `${formatarTemperatura(emCelsius(min))} a ${formatarTemperatura(emCelsius(max))}`;
  const nota = `${representa} (${formatarKelvin(emKelvin(min))} a ${formatarKelvin(emKelvin(max))}).`;
  return dado(rotulo, valor, fonteId, nota, emKelvin(max));
}

export function rotacao(horas: number, fonteId: FonteId, opcoes: { sincrona?: boolean; nota?: string } = {}): Dado {
  const marcas = [opcoes.sincrona ? 'síncrona' : '', horas < 0 ? 'retrógrada' : ''].filter(Boolean);
  const valor = formatarDuracao(horas) + (marcas.length ? ` (${marcas.join(', ')})` : '');
  return dado('Período de rotação', valor, fonteId, opcoes.nota, horas * 3600);
}

export function periodoOrbital(dias: number, fonteId: FonteId, opcoes: { retrograda?: boolean; nota?: string } = {}): Dado {
  const valor = formatarDuracao(dias * 24) + (opcoes.retrograda ? ' (retrógrada)' : '');
  return dado('Período orbital', valor, fonteId, opcoes.nota, dias * 86400);
}

export function distanciaDoSol(km: number, fonteId: FonteId, nota?: string): Dado {
  return dado('Distância média do Sol', `${formatarUA(km)} (${formatarKmPorExtenso(km)})`, fonteId, nota, km * 1e3);
}

export function distanciaAte(km: number, nomePai: string, fonteId: FonteId, nota?: string): Dado {
  return dado(`Distância média até ${nomePai}`, formatarKm(km), fonteId, nota, km * 1e3);
}

export function pressaoSuperficial(bar: number, fonteId: FonteId, nota?: string, rotulo = 'Pressão na superfície'): Dado {
  return dado(rotulo, formatarPressao(bar), fonteId, nota, bar * 1e5);
}

export function inclinacaoAxial(graus: number, fonteId: FonteId, nota?: string): Dado {
  return dado('Inclinação do eixo', `${formatarNumero(graus, graus < 10 ? 2 : 1)}°`, fonteId, nota, graus);
}

export function percentual(rotulo: string, p: number, fonteId: FonteId, nota?: string, casas = 1): Dado {
  return dado(rotulo, formatarPercentual(p, casas), fonteId, nota, p / 100);
}

export function aneis(tem: boolean, descricao: string, fonteId?: FonteId): Dado {
  return dado('Anéis', tem ? 'Sim' : 'Não', fonteId, descricao);
}

type Luas = NonNullable<CelestialBody['conteudo']['luas']>;

export const LUAS_VERIFICADAS_EM = '2026-10-31';

export function luas(
  totalConhecidas: number | null,
  fonteId: FonteId,
  mensagemSemLuas?: string,
  verificadoEm: string = LUAS_VERIFICADAS_EM,
): Luas {
  const l: Luas = { totalConhecidas, atualizadoEm: verificadoEm, fonteId };
  if (mensagemSemLuas) l.mensagemSemLuas = mensagemSemLuas;
  return l;
}

export function luasConhecidas(l: Luas): Dado {
  const valor = l.totalConhecidas === null ? 'Desconhecido' : formatarNumero(l.totalConhecidas);
  const nota = l.totalConhecidas === 0
    ? undefined
    : `Número conferido em ${formatarMesAno(l.atualizadoEm)}; novas luas são descobertas com frequência.`;
  return dado('Luas conhecidas', valor, l.fonteId as FonteId, nota, l.totalConhecidas ?? undefined);
}

type Texturas = CelestialBody['aparencia']['texturas'];
export type TipoTextura = keyof Texturas;

export function texturas(id: string, ...tipos: TipoTextura[]): Texturas {
  const t: Texturas = {};
  for (const tipo of tipos) t[tipo] = `textures/${id}/${tipo}.webp`;
  return t;
}

export function caminhoTextura1k(caminho: string): string {
  return caminho.replace(/\.webp$/, '-1k.webp');
}
