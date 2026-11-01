import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, diametro, distanciaDoSol, faixaTemperatura, gravidade, luas, luasConhecidas, massa,
  periodoOrbital, rotacao, texturas,
} from './construtores.ts';
import { KM_POR_UA } from './formatar.ts';

const A_UA = 67.93394688;
const RAIO = 1163;
const MASSA = 1.66e22;
const G = 6.6743e-11;
const ROTACAO_HORAS = 15.7859 * 24;

const luasEris = luas(1, 'nasa-eris');

export const eris = {
  id: 'eris',
  nome: 'Éris',
  tipo: 'planeta-anao',
  pai: 'sol',
  ordem: 13,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO, inclinacaoAxialGraus: 0, periodoRotacaoHoras: ROTACAO_HORAS },
  orbita: { semiEixoMaiorKm: A_UA * KM_POR_UA, periodoOrbitalDias: 204_516.663, inclinacaoGraus: 43.926, excentricidade: 0.4382 },

  aparencia: {
    corBase: '#E6E2DE',
    corAcento: '#FCE8F4',
    texturas: texturas('eris', 'mapa'),
    representacaoArtistica: true,
  },

  conteudo: {
    classificacao: 'Planeta anão do disco disperso',
    descricao:
      'Éris é um dos maiores planetas anões, quase do tamanho de Plutão e mais massivo que ele. Sua descoberta, anunciada em 2005, levou à criação da categoria de planeta anão em 2006.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO, 'sicardy-2011-eris', 'Medido numa ocultação estelar em 2010; a NASA Science arredonda para cerca de 2.400 km.'),
          massa(MASSA, 'brown-2007-eris', 'Obtida pela órbita da lua Disnomia.'),
          gravidade((G * MASSA) / (RAIO * 1e3) ** 2, 'brown-2007-eris', 'Calculada a partir da massa e do raio; valor aproximado.'),
          faixaTemperatura({ c: -243 }, { c: -217 }, 'Estimativas da temperatura da superfície; variam ao longo da órbita muito alongada', 'nasa-eris'),
          rotacao(ROTACAO_HORAS, 'bernstein-2023-eris', { nota: 'Éris gira sincronizada com a órbita de Disnomia (Szakáts et al., 2023; Bernstein et al., 2023). Fontes antigas citam 25,9 horas.' }),
          periodoOrbital(204_516.663, 'jpl-sbdb-eris', { nota: 'Calculado dos elementos orbitais atuais; a NASA Science arredonda para 557 anos.' }),
          distanciaDoSol(A_UA * KM_POR_UA, 'jpl-sbdb-eris', 'A órbita é muito alongada: a distância varia de cerca de 38 a 98 UA.'),
          aneis(false, 'Não há anéis conhecidos.', 'nasa-eris'),
          luasConhecidas(luasEris),
        ],
      },
      composicao: {
        texto:
          'O interior de Éris é pouco conhecido. A superfície deve ser rochosa e coberta de gelos, parecida com a de Plutão, e é uma das mais claras do Sistema Solar.',
        itens: [
          'Mistura de rocha e gelo.',
          'Superfície clara, coberta por gelos que congelam a partir da atmosfera.',
        ],
      },
      curiosidades: {
        itens: [
          'Sua descoberta levou a IAU a criar a categoria de planeta anão em 2006, a mesma decisão que reclassificou Plutão.',
          'Tem quase o mesmo tamanho de Plutão, mas cerca de 27 % mais massa.',
          'Um dia em Éris dura cerca de 15,8 dias terrestres: ela gira sincronizada com sua lua, Disnomia.',
          'Longe do Sol, a atmosfera congela e cai como neve; perto do periélio, volta a se formar.',
          'A órbita é inclinada 44° em relação ao plano dos planetas.',
        ],
      },
    },
    luas: luasEris,
  },

  fontes: fontesPor('nasa-eris', 'jpl-sbdb-eris', 'sicardy-2011-eris', 'brown-2007-eris', 'szakats-2023-eris', 'bernstein-2023-eris'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
