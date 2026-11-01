import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaAte, distanciaDoSol, faixaTemperatura, gravidade, gravidadeDeGM,
  inclinacaoAxial, luas, luasConhecidas, massa, massaDeGM, percentual, periodoOrbital,
  pressaoSuperficial, rotacao, temperatura, texturas,
} from './construtores.ts';

const luasPlutao = luas(5, 'nasa-luas');

export const plutao = {
  id: 'plutao',
  nome: 'Plutão',
  tipo: 'planeta-anao',
  pai: 'sol',
  ordem: 10,
  exploravel3D: true,

  fisico: { raioMedioKm: 1188, inclinacaoAxialGraus: 119.51, periodoRotacaoHoras: -153.2928 },
  orbita: { semiEixoMaiorKm: 5869.656e6, periodoOrbitalDias: 90_560, inclinacaoGraus: 17.16, excentricidade: 0.2444 },

  aparencia: {
    corBase: '#C9A58A',
    corAcento: '#F5C98F',
    texturas: texturas('plutao', 'mapa'),
    atmosfera: { cor: '#9FC4FF', intensidade: 0.15 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Planeta anão do Cinturão de Kuiper',
    descricao:
      'Plutão é um planeta anão gelado no Cinturão de Kuiper, além de Netuno. A sonda New Horizons revelou em 2015 um mundo variado, com planícies de gelo de nitrogênio, montanhas de gelo de água e uma atmosfera fina e azulada.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2376, 'nssdca-planetas'),
          massa(0.01303e24, 'nssdca-plutao'),
          gravidade(0.62, 'nssdca-plutao'),
          faixaTemperatura({ k: 24 }, { k: 38 }, 'Faixa estimada da temperatura da superfície', 'nssdca-plutao'),
          temperatura({ c: -232 }, 'Média estimada da superfície; as estimativas variam entre as fontes', 'nasa-plutao', 'Temperatura média'),
          rotacao(-153.2928, 'nssdca-plutao', { nota: 'Plutão e Caronte giram sincronizados, sempre com a mesma face voltada um para o outro.' }),
          periodoOrbital(90_560, 'nssdca-plutao'),
          distanciaDoSol(5869.656e6, 'nssdca-plutao', 'A órbita é alongada: a distância varia de cerca de 30 a 49 UA.'),
          inclinacaoAxial(119.51, 'nssdca-plutao', 'Acima de 90°: a rotação é retrógrada.'),
          aneis(false, 'Plutão não tem anéis conhecidos.', 'nssdca-planetas'),
          luasConhecidas(luasPlutao),
        ],
      },
      composicao: {
        texto:
          'Plutão mistura rocha e gelo. A superfície tem gelos de nitrogênio, metano e monóxido de carbono, além de gelo de água, duro como rocha nessas temperaturas, que forma montanhas.',
        dados: [dado('Densidade média', '1.850 kg/m³', 'nssdca-planetas', undefined, 1850)],
        itens: [
          'Sputnik Planitia: uma enorme planície de gelo de nitrogênio, na metade esquerda do "coração".',
          'Montanhas de gelo de água com 2 a 3 km de altura.',
          'Regiões escuras e avermelhadas, coloridas por compostos orgânicos.',
          'Interior de rocha, talvez com um oceano de água sob o gelo.',
        ],
      },
      atmosfera: {
        texto:
          'Plutão tem uma atmosfera muito rarefeita, quase toda de nitrogênio. Ela forma camadas de névoa azulada e pode congelar e cair na superfície quando Plutão se afasta do Sol.',
        dados: [
          pressaoSuperficial(13e-6, 'nssdca-plutao', 'Cerca de 13 µbar: uns 80 mil vezes menos que na Terra.'),
          percentual('Nitrogênio (N₂)', 99, 'nssdca-plutao', 'Por volume.', 0),
          percentual('Metano (CH₄)', 0.5, 'nssdca-plutao', 'Por volume.'),
          percentual('Monóxido de carbono (CO)', 0.05, 'nssdca-plutao', 'Por volume.', 2),
        ],
      },
      curiosidades: {
        itens: [
          'Parte do tempo Plutão fica mais perto do Sol do que Netuno, porque sua órbita é muito alongada.',
          'Um ano de Plutão dura cerca de 248 anos terrestres.',
          'A New Horizons fez o primeiro e único sobrevoo de Plutão, em 14 de julho de 2015.',
          'Plutão e Caronte mostram sempre a mesma face um para o outro.',
          'Em 2006, a União Astronômica Internacional reclassificou Plutão como planeta anão.',
        ],
      },
    },
    luas: luasPlutao,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-plutao', 'nasa-plutao', 'nasa-luas'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

const GM_CARONTE = 106.1;
const RAIO_CARONTE = 606.0;

export const caronte = {
  id: 'caronte',
  nome: 'Caronte',
  tipo: 'lua',
  pai: 'plutao',
  ordem: 1,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_CARONTE, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 6.387222 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 19_600, periodoOrbitalDias: 6.387222, inclinacaoGraus: 0, excentricidade: 0 },

  aparencia: {
    corBase: '#8E8580',
    corAcento: '#B9AFA9',
    texturas: texturas('caronte', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Lua de gelo e rocha',
    descricao:
      'Caronte é a maior lua de Plutão, com cerca de metade do tamanho dele, a maior lua do Sistema Solar em relação ao seu corpo principal. Os dois giram travados, sempre mostrando a mesma face um ao outro.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_CARONTE, 'jpl-sats-fisicos', 'Raio medido nas imagens da New Horizons.'),
          massa(massaDeGM(GM_CARONTE), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_CARONTE, RAIO_CARONTE), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          rotacao(6.387222 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(6.387222, 'jpl-sats-orbitais'),
          distanciaAte(19_600, 'Plutão', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Caronte é feito de gelo de água e rocha, com densidade de 1,85 g/cm³. A superfície tem planícies, cânions e uma região avermelhada no polo norte.',
        dados: [dado('Densidade média', '1.853 kg/m³', 'jpl-sats-fisicos', undefined, 1853)],
        itens: [
          'Crosta dominada por gelo de água.',
          'Cânions e escarpas que sugerem que o interior se expandiu ao congelar.',
          'Mancha avermelhada no polo norte.',
        ],
      },
      curiosidades: {
        itens: [
          'Tem cerca de metade do tamanho de Plutão: é a maior lua em relação ao seu corpo principal.',
          'Plutão e Caronte giram em torno de um ponto no espaço entre os dois, fora de Plutão; por isso, às vezes são chamados de sistema duplo.',
          'Caronte e Plutão mostram sempre a mesma face um ao outro.',
          'Foi descoberto em junho de 1978 por James Christy e Robert Harrington, no Observatório Naval dos EUA.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-caronte'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
