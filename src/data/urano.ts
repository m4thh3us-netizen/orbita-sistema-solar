import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaAte, distanciaDoSol, gravidade, gravidadeDeGM, inclinacaoAxial,
  luas, luasConhecidas, massa, massaDeGM, percentual, periodoOrbital, rotacao, temperatura, texturas,
} from './construtores.ts';

const luasUrano = luas(29, 'nasa-urano-luas');

export const urano = {
  id: 'urano',
  nome: 'Urano',
  tipo: 'planeta',
  pai: 'sol',
  ordem: 8,
  exploravel3D: true,

  fisico: { raioMedioKm: 25_362, inclinacaoAxialGraus: 97.77, periodoRotacaoHoras: -17.24 },
  orbita: { semiEixoMaiorKm: 2867.043e6, periodoOrbitalDias: 30_685.4, inclinacaoGraus: 0.77, excentricidade: 0.0469 },

  aparencia: {
    corBase: '#9FD8DE',
    corAcento: '#7FE6E6',
    // Textura dos anéis gerada a partir dos raios da NSSDCA (anéis estreitos e escuros).
    texturas: texturas('urano', 'mapa', 'aneis'),
    atmosfera: { cor: '#A8EEF2', intensidade: 0.35 },
    // Do anel 6 (o mais interno da lista da NSSDCA) ao anel ε (épsilon).
    aneis: { raioInternoKm: 41_837, raioExternoKm: 51_149 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Gigante de gelo',
    descricao:
      'Urano é um gigante de gelo azul-esverdeado que gira deitado: seu eixo é inclinado quase 98°. Isso faz com que cada polo passe décadas iluminado e depois décadas no escuro.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(51_118, 'nssdca-planetas', 'No equador, no nível de pressão de 1 bar.'),
          massa(86.811e24, 'nssdca-urano'),
          gravidade(8.7, 'nssdca-planetas', 'No equador, no nível de 1 bar, incluindo o efeito da rotação.'),
          temperatura({ k: 76 }, 'Temperatura no nível de 1 bar de pressão, já que Urano não tem superfície sólida', 'nssdca-urano'),
          rotacao(-17.24, 'nssdca-urano'),
          periodoOrbital(30_685.4, 'nssdca-urano'),
          distanciaDoSol(2867.043e6, 'nssdca-urano'),
          inclinacaoAxial(97.77, 'nssdca-urano', 'Acima de 90°: o planeta gira praticamente de lado, em sentido retrógrado.'),
          aneis(true, 'Anéis estreitos e escuros; o mais brilhante, ε (épsilon), fica a 51.149 km do centro. Há ainda dois anéis externos muito tênues, de poeira.', 'nssdca-aneis-urano'),
          luasConhecidas(luasUrano),
        ],
      },
      composicao: {
        texto:
          'Urano é chamado de gigante de gelo: por baixo de uma atmosfera de hidrogênio e hélio, a maior parte da massa é um fluido quente e denso de água, amônia e metano, sobre um núcleo rochoso.',
        dados: [dado('Densidade média', '1.270 kg/m³', 'nssdca-planetas', undefined, 1270)],
        itens: [
          'Atmosfera de hidrogênio, hélio e metano.',
          'Manto fluido de "gelos": água, amônia e metano sob alta pressão.',
          'Núcleo rochoso pequeno.',
        ],
      },
      atmosfera: {
        texto:
          'O metano da atmosfera absorve a luz vermelha e reflete o azul e o verde, o que dá a Urano sua cor. É a atmosfera planetária mais fria medida no Sistema Solar.',
        dados: [
          percentual('Hidrogênio (H₂)', 82.5, 'nssdca-urano', 'Por volume (± 3,3 %).'),
          percentual('Hélio (He)', 15.2, 'nssdca-urano', 'Por volume (± 3,3 %).'),
          percentual('Metano (CH₄)', 2.3, 'nssdca-urano', 'Por volume.'),
        ],
      },
      curiosidades: {
        itens: [
          'O eixo de Urano é inclinado 97,8°: o planeta praticamente rola de lado ao longo da órbita.',
          'Por isso, cada polo passa cerca de 42 anos iluminado e depois 42 anos no escuro.',
          'Foi o primeiro planeta descoberto com telescópio, por William Herschel, em 1781.',
          'Suas luas maiores têm nomes de personagens de Shakespeare e de Alexander Pope.',
          'A Voyager 2, em 1986, foi até hoje a única sonda a visitar Urano.',
        ],
      },
    },
    luas: luasUrano,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-urano', 'nssdca-aneis-urano', 'nasa-urano-luas'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

// Luas — raio e GM: JPL SSD (phys_par); órbita: JPL SSD (elementos médios, plano equatorial de Urano).
// Rotação positiva: no mesmo sentido da rotação de Urano (ver convenção em types.ts).

const GM_TITANIA = 226.9;
const RAIO_TITANIA = 788.9;

export const titania = {
  id: 'titania',
  nome: 'Titânia',
  tipo: 'lua',
  pai: 'urano',
  ordem: 1,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_TITANIA, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 8.705869 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 436_298, periodoOrbitalDias: 8.705869, inclinacaoGraus: 0.1, excentricidade: 0.002 },

  aparencia: {
    corBase: '#A39C96',
    corAcento: '#C6B4F0',
    texturas: texturas('titania', 'mapa'),
    representacaoArtistica: true,
  },

  conteudo: {
    classificacao: 'Lua de gelo e rocha',
    descricao:
      'Titânia é a maior lua de Urano, um mundo de gelo e rocha com cerca de 1.600 km de diâmetro. Sua superfície é cortada por enormes vales de falha, sinal de que o interior já se expandiu e rachou a crosta.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_TITANIA, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_TITANIA), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM), com incerteza de cerca de 2 %.'),
          gravidade(gravidadeDeGM(GM_TITANIA, RAIO_TITANIA), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          rotacao(8.705869 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(8.705869, 'jpl-sats-orbitais'),
          distanciaAte(436_298, 'Urano', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Como as outras grandes luas de Urano, Titânia deve ser feita de cerca de metade gelo e metade rocha.',
        dados: [dado('Densidade média', '1.653 kg/m³', 'jpl-sats-fisicos', undefined, 1653)],
        itens: [
          'Crosta de gelo de água misturado a material escuro.',
          'Vales de falha com até cerca de 1.600 km de comprimento.',
          'Depósitos claros, talvez de geada, nas paredes de alguns vales.',
        ],
      },
      curiosidades: {
        itens: [
          'É a maior lua de Urano.',
          'Alguns de seus vales de falha têm cerca de 1.600 km de comprimento.',
          'Foi descoberta por William Herschel em 11 de janeiro de 1787.',
          'O nome vem da rainha das fadas em Sonho de uma Noite de Verão, de Shakespeare.',
          'Só a Voyager 2 a fotografou de perto, em janeiro de 1986, e apenas o hemisfério que estava iluminado.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-titania', 'nasa-oberon'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

const GM_OBERON = 205.3;
const RAIO_OBERON = 761.4;

export const oberon = {
  id: 'oberon',
  nome: 'Oberon',
  tipo: 'lua',
  pai: 'urano',
  ordem: 2,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_OBERON, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 13.463237 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 583_511, periodoOrbitalDias: 13.463237, inclinacaoGraus: 0.1, excentricidade: 0.002 },

  aparencia: {
    corBase: '#8C8079',
    corAcento: '#D99BC8',
    texturas: texturas('oberon', 'mapa'),
    representacaoArtistica: true,
  },

  conteudo: {
    classificacao: 'Lua de gelo e rocha',
    descricao:
      'Oberon é a segunda maior lua de Urano e a mais distante entre as cinco grandes. Sua superfície antiga é coberta de crateras, algumas com o fundo escurecido por um material ainda pouco compreendido.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_OBERON, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_OBERON), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM), com incerteza de cerca de 3 %.'),
          gravidade(gravidadeDeGM(GM_OBERON, RAIO_OBERON), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          rotacao(13.463237 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(13.463237, 'jpl-sats-orbitais'),
          distanciaAte(583_511, 'Urano', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto: 'Oberon é feito de cerca de metade gelo e metade rocha, como as outras grandes luas de Urano.',
        dados: [dado('Densidade média', '1.664 kg/m³', 'jpl-sats-fisicos', undefined, 1664)],
        itens: [
          'Superfície antiga, muito marcada por crateras.',
          'Pelo menos uma grande montanha, com cerca de 6 km de altura.',
        ],
      },
      curiosidades: {
        itens: [
          'É a segunda maior lua de Urano.',
          'Tem pelo menos uma montanha com cerca de 6 km de altura.',
          'É muito crateado, como a lua Umbriel.',
          'Foi descoberto no mesmo dia que Titânia, 11 de janeiro de 1787, por William Herschel.',
          'O nome, dado por John Herschel, filho do descobridor, vem do rei das fadas em Sonho de uma Noite de Verão.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-oberon'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
