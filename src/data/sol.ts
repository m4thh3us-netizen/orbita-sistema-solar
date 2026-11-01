import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import { dado, diametro, gravidade, massa, percentual, texturas, temperatura } from './construtores.ts';
import { ESPACO } from './formatar.ts';

export const sol = {
  id: 'sol',
  nome: 'Sol',
  tipo: 'estrela',
  pai: null,
  ordem: 0,
  exploravel3D: true,

  fisico: {
    raioMedioKm: 695_700,
    inclinacaoAxialGraus: 7.25,
    periodoRotacaoHoras: 609.12,
  },
  orbita: null,

  aparencia: {
    corBase: '#FFDF9E',
    corAcento: '#FFB938',
    texturas: texturas('sol', 'mapa'),
    atmosfera: { cor: '#FFB347', intensidade: 0.8 },
    representacaoArtistica: false,
  },

  conteudo: {
    classificacao: 'Estrela anã amarela (G2V)',
    descricao:
      'O Sol é a estrela no centro do Sistema Solar: uma esfera de plasma quente que se formou há cerca de 4,6 bilhões de anos. No núcleo, a fusão de hidrogênio em hélio produz a luz e o calor que mantêm a vida na Terra.',
    secoes: {
      'visao-geral': {
        dados: [
          dado('Tipo espectral', 'G2V', 'nssdca-sol', 'G2: estrela amarela de cerca de 5.800 K; V: anã da sequência principal, ainda fundindo hidrogênio no núcleo.'),
          dado('Idade', `≈${ESPACO}4,6 bilhões de anos`, 'nasa-sol'),
          diametro(1_391_400, 'nssdca-sol', 'Duas vezes o raio volumétrico médio de 695.700 km.'),
          massa(1.9884e30, 'nssdca-sol'),
          gravidade(274.0, 'nssdca-sol', 'No equador da fotosfera.'),
          dado('Luminosidade', `3,83${ESPACO}×${ESPACO}10²⁶${ESPACO}W`, 'nssdca-sol', 'Energia total emitida por segundo (382,8 × 10²⁴ J/s).', 3.828e26),
          temperatura({ k: 5772 }, 'Temperatura efetiva da fotosfera, a superfície visível', 'nssdca-sol', 'Temperatura da fotosfera'),
          dado('Temperatura no núcleo', `≈${ESPACO}15,7 milhões de °C`, 'nssdca-sol', 'Valor de modelo para o centro do Sol (1,571 × 10⁷ K).', 1.571e7),
          dado('Rotação', `≈${ESPACO}25 dias no equador · ≈${ESPACO}36 dias nos polos`, 'nasa-sol', 'Rotação diferencial: o Sol não é sólido e o equador gira mais rápido que os polos. Período sideral adotado (a 16° de latitude): 25,38 dias.'),
          dado('Distância média da Terra', `1,00${ESPACO}UA (149,6 milhões de km)`, 'nssdca-sol', undefined, 1.496e11),
        ],
      },
      composicao: {
        texto:
          'O Sol é feito quase só de hidrogênio e hélio. A energia nasce no núcleo, pela fusão próton-próton: quatro núcleos de hidrogênio viram um de hélio, e a pequena diferença de massa se transforma em energia.',
        dados: [
          percentual('Hidrogênio (em massa)', 70.7, 'nssdca-sol', 'Calculado a partir da composição da fotosfera em número de átomos: 90,965 % H e 8,889 % He.'),
          percentual('Hélio (em massa)', 27.4, 'nssdca-sol', 'Calculado a partir da composição da fotosfera em número de átomos.'),
          percentual('Elementos mais pesados (em massa)', 1.9, 'nssdca-sol', 'Principalmente oxigênio, carbono, neônio, ferro e nitrogênio.'),
          dado('Produção de energia', 'Fusão próton-próton no núcleo', 'nssdca-sol', 'O Sol converte cerca de 4,26 milhões de toneladas de massa em energia por segundo.'),
        ],
        itens: [
          'Núcleo: a região mais quente, onde ocorre a fusão nuclear.',
          'Zona radiativa: a energia viaja para fora como radiação, absorvida e reemitida muitas vezes.',
          'Zona convectiva: o plasma sobe e desce como água fervendo, levando o calor até a superfície.',
          'Fotosfera: a "superfície" visível, com cerca de 500 km de espessura.',
        ],
      },
      atmosfera: {
        texto:
          'Acima da fotosfera ficam a cromosfera e a coroa. Por um motivo ainda debatido, a temperatura volta a subir com a altura: a coroa é centenas de vezes mais quente que a superfície visível.',
        dados: [
          dado('Espessura da fotosfera', `≈${ESPACO}500${ESPACO}km`, 'nssdca-sol', undefined, 5e5),
          dado('Cromosfera', `≈${ESPACO}2.500${ESPACO}km de espessura`, 'nssdca-sol', 'Camada avermelhada visível em eclipses totais; o topo chega a cerca de 30.000 K.', 2.5e6),
          dado('Coroa', `até ≈${ESPACO}2 milhões de °C`, 'nasa-sol', 'A camada mais externa, de onde parte o vento solar.'),
        ],
      },
      curiosidades: {
        itens: [
          'Cabem cerca de 1,3 milhão de Terras dentro do Sol, em volume.',
          'A massa do Sol equivale a cerca de 333 mil Terras.',
          'A luz do Sol leva cerca de 8 minutos e 19 segundos para chegar até nós.',
          'A coroa, a cerca de 2 milhões de °C, é umas 360 vezes mais quente que a fotosfera.',
          'Perto do equador o Sol dá uma volta em cerca de 25 dias; perto dos polos, em cerca de 36.',
        ],
      },
    },
    luas: null,
  },

  fontes: fontesPor('nssdca-sol', 'nasa-sol'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
