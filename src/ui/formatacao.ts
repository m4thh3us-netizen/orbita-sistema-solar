import type { BodyType, CelestialBody } from '@/data/types';
import type { Velocidade } from '@/state/store';

function dataLocal(iso: string): Date | null {
  const partes = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso);
  if (!partes) return null;
  return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3] ?? 1));
}

const FORMATO_DATA = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const FORMATO_MES_ANO = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

export function formatarData(iso: string): string {
  const data = dataLocal(iso);
  return data ? FORMATO_DATA.format(data) : iso;
}

export function formatarMesAno(iso: string): string {
  const data = dataLocal(iso);
  return data ? FORMATO_MES_ANO.format(data) : iso;
}

export function formatarVelocidade(v: Velocidade): string {
  return `${String(v).replace('.', ',')}×`;
}

const ROTULOS_TIPO: Record<BodyType, string> = {
  estrela: 'Estrela',
  planeta: 'Planeta',
  'planeta-anao': 'Planeta anão',
  lua: 'Lua',
};

export function rotuloTipo(tipo: BodyType): string {
  return ROTULOS_TIPO[tipo];
}

const ARTIGO_FEMININO = new Set(['terra']);

export function deNome(corpo: Pick<CelestialBody, 'id' | 'nome'>): string {
  return ARTIGO_FEMININO.has(corpo.id) ? `da ${corpo.nome}` : `de ${corpo.nome}`;
}

export function aNome(corpo: Pick<CelestialBody, 'id' | 'nome'>): string {
  return ARTIGO_FEMININO.has(corpo.id) ? `à ${corpo.nome}` : `a ${corpo.nome}`;
}

export function plural(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

export function urlPublica(caminho: string): string {
  return `${import.meta.env.BASE_URL}${caminho.replace(/^\/+/, '')}`;
}
