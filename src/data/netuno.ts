import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaAte, distanciaDoSol, gravidade, gravidadeDeGM, inclinacaoAxial,
  luas, luasConhecidas, massa, massaDeGM, percentual, periodoOrbital, rotacao, temperatura, texturas,
} from './construtores.ts';

const luasNetuno = luas(16, 'nasa-netuno-luas');

export const netuno = {
  id: 'netuno',
  nome: 'Netuno',
  tipo: 'planeta',
  pai: 'sol',
  ordem: 9,
  exploravel3D: true,

  fisico: { raioMedioKm: 24_622, inclinacaoAxialGraus: 28.32, periodoRotacaoHoras: 16.11 },
  orbita: { semiEixoMaiorKm: 4514.953e6, periodoOrbitalDias: 60_189.018, inclinacaoGraus: 1.77, excentricidade: 0.0097 },

  aparencia: {
    corBase: '#3E66D6',
    corAcento: '#6E8BFF',
    texturas: texturas('netuno', 'mapa', 'aneis'),
    atmosfera: { cor: '#7FA8FF', intensidade: 0.4 },
    aneis: { raioInternoKm: 41_900, raioExternoKm: 62_933 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Gigante de gelo',
    descricao:
      'Netuno é o planeta mais distante do Sol, um gigante de gelo azul com os ventos mais rápidos já medidos no Sistema Solar. Foi o primeiro planeta encontrado por cálculos matemáticos antes de ser visto no céu.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(49_528, 'nssdca-planetas', 'No equador, no nível de pressão de 1 bar.'),
          massa(102.409e24, 'nssdca-netuno'),
          gravidade(11.0, 'nssdca-planetas', 'No equador, no nível de 1 bar, incluindo o efeito da rotação.'),
          temperatura({ k: 72 }, 'Temperatura no nível de 1 bar de pressão, já que Netuno não tem superfície sólida', 'nssdca-netuno'),
          rotacao(16.11, 'nssdca-netuno'),
          periodoOrbital(60_189.018, 'nssdca-netuno'),
          distanciaDoSol(4514.953e6, 'nssdca-netuno'),
          inclinacaoAxial(28.32, 'nssdca-netuno'),
          aneis(true, 'Cinco anéis principais, tênues e escuros, com nomes de astrônomos: Galle, Le Verrier, Lassell, Arago e Adams. O anel Adams tem arcos mais densos.', 'nssdca-aneis-netuno'),
          luasConhecidas(luasNetuno),
        ],
      },
      composicao: {
        texto:
          'Como Urano, Netuno é um gigante de gelo: sob a atmosfera de hidrogênio e hélio, há um manto denso e quente de água, amônia e metano, e um núcleo rochoso.',
        dados: [dado('Densidade média', '1.638 kg/m³', 'nssdca-planetas', 'O mais denso dos planetas gigantes.', 1638)],
        itens: [
          'Atmosfera de hidrogênio, hélio e metano.',
          'Manto fluido de "gelos": água, amônia e metano sob alta pressão.',
          'Núcleo rochoso do tamanho aproximado da Terra.',
        ],
      },
      atmosfera: {
        texto:
          'O metano absorve a luz vermelha e deixa Netuno azul. A atmosfera é muito ativa, com nuvens brancas de metano congelado e grandes tempestades escuras que aparecem e somem.',
        dados: [
          percentual('Hidrogênio (H₂)', 80.0, 'nssdca-netuno', 'Por volume.'),
          percentual('Hélio (He)', 19.0, 'nssdca-netuno', 'Por volume.'),
          percentual('Metano (CH₄)', 1.5, 'nssdca-netuno', 'Por volume.'),
        ],
      },
      curiosidades: {
        itens: [
          'Foi o primeiro planeta encontrado por cálculos, a partir de desvios na órbita de Urano, e observado em 1846.',
          'Um ano de Netuno dura quase 165 anos terrestres: desde a descoberta, ele completou uma única volta, em 2011.',
          'Tem os ventos mais rápidos medidos no Sistema Solar.',
          'Mesmo sendo menor que Urano, Netuno tem mais massa: 17 vezes a da Terra.',
          'A Voyager 2 passou por Netuno em 1989 e é a única sonda que o visitou.',
        ],
      },
    },
    luas: luasNetuno,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-netuno', 'nssdca-aneis-netuno', 'nasa-netuno-luas'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

const GM_TRITAO = 1428.49546;
const RAIO_TRITAO = 1352.6;

export const tritao = {
  id: 'tritao',
  nome: 'Tritão',
  tipo: 'lua',
  pai: 'netuno',
  ordem: 1,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_TRITAO, inclinacaoAxialGraus: 0, periodoRotacaoHoras: -5.8792 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 354_800, periodoOrbitalDias: 5.8792, inclinacaoGraus: 157.3, excentricidade: 0, retrograda: true },

  aparencia: {
    corBase: '#C9B9AE',
    corAcento: '#F2B8C6',
    texturas: texturas('tritao', 'mapa'),
    representacaoArtistica: true,
  },

  conteudo: {
    classificacao: 'Lua de gelo com órbita retrógrada',
    descricao:
      'Tritão é a maior lua de Netuno e a única grande lua que orbita no sentido contrário ao da rotação do seu planeta. Tudo indica que é um objeto do Cinturão de Kuiper capturado por Netuno, com gêiseres ativos numa superfície a −235 °C.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_TRITAO, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_TRITAO), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_TRITAO, RAIO_TRITAO), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          temperatura({ c: -235 }, 'Temperatura da superfície medida pela Voyager 2 em 1989', 'nasa-tritao'),
          rotacao(-5.8792 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(5.8792, 'jpl-sats-orbitais', { retrograda: true }),
          distanciaAte(354_800, 'Netuno', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Tritão tem densidade de cerca de duas vezes a da água: muita rocha por baixo de uma crosta de gelos. A superfície reflete cerca de 70 % da luz do Sol.',
        dados: [dado('Densidade média', '2.065 kg/m³', 'jpl-sats-fisicos', undefined, 2065)],
        itens: [
          'Crosta de gelos de nitrogênio, metano e água.',
          'Interior com grande proporção de rocha.',
          'Gêiseres que lançam material escuro na atmosfera.',
        ],
      },
      atmosfera: {
        texto: 'Tritão tem uma atmosfera finíssima, quase toda de nitrogênio, com um pouco de metano.',
        itens: ['Nitrogênio (N₂) como principal componente.', 'Pequenas quantidades de metano (CH₄).'],
      },
      curiosidades: {
        itens: [
          'É a única grande lua do Sistema Solar que orbita no sentido contrário ao da rotação do seu planeta.',
          'Deve ser um objeto do Cinturão de Kuiper capturado pela gravidade de Netuno.',
          'A Voyager 2 viu gêiseres ativos em Tritão em 1989.',
          'A −235 °C, tem uma das superfícies mais frias já medidas no Sistema Solar.',
          'Foi descoberto por William Lassell em 10 de outubro de 1846, apenas 17 dias depois de Netuno.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-tritao'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
