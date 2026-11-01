import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaAte, distanciaDoSol, faixaTemperatura, gravidade, gravidadeDeGM,
  inclinacaoAxial, luas, luasConhecidas, massa, massaDeGM, percentual, periodoOrbital,
  pressaoSuperficial, rotacao, temperatura, texturas,
} from './construtores.ts';

const luasMarte = luas(2, 'nasa-luas');

export const marte = {
  id: 'marte',
  nome: 'Marte',
  tipo: 'planeta',
  pai: 'sol',
  ordem: 4,
  exploravel3D: true,

  fisico: { raioMedioKm: 3389.5, inclinacaoAxialGraus: 25.19, periodoRotacaoHoras: 24.6229 },
  orbita: { semiEixoMaiorKm: 227.956e6, periodoOrbitalDias: 686.98, inclinacaoGraus: 1.848, excentricidade: 0.0935 },

  aparencia: {
    corBase: '#B5643B',
    corAcento: '#FF6B4D',
    texturas: texturas('marte', 'mapa'),
    atmosfera: { cor: '#E8956B', intensidade: 0.25 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Planeta rochoso',
    descricao:
      'Marte é um planeta frio e desértico, coberto por uma poeira rica em óxido de ferro que lhe dá a cor avermelhada. Tem calotas polares, vulcões gigantes e sinais claros de que já teve água líquida na superfície.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(6792, 'nssdca-planetas'),
          massa(0.64169e24, 'nssdca-marte'),
          gravidade(3.73, 'nssdca-marte'),
          temperatura({ k: 214 }, 'Temperatura média da superfície', 'nssdca-marte'),
          faixaTemperatura({ k: 184 }, { k: 242 }, 'Variação ao longo do dia no local de pouso da sonda Viking 1', 'nssdca-marte', 'Variação diária'),
          rotacao(24.6229, 'nssdca-marte'),
          periodoOrbital(686.98, 'nssdca-marte'),
          distanciaDoSol(227.956e6, 'nssdca-marte'),
          inclinacaoAxial(25.19, 'nssdca-marte', 'Parecida com a da Terra: por isso Marte também tem estações.'),
          aneis(false, 'Marte não tem anéis.', 'nssdca-planetas'),
          luasConhecidas(luasMarte),
        ],
      },
      composicao: {
        texto:
          'Marte é rochoso, com núcleo de ferro, manto e crosta. A superfície guarda vulcões enormes, cânions profundos e antigos leitos de rios secos.',
        dados: [dado('Densidade média', '3.934 kg/m³', 'nssdca-planetas', undefined, 3934)],
        itens: [
          'Poeira e rochas ricas em óxido de ferro, que dão a cor avermelhada.',
          'Calotas polares de gelo de água e de gelo de gás carbônico.',
          'Olympus Mons, o maior vulcão conhecido do Sistema Solar.',
          'Valles Marineris, um sistema de cânions que cortaria boa parte dos Estados Unidos.',
        ],
      },
      atmosfera: {
        texto:
          'A atmosfera é muito rarefeita e quase toda de gás carbônico. Mesmo assim, tem ventos, nuvens e tempestades de poeira que às vezes cobrem o planeta inteiro.',
        dados: [
          pressaoSuperficial(6.36e-3, 'nssdca-marte', 'No raio médio; varia de 4,0 a 8,7 mbar com as estações. Menos de 1 % da pressão na Terra.'),
          percentual('Dióxido de carbono (CO₂)', 95.1, 'nssdca-marte', 'Por volume.'),
          percentual('Nitrogênio (N₂)', 2.59, 'nssdca-marte', 'Por volume.', 2),
          percentual('Argônio (Ar)', 1.94, 'nssdca-marte', 'Por volume.', 2),
          percentual('Oxigênio (O₂)', 0.16, 'nssdca-marte', 'Por volume.', 2),
          percentual('Monóxido de carbono (CO)', 0.06, 'nssdca-marte', 'Por volume.', 2),
        ],
      },
      curiosidades: {
        itens: [
          'Um dia em Marte dura cerca de 24 h 40 min, bem parecido com o nosso.',
          'O ano marciano tem 687 dias, então cada estação dura quase o dobro das da Terra.',
          'A gravidade é cerca de 38 % da terrestre: uma balança que marca 70 kg na Terra marcaria uns 27 kg em Marte.',
          'A pressão do ar é menor que 1 % da pressão ao nível do mar na Terra.',
          'Suas luas, Fobos e Deimos, são pequenas e irregulares; podem ser asteroides capturados ou restos de um grande impacto, e a questão ainda está aberta.',
        ],
      },
    },
    luas: luasMarte,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-marte', 'nasa-luas'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

// Fobos — raio e GM: JPL SSD; órbita: NSSDCA (Mars Fact Sheet).
const GM_FOBOS = 0.0007087;
const RAIO_FOBOS = 11.08;

export const fobos = {
  id: 'fobos',
  nome: 'Fobos',
  tipo: 'lua',
  pai: 'marte',
  ordem: 1,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_FOBOS, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 0.31891 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 9378, periodoOrbitalDias: 0.31891, inclinacaoGraus: 1.08, excentricidade: 0.0151 },

  aparencia: {
    corBase: '#5E5650',
    corAcento: '#C7876C',
    texturas: texturas('fobos', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Lua irregular de Marte',
    descricao:
      'Fobos é a maior e a mais próxima das duas luas de Marte: um bloco escuro e cheio de crateras, com uns 22 km de diâmetro. Ele orbita tão perto que dá mais de três voltas em Marte por dia marciano, e as marés o puxam lentamente para baixo.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_FOBOS, 'jpl-sats-fisicos', 'Diâmetro médio. Fobos é irregular: raios de 13,0 × 11,4 × 9,1 km.'),
          massa(massaDeGM(GM_FOBOS), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_FOBOS, RAIO_FOBOS), 'jpl-sats-fisicos', 'Valor médio; varia muito pela forma irregular.'),
          faixaTemperatura({ c: -112 }, { c: -4 }, 'Medidas da Mars Global Surveyor em 1998: lado na sombra e lado iluminado', 'mgs-fobos-1998', 'Temperatura da superfície'),
          rotacao(0.31891 * 24, 'nssdca-marte', { sincrona: true }),
          periodoOrbital(0.31891, 'nssdca-marte'),
          distanciaAte(9378, 'Marte', 'nssdca-marte', 'Do centro de Marte: cerca de 6.000 km acima da superfície.'),
        ],
      },
      composicao: {
        texto:
          'Fobos é pequeno, escuro e poroso: a densidade é de só 1,87 g/cm³, bem menos que a das rochas comuns. Isso sugere uma mistura de rocha com vazios internos ou gelo.',
        dados: [dado('Densidade média', '1.872 kg/m³', 'jpl-sats-fisicos', undefined, 1872)],
        itens: [
          'Superfície coberta por regolito: poeira fina com pelo menos um metro de espessura.',
          'Stickney, uma cratera enorme em relação ao tamanho da lua.',
          'Sulcos paralelos que atravessam boa parte da superfície.',
        ],
      },
      curiosidades: {
        itens: [
          'Fobos dá uma volta em Marte em 7 h 39 min, mais rápido do que Marte gira. Visto de lá, ele nasce no oeste e se põe no leste.',
          'Orbita a cerca de 6.000 km da superfície: nenhuma outra lua conhecida passa tão perto da superfície do seu planeta.',
          'As marés de Marte puxam Fobos para dentro; em dezenas de milhões de anos ele deve se despedaçar ou cair no planeta.',
          'Num ponto à sombra, a superfície estava a −112 °C; a poucos quilômetros, ao sol, a −4 °C.',
          'Seu nome significa "medo" em grego; Deimos significa "pavor".',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nssdca-marte', 'mgs-fobos-1998'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

// Deimos — raio e GM: JPL SSD; órbita: NSSDCA (Mars Fact Sheet).
const GM_DEIMOS = 0.0000962;
const RAIO_DEIMOS = 6.2;

export const deimos = {
  id: 'deimos',
  nome: 'Deimos',
  tipo: 'lua',
  pai: 'marte',
  ordem: 2,
  exploravel3D: true,

  fisico: { raioMedioKm: RAIO_DEIMOS, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 1.26244 * 24, rotacaoSincrona: true },
  orbita: { semiEixoMaiorKm: 23_459, periodoOrbitalDias: 1.26244, inclinacaoGraus: 1.79, excentricidade: 0.0005 },

  aparencia: {
    corBase: '#8A7D70',
    corAcento: '#E8C8B4',
    texturas: texturas('deimos', 'mapa'),
    representacaoArtistica: true,
  },

  conteudo: {
    classificacao: 'Lua irregular de Marte',
    descricao:
      'Deimos é a menor e a mais distante das duas luas de Marte, com cerca de 12 km de diâmetro. Uma camada espessa de poeira suaviza suas crateras e deixa a superfície mais lisa que a de Fobos.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(2 * RAIO_DEIMOS, 'jpl-sats-fisicos', 'Diâmetro médio. Deimos é irregular: raios de 7,8 × 6,0 × 5,1 km.'),
          massa(massaDeGM(GM_DEIMOS), 'jpl-sats-fisicos', 'Calculada a partir do parâmetro gravitacional (GM) medido.'),
          gravidade(gravidadeDeGM(GM_DEIMOS, RAIO_DEIMOS), 'jpl-sats-fisicos', 'Valor médio; varia pela forma irregular.'),
          rotacao(1.26244 * 24, 'nssdca-marte', { sincrona: true }),
          periodoOrbital(1.26244, 'nssdca-marte'),
          distanciaAte(23_459, 'Marte', 'nssdca-marte'),
        ],
      },
      composicao: {
        texto:
          'Como Fobos, Deimos é escuro e pouco denso (1,47 g/cm³), provavelmente rocha porosa. O regolito espesso preenche as crateras e dá à superfície um aspecto liso.',
        dados: [dado('Densidade média', '1.471 kg/m³', 'jpl-sats-fisicos', undefined, 1471)],
        itens: [
          'Regolito espesso que suaviza o relevo.',
          'Poucas crateras grandes visíveis.',
        ],
      },
      curiosidades: {
        itens: [
          'Deimos leva cerca de 30 h 18 min para dar uma volta em Marte, pouco mais que um dia marciano; por isso cruza o céu muito devagar.',
          'O nome significa "pavor" em grego. Deimos e Fobos eram filhos de Ares, o deus da guerra, que os romanos chamavam de Marte.',
          'As duas luas de Marte foram descobertas em agosto de 1877 pelo astrônomo Asaph Hall.',
          'Com massa de cerca de 1,4 × 10¹⁵ kg, Deimos é uns sete vezes mais leve que Fobos.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('jpl-sats-fisicos', 'jpl-sats-orbitais', 'nssdca-marte'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
