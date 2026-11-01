import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaDoSol, gravidade, gravidadeDeGM, inclinacaoAxial, luas,
  luasConhecidas, massa, massaDeGM, periodoOrbital, rotacao, texturas,
} from './construtores.ts';
import { KM_POR_UA } from './formatar.ts';

// Elementos orbitais osculantes do JPL SBDB (época JD 2461200,5).
const A_UA = 2.765552595;
const GM = 62.6284; // km³/s² (Dawn)
const RAIO = 469.7; // metade do diâmetro médio de 939,4 km

const luasCeres = luas(
  0,
  'nasa-ceres',
  'Ceres não tem luas conhecidas: nenhum satélite apareceu nas observações feitas da Terra nem nas da sonda Dawn, que orbitou o planeta anão de 2015 a 2018.',
);

export const ceres = {
  id: 'ceres',
  nome: 'Ceres',
  tipo: 'planeta-anao',
  pai: 'sol',
  ordem: 5,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO, inclinacaoAxialGraus: 4, periodoRotacaoHoras: 9.07417 },
  orbita: { semiEixoMaiorKm: A_UA * KM_POR_UA, periodoOrbitalDias: 1679.853, inclinacaoGraus: 10.588, excentricidade: 0.0797 },

  aparencia: {
    corBase: '#6E6B68',
    corAcento: '#A9C49B',
    texturas: texturas('ceres', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Planeta anão do Cinturão de Asteroides',
    descricao:
      'Ceres é o maior objeto do Cinturão de Asteroides, entre Marte e Júpiter, e o único planeta anão do Sistema Solar interior. A sonda Dawn revelou um mundo escuro, rico em água e sais, com manchas brilhantes no fundo de crateras.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(939.4, 'jpl-sbdb-ceres', 'Diâmetro médio. Ceres é levemente achatado: 964 × 964 × 892 km.'),
          massa(massaDeGM(GM), 'jpl-sbdb-ceres', 'Calculada a partir do parâmetro gravitacional (GM) medido pela Dawn.'),
          gravidade(gravidadeDeGM(GM, RAIO), 'jpl-sbdb-ceres', 'Calculada a partir de GM e do raio médio.'),
          rotacao(9.07417, 'jpl-sbdb-ceres'),
          periodoOrbital(1679.853, 'jpl-sbdb-ceres'),
          distanciaDoSol(A_UA * KM_POR_UA, 'jpl-sbdb-ceres'),
          inclinacaoAxial(4, 'nasa-ceres'),
          aneis(false, 'Ceres não tem anéis.', 'nasa-ceres'),
          luasConhecidas(luasCeres),
        ],
      },
      composicao: {
        texto:
          'Ceres pode ter até 25 % de água, provavelmente num manto de gelo sobre um núcleo rochoso. A crosta é de rocha e poeira, com grandes depósitos de sais.',
        dados: [dado('Densidade média', '2.162 kg/m³', 'jpl-sbdb-ceres', undefined, 2162)],
        itens: [
          'Crosta de rocha, poeira e sais.',
          'Provável manto rico em gelo de água.',
          'Manchas brilhantes de sais, como as da cratera Occator.',
        ],
      },
      curiosidades: {
        itens: [
          'Foi o primeiro objeto do Cinturão de Asteroides a ser descoberto, por Giuseppe Piazzi, em 1801.',
          'Em 2015, a Dawn fez de Ceres o primeiro planeta anão visitado por uma sonda.',
          'Um dia em Ceres dura pouco mais de 9 horas.',
          'Há indícios de vapor de água ao redor de Ceres, talvez vindo de criovulcões ou de gelo que sublima.',
          'Plutão tem cerca de 14 vezes a massa de Ceres.',
        ],
      },
    },
    luas: luasCeres,
  },

  fontes: fontesPor('jpl-sbdb-ceres', 'nasa-ceres'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
