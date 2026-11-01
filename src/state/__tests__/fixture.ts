import type { BodyId, BodyType, CelestialBody } from '@/data/types';

interface Opcoes {
  id: string;
  nome: string;
  tipo: BodyType;
  pai: BodyId | null;
  ordem: number;
  exploravel3D?: boolean;
  semiEixo?: number;
  secoes?: CelestialBody['conteudo']['secoes'];
  luas?: CelestialBody['conteudo']['luas'];
  artistica?: boolean;
  classificacao?: string;
}

function corpo(o: Opcoes): CelestialBody {
  return {
    id: o.id,
    nome: o.nome,
    tipo: o.tipo,
    pai: o.pai,
    ordem: o.ordem,
    exploravel3D: o.exploravel3D ?? true,
    fisico: { raioMedioKm: 1000, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 24 },
    orbita: o.pai
      ? {
          semiEixoMaiorKm: o.semiEixo ?? o.ordem * 1e6,
          periodoOrbitalDias: 100,
          inclinacaoGraus: 0,
          excentricidade: 0,
        }
      : null,
    aparencia: {
      corBase: '#888888',
      corAcento: '#3355aa',
      texturas: {},
      representacaoArtistica: o.artistica ?? false,
    },
    conteudo: {
      classificacao: o.classificacao ?? 'Astro de teste',
      descricao: `Descrição de ${o.nome}.`,
      secoes: o.secoes ?? { 'visao-geral': { texto: `Visão geral de ${o.nome}.` } },
      luas: o.luas ?? null,
    },
    fontes: [
      {
        id: 'nasa',
        titulo: 'NASA Fact Sheet',
        url: 'https://nssdc.gsfc.nasa.gov/',
        acessadoEm: '2026-10-01',
      },
    ],
    atualizadoEm: '2026-10-31',
  };
}

const semLuas = (mensagem: string) => ({
  totalConhecidas: 0,
  atualizadoEm: '2026-10-31',
  fonteId: 'nasa',
  mensagemSemLuas: mensagem,
});

export const bodies: readonly CelestialBody[] = [
  corpo({
    id: 'sol',
    nome: 'Sol',
    tipo: 'estrela',
    pai: null,
    ordem: 0,
    classificacao: 'Estrela anã amarela',
  }),
  corpo({
    id: 'mercurio',
    nome: 'Mercúrio',
    tipo: 'planeta',
    pai: 'sol',
    ordem: 1,
    classificacao: 'Planeta rochoso',
    luas: semLuas('Mercúrio não tem luas.'),
  }),
  corpo({
    id: 'terra',
    nome: 'Terra',
    tipo: 'planeta',
    pai: 'sol',
    ordem: 3,
    classificacao: 'Planeta rochoso',
    secoes: {
      'visao-geral': {
        texto: 'Nosso planeta.',
        dados: [
          {
            rotulo: 'Diâmetro',
            valor: '12.742 km',
            nota: 'Diâmetro equatorial médio',
            fonteId: 'nasa',
          },
        ],
      },
      atmosfera: { texto: 'Nitrogênio e oxigênio.' },
      curiosidades: { itens: ['Único planeta com vida conhecida.'] },
    },
    luas: { totalConhecidas: 1, atualizadoEm: '2026-10-31', fonteId: 'nasa' },
  }),
  corpo({
    id: 'marte',
    nome: 'Marte',
    tipo: 'planeta',
    pai: 'sol',
    ordem: 4,
    classificacao: 'Planeta rochoso',
    luas: { totalConhecidas: 2, atualizadoEm: '2026-10-31', fonteId: 'nasa' },
  }),
  corpo({
    id: 'ceres',
    nome: 'Ceres',
    tipo: 'planeta-anao',
    pai: 'sol',
    ordem: 5,
    semiEixo: 4.1e8,
    artistica: true,
    luas: semLuas('Ceres não tem luas.'),
  }),
  corpo({
    id: 'saturno',
    nome: 'Saturno',
    tipo: 'planeta',
    pai: 'sol',
    ordem: 6,
    classificacao: 'Gigante gasoso',
    secoes: {
      'visao-geral': { texto: 'O senhor dos anéis.' },
      composicao: { texto: 'Hidrogênio e hélio.' },
      atmosfera: { texto: 'Faixas e tempestades.' },
    },
    luas: { totalConhecidas: 274, atualizadoEm: '2026-03-15', fonteId: 'nasa' },
  }),
  corpo({
    id: 'makemake',
    nome: 'Makemake',
    tipo: 'planeta-anao',
    pai: 'sol',
    ordem: 12,
    artistica: true,
    luas: { totalConhecidas: 1, atualizadoEm: '2026-10-31', fonteId: 'nasa' },
  }),
  corpo({
    id: 'lua',
    nome: 'Lua',
    tipo: 'lua',
    pai: 'terra',
    ordem: 1,
    classificacao: 'Satélite natural',
  }),
  corpo({ id: 'fobos', nome: 'Fobos', tipo: 'lua', pai: 'marte', ordem: 1 }),
  corpo({ id: 'deimos', nome: 'Deimos', tipo: 'lua', pai: 'marte', ordem: 2 }),
  corpo({
    id: 'encelado',
    nome: 'Encélado',
    tipo: 'lua',
    pai: 'saturno',
    ordem: 2,
    classificacao: 'Lua gelada',
  }),
  corpo({
    id: 'tita',
    nome: 'Titã',
    tipo: 'lua',
    pai: 'saturno',
    ordem: 6,
    classificacao: 'Lua com atmosfera',
  }),
  corpo({ id: 'pan', nome: 'Pã', tipo: 'lua', pai: 'saturno', ordem: 1, exploravel3D: false }),
];

export function getBody(id: BodyId): CelestialBody | undefined {
  return bodies.find((c) => c.id === id);
}

export function getChildren(id: BodyId, opts?: { exploravel3D?: boolean }): CelestialBody[] {
  return bodies
    .filter(
      (c) =>
        c.pai === id && (opts?.exploravel3D === undefined || c.exploravel3D === opts.exploravel3D),
    )
    .sort((a, b) => a.ordem - b.ordem);
}

export function getAncestors(id: BodyId): CelestialBody[] {
  const resultado: CelestialBody[] = [];
  let atual = getBody(id);
  while (atual?.pai) {
    const pai = getBody(atual.pai);
    if (!pai) break;
    resultado.unshift(pai);
    atual = pai;
  }
  return resultado;
}

export const creditos = [
  { recurso: 'Textura de teste', autor: 'Autor', licenca: 'CC0', url: 'https://example.org' },
];
