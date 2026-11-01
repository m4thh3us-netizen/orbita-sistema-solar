import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import { aneis, diametro, distanciaDoSol, luas, luasConhecidas, massa, periodoOrbital, rotacao, texturas } from './construtores.ts';
import { KM_POR_UA } from './formatar.ts';

// Elementos orbitais osculantes do JPL SBDB (época JD 2461200,5).
const A_UA = 43.06029024;

const luasHaumea = luas(2, 'nasa-haumea');

export const haumea = {
  id: 'haumea',
  nome: 'Haumea',
  tipo: 'planeta-anao',
  pai: 'sol',
  ordem: 11,
  exploravel3D: true,

  // Raio: metade do diâmetro de referência da NASA (Haumea é um elipsoide alongado).
  // Obliquidade desconhecida: 0 é convenção de renderização, não um dado (ver docs/dados.md).
  fisico: { raioMedioKm: 870, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 3.9154 },
  orbita: { semiEixoMaiorKm: A_UA * KM_POR_UA, periodoOrbitalDias: 103_208.117, inclinacaoGraus: 28.208, excentricidade: 0.1944 },

  aparencia: {
    corBase: '#DAD6D2',
    corAcento: '#9FE8C8',
    texturas: texturas('haumea', 'mapa', 'aneis'),
    // Anel com raio de ~2.287 km e largura de ~70 km (Ortiz et al., 2017).
    aneis: { raioInternoKm: 2252, raioExternoKm: 2322 },
    representacaoArtistica: true,
  },

  conteudo: {
    classificacao: 'Planeta anão do Cinturão de Kuiper',
    descricao:
      'Haumea é um planeta anão do Cinturão de Kuiper que gira tão rápido, uma volta a cada 3,9 horas, que ficou alongado como uma bola de futebol americano. Foi o primeiro objeto do Cinturão de Kuiper em que se descobriu um anel.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(1740, 'nasa-haumea', 'Valor de referência da NASA. Haumea é alongado: o eixo maior tem pelo menos 2.322 km (Ortiz et al., 2017).'),
          massa(4.006e21, 'ragozzine-2009-haumea', 'Obtida pelas órbitas das luas Hiʻiaka e Namaka (incerteza de cerca de 1 %).'),
          rotacao(3.9154, 'jpl-sbdb-haumea'),
          periodoOrbital(103_208.117, 'jpl-sbdb-haumea', { nota: 'Calculado dos elementos orbitais atuais; a NASA Science arredonda para 285 anos.' }),
          distanciaDoSol(A_UA * KM_POR_UA, 'jpl-sbdb-haumea'),
          aneis(true, 'Um anel estreito, com raio de cerca de 2.287 km e uns 70 km de largura, anunciado em 2017.', 'ortiz-2017-haumea'),
          luasConhecidas(luasHaumea),
        ],
      },
      composicao: {
        texto:
          'Haumea é um corpo rochoso coberto por uma camada de gelo de água, o que o torna muito claro. A rotação rápida esticou sua forma num elipsoide.',
        itens: [
          'Interior rochoso e denso.',
          'Superfície coberta de gelo de água.',
          'Forma de elipsoide alongado, moldada pela rotação rápida.',
        ],
      },
      curiosidades: {
        itens: [
          'Gira uma vez a cada 3,9 horas, um dos giros mais rápidos entre os grandes corpos do Sistema Solar.',
          'Foi o primeiro objeto do Cinturão de Kuiper com um anel conhecido, anunciado em 2017.',
          'Tem duas luas, Hiʻiaka e Namaka, descobertas em 2005.',
          'Duas equipes reivindicam a descoberta, e a IAU não registra um descobridor oficial.',
          'Fica em média a 43 UA do Sol, mais longe que Plutão.',
        ],
      },
    },
    luas: luasHaumea,
  },

  fontes: fontesPor('nasa-haumea', 'jpl-sbdb-haumea', 'ortiz-2017-haumea', 'ragozzine-2009-haumea'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
