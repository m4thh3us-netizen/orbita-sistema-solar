import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import {
  aneis, dado, diametro, distanciaDoSol, faixaTemperatura, gravidade, inclinacaoAxial, luas,
  luasConhecidas, massa, periodoOrbital, rotacao, temperatura, texturas,
} from './construtores.ts';

const luasMercurio = luas(
  0,
  'nssdca-planetas',
  'Mercúrio não tem luas. Pela explicação mais aceita, ele está perto demais do Sol: a gravidade solar domina a vizinhança do planeta e uma lua distante seria arrancada, enquanto uma lua muito próxima seria freada pelas marés até cair.',
);

export const mercurio = {
  id: 'mercurio',
  nome: 'Mercúrio',
  tipo: 'planeta',
  pai: 'sol',
  ordem: 1,
  exploravel3D: true,

  fisico: { raioMedioKm: 2439.7, inclinacaoAxialGraus: 0.034, periodoRotacaoHoras: 1407.6 },
  orbita: { semiEixoMaiorKm: 57.909e6, periodoOrbitalDias: 87.969, inclinacaoGraus: 7.004, excentricidade: 0.2056 },

  aparencia: {
    corBase: '#8C8681',
    corAcento: '#B9AFC9',
    texturas: texturas('mercurio', 'mapa'),
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Planeta rochoso',
    descricao:
      'Mercúrio é o menor planeta e o mais próximo do Sol. Sem atmosfera para segurar o calor, tem uma superfície cheia de crateras, que esquenta muito de dia e esfria muito à noite.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(4879, 'nssdca-planetas'),
          massa(0.3301e24, 'nssdca-mercurio'),
          gravidade(3.7, 'nssdca-planetas', 'No equador, incluindo o efeito da rotação.'),
          temperatura({ k: 440 }, 'Temperatura média da superfície', 'nssdca-mercurio'),
          faixaTemperatura({ k: 590 }, { k: 725 }, 'Faixa no hemisfério voltado para o Sol', 'nssdca-mercurio', 'Temperatura no lado diurno'),
          rotacao(1407.6, 'nssdca-mercurio'),
          dado('Dia solar', '175,9 dias', 'nssdca-planetas', 'Tempo entre dois nasceres do Sol vistos da superfície (4.222,6 horas).', 4222.6 * 3600),
          periodoOrbital(87.969, 'nssdca-mercurio'),
          distanciaDoSol(57.909e6, 'nssdca-mercurio'),
          inclinacaoAxial(0.034, 'nssdca-mercurio'),
          aneis(false, 'Mercúrio não tem anéis.', 'nssdca-planetas'),
          luasConhecidas(luasMercurio),
        ],
      },
      composicao: {
        texto:
          'Mercúrio é um planeta rochoso com um núcleo metálico enorme em proporção ao seu tamanho. É o segundo planeta mais denso, atrás apenas da Terra.',
        dados: [dado('Densidade média', '5.429 kg/m³', 'nssdca-planetas', undefined, 5429)],
        itens: [
          'Núcleo de ferro grande, que ocupa boa parte do interior.',
          'Manto e crosta de rochas silicáticas.',
          'Superfície antiga, coberta de crateras de impacto, parecida com a da Lua.',
          'Campo magnético global fraco, gerado pelo núcleo.',
        ],
      },
      curiosidades: {
        itens: [
          'Mercúrio gira 3 vezes em torno de si mesmo a cada 2 voltas em torno do Sol.',
          'Por isso, de um nascer do Sol ao seguinte passam cerca de 176 dias terrestres: dois anos de Mercúrio.',
          'Mesmo sendo o mais próximo do Sol, não é o planeta mais quente: Vênus, com sua atmosfera densa, tem média de 464 °C contra 167 °C de Mercúrio.',
          'Sua órbita é a mais alongada entre os planetas: a distância ao Sol varia de 46,0 a 69,8 milhões de km.',
          'Em vez de atmosfera, tem uma exosfera finíssima, com sódio, magnésio, oxigênio e outros elementos arrancados da superfície.',
        ],
      },
    },
    luas: luasMercurio,
  },

  fontes: fontesPor('nssdca-planetas', 'nssdca-mercurio'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
