import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaDoSol, gravidade, inclinacaoAxial, luas, luasConhecidas,
  massa, percentual, periodoOrbital, pressaoSuperficial, rotacao, temperatura, texturas,
} from './construtores.ts';

const luasVenus = luas(
  0,
  'nssdca-planetas',
  'Vênus não tem luas, e ainda não há consenso sobre o motivo. Uma hipótese: como Vênus gira devagar e ao contrário, as marés teriam freado uma lua antiga até ela espiralar e colidir com o planeta.',
);

export const venus = {
  id: 'venus',
  nome: 'Vênus',
  tipo: 'planeta',
  pai: 'sol',
  ordem: 2,
  exploravel3D: true,

  fisico: { raioMedioKm: 6051.8, inclinacaoAxialGraus: 177.36, periodoRotacaoHoras: -5832.6 },
  orbita: { semiEixoMaiorKm: 108.21e6, periodoOrbitalDias: 224.701, inclinacaoGraus: 3.395, excentricidade: 0.0068 },

  aparencia: {
    corBase: '#E3CFA0',
    corAcento: '#FFE7A3',
    texturas: texturas('venus', 'mapa'),
    atmosfera: { cor: '#F3E2B0', intensidade: 0.85 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Planeta rochoso',
    descricao:
      'Vênus tem quase o tamanho da Terra, mas é um mundo infernal: uma atmosfera espessa de gás carbônico prende o calor e deixa a superfície a 464 °C. Ele também gira ao contrário e muito devagar.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(12_104, 'nssdca-planetas'),
          massa(4.8673e24, 'nssdca-venus'),
          gravidade(8.9, 'nssdca-planetas', 'No equador, incluindo o efeito da rotação.'),
          temperatura({ k: 737 }, 'Temperatura média da superfície', 'nssdca-venus'),
          rotacao(-5832.6, 'nssdca-venus'),
          dado('Dia solar', '116,8 dias', 'nssdca-planetas', 'Tempo entre dois nasceres do Sol vistos da superfície (2.802 horas).', 2802 * 3600),
          periodoOrbital(224.701, 'nssdca-venus'),
          distanciaDoSol(108.21e6, 'nssdca-venus'),
          inclinacaoAxial(177.36, 'nssdca-venus', 'Acima de 90°: o eixo está praticamente de cabeça para baixo, por isso a rotação é retrógrada.'),
          aneis(false, 'Vênus não tem anéis.', 'nssdca-planetas'),
          luasConhecidas(luasVenus),
        ],
      },
      composicao: {
        texto:
          'Por dentro, Vênus deve ser parecido com a Terra: núcleo de ferro, manto e crosta de rocha. A superfície, escondida pelas nuvens, foi mapeada por radar e é dominada por planícies vulcânicas.',
        dados: [dado('Densidade média', '5.243 kg/m³', 'nssdca-planetas', undefined, 5243)],
        itens: [
          'Núcleo de ferro e níquel.',
          'Manto de rocha silicática.',
          'Crosta com vastas planícies de lava e grandes vulcões.',
          'Sem campo magnético global.',
        ],
      },
      atmosfera: {
        texto:
          'A atmosfera é quase toda de gás carbônico, com camadas de nuvens ricas em compostos de enxofre. O efeito estufa extremo faz de Vênus o planeta mais quente do Sistema Solar.',
        dados: [
          pressaoSuperficial(92, 'nssdca-venus', '92 vezes a pressão ao nível do mar na Terra.'),
          percentual('Dióxido de carbono (CO₂)', 96.5, 'nssdca-venus', 'Por volume, perto da superfície.'),
          percentual('Nitrogênio (N₂)', 3.5, 'nssdca-venus', 'Por volume.'),
          dado('Dióxido de enxofre (SO₂)', '150 ppm', 'nssdca-venus', 'Partes por milhão, por volume.', 150e-6),
          dado('Densidade do ar na superfície', '≈ 65 kg/m³', 'nssdca-venus', 'Cerca de 50 vezes a do ar ao nível do mar na Terra.', 65),
        ],
      },
      curiosidades: {
        itens: [
          'Um giro de Vênus em torno de si mesmo (243 dias) dura mais que uma volta em torno do Sol (224,7 dias).',
          'Como gira ao contrário, em Vênus o Sol nasce no oeste e se põe no leste.',
          'É o planeta mais quente, mesmo estando quase duas vezes mais longe do Sol que Mercúrio.',
          'Sua órbita é a mais circular entre os planetas: excentricidade de apenas 0,007.',
          'A pressão na superfície equivale à que sentiríamos a quase 1 km de profundidade no mar.',
        ],
      },
    },
    luas: luasVenus,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-venus'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
