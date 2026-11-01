import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaAte, distanciaDoSol, gravidade, gravidadeDeGM, inclinacaoAxial,
  luas, luasConhecidas, massa, massaDeGM, percentual, periodoOrbital, rotacao, temperatura, texturas,
} from './construtores.ts';

const luasSaturno = luas(293, 'nasa-saturno-luas');

export const saturno = {
  id: 'saturno',
  nome: 'Saturno',
  tipo: 'planeta',
  pai: 'sol',
  ordem: 7,
  exploravel3D: true,

  fisico: { raioMedioKm: 58_232, inclinacaoAxialGraus: 26.73, periodoRotacaoHoras: 10.656 },
  orbita: { semiEixoMaiorKm: 1432.041e6, periodoOrbitalDias: 10_755.699, inclinacaoGraus: 2.486, excentricidade: 0.052 },

  aparencia: {
    corBase: '#D6BF8E',
    corAcento: '#DDBE6E',
    texturas: texturas('saturno', 'mapa', 'aneis'),
    atmosfera: { cor: '#EAD9B0', intensidade: 0.2 },
    // Anéis principais: da borda interna do anel C à borda externa do anel A (NSSDCA).
    aneis: { raioInternoKm: 74_658, raioExternoKm: 136_780 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Gigante gasoso',
    descricao:
      'Saturno é o segundo maior planeta e o dono dos anéis mais brilhantes do Sistema Solar. É um gigante de hidrogênio e hélio tão pouco denso que, em média, é mais leve que a água.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(120_536, 'nssdca-planetas', 'No equador, no nível de pressão de 1 bar.'),
          massa(568.32e24, 'nssdca-saturno'),
          gravidade(9.0, 'nssdca-planetas', 'No equador, no nível de 1 bar, incluindo o efeito da rotação.'),
          temperatura({ k: 134 }, 'Temperatura no nível de 1 bar de pressão, já que Saturno não tem superfície sólida', 'nssdca-saturno'),
          rotacao(10.656, 'nssdca-saturno', { nota: 'Período do Sistema III, medido pelas emissões de rádio do campo magnético.' }),
          periodoOrbital(10_755.699, 'nssdca-saturno'),
          distanciaDoSol(1432.041e6, 'nssdca-saturno'),
          inclinacaoAxial(26.73, 'nssdca-saturno'),
          aneis(true, 'Os anéis principais vão de 74.658 km (borda interna do anel C) a 136.780 km (borda externa do anel A) do centro do planeta, com espessura de apenas alguns metros a algumas dezenas de metros.', 'nssdca-aneis-saturno'),
          luasConhecidas(luasSaturno),
        ],
      },
      composicao: {
        texto:
          'Saturno é feito sobretudo de hidrogênio e hélio. Como em Júpiter, o hidrogênio vira um fluido metálico no interior, e no centro deve haver um núcleo denso de rocha e gelo.',
        dados: [dado('Densidade média', '687 kg/m³', 'nssdca-planetas', 'Menor que a da água (1.000 kg/m³).', 687)],
        itens: [
          'Nuvens de amônia no topo da atmosfera.',
          'Hidrogênio molecular, cada vez mais denso com a profundidade.',
          'Hidrogênio metálico líquido.',
          'Núcleo denso de rocha e gelo.',
          'Anéis feitos quase só de gelo de água, em pedaços que vão de grãos de poeira a blocos do tamanho de casas.',
        ],
      },
      atmosfera: {
        texto:
          'A atmosfera tem faixas mais suaves que as de Júpiter, cobertas por uma névoa amarelada. No polo norte há uma corrente de jato com formato de hexágono.',
        dados: [
          percentual('Hidrogênio (H₂)', 96.3, 'nssdca-saturno', 'Por volume.'),
          percentual('Hélio (He)', 3.25, 'nssdca-saturno', 'Por volume.', 2),
          dado('Metano (CH₄)', '4.500 ppm', 'nssdca-saturno', 'Partes por milhão, por volume.', 4500e-6),
          dado('Amônia (NH₃)', '125 ppm', 'nssdca-saturno', 'Partes por milhão, por volume.', 125e-6),
        ],
      },
      curiosidades: {
        itens: [
          'É o único planeta menos denso que a água: 687 kg/m³.',
          'Os anéis principais têm mais de 60 mil km de largura, mas em geral só de 5 a 30 metros de espessura.',
          'Tem mais luas conhecidas do que qualquer outro planeta.',
          'O tênue anel E, alimentado pelos jatos de gelo de Encélado, vai até 480 mil km do centro do planeta.',
          'Um ano de Saturno dura quase 29 anos e meio terrestres.',
        ],
      },
    },
    luas: luasSaturno,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-saturno', 'nssdca-aneis-saturno', 'nasa-saturno-luas'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

// Luas — raio e GM: JPL SSD (phys_par); órbita: JPL SSD (elementos médios, plano de Laplace).

const GM_ENCELADO = 7.21037;
const RAIO_ENCELADO = 252.1;

export const encelado = {
  id: 'encelado',
  nome: 'Encélado',
  tipo: 'lua',
  pai: 'saturno',
  ordem: 1,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_ENCELADO, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 1.370218 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 238_400, periodoOrbitalDias: 1.370218, inclinacaoGraus: 0, excentricidade: 0.005 },

  aparencia: {
    corBase: '#E9EEF0',
    corAcento: '#CFF4FF',
    texturas: texturas('encelado', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Lua de gelo com oceano',
    descricao:
      'Encélado é uma pequena lua branca de Saturno, com uns 500 km de diâmetro. Do polo sul saem jatos de vapor e grãos de gelo vindos de um oceano escondido sob a crosta, e esse material alimenta o anel E.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_ENCELADO, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_ENCELADO), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_ENCELADO, RAIO_ENCELADO), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          temperatura({ c: -201 }, 'Temperatura média da superfície', 'nasa-encelado'),
          rotacao(1.370218 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(1.370218, 'jpl-sats-orbitais'),
          distanciaAte(238_400, 'Saturno', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Encélado tem um núcleo rochoso, um oceano global de água salgada e uma crosta de gelo. A crosta tem em média de 20 a 25 km de espessura, mas no polo sul pode ter só de 1 a 5 km.',
        dados: [dado('Densidade média', '1.610 kg/m³', 'jpl-sats-fisicos', undefined, 1610)],
        itens: [
          'Crosta de gelo de água muito limpo e reflexivo.',
          'Oceano global de água salgada.',
          'Núcleo rochoso poroso, onde água e rocha reagem em fontes hidrotermais.',
          '"Listras de tigre": fraturas quentes no polo sul, de onde saem os jatos.',
        ],
      },
      curiosidades: {
        itens: [
          'Os jatos do polo sul lançam vapor e gelo a cerca de 400 m/s, ou 1.440 km/h.',
          'É o corpo mais reflexivo do Sistema Solar.',
          'Grãos de sílica no anel E indicam fontes hidrotermais no fundo do oceano, onde a água passa de 90 °C.',
          'O material dos jatos forma o anel E de Saturno.',
          'Foi descoberto por William Herschel em 28 de agosto de 1789.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-encelado'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

const GM_TITA = 8978.1371;
const RAIO_TITA = 2574.76;

export const tita = {
  id: 'tita',
  nome: 'Titã',
  tipo: 'lua',
  pai: 'saturno',
  ordem: 2,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_TITA, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 15.945448 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 1_221_900, periodoOrbitalDias: 15.945448, inclinacaoGraus: 0.3, excentricidade: 0.029 },

  aparencia: {
    corBase: '#C88A3E',
    corAcento: '#FF9534',
    texturas: texturas('tita', 'mapa'),
    atmosfera: { cor: '#E89A3C', intensidade: 0.9 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Lua com atmosfera densa',
    descricao:
      'Titã é a maior lua de Saturno e a única lua com atmosfera densa, envolta numa névoa alaranjada. Na superfície gelada há rios, lagos e mares, mas de metano e etano líquidos, não de água.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_TITA, 'jpl-sats-fisicos'),
          massa(massaDeGM(GM_TITA), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_TITA, RAIO_TITA), 'jpl-sats-fisicos', 'Calculada a partir de GM e do raio médio.'),
          temperatura({ c: -179 }, 'Temperatura média da superfície', 'nasa-tita'),
          rotacao(15.945448 * 24, 'jpl-sats-orbitais', { sincrona: true }),
          periodoOrbital(15.945448, 'jpl-sats-orbitais'),
          distanciaAte(1_221_900, 'Saturno', 'jpl-sats-orbitais'),
        ],
      },
      composicao: {
        texto:
          'Titã é feita de gelo de água e rocha. Dados da sonda Huygens sugerem um oceano de água a uns 55–80 km abaixo da superfície gelada.',
        dados: [dado('Densidade média', '1.881 kg/m³', 'jpl-sats-fisicos', undefined, 1881)],
        itens: [
          'Crosta de gelo de água, dura como rocha a −179 °C.',
          'Lagos e mares de metano e etano, sobretudo perto dos polos.',
          'Dunas de grãos orgânicos na região do equador.',
          'Provável oceano interno de água.',
        ],
      },
      atmosfera: {
        texto:
          'A atmosfera de Titã é mais densa que a da Terra e quase toda de nitrogênio. O metano forma nuvens e chuva, e reações provocadas pela luz do Sol criam a névoa laranja de compostos orgânicos.',
        dados: [
          dado('Pressão na superfície', `≈ 1,6 × Terra`, 'nasa-tita', 'Cerca de 60 % maior que a pressão ao nível do mar na Terra, como estar a 15 m de profundidade no mar.'),
          percentual('Nitrogênio (N₂)', 95, 'nasa-tita', 'Aproximado, por volume.', 0),
          percentual('Metano (CH₄)', 5, 'nasa-tita', 'Aproximado, por volume.', 0),
        ],
      },
      curiosidades: {
        itens: [
          'É a única lua do Sistema Solar com uma atmosfera densa.',
          'É maior que o planeta Mercúrio.',
          'Em Titã chove metano, que forma rios, lagos e mares na superfície.',
          'A sonda Huygens pousou em Titã em 2005: o pouso mais distante da Terra já realizado.',
          'Foi descoberta por Christiaan Huygens em 25 de março de 1655.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nasa-tita'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
