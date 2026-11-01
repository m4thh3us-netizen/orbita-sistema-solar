import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaAte, distanciaDoSol, faixaTemperatura, gravidade, inclinacaoAxial,
  luas, luasConhecidas, massa, percentual, periodoOrbital, pressaoSuperficial, rotacao, temperatura, texturas,
} from './construtores.ts';

const luasTerra = luas(1, 'nssdca-planetas');

export const terra = {
  id: 'terra',
  nome: 'Terra',
  tipo: 'planeta',
  pai: 'sol',
  ordem: 3,
  exploravel3D: true,

  fisico: { raioMedioKm: 6371.0, inclinacaoAxialGraus: 23.44, periodoRotacaoHoras: 23.9345 },
  orbita: { semiEixoMaiorKm: 149.598e6, periodoOrbitalDias: 365.256, inclinacaoGraus: 0, excentricidade: 0.0167 },

  aparencia: {
    corBase: '#2E5A8C',
    corAcento: '#4DA6FF',
    texturas: texturas('terra', 'mapa', 'noite', 'nuvens', 'especular', 'normal'),
    atmosfera: { cor: '#6FB6FF', intensidade: 0.6 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Planeta rochoso',
    descricao:
      'A Terra é o terceiro planeta a partir do Sol e o único lugar conhecido com vida. Água líquida, uma atmosfera rica em nitrogênio e oxigênio e um campo magnético protetor fazem dela um mundo raro.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(12_756, 'nssdca-planetas', 'No equador.'),
          massa(5.9722e24, 'nssdca-terra'),
          gravidade(9.8, 'nssdca-planetas', 'No equador, incluindo o efeito da rotação. É a referência das comparações.'),
          temperatura({ k: 288 }, 'Temperatura média global da superfície', 'nssdca-terra'),
          rotacao(23.9345, 'nssdca-terra', { nota: 'Dia sideral: uma volta completa em relação às estrelas (23 h 56 min). O dia solar tem 24 horas.' }),
          periodoOrbital(365.256, 'nssdca-terra'),
          distanciaDoSol(149.598e6, 'nssdca-terra'),
          inclinacaoAxial(23.44, 'nssdca-terra', 'É essa inclinação que causa as estações do ano.'),
          aneis(false, 'A Terra não tem anéis.', 'nssdca-planetas'),
          luasConhecidas(luasTerra),
        ],
      },
      composicao: {
        texto:
          'A Terra é um planeta rochoso em camadas. O movimento do metal líquido no núcleo externo gera o campo magnético que desvia boa parte do vento solar.',
        dados: [dado('Densidade média', '5.514 kg/m³', 'nssdca-planetas', 'A maior entre os planetas.', 5514)],
        itens: [
          'Núcleo interno sólido de ferro e níquel.',
          'Núcleo externo líquido, que gera o campo magnético.',
          'Manto de rocha quente que flui muito devagar.',
          'Crosta fina, dividida em placas tectônicas, coberta em grande parte por oceanos.',
        ],
      },
      atmosfera: {
        texto:
          'O ar seco é formado sobretudo por nitrogênio e oxigênio. Gases em pequena quantidade, como o gás carbônico e o vapor de água, mantêm o planeta aquecido pelo efeito estufa.',
        dados: [
          pressaoSuperficial(1.014, 'nssdca-terra', 'Pressão média ao nível do mar (1.014 mbar).'),
          percentual('Nitrogênio (N₂)', 78.08, 'nssdca-terra', 'Por volume, no ar seco.', 2),
          percentual('Oxigênio (O₂)', 20.95, 'nssdca-terra', 'Por volume, no ar seco.', 2),
          percentual('Argônio (Ar)', 0.934, 'nssdca-terra', 'Por volume, no ar seco (9.340 ppm).', 3),
          dado('Dióxido de carbono (CO₂)', '420 ppm', 'nssdca-terra', 'Partes por milhão, por volume (0,042 %).', 420e-6),
          dado('Vapor de água', `≈ 1 %`, 'nssdca-terra', 'Muito variável de lugar para lugar.'),
        ],
      },
      curiosidades: {
        itens: [
          'É o planeta mais denso do Sistema Solar: 5.514 kg/m³.',
          'A Terra fica mais perto do Sol no começo de janeiro (147,1 milhões de km) do que em julho (152,1 milhões de km). As estações vêm da inclinação do eixo, não da distância.',
          'Uma volta completa em relação às estrelas leva 23 h 56 min, e não 24 h.',
          'O gás carbônico é só 0,042 % do ar seco, mas tem papel decisivo no clima.',
          'É o único lugar conhecido com água líquida estável na superfície.',
        ],
      },
    },
    luas: luasTerra,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-terra'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;

export const lua = {
  id: 'lua',
  nome: 'Lua',
  tipo: 'lua',
  pai: 'terra',
  ordem: 1,
  exploravel3D: true,

  fisico: { raioMedioKm: 1737.4, inclinacaoAxialGraus: 6.68, periodoRotacaoHoras: 655.72, rotacaoSincrona: true },
  // Inclinação em relação à eclíptica (5,145°); em relação ao equador da Terra varia de 18,28° a 28,58°.
  orbita: { semiEixoMaiorKm: 384_400, periodoOrbitalDias: 27.3217, inclinacaoGraus: 5.145, excentricidade: 0.0549 },

  aparencia: {
    corBase: '#9E9A93',
    corAcento: '#CDD3DD',
    texturas: texturas('lua', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Satélite natural rochoso',
    descricao:
      'A Lua é o único satélite natural da Terra e o quinto maior do Sistema Solar. Ela gira em sincronia com a própria órbita, por isso sempre vemos a mesma face, marcada por mares escuros de lava antiga e crateras.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(3475, 'nssdca-planetas'),
          massa(0.07346e24, 'nssdca-lua'),
          gravidade(1.62, 'nssdca-lua'),
          faixaTemperatura({ k: 95 }, { k: 390 }, 'Variação entre a noite e o dia na linha do equador', 'nssdca-lua'),
          rotacao(655.72, 'nssdca-lua', { sincrona: true }),
          periodoOrbital(27.3217, 'nssdca-lua', { nota: 'Período sideral. De uma Lua cheia à seguinte passam 29,53 dias (período sinódico).' }),
          distanciaAte(384_400, 'a Terra', 'nssdca-lua', 'Varia de cerca de 363.300 km (perigeu) a 405.500 km (apogeu).'),
          inclinacaoAxial(6.68, 'nssdca-lua'),
        ],
      },
      composicao: {
        texto:
          'A Lua tem uma crosta clara de rochas ricas em cálcio e alumínio, um manto rochoso e um núcleo metálico pequeno. As manchas escuras, chamadas mares, são planícies de lava basáltica solidificada há bilhões de anos.',
        dados: [dado('Densidade média', '3.344 kg/m³', 'nssdca-lua', undefined, 3344)],
        itens: [
          'Crosta de anortosito, a rocha clara das terras altas.',
          'Mares de basalto, a rocha escura das antigas erupções.',
          'Regolito: uma camada de poeira e fragmentos criada por impactos.',
          'Núcleo metálico pequeno.',
        ],
      },
      curiosidades: {
        itens: [
          'A Lua leva o mesmo tempo para girar em torno de si e para dar uma volta na Terra; por isso, vemos sempre a mesma face.',
          'De uma Lua cheia à seguinte passam 29,53 dias, mais que os 27,32 dias da volta completa, porque a Terra também se move em torno do Sol.',
          'Toda a "atmosfera" da Lua tem só cerca de 25 toneladas de gás.',
          'No equador, a superfície vai de −178 °C à noite a 117 °C de dia.',
          'Doze astronautas caminharam na Lua, nas missões Apollo, entre 1969 e 1972.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-lua', 'jpl-sats-fisicos'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
