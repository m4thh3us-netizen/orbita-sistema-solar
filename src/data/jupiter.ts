import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaAte, distanciaDoSol, faixaTemperatura, gravidade, gravidadeDeGM,
  inclinacaoAxial, luas, luasConhecidas, massa, massaDeGM, percentual, periodoOrbital, rotacao,
  temperatura, texturas,
} from './construtores.ts';

const luasJupiter = luas(115, 'nasa-jupiter-luas');

export const jupiter = {
  id: 'jupiter',
  nome: 'Júpiter',
  tipo: 'planeta',
  pai: 'sol',
  ordem: 6,
  exploravel3D: true,

  fisico: { raioMedioKm: 69_911, inclinacaoAxialGraus: 3.13, periodoRotacaoHoras: 9.925 },
  orbita: { semiEixoMaiorKm: 778.479e6, periodoOrbitalDias: 4332.589, inclinacaoGraus: 1.304, excentricidade: 0.0487 },

  aparencia: {
    corBase: '#C9A37A',
    corAcento: '#F2A36B',
    texturas: texturas('jupiter', 'mapa', 'aneis'),
    atmosfera: { cor: '#E8D2B0', intensidade: 0.2 },
    aneis: { raioInternoKm: 89_400, raioExternoKm: 221_900 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Gigante gasoso',
    descricao:
      'Júpiter é o maior planeta do Sistema Solar, com mais que o dobro da massa de todos os outros juntos. É uma bola de hidrogênio e hélio sem superfície sólida, riscada por faixas de nuvens e tempestades como a Grande Mancha Vermelha.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(142_984, 'nssdca-planetas', 'No equador, no nível de pressão de 1 bar. A rotação rápida achata o planeta nos polos.'),
          massa(1898.13e24, 'nssdca-jupiter'),
          gravidade(23.1, 'nssdca-planetas', 'No equador, no nível de 1 bar, incluindo o efeito da rotação.'),
          temperatura({ k: 165 }, 'Temperatura no nível de 1 bar de pressão, já que Júpiter não tem superfície sólida', 'nssdca-jupiter'),
          rotacao(9.925, 'nssdca-jupiter'),
          periodoOrbital(4332.589, 'nssdca-jupiter'),
          distanciaDoSol(778.479e6, 'nssdca-jupiter'),
          inclinacaoAxial(3.13, 'nssdca-jupiter'),
          aneis(true, 'Sistema tênue de poeira: um halo, o anel principal (de 123.000 a 128.940 km do centro) e dois anéis finíssimos ligados às luas Amalteia e Tebe.', 'nssdca-aneis-jupiter'),
          luasConhecidas(luasJupiter),
        ],
      },
      composicao: {
        texto:
          'Júpiter é feito sobretudo de hidrogênio e hélio, como uma estrela. Sob a pressão enorme do interior, o hidrogênio se comporta como um metal líquido e gera o campo magnético mais forte entre os planetas.',
        dados: [dado('Densidade média', '1.326 kg/m³', 'nssdca-planetas', undefined, 1326)],
        itens: [
          'Camadas de nuvens de amônia, hidrossulfeto de amônio e água.',
          'Hidrogênio molecular, que vai ficando mais denso com a profundidade.',
          'Hidrogênio metálico líquido, que conduz eletricidade.',
          'Núcleo denso de composição ainda incerta.',
        ],
      },
      atmosfera: {
        texto:
          'A atmosfera visível é feita de faixas claras e escuras que correm em sentidos opostos, com ventos fortes e tempestades que duram séculos.',
        dados: [
          percentual('Hidrogênio (H₂)', 89.8, 'nssdca-jupiter', 'Por volume (± 2,0 %).'),
          percentual('Hélio (He)', 10.2, 'nssdca-jupiter', 'Por volume (± 2,0 %).'),
          dado('Metano (CH₄)', '3.000 ppm', 'nssdca-jupiter', 'Partes por milhão, por volume (± 1.000).', 3000e-6),
          dado('Amônia (NH₃)', '260 ppm', 'nssdca-jupiter', 'Partes por milhão, por volume (± 40).', 260e-6),
        ],
      },
      curiosidades: {
        itens: [
          'Júpiter tem cerca de 2,5 vezes a massa de todos os outros planetas somados.',
          'Tem o dia mais curto entre os planetas: uma volta em 9 h 55 min.',
          'A Grande Mancha Vermelha é um anticiclone mais largo que a Terra, acompanhado pelos astrônomos desde o século XIX.',
          'Um ano de Júpiter dura quase 12 anos terrestres.',
          'As quatro maiores luas foram descobertas por Galileu Galilei em janeiro de 1610.',
        ],
      },
    },
    luas: luasJupiter,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-jupiter', 'nssdca-aneis-jupiter', 'nasa-jupiter-luas'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

const GM_IO = 5959.91547;
const RAIO_IO = 1821.49;

export const io = {
  id: 'io',
  nome: 'Io',
  tipo: 'lua',
  pai: 'jupiter',
  ordem: 1,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_IO, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 1.762732 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 421_800, periodoOrbitalDias: 1.762732, inclinacaoGraus: 0, excentricidade: 0.004 },

  aparencia: {
    corBase: '#D8C76A',
    corAcento: '#E5EE5A',
    texturas: texturas('io', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Lua galileana vulcânica',
    descricao:
      'Io é a mais próxima das quatro grandes luas de Júpiter e o mundo com mais atividade vulcânica do Sistema Solar. O calor vem das marés: a gravidade de Júpiter e das luas vizinhas espreme o interior de Io sem parar.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_IO, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_IO), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_IO, RAIO_IO), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          rotacao(1.762732 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(1.762732, 'jpl-sats-orbitais'),
          distanciaAte(421_800, 'Júpiter', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Io é rochoso, com núcleo de ferro, e é a mais densa das luas galileanas. A superfície colorida de amarelo, laranja e vermelho vem de compostos de enxofre lançados pelos vulcões.',
        dados: [dado('Densidade média', '3.528 kg/m³', 'jpl-sats-fisicos', undefined, 3528)],
        itens: [
          'Núcleo de ferro ou de ferro e enxofre.',
          'Manto de rocha silicática parcialmente derretida.',
          'Crosta coberta por lava, enxofre e geada de dióxido de enxofre.',
        ],
      },
      atmosfera: {
        texto:
          'Io tem uma atmosfera finíssima, alimentada pelos vulcões e pela geada que sublima ao sol.',
        itens: ['Principal componente: dióxido de enxofre (SO₂).'],
      },
      curiosidades: {
        itens: [
          'As marés de Júpiter deformam Io: a superfície sobe e desce até 100 metros.',
          'Tem centenas de vulcões, alguns com fontes de lava de dezenas de quilômetros de altura.',
          'Io perde cerca de uma tonelada de material por segundo para o espaço em volta de Júpiter.',
          'Io e Júpiter formam um circuito elétrico de até 400 mil volts e 3 milhões de ampères.',
          'Os vulcões de Io foram vistos pela primeira vez pela sonda Voyager 1, em 1979.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-io'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

const GM_EUROPA = 3202.7121;
const RAIO_EUROPA = 1560.8;

export const europa = {
  id: 'europa',
  nome: 'Europa',
  tipo: 'lua',
  pai: 'jupiter',
  ordem: 2,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_EUROPA, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 3.525463 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 671_100, periodoOrbitalDias: 3.525463, inclinacaoGraus: 0.5, excentricidade: 0.009 },

  aparencia: {
    corBase: '#C8B79A',
    corAcento: '#F6E8C6',
    texturas: texturas('europa', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Lua galileana de gelo',
    descricao:
      'Europa é a menor das quatro grandes luas de Júpiter, coberta por uma crosta de gelo riscada de fraturas. Sob o gelo há um oceano global de água salgada, o que faz dela um dos lugares mais promissores para procurar ambientes habitáveis.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_EUROPA, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_EUROPA), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_EUROPA, RAIO_EUROPA), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          rotacao(3.525463 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(3.525463, 'jpl-sats-orbitais'),
          distanciaAte(671_100, 'Júpiter', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Europa tem interior rochoso e núcleo metálico, envoltos por uma camada de água: um oceano líquido sob uma crosta de gelo.',
        dados: [dado('Densidade média', '3.013 kg/m³', 'jpl-sats-fisicos', undefined, 3013)],
        itens: [
          'Crosta de gelo de água, jovem e com poucas crateras.',
          'Oceano de água salgada com cerca de duas vezes a água de todos os oceanos da Terra.',
          'Manto rochoso e núcleo de ferro.',
        ],
      },
      curiosidades: {
        itens: [
          'O oceano escondido de Europa guarda cerca de duas vezes a água de todos os oceanos da Terra.',
          'É um pouco menor que a nossa Lua.',
          'A superfície tem poucas crateras e muitas fraturas avermelhadas: sinal de que o gelo se renova.',
          'A sonda Europa Clipper, da NASA, foi lançada em 14 de outubro de 2024 para estudar Europa de perto.',
          'É a sexta lua mais próxima de Júpiter.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-europa'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

const GM_GANIMEDES = 9887.83275;
const RAIO_GANIMEDES = 2631.2;

export const ganimedes = {
  id: 'ganimedes',
  nome: 'Ganimedes',
  tipo: 'lua',
  pai: 'jupiter',
  ordem: 3,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_GANIMEDES, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 7.155588 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 1_070_400, periodoOrbitalDias: 7.155588, inclinacaoGraus: 0.2, excentricidade: 0.001 },

  aparencia: {
    corBase: '#8F8676',
    corAcento: '#9CB2DA',
    texturas: texturas('ganimedes', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Lua galileana de gelo e rocha',
    descricao:
      'Ganimedes é a maior lua do Sistema Solar, maior até que o planeta Mercúrio. É também a única lua conhecida com campo magnético próprio, e esconde um oceano salgado sob uma crosta grossa de gelo.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_GANIMEDES, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_GANIMEDES), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_GANIMEDES, RAIO_GANIMEDES), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          faixaTemperatura({ k: 90 }, { k: 160 }, 'Faixa de temperatura da superfície durante o dia', 'nasa-ganimedes', 'Temperatura diurna'),
          rotacao(7.155588 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(7.155588, 'jpl-sats-orbitais'),
          distanciaAte(1_070_400, 'Júpiter', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Ganimedes mistura rocha e gelo de água em camadas, com um núcleo metálico. Um oceano de água salgada com cerca de 100 km de espessura fica sob uma crosta de gelo de cerca de 150 km.',
        dados: [dado('Densidade média', '1.942 kg/m³', 'jpl-sats-fisicos', undefined, 1942)],
        itens: [
          'Crosta de gelo com regiões escuras e antigas e faixas claras e sulcadas, mais jovens.',
          'Oceano interno de água salgada.',
          'Manto rochoso e núcleo de ferro líquido, que gera o campo magnético.',
        ],
      },
      curiosidades: {
        itens: [
          'É a maior lua do Sistema Solar: seu diâmetro supera o do planeta Mercúrio.',
          'É a única lua conhecida com campo magnético próprio, descoberto pela sonda Galileo em 1996.',
          'Esse campo magnético produz auroras em volta dos polos de Ganimedes.',
          'O oceano sob o gelo pode ter mais água que todos os oceanos da superfície da Terra.',
          'O telescópio Hubble detectou uma atmosfera finíssima de oxigênio.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-ganimedes'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

const GM_CALISTO = 7179.2834;
const RAIO_CALISTO = 2410.3;

export const calisto = {
  id: 'calisto',
  nome: 'Calisto',
  tipo: 'lua',
  pai: 'jupiter',
  ordem: 4,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_CALISTO, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 16.69044 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 1_882_700, periodoOrbitalDias: 16.69044, inclinacaoGraus: 0.3, excentricidade: 0.007 },

  aparencia: {
    corBase: '#5F5548',
    corAcento: '#BFA27C',
    texturas: texturas('calisto', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Lua galileana de gelo e rocha',
    descricao:
      'Calisto é a mais distante das quatro grandes luas de Júpiter e o objeto com mais crateras do Sistema Solar. Sua superfície escura e antiga quase não mudou em bilhões de anos.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_CALISTO, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_CALISTO), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_CALISTO, RAIO_CALISTO), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          rotacao(16.69044 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(16.69044, 'jpl-sats-orbitais'),
          distanciaAte(1_882_700, 'Júpiter', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Calisto é uma mistura de rocha e gelo pouco separada em camadas, com densidade de 1,83 g/cm³. Dados da sonda Galileo sugerem um oceano salgado escondido a grande profundidade.',
        dados: [dado('Densidade média', '1.834 kg/m³', 'jpl-sats-fisicos', undefined, 1834)],
        itens: [
          'Crosta antiga de gelo e rocha, saturada de crateras.',
          'Possível oceano salgado a cerca de 250 km de profundidade.',
          'Interior de rocha e gelo misturados.',
        ],
      },
      curiosidades: {
        itens: [
          'É o objeto com mais crateras do Sistema Solar.',
          'É a terceira maior lua do Sistema Solar, quase do tamanho de Mercúrio.',
          'Pode esconder um oceano salgado a cerca de 250 km de profundidade, mas os cientistas ainda discutem se ele existe.',
          'A sonda Galileo detectou ao redor dela uma exosfera finíssima de gás carbônico.',
          'Leva quase 17 dias para dar uma volta em Júpiter.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-calisto'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
